<?php
require_once __DIR__ . '/../config/config.php';
requireAdmin();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$pdo = getDBConnection();

if ($method === 'GET') {
    if ($action === 'pending-users' || $action === 'users') {
        $sql = 'SELECT id, first_name, email, is_admin, is_approved, created_at FROM users';
        if ($action === 'pending-users') $sql .= ' WHERE is_approved = 0';
        $sql .= ' ORDER BY created_at DESC';
        jsonResponse($pdo->query($sql)->fetchAll());
    }
    jsonError('Action inconnue', 404);
}
if ($method !== 'POST') jsonError('Méthode non autorisée', 405);
requireCsrf();

if ($action === 'create-password-reset') {
    $input = getJsonInput();
    $id = filter_var($input['user_id'] ?? null, FILTER_VALIDATE_INT);
    if (!$id || $id < 1) jsonError('Participant invalide.', 400);
    // Ne jamais écrire ni journaliser le jeton brut.
    $token = bin2hex(random_bytes(32));
    $tokenHash = hash('sha256', hex2bin($token));
    $expiresAt = time() + 1800;
    try {
        $pdo->beginTransaction();
        $stmt = $pdo->prepare(
            'SELECT id, first_name FROM users WHERE id = ? AND is_admin = 0 FOR UPDATE'
        );
        $stmt->execute([$id]);
        $person = $stmt->fetch();
        if (!$person) {
            $pdo->rollBack();
            jsonError('Participant introuvable. Pour un compte organisateur, utiliser la procédure CLI.', 404);
        }
        // Un seul jeton valable par participant : chaque nouveau lien révoque le précédent.
        $stmt = $pdo->prepare(
            'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at, issued_by)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE token_hash = VALUES(token_hash),
                                     expires_at = VALUES(expires_at),
                                     issued_by = VALUES(issued_by)'
        );
        $stmt->execute([$id, $tokenHash, $expiresAt, getCurrentUserId()]);
        $pdo->commit();
        jsonResponse([
            'message' => 'Lien de réinitialisation créé.',
            'token' => $token,
            'expires_in_seconds' => 1800,
            'first_name' => $person['first_name']
        ]);
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        error_log('Création d’un lien de réinitialisation indisponible : ' . $e->getCode());
        jsonError('Impossible de préparer ce lien actuellement.', 500);
    }
}

if ($action === 'approve-user' || $action === 'reject-user') {
    $id = filter_var($_GET['user_id'] ?? null, FILTER_VALIDATE_INT);
    if (!$id || $id < 1) jsonError('Participant invalide', 400);
    $year = (int)date('Y');
    try {
        $pdo->beginTransaction();
        // Bloquer les changements de liste après publication du tirage annuel.
        $stmt = $pdo->prepare('SELECT id FROM draws WHERE year = ? FOR UPDATE');
        $stmt->execute([$year]);
        if ($stmt->fetch()) {
            $pdo->rollBack();
            jsonError('Le tirage de cette année est déjà publié. Vous ne pouvez plus modifier ses participants.', 409);
        }
        if ($action === 'approve-user') {
            $stmt = $pdo->prepare('UPDATE users SET is_approved = 1 WHERE id = ? AND is_admin = 0 AND is_approved = 0');
        } else {
            $stmt = $pdo->prepare('DELETE FROM users WHERE id = ? AND is_admin = 0 AND is_approved = 0');
        }
        $stmt->execute([$id]);
        $affected = $stmt->rowCount();
        $pdo->commit();
        if ($affected === 0) jsonError('Participant introuvable ou déjà traité', 404);
        jsonResponse(['message' => $action === 'approve-user' ? 'Participant approuvé' : 'Inscription rejetée']);
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        error_log('Mise à jour participant échouée : ' . $e->getCode());
        jsonError('Opération momentanément indisponible', 500);
    }
}

if ($action === 'create-draw') {
    $body = getJsonInput();
    $year = validYear($body['year'] ?? date('Y'));
    try {
        $pdo->beginTransaction();
        $stmt = $pdo->prepare('SELECT id FROM draws WHERE year = ? FOR UPDATE');
        $stmt->execute([$year]);
        if ($stmt->fetch()) {
            $pdo->rollBack();
            jsonError('Un tirage existe déjà pour cette année', 409);
        }
        // Tous les comptes sont verrouillés pour qu'une demande en attente
        // ne soit jamais omise par inadvertance pendant le tirage.
        $stmt = $pdo->query('SELECT id, is_approved FROM users ORDER BY id FOR UPDATE');
        $users = $stmt->fetchAll();
        foreach ($users as $participant) {
            if (!(bool)$participant['is_approved']) {
                $pdo->rollBack();
                jsonError('Traitez toutes les inscriptions avant de lancer le tirage.', 409);
            }
        }
        $ids = array_column($users, 'id');
        if (count($ids) < 2) {
            $pdo->rollBack();
            jsonError('Au moins deux participants approuvés sont nécessaires', 400);
        }
        $assignments = createSecretSantaAssignment($ids);
        $stmt = $pdo->prepare('INSERT INTO draws (year, created_by) VALUES (?, ?)');
        $stmt->execute([$year, getCurrentUserId()]);
        $drawId = $pdo->lastInsertId();
        $stmt = $pdo->prepare('INSERT INTO assignments (draw_id, giver_id, receiver_id) VALUES (?, ?, ?)');
        foreach ($assignments as $giverId => $receiverId) $stmt->execute([$drawId, $giverId, $receiverId]);
        $pdo->commit();
        jsonResponse(['message' => 'Tirage réalisé', 'year' => $year, 'participants' => count($ids)]);
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        if (($e->errorInfo[1] ?? null) == 1062) jsonError('Un tirage existe déjà pour cette année', 409);
        error_log('Création du tirage échouée : ' . $e->getCode());
        jsonError('Impossible de finaliser le tirage', 500);
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        error_log('Génération du tirage échouée');
        jsonError('Impossible de générer un tirage valide', 500);
    }
}

if ($action === 'delete-draw') {
    $body = getJsonInput();
    $year = validYear($body['year'] ?? date('Y'));
    if (($body['confirm_year'] ?? null) !== $year) jsonError('Confirmez explicitement l’année du tirage à réinitialiser', 400);
    try {
        $pdo->beginTransaction();
        $stmt = $pdo->prepare('SELECT id FROM draws WHERE year = ? FOR UPDATE');
        $stmt->execute([$year]);
        $row = $stmt->fetch();
        if (!$row) {
            $pdo->rollBack();
            jsonError('Aucun tirage trouvé pour cette année', 404);
        }
        $stmt = $pdo->prepare('DELETE FROM draws WHERE id = ?');
        $stmt->execute([$row['id']]);
        $pdo->commit();
        jsonResponse(['message' => 'Tirage réinitialisé', 'year' => $year]);
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        error_log('Suppression du tirage échouée : ' . $e->getCode());
        jsonError('Impossible de réinitialiser ce tirage', 500);
    }
}
jsonError('Action inconnue', 404);
