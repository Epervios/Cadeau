<?php
// Tests unitaires sans base de données : php php/tests/unit.php
require_once __DIR__ . '/../includes/functions.php';
function check($ok, $message) {
    if (!$ok) throw new RuntimeException($message);
}
try {
    check(createSecretSantaAssignment([1,2]) === [1 => 2, 2 => 1], 'Deux participants');
    $variations = [];
    foreach ([3,4,5,12,50] as $n) {
        $ids = range(1, $n);
        for ($attempt = 0; $attempt < 100; $attempt++) {
            $result = createSecretSantaAssignment($ids);
            check(count($result) === $n, 'Nombre d’attributions');
            check(array_keys($result) === $ids, 'Chaque donneur une fois');
            check(count(array_unique(array_values($result))) === $n, 'Chaque destinataire une fois');
            foreach ($result as $giver => $receiver) check($giver !== $receiver, 'Aucune auto-attribution');
            if ($n === 4) $variations[implode(',', array_values($result))] = true;
        }
    }
    check(count($variations) > 1, 'Tirage non figé');
    foreach ([[1], [1,1], []] as $invalid) {
        $thrown = false;
        try { createSecretSantaAssignment($invalid); }
        catch (InvalidArgumentException $e) { $thrown = true; }
        check($thrown, 'Liste invalide rejetée');
    }
    echo "PASS : tirage cryptographique, absence de doublons et protection des entrées.\n";
} catch (Throwable $e) {
    fwrite(STDERR, "FAIL : " . $e->getMessage() . "\n");
    exit(1);
}
