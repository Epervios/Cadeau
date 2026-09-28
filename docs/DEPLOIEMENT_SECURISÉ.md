# Cadeau v3 — Déploiement et sécurité

## Ne pas déployer sans préparation

Une mise à jour du dépôt GitHub ne remplace **pas** l'installation sur l'hébergement. Conserver une sauvegarde SQL et des fichiers, la **restaurer sur un environnement de test**, puis valider les migrations et l'application sur cette copie.

Des identifiants SQL et administrateur ont été publiés dans les toutes premières versions de ce dépôt. Les remplacer sur l'hébergement et partout où ils ont été réutilisés ; analyser les journaux d'accès. Le nettoyage de la branche actuelle ne purge pas les commits anciens. Ne jamais confondre suppression des fichiers, rotation effective des secrets et éventuelle réécriture coordonnée de l'historique Git.

## Arborescence Apache actuelle

L'application est autonome dans `php/`. La configuration `php/.htaccess` est écrite pour **servir `php/` comme racine d'application**, conserver `/public/` pour les pages et les ressources, et `/api/` pour les trois points d'entrée PHP.

L'hébergeur doit activer `mod_rewrite` et permettre la lecture des règles `.htaccess`. Vérifier explicitement depuis l'extérieur que les URL pointant vers `/config/`, `/includes/`, `/bin/`, `/migrations/`, les fichiers `.env`, `.git` et `/database.sql` renvoient 403 ou 404. Si la racine Apache ne peut pas être protégée, déplacer les dossiers privés **hors du répertoire publié** et adapter les chemins des points d'entrée avant d'ouvrir le site.

Activer HTTPS (et sa redirection côté hébergeur). Contrôler le comportement des cookies `Secure` derrière un éventuel reverse proxy. Activer HSTS seulement après validation de l'ensemble du domaine.

## Configuration et création des comptes

Ne jamais suivre `php/config/database.php` dans Git. Le modèle `php/config/database.example.php` utilise notamment `CADEAU_DB_PASSWORD` pour le secret SQL. Éviter de journaliser les secrets et ne jamais publier les scripts de `php/bin/` comme pages web.

Sur une **installation neuve**, importer `php/database.sql` dans une base vide, puis créer l'organisateur en privé avec `php/bin/bootstrap_admin.php`.

Sur une **installation existante**, ne pas importer le schéma complet. Vérifier les colonnes, index et clés étrangères sur une copie de la sauvegarde, puis appliquer seulement les migrations absentes dans l'ordre :
- `php/migrations/001_auth_attempts.sql` : limitation des essais de connexion ;
- `php/migrations/002_password_reset.sql` : récupération familiale et invalidation des sessions précédentes.

Les migrations 001 et 002 ne doivent pas être rejouées sans vérification préalable. Toute session créée avant la migration 002 devra se reconnecter. La récupération de l'organisateur lui-même se fait **uniquement depuis un terminal privé** avec `php/bin/reset_admin_password.php`.

## Validation fonctionnelle préalable

Exécuter les tests automatisés décrits dans [l'inventaire des fonctions](IMPLEMENTATION_V3.md). Sur l'hébergement d'essai, vérifier en particulier la confidentialité d'un destinataire : un participant non approuvé ne doit pas accéder au résultat, le clic sur « Ouvrir mon enveloppe » doit être nécessaire et la fermeture doit effacer le nom affiché. Une panne réseau doit afficher une erreur et non un faux « pas de tirage ».

Vérifier l'absence de second tirage accidentel, la confirmation de réinitialisation, l'impossibilité de changer les participants une fois le tirage publié et la persistance des données après un redémarrage.

La récupération familiale fonctionne **sans SMTP** : l'organisateur transmet le lien lui-même au parent après avoir vérifié son destinataire. Le lien est valable 30 minutes et à usage unique. Le jeton est transmis dans un fragment `#token` qui n'est pas envoyé à Apache dans la requête HTTP initiale, puis est retiré de l'URL affichée par la page de réinitialisation. Un mauvais partage du lien reste un risque humain.

## Acceptation utilisateur et retour arrière

Faire essayer l'application à au moins une personne âgée volontaire sur un smartphone, avec textes normaux et agrandis, clavier si pertinent et zoom du navigateur à 200 %. Vérifier lisibilité, compréhension de chaque bouton, progression des formulaires et absence de piège à l'ouverture de l'enveloppe.

Documenter les versions PHP et MySQL réelles ainsi que la stratégie de restauration avant remplacement de la production. Aucune migration ou mise à jour du dépôt ne constitue, seule, un feu vert pour le déploiement.
