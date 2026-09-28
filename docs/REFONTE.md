# Cadeau — Plan de simplification et de fiabilisation

## Constat vérifié dans le code initial

- Deux applications complètes et indépendantes (PHP/MySQL et React/FastAPI/MongoDB) accroissent l'entretien et le risque d'incohérence.
- Les anciennes versions ont publié un mot de passe administrateur et une configuration SQL active présumée ; la rotation des secrets est nécessaire, même après nettoyage Git.
- Les sessions PHP étaient validées à partir d'indicateurs en session sans actualiser les droits en base ; les utilisateurs non approuvés pouvaient accéder à l'API de consultation des attributions.
- Les actions d'administration PHP n'avaient pas de jeton CSRF. Les routes de diagnostic et de génération de hash étaient prévues pour être déposées dans le répertoire du site.
- La suppression d'utilisateurs pouvait supprimer des attributions d'années passées via les cascades SQL. Le tirage PHP utilisait \`shuffle\` puis une rotation déterministe après échec.
- Le tableau admin PHP peut laisser le bouton « Tirer au sort » désactivé après réinitialisation, faute de recalcul du statut du bouton.

## Cible de produit

Une seule application « Cadeau », prioritairement mobile, centrée sur un seul événement et trois écrans : **Rejoindre**, **Mon cadeau**, **Organiser**.

### Participants
- Recevoir un lien d'invitation privé, rejoindre sans apprentissage de l'outil.
- Voir un seul statut clair : inscription en attente, tirage à venir ou attribution disponible.
- Révéler leur destinataire sur un écran lisible ; ne jamais afficher une autre attribution.
- Restaurer l'accès sans créer de compte en double, par courriel vérifié (phase ultérieure).

### Organisateur
- Tableau de bord en trois étapes : participants, contrôle, tirage.
- Vue des demandes en attente, approbations et retraits sûrs.
- Confirmation explicite avant un tirage ou une réinitialisation, indication d'un tirage déjà consulté.
- Ajout futur d'exclusions (même foyer, couple, année précédente) avec détection « aucun tirage possible » **avant** la publication.
- Archive des événements et journal minimal non nominatif des opérations de maintenance.

## Priorités techniques

1. **Urgent — incident secrets :** remplacer les accès administrateur et SQL, vérifier l'historique Git et les logs, supprimer les anciens scripts web de diagnostic. Ne jamais republier de secret dans des fichiers suivis.
2. **Socle PHP :** conserver la compatibilité MySQL existante, sessions sécurisées, contrôles d'approbation et de rôle basés sur la base, protection CSRF et HTTPS.
3. **Données :** sauvegarde avant migration, remplacement des suppressions destructrices par une désactivation (schéma versionné), conservation des tirages historiques et contraintes d'unicité en base.
4. **Tirage :** transaction atomique, distribution uniforme valide sans auto-attribution ni doublon, verrouillage pendant le tirage et message intelligible en cas de conflit.
5. **UX :** mobile first, un appel à l'action principal par vue, messages d'erreur persistants et compréhensibles, formulaire court, accessibilité clavier et contrastes.
6. **Qualité :** tests unitaires PHP de tirage, tests HTTP session/CSRF/permissions, tests MySQL réels et tests E2E smartphone ; vérification des sauvegardes/restaurations.
7. **Déploiement :** une seule version active, configuration hors racine web, procédure de mise à jour réversible et supervision minimale sans divulgation du tirage.

## Décisions à vérifier avant fusion du chantier UX

- Quelle version tourne réellement en production et chez quel hébergeur ?
- L'administrateur participe-t-il lui-même au tirage ?
- Veut-on autoriser les exclusions entre membres du foyer et les répétitions entre années ?
- Souhaite-t-on une connexion par lien d'invitation plutôt que par mot de passe ?

Aucune migration automatique ni suppression de comptes existants avant sauvegarde et validation de ces règles métier.
