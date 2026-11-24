/* ================= PLAYBOOK AND CERTIFICATE: the learner's own work, kept and printable =================
   The playbook gathers what the learner wrote and earned: rules, exit-ticket verdicts, exercise logs, cases, teach-backs, doubts and actions.
   The certificate marks the highest level whose gate has been handed in. Both print cleanly; neither leaves the page. */
IC.print='<path d="M7 9V4h10v5"/><rect x="4" y="9" width="16" height="8" rx="2"/><path d="M7 14h10v6H7z"/>';
IC.seal='<circle cx="12" cy="9" r="5.500"/><path d="M8.500 13.500L7 21l5-2.500L17 21l-1.500-7.500"/>';
function bookHas(o){ return Object.keys(o||{}).some(function(k){ var v=o[k]; return typeof v==='string'?v.trim():!!v; }); }
function playbookSections(){
  var out=[], P=S.profile, own=ownedCards();
  var me=[]; if(P.name) me.push('Name: '+P.name); if(P.role) me.push('Work: '+P.role); if(P.task) me.push('My real task: '+P.task);
  if(me.length) out.push({h:'About me', lines:me});
  if(own.length){
    var cs=own.slice().sort(function(a,b){ var ka=a.k==='epic'?99:a.n; var kb=b.k==='epic'?99:b.n; return (ka-kb)||(a.k==='core'?-1:1); });
    out.push({h:'Rules I keep', lines:cs.map(function(c){ return c.t+'. '+c.w; })});
  }
  var ex=Object.keys(S.exits).filter(function(id){ var e=S.exits[id]; return NBY[id] && e.verdict && e.verdict.trim(); }).sort();
  if(ex.length) out.push({h:'How I check what Claude gives me', lines:ex.map(function(id){ var e=S.exits[id], s=SBY[NBY[id].sid]; return 'Session '+s.n+': '+e.verdict.trim()+(e.closer&&e.closer.trim()?' The check I would run: '+e.closer.trim():''); })});
  var tasks=Object.keys(S.logs).filter(function(id){ return NBY[id] && NBY[id].task && bookHas(S.logs[id]); }).sort();
  if(tasks.length) out.push({h:'My exercise logs', blocks:tasks.map(function(id){ var n=NBY[id]; return {t:'Session '+SBY[n.sid].n+': '+n.task.title, text:taskText(n)}; })});
  var cases=Object.keys(S.cases).filter(function(id){ return NBY[id] && S.cases[id].text && S.cases[id].text.trim(); }).sort();
  if(cases.length) out.push({h:'My case answers', lines:cases.map(function(id){ return 'Session '+SBY[NBY[id].sid].n+': '+S.cases[id].text.trim(); })});
  var tb=Object.keys(S.expl).filter(function(id){ return S.expl[id] && S.expl[id].text && S.expl[id].text.trim() && ITEMS[id]; }).sort();
  if(tb.length) out.push({h:'In my own words', lines:tb.map(function(id){ return 'Session '+SBY[ITEMS[id].node.split('-')[0]].n+': '+S.expl[id].text.trim(); })});
  var mu=Object.keys(S.muddy).filter(function(k){ return SBY[k] && S.muddy[k] && S.muddy[k].trim(); }).sort();
  if(mu.length) out.push({h:'Still unclear', lines:mu.map(function(k){ return 'Session '+SBY[k].n+': '+S.muddy[k].trim(); })});
  var td=Object.keys(S.today).filter(function(k){ return SBY[k] && S.today[k] && SBY[k].today; }).sort();
  if(td.length) out.push({h:'What I put to use', lines:td.map(function(k){ return 'Session '+SBY[k].n+': '+SBY[k].today; })});
  return out;
}
function playbookText(){
  var out='My Claude playbook\nZero to 100 Practice · '+today()+'\n';
  playbookSections().forEach(function(s){
    out+='\n## '+s.h+'\n';
    if(s.lines) s.lines.forEach(function(l){ out+='- '+l+'\n'; });
    if(s.blocks) s.blocks.forEach(function(b){ out+='\n### '+b.t+'\n'+b.text+'\n'; });
  });
  return out;
}
function playbookView(){
  var secs=playbookSections(), h='<div class="narrow playbook"><h1 class="ph">My playbook</h1><p class="lead">Your own rules, checks and work, in one place. It fills as you go. Copy it into your notes or print it.</p>';
  if(secs.length<=1 && !ownedCards().length) h+='<section class="card empty-c">'+zed(zLv(),'wink',110,'bob')+'<h2>Nothing here yet</h2><p>Finish a session to earn a rule card. Exercise logs, cases and exit tickets add to this page as you write them.</p></section>';
  secs.forEach(function(s){
    h+='<section class="card pbsec"><h2>'+esc(s.h)+'</h2>';
    if(s.lines) h+='<ul class="blist">'+s.lines.map(function(l){ return '<li>'+esc(l)+'</li>'; }).join('')+'</ul>';
    if(s.blocks) h+=s.blocks.map(function(b){ return '<details class="pbd"><summary>'+esc(b.t)+'</summary><pre class="pbpre">'+esc(b.text)+'</pre></details>'; }).join('');
    h+='</section>';
  });
  h+='<div class="duo noprint"><button class="btn" id="pbCopy">Copy playbook</button><button class="btn ghost" id="pbPrint">'+ic('print')+'Print</button></div><div id="pbbox" class="noprint"></div><div class="duo noprint"><button class="btn ghost" data-tab-go="you">Back to You</button></div></div>';
  setPage(h,'you');
  $('#pbCopy').onclick=function(){ copyText(playbookText(), $('#pbbox')); };
  $('#pbPrint').onclick=function(){ $$('.pbd').forEach(function(d){ d.open=true; }); window.print(); };
  $$('[data-tab-go]').forEach(function(b){ b.onclick=function(){ go({name:b.getAttribute('data-tab-go')}); }; });
}

