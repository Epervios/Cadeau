# Cadeau — Secret Santa familial

Application de tirage au sort privé : inscription, validation des participants, tirage annuel et révélation individuelle. Interface en français.

## Quelle implémentation utiliser ?

- **\`php/\` : PHP + MySQL**, adaptée à un hébergement mutualisé. C'est la version visée pour la simplification progressive. Ne pas déployer les deux implémentations en parallèle sur la même instance.
- **\`backend/\` et \`frontend/\` : FastAPI + MongoDB + React**, prototype alternatif. Il ne partage ni données ni sessions avec PHP.

Le dossier PHP conserve les données existantes dans MySQL ; aucune migration ou remise à zéro n'est autorisée sans sauvegarde et contrôle du propriétaire.

## Sécurité préalable à tout déploiement

Les premières versions de ce dépôt public exposaient des identifiants. **Si vous les avez utilisés, révoquez ou remplacez immédiatement les accès MySQL et administrateur, ainsi que tout secret réutilisé**, puis contrôlez les journaux d'accès. Les secrets retirés des fichiers actuels restent dans l'historique Git ; les considérer comme compromis.

- Ne commitez jamais \`php/config/database.php\`, \`backend/.env\` ou une sauvegarde MySQL.
- Ne publiez jamais d'outil de génération de mot de passe ou de diagnostic SQL dans le répertoire servi par Apache.
- Activer HTTPS et des sauvegardes contrôlées, avec un test de restauration.
- Ne pas utiliser un compte administrateur avec mot de passe prédéfini.

## Installer la version PHP

Voir [php/README_INSTALLATION.md](php/README_INSTALLATION.md). Préparer la base via [php/database.sql](php/database.sql), copier \`php/config/database.example.php\` vers \`php/config/database.php\` **sur la machine de déploiement** puis créer un administrateur avec \`php/bin/bootstrap_admin.php\` depuis un terminal PHP local ou hébergeur. Ne pas commiter les identifiants ni le fichier généré.

## Installer la version alternative FastAPI

Exiger \`MONGO_URL\`, \`DB_NAME\` et un \`JWT_SECRET\` aléatoire d'au moins 32 caractères. Pour initialiser un administrateur, définir ponctuellement \`ADMIN_EMAIL\`, \`ADMIN_PASSWORD\` (au moins 12 caractères) et, facultativement, \`ADMIN_FIRST_NAME\`. Un administrateur existant n'est pas réinitialisé. Supprimer les variables d'initialisation après usage. Cette version nécessite une revue distincte avant toute mise en production.

## Développement

La branche d'audit \`audit/security-and-simplification\` introduit un premier socle de sécurité et documente les limitations de l'existant. Elle ne vaut **pas** validation d'un déploiement en production. La feuille de route est dans [docs/REFONTE.md](docs/REFONTE.md).
