import sys
sys.path.insert(0, '.')

from app.config.database import SessionLocal, engine
from app.models.user import User
import bcrypt

def hash_pwd(password: str) -> str:
    return bcrypt.hashpw(
        password.encode('utf-8'),
        bcrypt.gensalt(rounds=12)
    ).decode('utf-8')

db = SessionLocal()

try:
    # Supprimer les anciens
    db.query(User).delete()
    db.commit()

    # Créer les nouveaux
    users_data = [
        {"email": "admin@safezone.mg",   "password": "Admin2035!",   "name": "Administrateur SafeZone", "role": "admin"},
        {"email": "agent@safezone.mg",   "password": "Agent2035!",   "name": "Agent SafeZone",          "role": "agent"},
        {"email": "citizen@safezone.mg", "password": "Citizen2035!", "name": "Citoyen Test",            "role": "citizen"}
    ]

    for u in users_data:
        user = User(
            email         = u["email"],
            password_hash = hash_pwd(u["password"]),
            name          = u["name"],
            role          = u["role"],
            is_active     = True
        )
        db.add(user)

    db.commit()
    print("\n✅ Utilisateurs créés avec succès !\n")
    print("admin@safezone.mg    →  Admin2035!")
    print("agent@safezone.mg    →  Agent2035!")
    print("citizen@safezone.mg  →  Citizen2035!")

except Exception as e:
    db.rollback()
    print(f"❌ Erreur : {e}")
finally:
    db.close()