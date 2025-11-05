# 🎄 Secret Santa - Guide Rapide d'Installation

**Version PHP/MySQL pour hébergement mutualisé**

## ⚡ Installation en 10 minutes

### Étape 1 : Upload (2 min)
1. Téléchargez tous les fichiers
2. Connectez-vous à votre FTP
3. Uploadez tous les fichiers dans `public_html/secret-santa/`

### Étape 2 : Base de données (3 min)
1. Ouvrez **phpMyAdmin**
2. Créez une base `secret_santa`
3. Importez le fichier `database.sql`

### Étape 3 : Configuration (2 min)
Éditez `config/database.php` :
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'secret_santa');
define('DB_USER', 'votre_user');
define('DB_PASS', 'votre_password');
```

### Étape 4 : Mot de passe admin (2 min)
1. Accédez à `votre-domaine.com/secret-santa/generate_admin_password.php`
2. Copiez le hash généré
3. Dans phpMyAdmin, table `users`, modifiez le champ `password_hash`
4. **Supprimez** `generate_admin_password.php`

### Étape 5 : Test (1 min)
1. Allez sur `votre-domaine.com/secret-santa/public/index.html`
2. Connectez-vous avec :
   - Email : `eric.savary@netplus.ch`
   - Mot de passe : `x4Q45jUn7Hxq4M`

## ✅ C'est fait !

Votre application Secret Santa est prête ! 🎅

---

## 📞 Besoin d'aide ?

Consultez le [README_INSTALLATION.md](README_INSTALLATION.md) pour le guide détaillé avec dépannage.

## 🔒 Sécurité

Après l'installation :
- [ ] Changez le mot de passe admin
- [ ] Modifiez `SECRET_KEY` dans `config/config.php`
- [ ] Supprimez `generate_admin_password.php`
- [ ] Supprimez `test_connection.php`
- [ ] Activez HTTPS

## 📱 Hébergeurs Testés

✅ OVH • ✅ Hostinger • ✅ o2switch • ✅ Infomaniak • ✅ PlanetHoster

---

**Joyeux Noël ! 🎄🎁**
