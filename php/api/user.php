<?php
require_once '../config/config.php';

// Vérifier l'authentification
requireAuth();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'GET') {
    
    if ($action === 'assignment') {
        // Obtenir l'attribution de l'utilisateur
        $year = $_GET['year'] ?? date('Y');
        $userId = getCurrentUserId();
        
        $pdo = getDBConnection();
        
        // Vérifier si un tirage existe pour cette année
        $stmt = $pdo->prepare("SELECT id FROM draws WHERE year = ?");
        $stmt->execute([$year]);
        $draw = $stmt->fetch();
        
        if (!$draw) {
            jsonResponse([
                'year' => (int)$year,
                'has_draw' => false,
                'assignment' => null
            ]);
        }
        
        // Obtenir l'attribution de l'utilisateur
        $stmt = $pdo->prepare(
            "SELECT u.first_name 
             FROM assignments a
             JOIN users u ON a.receiver_id = u.id
             WHERE a.draw_id = ? AND a.giver_id = ?"
        );
        $stmt->execute([$draw['id'], $userId]);
        $assignment = $stmt->fetch();
        
        if (!$assignment) {
            jsonResponse([
                'year' => (int)$year,
                'has_draw' => false,
                'assignment' => null
            ]);
        }
        
        jsonResponse([
            'year' => (int)$year,
            'has_draw' => true,
            'assignment' => $assignment['first_name']
        ]);
        
    } elseif ($action === 'draw-status') {
        // Obtenir le statut du tirage
        $year = $_GET['year'] ?? date('Y');
        
        $pdo = getDBConnection();
        $stmt = $pdo->prepare("SELECT id, created_at FROM draws WHERE year = ?");
        $stmt->execute([$year]);
        $draw = $stmt->fetch();
        
        jsonResponse([
            'year' => (int)$year,
            'has_draw' => (bool)$draw,
            'created_at' => $draw['created_at'] ?? null
        ]);
        
    } else {
        jsonError('Action invalide');
    }
    
} else {
    jsonError('Méthode non autorisée', 405);
}
?>