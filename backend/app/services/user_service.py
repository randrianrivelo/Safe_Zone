from sqlalchemy.orm import Session
from typing import List
import os
import shutil
from app.repositories.user_repository import UserRepository
from app.core.security import hash_password, verify_password
from app.core.exceptions import NotFoundException, SafeZoneException
from app.utils.logger import logger


AVATAR_DIR = "app/static/avatars"


class UserService:

    def __init__(self, db: Session):
        self.repo = UserRepository(db)

    def get_profile(self, user_id: int) -> dict:
        user = self.repo.get_by_id(user_id)
        if not user:
            raise NotFoundException("Utilisateur")
        return {
            "id":       user.id,
            "email":    user.email,
            "name":     user.name,
            "phone":    user.phone,
            "role":     user.role,
            "avatar":   user.avatar,
            "emergency_enabled": user.emergency_enabled
        }

    def update_profile(
        self, user_id: int, name: str = None, phone: str = None
    ) -> dict:
        user = self.repo.get_by_id(user_id)
        if not user:
            raise NotFoundException("Utilisateur")
        if name:
            user.name  = name
        if phone:
            user.phone = phone
        self.repo.update(user)
        return {"message": "Profil mis a jour"}

    def update_avatar(self, user_id: int, file) -> dict:
        user = self.repo.get_by_id(user_id)
        if not user:
            raise NotFoundException("Utilisateur")

        os.makedirs(AVATAR_DIR, exist_ok=True)
        filename  = f"avatar_{user_id}.jpg"
        filepath  = os.path.join(AVATAR_DIR, filename)

        with open(filepath, "wb") as f:
            shutil.copyfileobj(file, f)

        self.repo.update_avatar(user_id, f"/static/avatars/{filename}")
        logger.info(f"Avatar mis a jour pour user {user_id}")
        return {"message": "Avatar mis a jour", "avatar": f"/static/avatars/{filename}"}

    def update_emergency_code(self, user_id: int, code: str) -> dict:
        if len(code) != 4 or not code.isdigit():
            raise SafeZoneException("Le code doit etre 4 chiffres", 400)
        code_hash = hash_password(code)
        self.repo.update_emergency_code(user_id, code_hash)
        return {"message": "Code urgence mis a jour"}

    def get_all_users(self) -> list:
        users = self.repo.get_all()
        return [
            {
                "id":        u.id,
                "email":     u.email,
                "name":      u.name,
                "role":      u.role,
                "is_active": u.is_active,
                "last_login":u.last_login
            }
            for u in users
        ]

    def ban_user(self, user_id: int) -> dict:
        user = self.repo.ban(user_id)
        if not user:
            raise NotFoundException("Utilisateur")
        return {"message": f"Utilisateur {user.name} banni"}

    def unban_user(self, user_id: int) -> dict:
        user = self.repo.unban(user_id)
        if not user:
            raise NotFoundException("Utilisateur")
        return {"message": f"Utilisateur {user.name} debanni"}

    def update_role(self, user_id: int, role: str) -> dict:
        allowed = ["citizen", "agent", "admin"]
        if role not in allowed:
            raise SafeZoneException(f"Role invalide. Roles: {allowed}", 400)
        user = self.repo.update_role(user_id, role)
        if not user:
            raise NotFoundException("Utilisateur")
        return {"message": f"Role mis a jour : {role}"}