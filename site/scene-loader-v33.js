/* V33: load visible artwork and prepare one next video at a time. */
(() => {
  'use strict';
  const media = window.LESSON_MEDIA;
  const stage = document.getElementById('stage');
  const cache = new Map();
  const events = [];
  const starts = new Map();
  let phase = '', pending = null, generation = 0;
  const groups = {
    cover: ['cover'], intro: ['intro','buttons'], mission: ['mission','buttons'],
    arrival: ['arrival','buttons'], cave: ['cave','buttons'], discover: ['cave','reward','buttons'],
    learn: ['cave','learning','buttons'], trace: ['cave','learning','buttons'],
    quiz: ['cave','learning','quiz','reward','buttons'], outro: ['outro','reward','buttons'],
    finish: ['finish','reward','buttons']
  };
  const log = (type, details = {}) => { events.push({ type, at: Math.round(performance.now()), phase, ...details }); if(events.length>300)events.shift(); };
  function hydrate() {
    const active = groups[phase] || [];
    document.querySelectorAll('[data-scene-src],[data-scene-href],[data-scene-poster]').forEach(el => {
      if (!(el.dataset.scenes || '').split(' ').some(group => active.includes(group))) return;
      for (const attr of ['src','href','poster']) {
        const key = 'data-scene-' + attr;
        if (el.hasAttribute(key)) { el.setAttribute(attr, el.getAttribute(key)); el.removeAttribute(key); }
      }
    });
    for(const asset of window.LESSON_SCENE_ART || []) {
      if(asset.groups.some(group => active.includes(group))) stage.style.setProperty(asset.variable, `url("${asset.url}")`);
    }
  }
  const fullyBuffered = video => Number.isFinite(video.duration) && video.duration > 0 &&
    video.buffered.length > 0 && video.buffered.start(0) < .1 && video.buffered.end(video.buffered.length-1) >= video.duration-.12;
  function cancelPending() { if(pending){pending.controller.abort();pending=null;} }
  function prefetch(url,priority='low') {
    if(!url || document.hidden)return Promise.resolve();
    if(cache.has(url))return Promise.resolve(cache.get(url));
    if(pending?.url===url)return pending.promise;
    cancelPending();
    const controller = new AbortController();
    const job = {url,controller};pending=job;log('prefetch-start',{url});
    const timeout=setTimeout(()=>controller.abort(),90000);
    job.promise=fetch(url,{signal:controller.signal,priority}).then(response=>{
      if(!response.ok)throw new Error('HTTP '+response.status);
      return response.blob();
    }).then(blob=>{
      if(controller.signal.aborted)return;
      cache.set(url,URL.createObjectURL(blob));log('prefetch-ready',{url,bytes:blob.size});return cache.get(url);
    }).catch(error=>{log(error.name==='AbortError'?'prefetch-cancel':'prefetch-error',{url});})
      .finally(()=>{clearTimeout(timeout);if(pending===job)pending=null;});
    return job.promise;
  }
  function scheduleNext() {
    const active = {intro:'introVideo',mission:'missionVideo',arrival:'introVideo',cave:'moveInviteVideo',outro:'outroVideo'}[phase];
    const next = {intro:media.missionVideo,mission:media.arrival,arrival:media.moveInvite,
      cave:media.cave,learn:media.outro,trace:media.outro,quiz:media.outro}[phase];
    if(!next || document.hidden) return;
    if(active && !fullyBuffered(document.getElementById(active)))return;
    prefetch(next);
  }
  function source(video,url) {
    const target=cache.get(url)||(video.id==='caveVideo'?url:null);
    video.preload='auto';
    if(target && video.getAttribute('src')!==target)video.src=target;
    else if(!target && video.hasAttribute('src')){video.removeAttribute('src');video.load();}
    video.dataset.mediaSource=url;
    log('video-source',{url,cached:cache.has(url)});
  }
  function cancel(video) {
    const start=starts.get(video);
    if(!start)return false;
    start.cancel();return true;
  }
  function play(video) {
    if(starts.has(video))return starts.get(video).promise;
    const stamp=generation,startedAt=performance.now();
    let resolve,reject,cancelled=false;
    const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});
    const finish=(run,error)=>{
      if(starts.get(video)?.promise===promise)starts.delete(video);
      if(isCurrent(video))waiting.hidden=true;
      if(error){reject(error);return;}
      if(run){log('buffer-start',{video:video.id,waitMs:Math.round(performance.now()-startedAt)});video.play().then(resolve,reject);}
      else resolve();
    };
    starts.set(video,{promise,cancel:()=>{cancelled=true;finish(false);}});
    if(isCurrent(video))waiting.hidden=false;
    const url=video.dataset.mediaSource;
    prefetch(url,'high').then(target=>{
      if(cancelled)return;
      if(stamp!==generation||document.hidden||!document.getElementById('notes').hidden){finish(false);return;}
      // Short clips are fully cached before playback; if fetch fails, retain native streaming fallback.
      const selected=target||url;
      if(video.getAttribute('src')!==selected)video.src=selected;
      finish(true);scheduleNext();
    }).catch(error=>finish(false,error));
    return promise;
  }
  const waiting = document.createElement('div');
  waiting.id='sceneBufferStatus';waiting.hidden=true;waiting.setAttribute('role','status');
  waiting.textContent='视频准备中，请稍候…';stage.append(waiting);
  function isCurrent(video){return ({intro:'introVideo',arrival:'introVideo',mission:'missionVideo',cave:'moveInviteVideo',outro:'outroVideo'}[phase])===video.id && !video.hidden;}
  document.querySelectorAll('video').forEach(video=>{
    video.addEventListener('progress',scheduleNext);
    video.addEventListener('canplaythrough',scheduleNext);
    video.addEventListener('waiting',()=>{if(isCurrent(video)){waiting.hidden=false;log('waiting',{video:video.id,time:video.currentTime});}});
    for(const event of ['playing','ended','pause','error'])video.addEventListener(event,()=>{if(isCurrent(video))waiting.hidden=true;});
  });
  function enter(nextPhase) {
    if(nextPhase===phase){hydrate();return;}
    phase=nextPhase;generation++;
    const current={intro:media.intro,mission:media.missionVideo,arrival:media.arrival,cave:media.moveInvite,outro:media.outro}[phase];
    if(pending?.url!==current)cancelPending();
    waiting.hidden=true;hydrate();
    for(const video of [...starts.keys()])cancel(video);
    const currentGeneration=generation;
    if(phase==='cover') {
      const cover=document.querySelector('#cover img');
      const ready=cover.decode ? cover.decode().catch(()=>{}) : Promise.resolve();
      ready.then(()=>{if(generation===currentGeneration && !document.hidden){prefetch(media.intro);log('opening-warmup');}});
    } else if(phase==='cave') {
      document.querySelector('.backdrop').src=media.cavePoster;
      document.getElementById('caveVideo').poster=media.cavePoster;
    }
    // Give current-scene image requests priority over speculative video transfer.
    setTimeout(()=>{if(generation===currentGeneration)scheduleNext();},1200);
    log('scene-enter');
  }
  document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelPending();else scheduleNext();});
  window.LESSON_LOADER={enter,source,play,cancel,isWaiting:video=>starts.has(video),events,fullyBuffered};
})();
