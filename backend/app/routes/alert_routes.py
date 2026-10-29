# app/routes/alert_routes.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.controllers.alert_controller import AlertController
from app.schemas.alert import AlertCreate, AlertResponse
from app.core.security import get_current_user, get_current_admin
from app.models.user import User

router = APIRouter()

# Cette route devient publique (pas de dépendance d'auth)
@router.get("/active", response_model=list[AlertResponse])
def get_active_alerts(
    db: Session = Depends(get_db)
):
    """Récupérer les alertes actives - accessible à tous"""
    # Pas de vérification de token
    return AlertController(db).get_active()

# Les autres routes restent protégées
@router.post("/", response_model=AlertResponse)
def create_alert(
    data: AlertCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Créer une alerte (admin uniquement)"""
    return AlertController(db).create(
        title=data.title,
        message=data.message,
        alert_type=data.alert_type,
        severity=data.severity,
        target_district=data.target_district,
        created_by=current_user.id
    )

@router.delete("/{alert_id}")
def deactivate_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Désactiver une alerte (admin uniquement)"""
    return AlertController(db).deactivate(alert_id)