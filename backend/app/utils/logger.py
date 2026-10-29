import logging
import os
from logging.handlers import RotatingFileHandler

# Créer le dossier logs si inexistant
os.makedirs("logs", exist_ok=True)

# Configuration du logger
logger = logging.getLogger("safezone")
logger.setLevel(logging.DEBUG)

# Format des messages
formatter = logging.Formatter(
    "[%(asctime)s] %(levelname)s — %(name)s — %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)

# Handler console
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
console_handler.setFormatter(formatter)

# Handler fichier app.log (5MB max, 3 fichiers de backup)
file_handler = RotatingFileHandler(
    "logs/app.log",
    maxBytes=5 * 1024 * 1024,
    backupCount=3,
    encoding="utf-8"
)
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(formatter)

# Handler fichier error.log (erreurs uniquement)
error_handler = RotatingFileHandler(
    "logs/error.log",
    maxBytes=2 * 1024 * 1024,
    backupCount=3,
    encoding="utf-8"
)
error_handler.setLevel(logging.ERROR)
error_handler.setFormatter(formatter)

logger.addHandler(console_handler)
logger.addHandler(file_handler)
logger.addHandler(error_handler)