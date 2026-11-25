/* ================= GAME LAYER: player level, Sparks, shop, streak freeze, rule cards, celebrations =================
   Everything here is local: the score, the currency and the collection live in this browser with the rest of the progress. */
IC.spark='<path d="M12 3l2.200 6.300L21 12l-6.800 2.700L12 21l-2.200-6.300L3 12l6.800-2.700z"/>';
IC.card='<rect x="5" y="3.500" width="14" height="17" rx="2.500"/><path d="M8.500 8.500h7M8.500 12h7M8.500 15.500h4"/>';
IC.shop='<path d="M4 8h16l-1.500 11a1.500 1.500 0 01-1.500 1.300H7A1.500 1.500 0 015.500 19L4 8z"/><path d="M8.500 8V6.500a3.500 3.500 0 017 0V8"/>';
IC.ice='<path d="M12 3v18M4.500 7.500l15 9M19.500 7.500l-15 9"/><path d="M9.500 4.500L12 6.500l2.500-2M9.500 19.500l2.500-2 2.500 2"/>';

/* ---- player level: XP carries you up a ladder of titles ---- */
var PL_TITLES=[[1,'Newcomer'],[2,'Tinkerer'],[3,'Apprentice'],[5,'Prompter'],[7,'Verifier'],[9,'Builder'],[11,'Integrator'],[13,'Operator'],[15,'Engineer'],[18,'Architect'],[21,'Expert'],[25,'Master']];
function plNeed(n){ return 15*(n-1)*(n+2); }               // total XP at which level n starts: 0, 60, 150, 270, 420 ...
function plOf(xp){ var n=1; while(plNeed(n+1)<=xp) n++; return n; }
function plTitle(n){ var t=PL_TITLES[0][1]; PL_TITLES.forEach(function(p){ if(n>=p[0]) t=p[1]; }); return t; }
function plInfo(){ var n=plOf(S.xp), a=plNeed(n), b=plNeed(n+1); return {n:n, title:plTitle(n), into:S.xp-a, span:b-a, pct:Math.round((S.xp-a)/(b-a)*100)}; }

/* ---- celebrations wait in a queue and show when the learner is not in the middle of a question ---- */
var PEND=[];
function levelUp(l){
  S.sparks=(S.sparks||0)+10; var fr=(l%5===0 && (S.freezes||0)<2); if(fr) S.freezes=(S.freezes||0)+1;
  PEND.push({t:'level', n:l, sp:10, fr:fr});
}
function showPending(){
  if(!PEND.length || $('.modal')) return;
  if(view.name==='lesson' && L && L.phase==='q') return;
  celebrate(PEND.shift());
}

