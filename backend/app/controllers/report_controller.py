from sqlalchemy.orm import Session
from app.services.report_service import ReportService

class ReportController:
    def __init__(self, db: Session):
        self.db = db
        self.service = ReportService(db)

    def create(self, report_type: str, description: str, user_id: int, latitude: float = None, longitude: float = None):
        return self.service.create(report_type, description, user_id, latitude, longitude)

    def get_all(self):
        return self.service.get_all()

    def get_by_user(self, user_id: int):
        return self.service.get_by_user(user_id)

    def get_pending(self):
        return self.service.get_pending()

    def verify(self, report_id: int):
        return self.service.verify(report_id)

    def reject(self, report_id: int):
        return self.service.reject(report_id)