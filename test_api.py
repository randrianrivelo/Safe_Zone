"""
Tests basiques pour vérifier que l'application fonctionne
"""
import requests
import json
from typing import Dict, Any

BASE_URL = "http://localhost:8000"
API_KEY = "test-key"


class SmartSafeZoneTests:
    """Tests pour l'API Smart Safe Zone"""
    
    @staticmethod
    def test_health():
        """Tester que l'API est en ligne"""
        print("\n🏥 Test de santé de l'API...")
        try:
            response = requests.get(f"{BASE_URL}/health")
            print(f"✅ API santé: {response.json()}")
            return response.status_code == 200
        except Exception as e:
            print(f"❌ Erreur: {e}")
            return False
    
    @staticmethod
    def test_register():
        """Tester l'enregistrement d'un utilisateur"""
        print("\n👤 Test d'enregistrement...")
        try:
            user_data = {
                "username": "test_user",
                "email": f"test_{int(__import__('time').time())}@example.com",
                "password": "password123",
                "role": "citizen",
                "phone": "555-1234"
            }
            
            response = requests.post(
                f"{BASE_URL}/api/auth/register",
                json=user_data
            )
            
            if response.status_code == 200:
                print(f"✅ Enregistrement réussi: {response.json()['email']}")
                return response.json()
            else:
                print(f"❌ Erreur: {response.text}")
                return None
        except Exception as e:
            print(f"❌ Erreur: {e}")
            return None
    
    @staticmethod
    def test_refuges():
        """Tester la récupération des refuges"""
        print("\n🏘️ Test des refuges...")
        try:
            response = requests.get(f"{BASE_URL}/api/refuges")
            
            if response.status_code == 200:
                refuges = response.json()
                print(f"✅ Refuges trouvés: {len(refuges)}")
                
                if refuges:
                    print(f"   Premier refuge: {refuges[0]['name']}")
                    return refuges
                else:
                    print("⚠️ Aucun refuge trouvé")
                    return []
            else:
                print(f"❌ Erreur: {response.text}")
                return None
        except Exception as e:
            print(f"❌ Erreur: {e}")
            return None
    
    @staticmethod
    def test_nearby_refuges():
        """Tester la recherche de refuges à proximité"""
        print("\n📍 Test des refuges à proximité...")
        try:
            # Coordonnées de Analamanga
            lat = -18.9100
            lon = 47.5250
            
            response = requests.get(
                f"{BASE_URL}/api/refuges/nearby",
                params={"latitude": lat, "longitude": lon, "radius_km": 10}
            )
            
            if response.status_code == 200:
                refuges = response.json()
                print(f"✅ Refuges à proximité: {len(refuges)}")
                return refuges
            else:
                print(f"❌ Erreur: {response.text}")
                return None
        except Exception as e:
            print(f"❌ Erreur: {e}")
            return None
    
    @staticmethod
    def test_danger_zones():
        """Tester la récupération des zones dangereuses"""
        print("\n⚠️ Test des zones dangereuses...")
        try:
            response = requests.get(f"{BASE_URL}/api/danger-zones")
            
            if response.status_code == 200:
                zones = response.json()
                print(f"✅ Zones dangereuses trouvées: {len(zones)}")
                
                if zones:
                    print(f"   Première zone: {zones[0].get('name', 'N/A')}")
                    return zones
                else:
                    print("⚠️ Aucune zone dangereuse trouvée")
                    return []
            else:
                print(f"❌ Erreur: {response.text}")
                return None
        except Exception as e:
            print(f"❌ Erreur: {e}")
            return None
    
    @staticmethod
    def test_distance():
        """Tester le calcul de distance"""
        print("\n📏 Test du calcul de distance...")
        try:
            params = {
                "lat1": -18.9100,
                "lon1": 47.5250,
                "lat2": -18.9200,
                "lon2": 47.5300
            }
            
            response = requests.get(
                f"{BASE_URL}/api/pathfinding/distance",
                params=params
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Distance: {data['distance']:.2f}m ({data['distance_km']:.3f}km)")
                return data
            else:
                print(f"❌ Erreur: {response.text}")
                return None
        except Exception as e:
            print(f"❌ Erreur: {e}")
            return None
    
    @staticmethod
    def run_all_tests():
        """Exécuter tous les tests"""
        print("\n")
        print("╔" + "="*48 + "╗")
        print("║" + "  Smart Safe Zone - Test Suite".center(48) + "║")
        print("╚" + "="*48 + "╝")
        
        tests = [
            ("Health Check", SmartSafeZoneTests.test_health),
            ("User Registration", SmartSafeZoneTests.test_register),
            ("Get Refuges", SmartSafeZoneTests.test_refuges),
            ("Nearby Refuges", SmartSafeZoneTests.test_nearby_refuges),
            ("Danger Zones", SmartSafeZoneTests.test_danger_zones),
            ("Distance Calculation", SmartSafeZoneTests.test_distance),
        ]
        
        results = []
        for test_name, test_func in tests:
            try:
                result = test_func()
                results.append((test_name, result is not None))
            except Exception as e:
                print(f"❌ Exception: {e}")
                results.append((test_name, False))
        
        print("\n" + "="*48)
        print("📊 RÉSUMÉ DES TESTS")
        print("="*48)
        
        passed = sum(1 for _, result in results if result)
        total = len(results)
        
        for test_name, result in results:
            status = "✅" if result else "❌"
            print(f"{status} {test_name}")
        
        print(f"\n🎯 {passed}/{total} tests réussis")
        print("="*48 + "\n")


if __name__ == "__main__":
    import time
    
    print("\n⏳ Attendre 2 secondes pour s'assurer que l'API est en ligne...")
    time.sleep(2)
    
    SmartSafeZoneTests.run_all_tests()
