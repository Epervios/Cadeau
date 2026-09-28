<?php
// Secours hors ligne UNIQUEMENT pour le compte organisateur déjà existant.
// Exemple : ADMIN_EMAIL=... ADMIN_PASSWORD=... php bin/reset_admin_password.php
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
$email = strtolower(trim(getenv('ADMIN_EMAIL') ?: ''));
$password = getenv('ADMIN_PASSWORD') ?: '';
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 12 ||
    strlen($password) > 1024) {
    fwrite(STDERR, "ADMIN_EMAIL valide et ADMIN_PASSWORD de 12 à 1024 caractères requis.\n");
    exit(1);
}
require_once __DIR__ . '/../config/database.php';
$pdo = getDBConnection();
$stmt = $pdo->prepare('UPDATE users SET password_hash = ?, auth_version = auth_version + 1
                       WHERE email = ? AND is_admin = 1');
$stmt->execute([password_hash($password, PASSWORD_DEFAULT), $email]);
if ($stmt->rowCount() !== 1) {
    fwrite(STDERR, "Aucun compte organisateur trouvé pour cette adresse.\n");
    exit(1);
}
fwrite(STDOUT, "Mot de passe administrateur mis à jour. Les anciennes sessions sont invalidées.\n");