/* ---- rule cards ---- */
var CARDS=DATA.cards||[], CBY={};
CARDS.forEach(function(c){ CBY[c.id]=c; });
var RARITY={common:'Common', rare:'Rare', epic:'Epic'};
function coreCard(n){ return CARDS.filter(function(c){ return c.k==='core' && c.n===n; })[0]; }
function epicCard(n){ return CARDS.filter(function(c){ return c.k==='epic' && c.n===n; })[0]; }
function ownedCards(){ return CARDS.filter(function(c){ return S.cards[c.id]; }); }
function grantCard(id){ if(S.cards[id]) return false; S.cards[id]=today(); return true; }
function cardWhere(c){
  if(c.k==='epic') return 'Hand in the Level '+c.n+' gate';
  var s=SESSIONS[c.n-1];
  return c.k==='core' ? 'Finish session '+c.n : 'Found in chests, session '+c.n;
}
function cardHTML(c, own){
  if(!own) return '<div class="rcard locked r-'+c.r+'" role="group" aria-label="Locked card. '+esc(cardWhere(c))+'"><div class="rc-top"><span class="rc-ic">'+ic('lock')+'</span><span class="rc-r">'+RARITY[c.r]+'</span></div><b class="rc-t">Not found yet</b><p>'+esc(cardWhere(c))+'.</p></div>';
  var s=c.k==='epic'?null:SESSIONS[c.n-1], lvn=c.k==='epic'?c.n:s.level;
  return '<div class="rcard r-'+c.r+'" data-lv="'+lvn+'" role="group" aria-label="'+RARITY[c.r]+' rule card: '+esc(c.t)+'"><div class="rc-top"><span class="rc-ic">'+ic(c.i)+'</span><span class="rc-r">'+RARITY[c.r]+'</span></div><b class="rc-t">'+esc(c.t)+'</b><p>'+esc(c.w)+'</p><small>'+(s?'Session '+s.n+' · '+esc(s.title):'Level '+c.n+' · '+esc(LEVELS[c.n-1].name))+'</small></div>';
}
/* chests and the shop draw from the sessions you can open and the next two, so a card is never a spoiler from far ahead */
function reachN(){ var r=1; SESSIONS.forEach(function(s){ if(sessOpen(s)) r=Math.max(r,s.n); }); return r; }
function dropPool(){ var r=reachN()+2; return CARDS.filter(function(c){ return c.k==='drop' && !S.cards[c.id] && c.n<=r; }); }
function dropCard(){
  var pool=dropPool();
  if(!pool.length) return null;
  var bag=[]; pool.forEach(function(c){ var w=c.r==='rare'?1:3; for(var i=0;i<w;i++) bag.push(c); });
  var c=bag[Math.floor(Math.random()*bag.length)]; grantCard(c.id); return c;
}
function openChest(xp, sparks, label){
  var mark=PEND.length;   // the chest shows before any level-up its XP caused
  addXP(xp); S.sparks=(S.sparks||0)+sparks;
  var card=dropCard(), extra=0; if(!card){ extra=10; S.sparks+=extra; }
  var nb=checkBadges(); save();
  PEND.splice(mark, 0, {t:'chest', xp:xp, sp:sparks+extra, card:card, badge:nb[0]||null, label:label, none:!card});
}

/* rewards that follow progress: a finished session pays Sparks and its core card; a handed-in gate pays its epic card */
function settleRewards(){
  SESSIONS.forEach(function(s){
    if(sessComplete(s) && !S.sdone[s.id]){
      S.sdone[s.id]=today(); S.sparks=(S.sparks||0)+10;
      var c=coreCard(s.n), got=c?grantCard(c.id):false;
      PEND.push({t:'session', n:s.n, title:s.title, level:s.level, card:got?c:null, sp:10});
    }
  });
  LEVELS.forEach(function(lv){
    var c=epicCard(lv.n);
    if(levelDone(lv) && c && !S.cards[c.id]){ grantCard(c.id); S.sparks=(S.sparks||0)+25; PEND.push({t:'epic', n:lv.n, card:c, sp:25}); }
  });
  save();
}
/* progress made before this layer existed is credited quietly, so nobody gets forty pop-ups at once */
function gameMigrate(){
  var changed=false;
  SESSIONS.forEach(function(s){ if(sessComplete(s) && !S.sdone[s.id]){ S.sdone[s.id]=today(); var c=coreCard(s.n); if(c) grantCard(c.id); changed=true; } });
  LEVELS.forEach(function(lv){ var c=epicCard(lv.n); if(levelDone(lv) && c && !S.cards[c.id]){ grantCard(c.id); changed=true; } });
  if(!S.plSeen) S.plSeen=plOf(S.xp);
  if(changed) save();
}
gameMigrate();

