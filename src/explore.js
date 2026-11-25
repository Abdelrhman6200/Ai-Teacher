/* ================= explorable diagrams: tokens, window, cache, curve =================
   Each one is a small model the learner can poke: sample another token, fill a window, change a block and watch a cache, scrub a forgetting curve.
   The numbers are illustrative and every figure says so. They animate on appear and on Replay, and draw their end state at once for reduced motion. */
var XREG={}, XN=0;
function xReduce(){ try{ return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return false; } }
function xSeg(name, list, cur){
  return '<span class="segctl" role="group" aria-label="'+esc(name)+'">'+list.map(function(o,i){ return '<button type="button" data-xs="'+i+'" aria-pressed="'+(i===cur)+'">'+esc(o)+'</button>'; }).join('')+'</span>';
}
function exploreHTML(b){
  var id='x'+(++XN), k=b.kind; XREG[id]=b;
  var h='<div class="dg-x dg-x-'+k+'" data-xid="'+id+'">';
  if(k==='tokens'){
    h+=xSeg('Prompt version', b.variants.map(function(v){ return v.label; }), 0)
      +'<p class="tk-line"><span class="tk-pre">'+esc(b.prompt)+'</span> <span class="tk-out"></span><span class="tk-caret" aria-hidden="true"></span></p>'
      +'<div class="tk-cands" aria-hidden="true"></div><p class="tk-verdict" role="status" aria-live="polite"></p>'
      +'<div class="x-ctl"><button class="btn ghost small" type="button" data-x="again">'+ic('refresh')+'Sample another</button></div>';
  } else if(k==='window'){
    h+='<div class="wn-bar" role="img" aria-label="The context window, filled by its parts"></div><ul class="wn-leg"></ul>'
      +'<div class="wn-ctl"><label for="'+id+'r">Earlier chat turns in the window: <b class="wn-n"></b></label><input id="'+id+'r" type="range" min="0" max="'+b.max+'" value="'+b.start+'"></div>'
      +'<p class="wn-read" role="status" aria-live="polite"></p><div class="x-ctl"><button class="btn ghost small" type="button" data-x="fresh">'+ic('refresh')+'Summarise and start fresh</button></div>';
  } else if(k==='cache'){
    h+=xSeg('What changes in the second request', b.scenarios.map(function(s){ return s.label; }), 0)
      +'<div class="ch-rows"><div class="ch-row"><span class="ch-l">Request 1</span><div class="ch-blocks" data-r="1"></div></div><div class="ch-row"><span class="ch-l">Request 2</span><div class="ch-blocks" data-r="2"></div></div></div>'
      +'<p class="ch-read" role="status" aria-live="polite"></p>'
      +'<div class="x-ctl"><button class="btn ghost small" type="button" data-x="send">'+ic('arrow')+'Send request 2</button><button class="btn ghost small" type="button" data-x="move"></button></div>';
  } else if(k==='cost'){
    h+=csHTML(b,id);
  } else if(k==='trifecta'){
    h+=xSeg('Try a design', b.presets.map(function(p){ return p.label; }), -1)
      +'<div class="tf-tg">'+b.legs.map(function(l){ return '<button type="button" class="tf-t" aria-pressed="true"><b>'+esc(l.h)+'</b><small>'+esc(l.s)+'</small></button>'; }).join('')+'</div>'
      +'<svg class="tf-svg" viewBox="0 0 320 190" role="img" aria-label="Three overlapping circles: private data, untrusted content and the ability to act"><circle class="tf-c a" cx="122" cy="76" r="58"/><circle class="tf-c b" cx="198" cy="76" r="58"/><circle class="tf-c c" cx="160" cy="128" r="58"/><circle class="tf-core" cx="160" cy="94" r="16"/><text class="tf-l" x="100" y="68" text-anchor="middle">Private data</text><text class="tf-l" x="224" y="68" text-anchor="middle">Untrusted</text><text class="tf-l" x="160" y="162" text-anchor="middle">Can act or send</text></svg>'
      +'<p class="tf-read" role="status" aria-live="polite"></p><div class="tf-fix x-ctl"></div>';
  } else if(k==='curve'){
    h+='<svg class="cv-svg" viewBox="0 0 320 204" role="img" aria-label="Memory strength over 30 days, with and without spaced review"></svg>'
      +'<div class="cv-ctl"><label for="'+id+'r">Days since you learned it: <b class="cv-d"></b></label><input id="'+id+'r" type="range" min="0" max="30" value="'+(b.day||10)+'"></div>'
      +'<p class="cv-read" role="status" aria-live="polite"></p><ul class="dg-leg"><li><span class="sw c3"></span><span><b>Learn once, never review.</b></span></li><li><span class="sw c0"></span><span><b>Reviews on days 1, 3, 7 and 14,</b> each one just before it fades.</span></li></ul>';
  }
  return h+'</div>';
}
function exploreBind(f){
  var x=$('[data-xid]',f); if(!x) return;
  var b=XREG[x.getAttribute('data-xid')], k=b.kind;
  x._run=(x._run||0)+1;
  if(k==='tokens') tokBind(x,b); else if(k==='window') wnBind(x,b); else if(k==='cache') chBind(x,b); else if(k==='curve') cvBind(x,b); else if(k==='cost') csBind(x,b); else if(k==='trifecta') tfBind(x,b);
}

