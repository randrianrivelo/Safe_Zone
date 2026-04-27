"""
Configuration des tests
"""
import os
from pathlib import Path

# Racine du projet
PROJECT_ROOT = Path(__file__).parent

# Configuration API
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")

# Configuration de test
TEST_TIMEOUT = 30

# Données de test
TEST_USER = {
    "username": "test_user",
    "email": "test@example.com",
    "password": "testpassword123",
    "role": "citizen",
    "phone": "555-0000"
}

TEST_REFUGE = {
    "name": "Test Refuge",
    "description": "A test refuge",
    "latitude": -18.9137,
    "longitude": 47.5261,
    "capacity": 100,
    "type": "test",
    "is_active": True
}

TEST_DANGER_ZONE = {
    "name": "Test Danger Zone",
    "description": "A test danger zone",
    "latitude": -18.9140,
    "longitude": 47.5265,
    "radius": 500,
    "danger_type": "flood",
    "severity": 3
}

# Coordonnées de test
TEST_LOCATION_1 = {
    "latitude": -18.9100,
    "longitude": 47.5250
}

TEST_LOCATION_2 = {
    "latitude": -18.9200,
    "longitude": 47.5300
}
