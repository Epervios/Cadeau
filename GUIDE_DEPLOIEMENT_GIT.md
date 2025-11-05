# 📦 Guide de Déploiement sur Git

Guide pour publier votre application Secret Santa sur GitHub/GitLab

## 🎯 Préparation avant le Push

### 1. Créer un fichier .gitignore

Créez un fichier `.gitignore` à la racine du projet :

```gitignore
# Environnement Python
backend/venv/
backend/__pycache__/
backend/*.pyc
backend/.pytest_cache/
*.egg-info/

# Environnement Node.js
frontend/node_modules/
frontend/build/
frontend/.pnp
frontend/.pnp.js

# Variables d'environnement (IMPORTANT!)
backend/.env
frontend/.env
php/config/database.php

# Logs
*.log
logs/
/var/log/

# OS
.DS_Store
Thumbs.db
.idea/
.vscode/
*.swp
*.swo

# Test reports
test_reports/
/app/test_reports/

# Temporary files
*.tmp
*.bak
*.backup
php/generate_admin_password.php
php/test_connection.php

# Build artifacts
dist/
build/
*.zip
*.tar.gz
```

### 2. Créer des fichiers .env.example

Pour que les autres développeurs sachent quelles variables configurer :

**Backend : `/backend/.env.example`**
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=secret_santa_db
CORS_ORIGINS=http://localhost:3000
JWT_SECRET=changez-cette-cle-secrete
```

**Frontend : `/frontend/.env.example`**
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

**PHP : `/php/config/database.example.php`**
```php
<?php
define('DB_HOST', 'localhost');
define('DB_NAME', 'cadeau');
define('DB_USER', 'votre_user');
define('DB_PASS', 'votre_password');
define('DB_CHARSET', 'utf8mb4');
?>
```

### 3. Nettoyer les informations sensibles

⚠️ **CRITIQUE** : Vérifiez qu'aucun fichier ne contient :
- ❌ Mots de passe en clair
- ❌ Clés API
- ❌ Informations de connexion
- ❌ Données personnelles

**Fichiers à vérifier** :
- `php/config/database.php` → Ne PAS commiter (déjà dans .gitignore)
- `backend/.env` → Ne PAS commiter (déjà dans .gitignore)
- `frontend/.env` → Ne PAS commiter (déjà dans .gitignore)

---

## 🚀 Déploiement sur GitHub

### Étape 1 : Initialiser Git localement

```bash
cd /app

# Initialiser le dépôt Git
git init

# Ajouter le .gitignore
git add .gitignore

# Premier commit
git add .
git commit -m "🎄 Initial commit - Secret Santa Application"
```

### Étape 2 : Créer un dépôt sur GitHub

1. Allez sur [github.com](https://github.com)
2. Cliquez sur **"New repository"**
3. Nom du dépôt : `secret-santa` (ou votre choix)
4. Description : `Application de tirage au sort Secret Santa pour Noël`
5. Visibilité : **Public** ou **Private**
6. ❌ **NE PAS** cocher "Initialize with README" (on en a déjà un)
7. Cliquez sur **"Create repository"**

### Étape 3 : Lier et pousser sur GitHub

```bash
# Lier votre dépôt local à GitHub
git remote add origin https://github.com/VOTRE-USERNAME/secret-santa.git

# Vérifier la branche
git branch -M main

# Pousser le code
git push -u origin main
```

### Étape 4 : Vérification

1. Rafraîchissez la page GitHub
2. Vérifiez que tous les fichiers sont présents
3. ⚠️ Vérifiez que les fichiers `.env` et `database.php` ne sont PAS présents

---

## 🎨 Améliorer votre Dépôt GitHub

### 1. Ajouter un README.md attractif

Le fichier `README_PRINCIPAL.md` est parfait comme README principal :

```bash
# Copier comme README.md
cp README_PRINCIPAL.md README.md

