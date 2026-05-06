-- ============================================================
-- SMART SAFE ZONE 2035
-- FICHIER : init.sql
-- DESCRIPTION : Creation de toutes les tables
-- TECHNOLOGIE : PostgreSQL
-- ============================================================

-- Supprimer les tables si elles existent deja
DROP TABLE IF EXISTS search_history CASCADE;
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS danger_zones CASCADE;
DROP TABLE IF EXISTS edges CASCADE;
DROP TABLE IF EXISTS nodes CASCADE;
DROP TABLE IF EXISTS refuges CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================
-- TABLE 1 : USERS
-- ============================================================
CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    username      VARCHAR(100)  NOT NULL,
    email         VARCHAR(150)  NOT NULL UNIQUE,
    password_hash VARCHAR(255)  NOT NULL,
    role          VARCHAR(20)   NOT NULL DEFAULT 'citizen',
    phone         VARCHAR(20),
    created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE 2 : REFUGES
-- ============================================================
CREATE TABLE refuges (
    id                SERIAL PRIMARY KEY,
    name              VARCHAR(200)     NOT NULL,
    description       TEXT,
    latitude          DOUBLE PRECISION NOT NULL,
    longitude         DOUBLE PRECISION NOT NULL,
    capacity          INTEGER          NOT NULL,
    current_occupancy INTEGER          NOT NULL DEFAULT 0,
    type              VARCHAR(50),
    address           TEXT,
    is_active         BOOLEAN          NOT NULL DEFAULT TRUE,
    has_water         BOOLEAN          NOT NULL DEFAULT FALSE,
    has_electricity   BOOLEAN          NOT NULL DEFAULT FALSE,
    has_medical       BOOLEAN          NOT NULL DEFAULT FALSE,
    contact_phone     VARCHAR(20),
    created_at        TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP        DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE 3 : NODES (Intersections du graphe routier)
-- ============================================================
CREATE TABLE nodes (
    id        SERIAL PRIMARY KEY,
    latitude  DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    name      VARCHAR(200),
    node_type VARCHAR(50) NOT NULL DEFAULT 'intersection'
);

-- ============================================================
-- TABLE 4 : EDGES (Routes du graphe)
-- ============================================================
CREATE TABLE edges (
    id           SERIAL PRIMARY KEY,
    node_from    INTEGER          NOT NULL REFERENCES nodes(id),
    node_to      INTEGER          NOT NULL REFERENCES nodes(id),
    distance     DOUBLE PRECISION NOT NULL,
    road_name    VARCHAR(200),
    road_type    VARCHAR(50),
    is_passable  BOOLEAN          NOT NULL DEFAULT TRUE,
    danger_level INTEGER          NOT NULL DEFAULT 0,
    flood_risk   BOOLEAN          NOT NULL DEFAULT FALSE,
    last_updated TIMESTAMP        DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE 5 : DANGER ZONES
-- ============================================================
CREATE TABLE danger_zones (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(200)     NOT NULL,
    description TEXT,
    latitude    DOUBLE PRECISION NOT NULL,
    longitude   DOUBLE PRECISION NOT NULL,
    radius      DOUBLE PRECISION NOT NULL,
    danger_type VARCHAR(50),
    severity    INTEGER          NOT NULL DEFAULT 1,
    is_active   BOOLEAN          NOT NULL DEFAULT TRUE,
    reported_at TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
    expires_at  TIMESTAMP
);

-- ============================================================
-- TABLE 6 : ALERTS
-- ============================================================
CREATE TABLE alerts (
    id         SERIAL PRIMARY KEY,
    title      VARCHAR(300) NOT NULL,
    message    TEXT         NOT NULL,
    alert_type VARCHAR(50),
    severity   VARCHAR(20)  NOT NULL DEFAULT 'info',
    is_active  BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- ============================================================
-- TABLE 7 : SEARCH HISTORY
-- ============================================================
CREATE TABLE search_history (
    id             SERIAL PRIMARY KEY,
    user_latitude  DOUBLE PRECISION,
    user_longitude DOUBLE PRECISION,
    refuge_id      INTEGER REFERENCES refuges(id),
    path_distance  DOUBLE PRECISION,
    algorithm_used VARCHAR(20) DEFAULT 'astar',
    search_time    TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
);

-- Confirmation
SELECT 'Tables creees avec succes !' AS message;