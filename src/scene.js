
/* ================= scene walkthrough: one isometric picture that grows a step at a time =================
   A scene block lists nodes, arrows, labels and zones, each with the step it appears at (s), plus stat cards whose numbers change per step.
   Tapping a number in the step track, Back or Next adds or removes things; the camera glides to frame what is on screen. */
var SCN=0, SCREG={}, SC_K=48, SC_X=SC_K*0.866, SC_Y=SC_K*0.5, SC_FOOT=0;
var SCI={
  globe:'<circle cx="12" cy="12" r="8.500"/><path d="M3.500 12h17M12 3.500c2.500 2.400 3.700 5.300 3.700 8.500s-1.200 6.100-3.700 8.500c-2.500-2.400-3.700-5.300-3.700-8.500S9.500 5.900 12 3.500z"/>',
  server:'<rect x="4.500" y="4.500" width="15" height="6" rx="1.800"/><rect x="4.500" y="13.500" width="15" height="6" rx="1.800"/><path d="M8 7.500h.1M8 16.500h.1M12 7.500h4M12 16.500h4"/>',
  db:'<ellipse cx="12" cy="6" rx="7" ry="2.800"/><path d="M5 6v12c0 1.500 3.100 2.800 7 2.800s7-1.300 7-2.800V6M5 12c0 1.500 3.100 2.800 7 2.800s7-1.300 7-2.800"/>',
  chip:'<rect x="7" y="7" width="10" height="10" rx="2"/><path d="M10 3.500V7M14 3.500V7M10 17v3.500M14 17v3.500M3.500 10H7M3.500 14H7M17 10h3.500M17 14h3.500"/>',
  clock:'<circle cx="12" cy="12" r="8.500"/><path d="M12 7.500V12l3.200 2"/>',
  mail:'<rect x="3.500" y="5.500" width="17" height="13" rx="2.200"/><path d="M4 7.500l8 6 8-6"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M12 3.500v2.500M12 18v2.500M3.500 12H6M18 12h2.500M6 6l1.700 1.700M16.300 16.300L18 18M18 6l-1.700 1.700M7.700 16.300L6 18"/>',
  cloud:'<path d="M7 18.500a4 4 0 01-.4-8A5.500 5.500 0 0117.200 9.500a4.500 4.500 0 01-.2 9z"/>',
  key:'<circle cx="8.500" cy="12" r="3.800"/><path d="M12.300 12h8.200M17 12v3M20 12v2.500"/>',
  code:'<path d="M8.500 7l-5 5 5 5M15.500 7l5 5-5 5M13.500 5l-3 14"/>',
  plug:'<path d="M9 3.500v5M15 3.500v5M6.500 8.500h11v3a5.500 5.500 0 01-11 0zM12 17v3.500"/>',
  eye:'<path d="M2.800 12S6 5.800 12 5.800 21.200 12 21.200 12 18 18.200 12 18.200 2.800 12 2.800 12z"/><circle cx="12" cy="12" r="2.800"/>',
  sparkle:'<path d="M11 3.500l2 5.500 5.500 2-5.500 2-2 5.500-2-5.500-5.500-2 5.500-2z"/><path d="M18.500 16.500v4M16.500 18.500h4"/>',
  bug:'<rect x="8" y="8" width="8" height="11" rx="4"/><path d="M12 8V6M9 5.500L10.500 7.500M15 5.500L13.500 7.500M4.500 12H8M16 12h3.500M5 18l3-1.500M19 18l-3-1.500M5 7l3 2M19 7l-3 2"/>',
  box:'<path d="M12 3.500l8 4v9l-8 4-8-4v-9z"/><path d="M4 7.500l8 4 8-4M12 11.500v9"/>',
  stop:'<path d="M8.500 3.500h7l5 5v7l-5 5h-7l-5-5v-7z"/><path d="M8.500 12h7"/>',
  shield:'<path d="M12 3.200l7 2.600v5.600c0 4.200-2.900 7.300-7 9-4.100-1.700-7-4.800-7-9V5.800z"/>',
  list:'<path d="M9 6.500h10M9 12h10M9 17.500h10M4.500 6.500h.1M4.500 12h.1M4.500 17.500h.1"/>',
  signal:'<path d="M5 19v-3M10 19v-6M15 19V9M20 19V5"/>',
  pause:'<path d="M9 6v12M15 6v12"/>',
  play:'<path class="f" d="M8 5.500v13l11-6.500z"/>',
  expand:'<path d="M14 4.500h5.500V10M10 19.500H4.500V14M19.500 4.500l-6 6M4.500 19.500l6-6"/>',
  shrink:'<path d="M19.500 10H14V4.500M4.500 14H10v5.500M14 10l5.500-5.500M10 14l-5.500 5.500"/>'
};
function scIcoPath(n){ return SCI[n]||IC[n]||''; }
function scIcon(n){ return '<svg class="i" viewBox="0 0 24 24" aria-hidden="true">'+scIcoPath(n)+'</svg>'; }
function scIc(n,x,y,sz){ return '<g class="sc-ic" transform="translate('+(x-sz/2).toFixed(1)+','+(y-sz/2).toFixed(1)+') scale('+(sz/24).toFixed(3)+')">'+scIcoPath(n)+'</g>'; }
function scP(gx,gy,gz){ return [Math.round((gx-gy)*SC_X*10)/10, Math.round(((gx+gy)*SC_Y-(gz||0))*10)/10]; }
function scPts(a){ return a.map(function(p){ return p[0]+','+p[1]; }).join(' '); }
function scBB(pts){ var x0=1e9,y0=1e9,x1=-1e9,y1=-1e9; pts.forEach(function(p){ x0=Math.min(x0,p[0]); y0=Math.min(y0,p[1]); x1=Math.max(x1,p[0]); y1=Math.max(y1,p[1]); }); return [x0,y0,x1,y1]; }
function scBox(gx,gy,q,z0,h,nm){
  function P(dx,dy,z){ return scP(gx+dx,gy+dy,z); }
  var T=z0+h, f=nm?'sc-nf':'sc-f';
  var s='<polygon class="'+f+' sc-lf" points="'+scPts([P(-q,q,T),P(q,q,T),P(q,q,z0),P(-q,q,z0)])+'"/>'
    +'<polygon class="'+f+' sc-rt" points="'+scPts([P(q,q,T),P(q,-q,T),P(q,-q,z0),P(q,q,z0)])+'"/>'
    +'<polygon class="'+f+' sc-tp" points="'+scPts([P(-q,-q,T),P(q,-q,T),P(q,q,T),P(-q,q,T)])+'"/>';
  // without the vertical edge in the middle, so text can sit across the two faces
  if(nm) s+='<polygon class="sc-ol" points="'+scPts([P(-q,-q,T),P(q,-q,T),P(q,-q,z0),P(q,q,z0),P(-q,q,z0),P(-q,q,T)])+'"/><polyline class="sc-ol" points="'+scPts([P(-q,q,T),P(q,q,T),P(q,-q,T)])+'"/>';
  return s;
}
function scTxt(x,y,t,cls){ return '<text class="sc-tx '+cls+'" x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" text-anchor="middle">'+esc(t)+'</text>'; }
/* one node: returns {html, bb, foot} where foot is the ground point for the active plate */
function scNode(n){
  var gx=n.at[0], gy=n.at[1], z0=n.z||0, t=n.type||'cube', col=n.c||'n', h=n.h==null?60:n.h, s='', bb;
  if(t==='laptop'){
    var slab=scBox(gx,gy,.62,z0,8), z=z0+8, S1=scP(gx-.38,gy-.34,z+3), S2=scP(gx+.38,gy-.34,z+3), H=42;
    var S3=[S2[0],S2[1]-H], S4=[S1[0],S1[1]-H];
    function lerp(a,b,u){ return [a[0]+(b[0]-a[0])*u, a[1]+(b[1]-a[1])*u]; }
    function pl(u0,u1,v){ var a=lerp(lerp(S1,S2,u0),lerp(S4,S3,u0),v), b=lerp(lerp(S1,S2,u1),lerp(S4,S3,u1),v); return '<line x1="'+a[0].toFixed(1)+'" y1="'+a[1].toFixed(1)+'" x2="'+b[0].toFixed(1)+'" y2="'+b[1].toFixed(1)+'"/>'; }
    s=slab+scBox(gx,gy+.06,.42,z,3).replace(/sc-f/g,'sc-f sc-key')
      +'<polygon class="sc-f sc-scr" points="'+scPts([S1,S2,S3,S4])+'"/><g class="sc-scl">'+pl(.14,.62,.78)+pl(.14,.84,.58)+pl(.14,.46,.38)+'</g>';
    bb=scBB([scP(gx-.62,gy+.62,z0),scP(gx+.62,gy-.62,z0),scP(gx+.62,gy+.62,z0-2),S3,S4]);
  } else if(t==='db'){
    var c=scP(gx,gy,z0), rx=SC_X*.78, ry=SC_Y*.78, hh=n.h==null?38:n.h, yt=c[1]-hh, yb=c[1], x0=c[0]-rx, x1=c[0]+rx;
    s='<path class="sc-f sc-lf" d="M'+x0+','+yt+' L'+x0+','+yb+' A'+rx+','+ry+' 0 0 0 '+x1+','+yb+' L'+x1+','+yt+'Z"/>'
      +'<path class="sc-band" d="M'+x0+','+(yt+hh*.36)+' A'+rx+','+ry+' 0 0 0 '+x1+','+(yt+hh*.36)+' M'+x0+','+(yt+hh*.68)+' A'+rx+','+ry+' 0 0 0 '+x1+','+(yt+hh*.68)+'"/>'
      +'<ellipse class="sc-f sc-tp" cx="'+c[0]+'" cy="'+yt+'" rx="'+rx+'" ry="'+ry+'"/>';
    if(n.icon) s+=scIc(n.icon,c[0],yt,15);
    bb=[x0-3,yt-ry-3,x1+3,yb+ry+3];
  } else {
    var q=(n.sz||.9)/2; s=scBox(gx,gy,q,z0,h,1);
    var cx=scP(gx+q,gy+q,z0)[0], yb2=scP(gx+q,gy+q,z0)[1], yt2=yb2-h;
    if(n.icon&&n.title){ s+=scIc(n.icon,cx,yt2+h*.2,17)+scTxt(cx,yt2+h*.42+4,n.title,'b'); if(n.sub) s+=scTxt(cx,yt2+h*.42+15,n.sub,'s'); }
    else if(n.icon){ s+=scIc(n.icon,cx,yt2+h*.45,20); }
    else if(n.title){ s+=scTxt(cx,yt2+h*.46+4,n.title,'b'); if(n.sub) s+=scTxt(cx,yt2+h*.46+15,n.sub,'s'); }
    bb=scBB([scP(gx-q,gy+q,z0),scP(gx+q,gy-q,z0),scP(gx+q,gy+q,z0),scP(gx-q,gy-q,z0+h),scP(gx+q,gy-q,z0+h)]);
  }
  return {html:s, bb:[bb[0]-4,bb[1]-4,bb[2]+4,bb[3]+4], col:col};
}
function scPill(p, x, y){
  var t=String(p.text), w=Math.round(t.length*6.6+16+(p.icon?14:0)+(p.bar!=null?36:0)), hh=20, x0=x-w/2, y0=y-hh/2, tx=x0+w/2+(p.icon?7:0)+(p.bar!=null?-18:0);
  var s='<g class="sc-pill'+(p.tone?' '+p.tone:'')+'"><rect x="'+x0.toFixed(1)+'" y="'+y0.toFixed(1)+'" width="'+w+'" height="'+hh+'" rx="10"/>';
  if(p.icon) s+=scIc(p.icon,x0+12,y,12);
  if(p.bar!=null){ var bx=x0+w-44; s+='<rect class="sc-pb" x="'+bx.toFixed(1)+'" y="'+(y-3).toFixed(1)+'" width="30" height="6" rx="3"/><rect class="sc-pf" x="'+bx.toFixed(1)+'" y="'+(y-3).toFixed(1)+'" width="'+(30*Math.max(0,Math.min(100,p.bar))/100).toFixed(1)+'" height="6" rx="3"/>'; }
  s+='<text class="sc-pt" x="'+(p.bar!=null?x0+(w-44)/2+3:tx).toFixed(1)+'" y="'+(y+3.8).toFixed(1)+'" text-anchor="middle">'+esc(t)+'</text></g>';
  return {html:s, bb:[x0-2,y0-2,x0+w+2,y0+hh+2]};
}
function scBuild(b){
  var by={}, N=b.steps.length, items=[], I=function(kind,html,bb,o){ o=o||{}; items.push({k:kind,s:o.s||1,x:o.x||0,html:html,bb:bb,id:o.id||'',d:o.d||0,live:o.live||0,q:o.q||0}); };
  // sp spreads the grid out (1 = as authored), so nodes do not crowd each other
  var SP=b.sp||1, spz=function(a){ return [a[0]*SP,a[1]*SP].concat(a.slice(2)); };
  var NS=(b.nodes||[]).map(function(n){ return Object.assign({},n,{at:spz(n.at)}); }), PS=(b.pills||[]).map(function(p){ return Object.assign({},p,{at:spz(p.at)}); }), ZS=(b.zones||[]).map(function(z){ return Object.assign({},z,{at:spz(z.at),size:[z.size[0]*SP,z.size[1]*SP]}); });
  NS.forEach(function(n){ by[n.id]=n; });
  var ex=[1e9,1e9,-1e9,-1e9];
  NS.forEach(function(n){ ex[0]=Math.min(ex[0],n.at[0]); ex[1]=Math.min(ex[1],n.at[1]); ex[2]=Math.max(ex[2],n.at[0]); ex[3]=Math.max(ex[3],n.at[1]); });
  ZS.forEach(function(z){ ex[0]=Math.min(ex[0],z.at[0]); ex[1]=Math.min(ex[1],z.at[1]); ex[2]=Math.max(ex[2],z.at[0]+z.size[0]); ex[3]=Math.max(ex[3],z.at[1]+z.size[1]); });
  var actIds={}; b.steps.forEach(function(st){ (st.act||[]).forEach(function(id){ actIds[id]=1; }); });
  ZS.forEach(function(z){
    var a=z.at, w=z.size, pts=[scP(a[0],a[1],0),scP(a[0]+w[0],a[1],0),scP(a[0]+w[0],a[1]+w[1],0),scP(a[0],a[1]+w[1],0)];
    I('z','<polygon class="sc-zone'+(z.tone?' '+z.tone:'')+'" points="'+scPts(pts)+'"/>',scBB(pts),{s:z.s,x:z.x});
    if(z.label){ var lp=scP(a[0]+w[0]/2,a[1]+w[1],0), pl=scPill({text:z.label,icon:z.icon,tone:z.tone},lp[0]-w[0]*SC_X*.45,lp[1]-w[0]*SC_Y*.45+6); I('l',pl.html,pl.bb,{s:z.s,x:z.x}); }
  });
  NS.forEach(function(n){
    if(!actIds[n.id]) return;
    var q=(n.sz||.9)/2+.24, g=n.at, pts=[scP(g[0]-q,g[1]-q,0),scP(g[0]+q,g[1]-q,0),scP(g[0]+q,g[1]+q,0),scP(g[0]-q,g[1]+q,0)];
    I('a','<polygon class="sc-act" data-n="'+esc(n.id)+'" points="'+scPts(pts)+'"/>',scBB(pts),{s:n.s,x:n.x,d:g[0]+g[1]-.5});
  });
  (b.edges||[]).forEach(function(e){
    var A=by[e.a], B=by[e.b]; if(!A||!B) return;
    var a=A.at, c=B.at, pts;
    if(a[0]===c[0]||a[1]===c[1]) pts=[[a[0],a[1]],[c[0],c[1]]]; else pts=(e.via==='y')?[[a[0],a[1]],[a[0],c[1]],[c[0],c[1]]]:[[a[0],a[1]],[c[0],a[1]],[c[0],c[1]]];
    function sh(i,j,d){ var dx=pts[j][0]-pts[i][0], dy=pts[j][1]-pts[i][1], L=Math.hypot(dx,dy)||1, m=Math.min(d,L*.45); pts[i]=[pts[i][0]+dx/L*m, pts[i][1]+dy/L*m]; }
    sh(0,1,e.g0==null?.6:e.g0); sh(pts.length-1,pts.length-2,e.g1==null?.6:e.g1);
    var eo=e.off||[0,0];   // a few pixels sideways, so a return arrow does not sit on top of the outward one
    var sp=pts.map(function(p){ var q=scP(p[0],p[1],e.z==null?3:e.z); return [q[0]+eo[0],q[1]+eo[1]]; }), d='M'+sp.map(function(p){ return p[0]+','+p[1]; }).join(' L');
    var L1=sp[sp.length-1], L0=sp[sp.length-2], dx=L1[0]-L0[0], dy=L1[1]-L0[1], dl=Math.hypot(dx,dy)||1, ux=dx/dl, uy=dy/dl;
    var ah=scPts([[L1[0],L1[1]],[L1[0]-ux*10-uy*5,L1[1]-uy*10+ux*5],[L1[0]-ux*10+uy*5,L1[1]-uy*10-ux*5]]);
    var dot=''; if(e.k==='req'||e.k==='res'){ var dur=Math.max(1.6,Math.min(3.4,dl/60+1.2)).toFixed(1); dot='<circle class="sc-dot '+(e.k==='req'?'rq':'rs')+'" r="4.6">'+(motionOff()?'':'<animateMotion dur="'+dur+'s" repeatCount="indefinite" path="'+d+'"/>')+'</circle>'; }
    I('e','<path class="sc-ed'+(e.dash?' dash':'')+'" d="'+d+'" pathLength="1"/><polygon class="sc-ah" points="'+ah+'"/>'+dot,scBB(sp),{s:e.s,x:e.x,id:e.id||'',live:1,q:e.q?1:0});
    if(e.label){
      // on the corner of an L-shaped route, otherwise halfway along
      var lo=e.lo||[0,0], mx, my;
      if(sp.length===3){ mx=sp[1][0]+lo[0]; my=sp[1][1]+lo[1]; } else { mx=(sp[0][0]+sp[1][0])/2+lo[0]; my=(sp[0][1]+sp[1][1])/2+lo[1]; }
      var pl=scPill({text:e.label,icon:e.icon,tone:e.tone},mx,my); I('l',pl.html,pl.bb,{s:e.s,x:e.x});
    }
  });
  var ns=NS.filter(function(n){ return n.type!=='plate'; }).slice().sort(function(p,q){ return (p.at[0]+p.at[1]+(p.z||0)/90)-(q.at[0]+q.at[1]+(q.z||0)/90) || p.at[0]-q.at[0]; });
  ns.forEach(function(n){ var r=scNode(n); I('n','<g class="sc-c-'+r.col+'">'+r.html+'</g>',r.bb,{s:n.s,x:n.x,d:n.at[0]+n.at[1]});
    if(n.label){ var g=scP(n.at[0],n.at[1],0), pl=scPill({text:n.label,icon:n.licon},g[0]+(n.lo?n.lo[0]:0),g[1]+(n.type==='laptop'?30:(n.type==='db'?24:22))+(n.lo?n.lo[1]:0)); I('l',pl.html,pl.bb,{s:n.s,x:n.x}); } });
  PS.forEach(function(p){ var g=scP(p.at[0],p.at[1],p.at[2]||0), pl=scPill(p,g[0],g[1]); I('l',pl.html,pl.bb,{s:p.s,x:p.x}); });
  // camera per step
  var cams=[], A=1.2;
  for(var n=1;n<=N;n++){
    var u=[1e9,1e9,-1e9,-1e9], any=false;
    items.forEach(function(it){ if(it.k==='a'||!(n>=it.s&&!(it.x&&n>=it.x))) return; any=true; u[0]=Math.min(u[0],it.bb[0]); u[1]=Math.min(u[1],it.bb[1]); u[2]=Math.max(u[2],it.bb[2]); u[3]=Math.max(u[3],it.bb[3]); });
    if(!any) u=[-100,-80,100,80];
    var pad=24, w=u[2]-u[0]+pad*2, h=u[3]-u[1]+pad*2+30; if(w<310) w=310; if(w/h<A) w=h*A; else h=w/A;
    cams.push([ (u[0]+u[2])/2-w/2, (u[1]+u[3])/2-h/2+15, w, h ]);
  }
  var all=[1e9,1e9,-1e9,-1e9]; items.forEach(function(it){ all[0]=Math.min(all[0],it.bb[0]); all[1]=Math.min(all[1],it.bb[1]); all[2]=Math.max(all[2],it.bb[2]); all[3]=Math.max(all[3],it.bb[3]); });
  items=items.filter(function(it){ return it.k!=='l'; }).concat(items.filter(function(it){ return it.k==='l'; }));   // labels paint last, over the nodes
  return {items:items, cams:cams, all:all, ex:ex, N:N};
}
function scGrid(R,sid){
  var ex=R.ex, g0=Math.floor(ex[0])-3, g1=Math.ceil(ex[2])+3, h0=Math.floor(ex[1])-3, h1=Math.ceil(ex[3])+3, s='';
  for(var x=g0;x<=g1;x++){ var a=scP(x-.5,h0-.5,0), b=scP(x-.5,h1+.5,0); s+='<line x1="'+a[0]+'" y1="'+a[1]+'" x2="'+b[0]+'" y2="'+b[1]+'"/>'; }
  for(var y=h0;y<=h1;y++){ var a2=scP(g0-.5,y-.5,0), b2=scP(g1+.5,y-.5,0); s+='<line x1="'+a2[0]+'" y1="'+a2[1]+'" x2="'+b2[0]+'" y2="'+b2[1]+'"/>'; }
  var cx=(R.all[0]+R.all[2])/2, cy=(R.all[1]+R.all[3])/2, r=Math.max(R.all[2]-R.all[0],R.all[3]-R.all[1])*.75+60;
  return '<defs><radialGradient id="scg'+sid+'" gradientUnits="userSpaceOnUse" cx="'+cx+'" cy="'+cy+'" r="'+r+'"><stop offset="0" stop-color="#fff"/><stop offset=".62" stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient><mask id="scm'+sid+'" maskUnits="userSpaceOnUse" x="-2000" y="-2000" width="4000" height="4000"><rect x="-2000" y="-2000" width="4000" height="4000" fill="url(#scg'+sid+')"/></mask></defs><g class="sc-grid" mask="url(#scm'+sid+')">'+s+'</g>';
}
function scVals(b,n){
  var v={}, ch={}; for(var i=0;i<n;i++){ var sv=b.steps[i].v||{}; for(var k in sv){ v[k]=sv[k]; if(i===n-1) ch[k]=1; } }
  return {v:v, ch:ch};
}
function scNext(b,n){ return n<b.steps.length ? '<span class="sc-nl">Next: '+esc(b.steps[n].t)+'</span>'+ic('arrow') : 'Continue'; }
function sceneBlock(it){ var r=null; (it.blocks||[]).forEach(function(b){ if(b.t==='diagram'&&b.kind==='scene') r=b; }); return r; }
function sceneFoot(b){
  var N=b.steps.length, n=Math.min(b._st||1,N);
  return '<div class="sc-foot"><button class="btn ghost" id="sback" type="button"'+(n<=1?' disabled':'')+'>'+ic('back')+'<span>Back</span></button><button class="btn" id="primary" type="button">'+scNext(b,n)+'</button></div>';
}
function sceneHTML(b){
  b._id=b._id||(++SCN); var sid=b._id, R=scBuild(b); SCREG[sid]={b:b,R:R};
  var N=R.N, n=Math.min(b._st||1,N), sv=scVals(b,n), leg=b.legend||[['rq','request'],['rs','response']];
  var h='<figure class="dg dg-scene sc'+(SC_FOOT?' hasfoot':'')+(motionOff()?' sc-nomo':'')+'" data-dg data-scene data-sid="'+sid+'"><figcaption class="dg-t"><span>'+esc(b.title||'')+'</span></figcaption>';
  if((b.stats||[]).length) h+='<div class="sc-stats" role="group" aria-label="Numbers for this step" tabindex="0">'+b.stats.map(function(s){ return '<div class="sc-st'+(sv.ch[s.id]?' chg':'')+'" data-k="'+esc(s.id)+'"><span class="sc-sl">'+scIcon(s.icon||'clock')+esc(s.label)+'</span><b>'+esc(sv.v[s.id]==null?'—':sv.v[s.id])+'</b></div>'; }).join('')+'</div>';
  h+='<div class="sc-stage"><svg class="sc-svg" viewBox="'+R.cams[n-1].join(' ')+'" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">'+scGrid(R,sid);
  R.items.forEach(function(it){ h+='<g class="sc-i sc-k-'+it.k+(it.live?' sc-e':'')+'" data-s="'+it.s+'"'+(it.x?' data-x="'+it.x+'"':'')+(it.id?' data-id="'+esc(it.id)+'"':'')+(it.q?' data-q="1"':'')+'>'+it.html+'</g>'; });
  h+='</svg><div class="sc-bar"><ul class="sc-leg">'+leg.map(function(l){ return '<li><i class="'+l[0]+'"></i>'+esc(l[1])+'</li>'; }).join('')+'</ul><div class="sc-ctl">'
    +'<button type="button" data-sc="replay" aria-label="Replay the walkthrough from step 1">'+scIcon('refresh')+'</button>'
    +'<button type="button" data-sc="pause" aria-label="Pause the movement" aria-pressed="false">'+scIcon('pause')+'</button>'
    +'<button type="button" data-sc="full" aria-label="Expand the picture" aria-pressed="false">'+scIcon('expand')+'</button></div></div></div>';
  h+='<div class="sc-tk"><div class="sc-th"><span>In this walkthrough</span><span class="sc-sn">Step '+n+' of '+N+'</span></div><ol class="sc-tr">'
    +b.steps.map(function(st,i){ return '<li><button type="button" class="sc-b" data-i="'+(i+1)+'" aria-label="Step '+(i+1)+': '+esc(st.t)+'">'+(i+1)+'</button></li>'; }).join('')+'</ol><p class="sc-lbl" aria-hidden="true">'+esc(b.steps[n-1].t)+'</p></div>';
  h+='<div class="sc-cap" aria-live="polite"><p class="sc-ct">'+esc(b.steps[n-1].t)+'</p><p class="sc-cd">'+inl(b.steps[n-1].d||'')+'</p></div>';
  h+='<div class="sc-nav"><button type="button" class="btn ghost small" data-sc="prev"'+(n<=1?' disabled':'')+'>'+ic('back')+'Back</button><button type="button" class="btn small" data-sc="next">'+scNext(b,n)+'</button></div>';
  if(b.note) h+='<p class="dg-note">'+inl(b.note)+'</p>';
  return h+'</figure>';
}
/* ----- behaviour ----- */
function scTween(svg,to,ms){
  var from=(svg.getAttribute('viewBox')||'').split(/\s+/).map(Number); if(svg._raf) cancelAnimationFrame(svg._raf);
  if(!ms||from.length<4||from.some(isNaN)){ svg.setAttribute('viewBox',to.join(' ')); return; }
  var t0=null;
  function f(t){ if(t0===null) t0=t; var u=Math.min(1,(t-t0)/ms), e=u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2; svg.setAttribute('viewBox',to.map(function(v,i){ return (from[i]+(v-from[i])*e).toFixed(2); }).join(' ')); if(u<1) svg._raf=requestAnimationFrame(f); else svg._raf=0; }
  svg._raf=requestAnimationFrame(f);
}
function scSet(f,n,instant){
  var G=SCREG[f.getAttribute('data-sid')]; if(!G) return; var b=G.b, N=G.R.N; n=Math.max(1,Math.min(N,n)); f._n=n; b._st=n;
  $$('[data-s]',f).forEach(function(g){ var s=+g.getAttribute('data-s'), x=+(g.getAttribute('data-x')||0); g.classList.toggle('on', n>=s&&!(x&&n>=x)); });
  var st=b.steps[n-1], live={}; live[''] = 0; (st.flow||[]).forEach(function(id){ live[id]=1; });
  $$('.sc-e',f).forEach(function(g){ var s=+g.getAttribute('data-s'), id=g.getAttribute('data-id'); g.classList.toggle('live', (n===s&&!g.hasAttribute('data-q'))||(id&&live[id]===1)); });
  var act={}; (st.act||[]).forEach(function(id){ act[id]=1; }); $$('.sc-act',f).forEach(function(p){ p.classList.toggle('on', !!act[p.getAttribute('data-n')]); });
  var sv=scVals(b,n); $$('.sc-st',f).forEach(function(c){ var k=c.getAttribute('data-k'); $('b',c).textContent=sv.v[k]==null?'—':sv.v[k]; c.classList.toggle('chg',!!sv.ch[k]); });
  var chg=$('.sc-st.chg',f), row=$('.sc-stats',f); if(chg&&row){ var off=chg.offsetLeft-row.offsetLeft-8; try{ row.scrollTo({left:Math.max(0,off),behavior:(instant||motionOff())?'auto':'smooth'}); }catch(e){ row.scrollLeft=Math.max(0,off); } }
  $$('.sc-b',f).forEach(function(bt,i){ bt.classList.toggle('done',i+1<n); bt.classList.toggle('cur',i+1===n); if(i+1===n) bt.setAttribute('aria-current','step'); else bt.removeAttribute('aria-current'); });
  $('.sc-sn',f).textContent='Step '+n+' of '+N;
  var cb=$('.sc-b.cur',f), lb=$('.sc-lbl',f), tr=$('.sc-tr',f); lb.textContent=st.t;
  if(cb&&tr){ var tw=tr.offsetWidth, lw=lb.offsetWidth||60, cx=cb.parentNode.offsetLeft+cb.parentNode.offsetWidth/2; lb.style.left=Math.max(0,Math.min(tw-lw,cx-lw/2))+'px'; }
  $('.sc-ct',f).textContent=st.t; $('.sc-cd',f).innerHTML=inl(st.d||'');
  scTween($('.sc-svg',f), G.R.cams[n-1], (instant||motionOff())?0:520);
  var p=$('#primary'), bk=$('#sback'); if(p&&f.classList.contains('hasfoot')){ p.innerHTML=scNext(b,n); } if(bk) bk.disabled=n<=1;
  var pv=$('[data-sc="prev"]',f), nx=$('[data-sc="next"]',f); if(pv) pv.disabled=n<=1; if(nx) nx.innerHTML=f.classList.contains('sc-full')&&n>=N?'Close':scNext(b,n);
  window.SCENE_CUR=f;
}
function scStop(f){ if(f._tm){ clearInterval(f._tm); f._tm=0; } f.classList.remove('sc-play'); }
function scPlay(f){
  var G=SCREG[f.getAttribute('data-sid')]; scStop(f); scSet(f,1);
  if(motionOff()) return;
  f.classList.add('sc-play'); f._tm=setInterval(function(){ if(!document.body.contains(f)){ scStop(f); return; } if(f.classList.contains('sc-paused')) return; if(f._n>=G.R.N){ scStop(f); return; } scSet(f,f._n+1); },2600);
}
function sceneAdvance(){
  var f=window.SCENE_CUR; if(!f||!document.body.contains(f)) return false;
  var G=SCREG[f.getAttribute('data-sid')]; if(!G||!f.classList.contains('hasfoot')) return false;
  if(f._n<G.R.N){ scStop(f); scSet(f,f._n+1); return true; }
  return false;
}
function sceneBack(){ var f=window.SCENE_CUR; if(f&&document.body.contains(f)&&f._n>1){ scStop(f); scSet(f,f._n-1); } }
function scFull(f,on){
  if(on===f.classList.contains('sc-full')) return;
  var bt=$('[data-sc="full"]',f), G=SCREG[f.getAttribute('data-sid')];
  if(on){
    // lifted out of the lesson card to the page, as a dialog: the card's entrance animation would otherwise trap a fixed box inside it
    var lv=f.closest('[data-lv]'); f._ph=document.createElement('div'); f.parentNode.insertBefore(f._ph,f);
    f.setAttribute('data-lv',lv?lv.getAttribute('data-lv'):'1'); document.body.appendChild(f);
    f.setAttribute('role','dialog'); f.setAttribute('aria-modal','true'); f.setAttribute('aria-label',(G&&G.b.title)||'Picture');
    f._rel=trapFocus(f,function(){ scFull(f,false); });
  } else {
    if(f._rel){ f._rel(); f._rel=null; }
    if(f._ph&&f._ph.parentNode){ f._ph.parentNode.insertBefore(f,f._ph); f._ph.parentNode.removeChild(f._ph); }
    f._ph=null; f.removeAttribute('role'); f.removeAttribute('aria-modal'); f.removeAttribute('aria-label'); f.removeAttribute('data-lv');
  }
  f.classList.toggle('sc-full',on); bt.setAttribute('aria-pressed',on?'true':'false'); bt.setAttribute('aria-label',on?'Shrink the picture':'Expand the picture'); bt.innerHTML=scIcon(on?'shrink':'expand');
  scSet(f,f._n,true); try{ bt.focus({preventScroll:true}); }catch(e){ bt.focus(); } f.scrollTop=0;
}
function sceneBind(f){
  var G=SCREG[f.getAttribute('data-sid')]; if(!G) return;
  scSet(f,G.b._st||1,true);
  $$('.sc-b',f).forEach(function(bt){ bt.onclick=function(){ scStop(f); scSet(f,+bt.getAttribute('data-i')); }; });
  var bk=$('#sback'); if(bk&&f.classList.contains('hasfoot')) bk.onclick=function(){ sceneBack(); };
  f.onclick=function(e){
    var t=e.target.closest&&e.target.closest('[data-sc]'); if(!t||!f.contains(t)) return; var a=t.getAttribute('data-sc');
    if(a==='prev'){ scStop(f); scSet(f,f._n-1); }
    else if(a==='next'){ if(f._n>=G.R.N){ if(f.classList.contains('sc-full')) scFull(f,false); } else { scStop(f); scSet(f,f._n+1); } }
    else if(a==='replay'){ scPlay(f); }
    else if(a==='pause'){ var on=!f.classList.contains('sc-paused'); f.classList.toggle('sc-paused',on); t.setAttribute('aria-pressed',on?'true':'false'); t.innerHTML=scIcon(on?'play':'pause'); t.setAttribute('aria-label',on?'Resume the movement':'Pause the movement'); var sv=$('.sc-svg',f); try{ on?sv.pauseAnimations():sv.unpauseAnimations(); }catch(er){} }
    else if(a==='full'){ scFull(f,!f.classList.contains('sc-full')); }
  };
  f.onkeydown=function(e){
    if(e.key==='Escape'&&f.classList.contains('sc-full')){ scFull(f,false); e.stopPropagation(); return; }
    if(!e.target.classList||!e.target.classList.contains('sc-b')) return;
    if(e.key==='ArrowRight'||e.key==='ArrowLeft'){ e.preventDefault(); scStop(f); scSet(f,f._n+(e.key==='ArrowRight'?1:-1)); var cb=$('.sc-b.cur',f); if(cb) cb.focus(); }
  };
}
