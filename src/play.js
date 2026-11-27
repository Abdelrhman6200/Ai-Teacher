
/* ================= more ways to play with an idea =================
   Slide (compound, noise), sort (sorter), switch (switch), choose (pick), click (matrix focus) and load (disclose).
   Each is a small model the learner changes and watches. Numbers are maths or are labelled illustrative. They sit inside the same figure as the others,
   so Replay resets them and reduced motion shows the end state at once. */
var PLAYH={}, PLAYB={};
function plRand(n){ return Math.floor(Math.random()*n); }
function plNum(v){ return v<10?(Math.round(v*10)/10).toFixed(1).replace('.0',''):String(Math.round(v)); }

/* ---- compound: a chain of steps that each usually work, and how often the whole chain does ---- */
PLAYH.compound=function(b,id){
  var u=b.unit||'step';
  return '<div class="cp-ctl"><label for="'+id+'p">Chance each '+esc(u)+' works: <b class="cp-pv"></b></label><input id="'+id+'p" type="range" min="50" max="100" value="'+b.p+'">'
    +'<label for="'+id+'n">'+esc(u)+'s in a row: <b class="cp-nv"></b></label><input id="'+id+'n" type="range" min="1" max="'+(b.max||10)+'" value="'+b.n+'"></div>'
    +'<div class="cp-dots" aria-hidden="true"></div>'
    +'<p class="cp-big"><span>Every '+esc(u)+' works</span><b class="cp-res"></b></p><div class="cp-bar" aria-hidden="true"><i></i></div>'
    +'<svg class="cp-svg" viewBox="0 0 320 132" role="img" aria-label="How the chance that every '+esc(u)+' works falls as '+esc(u)+'s are added"></svg>'
    +'<p class="cp-read" role="status" aria-live="polite"></p>'
    +'<div class="x-ctl"><button class="btn ghost small" type="button" data-x="sim">'+ic('refresh')+'Try 100 attempts</button></div><p class="cp-sim" role="status" aria-live="polite"></p>';
};
PLAYB.compound=function(x,b){
  var id=x.getAttribute('data-xid'), P=$('#'+id+'p',x), N=$('#'+id+'n',x), max=Math.max(2,b.max||10), u=b.unit||'step';
  function paint(){
    var p=+P.value/100, n=+N.value, r=Math.pow(p,n), pc=r*100;
    $('.cp-pv',x).textContent=Math.round(p*100)+'%'; $('.cp-nv',x).textContent=n;
    var d=''; for(var i=0;i<n;i++) d+='<span class="cp-d">'+(i?'<i>×</i>':'')+'<em>'+Math.round(p*100)+'%</em></span>'; $('.cp-dots',x).innerHTML=d;
    $('.cp-res',x).textContent=plNum(pc)+'%'; $('.cp-bar i',x).style.width=Math.max(1,pc).toFixed(1)+'%';
    var s='<line class="cp-g" x1="38" x2="312" y1="8" y2="8"/><line class="cp-g" x1="38" x2="312" y1="58" y2="58"/><line class="cp-g" x1="38" x2="312" y1="108" y2="108"/>'
      +'<text class="cp-t" x="33" y="12" text-anchor="end">100%</text><text class="cp-t" x="33" y="62" text-anchor="end">50%</text><text class="cp-t" x="33" y="112" text-anchor="end">0%</text>';
    var pts=[]; for(var k=1;k<=max;k++){ pts.push((38+(k-1)/(max-1)*274).toFixed(1)+','+(8+(1-Math.pow(p,k))*100).toFixed(1)); }
    s+='<polyline class="cp-l" points="'+pts.join(' ')+'"/>';
    var mx=38+(n-1)/(max-1)*274, my=8+(1-r)*100;
    s+='<line class="cp-m" x1="'+mx.toFixed(1)+'" x2="'+mx.toFixed(1)+'" y1="'+my.toFixed(1)+'" y2="108"/><circle class="cp-p" cx="'+mx.toFixed(1)+'" cy="'+my.toFixed(1)+'" r="5"/>'
      +'<text class="cp-t" x="38" y="126">1 '+esc(u)+'</text><text class="cp-t" x="312" y="126" text-anchor="end">'+max+' '+esc(u)+'s</text>';
    $('.cp-svg',x).innerHTML=s;
    var dec=p.toFixed(2), calc=n<=4?Array(n+1).join(dec+' × ').slice(0,-3):dec+' to the power of '+n;
    var need=Math.pow(0.9,1/n)*100;
    $('.cp-read',x).textContent=calc+' = '+(r<0.1?r.toFixed(2):r.toFixed(2))+', so about '+Math.round(pc)+' attempts in 100 get through every '+u+'. Each extra '+u+' multiplies in another chance to fail.'
      +(n>1&&p<1?' To get through all '+n+' '+u+'s nine times in ten, each '+u+' would need to work about '+Math.min(100,Math.ceil(need*10)/10)+'% of the time.':'');
    $('.cp-sim',x).textContent='';
  }
  [P,N].forEach(function(el){ el.oninput=paint; });
  $('[data-x="sim"]',x).onclick=function(){
    var p=+P.value/100, n=+N.value, ok=0; for(var a=0;a<100;a++){ var pass=true; for(var i=0;i<n&&pass;i++) if(Math.random()>=p) pass=false; if(pass) ok++; }
    $('.cp-sim',x).textContent='This try: '+ok+' of 100 attempts got through every '+u+'. The maths says about '+Math.round(Math.pow(p,n)*100)+'. Try again and it moves around.';
  };
  x._replay=function(){ P.value=b.p; N.value=b.n; paint(); };
  paint();
};

