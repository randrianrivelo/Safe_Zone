import { useState, useEffect } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { useThemeStore } from '../../stores/themeStore'
import Navbar from '../../components/layout/Navbar'
import QRScanner from '../../components/ui/QRScanner'
import './AgentRegister.css'

export default function AgentRegister() {
  const { user } = useAuthStore()
  const { theme } = useThemeStore()
  const [activeTab, setActiveTab] = useState('register')
  const [search, setSearch] = useState('')
  const [entries, setEntries] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [qrCode, setQrCode] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    todayEntries: 0,
    todayExits: 0,
    current: 0
  })
  const [saving, setSaving] = useState(false)
  const fr = (localStorage.getItem('lang') || 'fr') === 'fr'

  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: 'M',
    family_id: '',
    phone: '',
    id_card: '',
    entry_time: new Date().toISOString().slice(0, 16),
    notes: ''
  })

  // Récupérer le token proprement
  const getToken = () => {
    let token = localStorage.getItem('token')
    if (token && token.startsWith('"') && token.endsWith('"')) {
      token = token.slice(1, -1)
    }
    return token
  }

  async function loadEntries() {
    try {
      const token = getToken()
      if (!token) return

      const res = await fetch('http://localhost:8000/api/agent/people', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (res.ok) {
        const entriesData = await res.json()
        setEntries(entriesData)

        const present = entriesData.filter(e => e.status === 'present').length
        const today = new Date().toDateString()
        const todayEntries = entriesData.filter(e => {
          const entryDate = new Date(e.entry_time || e.entry_date).toDateString()
          return entryDate === today && e.status === 'present'
        }).length
        const todayExits = entriesData.filter(e => {
          return e.exit_time && new Date(e.exit_time).toDateString() === today
        }).length

        setStats({
          total: entriesData.length,
          todayEntries,
          todayExits,
          current: present
        })
      }
    } catch (err) {
      console.error('Erreur chargement:', err)
    }
  }

  function generateQRCode() {
    const shelterData = {
      shelter_id: 1,
      shelter_name: 'Stade Mahamasina',
      agent_name: user?.name,
      timestamp: new Date().toISOString()
    }
    setQrCode(JSON.stringify(shelterData))
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('data-accent', localStorage.getItem('sz_accent') || 'purple')
    loadEntries()
    generateQRCode()
  }, [theme])

  const handleScanSuccess = (decodedText) => {
    try {
      const data = JSON.parse(decodedText)
      alert(fr ? `QR code scanné ! Refuge: ${data.shelter_name}` : `QR code nosy ! Toerana: ${data.shelter_name}`)
      setShowScanner(false)
      setShowAddForm(true)
    } catch {
      alert(fr ? 'QR code invalide' : 'QR code tsy mety')
    }
  }

  const handleAddEntry = async () => {
    if (!form.name || !form.age) {
      alert(fr ? 'Veuillez remplir le nom et l\'âge' : 'Fenoy ny anarana sy ny taona')
      return
    }

    setSaving(true)

    const newEntry = {
      name: form.name,
      age: parseInt(form.age),
      gender: form.gender,
      family_id: form.family_id || null,
      phone: form.phone,
      id_card: form.id_card,
      is_injured: false,
      needs: form.notes,
      notes: form.notes,
      entry_time: form.entry_time
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
        body: JSON.stringify(newEntry)
      })

      if (res.ok) {
        await loadEntries()
        setShowAddForm(false)
        setForm({
          name: '',
          age: '',
          gender: 'M',
          family_id: '',
          phone: '',
          id_card: '',
          entry_time: new Date().toISOString().slice(0, 16),
          notes: ''
        })
        alert(fr ? 'Personne enregistrée avec succès !' : 'Olona voasoratra soa aman-tsara !')
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

  const handleExit = async (entry) => {
    if (!window.confirm(fr ? `Enregistrer la sortie de ${entry.name} ?` : `Hanamarika ny fivoahan'i ${entry.name} ?`)) return

    try {
      const token = getToken()
      if (!token) throw new Error('Pas de token')

      const res = await fetch(`http://localhost:8000/api/agent/people/${entry.id}/depart`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (res.ok) {
        await loadEntries()
        alert(fr ? `Sortie de ${entry.name} enregistrée` : `Nivoaka i ${entry.name}`)
      } else {
        console.error('Erreur API départ')
      }
    } catch (err) {
      console.error('Erreur départ:', err)
    }
  }

  const filteredEntries = entries.filter(e => {
    const matchSearch = !search ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      (e.id_card && e.id_card.includes(search))
    return matchSearch
  })

  const presentEntries = filteredEntries.filter(e => e.status === 'present')
  const departedEntries = filteredEntries.filter(e => e.status === 'departed')

  return (
    <div className="agent-register">
      <Navbar />
      <main className="agent-register__main">

        <div className="agent-register__header">
          <div>
            <h1><i className="bi bi-qr-code-scan" /> {fr ? 'Registre des interventions' : 'Rejisitry ny fidirana'}</h1>
            <p>{fr ? 'Gestion des entrées et sorties des sinistrés' : 'Fitantanana ny fidirana sy fivoahan\'ny olona voa'}</p>
          </div>
          <button className="agent-register__add-btn" onClick={() => setShowAddForm(!showAddForm)}>
            <i className={`bi bi-${showAddForm ? 'x' : 'person-plus'}`} />
            {showAddForm ? (fr ? 'Annuler' : 'Ajanony') : (fr ? 'Ajouter manuellement' : 'Hanampy tanana')}
          </button>
        </div>

        <div className="agent-register__stats">
          <div className="agent-register__stat-card">
            <i className="bi bi-people-fill" style={{ color: '#a855f7' }} />
            <div>
              <span className="agent-register__stat-val">{stats.current}</span>
              <span className="agent-register__stat-label">{fr ? 'Présents' : 'Misy'}</span>
            </div>
          </div>
          <div className="agent-register__stat-card">
            <i className="bi bi-arrow-right-circle-fill" style={{ color: '#39ff88' }} />
            <div>
              <span className="agent-register__stat-val">{stats.todayEntries}</span>
              <span className="agent-register__stat-label">{fr ? 'Entrées aujourd\'hui' : 'Niditra anio'}</span>
            </div>
          </div>
          <div className="agent-register__stat-card">
            <i className="bi bi-arrow-left-circle-fill" style={{ color: '#ff9500' }} />
            <div>
              <span className="agent-register__stat-val">{stats.todayExits}</span>
              <span className="agent-register__stat-label">{fr ? 'Sorties aujourd\'hui' : 'Nivoaka anio'}</span>
            </div>
          </div>
          <div className="agent-register__stat-card">
            <i className="bi bi-building" style={{ color: '#38bdf8' }} />
            <div>
              <span className="agent-register__stat-val">{stats.total}</span>
              <span className="agent-register__stat-label">{fr ? 'Total enregistrés' : 'Nosoratana rehetra'}</span>
            </div>
          </div>
        </div>

        <div className="agent-register__qr-section">
          <div className="agent-register__qr-card">
            <h3><i className="bi bi-qr-code" /> {fr ? 'QR Code du refuge' : 'Kaody QR an\'ny toerana'}</h3>
            <div className="agent-register__qr-code">
              <div className="agent-register__qr-placeholder">
                <i className="bi bi-qr-code-scan" />
                <p>{fr ? 'Code généré' : 'Kaody noforonina'}</p>
                <code style={{ fontSize: '0.7rem', wordBreak: 'break-all' }}>{qrCode}</code>
              </div>
            </div>
            <button className="agent-register__qr-btn" onClick={() => navigator.clipboard.writeText(qrCode || '')}>
              <i className="bi bi-copy" /> {fr ? 'Copier le code' : 'Adikao ny kaody'}
            </button>
          </div>

          <div className="agent-register__scan-card">
            <h3><i className="bi bi-camera" /> {fr ? 'Scanner un QR code' : 'Hijery kaody QR'}</h3>
            <div className="agent-register__scan-placeholder">
              <i className="bi bi-camera-fill" />
              <p>{fr ? 'Scannez le QR code d\'un citoyen' : 'Hijery ny kaody QR'}</p>
              <button className="agent-register__scan-start" onClick={() => setShowScanner(true)}>
                <i className="bi bi-qr-code-scan" /> {fr ? 'Scanner' : 'Hijery'}
              </button>
            </div>
          </div>
        </div>

        {showScanner && (
          <QRScanner onScanSuccess={handleScanSuccess} onClose={() => setShowScanner(false)} />
        )}

        <div className="agent-register__tabs">
          <button className={`agent-register__tab ${activeTab === 'register' ? 'active' : ''}`} onClick={() => setActiveTab('register')}>
            <i className="bi bi-list-check" /> {fr ? 'Registre actif' : 'Rejisitra mavitrika'}
          </button>
          <button className={`agent-register__tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
            <i className="bi bi-clock-history" /> {fr ? 'Historique' : 'Tantara'}
          </button>
        </div>

        {showAddForm && (
          <div className="agent-register__form">
            <h3><i className="bi bi-person-plus" /> {fr ? 'Enregistrer une personne' : 'Hanampy olona'}</h3>
            <div className="agent-register__form-grid">
              <div className="agent-register__form-field">
                <label>{fr ? 'Nom complet' : 'Anarana feno'}</label>
                <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Jean Rakoto" />
              </div>
              <div className="agent-register__form-field">
                <label>{fr ? 'Âge' : 'Taona'}</label>
                <input type="number" value={form.age} onChange={(e) => setForm({...form, age: e.target.value})} placeholder="25" />
              </div>
              <div className="agent-register__form-field">
                <label>{fr ? 'Genre' : 'Lahy/vavy'}</label>
                <select value={form.gender} onChange={(e) => setForm({...form, gender: e.target.value})}>
                  <option value="M">{fr ? 'Homme' : 'Lahy'}</option>
                  <option value="F">{fr ? 'Femme' : 'Vavy'}</option>
                </select>
              </div>
              <div className="agent-register__form-field">
                <label>{fr ? 'ID Famille (optionnel)' : 'ID Fianakaviana (tsy voatery)'}</label>
                <input type="number" value={form.family_id} onChange={(e) => setForm({...form, family_id: e.target.value})} placeholder="1" />
              </div>
              <div className="agent-register__form-field">
                <label>{fr ? 'Téléphone' : 'Finday'}</label>
                <input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} placeholder="+261 34 00 000 00" />
              </div>
              <div className="agent-register__form-field">
                <label>{fr ? 'CIN / ID' : 'CIN / ID'}</label>
                <input value={form.id_card} onChange={(e) => setForm({...form, id_card: e.target.value})} placeholder="10123456789" />
              </div>
              <div className="agent-register__form-field">
                <label>{fr ? "Date et heure d'entrée" : 'Daty sy ora fidirana'}</label>
                <input type="datetime-local" value={form.entry_time} onChange={(e) => setForm({...form, entry_time: e.target.value})} />
              </div>
              <div className="agent-register__form-field admin-page__form-field--full">
                <label>{fr ? 'Notes (blessures, besoins spéciaux)' : 'Fanamarihana (ratra, ilaina manokana)'}</label>
                <textarea rows={2} value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} placeholder={fr ? 'Ex: Blessé à la jambe, besoin de médicaments' : 'Ohatra: Maratra tongotra, mila fanafody'} />
              </div>
            </div>
            <button className="agent-register__submit-btn" onClick={handleAddEntry} disabled={saving}>
              {saving ? <><div className="spinner-sm" /> {fr ? 'Enregistrement...' : 'Mitahiry...'}</> : <><i className="bi bi-check-lg" /> {fr ? 'Enregistrer' : 'Tahirizo'}</>}
            </button>
          </div>
        )}

        <div className="agent-register__search">
          <i className="bi bi-search" />
          <input type="text" placeholder={fr ? 'Rechercher par nom ou CIN...' : 'Mitady anarana na CIN...'} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="agent-register__list">
          <table className="agent-register__table">
            <thead>
              <tr>
                <th>{fr ? 'Nom' : 'Anarana'}</th>
                <th>{fr ? 'Âge' : 'Taona'}</th>
                <th>{fr ? 'CIN' : 'CIN'}</th>
                <th>{fr ? 'Téléphone' : 'Finday'}</th>
                <th>{fr ? "Date d'entrée" : 'Daty fidirana'}</th>
                <th>{fr ? 'Statut' : 'Sata'}</th>
                <th>{fr ? 'Actions' : 'Hetsika'}</th>
              </tr>
            </thead>
            <tbody>
              {(activeTab === 'register' ? presentEntries : departedEntries).map((e, i) => (
                <tr key={i}>
                  <td>
                    <strong>{e.name}</strong>
                    {e.family_id && <span className="agent-register__family-badge">Famille {e.family_id}</span>}
                    {e.notes && <span className="agent-register__notes-badge">{e.notes}</span>}
                  </td>
                  <td>{e.age}</td>
                  <td>{e.id_card || '—'}</td>
                  <td>{e.phone || '—'}</td>
                  <td>{new Date(e.entry_time || e.entry_date).toLocaleString('fr-FR')}</td>
                  <td>
                    <span className={`agent-register__status-badge agent-register__status-badge--${e.status}`}>
                      {e.status === 'present' ? (fr ? 'Présent' : 'Misy') : (fr ? 'Sorti' : 'Nivoaka')}
                    </span>
                  </td>
                  <td>
                    <button className="agent-register__action-btn" onClick={() => setSelectedEntry(e)} title={fr ? 'Détails' : 'Antsipirihany'}>
                      <i className="bi bi-eye" />
                    </button>
                    {e.status === 'present' && (
                      <button className="agent-register__action-btn agent-register__action-btn--exit" onClick={() => handleExit(e)} title={fr ? 'Enregistrer sortie' : 'Hanamarika fivoahana'}>
                        <i className="bi bi-box-arrow-right" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {selectedEntry && (
        <div className="agent-register__modal" onClick={() => setSelectedEntry(null)}>
          <div className="agent-register__modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="agent-register__modal-header">
              <h3><i className="bi bi-person-circle" /> {selectedEntry.name}</h3>
              <button className="agent-register__modal-close" onClick={() => setSelectedEntry(null)}>
                <i className="bi bi-x-lg" />
              </button>
            </div>
            <div className="agent-register__modal-body">
              <div className="agent-register__modal-field">
                <span className="agent-register__modal-label">{fr ? 'Âge' : 'Taona'}</span>
                <span>{selectedEntry.age} ans</span>
              </div>
              <div className="agent-register__modal-field">
                <span className="agent-register__modal-label">{fr ? 'Genre' : 'Lahy/vavy'}</span>
                <span>{selectedEntry.gender === 'M' ? (fr ? 'Homme' : 'Lahy') : (fr ? 'Femme' : 'Vavy')}</span>
              </div>
              {selectedEntry.family_id && (
                <div className="agent-register__modal-field">
                  <span className="agent-register__modal-label">{fr ? 'Famille' : 'Fianakaviana'}</span>
                  <span>ID {selectedEntry.family_id}</span>
                </div>
              )}
              <div className="agent-register__modal-field">
                <span className="agent-register__modal-label">CIN</span>
                <span>{selectedEntry.id_card || '—'}</span>
              </div>
              <div className="agent-register__modal-field">
                <span className="agent-register__modal-label">{fr ? 'Téléphone' : 'Finday'}</span>
                <span>{selectedEntry.phone || '—'}</span>
              </div>
              <div className="agent-register__modal-field">
                <span className="agent-register__modal-label">{fr ? "Date d'entrée" : 'Daty fidirana'}</span>
                <span>{new Date(selectedEntry.entry_time || selectedEntry.entry_date).toLocaleString('fr-FR')}</span>
              </div>
              {selectedEntry.exit_time && (
                <div className="agent-register__modal-field">
                  <span className="agent-register__modal-label">{fr ? 'Date de sortie' : 'Daty fivoahana'}</span>
                  <span>{new Date(selectedEntry.exit_time).toLocaleString('fr-FR')}</span>
                </div>
              )}
              {selectedEntry.notes && (
                <div className="agent-register__modal-field">
                  <span className="agent-register__modal-label">{fr ? 'Notes' : 'Fanamarihana'}</span>
                  <span style={{ color: '#ff9500' }}>{selectedEntry.notes}</span>
                </div>
              )}
            </div>
            <div className="agent-register__modal-actions">
              <button className="agent-register__modal-btn" onClick={() => setSelectedEntry(null)}>
                {fr ? 'Fermer' : 'Hidy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}