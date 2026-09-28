<?php
/** Première création d'administrateur : utilisation CLI uniquement, jamais en HTTP. */
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}
$email = strtolower(trim(getenv('ADMIN_EMAIL') ?: ''));
$password = getenv('ADMIN_PASSWORD') ?: '';
$firstName = trim(getenv('ADMIN_FIRST_NAME') ?: 'Administrateur');
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 12 || $firstName === '') {
    fwrite(STDERR, "Définir ADMIN_EMAIL, ADMIN_PASSWORD (12 caractères minimum), ADMIN_FIRST_NAME facultatif.\n");
    exit(1);
}
require_once __DIR__ . '/../config/database.php';
$pdo = getDBConnection();
$stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
$stmt->execute([$email]);
if ($stmt->fetch()) {
    fwrite(STDERR, "Ce compte existe déjà : le script ne modifie jamais un compte existant.\n");
    exit(1);
}
$stmt = $pdo->prepare('INSERT INTO users (first_name, email, password_hash, is_admin, is_approved) VALUES (?, ?, ?, 1, 1)');
$stmt->execute([$firstName, $email, password_hash($password, PASSWORD_DEFAULT)]);
fwrite(STDOUT, "Compte administrateur créé. Effacez les variables d'initialisation.\n");
