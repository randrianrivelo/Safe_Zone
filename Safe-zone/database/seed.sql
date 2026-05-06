-- ============================================================
-- SMART SAFE ZONE 2035
-- FICHIER : seed.sql
-- DESCRIPTION : Donnees de test pour Analamanga
-- ============================================================

-- ============================================================
-- UTILISATEURS DE TEST
-- ============================================================
INSERT INTO users (username, email, password_hash, role, phone) VALUES
('Admin SafeZone',   'admin@safezone.mg',  '$2b$12$testhash', 'admin',   '+261 34 00 000 01'),
('Citoyen Jean',     'jean@gmail.com',     '$2b$12$testhash', 'citizen', '+261 34 00 000 02'),
('Gestionnaire Luc', 'luc@safezone.mg',    '$2b$12$testhash', 'admin',   '+261 34 00 000 03');

-- ============================================================
-- REFUGES (8 refuges a Analamanga)
-- ============================================================
INSERT INTO refuges (
    name, description, latitude, longitude,
    capacity, current_occupancy, type, address,
    is_active, has_water, has_electricity, has_medical, contact_phone
) VALUES
('Lycee JJ Rabearivelo',
 'Grand lycee avec cour spacieuse',
 -18.9137, 47.5261, 500, 120, 'ecole',
 'Rue Rainandriamampandry, Antananarivo',
 TRUE, TRUE, TRUE, FALSE, '+261 20 22 123 45'),

('Stade Municipal Alarobia',
 'Stade couvert tres spacieux',
 -18.8987, 47.5198, 2000, 450, 'stade',
 'Route Alarobia, Antananarivo',
 TRUE, TRUE, TRUE, TRUE, '+261 20 22 234 56'),

('Eglise Catholique Analakely',
 'Grande eglise au centre-ville',
 -18.9108, 47.5245, 300, 60, 'eglise',
 'Place de Independance, Antananarivo',
 TRUE, TRUE, TRUE, FALSE, '+261 20 22 345 67'),

('Centre FJKM Ambatonakanga',
 'Centre communautaire avec dortoirs',
 -18.9060, 47.5280, 200, 50, 'centre',
 'Rue Ambatonakanga, Antananarivo',
 TRUE, TRUE, FALSE, FALSE, '+261 20 22 456 78'),

('Gymnase Municipal Ankorondrano',
 'Gymnase couvert avec sanitaires',
 -18.8912, 47.5165, 800, 200, 'gymnase',
 'Zone Ankorondrano, Antananarivo',
 TRUE, TRUE, TRUE, TRUE, '+261 20 22 567 89'),

('Ecole Primaire Ambohijatovo',
 'Ecole avec salles abri',
 -18.9145, 47.5300, 150, 30, 'ecole',
 'Quartier Ambohijatovo, Antananarivo',
 TRUE, TRUE, FALSE, FALSE, '+261 20 22 678 90'),

('Hopital HJRA Ampefiloha',
 'Hopital avec zone accueil urgence',
 -18.9180, 47.5235, 400, 400, 'hopital',
 'Ampefiloha, Antananarivo',
 TRUE, TRUE, TRUE, TRUE, '+261 20 22 111 11'),

('Palais des Sports Mahamasina',
 'Grand complexe sportif national',
 -18.9220, 47.5190, 3000, 800, 'stade',
 'Enceinte Mahamasina, Antananarivo',
 TRUE, TRUE, TRUE, TRUE, '+261 20 22 789 01');

-- ============================================================
-- NOEUDS DU GRAPHE (10 intersections)
-- ============================================================
INSERT INTO nodes (latitude, longitude, name, node_type) VALUES
(-18.9100, 47.5250, 'Analakely Centre',        'intersection'),
(-18.9050, 47.5200, 'Ambatonakanga Carrefour', 'intersection'),
(-18.9000, 47.5180, 'Ankorondrano Entree',     'intersection'),
(-18.8950, 47.5200, 'Alarobia Carrefour',      'intersection'),
(-18.9150, 47.5270, 'Ambohijatovo Haut',       'intersection'),
(-18.9130, 47.5260, 'Lycee JJ Entree',         'landmark'),
(-18.9200, 47.5220, 'Mahamasina Nord',         'intersection'),
(-18.8900, 47.5170, 'Ivandry Sud',             'intersection'),
(-18.9070, 47.5240, 'Ambanidia Croisement',    'intersection'),
(-18.9180, 47.5240, 'HJRA Carrefour',          'landmark');

