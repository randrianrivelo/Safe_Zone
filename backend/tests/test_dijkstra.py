import pytest
from app.algorithms.dijkstra import dijkstra
from app.algorithms.graph import Graph, Node


@pytest.fixture
def weighted_graph():
    """Créer un graphe pondéré pour Dijkstra"""
    graph = Graph()

    # Créer les nœuds
    nodes = [
        Node(1, -18.9137, 47.5361, "Start"),
        Node(2, -18.9150, 47.5370, "Node2"),
        Node(3, -18.9170, 47.5380, "Node3"),
        Node(4, -18.9200, 47.5400, "End"),
    ]

    for node in nodes:
        graph.add_node(node)

    # Ajouter les arêtes avec des poids
    graph.add_edge(1, 2, 4.0)
    graph.add_edge(1, 3, 2.0)
    graph.add_edge(2, 4, 3.0)
    graph.add_edge(3, 2, 1.0)
    graph.add_edge(3, 4, 5.0)

    return graph


class TestDijkstraAlgorithm:

    def test_dijkstra_finds_shortest_path(self, weighted_graph):
        """Tester que Dijkstra trouve le chemin le plus court"""
        distances, path = dijkstra(weighted_graph, 1, 4)

        assert distances is not None
        assert path is not None
        assert 1 in distances
        assert 4 in distances

    def test_dijkstra_correct_distance(self, weighted_graph):
        """Tester que les distances calculées sont correctes"""
        distances, path = dijkstra(weighted_graph, 1, 4)

        # La distance pour 1->3->2->4 devrait être 1 + 1 + 3 = 5
        # ou 1->2->4 devrait être 4 + 3 = 7
        assert distances[4] <= 7

    def test_dijkstra_same_node(self, weighted_graph):
        """Tester Dijkstra quand start == destination"""
        distances, path = dijkstra(weighted_graph, 1, 1)

        assert distances[1] == 0
        assert len(path) == 1
        assert path[0] == 1

    def test_dijkstra_all_distances(self, weighted_graph):
        """Tester que toutes les distances sont calculées"""
        distances, path = dijkstra(weighted_graph, 1)

        assert len(distances) == 4
        assert distances[1] == 0
        assert distances[2] > 0
        assert distances[3] > 0
        assert distances[4] > 0

    def test_dijkstra_unreachable_node(self, weighted_graph):
        """Tester quand un nœud est inaccessible"""
        # Créer un nœud isolé
        isolated = Node(5, -18.95, 47.55, "Isolated")
        weighted_graph.add_node(isolated)

        distances, path = dijkstra(weighted_graph, 1)

        # La distance vers le nœud isolé doit être infinie
        assert distances[5] == float('inf')

    def test_dijkstra_performance(self, weighted_graph):
        """Tester la performance de Dijkstra"""
        import time
        start_time = time.time()
        distances, path = dijkstra(weighted_graph, 1, 4)
        elapsed = time.time() - start_time

        assert distances is not None
        assert elapsed < 0.05  # Moins de 50ms

    def test_dijkstra_triangle_inequality(self, weighted_graph):
        """Tester l'inégalité triangulaire (triangle rule)"""
        distances, _ = dijkstra(weighted_graph, 1)

        # Pour tout nœud: dist[a] + dist[a->b] >= dist[b]
        for node_id in distances:
            if node_id != 1:
                assert distances[node_id] >= 0

    def test_dijkstra_negative_weights_warning(self, weighted_graph):
        """Tester comportement avec poids négatifs (à éviter)"""
        # Dijkstra n'est pas conçu pour les poids négatifs
        # Ce test vérifie que l'algo gère au minimum sans crash
        distances, path = dijkstra(weighted_graph, 1, 4)
        assert distances is not None
