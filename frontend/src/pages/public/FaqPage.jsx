import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useThemeStore } from '../../stores/themeStore'
import Navbar from '../../components/layout/Navbar'
import './FaqPage.css'

export default function FaqPage() {
  const navigate = useNavigate()
  const { theme } = useThemeStore()
  const [openIndex, setOpenIndex] = useState(null)
  const fr = (localStorage.getItem('lang') || 'fr') === 'fr'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('data-accent', localStorage.getItem('sz_accent') || 'purple')
  }, [theme])

  const faqs = [
    {
      question: fr ? 'Comment utiliser SafeZone en cas de cyclone ?' : 'Ahoana ny fampiasana SafeZone rehefa misy rivo-doza ?',
      answer: fr
        ? 'Ouvrez l\'application, activez votre localisation GPS, puis cliquez sur "Trouver refuge". L\'application calculera automatiquement l\'itinéraire le plus sûr vers le refuge le plus proche en évitant les zones dangereuses.'
        : 'Sokafy ny fampiharana, alefaso ny GPS, ary tsindrio ny "Mitady toerana". Ny fampiharana dia hanisa ny lalana arovana indrindra mankany amin\'ny toerana akaiky indrindra.'
    },
    {
      question: fr ? 'Comment créer un compte SafeZone ?' : 'Ahoana ny famoronana kaonty SafeZone ?',
      answer: fr
        ? 'Rendez-vous sur la page de connexion, cliquez sur "Inscription", remplissez vos informations (nom, email, mot de passe) et validez. Vous pouvez aussi vous inscrire via Google ou Facebook.'
        : 'Mankanesa any amin\'ny pejy fidirana, tsindrio ny "Misoratra", feno ny mombamomba anao (anarana, email, teny miafina) ary manamafisa. Azonao atao koa ny misoratra amin\'ny Google na Facebook.'
    },
    {
      question: fr ? 'Que faire si je n\'ai pas de connexion internet ?' : 'Inona no atao raha tsy misy internet ?',
      answer: fr
        ? 'SafeZone dispose d\'un mode hors-ligne. Téléchargez la carte et les données des refuges en avance dans les paramètres. Ainsi, même sans internet, vous pourrez consulter la carte et trouver un refuge.'
        : 'SafeZone dia manana fomba tsy mifandray. Alao mialoha ny sarintany sy ny angona momba ny toerana fiarovana ao amin\'ny paramètres. Na dia tsy misy internet aza, dia afaka mijery ny sarintany ianao.'
    },
    {
      question: fr ? 'Comment signaler une zone dangereuse ?' : 'Ahoana ny fampandrenesana faritra mampidi-doza ?',
      answer: fr
        ? 'Allez dans l\'onglet "Signaler", choisissez le type de danger, décrivez la situation et envoyez. Les autorités vérifieront votre signalement et prendront les mesures nécessaires.'
        : 'Mankanesa any amin\'ny "Mampandre", mifidiana karazana loza, hazavao ny zava-misy ary alefaso. Ny manampahefana dia hanamarina ny fampandrenesanao ary handray hetsika.'
    },
    {
      question: fr ? 'Comment fonctionne le mode urgence ?' : 'Ahoana ny fiasan\'ny fomba maika ?',
      answer: fr
        ? 'Le mode urgence est accessible via le code PIN que vous avez défini. Il active l\'algorithme A* pour trouver le refuge le plus proche et calcule l\'itinéraire le plus rapide, idéal en situation critique.'
        : 'Ny fomba maika dia azo alaina amin\'ny alalan\'ny kaody PIN izay nataonao. Izany dia mampiasa ny A* mba hahitana ny toerana akaiky indrindra ary manisa ny lalana haingana indrindra.'
    },
    {
      question: fr ? 'Les données sont-elles sécurisées ?' : 'Azo antoka ve ny angonay ?',
      answer: fr
        ? 'Oui, toutes les données sont cryptées et sécurisées. Nous respectons le RGPD et ne partageons jamais vos informations personnelles avec des tiers sans votre consentement.'
        : 'Eny, ny angona rehetra dia voaaro sy tsiambaratelo. Manaja ny RGPD izahay ary tsy mizara ny mombamomba anao amin\'ny antoko fahatelo raha tsy nahazo alalana.'
    },
    {
      question: fr ? 'Comment contacter le support technique ?' : 'Ahoana ny fifandraisana amin\'ny fanampiana ara-teknika ?',
      answer: fr
        ? 'Vous pouvez nous contacter par email à support@safezone.mg ou via le formulaire de contact dans l\'application. Nous vous répondrons dans les plus brefs délais.'
        : 'Azonao atao ny mifandray aminay amin\'ny alalan\'ny mailaka support@safezone.mg na amin\'ny alalan\'ny taratasy fifandraisana ao amin\'ny fampiharana. Hamaly anao haingana izahay.'
    },
    {
      question: fr ? 'L\'application est-elle gratuite ?' : 'Maimaim-poana ve ny fampiharana ?',
      answer: fr
        ? 'Oui, SafeZone est entièrement gratuite pour tous les citoyens. Notre mission est de protéger la population sans barrière financière.'
        : 'Eny, SafeZone dia maimaim-poana ho an\'ny olom-pirenena rehetra. Ny tanjonay dia ny fiarovana ny mponina tsy misy sakana ara-bola.'
    }
  ]

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="faq-page">
      <Navbar />
      <main className="faq-page__main">
        <h1 className="faq-page__title">
          <i className="bi bi-question-circle" />
          {fr ? 'Foire aux questions' : 'Fanontaniana matetika'}
        </h1>
        <p className="faq-page__subtitle">
          {fr
            ? 'Retrouvez les réponses aux questions les plus fréquentes sur SafeZone Analamanga 2035'
            : 'Hahita ny valin\'ny fanontaniana matetika momba ny SafeZone Analamanga 2035'}
        </p>

        <div className="faq-page__grid">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-page__card">
              <button
                className={`faq-page__question ${openIndex === index ? 'active' : ''}`}
                onClick={() => toggleFaq(index)}
              >
                <span>{faq.question}</span>
                <i className={`bi bi-chevron-${openIndex === index ? 'up' : 'down'}`} />
              </button>
              <div className={`faq-page__answer ${openIndex === index ? 'open' : ''}`}>
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="faq-page__contact">
          <i className="bi bi-chat-dots" />
          <div>
            <strong>{fr ? 'Vous n\'avez pas trouvé votre réponse ?' : 'Tsy mbola nahita ny valiny tadiavinao ?'}</strong>
            <p>{fr ? 'Contactez notre équipe de support :' : 'Mifandraisa amin\'ny ekipanay :'}</p>
          </div>
          <button className="faq-page__contact-btn" onClick={() => navigate('/about')}>
            <i className="bi bi-envelope" /> {fr ? 'Nous contacter' : 'Mifandraisa aminay'}
          </button>
        </div>

        <div className="faq-page__actions">
          <button className="faq-page__btn" onClick={() => navigate('/guide')}>
            <i className="bi bi-book" /> {fr ? 'Guide catastrophes' : 'Torolalana loza'}
          </button>
          <button className="faq-page__btn" onClick={() => navigate('/emergency-numbers')}>
            <i className="bi bi-telephone-fill" /> {fr ? 'Numéros d\'urgence' : 'Laharan\'ny maika'}
          </button>
        </div>
      </main>
    </div>
  )
}