# Cadeau v3 — « La magie de Noël en famille »
## Direction retenue : Noël traditionnel et féerique, accessible à tous les âges

Cette proposition remplace la première direction « application premium minimaliste », jugée insuffisamment festive. **L'objectif est d'évoquer une carte de Noël ancienne qui prend vie**, sans compliquer l'utilisation, avec une attention particulière aux grands-parents et aux personnes qui ne sont pas à l'aise avec le numérique.

[Ouvrir la maquette HTML interactive](maquette-noel.html) — quatre écrans illustratifs, sans compte ni connexion à la base. Enregistrer le fichier puis l'ouvrir dans le navigateur pour essayer les boutons.

## 1. Atmosphère visuelle

L'image mentale est une **soirée de Noël dans un village enneigé** : fenêtres éclairées, sapins couverts de neige, ciel étoilé, enveloppe cachetée à la cire rouge, papier crème, ornements dorés et touches de houx. Il faut ressentir la chaleur familiale et un peu de mystère au moment du tirage. Éviter le SaaS générique, les dégradés fluo, le noir et blanc froid, le rouge agressif et les décorations excessivement enfantines.

Palette de travail :
- **Vert sapin nocturne** `#173A32` : bandeau, forêt et boutons principaux.
- **Rouge velours** `#9C2838` : cachet de l'enveloppe, rubans et détails.
- **Or chandelle** `#F0D38A` : étoiles et guirlandes ; uniquement décoratif sur fond sombre.
- **Papier ivoire** `#FFF9EC` : cartes et surfaces de lecture.
- **Encre foncée** `#23352C` : tous les longs textes sur papier.
- **Neige pâle** `#EDF2EC` : fonds secondaires.

Illustration de Noël de type carte postale, **mais pas de texte important posé sur une image chargée**. Titre festif en Georgia ou une serif de lecture équivalente ; texte et boutons en police système sans-serif très lisible. Une animation brève au moment de l'ouverture de l'enveloppe est possible, mais aucun élément ne doit clignoter, tomber en continu ou se déplacer sans contrôle. Son **désactivé par défaut** et non nécessaire pour comprendre quoi que ce soit.

## 2. Parcours proposé : zéro jargon

### Accueil — « Bienvenue à notre Noël ! »
Une grande illustration enneigée ; sous elle, une carte comme une invitation de papier, avec un seul appel à l'action : **« Je participe »**, puis un lien secondaire **« J'ai déjà participé »**. Texte d'aide en deux phrases : « Chacun offre un cadeau à une personne tirée au sort. Le nom reste secret jusqu'à ce que vous ouvriez votre enveloppe. » Le mode de participation sécurisé par invitation personnalisée sera réalisé dans une phase ultérieure après confirmation du mode d'envoi.

### Attente — « Votre participation est enregistrée »
Message positif et précis, sans demander de revenir au hasard : « Nous vous préviendrons lorsque le tirage sera fait », uniquement si l'envoi d'e-mail est disponible et validé. Sinon : « Revenez sur cette page quand le tirage aura eu lieu ». Un repère simple : « 1. Je participe ✓ ; 2. La famille est inscrite ; 3. J'ouvre mon enveloppe ». Les repères sont descriptifs, jamais uniquement colorés.

### Mon cadeau — une enveloppe mystérieuse
Au centre, **une grande enveloppe illustrée avec un cachet rouge doré**. Bouton de 60 px de haut : **« Ouvrir mon enveloppe »**. Au clic, une courte transition facultative révèle une carte : « Cette année, tu offres un cadeau à… Camille ». Le nom n'apparaît jamais dans les e-mails, dans l'URL ou dans le HTML initial ; il vient d'une API authentifiée. Après la révélation, un bouton **« Refermer mon enveloppe »** masque le nom pour les personnes qui regardent l'écran. Prévoir une aide explicite : « Garde le secret jusqu'à Noël ! ».

