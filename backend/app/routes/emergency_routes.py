from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
import os
import json
from datetime import datetime, timedelta
import bcrypt
from app.core.security import create_access_token, get_current_admin
from app.models.user import User
from app.utils.logger import logger

router = APIRouter(prefix="/emergency", tags=["Urgence"])

# ============================================================
# CONFIGURATION
# ============================================================

# Fichier pour stocker le code urgence (dans le dossier backend)
CODE_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "emergency_code.json")
DEFAULT_CODE = "1234"

# Durée de la session urgence (minutes)
EMERGENCY_SESSION_MINUTES = 15

# S'assurer que le dossier data existe
os.makedirs(os.path.dirname(CODE_FILE), exist_ok=True)


# ============================================================
# FONCTIONS UTILITAIRES
# ============================================================

def get_stored_code() -> str:
    """Récupérer le code urgence stocké"""
    try:
        if os.path.exists(CODE_FILE):
            with open(CODE_FILE, 'r') as f:
                data = json.load(f)
                return data.get('code', DEFAULT_CODE)
    except Exception as e:
        logger.error(f"Erreur lecture code urgence: {e}")
    return DEFAULT_CODE

def save_code(code: str) -> None:
    """Sauvegarder le code urgence"""
    try:
        with open(CODE_FILE, 'w') as f:
            json.dump({'code': code, 'updated_at': datetime.now().isoformat()}, f)
        logger.info(f"Code urgence sauvegardé: {code}")
    except Exception as e:
        logger.error(f"Erreur sauvegarde code urgence: {e}")


# ============================================================
# MODÈLES PYDANTIC
# ============================================================

class EmergencyLoginRequest(BaseModel):
    code: str

class EmergencyCodeUpdate(BaseModel):
    new_code: str
    confirm_code: str

class EmergencyResponse(BaseModel):
    success: bool
    message: str
    access_token: Optional[str] = None
    token_type: Optional[str] = None
    user_name: Optional[str] = None
    role: Optional[str] = None
    user_id: Optional[int] = None
    mode: Optional[str] = None
    expires_minutes: Optional[int] = None


# ============================================================
# ROUTES API
# ============================================================

@router.post("/login")
def emergency_login(data: EmergencyLoginRequest, request: Request):
    """
    Vérifie le code d'urgence et crée une session temporaire
    """
    stored_code = get_stored_code()

    logger.info(f"Tentative de connexion urgence - Code entré: {data.code}")

    if data.code == stored_code:
        # Créer un token avec expiration courte
        expires_delta = timedelta(minutes=EMERGENCY_SESSION_MINUTES)
        token_data = {
            "id": 0,
            "sub": "urgence",
            "role": "citizen",
            "urgence": True,
            "exp": datetime.utcnow() + expires_delta
        }
        access_token = create_access_token(token_data, expires_delta=expires_delta)

        logger.info(f"✅ Mode urgence activé - IP: {request.client.host if request.client else 'unknown'}")

        return {
            "success": True,
            "access_token": access_token,
            "token_type": "bearer",
            "user_name": "Mode Urgence",
            "role": "citizen",
            "user_id": 0,
            "mode": "urgence",
            "expires_minutes": EMERGENCY_SESSION_MINUTES,
            "message": "Mode urgence activé avec succès"
        }
    else:
        logger.warning(f"❌ Tentative échec urgence - Code: {data.code} - IP: {request.client.host if request.client else 'unknown'}")
        raise HTTPException(status_code=401, detail="Code incorrect")


@router.post("/update-code")
def update_emergency_code(
    data: EmergencyCodeUpdate,
    request: Request,
    current_admin: User = Depends(get_current_admin)
):
    """
    Met à jour le code urgence global (réservé aux administrateurs)
    """
    # Validation
    if data.new_code != data.confirm_code:
        raise HTTPException(status_code=400, detail="Les codes ne correspondent pas")

    if len(data.new_code) != 4 or not data.new_code.isdigit():
        raise HTTPException(status_code=400, detail="Le code doit contenir exactement 4 chiffres")

    # Sauvegarder le nouveau code
    save_code(data.new_code)

    logger.info(f"✅ Code urgence modifié par admin {current_admin.email} - Nouveau code: {data.new_code}")

    return {
        "success": True,
        "message": "Code urgence mis à jour avec succès",
        "new_code": data.new_code
    }


@router.get("/current-code")
def get_current_code():
    """
    Récupère le code urgence actuel (pour affichage)
    """
    code = get_stored_code()
    return {
        "code": code,
        "message": "Code actuel"
    }


@router.get("/status")
def get_emergency_status():
    """
    Récupère la configuration du mode urgence
    """
    return {
        "configured": True,
        "session_duration_minutes": EMERGENCY_SESSION_MINUTES,
        "default_code": DEFAULT_CODE
    }


@router.get("/session-info")
def get_session_info(request: Request):
    """
    Vérifie si une session urgence est active
    """
    auth_header = request.headers.get("authorization", "")
    if not auth_header.startswith("Bearer "):
        return {"active": False, "message": "Aucune session active"}

    token = auth_header[7:]
    # Optionnel: décoder et vérifier le token
    return {
        "active": True,
        "expires_minutes": EMERGENCY_SESSION_MINUTES,
        "message": "Session urgence active"
    }


@router.post("/reset-default")
def reset_to_default_code(
    request: Request,
    current_admin: User = Depends(get_current_admin)
):
    """
    Réinitialise le code urgence à sa valeur par défaut (1234)
    """
    save_code(DEFAULT_CODE)

    logger.info(f"✅ Code urgence réinitialisé par admin {current_admin.email}")

    return {
        "success": True,
        "message": f"Code urgence réinitialisé à {DEFAULT_CODE}",
        "default_code": DEFAULT_CODE
    }