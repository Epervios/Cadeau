# 🎄 Secret Santa - Application de Tirage au Sort Familial

Application web complète pour organiser un tirage au sort Secret Santa en famille. Chaque participant reçoit secrètement le nom d'une personne à qui offrir un cadeau.

![Version](https://img.shields.io/badge/version-2.0-green?style=for-the-badge)
![PHP](https://img.shields.io/badge/PHP-7.4+-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

## 🎁 Deux Versions Disponibles

Ce projet propose **deux versions complètes** de l'application pour s'adapter à tous les types d'hébergement :

### 📁 Version 1 : PHP/MySQL (Hébergement Mutualisé)
**Dossier : `/php/`**

Parfait pour les hébergements classiques (OVH, Hostinger, o2switch, etc.)

**Technologies** :
- PHP 7.4+ / 8.0+
- MySQL 5.7+ / MariaDB 10.3+
- HTML5 / CSS3 / JavaScript Vanilla

**Avantages** :
- ✅ Compatible avec tous les hébergements mutualisés
- ✅ Pas besoin de Node.js ou Python
- ✅ Installation simple via FTP et phpMyAdmin
- ✅ Moins cher (~3-5€/mois)

**Installation** : Voir [php/README_INSTALLATION.md](php/README_INSTALLATION.md)

**Quick Start** : Voir [php/QUICK_START.md](php/QUICK_START.md)

---

### ⚡ Version 2 : React + FastAPI + MongoDB (VPS/Cloud)
**Dossier : `/` (racine du projet)**

Pour les hébergements VPS, cloud ou serveurs dédiés.

**Technologies** :
- **Backend** : FastAPI (Python 3.11+)
- **Frontend** : React 19
- **Base de données** : MongoDB
- **Styling** : Tailwind CSS + Shadcn/UI

**Avantages** :
- ✅ Architecture moderne et scalable
- ✅ Performance optimale
- ✅ API REST complète
- ✅ Hot reload en développement

**Installation** : Voir [README.md](README.md)

---

## ✨ Fonctionnalités Complètes

Les deux versions offrent exactement les mêmes fonctionnalités :

### Pour l'Administrateur
- 👥 **Validation manuelle** des inscriptions
- 🎲 **Lancement du tirage** au sort Secret Santa
- 🔄 **Réinitialisation du tirage** si nécessaire (NOUVEAU!)
- 📊 **Dashboard complet** avec statistiques
- ✅ **Approbation/Rejet** des participants

### Pour les Participants
- 📝 **Inscription simple** (prénom, email, mot de passe)
- 🔐 **Connexion sécurisée**
- 🎁 **Affichage secret** de l'attribution après tirage
- 📱 **Interface responsive** (mobile, tablette, desktop)

### Algorithme de Tirage Intelligent
- ✅ Pas d'auto-attribution (personne ne se tire soi-même)
- ✅ Pas de doublon (chaque personne reçoit un seul cadeau)
- ✅ Distribution équitable
- ✅ Résultats secrets par participant

### Design Festif
- 🎨 **Thème de Noël** avec couleurs rouge, vert, or
- ❄️ **Flocons de neige animés**
- 🎅 **Polices élégantes** (Playfair Display, Cormorant Garamond)
- 📱 **100% responsive**
- 🇫🇷 **Interface en français**

---

## 🚀 Quelle Version Choisir ?

### Choisissez PHP/MySQL si :
- ✅ Vous avez un hébergement mutualisé classique
- ✅ Vous voulez une installation simple
- ✅ Vous n'avez pas accès à SSH/Terminal
- ✅ Vous débutez en développement web
- ✅ Vous cherchez la solution la moins chère

### Choisissez React + FastAPI si :
- ✅ Vous avez un VPS ou serveur cloud
- ✅ Vous voulez une architecture moderne
- ✅ Vous avez accès à SSH/Terminal
- ✅ Vous êtes à l'aise avec Python et Node.js
- ✅ Vous voulez pouvoir étendre l'application

---

## 📦 Installation Rapide

### Version PHP/MySQL

```bash
# 1. Télécharger les fichiers du dossier /php/
# 2. Uploader via FTP sur votre hébergement
# 3. Créer une base MySQL dans phpMyAdmin
# 4. Importer le fichier database.sql
# 5. Configurer config/database.php
# 6. Accéder à votre-domaine.com/secret-santa/public/
```

**Temps d'installation** : ~10 minutes

**Guide complet** : [php/README_INSTALLATION.md](php/README_INSTALLATION.md)

---

### Version React + FastAPI

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn server:app --reload

# Frontend
cd frontend
yarn install
yarn start

# MongoDB
docker run -d -p 27017:27017 mongo
```

**Temps d'installation** : ~15 minutes

**Guide complet** : [README.md](README.md)

---

## 👤 Compte Administrateur par Défaut

Les deux versions créent automatiquement un compte admin :

```
Email    : eric.savary@netplus.ch
Mot de passe : x4Q45jUn7Hxq4M
```

⚠️ **IMPORTANT** : Changez ce mot de passe après la première connexion !

---

## 📸 Captures d'Écran

### Page de Connexion
![Login](docs/screenshots/login.png)

### Dashboard Administrateur
![Admin](docs/screenshots/admin.png)

### Dashboard Utilisateur
![User](docs/screenshots/user.png)

---

## 🔒 Sécurité

Les deux versions implémentent :
- 🔐 Hashage des mots de passe (bcrypt/password_hash)
- 🎫 Sessions sécurisées (JWT pour React, PHP Sessions pour PHP)
- 🛡️ Protection CSRF
- 🔒 Validation des données côté serveur
- 🚫 Protection contre les injections SQL
- 🔐 HTTPS recommandé

---

## 🆕 Nouveautés Version 2.0

- ✨ **Réinitialisation du tirage** par l'admin
- 🎨 Design amélioré avec meilleurs contrastes
- 📱 Optimisation mobile
- 🐛 Corrections de bugs
- ⚡ Performances optimisées

---

## 🛠️ Technologies Utilisées

### Version PHP/MySQL
| Technologie | Version |
|-------------|---------|
| PHP | 7.4+ / 8.0+ |
| MySQL | 5.7+ |
| HTML5 | - |
| CSS3 | - |
| JavaScript | ES6+ |

### Version React + FastAPI
| Technologie | Version |
|-------------|---------|
| Python | 3.11+ |
| FastAPI | 0.110+ |
| React | 19.0 |
| MongoDB | 5.0+ |
| Tailwind CSS | 3.4+ |
| Shadcn/UI | Latest |

---

## 📂 Structure du Projet

```
secret-santa/
├── php/                          # Version PHP/MySQL
│   ├── api/                      # API REST en PHP
│   ├── config/                   # Configuration
│   ├── includes/                 # Fonctions utilitaires
│   ├── public/                   # Frontend HTML/CSS/JS
│   ├── database.sql              # Schéma MySQL
│   ├── README_INSTALLATION.md    # Guide d'installation
│   └── QUICK_START.md           # Guide rapide
│
├── backend/                      # Version FastAPI (Python)
│   ├── server.py                 # Application FastAPI
│   ├── requirements.txt          # Dépendances Python
│   └── .env                      # Variables d'environnement
│
├── frontend/                     # Version React
│   ├── src/                      # Code source React
│   ├── public/                   # Assets statiques
│   ├── package.json              # Dépendances Node.js
│   └── .env                      # Variables d'environnement
│
├── README.md                     # Ce fichier
└── README_PRINCIPAL.md          # Documentation principale
```

---

## 📖 Documentation Complète

### Version PHP/MySQL
- 📘 [Guide d'Installation Complet](php/README_INSTALLATION.md)
- ⚡ [Quick Start (10 minutes)](php/QUICK_START.md)
- 🔧 [Guide de Dépannage](php/README_INSTALLATION.md#dépannage)
- ✅ [Configuration Complète](php/CONFIGURATION_COMPLETE.md)

### Version React + FastAPI
- 📗 [README Principal](README.md)
- 🚀 [Installation Locale](README.md#installation-locale)
- 🌐 [Déploiement VPS](README.md#déploiement-sur-un-hébergeur)
- 🐳 [Docker Deployment](README.md#option-2--docker-compose)

---

## 🐛 Dépannage

### Problèmes Courants

**Version PHP** :
- Erreur 500 → Vérifier `.htaccess` et `mod_rewrite`
- Connexion BDD → Vérifier `config/database.php`
- Page blanche → Activer `display_errors` temporairement

**Version React/FastAPI** :
- Backend ne démarre pas → Vérifier MongoDB et `.env`
- Frontend erreur → Vérifier `REACT_APP_BACKEND_URL`
- CORS errors → Vérifier `CORS_ORIGINS` dans backend

Consultez les guides de dépannage détaillés dans chaque README.

---

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- 🐛 Signaler des bugs
- ✨ Proposer de nouvelles fonctionnalités
- 📖 Améliorer la documentation
- 🌍 Ajouter des traductions

---

## 📝 License

MIT License - Libre d'utilisation et de modification

---

## 🎅 Joyeux Noël !

Profitez de votre Secret Santa familial et passez d'excellentes fêtes ! 🎄🎁✨

---

## 📞 Support

- 📧 Email : support@votre-domaine.com
- 💬 Issues GitHub : [Créer une issue](https://github.com/votre-repo/issues)
- 📚 Documentation : Voir les README dans chaque dossier

---

**Développé avec ❤️ pour des fêtes magiques**

🎄 Version 2.0 - Décembre 2024
