"""
Système dynamique de détermination des refuges en fonction des zones dangereuses
"""
from typing import List, Dict, Tuple
import math


class DynamicRefugeFinder:
    """Trouve les refuges optimaux en évitant les zones dangereuses"""
    
    @staticmethod
    def calculate_danger_score(
        refuge_lat: float,
        refuge_lon: float,
        danger_zones: List[Dict]
    ) -> float:
        """
        Calculer un score de danger pour un refuge
        
        Args:
            refuge_lat, refuge_lon: Position du refuge
            danger_zones: Liste des zones dangereuses
            
        Returns:
            Score de danger (0 = sûr, plus haut = plus dangereux)
        """
        total_danger = 0
        
        for zone in danger_zones:
            if not zone.get('is_active'):
                continue
            
            # Calculer la distance du refuge à la zone
            distance = DynamicRefugeFinder.haversine_distance(
                refuge_lat, refuge_lon,
                float(zone['latitude']), float(zone['longitude'])
            )
            
            zone_radius = float(zone.get('radius', 1000))
            
            # Si le refuge est dans la zone dangereuse
            if distance <= zone_radius:
                # Score = sévérité * (1 - (distance / radius))
                score = zone.get('severity', 1) * (1 - distance / zone_radius)
                total_danger += score
            elif distance <= zone_radius * 3:
                # Pénalité réduite si proche de la zone
                score = (zone.get('severity', 1) * 0.5) * (1 - distance / (zone_radius * 3))
                total_danger += score
        
        return total_danger
    
    @staticmethod
    def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculer la distance entre deux points (Haversine)"""
        R = 6371000  # Rayon de la Terre en mètres
        
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lon2 - lon1)
        
        a = (math.sin(delta_phi/2)**2 + 
             math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda/2)**2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        
        return R * c
    
    @staticmethod
    def find_safest_refuges(
        refuges: List[Dict],
        danger_zones: List[Dict],
        limit: int = 5
    ) -> List[Tuple[Dict, float]]:
        """
        Trouver les refuges les plus sûrs
        
        Args:
            refuges: Liste des refuges
            danger_zones: Liste des zones dangereuses
            limit: Nombre de refuges à retourner
            
        Returns:
            Liste de tuples (refuge, score_danger) triée par sécurité
        """
        refuge_scores = []
        
        for refuge in refuges:
            if not refuge.get('is_active'):
                continue
            
            danger_score = DynamicRefugeFinder.calculate_danger_score(
                float(refuge['latitude']),
                float(refuge['longitude']),
                danger_zones
            )
            
            refuge_scores.append((refuge, danger_score))
        
        # Trier par score de danger (croissant)
        refuge_scores.sort(key=lambda x: x[1])
        
        return refuge_scores[:limit]
    
    @staticmethod
    def get_shelter_capacity_distribution(
        refuges: List[Dict],
        user_count: int,
        danger_zones: List[Dict]
    ) -> Dict:
        """
        Distribuer les utilisateurs entre les refuges de manière optimale
        
        Args:
            refuges: Liste des refuges
            user_count: Nombre d'utilisateurs à abriter
            danger_zones: Zones dangereuses
            
        Returns:
            Distribution: {refuge_id: nombre_d'utilisateurs}
        """
        safest_refuges = DynamicRefugeFinder.find_safest_refuges(
            refuges, danger_zones, limit=len(refuges)
        )
        
        distribution = {}
        remaining_users = user_count
        
        for refuge, _ in safest_refuges:
            available_capacity = refuge['capacity'] - refuge.get('current_occupancy', 0)
            
            if available_capacity > 0:
                allocated = min(remaining_users, available_capacity)
                distribution[refuge['id']] = allocated
                remaining_users -= allocated
                
                if remaining_users <= 0:
                    break
        
        return distribution
