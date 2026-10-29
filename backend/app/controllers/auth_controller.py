from sqlalchemy.orm import Session
from app.services.auth_service import AuthService


class AuthController:

    def __init__(self, db: Session):
        self.service = AuthService(db)

    def login(self, email: str, password: str) -> dict:
        return self.service.login(email, password)