<?php
require_once '../config/config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    requireCsrf();
    $input = getJsonInput();
    $action = $_GET['action'] ?? '';
    
    if ($action === 'register') {
        // Inscription
        $firstName = trim($input['first_name'] ?? '');
        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';
        
        // Validation
        if (empty($firstName) || empty($email) || empty($password)) {
            jsonError('Tous les champs sont requis');
        }
        
        if (!validateEmail($email)) {
            jsonError('Email invalide');
        }
        
        if (strlen($password) < 6) {
            jsonError('Le mot de passe doit contenir au moins 6 caractères');
        }
        
        // Vérifier si l'email existe déjà
        if (getUserByEmail($email)) {
            jsonError('Cet email est déjà utilisé');
        }
        
        // Créer l'utilisateur
        $pdo = getDBConnection();
        $stmt = $pdo->prepare(
            "INSERT INTO users (first_name, email, password_hash, is_admin, is_approved) 
             VALUES (?, ?, ?, 0, 0)"
        );
        
        try {
            $stmt->execute([$firstName, $email, hashPassword($password)]);
            $userId = $pdo->lastInsertId();
            
            jsonResponse([
                'message' => 'Inscription réussie. En attente de validation par l\'administrateur.',
                'user_id' => $userId
            ], 201);
        } catch (PDOException $e) {
            error_log("Registration error: " . $e->getMessage());
            jsonError('Erreur lors de l\'inscription', 500);
        }
        
    } elseif ($action === 'login') {
        // Connexion
        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';
        
        if (empty($email) || empty($password)) {
            jsonError('Email et mot de passe requis');
        }
        
        $user = getUserByEmail($email);
        
        if (!$user || !verifyPassword($password, $user['password_hash'])) {
            jsonError('Identifiants invalides', 401);
        }
        
        // Prévenir la fixation de session après authentification.
        session_regenerate_id(true);
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['first_name'] = $user['first_name'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['is_admin'] = $user['is_admin'];
        $_SESSION['is_approved'] = $user['is_approved'];
        
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
        
    } elseif ($action === 'logout') {
        // Déconnexion
        $_SESSION = [];
        session_destroy();
        jsonResponse(['message' => 'Déconnexion réussie']);
        
    } else {
        jsonError('Action invalide', 400);
    }
    
} elseif ($method === 'GET') {
    if (($_GET['action'] ?? '') === 'csrf') {
        jsonResponse(['csrf_token' => csrfToken()]);
    }
    // Vérifier le statut de connexion
    if (isLoggedIn()) {
        $user = getUserById(getCurrentUserId());
        jsonResponse([
            'logged_in' => true,
            'user' => $user
        ]);
    } else {
        jsonResponse(['logged_in' => false]);
    }
    
} else {
    jsonError('Méthode non autorisée', 405);
}
?>