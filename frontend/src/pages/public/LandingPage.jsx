import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef, useMemo } from 'react'
import { useThemeStore } from '../../stores/themeStore'
import MiniMap from '../../components/map/MiniMap'
import './LandingPage.css'

function useCountUp(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime = null
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, start])
  return count
}

const Lightning = ({ className }) => (
  <svg className={`landing__lightning ${className}`} viewBox="0 0 24 48" fill="none">
    <path d="M14 2L4 26h9l-3 20L22 22h-9L14 2z" fill="var(--accent)" opacity="0.9" />
  </svg>
)

export default function LandingPage() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useThemeStore()
  const [lang, setLang] = useState('fr')
  const [statsVisible, setStatsVisible] = useState(false)
  const statsRef = useRef(null)

  const count1 = useCountUp(97, 1800, statsVisible)
  const count2 = useCountUp(83735, 2200, statsVisible)
  const count3 = useCountUp(10, 1400, statsVisible)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true) },
      { threshold: 0.3 }
    )
    if (statsRef.current) observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [])

  // ✅ Bouton urgence - redirection directe
  const handleEmergency = () => {
    navigate('/emergency')
  }

  const fr = lang === 'fr'

  const particles = useMemo(() => Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 12}s`,
    duration: `${8 + Math.random() * 8}s`,
    size: `${1 + Math.random() * 2}px`
  })), [])

  return (
    <div className="landing">
      {/* VIDÉO DE FOND */}
      <div className="landing__video-wrap">
        <video className="landing__video" autoPlay muted loop playsInline>
          <source src="/bg-video.mp4" type="video/mp4" />
        </video>
        <div className="landing__video-overlay" />
        <div className="landing__video-glow" />
      </div>

      {/* PARTICULES + ÉCLAIRS */}
      <div className="landing__bg">
        <Lightning className="landing__lightning--1" />
        <Lightning className="landing__lightning--2" />
        <Lightning className="landing__lightning--3" />
        <div className="landing__particles">
          {particles.map(p => (
            <div key={p.id} className="landing__particle" style={{
              left: p.left, bottom: '-10px',
              width: p.size, height: p.size,
              animationDelay: p.delay, animationDuration: p.duration
            }} />
          ))}
        </div>
      </div>

      {/* NAVBAR */}
      <nav className="landing__nav">
        <div className="landing__nav-brand">
          <img src="/logo.png" alt="SafeZone" className="landing__logo" />
          <span className="landing__brand-name">
            <span className="accent">Safe</span>Zone Analamanga 2035
          </span>
        </div>
        <div className="landing__nav-actions">
          <button className="landing__lang-btn" onClick={toggleTheme}>
            <i className={`bi bi-${theme === 'dark' ? 'sun' : 'moon-stars'}`} />
          </button>
          <button className="landing__lang-btn" onClick={() => setLang(fr ? 'mg' : 'fr')}>
            {fr ? '🇲🇬 Malagasy' : '🇫🇷 Français'}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/login')}>
            <i className="bi bi-box-arrow-in-right" /> {fr ? 'Connexion' : 'Hiditra'}
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/login')}>
            <i className="bi bi-person-plus" /> {fr ? 'Inscription' : 'Misoratra'}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="landing__hero">
        <img src="/logo.png" alt="SafeZone" className="landing__hero-logo" />
        <h1 className="landing__title">
          <span className="landing__title-accent">Safe</span>Zone{' '}
          <span className="landing__title-accent">Analamanga</span> 2035
        </h1>
        <p className="landing__subtitle" style={{ marginBottom: 12 }}>
          {fr
            ? 'Guidage vers les zones sécurisées en cas de catastrophe naturelle.'
            : 'Fitarihana mankany amin\'ny toerana arovana rehefa misy loza voajanahary.'}
        </p>
        <p className="landing__subtitle" style={{ fontSize: '0.95rem', marginBottom: 48 }}>
          {fr
            ? 'Trouvez le refuge le plus proche, évitez les zones dangereuses, recevez des alertes en temps réel.'
            : 'Mahita toerana fiarovana akaiky indrindra, misoroka ny toerana mampidi-doza.'}
        </p>
        <div className="landing__cta">
          <button className="landing__btn-emergency" onClick={handleEmergency}>
            <i className="bi bi-lightning-charge-fill" /> {fr ? 'URGENCE' : 'MAIKA'}
          </button>
          <button className="landing__btn-primary" onClick={() => navigate('/login')}>
            <i className="bi bi-map" /> {fr ? 'Trouver un refuge' : 'Mitady toerana'}
          </button>
          <button className="landing__btn-outline" onClick={() => navigate('/public-map')}>
            <i className="bi bi-eye" /> {fr ? 'Voir la carte' : 'Hijery sarintany'}
          </button>
        </div>
      </section>

      {/* STATISTIQUES */}
      <section className="landing__stats" ref={statsRef}>
        <div className="landing__stat" style={{ animationDelay: '0s' }}>
          <i className="bi bi-building" />
          <span className="landing__stat-val">{count1}</span>
          <span className="landing__stat-label">{fr ? 'Refuges vérifiés' : 'Toerana fiarovana'}</span>
        </div>
        <div className="landing__stat" style={{ animationDelay: '0.1s' }}>
          <i className="bi bi-people-fill" />
          <span className="landing__stat-val">{count2.toLocaleString('fr-FR')}</span>
          <span className="landing__stat-label">{fr ? 'Places disponibles' : 'Toerana misy'}</span>
        </div>
        <div className="landing__stat" style={{ animationDelay: '0.2s' }}>
          <i className="bi bi-geo-alt-fill" />
          <span className="landing__stat-val">{count3}</span>
          <span className="landing__stat-label">{fr ? 'Districts couverts' : 'Distrika'}</span>
        </div>
        <div className="landing__stat" style={{ animationDelay: '0.3s' }}>
          <i className="bi bi-shield-check" />
          <span className="landing__stat-val">24/7</span>
          <span className="landing__stat-label">{fr ? 'Disponible' : 'Miasa'}</span>
        </div>
      </section>

      {/* MINI CARTE */}
      <section className="landing__section">
        <h2 className="landing__section-title">
          {fr ? 'Aperçu de la ' : 'Fijery ny '}
          <span>{fr ? 'carte interactive' : 'sarintany'}</span>
        </h2>
        <p className="landing__section-subtitle">
          {fr
            ? 'Visualisez les refuges et zones à risque dans la région d\'Analamanga'
            : 'Hijery ny toerana fiarovana sy ny toerana mampidi-doza ao Analamanga'}
        </p>
        <div className="landing__map-container">
          <MiniMap />
          <div className="landing__map-legend-bar">
            <span className="landing__legend-item">
              <span className="landing__legend-dot" style={{ background: '#39ff88' }} />
              {fr ? 'Refuge disponible' : 'Toerana misy'}
            </span>
            <span className="landing__legend-item">
              <span className="landing__legend-dot" style={{ background: '#ff9500' }} />
              {fr ? 'Refuge saturé' : 'Toerana feno'}
            </span>
            <span className="landing__legend-item">
              <span className="landing__legend-dot" style={{ background: '#ff3b30' }} />
              {fr ? 'Zone dangereuse' : 'Toerana mampidi-doza'}
            </span>
          </div>
          <p className="landing__map-desc">
            {fr
              ? 'La carte affiche les 97 refuges, les zones inondables et les itinéraires calculés par nos algorithmes Dijkstra et A*.'
              : 'Ny sarintany dia mampiseho ny toerana fiarovana 97, ny toerana tondra-drano ary ny lalana arovana.'}
          </p>
          <button className="landing__btn-primary" style={{ marginTop: 20 }} onClick={() => navigate('/public-map')}>
            <i className="bi bi-map" /> {fr ? 'Voir la carte complète' : 'Hijery ny sarintany feno'}
          </button>
        </div>
      </section>

      {/* FONCTIONNALITÉS */}
      <section className="landing__features">
        <h2 className="landing__section-title">
          {fr ? 'Comment ça ' : 'Ahoana ny '}
          <span>{fr ? 'marche ?' : 'fiasany ?'}</span>
        </h2>
        <div className="landing__features-grid">
          {[
            {
              icon: 'bi-crosshair',
              title: fr ? 'Localisation automatique' : 'Fitadiavana GPS',
              desc: fr
                ? 'Votre position est détectée automatiquement via GPS pour calculer l\'itinéraire optimal vers le refuge le plus sûr.'
                : 'Ny toeranao dia hita amin\'ny alalan\'ny GPS mba hanisana ny lalana tsara indrindra.'
            },
            {
              icon: 'bi-sign-turn-right',
              title: fr ? 'Itinéraire intelligent' : 'Lalana maranitra',
              desc: fr
                ? 'Les algorithmes Dijkstra et A* calculent le chemin le plus sûr en évitant les zones inondées et les routes détruites.'
                : 'Dijkstra sy A* dia manisa ny lalana arovana indrindra.'
            },
            {
              icon: 'bi-building',
              title: fr ? '97 refuges vérifiés' : 'Toerana 97',
              desc: fr
                ? 'Écoles, stades, gymnases, églises, casernes répartis dans les 10 districts d\'Analamanga.'
                : 'Sekoly, kianja ao amin\'ny distrika 10 ao Analamanga.'
            },
            {
              icon: 'bi-bell-fill',
              title: fr ? 'Alertes en temps réel' : 'Fampitandremana',
              desc: fr
                ? 'Recevez les alertes cycloniques et mises à jour des zones à risque instantanément.'
                : 'Mahazo fampitandremana momba ny toerana mampidi-doza.'
            }
          ].map((f, i) => (
            <div key={i} className="landing__feature" style={{ animationDelay: `${i * 0.12}s` }}>
              <div className="landing__feature-icon"><i className={f.icon} /></div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* NOTRE TERRITOIRE */}
      <section className="landing__section">
        <h2 className="landing__section-title">
          {fr ? 'Notre ' : 'Ny '}
          <span>{fr ? 'territoire' : 'faritaninay'}</span>
        </h2>
        <div className="landing__territory-content">
          <div className="landing__territory-text">
            <p>{fr
              ? 'L\'application couvre l\'intégralité des 10 districts de la région Analamanga :'
              : 'Ny fampiharana dia manarona ny distrika 10 rehetra ao amin\'ny faritra Analamanga :'}
            </p>
            <div className="landing__districts-list">
              {[
                'Antananarivo Renivohitra', 'Antananarivo Atsimondrano', 'Antananarivo Avaradrano',
                'Ambohidratrimo', 'Ankazobe', 'Anjozorobe', 'Manjakandriana', 'Andramasina',
                'Arivonimamo', 'Ambatolampy'
              ].map((d, i) => (
                <span key={i} className="landing__district-tag"><i className="bi bi-geo-alt" /> {d}</span>
              ))}
            </div>
            <p style={{ marginTop: 16 }}>
              {fr
                ? 'Plus de 97 refuges répartis stratégiquement pour protéger la population en cas de catastrophe naturelle.'
                : 'Mihoatra ny toerana fiarovana 97 napetraka amin\'ny fomba stratejika mba hiarovana ny mponina.'}
            </p>
          </div>
          <div className="landing__territory-img">
            <img src="/analamanga53.gif" alt="Carte des districts Analamanga" />
          </div>
        </div>
      </section>

      {/* ZONES À RISQUE */}
      <section className="landing__section">
        <h2 className="landing__section-title">
          {fr ? 'Zones à ' : 'Toerana '}
          <span>{fr ? 'risque actives' : 'mampidi-doza'}</span>
        </h2>
        <p className="landing__section-subtitle">
          {fr ? 'Restez informés des dangers potentiels' : 'Mijanona ho voampahafantatra momba ny loza'}
        </p>
        <div className="landing__danger-grid">
          {[
            { icon: 'bi-water', color: '#ff3b30', type: fr ? 'Inondation' : 'Tondra-drano', title: fr ? 'Plaine Sisaony' : 'Lemaka Sisaony', level: fr ? 'Niveau critique' : 'Ambaratonga goavana' },
            { icon: 'bi-tornado', color: '#ff9500', type: fr ? 'Cyclone' : 'Rivo-doza', title: fr ? 'Zone Anjozorobe Nord' : 'Faritra Anjozorobe Avaratra', level: fr ? 'Vigilance orange' : 'Fanaraha-maso' },
            { icon: 'bi-exclamation-triangle', color: '#ff9500', type: fr ? 'Glissement' : 'Fihotsahan-tany', title: fr ? 'RN2 — Ambohimahitsy' : 'RN2 — Ambohimahitsy', level: fr ? 'Glissement actif' : 'Fihotsahana mavitrika' },
            { icon: 'bi-water', color: '#ff9500', type: fr ? 'Inondation' : 'Tondra-drano', title: fr ? 'Berges Ikopa — Anosizato' : 'Moron\'Ikopa — Anosizato', level: fr ? 'Niveau élevé' : 'Ambaratonga avo' }
          ].map((z, i) => (
            <div key={i} className="landing__danger-card" style={{ borderLeftColor: z.color, animationDelay: `${i * 0.1}s` }}>
              <div className="landing__danger-header">
                <i className={z.icon} style={{ color: z.color }} />
                <span className="landing__danger-type">{z.type}</span>
                <span className="landing__danger-badge" style={{ background: `${z.color}18`, color: z.color, border: `1px solid ${z.color}40` }}>{z.level}</span>
              </div>
              <p className="landing__danger-title">{z.title}</p>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button className="landing__btn-outline" onClick={() => navigate('/public-map')}>
            <i className="bi bi-map" /> {fr ? 'Voir toutes les zones dangereuses' : 'Hijery ny toerana mampidi-doza rehetra'}
          </button>
        </div>
      </section>

      {/* CONSIGNES DE SÉCURITÉ */}
      <section className="landing__section">
        <h2 className="landing__section-title">
          {fr ? 'Consignes de ' : 'Toromarika momba ny '}
          <span>{fr ? 'sécurité' : 'fiarovana'}</span>
        </h2>
        <p className="landing__section-subtitle">
          {fr ? 'Que faire avant, pendant et après un cyclone ?' : 'Inona no atao aloha, mandritra ary aorian\'ny rivo-doza ?'}
        </p>
        <div className="landing__safety-grid">
          <div className="landing__safety-card">
            <div className="landing__safety-header" style={{ background: 'rgba(56,189,248,0.08)', borderColor: 'rgba(56,189,248,0.2)' }}>
              <i className="bi bi-clock-history" style={{ color: '#38bdf8' }} />
              <h3 style={{ color: '#38bdf8' }}>{fr ? 'AVANT le cyclone' : 'ALOHAN\'NY rivo-doza'}</h3>
            </div>
            <ul className="landing__safety-list">
              {(fr ? [
                'Préparer un kit d\'urgence (eau, nourriture, médicaments)',
                'Charger tous vos appareils électroniques',
                'Sécuriser les fenêtres et les portes',
                'Identifier le refuge le plus proche via SafeZone',
                'Stocker de l\'eau potable (3 jours minimum)',
                'Mettre les documents importants dans un sac étanche',
                'Écouter la radio pour les bulletins météo officiels'
              ] : [
                'Manomana kitapom-pahavonjy (rano, sakafo, fanafody)',
                'Ampenoy ny fitaovana elektronika rehetra',
                'Arovoy ny varavarankely sy ny varavarana',
                'Fantaro ny toerana fiarovana akaiky amin\'ny SafeZone',
                'Tahirizina rano fisotro (3 andro farafahakeliny)',
                'Ataovy ao anaty kitapo tsy mahazo rano ny taratasy manan-danja',
                'Henoina ny radio momba ny vaovao momba ny toetr\'andro'
              ]).map((item, i) => (
                <li key={i}><i className="bi bi-check-circle" style={{ color: '#38bdf8' }} />{item}</li>
              ))}
            </ul>
          </div>
          <div className="landing__safety-card">
            <div className="landing__safety-header" style={{ background: 'rgba(255,59,48,0.08)', borderColor: 'rgba(255,59,48,0.2)' }}>
              <i className="bi bi-exclamation-triangle-fill" style={{ color: '#ff3b30' }} />
              <h3 style={{ color: '#ff3b30' }}>{fr ? 'PENDANT le cyclone' : 'MANDRITRA ny rivo-doza'}</h3>
            </div>
            <ul className="landing__safety-list">
              {(fr ? [
                'Restez à l\'intérieur — NE SORTEZ PAS',
                'Éloignez-vous des fenêtres et murs extérieurs',
                'Réfugiez-vous dans la pièce la plus sûre',
                'Coupez l\'électricité et le gaz si nécessaire',
                'Utilisez SafeZone pour trouver un refuge si besoin',
                'N\'utilisez pas l\'ascenseur',
                'Gardez votre téléphone chargé et accessible',
                'Attendez le signal officiel de fin d\'alerte'
              ] : [
                'Mitoera ao an-trano — AZA MIVOAKA',
                'Manalavitra ny varavarankely sy ny rindrina ivelany',
                'Midira ao amin\'ny efitrano azo antoka indrindra',
                'Tapaho ny herinaratra sy ny gazy raha ilaina',
                'Ampiasao SafeZone raha mila toerana fiarovana',
                'Aza mampiasa ascenseur',
                'Tazano ny finday voacharge',
                'Andraso ny famantarana fiafaran\'ny fampitandremana'
              ]).map((item, i) => (
                <li key={i}><i className="bi bi-exclamation-circle" style={{ color: '#ff3b30' }} />{item}</li>
              ))}
            </ul>
          </div>
          <div className="landing__safety-card">
            <div className="landing__safety-header" style={{ background: 'rgba(57,255,136,0.08)', borderColor: 'rgba(57,255,136,0.2)' }}>
              <i className="bi bi-check-circle-fill" style={{ color: '#39ff88' }} />
              <h3 style={{ color: '#39ff88' }}>{fr ? 'APRÈS le cyclone' : 'AORIAN\'NY rivo-doza'}</h3>
            </div>
            <ul className="landing__safety-list">
              {(fr ? [
                'Attendez la confirmation officielle avant de sortir',
                'Vérifiez votre maison pour les dégâts structurels',
                'Ne touchez pas les fils électriques au sol',
                'Ne buvez pas l\'eau du robinet sans confirmation',
                'Signalez les dégâts via SafeZone',
                'Aidez vos voisins si possible',
                'Écoutez les instructions des autorités',
                'Photographiez les dégâts pour l\'assurance'
              ] : [
                'Andraso ny fanamafisana ofisialy alohan\'ny hivoahana',
                'Jereo ny tranonao raha misy simba',
                'Aza mikasika ny tariby herinaratra eo amin\'ny tany',
                'Aza misotro ny rano paompy raha tsy voamarina',
                'Ampahafantaro amin\'ny SafeZone ny simba',
                'Ampio ny mpiara-monina raha azo atao',
                'Henoy ny toromarik\'ny manam-pahefana',
                'Sary ny simba ho an\'ny fiantohana'
              ]).map((item, i) => (
                <li key={i}><i className="bi bi-arrow-right-circle" style={{ color: '#39ff88' }} />{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* MADAGASCAR FACE AUX CATASTROPHES */}
      <section className="landing__section">
        <div className="landing__madagascar-content">
          <div className="landing__madagascar-text">
            <h2 className="landing__section-title" style={{ textAlign: 'left' }}>
              {fr ? 'Madagascar face aux ' : 'Madagasikara sy ny '}
              <span>{fr ? 'catastrophes' : 'loza voajanahary'}</span>
            </h2>
            <p>{fr
              ? 'Chaque année, Madagascar est frappé par des cyclones, des inondations et des éboulements. La région d\'Analamanga est particulièrement vulnérable.'
              : 'Isan-taona dia iharan\'ny rivo-doza, tondra-drano ary fihotsahan-tany i Madagasikara. Ny faritra Analamanga dia tena mora tratran\'ny loza.'}
            </p>
            <p style={{ marginTop: 16 }}>
              {fr
                ? 'SafeZone Analamanga 2035 est la première solution de guidage intelligent vers les zones refuges, développée localement pour protéger les citoyens.'
                : 'SafeZone Analamanga 2035 no vahaolana voalohany amin\'ny fitarihana mankany amin\'ny toerana fiarovana, novolavolaina eto an-toerana mba hiarovana ny mponina.'}
            </p>
            <button className="landing__btn-primary" style={{ marginTop: 24 }} onClick={() => navigate('/about')}>
              <i className="bi bi-info-circle" /> {fr ? 'En savoir plus' : 'Mianara bebe kokoa'}
            </button>
          </div>
          <div className="landing__madagascar-img">
            <img src="/carte_anala.jpg" alt="Madagascar Analamanga" />
          </div>
        </div>
      </section>

      {/* NUMÉROS D'URGENCE */}
      <section className="landing__section">
        <h2 className="landing__section-title">
          {fr ? 'Numéros d\'' : 'Laharan\'ny '}
          <span>{fr ? 'urgence' : 'maika'}</span>
        </h2>
        <div className="landing__emergency-grid">
          {[
            { org: 'BNGRC', num: '123', icon: 'bi-shield-shaded', desc: fr ? 'Catastrophes naturelles' : 'Loza voajanahary' },
            { org: fr ? 'Pompiers' : 'Mpamono afo', num: '118', icon: 'bi-fire', desc: fr ? 'Incendies & secours' : 'Afo sy vonjy' },
            { org: 'SAMU', num: '124', icon: 'bi-heart-pulse', desc: fr ? 'Urgences médicales' : 'Fitsaboana maika' },
            { org: 'Police', num: '117', icon: 'bi-shield-lock', desc: fr ? 'Sécurité publique' : 'Filaminam-bahoaka' },
            { org: 'Croix-Rouge', num: '034 05 000 00', icon: 'bi-hospital', desc: fr ? 'Aide humanitaire' : 'Fanampiana' }
          ].map((e, i) => (
            <div key={i} className="landing__emergency-card">
              <div className="landing__emergency-icon"><i className={e.icon} /></div>
              <div className="landing__emergency-info">
                <span className="landing__emergency-org">{e.org}</span>
                <span className="landing__emergency-num">{e.num}</span>
                <span className="landing__emergency-desc">{e.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* LIENS RAPIDES */}
      <section className="landing__quick">
        {[
          { icon: 'bi-cloud-lightning-rain', label: fr ? 'Météo' : 'Toetr\'andro', path: '/weather' },
          { icon: 'bi-telephone-fill', label: fr ? 'Urgences' : 'Maika', path: '/emergency-numbers' },
          { icon: 'bi-book', label: fr ? 'Guide catastrophes' : 'Torolalana', path: '/guide' },
          { icon: 'bi-bar-chart', label: fr ? 'Statistiques' : 'Isa', path: '/public-stats' },
          { icon: 'bi-info-circle', label: fr ? 'À propos' : 'Mombamomba', path: '/about' },
          { icon: 'bi-question-circle', label: 'FAQ', path: '/faq' }
        ].map((q, i) => (
          <button key={i} className="landing__quick-btn" onClick={() => navigate(q.path)}>
            <i className={q.icon} /> {q.label}
          </button>
        ))}
      </section>

      {/* FOOTER */}
      <footer className="landing__footer-full">
        <div className="landing__footer-top">
          <div className="landing__footer-brand">
            <img src="/logo.png" alt="SafeZone" style={{ height: 36 }} />
            <div>
              <strong>SafeZone Analamanga 2035</strong>
              <p>{fr ? 'Votre sécurité, notre priorité.' : 'Ny fiarovana anao, laharam-pahamehanay.'}</p>
            </div>
          </div>
          <div className="landing__footer-links">
            <button onClick={() => navigate('/about')}>{fr ? 'À propos' : 'Mombamomba'}</button>
            <button onClick={() => navigate('/faq')}>FAQ</button>
            <button onClick={() => navigate('/guide')}>{fr ? 'Guide' : 'Torolalana'}</button>
            <button onClick={() => navigate('/weather')}>{fr ? 'Météo' : 'Toetr\'andro'}</button>
            <button onClick={() => navigate('/emergency-numbers')}>{fr ? 'Urgences' : 'Maika'}</button>
          </div>
        </div>
        <div className="landing__footer-bottom">
          <span>© 2025 SafeZone Analamanga 2035. {fr ? 'Tous droits réservés.' : 'Zo rehetra voatahiry.'}</span>
          <span>{fr ? 'Propulsé par' : 'Nataon\'ny'} <strong>ESMIA Innovation</strong></span>
        </div>
      </footer>
    </div>
  )
}