function certLevel(){ var best=null; LEVELS.forEach(function(lv){ if(levelDone(lv)) best=lv; }); return best; }
function certView(){
  var lv=certLevel(), P=S.profile;
  if(!lv){
    setPage('<div class="narrow"><h1 class="ph">Certificate</h1><section class="card empty-c">'+zed(zLv(),'wink',110,'bob')+'<h2>Not yet</h2><p>Your certificate unlocks when you hand in the Level 1 gate. It then grows with every level you complete.</p></section><div class="duo"><button class="btn ghost" data-tab-go="you">Back to You</button></div></div>','you');
    $$('[data-tab-go]').forEach(function(b){ b.onclick=function(){ go({name:b.getAttribute('data-tab-go')}); }; }); return;
  }
  var all=levelDone(LEVELS[LEVELS.length-1]) && SESSIONS.every(sessComplete), p=plInfo();
  var stars=NODES.reduce(function(a,n){ return a+starsOf(n.id); },0);
  var h='<div class="narrow"><h1 class="ph noprint">Certificate</h1><section class="certp" data-lv="'+lv.n+'"><div class="cert-in"><span class="cert-z">'+zed(lv.n,'cheer',96)+'</span>'
    +'<p class="eyebrow">Zero to 100 Practice</p><h2 class="cert-t">'+(all?'Certificate of completion':'Certificate of practice')+'</h2>'
    +'<p class="cert-for">Awarded to</p><p class="cert-name">'+esc(P.name||'A learner')+'</p>'
    +'<p class="cert-did">'+(all?'for completing all 24 sessions and all five levels of the course.':'for completing <b>Level '+lv.n+': '+esc(lv.name)+'</b>.')+'</p>'
    +'<div class="cert-stats"><div><b>'+totalDone()+'</b><span>steps done</span></div><div><b>'+masteredCount()+'</b><span>sessions mastered</span></div><div><b>'+stars+'</b><span>stars</span></div><div><b>'+ownedCards().length+'</b><span>rule cards</span></div></div>'
    +'<p class="cert-rank">Player level '+p.n+': '+esc(p.title)+'</p>'
    +'<p class="cert-date">'+today()+'</p>'
    +'<p class="fine">This is a practice certificate from the learning app. Level gates and course points are graded by your instructor.</p></div></section>'
    +'<div class="duo noprint"><button class="btn" id="certPrint">'+ic('print')+'Print or save as PDF</button><button class="btn ghost" data-tab-go="you">Back to You</button></div></div>';
  setPage(h,'you',lv.n);
  $('#certPrint').onclick=function(){ window.print(); };
  $$('[data-tab-go]').forEach(function(b){ b.onclick=function(){ go({name:b.getAttribute('data-tab-go')}); }; });
}
function workCard(){
  var lv=certLevel();
  return '<section class="card workc"><div class="revc-h">'+ic('doc')+'<h2>Your work</h2></div><p class="sub">Keep what you have written and earned.</p>'
    +'<div class="duo"><button class="btn" id="goBook">'+ic('doc')+'Playbook</button><button class="btn'+(lv?'':' ghost')+'" id="goCert">'+ic('seal')+'Certificate</button></div>'
    +(lv?'':'<p class="fine">The certificate unlocks when you hand in the Level 1 gate.</p>')+'</section>';
}
function bindWork(){
  var b=$('#goBook'); if(b) b.onclick=function(){ go({name:'playbook'}); };
  var c=$('#goCert'); if(c) c.onclick=function(){ go({name:'cert'}); };
}
