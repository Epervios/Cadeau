-- Cadeau : migration additive à exécuter UNE SEULE FOIS sur une copie sauvegardée.
-- Compatible MySQL 5.7+ / MariaDB ; vérifier la variante exacte sur l'hébergeur.
-- Ne pas lancer le schéma complet database.sql sur une base de production existante.
CREATE TABLE IF NOT EXISTS auth_attempts (
    subject_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL PRIMARY KEY,
    attempts SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    window_started BIGINT UNSIGNED NOT NULL,
    blocked_until BIGINT UNSIGNED NOT NULL DEFAULT 0,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_auth_attempts_updated (updated_at)
) ENGINE=InnoDB;
-- IMPORTANT : vérifier en lecture seule l'unicité AVANT toute évolution du schéma existant :
-- SELECT draw_id, receiver_id, COUNT(*) FROM assignments GROUP BY draw_id, receiver_id HAVING COUNT(*) > 1;
-- Si aucune ligne : appliquer dans une fenêtre de maintenance :
-- ALTER TABLE assignments ADD UNIQUE KEY unique_receiver_per_draw (draw_id, receiver_id);
-- Les modifications de suppression en RESTRICT nécessitent une migration explicite des FK,
-- adaptée aux noms effectifs des contraintes du site et après analyse de l'historique.
