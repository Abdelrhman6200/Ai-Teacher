/* ================= calibration: predict, then compare. Knowing what you know is a skill that can be trained. =================
   Before a mastery check the learner can say how many first-try questions they expect to get right. After it, the app shows the gap and keeps a short history.
   Over-confidence is the common gap, and seeing it in numbers is what changes how people study. */
function predHTML(){
  var n=L.node.graded, chips='';
  for(var i=0;i<=n;i++) chips+='<button type="button" class="chip'+(L.pred===i?' on':'')+'" data-pred="'+i+'" aria-pressed="'+(L.pred===i)+'">'+i+'</button>';
  return '<div class="predc" role="group" aria-label="Your prediction"><p class="predq"><b>Before you start,</b> how many of the '+n+' first-try questions will you get right? <span class="muted">Optional. You see how close you were.</span></p><div class="preds">'+chips+'</div></div>';
}
function bindPred(){
  $$('[data-pred]').forEach(function(b){ b.onclick=function(){
    var v=+b.getAttribute('data-pred'); L.pred=(L.pred===v)?undefined:v;
    $$('[data-pred]').forEach(function(o){ var on=(+o.getAttribute('data-pred')===L.pred); o.classList.toggle('on',on); o.setAttribute('aria-pressed',on); });
  }; });
}
function predResult(s){
  if(L.node.kind!=='master' || L.pred===undefined) return '';
  if(L.predHTML) return L.predHTML;
  var p=L.pred, a=L.first, n=L.graded, gap=p-a;
  (S.calib=S.calib||[]).push({s:s.id, p:p, a:a, n:n, at:today()}); if(S.calib.length>40) S.calib.shift(); save();
  var msg=gap===0?'You expected '+p+' and got '+a+'. Your sense of what you know matched the evidence.'
    :gap>0?'You expected '+p+' and got '+a+'. You knew it a little less well than it felt. That is the most common gap, so check the outcomes marked Revisit and rate your sureness on each answer.'
    :'You expected '+p+' and got '+a+'. You know more than you thought. Let your own answers, not your nerves, set your confidence.';
  L.predHTML='<section class="predr" aria-label="Your prediction"><h2 class="sh">Your prediction</h2><div class="pr-bars"><div class="pr-r"><span>Expected</span><span class="pr-t"><i class="exp" style="--p:'+Math.round(p/n*100)+'"></i></span><b>'+p+'</b></div>'
    +'<div class="pr-r"><span>Got</span><span class="pr-t"><i class="got" style="--p:'+Math.round(a/n*100)+'"></i></span><b>'+a+'</b></div></div><p>'+esc(msg)+'</p></section>';
  return L.predHTML;
}
function calibStats(){
  var c=S.calib||[]; if(c.length<3) return null;
  var gaps=c.map(function(x){ return (x.p-x.a)/x.n*100; }), avg=gaps.reduce(function(a,b){ return a+b; },0)/gaps.length;
  return {n:c.length, avg:Math.round(avg)};
}
function calibCard(){
  var c=S.calib||[]; if(!c.length) return '';
  var st=calibStats(), last=c.slice(-6);
  var line=!st?'Make a few more predictions to see your pattern.':Math.abs(st.avg)<8?'On average you predict about what you score. That is well calibrated.':st.avg>0?'On average you expect about '+st.avg+' points more than you score. Slow down on the checks and use the Revisit list.':'On average you score about '+(-st.avg)+' points more than you expect. You can trust yourself a little more.';
  return '<section class="card calibc"><div class="revc-h">'+ic('target')+'<h2>Know what you know</h2></div><p class="sub">'+esc(line)+'</p><ul class="cal-l">'
    +last.map(function(x){ var s=SBY[x.s]; return '<li><span class="cal-n">Session '+(s?s.n:'?')+'</span><span class="cal-b" aria-hidden="true"><i class="exp" style="--p:'+Math.round(x.p/x.n*100)+'"></i><i class="got" style="--p:'+Math.round(x.a/x.n*100)+'"></i></span><span class="cal-v">'+x.p+' expected, '+x.a+' got</span></li>'; }).join('')+'</ul></section>';
}
