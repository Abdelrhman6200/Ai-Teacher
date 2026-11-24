/* ================= diagrams: flow, loop, stack, compare, bars, tree, quad. HTML and SVG, animated on appear, with a Replay button ================= */
function dgWrap(t, x, y, maxc, lh){
  // wrap a short caption into centred SVG lines of at most maxc characters
  var words=String(t).split(/\s+/).filter(Boolean), lines=[], cur='';
  words.forEach(function(w){ if(cur && (cur+' '+w).length>maxc){ lines.push(cur); cur=w; } else cur=cur?cur+' '+w:w; });
  if(cur) lines.push(cur);
  return lines.slice(0,3).map(function(l,i){ return '<text class="dg-mid2" x="'+x+'" y="'+(y+i*lh)+'" text-anchor="middle">'+esc(l)+'</text>'; }).join('');
}
function dgNum(i){ return '<span class="dgn">'+(i+1)+'</span>'; }
function dgHTML(b){
  var k=b.kind, h='<figure class="dg dg-'+k+' play" data-dg><figcaption class="dg-t"><span>'+esc(b.title||'')+'</span><button class="dg-re" type="button" aria-label="Replay the animation">'+ic('refresh')+'<span>Replay</span></button></figcaption>';
  if(k==='flow'){
    h+='<ol class="dg-flowl">';
    b.steps.forEach(function(s,i){
      h+='<li class="dgi" style="--i:'+i+'">'+dgNum(i)+'<b>'+esc(s.h)+'</b>'+(s.s?'<span>'+esc(s.s)+'</span>':'')+'</li>';
      if(i<b.steps.length-1) h+='<li class="dga" aria-hidden="true" style="--i:'+(i+0.5)+'">'+ic('arrow')+'</li>';
    });
    h+='</ol>';
  } else if(k==='loop'){
    var n=b.steps.length, cx=160, cy=118, r=(n>4?92:84), pts=b.steps.map(function(s,i){ var a=-Math.PI/2+i*2*Math.PI/n; return {x:cx+r*Math.cos(a), y:cy+r*Math.sin(a)}; });
    var dur=(n*1.3).toFixed(1);
    h+='<svg class="dg-ring" viewBox="0 0 320 236" role="img" aria-label="'+esc(b.title||'Loop')+'"><circle class="dg-orb" cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke-width="2.4" stroke-dasharray="5 6"/>'
      +'<text class="dg-mid" x="'+cx+'" y="'+(cy-6)+'" text-anchor="middle">'+esc(b.center||'repeat')+'</text>'+dgWrap(b.center2||'', cx, cy+10, 15, 14);
    b.steps.forEach(function(s,i){
      var w=Math.max(70, s.h.length*7.2+18), p=pts[i];
      h+='<g class="dg-node" style="--i:'+i+';--n:'+n+'"><rect x="'+(p.x-w/2).toFixed(1)+'" y="'+(p.y-14).toFixed(1)+'" width="'+w.toFixed(1)+'" height="28" rx="9"/><text x="'+p.x.toFixed(1)+'" y="'+(p.y+4.500).toFixed(1)+'" text-anchor="middle">'+esc(s.h)+'</text></g>';
    });
    h+='<circle class="dg-dot" r="6" cx="0" cy="0"><animateMotion dur="'+dur+'s" repeatCount="indefinite" path="M'+cx+','+(cy-r)+' A'+r+','+r+' 0 1 1 '+cx+','+(cy+r)+' A'+r+','+r+' 0 1 1 '+cx+','+(cy-r)+'"/></circle></svg>'
      +'<ol class="dg-legend">'+b.steps.map(function(s,i){ return '<li style="--i:'+i+'">'+dgNum(i)+'<span><b>'+esc(s.h)+'</b>'+(s.s?' '+esc(s.s):'')+'</span></li>'; }).join('')+'</ol>';
  } else if(k==='stack'){
    h+='<div class="dg-bar" role="img" aria-label="'+esc(b.title||'Parts')+'">'+b.parts.map(function(p,i){ return '<i class="dgseg c'+(i%6)+'" style="--i:'+i+';flex-grow:'+p.w+'"></i>'; }).join('')+'</div>'
      +(b.total?'<p class="dg-total">'+esc(b.total)+'</p>':'')
      +'<ul class="dg-leg">'+b.parts.map(function(p,i){ return '<li style="--i:'+i+'"><span class="sw c'+(i%6)+'"></span><span><b>'+esc(p.h)+'</b>'+(p.s?' '+esc(p.s):'')+'</span></li>'; }).join('')+'</ul>';
  } else if(k==='compare'){
    function col(c,cls){ return '<div class="dg-col '+cls+'"><h4>'+esc(c.h)+'</h4><ul>'+c.items.map(function(x,i){ return '<li style="--i:'+i+'">'+inl(x)+'</li>'; }).join('')+'</ul></div>'; }
    h+='<div class="dg-cmp">'+col(b.left,b.leftTone||'bad')+'<span class="dg-vs" aria-hidden="true">vs</span>'+col(b.right,b.rightTone||'good')+'</div>';
  } else if(k==='bars'){
    var mx=Math.max.apply(null,b.rows.map(function(r){ return r.v; }));
    h+='<div class="dg-barsl">'+b.rows.map(function(r,i){ return '<div class="dgb" style="--i:'+i+'"><span class="dgb-l">'+esc(r.h)+'</span><span class="dgb-t"><i style="--p:'+Math.round(r.v/mx*100)+'"></i></span><span class="dgb-v">'+esc(r.label||String(r.v))+'</span></div>'; }).join('')+'</div>'+(b.unit?'<p class="dg-total">'+esc(b.unit)+'</p>':'');
  } else if(k==='tree'){
    h+='<div class="dg-treew"><div class="dg-root" style="--i:0">'+esc(b.root)+'</div><div class="dg-kids" style="--n:'+b.kids.length+'">'+b.kids.map(function(x,i){ return '<div class="dg-kid" style="--i:'+(i+1)+'"><b>'+esc(x.h)+'</b>'+(x.s?'<span>'+esc(x.s)+'</span>':'')+'</div>'; }).join('')+'</div></div>';
  } else if(k==='quad'){
    h+='<div class="dg-quadw"><span class="dg-ax dg-axy">'+esc(b.y||'')+'</span><div class="dg-qgrid">'+b.cells.map(function(c,i){ return '<div class="dg-cell q'+i+'" style="--i:'+i+'"><b>'+esc(c.h)+'</b>'+(c.s?'<span>'+esc(c.s)+'</span>':'')+'</div>'; }).join('')+'</div><span class="dg-ax dg-axx">'+esc(b.x||'')+'</span></div>';
  }
  if(b.note) h+='<p class="dg-note">'+inl(b.note)+'</p>';
  return h+'</figure>';
}
function bindDiagrams(){
  $$('[data-dg]').forEach(function(f){
    var bt=$('.dg-re',f); if(!bt) return;
    bt.onclick=function(){ f.classList.remove('play'); void f.offsetWidth; f.classList.add('play'); var a=$('animateMotion',f); try{ if(a&&a.beginElement) a.beginElement(); }catch(e){} };
  });
}