/* ---- noise: a small test is a lottery. Ranges, and reruns that change the winner ---- */
PLAYH.noise=function(b,id){
  var ns=b.ns||[20,100,300,1000,3000];
  return xSeg('Number of test cases', ns.map(String), Math.max(0,ns.indexOf(b.n)))
    +'<svg class="ns-svg" viewBox="0 0 320 150" role="img" aria-label="Two scores with their rough 95 percent ranges on a scale from 40 to 100 percent"></svg>'
    +'<p class="ns-read" role="status" aria-live="polite"></p>'
    +'<div class="x-ctl"><button class="btn ghost small" type="button" data-x="rerun">'+ic('refresh')+'Run the eval again</button></div><p class="ns-tally" role="status" aria-live="polite"></p>';
};
PLAYB.noise=function(x,b){
  var ns=b.ns||[20,100,300,1000,3000], cur=Math.max(0,ns.indexOf(b.n)), A=b.a, B=b.b, tally={a:0,b:0,t:0}, last=null;
  function m(v,n){ var p=v/100; return 1.96*Math.sqrt(p*(1-p)/n)*100; }
  function X(v){ return 20+(Math.max(40,Math.min(100,v))-40)/60*284; }
  function row(r,y,label){
    var n=ns[cur], mg=m(r.v,n), lo=r.v-mg, hi=r.v+mg;
    return '<text class="ns-t" x="20" y="'+(y-14)+'">'+esc(r.h)+': '+r.v+'% ± '+Math.round(mg)+'</text>'
      +'<line class="ns-r" x1="'+X(lo).toFixed(1)+'" x2="'+X(hi).toFixed(1)+'" y1="'+y+'" y2="'+y+'"/><line class="ns-c" x1="'+X(lo).toFixed(1)+'" x2="'+X(lo).toFixed(1)+'" y1="'+(y-6)+'" y2="'+(y+6)+'"/><line class="ns-c" x1="'+X(hi).toFixed(1)+'" x2="'+X(hi).toFixed(1)+'" y1="'+(y-6)+'" y2="'+(y+6)+'"/>'
      +'<circle class="ns-d" cx="'+X(r.v).toFixed(1)+'" cy="'+y+'" r="5.5"/>';
  }
  function paint(){
    var n=ns[cur], mgA=m(A.v,n), mgB=m(B.v,n), loB=B.v-mgB, hiA=A.v+mgA, over=hiA-loB, s='';
    for(var t=40;t<=100;t+=10) s+='<line class="ns-g" x1="'+X(t)+'" x2="'+X(t)+'" y1="30" y2="128"/><text class="ns-t" x="'+X(t)+'" y="144" text-anchor="middle">'+t+'%</text>';
    if(over>0) s+='<rect class="ns-o" x="'+X(loB).toFixed(1)+'" y="30" width="'+Math.max(2,X(Math.min(hiA,100))-X(loB)).toFixed(1)+'" height="98"/>';
    s+=row(B,56)+row(A,106);
    if(last) s+='<circle class="ns-s" cx="'+X(last.b).toFixed(1)+'" cy="56" r="5"/><circle class="ns-s" cx="'+X(last.a).toFixed(1)+'" cy="106" r="5"/>';
    $('.ns-svg',x).innerHTML=s;
    var lead=B.v-A.v;
    $('.ns-read',x).textContent=over>0?'With '+n+' cases the two ranges overlap by about '+Math.round(over)+(Math.round(over)===1?' point':' points')+'. A '+lead+'-point lead for '+B.h+' could easily be luck, so you cannot call a winner yet.'
      :'With '+n+' cases the two ranges no longer overlap. A '+lead+'-point lead for '+B.h+' is now more likely to be real. More cases, not a lucky run, is what buys that.';
    $('.ns-tally',x).textContent=tally.t?'Rerun '+tally.t+' time'+(tally.t>1?'s':'')+' with '+n+' cases: '+B.h+' ahead '+tally.b+', '+A.h+' ahead '+tally.a+(tally.t-tally.a-tally.b?', tied '+(tally.t-tally.a-tally.b):'')+(last?'. Latest run: '+A.h+' '+Math.round(last.a)+'%, '+B.h+' '+Math.round(last.b)+'%.':''):'The real rates are fixed at '+A.v+'% and '+B.v+'%. Rerun the eval and watch what a small test says.';
  }
  function binom(n,p){ var k=0; for(var i=0;i<n;i++) if(Math.random()<p) k++; return k/n*100; }
  $$('[data-xs]',x).forEach(function(bt){ bt.onclick=function(){ cur=+bt.getAttribute('data-xs'); $$('[data-xs]',x).forEach(function(o){ o.setAttribute('aria-pressed',o===bt?'true':'false'); }); tally={a:0,b:0,t:0}; last=null; paint(); }; });
  $('[data-x="rerun"]',x).onclick=function(){ var n=ns[cur]; last={a:binom(n,A.v/100),b:binom(n,B.v/100)}; tally.t++; if(last.b>last.a) tally.b++; else if(last.a>last.b) tally.a++; paint(); };
  x._replay=function(){ cur=Math.max(0,ns.indexOf(b.n)); tally={a:0,b:0,t:0}; last=null; $$('[data-xs]',x).forEach(function(o,i){ o.setAttribute('aria-pressed',i===cur?'true':'false'); }); paint(); };
  paint();
};

