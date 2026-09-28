/* Lien assisté : le fragment #token n'est jamais envoyé par le navigateur au serveur. */
document.addEventListener("DOMContentLoaded",()=>{
  let token=null;
  const form=document.getElementById("resetForm");
  const intro=document.getElementById("resetInfo");
  try{token=new URLSearchParams(window.location.hash.slice(1)).get("token");}catch{token=null;}
  window.history.replaceState(null,"",window.location.pathname);
  if(!token||!/^[a-f0-9]{64}$/.test(token)){
    token=null;intro.textContent="Ce lien n'est pas valide. Demandez un nouveau lien à l'organisateur de votre Noël.";
    return;
  }
  form.hidden=false;
  form.addEventListener("submit",async(event)=>{
    event.preventDefault();clearMessage();
    const first=document.getElementById("new-password");
    const second=document.getElementById("repeat-password");
    if(first.value.length<12||first.value.length>1024){
      first.focus();showMessage("Votre mot de passe doit contenir entre 12 et 1024 caractères.");return;
    }
    if(first.value!==second.value){
      second.focus();showMessage("Les deux mots de passe ne sont pas identiques.");return;
    }
    const submit=form.querySelector('[type="submit"]');busy(submit,true);
    try{
      const response=await apiRequest("/auth.php?action=reset-password",{
        method:"POST",data:{token,password:first.value}
      });
      token=null;form.reset();form.hidden=true;
      intro.textContent="Votre mot de passe a été changé. Vous pouvez maintenant vous connecter et découvrir votre surprise !";
      showMessage(response.message||"Votre mot de passe a été modifié.","success");
      document.getElementById("returnLogin").focus();
    }catch(error){
      showMessage(error.message);
      if(/expiré|invalide|utilisé/.test(error.message)){
        token=null;form.reset();form.hidden=true;
        intro.textContent="Demandez à l'organisateur un nouveau lien pour retrouver votre compte.";
      }
    }finally{busy(submit,false);}
  });
});
