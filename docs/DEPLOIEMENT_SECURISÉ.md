# Cadeau — Déploiement sécurisé

## Définir le chemin servi

Pour préserver les chemins relatifs actuels des pages `/public/*.html` et des API `/api/*.php`, placer **php/** à la racine de l'application et conserver son `.htaccess` restrictif. Ne jamais publier la racine entière du dépôt. Après refonte des routes, la cible sera un unique dossier public/ avec point d'entrée PHP et routage explicite.

Vérifier **sur l'hébergeur réel** que les URLs `/config/`, `/includes/`, `/bin/`, `/migrations/`, `/database.sql` et les fichiers cachés renvoient 403/404, pas leur contenu. La configuration Apache et la présence de `AllowOverride` varient selon les hébergeurs : si le test échoue, déployer le contenu privé hors racine web et adapter les `require_once`.

## HTTPS obligatoire

Le site doit être redirigé vers HTTPS par l'hébergeur (Nginx/Apache/vhost). En production, ne pas permettre de connexion HTTP. N'activer HSTS qu'après vérification complète du domaine. Les cookies sont `HttpOnly`, `SameSite=Lax` et `Secure` lorsque HTTPS est détecté. Le reverse proxy doit transmettre correctement son statut HTTPS.

## Secrets et incident historique

- Remplacer immédiatement le mot de passe du compte administrateur d'origine et celui de l'utilisateur MySQL qui ont été publiés.
- Remplacer les secrets réutilisés ailleurs ; ne pas se contenter de `git rm`.
- Examiner les journaux d'accès pour connexions anormales et préserver une copie de preuve si nécessaire.
- Conserver les nouveaux secrets exclusivement dans la configuration de l'hébergement et hors Git.
- Remplacer l'ancienne documentation contenant les secrets sur `main` après validation, sans oublier que l'historique Git sera toujours accessible jusqu'à une purge dédiée coordonnée.

## Déploiement/migration contrôlé

1. Sauvegarder fichiers et base SQL ; tester la restauration sur une copie isolée.
2. Déterminer la version réelle de MySQL/MariaDB et PHP. Viser PHP 8.1+.
3. Exécuter d'abord `php/migrations/001_auth_attempts.sql` sur la copie, puis vérifier les index et contraintes.
4. Mettre à jour sur la copie, exécuter `php php/tests/unit.php`, valider PHP lint et les tests HTTP authentification/CSRF et tirages à deux, trois et dix comptes.
5. Vérifier l'interdiction d'accès des non-approuvés, la persistance du tirage, la réinitialisation et le rejet d'une double création.
6. Vérifier toutes les URLs sensibles depuis une connexion externe, sans publier une page PHP de diagnostic.
7. Publier seulement après validation et prévoir un retour arrière documenté.

Les nouveaux contrôles de tentative de connexion nécessitent **001_auth_attempts.sql**. Sans cette migration, ne pas déployer le nouveau `auth.php`.

## Connu et non résolu

- La rotation des secrets réels et l'historique public Git demandent une opération distincte.
- Les index additionnels et la modification de clés étrangères ne sont pas appliqués automatiquement à une base existante.
- Un test HTTP sur la vraie configuration Apache, une restauration MySQL et des tests navigateur restent requis.

## Interface de Noël validée

Le nouvel accueil, l'espace personnel et le tableau organisateur reprennent la maquette `docs/maquette-noel.html`, sans les éléments de démonstration. La nouvelle interface a été reliée aux points d'entrée réels `api/auth.php`, `api/user.php` et `api/admin.php`. Tous les noms affichés proviennent de la base : **aucune attribution fictive n'est incorporée à l'interface de production**.

Le destinataire est demandé uniquement après l'ouverture explicite de l'enveloppe. Le bouton pour refermer masque et efface le nom du DOM. La navigation est faite au clavier, les grandes cibles tactiles et l'agrandissement du texte sont conservés. Le test HTTP automatisé `php/tests/http-integration.sh` vérifie la chaîne d'inscription, d'approbation, de tirage et de permissions sur une base jetable.

L'envoi de courriels d'invitation ou de récupération de compte n'est **pas implémenté** : il requiert une connexion SMTP opérationnelle et un protocole de validation. Une erreur de réseau n'est jamais assimilée à l'absence de tirage. Vérifier le rendu sur vrais téléphones et avec des utilisateurs âgés avant publication.