/* ---- sorter: drag each card into the box it belongs in, or tap a card and then a box ---- */
PLAYH.sorter=function(b,id){
  return '<p class="so-hint">Drag each card into a box, or tap a card and then a box. A box tells you at once if it fits.</p><div class="so-tray" role="group" aria-label="Cards to sort"></div>'
    +'<div class="so-bks" style="--n:'+b.buckets.length+'">'+b.buckets.map(function(k,i){ return '<button type="button" class="so-bk" data-to="'+i+'" aria-label="Put the chosen card in: '+esc(k.h)+'"><b>'+esc(k.h)+'</b>'+(k.s?'<small>'+esc(k.s)+'</small>':'')+'<ul class="so-in"></ul></button>'; }).join('')+'</div>'
    +'<p class="so-read" role="status" aria-live="polite"></p><div class="x-ctl"><button class="btn ghost small" type="button" data-x="again">'+ic('refresh')+'Start again</button></div>';
};
PLAYB.sorter=function(x,b){
  var cards=b.cards, placed, miss, first, sel;
  var tray=$('.so-tray',x), read=$('.so-read',x), bks=$$('.so-bk',x);
  function reset(){ placed=cards.map(function(){ return -1; }); miss=cards.map(function(){ return 0; }); first=0; sel=-1; read.textContent='Pick a card.'; paint(); }
  function paint(){
    tray.innerHTML=cards.map(function(c,i){ return placed[i]<0?'<button type="button" class="so-card'+(sel===i?' sel':'')+'" data-c="'+i+'" aria-pressed="'+(sel===i)+'">'+esc(c.t)+'</button>':''; }).join('');
    bks.forEach(function(bk,bi){ $('.so-in',bk).innerHTML=cards.map(function(c,i){ return placed[i]===bi?'<li>'+esc(c.t)+'</li>':''; }).join(''); });
    $$('.so-card',tray).forEach(function(el){ bindCard(el); });
    var done=placed.filter(function(v){ return v>=0; }).length;
    if(done===cards.length) read.textContent='All sorted. '+first+' of '+cards.length+' went in the right box the first time.'+(first===cards.length?' Nothing slipped.':' The ones that did not are the ones worth a second look.');
  }
  function attempt(ci,bi){
    var c=cards[ci]; if(placed[ci]>=0) return;
    if(c.to===bi){ placed[ci]=bi; if(!miss[ci]) first++; sel=-1; paint(); if(placed.filter(function(v){ return v<0; }).length) read.textContent='Yes. '+c.why; }
    else { miss[ci]++; var el=$('.so-card[data-c="'+ci+'"]',tray); if(el){ el.classList.add('no'); setTimeout(function(){ el.classList.remove('no'); },500); } read.textContent=(miss[ci]>1?'Not that one either. ':'Not that one. ')+(miss[ci]>1?c.why:'Think about what the box says it holds.'); }
  }
  function bindCard(el){
    var ci=+el.getAttribute('data-c');
    el.onclick=function(){ if(el._drag){ el._drag=false; return; } sel=(sel===ci?-1:ci); paint(); if(sel>=0) read.textContent='Now tap the box it belongs in.'; };
    el.onpointerdown=function(e){
      if(e.pointerType==='touch'||e.button>0) return;
      var sx=e.clientX, sy=e.clientY, ghost=null;
      function mv(ev){
        if(!ghost&&Math.abs(ev.clientX-sx)+Math.abs(ev.clientY-sy)>6){ ghost=document.createElement('div'); ghost.className='so-ghost'; ghost.textContent=cards[ci].t; document.body.appendChild(ghost); el._drag=true; el.classList.add('lift'); }
        if(ghost){ ghost.style.left=ev.clientX+'px'; ghost.style.top=ev.clientY+'px'; var u=document.elementFromPoint(ev.clientX,ev.clientY), bk=u&&u.closest&&u.closest('.so-bk'); bks.forEach(function(k){ k.classList.toggle('over',k===bk); }); }
      }
      function up(ev){
        document.removeEventListener('pointermove',mv); document.removeEventListener('pointerup',up);
        if(ghost){ var u=document.elementFromPoint(ev.clientX,ev.clientY), bk=u&&u.closest&&u.closest('.so-bk'); ghost.parentNode.removeChild(ghost); bks.forEach(function(k){ k.classList.remove('over'); }); el.classList.remove('lift'); if(bk) attempt(ci,+bk.getAttribute('data-to')); else setTimeout(function(){ el._drag=false; },0); }
      }
      document.addEventListener('pointermove',mv); document.addEventListener('pointerup',up);
    };
  }
  bks.forEach(function(bk){ bk.onclick=function(){ if(sel>=0) attempt(sel,+bk.getAttribute('data-to')); else read.textContent='Pick a card first, then tap its box.'; }; });
  $('[data-x="again"]',x).onclick=reset; x._replay=reset;
  reset();
};

