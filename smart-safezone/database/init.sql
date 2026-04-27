-- database/init.sql - MySQL Version

-- Créer la base de données
CREATE DATABASE IF NOT EXISTS smart_safezone;
USE smart_safezone;

-- ============================================
-- TABLE : Utilisateurs
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'citizen',
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY idx_email (email)
);

-- ============================================
-- TABLE : Refuges
-- ============================================
CREATE TABLE IF NOT EXISTS refuges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    capacity INT NOT NULL,
    current_occupancy INT DEFAULT 0,
    type VARCHAR(50),
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    has_water BOOLEAN DEFAULT FALSE,
    has_electricity BOOLEAN DEFAULT FALSE,
    has_medical BOOLEAN DEFAULT FALSE,
    contact_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_location (latitude, longitude)
);

-- ============================================
-- TABLE : Noeuds du graphe (intersections)
-- ============================================
CREATE TABLE IF NOT EXISTS nodes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    name VARCHAR(200),
    node_type VARCHAR(50) DEFAULT 'intersection',
    KEY idx_location (latitude, longitude)
);

-- ============================================
-- TABLE : Routes (arêtes du graphe)
-- ============================================
CREATE TABLE IF NOT EXISTS edges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    node_from INT NOT NULL,
    node_to INT NOT NULL,
    distance DECIMAL(10, 2) NOT NULL,
    road_name VARCHAR(200),
    road_type VARCHAR(50),
    is_passable BOOLEAN DEFAULT TRUE,
    danger_level INT DEFAULT 0,
    flood_risk BOOLEAN DEFAULT FALSE,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (node_from) REFERENCES nodes(id) ON DELETE CASCADE,
    FOREIGN KEY (node_to) REFERENCES nodes(id) ON DELETE CASCADE,
    KEY idx_nodes (node_from, node_to)
);

-- ============================================
-- TABLE : Zones dangereuses
-- ============================================
CREATE TABLE IF NOT EXISTS danger_zones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200),
    description TEXT,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    radius DECIMAL(10, 2) NOT NULL,
    danger_type VARCHAR(50),
    severity INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    KEY idx_location (latitude, longitude),
    KEY idx_danger_type (danger_type)
);

-- ============================================
-- TABLE : Alertes
-- ============================================
CREATE TABLE IF NOT EXISTS alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    message TEXT NOT NULL,
    alert_type VARCHAR(50),
    severity VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    KEY idx_alert_type (alert_type),
    KEY idx_severity (severity)
);

-- ============================================
-- TABLE : Historique des recherches
-- ============================================
CREATE TABLE IF NOT EXISTS search_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_latitude DECIMAL(10, 8),
    user_longitude DECIMAL(11, 8),
    refuge_id INT,
    path_distance DECIMAL(10, 2),
    search_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (refuge_id) REFERENCES refuges(id) ON DELETE SET NULL,
    KEY idx_search_time (search_time)
);

