/* ================= BLITZ: ten questions, ninety seconds. Build a combo, beat your best. =================
   It uses the real questions from the sessions you can open. A right answer counts as spaced review; a miss leaves a smudge. */
var BL=null;
var BLITZ_SECS=90, BLITZ_N=10;
function blitzPool(){
  var r=reachN(), seen=[], fresh=[];
  SESSIONS.forEach(function(s){ if(s.n>r) return; s.nodes.forEach(function(nd){ (nd.items||[]).forEach(function(it){
    if(it.type!=='mcq'||!it.core||it.post) return;
    (S.srs[it.id]?seen:fresh).push(it);
  }); }); });
  // at risk first: confident errors, then the lowest boxes and the longest overdue
  seen.forEach(function(it){ it._r=Math.random(); });
  seen.sort(function(a,b){ var ra=S.srs[a.id], rb=S.srs[b.id]; return ((S.sur&&S.sur[a.id])?0:1)-((S.sur&&S.sur[b.id])?0:1) || ra.b-rb.b || (ra.due<rb.due?-1:ra.due>rb.due?1:0) || (a._r-b._r); });
  var pool=seen.slice(0,BLITZ_N);
  if(pool.length<BLITZ_N) pool=pool.concat(shuffle(fresh).slice(0,BLITZ_N-pool.length));
  return pool;
}
function blitzDay(){ var b=S.blitz||(S.blitz={best:0,runs:0,day:'',runsDay:0,bestCombo:0}); if(b.day!==today()){ b.day=today(); b.runsDay=0; } return b; }
function blitzCard(){
  var b=blitzDay(), left=Math.max(0,3-b.runsDay);
  return '<section class="card blitzc"><div class="revc-h">'+ic('bolt')+'<h2>Blitz</h2></div><p class="sub">'+BLITZ_N+' questions, '+BLITZ_SECS+' seconds. Right answers in a row multiply your points. Your best: <b>'+(b.best||0)+'</b>'+(b.bestCombo?' · best combo x'+b.bestCombo:'')+'.</p>'
    +'<button class="btn" id="blitzGo">'+ic('bolt')+'Start Blitz</button><p class="fine">'+(left?left+(left===1?' round':' rounds')+' left today that pay XP and Sparks. Right answers still count as review.':'Today\'s paid rounds are done. Play on for your best score and for review.')+'</p></section>';
}
function freezeNote(){
  if(!frozenToday()) return '';
  return '<section class="card frozc">'+ic('ice')+'<p><b>A streak freeze has your back.</b> You missed yesterday. Meet your daily goal today and your streak of '+S.streak.n+' carries on.</p></section>';
}
function blitzTeaser(){
  var b=blitzDay();
  return '<section class="card blitzt"><div class="revc-h">'+ic('bolt')+'<h2>Blitz</h2></div><p class="sub">Ten questions, ninety seconds, a combo to build.'+(b.best?' Your best: '+b.best+'.':'')+'</p><button class="btn ghost" id="blitzHome">Play a round</button></section>';
}
function blitzStart(){
  var pool=blitzPool();
  if(pool.length<5) return toast('Finish a few steps first. Blitz uses questions from your sessions.');
  BL={items:pool, i:0, score:0, ok:0, combo:0, best:0, t0:Date.now(), ans:null, missed:[], done:false};
  blitzOpts(); go({name:'blitz'});
  clearInterval(BL.timer); BL.timer=setInterval(blitzTick, 100);
}
function blitzOpts(){ var it=BL.items[BL.i]; BL.opts=it.fixed?it.options.slice():shuffle(it.options); BL.ans=null; }
function blitzLeft(){ return Math.max(0, BLITZ_SECS*1000-(Date.now()-BL.t0)); }
function blitzTick(){
  if(!BL || BL.done || view.name!=='blitz'){ if(BL) clearInterval(BL.timer); return; }
  var left=blitzLeft(), bar=$('#blBar'), sec=$('#blSec');
  if(bar) bar.style.width=(left/(BLITZ_SECS*10))+'%';
  if(sec) sec.textContent=Math.ceil(left/1000)+'s';
  if(left<=0) blitzEnd();
}
function blitzMult(){ return BL.combo>=6?3:BL.combo>=3?2:1; }
function blitzView(){
  if(!BL) return go({name:'review'});
  var head='<header class="phead"><button class="icon-btn" id="quit" aria-label="Leave Blitz">'+ic('close')+'</button><div class="pmid"><span class="plabel">Blitz</span>'
    +(BL.done?'':'<div class="meter" id="blTime" role="progressbar" aria-label="Time left" aria-valuemin="0" aria-valuemax="'+BLITZ_SECS+'" aria-valuenow="'+Math.ceil(blitzLeft()/1000)+'"><i id="blBar" style="width:'+(blitzLeft()/(BLITZ_SECS*10))+'%"></i></div>')+'</div>'
    +(BL.done?'<span class="combo ghost"></span>':'<span class="combo" title="Points">'+ic('bolt')+'<b id="blScore">'+BL.score+'</b></span>')+'</header>';
  var inner, foot;
  if(BL.done){
    var r=BL.res, miss=BL.missed.slice(0,3);
    inner='<div class="center done">'+confetti2(r.newBest)+'<span class="zhero">'+zed(zLv(), r.newBest?'cheer':'happy', 120, 'hop')+'</span><h1 class="bigt">'+(r.newBest?'New best':'Round over')+'</h1><p class="lede">'+BL.ok+' of '+BL.items.length+' right. Best combo x'+BL.best+'.</p>'
      +'<div class="facts"><div class="fact"><b>'+BL.score+'</b><span>Points</span></div><div class="fact"><b>+'+r.xp+'</b><span>XP</span></div><div class="fact"><b>+'+r.sp+'</b><span>Sparks</span></div></div>'
      +(miss.length?'<div class="blmiss"><h2 class="sh">To remember</h2><ul>'+miss.map(function(m){ return '<li><b>'+esc(m.stem)+'</b><span>'+esc(m.ans)+'</span></li>'; }).join('')+'</ul><p class="fine">These are on your review list.</p></div>':'')
      +(r.paid?'':'<p class="hint">Today\'s paid rounds are used up. This round still counted as review.</p>')+'</div>';
    foot='<button class="btn wide" id="again">Play again</button><button class="btn ghost wide" id="blBack">Back to Review</button>';
  } else {
    var it=BL.items[BL.i], mult=blitzMult();
    inner='<p class="kicker">Question '+(BL.i+1)+' of '+BL.items.length+(BL.combo>=2?' · combo x'+BL.combo+(mult>1?' · points x'+mult:''):'')+'</p><h1 class="stem">'+esc(it.stem)+'</h1><div class="opts" role="group" aria-label="Answers">'
      +BL.opts.map(function(o,i){
        var cl='opt'+(BL.ans!==null?(o.k===it.key?' right':(i===BL.ans?' wrong':' dim')):'');
        return '<button class="'+cl+'" data-b="'+i+'"'+(BL.ans!==null?' disabled':'')+'><span class="k">'+(i+1)+'</span><span>'+esc(o.t)+'</span></button>';
      }).join('')+'</div>';
    foot='<p class="mfoot" id="blNote" aria-live="polite">'+(BL.ans===null?'Tap an answer. Keys 1 to 4 also work.':(BL.opts[BL.ans].k===it.key?'Right.':'Not quite. The right one is marked.'))+'</p>';
  }
  APP.innerHTML='<div class="player blitz" data-lv="'+(zLv())+'">'+head+'<main class="pbody"><div class="pin">'+inner+'</div></main><footer class="pfoot" aria-live="polite"><div class="pfin">'+foot+'</div></footer></div>';
  $('#quit').onclick=function(){ clearInterval(BL.timer); BL.done=true; BL=null; go({name:'review'}); };
  if(BL.done){ $('#again').onclick=blitzStart; $('#blBack').onclick=function(){ BL=null; go({name:'review'}); }; return; }
  $$('[data-b]').forEach(function(b){ b.onclick=function(){ blitzAnswer(+b.getAttribute('data-b')); }; });
}
function confetti2(on){ return on?confetti():''; }
function blitzAnswer(k){
  if(!BL||BL.done||BL.ans!==null) return;
  var it=BL.items[BL.i]; BL.ans=k;
  var ok=BL.opts[k].k===it.key;
  if(ok){ BL.combo++; BL.best=Math.max(BL.best,BL.combo); BL.ok++; BL.score+=10*blitzMult(); if(S.missed.indexOf(it.id)>=0){ S.missed=S.missed.filter(function(m){ return m!==it.id; }); S.cleared=(S.cleared||0)+1; } }
  else { BL.combo=0; recordMiss(it.id); BL.missed.push({stem:it.stem, ans:it.options.filter(function(o){ return o.k===it.key; })[0].t}); }
  srsUpdate(it, ok, null, false);
  if(typeof sfx==='function') sfx(ok?'good':'bad');
  save(); blitzView();
  var delay=ok?380:1100;
  clearTimeout(BL.next); BL.next=setTimeout(function(){
    if(!BL||BL.done) return;
    if(BL.i+1>=BL.items.length||blitzLeft()<=0) return blitzEnd();
    BL.i++; blitzOpts(); blitzView();
  }, delay);
}
function blitzEnd(){
  if(!BL||BL.done) return;
  clearInterval(BL.timer); clearTimeout(BL.next); BL.done=true;
  var b=blitzDay(), paid=b.runsDay<3, newBest=BL.score>(b.best||0)&&BL.score>0;
  var xp=paid?Math.min(25,Math.floor(BL.score/20)):0, sp=paid?Math.min(5,Math.floor(BL.ok/3)):0;
  b.runs=(b.runs||0)+1; b.runsDay++; if(newBest) b.best=BL.score; b.bestCombo=Math.max(b.bestCombo||0,BL.best);
  if(xp) addXP(xp); S.sparks=(S.sparks||0)+sp;
  if(BL.ok>=6) markAct('practice');
  BL.res={xp:xp, sp:sp, paid:paid, newBest:newBest};
  checkBadges(); save();
  if(view.name==='blitz'){ blitzView(); showPending(); }
}
document.addEventListener('keydown',function(e){
  if(view.name!=='blitz'||!BL||BL.done) return;
  if(/^[1-4]$/.test(e.key)){ var k=+e.key-1; if(BL.opts[k]) blitzAnswer(k); }
});