function celebrate(p){
  var m=document.createElement('div'); m.className='modal cele'; m.setAttribute('role','dialog'); m.setAttribute('aria-modal','true');
  var title, hero, body='', lvn=currentLevel().n;
  var chips=[];
  if(p.sp) chips.push('<span class="chip-r sp">'+ic('spark')+'+'+p.sp+' Sparks</span>');
  if(p.t==='level'){
    title='Level '+p.n+': '+plTitle(p.n); hero=zed(lvn,'cheer',120,'hop');
    if(p.fr) chips.push('<span class="chip-r fz">'+ic('ice')+'+1 streak freeze</span>');
    body='<p class="lede">You reached player level '+p.n+'. XP keeps counting; the title is yours.</p>';
  } else if(p.t==='session'){
    title='Session '+p.n+' complete'; hero=zed(p.level,'cheer',120,'hop');
    body='<p class="lede">'+esc(p.title)+'.</p>'+(p.card?'<p class="kick">New rule card</p>'+cardHTML(p.card,true):'');
  } else if(p.t==='epic'){
    title='Epic card unlocked'; hero=zed(p.n,'cheer',120,'hop');
    body='<p class="kick">Level '+p.n+' gate handed in</p>'+cardHTML(p.card,true);
  } else if(p.t==='chest'){
    title='Chest opened'; hero=chestAnim();
    if(p.xp) chips.unshift('<span class="chip-r xp">'+ic('bolt')+'+'+p.xp+' XP</span>');
    body=(p.card?'<p class="kick">You found a rule card</p>'+cardHTML(p.card,true):'<p class="lede">Every card you can find is already in your collection. Here are bonus Sparks instead.</p>')
      +(p.badge?'<p class="kick">Badge: '+esc(p.badge.name)+'</p>':'');
  } else if(p.t==='freeze'){
    title='Streak saved'; hero='<span class="chest-big ice">'+ic('ice')+'</span>';
    body='<p class="lede">You missed a day, so a streak freeze covered it. Your streak carries on.</p>';
  } else if(p.t==='mystery'){
    title='Mystery chest'; hero=chestAnim();
    body='<p class="kick">Your rule card</p>'+cardHTML(p.card,true);
  }
  m.innerHTML='<div class="card celec">'+(p.t==='epic'||p.t==='level'?confetti():'')+'<div class="cele-hero">'+hero+'</div><h2>'+esc(title)+'</h2>'+(chips.length?'<div class="chips-r">'+chips.join('')+'</div>':'')+body
    +'<button type="button" class="btn wide" id="celeDone">'+(PEND.length?'Next reward':'Continue')+'</button></div>';
  m.setAttribute('aria-label', title);
  if(p.t==='chest'||p.t==='mystery') m.classList.add('chesty');
  document.body.appendChild(m);
  if(p.t==='chest'||p.t==='mystery') setTimeout(function(){ m.classList.add('opened'); }, motionOff()?0:140);
  var release=trapFocus(m,function(){ close(); });
  function close(){ release(); if(m.parentNode) m.parentNode.removeChild(m); showPending(); }
  m.querySelector('#celeDone').onclick=close; m.querySelector('#celeDone').focus();
  if(typeof sfx==='function') sfx(p.t==='chest'||p.t==='mystery'?'chest':'win');
}

/* ---- the HUD strip under the tabs ---- */
function hudHTML(){
  var p=plInfo(), w=hudWidths(p);
  return '<div class="hud"><button class="hud-lv" data-hud="you" aria-label="Player level '+p.n+', '+esc(p.title)+'. Open your profile">Lv <b>'+p.n+'</b><span>'+esc(p.title)+'</span></button>'
    +'<div class="hud-bar" role="progressbar" aria-label="XP towards level '+(p.n+1)+'" aria-valuemin="0" aria-valuemax="'+p.span+'" aria-valuenow="'+p.into+'"><i data-from="'+w.from+'" data-to="'+w.to+'" style="width:'+w.from+'%"></i></div>'
    +'<span class="hud-xp">'+p.into+'/'+p.span+'</span>'
    +'<button class="hud-sp" data-hud="shop" aria-label="'+(S.sparks||0)+' Sparks. Open the shop">'+ic('spark')+'<b>'+(S.sparks||0)+'</b></button></div>';
}

