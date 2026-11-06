/* Art: satu sistem grafik SVG (komponen dipakai ulang). Semua fungsi mengembalikan string SVG. */
(function (root) {
  var C = {
    ink: '#2B2D42', cream: '#FFF4DC', sun: '#FFC93C', red: '#EF5B4B', teal: '#1FA89B',
    sky: '#8ED6F0', leaf: '#6CBF58', road: '#5B6784', slate: '#7C86A8', skin: '#F2B98C', wood: '#C98B4B'
  };
  var SW = 4;

  function shade(hex, amt) {
    var n = parseInt(hex.slice(1), 16), r = (n >> 16) + amt, g = ((n >> 8) & 255) + amt, b = (n & 255) + amt;
    r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  function st(w) { return ' stroke="' + C.ink + '" stroke-width="' + (w || SW) + '" stroke-linejoin="round" stroke-linecap="round"'; }

  /* ikon tempat (siluet unik), digambar di lingkaran r=21 */
  var placeIcons = {
    bank: '<path d="M-11 -4 L0 -12 L11 -4 Z M-9 -2 h4 v12 h-4z M-2 -2 h4 v12 h-4z M5 -2 h4 v12 h-4z M-12 11 h24" fill="' + C.ink + '"' + st(2.4) + '/>',
    hospital: '<rect x="-12" y="-12" width="24" height="24" rx="6" fill="' + C.red + '"' + st(2.4) + '/><path d="M-3 -8h6v5h5v6h-5v5h-6v-5h-5v-6h5z" fill="#fff"/>',
    library: '<path d="M-12 8 V-8 Q-6 -11 0 -7 Q6 -11 12 -8 V8 Q6 5 0 9 Q-6 5 -12 8Z M0 -7 V9" fill="' + C.sun + '"' + st(2.4) + '/>',
    park: '<circle cx="0" cy="-4" r="9" fill="' + C.leaf + '"' + st(2.4) + '/><rect x="-2" y="4" width="4" height="8" fill="' + C.ink + '"/>',
    school: '<path d="M-12 8 V-3 L0 -12 L12 -3 V8Z" fill="' + C.red + '"' + st(2.4) + '/><rect x="-3" y="0" width="6" height="8" fill="' + C.cream + '"/>',
    market: '<path d="M-12 -4 L-9 -11 H9 L12 -4Z" fill="' + C.red + '"' + st(2.4) + '/><rect x="-10" y="-4" width="20" height="14" fill="' + C.sun + '"' + st(2.4) + '/>',
    post: '<rect x="-12" y="-8" width="24" height="17" rx="3" fill="' + C.cream + '"' + st(2.4) + '/><path d="M-12 -8 L0 2 L12 -8" fill="none"' + st(2.4) + '/>',
    bus: '<rect x="-12" y="-9" width="24" height="16" rx="4" fill="' + C.teal + '"' + st(2.4) + '/><circle cx="-6" cy="9" r="3" fill="' + C.ink + '"/><circle cx="6" cy="9" r="3" fill="' + C.ink + '"/><rect x="-9" y="-6" width="18" height="6" fill="' + C.sky + '"/>'
  };

  /* gedung 3/4: (x,y) pojok kiri-bawah fasad, w lebar, h tinggi, d kedalaman sisi */
  function building(x, y, w, h, d, wall, roof, icon, opt) {
    opt = opt || {};
    var s = '<g class="bld">';
    s += '<ellipse cx="' + (x + w / 2 + d / 2) + '" cy="' + (y + 6) + '" rx="' + (w / 2 + d) + '" ry="9" fill="#000" opacity=".15"/>';
    s += '<polygon points="' + (x + w) + ',' + y + ' ' + (x + w + d) + ',' + (y - d * 0.6) + ' ' + (x + w + d) + ',' + (y - h - d * 0.6) + ' ' + (x + w) + ',' + (y - h) + '" fill="' + shade(wall, -28) + '"' + st() + '/>';
    s += '<rect x="' + x + '" y="' + (y - h) + '" width="' + w + '" height="' + h + '" rx="6" fill="' + wall + '"' + st() + '/>';
    s += '<polygon points="' + (x - 8) + ',' + (y - h) + ' ' + (x + w + 8) + ',' + (y - h) + ' ' + (x + w + d + 6) + ',' + (y - h - d * 0.6) + ' ' + (x + d * 0.7) + ',' + (y - h - d * 0.6) + '" fill="' + roof + '"' + st() + '/>';
    s += '<rect x="' + (x + w / 2 - 14) + '" y="' + (y - 44) + '" width="28" height="44" rx="5" fill="' + C.ink + '" opacity=".85"/>';
    s += '<rect x="' + (x + 12) + '" y="' + (y - h + 18) + '" width="24" height="22" rx="4" fill="' + C.sky + '"' + st(3) + '/>';
    s += '<rect x="' + (x + w - 36) + '" y="' + (y - h + 18) + '" width="24" height="22" rx="4" fill="' + C.sky + '"' + st(3) + '/>';
    if (icon) s += '<g transform="translate(' + (x + w / 2) + ',' + (y - h * 0.52) + ')"><circle r="21" fill="' + C.cream + '"' + st(3) + '/>' + (placeIcons[icon] || '') + '</g>';
    if (opt.flag) s += '<path d="M' + (x + w - 8) + ' ' + (y - h - 4) + ' v-24" stroke="' + C.ink + '" stroke-width="4"/><path d="M' + (x + w - 8) + ' ' + (y - h - 28) + ' h26 l-7 8 l7 8 h-26z" fill="' + C.sun + '"' + st(3) + '/>';
    if (opt.mailbox) s += '<g transform="translate(' + (x - 26) + ',' + y + ')"><rect x="-3" y="-30" width="6" height="30" fill="' + C.ink + '"/><rect x="-14" y="-48" width="28" height="20" rx="8" fill="' + C.red + '"' + st(3) + '/></g>';
    return s + '</g>';
  }
  function tree(x, y, s, sway) {
    s = s || 1;
    return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')"><g class="' + (sway ? 'sway' : '') + '"><rect x="-5" y="-26" width="10" height="26" rx="3" fill="#8B5E3C"' + st(3) + '/>' +
      '<circle cy="-46" r="26" fill="' + C.leaf + '"' + st() + '/><circle cx="-8" cy="-52" r="8" fill="#9BDB86" opacity=".8"/></g></g>';
  }
  function bush(x, y) {
    return '<g transform="translate(' + x + ',' + y + ')"><ellipse cx="0" cy="-10" rx="22" ry="14" fill="#5DAE4B"' + st(3) + '/><circle cx="-6" cy="-14" r="3" fill="' + C.red + '"/><circle cx="8" cy="-9" r="3" fill="' + C.sun + '"/></g>';
  }
  function cloud(x, y, s) {
    return '<g transform="translate(' + x + ',' + y + ') scale(' + (s || 1) + ')"><path d="M0 0 q-8 -20 18 -20 q8 -18 34 -8 q26 -6 26 14 q14 4 4 14 H8 q-18 0 -8 -0Z" fill="#fff"' + st(3) + '/></g>';
  }
  function bird(x, y) {
    return '<g transform="translate(' + x + ',' + y + ')"><g class="flap"><path d="M-14 0 Q-7 -11 0 0 Q7 -11 14 0" fill="none"' + st(3) + '/></g></g>';
  }
  function car(color) {
    return '<g><rect x="-34" y="-16" width="68" height="30" rx="12" fill="' + color + '"' + st() + '/><rect x="-14" y="-28" width="34" height="18" rx="8" fill="' + C.sky + '"' + st() + '/>' +
      '<circle cx="-18" cy="14" r="8" fill="' + C.ink + '"/><circle cx="18" cy="14" r="8" fill="' + C.ink + '"/></g>';
  }

  /* kurir: mode 'back' (menghadap atas, sedang mengayuh) atau 'front' (wajah terlihat); expr: happy|cheer|confused */
  function courier(mode, expr) {
    var s = '<g class="cr ' + mode + ' ' + (expr || '') + '"><g class="cr-bob">';
    s += '<ellipse cx="0" cy="64" rx="54" ry="12" fill="#000" opacity=".18"/>';
    s += '<ellipse cx="0" cy="56" rx="9" ry="22" fill="' + C.ink + '"/><ellipse cx="0" cy="-8" rx="7" ry="18" fill="' + C.ink + '" opacity=".9"/>';
    s += '<path d="M0 50 L0 -10" stroke="' + C.red + '" stroke-width="10" stroke-linecap="round"/>';
    s += '<ellipse class="shoe l" cx="-32" cy="36" rx="10" ry="7" fill="#fff"' + st(3) + '/><ellipse class="shoe r" cx="32" cy="36" rx="10" ry="7" fill="#fff"' + st(3) + '/>';
    s += '<rect x="-24" y="20" width="48" height="34" rx="6" fill="' + C.wood + '"' + st() + '/><path d="M0 20 V54 M-24 37 H24" stroke="' + C.cream + '" stroke-width="5"/>';
    s += '<path d="M-22 14 Q-24 -22 0 -26 Q24 -22 22 14 Z" fill="' + C.teal + '"' + st() + '/>';
    s += '<path d="M-44 -38 H44" stroke="' + C.ink + '" stroke-width="6" stroke-linecap="round"/>';
    s += '<g transform="translate(-20,-10)"><g class="arm l"><path d="M0 0 Q-14 -8 -12 -26" stroke="' + C.teal + '" stroke-width="12" stroke-linecap="round" fill="none"/><circle cx="-12" cy="-27" r="7" fill="' + C.red + '"' + st(3) + '/></g></g>';
    s += '<g transform="translate(20,-10)"><g class="arm r"><path d="M0 0 Q14 -8 12 -26" stroke="' + C.teal + '" stroke-width="12" stroke-linecap="round" fill="none"/><circle cx="12" cy="-27" r="7" fill="' + C.teal + '"' + st(3) + '/></g></g>';
    if (mode === 'front') {
      s += '<g class="head"><circle cy="-42" r="21" fill="' + C.skin + '"' + st() + '/>';
      s += '<path d="M-22 -44 Q-22 -72 0 -72 Q22 -72 22 -44 Q0 -52 -22 -44Z" fill="' + C.sun + '"' + st() + '/>';
      s += '<g class="eyes"><circle cx="-8" cy="-38" r="3.2" fill="' + C.ink + '"/><circle cx="8" cy="-38" r="3.2" fill="' + C.ink + '"/></g>';
      if (expr === 'cheer') s += '<path d="M-9 -32 Q0 -18 9 -32Z" fill="' + C.ink + '"/><path d="M-5 -27 Q0 -23 5 -27" fill="' + C.red + '"/>';
      else if (expr === 'confused') s += '<path d="M-6 -29 q3 -4 6 0 t6 0" fill="none"' + st(2.5) + '/><path d="M-14 -46 l10 3 M14 -46 l-10 3" stroke="' + C.ink + '" stroke-width="2.5" stroke-linecap="round"/>' +
        '<text x="26" y="-62" font-family="Nunito" font-weight="900" font-size="30" fill="' + C.red + '"' + ' stroke="' + C.ink + '" stroke-width="3" paint-order="stroke">?</text>';
      else s += '<path d="M-8 -31 Q0 -24 8 -31" fill="none"' + st(2.8) + '/>';
      s += '</g>';
    } else {
      s += '<g class="head"><ellipse cx="0" cy="-26" rx="10" ry="6" fill="' + C.skin + '"' + st(3) + '/>';
      s += '<circle cy="-46" r="22" fill="' + C.sun + '"' + st() + '/><path d="M-4 -68 Q-4 -46 -4 -26 M4 -68 Q4 -46 4 -26" stroke="' + C.ink + '" stroke-width="3" opacity=".35" fill="none"/>';
      s += '<path d="M-18 -36 Q0 -30 18 -36" fill="none" stroke="' + C.red + '" stroke-width="4"/></g>';
    }
    return s + '</g></g>';
  }

  /* pelanggan: kind 'kid' | 'granny' | 'lady'; origin di kaki */
  var PEOPLE = [
    { kind: 'kid', skin: '#E0A878', hair: '#2B2D42', shirt: '#EF5B4B' },
    { kind: 'granny', skin: '#F2B98C', hair: '#D8D8E0', shirt: '#7C86A8' },
    { kind: 'lady', skin: '#C98B5B', hair: '#5A3A28', shirt: '#FFC93C' }
  ];
  function person(p, happy) {
    var s = '<g class="person"><ellipse cx="0" cy="2" rx="26" ry="7" fill="#000" opacity=".16"/>';
    s += '<rect x="-14" y="-30" width="9" height="30" rx="4" fill="' + C.ink + '"/><rect x="5" y="-30" width="9" height="30" rx="4" fill="' + C.ink + '"/>';
    s += '<path d="M-20 -30 Q-22 -70 0 -72 Q22 -70 20 -30Z" fill="' + p.shirt + '"' + st() + '/>';
    s += '<g class="parm l"><path d="M-18 -62 Q-34 -50 -30 -36" stroke="' + p.shirt + '" stroke-width="10" stroke-linecap="round" fill="none"/><circle cx="-30" cy="-34" r="6" fill="' + p.skin + '"' + st(3) + '/></g>';
    s += '<g class="parm r"><path d="M18 -62 Q34 -50 30 -36" stroke="' + p.shirt + '" stroke-width="10" stroke-linecap="round" fill="none"/><circle cx="30" cy="-34" r="6" fill="' + p.skin + '"' + st(3) + '/></g>';
    s += '<circle cy="-90" r="21" fill="' + p.skin + '"' + st() + '/>';
    if (p.kind === 'kid') s += '<path d="M-21 -92 Q-21 -114 0 -114 Q21 -114 21 -92 Q0 -100 -21 -92Z" fill="' + p.hair + '"' + st() + '/><path d="M-4 -98 h28" stroke="' + C.ink + '" stroke-width="5" stroke-linecap="round"/>';
    if (p.kind === 'granny') s += '<circle cy="-112" r="9" fill="' + p.hair + '"' + st(3) + '/><path d="M-21 -92 Q-21 -108 0 -108 Q21 -108 21 -92 Q0 -102 -21 -92Z" fill="' + p.hair + '"' + st() + '/><circle cx="-8" cy="-90" r="6" fill="none"' + st(2.4) + '/><circle cx="8" cy="-90" r="6" fill="none"' + st(2.4) + '/>';
    if (p.kind === 'lady') s += '<path d="M-21 -92 Q-23 -112 0 -112 Q23 -112 21 -92Q10 -100 -21 -92Z" fill="' + p.hair + '"' + st() + '/><ellipse cy="-104" rx="32" ry="7" fill="' + C.red + '"' + st() + '/><path d="M-14 -104 Q-14 -122 0 -122 Q14 -122 14 -104Z" fill="' + C.red + '"' + st() + '/>';
    s += '<circle cx="-7" cy="-88" r="2.8" fill="' + C.ink + '"/><circle cx="7" cy="-88" r="2.8" fill="' + C.ink + '"/>';
    s += happy ? '<path d="M-8 -81 Q0 -71 8 -81Z" fill="' + C.ink + '"/>' : '<path d="M-6 -80 Q0 -76 6 -80" fill="none"' + st(2.6) + '/>';
    return s + '</g>';
  }
  function pkg() {
    return '<g><rect x="-20" y="-16" width="40" height="32" rx="5" fill="' + C.wood + '"' + st() + '/><path d="M0 -16 V16 M-20 0 H20" stroke="' + C.cream + '" stroke-width="5"/></g>';
  }

  /* ikon gerak: panah dengan garis tepi. size ~ lingkaran r=26 */
  function moveIcon(cmd) {
    var o = 'stroke="' + C.ink + '" stroke-linecap="round" stroke-linejoin="round" fill="none"';
    function arrow(d, head) {
      return '<path d="' + d + '" ' + o + ' stroke-width="14"/><path d="' + d + '" stroke="' + C.cream + '" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' +
        '<polygon points="' + head + '" fill="' + C.cream + '" stroke="' + C.ink + '" stroke-width="4" stroke-linejoin="round"/>';
    }
    if (cmd === 'straight') return arrow('M0 18 V-4', '-14,-4 0,-24 14,-4');
    if (cmd === 'left') return arrow('M8 18 V4 Q8 -8 -4 -8 H-8', '-8,-22 -26,-8 -8,6');
    if (cmd === 'right') return arrow('M-8 18 V4 Q-8 -8 4 -8 H8', '8,-22 26,-8 8,6');
    return '<polygon points="-10,-24 10,-24 24,-10 24,10 10,24 -10,24 -24,10 -24,-10" fill="' + C.red + '" stroke="' + C.ink + '" stroke-width="4" stroke-linejoin="round"/>' +
      '<text y="5" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="13" fill="#fff">STOP</text>';
  }
  var MOVE_COLOR = { left: C.red, straight: C.sun, right: C.teal, stop: C.slate };
  function moveBadge(cmd, r) {
    r = r || 34;
    return '<g><circle r="' + r + '" fill="' + (cmd === 'stop' ? C.cream : MOVE_COLOR[cmd]) + '"' + st() + '/><g transform="scale(' + (r / 30) + ')">' + moveIcon(cmd) + '</g></g>';
  }
  /* lencana tangan L/R di sisi kurir */
  function handBadge(side) {
    var col = side === 'L' ? C.red : C.teal, tx = side === 'L' ? 11 : -11;
    return '<g class="hbadge ' + side + '"><circle r="36" fill="' + col + '"' + st() + '/>' +
      '<ellipse cx="' + tx + '" cy="-6" rx="6" ry="9" fill="' + C.cream + '"' + st(2.5) + ' transform="rotate(' + (side === 'L' ? 30 : -30) + ' ' + tx + ' -6)"/>' +
      '<rect x="-12" y="-22" width="24" height="26" rx="9" fill="' + C.cream + '"' + st(2.5) + '/>' +
      '<text y="26" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="22" fill="#fff" stroke="' + C.ink + '" stroke-width="4" paint-order="stroke">' + side + '</text></g>';
  }
  function starShape(r, fill) {
    var pts = [], i;
    for (i = 0; i < 10; i++) {
      var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.46 : r;
      pts.push((Math.cos(a) * rr).toFixed(1) + ',' + (Math.sin(a) * rr).toFixed(1));
    }
    return '<polygon points="' + pts.join(' ') + '" fill="' + (fill || C.sun) + '"' + st() + '/>';
  }
  /* stempel Buku Kurir */
  function stamp(cmd, word, on) {
    var col = on ? C.red : '#B8BDD0';
    return '<g><circle r="62" fill="' + C.cream + '"' + st() + '/><circle r="52" fill="none" stroke="' + col + '" stroke-width="4" stroke-dasharray="8 6"/>' +
      (on ? '<circle r="40" fill="' + (cmd === 'stop' ? C.cream : MOVE_COLOR[cmd]) + '"' + st(3) + '/><g transform="scale(1.05)">' + moveIcon(cmd) + '</g>' : '<text y="16" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="52" fill="#B8BDD0">?</text>') +
      '<text y="108" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="26" fill="' + (on ? C.ink : C.slate) + '">' + word + '</text></g>';
  }
  /* tangan penunjuk: ujung jari di (0,0) */
  function pointerHand() {
    return '<g transform="rotate(-18)"><rect x="-8" y="0" width="16" height="40" rx="8" fill="' + C.cream + '"' + st() + '/>' +
      '<rect x="-16" y="24" width="46" height="40" rx="16" fill="' + C.cream + '"' + st() + '/><ellipse cx="-16" cy="48" rx="8" ry="12" fill="' + C.cream + '"' + st(3) + ' transform="rotate(18 -16 48)"/>' +
      '<rect x="-8" y="24" width="16" height="10" fill="' + C.cream + '"/></g>';
  }
  function phoneIcon() {
    return '<path d="M-12 -12 q-6 0 -4 8 q6 16 20 22 q8 2 8 -4 l-2 -6 l-8 -2 l-4 4 q-8 -4 -10 -12 l4 -4 l-2 -8z" fill="#fff"' + st(2.5) + '/>';
  }
  function speaker() {
    return '<path d="M-18 -5 h7 l8 -8 v26 l-8 -8 h-7z" fill="#fff"' + st(3) + '/><path d="M2 -6 q5 6 0 12 M8 -13 q11 13 0 26" fill="none"' + st(3) + '/>';
  }

  root.Art = {
    C: C, SW: SW, shade: shade, st: st, building: building, tree: tree, bush: bush, cloud: cloud, bird: bird, car: car,
    courier: courier, person: person, PEOPLE: PEOPLE, pkg: pkg, moveIcon: moveIcon, moveBadge: moveBadge, MOVE_COLOR: MOVE_COLOR,
    handBadge: handBadge, starShape: starShape, stamp: stamp, pointerHand: pointerHand, phoneIcon: phoneIcon, speaker: speaker,
    placeIcons: placeIcons
  };
})(window);
