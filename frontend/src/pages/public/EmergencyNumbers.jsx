import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useThemeStore } from '../../stores/themeStore'
import Navbar from '../../components/layout/Navbar'
import './EmergencyNumbers.css'

export default function EmergencyNumbers() {
  const navigate = useNavigate()
  const { theme } = useThemeStore()
  const fr = (localStorage.getItem('lang') || 'fr') === 'fr'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('data-accent', localStorage.getItem('sz_accent') || 'purple')
  }, [theme])

  const emergencyContacts = [
    {
      org: 'BNGRC',
      fullName: 'Bureau National de Gestion des Risques et Catastrophes',
      num: '123',
      icon: 'bi-shield-shaded',
      desc: fr ? 'Catastrophes naturelles' : 'Loza voajanahary',
      color: '#ff3b30',
      available: '24h/24, 7j/7'
    },
    {
      org: fr ? 'Pompiers' : 'Mpamono afo',
      fullName: fr ? 'Service d\'incendie et de secours' : 'Sampan-draharaha mpamono afo',
      num: '118',
      icon: 'bi-fire',
      desc: fr ? 'Incendies et secours d\'urgence' : 'Afo sy vonjy taitra',
      color: '#ff9500',
      available: '24h/24, 7j/7'
    },
    {
      org: 'SAMU',
      fullName: fr ? 'Service d\'Aide Médicale Urgente' : 'Fanampiana ara-pahasalamana maika',
      num: '124',
      icon: 'bi-heart-pulse',
      desc: fr ? 'Urgences médicales' : 'Fitsaboana maika',
      color: '#ff3b30',
      available: '24h/24, 7j/7'
    },
    {
      org: 'Police',
      fullName: fr ? 'Police Nationale' : 'Polisy Nasionaly',
      num: '117',
      icon: 'bi-shield-lock',
      desc: fr ? 'Sécurité publique' : 'Filaminam-bahoaka',
      color: '#38bdf8',
      available: '24h/24, 7j/7'
    },
    {
      org: fr ? 'Croix-Rouge Malagasy' : 'Mena Mialà Malagasy',
      fullName: fr ? 'Croix-Rouge de Madagascar' : 'Mena Mialà eto Madagasikara',
      num: '034 05 000 00',
      icon: 'bi-hospital',
      desc: fr ? 'Aide humanitaire' : 'Fanampiana ho an\'ny olona',
      color: '#39ff88',
      available: '24h/24, 7j/7'
    },
    {
      org: fr ? 'Centre Anti-Poison' : 'Foano Fanafody Mamo',
      fullName: fr ? 'Centre Antipoison d\'Antananarivo' : 'Foano Fanafody Mamo Antananarivo',
      num: '033 08 000 00',
      icon: 'bi-bandaid',
      desc: fr ? 'Urgences toxiques' : 'Fitsaboana fanafody mamo',
      color: '#a855f7',
      available: '24h/24, 7j/7'
    },
    {
      org: fr ? 'Gendarmerie Nationale' : 'Zandarimaria Nasionaly',
      fullName: fr ? 'Gendarmerie Nationale' : 'Zandarimaria Nasionaly',
      num: '119',
      icon: 'bi-shield',
      desc: fr ? 'Sécurité rurale' : 'Fiarovana ambanivohitra',
      color: '#38bdf8',
      available: '24h/24, 7j/7'
    },
    {
      org: fr ? 'Numéro d\'urgence européen' : 'Laharan\'ny maika eropeana',
      fullName: fr ? 'Numéro d\'urgence international' : 'Laharan\'ny maika iraisam-pirenena',
      num: '112',
      icon: 'bi-globe',
      desc: fr ? 'Numéro universel' : 'Laharan-jato eran-tany',
      color: '#a855f7',
      available: '24h/24, 7j/7'
    }
  ]

  return (
    <div className="emergency-numbers">
      <Navbar />
      <main className="emergency-numbers__main">
        <h1 className="emergency-numbers__title">
          <i className="bi bi-telephone-fill" />
          {fr ? 'Numéros d\'urgence' : 'Laharan\'ny maika'}
        </h1>
        <p className="emergency-numbers__subtitle">
          {fr
            ? 'Appelez ces numéros en cas d\'urgence. Restez calme et donnez votre position.'
            : 'Antsoy ireto laharana ireto raha misy vonjy taitra. Mitoera milamina ary omeo ny toerana misy anao.'}
        </p>

        <div className="emergency-numbers__grid">
          {emergencyContacts.map((contact, i) => (
            <div key={i} className="emergency-numbers__card">
              <div className="emergency-numbers__card-header">
                <div className="emergency-numbers__card-icon" style={{ background: `${contact.color}15`, borderColor: `${contact.color}30` }}>
                  <i className={contact.icon} style={{ color: contact.color }} />
                </div>
                <span className="emergency-numbers__card-org">{contact.org}</span>
              </div>
              <div className="emergency-numbers__card-num" style={{ color: contact.color }}>
                {contact.num}
              </div>
              <p className="emergency-numbers__card-desc">{contact.fullName}</p>
              <span className="emergency-numbers__card-badge" style={{ background: `${contact.color}12`, color: contact.color }}>
                <i className="bi bi-clock" /> {contact.available}
              </span>
            </div>
          ))}
        </div>

        <div className="emergency-numbers__tips">
          <h3>
            <i className="bi bi-lightbulb" />
            {fr ? 'Conseils en cas d\'appel d\'urgence' : 'Toro-hevitra rehefa miantso vonjy taitra'}
          </h3>
          <ul>
            <li><i className="bi bi-check-circle" /> {fr ? 'Restez calme et parlez clairement' : 'Mitoera milamina ary mitenena mazava tsara'}</li>
            <li><i className="bi bi-check-circle" /> {fr ? 'Donnez votre position exacte' : 'Omeo ny toerana misy anao marina'}</li>
            <li><i className="bi bi-check-circle" /> {fr ? 'Décrivez la situation brièvement' : 'Famaritana fohy ny zava-misy'}</li>
            <li><i className="bi bi-check-circle" /> {fr ? 'Ne raccrochez pas avant qu\'on vous le dise' : 'Aza mametraka ny tsipika raha tsy lazaina aminao'}</li>
            <li><i className="bi bi-check-circle" /> {fr ? 'Suivez les instructions des secours' : 'Araho ny toromarika omen\'ny mpamonjy voina'}</li>
          </ul>
        </div>

        <div className="emergency-numbers__actions">
          <button className="emergency-numbers__btn" onClick={() => navigate('/guide')}>
            <i className="bi bi-book" /> {fr ? 'Guide catastrophes' : 'Torolalana loza'}
          </button>
          <button className="emergency-numbers__btn" onClick={() => navigate('/map')}>
            <i className="bi bi-map" /> {fr ? 'Trouver un refuge' : 'Mitady toerana fiarovana'}
          </button>
        </div>
      </main>
    </div>
  )
}