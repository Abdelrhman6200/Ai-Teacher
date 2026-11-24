(function(){
'use strict';
var DATA = JSON.parse(document.getElementById('course-data').textContent);
var APP = document.getElementById('app');
var KEY = 'z100-practice-v4', OLDKEY = 'z100-practice-v3';

/* ================= storage (per browser; the app works without it) ================= */
var canSave = (function(){ try{ localStorage.setItem('__t','1'); localStorage.removeItem('__t'); return true; }catch(e){ return false; } })();
function blank(){ return {xp:0, xpByDay:{}, goal:30, streak:{n:0,last:'',best:0}, goalDays:[], done:{}, missed:[], cleared:0, logs:{}, cases:{}, exits:{}, badges:{}, sheets:[], preview:false, profile:{name:'', role:'', exp:-1, task:'', done:false}, read:{}, act:{}, chest:{}, zedAt:0, zedNode:'', startAt:1, placed:null, today:{}, debrief:{}, srs:{}, mast:{}, obj:{}, pre:{}, post:{}, cp:{}, expl:{}, muddy:{}, conf:{sure:[0,0], think:[0,0], guess:[0,0]}, hints:0, recalled:0, sparks:0, freezes:0, boost:0, cards:{}, sdone:{}, plSeen:0}; }
function load(){ try{ var r = canSave && (localStorage.getItem(KEY) || localStorage.getItem(OLDKEY)); return r ? Object.assign(blank(), JSON.parse(r)) : blank(); }catch(e){ return blank(); } }
var S = load();
function save(){ if(!canSave) return; try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){} }
/* theme: follow the device unless the learner picks one */
function applyTheme(){ var t=(S.theme==='light'||S.theme==='dark')?S.theme:''; if(t) document.documentElement.setAttribute('data-theme',t); else document.documentElement.removeAttribute('data-theme'); }
applyTheme();

/* ================= helpers ================= */
function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
function inl(s){ return esc(s).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/`(.+?)`/g,'<code>$1</code>').replace(/\[([^\]]+)\]\((?:https?:|\/|#)[^)\s]*\)/g,'$1'); }
function ymd(d){ return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function today(){ return ymd(new Date(Date.now())); }
function dayAgo(k){ return ymd(new Date(Date.now()-k*864e5)); }
function shuffle(a){ a = a.slice(); for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=a[i]; a[i]=a[j]; a[j]=t; } return a; }
function norm(s){ return String(s).trim().toLowerCase().replace(/[.\s]+$/,''); }
function num(s){ return parseFloat(String(s).replace(/[$,\s]/g,'')); }
function words(s){ return (String(s||'').trim().match(/\S+/g)||[]).length; }
function toast(t){ var el=document.getElementById('toast'); el.innerHTML='<span>'+esc(t)+'</span>'; clearTimeout(toast.t); toast.t=setTimeout(function(){ el.innerHTML=''; },2600); }
function copyText(text, host){
  function fallback(){
    if(!host) return toast('Copy was blocked. Select the text and copy it.');
    host.innerHTML='<textarea class="copybox" readonly aria-label="Text to copy"></textarea>';
    var ta=host.firstChild; ta.value=text; ta.focus(); ta.select();
  }
  try{ navigator.clipboard.writeText(text).then(function(){ toast('Copied'); }, fallback); }catch(e){ fallback(); }
}
function $(s,r){ return (r||document).querySelector(s); }
function $$(s,r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); }

var IC = {
  learn:'<path d="M4 5.5C6.5 4.5 9.5 4.5 12 6c2.5-1.5 5.5-1.5 8-.5V18c-2.5-1-5.5-1-8 .5-2.5-1.5-5.5-1.5-8-.5z"/><path d="M12 6v12.5"/>',
  demo:'<circle cx="12" cy="12" r="8.5"/><path d="M10 8.5l5.500 3.500-5.500 3.500z"/>',
  practice:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.600"/>',
  recall:'<path d="M5 8h12l-3-3.200M19 16H7l3 3.200"/>',
  task:'<rect x="6" y="5" width="12" height="15" rx="2"/><path d="M9.500 5V4h5v1M9 10h6M9 14h6"/>',
  case:'<rect x="4" y="8" width="16" height="11" rx="2"/><path d="M9 8V6h6v2M4 13h16"/>',
  question:'<path d="M4.500 5h15v10.500H11.500L7 19.500v-4H4.500z"/><path d="M10 9.200c0-1.100.9-1.800 2-1.800s2 .7 2 1.700c0 1.300-2 1.400-2 2.700"/><path d="M12 13.400v.1"/>',
  gate:'<path d="M12 3.200l7 2.600v5.600c0 4.200-2.900 7.300-7 9-4.100-1.700-7-4.800-7-9V5.800z"/><path d="M9 12l2.200 2.200L15.500 10"/>',
  check:'<path d="M5 12.500l4.500 4.500L19 7.500"/>',
  lock:'<rect x="6" y="11" width="12" height="9" rx="2"/><path d="M8.500 11V8.500a3.500 3.500 0 017 0V11"/>',
  close:'<path d="M6 6l12 12M18 6L6 18"/>',
  flame:'<path class="f" d="M12 2.500c.6 3.200-1.600 4.700-3.100 6.700C7.500 11 7 12.600 7 14a5 5 0 0010 0c0-1.500-.5-2.700-1.600-3.800.2 1.700-.5 2.700-1.600 3.100.9-3.300-.2-8.200-2-10.800z"/>',
  bolt:'<path class="f" d="M13.500 2L5 13.500h6L10 22l9-12h-6z"/>',
  star:'<path class="f" d="M12 3.500l2.600 5.400 5.900.8-4.300 4.100 1.100 5.900L12 16.900 6.700 19.700l1.100-5.900L3.500 9.700l5.900-.8z"/>',
  medal:'<circle cx="12" cy="9" r="5.500"/><path d="M8.500 13.500L7 21l5-2.800L17 21l-1.500-7.500"/>',
  flag:'<path d="M6 21V4.500M6 5h11l-2 4 2 4H6"/>',
  search:'<circle cx="11" cy="11" r="6.500"/><path d="M16 16l4.500 4.500"/>',
  doc:'<path d="M7 3.500h7l4 4V20.500H7z"/><path d="M14 3.500V8h4M9.500 12h5M9.500 15.500h5"/>',
  user:'<circle cx="12" cy="8.500" r="3.800"/><path d="M5 20c.8-3.600 3.800-5.500 7-5.500s6.200 1.900 7 5.500"/>',
  arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  back:'<path d="M15 5l-7 7 7 7"/>',
  home:'<path d="M4 11l8-6.500 8 6.500M6 10v9.500h12V10"/>',
  refresh:'<path d="M19 12a7 7 0 11-2.200-5.100M19 4.500V8h-3.500"/>',
  target:'<circle cx="12" cy="12" r="8.500"/><circle cx="12" cy="12" r="4.500"/><circle cx="12" cy="12" r=".8"/>',
  pen:'<path d="M5 19l1-4L16.500 4.500a2.100 2.100 0 013 3L9 18z"/>',
  layers:'<path d="M12 4l8 4.200-8 4.200L4 8.200z"/><path d="M4 12.200l8 4.200 8-4.200M4 16l8 4.200 8-4.200"/>'
};
/*CHARS*/
/*DIAGRAMS*/
IC.warmup='<circle cx="12" cy="12" r="8.500"/><path d="M12 7.500V12l3.200 2"/>';
IC.pretest='<path d="M9 18h6M10 21h4"/><path d="M12 3.500a5.500 5.500 0 00-3.200 10c.7.600 1.200 1.500 1.200 2.500h4c0-1 .5-1.900 1.200-2.500A5.500 5.500 0 0012 3.500z"/>';
IC.apply=IC.pen; IC.master=IC.medal; IC.checkpoint=IC.flag; IC.field=IC.search;
function zLv(){ return currentLevel().n; }
function ic(n,cls){ return '<svg class="i '+(cls||'')+'" viewBox="0 0 24 24" aria-hidden="true">'+IC[n]+'</svg>'; }

/* ================= course model ================= */
var LEVELS = DATA.levels, SESSIONS = DATA.sessions, SBY = {}, NODES = [], NBY = {}, GATES = {};
SESSIONS.forEach(function(s){ SBY[s.id]=s; s.items=0; });
LEVELS.forEach(function(lv){ lv.sessionObjs = lv.sessions.map(function(id){ return SBY[id]; }); GATES[lv.gate.id]=lv; });
var KIND = {learn:'Learn', field:'From the sources', demo:'See it', practice:'Practise', recall:'Recall', task:'Exercise', case:'Case', question:'Exit ticket', gate:'Level gate', warmup:'Warm-up', pretest:'Guess first', apply:'Apply', master:'Mastery check', checkpoint:'Level checkpoint', review:'Review', mission:'Field mission'};
var STAR_KINDS = {practice:1, recall:1, mission:1};
var ITEMS = {};
SESSIONS.forEach(function(s){
  s.nodes.forEach(function(n){
    n.id = s.id+'-'+n.k; n.sid = s.id; n.level = s.level; NODES.push(n); NBY[n.id]=n;
    (n.items||[]).forEach(function(it){ ITEMS[it.id]=it; it.node = n.id; });
  });
  s.nodeCount = s.nodes.length;
  var lv = LEVELS[s.level-1];
  if(lv.gate.session===s.id){ var g = lv.gate; var gn = {id:g.id, sid:s.id, k:'G', kind:'gate', title:g.title, level:s.level, blurb:'Hand your deliverable to your instructor. Check your own work against the rubric first.'}; NODES.push(gn); NBY[g.id]=gn; s.gateNode=gn; }
});
function sessNodes(sid){ return NODES.filter(function(n){ return n.sid===sid; }); }
function isDone(id){ return !!S.done[id]; }
function starsOf(id){ return (S.done[id]&&S.done[id].stars)||0; }
function sessProg(s){ var ns=sessNodes(s.id), d=ns.filter(function(n){ return isDone(n.id); }).length; return {done:d,total:ns.length,pct:Math.round(d/ns.length*100)}; }
function sessComplete(s){ var p=sessProg(s); return p.done===p.total; }
function sessOpen(s){ if(S.preview||s.n===1||s.n<=S.startAt) return true; return sessComplete(SESSIONS[s.n-2]); }
function levelDone(lv){ return isDone(lv.gate.id); }
function levelProg(lv){ var d=lv.sessionObjs.filter(sessComplete).length; return {done:d,total:lv.sessionObjs.length}; }
function totalDone(){ return NODES.filter(function(n){ return isDone(n.id); }).length; }
function nextNode(){
  for(var i=Math.max(0,S.startAt-1);i<SESSIONS.length;i++){ var s=SESSIONS[i]; if(!sessOpen(s)) continue; settleWarm(s); if(sessComplete(s)) continue;
    var ns=sessNodes(s.id); for(var j=0;j<ns.length;j++) if(!isDone(ns[j].id)) return ns[j]; }
  return null;
}
function nextInSession(sid, afterId){
  var ns=sessNodes(sid), i=ns.findIndex(function(n){ return n.id===afterId; });
  for(var k=1;k<=ns.length;k++){ var n=ns[(i+k)%ns.length]; if(!isDone(n.id) && n.id!==afterId) return n; }
  return null;
}
function currentLevel(){ for(var i=SESSIONS[Math.max(0,S.startAt-1)].level-1;i<LEVELS.length;i++) if(!levelDone(LEVELS[i])) return LEVELS[i]; return LEVELS[LEVELS.length-1]; }
function gateReady(lv){ return sessNodes(lv.gate.session).every(function(n){ return n.kind==='gate' || isDone(n.id); }); }
function estMin(n){
  if(n.kind==='learn'||n.kind==='field') return Math.max(3, Math.round(n.items.length*0.7));
  if(n.kind==='warmup') return 3; if(n.kind==='pretest') return 2; if(n.kind==='apply') return 4; if(n.kind==='master') return 6; if(n.kind==='checkpoint') return 8;
  if(n.kind==='mission') return n.boss?9:5; if(n.kind==='demo') return 4; if(n.kind==='practice') return 4; if(n.kind==='recall') return 5;
  if(n.kind==='task') return 45; if(n.kind==='case') return 6; if(n.kind==='question') return 8; return 10;
}

/* ================= learning engine: spaced review, interleaving, confidence ================= */
var INT = [0,1,3,7,14,30], CONF = {warmup:1, master:1, checkpoint:1};
function addDays(k){ return ymd(new Date(Date.now()+k*864e5)); }
function sidOf(id){ return id.split('-')[0]; }
function srsId(it){ return it.src||it.id; }
function srsUpdate(it, ok, conf, hinted){
  var id=srsId(it); if(!ITEMS[id]||!ITEMS[id].core) return;
  var r=S.srs[id]||(S.srs[id]={b:0,due:today(),seen:0,ok:0,last:''}), t=today();
  if(ok && r.last && r.last!==t) S.recalled=(S.recalled||0)+1;
  r.seen++; r.last=t;
  if(ok){ r.ok++; r.b=(conf==='guess'||hinted)?Math.max(r.b,1):Math.min(5,r.b+1); } else r.b=0;
  r.due=addDays(INT[r.b]);
}
function srsDueIds(beforeN){
  var t=today(), out=[];
  Object.keys(S.srs).forEach(function(id){
    var r=S.srs[id], it=ITEMS[id]; if(!it||r.due>t) return;
    var sn=SBY[sidOf(id)].n; if(beforeN&&sn>=beforeN) return;
    out.push({id:id,b:r.b,due:r.due,sn:sn});
  });
  out.sort(function(a,b){ return a.b-b.b || (a.due<b.due?-1:a.due>b.due?1:0) || a.sn-b.sn; });
  return out;
}
function dueCount(){ return srsDueIds(0).length; }
function pickSpread(list, max, per, fill){
  var out=[], cnt={};
  list.forEach(function(p){ if(out.length>=max) return; if((cnt[p.sn]||0)>=per) return; cnt[p.sn]=(cnt[p.sn]||0)+1; out.push(p); });
  if(fill) list.forEach(function(p){ if(out.length<max && out.indexOf(p)<0) out.push(p); });   // a spaced-review round uses every slot it can
  return out;
}
function warmItems(sid){
  var n=SBY[sid].n;
  return shuffle(pickSpread(srsDueIds(n),5,2).map(function(p){ return ITEMS[p.id]; }));
}
function weakPool(filterFn){
  var t=today(), out=[];
  SESSIONS.forEach(function(s){ s.nodes.forEach(function(nd){ (nd.items||[]).forEach(function(it){
    if(!it.core||it.type!=='mcq'||it.post||!filterFn(s,nd,it)) return;
    var r=S.srs[it.id], sc=r?(r.due<=t?r.b:10+r.b):20+Math.random();
    out.push({it:it, sn:s.n, sc:sc});
  }); }); });
  out.sort(function(a,b){ return a.sc-b.sc; });
  return out;
}
function mixItems(sid){
  var n=SBY[sid].n, pool=weakPool(function(s,nd){ return s.n<n && (nd.kind==='master'||nd.kind==='apply'); });
  return pickSpread(pool,2,1).map(function(p){ return p.it; });
}
function cpItems(node){
  var ids=LEVELS[node.level-1].sessions, pool=weakPool(function(s,nd){ return ids.indexOf(s.id)>=0 && nd.kind==='master'; });
  return shuffle(pickSpread(pool,10,2).map(function(p){ return p.it; }));
}
function nodeItems(n){
  if(n.dyn==='warmup') return warmItems(n.sid);
  if(n.dyn==='checkpoint') return cpItems(n);
  if(n.mixed && SBY[n.sid].n>1) return shuffle(n.items).slice(0,3).concat(mixItems(n.sid));
  return n.items||[];
}
function settleWarm(s){
  var nd=NBY[s.id+'-U']; if(!nd) return;
  // a skip only holds for the day it was made, unless the learner already started the session; tomorrow reviews may be due
  var dn=S.done[nd.id];
  if(dn && dn.auto && dn.at!==today() && !s.nodes.some(function(x){ return x.id!==nd.id && isDone(x.id); })){ delete S.done[nd.id]; save(); }
  if(isDone(nd.id)) return;
  if(!warmItems(s.id).length){ S.done[nd.id]={stars:0,at:today(),auto:1}; save(); }
}
function nodeBlurb(n){
  if(n.dyn==='warmup'){ var d=warmItems(n.sid).length; return isDone(n.id)&&S.done[n.id].auto ? 'Nothing was due, so this step was skipped.' : d ? d+(d===1?' question is':' questions are')+' due from earlier sessions. Answer from memory, then rate how sure you were.' : n.blurb; }
  if(n.dyn==='checkpoint') return n.blurb;
  return n.blurb||'';
}
function masteredCount(){ return SESSIONS.filter(function(s){ return S.mast[s.id]&&S.mast[s.id].passed; }).length; }
function sureStats(){ var c=S.conf.sure, n=c[0]+c[1]; return {n:n, acc:n?c[0]/n:0}; }
function boxCounts(){ var c=[0,0,0,0,0,0]; Object.keys(S.srs).forEach(function(id){ if(ITEMS[id]) c[S.srs[id].b]++; }); return c; }

/* ================= xp, streak, badges ================= */
function addXP(n){
  if(!n) return;
  var t=today(), before=plOf(S.xp); S.xp+=n; S.xpByDay[t]=(S.xpByDay[t]||0)+n;
  if(S.xpByDay[t]>=S.goal && S.streak.last!==t){
    if(S.streak.last===dayAgo(1)) S.streak.n++;
    else if(S.streak.last===dayAgo(2) && (S.freezes||0)>0 && S.streak.n>0){ S.freezes--; S.streak.n++; PEND.push({t:'freeze'}); }   // one missed day, covered by a freeze
    else S.streak.n=1;
    S.streak.last=t;
    S.streak.best = Math.max(S.streak.best||0, S.streak.n);
    if(S.goalDays.indexOf(t)<0) S.goalDays.push(t);
  }
  for(var l=before+1;l<=plOf(S.xp);l++) levelUp(l);
  save();
}
function streakNow(){ return (S.streak.last===today()||S.streak.last===dayAgo(1)||(S.streak.last===dayAgo(2)&&(S.freezes||0)>0)) ? S.streak.n : 0; }
function frozenToday(){ return S.streak.last===dayAgo(2) && (S.freezes||0)>0 && S.streak.n>0; }
function countKind(kind){ return NODES.filter(function(n){ return n.kind===kind && isDone(n.id); }).length; }
function threeStars(){ return NODES.filter(function(n){ return STAR_KINDS[n.kind] && starsOf(n.id)===3; }).length; }
var BADGES = [
  {id:'first', icon:'flag', name:'First step', desc:'Finish any step.', have:function(){ return totalDone(); }, need:1},
  {id:'streak3', icon:'flame', name:'Three in a row', desc:'Meet your daily goal three days running.', have:function(){ return S.streak.best||0; }, need:3},
  {id:'streak7', icon:'flame', name:'A full week', desc:'Meet your daily goal seven days running.', have:function(){ return S.streak.best||0; }, need:7},
  {id:'flawless', icon:'star', name:'Flawless', desc:'Earn three stars on a practice or recall step.', have:threeStars, need:1},
  {id:'sharp', icon:'star', name:'Sharp', desc:'Earn three stars on five steps.', have:threeStars, need:5},
  {id:'cleared', icon:'refresh', name:'Clean slate', desc:'Clear ten items from your review list.', have:function(){ return S.cleared||0; }, need:10},
  {id:'reader', icon:'doc', name:'Study habit', desc:'Open the study sheets of five sessions.', have:function(){ return S.sheets.length; }, need:5},
  {id:'builder', icon:'pen', name:'Hands on', desc:'Finish five exercise logs.', have:function(){ return countKind('task'); }, need:5},
  {id:'case', icon:'case', name:'Case closed', desc:'Finish five cases.', have:function(){ return countKind('case'); }, need:5},
  {id:'skeptic', icon:'question', name:'Skeptic', desc:'Finish five exit tickets. Question what Claude gave you.', have:function(){ return countKind('question'); }, need:5},
  {id:'session', icon:'layers', name:'Session complete', desc:'Finish every step of one session.', have:function(){ return SESSIONS.filter(sessComplete).length; }, need:1},
  {id:'explorer', icon:'search', name:'Explorer', desc:'Read 10 source notes.', have:function(){ return refsOpened(); }, need:10},
  {id:'diver', icon:'layers', name:'Deep diver', desc:'Read 5 Go deeper notes.', have:function(){ return refsOpened('deep'); }, need:5},
  {id:'agent', icon:'mission', name:'Field agent', desc:'Finish five field missions.', have:function(){ return countKind('mission'); }, need:5},
  {id:'ace', icon:'star', name:'Mission ace', desc:'Earn three stars on five field missions.', have:function(){ return NODES.filter(function(n){ return n.kind==='mission' && starsOf(n.id)===3; }).length; }, need:5},
  {id:'chests', icon:'chest', name:'Treasure hunter', desc:'Open 5 chests.', have:function(){ return Object.keys(S.chest).length; }, need:5},
  {id:'goal5', icon:'target', name:'Goal getter', desc:'Meet your daily goal on five different days.', have:function(){ return S.goalDays.length; }, need:5},
  {id:'xp500', icon:'bolt', name:'Five hundred', desc:'Earn 500 practice XP.', have:function(){ return S.xp; }, need:500},
  {id:'xp2500', icon:'bolt', name:'Twenty-five hundred', desc:'Earn 2,500 practice XP.', have:function(){ return S.xp; }, need:2500},
  {id:'master3', icon:'medal', name:'Mastery', desc:'Pass the mastery check in three sessions.', have:masteredCount, need:3},
  {id:'master10', icon:'medal', name:'Deep learner', desc:'Pass the mastery check in ten sessions.', have:masteredCount, need:10},
  {id:'spaced', icon:'refresh', name:'Spaced memory', desc:'Answer 25 review questions right on a later day.', have:function(){ return S.recalled||0; }, need:25},
  {id:'calib', icon:'target', name:'Well calibrated', desc:'Say Sure on 15 answers and be right at least 80% of the time.', have:function(){ var c=sureStats(); return (c.n>=15&&c.acc>=.8)?1:0; }, need:1}
].concat(LEVELS.map(function(lv){ return {id:'lv'+lv.n, icon:'medal', name:lv.name+' gate handed in', desc:'Hand in the Level '+lv.n+' gate to your instructor.', have:function(){ return levelDone(lv)?1:0; }, need:1, level:lv.n}; }));
function checkBadges(){
  var fresh=[];
  BADGES.forEach(function(b){ if(!S.badges[b.id] && b.have()>=b.need){ S.badges[b.id]=today(); fresh.push(b); } });
  if(fresh.length){ S.sparks=(S.sparks||0)+5*fresh.length; }
  settleRewards();
  if(fresh.length) save();
  return fresh;
}

/* ================= router ================= */
var view = {name:(!S.profile.done && !S.xp && !Object.keys(S.done).length) ? 'onboard' : 'learn'}, L = null, lastLevelUp = null;
function go(v){ view=v; render(); window.scrollTo(0,0); }
var TBLN=0;
function render(){
  TBLN=0;
  ({learn:learnView, session:sessionView, review:reviewView, sheets:sheetsView, you:youView, sheet:sheetView, lesson:lessonView, task:taskView, kase:caseView, question:questionView, gate:gateView, levelup:levelupView, onboard:onboardView, place:placeView, library:libraryView, shop:shopView, album:albumView})[view.name]();
  armGuard();
  showPending();
}

/* ---- the browser's Back button stays inside the app ---- */
var guardOn=false;
function armGuard(){ if(!guardOn && view.name!=='learn' && view.name!=='onboard' && view.name!=='place'){ try{ history.pushState({z:1},''); guardOn=true; }catch(e){} } }
function backInApp(){
  var m=$('.modal');
  if(m){ var x=$('#noteX',m)||$('#stay',m)||$('#celeDone',m); if(x) x.click(); else if(m.parentNode) m.parentNode.removeChild(m); return; }
  var n=view.name;
  if(n==='lesson'||n==='task'||n==='kase'||n==='question'||n==='gate'){ var q=$('#quit'); if(q) q.click(); else leave(); return; }
  if(n==='onboard'||n==='place') return; // setup and placement are not interrupted by Back
  go({name:n==='sheet'?'sheets':'learn'});
}
window.addEventListener('popstate',function(){
  var atRoot=view.name==='learn' && !$('.modal');
  guardOn=false;
  if(atRoot){ try{ history.back(); }catch(e){} return; }
  backInApp(); armGuard();
});
/* a dialog keeps Tab inside itself, closes on Escape, hides the page behind it and gives focus back */
function trapFocus(m, close){
  var prev=document.activeElement;
  function key(e){
    if(e.key==='Escape'){ e.stopPropagation(); close(); return; }
    if(e.key!=='Tab') return;
    var f=$$('button,input,textarea,select,[tabindex]:not([tabindex="-1"])',m).filter(function(x){ return !x.disabled && x.offsetParent!==null; });
    if(!f.length) return;
    var a=document.activeElement;
    if(!m.contains(a)){ e.preventDefault(); f[0].focus(); }
    else if(e.shiftKey && a===f[0]){ e.preventDefault(); f[f.length-1].focus(); }
    else if(!e.shiftKey && a===f[f.length-1]){ e.preventDefault(); f[0].focus(); }
  }
  document.addEventListener('keydown',key); APP.inert=true;
  return function release(){ document.removeEventListener('keydown',key); APP.inert=false; try{ if(prev&&prev.focus&&document.contains(prev)) prev.focus(); }catch(e){} };
}
function setPage(html, tab, lv){
  var rev=S.missed.filter(function(id){ return ITEMS[id]; }).length;
  var tabs=[['learn','Learn','learn'],['review','Review','recall'],['sheets','Sheets','doc'],['you','You','user']];
  APP.innerHTML='<div class="shell"'+(lv?' data-lv="'+lv+'"':'')+'><header class="bar"><div class="bar-in"><div class="brand">'+logoMark(32)+'<span class="wm"><b>Zero</b> <i>to</i> <b>100</b></span></div>'
    +'<div class="stats"><span class="stat flame" title="Day streak">'+ic('flame')+'<b>'+streakNow()+'</b><span class="sr"> day streak</span></span><span class="stat xp" title="Practice XP">'+ic('bolt')+'<b>'+S.xp+'</b><span class="sr"> XP</span></span></div></div>'
    +'<nav class="tabs" aria-label="Sections"><div class="tabs-in">'+tabs.map(function(t){ return '<button class="tab'+(t[0]===tab?' on':'')+'" data-tab="'+t[0]+'"'+(t[0]===tab?' aria-current="page"':'')+'>'+ic(t[2])+'<span>'+t[1]+'</span>'+(t[0]==='review'&&rev?'<i class="dot">'+rev+'</i>':'')+'</button>'; }).join('')+'</div></nav></header>'
    +'<main class="page">'+hudHTML()+html+'</main></div>';
  $$('[data-tab]').forEach(function(b){ b.onclick=function(){ go({name:b.getAttribute('data-tab')}); }; });
  $$('[data-hud]').forEach(function(b){ b.onclick=function(){ go({name:b.getAttribute('data-hud')}); }; });
  bindDiagrams(); showPending();
}
function ring(pct, size, stroke, label, cls){
  var r=(size-stroke)/2, c=2*Math.PI*r, off=c*(1-Math.min(1,pct/100));
  return '<span class="ring-wrap '+(cls||'')+'" style="width:'+size+'px;height:'+size+'px"><svg viewBox="0 0 '+size+' '+size+'" width="'+size+'" height="'+size+'" aria-hidden="true"><circle class="rt" cx="'+size/2+'" cy="'+size/2+'" r="'+r+'" stroke-width="'+stroke+'"/><circle class="rf" cx="'+size/2+'" cy="'+size/2+'" r="'+r+'" stroke-width="'+stroke+'" stroke-dasharray="'+c.toFixed(1)+'" stroke-dashoffset="'+off.toFixed(1)+'" transform="rotate(-90 '+size/2+' '+size/2+')"/></svg><span class="rl">'+(label||'')+'</span></span>';
}
function starRow(n, cls){ var h='<span class="stars '+(cls||'')+'" aria-label="'+n+' of 3 stars">'; for(var i=1;i<=3;i++) h+=ic('star', i<=n?'on':'off'); return h+'</span>'; }

/* ================= LEARN ================= */
function learnView(){
  var nx=nextNode(), t=today(), xpT=S.xpByDay[t]||0, gp=Math.min(100,Math.round(xpT/S.goal*100));
  var tot=totalDone(), all=NODES.length, cl=currentLevel(), lp=levelProg(cl);
  var h='<div class="cols">';
  // hero
  h+='<section class="hero" data-lv="'+(nx?nx.level:5)+'">';
  var rev0=S.missed.filter(function(id){ return ITEMS[id]; }).length, zm=!tot?'wink':!nx?'cheer':rev0>=3?'think':xpT>=S.goal?'cheer':'happy';
  var zl=!tot?('Hi'+(S.profile.name?' '+S.profile.name:'')+', I am Zed. I start at zero and you take me to 100. '+(S.startAt>1?'Your start point is session '+S.startAt+'.':'The first step is ready.')):!nx?'Every step is done. Wipe the last smudges and keep the streak going.':rev0>=3?rev0+' smudges are waiting in Review. Wipe a few before they pile up.':xpT>=S.goal?'Daily goal met. Anything more is a bonus.':streakNow()>=2?streakNow()+' days in a row. Keep it going.':streakNow()===0?'Welcome back. One step gets you moving again.':'Next step is ready when you are.';
  h+='<div class="hero-z"><p class="bubble">'+esc(zl)+'</p><span class="zwrap">'+zed(cl.n,zm,132,'bob')+'</span></div>';
  if(nx){
    var s=SBY[nx.sid];
    var ns0=sessNodes(s.id), pos=ns0.findIndex(function(x){ return x.id===nx.id; })+1;
    h+='<div class="hero-t"><span class="eyebrow">'+(tot?'Up next':'Start here')+' · Level '+s.level+', session '+s.n+'</span><h1>'+esc(s.title)+'</h1><p>Step '+pos+' of '+ns0.length+' · '+(nx.kind==='gate'?'Level gate: '+esc(nx.title):esc(nx.title)+' · about '+estMin(nx)+' min')+'</p></div>'
      +'<button class="btn big" id="cont">'+(tot?'Continue':'Start')+ic('arrow')+'</button>';
  } else h+='<div class="hero-t"><span class="eyebrow">'+(S.startAt>1?'Course complete from your start':'Course complete')+'</span><h1>'+(S.startAt>1?'Everything from here is done':'Every step is done')+'</h1><p>'+(S.startAt>1?'The sessions you skipped stay open if you want them. Or review your weak spots.':'Review your weak spots or reread a study sheet.')+'</p></div>';
  h+=miniTrail();
  h+='<div class="hero-m"><div class="meter" role="progressbar" aria-label="Steps done in the course" aria-valuemin="0" aria-valuemax="'+all+'" aria-valuenow="'+tot+'"><i style="width:'+Math.round(tot/all*100)+'%"></i></div><span>'+tot+' of '+all+' steps</span></div></section>';
  // side
  h+='<aside class="side">';
  h+=questsCard();
  h+='<section class="card goalc"><div>'+ring(gp,76,9,Math.round(gp)+'%')+'</div><div><h2>Daily goal</h2><p class="num">'+(xpT>=S.goal?'Met: '+xpT+' XP today':xpT+' of '+S.goal+' XP today')+'</p><p class="sub">'+(streakNow()?streakNow()+(streakNow()===1?' day':' days')+' streak':'Meet it to start a streak')+'</p></div></section>';
  var wk='';
  for(var d=6; d>=0; d--){ var dk=dayAgo(d), met=(S.xpByDay[dk]||0)>=S.goal, on=(S.xpByDay[dk]||0)>0; wk+='<span class="day'+(met?' met':on?' some':'')+(d===0?' today':'')+'" title="'+dk+'"></span>'; }
  h+='<section class="card"><h2>This week</h2><div class="week" aria-label="Last seven days">'+wk+'</div><p class="sub">Filled days met the goal.</p></section>';
  h+='<section class="card lvc" data-lv="'+cl.n+'"><h2>Level '+cl.n+': '+esc(cl.name)+'</h2><div class="meter"><i style="width:'+Math.round(lp.done/lp.total*100)+'%"></i></div><p class="sub">'+lp.done+' of '+lp.total+' sessions complete. '+(levelDone(cl)?'Gate handed in.':'Gate: '+esc(cl.gate.title)+'.')+'</p></section>';
  if(S.startAt===1 && !S.placed && tot<10) h+='<section class="card placec"><h2>Already know some of this?</h2><p class="sub">A short placement check can start you further in. It takes about 4 minutes.</p><button class="btn ghost" id="placeGo">Skip ahead</button></section>';
  var rev=S.missed.filter(function(id){ return ITEMS[id]; }).length;
  if(rev) h+='<section class="card revc"><div class="revc-h">'+smudge(40)+'<h2>'+rev+(rev===1?' smudge':' smudges')+' to clear</h2></div><p class="sub">Each one is a question you missed. Answer it right and it wipes off.</p><button class="btn ghost" data-tab-go="review">Review now</button></section>';
  var due=dueCount();
  if(due) h+='<section class="card duec2"><div class="revc-h">'+ic('warmup')+'<h2>'+due+(due===1?' review due':' reviews due')+'</h2></div><p class="sub">Spaced review: each question comes back just before you would forget it.</p><button class="btn ghost" id="dueGo">Review '+Math.min(due,10)+' now</button></section>';
  h+='</aside>';
  // levels
  h+='<div class="levels">';
  LEVELS.forEach(function(lv){
    var lp2=levelProg(lv);
    h+='<section class="level" data-lv="'+lv.n+'" aria-label="Level '+lv.n+'"><header class="lv-head"><span class="lvz">'+(lv.n<=cl.n?zed(lv.n,levelDone(lv)?'cheer':'happy',50):zed(lv.n,'sleep',50,'zlock'))+'</span><span class="lv-chip">Level '+lv.n+'</span><h2>'+esc(lv.name)+'</h2><span class="range">'+esc(lv.range)+(lv.n===5?'':' points')+'</span><span class="lv-prog">'+lp2.done+' of '+lp2.total+' sessions</span></header><div class="sgrid">';
    lv.sessionObjs.forEach(function(s){
      var p=sessProg(s), open=sessOpen(s), comp=sessComplete(s), ns=sessNodes(s.id);
      var segs=ns.map(function(n){ var st=isDone(n.id)?(starsOf(n.id)===3?' gold':' on'):''; return '<i class="seg'+st+'"></i>'; }).join('');
      h+='<button class="scard'+(comp?' comp':'')+(open?'':' locked')+'" data-sess="'+s.id+'"'+(open?'':' aria-disabled="true"')+' aria-label="Session '+s.n+': '+esc(s.title)+', '+(open?p.done+' of '+p.total+' steps done':'locked')+'">'
        +'<span class="sn'+(nx&&nx.sid===s.id?' here':'')+'">'+(comp?ic('check'):(nx&&nx.sid===s.id?zed(lv.n,'wink',40):(open?s.n:ic('lock'))))+'</span><span class="sb"><b>'+esc(s.title)+'</b><span class="sd">'+esc(s.deliverable)+'</span><span class="segs">'+segs+'</span></span>'
        +'<span class="sx">'+(open?(comp?(S.mast[s.id]&&S.mast[s.id].passed?'Mastered':'Done'):(s.n<S.startAt&&!p.done?'Skipped':p.done+'/'+p.total)):'Locked')+'</span></button>';
    });
    h+='</div><div class="gaterow'+(levelDone(lv)?' done':'')+'"><span class="gi">'+ic('gate')+'</span><span><b>Gate: '+esc(lv.gate.title)+'</b><span class="sd">'+(levelDone(lv)?'Handed in to your instructor':'Graded by your instructor. Opens when every step of session '+SBY[lv.gate.session].n+' is done.')+'</span></span></div></section>';
  });
  h+='</div></div>';
  setPage(h,'learn');
  var c=$('#cont'); if(c) c.onclick=function(){ openNode(nx.id); };
  $$('[data-sess]').forEach(function(b){ b.onclick=function(){ var s=SBY[b.getAttribute('data-sess')]; if(!sessOpen(s)) return toast('Finish session '+(s.n-1)+' first.'); go({name:'session', sid:s.id}); }; });
  $$('[data-tab-go]').forEach(function(b){ b.onclick=function(){ go({name:b.getAttribute('data-tab-go')}); }; });
  var dgo=$('#dueGo'); if(dgo) dgo.onclick=startDue;
  var pg=$('#placeGo'); if(pg) pg.onclick=function(){ go({name:'place'}); };
  var dq=$('#dqChest'); if(dq) dq.onclick=function(){ S.chest['dq-'+today()]=today(); openChest(20, 8, 'Daily');  learnView(); };
}

/* ================= ONBOARDING, PLACEMENT AND THE SESSION CLOSE ================= */
var ROLES=[['Marketing and content','Write a campaign email'],['Sales and customers','Prepare for a client call'],['Operations and admin','Summarise the weekly report'],['Finance and legal','Check a contract for risks'],['Teaching and training','Draft a lesson plan'],['Engineering and data','Fix a bug in a script'],['Something else','Summarise a long document']];
var EXPS=[['Brand new','I have barely used AI tools, or never.'],['I chat with AI sometimes','I use Claude or something similar for questions and drafts.'],['I already build with it','I use Projects, skills, the API or code tools.']];
var GOALS=[[20,'Light','A short step most days.'],[30,'Steady','A couple of steps a day.'],[50,'Serious','A full session most days.']];
var ob={step:0};
function obShell(inner, foot, step){
  APP.innerHTML='<div class="player" data-lv="1"><header class="phead"><span class="combo ghost"></span><div class="pmid"><span class="plabel">Set up'+(step<5?' · '+(step+1)+' of 5':'')+'</span><div class="meter" role="progressbar" aria-label="Setup progress" aria-valuemin="0" aria-valuemax="5" aria-valuenow="'+step+'"><i style="width:'+Math.round(Math.min(step,5)/5*100)+'%"></i></div></div><span class="combo ghost"></span></header>'
    +'<main class="pbody"><div class="pin">'+inner+'</div></main><footer class="pfoot"><div class="pfin">'+foot+'</div></footer></div>';
}
function obChoices(list, cur, attr){
  return '<div class="opts" role="group">'+list.map(function(o,ix){ var on=(cur===ix);
    return '<button class="opt'+(on?' sel':'')+'" data-'+attr+'="'+ix+'" aria-pressed="'+on+'"><span class="k">'+(ix+1)+'</span><span><b>'+esc(o[0])+'</b>'+(o[1]?'<span class="od">'+esc(o[1])+'</span>':'')+'</span></button>'; }).join('')+'</div>';
}
function obFinish(){ S.profile.done=true; save(); }
function onboardView(){
  var P=S.profile, st=ob.step, editing=P.done, body='', foot='', roleIx=ROLES.map(function(r){ return r[0]; }).indexOf(P.role);
  var next='<button class="btn" id="obnext">Continue</button>', back='<button class="btn ghost" id="obback">Back</button>';
  if(st===0){
    body='<div class="introz"><div><p class="kicker">'+(editing?'Your setup':'Welcome')+'</p><h1 class="bigt">Zero to 100</h1></div>'+zed(1,'wink',92)+'</div>'
      +'<p class="lede">24 short sessions take you from your first prompt to running AI systems in production. Five quick questions let me set this up for you. It takes about a minute.</p>'
      +'<div class="fld"><label for="obname">What should I call you? (optional)</label><input id="obname" autocomplete="given-name" maxlength="30" value="'+esc(P.name)+'"></div>';
    foot='<button class="btn wide" id="obnext">Continue</button>'+(editing?'<button class="btn ghost wide" id="obcancel">Cancel</button>':'<button class="btn ghost wide" id="obSkip">Skip setup</button>');
  } else if(st===1){
    body='<p class="kicker">Your work</p><h1 class="bigt">What kind of work do you do?</h1><p class="lede">I use this to suggest practice tasks that fit your day.</p>'+obChoices(ROLES.map(function(r){ return [r[0]]; }), roleIx, 'role');
    foot='<div class="duo">'+back+next+'</div>';
  } else if(st===2){
    body='<p class="kicker">Your starting point</p><h1 class="bigt">How much have you used AI tools?</h1><p class="lede">Be honest. If you already know the basics, you can skip them.</p>'+obChoices(EXPS, P.exp, 'exp');
    foot='<div class="duo">'+back+next+'</div>';
  } else if(st===3){
    body='<p class="kicker">Your pace</p><h1 class="bigt">Pick a daily goal</h1><p class="lede">XP comes from practice. Meet the goal to build a streak. You can change it any time in You.</p>'
      +obChoices(GOALS.map(function(g){ return [g[1]+' · '+g[0]+' XP', g[2]]; }), GOALS.map(function(g){ return g[0]; }).indexOf(S.goal), 'goal');
    foot='<div class="duo">'+back+next+'</div>';
  } else if(st===4){
    var ex=[]; if(roleIx>=0) ex.push(ROLES[roleIx][1]); ex.push('Draft a reply to a hard email'); ex.push('Summarise a long document'); ex=ex.filter(function(x,i){ return ex.indexOf(x)===i; });
    body='<p class="kicker">Your real work</p><h1 class="bigt">Name one real task from the last two weeks</h1><p class="lede">The exercises work best on your own work. Pick an idea or write yours.</p>'
      +'<div class="chips" role="group" aria-label="Ideas">'+ex.map(function(x,i){ return '<button type="button" class="chip" data-ex="'+i+'">'+esc(x)+'</button>'; }).join('')+'</div>'
      +'<div class="fld"><label for="obtask">Your task (optional)</label><input id="obtask" maxlength="90" value="'+esc(P.task)+'" placeholder="For example: summarise customer feedback"></div>';
    foot='<div class="duo">'+back+next+'</div>';
    body+='<span hidden id="exs" data-v="'+esc(JSON.stringify(ex))+'"></span>';
  } else {
    var exp=P.exp, s1=SESSIONS[0], rows=[['Where you start', editing?('Session '+S.startAt+': '+SESSIONS[S.startAt-1].title+'.'):(exp>0?'A short placement check first, so you skip what you already know.':'Session 1: '+s1.title+'.')], ['Daily goal', S.goal+' XP']];
    if(P.task) rows.push(['Your practice task', P.task]);
    body='<div class="introz"><div><p class="kicker">Your plan</p><h1 class="bigt">'+(P.name?esc(P.name)+', you are set':'You are set')+'</h1></div>'+zed(1,'cheer',92)+'</div>'
      +'<ul class="plan">'+rows.map(function(r){ return '<li><b>'+esc(r[0])+'</b><span>'+esc(r[1])+'</span></li>'; }).join('')+'</ul>'
      +'<p class="hint">Level gates are graded by your instructor. XP, stars and badges are practice.</p>';
    foot = editing ? '<button class="btn wide" id="obgo">Save</button>'
      : exp>0 ? '<button class="btn wide" id="obplace">Take the placement check</button><button class="btn ghost wide" id="obgo">Start at session 1</button>'
      : '<button class="btn wide" id="obgo">Start session 1</button>';
  }
  obShell(body, foot, st);
  var nx=$('#obnext'), bk=$('#obback');
  if(nx) nx.onclick=function(){ save(); ob.step++; render(); window.scrollTo(0,0); };
  if(bk) bk.onclick=function(){ ob.step--; render(); window.scrollTo(0,0); };
  var sk=$('#obSkip'); if(sk) sk.onclick=function(){ obFinish(); go({name:'learn'}); };
  var cn=$('#obcancel'); if(cn) cn.onclick=function(){ go({name:'you'}); };
  var nm=$('#obname'); if(nm) nm.oninput=function(){ P.name=nm.value.trim(); save(); };
  function gate(ok){ if(nx) nx.disabled=!ok; }
  if(st===1){ gate(roleIx>=0); $$('[data-role]').forEach(function(b){ b.onclick=function(){ P.role=ROLES[+b.getAttribute('data-role')][0]; save(); render(); }; }); }
  if(st===2){ gate(P.exp>=0); $$('[data-exp]').forEach(function(b){ b.onclick=function(){ P.exp=+b.getAttribute('data-exp'); save(); render(); }; }); }
  if(st===3){ $$('[data-goal]').forEach(function(b){ b.onclick=function(){ S.goal=GOALS[+b.getAttribute('data-goal')][0]; save(); render(); }; }); }
  if(st===4){
    var ti=$('#obtask'), exl=JSON.parse($('#exs').getAttribute('data-v'));
    ti.oninput=function(){ P.task=ti.value.trim(); save(); };
    $$('[data-ex]').forEach(function(b){ b.onclick=function(){ ti.value=exl[+b.getAttribute('data-ex')]; P.task=ti.value; save(); }; });
  }
  var go1=$('#obgo'); if(go1) go1.onclick=function(){ obFinish(); ob.step=0; go({name:editing?'you':'learn'}); };
  var pl=$('#obplace'); if(pl) pl.onclick=function(){ obFinish(); ob.step=0; go({name:'place'}); };
}
function placeView(){
  var big=S.profile.exp===2, a=['Levels 1 to 2 · 8 questions · about 4 min',[1,2]], b=['Levels 1 to 4 · 16 questions · about 8 min',[1,2,3,4]], first=big?b:a, second=big?a:b;
  var body='<p class="kicker">Skip ahead</p><h1 class="bigt">Placement check</h1><p class="lede">Already know some of this? Answer questions from the early levels. You pass a level with 3 of 4 right, and you start at the first level you do not pass.</p>'
    +'<ul class="facts-l"><li>Nothing is marked complete and nothing is locked. Sessions you skip stay open.</li><li>Your answers here earn no XP and do not go on your review list.</li><li>Level gates are still handed to your instructor. Placement only decides where you start.</li><li>Level 5 is the expert track. You can start there only after passing Levels 1 to 4.</li></ul>';
  APP.innerHTML='<div class="player" data-lv="1"><header class="phead"><button class="icon-btn" id="quit" aria-label="Back to the course">'+ic('close')+'</button><div class="pmid"><span class="plabel">Placement check</span></div><span class="combo ghost"></span></header><main class="pbody"><div class="pin">'+body+'</div></main><footer class="pfoot"><div class="pfin"><button class="btn wide" id="p1">'+first[0]+'</button><button class="btn ghost wide" id="p2">'+second[0]+'</button></div></footer></div>';
  $('#quit').onclick=function(){ go({name:'learn'}); };
  $('#p1').onclick=function(){ startPlacement(first[1]); };
  $('#p2').onclick=function(){ startPlacement(second[1]); };
}
function placementItems(levels){
  var out=[];
  levels.forEach(function(ln){
    var per=LEVELS[ln-1].sessionObjs.map(function(s){ var nd=s.nodes.filter(function(x){ return x.kind==='master'; })[0]; return shuffle((nd?nd.items:[]).filter(function(it){ return it.type==='mcq'&&it.core&&!it.post; })); });
    var picked=[], r=0;
    while(picked.length<4 && r<8){ per.forEach(function(arr){ if(picked.length<4 && arr[r]) picked.push(arr[r]); }); r++; }
    out=out.concat(picked);
  });
  return out;
}
function startPlacement(levels){
  startLesson({id:'placement', sid:null, k:'PL', title:'Placement check', kind:'placement', level:1, items:placementItems(levels), levels:levels});
  L.pl={}; levels.forEach(function(l){ L.pl[l]=[0,0]; });
}
function finishPlacement(){
  var levels=L.node.levels, start=null, res=[];
  levels.forEach(function(ln){ var r=L.pl[ln], ok=r[1]>0 && r[0]>=Math.ceil(r[1]*0.75); res.push({n:ln, a:r[0], t:r[1], ok:ok}); if(!ok && start===null) start=ln; });
  var lvl=start!==null?start:Math.min(5,levels[levels.length-1]+1), sess=LEVELS[lvl-1].sessionObjs[0];
  S.startAt=sess.n; S.placed={at:today(), levels:levels, res:res, start:sess.n}; S.profile.done=true; save();
  L.res=res; L.startSess=sess.n; L.phase='done'; render();
}
function placeDone(){
  var s=SESSIONS[L.startSess-1], moved=L.startSess>1;
  var rows='<ul class="objs" aria-label="Level results">'+L.res.map(function(r){ var lv=LEVELS[r.n-1];
    return '<li class="obj '+(r.ok?'secure':'gap')+'"><span class="oi">'+ic(r.ok?'check':'close')+'</span><span>Level '+r.n+': '+esc(lv.name)+'<small>'+r.a+' of '+r.t+' right'+(r.ok?': you can skip this level':': start here')+'</small></span></li>'; }).join('')+'</ul>';
  shell(doneBlock({title:moved?'Start at session '+s.n:'Start at session 1', lv:s.level, mood:'cheer', confetti:moved,
    sub:moved?'You know the ground before this. Session '+s.n+', '+s.title+', is your next step. Everything you skipped stays open.':'The early levels still have something to teach you, so the beginning is the right place to start.',
    facts:[[String(L.first)+' of '+L.graded,'Right'],['Session '+s.n,'Your start']], extra:rows, note:'Nothing is marked complete. Level gates are still handed to your instructor.'}),
    '<button class="btn wide" id="primary">Go to session '+s.n+'</button><button class="btn ghost wide" id="back">Back to the course</button>','',false);
  $('#primary').onclick=function(){ go({name:'session', sid:s.id}); };
  $('#back').onclick=function(){ go({name:'learn'}); };
}
function feedbackPlace(c, why, ans){
  return {fcls:c.ok?'good':'bad', foot:'<div class="fb">'+fbz(c.ok)+'<div class="verdict"><strong>'+(c.ok?'Correct':'Not quite')+'</strong>'+(c.ok?'':'<p class="ans">Answer: '+esc(ans)+'</p>')+(why?'<p>'+esc(why)+'</p>':'')+'</div></div><button class="btn '+(c.ok?'good':'bad')+' wide" id="primary">Continue</button>'};
}

/* the end of a session: what you walked away with, one thing to do today, and why the next session matters */
function debrief(n){
  if(!n||!n.sid||n.id==='review') return null;
  var s=SBY[n.sid]; if(S.debrief[s.id]) return null;
  if(sessNodes(s.id).some(function(x){ return x.kind!=='gate' && !isDone(x.id); })) return null;
  S.debrief[s.id]=today(); save();
  var st=S.obj[s.id], nextS=SESSIONS[s.n]||null;
  var outs=st&&st.length?'<ul class="objs" aria-label="Outcome status">'+s.outcomes.map(function(o,i){ var v=st[i]; return '<li class="obj '+(v||'')+'"><span class="oi">'+ic(v==='secure'?'check':'close')+'</span><span>'+inl(o)+(v?'<small>'+(v==='secure'?'Secure: right the first time':'Revisit: missed on the first try')+'</small>':'')+'</span></li>'; }).join('')+'</ul>'
    :'<ul class="blist">'+s.outcomes.map(function(o){ return '<li>'+inl(o)+'</li>'; }).join('')+'</ul>';
  var html='<section class="debrief"><h2>Before you go</h2>'
    +'<div class="dbrow"><b>Use it today</b><span>'+esc(s.today)+'</span></div>'
    +'<div class="dbrow"><b>You now have</b><span>'+esc(s.deliverable.replace(/\.$/,''))+'. Your instructor grades it.</span></div>'
    +(s.bridge?'<div class="dbrow"><b>Next</b><span>'+esc(s.bridge)+'</span></div>':'')
    +'<h2>What you can do now</h2>'+outs+'</section>';
  return {html:html, title:'Session '+s.n+' complete', next:nextS&&sessOpen(nextS)&&!sessNodes(s.id).some(function(x){ return !isDone(x.id); })?nextS:null};
}
function todayCard(s){
  var done=S.today[s.id];
  return '<section class="todayc" data-lv="'+s.level+'"><span class="eyebrow">Use it today</span><p>'+esc(s.today)+'</p>'
    +'<label class="chk"><input type="checkbox" id="todo"'+(done?' checked disabled':'')+'><div><b>'+(done?'Done on '+esc(done):'I did this')+'</b><span>'+(done?'This is how the session becomes a habit.':'Ten minutes on your own work. Tick it when you have done it for +15 XP.')+'</span></div></label></section>';
}

/* ================= SOURCE NOTES: read inside the app. Nothing here is a link. ================= */
var NOTES = DATA.notes || {};
var NOTEKIND={docs:'Reference', deep:'Deeper reading', 'try':'Hands-on'};
var REFK={docs:'Read', deep:'Go deeper', 'try':'Try it'}, REFI={docs:'doc', deep:'layers', 'try':'target'}, REFU={}, NOTEHAY={};
SESSIONS.forEach(function(s){ (s.refs||[]).forEach(function(r){ if(!REFU[r.id]) REFU[r.id]=r; }); });
Object.keys(NOTES).forEach(function(id){ var n=NOTES[id]; NOTEHAY[id]=(n.t+' '+n.w+' '+n.p+' '+(n.lead||'')+' '+n.pts.map(function(p){ return p[0]+' '+p[1].join(' '); }).join(' ')).toLowerCase(); });
function refsOpened(kind){ return Object.keys(S.read).filter(function(id){ return REFU[id] && (!kind || REFU[id].k===kind); }).length; }
function markAct(k){ var t=today(), a=S.act[t]||(S.act[t]={steps:0,refs:0,practice:0}); a[k]=(a[k]||0)+1; }
function refItem(r){
  var on=S.read[r.id], n=NOTES[r.id]||{p:''};
  return '<button type="button" class="ref'+(on?' on':'')+'" data-note="'+esc(r.id)+'"><span class="rk '+r.k+'">'+ic(REFI[r.k])+'</span><span class="rb"><b>'+esc(r.t)+'</b><span>'+esc(r.w)+'</span><small>'+esc(n.p)+'</small></span><span class="rs">'+(on?ic('check')+'Read':ic('arrow')+'Open')+'</span></button>';
}
function refShelf(s, open){
  var rs=s.refs||[]; if(!rs.length) return '';
  var done=rs.filter(function(r){ return S.read[r.id]; }).length;
  var groups=['docs','deep','try'].map(function(k){ var g=rs.filter(function(r){ return r.k===k; }); return g.length?'<h3 class="rg">'+REFK[k]+'</h3><div class="refs">'+g.map(refItem).join('')+'</div>':''; }).join('');
  return '<details class="shelf" data-lv="'+s.level+'"'+(open?' open':'')+'><summary><span><b>Source notes</b><small data-shelfc="'+s.id+'">'+rs.length+' notes · '+done+' read</small></span>'+ic('arrow')+'</summary>'
    +'<p class="hint">Short notes drawn from Anthropic\'s own documentation and research, written up so you can read them here. Reading one earns 2 XP the first time.</p>'+groups+'</details>';
}
function refreshNoteUI(){
  $$('[data-note].ref').forEach(function(b){ var id=b.getAttribute('data-note'), on=!!S.read[id]; b.classList.toggle('on',on); var rs=b.querySelector('.rs'); if(rs) rs.innerHTML=on?ic('check')+'Read':ic('arrow')+'Open'; });
  $$('[data-shelfc]').forEach(function(c){ var s=SBY[c.getAttribute('data-shelfc')]; c.textContent=s.refs.length+' notes · '+s.refs.filter(function(r){ return S.read[r.id]; }).length+' read'; });
  var lc=$('#libc'); if(lc) lc.textContent=refsOpened();
}
function openNote(id){
  var n=NOTES[id]; if(!n) return;
  var r=REFU[id]||{k:n.k}, first=!S.read[id], nb=[];
  if(first){
    S.read[id]=today(); markAct('refs'); addXP(2); nb=checkBadges(); save();
    var xe=document.querySelector('.stat.xp b'); if(xe) xe.textContent=S.xp; var fe=document.querySelector('.stat.flame b'); if(fe) fe.textContent=streakNow();
  }
  var prevFocus=document.activeElement;
  var body='<p class="nwhy"><b>Why it matters here.</b> '+esc(n.w)+'</p>'+(n.lead?'<p class="nlead">'+esc(n.lead)+'</p>':'');
  n.pts.forEach(function(p){ body+='<h3>'+esc(p[0])+'</h3><ul class="blist">'+p[1].map(function(x){ return '<li>'+esc(x)+'</li>'; }).join('')+'</ul>'; });
  (n.tbl||[]).forEach(function(tb){ body+=blockHTML({t:'table', headers:tb.h, rows:tb.r}); });
  if(!n.pts.length) body+='<p class="hint">This is a short page. The point is above.</p>';
  body+='<p class="nsrc">Extracted from '+esc(n.t)+' ('+esc(n.p)+', as of 24 November 2026). Short extracts only. The lessons in this app are written from notes like this one.'
    +(n.s&&n.s.length?' Used in '+n.s.map(function(x){ return 'session '+x; }).join(', ')+'.':'')+'</p>';
  var m=document.createElement('div'); m.className='modal notem'; m.setAttribute('role','dialog'); m.setAttribute('aria-modal','true'); m.setAttribute('aria-label','Source note: '+n.t);
  m.innerHTML='<div class="card notec"><header class="noteh"><span class="rk '+r.k+'">'+ic(REFI[r.k]||'doc')+'</span><div><small class="np">'+esc(n.p)+' · '+esc(NOTEKIND[r.k]||'')+'</small><h2>'+esc(n.t)+'</h2></div><button type="button" class="icon-btn" id="noteX" aria-label="Close this note">'+ic('close')+'</button></header><div class="nbody" tabindex="0" role="region" aria-label="Note text">'+body+'</div><footer class="notef"><button type="button" class="btn wide" id="noteDone">'+(first?'Done: +2 XP':'Done')+'</button></footer></div>';
  document.body.appendChild(m);
  var release=trapFocus(m,function(){ close(); });
  function close(){ release(); if(m.parentNode) m.parentNode.removeChild(m); refreshNoteUI(); }
  m.addEventListener('click',function(e){ if(e.target===m) close(); });
  m.querySelector('#noteX').onclick=close; m.querySelector('#noteDone').onclick=close;
  m.querySelector('#noteX').focus();
  refreshNoteUI();
  if(first) toast('+2 XP for reading a note'+(nb.length?' · Badge: '+nb[0].name:''));
}
function bindRefs(){ $$('[data-note]').forEach(function(a){ a.onclick=function(){ openNote(a.getAttribute('data-note')); }; }); }
var lib={kind:'all', lv:0, q:''};
function libraryView(){
  var q=lib.q.toLowerCase().trim(), total=Object.keys(REFU).length;
  var h='<div class="narrow"><button class="back" id="back">'+ic('back')+'<span>Study sheets</span></button><div class="phz"><div><h1 class="ph">Source notes</h1><p class="lead">'+total+' short notes from Anthropic\'s documentation and research, readable here. You have read <span id="libc">'+refsOpened()+'</span>.</p></div>'+zed(zLv(),'happy',84)+'</div>'
    +'<div class="search">'+ic('search')+'<input id="lq" type="search" placeholder="Search the notes, for example: caching" aria-label="Search the source notes" value="'+esc(lib.q)+'" autocomplete="off"></div>'
    +'<div class="chips" role="group" aria-label="Type">'+[['all','All']].concat(Object.keys(REFK).map(function(k){ return [k,REFK[k]]; })).map(function(c){ return '<button type="button" class="chip'+(lib.kind===c[0]?' on':'')+'" data-lk="'+c[0]+'" aria-pressed="'+(lib.kind===c[0])+'">'+c[1]+'</button>'; }).join('')+'</div>'
    +'<div class="chips" role="group" aria-label="Level">'+[[0,'All levels']].concat(LEVELS.map(function(l){ return [l.n,'Level '+l.n]; })).map(function(c){ return '<button type="button" class="chip'+(lib.lv===c[0]?' on':'')+'" data-ll="'+c[0]+'" aria-pressed="'+(lib.lv===c[0])+'">'+c[1]+'</button>'; }).join('')+'</div><div id="ll">';
  var any=false;
  SESSIONS.forEach(function(s){
    if(lib.lv && s.level!==lib.lv) return;
    var rs=(s.refs||[]).filter(function(r){ return (lib.kind==='all'||r.k===lib.kind) && (!q || (NOTEHAY[r.id]||'').indexOf(q)>=0); });
    if(!rs.length) return; any=true;
    h+='<section class="libs" data-lv="'+s.level+'"><h2><span class="sn">'+s.n+'</span>'+esc(s.title)+'</h2><div class="refs">'+rs.map(refItem).join('')+'</div></section>';
  });
  if(!any) h+='<p class="empty">Nothing matches. Try another word or clear a filter.</p>';
  h+='</div></div>';
  setPage(h,'sheets');
  $('#back').onclick=function(){ go({name:'sheets'}); };
  var inp=$('#lq'); inp.oninput=function(){ lib.q=inp.value; var pos=inp.selectionStart; libraryView(); var n=$('#lq'); n.focus(); try{ n.setSelectionRange(pos,pos); }catch(e){} };
  $$('[data-lk]').forEach(function(b){ b.onclick=function(){ lib.kind=b.getAttribute('data-lk'); libraryView(); }; });
  $$('[data-ll]').forEach(function(b){ b.onclick=function(){ lib.lv=+b.getAttribute('data-ll'); libraryView(); }; });
  bindRefs();
}

/* ================= THE JOURNEY: phases, chests, the trail and daily quests ================= */
IC.chest='<rect x="4" y="11" width="16" height="9" rx="2"/><path d="M4 11V9a3 3 0 013-3h10a3 3 0 013 3v2M12 11v4M10 15h4"/>';
var PHASES=[
  {id:'learn', name:'Learn', tag:'Take it in', icon:'learn', bonus:10, kinds:['warmup','pretest','learn','field','demo']},
  {id:'apply', name:'Apply', tag:'Try it yourself', icon:'pen', bonus:10, kinds:['apply','mission','practice']},
  {id:'prove', name:'Prove', tag:'Show you have it', icon:'medal', bonus:15, kinds:['recall','master']},
  {id:'use', name:'Use', tag:'Make it yours', icon:'flag', bonus:20, kinds:['task','case','question','checkpoint','gate']}
];
function phaseNodes(sid, ph){ return sessNodes(sid).filter(function(n){ return ph.kinds.indexOf(n.kind)>=0; }); }
function phaseProg(sid, ph){ var ns=phaseNodes(sid,ph), d=ns.filter(function(n){ return isDone(n.id); }).length; return {done:d, total:ns.length}; }
function phaseFull(sid, ph){ var p=phaseProg(sid,ph); return p.total>0 && p.done===p.total; }
function curPhase(sid){ for(var i=0;i<PHASES.length;i++){ var p=phaseProg(sid,PHASES[i]); if(p.total && p.done<p.total) return PHASES[i]; } return null; }
function chestKey(sid, ph){ return sid+'-'+ph.id; }
function phaseStrip(s){
  var cur=curPhase(s.id), h='<div class="pstrip" role="img" aria-label="Journey: '+PHASES.map(function(ph){ return ph.name+(phaseFull(s.id,ph)?' done':cur&&cur.id===ph.id?' now':''); }).join(', ')+'">';
  PHASES.forEach(function(ph, i){
    var st=phaseFull(s.id,ph)?'done':(cur&&cur.id===ph.id)?'cur':'';
    h+=(i?'<span class="pl'+(st==='done'||st==='cur'?' on':'')+'"></span>':'')+'<span class="pp '+st+'"><i>'+ic(st==='done'?'check':ph.icon)+'</i><b>'+ph.name+'</b></span>';
  });
  return h+'</div>';
}
function phaseNote(n){
  // shown on a done screen: where you are, and a ribbon when this step cleared its phase
  var s=SBY[n.sid]; if(!s||n.id==='review') return '';
  var ph=PHASES.filter(function(p){ return p.kinds.indexOf(n.kind)>=0; })[0], ribbon='';
  if(ph && phaseFull(s.id,ph) && !S.chest[chestKey(s.id,ph)]) ribbon='<p class="pclear">'+ic('chest')+'<span><b>'+ph.name+' phase cleared.</b> A chest worth '+ph.bonus+' XP is waiting on the session page.</span></p>';
  return phaseStrip(s)+ribbon;
}
function actToday(){ return S.act[today()]||{steps:0, practice:0, refs:0}; }
var QUESTS=[['steps','Finish a step','Any new step counts.'],['practice','Win a practice step','Practice, recall, apply, warm-up, mastery or a review round.'],['refs','Read a source note','A short note from the shelf of any session.']];
function questsCard(){
  var a=actToday(), key='dq-'+today(), claimed=S.chest[key], n=QUESTS.filter(function(q){ return (a[q[0]]||0)>=1; }).length;
  return '<section class="card questc"><div class="revc-h">'+ic('chest')+'<h2>Today\'s quests</h2></div><ul class="qlist">'
    +QUESTS.map(function(q){ var on=(a[q[0]]||0)>=1; return '<li class="'+(on?'on':'')+'"><span class="qi">'+(on?ic('check'):'')+'</span><span><b>'+q[1]+'</b><small>'+q[2]+'</small></span></li>'; }).join('')+'</ul>'
    +(n===3?(claimed?'<p class="sub">Chest opened today. Come back tomorrow for three more.</p>':'<button class="btn" id="dqChest">'+ic('chest')+'Open chest +20 XP</button>'):'<p class="sub">'+n+' of 3 done. Finish all three to open a chest.</p>')+'</section>';
}
function miniTrail(){
  var nx=nextNode(), cur=nx?SBY[nx.sid].n:0, done=SESSIONS.filter(sessComplete).length, from=S.zedAt||cur;
  var h='<div class="mtrail" role="img" aria-label="Your trail: '+done+' of '+SESSIONS.length+' sessions complete'+(cur?', now on session '+cur:'')+'">';
  LEVELS.forEach(function(lv){
    h+='<div class="mt-g" data-lv="'+lv.n+'" style="flex:'+lv.sessions.length+'"><div class="mt-r">';
    lv.sessionObjs.forEach(function(s){
      var comp=sessComplete(s), here=s.n===cur, st=comp?(S.mast[s.id]&&S.mast[s.id].passed?' gold':' done'):here?' cur':sessOpen(s)?' open':'';
      h+='<span class="mt-d'+st+'">'+(here?'<span class="mt-z'+(from!==cur?' walk':'')+'" style="--walk:'+((from-cur)*13)+'px">'+zed(lv.n,'happy',34)+'</span>':'')+'</span>';
    });
    h+='</div><small>L'+lv.n+'</small></div>';
  });
  if(S.zedAt!==cur){ S.zedAt=cur; save(); }
  return h+'</div>';
}
function bindChests(rerender){
  $$('[data-chest]').forEach(function(b){ b.onclick=function(){
    var key=b.getAttribute('data-chest'); if(S.chest[key]) return;
    var ph=PHASES.filter(function(p){ return p.id===key.split('-')[1]; })[0];
    S.chest[key]=today(); openChest(ph.bonus, 5, ph.name); rerender();
  }; });
}

/* ================= SESSION ================= */
function sessionView(){
  settleWarm(SBY[view.sid]);
  var s=SBY[view.sid], ns=sessNodes(s.id), p=sessProg(s), firstOpen=ns.filter(function(n){ return !isDone(n.id); })[0];
  var lv=LEVELS[s.level-1], stars=ns.reduce(function(a,n){ return a+starsOf(n.id); },0), maxStars=ns.filter(function(n){ return STAR_KINDS[n.kind]; }).length*3;
  var h='<div class="narrow"><button class="back" id="back">'+ic('back')+'<span>All sessions</span></button>'
    +'<header class="s-head" data-lv="'+s.level+'"><div class="s-top"><span class="lv-chip">Level '+s.level+' · Session '+s.n+'</span>'+ring(p.pct,64,8,p.done+'/'+p.total)+'</div><h1>'+esc(s.title)+'</h1>'
    +'<p class="deliv"><b>Deliverable.</b> '+esc(s.deliverable)+' <span class="pts">('+esc(s.points)+')</span></p>'
    +'<div class="s-act"><button class="btn ghost" id="sheet">'+ic('doc')+'Study sheet</button>'+(maxStars?'<span class="starsum">'+ic('star','on')+' '+stars+' of '+maxStars+'</span>':'')+masteryChip(s)+'</div></header>'
    +((sessComplete(s)||(S.mast[s.id]&&S.mast[s.id].passed))&&!S.today[s.id]?todayCard(s):'')
    +(s.hook?'<section class="hookc" data-lv="'+s.level+'"><span class="eyebrow">The situation</span><h2>'+esc(s.hook.title)+'</h2><p>'+esc(s.hook.text)+'</p></section>':'')
    +'<section class="outs"><h2>By the end you can</h2><ul class="blist">'+s.outcomes.map(function(o,i){ var st=(S.obj[s.id]||[])[i]; return '<li>'+inl(o)+(st?' <span class="ost '+st+'">'+(st==='secure'?'Secure':'Revisit')+'</span>':'')+'</li>'; }).join('')+'</ul></section>'
    +'<h2 class="sh qh">Your quest</h2>'+phaseStrip(s);
  var cph=curPhase(s.id), walked=(S.zedNode===(firstOpen&&firstOpen.id));
  PHASES.forEach(function(ph){
    var pn=phaseNodes(s.id,ph); if(!pn.length) return;
    var pp=phaseProg(s.id,ph), full=pp.done===pp.total, ck=chestKey(s.id,ph), claimed=S.chest[ck];
    h+='<section class="phase'+(full?' done':(cph&&cph.id===ph.id?' cur':''))+'" data-lv="'+s.level+'" data-ph="'+ph.id+'"><header class="ph-h"><span class="ph-i">'+ic(ph.icon)+'</span><span class="ph-t"><b>'+ph.name+'</b><small>'+ph.tag+'</small></span><span class="ph-p">'+pp.done+' of '+pp.total+'</span>'
      +(full?(claimed?'<span class="chest opened">'+ic('chest')+'Opened</span>':'<button class="chest ready" data-chest="'+ck+'">'+ic('chest')+'Open +'+ph.bonus+' XP</button>'):'<span class="chest">'+ic('chest')+'+'+ph.bonus+' XP</span>')+'</header><ol class="steps" data-lv="'+s.level+'">';
    pn.forEach(function(n){
      var dn=isDone(n.id), nxt=firstOpen&&firstOpen.id===n.id, locked=(n.kind==='gate'&&!gateReady(lv)&&!S.preview&&!dn);
      var st=dn?'done':locked?'lock':nxt?'next':'open';
      var icon=dn?'check':locked?'lock':n.kind==='gate'?'gate':n.kind;
      h+='<li class="step '+st+(n.kind==='gate'?' gate':'')+'">'+(nxt?'<span class="zwalk'+(walked?'':' walk')+'" aria-hidden="true">'+zed(s.level,'happy',46)+'</span>':'')+'<button class="srow" data-node="'+n.id+'" aria-label="'+esc(KIND[n.kind]+': '+n.title+', '+(dn?'done':locked?'locked':'ready'))+'"'+(locked?' aria-disabled="true"':'')+'>'
        +'<span class="si">'+ic(icon)+'</span><span class="st"><span class="sk">'+KIND[n.kind]+(n.kind==='gate'?'':' · '+estMin(n)+' min')+'</span><b>'+esc(n.title)+'</b><span class="sbl">'+esc(nodeBlurb(n))+'</span></span>'
        +'<span class="sr2">'+(dn&&STAR_KINDS[n.kind]?starRow(starsOf(n.id)):'')+'<span class="go">'+(dn?'Replay':nxt?'Start':locked?'Locked':'Open')+'</span></span></button></li>';
    });
    h+='</ol></section>';
  });
  if(firstOpen && S.zedNode!==firstOpen.id){ S.zedNode=firstOpen.id; save(); }
  var nextS=SESSIONS[s.n]||null;
  if(S.today[s.id]) h+=todayCard(s);
  if(sessComplete(s)&&s.bridge&&nextS) h+='<section class="nextc"><span class="eyebrow">Next</span><p>'+esc(s.bridge)+'</p>'+(sessOpen(nextS)?'<button class="btn ghost" id="nextS">Session '+nextS.n+': '+esc(nextS.title)+ic('arrow')+'</button>':'')+'</section>';
  h+=refShelf(s,false)+'</div>';
  setPage(h,'learn',s.level);
  bindRefs(); bindChests(sessionView);
  var td=$('#todo'); if(td&&!td.disabled) td.onchange=function(){ if(!td.checked) return; S.today[s.id]=today(); addXP(15); toast('+15 XP for using it'); save(); sessionView(); };
  var ns2=$('#nextS'); if(ns2) ns2.onclick=function(){ go({name:'session', sid:nextS.id}); };
  $('#back').onclick=function(){ go({name:'learn'}); };
  $('#sheet').onclick=function(){ go({name:'sheet', sid:s.id, from:{name:'session', sid:s.id}}); };
  $$('[data-node]').forEach(function(b){ b.onclick=function(){ openNode(b.getAttribute('data-node')); }; });
}
function openNode(id){
  var n=NBY[id], s=SBY[n.sid];
  if(!sessOpen(s)) return toast('Finish session '+(s.n-1)+' first.');
  if(n.kind==='gate'){ if(!gateReady(LEVELS[n.level-1]) && !S.preview && !isDone(id)) return toast('Finish every other step in this session first.'); return go({name:'gate', node:n}); }
  if(n.kind==='task') return go({name:'task', node:n});
  if(n.kind==='case') return go({name:'kase', node:n});
  if(n.kind==='question') return go({name:'question', node:n});
  startLesson(n);
}

/* ================= SHEETS ================= */
function blockHTML(b){
  if(b.t==='table') return '<div class="tbl'+(b.headers.length>3?' wide':'')+'" tabindex="0" role="region" aria-label="Table '+(++TBLN)+': '+esc(b.headers.join(', '))+'"><table><thead><tr>'+b.headers.map(function(x){ return '<th scope="col">'+esc(x)+'</th>'; }).join('')+'</tr></thead><tbody>'+b.rows.map(function(r){ return '<tr>'+r.map(function(c){ return '<td>'+inl(c)+'</td>'; }).join('')+'</tr>'; }).join('')+'</tbody></table></div>';
  if(b.t==='list') return '<ul class="blist">'+b.items.map(function(i){ return '<li>'+inl(i)+'</li>'; }).join('')+'</ul>';
  if(b.t==='olist') return '<ol class="blist">'+b.items.map(function(i){ return '<li>'+inl(i)+'</li>'; }).join('')+'</ol>';
  if(b.t==='diagram') return dgHTML(b);
  if(b.t==='label') return '<h3>'+esc(b.text)+'</h3>';
  if(b.t==='stats') return '<div class="statrow">'+b.items.map(function(i){ return '<div class="stat3"><b>'+esc(i.n)+'</b><span>'+esc(i.l)+'</span></div>'; }).join('')+'</div>';
  if(b.t==='src') return NOTES[b.id] ? '<p class="srcn">Source note: <button type="button" class="srcb" data-note="'+esc(b.id)+'">'+esc(b.title)+'</button></p>' : '<p class="srcn">Source: '+esc(b.title)+'</p>';
  if(b.t==='quote') return '<blockquote class="bq">'+inl(b.text)+(b.by?'<small>'+esc(b.by)+'</small>':'')+'</blockquote>';
  return '<p>'+inl(b.text)+'</p>';
}
function sheetsView(){
  var q=(view.q||'').toLowerCase().trim();
  var h='<div class="narrow"><div class="phz"><div><h1 class="ph">Study sheets</h1><p class="lead">One page per session: the cheat sheet, terms, tables and common mistakes. Open one before you practise.</p></div>'+zed(zLv(),'think',84)+'</div>'
    +'<button class="libgo" id="libGo"><span class="libi">'+ic('layers')+'</span><span><b>Source notes</b><small>'+Object.keys(REFU).length+' short notes from Anthropic\'s documentation and research, readable here. '+refsOpened()+' read.</small></span>'+ic('arrow')+'</button>'
    +'<div class="search">'+ic('search')+'<input id="q" type="search" placeholder="Search all 24 sheets" aria-label="Search study sheets" value="'+esc(view.q||'')+'" autocomplete="off"></div><div id="sl">';
  var any=false;
  LEVELS.forEach(function(lv){
    var rows=lv.sessionObjs.filter(function(s){ return !q || s.search.indexOf(q)>=0; });
    if(!rows.length) return; any=true;
    h+='<section class="level slist" data-lv="'+lv.n+'"><header class="lv-head"><span class="lv-chip">Level '+lv.n+'</span><h2>'+esc(lv.name)+'</h2></header>'
      +rows.map(function(s){ return '<button class="srow2" data-sheet="'+s.id+'"><span class="sn">'+s.n+'</span><span class="sb"><b>'+esc(s.title)+'</b><span class="sd">'+esc(s.deliverable)+'</span></span><span class="go">Open</span></button>'; }).join('')+'</section>';
  });
  if(!any) h+='<p class="empty">No sheet matches “'+esc(view.q)+'”.</p>';
  h+='</div></div>';
  setPage(h,'sheets');
  var inp=$('#q'); inp.oninput=function(){ view.q=inp.value; var pos=inp.selectionStart; sheetsView(); var n=$('#q'); n.focus(); try{ n.setSelectionRange(pos,pos); }catch(e){} };
  $$('[data-sheet]').forEach(function(b){ b.onclick=function(){ go({name:'sheet', sid:b.getAttribute('data-sheet'), from:{name:'sheets', q:view.q}}); }; });
  $('#libGo').onclick=function(){ go({name:'library'}); };
}
function sheetView(){
  var s=SBY[view.sid]; if(S.sheets.indexOf(s.id)<0){ S.sheets.push(s.id); save(); var nb=checkBadges(); if(nb.length) toast('Badge earned: '+nb[0].name); }
  var h='<div class="narrow sheet"><button class="back" id="back">'+ic('back')+'<span>Back</span></button><p class="kicker">Session '+s.n+': '+esc(s.title)+'</p><h1 class="ph">Study sheet</h1>';
  s.sheet.forEach(function(sec){ h+='<section><h2>'+esc(sec.title)+'</h2>'+sec.blocks.map(blockHTML).join('')+'</section>'; });
  h+=refShelf(s,true)+'</div>';
  setPage(h,view.from&&view.from.name==='sheets'?'sheets':'learn',s.level);
  bindRefs();
  $('#back').onclick=function(){ go(view.from||{name:'sheets'}); };
}

function dueSection(){
  var d=dueCount(), bc=boxCounts(), tot=bc.reduce(function(a,b){ return a+b; },0), mx=Math.max.apply(null,bc.concat([1]));
  var h='<section class="card duec"><div><h2>'+(d?d+(d===1?' question':' questions')+' due':'Nothing due')+'</h2><p class="sub">'+(tot?'Spaced review brings each question back just as you would forget it: after 1, 3, 7, 14 and 30 days. Get it right and the gap grows. Miss it and it starts again.':'Questions you answer in checks and warm-ups are scheduled here.')+'</p>'+(d?'<button class="btn" id="dueGo">Review '+Math.min(d,10)+' now</button>':'')+'</div>';
  if(tot) h+='<div class="boxes" role="img" aria-label="Questions in each review box: '+bc.join(', ')+'">'+bc.map(function(n,i){ return '<div class="bx"><b>'+n+'</b><i style="height:'+Math.max(4,Math.round(n/mx*70))+'px;--i:'+i+'"></i><span>'+['New','1 day','3 days','7 days','14 days','30 days'][i]+'</span></div>'; }).join('')+'</div>';
  return h+'</section>';
}
function learnHealth(){
  var m=masteredCount(), gains=SESSIONS.filter(function(s){ return S.pre[s.id]&&S.post[s.id]; });
  var pa=gains.reduce(function(a,s){ return a+S.pre[s.id].a; },0), qa=gains.reduce(function(a,s){ return a+S.post[s.id].a; },0), gn=gains.length*2;
  var sec=0, tot=0; Object.keys(S.obj).forEach(function(k){ (S.obj[k]||[]).forEach(function(v){ if(v){ tot++; if(v==='secure') sec++; } }); });
  var ss=sureStats(), muddy=Object.keys(S.muddy).filter(function(k){ return SBY[k]&&S.muddy[k]&&S.muddy[k].trim(); });
  var h='<h2 class="sh">How you are learning</h2><section class="card lh"><div class="kpis">'
    +'<div class="kpi"><b>'+m+'</b><span>Sessions mastered</span></div>'
    +'<div class="kpi"><b>'+dueCount()+'</b><span>Reviews due</span></div>'
    +'<div class="kpi"><b>'+(tot?sec+'/'+tot:'0')+'</b><span>Outcomes secure</span></div>'
    +'<div class="kpi"><b>'+(ss.n>=5?Math.round(ss.acc*100)+'%':'n/a')+'</b><span>Right when sure</span></div></div>'
    +(gn?'<p class="sub">Guess-first questions right: <b>'+pa+' of '+gn+'</b> before learning, <b>'+qa+' of '+gn+'</b> after. That gap is what each session taught you.</p>':'<p class="sub">Finish a mastery check to see how much each session moved you.</p>')
    +(ss.n>=5?'<p class="sub">'+(ss.acc>=.8?'When you say sure, you are usually right. Keep checking anyway.':'When you say sure, you are right '+Math.round(ss.acc*100)+'% of the time. Slow down when you feel certain.')+'</p>':'')
    +(muddy.length?'<h3 class="mini">Your muddiest points</h3><ul class="blist">'+muddy.slice(0,5).map(function(k){ return '<li><b>Session '+SBY[k].n+':</b> '+esc(S.muddy[k])+'</li>'; }).join('')+'</ul>':'')
    +'<details class="how"><summary>How the course teaches you</summary><ol class="blist">'
    +'<li><b>Warm-up.</b> Questions from earlier sessions that are due again. Pulling them from memory is what makes them last.</li>'
    +'<li><b>Guess first.</b> You answer before you learn it. The guess does not count, and it makes the answer stick.</li>'
    +'<li><b>Learn, then see it.</b> Short lessons with a picture, then a worked example you predict step by step.</li>'
    +'<li><b>Apply with hints.</b> Scenarios with a hint on request, then practice with less help each time.</li>'
    +'<li><b>Mixed practice and recall.</b> Questions from earlier sessions are mixed in, so you practise choosing, not only recalling.</li>'
    +'<li><b>Mastery check.</b> One question per outcome plus a teach-back. You move on when you pass, not when you have simply seen the material.</li>'
    +'<li><b>Spaced review.</b> What you answer returns after 1, 3, 7, 14 and 30 days if you keep getting it right, and sooner if you do not.</li>'
    +'<li><b>Confidence ratings.</b> Saying how sure you are shows where you are overconfident, which is where mistakes cost most.</li></ol></details></section>';
  return h;
}
function learnReport(){
  var ss=sureStats(), t='\nLearning: '+masteredCount()+' of '+SESSIONS.length+' sessions mastered. '+dueCount()+' reviews due.';
  if(ss.n>=5) t+=' Right when sure: '+Math.round(ss.acc*100)+'% ('+ss.n+' answers).';
  return t+'\n';
}

/* ================= REVIEW ================= */
function reviewView(){
  var ids=S.missed.filter(function(id){ return ITEMS[id]; }), by={};
  ids.forEach(function(id){ var s=SBY[ITEMS[id].node.split('-')[0]] || SBY[id.slice(0,3)]; by[s.id]=(by[s.id]||0)+1; });
  var h='<div class="narrow"><h1 class="ph">Review</h1><p class="lead">Every question you miss leaves a smudge. Answer it right and it wipes off.</p>';
  if(!ids.length) h+='<section class="card empty-c">'+zed(zLv(),'cheer',120,'hop')+'<h2>No smudges</h2><p>Questions you miss in practice, checks and recall show up here.</p></section>';
  else {
    h+='<section class="card revbig"><div><h2>'+ids.length+(ids.length===1?' smudge':' smudges')+' to clear</h2><p class="sub">Each round takes up to eight questions and earns 3 XP for every right answer.</p><div class="smudges">'+ids.slice(0,10).map(function(){ return smudge(34); }).join('')+'</div></div><button class="btn big" id="go">Start review'+ic('arrow')+'</button></section><h2 class="sh">By session</h2><div class="plain">'
      +Object.keys(by).sort().map(function(k){ var s=SBY[k]; return '<div class="rrow" data-lv="'+s.level+'"><span class="sn">'+s.n+'</span><span class="sb"><b>'+esc(s.title)+'</b></span><span class="sx">'+by[k]+'</span></div>'; }).join('')+'</div>';
  }
  h+=dueSection();
  h+='<p class="fine">Wiped so far: '+(S.cleared||0)+'.</p></div>';
  setPage(h,'review');
  var g=$('#go'); if(g) g.onclick=function(){ startReview(); };
  var dg=$('#dueGo'); if(dg) dg.onclick=startDue;
}

/* ================= YOU ================= */
function reportText(){
  var out='Zero to 100 practice report\nDate: '+today()+'\nXP: '+S.xp+'   Streak: '+streakNow()+' days   Best streak: '+(S.streak.best||0)+'   Steps: '+totalDone()+' of '+NODES.length+'\n';
  LEVELS.forEach(function(lv){
    out+='\nLevel '+lv.n+': '+lv.name+(levelDone(lv)?' (gate handed in)':'')+'\n';
    lv.sessionObjs.forEach(function(s){ var p=sessProg(s), st=sessNodes(s.id).reduce(function(a,n){ return a+starsOf(n.id); },0); out+='  Session '+s.n+' '+s.title+': '+p.done+'/'+p.total+' steps, '+st+' stars\n'; });
  });
  out+=learnReport(); out+='\nBadges: '+(Object.keys(S.badges).length?BADGES.filter(function(b){ return S.badges[b.id]; }).map(function(b){ return b.name; }).join(', '):'none yet')+'\nPractice XP and stars are for you. Course points come from your instructor.\n';
  return out;
}
function setupCard(){
  var P=S.profile, rows=[['Name',P.name||'Not set'],['Work',P.role||'Not set'],['Experience',P.exp>=0?EXPS[P.exp][0]:'Not set'],['Start point','Session '+S.startAt+(S.placed?' (placement check)':'')],['Practice task',P.task||'Not set']];
  return '<section class="card setupc"><h2>Your setup</h2><dl class="kv">'+rows.map(function(r){ return '<div><dt>'+esc(r[0])+'</dt><dd>'+esc(r[1])+'</dd></div>'; }).join('')+'</dl><div class="duo"><button class="btn ghost" id="obEdit">Edit setup</button><button class="btn ghost" id="plGo">Placement check</button></div></section>';
}
function youView(){
  var cl=currentLevel(), tot=totalDone(), stars=NODES.reduce(function(a,n){ return a+starsOf(n.id); },0), earned=BADGES.filter(function(b){ return S.badges[b.id]; }).length;
  var h='<div class="narrow"><h1 class="ph">You</h1>'
    +'<section class="card rank" data-lv="'+cl.n+'"><span class="rk-z">'+zed(cl.n,'happy',96,'bob')+'</span><div><span class="eyebrow">'+ZNAME[cl.n]+'</span><h2>Level '+cl.n+': '+esc(cl.name)+'</h2><p class="sub">'+esc(cl.range)+(cl.n===5?'':' points')+'. '+levelProg(cl).done+' of '+levelProg(cl).total+' sessions complete.</p></div></section>'
    +gameYouCard()+setupCard()
    +'<div class="kpis"><div class="kpi"><b>'+S.xp+'</b><span>Practice XP</span></div><div class="kpi"><b>'+tot+'</b><span>Steps done</span></div><div class="kpi"><b>'+stars+'</b><span>Stars</span></div><div class="kpi"><b>'+(S.streak.best||0)+'</b><span>Best streak</span></div></div>'
    +'<h2 class="sh">Zed forms <span class="cnt">'+cl.n+' of 5</span></h2><div class="cast">'+LEVELS.map(function(lv){ var on=lv.n<=cl.n; return '<div class="cast-i'+(on?' on':' off')+(lv.n===cl.n?' cur':'')+'" data-lv="'+lv.n+'">'+(on?zed(lv.n,'happy',58):zed(lv.n,'sleep',58,'zlock'))+'<b>Level '+lv.n+'</b><span>'+esc(lv.name)+'</span></div>'; }).join('')+'</div>'
    +learnHealth()+'<h2 class="sh">Badges <span class="cnt">'+earned+' of '+BADGES.length+'</span></h2><div class="bgrid">'
    +BADGES.map(function(b){ var e=S.badges[b.id], hv=Math.min(b.have(),b.need); return '<div class="badge'+(e?' on':'')+'"'+(b.level?' data-lv="'+b.level+'"':'')+'><span class="bi">'+ic(b.icon)+'</span><b>'+esc(b.name)+'</b><span class="bd">'+esc(b.desc)+'</span>'+(e?'<span class="bs">Earned '+e+'</span>':'<span class="bs">'+hv+' of '+b.need+'</span>')+'</div>'; }).join('')+'</div>'
    +'<h2 class="sh">Settings</h2><section class="card set"><div class="tr"><span>Daily goal</span><span class="segctl" role="group" aria-label="Daily goal in XP">'+[20,30,50].map(function(g){ return '<button data-goal="'+g+'" aria-pressed="'+(S.goal===g)+'">'+g+' XP</button>'; }).join('')+'</span></div>'
    +'<div class="tr stack"><span>Theme<small>Follows your device unless you choose.</small></span><span class="segctl" role="group" aria-label="Theme">'+[['auto','Auto'],['light','Light'],['dark','Dark']].map(function(o){ var on=(S.theme||'auto')===o[0]; return '<button data-theme-set="'+o[0]+'" aria-pressed="'+on+'">'+o[1]+'</button>'; }).join('')+'</span></div>'
    +'<div class="tr"><span>Preview mode<small>Unlock every session. For instructors and for reading ahead.</small></span><button class="seg1" id="prev" aria-pressed="'+S.preview+'">'+(S.preview?'On':'Off')+'</button></div>'
    +'<div class="tr"><span>Progress report<small>Copy a summary to send to your instructor.</small></span><button class="btn ghost" id="rep">Copy report</button></div><div id="repbox"></div>'
    +'<div class="tr stack"><span>Back up<small>Copy a backup code, or paste one to restore it here or on another device.</small></span><span class="duo"><button class="btn ghost" id="bkCopy">Copy code</button><button class="btn ghost" id="bkOpen">Restore</button></span></div><div id="bkbox"></div>'
    +'<div class="tr"><span>Reset<small>Erases XP, streak, badges and your logs in this browser.</small></span><button class="btn ghost danger" id="reset">Reset progress</button></div>'
    +'<p class="fine">'+(canSave?'Progress saves in this browser only.':'Progress is not saved in this view.')+' XP, stars and badges are practice. Course points come from your instructor.</p></section></div>';
  setPage(h,'you'); bindGameYou();
  $$('[data-goal]').forEach(function(b){ b.onclick=function(){ S.goal=+b.getAttribute('data-goal'); save(); youView(); }; });
  $$('[data-theme-set]').forEach(function(b){ b.onclick=function(){ S.theme=b.getAttribute('data-theme-set'); save(); applyTheme(); youView(); }; });
  var oe=$('#obEdit'); if(oe) oe.onclick=function(){ ob.step=0; go({name:'onboard'}); };
  var pg2=$('#plGo'); if(pg2) pg2.onclick=function(){ go({name:'place'}); };
  $('#prev').onclick=function(){ S.preview=!S.preview; save(); youView(); };
  $('#rep').onclick=function(){ copyText(reportText(), $('#repbox')); };
  $('#bkCopy').onclick=function(){ copyText(backupCode(), $('#bkbox')); };
  $('#bkOpen').onclick=function(){
    var bx=$('#bkbox'); bx.innerHTML='<div class="bkr"><label for="bkIn">Paste your backup code</label><textarea id="bkIn" class="copybox" spellcheck="false" autocomplete="off"></textarea><p class="hint" id="bkMsg" role="status"></p><button class="btn" id="bkGo">Restore progress</button></div>';
    $('#bkIn').focus();
    $('#bkGo').onclick=function(){
      var msg=$('#bkMsg'), v=$('#bkIn').value;
      if(S.xp>0 && $('#bkGo').getAttribute('data-sure')!=='1'){ $('#bkGo').setAttribute('data-sure','1'); $('#bkGo').textContent='Tap again to replace what is here'; msg.textContent='This replaces the progress in this browser.'; return; }
      var err=restoreFrom(v); if(err){ msg.textContent=err; $('#bkGo').removeAttribute('data-sure'); $('#bkGo').textContent='Restore progress'; return; }
      toast('Progress restored'); go({name:'learn'});
    };
  };
  var rs=$('#reset'); rs.onclick=function(){ if(rs.getAttribute('data-sure')!=='1'){ rs.setAttribute('data-sure','1'); rs.textContent='Tap again to erase'; return; } S=blank(); save(); applyTheme(); go({name:'learn'}); };
}


/* ---- back up and restore progress (it lives in this browser only) ---- */
function b64enc(s){ var b=new TextEncoder().encode(s), r=''; for(var i=0;i<b.length;i++) r+=String.fromCharCode(b[i]); return btoa(r); }
function b64dec(s){ var r=atob(s), b=new Uint8Array(r.length); for(var i=0;i<r.length;i++) b[i]=r.charCodeAt(i); return new TextDecoder().decode(b); }
function backupCode(){ return 'Z100.1.'+b64enc(JSON.stringify(S)); }
function restoreFrom(code){
  var m=/^\s*Z100\.1\.([A-Za-z0-9+\/=]+)\s*$/.exec(code||'');
  if(!m) return 'That is not a backup code. A code starts with Z100.1.';
  var o; try{ o=JSON.parse(b64dec(m[1])); }catch(e){ return 'The code is damaged. Copy it again, all of it.'; }
  if(!o || typeof o!=='object' || typeof o.xp!=='number' || !o.done || typeof o.done!=='object' || Array.isArray(o.done)) return 'That code does not hold progress from this course.';
  S=Object.assign(blank(),o); save(); applyTheme(); return '';
}

/* ================= LESSON ENGINE ================= */
var GRADED = {mcq:1, fill:1, match:1, order:1};
function startLesson(n, ids, review, opts){
  opts=opts||{};
  var items = review ? ids.map(function(id){ return ITEMS[id]; }) : nodeItems(n);
  if(!items.length){
    if(n.dyn==='warmup'){ S.done[n.id]={stars:0, at:today(), auto:1}; save(); return go({name:'session', sid:n.sid}); }
    return toast('There is nothing to practise here yet.');
  }
  var order = (review || n.kind==='practice') ? shuffle(items) : items.slice();
  var teachOnly = items.filter(function(i){ return i.type==='teach'; }).length;
  L = {node:n, items:items, queue:order.slice(), mistakes:0, first:0, xp:0, correct:{}, phase:'intro', cur:null, review:!!review, tries:{}, combo:0, best:0, cleared:0,
       graded:items.filter(function(i){ return GRADED[i.type]; }).length, screens:items.length, teachOnly:teachOnly, soft:(n.kind==='learn'||n.kind==='demo'||n.kind==='field'),
       conf:!!(CONF[n.kind]||opts.conf), due:!!opts.due, obj:{}, postOK:0, animKey:'', expl:null};
  go({name:'lesson'});
}
function startReview(){
  var ids=shuffle(S.missed.filter(function(id){ return ITEMS[id]; })).slice(0,8);
  if(!ids.length) return;
  startLesson({id:'review', sid:null, k:'R', title:'Review', kind:'review', level:currentLevel().n}, ids, true);
}
function prep(id){
  var it=ITEMS[id], c={id:id, item:it, checked:false, ok:null};
  if(it.type==='mcq'){ c.opts = it.fixed ? it.options.slice() : shuffle(it.options); c.sel=null; c.conf=null; c.hinted=false; }
  else if(it.type==='fill'){ c.vals=it.answers.map(function(){return '';}); c.focus=true; }
  else if(it.type==='match'){ c.right=shuffle(it.pairs.map(function(p,i){ return {t:p[1],o:i}; })); c.done={}; c.selL=null; c.selR=null; c.wrong=0; c.flash=null; }
  else if(it.type==='order'){ c.shuf=shuffle(it.steps.map(function(s,i){ return i; })); c.placed=[]; c.wrong=0; c.flash=null; }
  else if(it.type==='flash'){ c.flipped=false; }
  else if(it.type==='explain'){ c.text=''; c.revealed=false; c.pts=[]; }
  else if(it.type==='mission'){ c.m=missionNew(it); c.best=0; }
  return c;
}
function nextItem(){
  if(!L.queue.length) return finish();
  var it=L.queue.shift(); L.cur=prep(it.id); L.phase='q'; render();
}
function progressPct(){ var d=Object.keys(L.correct).length; return Math.min(100,Math.round(d/L.items.length*100)); }
function recordMiss(id){ if(S.missed.indexOf(id)<0) S.missed.push(id); }
function baseXP(it){
  if(it.type==='flash') return 2;
  var k=L.node.kind;
  if(k==='pretest') return 2; if(k==='apply') return 8; if(k==='master') return 12; if(k==='warmup'||k==='checkpoint') return 6;
  return L.soft?5:10;
}
function award(c, firstTry){
  var id=c.id, base=baseXP(c.item), full=firstTry&&!c.hinted;
  if(!L.correct[id]){ L.correct[id]=1; L.xp += L.review?3:(full?base:Math.ceil(base/2)); if(firstTry && GRADED[c.item.type]) L.first++; L.combo++; L.best=Math.max(L.best,L.combo); }
  if(firstTry || L.review){ if(S.missed.indexOf(id)>=0){ S.missed=S.missed.filter(function(m){ return m!==id; }); S.cleared=(S.cleared||0)+1; L.cleared++; } }
}
function wrongAnswer(c){
  L.mistakes++; L.combo=0; recordMiss(c.id);
  L.tries[c.id]=(L.tries[c.id]||0)+1;
  if(L.tries[c.id]===1 && !L.review) L.queue.push(c.item);
  else if(L.review && L.tries[c.id]===1) L.queue.push(c.item);
}
function check(){
  var c=L.cur, it=c.item; if(c.checked) return;
  if(it.type==='mcq'){ if(!c.sel) return; if(L.conf && !c.conf) return; c.ok = c.sel===it.key; }
  else if(it.type==='fill'){ c.ok = it.answers.every(function(a,i){ return it.numeric ? num(a)===num(c.vals[i]) : norm(a)===norm(c.vals[i]); }); }
  c.checked=true;
  var firstTry=!L.tries[c.id];
  if(L.node.kind==='pretest'){ L.correct[c.id]=1; L.xp+=baseXP(it); if(c.ok) L.first++; L.combo=c.ok?L.combo+1:0; }
  else if(L.node.kind==='placement'){ L.correct[c.id]=1; var pl=L.pl[SBY[it.node.split('-')[0]].level]; pl[1]++; if(c.ok){ pl[0]++; L.first++; } L.combo=c.ok?L.combo+1:0; L.best=Math.max(L.best,L.combo); }
  else { if(c.ok) award(c, firstTry); else wrongAnswer(c); if(firstTry) record(c); }
  save(); render();
}
function starsFor(){
  if(L.node.kind==='mission') return L.mstars||1;
  if(!L.graded) return 0;
  var acc=L.first/L.graded; return acc>=0.9?3:acc>=0.7?2:1;
}
function finish(){
  if(L.node.kind==='placement') return finishPlacement();
  var k=L.node.kind, star = (!L.review && STAR_KINDS[k]) ? starsFor() : 0;
  if(k==='mission' && !L.review && !isDone(L.node.id)) S.sparks=(S.sparks||0)+3*star;
  var flawless = L.mistakes===0 && L.graded>0 && k!=='pretest';
  if(flawless) L.xp += 5;
  var firstTime = !L.review && !isDone(L.node.id);
  L.passed=true;
  if(k==='master') masteryRecord();
  if(k==='pretest') S.pre[L.node.sid]={a:L.first, n:L.graded};
  if(k==='checkpoint') S.cp[L.node.level]={a:L.first, n:L.graded, at:today()};
  var award=0;
  if(firstTime||L.review){
    award = L.passed ? L.xp : Math.round(L.xp/2);
    if(k==='master' && !L.passed && L.mast && L.mast.fails>1) award=0;   // a failed check pays once, so it cannot be farmed
  }
  if(award>0 && !L.review && (S.boost||0)>0){ S.boost--; L.boosted=award; award*=2; }
  L.xpGot=award; addXP(award);
  if(!L.review && L.passed){
    var prev=S.done[L.node.id];
    S.done[L.node.id]={stars:Math.max(star, prev?prev.stars||0:0), at:today()};
  }
  if(firstTime||L.review){ if(!L.review) markAct('steps'); if(L.review||['practice','recall','apply','master','checkpoint','warmup'].indexOf(k)>=0) markAct('practice'); }
  save();
  L.stars=star; L.flawless=flawless; L.firstTime=firstTime; L.newBadges=checkBadges(); L.phase='done'; render();
}
function leave(){ if(L && L.node.sid && L.node.id!=='review') go({name:'session', sid:L.node.sid}); else go({name:'learn'}); }

/* ================= LESSON SCREENS ================= */
function playerCSS(){ return L && L.node.level ? L.node.level : 1; }
function shell(inner, foot, footCls, showProg){
  var pct = L.phase==='q' ? progressPct() : (L.phase==='done'?100:0);
  var label = L.review ? (L.due?'Due for review':'Review') : (L.node.sid ? 'Session '+SBY[L.node.sid].n+' · '+L.node.title : L.node.title);
  var head='<header class="phead"><button class="icon-btn" id="quit" aria-label="'+(L.phase==='q'?'Quit this step':'Back')+'">'+ic('close')+'</button><div class="pmid"><span class="plabel">'+esc(label)+'</span>'
    +(showProg?'<div class="meter" role="progressbar" aria-label="Progress in this step" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+pct+'"><i style="width:'+pct+'%"></i></div>':'')+'</div>'
    +(showProg&&L.combo>=3?'<span class="combo" title="Right answers in a row">'+ic('bolt')+'x'+L.combo+'</span>':'<span class="combo ghost"></span>')+'</header>';
  var key=L.phase+':'+(L.phase==='q'&&L.cur?L.cur.id:''), enter=(L.animKey!==key); L.animKey=key;
  APP.innerHTML='<div class="player" data-lv="'+playerCSS()+'">'+head+'<main class="pbody"><div class="pin'+(enter?' enter':'')+'">'+inner+'</div></main><footer class="pfoot '+(footCls||'')+'" aria-live="polite"><div class="pfin">'+foot+'</div></footer></div>';
  $('#quit').onclick=function(){ if(L.phase==='q') confirmQuit(); else leave(); };
  bindDiagrams();
}
function confirmQuit(){
  var m=document.createElement('div'); m.className='modal'; m.setAttribute('role','dialog'); m.setAttribute('aria-modal','true'); m.setAttribute('aria-label','Quit this step');
  m.innerHTML='<div class="card"><h2>Quit this step?</h2><p>You lose the progress in this step. Questions you missed stay on your review list.</p><button class="btn wide" id="stay">Keep going</button><button class="btn ghost wide" id="quitok">Quit</button></div>';
  document.body.appendChild(m);
  var release=trapFocus(m,function(){ stay(); });
  function stay(){ release(); m.remove(); }
  $('#stay').onclick=stay; $('#quitok').onclick=function(){ release(); m.remove(); leave(); }; $('#stay').focus();
}
function lessonView(){
  if(L.phase==='intro') return intro();
  if(L.phase==='done') return doneScreen();
  var c=L.cur, it=c.item, r=({teach:scrTeach, mcq:scrMcq, fill:scrFill, match:scrMatch, order:scrOrder, flash:scrFlash, explain:scrExplain, mission:scrMission})[it.type](c);
  shell(r.body, r.foot, r.fcls, it.type!=='mission'); bindLesson(); if(it.type==='mission') bindMission(c);
}
function scrTeach(c){
  var it=c.item, kick=L.node.kind==='demo'?'See it':L.node.kind==='field'?'From the sources':'Learn';
  var b='<p class="kicker">'+kick+'</p><h1 class="bigt">'+esc(it.title)+'</h1>';
  if(it.blocks) b+='<div class="rich">'+it.blocks.map(blockHTML).join('')+'</div>';
  else {
    if(it.paras) b+='<div class="paras">'+it.paras.map(function(p){ return '<p>'+inl(p)+'</p>'; }).join('')+'</div>';
    if(it.flow) b+='<ol class="flow">'+it.flow.map(function(f){ return '<li>'+inl(f)+'</li>'; }).join('')+'</ol>';
    if(it.note) b+='<p class="figcap">'+inl(it.note)+'</p>';
    if(it.table) b+=blockHTML(Object.assign({t:'table'}, it.table));
    if(it.bullets) b+='<ul class="blist">'+it.bullets.map(function(x){ return '<li>'+inl(x)+'</li>'; }).join('')+'</ul>';
    if(it.callout) b+='<p class="callout">'+inl(it.callout)+'</p>';
    if(it.tag) b+='<p class="tagnote">'+inl(it.tag)+'</p>';
  }
  return {body:b, foot:'<button class="btn wide" id="primary">Continue</button>'};
}
function fbz(ok){
  var lvl=(L&&L.node&&L.node.level)||zLv();
  return '<span class="fbz">'+zed(lvl, ok?(L.combo>=3?'cheer':'happy'):'oops', 58)+(ok?'':smudge(30))+'</span>';
}
function feedback(c, why, ans){
  var tries=L.tries[c.id];
  return {fcls:c.ok?'good':'bad', foot:'<div class="fb">'+fbz(c.ok)+'<div class="verdict"><strong>'+(c.ok?(L.combo>=3?'Correct, '+L.combo+' in a row':'Correct'):'Not quite')+'</strong>'
    +(c.ok||!ans?'':'<p class="ans">Answer: '+esc(ans)+'</p>')+(why?'<p>'+esc(why)+'</p>':'')+calibLine(c)
    +(!c.ok&&tries===1?'<p class="again">It comes back once before this step ends.</p>':'')+'</div></div><button class="btn '+(c.ok?'good':'bad')+' wide" id="primary">Continue</button>'};
}
function scrMcq(c){
  var it=c.item, pre=L.node.kind==='pretest', hs=it.node?it.node.split('-')[0]:null;
  var recall = !pre && (L.review || L.node.kind==='warmup' || L.node.kind==='checkpoint' || (hs && L.node.sid && hs!==L.node.sid));
  var kick = recall ? (hs&&SBY[hs] ? 'From session '+SBY[hs].n+', from memory' : 'From memory') : (it.predict && !pre) ? 'Retrieval' : (it.kicker||'Choose the best answer');
  if(L.node.kind==='placement') kick='Placement check · Level '+SBY[hs].level;
  var body='<p class="kicker">'+esc(kick)+'</p><h1 class="stem">'+esc(it.stem)+'</h1><div class="opts" role="group" aria-label="Answers">'
    + c.opts.map(function(o,i){
        var cl='opt'+(c.checked ? (o.k===it.key?' right':(o.k===c.sel?' wrong':'')) : (o.k===c.sel?' sel':''));
        return '<button class="'+cl+'" data-k="'+o.k+'"'+(c.checked?' disabled':'')+' aria-pressed="'+(o.k===c.sel)+'"><span class="k">'+(i+1)+'</span><span>'+esc(o.t)+'</span></button>';
      }).join('')+'</div>';
  if(!c.checked && it.hint && L.node.kind==='apply' && !recall) body += c.hinted ? '<p class="hintbox"><b>Hint.</b> '+esc(it.hint)+'</p>' : '<button class="btn ghost small hintb" id="hint" type="button">Show a hint (half XP)</button>';
  if(L.conf) body+=confHTML(c);
  if(!c.checked){
    var ready=c.sel&&(!L.conf||c.conf);
    return {body:body, foot:'<button class="btn wide" id="primary"'+(ready?'':' disabled')+'>'+(pre?'Lock in my guess':'Check')+'</button>'};
  }
  var ans=it.options.filter(function(o){ return o.k===it.key; })[0].t, f=pre?feedbackPredict(c, it.why, ans):L.node.kind==='placement'?feedbackPlace(c, it.why, ans):feedback(c, it.why, ans);
  return {body:body, foot:f.foot, fcls:f.fcls};
}
function scrFill(c){
  var it=c.item, parts=it.stem.split('____'), s='';
  parts.forEach(function(p,i){
    s+=esc(p);
    if(i<parts.length-1){
      var okv = it.numeric ? num(it.answers[i])===num(c.vals[i]) : norm(it.answers[i])===norm(c.vals[i]);
      var cl=c.checked?(okv?' right':' wrong'):'';
      s+='<input class="blank'+cl+'" data-i="'+i+'" aria-label="Blank '+(i+1)+'" autocomplete="off" autocapitalize="off" spellcheck="false"'+(it.numeric?' inputmode="decimal"':'')+' value="'+esc(c.vals[i])+'"'+(c.checked?' disabled':'')+'>';
    }
  });
  var body='<p class="kicker">'+(it.numeric?'Type the number':'Type the missing word'+(it.answers.length>1?'s':''))+'</p><p class="sentence">'+s+'</p>';
  if(!c.checked) return {body:body, foot:'<button class="btn wide" id="primary"'+(c.vals.every(function(v){ return v.trim(); })?'':' disabled')+'>Check</button>'};
  var full=parts.reduce(function(a,p,i){ return a+p+(i<it.answers.length?it.answers[i]:''); },'');
  var f=feedback(c, it.why || full, c.ok?null:it.answers.join(', '));
  return {body:body, foot:f.foot, fcls:f.fcls};
}
function scrMatch(c){
  var it=c.item, allDone=Object.keys(c.done).length===it.pairs.length; c.allDone=allDone;
  var body='<p class="kicker">Tap a pair</p><h1 class="stem">'+esc(it.prompt)+'</h1><div class="pairs"><div class="col">'
    + it.pairs.map(function(p,i){ var cl='m'+(c.done[i]?' ok':'')+(c.selL===i?' sel':'')+(c.flash&&c.flash.l===i?' bad':''); return '<button class="'+cl+'" data-l="'+i+'"'+(c.done[i]?' disabled':'')+'>'+esc(p[0])+'</button>'; }).join('')
    +'</div><div class="col">'
    + c.right.map(function(r){ var cl='m'+(c.done[r.o]?' ok':'')+(c.selR===r.o?' sel':'')+(c.flash&&c.flash.r===r.o?' bad':''); return '<button class="'+cl+'" data-r="'+r.o+'"'+(c.done[r.o]?' disabled':'')+'>'+esc(r.t)+'</button>'; }).join('')
    +'</div></div>';
  if(allDone) return {body:body, fcls:'good', foot:'<div class="fb">'+fbz(!c.wrong)+'<div class="verdict"><strong>'+(c.wrong?'All matched':'Every pair right')+'</strong></div></div><button class="btn good wide" id="primary">Continue</button>'};
  return {body:body, foot:'<button class="btn wide" id="primary" disabled>Continue</button>'};
}
function scrOrder(c){
  var it=c.item, left=c.shuf.filter(function(i){ return c.placed.indexOf(i)<0; }), done=c.placed.length===it.steps.length;
  var body='<p class="kicker">Tap the steps in order</p><h1 class="stem">'+esc(it.prompt)+'</h1>'
    +(c.placed.length?'<ol class="placed" aria-label="Placed steps">'+c.placed.map(function(i,pos){ return '<li><b>'+(pos+1)+'</b><span>'+esc(it.steps[i])+'</span></li>'; }).join('')+'</ol>':'')
    +(left.length?'<div class="opts">'+left.map(function(i){ return '<button class="opt'+(c.flash===i?' wrong':'')+'" data-o="'+i+'"><span>'+esc(it.steps[i])+'</span></button>'; }).join('')+'</div>':'');
  if(done) return {body:body, fcls:'good', foot:'<div class="fb">'+fbz(!c.wrong)+'<div class="verdict"><strong>'+(c.wrong?'That is the order':'Right order, first time')+'</strong>'+(it.why?'<p>'+esc(it.why)+'</p>':'')+'</div></div><button class="btn good wide" id="primary">Continue</button>'};
  return {body:body, foot:'<button class="btn wide" id="primary" disabled>Continue</button>'};
}
function scrFlash(c){
  var it=c.item;
  var body='<p class="kicker">Flashcard</p><div class="fcard"><p class="term">'+esc(it.term)+'</p>'
    +(c.flipped?'<p class="mean">'+inl(it.meaning)+'</p>'+(it.hook?'<p class="hook">Think of it as: '+esc(it.hook)+'</p>':''):'<p class="hook">Say what it means, then check.</p>')+'</div>';
  if(!c.flipped) return {body:body, foot:'<button class="btn ghost wide" id="primary">Show meaning</button>'};
  return {body:body, foot:'<div class="duo"><button class="btn ghost" id="again">Again</button><button class="btn" id="primary">Got it</button></div>'};
}
function bindLesson(){
  bindRefs();
  var c=L.cur, it=c.item, p=$('#primary');
  if(it.type==='teach' && p) p.onclick=function(){ L.correct[c.id]=1; nextItem(); };
  if(it.type==='mcq'){
    if(p) p.onclick=function(){ if(c.checked) nextItem(); else check(); };
    if(!c.checked){
      $$('.opt').forEach(function(b){ b.onclick=function(){ c.sel=b.getAttribute('data-k'); render(); }; });
      $$('[data-conf]').forEach(function(b){ b.onclick=function(){ c.conf=b.getAttribute('data-conf'); render(); }; });
      var hb=$('#hint'); if(hb) hb.onclick=function(){ c.hinted=true; S.hints=(S.hints||0)+1; save(); render(); };
    }
  }
  if(it.type==='explain'){
    var ta=$('#expl');
    if(!c.revealed){
      var upd=function(){ var w=words(ta.value); c.text=ta.value; $('#wc').textContent='The model answer opens after at least 20 words. You have '+w+'.'; p.disabled=w<20; };
      ta.oninput=upd; upd();
      p.onclick=function(){ c.text=ta.value; c.revealed=true; render(); window.scrollTo(0,document.body.scrollHeight); };
    } else {
      $$('[data-pt]').forEach(function(cb){ cb.onchange=function(){ c.pts[+cb.getAttribute('data-pt')]=cb.checked; }; });
      p.onclick=function(){
        var got=it.points.filter(function(x,i){ return c.pts[i]; }).length;
        S.expl[c.id]={n:got, of:it.points.length, at:today(), text:c.text};
        L.expl={n:got, of:it.points.length};
        if(!L.correct[c.id]){ L.correct[c.id]=1; L.xp+=8; }
        save(); nextItem();
      };
    }
  }
  if(it.type==='fill'){
    if(p) p.onclick=function(){ if(c.checked) nextItem(); else check(); };
    var ins=$$('.blank');
    ins.forEach(function(inp){ inp.oninput=function(){ c.vals[+inp.getAttribute('data-i')]=inp.value; var pb=$('#primary'); if(pb) pb.disabled=!c.vals.every(function(v){return v.trim();}); }; });
    if(c.focus&&!c.checked&&ins[0]){ c.focus=false; ins[0].focus(); }
  }
  if(it.type==='match'){
    if(p) p.onclick=nextItem;
    if(!c.allDone){
      $$('[data-l]').forEach(function(b){ b.onclick=function(){ pick('L', +b.getAttribute('data-l')); }; });
      $$('[data-r]').forEach(function(b){ b.onclick=function(){ pick('R', +b.getAttribute('data-r')); }; });
    }
  }
  if(it.type==='order'){ if(p) p.onclick=nextItem; $$('[data-o]').forEach(function(b){ b.onclick=function(){ place(+b.getAttribute('data-o')); }; }); }
  if(it.type==='flash'){
    if(!c.flipped){ p.onclick=function(){ c.flipped=true; render(); }; }
    else {
      p.onclick=function(){ if(!L.correct[c.id]){ L.correct[c.id]=1; L.xp+=(c.again?0:2); if(!c.again) L.first++; } nextItem(); };
      $('#again').onclick=function(){ c.again=true; L.tries[c.id]=(L.tries[c.id]||0)+1; if(L.tries[c.id]<=2) L.queue.push(c.item); else L.correct[c.id]=1; nextItem(); };
    }
  }
}
function groupDone(c){
  c.checked=true; c.ok=true;
  if(c.wrong===0) award(c,true); else if(!L.correct[c.id]){ L.correct[c.id]=1; L.xp+=Math.ceil(baseXP(c.item)/2); }
  if(L.review && S.missed.indexOf(c.id)>=0){ S.missed=S.missed.filter(function(m){ return m!==c.id; }); S.cleared=(S.cleared||0)+1; L.cleared++; }
  save();
}
function pick(side, v){
  var c=L.cur;
  if(side==='L') c.selL=(c.selL===v)?null:v; else c.selR=(c.selR===v)?null:v;
  if(c.selL!==null && c.selR!==null){
    var l=c.selL, r=c.selR;
    if(l===r){ c.done[l]=1; c.selL=c.selR=null; }
    else { c.wrong++; L.mistakes++; L.combo=0; recordMiss(c.id); c.flash={l:l,r:r}; c.selL=c.selR=null; render(); setTimeout(function(){ if(L && L.cur===c){ c.flash=null; render(); } },450); return; }
  }
  if(Object.keys(c.done).length===c.item.pairs.length) groupDone(c);
  render();
}
function place(i){
  var c=L.cur;
  if(i===c.placed.length) c.placed.push(i);
  else { c.wrong++; L.mistakes++; L.combo=0; recordMiss(c.id); c.flash=i; render(); setTimeout(function(){ if(L && L.cur===c){ c.flash=null; render(); } },450); return; }
  if(c.placed.length===c.item.steps.length) groupDone(c);
  render();
}
function intro(){
  var n=L.node, s=n.sid?SBY[n.sid]:null, k=n.kind, title, kicker, text;
  if(L.review){ title=L.due?'Due for review':'Review'; kicker=L.due?'Spaced review':'Missed questions'; text=L.due?'Questions from earlier sessions that are due again. Answer from memory, then say how sure you were.':'Questions you got wrong earlier. Answer each one correctly to clear it from your list.'; }
  else if(k==='placement'){ title='Placement check'; kicker='Skip ahead'; text='Answer from what you already know. You pass a level with 3 of 4 right, and you start at the first level you do not pass.'; }
  else { title=n.title; kicker=KIND[k]+' · Session '+s.n; text=nodeBlurb(n); }
  var screens=L.items.length, mins=L.review?Math.max(2,Math.round(screens*0.5)):estMin(n), facts='';
  if(k==='placement') facts='<li>'+screens+' questions, about '+Math.max(2,Math.round(screens*0.5))+' min</li><li>Nothing is marked complete and nothing is locked. Your answers earn no XP.</li>';
  else if(k==='pretest') facts='<li>'+screens+' questions, about '+mins+' min</li><li>Your score here does not count. Guessing first makes the answer stick when you learn it.</li>';
  else if(k==='master') facts='<li>'+screens+' screens, about '+mins+' min</li><li>Pass mark: '+n.need+' of '+n.graded+' right on the first try. Rate how sure you are on each answer.</li><li>No hints. If you miss, you see exactly which outcomes to revisit and try again.</li>';
  else if(k==='warmup'||L.due) facts='<li>'+screens+(screens===1?' question':' questions')+', about '+mins+' min</li><li>Answer from memory, then rate how sure you were. Questions you miss come back sooner.</li>';
  else if(k==='checkpoint') facts='<li>'+screens+' questions, about '+mins+' min</li><li>Mixed from every session of this level. What you miss comes back in later warm-ups.</li>';
  else facts='<li>'+screens+(screens===1?' screen':' screens')+', about '+mins+' min</li>'+(L.graded?'<li>'+L.graded+' to answer'+(/review list/.test(text||'')?'':'. A missed question returns once and joins your review list')+'.</li>':'')
    +(STAR_KINDS[k]?'<li>Stars: 3 for 90% right the first time, 2 for 70%.</li>':'')+(k==='apply'?'<li>A hint is available on each scenario. It halves the XP.</li>':'');
  var body='<div class="introz"><div><p class="kicker">'+esc(kicker)+'</p><h1 class="bigt">'+esc(title)+'</h1></div>'+zed(n.level||zLv(), L.review?'think':'wink', 92)+'</div><p class="lede">'+esc(text)+'</p>'
    +'<ul class="facts-l">'+facts+'</ul>'
    +(s&&!L.review&&n.kind!=='placement'?phaseStrip(s):'')
    +(s?'<button class="btn ghost" id="sheet" style="justify-self:start">'+ic('doc')+'Study sheet</button>':'');
  shell(body,'<button class="btn wide" id="primary">Start</button>','',false);
  $('#primary').onclick=nextItem;
  var sb=$('#sheet'); if(sb) sb.onclick=function(){ go({name:'sheet', sid:s.id, from:{name:'session', sid:s.id}}); };
}
function nextStepFrom(n){ return n && n.sid && n.id!=='review' ? nextInSession(n.sid, n.id) : null; }
function confetti(){
  var cols=['var(--c0)','var(--c1)','var(--c2)','var(--c3)','var(--c4)','var(--c5)'], h='<span class="confetti" aria-hidden="true">';
  for(var i=0;i<34;i++) h+='<i style="left:'+Math.round(Math.random()*100)+'%;background:'+cols[i%6]+';--dx:'+Math.round(Math.random()*160-80)+'px;--rot:'+Math.round(Math.random()*720-360)+'deg;animation-delay:'+(Math.random()*.6).toFixed(2)+'s"></i>';
  return h+'</span>';
}
function doneBlock(o){
  // shared completion screen for lessons, tasks, cases and exits
  var nb=o.badges||[];
  return (o.confetti?confetti():'')+'<div class="center done">'+(o.hero||('<span class="zhero">'+zed(o.lv||zLv(), o.mood||'cheer', 150, 'hop')+'</span>'))+(o.stars!==undefined&&o.stars!==null&&o.showStars?starRow(o.stars,'big pop'):'')
    +'<h1 class="bigt">'+esc(o.title)+'</h1>'+(o.sub?'<p class="lede">'+esc(o.sub)+'</p>':'')
    +'<div class="facts">'+o.facts.map(function(f){ return '<div class="fact"><b>'+esc(f[0])+'</b><span>'+esc(f[1])+'</span></div>'; }).join('')+'</div>'
    +(o.extra||'')
    +(nb.length?'<div class="newb"><h2>Badge earned</h2>'+nb.map(function(b){ return '<div class="badge on"><span class="bi">'+ic(b.icon)+'</span><b>'+esc(b.name)+'</b><span class="bd">'+esc(b.desc)+'</span></div>'; }).join('')+'</div>':'')
    +(o.note?'<p class="hint">'+esc(o.note)+'</p>':'')+'</div>';
}
function doneScreen(){
  if(L.node.kind==='master') return masterDone();
  if(L.node.kind==='placement') return placeDone();
  var k=L.node.kind, acc=L.graded?Math.round(L.first/L.graded*100):null, showStars=!L.review&&STAR_KINDS[k];
  var title = L.review ? (L.due?'Review done':'Review done') : k==='pretest' ? 'Guesses locked in' : k==='warmup' ? 'Warm-up done' : k==='checkpoint' ? 'Checkpoint done' : showStars ? (L.stars===3?'Flawless':L.stars===2?'Solid':'Done') : 'Step complete';
  var zsub = L.review ? (L.cleared?L.cleared+(L.cleared===1?' smudge':' smudges')+' wiped off.':(L.due?'What you missed comes back sooner. Right answers wait longer each time.':'No smudges came off this round. They stay on the list.'))
    : k==='pretest' ? 'You got '+L.first+' of '+L.graded+' before learning it. The point is to notice what you do not know yet.'
    : k==='warmup' ? 'Pulling things from memory is what makes them last. What you missed comes back sooner.'
    : k==='checkpoint' ? 'Anything you missed comes back in later warm-ups. Fix it before the gate.'
    : showStars ? (L.stars===3?'Clean run. No smudges.':L.stars===2?'Solid. A few smudges went on your review list.':'Done. The smudges are on your review list.')
    : (L.mistakes?'Step complete. The smudges are on your review list.':'Step complete.');
  var facts=[['+'+(L.boosted?L.xpGot:(L.firstTime||L.review?L.xp:0)),'XP']];
  if(acc!==null && k!=='pretest') facts.push([acc+'%','First try']);
  if(k==='pretest') facts.push([L.first+' of '+L.graded,'Right before learning']);
  if(L.review) facts.push([String(L.cleared),'Cleared']); else if(L.best>=3) facts.push(['x'+L.best,'Best streak']);
  var met=(S.xpByDay[today()]||0)>=S.goal;
  var note = L.boosted?'XP booster used: this step paid double.':(!L.firstTime&&!L.review)?'Replay: XP is only awarded the first time, stars keep your best.':(L.mistakes&&k!=='pretest'?'Missed questions are on your review list.':'')+(met?(L.mistakes&&k!=='pretest'?' ':'')+'Daily goal met. Streak: '+streakNow()+(streakNow()===1?' day':' days')+'.':'');
  if(k==='mission'){ title=L.mstars===3?'Mission aced':'Mission complete'; zsub=L.mstars===3?'Every strong call made. The calls you made here are the ones to make at work.':L.mstars===2?'Solid. One or two calls cost something. The recap showed which.':'You got through it. Replay it to find the strong moves.'; facts=[['+'+(L.xpGot||0),'XP'],[L.mstars+' of 3','Stars']]; if(L.firstTime) facts.push(['+'+(3*L.mstars),'Sparks']); }
  var nx=nextStepFrom(L.node), db=(!L.review&&L.firstTime)?debrief(L.node):null;
  if(db){ title=db.title; }
  var foot=(nx?'<button class="btn wide" id="primary">Next: '+esc(nx.title)+'</button><button class="btn ghost wide" id="back">Back to session</button>':db&&db.next?'<button class="btn wide" id="primary">Start session '+db.next.n+'</button><button class="btn ghost wide" id="back">Back to session</button>':'<button class="btn wide" id="primary">Continue</button>');
  shell(doneBlock({extra:((!L.review&&L.firstTime)?phaseNote(L.node):'')+(db?db.html:''), title:title, sub:zsub, lv:L.node.level, mood:(showStars&&L.stars===1)?'happy':'cheer', stars:L.stars, showStars:showStars, facts:facts, badges:L.newBadges, note:note, confetti:(showStars&&L.stars===3)||(L.flawless&&L.graded>=5)}), foot, '', false);
  $('#primary').onclick=function(){ if(nx) openNode(nx.id); else if(db&&db.next) go({name:'session', sid:db.next.id}); else leave(); };
  var b=$('#back'); if(b) b.onclick=leave;
}

function startDue(){
  var ids=pickSpread(srsDueIds(0),10,3,true).map(function(p){ return p.id; });
  if(!ids.length) return toast('Nothing is due yet. Come back tomorrow.');
  startLesson({id:'review', sid:null, k:'R', title:'Due for review', kind:'review', level:currentLevel().n}, shuffle(ids), true, {conf:true, due:true});
}
function record(c){
  var it=c.item; if(it.type!=='mcq') return;
  srsUpdate(it, c.ok, c.conf, c.hinted);
  if(c.conf && S.conf[c.conf]) S.conf[c.conf][c.ok?0:1]++;
  if(L.node.kind==='master'){ if(it.post){ if(c.ok) L.postOK++; } else if(it.o!==undefined) L.obj[it.o]=!!c.ok; }
}
function masteryRecord(){
  var s=SBY[L.node.sid], rec=S.mast[s.id]||(S.mast[s.id]={tries:0, fails:0, best:0, of:L.graded, passed:false, at:''});
  rec.tries++; rec.best=Math.max(rec.best,L.first); rec.of=L.graded; rec.at=today();
  L.passed = L.first>=L.node.need;
  var o=S.obj[s.id]||(S.obj[s.id]=[]); Object.keys(L.obj).forEach(function(k){ o[+k]=L.obj[k]?'secure':'gap'; });
  S.post[s.id]={a:L.postOK, n:2};
  if(L.passed) rec.passed=true; else rec.fails++;
  L.mast=rec;
}
function calibLine(c){
  if(!c.conf) return '';
  if(c.conf==='sure'&&!c.ok) return '<p class="calib">Sure, but wrong. That is the most useful kind of miss, so it comes back sooner.</p>';
  if(c.conf==='guess'&&c.ok) return '<p class="calib">Right, but a guess. It is not secure yet, so it comes back.</p>';
  if(c.conf==='sure'&&c.ok) return '<p class="calib good">Sure and right.</p>';
  return '';
}
function feedbackPredict(c, why, ans){
  return {fcls:'info', foot:'<div class="fb"><span class="fbz">'+zed(L.node.level, c.ok?'happy':'think', 58)+'</span><div class="verdict"><strong>'+(c.ok?'Good guess':'Not yet, and that is fine')+'</strong>'
    +(c.ok?'':'<p class="ans">Answer: '+esc(ans)+'</p>')+(why?'<p>'+esc(why)+'</p>':'')+'<p class="again">The same question comes back in the mastery check at the end of this session.</p></div></div><button class="btn wide" id="primary">Continue</button>'};
}
function confHTML(c){
  var o=[['guess','Guess'],['think','Think so'],['sure','Sure']];
  return '<div class="conf" role="group" aria-label="How sure are you?"><span class="conf-l">How sure are you?</span>'
    +o.map(function(x){ return '<button type="button" class="chip'+(c.conf===x[0]?' on':'')+'" data-conf="'+x[0]+'"'+(c.checked?' disabled':'')+' aria-pressed="'+(c.conf===x[0])+'">'+x[1]+'</button>'; }).join('')+'</div>';
}
function scrExplain(c){
  var it=c.item;
  var body='<p class="kicker">Teach it back</p><h1 class="stem">'+esc(it.prompt)+'</h1>'
    +'<p class="hint">Write two to four sentences, as if to a colleague who missed this session. No notes. Then compare with the model answer.</p>'
    +'<div class="fld"><label for="expl">Your explanation</label><textarea id="expl"'+(c.revealed?' readonly':'')+'>'+esc(c.text)+'</textarea></div>';
  if(!c.revealed) return {body:body+'<p class="hint" id="wc"></p>', foot:'<button class="btn wide" id="primary" disabled>Show the model answer</button>'};
  body+='<div class="model"><h2>Model answer</h2><p>'+esc(it.model)+'</p></div><h2 class="sh">What did your answer cover?</h2><div class="gatelist">'
    +it.points.map(function(p,i){ return '<label class="chk"><input type="checkbox" data-pt="'+i+'"'+(c.pts[i]?' checked':'')+'><div><b>'+esc(p)+'</b></div></label>'; }).join('')+'</div>'
    +'<p class="hint">Anything unticked is a gap. Note it, then look at it again in the study sheet.</p>';
  return {body:body, foot:'<button class="btn wide" id="primary">Continue</button>'};
}
function continueAnyway(){
  var n=L.node; S.done[n.id]={stars:0, at:today(), unmastered:1}; save();
  var nx=nextInSession(n.sid, n.id); if(nx) openNode(nx.id); else leave();
}
function masterDone(){
  var n=L.node, s=SBY[n.sid], rec=L.mast, acc=Math.round(L.first/L.graded*100), nx=nextStepFrom(n);
  var st=S.obj[s.id]||[];
  var objs='<ul class="objs" aria-label="Outcome status">'+s.outcomes.map(function(o,i){
    var v=st[i]; return '<li class="obj '+(v||'')+'"><span class="oi">'+ic(v==='secure'?'check':'close')+'</span><span>'+inl(o)+'<small>'+(v==='secure'?'Secure: right the first time':'Revisit: missed on the first try')+'</small></span></li>'; }).join('')+'</ul>';
  var pre=S.pre[s.id], post=S.post[s.id], facts=[['+'+(L.xpGot||0),'XP'],[acc+'%','First try']];
  if(pre&&post) facts.push([pre.a+' to '+post.a,'Guess-first, before and after']);
  if(L.expl) facts.push([L.expl.n+' of '+L.expl.of,'Teach-back points']);
  if(L.passed){
    var muddy='<div class="fld muddy"><label for="muddy">Muddiest point: what is still unclear? (optional)</label><textarea id="muddy" placeholder="Leave empty if nothing.">'+esc(S.muddy[s.id]||'')+'</textarea></div>';
    var foot=(nx?'<button class="btn wide" id="primary">Next: '+esc(nx.title)+'</button><button class="btn ghost wide" id="back">Back to session</button>':'<button class="btn wide" id="primary">Continue</button>');
    shell(doneBlock({title:'Mastered', sub:'You got '+L.first+' of '+L.graded+' right on the first try. The questions come back later so it stays secure.', lv:n.level, mood:'cheer', facts:facts, extra:(L.firstTime?phaseNote(n):'')+objs+'<p class="todaynote"><b>Use it today.</b> '+esc(s.today)+'</p>'+muddy, badges:L.newBadges, confetti:true,
      note:(L.firstTime?'':'Replay: XP is only awarded the first time.')}), foot, '', false);
    var mu=$('#muddy'); if(mu) mu.oninput=function(){ S.muddy[s.id]=mu.value; save(); };
    $('#primary').onclick=function(){ if(nx) openNode(nx.id); else leave(); };
    var b=$('#back'); if(b) b.onclick=leave;
  } else {
    var foot2='<button class="btn wide" id="primary">Try the check again</button><button class="btn ghost wide" id="sheet2">Review the study sheet</button>'+(rec.fails>=2?'<button class="btn ghost wide" id="skip">Continue anyway and revisit later</button>':'');
    shell(doneBlock({title:'Not mastered yet', sub:'You got '+L.first+' of '+L.graded+' right on the first try. The pass mark is '+n.need+'. The outcomes below need another look, then try again.', lv:n.level, mood:'think', facts:facts, extra:objs,
      note:rec.fails>=2?'You can continue now. What you missed returns in later warm-ups.':'Review the sheet, then try again. The questions are the same outcomes, with the answers in a new order.'}), foot2, '', false);
    $('#primary').onclick=function(){ startLesson(n); };
    $('#sheet2').onclick=function(){ go({name:'sheet', sid:s.id, from:{name:'session', sid:s.id}}); };
    var sk=$('#skip'); if(sk) sk.onclick=continueAnyway;
  }
}
function masteryChip(s){ var r=S.mast[s.id]; if(r&&r.passed) return '<span class="chipm ok">'+ic('check')+'Mastered</span>'; if(r&&r.tries) return '<span class="chipm">Mastery pending</span>'; return ''; }

/* ================= EXERCISE LOG ================= */
function fieldOK(f, v){ if(f.optional) return true; if(f.type==='select'||f.type==='score') return !!v; return words(v)>=(f.min||1); }
function taskRows(part){ if(part.kind==='checks') return part.items.length; return part.rows ? part.rows.length : part.count; }
function rowLabel(part, r){ if(part.rows) return part.rows[r].label; return part.count>1 ? part.rowlabel+' '+(r+1) : part.rowlabel; }
function taskVal(st, p, r, k){ return ((st[p]||{})[r]||{})[k]||''; }
function taskStats(T, st){
  var tot=0, ok=0;
  T.parts.forEach(function(part){
    if(part.kind==='checks'){ part.items.forEach(function(x,i){ tot++; if(taskVal(st,part.id,i,'c')) ok++; }); return; }
    for(var r=0;r<taskRows(part);r++) part.fields.forEach(function(f){ if(f.optional) return; tot++; if(fieldOK(f, taskVal(st,part.id,r,f.k))) ok++; });
  });
  return {tot:tot, ok:ok};
}
function fieldHTML(f, id, v){
  var lab='<label for="'+id+'">'+esc(f.label)+'</label>';
  if(f.type==='area') return '<div class="fld">'+lab+'<textarea id="'+id+'" data-k="'+f.k+'">'+esc(v)+'</textarea></div>';
  if(f.type==='select') return '<div class="fld">'+lab+'<select id="'+id+'" data-k="'+f.k+'"><option value="">Choose</option>'+f.options.map(function(o){ return '<option'+(o===v?' selected':'')+'>'+esc(o)+'</option>'; }).join('')+'</select></div>';
  if(f.type==='score') return '<div class="fld">'+lab+'<select id="'+id+'" data-k="'+f.k+'"><option value="">Score</option>'+[1,2,3,4,5].map(function(o){ return '<option'+(String(o)===v?' selected':'')+'>'+o+'</option>'; }).join('')+'</select></div>';
  return '<div class="fld">'+lab+'<input type="text" id="'+id+'" data-k="'+f.k+'" value="'+esc(v)+'" autocomplete="off"></div>';
}
function formShell(n, kicker, title, inner, foot, nofoot){
  var s=SBY[n.sid];
  APP.innerHTML='<div class="player" data-lv="'+n.level+'"><header class="phead"><button class="icon-btn" id="quit" aria-label="Back to the session">'+ic('close')+'</button><div class="pmid"><span class="plabel">Session '+s.n+' · '+esc(KIND[n.kind])+'</span></div><span class="combo ghost"></span></header>'
    +'<main class="pbody"><div class="pin"><p class="kicker">'+esc(kicker)+'</p><h1 class="bigt">'+esc(title)+'</h1>'+inner+'</div></main><footer class="pfoot"><div class="pfin">'+foot+'</div></footer></div>';
  $('#quit').onclick=function(){ go({name:'session', sid:n.sid}); };
}
function finishForm(n, xp, title, sub){
  var first=!isDone(n.id);
  if(first){ S.done[n.id]={stars:0, at:today()}; addXP(xp); markAct('steps'); }
  save();
  var nb=checkBadges(), nx=nextInSession(n.sid, n.id), db=first?debrief(n):null;
  L={node:n, phase:'done', done:true};
  if(db) title=db.title;
  var foot=(nx?'<button class="btn wide" id="primary">Next: '+esc(nx.title)+'</button><button class="btn ghost wide" id="back">Back to session</button>':db&&db.next?'<button class="btn wide" id="primary">Start session '+db.next.n+'</button><button class="btn ghost wide" id="back">Back to session</button>':'<button class="btn wide" id="primary">Back to session</button>');
  APP.innerHTML='<div class="player" data-lv="'+n.level+'"><header class="phead"><button class="icon-btn" id="quit" aria-label="Back to the session">'+ic('close')+'</button><div class="pmid"><span class="plabel">Session '+SBY[n.sid].n+' · '+esc(KIND[n.kind])+'</span></div><span class="combo ghost"></span></header><main class="pbody"><div class="pin">'
    +doneBlock({title:title, sub:sub, lv:n.level, mood:'cheer', facts:[['+'+(first?xp:0),'XP'],[String(totalDone()),'Steps done']], extra:(first?phaseNote(n):'')+(db?db.html:''), badges:nb, note:first?'':'Saved. XP is only awarded the first time.'})+'</div></main><footer class="pfoot"><div class="pfin">'+foot+'</div></footer></div>';
  $('#quit').onclick=function(){ go({name:'session', sid:n.sid}); };
  $('#primary').onclick=function(){ if(nx) openNode(nx.id); else if(db&&db.next) go({name:'session', sid:db.next.id}); else go({name:'session', sid:n.sid}); };
  var b=$('#back'); if(b) b.onclick=function(){ go({name:'session', sid:n.sid}); };
}
function taskView(){
  var n=view.node, T=n.task, st=(S.logs[n.id]=S.logs[n.id]||{});
  var inner=(S.profile.task?'<div class="rt"><p class="kicker">Your real task</p><p class="quote">'+esc(S.profile.task)+'</p><p class="hint">Use it for this exercise if it fits. Pick another if it does not.</p></div>':'')+'<div class="paras">'+T.brief.map(function(b){ return '<p>'+inl(b)+'</p>'; }).join('')+'</div>';
  T.parts.forEach(function(part){
    inner+='<section class="part"><h2>'+esc(part.title)+'</h2>'+(part.intro?'<p class="hint">'+esc(part.intro)+'</p>':'');
    if(part.kind==='checks'){
      part.items.forEach(function(x,i){ inner+='<label class="chk"><input type="checkbox" data-p="'+part.id+'" data-r="'+i+'" data-k="c"'+(taskVal(st,part.id,i,'c')?' checked':'')+'><div><b>'+esc(x)+'</b></div></label>'; });
    } else {
      for(var r=0;r<taskRows(part);r++){
        inner+='<div class="rowc">'+(taskRows(part)>1||part.rows?'<h3>'+esc(rowLabel(part,r))+'</h3>':'');
        var buf='';
        part.fields.forEach(function(f){
          var fh=fieldHTML(f,'f_'+part.id+'_'+r+'_'+f.k, taskVal(st,part.id,r,f.k)).replace('data-k=','data-p="'+part.id+'" data-r="'+r+'" data-k=');
          if(f.type==='score'){ buf+=fh; } else { if(buf){ inner+='<div class="grid2">'+buf+'</div>'; buf=''; } inner+=fh; }
        });
        if(buf) inner+='<div class="grid2">'+buf+'</div>';
        if(part.calc) inner+='<div id="calc_'+part.id+'_'+r+'"></div>';
        inner+='</div>';
      }
    }
    inner+='</section>';
  });
  inner+='<p class="prog" id="prog"></p><div id="copyhost"></div>';
  formShell(n,'Exercise log',T.title,inner,'<div class="duo"><button class="btn ghost" id="copy">Copy as text</button><button class="btn" id="primary" disabled>Save and finish</button></div>');
  var pb=$('#primary');
  function upd(){
    var s2=taskStats(T,st); $('#prog').textContent=s2.ok+' of '+s2.tot+' fields complete'; pb.disabled=s2.ok<s2.tot;
    T.parts.forEach(function(part){
      if(!part.calc) return;
      for(var r=0;r<taskRows(part);r++){
        var host=document.getElementById('calc_'+part.id+'_'+r), msg='';
        if(part.calc==='limit'){
          var v=taskVal(st,part.id,r,'limit'), ex=part.rows[r].expect;
          if(v) msg = ex.indexOf(v)>=0 ? '<span class="okmsg">This limit matches the test.</span>' : '<span class="warn">This limit does not match the test. Re-read the five failure tests in the study sheet.</span>';
        } else if(part.calc==='tier'){
          var tiers=[['haiku','Haiku 5.5'],['sonnet','Sonnet 5.5'],['opus','Opus 5.5'],['fable','Fable 5.2']], vals=tiers.map(function(t){ return +taskVal(st,part.id,r,t[0])||0; });
          if(vals[0]&&vals[1]&&vals[2]){ var top=Math.max.apply(null,vals), idx=vals.indexOf(top); msg='<span class="okmsg">Cheapest tier at the top score of '+top+': '+tiers[idx][1]+'. If scores tie, the cheaper model wins.</span>'; }
        }
        if(host) host.innerHTML=msg;
      }
    });
  }
  $$('[data-p]').forEach(function(el){
    var ev=(el.type==='checkbox'||el.tagName==='SELECT')?'change':'input';
    el.addEventListener(ev,function(){
      var p=el.getAttribute('data-p'), r=el.getAttribute('data-r'), k=el.getAttribute('data-k');
      st[p]=st[p]||{}; st[p][r]=st[p][r]||{}; st[p][r][k]= el.type==='checkbox' ? el.checked : el.value; save(); upd();
    });
  });
  $('#copy').onclick=function(){ copyText(taskText(n), $('#copyhost')); };
  pb.onclick=function(){ finishForm(n,20,'Exercise logged','Your log is saved in this browser. Copy it as text to hand to your instructor.'); };
  upd();
}
function taskText(n){
  var T=n.task, st=S.logs[n.id]||{}, out='# '+T.title+'\n';
  T.parts.forEach(function(part){
    out+='\n## '+part.title+'\n';
    if(part.kind==='checks'){ part.items.forEach(function(x,i){ out+='- ['+(taskVal(st,part.id,i,'c')?'x':' ')+'] '+x+'\n'; }); return; }
    for(var r=0;r<taskRows(part);r++){
      out+='\n### '+rowLabel(part,r)+'\n';
      part.fields.forEach(function(f){ var v=taskVal(st,part.id,r,f.k); if(v) out+='- '+f.label+': '+v+'\n'; });
    }
  });
  return out;
}

/* ================= CASE ================= */
function caseView(){
  var n=view.node, C=n.case, cs=(S.cases[n.id]=S.cases[n.id]||{text:'',revealed:false,checks:[]});
  var inner='<p class="quote">'+esc(C.scenario)+'</p><div class="fld"><label for="ans">Your answer, in your own words</label><textarea id="ans"'+(cs.revealed?' readonly':'')+'>'+esc(cs.text)+'</textarea></div>'+(cs.revealed?'':'<p class="hint" id="wc"></p>');
  if(cs.revealed){
    inner+='<div class="model"><h2>Course answer</h2><p>'+esc(C.model)+'</p></div><h2 class="sh">What did your answer cover?</h2>'
      +C.checks.map(function(x,i){ return '<label class="chk"><input type="checkbox" data-i="'+i+'"'+(cs.checks[i]?' checked':'')+'><div><b>'+esc(x)+'</b></div></label>'; }).join('')
      +'<p class="hint">Anything unticked is a gap. Write down what you would change before you move on.</p>';
  }
  formShell(n,'Attempt first','Case',inner,'<button class="btn wide" id="primary"></button>');
  var ta=$('#ans'), pb=$('#primary');
  if(!cs.revealed){
    pb.textContent='Show the course answer';
    var upd=function(){ var w=words(ta.value); $('#wc').textContent='The course answer opens after you write at least 8 words. You have '+w+'.'; pb.disabled=w<8; cs.text=ta.value; save(); };
    ta.oninput=upd; upd();
    pb.onclick=function(){ cs.text=ta.value; cs.revealed=true; save(); caseView(); window.scrollTo(0,0); };
  } else {
    pb.textContent='Finish';
    $$('[data-i]').forEach(function(cb){ cb.onchange=function(){ cs.checks[+cb.getAttribute('data-i')]=cb.checked; save(); }; });
    pb.onclick=function(){ finishForm(n,15,'Case closed','Anything you left unticked is the next thing to practise.'); };
  }
}

/* ================= EXIT TICKET ================= */
function questionView(){
  var n=view.node, ex=(S.exits[n.id]=S.exits[n.id]||{verdict:'',closer:'',named:false}), fin=isDone(n.id);
  var inner='<p>Put this question to Claude. Read its answer, then give your verdict on it.</p><p class="quote">'+esc(n.exit)+'</p>'
    +'<div><button class="btn ghost small" id="cq">Copy the question</button><div id="copyhost"></div></div>'
    +'<div class="fld"><label for="verdict">Your verdict on Claude\'s answer: what held up, what did not</label><textarea id="verdict">'+esc(ex.verdict)+'</textarea></div>'
    +'<h2 class="sh">Now question it</h2><p class="quote">'+esc(n.closer)+'</p>'
    +'<p class="hint">A good answer names a specific check you would run, such as which source you would open and what you would compare. “I would double-check” does not count.</p>'
    +'<div class="fld"><label for="closer">Your answer</label><textarea id="closer" placeholder="Write the check you would run.">'+esc(ex.closer)+'</textarea></div>'
    +'<label class="chk"><input type="checkbox" id="named"'+(ex.named?' checked':'')+'><div><b>My answer names a specific check</b><span>I said what I would look at and what I would compare it with.</span></div></label><p class="prog" id="prog"></p>';
  formShell(n,'Exit ticket','Question what Claude gave you',inner,'<button class="btn wide" id="primary" disabled>'+(fin?'Save':'Save and finish')+'</button>');
  var v=$('#verdict'), c=$('#closer'), cb=$('#named'), pb=$('#primary');
  function upd(){ ex.verdict=v.value; ex.closer=c.value; ex.named=cb.checked; save(); var a=words(v.value), b=words(c.value);
    $('#prog').textContent='Verdict '+a+' of 8 words. Answer '+b+' of 12 words.'; pb.disabled=!(a>=8&&b>=12&&cb.checked); }
  v.oninput=upd; c.oninput=upd; cb.onchange=upd; upd();
  $('#cq').onclick=function(){ copyText(n.exit, $('#copyhost')); };
  pb.onclick=function(){ finishForm(n,10,'Ticket filed','Questioning the answer is the habit that does not come with experience. Keep doing it.'); };
}

/* ================= GATE ================= */
function gateView(){
  var n=view.node, lv=LEVELS[n.level-1], g=lv.gate, handed=isDone(g.id);
  var inner=(g.brief?'<p class="lede">'+esc(g.brief)+'</p>':'')+(g.lead?'<p class="hint">'+esc(g.lead)+'</p>':'')
    +'<p class="hint">Your instructor grades this against the '+(g.criteria.length===6?'six':'eight')+' criteria below. Every one must be met, whatever the practice XP says. Check your own work first.</p><div class="gatelist">'
    +g.criteria.map(function(c,i){ return '<label class="chk"><input type="checkbox" class="gc" data-i="'+i+'"'+(handed?' checked disabled':'')+'><div><b>'+esc(c[0])+'</b><span>'+esc(c[1])+'</span></div></label>'; }).join('')+'</div>'
    +(handed?'<p class="tag">Handed to your instructor</p><p class="hint">The app cannot pass this gate. Your instructor records the result.</p>':'');
  formShell(n,'Level '+n.level+' gate',g.title,inner,'<button class="btn wide" id="primary" disabled>'+(handed?'Handed in':'I handed this to my instructor')+'</button>');
  var pb=$('#primary'), cbs=$$('.gc');
  function upd(){ if(handed) return; pb.disabled=!cbs.every(function(c){ return c.checked; }); }
  cbs.forEach(function(c){ c.onchange=upd; }); upd();
  pb.onclick=function(){
    S.done[g.id]={stars:0, at:today()}; addXP(50); var nb=checkBadges(); save();
    lastLevelUp={lv:lv, badges:nb}; go({name:'levelup'});
  };
}
function levelupView(){
  var lv=lastLevelUp.lv, nxt=LEVELS[lv.n]||null, nb=lastLevelUp.badges;
  APP.innerHTML='<div class="player" data-lv="'+lv.n+'"><header class="phead"><button class="icon-btn" id="quit" aria-label="Back to the course">'+ic('close')+'</button><div class="pmid"><span class="plabel">Level '+lv.n+'</span></div><span class="combo ghost"></span></header><main class="pbody"><div class="pin">'
    +doneBlock({title:'Level '+lv.n+': '+lv.name, hero:(nxt?'<div class="evo"><span class="evo-a">'+zed(lv.n,'happy',104)+'</span><span class="evo-arrow">'+ic('arrow')+'</span><span class="evo-b">'+zed(nxt.n,'cheer',150,'hop')+'</span></div>':'<span class="zhero">'+zed(5,'cheer',170,'hop')+'</span>'), sub:'Gate handed in. '+(nxt?'Zed evolves into '+ZNAME[nxt.n]+'. ':'Zed wears the crown. ')+'Your instructor grades the gate and records the result.', facts:[['+50','XP'],[String(levelProg(lv).done),'Sessions done']], badges:nb, note:nxt?'Level '+nxt.n+' ('+nxt.name+') is now open in the app.':'You have been through the whole course. Review your weak spots and keep your streak.'})
    +'</div></main><footer class="pfoot"><div class="pfin"><button class="btn wide" id="primary">Back to the course</button></div></footer></div>';
  $('#quit').onclick=$('#primary').onclick=function(){ go({name:'learn'}); };
}

/* ================= keyboard ================= */
document.addEventListener('keydown',function(e){
  if(view.name!=='lesson'||!L) return;
  var tag=(e.target.tagName||'').toLowerCase();
  if(e.key==='Enter' && tag!=='textarea' && tag!=='button'){ var p=$('#primary'); if(p&&!p.disabled){ e.preventDefault(); p.click(); } return; }
  if(L.phase!=='q') return;
  var c=L.cur, it=c.item;
  if(it.type==='mcq'&&!c.checked&&tag!=='input'&&/^[1-5]$/.test(e.key)){ var o=c.opts[+e.key-1]; if(o){ c.sel=o.k; render(); } }
  if(it.type==='mission'&&c.m.stage==='ask'&&/^[1-3]$/.test(e.key)) missionPick(c, +e.key-1);
});

/*GAME*/
/*MISSIONS*/
render();
})();
