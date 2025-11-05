# 🎄 Secret Santa - Application de Tirage au Sort Familial

Application web festive pour organiser un tirage au sort Secret Santa en famille. Chaque participant reçoit secrètement le nom d'une personne à qui offrir un cadeau.

![Secret Santa](https://img.shields.io/badge/Joyeux-Noël-red?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

## ✨ Fonctionnalités

- 🎁 **Inscription des participants** : Prénom, email, mot de passe
- 👮 **Validation par l'administrateur** : Approbation manuelle des nouvelles inscriptions
- 🎲 **Tirage au sort intelligent** : Algorithme garantissant pas d'auto-attribution ni de doublon
- 🔒 **Résultats secrets** : Chaque participant voit uniquement son attribution
- 📅 **Gestion annuelle** : Nouveau tirage chaque année
- 🎨 **Design festif** : Thème de Noël avec flocons de neige animés
- 🇫🇷 **Interface en français**

## 🛠️ Technologies Utilisées

### Backend
- **FastAPI** (Python 3.11+)
- **MongoDB** (Base de données NoSQL)
- **JWT** (Authentification)
- **bcrypt** (Hachage des mots de passe)
- **Motor** (Driver MongoDB asynchrone)

### Frontend
- **React 19**
- **Tailwind CSS**
- **Shadcn/UI** (Composants UI)
- **React Router** (Navigation)
- **Axios** (Requêtes HTTP)
- **Sonner** (Notifications toast)

## 📋 Prérequis

- Python 3.11 ou supérieur
- Node.js 18 ou supérieur
- MongoDB 5.0 ou supérieur
- Yarn (gestionnaire de paquets)

## 🚀 Installation Locale

### 1. Cloner le projet

```bash
git clone <votre-repo>
cd secret-santa
```

### 2. Configuration Backend

```bash
cd backend

# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos paramètres
```

**Fichier `.env` du backend** :
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=secret_santa_db
CORS_ORIGINS=http://localhost:3000
JWT_SECRET=votre-secret-jwt-tres-securise-changez-moi
```

### 3. Configuration Frontend

```bash
cd ../frontend

# Installer les dépendances
yarn install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos paramètres
```

**Fichier `.env` du frontend** :
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

### 4. Lancer MongoDB

```bash
# Avec Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Ou installer MongoDB localement
# https://www.mongodb.com/docs/manual/installation/
```

### 5. Démarrer l'application

**Terminal 1 - Backend** :
```bash
cd backend
source venv/bin/activate
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

**Terminal 2 - Frontend** :
```bash
cd frontend
yarn start
```

L'application sera accessible sur `http://localhost:3000`

## 🌐 Déploiement sur un Hébergeur

### Option 1 : VPS (Ubuntu/Debian)

#### 1. Préparer le serveur

```bash
# Se connecter au serveur
ssh user@votre-serveur.com

# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer les dépendances
sudo apt install -y python3.11 python3-pip nodejs npm mongodb nginx certbot python3-certbot-nginx

# Installer Yarn
npm install -g yarn

# Installer PM2 pour gérer les processus
npm install -g pm2
```

#### 2. Configurer MongoDB

```bash
# Démarrer MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Sécuriser MongoDB (optionnel mais recommandé)
mongosh
> use admin
> db.createUser({
  user: "secretsanta",
  pwd: "votre-mot-de-passe-securise",
  roles: ["readWrite", "dbAdmin"]
})
> exit
```

#### 3. Cloner et configurer le projet

```bash
# Créer un répertoire pour l'application
sudo mkdir -p /var/www/secret-santa
sudo chown $USER:$USER /var/www/secret-santa
cd /var/www/secret-santa

# Cloner le projet
git clone <votre-repo> .

# Configuration Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Créer le fichier .env
nano .env
```

**Backend `.env` pour production** :
```env
MONGO_URL=mongodb://secretsanta:votre-mot-de-passe@localhost:27017/secret_santa_db
DB_NAME=secret_santa_db
CORS_ORIGINS=https://votre-domaine.com
JWT_SECRET=generez-un-secret-jwt-securise-avec-openssl-rand-hex-32
```

```bash
# Configuration Frontend
cd ../frontend
yarn install

# Créer le fichier .env
nano .env
```

**Frontend `.env` pour production** :
```env
REACT_APP_BACKEND_URL=https://votre-domaine.com
```

```bash
# Build du frontend
yarn build
```

#### 4. Configurer PM2 pour le backend

```bash
cd /var/www/secret-santa

# Créer le fichier de configuration PM2
nano ecosystem.config.js
```

**Fichier `ecosystem.config.js`** :
```javascript
module.exports = {
  apps: [{
    name: 'secret-santa-backend',
    script: '/var/www/secret-santa/backend/venv/bin/uvicorn',
    args: 'server:app --host 0.0.0.0 --port 8001',
    cwd: '/var/www/secret-santa/backend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

```bash
# Démarrer l'application avec PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 5. Configurer Nginx

```bash
sudo nano /etc/nginx/sites-available/secret-santa
```

**Configuration Nginx** :
```nginx
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;

    # Frontend React
    root /var/www/secret-santa/frontend/build;
    index index.html;

    # Servir les fichiers statiques React
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy vers le backend FastAPI
    location /api {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/secret-santa /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 6. Configurer SSL avec Let's Encrypt

```bash
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com
```

#### 7. Configurer le pare-feu

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

### Option 2 : Docker Compose

#### 1. Créer `docker-compose.yml`

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    container_name: secret-santa-mongodb
    restart: always
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: changeme

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: secret-santa-backend
    restart: always
    ports:
      - "8001:8001"
    depends_on:
      - mongodb
    environment:
      MONGO_URL: mongodb://admin:changeme@mongodb:27017
      DB_NAME: secret_santa_db
      JWT_SECRET: votre-secret-jwt-securise
      CORS_ORIGINS: http://localhost:3000

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: secret-santa-frontend
    restart: always
    ports:
      - "3000:80"
    depends_on:
      - backend
    environment:
      REACT_APP_BACKEND_URL: http://localhost:8001

volumes:
  mongodb_data:
```

#### 2. Créer les Dockerfiles

**Backend `Dockerfile`** :
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
```

**Frontend `Dockerfile`** :
```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Frontend `nginx.conf`** :
```dockerfile
server {
    listen 80;
    location / {
        root /usr/share/nginx/html;
        try_files $uri /index.html;
    }
}
```

#### 3. Lancer avec Docker Compose

```bash
docker-compose up -d
```

### Option 3 : Plateforme Cloud (Render, Railway, Fly.io)

Ces plateformes détectent automatiquement Python et Node.js.

**Configuration pour Render** :

1. **Backend** :
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn server:app --host 0.0.0.0 --port $PORT`

2. **Frontend** :
   - Build Command: `yarn install && yarn build`
   - Publish Directory: `build`

3. **MongoDB** : Utiliser MongoDB Atlas (gratuit) : https://www.mongodb.com/cloud/atlas

## 👤 Compte Administrateur

Par défaut, un compte admin est créé automatiquement :

- **Email** : `eric.savary@netplus.ch`
- **Mot de passe** : `x4Q45jUn7Hxq4M`

⚠️ **Important** : Changez ce mot de passe après la première connexion en production !

## 📖 Utilisation

### Pour l'administrateur :

1. Se connecter avec les identifiants admin
2. Approuver les participants inscrits
3. Lancer le tirage au sort (minimum 2 participants)
4. Le tirage est créé pour l'année en cours

### Pour les participants :

1. S'inscrire avec prénom, email, mot de passe
2. Attendre l'approbation de l'administrateur
3. Se connecter après approbation
4. Voir son attribution Secret Santa après le tirage

## 📁 Structure du Projet

```
secret-santa/
├── backend/
│   ├── server.py           # Application FastAPI
│   ├── requirements.txt    # Dépendances Python
│   └── .env               # Configuration backend
├── frontend/
│   ├── src/
│   │   ├── App.js         # Composant principal
│   │   ├── pages/         # Pages de l'application
│   │   └── components/    # Composants UI
│   ├── package.json       # Dépendances Node.js
│   └── .env              # Configuration frontend
└── README.md
```

## 🔧 Maintenance

### Mettre à jour l'application

```bash
# Backend
cd backend
source venv/bin/activate
pip install --upgrade -r requirements.txt
pm2 restart secret-santa-backend

# Frontend
cd frontend
yarn install
yarn build
sudo systemctl restart nginx
```

### Sauvegarder la base de données

```bash
# Backup
mongodump --db secret_santa_db --out /backup/mongodb/$(date +%Y%m%d)

# Restore
mongorestore --db secret_santa_db /backup/mongodb/20241105/secret_santa_db
```

### Logs

```bash
# Backend logs
pm2 logs secret-santa-backend

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🐛 Dépannage

### Le backend ne démarre pas
- Vérifier que MongoDB est démarré : `sudo systemctl status mongodb`
- Vérifier les logs : `pm2 logs secret-santa-backend`
- Vérifier le fichier `.env` du backend

### Le frontend ne se connecte pas au backend
- Vérifier `REACT_APP_BACKEND_URL` dans le `.env` du frontend
- Vérifier la configuration Nginx
- Vérifier les CORS dans le backend

### Erreur MongoDB connection
- Vérifier que MongoDB est accessible
- Vérifier `MONGO_URL` dans le `.env` du backend
- Tester la connexion : `mongosh mongodb://localhost:27017`

## 📝 License

MIT License - Libre d'utilisation

## 🎅 Joyeux Noël !

N'hésitez pas à personnaliser cette application pour votre famille et vos amis !

---

Développé avec ❤️ pour des fêtes magiques 🎄✨