/* the Review tab explains why reviews are spaced, with the curve to scrub */
function spacingCard(){
  return '<section class="card whyc"><div class="revc-h">'+ic('refresh')+'<h2>Why reviews are spaced</h2></div><p class="sub">Memory fades fast at first and more slowly each time you pull a fact back just before it goes. That is why questions return after 1, 3, 7, 14 and 30 days, and why a right answer on a later day counts most.</p>'
    +dgHTML({kind:'curve', title:'Memory over 30 days', day:10})+'</section>';
}

/* ---- tokens: a model picks the next piece by weight, it does not look the fact up ---- */
function tokPick(c, first){
  if(first) return 0;
  var tot=c.reduce(function(a,x){ return a+x[1]; },0), r=Math.random()*tot, acc=0;
  for(var i=0;i<c.length;i++){ acc+=c[i][1]; if(r<acc) return i; }
  return c.length-1;
}
function tokBind(x,b){
  var vi=0, first=true, runId=0;
  var out=$('.tk-out',x), cands=$('.tk-cands',x), verdict=$('.tk-verdict',x);
  function draw(c, pick){
    cands.innerHTML=c.map(function(p,i){ var tot=c.reduce(function(a,y){ return a+y[1]; },0), pct=Math.round(p[1]/tot*100);
      return '<div class="tk-c'+(pick===i?' pick':'')+'" style="--p:'+pct+'"><span class="tk-t">'+esc(p[0])+'</span><span class="tk-b"><i></i></span><span class="tk-v">'+pct+'%</span></div>'; }).join('');
  }
  function run(){
    var my=++runId, v=b.variants[vi], si=0, text='', fast=xReduce(), chosenFirst=null;
    out.textContent=''; verdict.textContent=''; cands.innerHTML='';
    function alive(){ return x.isConnected && my===runId; }
    function step(){
      if(!alive()) return;
      var st=v.steps[si], c=st.c, pi=tokPick(c, first);
      draw(c, -1);
      function choose(){
        if(!alive()) return;
        draw(c, pi);
        var p=c[pi]; text+=(si?' ':'')+p[0]; out.textContent=text; if(si===0) chosenFirst=p[0];
        var last=(p[2]==='end')||si+1>=v.steps.length;
        if(last){ finish(); } else { si++; setTimeout(step, fast?0:900); }
      }
      if(fast) choose(); else setTimeout(choose, 650);
    }
    function finish(){
      var said=text;
      var tail=v.says && v.says[chosenFirst]!==undefined ? v.says[chosenFirst] : (v.says&&v.says['*']);
      verdict.textContent='It wrote: "'+b.prompt+' '+said+'". '+(tail||'');
      verdict.className='tk-verdict '+((v.warn&&v.warn.indexOf(chosenFirst)>=0)?'warn':'');
      first=false;
    }
    step();
  }
  $$('[data-xs]',x).forEach(function(bt){ bt.onclick=function(){ vi=+bt.getAttribute('data-xs'); $$('[data-xs]',x).forEach(function(o,i){ o.setAttribute('aria-pressed', i===vi); }); first=true; run(); }; });
  $('[data-x="again"]',x).onclick=function(){ first=false; run(); };
  x._replay=function(){ first=true; run(); };
  run();
}

