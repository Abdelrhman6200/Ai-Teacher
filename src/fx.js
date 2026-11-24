/* ================= SOUND AND TOUCH: optional, quiet, and off or on by choice =================
   Sound effects are small synthesised tones (no audio files) and are off until the learner turns them on in You, Settings.
   Vibration is a short tap on phones that support it and is on by default. Neither changes any score. */
var AC=null;
function sfxCtx(){
  if(AC) return AC;
  try{ var C=window.AudioContext||window.webkitAudioContext; if(C) AC=new C(); }catch(e){}
  return AC;
}
function sfxTone(f, t0, dur, type){
  var c=AC, o=c.createOscillator(), g=c.createGain(), t=c.currentTime+t0;
  o.type=type||'sine'; o.frequency.value=f;
  g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(0.07,t+0.012); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  o.connect(g); g.connect(c.destination); o.start(t); o.stop(t+dur+0.03);
}
var SFX={
  good:[[660,0,.09],[880,.08,.13]],
  bad:[[220,0,.14,'triangle'],[165,.12,.22,'triangle']],
  tick:[[520,0,.05]],
  win:[[523,0,.12],[659,.11,.12],[784,.22,.12],[1047,.33,.3]],
  chest:[[523,0,.08],[659,.07,.08],[784,.14,.08],[1047,.21,.1],[1319,.3,.32]]
};
var HAP={good:[10], bad:[35], win:[20,40,20], chest:[20,40,20]};
function sfx(name){
  if(S.haptics!==false && HAP[name] && navigator.vibrate){ try{ navigator.vibrate(HAP[name]); }catch(e){} }
  if(!S.sound) return;
  var c=sfxCtx(); if(!c) return;
  try{
    if(c.state==='suspended') c.resume();
    (SFX[name]||[]).forEach(function(n){ sfxTone(n[0], n[1], n[2], n[3]); });
  }catch(e){}
}
function fxRows(){
  function seg(key, on){ return '<span class="segctl" role="group" aria-label="'+key+'"><button data-fx="'+key+':1" aria-pressed="'+on+'">On</button><button data-fx="'+key+':0" aria-pressed="'+!on+'">Off</button></span>'; }
  return '<div class="tr"><span>Sound effects<small>Short tones for right and wrong answers, chests and level-ups.</small></span>'+seg('sound', !!S.sound)+'</div>'
    +'<div class="tr"><span>Vibration<small>A small tap on phones that support it.</small></span>'+seg('haptics', S.haptics!==false)+'</div>';
}
function bindFx(){
  $$('[data-fx]').forEach(function(b){ b.onclick=function(){
    var p=b.getAttribute('data-fx').split(':'); S[p[0]]=p[1]==='1'; save();
    youView(); if(S[p[0]]) sfx('good');
  }; });
}
