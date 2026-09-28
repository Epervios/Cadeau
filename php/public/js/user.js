async function csrfToken() {
    const response = await fetch(`${API_BASE}/auth.php?action=csrf`, { credentials: 'same-origin', cache: 'no-store' });
    if (!response.ok) throw new Error('Impossible de vérifier la session');
    const data = await response.json();
    return data.csrf_token;
}

// Secret Santa - User Dashboard

const API_BASE = '../api';

// Créer les flocons de neige
function createSnowflakes() {
    const container = document.getElementById('snowflakes');
    if (!container) return;
    
    for (let i = 0; i < 15; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.innerHTML = '❄️';
        snowflake.style.left = Math.random() * 100 + '%';
        snowflake.style.animationDuration = (10 + Math.random() * 10) + 's';
        snowflake.style.animationDelay = Math.random() * 5 + 's';
        snowflake.style.fontSize = (10 + Math.random() * 20) + 'px';
        container.appendChild(snowflake);
    }
}

// Charger l'attribution
async function loadAssignment() {
    try {
        const response = await fetch(`${API_BASE}/user.php?action=assignment`);
        
        if (!response.ok) {
            // Non authentifié
            window.location.href = 'index.html';
            return;
        }
        
        const data = await response.json();
        
        document.getElementById('loadingSpinner').classList.add('hidden');
        
        if (data.has_draw && data.assignment) {
            // Afficher l'attribution
            document.getElementById('assignmentCard').classList.remove('hidden');
            document.getElementById('assignmentYear').textContent = data.year;
            document.getElementById('assignmentName').textContent = data.assignment;
            document.getElementById('pageTitle').textContent = `Secret Santa ${data.year}`;
        } else {
            // Pas de tirage
            document.getElementById('noDrawCard').classList.remove('hidden');
            document.getElementById('noDrawYear').textContent = data.year;
        }
    } catch (error) {
        console.error('Load error:', error);
        document.getElementById('loadingSpinner').classList.add('hidden');
        // Une panne n'est pas l'absence de tirage : montrer une erreur explicite.
        document.getElementById('noDrawCard').classList.add('hidden');
        document.getElementById('loadingSpinner').insertAdjacentHTML('afterend',
            '<p role="alert">Impossible de charger votre attribution. Réessayez plus tard.</p>');
    }
}

// Déconnexion
async function logout() {
    try {
        await fetch(`${API_BASE}/auth.php?action=logout`, {
            method: 'POST', headers: { 'X-CSRF-Token': await csrfToken() }
        });
    } finally {
        window.location.href = 'index.html';
    }
}

// Initialisation
createSnowflakes();
loadAssignment();