/* ---- window: more is not automatically better ---- */
function wnBind(x,b){
  var bar=$('.wn-bar',x), leg=$('.wn-leg',x), rng=$('input',x), nEl=$('.wn-n',x), read=$('.wn-read',x), cap=b.capacity;
  var timer=null;
  function parts(n){ var p=b.fixed.map(function(f){ return {h:f.h, w:f.w, c:f.c, key:!!f.key}; }); p.splice(b.fixed.length-1,0,{h:b.turn.h+(n===1?'':'s'), w:b.turn.w*n, c:b.turn.c, noise:true}); return p; }
  function paint(n){
    var p=parts(n), used=p.reduce(function(a,y){ return a+y.w; },0), keyW=b.fixed.filter(function(f){ return f.key; })[0].w;
    bar.innerHTML=p.filter(function(y){ return y.w>0; }).map(function(y){ return '<i class="wn-s c'+y.c+(y.key?' key':'')+'" style="flex-grow:'+y.w+'" title="'+esc(y.h)+'"></i>'; }).join('')+'<i class="wn-free" style="flex-grow:'+Math.max(0,cap-used)+'"></i>';
    leg.innerHTML=p.filter(function(y){ return y.w>0; }).map(function(y){ return '<li><span class="sw c'+y.c+'"></span><span><b>'+esc(y.h)+'</b> '+y.w+'%</span></li>'; }).join('');
    nEl.textContent=n;
    var share=Math.round(keyW/Math.max(used,1)*100), over=used>=cap;
    read.className='wn-read '+(used>=85?'bad':used>=60?'mid':'');
    read.textContent='The window is '+Math.min(used,100)+' percent full. The fact you need is '+share+' percent of what Claude reads. '+(used>=85?'Near the limit, and mostly old chat. Summarise and start fresh.':used>=60?'Crowded. Recall can slip when the fact is buried in noise.':'Plenty of room, and the fact is easy to find.');
  }
  function glide(to){
    clearInterval(timer);
    if(xReduce()){ rng.value=to; paint(to); return; }
    timer=setInterval(function(){
      if(!x.isConnected){ clearInterval(timer); return; }
      var cur=+rng.value; if(cur===to){ clearInterval(timer); return; }
      cur+=cur<to?1:-1; rng.value=cur; paint(cur);
    }, 55);
  }
  rng.oninput=function(){ clearInterval(timer); paint(+rng.value); };
  $('[data-x="fresh"]',x).onclick=function(){ glide(2); };
  x._replay=function(){ rng.value=0; paint(0); glide(+b.start); };
  rng.value=0; paint(0); glide(+b.start);
}

