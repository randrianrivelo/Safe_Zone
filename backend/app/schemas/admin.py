from pydantic import BaseModel
from typing import Dict

class SystemStatus(BaseModel):
    database: bool
    redis: bool
    python_version: str
    app_version: str
    uptime: str
    counts: Dict[str, int]
