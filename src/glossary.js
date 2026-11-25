/* ================= GLOSSARY: every term the course defines, searchable, and tap-to-define inside lessons =================
   Built at start from the "Plain-language glossary" and "Vocabulary" tables on the study sheets, so there is one source of truth. */
IC.term='<path d="M5 5h10a4 4 0 014 4v10H9a4 4 0 01-4-4z"/><path d="M9 10h6M9 14h4"/>';
var GLOSS=[], GBYT={}, GSKIP={'model':1,'context':1,'task':1,'tool':1,'tools':1,'agent':1,'prompt':1,'output':1,'input':1};
function glossAdd(term, meaning, analogy, n){
  term=String(term||'').trim(); if(!term||!meaning) return;
  var key=term.toLowerCase(), g=GBYT[key];
  if(!g){ g={term:term, key:key, meaning:meaning, analogy:analogy||'', sn:n, ss:[n]}; GBYT[key]=g; GLOSS.push(g); }
  else { if(g.ss.indexOf(n)<0) g.ss.push(n); if(!g.analogy&&analogy) g.analogy=analogy; if(meaning.length>g.meaning.length) g.meaning=meaning; }
}
SESSIONS.forEach(function(s){
  (s.sheet||[]).forEach(function(sec){
    if(sec.title!=='Plain-language glossary' && sec.title!=='Vocabulary') return;
    (sec.blocks||[]).forEach(function(b){ if(b.t==='table') b.rows.forEach(function(r){ glossAdd(r[0], r[1], r[2], s.n); }); });
  });
});
GLOSS.sort(function(a,b){ return a.term.toLowerCase()<b.term.toLowerCase()?-1:1; });
function glossDefs(){ return GLOSS.slice().sort(function(a,b){ return b.term.length-a.term.length; }); }
var GDEFS=glossDefs();
function termsLooked(){ return Object.keys(S.terms||{}).length; }

/* wrap the new vocabulary of the session being studied in tap-to-define buttons (the first mention only, three at most per card) */
function termize(html){
  if(view.name!=='lesson' || !L || !L.node || !L.node.sid || !{learn:1,field:1,demo:1}[L.node.kind]) return html;
  var sn=SBY[L.node.sid].n, used={}, count=0;
  var cands=GDEFS.filter(function(g){ return g.sn===sn && g.term.length>=4 && !GSKIP[g.key] && g.term.length<=28; });
  if(!cands.length) return html;
  var parts=html.split(/(<[^>]+>)/), skip=0;
  return parts.map(function(seg){
    if(seg.charAt(0)==='<'){
      if(/^<(code|button|a|strong)\b/i.test(seg)) skip++; else if(/^<\/(code|button|a|strong)>/i.test(seg)) skip=Math.max(0,skip-1);
      return seg;
    }
    if(skip || count>=3) return seg;
    cands.some(function(g){
      if(used[g.key]||count>=3) return false;
      var re=new RegExp('(^|[^A-Za-z0-9])('+g.term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')(?![A-Za-z0-9])','i'), m=re.exec(seg);
      if(!m) return false;
      used[g.key]=1; count++;
      seg=seg.slice(0,m.index+m[1].length)+'<button type="button" class="term" data-term="'+esc(g.key)+'">'+m[2]+'</button>'+seg.slice(m.index+m[1].length+m[2].length);
      return false;
    });
    return seg;
  }).join('');
}
function openTerm(key){
  var g=GBYT[key]; if(!g) return;
  var first=!(S.terms||{})[key];
  if(first){ (S.terms=S.terms||{})[key]=today(); addXP(1); checkBadges(); save(); }
  var m=document.createElement('div'); m.className='modal termm'; m.setAttribute('role','dialog'); m.setAttribute('aria-modal','true'); m.setAttribute('aria-label','Term: '+g.term);
  m.innerHTML='<div class="card termc"><header class="noteh"><span class="rk docs">'+ic('term')+'</span><div><small class="np">In plain words</small><h2>'+esc(g.term)+'</h2></div><button type="button" class="icon-btn" id="termX" aria-label="Close this term">'+ic('close')+'</button></header>'
    +'<p class="tmean">'+esc(g.meaning)+'</p>'+(g.analogy?'<p class="think"><b>Think of it as</b> '+esc(g.analogy)+'</p>':'')
    +'<p class="fine">Session '+g.ss.slice().sort(function(a,b){ return a-b; }).join(', ')+(first?' · +1 XP for looking it up':'')+'</p>'
    +'<button type="button" class="btn wide" id="termDone">Got it</button></div>';
  document.body.appendChild(m);
  var release=trapFocus(m,function(){ close(); });
  function close(){ release(); if(m.parentNode) m.parentNode.removeChild(m); showPending(); }
  m.addEventListener('click',function(e){ if(e.target===m) close(); });
  m.querySelector('#termX').onclick=close; m.querySelector('#termDone').onclick=close; m.querySelector('#termDone').focus();
}
function bindTerms(){ $$('.term').forEach(function(b){ b.onclick=function(){ openTerm(b.getAttribute('data-term')); }; }); }

