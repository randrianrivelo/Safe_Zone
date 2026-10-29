from sqlalchemy.orm import Session
from app.models.alert import Alert
from datetime import datetime

class AlertService:
    def __init__(self, db: Session):
        self.db = db

    def create(self, title: str, message: str, alert_type: str, severity: str, target_district: str = None, created_by: int = None):
        alert = Alert(
            title=title,
            message=message,
            alert_type=alert_type,
            severity=severity,
            target_district=target_district,
            created_by=created_by,
            is_active=True,
            created_at=datetime.now()
        )
        self.db.add(alert)
        self.db.commit()
        self.db.refresh(alert)
        return alert

    def get_active(self):
        return self.db.query(Alert).filter(Alert.is_active == True).all()

    def deactivate(self, alert_id: int):
        alert = self.db.query(Alert).filter(Alert.id == alert_id).first()
        if alert:
            alert.is_active = False
            self.db.commit()
        return alert