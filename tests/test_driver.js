(async()=>{
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const D=JSON.parse(document.getElementById('course-data').textContent);
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const out=[]; let pre=null;
const log=m=>{ out.push(m); flush(); };
function flush(){ if(!pre){ pre=document.createElement('pre'); pre.id='testout'; pre.style.cssText='position:fixed;left:0;top:0;width:0;height:0;overflow:hidden'; document.body.appendChild(pre); } pre.textContent=out.join('\n'); }
window.addEventListener('error',e=>log('PAGE ERROR: '+e.message+' @'+(e.lineno||'')));
const mode=(location.hash||'#full').slice(1);
const realNow=Date.now.bind(Date); window.__skew=0; Date.now=()=>realNow()+window.__skew;
const DAY=864e5;
const SESS={}, NODE={}, MCQ={}, FILL={}, MATCH={}, ORDER={}, FLASH={}, TEACH={};
D.sessions.forEach(s=>{ SESS[s.id]=s; s.nodes.forEach(n=>{ n.id=s.id+'-'+n.k; n.sid=s.id; NODE[n.id]=n; (n.items||[]).forEach(i=>{
  if(i.type==='mcq'){ (MCQ[i.stem]=MCQ[i.stem]||[]).push(i); }
  else if(i.type==='fill'){ FILL[i.stem.split('____').join('')]=i; }
  else if(i.type==='match') MATCH[i.prompt]=i;
  else if(i.type==='order') ORDER[i.prompt]=i;
  else if(i.type==='flash') FLASH[i.term]=i;
  else if(i.type==='teach') TEACH[i.title]=i;
}); }); });
async function click(s){ const e=typeof s==='string'?$(s):s; if(!e) throw new Error('missing '+s); e.click(); await sleep(3); }
function setv(el,v,ev){ el.value=v; el.dispatchEvent(new Event(ev||'input',{bubbles:true})); }
function words(n){ return Array.from({length:n},(_,i)=>'word'+i).join(' '); }
const feet=()=>$('.pfoot')&&$('.pfoot').className;
function screen(){
  if($('.center.done')) return 'done';
  if($('#expl')) return 'explain';
  if($('.fcard')) return 'flash';
  if($('.pairs')) return 'match';
  if($('.placed')||$('[data-o]')) return 'order';
  if($('.blank')) return 'fill';
  if($('.opt[data-k]')) return 'mcq';
  if($('.facts-l')) return 'intro';
  if($('h1.bigt')) return 'teach';
  return 'unknown';
}
let counts={};
const bump=k=>counts[k]=(counts[k]||0)+1;
async function step(right){
  const t=screen(); bump(t);
  if(t==='intro'){ await click('#primary'); return t; }
  if(t==='teach'){ const h=$('h1.bigt').textContent; if(!TEACH[h]) throw new Error('unknown teach '+h); await click('#primary'); return t; }
  if(t==='mcq'){
    const stem=$('.stem').textContent, cands=MCQ[stem]; if(!cands) throw new Error('unknown mcq: '+stem);
    const shown=$$('.opt[data-k]').map(o=>o.querySelector('span:last-child').textContent).sort().join('|');
    const q=cands.find(c=>c.options.map(o=>o.t).sort().join('|')===shown); if(!q) throw new Error('mcq options mismatch: '+stem);
    const keyEl=$('.opt[data-k="'+q.key+'"]'); const other=$$('.opt[data-k]').find(o=>o!==keyEl);
    await click(right?keyEl:other);
    if($('[data-conf]')) await click($('[data-conf="'+(right?'sure':'think')+'"]'));
    await click('#primary');
    const ft=feet(); if(!ft.includes('info')){ const good=ft.includes('good'); if(good!==right) throw new Error('mcq verdict wrong for '+stem); }
    await click('#primary'); return t;
  }
  if(t==='fill'){
    const txt=$('.sentence').textContent, f=FILL[txt]; if(!f) throw new Error('unknown fill: '+txt);
    $$('.blank').forEach((b,i)=>setv(b, right? f.answers[i] : 'zzz'));
    await click('#primary'); const good=feet().includes('good'); if(good!==right) throw new Error('fill verdict wrong: '+txt+' answers='+f.answers.join('/'));
    await click('#primary'); return t;
  }
  if(t==='match'){
    const m=MATCH[$('.stem').textContent]; if(!m) throw new Error('unknown match');
    for(let i=0;i<m.pairs.length;i++){
      if(!right&&i===0){ await click('[data-l="0"]'); await click('[data-r="1"]'); await sleep(520); }
      await click('[data-l="'+i+'"]'); await click('[data-r="'+i+'"]');
    }
    await click('#primary'); return t;
  }
  if(t==='order'){
    const o=ORDER[$('.stem').textContent]; if(!o) throw new Error('unknown order');
    for(let p=0;p<o.steps.length;p++){
      if(!right&&p===0){ await click('[data-o="'+(o.steps.length-1)+'"]'); await sleep(520); }
      await click('[data-o="'+p+'"]');
    }
    await click('#primary'); return t;
  }
  if(t==='explain'){
    if($('#primary').disabled===false) throw new Error('explain reveal enabled before 20 words');
    setv($('#expl'),'short'); if(!$('#primary').disabled) throw new Error('reveal enabled at 1 word');
    setv($('#expl'),words(24)); if($('#primary').disabled) throw new Error('reveal still disabled at 24 words');
    await click('#primary'); if(!$('.model')) throw new Error('model answer not shown');
    $$('[data-pt]').forEach(cb=>{ cb.checked=true; cb.dispatchEvent(new Event('change',{bubbles:true})); }); await click('#primary'); return t;
  }
  if(t==='flash'){ if(!FLASH[$('.term').textContent]) throw new Error('unknown flash'); await click('#primary'); await click('#primary'); return t; }
  throw new Error('stuck on '+t+' '+(document.body.textContent||'').slice(0,120));
}
async function playLesson(wrongFirst){
  let first=true;
  for(let g=0;g<160;g++){
    const t=screen(); if(t==='done') return;
    const graded=['mcq','fill','match','order'].includes(t);
    const k=await step(!(wrongFirst&&first&&graded)); if(graded) first=false;
  }
  throw new Error('lesson did not finish');
}
async function playAllWrong(){ // every graded item wrong on the first try, right on the retry
  const seen=new Set();
  for(let g=0;g<200;g++){
    const t=screen(); if(t==='done') return;
    const graded=['mcq','fill','match','order'].includes(t);
    let right=true;
    if(graded){ const key=(($('.stem')||$('.sentence')||{}).textContent||'')+'|'+t; right=seen.has(key); seen.add(key); }
    await step(right);
  }
  throw new Error('all-wrong lesson did not finish');
}
function fieldValue(f,part,r){
  if(f.type==='select') return f.options[0];
  if(f.type==='score') return '3';
  if(part.calc==='limit'&&f.k==='limit'&&part.rows&&part.rows[r]&&part.rows[r].expect) return part.rows[r].expect[0];
  return words(Math.max(3,(f.min||1)+1));
}
async function playTask(n){
  const T=n.task;
  for(const part of T.parts){
    if(part.kind==='checks'){ for(let i=0;i<part.items.length;i++){ const el=$('[data-p="'+part.id+'"][data-r="'+i+'"][data-k="c"]'); el.checked=true; el.dispatchEvent(new Event('change',{bubbles:true})); } continue; }
    const rows=part.rows?part.rows.length:part.count;
    for(let r=0;r<rows;r++) for(const f of part.fields){
      const el=$('[data-p="'+part.id+'"][data-r="'+r+'"][data-k="'+f.k+'"]'); if(!el) throw new Error('task field missing '+part.id+'/'+r+'/'+f.k);
      const v=fieldValue(f,part,r); el.value=v; el.dispatchEvent(new Event(el.tagName==='SELECT'?'change':'input',{bubbles:true}));
    }
  }
  const pb=$('#primary'); if(pb.disabled) throw new Error('task save disabled: '+$('#prog').textContent);
  await click(pb);
}
async function playCase(){
  setv($('#ans'), words(12)); await click('#primary'); if(!$('.model')) throw new Error('case model not shown');
  $$('[data-i]').forEach(cb=>{ cb.checked=true; cb.dispatchEvent(new Event('change',{bubbles:true})); });
  await click('#primary');
}
async function playQuestion(){
  setv($('#verdict'),words(10)); setv($('#closer'),words(14)); const cb=$('#named'); cb.checked=true; cb.dispatchEvent(new Event('change',{bubbles:true}));
  if($('#primary').disabled) throw new Error('exit save disabled: '+$('#prog').textContent);
  await click('#primary');
}
async function playGate(n){
  $$('.gc').forEach(c=>{ c.checked=true; c.dispatchEvent(new Event('change',{bubbles:true})); });
  if($('#primary').disabled) throw new Error('gate button disabled');
  await click('#primary'); if(!/Level \d/.test($('.bigt').textContent)) throw new Error('no levelup screen'); await click('#primary');
}
function nodeBtn(id){ return $('[data-node="'+id+'"]'); }
async function toLearn(){ if($('[data-tab="learn"]')) await click('[data-tab="learn"]'); else if($('#quit')) await click('#quit'); }
async function toSession(sid){ await toLearn(); if(!$('[data-sess]')) await toLearn(); await click('[data-sess="'+sid+'"]'); }
async function playNode(n,wrongFirst){
  const b=nodeBtn(n.id); if(!b) throw new Error('no node button '+n.id); await click(b);
  if(n.dyn && !$('.player')) return 'auto';
  if(n.kind==='task') await playTask(n); else if(n.kind==='case') await playCase(); else if(n.kind==='question') await playQuestion(); else await playLesson(wrongFirst);
  if(screen()!=='done' && !$('.center.done')) throw new Error('no done screen for '+n.id);
}
const dueNow=()=>{ try{ const st=JSON.parse(localStorage.getItem('z100-practice-v4')); return Object.keys(st.srs||{}).length+' srs'; }catch(e){ return '?'; } };
const xpNow=()=>{ const e=$('.stat.xp b'); if(!e) throw new Error('no xp stat; body='+document.body.innerHTML.slice(0,300)); return +e.textContent; };

async function full(){
  const t0=0; let nodesPlayed=0;
  for(const s of D.sessions){
    const lv=D.levels[s.level-1];
    await toSession(s.id);
    if(!$('.s-head')) throw new Error('session page missing for '+s.id);
    const wrongFirst=(s.n%4===1);
    for(let i=0;i<s.nodes.length;i++){
      const n=s.nodes[i]; await toSession(s.id);
      const x0=xpNow();
      const res=await playNode(n, wrongFirst&&['learn','practice','recall','apply','warmup','checkpoint'].includes(n.kind));
      if(res==='auto'){ log('  '+n.kind+' skipped, nothing due '+s.id); continue; }
      if(n.kind==='warmup') log('  warm-up played '+s.id);
      nodesPlayed++;
      if(i===0 && s.n%6===1){ // test the "Next:" button path
        const p=$('#primary'); if(/^Next:/.test(p.textContent)){ await click(p); const t=$('h1.bigt, h1.stem'); if(!t) throw new Error('Next did not open a step'); log('  next-step ok '+s.id+' -> '+t.textContent.slice(0,40)); }
      }
      await toSession(s.id);
      const dx=xpNow()-x0; if(dx<=0 && !(i===1&&s.n%6===1)) log('  WARN no XP for '+n.id);
    }
    await toSession(s.id);
    if(lv.gate.session===s.id){
      const gb=$('[data-node="'+lv.gate.id+'"]'); if(!gb) throw new Error('gate row missing '+s.id);
      if(gb.getAttribute('aria-disabled')==='true') throw new Error('gate locked after all steps '+s.id);
      await click(gb); await playGate(); log('gate '+lv.gate.id+' handed, level '+lv.n+' complete');
    }
    log('session '+s.n+' done. xp='+xpNow()+' nodes='+nodesPlayed+' due='+dueNow());
    window.__skew+=DAY;
    if(s.n===1){ // review list should have entries after wrong-first play
      await toLearn(); const dot=$('.tab .dot'); log('review dot after s1: '+(dot?dot.textContent:'none'));
      if(dot){ await click('[data-tab="review"]'); await click('#go'); await playLesson(false); log('review round done; facts='+$$('.fact').map(f=>f.textContent).join(',')); await click('#quit'); }
    }
  }
  await toLearn();
  log('DONE counts '+JSON.stringify(counts));
  log('hero: '+$('.hero h1').textContent+' | comp cards: '+$$('.scard.comp').length+' | gaterow done: '+$$('.gaterow.done').length);
  await click('[data-tab="you"]');
  log('you: kpis '+$$('.kpi').map(k=>k.textContent).join(' / '));
  log('badges earned: '+$$('.badge.on').length+' of '+$$('.badge').length+' => '+$$('.badge.on b').map(b=>b.textContent).join(', '));
  await click('#rep'); log('report box or toast ok: '+(!!$('#repbox textarea')||!!$('#toast span')));
}

const stored=()=>JSON.parse(localStorage.getItem('z100-practice-v4')||'{}');
async function runPlacement(passUpTo){ // answers right for levels up to passUpTo, wrong above it
  await click('#primary'); // intro Start
  let n=0;
  for(let g=0;g<60;g++){
    const t=screen(); if(t==='done') break;
    if(t!=='mcq') throw new Error('placement showed '+t);
    const lvl=+/Level (\d)/.exec($('.kicker').textContent)[1];
    if($('[data-conf]')) throw new Error('placement should not ask for confidence');
    if($('#hint')) throw new Error('placement should not offer hints');
    await step(lvl<=passUpTo); n++;
  }
  return n;
}
async function journey(){
  // ---- onboarding on a fresh start
  if(!$('#obnext')) throw new Error('onboarding did not open on a fresh start');
  if(!/1 of 5/.test($('.plabel').textContent)) throw new Error('step label: '+$('.plabel').textContent);
  setv($('#obname'),'Sam'); await click('#obnext');
  if(!$('#obnext').disabled) throw new Error('role step should need a choice'); await click('[data-role="2"]'); await click('#obnext');
  if(!$('#obnext').disabled) throw new Error('experience step should need a choice'); await click('[data-exp="2"]'); await click('#obnext');
  await click('[data-goal="2"]'); await click('#obnext');
  await click('[data-ex="0"]'); if(!$('#obtask').value) throw new Error('example chip did not fill the task'); await click('#obnext');
  if(!/Sam/.test($('.bigt').textContent)) throw new Error('plan not personal: '+$('.bigt').textContent);
  if(!$('#obplace')) throw new Error('experienced learner was not offered placement');
  const sv=stored(); if(sv.profile.name!=='Sam'||sv.profile.exp!==2||!sv.profile.task||sv.goal!==50||!sv.profile.role) throw new Error('profile not saved '+JSON.stringify(sv.profile));
  log('onboarding ok: '+JSON.stringify(sv.profile)+' goal '+sv.goal);

  // ---- placement: pass levels 1 to 3, miss level 4, so the start is level 4's first session (12)
  await click('#obplace'); if(!/Levels 1 to 4/.test($('#p1').textContent)) throw new Error('builder should be offered the long check first');
  await click('#p1'); const q=await runPlacement(3); if(q!==16) throw new Error('expected 16 placement questions, got '+q);
  if(!/session 12/i.test($('.bigt').textContent)) throw new Error('wrong start: '+$('.bigt').textContent);
  log('placement ok: '+$('.bigt').textContent+' | '+$$('.obj small').map(x=>x.textContent).join(' ; '));
  let st=stored(); if(st.startAt!==12) throw new Error('startAt '+st.startAt); if(st.xp!==0) throw new Error('placement paid XP'); if((st.missed||[]).length) throw new Error('placement added to the review list');
  await click('#primary'); if(!$('.hookc')) throw new Error('session page has no situation card');
  await toLearn();
  if(!/Claude Code fundamentals/.test($('.hero').textContent)) throw new Error('hero does not point at the start: '+$('.hero').textContent.slice(0,120));
  const s01=$('[data-sess="s01"]'), s13=$('[data-sess="s13"]'); if(s01.classList.contains('locked')) throw new Error('skipped session is locked'); if(!s13.classList.contains('locked')) throw new Error('session 13 should still wait for 12');
  if(!/Skipped/.test(s01.textContent)) throw new Error('skipped label missing');
  if($('.placec')) throw new Error('skip-ahead card should disappear once placed');
  log('start point ok: hero="'+$('.hero h1').textContent+'", s01 '+s01.querySelector('.sx').textContent+', s13 locked');

  // ---- a failed check starts at the beginning again
  await click('[data-tab="you"]'); if(!/Session 12/.test($('.setupc').textContent)) throw new Error('setup card start');
  await click('#plGo'); await click('#p2'); await runPlacement(0);
  if(!/session 1\b/i.test($('.bigt').textContent)) throw new Error('all wrong should start at 1: '+$('.bigt').textContent);
  if(stored().startAt!==1) throw new Error('startAt not reset'); log('retake ok: '+$('.bigt').textContent);
  await click('#back');

  // ---- every session opens with its situation and has a use-it-today action
  await preview();
  for(const s of D.sessions){
    await toSession(s.id);
    const h=$('.hookc h2'); if(!h||h.textContent!==s.hook.title) throw new Error('hook missing '+s.id);
    if(!s.today||s.today.length<20) throw new Error('today missing '+s.id);
  }
  log('hooks ok: '+D.sessions.length+' sessions');
  await click('[data-tab="you"]'); await click('#prev'); // preview off

  // ---- finish a session: debrief, use-it-today, next
  await playFirst('s01',D.sessions[0].nodes.length-1,false); await click(nodeBtn('s01-Q')); await playQuestion();
  const d=$('.debrief'); if(!d) throw new Error('no debrief after the last step of session 1');
  if(!/Session 1 complete/.test($('.bigt').textContent)) throw new Error('debrief title '+$('.bigt').textContent);
  if($$('.dbrow').length<3) throw new Error('debrief rows '+$$('.dbrow').length);
  if(!/Start session 2/.test($('#primary').textContent)) throw new Error('debrief next button: '+$('#primary').textContent);
  log('debrief ok: '+$$('.dbrow b').map(b=>b.textContent).join(' | '));
  await click('#back'); if(!$('#todo')) throw new Error('no use-it-today card'); if(!$('.nextc #nextS')) throw new Error('no next card');
  const x0=xpNow(); await click('#todo'); await sleep(5); const x1=xpNow(); if(x1-x0!==15) throw new Error('use-it-today XP '+(x1-x0));
  if(!$('#todo').checked||!$('#todo').disabled) throw new Error('use-it-today not locked after ticking');
  await click('#nextS'); if(!/Session 2/.test($('.lv-chip').textContent)) throw new Error('next card did not open session 2');
  log('use-it-today +15 XP, next ok');

  // ---- editing the setup keeps the values; the exercise shows the learner's own task
  await click('[data-tab="you"]'); await click('#obEdit'); if($('#obname').value!=='Sam') throw new Error('edit did not prefill'); await click('#obcancel'); if(!$('.setupc')) throw new Error('cancel did not return to You');
  await toSession('s02'); await click(nodeBtn('s02-X')); if(!/Your real task/.test($('.rt').textContent)) throw new Error('exercise does not show the real task');
  log('exercise real task ok: '+$('.rt .quote').textContent);
}

let pvOn=false;
async function extras(){
  // quit modal
  await toSession('s01'); await click(nodeBtn('s01-P1')); await click('#primary'); await click('#quit');
  if(!$('.modal')) throw new Error('no quit modal'); await click('#stay'); if($('.modal')||!$('.stem')) throw new Error('stay failed');
  // keyboard: 2 then Enter
  const stem=$('.stem').textContent; document.dispatchEvent(new KeyboardEvent('keydown',{key:'2',bubbles:true}));
  await sleep(5); if(!$('.opt.sel')) throw new Error('key 2 did not select'); document.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true})); await sleep(5);
  if(!$('.pfoot.good,.pfoot.bad')) throw new Error('Enter did not check'); log('keyboard ok');
  await click('#quit'); await sleep(5); // quit from feedback phase asks confirm
  if($('.modal')){ await click('#quitok'); }
  // replay: no extra XP
  await toSession('s01'); const x0=xpNow(); await playNode(NODE['s01-L1'],false); await toSession('s01'); const x1=xpNow();
  await playNode(NODE['s01-L1'],false); await toSession('s01'); const x2=xpNow(); log('xp first='+(x1-x0)+' replay='+(x2-x1)); if(x2!==x1) throw new Error('replay awarded xp');
  // saved state
  const st=JSON.parse(localStorage.getItem('z100-practice-v4')); if(st.xp!==x2) throw new Error('saved xp '+st.xp+' != '+x2); log('save ok');
  // sheets search
  await click('[data-tab="sheets"]'); setv($('#q'),'cost'); await sleep(5); const n1=$$('[data-sheet]').length; setv($('#q'),'zzzzqq'); await sleep(5);
  log('search cost='+n1+' none='+($('.empty')?'empty-msg':'?')); if(!n1||!$('.empty')) throw new Error('search broken');
  setv($('#q'),''); await sleep(5); if($$('[data-sheet]').length!==24) throw new Error('clear search');
  await click('[data-sheet="s05"]'); if(!$('.sheet h2')) throw new Error('sheet empty'); log('sheet sections '+$$('.sheet h2').length); await click('#back');
  // report copy
  await click('[data-tab="you"]'); await click('#rep'); await sleep(60); log('report: '+(!!$('#repbox textarea')?'textarea fallback':'')+(($('#toast span')||{}).textContent||''));
  // goal setting + preview
  await click('[data-goal="50"]'); if($('[data-goal="50"]').getAttribute('aria-pressed')!=='true') throw new Error('goal');
  await click('#prev'); await click('[data-tab="learn"]'); const locked=$$('.scard.locked').length; log('preview on, locked cards='+locked); if(locked) throw new Error('preview left locked');
  await click('[data-tab="you"]'); await click('#prev');
  // reset
  await click('#reset'); await click('#reset'); await sleep(5); log('after reset: '+$('.hero h1').textContent+' / '+$('.hero-m span').textContent); if(!/0 of/.test($('.hero-m span').textContent)) throw new Error('reset failed');
}

