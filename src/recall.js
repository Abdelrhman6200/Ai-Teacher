/* ================= RECALL THE RULE: the rule cards as a spaced retrieval deck =================
   Read the name, say the rule, flip the card, then rate yourself. The same boxes and intervals as the questions: right pushes a card out, a miss brings it back. */
var RC=null;
function cardMem(id){ var r=(S.cardSrs||{})[id]; return r?r.b:0; }
function cardDue(){ var t=today(); return ownedCards().filter(function(c){ var r=(S.cardSrs||{})[c.id]; return !r || r.due<=t; }); }
function memDots(id){
  var b=cardMem(id), h='<span class="rc-mem" role="img" aria-label="Memory strength '+b+' of 5">';
  for(var i=1;i<=5;i++) h+='<i class="'+(i<=b?'on':'')+'"></i>';
  return h+'</span>';
}
function recallCardBox(){
  var n=cardDue().length;
  return '<section class="card recallc"><div class="revc-h">'+ic('card')+'<h2>Recall the rules</h2></div><p class="sub">'+(n?n+(n===1?' rule card is':' rule cards are')+' ready to recall. Read the name, say the rule out loud or in your head, then flip to check.':'No rule cards are due. New ones appear when you earn them, and each one returns on a schedule.')+'</p>'+(n?'<button class="btn" id="recallGo">'+ic('card')+'Start recall</button>':'')+'</section>';
}
function recallStart(){
  var due=shuffle(cardDue()).slice(0,8);
  if(!due.length) return toast('No rule cards are due.');
  RC={items:due, i:0, flipped:false, res:[], xp:0, done:false};
  go({name:'recall'});
}
function recallView(){
  if(!RC) return go({name:'review'});
  var n=RC.items.length, head='<header class="phead"><button class="icon-btn" id="quit" aria-label="Leave the recall round">'+ic('close')+'</button><div class="pmid"><span class="plabel">Recall the rules</span><div class="meter" role="progressbar" aria-label="Cards done" aria-valuemin="0" aria-valuemax="'+n+'" aria-valuenow="'+RC.i+'"><i style="width:'+Math.round(RC.i/n*100)+'%"></i></div></div><span class="combo ghost"></span></header>';
  var inner, foot;
  if(RC.done){
    var got=RC.res.filter(function(r){ return r===2; }).length, near=RC.res.filter(function(r){ return r===1; }).length, miss=RC.res.filter(function(r){ return r===0; }).length;
    inner='<div class="center done"><span class="zhero">'+zed(zLv(), got>=n*0.7?'cheer':'happy', 120, 'hop')+'</span><h1 class="bigt">'+(got===n?'Every rule recalled':'Round done')+'</h1><p class="lede">'+got+' recalled, '+near+' nearly, '+miss+' to see again soon.</p>'
      +'<div class="facts"><div class="fact"><b>+'+RC.xp+'</b><span>XP</span></div><div class="fact"><b>+'+RC.sp+'</b><span>Sparks</span></div></div><p class="hint">Cards you recalled wait longer before they come back. The ones you missed return first.</p></div>';
    foot='<button class="btn wide" id="recallBack">Back to Review</button>';
  } else {
    var c=RC.items[RC.i], s=c.k==='epic'?null:SESSIONS[c.n-1];
    inner='<p class="kicker">Card '+(RC.i+1)+' of '+n+'</p><h1 class="stem">Say the rule</h1>'
      +'<div class="flip'+(RC.flipped?' on':'')+'" id="flip"><div class="flip-in">'
      +'<div class="face front" aria-hidden="'+RC.flipped+'"><div class="rcard r-'+c.r+'" data-lv="'+(s?s.level:c.n)+'"><div class="rc-top"><span class="rc-ic">'+ic(c.i)+'</span><span class="rc-r">'+RARITY[c.r]+'</span></div><b class="rc-t">'+esc(c.t)+'</b><small>'+(s?'Session '+s.n+' · '+esc(s.title):'Level '+c.n+' · '+esc(LEVELS[c.n-1].name))+'</small><p class="rc-ask">What is the rule? Say it before you flip.</p></div></div>'
      +'<div class="face back" aria-hidden="'+!RC.flipped+'">'+cardHTML(c,true)+'</div></div></div>';
    foot=RC.flipped
      ?'<div class="rates" role="group" aria-label="How did you do?"><button class="btn bad" data-rate="0">Missed</button><button class="btn ghost" data-rate="1">Nearly</button><button class="btn good" data-rate="2">Got it</button></div>'
      :'<button class="btn wide" id="flipBtn">'+ic('refresh')+'Flip the card</button>';
  }
  APP.innerHTML='<div class="player recall" data-lv="'+zLv()+'">'+head+'<main class="pbody"><div class="pin">'+inner+'</div></main><footer class="pfoot" aria-live="polite"><div class="pfin">'+foot+'</div></footer></div>';
  $('#quit').onclick=function(){ RC=null; go({name:'review'}); };
  var fb=$('#flipBtn'); if(fb) fb.onclick=function(){ RC.flipped=true; var f=$('#flip'); if(f) f.classList.add('on'); recallFootRates(); if(typeof sfx==='function') sfx('tick'); };
  $$('[data-rate]').forEach(function(b){ b.onclick=function(){ recallRate(+b.getAttribute('data-rate')); }; });
  var rb=$('#recallBack'); if(rb) rb.onclick=function(){ RC=null; go({name:'review'}); };
}
/* the flip itself is a transition, so the footer changes in place instead of re-drawing the card */
function recallFootRates(){
  var f=$('.pfin'); if(!f) return;
  f.innerHTML='<div class="rates" role="group" aria-label="How did you do?"><button class="btn bad" data-rate="0">Missed</button><button class="btn ghost" data-rate="1">Nearly</button><button class="btn good" data-rate="2">Got it</button></div>';
  $$('[data-rate]').forEach(function(b){ b.onclick=function(){ recallRate(+b.getAttribute('data-rate')); }; });
  $$('.face',$('#flip')).forEach(function(x,i){ x.setAttribute('aria-hidden', i===0?'true':'false'); });
}
function recallRate(r){
  var c=RC.items[RC.i], rec=(S.cardSrs=S.cardSrs||{})[c.id]||(S.cardSrs[c.id]={b:0,due:today(),seen:0,ok:0});
  rec.seen++;
  if(r===2){ rec.ok++; rec.b=Math.min(5,rec.b+1); RC.xp+=3; }
  else if(r===1){ RC.xp+=1; }
  else rec.b=0;
  rec.due=addDays(INT[rec.b]);
  RC.res.push(r); RC.i++; RC.flipped=false;
  if(r===2 && typeof sfx==='function') sfx('good');
  if(RC.i>=RC.items.length){
    RC.done=true; RC.sp=RC.res.filter(function(x){ return x===2; }).length>=5?2:RC.res.some(function(x){ return x===2; })?1:0;
    if(RC.xp) addXP(RC.xp); S.sparks=(S.sparks||0)+RC.sp; markAct('practice'); checkBadges(); save();
    if(typeof sfx==='function') sfx('win');
  } else save();
  recallView(); showPending();
}
