from sqlalchemy.orm import Session
import platform
import sys
from app.repositories.shelter_repository import ShelterRepository
from app.repositories.road_repository import RoadRepository
from app.repositories.alert_repository import AlertRepository
from app.repositories.danger_repository import DangerRepository
from app.repositories.report_repository import ReportRepository
from app.repositories.user_repository import UserRepository
from app.repositories.log_repository import ActivityLogRepository
from app.config.settings import settings


class AdminController:

    def __init__(self, db: Session):
        self.db = db

    def get_dashboard_stats(self) -> dict:
        shelter_stats = ShelterRepository(self.db).get_global_stats()
        blocked_roads = RoadRepository(self.db).get_all_blocked()
        active_alerts = AlertRepository(self.db).get_active()
        active_dangers= DangerRepository(self.db).get_active()
        pending_reports=ReportRepository(self.db).get_pending()

        return {
            **shelter_stats,
            "blocked_roads":    len(blocked_roads),
            "active_alerts":    len(active_alerts),
            "active_dangers":   len(active_dangers),
            "pending_reports":  len(pending_reports)
        }

    def get_system_status(self) -> dict:
        user_repo = UserRepository(self.db)
        shelter_repo = ShelterRepository(self.db)

        return {
            "database": True,
            "redis": False, # TODO: Check real redis connection
            "python_version": sys.version.split()[0],
            "app_version": settings.APP_VERSION,
            "uptime": "Normal",
            "counts": {
                "users": user_repo.count(),
                "shelters": shelter_repo.count(),
                "reports": ReportRepository(self.db).count(),
                "alerts": AlertRepository(self.db).count()
            }
        }

    def get_logs(self, limit: int = 50):
        return ActivityLogRepository(self.db).get_latest(limit=limit)