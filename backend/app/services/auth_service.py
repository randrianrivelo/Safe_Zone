from sqlalchemy.orm import Session
from datetime import datetime
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.core.security import verify_password, create_access_token, hash_password
from app.core.exceptions import UnauthorizedException, SafeZoneException
from app.utils.logger import logger


class AuthService:

    def __init__(self, db: Session):
        self.db = db
        self.repo = UserRepository(db)

    def register(self, email, password, name, phone=None):
        existing = self.repo.get_by_email(email)
        if existing:
            raise SafeZoneException("Email deja utilise", 409)
        user = User(
            email=email,
            password_hash=hash_password(password),
            name=name,
            phone=phone,
            role="citizen"
        )
        created = self.repo.create(user)

        # CRÉER LE TOKEN AVEC "id" et "sub"
        token = create_access_token({
            "id": created.id,           # ← important pour get_current_user
            "sub": created.email,
            "role": created.role
        })

        logger.info(f"Nouvel utilisateur : {email}")
        return {
            "access_token": token,
            "token_type": "bearer",
            "user_name": created.name,
            "role": created.role,
            "user_id": created.id,
            "email": created.email
        }

    def login(self, email, password):
        user = self.repo.get_by_email(email)
        if not user or not verify_password(password, user.password_hash):
            logger.warning(f"Connexion echouee : {email}")
            raise UnauthorizedException()
        if not user.is_active:
            raise SafeZoneException("Compte desactive", 403)

        user.last_login = datetime.utcnow()
        self.db.commit()

        # CRÉER LE TOKEN AVEC "id" et "sub"
        token = create_access_token({
            "id": user.id,              # ← important pour get_current_user
            "sub": user.email,
            "role": user.role
        })

        logger.info(f"Connexion : {email} ({user.role})")
        return {
            "access_token": token,
            "token_type": "bearer",
            "user_name": user.name,
            "role": user.role,
            "user_id": user.id,
            "email": user.email
        }

    def emergency_login(self, email, emergency_code):
        user = self.repo.get_by_email(email)
        if not user or not user.emergency_enabled:
            raise UnauthorizedException()
        if not user.emergency_code_hash:
            raise SafeZoneException("Code urgence non configure", 400)
        if not verify_password(emergency_code, user.emergency_code_hash):
            raise UnauthorizedException()

        user.last_emergency_access = datetime.utcnow()
        self.db.commit()

        # CRÉER LE TOKEN AVEC "id" et "sub"
        token = create_access_token({
            "id": user.id,              # ← important pour get_current_user
            "sub": user.email,
            "role": user.role,
            "urgence": True
        })

        logger.info(f"Mode urgence active : {email}")
        return {
            "access_token": token,
            "token_type": "bearer",
            "user_name": user.name,
            "role": user.role,
            "user_id": user.id,
            "email": user.email,
            "mode": "urgence"
        }