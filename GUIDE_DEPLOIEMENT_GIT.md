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
