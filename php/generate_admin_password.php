<?php
/**
 * Générateur de mot de passe pour l'admin
 * 
 * IMPORTANT : Supprimez ce fichier après utilisation pour des raisons de sécurité !
 * 
 * Utilisation :
 * 1. Uploadez ce fichier à la racine de votre installation
 * 2. Accédez-y via votre navigateur : https://votre-domaine.com/secret-santa/generate_admin_password.php
 * 3. Copiez le hash généré
 * 4. Mettez-le à jour dans phpMyAdmin (table users, champ password_hash)
 * 5. SUPPRIMEZ CE FICHIER !
 */

// Définissez votre mot de passe ici
$password = 'x4Q45jUn7Hxq4M';

// Générer le hash
$hash = password_hash($password, PASSWORD_DEFAULT);

?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Générateur de Mot de Passe Admin</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #dc2626;
            margin-bottom: 20px;
        }
        .hash-box {
            background: #f9fafb;
            padding: 15px;
            border: 2px solid #e5e7eb;
            border-radius: 5px;
            word-break: break-all;
            font-family: monospace;
            margin: 20px 0;
        }
        .warning {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
        }
        .success {
            background: #d1fae5;
            border-left: 4px solid #10b981;
            padding: 15px;
            margin: 20px 0;
        }
        .steps {
            margin: 20px 0;
        }
        .steps li {
            margin: 10px 0;
            line-height: 1.6;
        }
        .button {
            background: #dc2626;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        }
        .button:hover {
            background: #b91c1c;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎄 Générateur de Mot de Passe Admin</h1>
        
        <div class="success">
            <strong>✅ Hash généré avec succès !</strong>
        </div>
        
        <h2>Votre mot de passe :</h2>
        <p><strong><?php echo htmlspecialchars($password); ?></strong></p>
        
        <h2>Hash à copier dans la base de données :</h2>
        <div class="hash-box" id="hashValue"><?php echo $hash; ?></div>
        
        <button class="button" onclick="copyHash()">📋 Copier le hash</button>
        
        <h2>Instructions :</h2>
        <ol class="steps">
            <li>Copiez le hash ci-dessus (cliquez sur le bouton "Copier")</li>
            <li>Ouvrez <strong>phpMyAdmin</strong> depuis votre panneau d'hébergement</li>
            <li>Sélectionnez votre base de données <code>secret_santa</code></li>
            <li>Cliquez sur la table <code>users</code></li>
            <li>Trouvez la ligne avec l'email <code>eric.savary@netplus.ch</code></li>
            <li>Cliquez sur <strong>Modifier</strong> (icône crayon)</li>
            <li>Remplacez la valeur du champ <code>password_hash</code> par le hash copié</li>
            <li>Cliquez sur <strong>Exécuter</strong></li>
            <li><strong style="color: red;">⚠️ IMPORTANT : SUPPRIMEZ CE FICHIER immédiatement après !</strong></li>
        </ol>
        
        <div class="warning">
            <strong>⚠️ AVERTISSEMENT DE SÉCURITÉ</strong><br>
            Ce fichier expose des informations sensibles. Une fois que vous avez mis à jour le mot de passe dans la base de données, <strong>SUPPRIMEZ IMMDIATEMENT CE FICHIER</strong> de votre serveur pour éviter tout risque de sécurité.
        </div>
        
        <h2>Comment supprimer ce fichier :</h2>
        <ul>
            <li><strong>Via FTP</strong> : Connectez-vous et supprimez <code>generate_admin_password.php</code></li>
            <li><strong>Via gestionnaire de fichiers</strong> : Trouvez le fichier et supprimez-le</li>
            <li><strong>Via SSH</strong> : <code>rm generate_admin_password.php</code></li>
        </ul>
    </div>
    
    <script>
        function copyHash() {
            const hashText = document.getElementById('hashValue').textContent;
            navigator.clipboard.writeText(hashText).then(() => {
                alert('✅ Hash copié dans le presse-papier !');
            }).catch(err => {
                // Fallback pour les anciens navigateurs
                const textArea = document.createElement('textarea');
                textArea.value = hashText;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                alert('✅ Hash copié dans le presse-papier !');
            });
        }
    </script>
</body>
</html>