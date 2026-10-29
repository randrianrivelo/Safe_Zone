from sqlalchemy.orm import Session
from typing import Optional, List
from app.models.user import User
from app.repositories.base_repository import BaseRepository


class UserRepository(BaseRepository[User]):

    def __init__(self, db: Session):
        super().__init__(User, db)

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(
            User.email == email
        ).first()

    def get_all_citizens(self) -> List[User]:
        return self.db.query(User).filter(
            User.role == "citizen"
        ).all()

    def get_all_agents(self) -> List[User]:
        return self.db.query(User).filter(
            User.role == "agent"
        ).all()

    def get_by_role(self, role: str) -> List[User]:
        return self.db.query(User).filter(
            User.role == role
        ).all()

    def ban(self, user_id: int) -> Optional[User]:
        user = self.get_by_id(user_id)
        if user:
            user.is_active = False
            self.db.commit()
            self.db.refresh(user)
        return user

    def unban(self, user_id: int) -> Optional[User]:
        user = self.get_by_id(user_id)
        if user:
            user.is_active = True
            self.db.commit()
            self.db.refresh(user)
        return user

    def update_role(self, user_id: int, role: str) -> Optional[User]:
        user = self.get_by_id(user_id)
        if user:
            user.role = role
            self.db.commit()
            self.db.refresh(user)
        return user

    def update_avatar(self, user_id: int, avatar_path: str) -> Optional[User]:
        user = self.get_by_id(user_id)
        if user:
            user.avatar = avatar_path
            self.db.commit()
            self.db.refresh(user)
        return user

    def update_emergency_code(
        self, user_id: int, code_hash: str
    ) -> Optional[User]:
        user = self.get_by_id(user_id)
        if user:
            user.emergency_code_hash = code_hash
            self.db.commit()
            self.db.refresh(user)
        return user