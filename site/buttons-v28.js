
(()=>{
 const stage=document.getElementById('stage');
 const selector='button.secondary,button.small-btn,button.mission-back,button#undoStroke,button#clearWriting';
 const observer=new ResizeObserver(entries=>{
  for(const {target, borderBoxSize} of entries){
   const box=borderBoxSize[0]; if(!box||!box.blockSize)continue;
   const h=box.blockSize;
   target.style.setProperty('--aux-cap',Math.min(h*.55,box.inlineSize*.3)+'px');
   target.style.setProperty('--aux-shift',(-h*.0547)+'px');
  }
 });
 function decorate(){
  for(const b of stage.querySelectorAll(selector)){
   if(!b.classList.contains('aux-caps')){if(getComputedStyle(b).position==='static')b.style.position='relative';b.classList.add('aux-caps');observer.observe(b);}
   if(!b.querySelector(':scope > .aux-material')){
    const art=document.createElement('span');art.className='aux-material';art.setAttribute('aria-hidden','true');
    art.innerHTML='<i></i><i></i><i></i>';b.append(art);
   }
  }
 }
 decorate();
 new MutationObserver(decorate).observe(stage,{childList:true,subtree:true});
})();
