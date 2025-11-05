# 🎄 Secret Santa PHP/MySQL - Installation sur Hébergement Mutualisé

Guide complet d'installation pour hébergement classique (cPanel, Plesk, OVH, etc.)

## 📋 Prérequis

Votre hébergement doit avoir :
- **PHP 7.4 ou supérieur** (idéalement PHP 8.0+)
- **MySQL 5.7 ou supérieur** (ou MariaDB 10.3+)
- **Accès FTP ou gestionnaire de fichiers**
- **phpMyAdmin ou accès MySQL**
- **Extensions PHP** : PDO, PDO_MySQL, session, json

## 🚀 Installation Étape par Étape

### Étape 1 : Télécharger les fichiers

1. Téléchargez tous les fichiers du dossier `/php` de ce projet
2. Vous devriez avoir cette structure :

```
secret-santa/
├── api/
│   ├── auth.php
│   ├── admin.php
│   └── user.php
├── config/
│   ├── database.php
│   └── config.php
├── includes/
│   └── functions.php
├── public/
│   ├── index.html
│   ├── admin.html
│   ├── user.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── app.js
│       ├── admin.js
│       └── user.js
├── database.sql
├── .htaccess
└── README_INSTALLATION.md
```

### Étape 2 : Uploader les fichiers sur votre hébergement

#### Option A : Via FTP (FileZilla, WinSCP, etc.)

1. Connectez-vous à votre FTP :
   - **Hôte** : ftp.votre-domaine.com (fourni par votre hébergeur)
   - **Utilisateur** : votre identifiant FTP
   - **Mot de passe** : votre mot de passe FTP

2. Naviguez vers le dossier racine de votre site :
   - Généralement `/public_html/` ou `/www/` ou `/htdocs/`

3. Créez un dossier `secret-santa` (optionnel)

4. Uploadez TOUS les fichiers dans ce dossier

#### Option B : Via le gestionnaire de fichiers de votre hébergeur

1. Connectez-vous à votre panneau de contrôle (cPanel, Plesk, etc.)
2. Ouvrez le **Gestionnaire de fichiers**
3. Naviguez vers `public_html/`
4. Créez un nouveau dossier `secret-santa`
5. Entrez dans ce dossier
6. Cliquez sur **Upload** et uploadez tous les fichiers
7. Si vous avez uploadé un ZIP, extrayez-le directement sur le serveur

### Étape 3 : Créer la base de données MySQL

#### Via phpMyAdmin :

1. Connectez-vous à **phpMyAdmin** depuis votre panneau de contrôle

2. **Créer une nouvelle base de données** :
   - Cliquez sur "Nouvelle base de données" ou "New Database"
   - Nom : `secret_santa` (ou un nom de votre choix)
   - Interclassement : `utf8mb4_unicode_ci`
   - Cliquez sur **Créer**

3. **Créer un utilisateur MySQL** (si nécessaire) :
   - Allez dans l'onglet "Privilèges" ou "Users"
   - Cliquez sur "Ajouter un utilisateur"
   - **Nom d'utilisateur** : `secret_santa_user` (ou votre choix)
   - **Mot de passe** : Créez un mot de passe fort
   - Cochez "Accorder tous les privilèges pour la base de données secret_santa"
   - Cliquez sur **Exécuter**

4. **Importer le schéma de base de données** :
   - Sélectionnez votre base de données `secret_santa` dans la liste à gauche
   - Cliquez sur l'onglet **Importer**
   - Cliquez sur **Choisir un fichier**
   - Sélectionnez le fichier `database.sql` que vous avez uploadé
   - Cliquez sur **Exécuter** en bas de la page
   - Vous devriez voir un message de succès

### Étape 4 : Configurer la connexion à la base de données

1. Ouvrez le fichier `config/database.php` via FTP ou le gestionnaire de fichiers

2. Modifiez les constantes avec VOS informations :

```php
<?php
define('DB_HOST', 'localhost'); // Généralement 'localhost', vérifiez avec votre hébergeur
define('DB_NAME', 'secret_santa'); // Le nom de votre base de données
define('DB_USER', 'secret_santa_user'); // Votre utilisateur MySQL
define('DB_PASS', 'votre_mot_de_passe'); // Votre mot de passe MySQL
define('DB_CHARSET', 'utf8mb4');
?>
```

**⚠️ Important** : Certains hébergeurs utilisent un préfixe pour les bases de données. Par exemple :
- Nom réel de la BDD : `votrecompte_secret_santa`
- Utilisateur réel : `votrecompte_user`

