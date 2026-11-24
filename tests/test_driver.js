(async()=>{
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const D=JSON.parse(document.getElementById('course-data').textContent);
window.__cele=[]; new MutationObserver(ms=>{ for(const m of ms) for(const a of m.addedNodes){ if(a.nodeType===1&&a.classList.contains('cele')){ const h=a.querySelector('h2'); window.__cele.push(h?h.textContent:'?'); } } }).observe(document.body,{childList:true});
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const out=[]; let pre=null;
const log=m=>{ out.push(m); flush(); };
function flush(){ if(!pre){ pre=document.createElement('pre'); pre.id='testout'; pre.style.cssText='position:fixed;left:0;top:0;width:0;height:0;overflow:hidden'; document.body.appendChild(pre); } pre.textContent=out.join('\n'); }
window.addEventListener('error',e=>log('PAGE ERROR: '+e.message+' @'+(e.lineno||'')));
const mode=(location.hash||'#full').slice(1);
const realNow=Date.now.bind(Date); window.__skew=0; Date.now=()=>realNow()+window.__skew;
const DAY=864e5;
const SESS={}, NODE={}, MCQ={}, FILL={}, MATCH={}, ORDER={}, FLASH={}, TEACH={}, MIS={};
D.sessions.forEach(s=>{ SESS[s.id]=s; s.nodes.forEach(n=>{ n.id=s.id+'-'+n.k; n.sid=s.id; NODE[n.id]=n; (n.items||[]).forEach(i=>{
  if(i.type==='mcq'){ (MCQ[i.stem]=MCQ[i.stem]||[]).push(i); }
  else if(i.type==='fill'){ FILL[i.stem.split('____').join('')]=i; }
  else if(i.type==='match') MATCH[i.prompt]=i;
  else if(i.type==='order') ORDER[i.prompt]=i;
  else if(i.type==='flash') FLASH[i.term]=i;
  else if(i.type==='teach') TEACH[i.title]=i;
  else if(i.type==='mission') i.steps.forEach(st=>{ MIS[st.scene]=st; });
}); }); });
async function click(s){
  const e=typeof s==='string'?$(s):s; if(!e) throw new Error('missing '+s);
  // a learner dismisses reward pop-ups before doing anything else
  for(let i=0;i<8;i++){ const cd=$('#celeDone'); if(!cd||cd.closest('.modal').contains(e)) break; cd.click(); await sleep(3); }
  e.click(); await sleep(3);
}
function setv(el,v,ev){ el.value=v; el.dispatchEvent(new Event(ev||'input',{bubbles:true})); }
function words(n){ return Array.from({length:n},(_,i)=>'word'+i).join(' '); }
const feet=()=>$('.pfoot')&&$('.pfoot').className;
function screen(){
  if($('.center.done')) return 'done';
  if($('.mscene')||$('.mrecap')) return 'mission';
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
  if(t==='mission'){
    // every third mission starts with the costly move at each step, then replays for the strong ones
    window.__misN=(window.__misN||0)+1; const costlyFirst=(window.__misN%3===1);
    const playAll=async(strong)=>{
      const meters0=$$('.mm-bar').map(b=>+b.getAttribute('aria-valuenow'));
      for(let g=0;g<8;g++){
        if($('.mrecap')) return;
        const st=MIS[$('.mscene p').textContent]; if(!st) throw new Error('unknown mission step: '+$('.mscene p').textContent.slice(0,50));
        const want=st.choices.find(c=>c.r===(strong?2:0)), btn=$$('.opt[data-i]').find(o=>o.querySelector('span:last-child').textContent===want.t);
        if(!btn) throw new Error('mission option not found: '+want.t);
        await click(btn);
        if(!$('.mres')) throw new Error('no consequence shown after a choice');
        const label=$('.mres h3').textContent, wantLabel=strong?'Strong move':'Costly move'; if(label!==wantLabel) throw new Error('mission verdict '+label+' expected '+wantLabel);
        if(!strong && !$('.mbest')) throw new Error('a weak call should show the strong move');
        if($$('.opt[data-i]').some(o=>!o.disabled)) throw new Error('options should lock after a choice');
        await click('#primary');
      }
      throw new Error('mission did not reach its outcome');
    };
    if(costlyFirst){
      await playAll(false);
      if($$('.stars .i.on').length!==1) throw new Error('all costly moves should earn one star, got '+$$('.stars .i.on').length);
      await click('#replay'); if($('.mrecap')||!$('.mscene')) throw new Error('replay did not restart the mission');
    }
    await playAll(true);
    if($$('.stars .i.on').length!==3) throw new Error('all strong moves should earn three stars, got '+$$('.stars .i.on').length);
    if(!$$('.mrecap li').length||!$('.callout')) throw new Error('the outcome should show a recap and a takeaway');
    await click('#primary'); return t;
  }
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
  try{ Object.defineProperty(navigator,'clipboard',{value:{writeText:()=>Promise.reject(new Error('blocked'))},configurable:true}); }catch(e){}
  await click('#rep'); await sleep(60); if(!$('#repbox textarea')) throw new Error('a blocked clipboard did not fall back to a box to copy from');
  log('report box or toast ok: true');
  await gameChecks();
}

// ---- the game layer, after the whole course: rewards, collection, shop, streak freeze
async function gameChecks(){
  const ce=window.__cele, count=re=>ce.filter(x=>re.test(x)).length;
  if(count(/^Session \d+ complete$/)!==24) throw new Error('expected 24 session rewards, saw '+count(/^Session \d+ complete$/));
  if(count(/^Epic card unlocked$/)!==5) throw new Error('expected 5 epic cards, saw '+count(/^Epic card unlocked$/));
  if(count(/^Level \d+: /)<8) throw new Error('only '+count(/^Level \d+: /)+' player level-ups');
  log('rewards ok: '+count(/^Session/)+' session pop-ups, '+count(/^Epic/)+' epic cards, '+count(/^Level \d+: /)+' level-ups, '+count(/^Chest/)+' chests');
  const sp=()=>+$('.hud-sp b').textContent;
  await click('[data-tab="learn"]'); if(!$('.hud')) throw new Error('no HUD on Learn');
  const lvl0=+$('.hud-lv b').textContent; if(lvl0<8) throw new Error('player level only '+lvl0);
  // collection
  await click('[data-tab="you"]'); await click('.gamec [data-go-album]');
  const found=$$('.rcard').length, lack=$$('.lackl li').length; if(found<29) throw new Error('only '+found+' cards found after the whole course'); if(found+lack!==53) throw new Error('album does not account for 53 cards: '+found+' + '+lack);
  if($$('.rcard.r-epic').length!==5) throw new Error('five epic cards expected');
  // shop
  await click('[data-go-shop]'); const bal0=sp(); if(bal0<100) throw new Error('only '+bal0+' Sparks after the whole course');
  const own=id=>$('[data-buy="'+id+'"]').closest('.shopi').querySelector('.own').textContent;
  const hold=id=>+/You hold (\d+)/.exec(own(id))[1];
  await click('[data-buy="boost"]'); if(hold('boost')!==1) throw new Error('booster not added'); if(sp()!==bal0-25) throw new Error('booster price wrong');
  const fz0=hold('freeze'); if(fz0<2){ await click('[data-buy="freeze"]'); if(hold('freeze')!==fz0+1) throw new Error('freeze not added'); }
  const fz1=hold('freeze'); const cards0=+/(\d+) of 53/.exec(own('mystery'))[1];
  await click('[data-buy="mystery"]'); await sleep(5); if(!$('.cele')) throw new Error('mystery chest did not reveal a card');
  await click('#celeDone'); await sleep(5);
  const cards1=+/(\d+) of 53/.exec(own('mystery'))[1]; if(cards1!==cards0+1) throw new Error('mystery chest gave '+(cards1-cards0)+' cards');
  log('shop ok: booster, freeze x'+fz1+', mystery chest');
  // streak freeze: miss one day, then meet the goal
  await click('[data-tab="learn"]'); const flame0=+$('.stat.flame b').textContent;
  if(flame0<1) throw new Error('no streak to protect');
  window.__skew+=DAY; await toLearn(); if(+$('.stat.flame b').textContent!==flame0) throw new Error('a freeze in hand should protect the streak display');
  await click('[data-tab="sheets"]'); await click('#libGo');
  const notes=$$('[data-note].ref').filter(b=>!b.classList.contains('on')).slice(0,18);
  for(const b of notes){ await click(b); await click('#noteDone'); }
  await click('[data-tab="learn"]'); const flame1=+$('.stat.flame b').textContent;
  if(flame1!==flame0+1) throw new Error('streak '+flame0+' -> '+flame1+' after a freeze day, expected +1');
  if(!ce.includes('Streak saved')) throw new Error('no streak-saved pop-up');
  log('streak freeze ok: '+flame0+' -> '+flame1);
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

async function quest(){
  // ---- the source-built step: every session, every card cites its own shelf
  const NEWK=['swim','rings','delta','matrix','ladder','timeline']; const seenK={};
  let cards=0, qs=0;
  for(const s of D.sessions){
    const nd=s.nodes.find(n=>n.k==='L3'); if(!nd) throw new Error('no From the sources step in '+s.id);
    if(nd.kind!=='field') throw new Error('wrong kind '+s.id);
    const urls=new Set((s.refs||[]).map(r=>r.u));
    const t=nd.items.filter(i=>i.type==='teach'), m=nd.items.filter(i=>i.type==='mcq');
    if(t.length<3||t.length>6) throw new Error(s.id+' cards '+t.length); if(m.length!==4) throw new Error(s.id+' questions '+m.length);
    if(nd.items[0].type!=='teach') throw new Error(s.id+' should open with a card');
    let hasDg=false;
    for(const c of t){
      const src=(c.blocks||[]).filter(b=>b.t==='src'); if(!src.length) throw new Error(s.id+' card without a source: '+c.title);
      for(const b of src) if(!urls.has(b.url)) throw new Error(s.id+' cites a page not on its shelf: '+b.url);
      for(const b of (c.blocks||[])) if(b.t==='diagram'){ hasDg=true; seenK[b.kind]=(seenK[b.kind]||0)+1; }
    }
    if(!hasDg) throw new Error(s.id+' has no diagram in its sources step');
    cards+=t.length; qs+=m.length;
    if(!s.refs||s.refs.length<7) throw new Error(s.id+' shelf too thin');
  }
  for(const k of NEWK) if(!seenK[k]) throw new Error('no diagram of kind '+k);
  log('sources ok: '+cards+' cards, '+qs+' questions; diagrams '+JSON.stringify(seenK));
  const NT=D.notes||{}; const noteIds=Object.keys(NT); if(noteIds.length<150) throw new Error('only '+noteIds.length+' notes');
  const walk=(o,path)=>{ if(typeof o==='string'){ if(/https?:\/\//.test(o)) throw new Error('web address in the data at '+path+': '+o.slice(0,60)); } else if(Array.isArray(o)) o.forEach((x,i)=>walk(x,path+'['+i+']')); else if(o&&typeof o==='object') for(const k in o) walk(o[k],path+'.'+k); };
  walk(D.sessions,'sessions'); walk(D.levels,'levels'); walk(NT,'notes');
  for(const s of D.sessions) for(const r of s.refs) if(!NT[r.id]) throw new Error('shelf entry without a note '+s.id+' '+r.t);
  const thinNotes=noteIds.filter(id=>!NT[id].pts.length&&!NT[id].lead).length; if(thinNotes>3) throw new Error(thinNotes+' empty notes');
  log('notes ok: '+noteIds.length+' notes, no web address anywhere in the data');

  // ---- every new diagram type draws
  for(const k of NEWK){
    const f=findTeach((i,n,s)=>n.k==='L3'&&(i.blocks||[]).some(b=>b.t==='diagram'&&b.kind===k));
    await openNodeById(f.node.id); await advanceUntil(()=>screen()==='teach'&&$('h1.bigt').textContent===f.item.title);
    const fig=$('.dg.dg-'+k); if(!fig) throw new Error('diagram '+k+' did not draw');
    const parts={swim:'.dgs-msg',rings:'.dgr',delta:'.dgd',matrix:'.dg-mx td',ladder:'.dgl-bar',timeline:'.dg-tl li'}[k];
    if(!fig.querySelector(parts)) throw new Error('diagram '+k+' has no '+parts);
    await click('#quit'); if($('.modal')) await click('#quitok'); await toLearn();
  }
  log('new diagrams draw: '+NEWK.join(', '));

  // ---- home: the trail and the daily quests
  await toLearn();
  if($$('.mtrail .mt-g').length!==5) throw new Error('trail groups '+$$('.mtrail .mt-g').length);
  if($$('.mtrail .mt-d').length!==24) throw new Error('trail dots '+$$('.mtrail .mt-d').length);
  if($$('.mtrail .mt-z').length!==1) throw new Error('trail needs exactly one Zed');
  if($$('.questc li').length!==3||$$('.questc li.on').length) throw new Error('daily quests should start empty');
  if(document.querySelector('a[href]')) throw new Error('a link on the home screen');
  log('home ok: trail of 24 stops with one Zed, 3 daily quests');

  // ---- a session is a quest in four phases
  await toSession('s01');
  const ph=$$('.phase').map(p=>p.getAttribute('data-ph')); if(ph.join()!=='learn,apply,prove,use') throw new Error('phases '+ph.join());
  if(!$('.pstrip')) throw new Error('no phase strip'); if($$('.zwalk').length!==1) throw new Error('Zed should stand on the next step');
  if($('.chest.ready')) throw new Error('a chest is ready before any step is done');
  const learnIds=['s01-PR','s01-L1','s01-L2','s01-L3','s01-W'];
  for(let i=0;i<learnIds.length;i++){ await toSession('s01'); await playNode(NODE[learnIds[i]],false); }
  if(!$('.pclear')) throw new Error('finishing the Learn phase should show a ribbon'); if(!$('.pstrip .pp.done')) throw new Error('strip does not show Learn done');
  log('phase cleared ribbon: '+$('.pclear').textContent.slice(0,70));
  await click('#back'); const cb=$('.chest.ready[data-chest="s01-learn"]'); if(!cb) throw new Error('no chest after the Learn phase');
  const x0=xpNow(); await click(cb); await sleep(5); const x1=xpNow(); if(x1-x0!==10) throw new Error('chest paid '+(x1-x0));
  if($('.chest.ready[data-chest="s01-learn"]')||!$('.phase[data-ph="learn"] .chest.opened')) throw new Error('chest did not close after opening');
  const cm=$('.cele'); if(!cm||!/Chest opened/.test(cm.textContent)) throw new Error('opening a chest should show a reward pop-up');
  if(!/\+10 XP/.test(cm.textContent)||!/\+5 Sparks/.test(cm.textContent)) throw new Error('chest pop-up does not list its rewards: '+cm.textContent.slice(0,80));
  if(!cm.querySelector('.rcard')) throw new Error('a chest in session 1 should drop a rule card');
  log('chest +10 XP, +5 Sparks and a rule card, opened once');

  // ---- daily quests fill as you work
  if($$('.questc li.on').length) { /* the home card is not on this screen */ }
  await toLearn(); if(!document.querySelector('.questc')) await toLearn(); let on=$$('.questc li.on').length; if(on!==1) throw new Error('after a step, 1 quest should be done, got '+on);
  await toSession('s01'); await playNode(NODE['s01-P1'],false); await toLearn(); if(!document.querySelector('.questc')) await toLearn(); on=$$('.questc li.on').length; if(on!==2) throw new Error('after practice, 2 quests, got '+on);
  await toSession('s01'); if(document.querySelector('a[href]')) throw new Error('a link on the session page');
  const link=$('.shelf [data-note]'); const r0=xpNow(); await click(link); await sleep(5);
  const md=$('.notem'); if(!md) throw new Error('a source note did not open in the app'); if(($('.notem .nbody').textContent||'').length<200) throw new Error('note body is empty');
  if(md.querySelector('a[href]')) throw new Error('a link inside a note'); if(!/Extracted from/.test(md.textContent)) throw new Error('note has no plain-text provenance');
  if(xpNow()-r0!==2) throw new Error('reading a note paid '+(xpNow()-r0)); await click('#noteDone'); if($('.notem')) throw new Error('note did not close');
  const r1=xpNow(); await click(link); await sleep(5); if(xpNow()!==r1) throw new Error('second read paid XP'); document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})); await sleep(5); if($('.notem')) throw new Error('Escape did not close the note');
  if(!$('.shelf .ref.on')) throw new Error('read state not shown');
  await toLearn(); if(!document.querySelector('.questc')) await toLearn(); if($$('.questc li.on').length!==3) throw new Error('all three quests should be done'); const dq=$('#dqChest'); if(!dq) throw new Error('no daily chest');
  const q0=xpNow(); await click(dq); await sleep(5); if(xpNow()-q0!==20) throw new Error('daily chest paid '+(xpNow()-q0));
  if($('#dqChest')||!/Chest opened today/.test($('.questc').textContent)) throw new Error('daily chest did not close');
  log('daily quests: 3 of 3, chest +20 XP');

  // ---- the reference library
  await click('[data-tab="sheets"]'); await click('#libGo'); const all=$$('[data-note].ref').length; if(all<150) throw new Error('library lists '+all); if(document.querySelector('a[href]')) throw new Error('a link in the library');
  await click('[data-lk="deep"]'); const deep=$$('[data-note].ref').length; if(!(deep>0&&deep<all)) throw new Error('kind filter broke: '+deep+' of '+all);
  await click('[data-lk="all"]'); await click('[data-ll="5"]'); const l5=$$('[data-note].ref').length; if(!(l5>0&&l5<all)) throw new Error('level filter broke');
  await click('[data-ll="0"]'); setv($('#lq'),'cache_creation_input_tokens'); await sleep(5); const hit=$$('[data-note].ref').length; if(!(hit>0&&hit<all)) throw new Error('search broke: '+hit);
  const sheetHit=(()=>{ return true; })();

  // ---- keyboard and Back: a dialog traps focus, the Back button stays in the app, progress backs up and restores
  const opener=$('[data-note].ref'); opener.focus(); await click(opener);
  if(!$('.notem')) throw new Error('note did not open'); if(!document.getElementById('app').inert) throw new Error('the page behind a note is not inert');
  const kd=(k,sh)=>document.dispatchEvent(new KeyboardEvent('keydown',{key:k,shiftKey:!!sh,bubbles:true}));
  $('#noteDone').focus(); kd('Tab'); if(document.activeElement.id!=='noteX') throw new Error('Tab did not wrap to the first control');
  kd('Tab',true); if(document.activeElement.id!=='noteDone') throw new Error('Shift+Tab did not wrap to the last control');
  kd('Escape'); await sleep(5); if($('.notem')||document.getElementById('app').inert) throw new Error('Escape did not close the note and free the page behind it');
  if(document.activeElement!==opener) throw new Error('focus did not return to the control that opened the note');
  const pop=async()=>{ window.dispatchEvent(new PopStateEvent('popstate')); await sleep(10); };
  await pop(); if(!$('[data-tab="learn"].on')) throw new Error('Back from the library did not return to Learn');
  await toSession('s01'); await pop(); if(!$('[data-tab="learn"].on')) throw new Error('Back from a session did not return to Learn');
  await openNodeById('s01-P1'); await advanceUntil(()=>screen()==='mcq'); await pop();
  if(!$('.modal')) throw new Error('Back inside a question should ask before quitting'); await pop();
  if($('.modal')||screen()!=='mcq') throw new Error('Back should close the quit prompt and stay in the question');
  await pop(); await click('#quitok'); if($('.pbody')) throw new Error('quitting from the prompt did not leave the question');
  log('keyboard and Back ok: focus trap, Escape, focus returned, Back from library, session and question');
  await toLearn(); await click('[data-tab="you"]');
  const xpB=xpNow(), raw=localStorage.getItem('z100-practice-v4'); if(!raw||xpB<1) throw new Error('nothing to back up');
  const bytes=new TextEncoder().encode(raw); let bin=''; for(let i=0;i<bytes.length;i++) bin+=String.fromCharCode(bytes[i]); const code='Z100.1.'+btoa(bin);
  await click('#bkCopy'); await sleep(5);
  const rs=$('#reset'); await click(rs); await click(rs); await sleep(5); if(xpNow()!==0) throw new Error('reset did not clear XP');
  await click('[data-tab="you"]'); await click('#bkOpen'); setv($('#bkIn'),'not a code'); await click('#bkGo');
  if(!/not a backup code/.test($('#bkMsg').textContent)) throw new Error('a wrong code was not refused: '+$('#bkMsg').textContent);
  setv($('#bkIn'),'Z100.1.%%%'); await click('#bkGo'); if(!/not a backup code/.test($('#bkMsg').textContent)) throw new Error('a garbled code was not refused');
  setv($('#bkIn'),'Z100.1.AAAA'); await click('#bkGo'); if(!$('#bkMsg').textContent) throw new Error('a code with no progress in it was not refused');
  setv($('#bkIn'),code); await click('#bkGo'); await sleep(5);
  if(xpNow()!==xpB) throw new Error('restore gave '+xpNow()+' XP, expected '+xpB); if(localStorage.getItem('z100-practice-v4')===null) throw new Error('restore did not save');
  log('backup ok: code restores '+xpB+' XP after a reset; wrong codes are refused');
  await click('[data-tab="you"]'); await click('[data-theme-set="dark"]'); if(document.documentElement.getAttribute('data-theme')!=='dark') throw new Error('dark theme did not apply');
  if($('[data-theme-set="dark"]').getAttribute('aria-pressed')!=='true') throw new Error('theme control does not show the choice');
  await click('[data-theme-set="light"]'); if(document.documentElement.getAttribute('data-theme')!=='light') throw new Error('light theme did not apply');
  await click('[data-theme-set="auto"]'); if(document.documentElement.hasAttribute('data-theme')) throw new Error('auto theme should follow the device');
  log('theme ok: auto, light and dark');

  // ---- field missions: the data, the meters, the keyboard and the reward
  let nm=0, boss=0;
  for(const s of D.sessions){
    const n=s.nodes.find(x=>x.kind==='mission'); if(!n) throw new Error('no field mission in '+s.id);
    const it=n.items[0]; if(it.type!=='mission') throw new Error('mission item type in '+s.id);
    const levelEnd=s.nodes.some(x=>x.kind==='checkpoint');
    if(!!it.boss!==levelEnd) throw new Error('only level-end sessions have a boss mission: '+s.id);
    if(it.steps.length!==(it.boss?5:3)) throw new Error(s.id+' mission steps '+it.steps.length);
    if(it.ends.length!==3||!it.tip) throw new Error(s.id+' mission needs three endings and a takeaway');
    for(const st of it.steps){ if(st.choices.map(c=>c.r).sort().join('')!=='012') throw new Error(s.id+' step needs one choice of each rating'); }
    nm++; if(it.boss) boss++;
    const ix=s.nodes.indexOf(n); if(s.nodes[ix-1].k!=='AP') throw new Error(s.id+' mission should follow the Apply step');
  }
  if(nm!==24||boss!==5) throw new Error('missions '+nm+', bosses '+boss);
  await toSession('s01'); const mnode=D.sessions[0].nodes.find(x=>x.kind==='mission'), mit=mnode.items[0];
  if(!$('.phase[data-ph="apply"] [data-node="s01-MS"]')) throw new Error('the mission should sit in the Apply phase');
  await openNodeById('s01-MS'); await advanceUntil(()=>screen()==='mission');
  const start0=mit.meters.map(m=>m[2]);
  const st0=MIS[$('.mscene p').textContent], strong0=st0.choices.find(c=>c.r===2);
  await click($$('.opt[data-i]').find(o=>o.querySelector('span:last-child').textContent===strong0.t));
  const now0=$$('.mm-bar').map(b=>+b.getAttribute('aria-valuenow'));
  mit.meters.forEach((m,i)=>{ const want=Math.max(0,Math.min(100,start0[i]+(strong0.fx[m[1]]||0))); if(now0[i]!==want) throw new Error('meter '+m[0]+' is '+now0[i]+', expected '+want); });
  await click('#primary'); document.dispatchEvent(new KeyboardEvent('keydown',{key:'1',bubbles:true})); await sleep(5);
  if(!$('.mres')) throw new Error('key 1 did not choose an option in a mission');
  await click('#quit'); if(!$('#quitok')) throw new Error('quitting a mission mid-way should ask first'); await click('#stay');
  // finish it with the strong move at every step: three stars and the reward
  await click('#primary');
  const playStrong=async()=>{ for(let g=0;g<4&&!$('.mrecap');g++){ const st=MIS[$('.mscene p').textContent]; const w=st.choices.find(c=>c.r===2); await click($$('.opt[data-i]').find(o=>o.querySelector('span:last-child').textContent===w.t)); await click('#primary'); } };
  await playStrong(); if(!$('.mrecap')) throw new Error('mission did not reach its outcome');
  await click('#replay'); await playStrong(); if($$('.stars .i.on').length!==3) throw new Error('the replay with every strong move should earn three stars');
  await click('#primary'); await sleep(5);
  if(screen()!=='done') throw new Error('finishing a mission should show the done screen');
  const facts=$$('.fact').map(f=>f.textContent).join(' | '); if(!/\+38XP/.test(facts)||!/3 of 3Stars/.test(facts)||!/\+9Sparks/.test(facts)) throw new Error('mission reward facts wrong: '+facts);
  log('missions ok: 24 missions, 5 bosses, meters, keys, quit prompt, reward '+facts);
  log('library ok: '+all+' entries, deep '+deep+', level 5 '+l5+', body search for a phrase inside a note '+hit);

  // ---- a source step plays through like any other, and the sheet carries the shelf
  await openNodeById('s02-L3'); await advanceUntil(()=>screen()==='teach'&&!!$('.srcb'));
  const ttl=$('h1.bigt').textContent; await click('.srcb'); if(!$('.notem')) throw new Error('lesson source line did not open a note'); await click('#noteX');
  if($('.notem')||screen()!=='teach'||$('h1.bigt').textContent!==ttl) throw new Error('closing the note should return to the same lesson card');
  if(document.querySelector('a[href]')) throw new Error('a link in a lesson'); log('lesson source note opens and closes in place: '+ttl);
  await click('#quit'); if($('.modal')) await click('#quitok'); await toLearn();
  await toSession('s02'); await playNode(NODE['s02-L3'],false); if(!$('.center.done')) throw new Error('source step did not finish'); log('source step played through: s02-L3');
  await toLearn(); await click('[data-tab="sheets"]'); await click('[data-sheet="s09"]'); if(!$('.shelf[open]')) throw new Error('study sheet has no open shelf');
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


// ---- the journey layer
scenes.quest=async()=>{ await playFirst('s01',5,false); };
scenes.quest_chest=async()=>{ await playFirst('s01',5,false); window.scrollTo(0,420); };
scenes.phase_done=async()=>{ await playFirst('s01',4,false); await click(nodeBtn('s01-W')); await playLesson(false); };
scenes.trail=async()=>{ await playFirst('s01',12,false); window.__skew+=DAY; await playFirst('s02',6,false); await click('[data-tab="learn"]'); };


// ---- source notes (the in-app reader)
scenes.note=async()=>{ await preview(); await toSession('s17'); await click($('.shelf [data-note]')); };
scenes.note_tbl=async()=>{ await preview(); await toSession('s03'); const b=$$('.shelf [data-note]').find(x=>/Effort/.test(x.textContent)); await click(b); };
scenes.note_lesson=async()=>{ const f=findTeach((i,n,s)=>n.k==='L3'&&s.id==='s17'&&(i.blocks||[]).some(b=>b.t==='src')); await openNodeById(f.node.id); await advanceUntil(()=>screen()==='teach'&&!!$('.srcb')); await click('.srcb'); };

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
  else if(scene==='quest') await quest();
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
