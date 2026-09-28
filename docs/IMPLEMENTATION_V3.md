# Cadeau v3 — Périmètre fonctionnel et réception

**Application active :** `php/` en PHP/MySQL, avec trois pages principales et une page de récupération d'accès. Les deux anciennes implémentations indépendantes ne sont plus maintenues. La [maquette Noël validée](maquette-noel.html) est conservée uniquement pour servir de référence visuelle, **sans compte, API ni tirage réels**.

## Où intervenir ?

- `php/public/index.html`, `js/app.js` : accueil enneigé, inscription, connexion, attente d'approbation et aide « J'ai oublié mon mot de passe ».
- `php/public/user.html`, `js/user.js` : état du tirage et enveloppe privée. Le prénom du destinataire est demandé à l'API **uniquement au clic**, puis supprimé de la page quand l'enveloppe est refermée.
- `php/public/admin.html`, `js/admin.js` : gestion des participants et du tirage en trois étapes, assistance familiale avec lien privé de récupération et confirmation explicite avant les opérations importantes.
- `php/public/reset.html`, `js/reset.js` : choix par le participant d'un nouveau mot de passe à partir d'un lien privé à usage unique.
- `php/public/css/style.css`, `assets/christmas-village.svg` : identité visuelle de Noël, sans polices ni ressources graphiques distantes.
- `php/public/js/common.js` : accès à `api/` dans la racine publique, même origine avec CSRF, messages d'erreur lisibles et réglage A+ conservé sur l'appareil.
- `php/api/auth.php`, `admin.php`, `user.php` : contrôle côté serveur de chaque permission, tirage et récupération. Ne pas déduire des droits à partir de l'interface seule.
- `php/database.sql` et `php/migrations/` : création neuve et évolutions d'une base existante. Ne jamais mélanger ces procédures.

## Règles métier

Chaque participant **approuvé** reçoit exactement un destinataire différent de lui-même. L'organisateur approuvé participe actuellement au tirage. Une liste comportant des inscriptions en attente bloque la création du tirage. Une fois publié, celui-ci reste identique au rechargement ; une réinitialisation doit être confirmée, puis les personnes concernées prévenues.

La récupération familiale ne requiert pas de SMTP : l'organisateur génère le lien et le transmet personnellement. Le lien est valable 30 minutes, révocable par création d'un nouveau lien, stocké uniquement sous forme de hash et à usage unique. Après succès, toutes les anciennes sessions du participant sont invalidées. Les comptes organisateurs utilisent une procédure privée en ligne de commande.

**Non implémenté :** e-mails automatiques, invitation à usage unique à l'inscription, récupération autonome par e-mail, exclusions couples/foyers, notifications push. Ne pas présenter la maquette comme une fonctionnalité de production.

## Tests et acceptation

La CI sous `.github/workflows/php-check.yml` vérifie :

1. Syntaxe PHP, JavaScript et Bash et absence de configuration locale sensible suivie.
2. Invariants cryptographiques du tirage (aucun doublon ni auto-attribution), structure des quatre pages, accessibilité de base et absence de destinataire fictif dans l'HTML de production.
3. Base MariaDB temporaire et parcours HTTP : inscription, permissions, approbation, protection CSRF, tirage unique, confidentialité, stabilité, demande tardive, réinitialisation et déconnexion.
4. Récupération familiale : droits, jeton aléatoire hashé, rotation et expiration, refus d'une réutilisation, rejet de l'ancien mot de passe et invalidation des anciennes sessions.

**Ces tests ne remplacent pas :** la sauvegarde/restauration réelle, le contrôle des règles Apache/HTTPS chez l'hébergeur, les migrations sur une copie des données existantes et des essais avec des personnes âgées sur de vrais téléphones (zoom à 200 %, clavier, lisibilité et compréhension des messages).

## Référence de déploiement

[Installation PHP](../php/README_INSTALLATION.md) · [Guide de sécurité et de déploiement](DEPLOIEMENT_SECURISÉ.md)

## Sécurité structurelle de Plesk

La seule racine HTTP admissible est `php/public/`. Le dossier `php/public/api/` contient les passerelles vers le code métier privé `php/api/` ; le serveur ne doit jamais publier `php/config/`, `php/includes/`, `php/bin/`, `php/migrations/` ou `php/database.sql`. Le banc HTTP de la CI effectue un contrôle 403/404 explicite de ces chemins. 
