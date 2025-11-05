-- Secret Santa Database Schema
-- Pour hébergement mutualisé PHP/MySQL

CREATE DATABASE IF NOT EXISTS cadeau CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cadeau;

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_admin TINYINT(1) DEFAULT 0,
    is_approved TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_approved (is_approved)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des tirages au sort
CREATE TABLE IF NOT EXISTS draws (
    id INT AUTO_INCREMENT PRIMARY KEY,
    year INT NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_year (year),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_year (year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des attributions
CREATE TABLE IF NOT EXISTS assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    draw_id INT NOT NULL,
    giver_id INT NOT NULL,
    receiver_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (draw_id) REFERENCES draws(id) ON DELETE CASCADE,
    FOREIGN KEY (giver_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_giver_per_draw (draw_id, giver_id),
    INDEX idx_draw (draw_id),
    INDEX idx_giver (giver_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Créer l'utilisateur admin par défaut
-- Mot de passe: x4Q45jUn7Hxq4M (haché avec password_hash)
INSERT INTO users (first_name, email, password_hash, is_admin, is_approved) 
VALUES (
    'Eric',
    'eric.savary@netplus.ch',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    1,
    1
) ON DUPLICATE KEY UPDATE id=id;

-- Note: Le mot de passe haché ci-dessus est un exemple.
-- Vous devrez le régénérer avec le script PHP fourni.