### Organiser — « Préparons notre Noël »
Écran réservé à l'organisateur. Présentation en **trois grandes étapes verticales** : (1) Vérifier les participants, (2) Préparer le tirage, (3) Lancer le tirage. Grandes listes avec boutons « Accepter » et « Refuser » ayant leurs propres libellés accessibles. Résumé clair de l'année et du nombre de personnes. Pas de tirage surprise automatique. Confirmation avant publication et avant toute réinitialisation.

## 3. Personnes âgées : règles de conception prioritaires

- **Texte de lecture de 20 à 22 px**, libellés de boutons de 20 px minimum ; bouton « Agrandir le texte » en haut de l'application et compatibilité avec le zoom navigateur à 200 % sans perte de contenu.
- **Cibles tactiles de 56 à 64 px de haut**, zones espacées d'au moins 12 px ; une action principale par écran, sans menu à icônes seul.
- Contraste **WCAG 2.2 AA** (au moins 4,5:1 pour les textes ordinaires), vérifié sur chaque combinaison réelle texte/fond ; ne jamais utiliser l'or clair pour des textes sur fond ivoire.
- Textes usuels : « Je participe », « Voir mon cadeau », « Retour à l'accueil », « Je ne me souviens plus de mon mot de passe ». Éviter « Dashboard », « Token », « Authentification » et « Secret Santa » comme seuls termes explicatifs.
- Formulaires en **une seule colonne** avec labels visibles, aide à proximité et message d'erreur persistant en français, sans vider les données déjà saisies.
- Aucun chrono imposé pour lire une attribution, aucune musique automatique, pas de CAPTCHA visuel difficile, mouvement réduit si le système le demande et aucun élément à drag-and-drop obligatoire.
- Parcours réalisable au clavier et avec lecteurs d'écran ; titres hiérarchisés, focus très visible, changement d'écran annoncé, illustrations décoratives masquées aux aides techniques.
- Tester sur téléphones modestes, petite largeur (320 px), agrandissement 200 %, tablette et bureau, au moins un test utilisateur réel avec une personne âgée volontaire.

Ressources : [W3C — Older Users and Web Accessibility](https://www.w3.org/WAI/older-users/), [W3C — WCAG 2.2](https://www.w3.org/TR/WCAG22/).

## 4. Inscription sans complication mais sans compromis de confidentialité

Le formulaire e-mail/mot de passe actuel demeure temporairement, tant qu'aucune fonctionnalité d'envoi sécurisé n'a été configurée. Proposer ensuite **une invitation personnelle par e-mail**, liée à un compte, à durée limitée et à usage unique pour l'activation ; elle ne doit **jamais** inclure le résultat du tirage. Prévoir récupération d'accès vérifiée, protection contre les tentatives répétées et une option d'assistance organisée sans accès d'un proche aux attributions d'autrui. Pas de compte créé ou fusionné automatiquement à partir d'un simple prénom.

## 5. Les choses importantes que nous ne sacrifions pas pour l'esthétique

Aucune personne ne se tire elle-même ; chaque participant est attribué exactement une fois ; le tirage reste stable une fois publié. Ne pas afficher des noms sensibles hors de la vue personnelle authentifiée. Préserver les archives des années antérieures ; gestion des exclusions couples/foyers ultérieure, avec diagnostic d'impossibilité. Une illustration festive ne doit jamais ralentir l'affichage ni empêcher une action.

## 6. Périmètre concret de la maquette

`maquette-noel.html` est une **maquette interactive autonome**, non connectée au serveur : quatre vues (« Accueil », « Attente », « Mon cadeau », « Organiser »), navigation clavier, agrandissement de texte et ouverture/fermeture d'une enveloppe fictive. Tous les noms et nombres sont inventés. Elle ne crée aucun compte, n'envoie aucun e-mail et ne procède à aucun tirage réel. Son rôle est de valider visuellement la direction, puis de transposer la composition retenue dans le frontend PHP existant après tests du socle sécurité.
