<?php
// Configuration générale de l'application Secret Santa

// Une session ne peut être créée qu'avec des cookies same-site.
if (session_status() === PHP_SESSION_NONE) {
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => $https,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

// Configuration du fuseau horaire
date_default_timezone_set('Europe/Zurich');

// Configuration des erreurs (à désactiver en production)
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Chemin de base de l'application
define('BASE_PATH', dirname(__DIR__));

// Les API sont exclusivement accessibles depuis le même domaine.
// Aucun en-tête CORS wildcard ne doit être émis sur une API à cookies.
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: no-referrer');
header("Content-Security-Policy: default-src 'none'; frame-ancestors 'none'");

// Inclure la connexion à la base de données
require_once BASE_PATH . '/config/database.php';
require_once BASE_PATH . '/includes/functions.php';
?>