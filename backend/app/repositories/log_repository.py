from sqlalchemy.orm import Session
from app.repositories.base_repository import BaseRepository
from app.models.activity_log import ActivityLog

class ActivityLogRepository(BaseRepository[ActivityLog]):
    def __init__(self, db: Session):
        super().__init__(ActivityLog, db)

    def get_latest(self, limit: int = 50):
        return self.db.query(self.model).order_by(self.model.created_at.desc()).limit(limit).all()