-- ============================================================
-- ROUTES DU GRAPHE (14 routes)
-- ============================================================
INSERT INTO edges (
    node_from, node_to, distance,
    road_name, road_type,
    is_passable, danger_level, flood_risk
) VALUES
(1, 2,  650,  'Avenue de Independance', 'primary',   TRUE,  0, FALSE),
(2, 3,  800,  'Route Ankorondrano',     'primary',   TRUE,  0, FALSE),
(3, 4,  550,  'Route Alarobia',         'secondary', TRUE,  0, FALSE),
(1, 7,  1100, 'Avenue Mahamasina',      'primary',   TRUE,  0, FALSE),
(7, 10, 300,  'Rue HJRA',              'secondary', TRUE,  0, FALSE),
(1, 5,  600,  'Rue Ambohijatovo',       'secondary', TRUE,  1, FALSE),
(5, 6,  200,  'Rue du Lycee',           'tertiary',  TRUE,  0, FALSE),
(2, 6,  900,  'Rue Transversale',       'tertiary',  TRUE,  0, FALSE),
(1, 9,  350,  'Rue Ambanidia',          'tertiary',  TRUE,  0, FALSE),
(9, 2,  400,  'Rue de Liaison',         'tertiary',  TRUE,  1, FALSE),
(4, 8,  600,  'Route du Nord',          'primary',   TRUE,  0, FALSE),
(6, 1,  350,  'Rue du Centre',          'tertiary',  TRUE,  0, FALSE),
(3, 8,  400,  'Route Ivandry',          'secondary', FALSE, 3, TRUE),
(5, 10, 450,  'Rue du Sud',            'secondary', TRUE,  2, TRUE);

-- ============================================================
-- ZONES DANGEREUSES (5 zones)
-- ============================================================
INSERT INTO danger_zones (
    name, description,
    latitude, longitude, radius,
    danger_type, severity, is_active
) VALUES
('Zone Inondation Analakely',
 'Zone basse regulierement inondee',
 -18.9115, 47.5245, 350, 'flood', 4, TRUE),

('Glissement Ambohijatovo',
 'Risque de glissement de terrain',
 -18.9160, 47.5310, 200, 'landslide', 3, TRUE),

('Vents Violents Mahamasina',
 'Zone exposee aux vents violents',
 -18.9230, 47.5180, 250, 'wind', 2, TRUE),

('Eboulements Ampefiloha',
 'Zone de falaise avec risque eboulements',
 -18.9195, 47.5215, 150, 'landslide', 3, TRUE),

('Inondation Ankorondrano',
 'Bas-fond sujet aux crues rapides',
 -18.9010, 47.5170, 200, 'flood', 2, TRUE);

-- ============================================================
-- ALERTES (3 alertes)
-- ============================================================
INSERT INTO alerts (title, message, alert_type, severity, is_active) VALUES
('URGENCE - Cyclone GAMANE',
 'Un cyclone de categorie 3 approche. Rejoignez un refuge immediatement.',
 'cyclone', 'critical', TRUE),

('Fortes pluies prevues',
 'Pluies torrentielles dans les 24 prochaines heures. Restez vigilants.',
 'flood', 'warning', TRUE),

('Refuges ouverts',
 '8 refuges disponibles avec plus de 7000 places. Consultez la carte.',
 'general', 'info', TRUE);

-- Confirmation
SELECT 'Donnees inserees avec succes !' AS message;
SELECT COUNT(*) AS nb_refuges FROM refuges;
SELECT COUNT(*) AS nb_nodes FROM nodes;
SELECT COUNT(*) AS nb_edges FROM edges;
SELECT COUNT(*) AS nb_zones FROM danger_zones;
SELECT COUNT(*) AS nb_alerts FROM alerts;