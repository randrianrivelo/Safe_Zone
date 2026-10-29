from sqlalchemy.orm import Session
from typing import TypeVar, Generic, Type, Optional, List

T = TypeVar("T")


class BaseRepository(Generic[T]):
    """
    Repository générique — CRUD de base
    Hérité par tous les autres repositories
    """

    def __init__(self, model: Type[T], db: Session):
        self.model = model
        self.db    = db

    def get_by_id(self, id: int) -> Optional[T]:
        return self.db.query(self.model).filter(
            self.model.id == id
        ).first()

    def get_all(self) -> List[T]:
        return self.db.query(self.model).all()

    def create(self, obj: T) -> T:
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def update(self, obj: T) -> T:
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def delete(self, obj: T) -> None:
        self.db.delete(obj)
        self.db.commit()

    def count(self) -> int:
        return self.db.query(self.model).count()