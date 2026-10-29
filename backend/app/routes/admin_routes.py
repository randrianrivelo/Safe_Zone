from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.controllers.admin_controller import AdminController
from app.core.security import get_current_admin
from app.models.user import User

router = APIRouter()


@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    current=Depends(get_current_admin)
):
    return AdminController(db).get_dashboard_stats()


@router.get("/profile")
def get_profile(current=Depends(get_current_admin)):
    return {
        "id":         current.id,
        "full_name":  current.full_name,
        "email":      current.email,
        "role":       current.role,
        "last_login": current.last_login
    }


@router.get("/users")
def get_all_users(
    db: Session = Depends(get_db),
    current=Depends(get_current_admin)
):
    """Liste tous les utilisateurs"""
    users = db.query(User).all()
    return [
        {
            "id":         u.id,
            "name":       u.name,
            "email":      u.email,
            "role":       u.role,
            "is_active":  u.is_active,
            "last_login": u.last_login
        }
        for u in users
    ]


@router.patch("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    data: dict,
    db: Session = Depends(get_db),
    current=Depends(get_current_admin)
):
    """Change le rôle d'un utilisateur"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        from app.core.exceptions import NotFoundException
        raise NotFoundException("Utilisateur")
    user.role = data.get("role", user.role)
    db.commit()
    return {"message": f"Rôle mis à jour : {user.role}", "id": user_id}


@router.post("/users/{user_id}/ban")
def ban_user(
    user_id: int,
    db: Session = Depends(get_db),
    current=Depends(get_current_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.is_active = False
        db.commit()
    return {"message": "Utilisateur banni"}


@router.get("/status")
def get_system_status(
    db: Session = Depends(get_db),
    current=Depends(get_current_admin)
):
    return AdminController(db).get_system_status()


@router.get("/logs")
def get_activity_logs(
    db: Session = Depends(get_db),
    current=Depends(get_current_admin)
):
    return AdminController(db).get_logs()


@router.post("/users/{user_id}/unban")
def unban_user(
    user_id: int,
    db: Session = Depends(get_db),
    current=Depends(get_current_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.is_active = True
        db.commit()
    return {"message": "Utilisateur débanni"}