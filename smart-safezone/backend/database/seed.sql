-- database/seed.sql - MySQL Version

-- Insérer des refuges à Analamanga
INSERT INTO refuges (name, description, latitude, longitude, capacity, type, has_water, has_electricity, has_medical) VALUES
('Lycée JJ Rabearivelo', 'Grand lycée avec cour spacieuse', -18.9137, 47.5261, 500, 'ecole', true, true, false),
('Stade Alarobia', 'Stade couvert', -18.8987, 47.5198, 2000, 'stade', true, true, true),
('Église Analakely', 'Grande église au centre-ville', -18.9108, 47.5255, 300, 'eglise', true, true, false),
('Centre FJKM Ambatonakanga', 'Centre communautaire', -18.9095, 47.5280, 200, 'centre', true, false, false),
('Gymnase Ankorondrano', 'Gymnase municipal', -18.8912, 47.5165, 800, 'gymnase', true, true, true),
('École Primaire Ambohijatovo', 'École avec abri', -18.9145, 47.5300, 150, 'ecole', true, false, false),
('Hôpital HJRA', 'Hôpital avec zone d''accueil', -18.9180, 47.5235, 400, 'hopital', true, true, true),
('Palais des Sports Mahamasina', 'Grand complexe sportif', -18.9200, 47.5210, 3000, 'stade', true, true, true);

-- Insérer des noeuds (intersections)
INSERT INTO nodes (latitude, longitude, name) VALUES
(-18.9100, 47.5250, 'Analakely Centre'),
(-18.9050, 47.5200, 'Ambatonakanga'),
(-18.9000, 47.5180, 'Ankorondrano'),
(-18.8950, 47.5200, 'Alarobia'),
(-18.9150, 47.5270, 'Ambohijatovo'),
(-18.9130, 47.5260, 'Lycée JJ'),
(-18.9200, 47.5220, 'Mahamasina'),
(-18.8900, 47.5170, 'Ivandry');

-- Insérer des routes
INSERT INTO edges (node_from, node_to, distance, road_name, road_type, is_passable) VALUES
(1, 2, 650, 'Avenue de l''Indépendance', 'primary', true),
(2, 3, 800, 'Route Ankorondrano', 'primary', true),
(3, 4, 550, 'Route Alarobia', 'secondary', true),
(1, 5, 600, 'Rue Ambohijatovo', 'secondary', true),
(5, 6, 200, 'Rue Lycée', 'tertiary', true),
(1, 7, 1100, 'Avenue Mahamasina', 'primary', true),
(3, 8, 400, 'Route Ivandry', 'secondary', false),
(2, 6, 900, 'Rue Transversale', 'tertiary', true);

-- Insérer des zones dangereuses
INSERT INTO danger_zones (name, description, latitude, longitude, radius, danger_type, severity) VALUES
('Inondation Analakely', 'Zone basse inondable', -18.9115, 47.5245, 300, 'flood', 4),
('Glissement Ambohijatovo', 'Risque de glissement', -18.9160, 47.5310, 200, 'landslide', 3);

-- Insérer une alerte
INSERT INTO alerts (title, message, alert_type, severity) VALUES
('Cyclone GAMANE approche', 'Un cyclone de catégorie 3 approche Analamanga. Rejoignez les refuges immédiatement.', 'cyclone', 'critical');