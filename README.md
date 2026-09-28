# Cadeau — Secret Santa familial

Application de tirage au sort privé : inscription, validation des participants, tirage annuel et révélation individuelle. Interface en français.

## Quelle implémentation utiliser ?

- **`php/` : PHP + MySQL**, adaptée à un hébergement mutualisé. C'est la version visée pour la simplification progressive. Ne pas déployer les deux implémentations en parallèle sur la même instance.
- **`backend/` et `frontend/` : FastAPI + MongoDB + React**, prototype alternatif. Il ne partage ni données ni sessions avec PHP.

Le dossier PHP conserve les données existantes dans MySQL ; aucune migration ou remise à zéro n'est autorisée sans sauvegarde et contrôle du propriétaire.

## Sécurité préalable à tout déploiement

Les premières versions de ce dépôt public exposaient des identifiants. **Si vous les avez utilisés, révoquez ou remplacez immédiatement les accès MySQL et administrateur, ainsi que tout secret réutilisé**, puis contrôlez les journaux d'accès. Les secrets retirés des fichiers actuels restent dans l'historique Git ; les considérer comme compromis.

- Ne commitez jamais `php/config/database.php`, `backend/.env` ou une sauvegarde MySQL.
- Ne publiez jamais d'outil de génération de mot de passe ou de diagnostic SQL dans le répertoire servi par Apache.
- Activer HTTPS et des sauvegardes contrôlées, avec un test de restauration.
- Ne pas utiliser un compte administrateur avec mot de passe prédéfini.

## Installer la version PHP

Voir [php/README_INSTALLATION.md](php/README_INSTALLATION.md). Préparer la base via [php/database.sql](php/database.sql), copier `php/config/database.example.php` vers `php/config/database.php` **sur la machine de déploiement** puis créer un administrateur avec `php/bin/bootstrap_admin.php` depuis un terminal PHP local ou hébergeur. Ne pas commiter les identifiants ni le fichier généré.

## Installer la version alternative FastAPI

Exiger `MONGO_URL`, `DB_NAME` et un `JWT_SECRET` aléatoire d'au moins 32 caractères. Pour initialiser un administrateur, définir ponctuellement `ADMIN_EMAIL`, `ADMIN_PASSWORD` (au moins 12 caractères) et, facultativement, `ADMIN_FIRST_NAME`. Un administrateur existant n'est pas réinitialisé. Supprimer les variables d'initialisation après usage. Cette version nécessite une revue distincte avant toute mise en production.

## Développement

La branche d'audit `audit/security-and-simplification` introduit un premier socle de sécurité et documente les limitations de l'existant. Elle ne vaut **pas** validation d'un déploiement en production. La feuille de route est dans [docs/REFONTE.md](docs/REFONTE.md).

## Aider un parent qui a oublié son mot de passe

**Nouveauté Cadeau v3 :** l'organisateur peut ouvrir `Organiser → Participants` puis cliquer sur **Aider à retrouver son mot de passe**. Après confirmation, il obtient un lien privé à transmettre par messagerie ou directement sur l'appareil du parent. Le lien reste valable 30 minutes et ne fonctionne qu'une seule fois. Le parent définit lui-même un nouveau mot de passe ; toutes ses anciennes sessions sont déconnectées. Aucun service SMTP n'est nécessaire. Les comptes organisateurs se récupèrent depuis le terminal privé via `php/bin/reset_admin_password.php`.

Pour une base **déjà existante**, appliquer `php/migrations/001_auth_attempts.sql` puis `php/migrations/002_password_reset.sql` sur une copie restaurable avant de mettre à jour l'application. Pour une base neuve, utiliser le schéma `php/database.sql`.

**Ne pas confondre suppression des fichiers et purge de l'historique Git :** les secrets anciennement publiés doivent être tournés sur l'hébergement, puis purgés de l'historique avec une opération dédiée et coordonnée. Supprimer la branche `main` sans réécrire l'historique de la nouvelle branche ne protège pas les anciens secrets.
