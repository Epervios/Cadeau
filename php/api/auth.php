<?php
require_once __DIR__ . '/../config/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'GET') {
    if ($action === 'csrf') {
        jsonResponse(['csrf_token' => csrfToken()]);
    }
    if ($action === 'me' || $action === '') {
        $user = getSessionUser();
        jsonResponse(['logged_in' => (bool)$user, 'user' => $user]);
    }
    jsonError('Action inconnue', 404);
}

if ($method !== 'POST') jsonError('Méthode non autorisée', 405);
requireCsrf();
$input = getJsonInput();

if ($action === 'register') {
    $firstName = trim((string)($input['first_name'] ?? ''));
    $email = strtolower(trim((string)($input['email'] ?? '')));
    $password = (string)($input['password'] ?? '');
    if ($firstName === '' || strlen($firstName) > 100 || !validateEmail($email)) {
        jsonError('Prénom ou adresse email invalide', 400);
    }
    if (strlen($password) < 12 || strlen($password) > 1024) {
        jsonError('Utilisez un mot de passe de 12 caractères minimum', 400);
    }
    $pdo = getDBConnection();
    if (getUserByEmail($email)) jsonError('Cette adresse possède déjà un compte', 409);
    try {
        $stmt = $pdo->prepare(
            'INSERT INTO users (first_name, email, password_hash, is_admin, is_approved) VALUES (?, ?, ?, 0, 0)'
        );
        $stmt->execute([$firstName, $email, hashPassword($password)]);
        jsonResponse(['message' => 'Inscription enregistrée, en attente de validation'], 201);
    } catch (PDOException $e) {
        if (($e->errorInfo[1] ?? null) == 1062) jsonError('Cette adresse possède déjà un compte', 409);
        error_log('Erreur lors de l’inscription : ' . $e->getCode());
        jsonError('Inscription momentanément indisponible', 500);
    }
}

if ($action === 'login') {
    $email = strtolower(trim((string)($input['email'] ?? '')));
    $password = (string)($input['password'] ?? '');
    if (!validateEmail($email) || $password === '') jsonError('Identifiants invalides', 401);
    $pdo = getDBConnection();
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';
    [$allowed, $retryAfter] = consumeLoginAttempt($pdo, $email, $ip);
    if (!$allowed) {
        header('Retry-After: ' . max(1, $retryAfter));
        jsonError('Trop de tentatives. Réessayez dans quelques minutes.', 429);
    }
    $user = getUserByEmail($email);
    if (!$user || !verifyPassword($password, $user['password_hash'])) {
        jsonError('Identifiants invalides', 401);
    }
    clearLoginAttempts($pdo, $email, $ip);
    session_regenerate_id(true);
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    jsonResponse([
        'message' => 'Connexion réussie',
        'user' => [
            'id' => $user['id'],
            'first_name' => $user['first_name'],
            'email' => $user['email'],
            'is_admin' => (bool)$user['is_admin'],
            'is_approved' => (bool)$user['is_approved']
        ]
    ]);
}

if ($action === 'logout') {
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', [
            'expires' => time() - 3600,
            'path' => $params['path'], 'domain' => $params['domain'],
            'secure' => $params['secure'], 'httponly' => $params['httponly'],
            'samesite' => $params['samesite'] ?? 'Lax'
        ]);
    }
    session_destroy();
    jsonResponse(['message' => 'Déconnexion réussie']);
}

jsonError('Action inconnue', 404);
