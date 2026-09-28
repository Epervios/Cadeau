async function csrfToken() {
    const response = await fetch(`${API_BASE}/auth.php?action=csrf`, { credentials: 'same-origin', cache: 'no-store' });
    if (!response.ok) throw new Error('Impossible de vérifier la session');
    const data = await response.json();
    return data.csrf_token;
}

// Secret Santa - Login/Register

const API_BASE = '../api';

// Créer les flocons de neige
function createSnowflakes() {
    const container = document.getElementById('snowflakes');
    if (!container) return;
    
    for (let i = 0; i < 20; i++) {
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

// Afficher le formulaire de connexion
function showLogin() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('formTitle').textContent = 'Connexion';
    document.getElementById('formDescription').textContent = 'Connectez-vous pour voir votre attribution';
    
    const tabs = document.querySelectorAll('.tab');
    tabs[0].classList.add('active');
    tabs[1].classList.remove('active');
}

// Afficher le formulaire d'inscription
function showRegister() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
    document.getElementById('formTitle').textContent = 'Inscription';
    document.getElementById('formDescription').textContent = 'Rejoignez le Secret Santa familial';
    
    const tabs = document.querySelectorAll('.tab');
    tabs[0].classList.remove('active');
    tabs[1].classList.add('active');
}

// Afficher un message
function showMessage(text, type = 'success') {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
    messageEl.classList.remove('hidden');
    
    setTimeout(() => {
        messageEl.classList.add('hidden');
    }, 5000);
}

// Gérer la connexion
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        email: document.getElementById('login-email').value,
        password: document.getElementById('login-password').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/auth.php?action=login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': await csrfToken() },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Rediriger selon le rôle
            if (data.user.is_admin) {
                window.location.href = 'admin.html';
            } else if (data.user.is_approved) {
                window.location.href = 'user.html';
            } else {
                showMessage('Votre compte doit être approuvé par l\'administrateur.', 'warning');
            }
        } else {
            showMessage(data.error || 'Erreur de connexion', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('Erreur de connexion au serveur', 'error');
    }
});

// Gérer l'inscription
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        first_name: document.getElementById('register-name').value,
        email: document.getElementById('register-email').value,
        password: document.getElementById('register-password').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/auth.php?action=register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': await csrfToken() },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('Inscription réussie! Votre compte doit être approuvé par l\'administrateur.', 'success');
            document.getElementById('registerForm').reset();
            setTimeout(() => showLogin(), 2000);
        } else {
            showMessage(data.error || 'Erreur d\'inscription', 'error');
        }
    } catch (error) {
        console.error('Register error:', error);
        showMessage('Erreur de connexion au serveur', 'error');
    }
});

// Initialisation
createSnowflakes();