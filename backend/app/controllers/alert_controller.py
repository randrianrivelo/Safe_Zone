from sqlalchemy.orm import Session
from app.services.alert_service import AlertService

class AlertController:
    def __init__(self, db: Session):
        self.db = db
        self.service = AlertService(db)

    def create(self, title: str, message: str, alert_type: str, severity: str, target_district: str = None, created_by: int = None):
        return self.service.create(title, message, alert_type, severity, target_district, created_by)

    def get_active(self):
        return self.service.get_active()

    def deactivate(self, alert_id: int):
        return self.service.deactivate(alert_id)