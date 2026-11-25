/* ================= MOTION: the small things that make progress feel real =================
   Numbers count up, the XP bar fills from where it was, meters glide, a chest opens, a right answer floats its XP.
   Everything here is decoration over real values: reduced motion, and the test driver, get the final numbers at once. */
function motionOff(){ return xReduce() || window.__noMotion; }
var HUDP={n:0, pct:0, set:false};

function countUp(){
  if(motionOff()) return;
  $$('.center.done .fact b').forEach(function(b){
    var txt=b.textContent, m=/^([+x]?)(\d+)(.*)$/.exec(txt); if(!m) return;
    var to=+m[2], pre=m[1], post=m[3]; if(to<2 || b.getAttribute('data-counted')) return;
    b.setAttribute('data-counted','1'); b.setAttribute('aria-label', txt);
    var t0=null, dur=Math.min(900, 380+to*6);
    b.textContent=pre+'0'+post;
    (function f(t){
      if(!b.isConnected) return; if(t0===null) t0=t;
      var p=Math.min(1,(t-t0)/dur), e=1-Math.pow(1-p,3);
      b.textContent=pre+Math.round(to*e)+post;
      if(p<1) requestAnimationFrame(f); else b.textContent=txt;
    })(performance.now());
  });
}

/* the bar under the tabs starts at the last value it showed and slides to the new one */
function hudWidths(p){
  var from=(HUDP.set && HUDP.n===p.n) ? HUDP.pct : (HUDP.set && HUDP.n<p.n ? 0 : p.pct);
  HUDP={n:p.n, pct:p.pct, set:true};
  return motionOff() ? {from:p.pct, to:p.pct} : {from:from, to:p.pct};
}
function motionAfter(){
  if($('.center.done .fact b')) countUp();
  var bar=$('.hud-bar i[data-to]');
  if(bar && bar.getAttribute('data-from')!==bar.getAttribute('data-to')){ requestAnimationFrame(function(){ requestAnimationFrame(function(){ bar.style.width=bar.getAttribute('data-to')+'%'; }); }); }
  $$('.mm-bar i[data-to]').forEach(function(i){ requestAnimationFrame(function(){ requestAnimationFrame(function(){ i.style.width=i.getAttribute('data-to')+'%'; }); }); });
}

/* a chest that opens: lid, glow, rays, sparkles. The classes are added a moment after it appears so the transitions run. */
function chestAnim(){
  var rays='';
  for(var i=0;i<10;i++){ var a=-Math.PI/2+(i-4.5)*0.32; rays+='<line x1="'+(48+16*Math.cos(a)).toFixed(1)+'" y1="'+(34+16*Math.sin(a)).toFixed(1)+'" x2="'+(48+40*Math.cos(a)).toFixed(1)+'" y2="'+(34+40*Math.sin(a)).toFixed(1)+'"/>'; }
  return '<svg class="chestsvg" viewBox="0 0 96 96" aria-hidden="true"><g class="ch-rays">'+rays+'</g><circle class="ch-glow" cx="48" cy="40" r="26"/>'
    +'<g class="ch-card"><rect x="34" y="26" width="28" height="36" rx="5"/><path d="M40 36h16M40 42h16M40 48h10"/></g>'
    +'<rect class="ch-body" x="14" y="46" width="68" height="36" rx="8"/><path class="ch-band" d="M14 60h68M48 46v36"/><rect class="ch-lock" x="42" y="54" width="12" height="12" rx="3"/>'
    +'<g class="ch-lid"><path d="M14 46V40a14 14 0 0114-14h40a14 14 0 0114 14v6z"/><path class="ch-band" d="M48 26v20"/></g>'
    +'<g class="ch-sp"><circle cx="18" cy="26" r="2.5"/><circle cx="80" cy="22" r="3"/><circle cx="66" cy="12" r="2"/><circle cx="30" cy="12" r="2"/></g></svg>';
}
