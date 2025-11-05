// Secret Santa - Admin Dashboard

const API_BASE = '../api';

let allUsers = [];
let pendingUsers = [];
let drawStatus = {};

// Charger les données
async function loadData() {
    try {
        const [usersRes, pendingRes, statusRes] = await Promise.all([
            fetch(`${API_BASE}/admin.php?action=users`),
            fetch(`${API_BASE}/admin.php?action=pending-users`),
            fetch(`${API_BASE}/user.php?action=draw-status`)
        ]);
        
        if (!usersRes.ok || !pendingRes.ok || !statusRes.ok) {
            // Non authentifié ou non autorisé
            window.location.href = 'index.html';
            return;
        }
        
        allUsers = await usersRes.json();
        pendingUsers = await pendingRes.json();
        drawStatus = await statusRes.json();
        
        updateUI();
    } catch (error) {
        console.error('Load error:', error);
        showToast('Erreur de chargement des données', 'error');
    }
}

// Mettre à jour l'interface
function updateUI() {
    const approvedUsers = allUsers.filter(u => u.is_approved);
    
    // Stats
    document.getElementById('approvedCount').textContent = approvedUsers.length;
    document.getElementById('pendingCount').textContent = pendingUsers.length;
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    const statusBadge = document.getElementById('drawStatus');
    if (drawStatus.has_draw) {
        statusBadge.textContent = 'Tirage effectué';
        statusBadge.style.background = '#16a34a';
        document.getElementById('createDrawBtn').disabled = true;
        document.getElementById('createDrawBtn').textContent = 'Tirage déjà effectué';
    } else {
        statusBadge.textContent = 'Pas de tirage';
        statusBadge.style.background = '#9ca3af';
    }
    
    // Bouton tirage
    const drawBtn = document.getElementById('createDrawBtn');
    const resetDrawBtn = document.getElementById('resetDrawBtn');
    const drawWarning = document.getElementById('drawWarning');
    const drawInfo = document.getElementById('drawInfo');
    
    if (approvedUsers.length < 2) {
        drawBtn.disabled = true;
        drawWarning.classList.remove('hidden');
    } else {
        drawWarning.classList.add('hidden');
    }
    
    // Afficher le bouton de réinitialisation si un tirage existe
    if (drawStatus.has_draw) {
        resetDrawBtn.style.display = 'inline-block';
        drawInfo.classList.remove('hidden');
    } else {
        resetDrawBtn.style.display = 'none';
        drawInfo.classList.add('hidden');
    }
    
    // Liste des utilisateurs en attente
    const pendingSection = document.getElementById('pendingSection');
    const pendingList = document.getElementById('pendingList');
    
    if (pendingUsers.length > 0) {
        pendingSection.classList.remove('hidden');
        pendingList.innerHTML = pendingUsers.map(user => `
            <div class="user-item">
                <div class="user-info">
                    <h4>${escapeHtml(user.first_name)}</h4>
                    <p>${escapeHtml(user.email)}</p>
                </div>
                <div class="user-actions">
                    <button onclick="approveUser(${user.id})" class="btn btn-success btn-small">Approuver</button>
                    <button onclick="rejectUser(${user.id})" class="btn btn-danger btn-small">Rejeter</button>
                </div>
            </div>
        `).join('');
    } else {
        pendingSection.classList.add('hidden');
    }
    
    // Liste de tous les utilisateurs
    document.getElementById('totalUsers').textContent = allUsers.length;
    document.getElementById('userList').innerHTML = allUsers.map(user => `
        <div class="user-item">
            <div class="user-info">
                <h4>${escapeHtml(user.first_name)}</h4>
                <p>${escapeHtml(user.email)}</p>
            </div>
            <div class="user-actions">
                ${user.is_admin ? '<span class="badge badge-admin">Admin</span>' : ''}
                ${user.is_approved ? '<span class="badge badge-approved">Approuvé</span>' : '<span class="badge badge-pending">En attente</span>'}
            </div>
        </div>
    `).join('');
}

// Approuver un utilisateur
async function approveUser(userId) {
    try {
        const response = await fetch(`${API_BASE}/admin.php?action=approve-user&user_id=${userId}`, {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showToast('Utilisateur approuvé!', 'success');
            loadData();
        } else {
            showToast(data.error || 'Erreur', 'error');
        }
    } catch (error) {
        console.error('Approve error:', error);
        showToast('Erreur de connexion', 'error');
    }
}

// Rejeter un utilisateur
async function rejectUser(userId) {
    if (!confirm('Voulez-vous vraiment rejeter cet utilisateur?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/admin.php?action=reject-user&user_id=${userId}`, {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showToast('Utilisateur rejeté', 'success');
            loadData();
        } else {
            showToast(data.error || 'Erreur', 'error');
        }
    } catch (error) {
        console.error('Reject error:', error);
        showToast('Erreur de connexion', 'error');
    }
}

// Créer un tirage
async function createDraw() {
    if (!confirm('Voulez-vous lancer le tirage au sort? Cette action ne peut pas être annulée.')) return;
    
    try {
        const response = await fetch(`${API_BASE}/admin.php?action=create-draw`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ year: new Date().getFullYear() })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showToast('Tirage créé avec succès!', 'success');
            loadData();
        } else {
            showToast(data.error || 'Erreur lors du tirage', 'error');
        }
    } catch (error) {
        console.error('Draw error:', error);
        showToast('Erreur de connexion', 'error');
    }
}

// Déconnexion
function logout() {
    fetch(`${API_BASE}/auth.php?action=logout`, { method: 'POST' })
        .then(() => {
            window.location.href = 'index.html';
        });
}

// Afficher un toast
function showToast(text, type = 'success') {
    const toast = document.getElementById('message');
    toast.textContent = text;
    toast.className = `message-toast ${type}`;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// Echapper le HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialisation
loadData();