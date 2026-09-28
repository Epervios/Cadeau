# Cadeau v3 — Déploiement sécurisé sur Plesk + Cloudflare

## Isolation des fichiers par le serveur Web

**Seul `php/public/` est une racine HTTP valide** : une requête à `/config/database.example.php`, `/includes/functions.php`, `/bin/bootstrap_admin.php`, `/database.sql` ou `/migrations/002_password_reset.sql` doit échouer en **403 ou 404**. Ces fichiers résident un niveau au-dessus de la racine publiée et n'ont donc aucun chemin URL direct.

L'ancienne configuration avec racine `php/` autorisait potentiellement l'exécution directe de scripts privés (observé : HTTP 200 sur `/config/database.example.php`). Même si ce dernier n'affichait rien, cela ne prouvait aucune protection. Sur Plesk, PHP peut être exécuté par nginx sans passer par les directives Apache `.htaccess`. La séparation physique est obligatoire et les contrôles 403/404 sont requis avant d'insérer un mot de passe SQL.

**Plesk :** dépôt GitHub `Epervios/Cadeau` branche `main`, déploiement manuel dans `/noel.wizardaring.ch`, racine du document `noel.wizardaring.ch/php/public`. Ne pas copier les dossiers `config/`, `api/`, `bin/`, `includes/`, `migrations/` ni le schéma SQL dans `public/`.

Le dossier `public/api/` contient trois **passerelles d'entrée** : `auth.php`, `admin.php`, `user.php`. Les véritables implémentations PHP sont dans le dossier `php/api/` (privé) et accèdent à la configuration `php/config/` par des chemins absolus calculés avec `__DIR__`. Le JavaScript du navigateur utilise `api/` relatif à la racine publique.

## TLS et Cloudflare

Un certificat d'origine valide doit couvrir `noel.wizardaring.ch`. Activer la redirection HTTPS en Plesk ; utiliser Cloudflare Full (strict) seulement après avoir validé le certificat d'origine. Ne jamais mettre en cache `/api/*` ou les réponses personnalisées ; les API émettent `Cache-Control: no-store`. Vérifier séparément les autres sous-domaines avant toute modification d'une règle Cloudflare globale.

## Base neuve ou migration

Installation neuve dans la base vide `cadeau` : importer **seulement** `php/database.sql`. Les migrations 001 et 002 sont déjà incluses ; ne pas les rejouer. Préférer des droits minimaux pour l'utilisateur SQL `cadeau_admin`. Conserver le mot de passe uniquement sur l'hébergement, dans la configuration privée ou une variable d'environnement sûre.

Installation existante : sauvegarde restaurable et migrations 001/002 uniquement si manquantes, après contrôle de schéma sur une copie. La récupération du mot de passe familial requiert `users.auth_version` et `password_reset_tokens`.

Le premier organisateur est initialisé via `php/bin/bootstrap_admin.php` uniquement en terminal privé. **Ne jamais créer de page Web d'initialisation administrative.** En cas d'absence de terminal dans Plesk, utiliser les fonctions de maintenance de l'hébergeur plutôt qu'exposer un script SQL/PHP sur le site.

## Avant la mise en ligne

Lancer les tests unitaires/HTTP sur GitHub et vérifier le dernier workflow ; le banc HTTP doit démarrer avec `-t php/public` et refuser les chemins privés tout en acceptant `/api/auth.php?action=csrf`.

Contrôler en HTTP réel la protection des répertoires, le chemin HTTPS via Cloudflare et l'absence de cache sur les résultats. Effectuer un essai avec plusieurs comptes fictifs : approbation, impossibilité de voir le cadeau d'un autre, tirage stable et unique, récupération de mot de passe et révocation des sessions.

Les secrets des versions historiques publiées dans GitHub restent compromis tant qu'ils ne sont pas effectivement changés. Le nettoyage du dépôt actuel n'efface pas l'historique Git : sa purge éventuelle constitue une opération distincte.
