/* ================= PROMPT DOCTOR: write a prompt, see which habits it shows =================
   A checker, not a judge. It looks for signs of each habit from sessions 4 and 5 in the learner's own text and lights them up as they type.
   It runs entirely in the page. A good prompt can miss a check and a weak one can pass, so the advice is always: test it on real cases. */
IC.doctor='<path d="M12 4v16M4 12h16"/><rect x="3.500" y="3.500" width="17" height="17" rx="5"/>';
var DOC_EX={
  weak:'Write a good reply to this complaint. Don\'t be wordy. Don\'t be rude. Never promise a refund.',
  strong:'You are a support lead writing for customers who are already upset, so the reply must calm them first.\n\n<complaint>\n[paste the complaint here]\n</complaint>\n\nWrite two short paragraphs, under 120 words, because agents read these on mobile. Start by saying what went wrong in the customer\'s own words, then say what we will do next. Only use the refund policy below; if it does not cover the case, say so and offer a call.\n\n<policy>\n[paste the refund policy here]\n</policy>\n\n<example>\nComplaint: The parcel arrived late and damaged.\nReply: I am sorry the parcel came late and damaged. I have sent a replacement today, and you will get a tracking link within the hour.\n</example>\n\nIt is good when the reply names the problem, gives one next step and never invents a policy.'
};
var DOC_CHECKS=[
  {id:'aud', name:'Audience and purpose', hint:'Say who it is for and what it must achieve.', sess:4, re:/\b(audience|readers?|customers?|clients?|executives?|managers?|team|beginners?|written for|aimed at|for (a|an|the|our|my|new|busy|upset) [a-z]+|so that|in order to|goal|purpose|will read|who (is|are))\b/i},
  {id:'ctx', name:'Context or source', hint:'Give the background or the document, ideally in its own tags.', sess:5, re:/(<[a-z_]+>|\b(background|context|here is|here are|below|attached|the following|document|report|data|policy|email|transcript)\b)/i},
  {id:'fmt', name:'Format and length', hint:'Name the shape: a table, bullets, a word limit, a number of paragraphs.', sess:4, re:/\b(table|bullets?|bullet points|numbered|json|csv|markdown|paragraphs?|headings?|sentences|format|under \d+|no more than \d+|at most \d+|\d+\s*(words|sentences|bullets|lines|items)|one line|short)\b/i},
  {id:'why', name:'A reason for the rule', hint:'Explain why a constraint matters so Claude can handle cases you did not list.', sess:4, re:/\b(because|so that|since|the reason|that way|as (they|it|these|the))\b/i},
  {id:'ex', name:'An example', hint:'Show one or two inputs with the output you want, in example tags.', sess:4, re:/(<example>|\bfor example\b|\be\.g\.|\bexample:|\binput:|\boutput:)/i},
  {id:'tags', name:'Clear structure', hint:'Wrap instructions, documents and examples in separate tags.', sess:4, test:function(t){ return /<([a-z_]+)>[\s\S]*<\/\1>/i.test(t); }},
  {id:'crit', name:'A way to check the result', hint:'Say what good looks like, so you can tell whether it worked.', sess:4, re:/\b(it is good when|good when|must|should|needs? to|make sure|ensure|success|criteria|acceptance|done when|check|verify|include|names?)\b/i},
  {id:'pos', name:'Says what to do', hint:'Lead with what you want, not a list of what to avoid.', sess:4, test:function(t){ var neg=(t.match(/\b(don'?t|do not|never|avoid|without|must not|should not|no)\b/gi)||[]).length, sents=Math.max(1,(t.match(/[.!?\n]+/g)||[]).length); return neg<3 || neg<sents*0.5; }}
];
var DOC_BONUS=[
  {id:'role', name:'A one-line role', hint:'One sentence of role focuses tone and behaviour.', re:/\b(you are (a|an)|act as|as an? [a-z]+ (who|that|for))\b/i},
  {id:'idk', name:'Permission to say it does not know', hint:'Tell Claude what to say when the source lacks the answer. It cuts invented answers.', re:/\b(do not know|don'?t know|not sure|cannot find|can'?t find|say so|if (it|the|there) (does not|doesn'?t|is no|lacks|has no)|not covered)\b/i}
];
function docAnalyze(text){
  var t=String(text||''), wc=words(t);
  var core=DOC_CHECKS.map(function(c){ return {id:c.id, name:c.name, hint:c.hint, sess:c.sess, ok:wc>=4 && (c.test?c.test(t):c.re.test(t))}; });
  var bonus=DOC_BONUS.map(function(c){ return {id:c.id, name:c.name, hint:c.hint, ok:wc>=4 && c.re.test(t)}; });
  var score=core.filter(function(c){ return c.ok; }).length, warn=[];
  var neg=(t.match(/\b(don'?t|do not|never|avoid|without|must not|should not)\b/gi)||[]).length;
  if(wc>=4 && wc<12) warn.push('Very short. Claude will fill every gap with its likeliest guess.');
  if(neg>=3 && !core[7].ok) warn.push('Mostly "don\'t" lines. A negation leaves the target open: say what you want instead.');
  if(wc>=4 && !core[1].ok && !core[0].ok) warn.push('No audience and no source. Claude cannot tell who this is for or what it may rely on.');
  return {core:core, bonus:bonus, score:score, warn:warn, words:wc};
}
var DOC_SKEL={
  aud:'Audience and purpose: [who reads this, and what it must achieve]',
  ctx:'<context>\n[paste the background or the document here]\n</context>',
  fmt:'Format: [the shape and the length, for example two short paragraphs under 120 words]',
  why:'Why it matters: [one reason for your most important rule]',
  ex:'<example>\n[one input, and the output you want]\n</example>',
  tags:'<instructions>\n[the steps, one per line]\n</instructions>',
  crit:'It is good when: [two or three checks you can verify]',
  pos:'Do this: [what you want, said positively]'
};
function doctorView(){
  var d=S.doctor||(S.doctor={best:0,text:'',paid:false}), a=docAnalyze(d.text);
  var h='<div class="narrow doctor"><h1 class="ph">Prompt Doctor</h1><p class="lead">Write or paste a prompt. The checklist lights up for each habit from sessions 4 and 5 that your text shows.</p>'
    +'<p class="hint">A checker, not a judge. It looks for signs of each habit. A good prompt can miss one and a weak one can pass, so always test the prompt on real cases.</p>'
    +'<div class="fld"><label for="dtext">Your prompt</label><textarea id="dtext" class="dtext" spellcheck="false" placeholder="Write a prompt, or try an example below.">'+esc(d.text)+'</textarea></div>'
    +'<div class="duo"><button class="btn ghost small" id="exWeak" type="button">Try a weak example</button><button class="btn ghost small" id="exStrong" type="button">Try a stronger one</button></div>'
    +'<section class="card docc" id="dres" aria-live="polite">'+docResultHTML(a)+'</section>'
    +'<div class="duo"><button class="btn" id="dskel" type="button">Add a skeleton for what is missing</button><button class="btn ghost" id="dclear" type="button">Clear</button></div>'
    +'<p class="fine" id="dnote">Your best so far: '+(d.best||0)+' of 8. The prompt you write here stays in this browser and goes into your playbook.</p>'
    +'<div class="duo"><button class="btn ghost" data-tab-go="sheets">Back to Sheets</button></div></div>';
  setPage(h,'sheets');
  var ta=$('#dtext');
  ta.oninput=function(){ d.text=ta.value; docUpdate(); save(); };
  $('#exWeak').onclick=function(){ ta.value=DOC_EX.weak; ta.oninput(); ta.focus(); };
  $('#exStrong').onclick=function(){ ta.value=DOC_EX.strong; ta.oninput(); ta.focus(); };
  $('#dclear').onclick=function(){ ta.value=''; ta.oninput(); ta.focus(); };
  $('#dskel').onclick=function(){
    var an=docAnalyze(ta.value), add=an.core.filter(function(c){ return !c.ok; }).map(function(c){ return DOC_SKEL[c.id]; });
    if(!add.length) return toast('Every check is lit. Test the prompt on real cases.');
    ta.value=(ta.value.trim()?ta.value.trim()+'\n\n':'')+add.join('\n\n'); ta.oninput(); ta.focus();
    toast('Skeleton added. Replace each [bracket] with your own words.');
  };
  $$('[data-tab-go]').forEach(function(b){ b.onclick=function(){ go({name:b.getAttribute('data-tab-go')}); }; });
}
function docResultHTML(a){
  var pct=Math.round(a.score/8*100), ring=ring_(pct);
  return '<div class="doc-top"><span class="doc-ring" role="img" aria-label="'+a.score+' of 8 habits shown">'+ring+'<b>'+a.score+'<small>/8</small></b></span><div><h2>'+(a.words<4?'Waiting for a prompt':a.score>=7?'Strong prompt':a.score>=5?'Getting there':a.score>=3?'Thin spots':'Needs work')+'</h2><p class="sub">'+a.words+(a.words===1?' word':' words')+(a.words<4?'. Type at least a sentence.':'. '+(8-a.score)+' to go.')+'</p></div></div>'
    +'<ul class="doc-l">'+a.core.map(function(c,i){ return '<li class="'+(c.ok?'on':'')+'" style="--i:'+i+'"><span class="doc-i" aria-hidden="true">'+(c.ok?ic('check'):'')+'</span><span><b>'+esc(c.name)+'</b><small>'+(c.ok?'Shown.':esc(c.hint))+' <em>Session '+c.sess+'</em></small></span><span class="sr">'+(c.ok?'Shown':'Not shown')+'</span></li>'; }).join('')+'</ul>'
    +'<h3 class="mini">Bonus</h3><ul class="doc-l bonus">'+a.bonus.map(function(c,i){ return '<li class="'+(c.ok?'on':'')+'"><span class="doc-i" aria-hidden="true">'+(c.ok?ic('check'):'')+'</span><span><b>'+esc(c.name)+'</b><small>'+(c.ok?'Shown.':esc(c.hint))+'</small></span><span class="sr">'+(c.ok?'Shown':'Not shown')+'</span></li>'; }).join('')+'</ul>'
    +(a.warn.length?'<ul class="doc-w">'+a.warn.map(function(w){ return '<li>'+esc(w)+'</li>'; }).join('')+'</ul>':'');
}
function ring_(pct){ var r=22, c=2*Math.PI*r, off=c*(1-pct/100); return '<svg viewBox="0 0 56 56" aria-hidden="true" style="--full:'+c.toFixed(1)+'"><circle class="rt" cx="28" cy="28" r="'+r+'" stroke-width="6" fill="none"/><circle class="rg" cx="28" cy="28" r="'+r+'" stroke-width="6" fill="none" stroke-dasharray="'+c.toFixed(1)+'" stroke-dashoffset="'+off.toFixed(1)+'" transform="rotate(-90 28 28)" stroke-linecap="round"/></svg>'; }
function docUpdate(){
  var d=S.doctor, a=docAnalyze(d.text), box=$('#dres'); if(!box) return;
  var before=$$('.doc-l li.on',box).map(function(x){ return x.querySelector('b').textContent; });
  box.innerHTML=docResultHTML(a);
  $$('.doc-l:not(.bonus) li.on',box).forEach(function(x){ if(before.indexOf(x.querySelector('b').textContent)<0) x.classList.add('lit'); });
  if(a.score>(d.best||0)){ d.best=a.score; var n=$('#dnote'); if(n) n.textContent='Your best so far: '+d.best+' of 8. The prompt you write here stays in this browser and goes into your playbook.'; }
  if(!d.paid && a.score>=6 && a.words>=30 && d.text!==DOC_EX.strong && d.text!==DOC_EX.weak && !/\[[^\]\n]+\]/.test(d.text)){   // placeholders from the skeleton do not count until they are filled in
    d.paid=true; addXP(10); S.sparks=(S.sparks||0)+3; checkBadges(); toast('Prompt Doctor: 6 of 8 on your own prompt. +10 XP, +3 Sparks'); showPending();
  }
}
function doctorCard(){
  return '<button class="libgo" id="doctorGo"><span class="libi">'+ic('doctor')+'</span><span><b>Prompt Doctor</b><small>Write a prompt and see which habits it shows. Best so far: '+((S.doctor&&S.doctor.best)||0)+' of 8.</small></span>'+ic('arrow')+'</button>';
}
