# Cadeau v3 — La magie des cadeaux

**Application privée de tirage au sort familial pour Noël**, en français, conçue pour être utilisable sur smartphone, tablette et ordinateur, y compris par des personnes peu à l'aise avec l'informatique.

![CI](https://github.com/Epervios/Cadeau/actions/workflows/php-check.yml/badge.svg)

## Application retenue

Une **seule application : PHP 8.1+ et MySQL/MariaDB**. La version React/FastAPI/MongoDB de l'ancien prototype, les scripts de génération de dépôt et les rapports de test historiques ont été retirés. Le projet n'a pas besoin de Node pour l'exploitation ; Node sert uniquement aux tests statiques dans GitHub Actions.

| Emplacement | Rôle |
| --- | --- |
| `php/public/` | Pages, styles, JavaScript et illustration de Noël |
| `php/api/` | API PHP : authentification, participants, tirage |
| `php/includes/`, `php/config/` | Logique commune et configuration serveur |
| `php/database.sql` | Schéma d'une **nouvelle** base vide |
| `php/migrations/` | Migrations d'une base **déjà existante** |
| `php/bin/` | Commandes d'administration privées (PHP CLI seulement) |
| `php/tests/` | Tests de tirage, d'interface et du parcours HTTP |
| `docs/maquette-noel.html` | Maquette graphique approuvée, conservée en référence |

## Parcours familial

- **Je participe** : inscription et attente de validation par l'organisateur.
- **Mon cadeau** : une enveloppe qui ne révèle le destinataire qu'à son ouverture, puis peut être refermée.
- **Organiser** : demandes, liste des participants, contrôle et tirage avec confirmation.
- **Mot de passe oublié** : l'organisateur remet à un participant un lien privé valable **30 minutes**, à usage unique et sans messagerie automatique. Le participant crée lui-même son mot de passe ; ses anciennes sessions sont invalidées.

Gros caractères, boutons larges, option **Agrandir le texte A+**, navigation clavier et mouvements réduits selon les préférences de l'appareil. Les invitations automatiques par e-mail et la gestion des exclusions entre couples ne sont **pas** implémentées.

## Installer ou mettre à jour

Lire d'abord [les instructions d'installation PHP](php/README_INSTALLATION.md), puis [le guide de déploiement et de sécurité](docs/DEPLOIEMENT_SECURISÉ.md).

- **Installation neuve** : base vide, import de `php/database.sql` et création du premier administrateur par `php/bin/bootstrap_admin.php` (terminal privé).
- **Base existante** : sauvegarde restaurable, vérification de son schéma, puis application sur **une copie** des migrations `001_auth_attempts.sql` et `002_password_reset.sql` qui n'ont pas déjà été appliquées. Ne jamais importer directement le schéma initial dans une base remplie.
- Configurer Apache/HTTPS et les secrets hors du dépôt. Tester tous les parcours avant de remplacer une installation publique.

## Vérification

GitHub Actions lance les contrôles de syntaxe PHP/JavaScript/Bash, les tests de tirage et d'interface, puis des tests HTTP avec une base MariaDB **jetable**, dont la récupération sécurisée du mot de passe. Consulter le dernier run avant de déployer.

Voir [l'inventaire des fonctions et scénarios d'acceptation](docs/IMPLEMENTATION_V3.md).

## Sécurité : action nécessaire sur l'installation réelle

Des identifiants figuraient dans les premières versions publiques du projet. **Changer les mots de passe SQL et administrateur concernés, ainsi que les secrets réutilisés**, et contrôler les journaux de l'hébergement. Les fichiers correspondants sont absents de la version actuelle, mais leur historique Git n'est pas purgé par un simple nettoyage du dépôt. Une purge de l'historique est une opération séparée qui doit être coordonnée avant toute réécriture des références Git.

**Le nettoyage du dépôt GitHub ne déploie pas automatiquement l'application sur un hébergeur et ne touche aucune base de données existante.**