/* ---- cache: the prefix is matched in order, so the first change breaks everything after it ---- */
function chBind(x,b){
  var sc=0, order=b.blocks.map(function(_,i){ return i; }), moved=false, runId=0;
  var r1=$('[data-r="1"]',x), r2=$('[data-r="2"]',x), read=$('.ch-read',x), mv=$('[data-x="move"]',x);
  function blk(i, cls){ var bl=b.blocks[i]; return '<span class="ch-b'+(cls?' '+cls:'')+(bl.vol?' vol':'')+'" style="flex-grow:'+Math.max(bl.w,16)+'"><b>'+esc(bl.h)+'</b></span>'; }
  function changed(i){ var bl=b.blocks[i], s=b.scenarios[sc]; return !!(bl.vol || (s.edit!==undefined && s.edit===i)); }
  function paint(state){
    r1.innerHTML=order.map(function(i){ return blk(i,'w'); }).join('');
    r2.innerHTML=order.map(function(i,pos){ return blk(i, state&&state[pos]?state[pos]:''); }).join('');
    mv.textContent=moved?'Put the changing blocks back in the middle':'Move the changing blocks last';
  }
  function result(hits){
    var tot=order.reduce(function(a,i){ return a+b.blocks[i].w; },0), cost=0;
    order.forEach(function(i,pos){ cost+=b.blocks[i].w*(pos<hits?b.read:b.write); });
    var pct=Math.round(cost/tot*100);
    read.className='ch-read '+(hits>=order.length-2?'good':hits===0?'bad':'mid');
    read.textContent=hits+' of '+order.length+' blocks read from the cache. The request costs about '+pct+' percent of the same request with no cache. '+(hits===0?'The first block changed, so nothing after it could be reused.':hits<order.length-2?'A changing block sits in the middle, so everything after it was recomputed.':'The stable blocks came first, so only the changing ones were recomputed.');
  }
  function send(){
    var my=++runId, hits=0; for(var p=0;p<order.length;p++){ if(changed(order[p])) break; hits++; }
    var state=[];
    paint(state); read.textContent=''; read.className='ch-read';
    if(xReduce()){ order.forEach(function(_,pos){ state[pos]=pos<hits?'hit':'miss'; }); paint(state); result(hits); return; }
    var pos=0;
    (function tick(){
      if(!x.isConnected||my!==runId) return;
      if(pos>=order.length){ result(hits); return; }
      state[pos]=pos<hits?'hit':'miss'; paint(state); pos++; setTimeout(tick, 380);
    })();
  }
  $$('[data-xs]',x).forEach(function(bt){ bt.onclick=function(){ sc=+bt.getAttribute('data-xs'); $$('[data-xs]',x).forEach(function(o,i){ o.setAttribute('aria-pressed', i===sc); }); send(); }; });
  $('[data-x="send"]',x).onclick=send;
  mv.onclick=function(){
    moved=!moved;
    order=b.blocks.map(function(_,i){ return i; });
    if(moved) order=order.filter(function(i){ return !b.blocks[i].vol; }).concat(order.filter(function(i){ return b.blocks[i].vol; }));
    send();
  };
  x._replay=function(){ send(); };
  paint(null); send();
}

