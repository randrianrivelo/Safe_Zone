import { useNavigate } from 'react-router-dom'
import { useThemeStore } from '../../stores/themeStore'
import './NotFoundPage.css'

export default function NotFoundPage() {
  const navigate = useNavigate()
  const { theme } = useThemeStore()
  const fr = (localStorage.getItem('lang') || 'fr') === 'fr'

  return (
    <div className="notfound" data-theme={theme}>
      <div className="notfound__glitch">
        <div className="notfound__code">404</div>
        <div className="notfound__title">
          {fr ? 'Zone Perdue' : 'Faritra Very'}
        </div>
        <p className="notfound__text">
          {fr
            ? "Le refuge que vous cherchez n'existe pas ou a été déplacé."
            : "Tsy misy ny toerana tadiavinao na nifindra toerana."}
        </p>
        <div className="notfound__actions">
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/')}>
             <i className="bi bi-house-door" /> {fr ? 'Retour à l\'accueil' : 'Hiverina amin\'ny fandraisana'}
          </button>
          <button className="btn btn-ghost btn-lg" onClick={() => navigate(-1)}>
             <i className="bi bi-arrow-left" /> {fr ? 'Page précédente' : 'Pejy taloha'}
          </button>
        </div>
      </div>
      <div className="notfound__bg"></div>
    </div>
  )
}
