'use strict';
(function(){
var st=STATES;
var stTiles=[].slice.call(document.querySelectorAll('#stGrid .st'));
var finRow=document.getElementById('finRow');
var finLabel=document.getElementById('finLabel');
var RING='0 0 0 2px #FFFFFF, 0 0 0 4px #7F9CC8',OFF='inset 0 0 0 1px rgba(0,0,0,0.16)';
function paint(row,idx){
  [].slice.call(row.children).forEach(function(b,k){
    b.setAttribute('aria-pressed',String(k===idx));
    b.querySelector('.d').style.boxShadow=k===idx?RING:OFF;
  });
}
FINISHES.forEach(function(f,i){
  var b=document.createElement('button');
  b.type='button';b.className='psw f';
  b.setAttribute('aria-label','Корпус: '+f.name);
  b.innerHTML='<span class="d" style="background:'+f.color+'"></span>';
  b.addEventListener('click',function(){changeFinish(i);});
  finRow.appendChild(b);
});
function changeFinish(i){
  var f=FINISHES[i];if(!f)return;
  document.querySelectorAll('.pen-svg').forEach(function(svg){
    svg.setAttribute('aria-label','AdamAI: '+f.name);
    svg.querySelector('[id$="FinishOverlay"]').setAttribute('opacity',i===0?'0':'1');
    svg.querySelectorAll('[id$="BodyTone"] stop').forEach(function(el,j){el.setAttribute('stop-color',f.gradient[j]);});
    svg.querySelectorAll('[id$="Face"]').forEach(function(el){el.setAttribute('fill',f.face);var p=el.querySelector('path');if(p)p.setAttribute('stroke',f.face);});
    svg.querySelectorAll('[id$="Glints"]').forEach(function(el){el.setAttribute('fill',f.glint);});
  });
  finLabel.textContent=f.name+' · корпус';
  paint(finRow,i);
}
function changeState(i){
  var x=st[i];if(!x)return;
  document.querySelectorAll('.pen-svg').forEach(function(svg){
    svg.querySelector('[id$="StatusOverlay"]').setAttribute('opacity',i===0?'0':'1');
    svg.querySelectorAll('[id$="StatusTone"] stop').forEach(function(el,j){el.setAttribute('stop-color',j===0?'#e5e9ef':x.color);});
    svg.querySelector('[id$="Signal"]').innerHTML=x.icon;
  });
  stTiles.forEach(function(el,k){el.setAttribute('aria-pressed',String(k===i));});
}
stTiles.forEach(function(el,k){
  el.addEventListener('click',function(){changeState(k);});
});
changeFinish(0);
changeState(0);

var zm=document.getElementById('zm'),zmImg=document.getElementById('zmImg'),lastFocus=null;
function openZoom(src,alt){
  lastFocus=document.activeElement;
  zmImg.src=src;zmImg.alt=alt||'';
  zm.classList.add('open');
  document.body.style.overflow='hidden';
  zm.focus({preventScroll:true});
}
function closeZoom(){
  if(!zm.classList.contains('open'))return;
  zm.classList.remove('open');
  document.body.style.overflow='';
  if(lastFocus&&lastFocus.focus)lastFocus.focus({preventScroll:true});
  lastFocus=null;
  setTimeout(function(){if(!zm.classList.contains('open'))zmImg.src='';},250);
}
document.querySelectorAll('.zb').forEach(function(b){
  b.addEventListener('click',function(){
    openZoom(b.getAttribute('data-zoom'),b.getAttribute('data-alt'));
  });
});
zm.addEventListener('click',closeZoom);
var toTop=document.getElementById('toTop');
if(toTop)toTop.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'});});
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeZoom();});
})();
'use strict';
(function(){
var scene=document.getElementById('scene'),
    stage=document.getElementById('stage'),
    spacer=document.getElementById('spacer'),
    cells=[document.getElementById('colL'),document.getElementById('colR')],
    crumb=document.getElementById('crumb'),
    bubR=document.getElementById('bubR'),
    bubT=document.getElementById('bubT'),
    bubS=document.getElementById('bubS'),
    toTopBtn=document.getElementById('toTop');
var rawCols=cells.map(function(c){return [].slice.call(c.querySelectorAll('.chp'));});
var N=Math.min(rawCols[0].length,rawCols[1].length);
var HOLD=0.36,STAG=0.5,RIPS=[-1,1];
var LABELS=['Беседа','Подтверждение','Браузер','Наблюдение','Обвести','Фоновые','Память','Соц-агент','Безопасность'];
var BUB=[
 ['Каждый шаг — на виду','Читаю и записываю'],
 ['Подтверждаю с вашим «Да»','Таймер или Esc — отказ'],
 ['Сам зайду в систему','Свой браузер и сейф'],
 ['Смотрю на экран','Раз в 10 минут'],
 ['Обведите — отвечу','Фрагмент в беседе'],
 ['Долгое — в фоне','А вы продолжаете'],
 ['Всё, что я знаю','Можно посмотреть'],
 ['Соц-агент на связи','Instagram · Threads · X'],
 ['Данные — внутри','Свой сервер и модели']
];
var RED=matchMedia('(prefers-reduced-motion: reduce)').matches;
var FLATM=matchMedia('(max-width:1060px)');
var flat=FLATM.matches,STEP=0,sceneTop=0,s=0,cur=-1;
var introStart=0,introDone=true;
var lastY=window.scrollY,lastST=0,vel=0,lastDir=1;

function make(arr){
 return arr.slice(0,N).map(function(el){
  var kh=el.querySelector('.kv');
  return {el:el,kh:kh,items:[].slice.call(kh.children),clean:true};
 });
}
var CH=[make(rawCols[0]),make(rawCols[1])];

function clearAll(ch){
 if(ch.clean)return;
 ch.clean=true;
 ch.items.forEach(function(it){it.style.opacity='';it.style.transform='';it.style.filter='';it.style.willChange='';});
}
function anim(ci,ki,phase,t){
 var ch=CH[ci][ki],items=ch.items,n=items.length;
 ch.clean=false;
 for(var k=0;k<n;k++){
  var t0=STAG*(n>1?k/(n-1):0);
  var u=(t-t0)/(1-t0);u=u<0?0:(u>1?1:u);
  var e=phase==='in'?1-Math.pow(1-u,2.3):Math.pow(u,1.7);
  var it=items[k],y,sc,op,bl;
  if(phase==='in'){y=72*(1-e);sc=.97+.03*e;op=e;bl=5*(1-e);}
  else{y=-70*e;sc=1-.04*e;op=Math.max(0,1-e*1.06);bl=5.5*e;}
  var x=RIPS[ci]*15*Math.sin(e*Math.PI);
  it.style.opacity=op.toFixed(3);
  it.style.transform='translate('+x.toFixed(2)+'px,'+y.toFixed(2)+'px) scale('+sc.toFixed(4)+')';
  it.style.filter=bl>.4?'blur('+bl.toFixed(1)+'px)':'';
  it.style.willChange='transform,opacity';
 }
}
function fitAll(){
 CH.forEach(function(col){col.forEach(function(ch){
  ch.kh.style.transform='';
  var h=ch.kh.offsetHeight,m=ch.el.offsetHeight||1;
  var sc=h>m?Math.max(.5,m/h):1;
  ch.kh.style.transform=sc<.999?'scale('+sc.toFixed(4)+')':'';
 });});
}
function layout(){
 flat=FLATM.matches;
 document.body.classList.toggle('flat',flat);
 if(flat){spacer.style.height='0px';stage.style.height='auto';CH.forEach(function(col){col.forEach(clearAll);});return;}
 stage.style.height='';
 STEP=stage.offsetHeight||window.innerHeight;
 sceneTop=scene.getBoundingClientRect().top+window.scrollY;
 spacer.style.height=Math.round((N-1)*STEP+STEP*0.55)+'px';
 fitAll();
}
function raw(){
 if(!STEP)return 0;
 var r=(window.scrollY-sceneTop)/STEP;
 return r<0?0:(r>N-1?N-1:r);
}
function settle(v,dir){
 var i=Math.floor(v+1e-9),f=v-i;
 if(f<HOLD)return i;
 return dir<0?i:Math.min(i+1,N-1);
}
var bubTO=0;
function setBub(t,sub){
 if(bubT.textContent===t&&bubS.textContent===sub)return;
 bubR.classList.add('flash');
 clearTimeout(bubTO);
 bubTO=setTimeout(function(){bubT.textContent=t;bubS.textContent=sub;bubR.classList.remove('flash');},140);
}
function applyCur(){
 var i=cur;
 if(crumb)crumb.textContent=i===0?'Обзор':(LABELS[i-1]||'');
 if(i>0&&BUB[i-1])setBub(BUB[i-1][0],BUB[i-1][1]);
}
function render(){
 if(flat)return;
 var r=raw();
 if(RED){s=r;}
 else{
  var now=performance.now(),dy=window.scrollY-lastY;
  lastY=window.scrollY;
  if(dy)lastST=now;
  vel=vel*0.55+dy*0.45;
  if(Math.abs(vel)>1.5)lastDir=vel>0?1:-1;
  var idle=(now-lastST)>130&&Math.abs(vel)<2;
  if(idle){
   var g=settle(r,lastDir),gd=g-s;
   if(Math.abs(gd)<=0.0008){s=g;}
   else{
    var stp=Math.max(0.008,Math.abs(gd)*0.075);
    var ns=s+stp*(gd>0?1:-1);
    if((ns-g)*(gd>0?1:-1)>=0)ns=g;
    s=ns;
   }
  } else {
   var d=r-s;
   if(Math.abs(d)<.0008)s=r;
   else s+=d*(Math.abs(d)<1?0.16:0.09);
  }
 }
 var it=1;
 if(!introDone){
  it=Math.min(1,(performance.now()-introStart)/950);
  if(it>=1)introDone=true;
  if(s>0.03)introDone=true;
 }
 var i=Math.floor(s+1e-9);if(i>N-1)i=N-1;
 var fr=s-i;
 var settled=fr<HOLD?i:Math.min(i+1,N-1);
 if(settled!==cur){cur=settled;applyCur();if(toTopBtn)toTopBtn.classList.toggle('is-hidden',cur===0);}
 CH.forEach(function(col,ci){col.forEach(function(ch,k){
  var e=(s-(k-1+HOLD))/(1-HOLD),o=(s-(k+HOLD))/(1-HOLD);
  e=e<0?0:(e>1?1:e);o=o<0?0:(o>1?1:o);
  if(k===0&&!introDone)e=Math.min(1,it);
  var on=e>0&&o<1;
  ch.el.classList.toggle('on',on);
  ch.el.style.pointerEvents=on&&(e<1||o>0)?'none':'';
  if(!RED&&on){
   if(e>0&&e<1)anim(ci,k,'in',e);
   else if(o>0&&o<1)anim(ci,k,'out',o);
   else clearAll(ch);
  } else clearAll(ch);
 });});
}
function tick(){render();requestAnimationFrame(tick);}

layout();
s=raw();
cur=-1;
if(!RED&&s<0.04){introDone=false;introStart=performance.now();}
var rz;
window.addEventListener('resize',function(){clearTimeout(rz);rz=setTimeout(function(){layout();},140);});
if(FLATM.addEventListener)FLATM.addEventListener('change',function(){layout();s=raw();});
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){layout();});
[].slice.call(document.querySelectorAll('.chp img')).forEach(function(im){
 if(!im.complete)im.addEventListener('load',fitAll,{once:true});
});
requestAnimationFrame(tick);
})();