async function openNodeById(id){ if(!pvOn && SESS[NODE[id].sid].n>1){ await preview(); pvOn=true; } await toSession(NODE[id].sid); await click(nodeBtn(id)); }
async function advanceUntil(pred,max){ for(let g=0;g<(max||120);g++){ if(pred()) return true; await step(true); } throw new Error('advanceUntil exhausted at '+screen()); }
async function playFirst(sid,count,wrongFirst){
  const s=SESS[sid];
  for(let i=0;i<count&&i<s.nodes.length;i++){ await toSession(sid); await playNode(s.nodes[i], wrongFirst&&['learn','practice','recall'].includes(s.nodes[i].kind)); }
  await toSession(sid);
}
async function preview(){ await click('[data-tab="you"]'); await click('#prev'); await click('[data-tab="learn"]'); }
function findTeach(pred){ for(const s of D.sessions) for(const n of s.nodes) for(const i of (n.items||[])) if(i.type==='teach'&&pred(i,n,s)) return {item:i,node:n,s}; return null; }
function findItem(type,pred){ for(const s of D.sessions) for(const n of s.nodes) for(const i of (n.items||[])) if(i.type===type&&(!pred||pred(i,n,s))) return {item:i,node:n,s}; return null; }
const scenes={
  learn0:async()=>{},
  learnmid:async()=>{ await playFirst('s01',9,true); await playFirst('s02',9,false); await playFirst('s03',4,false); await click('[data-tab="learn"]'); },
  session:async()=>{ await playFirst('s01',9,true); await playFirst('s02',5,false); },
  teach:async()=>{ await openNodeById('s04-L1'); await advanceUntil(()=>screen()==='teach'); },
  teachpara:async()=>{ await openNodeById('s01-L1'); await advanceUntil(()=>screen()==='teach'); },
  table:async()=>{ const f=findTeach((i,n,s)=>s.n>=4&&i.blocks&&i.blocks.some(b=>b.t==='table'&&b.headers.length>=4)); log('table in '+f.node.id+' '+f.item.title); await openNodeById(f.node.id); await advanceUntil(()=>screen()==='teach'&&$('h1.bigt').textContent===f.item.title); },
  intro:async()=>{ await openNodeById('s05-P1'); },
  mcq:async()=>{ await openNodeById('s05-P1'); await advanceUntil(()=>screen()==='mcq'); await click($$('.opt[data-k]')[1]); },
  mcq_wrong:async()=>{ await openNodeById('s05-P1'); await advanceUntil(()=>screen()==='mcq'); const q=MCQ[$('.stem').textContent][0]; const other=$$('.opt[data-k]').find(o=>o.dataset.k!==q.key); await click(other); await click('#primary'); },
  mcq_right:async()=>{ await openNodeById('s05-P1'); await advanceUntil(()=>screen()==='mcq'); const q=MCQ[$('.stem').textContent][0]; await click('.opt[data-k="'+q.key+'"]'); await click('#primary'); },
  fill:async()=>{ const f=findItem('fill',(i,n,s)=>s.n>=5&&!i.numeric&&i.answers.length===1); await openNodeById(f.node.id); await advanceUntil(()=>screen()==='fill'); setv($('.blank'),'half'); },
  fill_wrong:async()=>{ const f=findItem('fill',(i,n,s)=>s.n>=5&&!i.numeric&&i.answers.length===1); await openNodeById(f.node.id); await advanceUntil(()=>screen()==='fill'); setv($('.blank'),'zzz'); await click('#primary'); },
  match:async()=>{ const f=findItem('match',(i,n,s)=>s.n>=5); await openNodeById(f.node.id); await advanceUntil(()=>screen()==='match'); await click('[data-l="1"]'); await click('[data-r="1"]'); await click('[data-l="0"]'); },
  order:async()=>{ const f=findItem('order',(i,n,s)=>s.n>=5); await openNodeById(f.node.id); await advanceUntil(()=>screen()==='order'); await click('[data-o="0"]'); await click('[data-o="1"]'); },
  flash:async()=>{ const f=findItem('flash',(i,n,s)=>s.n>=5); await openNodeById(f.node.id); await advanceUntil(()=>screen()==='flash'); await click('#primary'); },
  task:async()=>{ await openNodeById('s01-W'); },
  done3:async()=>{ await playFirst('s05',0); await openNodeById('s05-P1'); await playLesson(false); },
  done_badge:async()=>{ await openNodeById('s01-L1'); await playLesson(false); },
  done_wrong:async()=>{ await openNodeById('s05-P1'); await playLesson(true); },
  review:async()=>{ await playFirst('s01',9,true); await click('[data-tab="review"]'); },
  sheets:async()=>{ await click('[data-tab="sheets"]'); },
  sheet:async()=>{ await click('[data-tab="sheets"]'); await click('[data-sheet="s05"]'); },
  you:async()=>{ await playFirst('s01',9,true); await playFirst('s02',9,false); await click('[data-tab="you"]'); },
  gate:async()=>{ await preview(); await toSession('s03'); await click('[data-node="gate-L1"]'); const cs=$$('.gc'); cs[0].checked=true; cs[0].dispatchEvent(new Event('change',{bubbles:true})); cs[1].checked=true; cs[1].dispatchEvent(new Event('change',{bubbles:true})); },
  fresh:async()=>{},
  levelup:async()=>{ await preview(); await toSession('s03'); await click('[data-node="gate-L1"]'); $$('.gc').forEach(c=>{ c.checked=true; c.dispatchEvent(new Event('change',{bubbles:true})); }); await click('#primary'); },
};

