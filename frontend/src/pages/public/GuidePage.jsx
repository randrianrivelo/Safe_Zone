import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useThemeStore } from '../../stores/themeStore'
import Navbar from '../../components/layout/Navbar'
import './GuidePage.css'

export default function GuidePage() {
  const navigate = useNavigate()
  const { theme } = useThemeStore()
  const [activeSection, setActiveSection] = useState('cyclone')
  const fr = (localStorage.getItem('lang') || 'fr') === 'fr'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('data-accent', localStorage.getItem('sz_accent') || 'purple')
  }, [theme])

  const sections = [
    { id: 'cyclone', icon: 'bi-tornado', label: fr ? 'Cyclone' : 'Rivo-doza', color: '#ff9500' },
    { id: 'inondation', icon: 'bi-water', label: fr ? 'Inondation' : 'Tondra-drano', color: '#38bdf8' },
    { id: 'eboulement', icon: 'bi-triangle-fill', label: fr ? 'Éboulement' : 'Fihotsahan-tany', color: '#ff3b30' },
    { id: 'urgence', icon: 'bi-heart-pulse', label: fr ? 'Premiers secours' : 'Fitsaboana maika', color: '#39ff88' }
  ]

  const content = {
    cyclone: {
      title: fr ? 'Guide cyclones' : 'Torolalana rivo-doza',
      before: fr ? [
        'Préparer un kit d\'urgence (eau, nourriture, médicaments, lampe)',
        'Charger tous vos appareils électroniques',
        'Sécuriser les fenêtres et les portes',
        'Identifier le refuge le plus proche via SafeZone',
        'Stocker de l\'eau potable (3 jours minimum)',
        'Mettre les documents importants dans un sac étanche',
        'Écouter la radio pour les bulletins météo officiels',
        'Couper les branches mortes autour de la maison'
      ] : [
        'Manomana kitapom-pahavonjy (rano, sakafo, fanafody, jiro)',
        'Ampenoy ny fitaovana elektronika rehetra',
        'Arovoy ny varavarankely sy ny varavarana',
        'Fantaro ny toerana fiarovana akaiky amin\'ny SafeZone',
        'Tahirizina rano fisotro (3 andro farafahakeliny)',
        'Ataovy ao anaty kitapo tsy mahazo rano ny taratasy manan-danja',
        'Henoina ny radio momba ny vaovao momba ny toetr\'andro',
        'Tapaho ny rantsankazo maina manodidina ny trano'
      ],
      during: fr ? [
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
      ],
      after: fr ? [
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
      ]
    },
    inondation: {
      title: fr ? 'Guide inondations' : 'Torolalana tondra-drano',
      before: fr ? [
        'Surveillez les alertes météo',
        'Préparez un sac d\'évacuation',
        'Déplacez les objets de valeur en hauteur',
        'Identifiez les zones surélevées proches',
        'Connaissez les numéros d\'urgence',
        'Prévoyez des sacs de sable si nécessaire',
        'Fermez les vannes du gaz et de l\'électricité',
        'Ayez une radio à piles'
      ] : [
        'Araho ny fampitandremana momba ny toetr\'andro',
        'Manomana kitapo ho entina',
        'Ento any amin\'ny toerana avo ny zava-tsarobidy',
        'Fantaro ny toerana avo akaiky',
        'Fantaro ny laharana maika',
        'Manomana kitapo fasika raha ilaina',
        'Akavàny ny lakilen\'ny gazy sy ny herinaratra',
        'Manana radio misy pile'
      ],
      during: fr ? [
        'Montez immédiatement en hauteur',
        'Ne traversez JAMAIS une zone inondée à pied ou en voiture',
        'Coupez l\'électricité',
        'Évacuez les personnes vulnérables (enfants, personnes âgées)',
        'Écoutez les consignes des autorités',
        'Ne buvez pas l\'eau du robinet',
        'Évitez les ponts et les rivières',
        'Protégez-vous des animaux dangereux (serpents)'
      ] : [
        'Miakarà haingana any amin\'ny toerana avo',
        'Aza mihitsy no mandalo faritra tondraka na mitaingina fiara',
        'Tapaho ny herinaratra',
        'Avoahy ny olona marefo (ankizy, loholona)',
        'Henoy ny toromarika avy amin\'ny manampahefana',
        'Aza misotro ny rano paompy',
        'Alaviro ny tetezana sy ny renirano',
        'Mialà amin\'ny biby mampidi-doza (bibilava)'
      ],
      after: fr ? [
        'Ne rentrez chez vous que si les autorités le permettent',
        'Vérifiez les dégâts structurels',
        'Faites sécher votre maison pour éviter les moisissures',
        'Désinfectez tout ce qui a été en contact avec l\'eau',
        'Signalez les dégâts à votre assurance',
        'Faites appel à des professionnels pour l\'électricité',
        'Surveillez votre santé (infections)',
        'Évitez les eaux stagnantes (moustiques)'
      ] : [
        'Aza miverina an-trano raha tsy nahazo alalana avy amin\'ny manampahefana',
        'Jereo ny simba amin\'ny trano',
        'Ampandrio ny trano mba tsy ho bobongolo',
        'Diovy amin\'ny fanafody famonoana otrikaretina izay rehetra voalain\'ny rano',
        'Ampahafantaro ny fiantohana ny simba',
        'Asaivo matihanina ny raharaha herinaratra',
        'Tandremo ny fahasalamanao (otrikaretina)',
        'Alaviro ny rano mijanona (moka)'
      ]
    },
    eboulement: {
      title: fr ? 'Guide éboulements' : 'Torolalana fihotsahan-tany',
      before: fr ? [
        'Surveillez les signes : fissures, bruits anormaux',
        'Ne construisez pas en zone à risque',
        'Préparez un plan d\'évacuation',
        'Identifiez les zones sûres autour de vous',
        'Plantez des arbres pour stabiliser les sols',
        'Vérifiez les caniveaux et drains',
        'Ayez un kit d\'urgence à portée de main',
        'Restez informé des alertes météo'
      ] : [
        'Tandremo ny famantarana: vaky tany, feo tsy mahazatra',
        'Aza manangana trano any amin\'ny faritra atahorana fihotsahana',
        'Manomana drafitra famindrana toerana',
        'Fantaro ny toerana azo antoka manodidina anao',
        'Mamboly hazo mba hihazonana ny tany',
        'Jereo ny lakandrano sy ny tatatra',
        'Manana kitapom-pahavonjy eo akaiky eo',
        'Mijanona ho fantatra amin\'ny fampitandremana momba ny toetr\'andro'
      ],
      during: fr ? [
        'Évacuez immédiatement la zone',
        'Ne restez pas dans le bâtiment menacé',
        'Éloignez-vous des pentes et falaises',
        'Courez perpendiculairement à la direction de l\'éboulement',
        'Protégez-vous la tête',
        'Ne prenez pas l\'ascenseur',
        'Alertez les secours si possible',
        'Cherchez un abri solide'
      ] : [
        'Mivoaha haingana ny faritra',
        'Aza mitoera ao an-trano atahorana',
        'Manalavitra ny hantsana sy ny vatolampy',
        'Mandihazo miankavia na miankavanana fa tsy araka ny fihotsahan\'ny tany',
        'Arovy ny lohanao',
        'Aza mampiasa ascenseur',
        'Antsoy ny mpamonjy voina raha azo atao',
        'Mitadiava fialofana mafy orina'
      ],
      after: fr ? [
        'Attendez le feu vert des autorités pour revenir',
        'Surveillez les répliques possibles',
        'Vérifiez l\'état de votre maison par un expert',
        'Signalez les dégâts',
        'Ne touchez pas aux fils électriques tombés',
        'Évitez de marcher sur les débris instables',
        'Restez à l\'écart des zones évacuées',
        'Contactez votre assurance'
      ] : [
        'Andraso ny fankatoavan\'ny manampahefana alohan\'ny hiverenana',
        'Tandremo ny mety hisian\'ny fihotsahana fanampiny',
        'Ampijeroy ny manam-pahaizana ny trano raha simba',
        'Ampahafantaro ny simba',
        'Aza mikasika ny tariby herinaratra nianjera',
        'Aza mandeha eny amin\'ny fako mbola tsy miorina tsara',
        'Manalavitra ny faritra voafafa',
        'Miresaha amin\'ny fiantohanao'
      ]
    },
    urgence: {
      title: fr ? 'Premiers secours' : 'Fitsaboana maika',
      before: fr ? [
        'Ayez une trousse de secours à jour',
        'Apprenez les gestes qui sauvent',
        'Gardez les numéros d\'urgence (SAMU: 124)',
        'Identifiez les centres de santé proches',
        'Formez-vous aux gestes de premiers secours',
        'Ayez une liste de médicaments importants',
        'Préparez une fiche médicale pour chaque personne',
        'Stockez des masques et du gel hydroalcoolique'
      ] : [
        'Manana kitapom-pitsaboana misy fitaovana farany',
        'Mianara ny hetsika famonjena',
        'Tazony ny laharana maika (SAMU: 124)',
        'Fantaro ny toeram-pitsaboana akaiky',
        'Mianara ny fomba fitsaboana maika',
        'Manana lisitry ny fanafody manan-danja',
        'Manana karatra fitsaboana ho an\'ny olona tsirairay',
        'Manana saron-tava sy gel tanana'
      ],
      during: fr ? [
        'Appelez les secours (124)',
        'Ne déplacez pas la personne si elle ne risque rien',
        'Arrêtez les hémorragies en comprimant',
        'Allongez la personne en position latérale de sécurité (PLS)',
        'Ne donnez rien à boire à une personne inconsciente',
        'Protégez la personne du froid ou de la chaleur',
        'Restez calme et rassurez la personne',
        'Suivez les instructions des secours'
      ] : [
        'Antsoy ny mpamonjy voina (124)',
        'Aza mamindra ny olona raha tsy ilaina',
        'Ajanony ny rà mandriaka amin\'ny alalan\'ny fanerena',
        'Ampandriany ny olona amin\'ny toerana azo antoka (PLS)',
        'Aza manome rano na sakafo ho an\'ny olona tsy mahatsiaro tena',
        'Arovy ny olona amin\'ny hatsiaka na ny hafanana',
        'Mitoera milamina ary manome toky ny olona',
        'Araho ny toromarika omen\'ny mpamonjy voina'
      ],
      after: fr ? [
        'Surveillez l\'évolution de la personne',
        'Signalez tout changement à un médecin',
        'Prenez soin de vous aussi (stress post-traumatique)',
        'Remettez à jour votre trousse de secours',
        'Faites un bilan de santé après l\'urgence',
        'Partagez votre expérience pour aider les autres',
        'Vérifiez les vaccins (tétanos, etc.)',
        'Tenez un journal des soins prodigués'
      ] : [
        'Tandremo ny fivoaran\'ny olona',
        'Ampahafantaro ny dokotera ny fiovana rehetra',
        'Araho ny fahasalamanao koa (adina aorian\'ny loza)',
        'Avaozy ny kitapom-pitsaboana',
        'Ataovy ny fisavana ara-pahasalamana aorian\'ny vonjy taitra',
        'Zarao ny zavatra niainanao mba hanampiana ny hafa',
        'Jereo ny vaksiny (tétanos, sns.)',
        'Manorata ny fitsaboana natao'
      ]
    }
  }

  return (
    <div className="guide-page">
      <Navbar />
      <main className="guide-page__main">
        <h1 className="guide-page__title">
          <i className="bi bi-book" />
          {fr ? 'Guide catastrophes naturelles' : 'Torolalana loza voajanahary'}
        </h1>

        {/* Navigation par sections */}
        <div className="guide-page__nav">
          {sections.map(section => (
            <button
              key={section.id}
              className={`guide-page__nav-btn ${activeSection === section.id ? 'active' : ''}`}
              style={{
                borderColor: activeSection === section.id ? section.color : 'var(--border)',
                color: activeSection === section.id ? section.color : 'var(--text-secondary)'
              }}
              onClick={() => setActiveSection(section.id)}
            >
              <i className={section.icon} style={{ color: activeSection === section.id ? section.color : undefined }} />
              <span>{section.label}</span>
            </button>
          ))}
        </div>

        {/* Contenu */}
        <div className="guide-page__content">
          <h2 className="guide-page__section-title">
            <i className={sections.find(s => s.id === activeSection)?.icon} />
            {content[activeSection]?.title}
          </h2>

          <div className="guide-page__card">
            <div className="guide-page__card-header" style={{ background: sections.find(s => s.id === activeSection)?.color + '15', borderColor: sections.find(s => s.id === activeSection)?.color + '30' }}>
              <i className="bi bi-clock-history" style={{ color: sections.find(s => s.id === activeSection)?.color }} />
              <h3>{fr ? 'AVANT' : 'ALOHANY'}</h3>
            </div>
            <ul className="guide-page__list">
              {content[activeSection]?.before.map((item, i) => (
                <li key={i}><i className="bi bi-check-circle" style={{ color: sections.find(s => s.id === activeSection)?.color }} />{item}</li>
              ))}
            </ul>
          </div>

          <div className="guide-page__card">
            <div className="guide-page__card-header" style={{ background: 'rgba(255,59,48,0.08)', borderColor: 'rgba(255,59,48,0.2)' }}>
              <i className="bi bi-exclamation-triangle-fill" style={{ color: '#ff3b30' }} />
              <h3>{fr ? 'PENDANT' : 'MANDRITRA'}</h3>
            </div>
            <ul className="guide-page__list">
              {content[activeSection]?.during.map((item, i) => (
                <li key={i}><i className="bi bi-exclamation-circle" style={{ color: '#ff3b30' }} />{item}</li>
              ))}
            </ul>
          </div>

          <div className="guide-page__card">
            <div className="guide-page__card-header" style={{ background: 'rgba(57,255,136,0.08)', borderColor: 'rgba(57,255,136,0.2)' }}>
              <i className="bi bi-check-circle-fill" style={{ color: '#39ff88' }} />
              <h3>{fr ? 'APRÈS' : 'AORIANY'}</h3>
            </div>
            <ul className="guide-page__list">
              {content[activeSection]?.after.map((item, i) => (
                <li key={i}><i className="bi bi-arrow-right-circle" style={{ color: '#39ff88' }} />{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="guide-page__actions">
          <button className="guide-page__btn" onClick={() => navigate('/emergency-numbers')}>
            <i className="bi bi-telephone-fill" /> {fr ? 'Numéros d\'urgence' : 'Laharan\'ny maika'}
          </button>
          <button className="guide-page__btn" onClick={() => navigate('/map')}>
            <i className="bi bi-map" /> {fr ? 'Trouver un refuge' : 'Mitady toerana fiarovana'}
          </button>
        </div>
      </main>
    </div>
  )
}