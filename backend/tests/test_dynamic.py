import pytest
from app.algorithms.dynamic_refuge import DynamicRefuge
from app.models.shelter import Shelter
from app.models.road import Road


@pytest.fixture
def mock_shelters():
    """Créer des refuges mock pour tester"""
    return [
        Shelter(id=1, name='Stade Mahamasina', latitude=-18.9137, longitude=47.5361,
                capacity_total=2000, current_occupancy=100, has_medical=True, has_water=True),
        Shelter(id=2, name='Parc', latitude=-18.9200, longitude=47.5400,
                capacity_total=500, current_occupancy=50, has_medical=False, has_water=True),
        Shelter(id=3, name='Ecole', latitude=-18.9050, longitude=47.5300,
                capacity_total=800, current_occupancy=700, has_medical=False, has_water=False),
    ]


@pytest.fixture
def mock_roads():
    """Créer des routes mock pour tester"""
    return [
        Road(id=1, name='RN2', status='passable', is_passable=True, danger_level=0),
        Road(id=2, name='Route locale', status='inonde', is_passable=False, danger_level=3),
        Road(id=3, name='Voie secondaire', status='passable', is_passable=True, danger_level=1),
    ]


class TestDynamicRefugeSystem:

    def test_calculate_shelter_score(self, mock_shelters):
        """Tester le calcul du score d'un refuge"""
        dr = DynamicRefuge()

        shelter = mock_shelters[0]
        user_lat, user_lon = -18.9137, 47.5361

        score = dr.calculate_shelter_score(shelter, user_lat, user_lon)

        assert score > 0
        assert isinstance(score, (int, float))

    def test_available_spaces_calculation(self, mock_shelters):
        """Tester le calcul des places disponibles"""
        dr = DynamicRefuge()

        shelter = mock_shelters[0]
        available = dr.get_available_spaces(shelter)

        expected = shelter.capacity_total - shelter.current_occupancy
        assert available == expected
        assert available > 0

    def test_shelter_occupancy_percentage(self, mock_shelters):
        """Tester le calcul du pourcentage d'occupation"""
        dr = DynamicRefuge()

        shelter = mock_shelters[2]  # 700/800
        percentage = dr.get_occupancy_percentage(shelter)

        assert 87 <= percentage <= 88  # ~87.5%
        assert 0 <= percentage <= 100

    def test_find_best_refuge_by_distance(self, mock_shelters):
        """Tester la recherche du refuge le plus proche"""
        dr = DynamicRefuge()

        user_lat, user_lon = -18.9137, 47.5361
        best = dr.find_closest_shelter(mock_shelters, user_lat, user_lon)

        assert best is not None
        assert best['id'] == 1  # Stade Mahamasina à la même position

    def test_find_best_refuge_by_capacity(self, mock_shelters):
        """Tester la recherche du refuge avec le plus d'espace"""
        dr = DynamicRefuge()

        best = dr.find_shelter_by_capacity(mock_shelters)

        assert best is not None
        available_spaces = best['capacity_total'] - best['current_occupancy']
        assert available_spaces > 0

    def test_rank_shelters(self, mock_shelters):
        """Tester le classement des refuges"""
        dr = DynamicRefuge()

        user_lat, user_lon = -18.9137, 47.5361
        ranked = dr.rank_shelters(mock_shelters, user_lat, user_lon)

        assert len(ranked) <= len(mock_shelters)
        assert all('score' in r for r in ranked)

    def test_shelter_accessibility(self, mock_shelters, mock_roads):
        """Tester la vérification de l'accessibilité"""
        dr = DynamicRefuge()
        dr.roads = mock_roads

        shelter = mock_shelters[0]
        is_accessible = dr.is_shelter_accessible(shelter)

        # Dépend de la logique métier
        assert isinstance(is_accessible, bool)

    def test_dynamic_adjustment_for_disasters(self, mock_shelters):
        """Tester l'ajustement dynamique en cas de catastrophe"""
        dr = DynamicRefuge()

        original_capacity = mock_shelters[0].capacity_total
        adjusted = dr.adjust_shelter_for_disaster(mock_shelters[0], 'cyclone')

        # La capacité ne devrait pas diminuer drastiquement
        assert adjusted > 0
        assert adjusted <= original_capacity

    def test_priority_for_vulnerable_populations(self, mock_shelters):
        """Tester les refuges prioritaires pour populations vulnérables"""
        dr = DynamicRefuge()

        # Refuge avec services médicaux
        shelter_with_medical = mock_shelters[0]
        has_medical = dr.has_medical_support(shelter_with_medical)

        assert has_medical == True
        assert shelter_with_medical.has_medical == True

    def test_empty_shelters_list(self):
        """Tester avec liste vide de refuges"""
        dr = DynamicRefuge()

        result = dr.rank_shelters([], -18.9137, 47.5361)

        assert result == []
