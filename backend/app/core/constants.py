# Statuts des refuges
class ShelterStatus:
    OUVERT       = "ouvert"
    SATURE       = "sature"
    FERME        = "ferme"
    PREPARATION  = "en_preparation"

    ALL = [OUVERT, SATURE, FERME, PREPARATION]


# Types de refuges
class ShelterType:
    ECOLE        = "ecole"
    STADE        = "stade"
    EGLISE       = "eglise"
    GYMNASE      = "gymnase"
    MAIRIE       = "mairie"
    HOPITAL      = "hopital"
    CENTRE_COMM  = "centre_comm"

    ALL = [ECOLE, STADE, EGLISE, GYMNASE, MAIRIE, HOPITAL, CENTRE_COMM]


# Statuts des routes
class RoadStatus:
    NORMAL       = "normal"
    ENDOMMAGE    = "endommage"
    DETRUIT      = "detruit"
    INONDE       = "inonde"
    BLOQUE       = "bloque"

    IMPASSABLE = [DETRUIT, INONDE]


# Types de danger
class DangerType:
    INONDATION   = "inondation"
    GLISSEMENT   = "glissement"
    CYCLONE      = "cyclone"
    INCENDIE     = "incendie"


# Niveaux de sévérité
class Severity:
    FAIBLE    = "faible"
    MOYEN     = "moyen"
    ELEVE     = "eleve"
    CRITIQUE  = "critique"


# Rôles admin
class AdminRole:
    SUPER_ADMIN  = "super_admin"
    ADMIN        = "admin"
    OBSERVATEUR  = "observateur"


# Modes de calcul d'itinéraire
class RouteMode:
    NORMAL   = "normal"    # Dijkstra — chemin le plus court
    URGENCE  = "urgence"   # A* — chemin le plus rapide


# Poids pour la programmation dynamique
class RefugeWeights:
    DISTANCE    = 10
    CAPACITY    = 9
    WATER       = 8
    MEDICAL     = 7
    ROAD_SAFETY = 6
    ELECTRICITY = 5