/* ---- switch: set the controls, then run the tests and see what gets through ---- */
PLAYH['switch']=function(b,id){
  return (b.presets?xSeg('Try a setup',b.presets.map(function(p){ return p.label; }),-1):'')
    +'<div class="sw-ctl">'+b.controls.map(function(c,ci){ return '<div class="sw-c"><span class="sw-h">'+esc(c.h)+(c.s?'<small>'+esc(c.s)+'</small>':'')+'</span><span class="segctl" role="group" aria-label="'+esc(c.h)+'">'+c.states.map(function(s,si){ return '<button type="button" data-c="'+ci+'" data-s="'+si+'" aria-pressed="false">'+esc(s)+'</button>'; }).join('')+'</span></div>'; }).join('')+'</div>'
    +'<div class="sw-tests">'+b.tests.map(function(t,ti){ return '<div class="sw-t" data-t="'+ti+'"><b class="sw-th">'+esc(t.h)+'</b><ol class="sw-steps">'+t.steps.map(function(s){ return '<li><span>'+esc(s.t)+'</span><em class="sw-o"></em></li>'; }).join('')+'</ol><p class="sw-v"></p></div>'; }).join('')+'</div>'
    +'<p class="sw-score" role="status" aria-live="polite"></p>';
};
PLAYB['switch']=function(x,b){
  var st=b.controls.map(function(c){ return c.cur||0; }), by={}; b.controls.forEach(function(c,i){ by[c.id]=i; });
  function outcome(s){
    var o='runs'; (s.by||[]).forEach(function(id){ var c=b.controls[by[id]], v=st[by[id]]; if((c.stops||[]).indexOf(v)>=0) o='stopped'; else if((c.asks||[]).indexOf(v)>=0&&o!=='stopped') o='asks'; });
    return o;
  }
  var WORD={runs:'runs',asks:'asks you',stopped:'stopped'};
  function paint(){
    $$('[data-c]',x).forEach(function(bt){ bt.setAttribute('aria-pressed',(st[+bt.getAttribute('data-c')]===+bt.getAttribute('data-s'))?'true':'false'); });
    var good=0;
    b.tests.forEach(function(t,ti){
      var el=$('.sw-t[data-t="'+ti+'"]',x), outs=t.steps.map(outcome), verdict, cls;
      $$('.sw-steps li',el).forEach(function(li,i){ var s=t.steps[i], o=outs[i], bad=(t.want==='stop')?(s.harm&&o==='runs'):(o==='stopped'); var em=$('.sw-o',li); em.textContent=WORD[o]; em.className='sw-o '+o+(bad?' bad':''); });
      if(t.want==='stop'){
        var hr=t.steps.map(function(s,i){ return s.harm?outs[i]:null; }).filter(Boolean);
        if(hr.indexOf('runs')>=0){ verdict='Gets through. '+(t.fix||''); cls='bad'; }
        else if(hr.indexOf('asks')>=0&&hr.indexOf('stopped')<0){ verdict='You are asked first. That only protects you if you read the request and say no.'; cls='mid'; good++; }
        else { verdict='Stopped. '+(t.ok||''); cls='good'; good++; }
      } else {
        if(outs.indexOf('stopped')>=0){ verdict='Your real work is blocked. '+(t.fix||'A control that stops everything is not a safe setup, it is an unusable one.'); cls='bad'; }
        else if(outs.indexOf('asks')>=0){ verdict='Works, after you approve it.'; cls='mid'; good++; }
        else { verdict='Works. '+(t.ok||''); cls='good'; good++; }
      }
      var v=$('.sw-v',el); v.textContent=verdict; v.className='sw-v '+cls; el.className='sw-t '+cls;
    });
    $('.sw-score',x).textContent=good===b.tests.length?'All '+b.tests.length+' tests behave the way you want.':good+' of '+b.tests.length+' tests behave the way you want. Change a control and watch the tests above.';
  }
  $$('[data-c]',x).forEach(function(bt){ bt.onclick=function(){ st[+bt.getAttribute('data-c')]=+bt.getAttribute('data-s'); paint(); }; });
  $$('[data-xs]',x).forEach(function(bt){ bt.onclick=function(){ var p=b.presets[+bt.getAttribute('data-xs')]; b.controls.forEach(function(c,i){ if(p.set[c.id]!=null) st[i]=p.set[c.id]; }); $$('[data-xs]',x).forEach(function(o){ o.setAttribute('aria-pressed',o===bt?'true':'false'); }); paint(); }; });
  x._replay=function(){ st=b.controls.map(function(c){ return c.cur||0; }); $$('[data-xs]',x).forEach(function(o){ o.setAttribute('aria-pressed','false'); }); paint(); };
  paint();
};