/* ---- curve: reviews just before forgetting make memory last ---- */
function cvBind(x,b){
  var svg=$('.cv-svg',x), rng=$('input',x), dEl=$('.cv-d',x), read=$('.cv-read',x), runId=0;
  var S0=2.5, GROW=2.3, REV=[1,3,7,14], W=320, H=204, L=34, R=10, T=12, B=40, pw=W-L-R, ph=H-T-B;
  function xy(d,r){ return [L+d/30*pw, T+(1-r)*ph]; }
  function plain(d){ return Math.exp(-d/S0); }
  function spaced(d){ var last=0, k=0; REV.forEach(function(r,i){ if(d>=r){ last=r; k=i+1; } }); return Math.exp(-(d-last)/(S0*Math.pow(GROW,k))); }
  function path(f, jumps){
    var s='', prev=null;
    for(var d=0; d<=30; d+=0.25){
      if(jumps && REV.indexOf(d)>=0){ var p0=xy(d,f(d-0.0001)); s+='L'+p0[0].toFixed(1)+','+p0[1].toFixed(1); }
      var p=xy(d,f(d)); s+=(s?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1);
    }
    return s;
  }
  function frame(day){
    var grid=[0,.25,.5,.75,1].map(function(r){ var p=xy(0,r), q=xy(30,r); return '<line class="cv-g" x1="'+p[0]+'" y1="'+p[1].toFixed(1)+'" x2="'+q[0]+'" y2="'+q[1].toFixed(1)+'"/><text class="cv-t" x="'+(L-6)+'" y="'+(p[1]+4).toFixed(1)+'" text-anchor="end">'+Math.round(r*100)+'%</text>'; }).join('');
    var xt=[0,7,14,21,30].map(function(d){ var p=xy(d,0); return '<text class="cv-t" x="'+p[0].toFixed(1)+'" y="'+(H-20)+'" text-anchor="middle">'+d+'</text>'; }).join('')+'<text class="cv-t" x="'+(L+pw/2)+'" y="'+(H-4)+'" text-anchor="middle">days since you learned it</text>';
    var dots=REV.map(function(d){ var p=xy(d,1); return '<circle class="cv-rev" cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="4"/>'; }).join('');
    var a=xy(day,plain(day)), s=xy(day,spaced(day)), v=xy(day,0);
    return grid+xt+'<path class="cv-line bad" pathLength="1" d="'+path(plain,false)+'"/><path class="cv-line good" pathLength="1" d="'+path(spaced,true)+'"/>'+dots
      +'<line class="cv-cur" x1="'+v[0].toFixed(1)+'" y1="'+T+'" x2="'+v[0].toFixed(1)+'" y2="'+(T+ph)+'"/><circle class="cv-pt bad" cx="'+a[0].toFixed(1)+'" cy="'+a[1].toFixed(1)+'" r="5"/><circle class="cv-pt good" cx="'+s[0].toFixed(1)+'" cy="'+s[1].toFixed(1)+'" r="5"/>';
  }
  function paint(day, draw){
    svg.innerHTML=frame(day); svg.classList.toggle('draw', !!draw);
    dEl.textContent=day;
    read.textContent='On day '+day+', memory is about '+Math.round(plain(day)*100)+' percent without review and about '+Math.round(spaced(day)*100)+' percent with spaced reviews. The shape is illustrative, not a measurement of you.';
  }
  rng.oninput=function(){ paint(+rng.value, false); };
  x._replay=function(){ paint(+rng.value, !xReduce()); };
  paint(+rng.value, !xReduce());
}

