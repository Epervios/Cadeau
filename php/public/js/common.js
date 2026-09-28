/* Fonctions partagées par les trois pages PHP de Cadeau. */
const API_BASE = "../api";

async function apiRequest(resource, {method="GET", data=null}={}) {
  const options={method,credentials:"same-origin",cache:"no-store",headers:{"Accept":"application/json"}};
  if(method!=="GET"){
    const r=await fetch(API_BASE+"/auth.php?action=csrf",{credentials:"same-origin",cache:"no-store"});
    if(!r.ok)throw new Error("Impossible de vérifier votre session. Rechargez la page.");
    const auth=await r.json();
    options.headers["X-CSRF-Token"]=auth.csrf_token;
    options.headers["Content-Type"]="application/json";
    options.body=JSON.stringify(data??{});
  }
  const response=await fetch(API_BASE+resource,options);
  let result;
  try{result=await response.json();}catch{throw new Error("Le serveur n'a pas répondu correctement. Réessayez.");}
  if(!response.ok)throw new Error(result.error||"Une erreur est survenue. Réessayez.");
  return result;
}
function showMessage(message,type="error",target="formMessage") {
  const element=document.getElementById(target);
  if(!element)return;
  element.textContent=message;
  element.dataset.type=type;
  element.hidden=false;
  if(type==="error"){element.setAttribute("role","alert");element.tabIndex=-1;element.focus();}
  else{element.setAttribute("role","status");}
}
function clearMessage(target="formMessage"){
  const element=document.getElementById(target);
  if(element){element.hidden=true;element.textContent="";element.removeAttribute("data-type");}
}
function busy(button,pending){
  if(!button)return;
  button.disabled=pending;
  button.dataset.busy=String(pending);
  if(pending){button.dataset.originalLabel=button.textContent;button.textContent="Un instant…";}
  else if(button.dataset.originalLabel){button.textContent=button.dataset.originalLabel;delete button.dataset.originalLabel;}
}
function setupTextSize(){
  const control=document.getElementById("larger");
  if(!control)return;
  let large=false;
  try{large=localStorage.getItem("cadeau-large-text")==="yes";}catch{}
  const apply=()=>{document.body.classList.toggle("large",large);control.setAttribute("aria-pressed",String(large));control.textContent=large?"Taille normale A−":"Agrandir le texte A+";};
  apply();
  control.addEventListener("click",()=>{large=!large;try{localStorage.setItem("cadeau-large-text",large?"yes":"no");}catch{}apply();});
}
function showSection(id){
  document.querySelectorAll("main .page").forEach(section=>section.hidden=section.id!==id);
  clearMessage();
  const heading=document.querySelector("#"+id+" h2");
  if(heading){heading.focus({preventScroll:true});}
}
async function logout(){
  try{await apiRequest("/auth.php?action=logout",{method:"POST"});}
  catch(error){console.error("Déconnexion:",error);}
  window.location.assign("index.html");
}
document.addEventListener("DOMContentLoaded",setupTextSize);
