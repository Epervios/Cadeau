<?php
require_once '../config/config.php';

// Vérifier les droits admin
requireAdmin();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'GET') {
    
    if ($action === 'pending-users') {
        // Obtenir les utilisateurs en attente
        $pdo = getDBConnection();
        $stmt = $pdo->query(
            "SELECT id, first_name, email, is_admin, is_approved, created_at 
             FROM users 
             WHERE is_approved = 0 
             ORDER BY created_at DESC"
        );
        $users = $stmt->fetchAll();
        
        jsonResponse($users);
        
    } elseif ($action === 'users') {
        // Obtenir tous les utilisateurs
        $pdo = getDBConnection();
        $stmt = $pdo->query(
            "SELECT id, first_name, email, is_admin, is_approved, created_at 
             FROM users 
             ORDER BY created_at DESC"
        );
        $users = $stmt->fetchAll();
        
        jsonResponse($users);
        
    } else {
        jsonError('Action invalide');
    }
    
} elseif ($method === 'POST') {
    requireCsrf();
    
    if ($action === 'approve-user') {
        // Approuver un utilisateur
        $userId = $_GET['user_id'] ?? null;
        
        if (!$userId) {
            jsonError('ID utilisateur requis');
        }
        
        $pdo = getDBConnection();
        $stmt = $pdo->prepare("UPDATE users SET is_approved = 1 WHERE id = ?");
        $stmt->execute([$userId]);
        
        if ($stmt->rowCount() > 0) {
            jsonResponse(['message' => 'Utilisateur approuvé']);
        } else {
            jsonError('Utilisateur non trouvé', 404);
        }
        
    } elseif ($action === 'reject-user') {
        // Rejeter (supprimer) un utilisateur
        $userId = $_GET['user_id'] ?? null;
        
        if (!$userId) {
            jsonError('ID utilisateur requis');
        }
        
        $pdo = getDBConnection();
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ? AND is_admin = 0 AND is_approved = 0");
        $stmt->execute([$userId]);
        
        if ($stmt->rowCount() > 0) {
            jsonResponse(['message' => 'Utilisateur supprimé']);
        } else {
            jsonError('Seule une inscription en attente peut être rejetée ; les participants existants ne sont pas supprimés', 404);
        }
        
    } elseif ($action === 'delete-draw') {
        // Supprimer un tirage pour permettre de le relancer
        $input = getJsonInput();
        $year = $input['year'] ?? date('Y');
        
        $pdo = getDBConnection();
        
        try {
            $pdo->beginTransaction();
            
            // Récupérer l'ID du tirage
            $stmt = $pdo->prepare("SELECT id FROM draws WHERE year = ?");
            $stmt->execute([$year]);
            $draw = $stmt->fetch();
            
            if (!$draw) {
                $pdo->rollBack();
                jsonError("Aucun tirage trouvé pour l'année $year", 404);
            }
            
            // Supprimer les attributions liées
            $stmt = $pdo->prepare("DELETE FROM assignments WHERE draw_id = ?");
            $stmt->execute([$draw['id']]);
            
            // Supprimer le tirage
            $stmt = $pdo->prepare("DELETE FROM draws WHERE id = ?");
            $stmt->execute([$draw['id']]);
            
            $pdo->commit();
            
            jsonResponse([
                'message' => "Tirage de l'année $year supprimé avec succès",
                'year' => $year
            ]);
            
        } catch (PDOException $e) {
            $pdo->rollBack();
            error_log("Delete draw error: " . $e->getMessage());
            jsonError('Erreur lors de la suppression du tirage', 500);
        }
        
    } elseif ($action === 'create-draw') {
        // Créer un tirage au sort
        $input = getJsonInput();
        $year = $input['year'] ?? date('Y');
        
        $pdo = getDBConnection();
        
        // Vérifier si un tirage existe déjà pour cette année
        $stmt = $pdo->prepare("SELECT id FROM draws WHERE year = ?");
        $stmt->execute([$year]);
        if ($stmt->fetch()) {
            jsonError("Un tirage existe déjà pour l'année $year. Supprimez-le d'abord si vous voulez le relancer.");
        }
        
        // Obtenir tous les utilisateurs approuvés
        $stmt = $pdo->query("SELECT id FROM users WHERE is_approved = 1");
        $users = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        if (count($users) < 2) {
            jsonError('Au moins 2 participants approuvés sont nécessaires');
        }
        
        // Créer les attributions
        $assignments = createSecretSantaAssignment($users);
        
        if (!$assignments) {
            jsonError('Impossible de créer le tirage', 500);
        }
        
        try {
            $pdo->beginTransaction();
            
            // Créer le tirage
            $stmt = $pdo->prepare("INSERT INTO draws (year, created_by) VALUES (?, ?)");
            $stmt->execute([$year, getCurrentUserId()]);
            $drawId = $pdo->lastInsertId();
            
            // Insérer les attributions
            $stmt = $pdo->prepare(
                "INSERT INTO assignments (draw_id, giver_id, receiver_id) VALUES (?, ?, ?)"
            );
            
            foreach ($assignments as $giverId => $receiverId) {
                $stmt->execute([$drawId, $giverId, $receiverId]);
            }
            
            $pdo->commit();
            
            jsonResponse([
                'message' => "Tirage créé pour l'année $year",
                'participants' => count($users)
            ]);
            
        } catch (PDOException $e) {
            $pdo->rollBack();
            error_log("Draw creation error: " . $e->getMessage());
            jsonError('Erreur lors de la création du tirage', 500);
        }
        
    } else {
        jsonError('Action invalide');
    }
    
} else {
    jsonError('Méthode non autorisée', 405);
}
?>