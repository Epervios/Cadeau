# Cadeau — proposition produit et interface v3

## Objectif

Une petite application privée de tirage au sort familial, compréhensible immédiatement et utilisable principalement sur smartphone. **Un seul hébergement PHP/MySQL**, aucune nécessité d'installer une application ou de gérer un serveur supplémentaire.

## Direction visuelle

Chaleureuse et contemporaine, sans multiplication d'effets : fond ivoire (#FBF8F2), vert sapin profond (#153B32), rouge brique (#B84D40), touches or doux (#D8B872). Typographie système nette pour les contenus, éventuelle police éditoriale pour les grands titres si disponible en local. Cartes aérées, boutons accessibles (44 px minimum), animations de révélation facultatives désactivables par `prefers-reduced-motion`. Pas d'animations continues distrayantes.

## Un parcours, trois écrans

### 1. Rejoindre
- En-tête : « Cadeau · Noël 2026 » ; badge événement privé.
- Une carte : « Vous êtes invité·e à notre Secret Santa ».
- Deux choix exclusifs : « J'ai déjà un compte » et « Je participe ».
- Formulaire existant dans un premier temps (prénom, e-mail, mot de passe), états d'erreur sous les champs et message de confirmation persistent.
- Évolution recommandée : lien d'invitation individuel avec jeton temporaire à usage unique, e-mail vérifié, expirations et prévention de la duplication des comptes. Ne pas implémenter d'invitation sans serveur SMTP opérationnel.
- Mention explicite « En attente de validation de l'organisateur » si applicable.

### 2. Mon cadeau
- Une seule carte principale, centrée sur smartphone.
- Avant tirage : « Les inscriptions sont ouvertes » ou « Le tirage approche », jamais « aucune attribution » en cas d'erreur réseau.
- Après tirage : « Votre destinataire est prêt » et bouton « Révéler mon destinataire » ; l'identité est obtenue exclusivement de l'API autorisée ; affichage discret, pas de nom caché préchargé en HTML public.
- Un lien secondaire « Me déconnecter » ; paramètres personnels dans un menu discret.
- Ne pas transmettre les résultats dans les journaux, notifications push ou analytics.

### 3. Organiser
- Trois étapes visibles, dans cet ordre : **Participants → Vérifier → Tirer au sort**.
- Compteurs : inscrits, en attente, approuvés, tirage déjà effectué.
- Boutons d'approbation/rejet directement dans la liste, double vérification pour les actions destructrices.
- Résumé avant tirage : année, nombre exact de participants, liste figée, confirmation explicite.
- Après publication : état verrouillé ; message clair qu'une réinitialisation changera tous les destinataires.
- Archive accessible pour l'administrateur uniquement : historique des événements, sans liste des appariements affichée par défaut.

## Règles de fonctionnement

- Un participant ne doit jamais s'attribuer lui-même ; tous les participants d'un événement reçoivent exactement un nom.
- Le résultat ne doit pas changer par rechargement ; pas de nouveau tirage silencieux.
- L'organisateur est un compte distinct du statut de participant dans une future migration (actuellement, tout administrateur approuvé participe ; le changer exige une migration explicite).
- Pas de suppression d'un compte cité dans des tirages passés. Prévoir une désactivation administrative et un statut « participant à l'événement » indépendant de « compte approuvé ».
- Exclusions couples/foyers et année précédente : phase optionnelle avec résolution de contraintes, diagnostic d'impossibilité et tests exhaustifs.

## Prototype de parcours (texte)

```text
CADEAU                        Noël 2026
───────────────────────────────────────
       Un cadeau, une surprise.
       Notre Secret Santa familial

       [ Rejoindre l'événement ]
       J'ai déjà un compte

───────────────────────────────────────
Votre espace :
  ✓ Vous êtes inscrit·e
  · Tirage prévu prochainement
  · Votre destinataire sera révélé ici

───────────────────────────────────────
Organiser :
  08 participants   02 en attente
  [ Vérifier les participants ]
  [ Lancer le tirage ]  (si valide)
```

## Livraison par étapes

1. Socle sécurité et migration non destructive : secrets, sessions, CSRF, approbations, tirage atomique, tests PHP/SQL.
2. Refonte UX des trois écrans existants ; navigation mobile, erreurs et états explicites.
3. Invitations privées vérifiées / récupération de compte ; SMTP si disponible.
4. Gestion avancée des exclusions, des événements et de l'historique.

**Conditions de mise en production :** rotation des secrets réels, sauvegarde/restauration validée, revue du virtual host Apache/HTTPS, migration MySQL testée sur copie, parcours de bout en bout testé avec plusieurs comptes. Ne pas fusionner cette branche uniquement sur revue statique.
