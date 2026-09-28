#!/usr/bin/env bash
# Tests de bout en bout sur une base MariaDB *jetable* dans GitHub Actions.
# Le script n'accepte que l'instance locale isolée, jamais une URL de production.
set -euo pipefail
BASE="http://127.0.0.1:8765"
TEMP="$(mktemp -d)"
trap 'rm -rf "$TEMP"' EXIT
ADMIN="$TEMP/admin.cookies"
A="$TEMP/alice.cookies"
B="$TEMP/benoit.cookies"
C="$TEMP/late.cookies"
R="$TEMP/reset.cookies"
YEAR="$(date +%Y)"
echo "Tests HTTP locaux : inscription, approbation, sécurité CSRF, tirage, confidentialité et réinitialisation."

csrf() {
  curl --silent --show-error --fail -b "$1" -c "$1" "$BASE/api/auth.php?action=csrf" | jq -er '.csrf_token'
}

# request cookie GET|POST endpoint code [json]
request() {
  local cookies="$1" method="$2" endpoint="$3" expected="$4"
  local data="{}"
  if (( $# >= 5 )); then data="$5"; fi
  local code token
  local args=(--silent --show-error -b "$cookies" -c "$cookies"
    -H "Accept: application/json" -o "$TEMP/response.json"
    -w "%{http_code}" -X "$method")
  if [[ "$method" != GET ]]; then
    token="$(csrf "$cookies")"
    args+=(-H "Content-Type: application/json" -H "X-CSRF-Token: $token" --data "$data")
  fi
  code="$(curl "${args[@]}" "$BASE/api/$endpoint")"
  if [[ "$code" != "$expected" ]]; then
    echo "ÉCHEC : $method $endpoint, attendu $expected, obtenu $code"
    cat "$TEMP/response.json"
    exit 1
  fi
  jq -e . "$TEMP/response.json" >/dev/null
}

# Préconditions : seul l'admin initial est approuvé dans la base jetable.
request "$ADMIN" GET "auth.php?action=me" 200
[[ "$(jq -r .logged_in "$TEMP/response.json")" == false ]]
request "$ADMIN" GET "user.php?action=assignment" 401
request "$ADMIN" POST "auth.php?action=login" 200 '{"email":"admin@example.test","password":"local-test-admin-password-only"}'
[[ "$(jq -r .user.is_admin "$TEMP/response.json")" == true ]]
ADMIN_ID="$(jq -r .user.id "$TEMP/response.json")"
request "$ADMIN" POST "admin.php?action=create-draw" 400 "{\"year\":$YEAR}"

# Les attaques CSRF sont rejetées, même sur session administrateur valide.
bad="$(curl --silent -b "$ADMIN" -c "$ADMIN" -o "$TEMP/no-csrf.json" -w "%{http_code}" \
  -X POST -H "Content-Type: application/json" --data "{}" \
  "$BASE/api/admin.php?action=create-draw")"
[[ "$bad" == 403 ]] || { echo "ÉCHEC : absence de protection CSRF ($bad)"; exit 1; }

request "$A" POST "auth.php?action=register" 201 '{"first_name":"Alice","email":"alice@example.test","password":"long-test-password-alice"}'
request "$B" POST "auth.php?action=register" 201 '{"first_name":"Benoit","email":"benoit@example.test","password":"long-test-password-benoit"}'
request "$A" POST "auth.php?action=login" 200 '{"email":"alice@example.test","password":"long-test-password-alice"}'
[[ "$(jq -r .user.is_approved "$TEMP/response.json")" == false ]]
request "$A" GET "user.php?action=assignment" 403
request "$A" GET "admin.php?action=users" 403

request "$ADMIN" GET "admin.php?action=pending-users" 200
ALICE_ID="$(jq -r '.[] | select(.email=="alice@example.test") | .id' "$TEMP/response.json")"
BENOIT_ID="$(jq -r '.[] | select(.email=="benoit@example.test") | .id' "$TEMP/response.json")"
[[ "$ALICE_ID" =~ ^[0-9]+$ && "$BENOIT_ID" =~ ^[0-9]+$ ]]
request "$ADMIN" POST "admin.php?action=approve-user&user_id=$ALICE_ID" 200 '{}'
request "$ADMIN" POST "admin.php?action=approve-user&user_id=$BENOIT_ID" 200 '{}'
request "$ADMIN" GET "admin.php?action=pending-users" 200
[[ "$(jq length "$TEMP/response.json")" == 0 ]]
request "$A" GET "user.php?action=assignment" 200
[[ "$(jq -r .has_draw "$TEMP/response.json")" == false ]]

# La récupération familiale ne doit pas permettre l'usurpation ni exposer les secrets.
request "$A" POST "admin.php?action=create-password-reset" 403 "{\"user_id\":$ALICE_ID}"
request "$ADMIN" POST "admin.php?action=create-password-reset" 404 "{\"user_id\":$ADMIN_ID}"
request "$ADMIN" POST "admin.php?action=create-password-reset" 200 "{\"user_id\":$ALICE_ID}"
FIRST_TOKEN="$(jq -r .token "$TEMP/response.json")"
[[ "$FIRST_TOKEN" =~ ^[a-f0-9]{64}$ ]]
[[ "$(jq -r .expires_in_seconds "$TEMP/response.json")" == 1800 ]]
# Un nouveau lien invalide le précédent.
request "$ADMIN" POST "admin.php?action=create-password-reset" 200 "{\"user_id\":$ALICE_ID}"
SECOND_TOKEN="$(jq -r .token "$TEMP/response.json")"
[[ "$FIRST_TOKEN" != "$SECOND_TOKEN" ]]
STORED_HASH="$(mariadb -N -h 127.0.0.1 -u root cadeau_test -e "SELECT token_hash FROM password_reset_tokens WHERE user_id=$ALICE_ID")"
[[ "$STORED_HASH" != "$FIRST_TOKEN" && "$STORED_HASH" != "$SECOND_TOKEN" ]]
request "$R" POST "auth.php?action=reset-password" 400 "{\"token\":\"$FIRST_TOKEN\",\"password\":\"recovered-password-alice\"}"
request "$R" POST "auth.php?action=reset-password" 400 "{\"token\":\"$SECOND_TOKEN\",\"password\":\"court\"}"
request "$R" POST "auth.php?action=reset-password" 200 "{\"token\":\"$SECOND_TOKEN\",\"password\":\"recovered-password-alice\"}"
# L'ancien appareil est déconnecté, même si sa session HTTP n'a pas expiré.
request "$A" GET "user.php?action=assignment" 401
request "$R" POST "auth.php?action=reset-password" 400 "{\"token\":\"$SECOND_TOKEN\",\"password\":\"another-password-alice\"}"
request "$A" POST "auth.php?action=login" 401 '{"email":"alice@example.test","password":"long-test-password-alice"}'
request "$A" POST "auth.php?action=login" 200 '{"email":"alice@example.test","password":"recovered-password-alice"}'
request "$A" GET "user.php?action=assignment" 200
[[ "$(jq -r .has_draw "$TEMP/response.json")" == false ]]
# L'expiration du lien ne modifie jamais le mot de passe en base.
request "$ADMIN" POST "admin.php?action=create-password-reset" 200 "{\"user_id\":$BENOIT_ID}"
EXPIRED_TOKEN="$(jq -r .token "$TEMP/response.json")"
mariadb -h 127.0.0.1 -u root cadeau_test -e "UPDATE password_reset_tokens SET expires_at=1 WHERE user_id=$BENOIT_ID"
request "$R" POST "auth.php?action=reset-password" 400 "{\"token\":\"$EXPIRED_TOKEN\",\"password\":\"another-password-benoit\"}"

request "$ADMIN" POST "admin.php?action=create-draw" 200 "{\"year\":$YEAR}"
[[ "$(jq -r .participants "$TEMP/response.json")" == 3 ]]
request "$ADMIN" POST "admin.php?action=create-draw" 409 "{\"year\":$YEAR}"
request "$ADMIN" GET "user.php?action=assignment" 200
ADMIN_NAME="$(jq -r .assignment "$TEMP/response.json")"
request "$A" GET "user.php?action=assignment" 200
ALICE_NAME="$(jq -r .assignment "$TEMP/response.json")"
[[ "$ALICE_NAME" != Alice ]]
request "$A" GET "user.php?action=assignment" 200
[[ "$(jq -r .assignment "$TEMP/response.json")" == "$ALICE_NAME" ]]
request "$B" POST "auth.php?action=login" 200 '{"email":"benoit@example.test","password":"long-test-password-benoit"}'
request "$B" GET "user.php?action=assignment" 200
BENOIT_NAME="$(jq -r .assignment "$TEMP/response.json")"
[[ "$BENOIT_NAME" != Benoit && "$ADMIN_NAME" != Organisateur ]]
[[ "$(printf '%s\n' "$ADMIN_NAME" "$ALICE_NAME" "$BENOIT_NAME" | sort -u | wc -l)" == 3 ]]

# Une demande reçue après publication ne change jamais une attribution existante.
request "$C" POST "auth.php?action=register" 201 '{"first_name":"Charlie","email":"charlie@example.test","password":"long-test-password-charlie"}'
request "$ADMIN" GET "admin.php?action=pending-users" 200
CHARLIE_ID="$(jq -r '.[] | select(.email=="charlie@example.test") | .id' "$TEMP/response.json")"
[[ "$CHARLIE_ID" =~ ^[0-9]+$ ]]
request "$ADMIN" POST "admin.php?action=approve-user&user_id=$CHARLIE_ID" 409 '{}'
request "$A" GET "user.php?action=assignment" 200
[[ "$(jq -r .assignment "$TEMP/response.json")" == "$ALICE_NAME" ]]

request "$ADMIN" POST "admin.php?action=delete-draw" 400 "{\"year\":$YEAR}"
request "$ADMIN" POST "admin.php?action=delete-draw" 200 "{\"year\":$YEAR,\"confirm_year\":$YEAR}"
request "$ADMIN" POST "admin.php?action=create-draw" 409 "{\"year\":$YEAR}"
request "$ADMIN" POST "admin.php?action=reject-user&user_id=$CHARLIE_ID" 200 '{}'
request "$ADMIN" POST "admin.php?action=create-draw" 200 "{\"year\":$YEAR}"

# La déconnexion invalide l'accès individuel, sans divulguer l'attribution.
request "$A" POST "auth.php?action=logout" 200 '{}'
request "$A" GET "user.php?action=assignment" 401
echo "PASS : parcours familial et contrôles d'accès, CSRF, tirage et réinitialisation."
