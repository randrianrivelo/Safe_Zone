import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useThemeStore } from '../../stores/themeStore'
import Navbar from '../../components/layout/Navbar'
import './AgentPeople.css'

export default function AgentPeople() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { theme } = useThemeStore()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [people, setPeople] = useState([])
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    children: 0,
    elderly: 0,
    injured: 0,
    families: 0,
    alone: 0,
    men: 0,
    women: 0
  })
  const fr = (localStorage.getItem('lang') || 'fr') === 'fr'

  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: 'M',
    family_id: '',
    is_injured: false,
    injury_type: '',
    needs: '',
    phone: '',
    entry_date: new Date().toISOString().split('T')[0]
  })

  // Récupérer le token proprement
  const getToken = () => {
    let token = localStorage.getItem('token')
    if (token && token.startsWith('"') && token.endsWith('"')) {
      token = token.slice(1, -1)
    }
    return token
  }

  async function loadData() {
    setLoading(true)
    try {
      const token = getToken()
      if (!token) {
        console.warn('Pas de token')
        setLoading(false)
        return
      }

      const res = await fetch('http://localhost:8000/api/agent/people', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (res.ok) {
        const peopleData = await res.json()
        const present = peopleData.filter(p => p.status === 'present')
        setPeople(present)
        calculateStats(present)
      } else if (res.status === 401) {
        console.error('Non autorisé, veuillez vous reconnecter')
        // Optionnel: rediriger vers login
      } else {
        console.error('Erreur API:', res.status)
        setPeople([])
        calculateStats([])
      }
    } catch (err) {
      console.error('Erreur chargement:', err)
      setPeople([])
      calculateStats([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('data-accent', localStorage.getItem('sz_accent') || 'purple')
    loadData()
  }, [theme])

  const calculateStats = (peopleData) => {
    const children = peopleData.filter(p => p.age < 18).length
    const elderly = peopleData.filter(p => p.age >= 60).length
    const injured = peopleData.filter(p => p.is_injured).length
    const families = new Set(peopleData.filter(p => p.family_id).map(p => p.family_id)).size
    const alone = peopleData.filter(p => !p.family_id).length
    const men = peopleData.filter(p => p.gender === 'M').length
    const women = peopleData.filter(p => p.gender === 'F').length

    setStats({
      total: peopleData.length,
      children,
      elderly,
      injured,
      families,
      alone,
      men,
      women
    })
  }

  const handleAddPerson = async () => {
    if (!form.name || !form.age) {
      alert(fr ? 'Veuillez remplir le nom et l\'âge' : 'Fenoy ny anarana sy ny taona')
      return
    }

    setSaving(true)

    const newPerson = {
      name: form.name,
      age: parseInt(form.age),
      gender: form.gender,
      family_id: form.family_id ? parseInt(form.family_id) : null,
      phone: form.phone,
      id_card: '',
      is_injured: form.is_injured,
      injury_type: form.is_injured ? form.injury_type : null,
      needs: form.needs,
      notes: '',
      entry_time: form.entry_date
    }

    try {
      const token = getToken()
      if (!token) throw new Error('Pas de token')

      const res = await fetch('http://localhost:8000/api/agent/people', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newPerson)
      })

      if (res.ok) {
        await loadData()
        setSuccessMsg(fr ? 'Personne ajoutée avec succès !' : 'Olona nampiana soa aman-tsara !')
        setTimeout(() => setSuccessMsg(''), 3000)

        setForm({
          name: '',
          age: '',
          gender: 'M',
          family_id: '',
          is_injured: false,
          injury_type: '',
          needs: '',
          phone: '',
          entry_date: new Date().toISOString().split('T')[0]
        })
        setShowAddForm(false)
      } else {
        const error = await res.text()
        console.error('Erreur API:', error)
        alert(fr ? 'Erreur lors de l\'enregistrement' : 'Olana tamin\'ny fitehirizana')
      }
    } catch (err) {
      console.error('Erreur:', err)
      alert(fr ? 'Erreur de connexion au serveur' : 'Olana tamin\'ny fifandraisana')
    } finally {
      setSaving(false)
    }
  }

  const handleDeparture = async (person) => {
    if (!window.confirm(fr ? `Enregistrer le départ de ${person.name} ?` : `Hanamarika ny fivoahan'i ${person.name} ?`)) return

    try {
      const token = getToken()
      if (!token) throw new Error('Pas de token')

      const res = await fetch(`http://localhost:8000/api/agent/people/${person.id}/depart`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (res.ok) {
        await loadData()
        setSuccessMsg(fr ? `Départ de ${person.name} enregistré` : `Nivoaka i ${person.name}`)
        setTimeout(() => setSuccessMsg(''), 3000)
      } else {
        console.error('Erreur API départ')
      }
    } catch (err) {
      console.error('Erreur départ:', err)
    }
  }

  const filteredPeople = people.filter(p => {
    const matchSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.family_name && p.family_name.toLowerCase().includes(search.toLowerCase()))

    if (activeTab === 'children') return matchSearch && p.age < 18
    if (activeTab === 'elderly') return matchSearch && p.age >= 60
    if (activeTab === 'injured') return matchSearch && p.is_injured
    if (activeTab === 'alone') return matchSearch && !p.family_id
    return matchSearch
  })

  const statCards = [
    { icon: 'bi-people-fill', val: stats.total, label: fr ? 'Personnes' : 'Olona', color: '#a855f7' },
    { icon: 'bi-child', val: stats.children, label: fr ? 'Enfants' : 'Ankizy', color: '#38bdf8' },
    { icon: 'bi-person-walking', val: stats.elderly, label: fr ? 'Personnes âgées' : 'Loholona', color: '#ff9500' },
    { icon: 'bi-heart-pulse-fill', val: stats.injured, label: fr ? 'Blessés' : 'Maratra', color: '#ff3b30' },
    { icon: 'bi-house-heart', val: stats.families, label: fr ? 'Familles' : 'Fianakaviana', color: '#39ff88' },
    { icon: 'bi-person-standing', val: stats.alone, label: fr ? 'Isolés' : 'Iray irery', color: '#ffd60a' }
  ]

  const tabs = [
    { key: 'all', icon: 'bi-people-fill', label: fr ? 'Tous' : 'Rehetra' },
    { key: 'children', icon: 'bi-child', label: fr ? 'Enfants' : 'Ankizy' },
    { key: 'elderly', icon: 'bi-person-walking', label: fr ? 'Âgés' : 'Loholona' },
    { key: 'injured', icon: 'bi-heart-pulse-fill', label: fr ? 'Blessés' : 'Maratra' },
    { key: 'alone', icon: 'bi-person-standing', label: fr ? 'Isolés' : 'Iray irery' }
  ]

  return (
    <div className="agent-people">
      <Navbar />
      <main className="agent-people__main">

        <div className="agent-people__header">
          <div>
            <h1><i className="bi bi-people" /> {fr ? 'Gestion des personnes' : 'Fitantanana olona'}</h1>
            <p>{fr ? 'Liste des personnes hébergées dans votre refuge' : 'Lisitry ny olona ao amin\'ny toerana fiarovana anao'}</p>
          </div>
          <button className="agent-people__add-btn" onClick={() => setShowAddForm(!showAddForm)}>
            <i className={`bi bi-${showAddForm ? 'x' : 'person-plus'}`} />
            {showAddForm ? (fr ? 'Annuler' : 'Ajanony') : (fr ? 'Ajouter' : 'Hanampy')}
          </button>
        </div>

        {successMsg && (
          <div className="agent-people__success">
            <i className="bi bi-check-circle-fill" />
            <span>{successMsg}</span>
          </div>
        )}

        {showAddForm && (
          <div className="agent-people__form">
            <h3><i className="bi bi-person-plus" /> {fr ? 'Ajouter une personne' : 'Hanampy olona'}</h3>
            <div className="agent-people__form-grid">
              <div className="agent-people__form-field">
                <label>{fr ? 'Nom complet' : 'Anarana feno'} *</label>
                <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Jean Rakoto" />
              </div>
              <div className="agent-people__form-field">
                <label>{fr ? 'Âge' : 'Taona'} *</label>
                <input type="number" value={form.age} onChange={(e) => setForm({...form, age: e.target.value})} placeholder="25" />
              </div>
              <div className="agent-people__form-field">
                <label>{fr ? 'Genre' : 'Lahy/vavy'}</label>
                <select value={form.gender} onChange={(e) => setForm({...form, gender: e.target.value})}>
                  <option value="M">{fr ? 'Homme' : 'Lahy'}</option>
                  <option value="F">{fr ? 'Femme' : 'Vavy'}</option>
                </select>
              </div>
              <div className="agent-people__form-field">
                <label>{fr ? 'ID Famille (optionnel)' : 'ID Fianakaviana (tsy voatery)'}</label>
                <input type="number" value={form.family_id} onChange={(e) => setForm({...form, family_id: e.target.value})} placeholder="1" />
              </div>
              <div className="agent-people__form-field">
                <label>{fr ? 'Téléphone' : 'Finday'}</label>
                <input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} placeholder="+261 34 00 000 00" />
              </div>
              <div className="agent-people__form-field">
                <label>{fr ? "Date d'entrée" : 'Daty fidirana'}</label>
                <input type="date" value={form.entry_date} onChange={(e) => setForm({...form, entry_date: e.target.value})} />
              </div>
              <div className="agent-people__form-field">
                <label className="agent-people__checkbox">
                  <input type="checkbox" checked={form.is_injured} onChange={(e) => setForm({...form, is_injured: e.target.checked})} />
                  {fr ? 'Blessé(e)' : 'Maratra'}
                </label>
              </div>
              {form.is_injured && (
                <>
                  <div className="agent-people__form-field">
                    <label>{fr ? 'Type de blessure' : 'Karazana ratra'}</label>
                    <input value={form.injury_type} onChange={(e) => setForm({...form, injury_type: e.target.value})} placeholder={fr ? 'Fracture, plaie...' : 'Vaky taolana, ratra...'} />
                  </div>
                  <div className="agent-people__form-field">
                    <label>{fr ? 'Besoins spécifiques' : 'Ilaina manokana'}</label>
                    <input value={form.needs} onChange={(e) => setForm({...form, needs: e.target.value})} placeholder={fr ? 'Médicaments, soins...' : 'Fanafody, fitsaboana...'} />
                  </div>
                </>
              )}
            </div>
            <button className="agent-people__submit-btn" onClick={handleAddPerson} disabled={saving || !form.name || !form.age}>
              {saving ? <><div className="spinner-sm" /> {fr ? 'Enregistrement...' : 'Mitahiry...'}</> : <><i className="bi bi-check-lg" /> {fr ? 'Enregistrer' : 'Tahirizo'}</>}
            </button>
          </div>
        )}

        <div className="agent-people__stats">
          {statCards.map((s, i) => (
            <div key={i} className="agent-people__stat-card">
              <div className="agent-people__stat-icon" style={{ background: `${s.color}15`, borderColor: `${s.color}30` }}>
                <i className={s.icon} style={{ color: s.color }} />
              </div>
              <div className="agent-people__stat-info">
                <span className="agent-people__stat-val" style={{ color: s.color }}>{s.val}</span>
                <span className="agent-people__stat-label">{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="agent-people__controls">
          <div className="agent-people__tabs">
            {tabs.map((t) => (
              <button key={t.key} className={`agent-people__tab ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>
                <i className={t.icon} /> {t.label}
              </button>
            ))}
          </div>
          <div className="agent-people__search">
            <i className="bi bi-search" />
            <input type="text" placeholder={fr ? 'Rechercher par nom...' : 'Mitady anarana...'} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div className="agent-people__loading"><div className="spinner-lg" /></div>
        ) : filteredPeople.length === 0 ? (
          <div className="agent-people__empty">
            <i className="bi bi-people" />
            <span>{fr ? 'Aucune personne trouvée' : 'Tsy misy olona hita'}</span>
          </div>
        ) : (
          <div className="agent-people__list">
            <table className="agent-people__table">
              <thead>
                <tr>
                  <th>{fr ? 'Nom' : 'Anarana'}</th>
                  <th>{fr ? 'Âge' : 'Taona'}</th>
                  <th>{fr ? 'Genre' : 'Lahy/vavy'}</th>
                  <th>{fr ? 'Famille' : 'Fianakaviana'}</th>
                  <th>{fr ? 'Statut' : 'Sata'}</th>
                  <th>{fr ? 'Téléphone' : 'Finday'}</th>
                  <th>{fr ? 'Actions' : 'Hetsika'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredPeople.map((p, i) => (
                  <tr key={i}>
                    <td><strong>{p.name}</strong>{p.needs && <span className="agent-people__need-badge">{p.needs}</span>}</td>
                    <td>{p.age}</td>
                    <td>{p.gender === 'M' ? (fr ? 'H' : 'L') : (fr ? 'F' : 'V')}</td>
                    <td>{p.family_name || (fr ? 'Seul' : 'Iray')}</td>
                    <td>
                      {p.is_injured ? (
                        <span className="agent-people__status-badge agent-people__status-badge--injured">
                          <i className="bi bi-heart-pulse" /> {fr ? 'Blessé' : 'Maratra'}
                        </span>
                      ) : (
                        <span className="agent-people__status-badge agent-people__status-badge--present">
                          <i className="bi bi-check-circle" /> {fr ? 'Présent' : 'Misy'}
                        </span>
                      )}
                    </td>
                    <td>{p.phone || '—'}</td>
                    <td>
                      <button className="agent-people__action-btn" onClick={() => setSelectedPerson(p)} title={fr ? 'Détails' : 'Antsipirihany'}>
                        <i className="bi bi-eye" />
                      </button>
                      <button className="agent-people__action-btn agent-people__action-btn--depart" onClick={() => handleDeparture(p)} title={fr ? 'Départ' : 'Fivoahana'}>
                        <i className="bi bi-box-arrow-right" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {selectedPerson && (
        <div className="agent-people__modal" onClick={() => setSelectedPerson(null)}>
          <div className="agent-people__modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="agent-people__modal-header">
              <h3><i className="bi bi-person-circle" /> {selectedPerson.name}</h3>
              <button className="agent-people__modal-close" onClick={() => setSelectedPerson(null)}>
                <i className="bi bi-x-lg" />
              </button>
            </div>
            <div className="agent-people__modal-body">
              <div className="agent-people__modal-field">
                <span className="agent-people__modal-label">{fr ? 'Âge' : 'Taona'}</span>
                <span>{selectedPerson.age} {fr ? 'ans' : 'taona'}</span>
              </div>
              <div className="agent-people__modal-field">
                <span className="agent-people__modal-label">{fr ? 'Genre' : 'Lahy/vavy'}</span>
                <span>{selectedPerson.gender === 'M' ? (fr ? 'Homme' : 'Lahy') : (fr ? 'Femme' : 'Vavy')}</span>
              </div>
              {selectedPerson.family_name && (
                <div className="agent-people__modal-field">
                  <span className="agent-people__modal-label">{fr ? 'Famille' : 'Fianakaviana'}</span>
                  <span>{selectedPerson.family_name}</span>
                </div>
              )}
              {selectedPerson.phone && (
                <div className="agent-people__modal-field">
                  <span className="agent-people__modal-label">{fr ? 'Téléphone' : 'Finday'}</span>
                  <span>{selectedPerson.phone}</span>
                </div>
              )}
              {selectedPerson.is_injured && (
                <>
                  <div className="agent-people__modal-field">
                    <span className="agent-people__modal-label">{fr ? 'Blessure' : 'Ratra'}</span>
                    <span style={{ color: '#ff3b30' }}>{selectedPerson.injury_type}</span>
                  </div>
                  <div className="agent-people__modal-field">
                    <span className="agent-people__modal-label">{fr ? 'Besoins' : 'Ilaina'}</span>
                    <span style={{ color: '#ff9500' }}>{selectedPerson.needs}</span>
                  </div>
                </>
              )}
              <div className="agent-people__modal-field">
                <span className="agent-people__modal-label">{fr ? "Date d'entrée" : 'Daty fidirana'}</span>
                <span>{new Date(selectedPerson.entry_date).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
            <div className="agent-people__modal-actions">
              <button className="agent-people__modal-btn" onClick={() => setSelectedPerson(null)}>
                {fr ? 'Fermer' : 'Hidy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}