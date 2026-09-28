-- À exécuter UNE FOIS sur une copie sauvegardée avant déploiement.
-- MySQL/MariaDB : vérifier auparavant si la colonne auth_version existe déjà.
-- Ne pas appliquer automatiquement sur une base réelle.
ALTER TABLE users ADD COLUMN auth_version INT UNSIGNED NOT NULL DEFAULT 0;
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    user_id INT NOT NULL PRIMARY KEY,
    token_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    expires_at BIGINT UNSIGNED NOT NULL,
    issued_by INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_password_reset_token (token_hash),
    CONSTRAINT fk_reset_target FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_reset_issuer FOREIGN KEY (issued_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;
