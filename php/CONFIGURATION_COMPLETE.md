# ✅ Configuration Complète - Secret Santa

## 🔐 Identifiants Base de Données Configurés

Les fichiers suivants ont été mis à jour avec vos identifiants :

### `/config/database.php`
```php
DB_HOST: localhost
DB_NAME: cadeau
DB_USER: cadeau_admin
DB_PASS: DSxl^yiwe9P8wu8$
```

### `/database.sql`
Le script SQL a été modifié pour créer/utiliser la base de données `cadeau`.

## 🆕 Nouvelle Fonctionnalité Ajoutée

### ✨ Réinitialisation du Tirage

L'administrateur peut maintenant **supprimer et relancer** un tirage si celui-ci s'est mal passé.

**Fichiers modifiés** :
- ✅ `api/admin.php` - Nouvelle route `delete-draw`
- ✅ `public/admin.html` - Bouton "Réinitialiser le tirage"
- ✅ `public/js/admin.js` - Fonction `resetDraw()`
- ✅ `public/css/style.css` - Styles additionnels

**Comment ça fonctionne** :

1. **Quand un tirage existe** : Un bouton rouge "🔄 Réinitialiser le tirage" apparaît
2. **Double confirmation** : Deux confirmations sont demandées pour éviter les suppressions accidentelles
3. **Suppression complète** : Le tirage ET toutes les attributions sont supprimés
4. **Nouveau tirage** : Le bouton "Lancer le tirage" redevient actif pour créer un nouveau tirage

**Cas d'usage** :
- Erreur lors du tirage
- Un participant s'est inscrit après le tirage
- Un participant doit être retiré
- Besoin de refaire le tirage pour toute autre raison

## 📋 Prochaines Étapes d'Installation

### 1. Uploader les fichiers
Téléchargez tous les fichiers du dossier `/app/php/` et uploadez-les sur votre serveur via FTP.

### 2. Importer la base de données
1. Connectez-vous à **phpMyAdmin**
2. Sélectionnez la base de données `cadeau` (elle devrait déjà exister)
3. Cliquez sur **Importer**
4. Sélectionnez le fichier `database.sql`
5. Cliquez sur **Exécuter**

### 3. Générer le mot de passe admin
1. Accédez à : `votre-domaine.com/secret-santa/generate_admin_password.php`
2. Copiez le hash généré
3. Dans phpMyAdmin, table `users`, mettez à jour le champ `password_hash`
4. **Supprimez** le fichier `generate_admin_password.php`

### 4. Configurer l'URL de base (optionnel)
Éditez `config/config.php` :
```php
define('BASE_URL', 'https://votre-domaine.com/secret-santa');
```

### 5. Tester l'application
1. Allez sur : `votre-domaine.com/secret-santa/public/index.html`
2. Connectez-vous avec :
   - Email : `eric.savary@netplus.ch`
   - Mot de passe : `x4Q45jUn7Hxq4M`

### 6. Test de la fonctionnalité de réinitialisation
1. Connectez-vous en tant qu'admin
2. Approuvez au moins 2 participants
3. Lancez un tirage
4. Vérifiez que le bouton "Réinitialiser" apparaît
5. Testez la réinitialisation
6. Relancez un nouveau tirage

## 🔒 Sécurité Post-Installation

Après avoir vérifié que tout fonctionne :

- [ ] Changez le mot de passe admin par défaut
- [ ] Modifiez `SECRET_KEY` dans `config/config.php`
- [ ] Supprimez `generate_admin_password.php`
- [ ] Supprimez `test_connection.php`
- [ ] Activez HTTPS (SSL/TLS)
- [ ] Vérifiez que `.htaccess` protège les fichiers sensibles

## 📞 Support

Si vous rencontrez des problèmes :
1. Consultez `README_INSTALLATION.md` pour le dépannage
2. Vérifiez les logs d'erreur PHP de votre hébergeur
3. Utilisez `test_connection.php` pour diagnostiquer les problèmes de BDD

## 🎄 Fonctionnalités de l'Application

✅ Inscription des participants
✅ Validation manuelle par l'admin
✅ Tirage au sort intelligent (pas d'auto-attribution)
✅ **Réinitialisation du tirage** (NOUVEAU!)
✅ Dashboard admin complet
✅ Dashboard utilisateur
✅ Design festif de Noël
✅ Interface 100% en français
✅ Responsive (mobile, tablette, desktop)

---

**Joyeux Noël! 🎅🎁**
