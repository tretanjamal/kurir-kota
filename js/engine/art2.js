/* Art2: tambahan grafik untuk Level 2-3 dan Bos (tempat bernama, kurir tampak atas, diagram relasi, lencana kata) */
(function (root) {
  var A = root.Art, C = A.C, st = A.st;

  /* aset gambar (js/data/assets.js): dipakai hanya bila berkasnya terdaftar dan sudah termuat; selain itu SVG bawaan */
  var ok = {};
  var Assets = {
    has: function (key) { return !!ok[key]; },
    /* muat semua berkas terdaftar; cb dipanggil sekali (maks. 2,5 dtk) */
    load: function (cb) {
      var L = root.ASSETS.list, jobs = [];   // entri dengan `file` (satu gambar) atau `files` (kumpulan gambar; ok bila semuanya termuat)
      Object.keys(L).forEach(function (k) {
        if (L[k].file) jobs.push([k, [L[k].file]]);
        else if (L[k].files) jobs.push([k, Object.keys(L[k].files).map(function (d) { return L[k].files[d]; })]);
      });
      var left = jobs.length, done = false;
      function fin() { if (!done) { done = true; cb(); } }
      if (!left) return fin();
      setTimeout(fin, 2500);
      jobs.forEach(function (j) {
        var n = j[1].length, bad = false;
        function one(good) { if (!good) bad = true; if (--n === 0) { if (!bad) ok[j[0]] = true; if (--left === 0) fin(); } }
        j[1].forEach(function (f) { var im = new Image(); im.onload = function () { one(true); }; im.onerror = function () { one(false); }; im.src = root.ASSETS.dir + f; });
      });
    },
    /* elemen <image> SVG; align bawah-tengah secara bawaan */
    image: function (key, x, y, w, h) {
      return '<image href="' + root.ASSETS.dir + root.ASSETS.list[key].file + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" preserveAspectRatio="xMidYMax meet"/>';
    }
  };
  root.Assets = Assets;
  /* gambar diam pada slot peta diam (kotak w x h, dasar rata di y=base, tengah di cx); null bila tak ada gambar */
  /* kurir 8 arah (assets.js courierD: satu gambar per arah tanpa bayangan + courierRx_* reaksi bersorak/bingung).
     h = tinggi tampil kurir+sepeda (helm sampai dasar roda, dari config/skala.js); foot = jarak titik pijak (dasar roda) di bawah titik pusat grup.
     Bayangan = satu elips tembus pandang dari kode (sama untuk semua arah, tetap di tanah saat kurir memantul).
     Cadangan: SVG Art.courier / Art.bikeTop bila gambar tidak ada. */
  A.courierSpriteOK = function () { return Assets.has('courierD') && Assets.has('courierRx_cheer') && Assets.has('courierRx_confused'); };
  A.courierSprite = function (h, foot) {
    var L = root.ASSETS.list, a = L.courierD, r = L.courierRx_cheer, k = h / a.ch, kr = h * a.hr / r.helmet;
    return '<g class="cr cr3d" data-h="' + h + '" data-foot="' + foot + '">' +
      '<ellipse class="csh" cx="0" cy="0" rx="' + (h * 0.3).toFixed(1) + '" ry="' + (h * 0.065).toFixed(1) + '" fill="#2B2D42" fill-opacity=".22" transform="translate(0,' + foot + ')"/>' +
      '<g class="hop"><image class="cs" x="' + Math.round(-a.px * k) + '" y="' + Math.round(foot - a.py * k) + '" width="' + (a.w * k).toFixed(1) + '" height="' + (a.h * k).toFixed(1) + '" href=""/>' +
      '<image class="rx" display="none" x="' + Math.round(-r.px * kr) + '" y="' + Math.round(foot - r.py * kr) + '" width="' + (r.w * kr).toFixed(1) + '" height="' + (r.h * kr).toFixed(1) + '" href=""/>' +
      '</g></g>';
  };
  /* atur gambar: dir 0-7 (N searah jarum jam), phase = waktu mengayuh (8/dtk) untuk pantulan, pose = 'cheer' | 'confused' | null.
     Pantulan hanya saat .riding (tinggi bulat piksel, bayangan mengecil sedikit saat naik); miring 5 derajat pada arah diagonal (transisi belok). */
  A.courierFrame = function (cr, dir, phase, pose) {
    var a = root.ASSETS.list.courierD, h = +cr.dataset.h, foot = +cr.dataset.foot, riding = cr.classList.contains('riding') && !pose;
    var bob = riding ? Math.round(h * 0.022 * Math.abs(Math.sin((phase || 0) * Math.PI / 2.67))) : 0;
    var key = (pose || dir) + '|' + bob; if (cr.dataset.f === key) return; cr.dataset.f = key;
    var s = cr.querySelector('.cs'), x = cr.querySelector('.rx'), hop = cr.querySelector('.hop'), sh = cr.querySelector('.csh');
    var wasBob = +cr.dataset.b > 0; cr.dataset.b = bob;
    hop.style.transform = bob ? 'translateY(' + (-bob) + 'px)' : '';
    hop.style.animation = bob ? 'none' : (wasBob ? 'crsquash .32s ease-out, crbreathe 2.8s ease-in-out .32s infinite' : '');   // berhenti: memipih sebentar
    sh.setAttribute('transform', 'translate(0,' + foot + ') scale(' + (1 - bob / h * 3).toFixed(3) + ')');
    if (pose) {
      x.setAttribute('href', root.ASSETS.dir + root.ASSETS.list['courierRx_' + pose].file); x.setAttribute('display', 'inline'); s.setAttribute('display', 'none'); sh.setAttribute('display', 'none'); return;
    }
    sh.removeAttribute('display'); x.setAttribute('display', 'none'); s.removeAttribute('display');
    s.setAttribute('href', root.ASSETS.dir + a.files[a.dirs[dir]]);
    var tilt = dir % 2 === 1 ? (dir === 1 || dir === 3 ? 5 : -5) : 0;   // diagonal = sedang belok: miring sedikit
    if (tilt) { s.style.transformBox = 'fill-box'; s.style.transformOrigin = '50% 100%'; s.style.transform = 'rotate(' + tilt + 'deg)'; } else s.style.transform = '';  };  /* ---- lingkungan (assets.js env_*, veh_*): menggantikan SVG ambient (pohon, semak, awan, burung, mobil) bila gambarnya ada; SVG lama = cadangan ---- */
  function envImg(key, x, y, s) {   // pivot tengah-dasar gambar di (x,y); s = skala terhadap tinggi tampil dh
    var a = root.ASSETS.list[key], k = (a.dh / a.h) * (s || 1);
    return '<image href="' + root.ASSETS.dir + a.file + '" x="' + (x - a.px * k) + '" y="' + (y - a.py * k) + '" width="' + (a.w * k) + '" height="' + (a.h * k) + '"/>';
  }
  function hash2(x, y) { return Math.abs(Math.round(x * 7 + y * 13 + x * y * 0.013)); }
  var TREES = ['env_tree_round', 'env_tree_tall', 'env_tree_palm'], BUSHES = ['env_bush_a', 'env_bush_b', 'env_bush_c'], FLOWERS = ['env_flower_a', 'env_flower_b', 'env_flower_c'], CLOUDS = ['env_cloud_s', 'env_cloud_m', 'env_cloud_l'];
  var oTree = A.tree, oBush = A.bush, oCloud = A.cloud, oBird = A.bird, oCar = A.car;
  /* ukuran dari config/skala.js: A.view = pandangan aktif ('dekat' | 'peta' | 'judul'); s = variasi kecil (0,9-1,1) di atas tinggi acuan */
  A.view = 'dekat';
  function sk(kind, y, s) { return root.SKALA.h(kind, A.view, y) * (s || 1); }
  function envH(key, x, y, th) { return envImg(key, x, y, th / root.ASSETS.list[key].dh); }
  A.tree = function (x, y, s, sway) {
    var key = TREES[hash2(x, y) % 3]; if (!Assets.has(key)) return oTree(x, y, s, sway);
    return '<g class="' + (sway ? 'sway' : '') + '">' + envH(key, x, y, sk(key.replace('env_', ''), y, s)) + '</g>';
  };
  A.bush = function (x, y, s) {
    var key = BUSHES[hash2(x, y) % 3]; if (!Assets.has(key)) return oBush(x, y);
    return '<g class="sway2">' + envH(key, x, y + 2, sk('bush', y, s)) + '</g>';
  };
  A.flowers = function (x, y, s) {
    var key = FLOWERS[hash2(x, y) % 3]; if (!Assets.has(key)) return '';
    return '<g class="sway2">' + envH(key, x, y, sk('flower', y, s)) + '</g>';
  };
  A.lamp = function (x, y, s) { return Assets.has('env_lamp') ? envH('env_lamp', x, y, sk('lamp', y, s)) : ''; };
  A.cloud = function (x, y, s) {
    var i = hash2(x, y + (s || 1) * 37) % 3, key = CLOUDS[(s || 1) >= 1.2 ? 2 : i]; if (!Assets.has(key)) return oCloud(x, y, s);
    return envImg(key, x + 40 * (s || 1), y, s || 1);
  };
  /* burung: satu frame (dua frame asli tidak sejajar rapi), hidup lewat gerak naik-turun + miring di CSS (.birdbob) */
  A.bird = function (x, y) {
    if (!Assets.has('env_bird1')) return oBird(x, y);
    return '<g transform="translate(' + x + ',' + y + ')"><g class="birdbob">' + envImg('env_bird1', 0, 0, 1) + '</g></g>';
  };
  /* kendaraan menurut arah jalan. dir: 1 = ke kanan, -1 = ke kiri (cermin tampilan samping kanan). Warna kuning -> minibus, selain itu mobil merah. */
  function vehKind(color) { return color === '#FFC93C' || color === C.sun ? 'veh_bus' : 'veh_car'; }
  A.car = function (color, dir) {
    var p = vehKind(color); if (!Assets.has(p + '_side')) return oCar(color);
    var y = A.carY || 400, th = sk(p === 'veh_bus' ? 'bus' : 'car', y);
    return '<g' + (dir < 0 ? ' transform="scale(-1,1)"' : '') + '>' + envH(p + '_side', 0, 22, th) + '</g>';
  };
  /* jalan tegak: away = menjauh (tampak belakang), selain itu mendekat (tampak depan) */
  A.vcar = function (color, away) {
    var p = vehKind(color), key = p + (away ? '_back' : '_front'); if (!Assets.has(key)) return '';
    var th = sk(p === 'veh_bus' ? 'bus' : 'car', A.carY || 400);
    return envImg(key, 0, 0, th / root.ASSETS.list[p + '_side'].dh);
  };
  /* pejalan kaki ambient: sprite pelanggan n (menghadap depan) mondar-mandir sejauh `span` px dari x, dengan langkah naik-turun kecil. Tinggi isi h px, kaki di y. '' bila gambar tidak ada. */
  A.walker = function (n, x, y, h, span, dur, delay) {
    var a = root.ASSETS.list['cust_c' + n + '_idle']; if (!a || !Assets.has('cust_c' + n + '_idle')) return '';
    var k = h / a.ch;
    return '<g transform="translate(' + x + ',' + y + ')"><g class="pace" style="--pw:' + span + 'px;animation-duration:' + dur + 's;animation-delay:-' + (delay || 0) + 's"><g class="stepbob">' +
      '<ellipse cx="0" cy="0" rx="' + Math.round(h * 0.28) + '" ry="' + Math.round(h * 0.06) + '" fill="#2B2D42" opacity=".18"/>' +
      '<image x="' + (-a.px * k) + '" y="' + (-a.py * k) + '" width="' + (a.w * k) + '" height="' + (a.h * k) + '" href="' + root.ASSETS.dir + a.file + '"/></g></g></g>';
  };
  A.slotImage = function (key, cx, base, w, h) {
    if (!Assets.has(key)) return null;
    var a = root.ASSETS.list[key], s = Math.min(w / a.w, h / a.h), iw = a.w * s, ih = a.h * s;
    return Assets.image(key, cx - iw / 2, base - ih, iw, ih);
  };
  /* gambar diam dalam kotak bw x bh (kotak bangunan SVG yang digantikan): contain, tengah-bawah, dasar di y=0 */
  function stillImage(key, bw, bh) {
    var a = root.ASSETS.list[key], s = Math.min(bw / a.w, bh / a.h), w = a.w * s, h = a.h * s;
    return { x: (bw - w) / 2, y: -h, w: w, h: h };
  }

  /* gaya per tempat: siluet (w,h,d), warna dinding dan atap unik */
  var PLACE = {
    bank: { w: 150, h: 116, d: 36, wall: '#E9C46A', roof: '#5B6784' },
    hospital: { w: 118, h: 168, d: 32, wall: '#F7F3E3', roof: '#EF5B4B' },
    library: { w: 140, h: 132, d: 38, wall: '#C98B4B', roof: '#1FA89B' },
    school: { w: 164, h: 106, d: 36, wall: '#F4A261', roof: '#EF5B4B' },
    market: { w: 152, h: 98, d: 34, wall: '#B5E0A2', roof: '#EF5B4B' },
    post: { w: 112, h: 100, d: 30, wall: '#8ED6F0', roof: '#EF5B4B' },
    bus: { w: 172, h: 80, d: 34, wall: '#1FA89B', roof: '#2B2D42' },
    park: { w: 140, h: 40, d: 0 }
  };
  /* tempat digambar di koordinat lokal: pojok kiri-bawah di (0,0) */
  function place(p) {
    var m = PLACE[p], s;
    if (Assets.has('place_' + p)) {
      var b = stillImage('place_' + p, m.w + m.d, (p === 'park' ? 62 : m.h + m.d));
      return { svg: Assets.image('place_' + p, b.x, b.y, b.w, b.h), w: m.w, h: p === 'park' ? 62 : m.h, d: m.d };
    }
    if (p === 'park') {
      s = '<ellipse cx="70" cy="-10" rx="80" ry="24" fill="#7CC96A"' + st() + '/><ellipse cx="72" cy="-8" rx="26" ry="9" fill="' + C.sky + '"' + st(3) + '/>' +
        A.tree(30, -12, .95, true) + A.tree(118, -8, .85, true) +
        '<rect x="48" y="-40" width="44" height="7" rx="3" fill="#8B5E3C"' + st(2.5) + '/>' +
        '<g transform="translate(70,-62)"><rect x="-3" y="0" width="6" height="30" fill="' + C.ink + '"/><circle r="21" fill="' + C.cream + '"' + st(3) + '/>' + A.placeIcons.park + '</g>';
      return { svg: s, w: m.w, h: 62, d: 0 };
    }
    s = A.building(0, 0, m.w, m.h, m.d, m.wall, m.roof, p, { flag: p === 'school' });
    if (p === 'bank') s += '<g>' + [0.18, 0.4, 0.62].map(function (k) { return '<rect x="' + (m.w * k) + '" y="-34" width="10" height="34" rx="2" fill="#fff"' + st(2.5) + '/>'; }).join('') + '</g>';
    if (p === 'market') s += '<path d="M' + (m.w / 2 - 36) + ' -48 h72 l8 14 h-88z" fill="' + C.red + '"' + st(3) + '/><path d="M' + (m.w / 2 - 12) + ' -48 v14 M' + (m.w / 2 + 12) + ' -48 v14" stroke="#fff" stroke-width="6"/>';
    if (p === 'bus') s += '<rect x="14" y="-24" width="30" height="16" rx="4" fill="' + C.sky + '"' + st(3) + '/><rect x="' + (m.w - 44) + '" y="-24" width="30" height="16" rx="4" fill="' + C.sky + '"' + st(3) + '/>';
    return { svg: s, w: m.w, h: m.h, d: m.d };
  }
  function house(style, w, h, d) {
    var hs = root.PETA && root.PETA.houses, key = null;
    if (hs) Object.keys(hs).forEach(function (k) { if (hs[k] === style) key = k; });
    if (key && Assets.has('house_' + key)) { var b = stillImage('house_' + key, w + d, h + d); return Assets.image('house_' + key, b.x, b.y, b.w, b.h); }
    return A.building(0, 0, w, h, d, style.wall, style.roof, null);
  }
  /* rumah bergambar (house_h1..h4) tinggi th, dasar gambar di y=base, tepi kiri di left. mirror = cermin kiri-kanan.
     houseGeom: titik pintu sebenarnya (x tengah, y dasar pintu, h tinggi pintu) dari data door di assets.js, ikut dicerminkan. */
  function houseGeom(key, left, base, th, mirror) {
    var a = root.ASSETS.list[key], w = a.w * th / a.h, d = a.door || { cx: .5, base: .86, h: .32 };
    return { w: w, th: th, x: left, door: { x: left + w * (mirror ? 1 - d.cx : d.cx), y: base - th * (1 - d.base), h: th * d.h } };
  }
  function houseImage(key, left, base, th, mirror) {
    var a = root.ASSETS.list[key], g = houseGeom(key, left, base, th, mirror);
    return '<image href="' + root.ASSETS.dir + a.file + '" x="' + (mirror ? -(left + g.w) : left) + '" y="' + (base - th) + '" width="' + g.w + '" height="' + th + '"' + (mirror ? ' transform="scale(-1,1)"' : '') + '/>';
  }
  /* gambar tempat (place_*) di lingkaran krem berjari-jari r (pusat 0,0), rasio dipertahankan, di tengah; null bila gambar tidak ada */
  function placePic(id, r, ring) {
    var key = 'place_' + id; if (!Assets.has(key)) return null;
    var a = root.ASSETS.list[key], bw = r * 1.62, bh = r * 1.36, s = Math.min(bw / a.w, bh / a.h), w = a.w * s, h = a.h * s;
    return '<circle r="' + r + '" fill="' + C.cream + '"' + st(ring || 3) + '/>' + Assets.image(key, -w / 2, -h / 2 + r * 0.04, w, h).replace('xMidYMax', 'xMidYMid');
  }
  function label(text, cx, cy) {
    var w = text.length * 11 + 26;
    return '<g transform="translate(' + cx + ',' + cy + ')"><rect x="' + (-w / 2) + '" y="-15" width="' + w + '" height="30" rx="15" fill="' + C.cream + '"' + st(3) + '/>' +
      '<text text-anchor="middle" y="7" font-family="Nunito" font-weight="800" font-size="20" fill="' + C.ink + '">' + text + '</text></g>';
  }

  /* kurir tampak atas (peta diam): menghadap atas pada rotasi 0 */
  function bikeTop() {
    return '<g class="cr riding"><g class="cr-bob"><ellipse cx="0" cy="8" rx="34" ry="52" fill="#000" opacity=".15"/>' +
      '<rect x="-6" y="-60" width="12" height="30" rx="6" fill="' + C.ink + '"/><rect x="-6" y="26" width="12" height="36" rx="6" fill="' + C.ink + '"/>' +
      '<path d="M0 -34 V44" stroke="' + C.red + '" stroke-width="9" stroke-linecap="round"/>' +
      '<rect x="-20" y="30" width="40" height="30" rx="6" fill="' + C.wood + '"' + st(3) + '/><path d="M0 30 V60 M-20 45 H20" stroke="' + C.cream + '" stroke-width="4"/>' +
      '<path d="M-14 -10 Q-34 -26 -30 -42 M14 -10 Q34 -26 30 -42" stroke="' + C.teal + '" stroke-width="10" stroke-linecap="round" fill="none"/>' +
      '<path d="M-38 -42 H38" stroke="' + C.ink + '" stroke-width="6" stroke-linecap="round"/>' +
      '<circle cx="-30" cy="-43" r="7" fill="' + C.red + '"' + st(3) + '/><circle cx="30" cy="-43" r="7" fill="' + C.teal + '"' + st(3) + '/>' +
      '<ellipse cx="0" cy="4" rx="21" ry="25" fill="' + C.teal + '"' + st() + '/>' +
      '<circle cx="0" cy="-2" r="17" fill="' + C.sun + '"' + st() + '/><path d="M0 -18 V14" stroke="' + C.ink + '" stroke-width="3" opacity=".35"/></g></g>';
  }

  /* diagram mini hubungan dua gedung (miskonsepsi opposite vs next to), kotak 300x120 */
  function relDiagram(rel) {
    function b(x, col, big) {
      if (Assets.has('house_h2') && Assets.has('house_h3')) return houseImage(col === '#FFB8C6' ? 'house_h3' : 'house_h2', x, 82, big ? 44 : 38, false);
      return A.building(x, 78, big ? 62 : 56, big ? 52 : 46, 16, col, '#EF5B4B', null); }
    var s = '<rect width="300" height="120" rx="18" fill="#DFF3D6"' + st(3) + '/>', ref = '#F4A261', tg = '#FFB8C6';
    if (rel === 'next') {
      s += b(70, ref) + b(132, tg) + '<text x="150" y="108" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="22" fill="' + C.ink + '">next to</text>';
    } else if (rel === 'opposite') {
      s += '<rect x="108" y="40" width="84" height="40" fill="' + C.road + '"/><path d="M114 60 H186" stroke="#FFF4DC" stroke-width="4" stroke-dasharray="10 8"/>' +
        b(36, ref) + b(212, tg) + '<text x="150" y="108" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="22" fill="' + C.ink + '">opposite</text>';
    } else if (rel === 'between') {
      s += b(26, ref) + b(122, tg, true) + b(220, ref) + '<g transform="translate(152,20) scale(.5)">' + A.starShape(24) + '</g>' +
        '<text x="150" y="108" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="22" fill="' + C.ink + '">between</text>';
    } else {
      s += '<circle cx="90" cy="60" r="70" fill="none" stroke="' + C.teal + '" stroke-width="4" stroke-dasharray="9 7"/>' + b(62, ref) + b(150, tg) +
        '<text x="150" y="108" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="22" fill="' + C.ink + '">near</text>';
    }
    return s;
  }

  /* lambang relasi kecil di lingkaran r=30 */
  function relGlyph(rel) {
    var sq = function (x, col) { return '<rect x="' + x + '" y="-9" width="17" height="18" rx="3" fill="' + col + '"' + st(2.5) + '/>'; };
    if (rel === 'next') return sq(-18, '#F4A261') + sq(1, '#FFB8C6');
    if (rel === 'opposite') return sq(-26, '#F4A261') + sq(9, '#FFB8C6') + '<rect x="-9" y="-9" width="18" height="18" fill="' + C.road + '"/>';
    if (rel === 'between') return sq(-27, '#F4A261') + sq(-8.5, '#FFB8C6') + sq(10, '#F4A261');
    return '<circle r="22" fill="none" stroke="' + C.teal + '" stroke-width="3" stroke-dasharray="6 5"/>' + sq(-12, '#F4A261').replace('width="17"', 'width="12"') + '<rect x="3" y="-6" width="12" height="13" rx="3" fill="#FFB8C6"' + st(2.5) + '/>';
  }
  /* ---- lampu lalu lintas: tiang+rumah lampu dari gambar (assets.js env_traffic_light, semua lampu padam), tiga lampu menyala digambar kode tepat di atas lampu abu-abu.
     Tanpa gambar: seluruh lampu digambar kode dengan proporsi yang sama. Lampu menyala punya simbol putih (bukan hanya warna): merah = kotak berhenti, kuning = jeda, hijau = panah maju. */
  var TL = { phases: ['red', 'yellow', 'green'], col: { red: '#EF5B4B', yellow: '#FFC93C', green: '#3FC46B' }, word: { red: 'STOP', yellow: 'WAIT', green: 'GO' } };
  function tlSymbol(ph, r) {
    var w = '#FFFFFF', k = ph === 'yellow' ? C.ink : w;
    if (ph === 'red') return '<rect x="' + (-r * .42) + '" y="' + (-r * .42) + '" width="' + (r * .84) + '" height="' + (r * .84) + '" rx="' + (r * .12) + '" fill="' + w + '"/>';
    if (ph === 'yellow') return '<rect x="' + (-r * .4) + '" y="' + (-r * .45) + '" width="' + (r * .26) + '" height="' + (r * .9) + '" rx="' + (r * .08) + '" fill="' + k + '"/><rect x="' + (r * .14) + '" y="' + (-r * .45) + '" width="' + (r * .26) + '" height="' + (r * .9) + '" rx="' + (r * .08) + '" fill="' + k + '"/>';
    return '<path d="M0 ' + (-r * .5) + ' L' + (r * .5) + ' ' + (r * .05) + ' H' + (r * .2) + ' V' + (r * .5) + ' H' + (-r * .2) + ' V' + (r * .05) + ' H' + (-r * .5) + ' Z" fill="' + w + '"/>';
  }
  function tlGeom(th) {
    var a = root.ASSETS.list.env_traffic_light;
    if (a && Assets.has('env_traffic_light')) { var k = th / a.h; return { img: a, k: k, w: a.w * k, x0: -a.px * k, lamps: a.lamps }; }
    var w = th * 0.3; return { img: null, k: 1, w: w, x0: -w / 2, lamps: { x: 0.41, y: [0.1484, 0.3267, 0.506], r: 0.197 } };
  }
  /* (x,y) = tengah-dasar tapak, th = tinggi tampil. label=true menambah papan kata STOP/WAIT/GO di samping kanan (diperbarui oleh trafficLightSet). */
  A.trafficLight = function (x, y, th, o) {
    o = o || {}; var g = tlGeom(th), s = '', w = g.w, lr = g.lamps.r * w * 0.97, cx = g.x0 + g.lamps.x * w;
    if (g.img) s += '<image href="' + root.ASSETS.dir + g.img.file + '" x="' + g.x0 + '" y="' + (-th) + '" width="' + w + '" height="' + th + '"/>';
    else {   // cadangan: gambar penuh lewat kode
      var hx = g.x0 + w * 0.02, hw = w * 0.82, hh = th * 0.63;
      s += '<ellipse cx="' + (g.x0 + w * .45) + '" cy="-2" rx="' + (w * .5) + '" ry="5" fill="rgba(43,45,66,.25)"/><rect x="' + (g.x0 + w * .3) + '" y="' + (-th * .4) + '" width="' + (w * .3) + '" height="' + (th * .4) + '" fill="#555A8C"' + st(3) + '/>' +
        '<rect x="' + hx + '" y="' + (-th) + '" width="' + hw + '" height="' + hh + '" rx="' + (w * .2) + '" fill="#5B5F94"' + st(4) + '/>';
      TL.phases.forEach(function (ph, i) { s += '<circle cx="' + cx + '" cy="' + (-th + g.lamps.y[i] * th) + '" r="' + (lr * 1.12) + '" fill="#6E6E6E"' + st(3) + '/>'; });
    }
    TL.phases.forEach(function (ph, i) {
      var cy = -th + g.lamps.y[i] * th, c = TL.col[ph];
      s += '<g class="tl-l" data-ph="' + ph + '" opacity="0"><circle cx="' + cx + '" cy="' + cy + '" r="' + (lr * 1.75) + '" fill="' + c + '" opacity=".32"/><circle cx="' + cx + '" cy="' + cy + '" r="' + (lr * 1.3) + '" fill="' + c + '" opacity=".3"/>' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + lr + '" fill="' + c + '"/><ellipse cx="' + (cx - lr * .3) + '" cy="' + (cy - lr * .38) + '" rx="' + (lr * .3) + '" ry="' + (lr * .18) + '" fill="#fff" opacity=".6"/>' +
        '<g transform="translate(' + cx + ',' + (cy + lr * .08) + ')">' + tlSymbol(ph, lr * .72) + '</g></g>';
    });
    if (o.label) {
      var lx = o.labelLeft ? g.x0 - 8 - 128 * (o.labelScale || 1) : g.x0 + w + 8, ly = -th + g.lamps.y[0] * th - 22;
      s += '<g class="tl-word" transform="translate(' + lx + ',' + ly + ')' + (o.labelScale ? ' scale(' + o.labelScale + ')' : '') + '" opacity="0"><rect width="128" height="44" rx="14" fill="#fff"' + st(3) + '/><circle class="tl-dot" cx="24" cy="22" r="11" fill="#EF5B4B"' + st(2.5) + '/>' +
        '<text class="tl-txt" x="82" y="31" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="26" fill="' + C.ink + '">STOP</text></g>';
    }
    return '<g class="tl" transform="translate(' + x + ',' + y + ')">' + s + '</g>';
  };
  /* ph: 'red' | 'yellow' | 'green' | null (semua padam). el = elemen <g class="tl"> hasil trafficLight yang sudah di DOM */
  A.trafficLightSet = function (el, ph, noLabel) {
    if (!el) return;
    var ls = el.querySelectorAll('.tl-l'), i;
    for (i = 0; i < ls.length; i++) ls[i].setAttribute('opacity', ls[i].getAttribute('data-ph') === ph ? 1 : 0);
    var w = el.querySelector('.tl-word');
    if (w) {
      w.setAttribute('opacity', ph && !noLabel ? 1 : 0);
      if (ph) { w.querySelector('.tl-dot').setAttribute('fill', TL.col[ph]); w.querySelector('.tl-txt').textContent = TL.word[ph]; }
    }
  };
  A.TL = TL;
  /* gambar kecil kosakata lalu lintas (glosarium/buku), lingkaran r */
  function trafficGlyph(id, r) {
    var s = r / 34;
    if (id === 'lights') return '<g><circle r="' + r + '" fill="#DFF3D6"' + st() + '/><g transform="translate(0,' + (r * .95) + ')">' + A.trafficLight(0, 0, r * 2.1).replace('<g class="tl"', '<g') + '</g></g>';
    if (id === 'zebra') {
      var b = ''; for (var i = 0; i < 5; i++) b += '<rect x="' + (-26 + i * 11) + '" y="-20" width="7" height="40" rx="1.5" fill="#FFF4DC"/>';
      return '<g><circle r="' + r + '" fill="' + C.road + '"' + st() + '/><g transform="scale(' + s + ')">' + b + '</g></g>';
    }
    if (id === 'tertib') return '<g><circle r="' + r + '" fill="' + C.sun + '"' + st() + '/><g transform="scale(' + (s * .9) + ')">' + A.starShape(20) + '</g><circle r="' + (r * .3) + '" cx="' + (r * .55) + '" cy="' + (r * .5) + '" fill="' + TL.col.green + '"' + st(2) + '/></g>';
    var ph = id === 'tl_stop' ? 'red' : id === 'tl_wait' ? 'yellow' : 'green';
    return '<g><circle r="' + r + '" fill="' + TL.col[ph] + '"' + st() + '/>' + tlSymbol(ph, r * .66) + '</g>';
  }
  /* lencana kata (gloss item: {id,kind}) */
  function wordBadge(g, r) {
    r = r || 34;
    if (g.kind === 'traffic') return trafficGlyph(g.id, r);
    if (g.kind === 'place' && Assets.has('place_' + g.id)) return '<g>' + placePic(g.id, r, 3.5) + '</g>';
    if (g.kind === 'place') return '<g><circle r="' + r + '" fill="' + C.cream + '"' + st() + '/><g transform="scale(' + (r / 24) + ')">' + (A.placeIcons[g.id] || '') + '</g></g>';
    if (g.kind === 'pos') return '<g><circle r="' + r + '" fill="#DFF3D6"' + st() + '/><g transform="scale(' + (r / 32) + ')">' + relGlyph(g.id) + '</g></g>';
    return A.moveBadge(g.id, r);
  }
  /* ikon untuk stempel: sama dengan lencana tetapi tanpa lingkaran luar */
  function stampIcon(g) {
    if (g.kind === 'traffic') return trafficGlyph(g.id, 40);
    if (g.kind === 'place' && Assets.has('place_' + g.id)) return placePic(g.id, 40, 3);
    if (g.kind === 'place') return '<circle r="40" fill="' + C.cream + '"' + st(3) + '/><g transform="scale(1.6)">' + (A.placeIcons[g.id] || '') + '</g>';
    if (g.kind === 'pos') return '<circle r="40" fill="#DFF3D6"' + st(3) + '/><g transform="scale(1.25)">' + relGlyph(g.id) + '</g>';
    return '<circle r="40" fill="' + (g.id === 'stop' ? C.cream : A.MOVE_COLOR[g.id]) + '"' + st(3) + '/><g transform="scale(1.05)">' + A.moveIcon(g.id) + '</g>';
  }

  A.PLACE = PLACE; A.place = place; A.house = house; A.houseImage = houseImage; A.houseGeom = houseGeom; A.placePic = placePic; A.label = label; A.bikeTop = bikeTop;
  A.relDiagram = relDiagram; A.relGlyph = relGlyph; A.wordBadge = wordBadge; A.stampIcon = stampIcon;
})(window);