3. **Sauvegardez** le fichier

### Étape 5 : Configurer l'application

1. Ouvrez le fichier `config/config.php`

2. Modifiez les paramètres :

```php
// Chemin de base (ne pas modifier généralement)
define('BASE_PATH', dirname(__DIR__));

// URL de base de votre application
define('BASE_URL', 'https://votre-domaine.com/secret-santa');
// Ou si à la racine : 'https://votre-domaine.com'

// Clé secrète (CHANGEZ CETTE VALEUR !)
define('SECRET_KEY', 'generez-une-cle-aleatoire-tres-longue-et-securisee');
```

3. **Générer une clé secrète** : Utilisez un générateur en ligne ou créez une chaîne aléatoire longue

4. **Sauvegardez** le fichier

### Étape 6 : Créer le mot de passe de l'admin

L'utilisateur admin est créé automatiquement, mais vous devez régénérer son mot de passe.

1. Créez un fichier temporaire `generate_password.php` à la racine :

```php
<?php
// Générer le hash du mot de passe admin
$password = 'x4Q45jUn7Hxq4M'; // Le mot de passe que vous voulez
$hash = password_hash($password, PASSWORD_DEFAULT);
echo "Hash à copier : " . $hash;
?>
```

2. Accédez à ce fichier dans votre navigateur :
   - `https://votre-domaine.com/secret-santa/generate_password.php`

3. **Copiez le hash affiché**

4. Dans **phpMyAdmin** :
   - Ouvrez la table `users`
   - Trouvez la ligne avec l'email `eric.savary@netplus.ch`
   - Cliquez sur **Modifier**
   - Remplacez le champ `password_hash` par le hash que vous avez copié
   - Cliquez sur **Exécuter**

5. **Supprimez le fichier `generate_password.php`** (important pour la sécurité !)

### Étape 7 : Vérifier les permissions

1. Assurez-vous que les fichiers ont les bonnes permissions :
   - **Dossiers** : 755
   - **Fichiers PHP** : 644

2. Via FTP ou gestionnaire de fichiers :
   - Clic droit sur un dossier → Permissions → Définir 755
   - Clic droit sur un fichier → Permissions → Définir 644

### Étape 8 : Tester l'installation

1. Ouvrez votre navigateur et allez sur :
   ```
   https://votre-domaine.com/secret-santa/public/index.html
   ```

2. Vous devriez voir la page de connexion/inscription avec le design festif de Noël ! 🎄

3. **Test de connexion admin** :
   - Email : `eric.savary@netplus.ch`
   - Mot de passe : `x4Q45jUn7Hxq4M` (ou celui que vous avez défini)

4. Si tout fonctionne, vous devriez être redirigé vers le dashboard admin !

## 🔧 Configuration Avancée

### Rediriger le dossier public vers la racine

Si vous voulez que l'application soit accessible directement à `https://votre-domaine.com/` :

1. Déplacez tous les fichiers du dossier `public/` vers la racine de votre site

2. Modifiez les chemins dans les fichiers HTML :
   - Dans `index.html`, `admin.html`, `user.html`
   - Changez `../api/` en `api/`

3. Mettez à jour `.htaccess` si nécessaire

### Activer HTTPS (Recommandé)

