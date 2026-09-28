<?php
// Fonctions utilitaires pour Secret Santa

// Vérifier si l'utilisateur est connecté
function isLoggedIn() {
    return getSessionUser() !== null;
}

// Vérifier si l'utilisateur est admin
function isAdmin() {
    $user = getSessionUser();
    return $user && (int)$user['is_admin'] === 1;
}

// Vérifier si l'utilisateur est approuvé
function isApproved() {
    $user = getSessionUser();
    return $user && (int)$user['is_approved'] === 1;
}

// Obtenir l'ID de l'utilisateur connecté
function getCurrentUserId() {
    return $_SESSION['user_id'] ?? null;
}

// Ne pas faire confiance aux rôles mis en cache dans la session.
function getSessionUser() {
    if (!isset($_SESSION['user_id'])) return null;
    $user = getUserById($_SESSION['user_id']);
    // Une remise à zéro du mot de passe invalide toutes les anciennes sessions,
    // y compris celles qui n'ont pas encore été fermées sur d'autres appareils.
    if (!$user || !isset($_SESSION['auth_version']) ||
        (int)$_SESSION['auth_version'] !== (int)$user['auth_version']) {
        $_SESSION = [];
        session_regenerate_id(true);
        return null;
    }
    return $user;
}

// Protection CSRF pour toutes les mutations basées sur cookie.
function csrfToken() {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function requireCsrf() {
    $expected = csrfToken();
    $provided = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!is_string($provided) || !hash_equals($expected, $provided)) {
        jsonError('Session expirée ou requête non autorisée. Actualisez la page.', 403);
    }
}

// Retourner une réponse JSON
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

// Retourner une erreur JSON
function jsonError($message, $statusCode = 400) {
    jsonResponse(['error' => $message], $statusCode);
}

// Valider l'email
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

// Rejeter les documents JSON invalides et les requêtes trop volumineuses.
function getJsonInput() {
    $length = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
    if ($length > 16384) {
        jsonError('Requête trop volumineuse', 413);
    }
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    if (!is_array($data) || json_last_error() !== JSON_ERROR_NONE) {
        jsonError('JSON invalide', 400);
    }
    return $data;
}

// Les années doivent rester dans un intervalle défini.
function validYear($value) {
    if (!is_scalar($value) || filter_var((string)$value, FILTER_VALIDATE_INT) === false) {
        jsonError('Année invalide', 400);
    }
    $year = (int)$value;
    if ($year < 2000 || $year > 2100) jsonError('Année invalide', 400);
    return $year;
}

// Hacher le mot de passe
function hashPassword($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

// Vérifier le mot de passe
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

// Obtenir un utilisateur par email
function getUserByEmail($email) {
    $pdo = getDBConnection();
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    return $stmt->fetch();
}

// Obtenir un utilisateur par ID
function getUserById($id) {
    $pdo = getDBConnection();
    $stmt = $pdo->prepare("SELECT id, first_name, email, is_admin, is_approved, auth_version, created_at FROM users WHERE id = ?");
    $stmt->execute([$id]);
    return $stmt->fetch();
}

// Mélange Fisher-Yates avec le générateur cryptographique du système.
function secureShuffle(array $items): array {
    for ($i = count($items) - 1; $i > 0; $i--) {
        $j = random_int(0, $i);
        [$items[$i], $items[$j]] = [$items[$j], $items[$i]];
    }
    return $items;
}

// Échantillonnage uniforme parmi les permutations sans auto-attribution.
// Pas de repli déterministe qui privilégierait artificiellement une rotation.
function createSecretSantaAssignment($userIds) {
    $n = count($userIds);
    if ($n < 2 || count(array_unique($userIds)) !== $n) {
        throw new InvalidArgumentException('Au moins deux participants distincts sont requis.');
    }
    for ($attempt = 0; $attempt < 1024; $attempt++) {
        $receivers = secureShuffle(array_values($userIds));
        $valid = true;
        for ($i = 0; $i < $n; $i++) {
            if ((string)$userIds[$i] === (string)$receivers[$i]) {
                $valid = false;
                break;
            }
        }
        if ($valid) {
            return array_combine(array_values($userIds), $receivers);
        }
    }
    throw new RuntimeException('Le générateur aléatoire ne parvient pas à produire un tirage valide.');
}

// Limitation des essais par combinaison d'adresse et de client HTTP.
// Le hachage évite le stockage direct des IP dans la table auxiliaire.
// Exige la migration 001 avant activation de cette version.
function consumeLoginAttempt(PDO $pdo, string $email, string $ip): array {
    $key = hash('sha256', strtolower($email) . "|" . $ip);
    $now = time();
    $pdo->beginTransaction();
    try {
        $pdo->prepare(
            'INSERT IGNORE INTO auth_attempts (subject_hash, attempts, window_started, blocked_until) VALUES (?, 0, ?, 0)'
        )->execute([$key, $now]);
        $stmt = $pdo->prepare('SELECT attempts, window_started, blocked_until FROM auth_attempts WHERE subject_hash = ? FOR UPDATE');
        $stmt->execute([$key]);
        $row = $stmt->fetch();
        if ($row && (int)$row['blocked_until'] > $now) {
            $pdo->commit();
            return [false, (int)$row['blocked_until'] - $now];
        }
        $count = $row && $now - (int)$row['window_started'] < 900 ? (int)$row['attempts'] : 0;
        $start = $count > 0 ? (int)$row['window_started'] : $now;
        $count++;
        $blockedUntil = $count >= 8 ? $now + 900 : 0;
        $pdo->prepare('UPDATE auth_attempts SET attempts = ?, window_started = ?, blocked_until = ? WHERE subject_hash = ?')
            ->execute([$count, $start, $blockedUntil, $key]);
        $pdo->commit();
        return [true, 0];
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        throw $e;
    }
}

function clearLoginAttempts(PDO $pdo, string $email, string $ip): void {
    $key = hash('sha256', strtolower($email) . "|" . $ip);
    $pdo->prepare('DELETE FROM auth_attempts WHERE subject_hash = ?')->execute([$key]);
}

// Nettoyer les données de sortie pour éviter les failles XSS
function sanitizeOutput($data) {
    if (is_array($data)) {
        return array_map('sanitizeOutput', $data);
    }
    return htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
}

// Exiger l'authentification
function requireAuth() {
    if (!getSessionUser()) {
        jsonError('Non authentifié', 401);
    }
}

// Exiger l'approbation
function requireApproval() {
    requireAuth();
    if (!isApproved()) {
        jsonError('Compte non approuvé', 403);
    }
}

// Exiger les droits admin
function requireAdmin() {
    requireApproval();
    if (!isAdmin()) {
        jsonError('Accès administrateur requis', 403);
    }
}
?>