/* ---- pick: a scenario, and the option it points to ---- */
PLAYH.pick=function(b,id){
  return '<div class="pk-card"><span class="pk-n"></span><b class="pk-s"></b></div><p class="pk-root">'+esc(b.root)+'</p>'
    +'<div class="pk-kids" style="--n:'+b.kids.length+'">'+b.kids.map(function(k,i){ return '<button type="button" class="pk-k" data-k="'+i+'"><b>'+esc(k.h)+'</b>'+(k.s?'<span>'+esc(k.s)+'</span>':'')+'</button>'; }).join('')+'</div>'
    +'<p class="pk-read" role="status" aria-live="polite"></p><div class="x-ctl"><button class="btn small" type="button" data-x="next" hidden>Next scenario'+ic('arrow')+'</button><button class="btn ghost small" type="button" data-x="again" hidden>'+ic('refresh')+'Go again</button></div>';
};
PLAYB.pick=function(x,b){
  var i, wrong, first, answered;
  var ks=$$('.pk-k',x), read=$('.pk-read',x), nx=$('[data-x="next"]',x), ag=$('[data-x="again"]',x);
  function show(){
    var c=b.cases[i]; answered=false; wrong={}; nx.hidden=true; ag.hidden=true;
    $('.pk-n',x).textContent='Scenario '+(i+1)+' of '+b.cases.length; $('.pk-s',x).textContent=c.t; read.textContent='Which one fits?';
    ks.forEach(function(k){ k.className='pk-k'; k.disabled=false; });
  }
  ks.forEach(function(k,ki){ k.onclick=function(){
    if(answered) return; var c=b.cases[i];
    if(ki===c.to){ answered=true; k.classList.add('ok'); ks.forEach(function(o){ o.disabled=true; }); if(!Object.keys(wrong).length) first++; read.textContent='Yes. '+c.why;
      if(i<b.cases.length-1) nx.hidden=false; else { read.textContent+=' That is all '+b.cases.length+': '+first+' right first time.'; ag.hidden=false; } }
    else { wrong[ki]=1; k.classList.add('no'); k.disabled=true; read.textContent='Not that one. Read what each option is for, then try again.'; }
  }; });
  nx.onclick=function(){ i++; show(); };
  function again(){ i=0; first=0; show(); }
  ag.onclick=again; x._replay=again; again();
};

