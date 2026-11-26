const menu=document.getElementById("menu"),nav=document.getElementById("nav");
menu.addEventListener("click",()=>nav.classList.toggle("open"));
nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>nav.classList.remove("open")));
document.getElementById("year").textContent=new Date().getFullYear();
const form=document.getElementById("contactForm"),status=document.getElementById("status");
form.addEventListener("submit",async e=>{
 e.preventDefault();if(!form.reportValidity())return;
 const button=form.querySelector("button");button.disabled=true;button.textContent="SENDING...";
 status.className="";status.textContent="";
 try{
  const payload=Object.fromEntries(new FormData(form).entries());
  const r=await fetch("/api/contact",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
  const data=await r.json();if(!r.ok||!data.ok)throw new Error(data.error||"Message could not be sent.");
  status.textContent=data.message;status.className="success";form.reset();
 }catch(err){status.textContent=err.message||"Server connection failed.";status.className="error";}
 finally{button.disabled=false;button.textContent="SEND MESSAGE ↗";}
});