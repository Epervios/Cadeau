<?php
// Configuration générale de l'application Secret Santa

// Démarrer la session si elle n'est pas déjà démarrée
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Configuration du fuseau horaire
date_default_timezone_set('Europe/Zurich');

// Configuration des erreurs (à désactiver en production)
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Chemin de base de l'application
define('BASE_PATH', dirname(__DIR__));

// URL de base (à adapter selon votre hébergeur)
define('BASE_URL', 'http://localhost/secret-santa');

// Clé secrète pour le hachage (CHANGEZ CETTE VALEUR !)
define('SECRET_KEY', 'changez-cette-cle-secrete-pour-votre-securite');

// Configuration CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Gérer les requêtes OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Inclure la connexion à la base de données
require_once BASE_PATH . '/config/database.php';
require_once BASE_PATH . '/includes/functions.php';
?>