/* ---- the shop ---- */
var SHOP=[
  {id:'freeze', icon:'ice', name:'Streak freeze', cost:40, max:2, have:function(){ return S.freezes||0; }, desc:'Covers one missed day, so your streak carries on. You can hold two.', buy:function(){ S.freezes=(S.freezes||0)+1; }},
  {id:'boost', icon:'bolt', name:'XP booster', cost:25, max:3, have:function(){ return S.boost||0; }, desc:'The next new step you finish pays double XP. You can hold three.', buy:function(){ S.boost=(S.boost||0)+1; }},
  {id:'mystery', icon:'chest', name:'Mystery chest', cost:60, max:99, have:function(){ return ownedCards().length; }, desc:'A rule card you do not have yet.', buy:function(){ var c=dropCard(); if(c) PEND.push({t:'mystery', card:c}); return !!c; }, can:function(){ return dropPool().length>0; }}
];
function shopView(){
  var h='<div class="narrow"><h1 class="ph">Shop</h1><section class="card shopc"><div class="shop-bal">'+ic('spark')+'<b>'+(S.sparks||0)+'</b><span>Sparks</span></div>'
    +'<p class="sub">You earn Sparks from chests, finished sessions, level-ups, badges, Blitz rounds and missions. Spend them here. They never affect your XP or stars.</p></section>'
    +'<div class="shop-l">'+SHOP.map(function(it){
      var have=it.have(), full=(it.id!=='mystery' && have>=it.max), can=it.can?it.can():true, afford=(S.sparks||0)>=it.cost;
      var why=full?'You are holding the most you can':!can?(CARDS.some(function(c){ return c.k==='drop' && !S.cards[c.id]; })?'Finish more sessions to find more cards':'Every drop card is in your collection'):!afford?'Needs '+(it.cost-(S.sparks||0))+' more Sparks':'';
      return '<section class="card shopi"><span class="shopi-ic">'+ic(it.icon)+'</span><div><h2>'+it.name+'</h2><p class="sub">'+it.desc+'</p>'+(it.id!=='mystery'?'<small class="own">You hold '+have+'</small>':'<small class="own">'+ownedCards().length+' of '+CARDS.length+' cards found</small>')+(why?'<small class="why">'+why+'</small>':'')+'</div>'
        +'<button class="btn'+(why?' ghost':'')+'" data-buy="'+it.id+'"'+(why?' disabled':'')+'>'+ic('spark')+it.cost+'</button></section>';
    }).join('')+'</div>'
    +'<div class="duo"><button class="btn ghost" data-go-album="1">'+ic('card')+'Open collection</button><button class="btn ghost" data-tab-go="you">Back to You</button></div></div>';
  setPage(h,'you');
  $$('[data-buy]').forEach(function(b){ b.onclick=function(){
    var it=SHOP.filter(function(x){ return x.id===b.getAttribute('data-buy'); })[0];
    if((S.sparks||0)<it.cost) return;
    if(it.id!=='mystery' && it.have()>=it.max) return;
    var ok=it.buy(); if(ok===false) return;
    S.sparks-=it.cost; save();
    if(it.id!=='mystery') toast(it.name+' added'); shopView(); showPending();
  }; });
  $$('[data-tab-go]').forEach(function(b){ b.onclick=function(){ go({name:b.getAttribute('data-tab-go')}); }; });
  var al=$('[data-go-album]'); if(al) al.onclick=function(){ go({name:'album'}); };
}

