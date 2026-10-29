from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import os
import shutil
from pathlib import Path
from app.config.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.user import UserProfileUpdate, EmergencyCodeUpdate

router = APIRouter()

# Créer le dossier avatars
BASE_DIR = Path(__file__).resolve().parent.parent.parent
AVATAR_DIR = BASE_DIR / "app" / "static" / "avatars"
os.makedirs(str(AVATAR_DIR), exist_ok=True)

@router.post("/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Uploader un avatar"""
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Seules les images sont acceptées")

    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    if file_size > 2 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="L'image ne doit pas dépasser 2 Mo")

    file_extension = file.filename.split('.')[-1].lower()
    if file_extension not in ['jpg', 'jpeg', 'png', 'gif', 'webp']:
        file_extension = 'png'

    file_name = f"avatar_{current_user.id}.{file_extension}"
    file_path = AVATAR_DIR / file_name

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    current_user.avatar = f"/static/avatars/{file_name}"
    db.commit()

    return {"avatar_url": current_user.avatar}

@router.get("/avatar/{user_id}")
def get_avatar(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # ← Dépendance correcte
):
    """Récupérer l'avatar d'un utilisateur"""
    # Vérifier que l'utilisateur a le droit de voir cet avatar
    if current_user.id != user_id and current_user.role not in ['admin', 'agent']:
        raise HTTPException(status_code=403, detail="Non autorisé")

    user = db.query(User).filter(User.id == user_id).first()
    if user and user.avatar:
        return {"avatar_url": user.avatar}
    return {"avatar_url": None}

@router.patch("/profile")
def update_profile(
    data: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if data.name:
        current_user.name = data.name
    if data.phone:
        current_user.phone = data.phone
    db.commit()
    return {"success": True}

@router.patch("/emergency-code")
def update_emergency_code(
    data: EmergencyCodeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    import bcrypt
    emergency_code = data.emergency_code
    if emergency_code and len(emergency_code) == 4 and emergency_code.isdigit():
        hashed = bcrypt.hashpw(emergency_code.encode(), bcrypt.gensalt())
        current_user.emergency_code_hash = hashed.decode()
        db.commit()
    return {"success": True}

@router.delete("/delete")
def delete_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Soft delete
    current_user.is_active = False
    current_user.email = f"deleted_{current_user.id}@deleted.com"
    db.commit()
    return {"success": True}