/* ---- disclose: what loads, and when ---- */
PLAYH.disclose=function(b,id){
  return xSeg('What is happening', b.tasks.map(function(t){ return t.label; }), 0)
    +'<div class="ds-bar" role="img" aria-label="The layers of a skill, loaded or not"></div><ul class="ds-leg"></ul><p class="ds-read" role="status" aria-live="polite"></p>';
};
PLAYB.disclose=function(x,b){
  var bar=$('.ds-bar',x), leg=$('.ds-leg',x), read=$('.ds-read',x), cur=0, tot=b.layers.reduce(function(a,l){ return a+(l.w||1); },0);
  function paint(){
    var t=b.tasks[cur];
    bar.innerHTML=b.layers.map(function(l,i){ return '<span class="ds-s'+(i<t.loads?' on':'')+' c'+(i%3)+'" style="flex:'+Math.max(1,(l.w||1))+'"><i>'+(i+1)+'</i></span>'; }).join('');
    leg.innerHTML=b.layers.map(function(l,i){ return '<li class="'+(i<t.loads?'on':'')+'"><b>'+esc(l.h)+'</b> <span>'+esc(l.s)+(i<t.loads?'':' (not loaded)')+'</span></li>'; }).join('');
    read.textContent=t.read;
  }
  $$('[data-xs]',x).forEach(function(bt){ bt.onclick=function(){ cur=+bt.getAttribute('data-xs'); $$('[data-xs]',x).forEach(function(o){ o.setAttribute('aria-pressed',o===bt?'true':'false'); }); paint(); }; });
  x._replay=function(){ cur=0; $$('[data-xs]',x).forEach(function(o,i){ o.setAttribute('aria-pressed',i===0?'true':'false'); }); paint(); };
  paint();
};

