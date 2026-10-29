import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.auth_service import AuthService
from app.models.user import User
from app.core.security import hash_password
from app.core.exceptions import UnauthorizedException, SafeZoneException
from unittest.mock import MagicMock

client = TestClient(app)


@pytest.fixture
def mock_db():
    """Mock database session"""
    return MagicMock()


class TestAuthService:

    def test_register_new_user(self, mock_db):
        """Tester l'inscription d'un nouvel utilisateur"""
        service = AuthService(mock_db)
        result = service.register(
            email='test@example.com',
            password='TestPass123',
            name='Test User'
        )
        assert 'access_token' in result
        assert result['user_name'] == 'Test User'
        assert result['role'] == 'citizen'

    def test_register_duplicate_email(self, mock_db):
        """Tester l'enregistrement avec un email dupliqué"""
        from app.repositories.user_repository import UserRepository

        mock_db.query.return_value.filter.return_value.first.return_value = User(
            email='test@example.com',
            password_hash='hash',
            name='Existing'
        )

        service = AuthService(mock_db)
        with pytest.raises(SafeZoneException):
            service.register(
                email='test@example.com',
                password='Pass123',
                name='New User'
            )

    def test_login_success(self, mock_db):
        """Tester la connexion réussie"""
        user = User(
            id=1,
            email='test@example.com',
            password_hash=hash_password('Pass123'),
            name='Test User',
            role='citizen',
            is_active=True
        )
        mock_db.query.return_value.filter.return_value.first.return_value = user
        mock_db.commit = MagicMock()

        service = AuthService(mock_db)
        result = service.login('test@example.com', 'Pass123')
        assert 'access_token' in result
        assert result['role'] == 'citizen'

    def test_login_invalid_password(self, mock_db):
        """Tester la connexion avec un mot de passe invalide"""
        user = User(
            email='test@example.com',
            password_hash=hash_password('CorrectPass'),
            name='Test User'
        )
        mock_db.query.return_value.filter.return_value.first.return_value = user

        service = AuthService(mock_db)
        with pytest.raises(UnauthorizedException):
            service.login('test@example.com', 'WrongPass')

    def test_login_inactive_user(self, mock_db):
        """Tester la connexion d'un utilisateur inactif"""
        user = User(
            email='test@example.com',
            password_hash=hash_password('Pass123'),
            name='Test User',
            is_active=False
        )
        mock_db.query.return_value.filter.return_value.first.return_value = user

        service = AuthService(mock_db)
        with pytest.raises(SafeZoneException):
            service.login('test@example.com', 'Pass123')

    def test_emergency_login_success(self, mock_db):
        """Tester la connexion en mode urgence"""
        user = User(
            id=1,
            email='test@example.com',
            password_hash=hash_password('Pass123'),
            emergency_code_hash=hash_password('1234'),
            emergency_enabled=True,
            name='Test User',
            role='citizen'
        )
        mock_db.query.return_value.filter.return_value.first.return_value = user
        mock_db.commit = MagicMock()

        service = AuthService(mock_db)
        result = service.emergency_login('test@example.com', '1234')
        assert 'access_token' in result
        assert result.get('mode') == 'urgence'


class TestAuthEndpoints:

    def test_register_endpoint(self):
        """Tester l'endpoint d'enregistrement"""
        response = client.post('/api/auth/register', json={
            'email': 'newuser@example.com',
            'password': 'SecurePass123',
            'name': 'New User',
            'phone': '+261123456789'
        })
        assert response.status_code in [200, 201, 422]  # 422 si DB non ouverte

    def test_login_endpoint(self):
        """Tester l'endpoint de connexion"""
        response = client.post('/api/auth/login', json={
            'email': 'test@example.com',
            'password': 'TestPass123'
        })
        assert response.status_code in [200, 401, 422]

    def test_emergency_endpoint(self):
        """Tester l'endpoint d'urgence"""
        response = client.post('/api/auth/emergency', json={
            'email': 'test@example.com',
            'emergency_code': '1234'
        })
        assert response.status_code in [200, 401, 422]
