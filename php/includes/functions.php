<?php
// Fonctions utilitaires pour Secret Santa

// Vérifier si l'utilisateur est connecté
function isLoggedIn() {
    return isset($_SESSION['user_id']);
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
    return getUserById($_SESSION['user_id']) ?: null;
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

// Obtenir les données POST en JSON
function getJsonInput() {
    $json = file_get_contents('php://input');
    return json_decode($json, true) ?? [];
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
    $stmt = $pdo->prepare("SELECT id, first_name, email, is_admin, is_approved, created_at FROM users WHERE id = ?");
    $stmt->execute([$id]);
    return $stmt->fetch();
}

// Algorithme de tirage au sort Secret Santa
function createSecretSantaAssignment($userIds) {
    $n = count($userIds);
    if ($n < 2) {
        return false;
    }
    
    // Essayer de créer une permutation valide (sans auto-attribution)
    $maxAttempts = 1000;
    for ($attempt = 0; $attempt < $maxAttempts; $attempt++) {
        $receivers = $userIds;
        shuffle($receivers);
        
        // Vérifier qu'aucun utilisateur ne se tire lui-même
        $valid = true;
        for ($i = 0; $i < $n; $i++) {
            if ($userIds[$i] == $receivers[$i]) {
                $valid = false;
                break;
            }
        }
        
        if ($valid) {
            // Créer un tableau associatif giver => receiver
            $assignments = [];
            for ($i = 0; $i < $n; $i++) {
                $assignments[$userIds[$i]] = $receivers[$i];
            }
            return $assignments;
        }
    }
    
    // Si le random ne fonctionne pas, utiliser une rotation simple
    $receivers = $userIds;
    $first = array_shift($receivers);
    $receivers[] = $first;
    
    $assignments = [];
    for ($i = 0; $i < $n; $i++) {
        $assignments[$userIds[$i]] = $receivers[$i];
    }
    
    return $assignments;
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