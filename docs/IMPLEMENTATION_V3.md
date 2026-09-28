# Cadeau v3 — interface de Noël implémentée

Ce document recense les fonctionnalités effectivement intégrées à la branche `audit/security-and-simplification`. La maquette originale se trouve dans `docs/maquette-noel.html` ; **les fichiers actifs** sont dans `php/public/`.

## Fonctionnement raccordé à l'API existante

- `index.html` : accueil festif validé, inscription réelle (prénom/e-mail/mot de passe), connexion et état « en attente d'approbation ».
- `user.html` : lecture de l'état du tirage, puis ouverture de l'enveloppe par demande API explicite. Aucun destinataire dans le HTML initial ; bouton pour refermer et effacer le nom affiché.
- `admin.html` : listes des participants confirmés et des inscriptions en attente, approbation/refus, trois étapes d'organisation, lancement du tirage et réinitialisation avec saisie de l'année.
- `css/style.css` et `assets/christmas-village.svg` : identité fidèle à la maquette, entièrement locale et sans polices externes ; présentation responsive et boutons 56–64 px.
- `js/common.js` : accès API PHP commun, jeton CSRF, messages accessibles et préférence d'agrandissement du texte persistée localement.
- Les noms affichés à l'organisateur proviennent uniquement de l'API administrative autorisée ; le destinataire ne provient que de l'API personnelle du participant.

## Délibérément hors du périmètre de cette version

- Aucun envoi de courriel automatique ; aucune promesse de notification tant qu'un service SMTP n'a pas été configuré et vérifié.
- Ni mot de passe oublié ni invitation individuelle à jeton tant qu'un flux de récupération sécurisé n'a pas été développé.
- Ni exclusion entre couples/foyers ni modification de liste après publication d'un tirage.
- Aucun travail sur la version alternative React/FastAPI : elle demeure dans le dépôt pour compatibilité, mais la cible de livraison est la version PHP/MySQL.
- Les comptes et tirages présents sur un hébergement réel n'ont pas été lus ni migrés depuis cette branche.

## Validation technique

Le workflow `.github/workflows/php-check.yml` exécute analyse syntaxique PHP/JS/Bash, tests du tirage, vérification statique des trois pages et tests SQL/HTTP sur une base MariaDB jetable. Cette chaîne ne remplace pas les tests d'affichage avec personnes âgées ni la vérification des accès Apache réels.

## Scénarios de réception avec la famille

1. Sur un téléphone, demander à une personne peu habituée aux applications de rejoindre l'événement sans assistance et noter les blocages.
2. Vérifier la lisibilité normale, l'option A+, le zoom navigateur à 200 %, le clavier et le lecteur d'écran.
3. Vérifier qu'un inscrit en attente ne peut ouvrir ni l'enveloppe ni le tableau d'organisation.
4. Tirer au sort avec des comptes d'essai ; vérifier qu'aucun compte ne reçoit son propre nom et que chacun reçoit un destinataire unique.
5. Refermer l'enveloppe devant une autre personne et s'assurer que le nom n'est plus affiché.
6. Vérifier l'affichage d'une panne réseau, d'un mot de passe incorrect, d'une demande déjà envoyée et d'une tentative de nouveau tirage.
7. Contrôler un vrai hébergement avec HTTPS, sauvegarde/restauration, secret de base de données remplacé et restrictions d'accès Apache avant fusion.

**Ne pas fusionner automatiquement sur `main` ni publier en production** sans sauvegarde restaurable et rotation des secrets historiques exposés.
