from sqlalchemy.orm import Session
from typing import List
from app.models.report import Report
from app.repositories.base_repository import BaseRepository


class ReportRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_pending(self):
        return self.db.query(Report).filter(Report.status == "en_attente").order_by(Report.created_at.desc()).all()

    def verify(self, report_id: int, admin_id: int) -> Report:
        report = self.get_by_id(report_id)
        if report:
            report.status      = "verifie"
            report.verified_by = admin_id
            self.db.commit()
            self.db.refresh(report)
        return report

    def reject(self, report_id: int, admin_id: int) -> Report:
        report = self.get_by_id(report_id)
        if report:
            report.status      = "rejete"
            report.verified_by = admin_id
            self.db.commit()
            self.db.refresh(report)
        return report