function nodeOfKind(kind,n){ for(const s of D.sessions) if(s.n>=(n||1)) for(const x of s.nodes) if(x.kind===kind) return x; }
scenes.task=async()=>{ const n=nodeOfKind('task',5); await openNodeById(n.id); const el=$('[data-p]'); if(el&&el.tagName!=='SELECT'&&el.type!=='checkbox') setv(el,'a few words typed here'); };
scenes.case=async()=>{ const n=nodeOfKind('case',5); await openNodeById(n.id); setv($('#ans'),'My answer starts with the cheapest check and then names the evidence I would open.'); };
scenes.case_rev=async()=>{ const n=nodeOfKind('case',5); await openNodeById(n.id); setv($('#ans'),'My answer starts with the cheapest check and then names the evidence I would open.'); await click('#primary'); };
scenes.question=async()=>{ const n=nodeOfKind('question',5); await openNodeById(n.id); setv($('#verdict'),'It held up on the numbers but guessed one date.'); };
scenes.sheetsearch=async()=>{ await click('[data-tab="sheets"]'); setv($('#q'),'cost'); };


function mcqIn(level){ for(const s of D.sessions) if(s.level===level) for(const x of s.nodes) for(const i of (x.items||[])) if(i.type==='mcq') return x; }
for(const L of [3,4,5]){
  scenes['mcqw'+L]=async()=>{ const n=mcqIn(L); await openNodeById(n.id); await advanceUntil(()=>screen()==='mcq'); const q=MCQ[$('.stem').textContent][0]; const other=$$('.opt[data-k]').find(o=>o.dataset.k!==q.key); await click(other); await click('#primary'); };
  scenes['mcqr'+L]=async()=>{ const n=mcqIn(L); await openNodeById(n.id); await advanceUntil(()=>screen()==='mcq'); const q=MCQ[$('.stem').textContent][0]; await click('.opt[data-k="'+q.key+'"]'); await click('#primary'); };
  scenes['intro'+L]=async()=>{ const n=mcqIn(L); await openNodeById(n.id); };
}
// ---- learning-method scenes ----
const first9=async(sid,wf)=>{ await playFirst(sid,9,wf); };
scenes.pretest=async()=>{ await openNodeById('s05-PR'); await advanceUntil(()=>screen()==='mcq'); await click($$('.opt[data-k]')[1]); };
scenes.pretest_fb=async()=>{ await scenes.pretest(); await click('#primary'); };
scenes.hint=async()=>{ await openNodeById('s05-AP'); await advanceUntil(()=>screen()==='mcq'); await click('#hint'); };
scenes.hint0=async()=>{ await openNodeById('s05-AP'); await advanceUntil(()=>screen()==='mcq'); };
scenes.conf=async()=>{ await openNodeById('s05-CK'); await advanceUntil(()=>screen()==='mcq'); await click($$('.opt[data-k]')[1]); };
scenes.conf_fb=async()=>{ await openNodeById('s05-CK'); await advanceUntil(()=>screen()==='mcq'); const q=MCQ[$('.stem').textContent][0]; const other=$$('.opt[data-k]').find(o=>o.dataset.k!==q.key); await click(other); await click('[data-conf="sure"]'); await click('#primary'); };
scenes.explain=async()=>{ await openNodeById('s05-CK'); await advanceUntil(()=>screen()==='explain'); setv($('#expl'),'The model reads the whole prompt, and it can only use what is in the window, so I check the output against my own source before I rely on it.'); };
scenes.explain_rev=async()=>{ await scenes.explain(); await click('#primary'); const c=$$('[data-pt]'); c[0].checked=true; c[0].dispatchEvent(new Event('change',{bubbles:true})); };
scenes.master_done=async()=>{ await openNodeById('s05-CK'); await playLesson(false); };
scenes.master_gap=async()=>{ await openNodeById('s05-CK'); await playAllWrong(); };
scenes.master_gap2=async()=>{ await scenes.master_gap(); await click('#primary'); await playAllWrong(); };
scenes.due=async()=>{ await first9('s01',true); window.__skew+=2*DAY; await click('[data-tab="learn"]'); };
scenes.due_intro=async()=>{ await scenes.due(); await click('#dueGo'); };
scenes.due_q=async()=>{ await scenes.due_intro(); await click('#primary'); };
scenes.warm=async()=>{ await playFirst('s01',12,true); window.__skew+=DAY; await toSession('s02'); };
scenes.warm_q=async()=>{ await playFirst('s01',12,true); window.__skew+=DAY; await toSession('s02'); await click(nodeBtn('s02-U')); await click('#primary'); };
scenes.cp=async()=>{ await preview(); await openNodeById('s03-CP'); };
scenes.cp_q=async()=>{ await scenes.cp(); await click('#primary'); };
scenes.cp_done=async()=>{ await preview(); await openNodeById('s03-CP'); await playLesson(true); };
scenes.you2=async()=>{ await playFirst('s01',12,true); window.__skew+=DAY; await playFirst('s02',10,false); window.__skew+=2*DAY; await click('[data-tab="you"]'); const lh=$('.lh'); log('lh top='+(lh?Math.round(lh.getBoundingClientRect().top+scrollY):'none')); };
scenes.session2=async()=>{ await playFirst('s01',12,true); window.__skew+=DAY; await toSession('s02'); };
scenes.session_mid=async()=>{ await first9('s01',false); await toSession('s01'); };
for(const k of ['flow','loop','stack','compare','bars','tree','quad']){
  scenes['dg_'+k]=async()=>{
    const f=findTeach((i,n,s)=>(s.n===1||s.n>=4)&&(i.blocks||[]).some(b=>b.t==='diagram'&&b.kind===k)); if(!f) throw new Error('no diagram '+k);
    log('diagram '+k+' in '+f.node.id+' '+f.item.title);
    await openNodeById(f.node.id); await advanceUntil(()=>screen()==='teach'&&$('h1.bigt').textContent===f.item.title);
    const d=$('.dg'); if(!d) throw new Error('no .dg rendered'); log('dg classes='+d.className+' svg/html children='+d.children.length); const sg=$('.dg-bar .dgseg'); if(sg){ const r=sg.getBoundingClientRect(), br=$('.dg-bar').getBoundingClientRect(); const cs=getComputedStyle(sg); log('seg h='+r.height+' bar h='+br.height+' transform='+cs.transform+' anim='+cs.animationName+' disp='+cs.display+' selfalign='+cs.alignSelf); }
  };
  scenes['sheetdg_'+k]=async()=>{
    const f=findTeach((i,n,s)=>(i.blocks||[]).some(b=>b.t==='diagram'&&b.kind===k)); await click('[data-tab="sheets"]'); await click('[data-sheet="'+f.s.id+'"]');
    const d=$('.dg'); if(!d) throw new Error('no .dg in sheet'); d.scrollIntoView();
  };
}