# Commiter
git add README.md
git commit -m "📝 Add comprehensive README"
git push
```

### 2. Ajouter des Topics

Sur GitHub, allez dans votre dépôt :
1. Cliquez sur la roue dentée à côté de "About"
2. Ajoutez des topics : `php`, `mysql`, `react`, `fastapi`, `mongodb`, `christmas`, `secret-santa`, `gift-exchange`

### 3. Ajouter des Badges

Ajoutez au début de votre README.md :

```markdown
![PHP](https://img.shields.io/badge/PHP-7.4+-blue)
![React](https://img.shields.io/badge/React-19-blue)
![Python](https://img.shields.io/badge/Python-3.11+-blue)
![License](https://img.shields.io/badge/License-MIT-green)
```

### 4. Créer des Screenshots

Créez un dossier `docs/screenshots/` avec des captures d'écran :

```bash
mkdir -p docs/screenshots
# Ajoutez vos images
git add docs/screenshots/
git commit -m "📸 Add screenshots"
git push
```

### 5. Ajouter une LICENSE

Créez un fichier `LICENSE` :

```text
MIT License

Copyright (c) 2024 [Votre Nom]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

[Texte complet de la licence MIT...]
```

```bash
git add LICENSE
git commit -m "📄 Add MIT License"
git push
```

---

## 🌿 Structure des Branches (Optionnel)

Pour un projet propre avec plusieurs versions :

```bash
# Créer une branche pour la version PHP
git checkout -b version-php
git push -u origin version-php

# Créer une branche pour la version React
git checkout -b version-react
git push -u origin version-react

# Retourner sur main
git checkout main
```

---

## 📱 Déploiement sur GitLab (Alternative)

Les étapes sont similaires :

```bash
# Créer un projet sur gitlab.com
# Puis lier votre dépôt local

git remote add origin https://gitlab.com/VOTRE-USERNAME/secret-santa.git
git branch -M main
git push -u origin main
```

---

## 🔄 Mises à Jour Futures

Pour publier des modifications :

```bash
# Vérifier les changements
git status

# Ajouter les fichiers modifiés
git add .

# Commiter avec un message descriptif
git commit -m "✨ Add reset draw feature"

# Pousser vers GitHub
git push
```

---

## 📝 Messages de Commit Recommandés

Utilisez des emojis et soyez descriptif :

- ✨ `:sparkles:` Nouvelle fonctionnalité
- 🐛 `:bug:` Correction de bug
- 📝 `:memo:` Documentation
- 🎨 `:art:` Amélioration UI/UX
- ⚡ `:zap:` Amélioration performance
- 🔒 `:lock:` Sécurité
- 🚀 `:rocket:` Déploiement
- ♻️ `:recycle:` Refactoring
- 🔧 `:wrench:` Configuration

**Exemples** :
```bash
git commit -m "✨ Add password reset functionality"
git commit -m "🐛 Fix login error on mobile"
git commit -m "📝 Update installation guide"
git commit -m "🎨 Improve Christmas theme design"
```

---

## 🔐 Sécurité : Checklist Finale

Avant de pousser, vérifiez :

- [ ] `.gitignore` est bien configuré
- [ ] Aucun mot de passe en clair dans le code
- [ ] `.env` et `database.php` ne sont PAS committés
- [ ] Fichiers d'exemple `.env.example` sont présents
- [ ] Documentation explique comment configurer
- [ ] README mentionne de changer les mots de passe par défaut
- [ ] Pas de données personnelles dans le code

---

## 📦 Créer une Release (Optionnel)

Pour marquer une version stable :

```bash
# Créer un tag
git tag -a v1.0.0 -m "🎄 Version 1.0.0 - Initial Release"

# Pousser le tag
git push origin v1.0.0
```

Sur GitHub :
1. Allez dans **Releases**
2. Cliquez sur **"Create a new release"**
3. Sélectionnez votre tag `v1.0.0`
4. Ajoutez des notes de version
5. Publiez !

---

## 🎯 Commandes Git Essentielles

```bash
# Voir l'état
git status

# Voir l'historique
git log --oneline

# Créer une branche
git checkout -b nom-branche

# Changer de branche
git checkout main

# Voir les branches
git branch -a

# Annuler des changements (avant commit)
git checkout -- fichier.php

# Annuler le dernier commit (garder les changements)
git reset --soft HEAD~1

# Mettre à jour depuis GitHub
git pull origin main
```

---

## 🌐 Rendre le Projet Public

Pour partager votre projet :

1. Allez dans **Settings** du dépôt
2. Descendez jusqu'à **Danger Zone**
3. Cliquez sur **"Change repository visibility"**
4. Sélectionnez **Public**
5. Confirmez

⚠️ **Avant de rendre public** :
- Vérifiez qu'il n'y a AUCUNE information sensible
- Relisez tous les fichiers
- Testez que `.gitignore` fonctionne

---

## 📞 Support Git

Si vous avez des problèmes :

- 📚 [Documentation Git](https://git-scm.com/doc)
- 📘 [GitHub Guides](https://guides.github.com/)
- 💬 [Stack Overflow - Git](https://stackoverflow.com/questions/tagged/git)

---

## ✅ Checklist Complète de Déploiement

- [ ] `.gitignore` créé et configuré
- [ ] Fichiers `.env.example` créés
- [ ] Informations sensibles retirées
- [ ] `git init` exécuté
- [ ] Premier commit effectué
- [ ] Dépôt GitHub/GitLab créé
- [ ] Remote origin ajouté
- [ ] Code poussé sur GitHub
- [ ] README.md attractif ajouté
- [ ] LICENSE ajoutée
- [ ] Topics ajoutés sur GitHub
- [ ] Documentation vérifiée
- [ ] Screenshots ajoutées (optionnel)
- [ ] Release créée (optionnel)

---

**Votre projet Secret Santa est maintenant sur Git ! 🎉🎄**

Partagez le lien de votre dépôt avec vos amis et la communauté !