/* ---- matrix: tap a row or a column heading to focus on it ---- */
function mxBind(f){
  var t=$('.dg-mx',f); if(!t||t._fx) return; t._fx=1;
  var wrap=$('.dg-mxw',f), read=document.createElement('p'); read.className='mx-read'; read.setAttribute('role','status'); read.setAttribute('aria-live','polite'); read.textContent='Tap a row or a column heading to focus on it.'; wrap.parentNode.insertBefore(read,wrap.nextSibling);
  var heads=$$('thead th',t).slice(1), rows=$$('tbody tr',t);
  function level(td){ var d=$('.mxd',td); return d?d.getAttribute('aria-label'):''; }
  function clear(){ $$('.mx-on,.mx-off,.mx-sel',t).forEach(function(e){ e.classList.remove('mx-on','mx-off','mx-sel'); }); }
  function list(pairs){ var by={}; pairs.forEach(function(p){ (by[p[0]]=by[p[0]]||[]).push(p[1]); }); return by; }
  function say(name,pairs,legend){
    var by=list(pairs), keys=Object.keys(by), s=name+': '; var parts=[]; keys.forEach(function(k){ parts.push(k+': '+by[k].join(', ')); }); read.textContent=s+(parts.length?parts.join('. ')+'.':'nothing here.');
  }
  function mk(el,fn){ var bt=document.createElement('button'); bt.type='button'; bt.className='mx-hb'; bt.innerHTML=el.innerHTML; el.innerHTML=''; el.appendChild(bt); bt.onclick=function(){ var on=el.classList.contains('mx-sel'); clear(); if(on){ read.textContent='Tap a row or a column heading to focus on it.'; return; } el.classList.add('mx-sel'); fn(); }; }
  var legendOff=function(l){ return /^(no|not|none)\b/i.test(l); };
  heads.forEach(function(th,ci){ mk(th,function(){
    var pairs=[]; rows.forEach(function(r,ri){ var td=$$('td',r)[ci], lv=level(td); if(td){ td.classList.add('mx-on'); if(lv&&!legendOff(lv)) pairs.push([lv,$('th',r).textContent]); } });
    rows.forEach(function(r){ $$('td',r).forEach(function(td,k){ if(k!==ci) td.classList.add('mx-off'); }); });
    say(th.textContent,pairs);
  }); });
  rows.forEach(function(r){ var th=$('th',r); mk(th,function(){
    var pairs=[]; $$('td',r).forEach(function(td,ci){ var lv=level(td); td.classList.add('mx-on'); if(lv&&!legendOff(lv)) pairs.push([lv,heads[ci].textContent]); });
    rows.forEach(function(o){ if(o!==r) $$('td',o).forEach(function(td){ td.classList.add('mx-off'); }); });
    say(th.textContent,pairs);
  }); });
}