scenes.dg_loop5=async()=>{ const f=findTeach((i,n,s)=>s.id==='s19'&&(i.blocks||[]).some(b=>b.t==='diagram'&&b.kind==='loop')); await openNodeById(f.node.id); await advanceUntil(()=>screen()==='teach'&&$('h1.bigt').textContent===f.item.title); };
scenes.dg_loop3=async()=>{ const f=findTeach((i,n,s)=>s.id==='s14'&&(i.blocks||[]).some(b=>b.t==='diagram'&&b.kind==='loop')); await openNodeById(f.node.id); await advanceUntil(()=>screen()==='teach'&&$('h1.bigt').textContent===f.item.title); };


// ---- journey scenes (onboarding, placement, session brief and close)
scenes.ob0=async()=>{};
scenes.ob1=async()=>{ await click('#obnext'); };
scenes.ob2=async()=>{ await scenes.ob1(); await click('[data-role="2"]'); await click('#obnext'); await click('[data-exp="1"]'); };
scenes.ob3=async()=>{ await scenes.ob2(); await click('#obnext'); await click('[data-goal="1"]'); };
scenes.ob4=async()=>{ await scenes.ob3(); await click('#obnext'); await click('[data-ex="0"]'); };
scenes.ob5=async()=>{ setv($('#obname'),'Sam'); await scenes.ob4(); await click('#obnext'); };
scenes.place=async()=>{ await scenes.ob5(); await click('#obplace'); };
scenes.place_q=async()=>{ await scenes.place(); await click('#p2'); await click('#primary'); await click($$('.opt[data-k]')[0]); await click('#primary'); };
scenes.place_done=async()=>{ await scenes.place(); await click('#p2'); await runPlacement(2); };
scenes.hook=async()=>{ await click('#obSkip'); await preview(); await toSession('s09'); };
scenes.debrief=async()=>{ await click('#obSkip'); await playFirst('s01',D.sessions[0].nodes.length-1,false); await click(nodeBtn('s01-Q')); await playQuestion(); };
scenes.sessdone=async()=>{ await scenes.debrief(); await click('#back'); window.scrollTo(0,document.body.scrollHeight); };
scenes.you_setup=async()=>{ await scenes.ob5(); await click('#obgo'); await click('[data-tab="you"]'); };
scenes.learn_ph=async()=>{ await scenes.ob5(); await click('#obgo'); };


