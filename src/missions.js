/* ================= FIELD MISSIONS: a short branching story. Make a call, see what it costs, replay to find the strong moves. ================= */
IC.mission='<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h6a3 3 0 000-6h-4a3 3 0 010-6h6"/>';
function missionNew(it){
  var m={i:0, stage:'ask', pick:-1, pts:0, picks:[], meters:{}, last:null, stars:0};
  it.meters.forEach(function(x){ m.meters[x[1]]=x[2]; });
  m.ord=it.steps.map(function(st){ return shuffle(st.choices.map(function(c,i){ return i; })); });
  return m;
}
function missionStars(it,m){ var p=m.pts/(2*it.steps.length); return p>=0.85?3:p>=0.6?2:1; }
var MRATE=[['Costly move','r0'],['Workable, with a cost','r1'],['Strong move','r2']];
function missionMeters(it,m){
  return '<div class="mmeters">'+it.meters.map(function(x){
    var v=m.meters[x[1]], d=(m.last&&m.last.d[x[1]])||0;
    return '<div class="mm"><span class="mm-l">'+esc(x[0])+'</span><div class="mm-bar" role="progressbar" aria-label="'+esc(x[0])+'" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+v+'"><i style="width:'+v+'%"></i></div><b>'+v+(d?'<em class="'+(d>0?'up':'dn')+'">'+(d>0?'+':'')+d+'</em>':'')+'</b></div>';
  }).join('')+'</div>';
}
function scrMission(c){
  var it=c.item, m=c.m, n=it.steps.length, kick=(it.boss?'Boss mission':'Field mission');
  if(m.stage==='end'){
    var stars=m.stars, end=it.ends[3-stars];
    var recap=m.picks.map(function(p,i){ var ch=it.steps[p.i].choices[p.ci]; return '<li class="r'+p.r+'"><span class="rd" aria-hidden="true"></span><span><b>'+(i+1)+'. '+esc(MRATE[p.r][0])+'</b><small>'+esc(ch.t)+'</small></span></li>'; }).join('');
    var body='<p class="kicker">'+kick+' · Outcome</p><h1 class="bigt">'+esc(it.title)+'</h1>'+starRow(stars,'big pop')
      +'<p class="lede">'+esc(end)+'</p>'+missionMeters(it,m)
      +'<ol class="mrecap" aria-label="Your calls">'+recap+'</ol>'
      +'<p class="callout"><b>Takeaway.</b> '+esc(it.tip)+'</p>'
      +(stars<3?'<p class="hint">Your points: '+m.pts+' of '+(2*n)+'. Three stars need '+Math.ceil(0.85*2*n)+'. Replay to try other calls.</p>':'<p class="hint">Every strong call was made. Nothing left to find here.</p>');
    return {body:body, foot:'<button class="btn wide" id="primary">Finish mission</button><button class="btn ghost wide" id="replay" type="button">'+(stars<3?'Try different calls':'Play it again')+'</button>'};
  }
  var st=it.steps[m.i], body='<p class="kicker">'+kick+' · Decision '+(m.i+1)+' of '+n+'</p>';
  if(m.i===0) body+='<h1 class="bigt">'+esc(it.title)+'</h1><p class="lede mbrief">'+esc(it.brief)+'</p>';
  body+=missionMeters(it,m)+'<div class="mscene"><p>'+esc(st.scene)+'</p></div><h2 class="stem mask">'+esc(st.ask)+'</h2><div class="opts" role="group" aria-label="Your options">'
    +m.ord[m.i].map(function(ci,k){
      var ch=st.choices[ci], cl='opt';
      if(m.stage==='result'){ cl+=(ci===m.pick?' pick m'+ch.r:' dim'); }
      return '<button class="'+cl+'" data-i="'+k+'"'+(m.stage==='result'?' disabled':'')+'><span class="k">'+(k+1)+'</span><span>'+esc(ch.t)+'</span></button>';
    }).join('')+'</div>';
  if(m.stage==='ask') return {body:body, foot:'<p class="mfoot">Pick one. You see what it costs straight away.</p>'};
  var ch=st.choices[m.pick], best=st.choices.filter(function(x){ return x.r===2; })[0], rate=MRATE[ch.r];
  body+='<div class="mres '+rate[1]+'" role="status"><h3>'+esc(rate[0])+'</h3><p>'+esc(ch.say)+'</p><p class="mwhy"><b>Why.</b> '+esc(ch.why)+'</p>'
    +(ch.r<2?'<p class="mbest"><b>The strong move was:</b> '+esc(best.t)+'</p>':'')+'</div>';
  return {body:body, foot:'<button class="btn wide" id="primary">'+(m.i+1<n?'Next decision':'See the outcome')+'</button>'};
}
function missionPick(c,k){
  var it=c.item, m=c.m; if(m.stage!=='ask') return;
  var st=it.steps[m.i], ci=m.ord[m.i][k], ch=st.choices[ci], d={};
  Object.keys(ch.fx).forEach(function(key){ var v=m.meters[key], nv=Math.max(0,Math.min(100,v+ch.fx[key])); d[key]=nv-v; m.meters[key]=nv; });
  m.pick=ci; m.stage='result'; m.pts+=ch.r; m.picks.push({i:m.i, ci:ci, r:ch.r}); m.last={d:d, r:ch.r};
  if(typeof sfx==='function') sfx(ch.r===2?'good':ch.r===0?'bad':'tick');
  L.animKey=L.phase+':'+c.id; render();
  var r=$('.mres'); if(r&&r.scrollIntoView) r.scrollIntoView({block:'nearest'});
}
function missionNext(c){
  var it=c.item, m=c.m;
  if(m.i+1<it.steps.length){ m.i++; m.stage='ask'; m.pick=-1; m.last=null; L.animKey=''; render(); window.scrollTo(0,0); return; }
  m.stage='end'; m.stars=missionStars(it,m); c.best=Math.max(c.best||0, m.stars); m.last=null; L.animKey=''; render(); window.scrollTo(0,0);
}
function missionFinish(c){
  var it=c.item, stars=Math.max(c.best||0, c.m.stars||1);
  L.mstars=stars; L.correct[c.id]=1; L.xp=(it.boss?24:14)+(it.boss?12:8)*stars;
  nextItem();
}
function bindMission(c){
  var m=c.m, p=$('#primary');
  if(m.stage==='ask'){ $$('.opt[data-i]').forEach(function(b){ b.onclick=function(){ missionPick(c, +b.getAttribute('data-i')); }; }); }
  else if(m.stage==='result'){ if(p) p.onclick=function(){ missionNext(c); }; }
  else if(m.stage==='end'){
    if(p) p.onclick=function(){ missionFinish(c); };
    var rp=$('#replay'); if(rp) rp.onclick=function(){ var best=c.best; c.m=missionNew(c.item); c.best=best; L.animKey=''; render(); window.scrollTo(0,0); };
  }
}
