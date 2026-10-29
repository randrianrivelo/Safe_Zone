from app.config.settings import settings
from app.config.database import check_db_connection

print(f"App : {settings.APP_NAME}")
print(f"DB  : {settings.DATABASE_URL[:30]}...")
check_db_connection()