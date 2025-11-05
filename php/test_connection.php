<?php
/**
 * Test de connexion à la base de données
 * 
 * Utilisez ce fichier pour vérifier que votre configuration fonctionne
 * SUPPRIMEZ ce fichier après avoir vérifié que tout fonctionne !
 */

require_once 'config/database.php';

?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test de Connexion - Secret Santa</title>
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
        }
        .success {
            background: #d1fae5;
            border-left: 4px solid #10b981;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .error {
            background: #fee2e2;
            border-left: 4px solid #dc2626;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .info {
            background: #dbeafe;
            border-left: 4px solid #3b82f6;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .config {
            background: #f9fafb;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            font-family: monospace;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        th {
            background: #f3f4f6;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎄 Test de Connexion Secret Santa</h1>
        
        <h2>1. Configuration actuelle</h2>
        <div class="config">
            <strong>Hôte :</strong> <?php echo DB_HOST; ?><br>
            <strong>Base de données :</strong> <?php echo DB_NAME; ?><br>
            <strong>Utilisateur :</strong> <?php echo DB_USER; ?><br>
            <strong>Charset :</strong> <?php echo DB_CHARSET; ?>
        </div>
        
        <h2>2. Test de connexion</h2>
        <?php
        try {
            $pdo = getDBConnection();
            echo '<div class="success">✅ <strong>Connexion réussie à la base de données !</strong></div>';
            
            // Vérifier les tables
            echo '<h2>3. Vérification des tables</h2>';
            $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
            
            $requiredTables = ['users', 'draws', 'assignments'];
            $missingTables = array_diff($requiredTables, $tables);
            
            if (empty($missingTables)) {
                echo '<div class="success">✅ <strong>Toutes les tables requises sont présentes !</strong></div>';
                
                echo '<table>';
                echo '<thead><tr><th>Table</th><th>Nombre d\'enregistrements</th></tr></thead>';
                echo '<tbody>';
                
                foreach ($requiredTables as $table) {
                    $count = $pdo->query("SELECT COUNT(*) FROM $table")->fetchColumn();
                    echo "<tr><td>$table</td><td>$count</td></tr>";
                }
                
                echo '</tbody></table>';
                
                // Vérifier l'admin
                echo '<h2>4. Vérification du compte admin</h2>';
                $admin = $pdo->query("SELECT id, first_name, email, is_admin, is_approved FROM users WHERE is_admin = 1 LIMIT 1")->fetch();
                
                if ($admin) {
                    echo '<div class="success">';
                    echo '✅ <strong>Compte admin trouvé !</strong><br>';
                    echo 'Email : ' . htmlspecialchars($admin['email']) . '<br>';
                    echo 'Prénom : ' . htmlspecialchars($admin['first_name']);
                    echo '</div>';
                } else {
                    echo '<div class="error">❌ <strong>Aucun compte admin trouvé !</strong><br>';
                    echo 'Veuillez importer le fichier database.sql dans phpMyAdmin.</div>';
                }
                
                // Instructions finales
                echo '<div class="info">';
                echo '<h3>ℹ️ Prochaines étapes :</h3>';
                echo '<ol>';
                echo '<li>Générez le mot de passe admin avec <code>generate_admin_password.php</code></li>';
                echo '<li>Mettez à jour le hash dans phpMyAdmin</li>';
                echo '<li>Testez la connexion sur <code>public/index.html</code></li>';
                echo '<li><strong style="color: red;">⚠️ SUPPRIMEZ ce fichier et generate_admin_password.php !</strong></li>';
                echo '</ol>';
                echo '</div>';
                
            } else {
                echo '<div class="error">❌ <strong>Tables manquantes :</strong><br>';
                echo implode(', ', $missingTables);
                echo '<br><br>Veuillez importer le fichier <code>database.sql</code> dans phpMyAdmin.</div>';
            }
            
        } catch (PDOException $e) {
            echo '<div class="error">';
            echo '❌ <strong>Erreur de connexion !</strong><br><br>';
            echo '<strong>Message d\'erreur :</strong><br>';
            echo htmlspecialchars($e->getMessage());
            echo '<br><br><strong>Solutions possibles :</strong>';
            echo '<ul>';
            echo '<li>Vérifiez les informations dans <code>config/database.php</code></li>';
            echo '<li>Assurez-vous que la base de données existe</li>';
            echo '<li>Vérifiez que l\'utilisateur MySQL a les bons privilèges</li>';
            echo '<li>Contactez votre hébergeur si le problème persiste</li>';
            echo '</ul>';
            echo '</div>';
        }
        ?>
        
        <h2>5. Informations PHP</h2>
        <table>
            <tr>
                <th>Version PHP</th>
                <td><?php echo phpversion(); ?></td>
            </tr>
            <tr>
                <th>Extension PDO</th>
                <td><?php echo extension_loaded('PDO') ? '✅ Installé' : '❌ Manquant'; ?></td>
            </tr>
            <tr>
                <th>Extension PDO MySQL</th>
                <td><?php echo extension_loaded('pdo_mysql') ? '✅ Installé' : '❌ Manquant'; ?></td>
            </tr>
            <tr>
                <th>Support des sessions</th>
                <td><?php echo function_exists('session_start') ? '✅ Activé' : '❌ Désactivé'; ?></td>
            </tr>
        </table>
        
        <div class="error" style="margin-top: 30px;">
            <strong>⚠️ IMPORTANT :</strong><br>
            Une fois que tout fonctionne correctement, <strong>SUPPRIMEZ ce fichier</strong> (<code>test_connection.php</code>) de votre serveur pour des raisons de sécurité.
        </div>
    </div>
</body>
</html>