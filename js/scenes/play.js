/* Scene Bermain (peta berputar): Level 1 Latihan Arah dan Level 2 Tempat Umum.
   Tampilan dirender per simpang dari sudut hadap kurir (kurir selalu menghadap atas, kiri layar = kiri kurir). */
(function () {
  var C = Art.C, P = {};
  var NS = 'http://www.w3.org/2000/svg';
  var D = 480, JX = 640, JY = 380, CX = 640, CY = 500, BASE = 296;
  var PLAN1 = [{ fixed: ['straight', 'stop'] }, { n: 3, must: ['left'] }, { n: 4, must: ['left', 'right'] }];
  var PLAN2 = [{ kind: 'A', min: 2, max: 3 }, { kind: 'A', min: 3, max: 5 }, { kind: 'B', lights: true }, { kind: 'C' }];   // misi 3 selalu memakai landmark lampu lalu lintas
  var S = null, rnd = null, MAP = null, H = null;

  /* ---------- tampilan satu simpang ---------- */
  function roadSVG(has, light) {
    var out = [], fill = [];
    function R(x, y, w, h) {
      out.push('<rect x="' + (x - 4) + '" y="' + (y - 4) + '" width="' + (w + 8) + '" height="' + (h + 8) + '" rx="3" fill="' + C.ink + '"/>');
      fill.push('<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + C.road + '"/>');
    }
    if (has.l) R(-1600, 305, 2165, 150);
    if (has.r) R(715, 305, 2000, 150);
    if (has.f) R(565, -1600, 150, 1905);
    if (has.b) R(565, 455, 150, 1700);
    R(565, 305, 150, 150);
    var s = out.join('') + fill.join('');
    var dash = ' stroke="#FFF4DC" stroke-width="5" stroke-dasharray="36 28" fill="none"';
    if (has.l) s += '<path d="M-1600 380 H555"' + dash + '/>';
    if (has.r) s += '<path d="M725 380 H2800"' + dash + '/>';
    if (has.f) s += '<path d="M640 -1600 V295"' + dash + '/>';
    if (has.b) {
      s += '<path d="M640 465 V1500"' + dash + '/>';
      for (var i = 0; i < 7; i++) s += '<rect x="' + (581 + i * 18) + '" y="463" width="10" height="28" rx="2" fill="#FFF4DC"/>';
    }
    if (light) {   // simpang berlampu: zebra cross di dua sisi + garis berhenti (jalur kurir di kiri, jalur lawan di kanan)
      for (var z = 0; z < 7; z++) s += '<rect x="' + (581 + z * 18) + '" y="271" width="10" height="26" rx="2" fill="#FFF4DC"/>' + (has.b ? '' : '<rect x="' + (581 + z * 18) + '" y="463" width="10" height="28" rx="2" fill="#FFF4DC"/>');
      s += '<rect x="572" y="501" width="136" height="9" rx="3" fill="#FFFFFF"/><rect x="572" y="259" width="136" height="9" rx="3" fill="#FFFFFF"/>';
    }
    return s;
  }
  var HKEYS = ['h1', 'h2', 'h3', 'h4'];
  /* rumah bergambar di blok depan (config/skala.js: rumah = 4 satuan dewasa di cakrawala). Mengembalikan geometri termasuk pintu asli (ikut cermin). */
  function houseLayout(side, key, mirror, th, far) {
    var k = 'house_' + key, a = ASSETS.list[k], w = a.w * th / a.h, left = far ? (side === 'L' ? 110 : 1030) : (side === 'L' ? 480 - w : 770);
    return Art.houseGeom(k, left, BASE, th, mirror);
  }
  function mainHouse(b, side, kind, isCust) {
    var seed = (b.bi * 7 + b.bj * 13 + 3) % 5, th = SKALA.h('house', 'dekat', BASE) * (0.94 + 0.03 * (seed % 3)), ki = Math.max(0, HKEYS.indexOf(kind));
    var key = isCust ? HKEYS[(b.bi * 3 + b.bj * 5) % 4] : HKEYS[ki % 4], mirror = isCust ? (b.bi + b.bj) % 2 === 1 : (side === 'L') === (seed % 2 === 0);
    return { key: key, mirror: mirror, th: th, g: houseLayout(side, key, mirror, th, false) };
  }
  function farHouse(b, side, kind) {
    var seed = (b.bi * 7 + b.bj * 13 + 3) % 5, th = SKALA.h('house', 'dekat', BASE) * 0.84, ki = Math.max(0, HKEYS.indexOf(kind)), m = mainHouse(b, side, kind, false);
    var key = HKEYS[(ki + 2 + seed % 2) % 4];
    return { key: key, mirror: !m.mirror, th: th, g: houseLayout(side, key, !m.mirror, th, true) };
  }
  /* kiri-kanan blok depan: posisi dan pintu bangunan utama */
  function slotX(side, w) { return side === 'L' ? 480 - w : 770; }
  function blockSVG(b, side, base, isCust) {
    var exists = Nav.blockExists(MAP, b), kind = exists ? MAP.blocks[b.bj][b.bi] : 'tree';
    var seed = (b.bi * 7 + b.bj * 13 + 3) % 5, s = '';
    var xMain = side === 'L' ? 340 : 770, xFar = side === 'L' ? 110 : 1030;
    var img = Assets.has('house_h1') && Assets.has('house_h2') && Assets.has('house_h3') && Assets.has('house_h4');
    if (Route.PLACES.indexOf(kind) >= 0) {
      var pl = Art.place(kind), x = slotX(side, pl.w);
      s += '<g transform="translate(' + x + ',' + base + ')">' + pl.svg + '</g>' + Art.label(Route.NAME[kind], x + pl.w / 2, base + 24);
      s += Art.tree(xFar + 40, base, 1, true) + Art.bush(xFar + 100, base) + (seed % 2 ? '' : Art.flowers(xFar + 66, base + 5, 1));
      return s;
    }
    if (img && (isCust || kind !== 'tree')) {
      var mh = mainHouse(b, side, kind, isCust);
      s += Art.houseImage('house_' + mh.key, mh.g.x, base, mh.th, mh.mirror);
      if (isCust) {   // penanda rumah tujuan: bendera di atap + kotak pos
        var fx = mh.g.x + mh.g.w / 2, fy = base - mh.th, mx = side === 'L' ? 492 : 758;
        s += '<g><rect x="' + (fx - 2) + '" y="' + (fy - 26) + '" width="4" height="30" fill="' + C.ink + '"/><path d="M' + (fx + 2) + ' ' + (fy - 26) + ' l24 8 l-24 8z" fill="' + C.red + '"' + Art.st(3) + '/>' +
          '<rect x="' + (mx - 3) + '" y="' + (base - 30) + '" width="6" height="30" fill="' + C.ink + '"/><rect x="' + (mx - 14) + '" y="' + (base - 46) + '" width="28" height="18" rx="6" fill="' + C.red + '"' + Art.st(3) + '/></g>';
      }
      if (seed % 2) { var fh = farHouse(b, side, kind); s += Art.houseImage('house_' + fh.key, fh.g.x, base, fh.th, fh.mirror); }
      else s += Art.tree(xFar + 40, base, 1, true) + Art.bush(xFar + 100, base) + Art.flowers(xFar + 66, base + 5, 1);
      return s;
    }
    if (isCust) {
      s += Art.building(xMain, base, 140, 130, 40, '#FFB8C6', C.red, null, { flag: true, mailbox: side === 'R' });
    } else if (kind === 'tree') {
      s += Art.tree(xMain + 20, base, 1.05, true) + Art.bush(xMain + 80, base) + Art.tree(xMain + 135, base - 4, 0.9, true);
    } else {
      var st = PETA.houses[HKEYS[Math.max(0, HKEYS.indexOf(kind)) % 4]], w = 120 + seed * 6, h = 110 + (seed % 3) * 18;   // cadangan SVG (gambar rumah tidak termuat)
      s += '<g transform="translate(' + (xMain + (140 - w)) + ',' + base + ')">' + Art.house(st, w, h, 36) + '</g>';
    }
    if (isCust || kind !== 'tree') {
      if (seed % 2) { var st2 = PETA.houses[HKEYS[(Math.max(0, HKEYS.indexOf(kind)) + 2 + seed % 2) % 4]]; s += '<g transform="translate(' + xFar + ',' + base + ')">' + Art.house(st2, 96, 96 + seed * 5, 30) + '</g>'; }
      else s += Art.tree(xFar + 40, base, 1, true) + Art.bush(xFar + 100, base) + (seed % 2 ? '' : Art.flowers(xFar + 66, base + 5, 1));
    } else s += Art.tree(xFar + 40, base, 1.1, true) + Art.tree(xFar + 110, base - 6, .9, true);
    return s;
  }  function mkScene(node, h, cust, atStart) {
    var has = {   // atStart: awal misi di tepi peta tetap punya jalan di belakang kurir (kurir tidak berdiri di rumput)
      f: Nav.inBounds(MAP, Nav.step(node, h)), l: Nav.inBounds(MAP, Nav.step(node, Nav.leftOf(h))),
      r: Nav.inBounds(MAP, Nav.step(node, Nav.rightOf(h))), b: atStart || Nav.inBounds(MAP, Nav.step(node, (h + 2) % 4))
    };
    var g = document.createElementNS(NS, 'g'), back = document.createElementNS(NS, 'g');
    var lit = Route.isLight(MAP, node);
    var s = roadSVG(has, lit);
    ['FL', 'FR'].forEach(function (w) {
      var b = Nav.relCorner(node, h, w);
      s += blockSVG(b, w[1], BASE, cust && cust.bi === b.bi && cust.bj === b.bj);
    });
    var cc = ['#FFC93C', '#EF5B4B', '#8ED6F0'], nk = node.i + node.j, dl = 3 + ((node.i * 5 + node.j * 3) % 9);
    /* Indonesia: lalu lintas jalan di LAJUR KIRI. Mobil ke timur (kanan layar) di lajur atas (kirinya = utara); ke barat (kiri layar) di lajur bawah.
       Jalan tegak: mobil menjauh di kiri (x 612), mobil mendekat di sisi kanan layar (x 668), yaitu kiri pengemudinya. */
    if (lit) {   // simpang berlampu: mobil digerakkan kode dan berhenti di garis saat lampunya merah
      s += '<g class="lc" data-k="e" data-p="' + (-150 - (dl % 5) * 60) + '"><g transform="translate(0,354)">' + Art.car(cc[nk % 3], 1) + '</g></g>' +
        '<g class="lc" data-k="w" data-p="' + (1300 - (dl % 5) * 70) + '"><g transform="translate(0,428)">' + Art.car(cc[(nk + 1) % 3], -1) + '</g></g>' +
        '<g class="lc" data-k="v" data-p="' + (150 + (dl % 5) * 25) + '">' + Art.vcar(cc[(nk + 2) % 3], false) + '</g>' +
        '';
      var ph0 = (node.i * 3 + node.j + S.m) % 3 === 2 ? 'green' : 'red';
      s += Art.trafficLight(538, 472, SKALA.h('light', 'dekat', 472), { label: true, labelLeft: true });   // di sudut trotoar, tiang tidak tertutup lencana L
    } else if (has.l || has.r) {   // lalu lintas menurut arah jalan
      s += '<g class="drive" style="animation-delay:-' + dl + 's"><g transform="translate(0,354)">' + Art.car(cc[nk % 3], 1) + '</g></g>';
      if (nk % 2 === 0) s += '<g class="driveL" style="animation-delay:-' + (dl + 7) + 's"><g transform="translate(0,428)">' + Art.car(cc[(nk + 1) % 3], -1) + '</g></g>';
      s += Art.lamp(545, 305, 1) + Art.lamp(735, 305, 1);
    }
    if (has.f && nk % 3 !== 0 && !lit) {
      var away = nk % 2 === 0;
      s += '<g class="vdrive" style="animation-delay:-' + dl + 's;--vd:' + (away ? -125 : 115) + 'px"><g transform="translate(' + (away ? 603 : 677) + ',' + (away ? 322 : 215) + ')">' + Art.vcar(cc[(nk + 2) % 3], away) + '</g></g>';
    }
    g.innerHTML = s;
    back.innerHTML = Art.bush(300, 585, .8) + Art.flowers(430, 590, .9) + Art.bush(980, 585, .8) + Art.flowers(850, 592, .9) +
      Art.walker(1 + (node.i * 2 + node.j) % 6, 1055, 578, CRH * 0.95, 150, 9 + nk % 4, nk * 3);   // pejalan ambient di halaman kanan, di depan semak
    g.appendChild(back);
    var sc = { g: g, back: back, node: node, light: null, cars: [] };
    if (lit) {
      sc.light = g.querySelector('.tl'); sc.ph = ph0; sc.t = 0; sc.armed = false;
      Art.trafficLightSet(sc.light, ph0);
      Array.prototype.forEach.call(g.querySelectorAll('.lc'), function (el) { sc.cars.push({ el: el, k: el.getAttribute('data-k'), p: parseFloat(el.getAttribute('data-p')) }); });
      carsPlace(sc);
      S.live.push(sc);
    }
    return sc;
  }
  /* ---------- lampu lalu lintas ---------- */
  var DUR = { red: 2.6, green: 6, yellow: 1.5 }, NEXT = { red: 'green', green: 'yellow', yellow: 'red' };
  function carsPlace(sc) {
    sc.cars.forEach(function (c) { c.el.setAttribute('transform', c.k === 'v' ? 'translate(677,' + Math.round(c.p) + ')' : 'translate(' + Math.round(c.p) + ',0)'); });
  }
  /* mobil berhenti di garis bila lampunya merah. Sumbu kurir (tegak): mobil mendekat boleh jalan saat hijau; lalu lintas silang (datar) boleh jalan saat lampu kurir merah. */
  function carsTick(sc, dt) {
    if (document.body.classList.contains('reduce')) return;
    var ph = sc.ph;
    sc.cars.forEach(function (c) {
      var go = c.k === 'v' ? ph === 'green' : ph === 'red', mv = (c.k === 'v' ? 95 : 150) * dt, np;
      if (c.k === 'e') { np = c.p + mv; if (!go && c.p <= 455 && np > 455) np = 455; c.p = np > 1450 ? -250 : np; }
      else if (c.k === 'w') { np = c.p - mv; if (!go && c.p >= 825 && np < 825) np = 825; c.p = np < -250 ? 1450 : np; }
      else { np = c.p + mv; if (!go && c.p <= 291 && np > 291) np = 291; c.p = np > 650 ? 150 : np; }
    });
    carsPlace(sc);
  }
  function lightSet(sc, ph) { sc.ph = ph; sc.t = 0; Art.trafficLightSet(sc.light, ph); }
  function armLight(sc) {
    sc.armed = true; sc.t = 0; sc.tapped = false; sc.queued = null; sc.counted = false;
    if (sc.ph === 'red' && !Save.data.seenLight) { Save.data.seenLight = true; Save.save(); H.showCoach(STR.traffic.redWait, true); sc.coach = true; }
  }
  function lightTick(sc, dt) {
    carsTick(sc, dt);
    if (!sc.armed) return;
    sc.t += dt;
    if (sc.t < DUR[sc.ph]) return;
    var was = sc.ph, nx = NEXT[was]; lightSet(sc, nx); Aud.sfx('tl_' + nx);
    if (was === 'red') {
      if (!sc.tapped && !sc.counted) {   // menunggu merah sampai hijau tanpa mengetuk: berhenti dengan benar
        sc.counted = true; S.redStops++;
        ['tl_stop', 'tl_wait', 'zebra'].forEach(function (id) { Save.record(id, true); var r = bump(id, 'ok'); r.first++; });
        Save.save();
      }
      if (sc.coach) { sc.coach = false; H.showCoach(STR.traffic.green, false, 'cheer'); }
      if (sc.queued && S.state === 'await') { var q = sc.queued; sc.queued = null; Tween.wait(350).then(function () { choose(q); }); }
    }
  }
  /* ketuk tombol gerak saat lampu bukan hijau. Mengembalikan true bila diblokir (tidak ada salah/gagal misi) */
  async function lightBlock(cmd, sc) {
    if (Save.data.settings.santai) { sc.queued = cmd; H.showCoach(STR.traffic.santaiWait, false, 'think'); Aud.sfx('pop'); return; }
    if (sc.ph === 'yellow') { H.showCoach(STR.traffic.yellowWait, false, 'think'); Aud.sfx('tl_yellow'); return; }
    S.state = 'busy'; sc.tapped = true; S.redRuns++;
    Save.recordWrong('tl_stop'); bump('tl_stop', 'wrong'); Save.save();
    Aud.sfx('bad'); riding(true);
    var off = { x: 0, y: 0 };
    await Tween.to(off, { y: -30 }, 240, Ease.easeInOutCubic, function () { placeCourier(off.x, off.y); });
    riding(false);
    H.showCoach(STR.traffic.remind, false, 'think'); sc.coach = true;
    Voice.say(SENT.traffic.remind.text, { rate: 0.9 });
    await Tween.to(off, { y: 0 }, 380, Ease.easeInOutCubic, function () { placeCourier(off.x, off.y); });
    S.state = 'await';
  }
  function setOff(sc, y) { sc.g.setAttribute('transform', 'translate(0,' + y + ')'); }
  var LANE = -37;   // lalu lintas Indonesia: kurir di lajur kiri jalan (separuh kiri jalan tegak x 565-640)
  function placeCourier(x, y) {   // S.crK: skala kurir (mengecil saat menjauh ke depan rumah), jangkar di titik pijak roda
    var k = S.crK || 1;
    S.cwrap.setAttribute('transform', 'translate(' + Math.round(CX + LANE + x) + ',' + Math.round(CY + y + FOOT * (1 - k)) + ') scale(' + k.toFixed(3) + ')');
  }
  /* kurir A (sprite 2D): peta berputar, jadi kurir menghadap atas (belakang). Mode 'front' = reaksi (sorak/bingung) atau menghadap penonton.
     S.crDir = arah sementara (diagonal saat belok). Mengayuh 8 frame/detik (S.phase). */
  var FOOT = 70, CRH = SKALA.h('courier', 'dekat', 570);   // tinggi kurir+sepeda (UNIT.courier x dewasa di dasar layar), maks. setinggi mobil
  function syncCourier() {
    var cr = S && S.cr; if (!cr || !cr.classList.contains('cr3d')) return;
    var pose = S.crMode === 'front' ? (S.crExpr === 'cheer' ? 'cheer' : S.crExpr === 'confused' ? 'confused' : null) : null;
    Art.courierFrame(cr, S.crMode === 'front' ? 4 : (S.crDir || 0), S.phase || 0, pose);
  }
  function setCourier(mode, expr, cls) {
    if (Art.courierSpriteOK()) {
      S.cwrap.innerHTML = Art.courierSprite(CRH, FOOT);
      var c3 = S.cwrap.querySelector('.cr'); (cls || []).forEach(function (c) { c3.classList.add(c); });
      S.cr = c3; S.crMode = mode; S.crExpr = expr; S.phase = 0; S.crDir = 0; syncCourier(); return;
    }
    S.cwrap.innerHTML = Art.courier(mode, expr);
    var cr = S.cwrap.querySelector('.cr');
    (cls || []).forEach(function (c) { cr.classList.add(c); });
    S.cr = cr;
  }
  function riding(on) { if (S.cr) S.cr.classList.toggle('riding', on); if (!on) Aud.ride(false); }

  /* ---------- misi ---------- */
  function makeMission(spec, level) {
    for (var t = 0; t < 60; t++) {
      if (level === 1) {
        var cmds = spec.fixed ? spec.fixed.slice() : Nav.genCommands(rnd, spec.n, spec.must);
        var m = Nav.buildMission(MAP, cmds, rnd);
        if (m) return {
          mode: 'perNode', spec: spec, wrong: 0, customer: m.customer,
          decisions: m.steps.map(function (s, i) { return { node: s.node, heading: s.heading, expected: s.cmd, instr: i }; })
        };
      } else {
        var r = Route.genRoute(MAP, rnd, spec.kind, spec);
        if (r) { r.mode = 'chain'; r.spec = spec; r.wrong = 0; return r; }
      }
    }
    throw new Error('misi gagal dibangkitkan');
  }
  function cur() { return S.mission.decisions[S.k]; }
  function pickSentence(cmd) {
    if (S.m === 0 && S.k === 0 && cmd === 'straight' && S.level === 1) return SENT.first.text;
    var opts = SENT.cmd[cmd], t, k = 0;
    do { t = U.pick(rnd, opts).text; k++; } while (t === S.lastText && k < 8);
    S.lastText = t; return t;
  }
  function placeIdn(id) { var g = SENT.gloss.filter(function (x) { return x.id === id; })[0]; return g ? g.en : id; }
  function curIns() { var m = S.mission; return m.mode === 'chain' ? m.instrs[cur().instr] : null; }

  async function startMission(i) {
    S.m = i; S.mission = S.missions[i]; S.k = 0; S.wrongStep = 0; S.hintShown = false;
    H.setMission(STR.hud.mission(i + 1, S.missions.length, STR.levels.names[S.level - 1]));
    H.hideCoach(); H.hideHand(); H.glow(null); H.hl(null);
    S.custG.innerHTML = ''; S.pkgG.innerHTML = ''; S.worldG.innerHTML = '';
    var d = cur();
    S.cur = mkScene(d.node, d.heading, S.mission.customer, true);
    S.worldG.appendChild(S.cur.g); setOff(S.cur, 0);
    S.crK = 1; S.parked = null;
    setCourier('back', 'happy'); riding(false); placeCourier(0, 0);
    S.badges.style.display = 'block'; S.state = 'busy';
    await announce(true);
  }
  async function announce(ring) {
    var d = cur(), m = S.mission;
    S.wrongStep = 0; S.hintShown = false; S.idle = 0; S.expected = d.expected;
    if (m.mode === 'perNode') H.setSub([pickSentence(d.expected)]);
    else if (ring) H.setSub(m.sentences);
    else if (H.active !== d.instr) { H.setActive(d.instr); Aud.sfx('pop'); }
    S.state = 'await';
    if (S.cur.light && !S.cur.armed) armLight(S.cur);
    if (ring) {
      Aud.sfx('bell'); H.phone.classList.add('ring'); Aud.sfx('phone');
      Tween.wait(1000).then(function () { H.phone.classList.remove('ring'); });
      await Tween.wait(S.firstRing ? 150 : 700); S.firstRing = true;
    } else if (m.mode === 'perNode') Aud.sfx('pop');
    var seenKey = S.level === 1 ? 'onboarded' : 'seen2';
    if (S.m === 0 && !Save.data[seenKey]) {
      if (S.level === 1) {
        if (S.k === 0) { H.showCoach(STR.coach.onboard1, true); H.showHandBtn(d.expected); }
        else if (d.expected === 'stop') { H.showCoach(STR.coach.onboardStop, true); H.showHandBtn('stop'); }
      } else if (S.k === 0) H.showCoach(STR.coach.onboardPlace, true);
    }
    if (S.state !== 'await') return;
    if (m.mode === 'perNode' || ring) await H.speak(0.9);
  }

  function skillsAt(d, ins, success) {
    if (!ins) return [d.expected];
    if (d.atLandmark) return [d.atLandmark, d.expected];
    if (ins.at) return success ? [] : [ins.at];
    return [d.expected];
  }
  function bump(id, key) { var r = S.run[id] || (S.run[id] = { first: 0, ok: 0, wrong: 0 }); r[key]++; return r; }
  function wrongHint(chosen, d, ins) {
    var LR = (chosen === 'left' && d.expected === 'right') || (chosen === 'right' && d.expected === 'left');
    if (LR) return STR.coach.lrSwap;
    if (ins && ins.at) {
      if (d.atLandmark) return STR.coach.here(placeIdn(ins.at), d.expected === 'left' ? STR.coach.actTurnLeft : d.expected === 'right' ? STR.coach.actTurnRight : STR.coach.actStop);
      return STR.coach.notYet(placeIdn(ins.at));
    }
    if (chosen === 'stop') return STR.coach.tooEarly;
    if (d.expected === 'stop') return STR.coach.needStop;
    if (d.expected === 'straight') return STR.coach.notStraight;
    if (chosen === 'straight') return STR.coach.turnNotStraight;
    return STR.coach.wrongTurn;
  }

  async function choose(cmd) {
    if (S.state !== 'await' || document.querySelector('.overlay')) return;
    S.idle = 0; S.hintShown = false; H.hideHand(); H.glow(null);
    var d = cur();
    if (S.cur.light && S.cur.armed && cmd !== 'stop' && S.cur.ph !== 'green') return lightBlock(cmd, S.cur);   // lampu belum hijau: kurir menunggu
    return cmd === d.expected ? correct(d) : wrong(cmd, d);
  }
  async function correct(d) {
    S.state = 'busy';
    Voice.stop(); H.onWord(999); H.hideCoach(); H.diagram(null); H.hl(null);
    var ins = curIns(), first = S.wrongStep === 0;
    if (S.cur.light && S.cur.armed) {   // lewat simpang berlampu saat hijau
      S.cur.armed = false;
      if (d.expected !== 'stop') { Save.record('tl_go', true); var rg = bump('tl_go', 'ok'); rg.first++; }
    }
    skillsAt(d, ins, true).forEach(function (id) { Save.record(id, first); var r = bump(id, 'ok'); if (first) r.first++; });
    Save.save();
    S.cr.classList.remove('raiseL', 'raiseR');
    S.badges.querySelectorAll('.hbadge').forEach(function (b) { b.classList.remove('blink'); });
    Aud.sfx('good'); UI.burst(S.fx, CX, CY - 40, 10);
    H.setCoins(H.coins + (first ? 10 : 5));
    if (d.expected !== 'stop') {
      setCourier('front', 'cheer'); S.cr.classList.add('cheer');
      await Tween.wait(420);
      setCourier('back', 'happy');
      await advance(d);
    } else await deliver();
  }
  async function wrong(cmd, d) {
    S.state = 'busy';
    var ins = curIns();
    S.wrongStep++; S.mission.wrong++; S.totalWrong++;
    skillsAt(d, ins, false).forEach(function (id) { Save.recordWrong(id); bump(id, 'wrong'); });
    Save.save();
    var tier = Math.min(3, S.wrongStep);
    Aud.sfx('bad');
    var off = { x: 0, y: 0 }, dx = cmd === 'left' ? -46 : cmd === 'right' ? 46 : 0, dy = cmd === 'straight' ? -40 : 0;
    riding(true);
    await Tween.to(off, { x: dx, y: dy }, 260, Ease.easeInOutCubic, function () { placeCourier(off.x, off.y); });
    riding(false);
    setCourier('front', 'confused'); placeCourier(off.x, off.y);
    H.showCoach(wrongHint(cmd, d, ins) + (tier === 3 ? ' ' + STR.coach.showAnswer : ''), false, 'think');
    await Tween.to(off, { x: 0, y: 0 }, 380, Ease.easeInOutCubic, function () { placeCourier(off.x, off.y); });
    S.state = 'await';
    if (tier >= 2) {
      if (ins && ins.at) { H.hl(Route.NAME[ins.at].split(' ')); H.glow(null); H.kata.classList.add('glow'); H.showCoach(STR.coach.forgotPlace, false, 'think'); }
      else H.hl([d.expected === 'stop' ? 'stop' : d.expected === 'straight' ? 'straight' : d.expected]);
      if (d.expected === 'left' || d.expected === 'right') S.badges.querySelector('.hbadge.' + (d.expected === 'left' ? 'L' : 'R')).classList.add('blink');
    }
    setCourier('back', 'happy');
    if (tier >= 2 && d.expected === 'left') S.cr.classList.add('raiseL'); else if (tier >= 2 && d.expected === 'right') S.cr.classList.add('raiseR');
    if (tier >= 3) { H.kata.classList.remove('glow'); H.glow(d.expected); H.showHandBtn(d.expected); S.mission.practice = true; }
    Voice.stop();
    await H.speak(tier >= 2 ? 0.75 : 0.9);   // koreksi langsung: arahan diputar ulang dengan karaoke
  }

  async function advance(d) {
    S.state = 'busy';
    var nx = S.mission.decisions[S.k + 1];
    riding(true); Aud.sfx('chain');
    var cur0 = S.cur, nxt = mkScene(nx.node, nx.heading, S.mission.customer), s0 = 0;
    cur0.back.setAttribute('opacity', 0);
    if (d.expected !== 'straight') {
      await Tween.value(0, 120, 320, Ease.easeInOutCubic, function (v) { setOff(cur0, v); });
      var after = mkScene(d.node, nx.heading, S.mission.customer);
      after.back.setAttribute('opacity', 0);
      setOff(after, 120); after.g.setAttribute('opacity', 0); S.worldG.appendChild(after.g);
      var ang = d.expected === 'left' ? 90 : -90;
      Aud.sfx('whoosh');
      var dg = d.expected === 'left' ? 7 : 1;   // diagonal NW/NE di tengah belokan agar putaran mulus
      await Tween.run(440, function (e) {
        S.crDir = e > 0.12 && e < 0.88 ? dg : 0;
        cur0.g.setAttribute('transform', 'translate(0,120) rotate(' + (ang * e) + ' ' + JX + ' ' + JY + ')');
        cur0.g.setAttribute('opacity', 1 - Math.min(1, e * 1.6));
        after.g.setAttribute('opacity', Math.max(0, (e - 0.35) / 0.65));
      }, Ease.easeInOutCubic);
      cur0.g.remove(); cur0 = after; cur0.g.setAttribute('opacity', 1); s0 = 120; S.crDir = 0;
    }
    nxt.back.setAttribute('opacity', 0);
    S.worldG.appendChild(nxt.g); setOff(nxt, s0 - D);
    await Tween.run(1100 * (D - s0) / D, function (e) { var v = s0 + (D - s0) * e; setOff(cur0, v); setOff(nxt, v - D); }, Ease.easeInOutCubic);
    cur0.g.remove(); setOff(nxt, 0);
    S.cur = nxt; S.k++;
    riding(false);
    Tween.value(0, 1, 300, Ease.easeOutQuad, function (v) { nxt.back.setAttribute('opacity', v); });
    await announce(false);
  }

  function customerSpot() {
    var m = S.mission;
    if (m.mode === 'chain') {
      var pl = Art.place(m.dest.place);
      return { side: m.dest.side, x: slotX(m.dest.side, pl.w) + pl.w / 2 };
    }
    var c = m.customer;
    if (Assets.has('house_h1') && Assets.has('house_h2') && Assets.has('house_h3') && Assets.has('house_h4')) {   // pintu dari gambar rumah tujuan
      var mh = mainHouse(c, c.side, 'h1', true); return { side: c.side, x: mh.g.door.x, y: mh.g.door.y, h: mh.g.door.h };
    }
    return { side: c.side, x: (c.side === 'L' ? 340 : 770) + 70 };
  }
  /* pintu menghadap jalan datar: kurir lurus masuk simpang, serong, lalu menyusur jalan sampai tepat di depan pintu. Kendaraan memudar agar tidak menembus kurir. */
  var PARK_K = 0.8, PARK_MS = 1200;
  async function parkAt(spot) {
    var dir = spot.side === 'L' ? -1 : 1, gap = spot.h ? 36 : 72, foot = spot.h ? 384 : 394;   // rumah: mengapit pintu; tempat bernama: label di tengah tetap terlihat
    var tx = spot.x - dir * gap - (CX + LANE), ty = foot - (CY + FOOT), diag = 60, cars = S.cur.g.querySelectorAll('.drive,.driveL,.vdrive,.lc');
    Tween.value(1, 0, 240, Ease.easeOutQuad, function (v) { for (var i = 0; i < cars.length; i++) cars[i].style.opacity = v; });
    setCourier('back', 'happy'); riding(true); Aud.sfx('chain');
    var a = -ty - diag, b = diag * Math.SQRT2, c = Math.abs(tx) - diag, len = a + b + c;
    await Tween.run(PARK_MS, function (e) {
      var d = e * len, x, y;
      if (d <= a) { x = 0; y = -d; S.crDir = 0; }
      else if (d <= a + b) { var q = (d - a) / b; x = dir * diag * q; y = -a - diag * q; S.crDir = dir < 0 ? 7 : 1; }
      else { x = dir * (diag + d - a - b); y = ty; S.crDir = dir < 0 ? 6 : 2; }
      S.crK = 1 + (PARK_K - 1) * e;
      placeCourier(x, y);
    }, Ease.easeInOutCubic);
    S.crK = PARK_K; placeCourier(tx, ty); riding(false);
    S.parked = { courier: { x: CX + LANE + tx, y: foot }, door: { x: spot.x, y: spot.y || BASE }, cust: { x: spot.x + dir * gap, y: 354 } };
    return S.parked;
  }
  async function deliver() {
    var spot = customerSpot();
    S.badges.style.display = 'none';
    var pk = await parkAt(spot), h = CRH * PARK_K;
    Aud.sfx('bell');
    var ci = Portrait.custFor(S.m + (S.cycle || 0)), person = Portrait.personFor(ci);
    var cleanup = await Kit.deliver({
      custG: S.custG, pkgG: S.pkgG, fx: S.fx, from: { x: spot.x, y: spot.y || BASE }, to: pk.cust, pkgFrom: { x: pk.courier.x, y: pk.courier.y - 32 }, doorH: spot.h || SKALA.h('door', 'dekat', BASE), finalH: h,   // pelanggan setinggi kurir
      avoid: [{ x: pk.courier.x - 45, y: pk.courier.y - h - 8, w: 90, h: h + 16 }],
      person: person, cust: ci, layer: H.layer, rnd: rnd, onCheer: function () { setCourier('front', 'cheer'); S.cr.classList.add('cheer'); }
    });
    H.setCoins(H.coins + 20);
    Aud.sfx('stamp');
    if (S.m === 0) { Save.data[S.level === 1 ? 'onboarded' : 'seen2'] = true; Save.save(); }
    cleanup.hideBubble(); await H.banner(STR.deliver.done);
    cleanup(); S.cycle = (S.cycle || 0) + 1;
    await nextMission();
  }
  async function nextMission() {
    var i = S.m + 1;
    if (i >= S.missions.length) {
      var need = S.missions.filter(function (x) { return x.practice || x.wrong >= 2; });
      if (need.length && !S.practiced) {
        S.practiced = true;
        var spec = S.level === 1 ? { n: 3, must: ['left'] } : need[0].spec;
        S.missions.push(makeMission(spec, S.level));
      } else return finish();
    }
    S.state = 'busy';
    await startMission(i);
  }
  function finish() {
    var stars = S.totalWrong <= 1 ? 3 : S.totalWrong <= 3 ? 2 : 1, id = LV[S.level - 1].id;
    if (S.redRuns >= 2 && !Save.data.settings.santai) stars = Math.min(stars, 2);   // menerobos merah >= 2 kali: bintang ketiga (bonus) hilang, misi tetap selesai
    if (S.redStops >= 1 && S.redRuns === 0) { Save.award('tertib'); S.run.tertib = { first: 1, ok: 1, wrong: 0 }; }   // stempel Kurir Tertib
    Save.data.levels[id] = { stars: Math.max(stars, (Save.data.levels[id] || {}).stars || 0) };
    Save.data.coins = (Save.data.coins || 0) + H.coins; Save.save();
    S.state = 'done';
    Scenes.go('result', { level: S.level, stars: stars, coins: H.coins, run: S.run, wrong: S.totalWrong, red: S.redRuns, missions: S.missions.length });
  }

  /* ---------- scene ---------- */
  P.enter = function (root, params) {
    var level = params.level || 1; Art.view = 'dekat';
    var seed = U.TEST ? (parseInt((location.search.match(/seed=(\d+)/) || [])[1], 10) || 1) : Date.now() & 0xffffffff;
    rnd = U.rng(seed + level * 1000);
    MAP = level === 1 ? PETA.kotaMini : PETA.kotaTempat;
    S = { level: level, coins: 0, totalWrong: 0, redRuns: 0, redStops: 0, live: [], run: {}, state: 'busy', idle: 0, firstRing: false, lastText: '', missions: [] };
    (level === 1 ? PLAN1 : PLAN2).forEach(function (spec) { S.missions.push(makeMission(spec, level)); });

    var svg = UI.svgLayer(root);
    UI.g(svg, '<defs><clipPath id="wclip"><rect x="0" y="130" width="1280" height="480"/></clipPath></defs>' +
      '<rect x="0" y="0" width="1280" height="130" fill="' + C.sky + '"/><rect x="0" y="130" width="1280" height="480" fill="#8FD07C"/><rect x="0" y="610" width="1280" height="110" fill="#7DBE6A"/>' +
      '<g class="drift" style="animation-delay:-12s">' + Art.cloud(0, 100, .9) + '</g><g class="drift" style="animation-delay:-45s;animation-duration:95s">' + Art.cloud(0, 60, .7) + '</g>' +
      '<g class="fly" style="animation-delay:-6s">' + Art.bird(0, 90) + '</g>');
    var clip = UI.g(svg, ''); clip.setAttribute('clip-path', 'url(#wclip)');
    S.worldG = UI.g(clip, '');
    UI.g(svg, '<path d="M0 610 H1280" stroke="' + C.ink + '" stroke-width="4"/><path d="M0 130 H1280" stroke="' + C.ink + '" stroke-width="4"/>');
    S.badges = UI.g(svg, '');
    UI.g(S.badges, Art.handBadge('L'), 'translate(515,500)');
    UI.g(S.badges, Art.handBadge('R'), 'translate(765,500)');
    UI.g(S.badges, '<path d="M0 -24 l-18 24 h12 v16 h12 v-16 h12z" fill="' + C.sun + '"' + Art.st() + '/>', 'translate(640,392)');
    S.custG = UI.g(svg, ''); S.cwrap = UI.g(svg, ''); S.pkgG = UI.g(svg, ''); S.fx = UI.g(svg, '');

    H = Kit.hud(root, {
      onChoice: choose, canSpeak: function () { return S.state === 'await'; }, touch: function () { S.idle = 0; },
      onMenu: function () { UI.menu({ restart: function () { Scenes.go('play', { level: S.level }); } }); }
    });
    Aud.init(); Aud.streak = 0; Aud.music(true, 'play');
    startMission(0);

    if (U.TEST) {
      window.__test = {
        scene: function () { return Scenes.name; },
        state: function () { return S ? S.state : null; },
        expected: function () { return S && S.state === 'await' ? S.expected : null; },
        info: function () { return { m: S.m, step: S.k, wrong: S.totalWrong, missions: S.missions.length, coins: H.coins }; },
        sentences: function () { return S.mission.sentences || null; },
        deliverInfo: function () { return S ? S.parked : null; },
        light: function () { return S && S.cur && S.cur.light && S.cur.armed ? S.cur.ph : null; },
        lightInfo: function () { return S ? { redRuns: S.redRuns, redStops: S.redStops, stage: S.cur && S.cur.light ? S.cur.ph : null, t: S.cur && S.cur.t, armed: S.cur && S.cur.armed, live: S.live.length, curLive: S.live.indexOf(S.cur), state: S.state } : null; },
        lightSkip: function () { if (S && S.cur && S.cur.light) { S.cur.t = 99; } }
      };
    }
  };
  P.update = function (dt) {
    if (S && S.cr && S.cr.classList.contains('cr3d')) { if (S.cr.classList.contains('riding')) S.phase = (S.phase || 0) + dt * 8; syncCourier(); }
    if (S && S.live.length && !document.querySelector('.overlay')) {
      S.live = S.live.filter(function (sc) { if (sc.g.parentNode) sc.seen = true; return !sc.seen || !!sc.g.parentNode; });   // adegan baru belum dipasang saat belokan beranimasi: jangan dibuang sebelum pernah terpasang
      S.live.forEach(function (sc) { lightTick(sc, dt); });
    }
    if (!S || S.state !== 'await' || document.querySelector('.overlay')) return;
    S.idle += dt;
    if (S.idle > 8 && !S.hintShown && !H.handOn) { S.hintShown = true; H.showHandBtn(S.expected); }
  };
  P.exit = function () { Voice.stop(); Aud.music(false); S = null; };
  Scenes.add('play', P);
})();




