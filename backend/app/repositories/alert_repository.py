from sqlalchemy.orm import Session
from typing import List
from app.models.alert import Alert
from app.repositories.base_repository import BaseRepository


class AlertRepository(BaseRepository[Alert]):

    def __init__(self, db: Session):
        super().__init__(Alert, db)

    def get_active(self) -> List[Alert]:
        return self.db.query(Alert).filter(
            Alert.is_active == True
        ).order_by(Alert.created_at.desc()).all()

    def deactivate(self, alert_id: int) -> Alert:
        alert = self.get_by_id(alert_id)
        if alert:
            alert.is_active = False
            self.db.commit()
        return alert