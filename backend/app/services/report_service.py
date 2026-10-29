from sqlalchemy.orm import Session
from app.models.report import Report

class ReportService:
    def __init__(self, db: Session):
        self.db = db

    def create(self, report_type: str, description: str, user_id: int, latitude: float = None, longitude: float = None):
        report = Report(
            report_type=report_type,
            description=description,
            latitude=latitude,
            longitude=longitude,
            user_id=user_id,
            status="en_attente"
        )
        self.db.add(report)
        self.db.commit()
        self.db.refresh(report)
        return report

    def get_all(self):
        return self.db.query(Report).all()

    def get_by_user(self, user_id: int):
        return self.db.query(Report).filter(Report.user_id == user_id).all()

    def get_pending(self):
        return self.db.query(Report).filter(Report.status == "en_attente").all()

    def verify(self, report_id: int):
        report = self.db.query(Report).filter(Report.id == report_id).first()
        if report:
            report.status = "verifie"
            self.db.commit()
            self.db.refresh(report)
        return report

    def reject(self, report_id: int):
        report = self.db.query(Report).filter(Report.id == report_id).first()
        if report:
            report.status = "rejete"
            self.db.commit()
            self.db.refresh(report)
        return report