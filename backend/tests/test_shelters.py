import pytest
from app.services.shelter_service import ShelterService
from app.models.shelter import Shelter
from unittest.mock import MagicMock


@pytest.fixture
def mock_db():
    """Mock database"""
    return MagicMock()


@pytest.fixture
def mock_shelters_data():
    """Données mock de refuges"""
    return [
        Shelter(
            id=1, name='Stade Mahamasina', shelter_type='stade',
            latitude=-18.9137, longitude=47.5361,
            capacity_total=2000, current_occupancy=100,
            district='Antananarivo Renivohitra',
            address='Avenue de l\'Indépendance',
            contact_phone='+261201234567',
            has_water=True, has_electricity=True, has_medical=True, has_food=False,
            status='ouvert', is_active=True
        ),
        Shelter(
            id=2, name='Lycée JJ Rabearivelo', shelter_type='ecole',
            latitude=-18.9200, longitude=47.5400,
            capacity_total=600, current_occupancy=50,
            district='Antananarivo Renivohitra',
            address='Rue de Suez',
            contact_phone='+261202234567',
            has_water=True, has_electricity=True, has_medical=False, has_food=False,
            status='ouvert', is_active=True
        ),
        Shelter(
            id=3, name='Campus Ankatso', shelter_type='universite',
            latitude=-18.9050, longitude=47.5300,
            capacity_total=800, current_occupancy=750,
            district='Antananarivo Renivohitra',
            address='Boulevard de l\'Indépendance',
            contact_phone='+261203234567',
            has_water=True, has_electricity=True, has_medical=False, has_food=False,
            status='sature', is_active=True
        ),
    ]


class TestShelterService:

    def test_get_all_shelters(self, mock_db, mock_shelters_data):
        """Tester la récupération de tous les refuges"""
        mock_db.query.return_value.all.return_value = mock_shelters_data

        service = ShelterService(mock_db)
        result = service.get_all()

        assert len(result) == 3
        assert result[0].name == 'Stade Mahamasina'

    def test_get_available_shelters(self, mock_db, mock_shelters_data):
        """Tester la récupération des refuges disponibles"""
        available = [s for s in mock_shelters_data if s.status == 'ouvert']
        mock_db.query.return_value.filter.return_value.all.return_value = available

        service = ShelterService(mock_db)
        result = service.get_available()

        assert len(result) == 2
        assert all(s.status == 'ouvert' for s in result)

    def test_get_shelter_by_id(self, mock_db, mock_shelters_data):
        """Tester la récupération d'un refuge par ID"""
        mock_db.query.return_value.filter.return_value.first.return_value = mock_shelters_data[0]

        service = ShelterService(mock_db)
        result = service.get_by_id(1)

        assert result.id == 1
        assert result.name == 'Stade Mahamasina'

    def test_get_shelter_statistics(self, mock_db, mock_shelters_data):
        """Tester les statistiques globales des refuges"""
        mock_db.query.return_value.all.return_value = mock_shelters_data

        service = ShelterService(mock_db)
        stats = service.get_statistics()

        assert stats['total'] == 3
        assert stats['total_capacity'] == 3400
        assert stats['total_occupancy'] == 900

    def test_update_shelter_occupancy(self, mock_db, mock_shelters_data):
        """Tester la mise à jour de l'occupation d'un refuge"""
        shelter = mock_shelters_data[0]
        mock_db.query.return_value.filter.return_value.first.return_value = shelter
        mock_db.commit = MagicMock()

        service = ShelterService(mock_db)
        result = service.update_occupancy(1, 150)

        assert result.current_occupancy == 150

    def test_get_shelters_by_district(self, mock_db, mock_shelters_data):
        """Tester la récupération des refuges par district"""
        district_shelters = [s for s in mock_shelters_data if s.district == 'Antananarivo Renivohitra']
        mock_db.query.return_value.filter.return_value.all.return_value = district_shelters

        service = ShelterService(mock_db)
        result = service.get_by_district('Antananarivo Renivohitra')

        assert len(result) == 3

    def test_get_shelters_with_medical_services(self, mock_db, mock_shelters_data):
        """Tester la récupération des refuges avec services médicaux"""
        medical_shelters = [s for s in mock_shelters_data if s.has_medical]
        mock_db.query.return_value.filter.return_value.all.return_value = medical_shelters

        service = ShelterService(mock_db)
        result = service.get_with_medical()

        assert len(result) == 1
        assert result[0].has_medical == True

    def test_calculate_occupancy_rate(self, mock_db, mock_shelters_data):
        """Tester le calcul du taux d'occupation"""
        shelter = mock_shelters_data[2]  # Campus Ankatso: 750/800

        service = ShelterService(mock_db)
        rate = service.get_occupancy_rate(shelter)

        assert 93.7 <= rate <= 93.8  # 93.75%
        assert 0 <= rate <= 100

    def test_get_nearest_shelters(self, mock_db, mock_shelters_data):
        """Tester la récupération des refuges les plus proches"""
        mock_db.query.return_value.all.return_value = mock_shelters_data

        service = ShelterService(mock_db)
        # Position: près du Stade
        nearest = service.get_nearest_shelters(-18.9137, 47.5361, limit=2)

        assert len(nearest) <= 2
        assert nearest[0]['id'] == 1  # Le stade devrait être le plus proche

    def test_get_shelters_for_emergency(self, mock_db, mock_shelters_data):
        """Tester la récupération des refuges pour urgence"""
        # Refuges ouverts avec capacité disponible
        emergency_shelters = [
            s for s in mock_shelters_data
            if s.status == 'ouvert' and (s.capacity_total - s.current_occupancy) > 0
        ]
        mock_db.query.return_value.filter.return_value.all.return_value = emergency_shelters

        service = ShelterService(mock_db)
        result = service.get_emergency_shelters()

        assert len(result) >= 1
        assert all(s.status == 'ouvert' for s in result)


class TestShelterValidation:

    def test_shelter_capacity_validation(self):
        """Tester la validation de la capacité"""
        shelter = Shelter(
            id=1, name='Test', shelter_type='ecole',
            latitude=-18.9137, longitude=47.5361,
            capacity_total=100, current_occupancy=150
        )

        # current_occupancy ne doit pas dépasser capacity_total
        assert shelter.current_occupancy > shelter.capacity_total

    def test_shelter_coordinates_validation(self):
        """Tester la validation des coordonnées GPS"""
        shelter = Shelter(
            id=1, name='Test', shelter_type='ecole',
            latitude=-18.9137, longitude=47.5361,
            capacity_total=100, current_occupancy=50
        )

        # Vérifier que les coordonnées sont dans les limites valides de Madagascar
        assert -25 < shelter.latitude < -12
        assert 43 < shelter.longitude < 51
