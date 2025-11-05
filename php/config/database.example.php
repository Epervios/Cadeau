<?php
// Configuration de la base de données - EXEMPLE
// Copiez ce fichier en database.php et modifiez les valeurs

define('DB_HOST', 'localhost');
define('DB_NAME', 'cadeau');  // Nom de votre base de données
define('DB_USER', 'cadeau_admin');  // Utilisateur MySQL
define('DB_PASS', 'VOTRE_MOT_DE_PASSE');  // CHANGEZ CETTE VALEUR !
define('DB_CHARSET', 'utf8mb4');

// Connexion à la base de données
function getDBConnection() {
    static $pdo = null;
    
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            error_log("Database connection error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Erreur de connexion à la base de données']);
            exit;
        }
    }
    
    return $pdo;
}
?>
