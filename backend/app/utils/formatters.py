from datetime import datetime


def format_datetime(dt: datetime) -> str:
    if not dt:
        return None
    return dt.strftime("%d/%m/%Y à %H:%M")


def format_distance(km: float) -> str:
    if km < 1:
        return f"{int(km * 1000)} m"
    return f"{round(km, 1)} km"


def format_occupancy(current: int, total: int) -> str:
    percent = round((current / total * 100), 1) if total > 0 else 0
    return f"{current}/{total} ({percent}%)"