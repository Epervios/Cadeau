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

if ($action === 'reset-password') {
    $rawToken = $input['token'] ?? null;
    $password = $input['password'] ?? null;
    if (!is_string($rawToken) || !preg_match('/\\A[a-f0-9]{64}\\z/D', $rawToken) ||
        !is_string($password) || strlen($password) < 12 || strlen($password) > 1024) {
        jsonError('Le lien ou le nouveau mot de passe est invalide.', 400);
    }
    $hash = hash('sha256', hex2bin($rawToken));
    $pdo = getDBConnection();
    try {
        $pdo->beginTransaction();
        $stmt = $pdo->prepare(
            'SELECT user_id, expires_at FROM password_reset_tokens WHERE token_hash = ? FOR UPDATE'
        );
        $stmt->execute([$hash]);
        $reset = $stmt->fetch();
        if (!$reset || (int)$reset['expires_at'] < time()) {
            $pdo->rollBack();
            jsonError('Ce lien est invalide, a expiré ou a déjà été utilisé. Demandez-en un autre à l’organisateur.', 400);
        }
        $stmt = $pdo->prepare(
            'UPDATE users SET password_hash = ?, auth_version = auth_version + 1 WHERE id = ? AND is_admin = 0'
        );
        $stmt->execute([hashPassword($password), $reset['user_id']]);
        if ($stmt->rowCount() !== 1) {
            $pdo->rollBack();
            jsonError('Ce lien est invalide ou ne peut plus être utilisé.', 400);
        }
        // Jeton à usage unique : suppression dans la même transaction que le changement.
        $pdo->prepare('DELETE FROM password_reset_tokens WHERE user_id = ?')
            ->execute([$reset['user_id']]);
        $pdo->commit();
        $_SESSION = [];
        session_regenerate_id(true);
        jsonResponse(['message' => 'Votre mot de passe a été changé. Vous pouvez vous connecter.']);
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        error_log('Remise à zéro du mot de passe indisponible : ' . $e->getCode());
        jsonError('La réinitialisation est momentanément indisponible.', 500);
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
    $_SESSION['auth_version'] = (int)$user['auth_version'];
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
