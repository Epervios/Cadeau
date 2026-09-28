# Cadeau v3 — Installation Plesk sécurisée

L'application est structurée pour que **seul `php/public/` soit accessible depuis Internet**. Les fichiers de configuration et toute la logique métier restent dans `php/config/` et `php/api/`, **hors DocumentRoot**. Un simple fichier `.htaccess` ne suffit pas à protéger un dossier privé lorsque PHP est exécuté directement par nginx.

## Sous-domaine noel.wizardaring.ch

Dans **Plesk → Sites Web & Domaines → noel.wizardaring.ch** :

1. Connecter le dépôt GitHub public `https://github.com/Epervios/Cadeau.git`, branche `main`.
2. Définir le chemin de déploiement Git `/noel.wizardaring.ch` (dans la racine de l'espace Web Plesk), en **mode manuel** pendant la mise en place.
3. Définir la **racine du document** du sous-domaine dans les Paramètres d'hébergement : `noel.wizardaring.ch/php/public`. Attention : ni `noel.wizardaring.ch` ni `noel.wizardaring.ch/php`.
4. Activer PHP 8.1+ (8.2 ou 8.3 recommandé), PDO MySQL, HTTPS et la redirection HTTP → HTTPS. Un certificat valide doit couvrir le sous-domaine. Avec Cloudflare, utiliser SSL/TLS Full (strict) après validation du certificat côté Plesk.
5. Dans Git Plesk, récupérer les fichiers depuis `main`, puis déclencher un déploiement manuel.

Arborescence attendue :
```text
/noel.wizardaring.ch/              ← dépôt Git complet (répertoire privé parent)
  README.md
  docs/
  php/
    api/                            ← code métier privé, PAS accessible par URL
    config/                         ← configuration MySQL privée
    bin/                            ← création/récupération d'administrateur (CLI)
    includes/                       ← fonctions privées
    migrations/                     ← scripts SQL privés
    database.sql                    ← schéma SQL privé
    public/                         ← racine du document (SEUL répertoire publié)
      index.html
      user.html
      admin.html
      reset.html
      .htaccess
      api/                          ← petites passerelles PHP vers ../../api/
        auth.php
        user.php
        admin.php
      css/
      js/
      assets/
```

Dans les pages, les appels API sont relatifs à `api/` (par exemple `https://noel.wizardaring.ch/api/auth.php?action=csrf`). Les trois passerelles autorisées chargent les fichiers privés via des chemins calculés avec `__DIR__`.

## Test de sécurité OBLIGATOIRE avant le mot de passe SQL

Ouvrir PowerShell sur un autre appareil :

```powershell
$site = "https://noel.wizardaring.ch"
foreach ($path in @(
  "/",
  "/api/auth.php?action=csrf",
  "/config/database.example.php",
  "/includes/functions.php",
  "/database.sql",
  "/migrations/002_password_reset.sql",
  "/bin/bootstrap_admin.php"
)) {
  $code = curl.exe --silent --show-error -o NUL -w "%{http_code}" "$site$path"
  "{0} : HTTP {1}" -f $path, $code
}
```

Résultats attendus : `/` = 200 ; `/api/auth.php?action=csrf` = 200 et réponse JSON contenant `csrf_token` ; **tous les chemins privés = 403 ou 404**. Vérifier que les 403/404 ne sont pas simplement une page Cloudflare bloquant aussi l'API.

Ne **pas** saisir ni exposer le mot de passe SQL tant que ce test n'est pas concluant. En cas de problème, recontrôler le DocumentRoot dans Plesk et le chemin Git ; vérifier également le mode nginx/Apache. Les règles `.htaccess` sous `public/` sont seulement une défense additionnelle.

## Configuration d'une base neuve

Sur Plesk/phpMyAdmin, créer la base `cadeau` et importer **une seule fois** `php/database.sql` dans la base vide. Les cinq tables attendues sont `users`, `draws`, `assignments`, `auth_attempts` et `password_reset_tokens`. Ne pas lancer les migrations sur cette base neuve : leur contenu est déjà inclus dans le schéma complet.

Sur Plesk, dans **le dossier privé** `/noel.wizardaring.ch/php/config/`, copier `database.example.php` vers `database.php`. Ce dernier est ignoré par Git. Conserver `DB_HOST='localhost'`, `DB_NAME='cadeau'`, `DB_USER='cadeau_admin'` si ces valeurs correspondent bien à la base Plesk. Le mot de passe réel doit être saisi **sur Plesk uniquement**, de préférence via une variable d'environnement `CADEAU_DB_PASSWORD`, ou directement dans le fichier privé si l'hébergement n'offre pas de variable d'environnement PHP fiable. Ne jamais le publier dans GitHub ni dans une capture.

Pour créer le premier compte organisateur, exécuter `php/bin/bootstrap_admin.php` **en terminal PHP privé**, avec `ADMIN_EMAIL`, `ADMIN_FIRST_NAME` et un `ADMIN_PASSWORD` long et unique. Si aucun terminal privé n'est disponible dans l'abonnement Plesk, demander au support de l'hébergeur ou utiliser une procédure manuelle hors Web ; **ne jamais mettre ce script dans `public/`**.

## Vérifications avant ouverture aux participants

Lancer les tests automatisés sur GitHub, vérifier en hébergement réel le parcours connexion/CSRF et l'exposition des chemins privés, puis utiliser des comptes de test. Conserver les sauvegardes et la possibilité de restaurer la base. Les invitations SMTP ne sont pas encore implémentées ; la récupération familiale est assistée par un lien créé par l'organisateur.

Pour toute **ancienne** base non vide : sauvegarde et migrations différentielles documentées dans `migrations/`, jamais réimporter `database.sql` par-dessus les données existantes.