/* the glossary view */
var gl={q:''};
function glossaryView(){
  var q=gl.q.toLowerCase().trim();
  var rows=GLOSS.filter(function(g){ return !q || g.key.indexOf(q)>=0 || g.meaning.toLowerCase().indexOf(q)>=0 || (g.analogy||'').toLowerCase().indexOf(q)>=0; });
  var h='<div class="narrow"><h1 class="ph">Glossary</h1><p class="lead">'+GLOSS.length+' terms from the course, in plain words. '+termsLooked()+' looked up so far.</p>'
    +'<div class="search">'+ic('search')+'<input id="gq" type="search" placeholder="Search terms, for example: token" aria-label="Search the glossary" value="'+esc(gl.q)+'" autocomplete="off"></div>'
    +'<p class="fine" id="gcount" role="status" aria-live="polite">'+rows.length+(rows.length===1?' term':' terms')+'</p><div id="glist">'+glossRows(rows)+'</div>'
    +'<div class="duo"><button class="btn ghost" data-tab-go="sheets">Back to Sheets</button></div></div>';
  setPage(h,'sheets');
  var gq=$('#gq'); gq.oninput=function(){ gl.q=gq.value; var qq=gl.q.toLowerCase().trim(); var rs=GLOSS.filter(function(g){ return !qq || g.key.indexOf(qq)>=0 || g.meaning.toLowerCase().indexOf(qq)>=0 || (g.analogy||'').toLowerCase().indexOf(qq)>=0; }); $('#glist').innerHTML=glossRows(rs); $('#gcount').textContent=rs.length+(rs.length===1?' term':' terms'); bindGlossRows(); };
  $$('[data-tab-go]').forEach(function(b){ b.onclick=function(){ go({name:b.getAttribute('data-tab-go')}); }; });
  bindGlossRows();
}
function glossRows(rows){
  if(!rows.length) return '<p class="empty">No term matches. Try a shorter word.</p>';
  return rows.map(function(g){
    return '<article class="gl'+((S.terms||{})[g.key]?' seen':'')+'"><h2>'+esc(g.term)+'</h2><p>'+esc(g.meaning)+'</p>'+(g.analogy?'<p class="think"><b>Think of it as</b> '+esc(g.analogy)+'</p>':'')
      +'<p class="gl-s">'+g.ss.slice().sort(function(a,b){ return a-b; }).map(function(n){ return '<button type="button" class="chip" data-gs="'+SESSIONS[n-1].id+'">Session '+n+'</button>'; }).join('')+'</p></article>';
  }).join('');
}
function bindGlossRows(){ $$('[data-gs]').forEach(function(b){ b.onclick=function(){ var s=SBY[b.getAttribute('data-gs')]; if(!sessOpen(s)) return toast('That session is still locked.'); go({name:'sheet', sid:s.id, from:{name:'glossary'}}); }; }); }
function glossCard(){
  return '<button class="libgo" id="glossGo"><span class="libi">'+ic('term')+'</span><span><b>Glossary</b><small>'+GLOSS.length+' terms in plain words, with something to compare each to. '+termsLooked()+' looked up.</small></span>'+ic('arrow')+'</button>';
}
