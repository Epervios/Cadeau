# Cadeau v3 — Installation PHP/MySQL

## Préparer l'hébergement

PHP 8.1+ avec PDO MySQL, sessions et JSON, Apache avec `mod_rewrite`, prise en charge du fichier `.htaccess`, base MySQL/MariaDB et **HTTPS obligatoire en production**. L'hébergeur doit permettre la conservation d'une configuration de base de données hors du dépôt et l'exécution privée d'un script PHP CLI pour initialiser l'organisateur.

**Arborescence actuelle :** le dossier `php/` est la racine de l'application côté Apache. Son `.htaccess` autorise les pages sous `/public/` et les trois routes `/api/`, et interdit l'accès web à `/config/`, `/includes/`, `/bin/`, `/migrations/` et au reste des fichiers. **Ne pas définir seulement `php/public/` comme DocumentRoot sans adapter le routage API : les pages appellent `../api/`.**

Tester depuis un accès extérieur que les fichiers privés donnent 403 ou 404 ; ne pas se fier uniquement à l'existence du `.htaccess` si l'hébergeur ignore `AllowOverride`.

## Nouvelle installation (base vide)

1. Créer une base MySQL/MariaDB vide ; importer `php/database.sql` dans cette base via phpMyAdmin ou un client SQL.
2. Copier `php/config/database.example.php` en `php/config/database.php` **sur l'hébergement seulement**. Ajuster les constantes de connexion. Fournir le secret SQL via la variable d'environnement `CADEAU_DB_PASSWORD` lorsque disponible. Le fichier `database.php` est ignoré par Git.
3. Créer le premier compte administrateur depuis un **terminal privé** de la machine où la base est accessible, à l'aide d'un mot de passe long et unique :

   ```sh
   ADMIN_EMAIL="adresse-administrateur@example.org" \
   ADMIN_FIRST_NAME="Organisateur" \
   ADMIN_PASSWORD="<mot-de-passe-personnel-de-12-caractères-minimum>" \
   php php/bin/bootstrap_admin.php
   ```

   Ne jamais utiliser littéralement le mot de passe d'exemple. Ne pas exposer `php/bin/` par HTTP. Selon le répertoire courant, adapter les chemins.
4. Activer HTTPS/redirection et vérifier les restrictions Apache, puis tester la connexion, l'inscription, le tirage et la récupération d'accès avec des **comptes fictifs**.

## Mettre à jour une ancienne base

Ne **pas** importer `php/database.sql` sur une base contenant des personnes et des tirages. Sauvegarder les fichiers et la base, puis **tester la restauration** sur une copie isolée. Vérifier les colonnes, index et contraintes réelles de la base ; les versions historiques peuvent différer du schéma initial.

Sur la copie seulement, appliquer dans cet ordre les migrations manquantes :

1. `php/migrations/001_auth_attempts.sql` : limitation des tentatives de connexion.
2. `php/migrations/002_password_reset.sql` : jetons de récupération et révocation des anciennes sessions.

Chaque migration doit être appliquée au plus une fois. Vérifier également l'unicité des destinataires et les clés étrangères historiques avant toute modification structurelle. Les sessions ouvertes avant la migration de récupération devront se reconnecter.

En cas de perte d'accès à l'organisateur, `php/bin/reset_admin_password.php` permet de changer son mot de passe **en CLI uniquement**, avec `ADMIN_EMAIL` et `ADMIN_PASSWORD` dans l'environnement (migration 002 préalable).

## Réception

Tester avec plusieurs comptes : inscription, approbation, accès refusé avant approbation, tirage sans auto-attribution, conservation d'une attribution après rechargement, impossibilité de doubler le tirage, envoi privé d'un lien de récupération et expiration de celui-ci.

Voir le [guide complet de sécurité et de mise en production](../docs/DEPLOIEMENT_SECURISÉ.md). Il reste impératif de remplacer sur le véritable hébergement tout identifiant anciennement publié.