/* ---- the collection ---- */
function albumView(){
  var own=ownedCards().length, h='<div class="narrow"><h1 class="ph">Rule cards</h1><section class="card"><div class="revc-h">'+ic('card')+'<h2>'+own+' of '+CARDS.length+' found</h2></div>'
    +'<div class="meter" role="progressbar" aria-label="Cards found" aria-valuemin="0" aria-valuemax="'+CARDS.length+'" aria-valuenow="'+own+'"><i style="width:'+Math.round(own/CARDS.length*100)+'%"></i></div>'
    +(cardDue().length?'<button class="btn" id="albumRecall">'+ic('card')+'Recall '+cardDue().length+(cardDue().length===1?' card':' cards')+'</button>':'')
    +'<p class="sub">Each card is one rule from the course. A finished session gives its core card. Chests and the shop give drop cards. A handed-in gate gives an epic card. Read them again before you work.</p></section>';
  LEVELS.forEach(function(lv){
    var cs=CARDS.filter(function(c){ return c.k==='epic' ? c.n===lv.n : SESSIONS[c.n-1].level===lv.n; });
    cs.sort(function(a,b){ var ka=a.k==='epic'?2:0, kb=b.k==='epic'?2:0; return (ka-kb)||(a.n-b.n)||(a.k==='core'?-1:1); });
    var have=cs.filter(function(c){ return S.cards[c.id]; }), lack=cs.filter(function(c){ return !S.cards[c.id]; });
    h+='<h2 class="sh">Level '+lv.n+': '+esc(lv.name)+' <span class="cnt">'+have.length+' of '+cs.length+'</span></h2>'
      +(have.length?'<div class="cardgrid" data-lv="'+lv.n+'">'+have.map(function(c){ return cardHTML(c,true).replace(/<\/small><\/div>$/, '</small>'+memDots(c.id)+'</div>'); }).join('')+'</div>':'<p class="sub">No cards from this level yet.</p>')
      +(lack.length?'<details class="lackl"><summary>Still to find: '+lack.length+'</summary><ul>'+lack.map(function(c){ return '<li><span class="lk-r r-'+c.r+'">'+RARITY[c.r]+'</span>'+esc(cardWhere(c))+'</li>'; }).join('')+'</ul></details>':'');
  });
  h+='<div class="duo"><button class="btn ghost" data-go-shop="1">'+ic('shop')+'Shop</button><button class="btn ghost" data-tab-go="you">Back to You</button></div></div>';
  setPage(h,'you');
  $$('[data-tab-go]').forEach(function(b){ b.onclick=function(){ go({name:b.getAttribute('data-tab-go')}); }; });
  var sg=$('[data-go-shop]'); if(sg) sg.onclick=function(){ go({name:'shop'}); };
  var ar=$('#albumRecall'); if(ar) ar.onclick=recallStart;
}

/* the You page gets a collection and a shop card */
function gameYouCard(){
  var p=plInfo(), own=ownedCards().length, fz=S.freezes||0, bo=S.boost||0;
  return '<section class="card gamec"><div class="revc-h">'+ic('spark')+'<h2>Player level '+p.n+': '+esc(p.title)+'</h2></div>'
    +'<div class="hud-bar big" role="progressbar" aria-label="XP towards level '+(p.n+1)+'" aria-valuemin="0" aria-valuemax="'+p.span+'" aria-valuenow="'+p.into+'"><i style="width:'+p.pct+'%"></i></div>'
    +'<p class="sub">'+p.into+' of '+p.span+' XP to level '+(p.n+1)+'. Next title: '+(function(){ var nx=PL_TITLES.filter(function(t){ return t[0]>p.n; })[0]; return nx?esc(nx[1])+' at level '+nx[0]:'none, you hold the top title'; })()+'.</p>'
    +'<div class="gstats"><div><b>'+(S.sparks||0)+'</b><span>Sparks</span></div><div><b>'+fz+'</b><span>Streak freezes</span></div><div><b>'+bo+'</b><span>XP boosters</span></div><div><b>'+own+'/'+CARDS.length+'</b><span>Rule cards</span></div></div>'
    +'<div class="duo"><button class="btn" data-go-album="1">'+ic('card')+'Rule cards</button><button class="btn ghost" data-go-shop="1">'+ic('shop')+'Shop</button></div></section>';
}
function bindGameYou(){
  var a=$('.gamec [data-go-album]'); if(a) a.onclick=function(){ go({name:'album'}); };
  var s=$('.gamec [data-go-shop]'); if(s) s.onclick=function(){ go({name:'shop'}); };
  $$('[data-train]').forEach(function(b){ b.onclick=function(){ go({name:'session', sid:b.getAttribute('data-train')}); }; });
}

