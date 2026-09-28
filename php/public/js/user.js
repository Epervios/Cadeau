/* Enveloppe personnelle : le destinataire n'est demandé qu'au clic explicite. */
document.addEventListener("DOMContentLoaded",()=>{
  const byId=id=>document.getElementById(id);
  const open=byId("open-envelope"), close=byId("close-envelope"), retry=byId("retryGift");
  byId("logout").addEventListener("click",logout);
  let available=false;
  let revealInProgress=false;

  async function verifyState(){
    retry.hidden=true;open.hidden=true;close.hidden=true;open.disabled=true;clearMessage();
    byId("giftResult").hidden=true;byId("recipientName").textContent="";
    byId("envelope").hidden=false;byId("waitingGift").hidden=true;
    byId("gift-intro").textContent="Nous préparons votre surprise de Noël…";
    try{
      const me=await apiRequest("/auth.php?action=me");
      if(!me.logged_in||!me.user.is_approved){
        window.location.replace("index.html");return;
      }
      byId("adminLink").hidden=!me.user.is_admin;
      const status=await apiRequest("/user.php?action=draw-status");
      available=!!status.has_draw;
      if(available){
        byId("gift-intro").textContent="Un petit secret se cache dans cette enveloppe…";
        open.disabled=false;open.hidden=false;
      }else{
        byId("gift-intro").textContent="Votre enveloppe sera prête après le tirage.";
        byId("waitingGift").hidden=false;
      }
    }catch(error){
      available=false;
      byId("gift-intro").textContent="Nous n'avons pas pu vérifier votre enveloppe.";
      showMessage(error.message);retry.hidden=false;
    }
  }
  open.addEventListener("click",async()=>{
    if(!available||revealInProgress)return;
    revealInProgress=true;busy(open,true);clearMessage();
    try{
      const assignment=await apiRequest("/user.php?action=assignment");
      if(!assignment.has_draw||typeof assignment.assignment!=="string"||!assignment.assignment.trim()){
        available=false;open.hidden=true;byId("waitingGift").hidden=false;
        byId("waitingGift").textContent="Le tirage existe, mais aucune attribution n'est associée à votre participation. Contactez l'organisateur.";
        return;
      }
      byId("recipientName").textContent=assignment.assignment;
      byId("giftResult").hidden=false;
      byId("envelope").hidden=true;
      byId("gift-intro").hidden=true;
      open.hidden=true;close.hidden=false;close.focus();
    }catch(error){showMessage(error.message);retry.hidden=false;}
    finally{busy(open,false);revealInProgress=false;}
  });
  close.addEventListener("click",()=>{
    byId("recipientName").textContent="";
    byId("giftResult").hidden=true;byId("envelope").hidden=false;
    byId("gift-intro").hidden=false;close.hidden=true;open.hidden=false;
    open.focus();
  });
  retry.addEventListener("click",verifyState);
  verifyState();
});
