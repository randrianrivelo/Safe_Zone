-- ============================================================
-- SMART SAFE ZONE 2035
-- FICHIER : reset.sql
-- DESCRIPTION : Reinitialiser toutes les donnees
-- ATTENTION : Efface toutes les donnees !
-- ============================================================

TRUNCATE TABLE search_history RESTART IDENTITY CASCADE;
TRUNCATE TABLE alerts         RESTART IDENTITY CASCADE;
TRUNCATE TABLE danger_zones   RESTART IDENTITY CASCADE;
TRUNCATE TABLE edges          RESTART IDENTITY CASCADE;
TRUNCATE TABLE nodes          RESTART IDENTITY CASCADE;
TRUNCATE TABLE refuges        RESTART IDENTITY CASCADE;
TRUNCATE TABLE users          RESTART IDENTITY CASCADE;

SELECT 'Base de donnees reinitialisee !' AS message;