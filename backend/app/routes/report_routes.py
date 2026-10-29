from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.controllers.report_controller import ReportController
from app.schemas.report import ReportCreate, ReportResponse
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=ReportResponse)
def create_report(
    data: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Créer un nouveau signalement"""
    try:
        report = ReportController(db).create(
            report_type=data.report_type,
            description=data.description,
            user_id=current_user.id,
            latitude=data.latitude,
            longitude=data.longitude
        )
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
def get_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupérer les signalements (admin = tous, citizen = ses propres signalements)"""
    if current_user.role == "admin":
        return ReportController(db).get_all()
    return ReportController(db).get_by_user(current_user.id)

@router.get("/all")
def get_all_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupérer tous les signalements (admin uniquement)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Non autorisé")
    return ReportController(db).get_all()

@router.get("/pending")
def get_pending_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupérer les signalements en attente (admin uniquement)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Non autorisé")
    return ReportController(db).get_pending()

@router.patch("/{report_id}/verify")
def verify_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Vérifier un signalement (admin uniquement)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Non autorisé")
    report = ReportController(db).verify(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Signalement non trouvé")
    return report

@router.patch("/{report_id}/reject")
def reject_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Rejeter un signalement (admin uniquement)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Non autorisé")
    report = ReportController(db).reject(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Signalement non trouvé")
    return report