La plupart des hébergeurs offrent SSL gratuit (Let's Encrypt) :

1. Dans votre panneau de contrôle, cherchez **SSL/TLS**
2. Activez le certificat SSL pour votre domaine
3. Ajoutez une redirection HTTPS dans `.htaccess` :

```apache
# Décommentez ces lignes dans .htaccess
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### Sécuriser le dossier config/

Ajoutez un fichier `.htaccess` dans le dossier `config/` :

```apache
Order deny,allow
Deny from all
```

## 🐛 Dépannage

### Erreur "Internal Server Error" (500)

**Cause** : Problème avec `.htaccess` ou PHP

**Solution** :
1. Vérifiez que mod_rewrite est activé (demandez à votre hébergeur)
2. Essayez de renommer `.htaccess` temporairement
3. Vérifiez les logs d'erreur dans votre panneau de contrôle

### Erreur "Database connection failed"

**Cause** : Problème de connexion à MySQL

**Solution** :
1. Vérifiez les informations dans `config/database.php`
2. Vérifiez que l'utilisateur MySQL a les privilèges nécessaires
3. Demandez à votre hébergeur le nom d'hôte correct (parfois ce n'est pas `localhost`)
4. Vérifiez les préfixes de base de données imposés par l'hébergeur

### La page reste blanche

**Cause** : Erreur PHP non affichée

**Solution** :
1. Activez temporairement l'affichage des erreurs dans `config/config.php` :
   ```php
   ini_set('display_errors', 1);
   error_reporting(E_ALL);
   ```
2. Rechargez la page pour voir l'erreur
3. Une fois le problème résolu, remettez `display_errors` à 0

### Les sessions ne fonctionnent pas

**Cause** : Problème de permissions ou configuration PHP

**Solution** :
1. Vérifiez que les sessions sont activées dans php.ini
2. Contactez votre hébergeur pour vérifier la configuration des sessions
3. Essayez d'ajouter au début de `config/config.php` :
   ```php
   ini_set('session.save_path', '/tmp');
   ```

### Les fichiers ne s'uploadent pas via FTP

**Cause** : Problème de connexion FTP

**Solution** :
1. Utilisez le mode **Passif** dans votre client FTP
2. Vérifiez vos identifiants FTP dans votre panneau de contrôle
3. Essayez SFTP si disponible (plus sécurisé)

### L'API ne répond pas (erreur 404)

**Cause** : Chemins incorrects ou mod_rewrite

**Solution** :
1. Vérifiez que les chemins dans les fichiers JS pointent vers `../api/`
2. Vérifiez que le fichier `.htaccess` est bien uploadé
3. Testez directement : `https://votre-domaine.com/secret-santa/api/auth.php`

## 📱 Hébergeurs Populaires - Notes Spécifiques

### OVH
- Base de données : Le préfixe est automatique (ex: `votrenom_secret_santa`)
- FTP : Utilisez le mode passif
- SSL : Gratuit avec Let's Encrypt dans le panneau

### Hostinger
- MySQL : Créez la BDD via "Bases de données MySQL"
- Utilisez le nom complet avec préfixe
- SSL : Activable gratuitement dans le panneau

### o2switch
- Base de données : Pas de préfixe imposé
- Excellent support technique en français
- SSL : Automatique avec Let's Encrypt

### Infomaniak
- MySQL : Créez via "Hébergement web > Bases de données"
- FTP : Utilisez les identifiants de l'hébergement
- SSL : Inclus et activé par défaut

## 🔒 Sécurité Importante

### Après l'installation :

1. **Changez le mot de passe admin** immédiatement
2. **Modifiez SECRET_KEY** dans `config/config.php`
3. **Supprimez le fichier** `generate_password.php` si créé
4. **Protégez le dossier config/** avec `.htaccess`
5. **Activez HTTPS** via Let's Encrypt
6. **Faites des sauvegardes régulières** de la base de données
7. **Désactivez l'affichage des erreurs** en production (`display_errors = 0`)

## 📊 Maintenance

### Sauvegarder la base de données

Via phpMyAdmin :
1. Sélectionnez votre base de données
2. Cliquez sur **Exporter**
3. Format : SQL
4. Méthode : Rapide
5. Cliquez sur **Exécuter**
6. Téléchargez le fichier `.sql`

### Restaurer une sauvegarde

Via phpMyAdmin :
1. Sélectionnez votre base de données
2. Cliquez sur **Importer**
3. Choisissez votre fichier `.sql`
4. Cliquez sur **Exécuter**

### Réinitialiser pour une nouvelle année

```sql
-- Exécutez dans phpMyAdmin pour recommencer
DELETE FROM assignments WHERE draw_id IN (SELECT id FROM draws WHERE year = 2025);
DELETE FROM draws WHERE year = 2025;
```

## 📞 Support

- **Documentation PHP** : https://www.php.net/manual/fr/
- **phpMyAdmin** : https://docs.phpmyadmin.net/
- **Support hébergeur** : Contactez le support technique de votre hébergeur

## 🎅 Utilisation

### Pour l'administrateur :
1. Connectez-vous avec `eric.savary@netplus.ch`
2. Approuvez les participants inscrits
3. Lancez le tirage au sort (minimum 2 participants)

### Pour les participants :
1. Inscrivez-vous sur la page d'accueil
2. Attendez l'approbation de l'admin
3. Connectez-vous pour voir votre attribution Secret Santa

## ✨ Fonctionnalités

- ✅ Inscription et validation manuelle
- ✅ Tirage au sort intelligent (sans auto-attribution)
- ✅ Résultats secrets par participant
- ✅ Design festif de Noël
- ✅ Interface 100% en français
- ✅ Compatible mobiles et tablettes

---

**Joyeux Noël et bon Secret Santa ! 🎄🎅🎁**

En cas de problème, consultez d'abord la section Dépannage ci-dessus.