/* ---- the skill profile: eight skills, each built from the sessions that teach it ---- */
var SKILLS=[['Model sense',[1,2,3]],['Prompting',[4,18]],['Verifying',[5,19]],['Creating',[6]],['Context',[7,17]],['Connecting',[8,9,10,21]],['Building',[11,12,13,14,16,20]],['Safe and lean',[15,22,23,24]]];
function sessScore(s){
  var ns=sessNodes(s.id), done=ns.filter(function(n){ return isDone(n.id); }).length/ns.length;
  var mast=(S.mast[s.id]&&S.mast[s.id].passed)?1:0, mis=NBY[s.id+'-MS'], stars=mis?starsOf(mis.id)/3:0;
  return 100*(0.6*done+0.25*mast+0.15*stars);
}
function skillScores(){
  return SKILLS.map(function(k){
    var sc=k[1].map(function(n){ return sessScore(SESSIONS[n-1]); }), avg=sc.reduce(function(a,b){ return a+b; },0)/sc.length;
    var next=k[1].map(function(n){ return SESSIONS[n-1]; }).filter(function(s){ return !sessComplete(s) && sessOpen(s); })[0];
    return {name:k[0], sessions:k[1], score:Math.round(avg), next:next, all:k[1].every(function(n){ return sessComplete(SESSIONS[n-1]); })};
  });
}
function skillTitle(v){ return v<=0?'Not started':v<30?'Novice':v<60?'Practising':v<85?'Skilled':'Expert'; }
function radarSVG(sc){
  var cx=170, cy=150, R=96, n=sc.length;
  function P(i,r){ var a=-Math.PI/2+i*2*Math.PI/n; return [cx+r*Math.cos(a), cy+r*Math.sin(a)]; }
  function pts(f){ return sc.map(function(s,i){ var p=P(i,f(s)); return p[0].toFixed(1)+','+p[1].toFixed(1); }).join(' '); }
  var grid=[25,50,75,100].map(function(g){ return '<polygon class="rg" points="'+pts(function(){ return R*g/100; })+'"/>'; }).join('');
  var axes=sc.map(function(s,i){ var p=P(i,R); return '<line class="ra" x1="'+cx+'" y1="'+cy+'" x2="'+p[0].toFixed(1)+'" y2="'+p[1].toFixed(1)+'"/>'; }).join('');
  var shape='<polygon class="rs" points="'+pts(function(s){ return R*Math.max(0.04,s.score/100); })+'"/>';
  var dots=sc.map(function(s,i){ var p=P(i,R*Math.max(0.04,s.score/100)); return '<circle class="rdot" cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="3.5"/>'; }).join('');
  var labs=sc.map(function(s,i){ var p=P(i,R+16), x=p[0], anchor=x<cx-8?'end':x>cx+8?'start':'middle'; return '<text class="rl" x="'+x.toFixed(1)+'" y="'+(p[1]+4).toFixed(1)+'" text-anchor="'+anchor+'">'+esc(s.name)+'</text>'; }).join('');
  return '<svg class="radar" viewBox="0 0 340 300" role="img" aria-label="Skill profile. '+sc.map(function(s){ return esc(s.name)+' '+s.score+' percent'; }).join(', ')+'">'+grid+axes+shape+dots+labs+'</svg>';
}
function skillsCard(){
  var sc=skillScores(), top=sc.slice().sort(function(a,b){ return b.score-a.score; })[0], low=sc.filter(function(s){ return s.next; }).sort(function(a,b){ return a.score-b.score; })[0];
  return '<section class="card skillc"><div class="revc-h">'+ic('target')+'<h2>Skill profile</h2></div>'+radarSVG(sc)
    +'<p class="sub">Each skill grows with the steps, mastery checks and missions of the sessions that teach it.'+(top&&top.score>0?' Strongest: '+esc(top.name)+'.':'')+(low?' Next to grow: '+esc(low.name)+'.':'')+'</p>'
    +'<ul class="skl">'+sc.map(function(s){ return '<li><span class="sk-n"><b>'+esc(s.name)+'</b><small>'+skillTitle(s.score)+' · sessions '+s.sessions.join(', ')+'</small></span><span class="sk-b" role="progressbar" aria-label="'+esc(s.name)+'" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+s.score+'"><i style="width:'+s.score+'%"></i></span><b class="sk-v">'+s.score+'</b>'+(s.next?'<button class="btn ghost small" data-train="'+s.next.id+'" aria-label="Train '+esc(s.name)+': open session '+s.next.n+'">Train</button>':'<span class="sk-done">'+(s.all?'Complete':'Locked')+'</span>')+'</li>'; }).join('')+'</ul></section>';
}
