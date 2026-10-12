const STYLES = [
  ["None",""],["Photorealistic","ultra photorealistic, 8k, sharp focus"],
  ["Anime","anime style, studio ghibli inspired, vibrant"],
  ["Cyberpunk","cyberpunk, neon lights, futuristic city"],
  ["Oil Painting","classical oil painting, textured brushstrokes"],
  ["3D Render","3d render, octane, pixar style"],
  ["Fantasy","epic fantasy art, magical, detailed"],
  ["Minimalist","minimalist, clean, simple, elegant"],
  ["Watercolor","soft watercolor painting, artistic"],
  ["Cinematic","cinematic lighting, movie still, dramatic"]
];
const SURPRISES = [
  "a majestic lion wearing a golden crown, neon city background",
  "floating islands with waterfalls in the sky, sunset",
  "a cozy cabin in snowy mountains at night, warm lights",
  "cyberpunk street food market in the rain, neon signs",
  "an astronaut riding a horse on mars",
  "underwater palace with glowing jellyfish"
];
let style="", W=1024, H=1024, MODEL="flux", lastUrl="";

const $=id=>document.getElementById(id);
const styleBox=$("styles");
STYLES.forEach(([n,s],i)=>{
  const b=document.createElement("button");
  b.className="chip"+(i===0?" active":""); b.textContent=n; b.dataset.s=s;
  b.onclick=()=>{styleBox.querySelectorAll(".chip").forEach(c=>c.classList.remove("active"));b.classList.add("active");style=s;};
  styleBox.appendChild(b);
});
document.querySelectorAll("#ratios .chip").forEach(c=>c.onclick=()=>{
  document.querySelectorAll("#ratios .chip").forEach(x=>x.classList.remove("active"));
  c.classList.add("active"); W=+c.dataset.w; H=+c.dataset.h;
});
document.querySelectorAll("#models .chip").forEach(c=>c.onclick=()=>{
  document.querySelectorAll("#models .chip").forEach(x=>x.classList.remove("active"));
  c.classList.add("active"); MODEL=c.dataset.m;
});
$("surprise").onclick=()=>{$("prompt").value=SURPRISES[Math.floor(Math.random()*SURPRISES.length)];};
$("enhance").onclick=()=>{
  const p=$("prompt").value.trim(); if(!p) return alert("Write a prompt first!");
  $("prompt").value=p+", ultra detailed, professional photography, 8k, sharp focus, vibrant colors, masterpiece";
};
$("generate").onclick=generate; $("regen").onclick=generate;
$("fullscreen").onclick=()=>{const i=$("resultImg"); if(i.requestFullscreen) i.requestFullscreen();};
$("download").onclick=async()=>{
  if(!lastUrl) return;
  try{
    const r=await fetch(lastUrl); const b=await r.blob();
    const a=document.createElement("a"); a.href=URL.createObjectURL(b);
    a.download="pixelforge-"+Date.now()+".jpg"; a.click();
  }catch(e){ window.open(lastUrl,"_blank"); }
};

function generate(){
  let p=$("prompt").value.trim();
  if(!p){ alert("Please describe your image first!"); $("prompt").focus(); return; }
  if(style) p+=", "+style;
  const seed=Math.floor(Math.random()*999999);
  lastUrl=`https://image.pollinations.ai/prompt/${encodeURIComponent(p)}?width=${W}&height=${H}&seed=${seed}&model=${MODEL}&nologo=true`;
  $("result").classList.remove("hidden");
  $("loader").classList.remove("hidden");
  $("resultImg").style.opacity="0";
  $("generate").disabled=true; $("generate").textContent="⏳ Generating…";
  const img=new Image();
  img.onload=()=>{
    $("resultImg").src=lastUrl; $("resultImg").style.opacity="1";
    $("loader").classList.add("hidden");
    $("generate").disabled=false; $("generate").textContent="🎨 Generate Image";
    saveHistory(lastUrl);
    $("result").scrollIntoView({behavior:"smooth",block:"center"});
  };
  img.onerror=()=>{
    $("loader").classList.add("hidden");
    $("generate").disabled=false; $("generate").textContent="🎨 Generate Image";
    alert("Generation failed — try again!");
  };
  img.src=lastUrl;
}

function saveHistory(url){
  try{
    let h=JSON.parse(localStorage.getItem("pf_hist")||"[]");
    h.unshift(url); h=h.slice(0,24);
    localStorage.setItem("pf_hist",JSON.stringify(h)); renderHistory();
  }catch(e){}
}
function renderHistory(){
  const box=$("history"); box.innerHTML="";
  let h=[]; try{ h=JSON.parse(localStorage.getItem("pf_hist")||"[]"); }catch(e){}
  $("emptyHist").style.display=h.length?"none":"block";
  h.forEach(u=>{
    const im=document.createElement("img"); im.src=u; im.loading="lazy";
    im.onclick=()=>window.open(u,"_blank"); box.appendChild(im);
  });
}
renderHistory();
