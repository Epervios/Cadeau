/* Accueil : le formulaire existant est intégré à la nouvelle expérience de Noël. */
document.addEventListener("DOMContentLoaded",()=>{
  const button=(id,callback)=>document.getElementById(id).addEventListener("click",callback);
  function navigate(id){clearMessage("formMessage");clearMessage("loginMessage");showSection(id);}
  button("join",()=>navigate("register"));
  button("already",()=>navigate("login"));
  document.querySelectorAll("[data-back]").forEach(b=>b.addEventListener("click",()=>navigate(b.dataset.back)));
  button("waitingReturn",()=>navigate("welcome"));
  button("waitingLogout",logout);

  const register=document.getElementById("registerForm");
  register.addEventListener("submit",async event=>{
    event.preventDefault();
    clearMessage("formMessage");
    const firstName=document.getElementById("register-name");
    const email=document.getElementById("register-email");
    const password=document.getElementById("register-password");
    if(!firstName.value.trim()||firstName.value.trim().length>100){
      firstName.focus();showMessage("Indiquez votre prénom (100 caractères maximum).");return;
    }
    if(!email.checkValidity()){email.focus();showMessage("Indiquez une adresse e-mail valide.");return;}
    if(password.value.length<12){password.focus();showMessage("Choisissez un mot de passe d'au moins 12 caractères.");return;}
    const submit=register.querySelector("[type=submit]");
    busy(submit,true);
    try{
      await apiRequest("/auth.php?action=register",{
        method:"POST",
        data:{first_name:firstName.value.trim(),email:email.value.trim(),password:password.value}
      });
      register.reset();
      document.getElementById("waitingText").textContent="Votre demande a bien été envoyée. L'organisateur doit encore confirmer votre participation. Vous pourrez ensuite vous connecter pour ouvrir votre enveloppe.";
      document.getElementById("waitingLogout").hidden=true;
      navigate("waiting");
    }catch(error){showMessage(error.message,"error","formMessage");}
    finally{busy(submit,false);}
  });

  const login=document.getElementById("loginForm");
  login.addEventListener("submit",async event=>{
    event.preventDefault();
    clearMessage("loginMessage");
    const email=document.getElementById("login-email");
    const password=document.getElementById("login-password");
    if(!email.checkValidity()){email.focus();showMessage("Indiquez votre adresse e-mail.","error","loginMessage");return;}
    if(!password.value){password.focus();showMessage("Indiquez votre mot de passe.","error","loginMessage");return;}
    const submit=login.querySelector("[type=submit]");
    busy(submit,true);
    try{
      const data=await apiRequest("/auth.php?action=login",{method:"POST",data:{email:email.value.trim(),password:password.value}});
      password.value="";
      if(!data.user.is_approved){
        document.getElementById("waitingText").textContent="Votre compte est créé, mais l'organisateur doit encore accepter votre participation. Vous pourrez revenir ici dès qu'elle aura été confirmée.";
        document.getElementById("waitingLogout").hidden=false;
        navigate("waiting");
      }else{
        window.location.assign(data.user.is_admin?"admin.html":"user.html");
      }
    }catch(error){showMessage(error.message,"error","loginMessage");}
    finally{busy(submit,false);}
  });

  (async()=>{
    try{
      const current=await apiRequest("/auth.php?action=me");
      if(!current.logged_in)return;
      const user=current.user;
      if(user.is_approved)window.location.replace(user.is_admin?"admin.html":"user.html");
      else{
        document.getElementById("waitingText").textContent="Votre compte est créé. L'organisateur doit encore accepter votre participation.";
        document.getElementById("waitingLogout").hidden=false;
        navigate("waiting");
      }
    }catch(error){
      const warning=document.createElement("p");
      warning.className="error-fallback";warning.setAttribute("role","alert");
      warning.textContent="Impossible de vérifier votre connexion pour le moment. Vous pouvez réessayer dans quelques instants.";
      document.getElementById("welcome").append(warning);
    }
  })();
});