// ---- references
scenes.shelf=async()=>{ await preview(); await toSession('s17'); const d=$('.shelf'); d.open=true; d.scrollIntoView(); };
scenes.library=async()=>{ await click('[data-tab="sheets"]'); await click('#libGo'); };
scenes.library_f=async()=>{ await scenes.library(); await click('[data-lk="deep"]'); await click('[data-ll="4"]'); $$('[data-ref]').forEach(a=>a.addEventListener('click',e=>e.preventDefault())); await click($$('[data-ref]')[0]); };

scenes.duetest=async()=>{
  await playFirst('s01',12,true); window.__skew+=2*DAY; await click('[data-tab="learn"]');
  const h2=$('.duec2 h2'); if(!h2) throw new Error('no due card'); const n0=parseInt(h2.textContent,10); log('due before: '+n0);
  await click('#dueGo'); await playLesson(true); if(!/Review done/.test($('.bigt').textContent)) throw new Error('no review done title: '+$('.bigt').textContent);
  log('due review done: '+$$('.fact').map(f=>f.textContent).join(' | '));
  await click('#primary'); await click('[data-tab="learn"]'); const h3=$('.duec2 h2'); const n1=h3?parseInt(h3.textContent,10):0; log('due after: '+n1);
  if(!(n1<n0)) throw new Error('due did not shrink');
  // box counts on Review tab
  await click('[data-tab="review"]'); log('boxes: '+$$('.bx b').map(b=>b.textContent).join(','));
  // wrong-first answers must land back in box 0 and be due again today
  window.__skew+=3*DAY; await click('[data-tab="learn"]'); const h4=$('.duec2 h2'); log('due after +3 days: '+(h4?h4.textContent:'none'));
};

