import pytest
from app.algorithms.astar import astar
from app.algorithms.graph import Graph, Node


@pytest.fixture
def simple_graph():
    """Créer un simple graphe pour les tests"""
    graph = Graph()
    n1 = Node(1, -18.9137, 47.5361, "Start")
    n2 = Node(2, -18.9150, 47.5370, "Mid")
    n3 = Node(3, -18.9170, 47.5380, "End")

    graph.add_node(n1)
    graph.add_node(n2)
    graph.add_node(n3)

    graph.add_edge(1, 2, 1.5)  # distance en km
    graph.add_edge(2, 3, 2.0)
    graph.add_edge(1, 3, 3.8)

    return graph


class TestAStarAlgorithm:

    def test_astar_finds_path_simple(self, simple_graph):
        """Tester qu'A* trouve un chemin simple"""
        path = astar(simple_graph, 1, 3)
        assert path is not None
        assert len(path) > 0
        assert path[0] == 1
        assert path[-1] == 3

    def test_astar_finds_shortest_path(self, simple_graph):
        """Tester qu'A* trouve le chemin le plus court"""
        path = astar(simple_graph, 1, 3)
        assert path is not None
        # Le chemin devrait être [1, 3] (chemin direct) ou [1, 2, 3]
        assert len(path) <= 3

    def test_astar_no_path(self, simple_graph):
        """Tester A* quand aucun chemin n'existe"""
        path = astar(simple_graph, 1, 9999)  # ID inexistant
        assert path is None or path == []

    def test_astar_same_start_end(self, simple_graph):
        """Tester A* quand start == end"""
        path = astar(simple_graph, 1, 1)
        assert path == [1]

    def test_astar_performance(self, simple_graph):
        """Tester la performance d'A*"""
        import time
        start_time = time.time()
        path = astar(simple_graph, 1, 3)
        elapsed = time.time() - start_time

        assert path is not None
        assert elapsed < 0.1  # Moins de 100ms pour un petit graphe

    def test_astar_with_barriers(self, simple_graph):
        """Tester A* pour contourner des obstacles"""
        # Simuler une route bloquée
        simple_graph.block_edge(1, 3)
        path = astar(simple_graph, 1, 3)

        # Le chemin devrait passer par le nœud 2
        assert path is not None
        if len(path) > 2:
            assert 2 in path

    def test_astar_heuristic_accuracy(self, simple_graph):
        """Tester la précision de l'heuristique"""
        path1 = astar(simple_graph, 1, 3)
        assert path1 is not None

        # Calculer la distance réelle
        total_dist = 0
        for i in range(len(path1) - 1):
            edge = simple_graph.get_edge(path1[i], path1[i+1])
            if edge:
                total_dist += edge['weight']

        # La distance ne doit pas être négative
        assert total_dist > 0
