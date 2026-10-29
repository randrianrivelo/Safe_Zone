from sqlalchemy.orm import Session
from typing import List
from app.services.danger_service import DangerService


class DangerController:

    def __init__(self, db: Session):
        self.service = DangerService(db)

    def get_active(self):
        return self.service.get_active()

    def get_all(self):
        return self.service.get_all()

    def toggle(self, zone_id: int):
        return self.service.toggle(zone_id)

    def create(self, data: dict):
        return self.service.create(**data)