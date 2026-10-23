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
    svg.querySelector('[id$="FinishOverlay"]').setAttribute('opacity','1');
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
var themeBtn=document.getElementById('themeBtn');
if(themeBtn)themeBtn.addEventListener('click',function(){
 var d=document.documentElement;
 var t=d.getAttribute('data-theme')==='dark'?'light':'dark';
 d.setAttribute('data-theme',t);
 d.style.colorScheme=t;
 try{localStorage.setItem('adam-theme',t);}catch(e){}
});
var penEyes=document.getElementById('penEyes');
var eyeGroups=penEyes?penEyes.querySelectorAll('.eye'):[];
if(penEyes&&eyeGroups.length===2&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&matchMedia('(pointer: fine)').matches){
 var eyePos={x:0,y:0},eyeAim={x:0,y:0};
 var eyeR=null;
 function eyeRects(){
  var a=eyeGroups[0].getBoundingClientRect(),b=eyeGroups[1].getBoundingClientRect();
  return {x:(a.left+a.right+b.left+b.right)/4,y:(a.top+a.bottom+b.top+b.bottom)/4};
 }
 function aim(e){
  if(!eyeR)eyeR=eyeRects();
  var dx=e.clientX-eyeR.x,dy=e.clientY-eyeR.y;
  eyeAim.x=Math.max(-8,Math.min(8,dx*0.035));
  eyeAim.y=Math.max(-6,Math.min(6,dy*0.035));
 }
 document.addEventListener('pointermove',aim,{passive:true});
 document.addEventListener('pointerleave',function(){eyeAim.x=0;eyeAim.y=0;});
 var eyeRafRunning=true;
 function eyeTick(){
  var wasMoving=Math.abs(eyePos.x-eyeAim.x)+Math.abs(eyePos.y-eyeAim.y);
  eyePos.x+=(eyeAim.x-eyePos.x)*0.08;
  eyePos.y+=(eyeAim.y-eyePos.y)*0.08;
  if(wasMoving>0.003||Math.abs(eyeAim.x)+Math.abs(eyeAim.y)>0){
   penEyes.setAttribute('transform','translate('+eyePos.x.toFixed(2)+' '+eyePos.y.toFixed(2)+')');
  }
  if(eyeRafRunning)requestAnimationFrame(eyeTick);
 }
 requestAnimationFrame(eyeTick);
 var eyeSz=function(){eyeR=null;};
 window.addEventListener('resize',function(){clearTimeout(eyeSz);eyeSz=setTimeout(function(){eyeR=null;},140);});
 window.addEventListener('scroll',function(){eyeR=null;},{passive:true});
}
var penIdleNext=performance.now()+3200,penIdleBusy=false;
var penIdleRed=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!penIdleRed){
 var penStageNode=document.querySelector('.pen-stage');
 var penIdleBlocked=function(){
  return penStageNode.classList.contains('wave')||penStageNode.classList.contains('sway')||penStageNode.classList.contains('peek')||penStageNode.classList.contains('dbl');
 };
 var penIdleActs=[
  function(){penStageNode.classList.add('sway');setTimeout(function(){penStageNode.classList.remove('sway');},2900);},
  function(){penStageNode.classList.add('sway');setTimeout(function(){penStageNode.classList.remove('sway');},2900);},
  function(){penStageNode.classList.add('peek');setTimeout(function(){penStageNode.classList.remove('peek');},1900);},
  function(){penStageNode.classList.add('dbl');setTimeout(function(){penStageNode.classList.remove('dbl');},700);},
  function(){penStageNode.classList.add('dbl');setTimeout(function(){penStageNode.classList.remove('dbl');},700);},
  function(){penStageNode.classList.add('happy');setTimeout(function(){penStageNode.classList.remove('happy');},1500);}
 ];
 setInterval(function(){
  var now=performance.now();
  if(document.hidden||penIdleBusy||now<penIdleNext||penIdleBlocked())return;
  penIdleBusy=true;
  penIdleActs[Math.floor(Math.random()*penIdleActs.length)]();
  penIdleNext=now+3200+Math.random()*2600;
  setTimeout(function(){penIdleBusy=false;},3000);
  },350);
 }
 var bLh=document.getElementById('bLh'),bLs=document.getElementById('bLs'),bubLN=document.getElementById('bubL');
 if(bLh&&bLs&&bubLN&&window.matchMedia&&matchMedia('(pointer: fine)').matches){
  var bIdle=[['Подсказка','Обведи и спроси'],['Привал?','Скажи — помогу'],['Знаю про файлы всё','Спроси про таблицы'],['Пока на связи','Не скучай']];
  var bIx=0,bNear=false,bSaid=false,bPenR=null;
  function bSwap(h,s){
   bubLN.classList.add('flash');
   setTimeout(function(){bLh.textContent=h;bLs.textContent=s;bubLN.classList.remove('flash');},140);
  }
  window.addEventListener('scroll',function(){bPenR=null;},{passive:true});
  window.addEventListener('resize',function(){bPenR=null;});
  document.addEventListener('pointermove',function(e){
   if(!bPenR){var c=document.querySelector('.pen-stage');if(!c)return;bPenR=c.getBoundingClientRect();}
   var d=Math.hypot(e.clientX-(bPenR.left+bPenR.width/2),e.clientY-(bPenR.top+bPenR.height/2));
   if(!bNear&&!bSaid&&d<180){bNear=true;bSaid=true;bSwap('Я тебя вижу!','Привет-привет');}
   if(bNear&&d>250){bNear=false;bSaid=false;}
  },{passive:true});
  setInterval(function(){
   if(document.hidden||bNear)return;
   bIx=(bIx+1)%bIdle.length;
   bSwap(bIdle[bIx][0],bIdle[bIx][1]);
  },21000);
 }
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
function typeInto(el,txt,ms,then){
 clearTimeout(el._tto);
 el.textContent='';
 var i=0;
 var step=function(){i++;el.textContent=txt.slice(0,i);if(i<txt.length)el._tto=setTimeout(step,ms);else if(then)then();};
 step();
}
function setBub(t,sub){
 if(bubT.textContent===t&&bubS.textContent===sub&&!bubT._tto&&!bubS._tto)return;
 clearTimeout(bubT._tto);clearTimeout(bubS._tto);
 bubR.classList.add('flash');
 clearTimeout(bubTO);
 bubTO=setTimeout(function(){
  bubR.classList.remove('flash');
  if(RED){bubT.textContent=t;bubS.textContent=sub;return;}
  typeInto(bubT,t,24,function(){typeInto(bubS,sub,14);});
 },140);
}
function statusState(idx){
 [].slice.call(document.querySelectorAll('.pen-svg')).forEach(function(svg){
  svg.querySelector('[id$="StatusOverlay"]').setAttribute('opacity',idx===0?'0':'1');
  [].slice.call(svg.querySelectorAll('[id$="StatusTone"] stop')).forEach(function(el,j){el.setAttribute('stop-color',j===0?'#e5e9ef':STATES[idx].color);});
  var sig=svg.querySelector('[id$="Signal"]');if(sig)sig.innerHTML=STATES[idx].icon;
 });
}
function penActiveState(){
 var t=document.querySelectorAll('#stGrid .st');
 for(var i=0;i<t.length;i++){if(t[i].getAttribute('aria-pressed')==='true')return i;}
 return 0;
}
function statusPulse(idx,ms,then){
 var back=penActiveState();
 statusState(idx);
 setTimeout(function(){statusState(back);if(then)then();},ms);
}
function penLayer(id){return document.getElementById(id);}
function demoPop(){
 var pop=penLayer('demoPop');if(!pop||pop.classList.contains('show'))return;
 pop.classList.add('show');
 penStage().classList.add('wave');setTimeout(function(){penStage().classList.remove('wave');},900);
 statusPulse(2,1000);
 setBub('Напиши, что нужно','Понимает обычную речь');
 setTimeout(function(){pop.classList.remove('show');},3400);
}
function demoKeys(){
 var kw=penLayer('demoKeys');if(!kw||kw.classList.contains('show'))return;
 kw.classList.add('show');
 var keys=[].slice.call(kw.querySelectorAll('.key'));
 keys.forEach(function(k,j){setTimeout(function(){
  k.classList.add('press');
  if(j===keys.length-1){statusPulse(1,700);setBub('Ctrl + Alt + Пробел','Строка ввода — откуда угодно');}
 },j*300);});
 setTimeout(function(){keys.forEach(function(k){k.classList.remove('press');});},1500);
 setTimeout(function(){kw.classList.remove('show');},2600);
}
function demoLasso(){
 var dim=penLayer('demoDim'),fr=penLayer('demoFrame');
 if(!fr||fr.classList.contains('show'))return;
 var d=document.querySelector('.disc').getBoundingClientRect();
 fr.style.left=(d.left-24)+'px';fr.style.top=(d.top-16)+'px';fr.style.width=(d.width+48)+'px';fr.style.height=(d.height+34)+'px';
 statusPulse(2,1500);
 dim.classList.add('on');fr.classList.add('show');
 setBub('Обвёл фрагмент','Разберу, что здесь не так');
 setTimeout(function(){dim.classList.remove('on');fr.classList.remove('show');},2700);
}
function penStage(){return document.querySelector('.pen-stage');}
function penWink(){
 var es=document.querySelectorAll('.pen-svg .eye');
 if(es.length<2)return;
 var eye=es[1];
 eye.style.animation='winkAnim .8s ease .05s';
 setTimeout(function(){eye.style.animation='';},1050);
}
function waveAndWink(){
 if(RED)return;
 penStage().classList.add('wave');
 setTimeout(function(){penStage().classList.remove('wave');},900);
 setTimeout(penWink,600);
}
 function applyCur(){
  var i=cur;
  if(crumb)crumb.textContent=i===0?'Обзор':(LABELS[i-1]||'');
  if(dotBtns){
   dotBtns.forEach(function(b,k){
    var on=k===i;
    b.classList.toggle('on',on);
    if(on)b.setAttribute('aria-current','true');else b.removeAttribute('aria-current');
   });
  }
  if(i===N-1){setBub('Вопросы?','Отвечу — спрашивайте');waveAndWink();return;}
  if(i>0&&BUB[i-1])setBub(BUB[i-1][0],BUB[i-1][1]);
 }
 var dotsNav=document.getElementById('dotsNav');
 var dotBtns=null;
 if(dotsNav){
  dotBtns=[];
  for(var di=0;di<N;di++){
   var dlb=di===0?'Обзор':(di===N-1?'Итог':(LABELS[di-1]||''));
   var db=document.createElement('button');
   db.type='button';db.className='dot';db.title=dlb;
   db.setAttribute('aria-label','Слайд '+(di+1)+': '+dlb);
   (function(k){
    db.addEventListener('click',function(){
     window.scrollTo({top:sceneTop+k*STEP,behavior:RED?'auto':'smooth'});
    });
   })(di);
   dotsNav.appendChild(db);dotBtns.push(db);
  }
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

[].slice.call(document.querySelectorAll('.way')).forEach(function(w){
 var kind=w.getAttribute('data-demo');if(!kind)return;
 var go=function(){if(kind==='pop')demoPop();else if(kind==='keys')demoKeys();else demoLasso();};
 w.addEventListener('click',go);
 w.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();go();}});
});

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
var penSvgClick=document.querySelector('.pen-svg');
if(penSvgClick){
 penSvgClick.addEventListener('click',function(){
  var st=penStage();
  if(st.classList.contains('hop'))return;
  st.classList.add('hop');
  setTimeout(function(){st.classList.remove('hop');},900);
  demoPop();
 });
}
})();
