/* ================= characters: Zed and Smudge ================= */
/* Zed is a living zero. One body, five forms. The belly shows the level floor: 0, 25, 50, 75, 100.
   Smudge is an ink blot that appears for every question you miss and is wiped in Review. */
var ZB = {1:'#0070C0', 2:'#70AD47', 3:'#FFC000', 4:'#C00000', 5:'#2E2E2E'};
var ZN = {1:'0', 2:'25', 3:'50', 4:'75', 5:'100'};
var ZNAME = {1:'Sprout Zed', 2:'Pencil Zed', 3:'Builder Zed', 4:'Operator Zed', 5:'Crowned Zed'};
var INK = '#161616', GOLD = '#FFC53D', LEAF = '#5BD08A';
function zLimb(d, col){
  return '<path d="'+d+'" fill="none" stroke="'+INK+'" stroke-width="13" stroke-linecap="round"/><path d="'+d+'" fill="none" stroke="'+col+'" stroke-width="7.5" stroke-linecap="round"/>';
}
function zEyes(mood){
  var open = function(px, py, ox){ // ox shifts the whole eye
    return '<ellipse cx="'+(44+ox)+'" cy="60" rx="9.5" ry="11" fill="#fff" stroke="'+INK+'" stroke-width="2.5"/><circle cx="'+(44+ox+px)+'" cy="'+(60+py)+'" r="5" fill="'+INK+'"/><circle cx="'+(44+ox+px+1.9)+'" cy="'+(60+py-2.4)+'" r="1.6" fill="#fff"/>';
  };
  var arcUp = function(ox){ return '<path d="M'+(34.5+ox)+' 63 Q'+(44+ox)+' 49 '+(53.5+ox)+' 63" fill="none" stroke="'+INK+'" stroke-width="4" stroke-linecap="round"/>'; };
  var arcDown = function(ox){ return '<path d="M'+(34.5+ox)+' 58 Q'+(44+ox)+' 68 '+(53.5+ox)+' 58" fill="none" stroke="'+INK+'" stroke-width="4" stroke-linecap="round"/>'; };
  if(mood==='cheer') return arcUp(0)+arcUp(32);
  if(mood==='sleep') return arcDown(0)+arcDown(32);
  if(mood==='wink') return arcUp(0)+open(0,1,32);
  if(mood==='oops') return open(-1.5,3.5,0)+open(-1.5,3.5,32)+'<path d="M35 47 L52 41" stroke="'+INK+'" stroke-width="3.4" stroke-linecap="round"/><path d="M85 47 L68 41" stroke="'+INK+'" stroke-width="3.4" stroke-linecap="round"/>';
  if(mood==='think') return open(3,-3.5,0)+open(3,-3.5,32)+'<path d="M35 44 L52 44" stroke="'+INK+'" stroke-width="3.4" stroke-linecap="round"/><path d="M68 40 L85 35" stroke="'+INK+'" stroke-width="3.4" stroke-linecap="round"/>';
  return open(0.5,1.5,0)+open(0.5,1.5,32);
}
function zMouth(mood){
  var st = 'fill="none" stroke="'+INK+'" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"';
  if(mood==='cheer') return '<path d="M46 78 Q60 102 74 78 Z" fill="'+INK+'" stroke="'+INK+'" stroke-width="2" stroke-linejoin="round"/><path d="M52.500 88.500 Q60 82.500 67.500 88.500 Q60 95 52.500 88.500Z" fill="#FF7A8A"/>';
  if(mood==='oops') return '<path d="M47 87 Q53.500 79 60 85 Q66.500 91 73 82" '+st+'/>';
  if(mood==='think') return '<ellipse cx="66" cy="84" rx="4.200" ry="5" fill="'+INK+'"/>';
  if(mood==='sleep') return '<path d="M53 83 Q60 88 67 83" '+st+'/>';
  if(mood==='wink') return '<path d="M48 80 Q61 91 75 77" '+st+'/>';
  return '<path d="M48 80 Q60 92 72 80" '+st+'/>';
}
function zCheeks(mood){
  if(mood==='oops'||mood==='think'||mood==='sleep') return '';
  return '<ellipse cx="33" cy="77" rx="6" ry="4" fill="#FF8FA3" opacity=".5"/><ellipse cx="87" cy="77" rx="6" ry="4" fill="#FF8FA3" opacity=".5"/>';
}
function zAcc(lv){
  if(lv===1) return '<path d="M60 30 L60 14" stroke="'+INK+'" stroke-width="6" stroke-linecap="round"/><path d="M60 30 L60 14" stroke="'+LEAF+'" stroke-width="2.600" stroke-linecap="round"/>'
    +'<path d="M60 17 C50 3 33 8 37 21 C47 25 57 23 60 17Z" fill="'+LEAF+'" stroke="'+INK+'" stroke-width="2.600" stroke-linejoin="round"/><path d="M60 17 C70 3 87 8 83 21 C73 25 63 23 60 17Z" fill="#7FE0A5" stroke="'+INK+'" stroke-width="2.600" stroke-linejoin="round"/>';
  if(lv===3) return '<path d="M30 42 Q30 10 60 10 Q90 10 90 42 Z" fill="#FFFFFF" stroke="'+INK+'" stroke-width="3" stroke-linejoin="round"/><rect x="54" y="10" width="12" height="28" fill="#E4E4E4" stroke="'+INK+'" stroke-width="2.500"/><rect x="21" y="38" width="78" height="9" rx="4.500" fill="#FFFFFF" stroke="'+INK+'" stroke-width="3"/>';
  if(lv===4) return '<path d="M20 62 Q18 20 60 22 Q102 20 100 62" fill="none" stroke="'+INK+'" stroke-width="9" stroke-linecap="round"/><path d="M20 62 Q18 20 60 22 Q102 20 100 62" fill="none" stroke="#E8EDF7" stroke-width="4" stroke-linecap="round"/>'
    +'<rect x="10" y="50" width="17" height="28" rx="8" fill="#fff" stroke="'+INK+'" stroke-width="3"/><rect x="93" y="50" width="17" height="28" rx="8" fill="#fff" stroke="'+INK+'" stroke-width="3"/><circle cx="18.500" cy="64" r="3.200" fill="'+ZB[4]+'"/><circle cx="101.500" cy="64" r="3.200" fill="'+ZB[4]+'"/>'
    +'<path d="M101 77 Q104 96 80 95" fill="none" stroke="'+INK+'" stroke-width="3.600" stroke-linecap="round"/><circle cx="77" cy="95" r="4.500" fill="'+INK+'"/>';
  if(lv===5) return '<path d="M33 38 L37 9 L50 25 L60 4 L70 25 L83 9 L87 38 Z" fill="'+GOLD+'" stroke="'+INK+'" stroke-width="3" stroke-linejoin="round"/><rect x="33" y="33" width="54" height="9" rx="3" fill="#FFD86B" stroke="'+INK+'" stroke-width="2.500"/>'
    +'<circle cx="37" cy="9" r="3.400" fill="#fff" stroke="'+INK+'" stroke-width="2"/><circle cx="60" cy="4" r="3.400" fill="#fff" stroke="'+INK+'" stroke-width="2"/><circle cx="83" cy="9" r="3.400" fill="#fff" stroke="'+INK+'" stroke-width="2"/>'
    +'<path d="M60 36 l2.200 3 l-2.200 3 l-2.200 -3z" fill="'+ZB[4]+'" stroke="'+INK+'" stroke-width="1.400"/>'
    +'<g fill="'+GOLD+'" stroke="'+INK+'" stroke-width="1.600" stroke-linejoin="round"><path transform="translate(12 30)" d="M0 -9 L2.400 -2.400 L9 0 L2.400 2.400 L0 9 L-2.400 2.400 L-9 0 L-2.400 -2.400Z"/><path transform="translate(110 22) scale(.8)" d="M0 -9 L2.400 -2.400 L9 0 L2.400 2.400 L0 9 L-2.400 2.400 L-9 0 L-2.400 -2.400Z"/></g>';
  return '';
}
function zBehind(lv){ // drawn before the body so the body hides the root
  if(lv===2) return '<g transform="translate(85 36) rotate(24)"><rect x="-5.500" y="-22" width="11" height="34" fill="#FFD23F" stroke="'+INK+'" stroke-width="2.600"/><path d="M-5.500 -22 L0 -35 L5.500 -22 Z" fill="#F6D9B4" stroke="'+INK+'" stroke-width="2.600" stroke-linejoin="round"/><path d="M-2 -30.500 L0 -35 L2 -30.500Z" fill="'+INK+'"/><path d="M0 -20 L0 10" stroke="'+INK+'" stroke-width="1.500" opacity=".35"/></g>';
  return '';
}
function zed(lv, mood, px, extra){
  lv = Math.max(1, Math.min(5, lv||1)); mood = mood||'happy';
  var col = ZB[lv], up = (mood==='cheer');
  var armL = up ? 'M24 66 Q6 54 11 33' : 'M22 72 Q8 82 16 95';
  var armR = up ? 'M96 66 Q114 54 109 33' : 'M98 72 Q112 82 104 95';
  var s = '<svg class="zed '+(extra||'')+'" viewBox="-6 -14 132 160" width="'+px+'" height="'+Math.round(px*160/132)+'" aria-hidden="true" focusable="false">'
    +'<ellipse class="zsh" cx="60" cy="136" rx="34" ry="4.500" fill="#000" opacity=".12"/>'
    +'<ellipse cx="44" cy="124" rx="13" ry="8" fill="'+col+'" stroke="'+INK+'" stroke-width="3"/><ellipse cx="76" cy="124" rx="13" ry="8" fill="'+col+'" stroke="'+INK+'" stroke-width="3"/>'
    +zBehind(lv)+zLimb(armL,col)+zLimb(armR,col)
    +'<ellipse cx="60" cy="72" rx="42" ry="46" fill="'+col+'" stroke="'+INK+'" stroke-width="3.200"/>'
    +'<path d="M29 56 Q32 40 46 33" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".3"/>'
    +'<circle cx="60" cy="104" r="11.500" fill="#fff" stroke="'+INK+'" stroke-width="2.600"/>'
    +'<text x="60" y="'+(lv===5?108:108.500)+'" text-anchor="middle" font-family="Outfit,Inter,sans-serif" font-weight="800" font-size="'+(lv===5?10:lv===1?14:12.500)+'" fill="'+INK+'">'+ZN[lv]+'</text>'
    +zCheeks(mood)+zEyes(mood)+zMouth(mood)
    +(mood==='oops'?'<path d="M92 36 q5 8 0 12 q-5 -4 0 -12Z" fill="#7DD3FC" stroke="'+INK+'" stroke-width="1.800" stroke-linejoin="round"/>':'')
    +(mood==='sleep'?'<g font-family="Outfit,Inter,sans-serif" font-weight="800" fill="'+INK+'"><text x="92" y="36" font-size="14">z</text><text x="102" y="24" font-size="10">z</text></g>':'')
    +zAcc(lv)
    +'</svg>';
  return s;
}
function smudge(px, cleared, extra){
  var s='<svg class="smudge '+(extra||'')+'" viewBox="0 0 64 62" width="'+px+'" height="'+Math.round(px*62/64)+'" aria-hidden="true" focusable="false">'
    +'<ellipse cx="22" cy="55" rx="7" ry="4.500" fill="#333333" stroke="'+INK+'" stroke-width="2"/><ellipse cx="42" cy="55" rx="7" ry="4.500" fill="#333333" stroke="'+INK+'" stroke-width="2"/>'
    +'<path d="M9 37 C3 21 15 8 31 10 C34 3 44 3 46 10 C58 14 62 28 55 38 C58 49 45 54 32 52 C20 56 5 49 9 37Z" fill="#4F4F4F" stroke="'+INK+'" stroke-width="2.800" stroke-linejoin="round"/>'
    +'<path d="M16 24 Q19 17 26 15" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".25"/>';
  if(cleared) s+='<path d="M20 33 Q25 27 30 33" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M36 33 Q41 27 46 33" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M26 41 Q33 48 40 41" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>';
  else s+='<circle cx="25" cy="32" r="6.500" fill="#fff"/><circle cx="41" cy="32" r="6.500" fill="#fff"/><circle cx="26.500" cy="34" r="3" fill="'+INK+'"/><circle cx="42.500" cy="34" r="3" fill="'+INK+'"/><path d="M26 44 L30 41 L34 44 L38 41 L42 44" fill="none" stroke="#fff" stroke-width="2.600" stroke-linecap="round" stroke-linejoin="round"/>';
  return s+'</svg>';
}
function logoMark(px){
  return '<svg class="mark" viewBox="0 0 32 32" width="'+px+'" height="'+px+'" aria-hidden="true"><rect width="32" height="32" rx="9" fill="var(--brand)"/><circle cx="16" cy="16" r="8.200" fill="none" stroke="var(--surface)" stroke-width="4.200"/><circle cx="13.300" cy="14.600" r="1.700" fill="var(--surface)"/><circle cx="18.700" cy="14.600" r="1.700" fill="var(--surface)"/></svg>';
}
