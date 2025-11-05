#!/bin/bash
# Script de déploiement rapide sur Git pour Secret Santa
# Usage: ./deploy_to_git.sh

echo "🎄 Secret Santa - Déploiement sur Git"
echo "======================================"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifier si Git est installé
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git n'est pas installé. Installez-le d'abord.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Git est installé${NC}"
echo ""

# Vérifier si c'est déjà un dépôt Git
if [ -d ".git" ]; then
    echo -e "${YELLOW}⚠️  Ce dossier est déjà un dépôt Git${NC}"
    read -p "Voulez-vous continuer ? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}Initialisation du dépôt Git...${NC}"
    git init
    echo -e "${GREEN}✅ Dépôt Git initialisé${NC}"
    echo ""
fi

# Vérifier les fichiers sensibles
echo "🔒 Vérification de la sécurité..."
SENSITIVE_FILES=("backend/.env" "frontend/.env" "php/config/database.php")
FOUND_SENSITIVE=false

for file in "${SENSITIVE_FILES[@]}"; do
    if git ls-files --error-unmatch "$file" &> /dev/null; then
        echo -e "${RED}❌ ATTENTION: $file est tracké par Git!${NC}"
        FOUND_SENSITIVE=true
    fi
done

if [ "$FOUND_SENSITIVE" = true ]; then
    echo -e "${RED}❌ Des fichiers sensibles sont trackés. Supprimez-les d'abord avec:${NC}"
    echo "   git rm --cached backend/.env"
    echo "   git rm --cached frontend/.env"
    echo "   git rm --cached php/config/database.php"
    exit 1
fi

echo -e "${GREEN}✅ Aucun fichier sensible détecté${NC}"
echo ""

# Copier README_PRINCIPAL comme README.md
if [ -f "README_PRINCIPAL.md" ]; then
    echo "📝 Copie de README_PRINCIPAL.md vers README.md..."
    cp README_PRINCIPAL.md README.md
    echo -e "${GREEN}✅ README.md créé${NC}"
fi

# Ajouter tous les fichiers
echo ""
echo "📦 Ajout des fichiers..."
git add .

# Afficher le statut
echo ""
echo "📊 Statut des fichiers:"
git status --short

echo ""
read -p "Voulez-vous faire le commit ? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Annulé"
    exit 1
fi

# Commit
echo ""
read -p "Message du commit (ou Enter pour message par défaut): " COMMIT_MSG
if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="🎄 Initial commit - Secret Santa Application v2.0"
fi

git commit -m "$COMMIT_MSG"
echo -e "${GREEN}✅ Commit effectué${NC}"

# Demander l'URL du dépôt distant
echo ""
echo "🌐 Configuration du dépôt distant"
echo "================================"
echo ""
echo "1. Créez un dépôt sur GitHub: https://github.com/new"
echo "2. Copiez l'URL de votre dépôt (ex: https://github.com/username/secret-santa.git)"
echo ""

# Vérifier si origin existe déjà
if git remote | grep -q "origin"; then
    CURRENT_ORIGIN=$(git remote get-url origin)
    echo -e "${YELLOW}⚠️  Un remote 'origin' existe déjà: $CURRENT_ORIGIN${NC}"
    read -p "Voulez-vous le changer ? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "URL du nouveau dépôt GitHub: " REPO_URL
        if [ ! -z "$REPO_URL" ]; then
            git remote set-url origin "$REPO_URL"
            echo -e "${GREEN}✅ Remote origin mis à jour${NC}"
        fi
    fi
else
    read -p "URL de votre dépôt GitHub: " REPO_URL
    if [ -z "$REPO_URL" ]; then
        echo -e "${YELLOW}⚠️  Aucune URL fournie. Vous devrez configurer manuellement:${NC}"
        echo "   git remote add origin https://github.com/username/secret-santa.git"
        exit 0
    fi
    
    git remote add origin "$REPO_URL"
    echo -e "${GREEN}✅ Remote origin ajouté${NC}"
fi

# Push vers GitHub
echo ""
read -p "Voulez-vous pousser vers GitHub maintenant ? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${YELLOW}Pour pousser plus tard, utilisez:${NC}"
    echo "   git branch -M main"
    echo "   git push -u origin main"
    exit 0
fi

echo ""
echo "🚀 Push vers GitHub..."

# S'assurer qu'on est sur main
git branch -M main

# Push
if git push -u origin main; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}✅ Déploiement réussi !${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo "🎉 Votre projet Secret Santa est maintenant sur GitHub !"
    echo ""
    echo "📝 Prochaines étapes recommandées:"
    echo "   1. Ajoutez une LICENSE: git add LICENSE && git commit -m '📄 Add LICENSE' && git push"
    echo "   2. Ajoutez des topics sur GitHub (php, mysql, react, christmas, etc.)"
    echo "   3. Ajoutez des screenshots dans docs/screenshots/"
    echo "   4. Créez une release: git tag -a v2.0.0 -m 'Release v2.0' && git push origin v2.0.0"
    echo ""
    echo "🌟 N'oubliez pas de mettre une star à votre propre projet ! 😉"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Erreur lors du push${NC}"
    echo ""
    echo "Causes possibles:"
    echo "   - URL du dépôt incorrecte"
    echo "   - Problème d'authentification GitHub"
    echo "   - Dépôt non vide (contient déjà des fichiers)"
    echo ""
    echo "Solutions:"
    echo "   1. Vérifiez l'URL: git remote -v"
    echo "   2. Configurez vos identifiants GitHub"
    echo "   3. Si le dépôt n'est pas vide, utilisez: git pull origin main --allow-unrelated-histories"
    exit 1
fi