try{
  await sleep(50);
  const [scene,flag]=mode.split(':');
  if(!/^(onboard|ob\d|place|hook|debrief|sessdone|you_setup|learn_ph)/.test(scene) && $('#obSkip')) await click('#obSkip'); if(flag==='dark') document.documentElement.dataset.theme='dark';
  if(scene==='full') await full();
  else if(scene==='extras') await extras();
  else if(scene==='onboard') await journey();
  else if(/^fld_s\d\d_\d+$/.test(scene)){ const [,sid,ix]=/^fld_(s\d\d)_(\d+)$/.exec(scene); const nd=SESS[sid].nodes.find(n=>n.k==='L3'); const cards=nd.items.filter(i=>i.type==='teach'); const title=cards[+ix].title; await openNodeById(nd.id); await advanceUntil(()=>screen()==='teach'&&$('h1.bigt').textContent===title); await sleep(60); document.getAnimations().forEach(a=>{ try{ if(a.effect.getComputedTiming().iterations!==Infinity) a.finish(); }catch(e){} }); window.scrollTo(0,0); await sleep(60); }
  else if(scenes[scene]){ await scenes[scene](); if(!/^(due|you2|sheetdg)/.test(scene)) window.scrollTo(0,0); await sleep(60); document.getAnimations().forEach(a=>{ try{ if(a.effect.getComputedTiming().iterations!==Infinity) a.finish(); }catch(e){} }); await sleep(30); log('scene '+scene+' screen='+screen()); }
  else if(scene==='smoke'){
    log('scards '+$$('.scard').length+' levels '+$$('.level').length+' gaterows '+$$('.gaterow').length+' hero '+$('.hero h1').textContent);
    for(const t of ['review','sheets','you','learn']){ await click('[data-tab="'+t+'"]'); log(t+' ok: '+(document.querySelector('.page').textContent.length)); }
  }
  log('OK');
}catch(e){ log('FAIL: '+e.message+'\n'+(e.stack||'').split('\n').slice(0,3).join('\n')); }
flush();
})();
