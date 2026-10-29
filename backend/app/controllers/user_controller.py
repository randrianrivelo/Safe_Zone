from sqlalchemy.orm import Session
from app.services.user_service import UserService


class UserController:

    def __init__(self, db: Session):
        self.service = UserService(db)

    def get_profile(self, user_id: int):
        return self.service.get_profile(user_id)

    def update_profile(self, user_id: int, data: dict):
        return self.service.update_profile(
            user_id,
            name=data.get("name"),
            phone=data.get("phone")
        )

    def update_avatar(self, user_id: int, file):
        return self.service.update_avatar(user_id, file)

    def update_emergency_code(self, user_id: int, code: str):
        return self.service.update_emergency_code(user_id, code)

    def get_all(self):
        return self.service.get_all_users()

    def ban(self, user_id: int):
        return self.service.ban_user(user_id)

    def unban(self, user_id: int):
        return self.service.unban_user(user_id)

    def update_role(self, user_id: int, role: str):
        return self.service.update_role(user_id, role)