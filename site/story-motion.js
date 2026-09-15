/* Story choreography. All instructional text and answers remain live HTML. */
window.createStoryDirector=function({stage,panel,footer,reduced,record}){
 let token=0,busy=false,resolveWait=null;
 const $=s=>document.querySelector(s),animations=new Set();
 const move=(el,k,o)=>{if(!el||reduced())return;const a=el.animate(k,o);animations.add(a);a.finished.catch(()=>{}).finally(()=>animations.delete(a));return a;};
 const wait=ms=>new Promise(r=>{const timer=setTimeout(()=>{resolveWait=null;r(true)},ms);resolveWait=()=>{clearTimeout(timer);r(false);};});
 function clean(){panel.style.visibility='';document.querySelectorAll('.story-cue,.story-ghost,.clue-flight,.stage-cloud').forEach(el=>el.remove());panel.inert=false;footer.inert=false;stage.classList.remove('story-changing');}
 function cancel(){token++;resolveWait?.();resolveWait=null;animations.forEach(a=>a.cancel());animations.clear();busy=false;clean();}
 function ghost(el){const copy=el.cloneNode(true);copy.removeAttribute('id');copy.querySelectorAll('[id]').forEach(x=>x.removeAttribute('id'));copy.classList.add('story-ghost');copy.inert=true;copy.setAttribute('aria-hidden','true');copy.style.cssText=`position:absolute;left:${el.offsetLeft}px;top:${el.offsetTop}px;width:${el.offsetWidth}px;height:${el.offsetHeight}px;z-index:24;pointer-events:none;`;copy.querySelectorAll('canvas').forEach((c,i)=>c.getContext('2d').drawImage(el.querySelectorAll('canvas')[i],0,0));stage.append(copy);return copy;}
 async function question(index,render,speak){
  if(busy)return;busy=true;const run=++token;record('story-question-begin',{index});
  if(reduced()){render();speak();busy=false;return;}
  panel.inert=true;footer.inert=true;stage.classList.add('story-changing');$('#phaseLabel').textContent='第一关 · 解开机关';
  const old=ghost(panel);panel.style.visibility='hidden';
  move(old,[{opacity:1,transform:'scale(1)'},{opacity:0,transform:'translateY(-35px) scale(.84)'}],{duration:430,easing:'cubic-bezier(.5,0,.7,.4)',fill:'forwards'});
  const clouds=[0,1].map(i=>{const c=document.createElement('div');c.className='stage-cloud'+(i?' right':'');c.setAttribute('aria-hidden','true');stage.append(c);move(c,[{opacity:0,transform:`translateX(${i?280:-280}px)`},{opacity:.85,transform:`translateX(${i?-220:220}px)`,offset:.55},{opacity:0,transform:`translateX(${i?300:-300}px)`}],{duration:1400,easing:'ease-in-out',fill:'both'});return c;});
  const cue=document.createElement('div');cue.className='story-cue';cue.setAttribute('aria-hidden','true');cue.innerHTML=`<div class="cue-orbit"></div><div class="cue-orbit second"></div><div class="cue-seal"><img src="assets/images/v3/U05_rain_reward.webp" alt=""><span>雨</span></div><div class="cue-chapter">${index?'第二道机关':'第一道机关'}</div><div class="cue-title">${index?'解开雨字头的秘密':'找到藏起来的雨字头'}</div>`;stage.append(cue);
  move(cue,[{opacity:0,transform:'scale(.62) translateY(70px)'},{opacity:1,transform:'scale(1.03)',offset:.72},{opacity:1,transform:'scale(1)'}],{duration:600,easing:'cubic-bezier(.16,.7,.2,1)',fill:'both'});
  if(!await wait(1050)||run!==token){panel.style.visibility='';return;}
  render();panel.style.visibility='';panel.inert=true;footer.inert=true;
  move(cue,[{opacity:1,transform:'scale(1)'},{opacity:0,transform:'translateY(-225px) scale(.3)'}],{duration:550,easing:'cubic-bezier(.5,0,.25,1)',fill:'forwards'});
  const guide=panel.querySelector('.quiz-guide');move(guide,[{opacity:0,transform:'translateX(-170px) rotate(-7deg)'},{opacity:1,transform:'translateX(12px)',offset:.78},{opacity:1,transform:'none'}],{duration:850,delay:120,fill:'backwards',easing:'cubic-bezier(.18,.8,.25,1)'});
  const top=panel.querySelector('.quiz-top');move(top,[{opacity:0,transform:'translateY(32px)'},{opacity:1,transform:'none'}],{duration:600,delay:230,fill:'backwards',easing:'ease-out'});
  panel.querySelectorAll('.option').forEach((el,i)=>move(el,[{opacity:0,transform:`translate(${(1-i)*310}px,170px) scale(.4) rotateY(${(1-i)*46}deg) rotate(${(i-1)*12}deg)`},{opacity:1,transform:`translateY(-9px) scale(1.015)`,offset:.78},{opacity:1,transform:'none'}],{duration:900,delay:300+i*160,easing:'cubic-bezier(.12,.72,.2,1)',fill:'backwards'}));
  if(!await wait(330)||run!==token)return;speak();
  if(!await wait(1100)||run!==token)return;
  busy=false;clean();record('story-question-ready',{index});
 }
 function decorateButton(button,answered){
  button.classList.add('story-next');button.innerHTML=`<span class="next-orb" aria-hidden="true">${answered?'✦':'·'}</span><span class="next-label">${button.textContent}</span><span class="next-sheen" aria-hidden="true"></span>`;
 }
 function reward(option,button){
  if(!option||!button)return;button.disabled=true;button.classList.remove('attention');const current=token;
  const label=button.querySelector('.next-label');const final=label.textContent;label.textContent='线索正在汇聚…';
  if(reduced()){label.textContent=final;button.disabled=false;return;}
  const rect=stage.getBoundingClientRect(),s=rect.width/1920,a=option.getBoundingClientRect(),b=button.getBoundingClientRect();
  const x=(a.x+a.width/2-rect.x)/s,y=(a.y+a.height/2-rect.y)/s,tx=(b.x+38*s-rect.x)/s,ty=(b.y+b.height/2-rect.y)/s;
  const fly=document.createElement('div');fly.className='clue-flight';fly.setAttribute('aria-hidden','true');fly.style.left=(x-55)+'px';fly.style.top=(y-55)+'px';fly.innerHTML='<img src="assets/images/v3/U05_rain_reward.webp" alt="">';stage.append(fly);
  const anim=move(fly,[{opacity:0,transform:'scale(.3)'},{opacity:1,transform:'translateY(-45px) scale(1.2)',offset:.25},{opacity:1,transform:`translate(${(tx-x)*.52}px,${(ty-y)*.3-140}px) scale(.85)`,offset:.58},{opacity:0,transform:`translate(${tx-x}px,${ty-y}px) scale(.3)`}],{duration:1150,easing:'cubic-bezier(.28,.48,.25,1)',fill:'forwards'});
  anim.finished.then(()=>{fly.remove();if(token!==current||!button.isConnected)return;label.textContent=final;button.disabled=false;button.classList.add('charged');move(button,[{transform:'scale(.96)'},{transform:'scale(1.08)',offset:.5},{transform:'scale(1)'}],{duration:520,easing:'ease-out'});record('story-button-charged');}).catch(()=>fly.remove());
 }
 function exitToScene(render){
  const old=ghost(panel),art=ghost($('#learningPanelArt'));art.style.display='grid';art.style.gridTemplateColumns=getComputedStyle($('#learningPanelArt')).gridTemplateColumns;art.style.zIndex=23;
  render();
  if(reduced()){old.remove();art.remove();return;}
  [old,art].forEach(el=>{const a=move(el,[{opacity:1,transform:'scale(1)'},{opacity:0,transform:'translateY(100px) scale(.55)'}],{duration:850,easing:'cubic-bezier(.55,0,.25,1)',fill:'forwards'});a.finished.finally(()=>el.remove());});record('story-return-to-wukong');
 }
 return {get busy(){return busy},question,reward,decorateButton,exitToScene,cancel};
};
