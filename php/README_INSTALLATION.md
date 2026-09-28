# Installation sécurisée — PHP/MySQL

## Prérequis

- PHP 8.1+ recommandé, extensions PDO MySQL, sessions et JSON.
- MySQL/MariaDB avec un compte applicatif aux droits minimaux.
- Hébergement Apache sous HTTPS, accès FTP et phpMyAdmin ; accès PHP CLI requis pour le script d'initialisation proposé.

## Avant de commencer

Les anciennes versions ont publié des identifiants. Si ces comptes ont été utilisés sur une installation réelle, remplacez leurs mots de passe **avant** le déploiement, contrôlez les accès, et conservez une sauvegarde hors du dossier public. Ne copiez pas l'ancienne configuration depuis Git.

## Mise en place

1. Créez une base vide sur l'hébergement ; sélectionnez-la dans phpMyAdmin et importez \`database.sql\`.
2. Copiez \`config/database.example.php\` en \`config/database.php\` uniquement sur l'hébergement et renseignez la connexion SQL. Le fichier est ignoré par Git.
3. Servez seulement le dossier \`public/\`. Les dossiers \`config/\`, \`includes/\`, \`bin/\` et le schéma SQL doivent rester **hors de la racine web**. Les scripts API doivent être routés vers \`api/\` depuis le même domaine ; selon l'hébergeur, prévoir un alias sécurisé vers ce dossier.
4. Pour une **première installation**, exécutez depuis un terminal non exposé (les valeurs sont fournies par l'environnement, jamais écrites dans le dépôt) :

   \`\`\`sh
   ADMIN_EMAIL="admin@example.org" ADMIN_FIRST_NAME="Admin" ADMIN_PASSWORD="mot-de-passe-long-et-unique" php bin/bootstrap_admin.php
   \`\`\`

   Le mot de passe indiqué ci-dessus est une illustration et ne doit jamais être utilisé tel quel. Si votre hébergeur ne propose pas PHP CLI, exécutez le script sur un environnement de maintenance privé connecté de façon sécurisée à la base, ou générez localement le hash et insérez l'admin via phpMyAdmin ; n'exposez pas le script via HTTP.
5. Vérifiez la connexion, l'inscription, l'approbation et le tirage sur une **base de test**, puis activez les sauvegardes périodiques et testez une restauration.

## Exploitation

Le tirage courant est lié à l'année civile. Il doit contenir chaque participant approuvé exactement une fois, jamais lui-même. Un redémarrage ou rechargement de page ne doit pas modifier les attributions. Une suppression de tirage efface les affectations de l'année et nécessite une confirmation expresse. Sauvegardez la base avant l'opération.

La version PHP existante nécessite encore des tests d'intégration sous MySQL et une revue de déploiement HTTPS avant publication. Voir [../docs/REFONTE.md](../docs/REFONTE.md).
