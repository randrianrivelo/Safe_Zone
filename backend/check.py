files = [
    'app/services/alert_service.py',
    'app/services/auth_service.py',
    'app/services/shelter_service.py',
    'app/services/road_service.py',
    'app/services/route_service.py',
    'app/services/user_service.py',
    'app/services/weather_service.py',
    'app/services/cache_service.py',
    'app/services/danger_service.py',
    'app/services/report_service.py',
    'app/services/distance_service.py',
]

for f in files:
    try:
        with open(f) as fp:
            content = fp.read()
            classes = [l for l in content.split('\n') if l.startswith('class')]
            if classes:
                print(f"OK       {f}  ->  {classes[0]}")
            else:
                print(f"VIDE     {f}")
    except FileNotFoundError:
        print(f"MANQUANT {f}")