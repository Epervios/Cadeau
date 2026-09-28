/* Organisateur : rendu DOM sûr, trois étapes lisibles et confirmations explicites. */
document.addEventListener("DOMContentLoaded",()=>{
  const byId=id=>document.getElementById(id);
  const year=new Date().getFullYear();
  const drawDialog=byId("drawDialog"),resetDialog=byId("resetDialog");
  let approved=[],pending=[],draw={has_draw:false};
  let loading=false;

  byId("year").textContent=String(year);
  byId("logout").addEventListener("click",logout);
  byId("reloadData").addEventListener("click",loadData);
  byId("cancelDraw").addEventListener("click",()=>drawDialog.close());
  byId("cancelReset").addEventListener("click",()=>resetDialog.close());

  function personRow(person,awaiting){
    const li=document.createElement("li");li.className="person";
    const info=document.createElement("div");
    const name=document.createElement("span");name.className="person-name";name.textContent=person.first_name||"Participant";
    const email=document.createElement("span");email.className="person-mail";email.textContent=person.email||"";
    info.append(name,email);li.append(info);
    if(awaiting){
      const buttons=document.createElement("div");buttons.className="person-buttons";
      for(const [action,label,danger] of [["approve-user","Accepter",false],["reject-user","Refuser",true]]){
        const button=document.createElement("button");
        button.type="button";button.textContent=label;
        if(danger)button.classList.add("danger");
        button.disabled=!!draw.has_draw;
        button.setAttribute("aria-label",label+" la demande de "+(person.first_name||"ce participant"));
        button.addEventListener("click",()=>changeParticipant(person,action,button));
        buttons.append(button);
      }
      li.append(buttons);
    }
    return li;
  }
  function render(){
    byId("approvedCount").textContent=String(approved.length);
    byId("pendingCount").textContent=String(pending.length);
    byId("pendingEmpty").hidden=pending.length>0;
    byId("pendingList").replaceChildren(...pending.map(p=>personRow(p,true)));
    byId("approvedList").replaceChildren(...approved.map(p=>personRow(p,false)));
    let preflight,status;
    if(draw.has_draw){
      preflight="Le tirage de "+year+" est déjà effectué. La liste est verrouillée.";
      status="Le tirage a déjà été réalisé. Chaque personne peut consulter son enveloppe.";
    }else if(pending.length){
      preflight=pending.length+" inscription(s) à traiter avant de lancer le tirage.";
      status="Vous pourrez lancer le tirage une fois toutes les inscriptions vérifiées.";
    }else if(approved.length<2){
      preflight="Il faut au moins deux personnes confirmées pour un tirage.";
      status="En attente d'autres participants.";
    }else{
      preflight="Tout est prêt : "+approved.length+" personnes confirmées et aucune inscription en attente.";
      status="Chaque personne recevra exactement un destinataire, différent d'elle-même.";
    }
    byId("preflight").textContent=preflight;
    byId("drawStatus").textContent=status;
    byId("createDrawBtn").disabled=loading||draw.has_draw||pending.length>0||approved.length<2;
    byId("createDrawBtn").hidden=!!draw.has_draw;
    byId("resetDrawBtn").hidden=!draw.has_draw;
    byId("resetDrawBtn").disabled=loading;
  }
  async function loadData(){
    if(loading)return;
    loading=true;byId("reloadData").disabled=true;clearMessage();
    try{
      const me=await apiRequest("/auth.php?action=me");
      if(!me.logged_in||!me.user.is_approved||!me.user.is_admin){
        window.location.replace("index.html");return;
      }
      const [users,requests,status]=await Promise.all([
        apiRequest("/admin.php?action=users"),
        apiRequest("/admin.php?action=pending-users"),
        apiRequest("/user.php?action=draw-status")
      ]);
      approved=users.filter(p=>Number(p.is_approved)===1);
      pending=requests;
      draw=status;
    }catch(error){
      showMessage("Impossible de charger la liste : "+error.message);
      byId("createDrawBtn").disabled=true;
      byId("resetDrawBtn").disabled=true;
      return;
    }finally{
      loading=false;byId("reloadData").disabled=false;
    }
    render();
  }
  async function changeParticipant(person,action,button){
    if(draw.has_draw)return;
    if(action==="reject-user"&&!window.confirm("Refuser la participation de "+person.first_name+" ?"))return;
    clearMessage();busy(button,true);
    try{
      const id=Number(person.id);
      if(!Number.isSafeInteger(id)||id<1)throw new Error("Identifiant du participant invalide.");
      await apiRequest("/admin.php?action="+action+"&user_id="+id,{method:"POST",data:{}});
      await loadData();
      showMessage(action==="approve-user"?"Participation acceptée.":"Inscription refusée.","success");
    }catch(error){showMessage(error.message);}
    finally{if(button.isConnected)busy(button,false);}
  }

  byId("createDrawBtn").addEventListener("click",()=>{
    if(draw.has_draw||pending.length>0||approved.length<2)return;
    byId("drawDialogInfo").textContent="Vous allez lancer le tirage "+year+" pour "+approved.length+" personnes confirmées. Le compte organisateur est inclus s'il est approuvé.";
    drawDialog.showModal();
  });
  byId("confirmDraw").addEventListener("click",async()=>{
    const button=byId("confirmDraw");busy(button,true);
    try{
      await apiRequest("/admin.php?action=create-draw",{method:"POST",data:{year}});
      drawDialog.close();
      await loadData();showMessage("Le tirage a été réalisé. La magie de Noël peut commencer !","success");
    }catch(error){drawDialog.close();showMessage(error.message);await loadData();}
    finally{busy(button,false);}
  });
  byId("resetDrawBtn").addEventListener("click",()=>{
    if(!draw.has_draw)return;
    byId("confirmYear").value="";clearMessage("resetMessage");
    byId("yearLabel").textContent="Pour confirmer, écrivez "+year+" dans la case ci-dessous";
    resetDialog.showModal();
  });
  byId("confirmReset").addEventListener("click",async()=>{
    if(byId("confirmYear").value.trim()!==String(year)){
      showMessage("Saisissez l'année "+year+" pour confirmer.","error","resetMessage");byId("confirmYear").focus();return;
    }
    const button=byId("confirmReset");busy(button,true);clearMessage("resetMessage");
    try{
      await apiRequest("/admin.php?action=delete-draw",{method:"POST",data:{year,confirm_year:year}});
      resetDialog.close();await loadData();
      showMessage("Le tirage a été réinitialisé. Prévenez les participants avant de le relancer.","success");
    }catch(error){showMessage(error.message,"error","resetMessage");}
    finally{busy(button,false);}
  });
  loadData();
});