/* ---- cost: what a month costs on each tier, and what the free wins take off ---- */
function csMoney(v){ return '$'+(v>=100?Math.round(v).toLocaleString('en-US'):v>=10?v.toFixed(0):v.toFixed(2)); }
function csHTML(b, id){
  return '<div class="cs-ctl"><label for="'+id+'a">Runs a month: <b class="cs-a"></b></label><input id="'+id+'a" type="range" min="1000" max="100000" step="1000" value="'+b.runs+'">'
    +'<label for="'+id+'b">Input tokens per run: <b class="cs-b"></b></label><input id="'+id+'b" type="range" min="500" max="20000" step="500" value="'+b.tin+'">'
    +'<label for="'+id+'c">Output tokens per run: <b class="cs-c"></b></label><input id="'+id+'c" type="range" min="100" max="4000" step="100" value="'+b.tout+'"></div>'
    +'<label class="chk"><input type="checkbox" data-cs="batch"'+(b.batch?' checked':'')+'><div><b>Not urgent: use the Batch API</b><span>50 percent off input and output.</span></div></label>'
    +'<label class="chk"><input type="checkbox" data-cs="cache"'+(b.cache?' checked':'')+'><div><b>Cache the stable 80 percent of the input</b><span>Reads cost a fraction of the base price.</span></div></label>'
    +'<div class="cs-rows"></div><p class="cs-read" role="status" aria-live="polite"></p>';
}
function csBind(x,b){
  var id=x.getAttribute('data-xid'), A=$('#'+id+'a',x), B=$('#'+id+'b',x), C=$('#'+id+'c',x), rows=$('.cs-rows',x), read=$('.cs-read',x);
  var bt=$('[data-cs="batch"]',x), ca=$('[data-cs="cache"]',x);
  function cost(m,r,ti,to,batch,cache){
    var cached=cache?0.8:0, inC=(ti*(1-cached)*m.i + ti*cached*m.i*m.c)/1e6, outC=to*m.o/1e6;
    return (inC+outC)*(batch?0.5:1)*r;
  }
  function paint(){
    var r=+A.value, ti=+B.value, to=+C.value, batch=bt.checked, cache=ca.checked;
    $('.cs-a',x).textContent=r.toLocaleString('en-US'); $('.cs-b',x).textContent=ti.toLocaleString('en-US'); $('.cs-c',x).textContent=to.toLocaleString('en-US');
    var vals=b.models.map(function(m){ return cost(m,r,ti,to,batch,cache); }), mx=Math.max.apply(null,vals), mn=Math.min.apply(null,vals);
    rows.innerHTML=b.models.map(function(m,i){ return '<div class="cs-r"><span class="cs-n">'+esc(m.h)+'</span><span class="cs-bar"><i style="width:'+Math.max(1.5,vals[i]/mx*100).toFixed(1)+'%"></i></span><b>'+csMoney(vals[i])+'</b></div>'; }).join('');
    var full=Math.max.apply(null,b.models.map(function(m){ return cost(m,r,ti,to,false,false); }));
    read.textContent='The top tier costs about '+Math.round(mx/mn)+' times the cheapest for this job. '+((batch||cache)?'Your free wins take the top tier from '+csMoney(full)+' to '+csMoney(mx)+' a month. ':'')+'Compare cost per finished task, and test whether the cheaper tier passes your rubric.';
  }
  [A,B,C].forEach(function(el){ el.oninput=paint; }); bt.onchange=paint; ca.onchange=paint;
  x._replay=function(){ A.value=b.runs; B.value=b.tin; C.value=b.tout; bt.checked=!!b.batch; ca.checked=!!b.cache; paint(); };
  paint();
}

/* ---- trifecta: three things make an agent dangerous together; remove one ---- */
function tfBind(x,b){
  var on=[1,1,1], btns=$$('.tf-t',x), res=$('.tf-read',x), svg=$('.tf-svg',x), fixes=$('.tf-fix',x), pre=$$('[data-xs]',x);
  function clearPre(){ pre.forEach(function(p){ p.setAttribute('aria-pressed','false'); }); }
  function paint(){
    btns.forEach(function(bt,i){ bt.setAttribute('aria-pressed', !!on[i]); });
    $$('.tf-c',svg).forEach(function(c,i){ c.classList.toggle('on', !!on[i]); });
    var n=on.reduce(function(a,v){ return a+v; },0), all=n===3;
    $('.tf-core',svg).classList.toggle('on', all);
    res.className='tf-read '+(all?'bad':n===2?'mid':'good');
    res.textContent=all?'All three are present. A fooled agent could read private data and send it out. Remove one leg.'
      :n===2?'Two of three. A fooled agent cannot finish a leak by itself. Keep it that way, and watch what could add the third leg back.'
      :'One or none. The risk is low here. Add a capability and check the combination again.';
    fixes.innerHTML=all?b.legs.map(function(l,i){ return '<button type="button" class="chip" data-fixi="'+i+'">'+esc(b.fixes[i])+'</button>'; }).join(''):'';
    $$('[data-fixi]',x).forEach(function(f){ f.onclick=function(){ on[+f.getAttribute('data-fixi')]=0; clearPre(); paint(); }; });
  }
  btns.forEach(function(bt,i){ bt.onclick=function(){ on[i]=on[i]?0:1; clearPre(); paint(); }; });
  pre.forEach(function(p,pi){ p.onclick=function(){ on=b.presets[pi].on.slice(); clearPre(); p.setAttribute('aria-pressed','true'); paint(); }; });
  x._replay=function(){ on=[1,1,1]; clearPre(); paint(); };
  paint();
}
