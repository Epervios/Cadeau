// Contrôle statique de la cohérence de la nouvelle interface, sans dépendance npm.
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const root=new URL("../public/",import.meta.url);
const file=path=>readFileSync(new URL(path,root),"utf8");
const css=file("css/style.css");
const common=file("js/common.js");
const svg=file("assets/christmas-village.svg");

assert.match(css,/--bsize:20px/,"Texte ordinaire initial de 20px");
assert.match(css,/body\.large\s*\{--bsize:24px/,"Agrandissement disponible");
assert.match(css,/prefers-reduced-motion:reduce/,"Respect de la préférence de mouvement réduit");
assert.match(css,/min-height:64px/,"Boutons principaux adaptés au toucher");
assert.match(svg,/<svg\b[\s\S]*<\/svg>/,"Illustration locale intégrée");
assert.doesNotMatch(svg,/<script\b|(?:href|src)=["\']https?:\/\//i,"Illustration sans scripts ni dépendance distante");
assert.match(common,/credentials:"same-origin"/,"API restreinte à l'origine");
assert.match(common,/X-CSRF-Token/,"Protection des mutations activée");

for(const [htmlFile,jsFile] of [
  ["index.html","app.js"],["user.html","user.js"],["admin.html","admin.js"],["reset.html","reset.js"]
]){
  const html=file(htmlFile),js=file("js/"+jsFile);
  assert.match(html,/<html lang="fr">/,"Langue française de "+htmlFile);
  assert.match(html,/<main\b/,"Contenu principal de "+htmlFile);
  assert.match(html,/class="skip"/,"Lien d'évitement pour "+htmlFile);
  assert.match(html,/id="larger"/,"Agrandissement du texte pour "+htmlFile);
  assert.match(html,/assets\/christmas-village.svg/,"Illustration commune pour "+htmlFile);
  assert.match(html,/src="js\/common.js"/,"Client API commun pour "+htmlFile);
  assert.doesNotMatch(html,/onclick\s*=|<script[^>]*src=["']https?:/i,"Sans scripts en ligne ni CDN");
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(ids.length,new Set(ids).size,"Identifiants uniques dans "+htmlFile);
  const refs=[...js.matchAll(/(?:byId|button|document\.getElementById)\("([^"]+)"\)/g)].map(match=>match[1]);
  for(const id of refs) assert.ok(ids.includes(id),"Identifiant manquant dans "+htmlFile+": "+id);
  const inputIds=[...html.matchAll(/<input[^>]+id="([^"]+)"/g)].map(match=>match[1]);
  for(const id of inputIds) assert.ok(html.includes('for="'+id+'"'),"Étiquette manquante : "+id);
}
const personal=file("user.html"),userJs=file("js/user.js");
assert.doesNotMatch(personal,/Camille|Benoit|Alice/,"Aucun destinataire fictif dans la page réelle");
assert.ok(userJs.indexOf('apiRequest("/user.php?action=assignment")') >
  userJs.indexOf('open.addEventListener("click"'),"Attribution récupérée seulement après clic");
const resetHtml=file("reset.html"),resetJs=file("js/reset.js");
assert.match(resetHtml,/autocomplete="new-password"/,"Mot de passe auto-générable sur appareils");
assert.match(resetJs,/history\.replaceState/,"Le fragment n'est pas conservé dans la barre d'adresse");
assert.match(resetJs,/action=reset-password/,"Le formulaire est relié à l'API");
assert.match(file("admin.html"),/id="helpDialog"/,"Assistance administrateur disponible");
assert.match(file("js/admin.js"),/reset\.html#token=/,"Le jeton n'est pas dans l'URL transmise à Apache");
assert.match(file("index.html"),/J'ai oublié mon mot de passe/,"Aide accessible depuis la connexion");
console.log("PASS : quatre pages cohérentes, récupération assistée et aucun destinataire préchargé.");
