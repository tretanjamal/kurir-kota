/* Level 5 Turis Tersesat (lingkup TAMBAHAN): peran terbalik. Turis menanyakan satu tempat, murid memilih 1 dari 3 arahan.
   Memakai peta penuh yang sama dengan Level 3/Bos (playmap.js -> PlayMapKit) dan generator Route.genTourist (solver menjamin tepat 1 benar). */
(function () {
  var C = Art.C, P = {}, K = window.PlayMapKit;
  var MAP = null, S = null, rnd = null, H = null;

  function ptAt(pts, t) {   // titik pada poligaris, t 0..1 menurut panjang
    var L = [0], i;
    for (i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
    var d = L[L.length - 1] * t;
    for (i = 1; i < pts.length; i++) if (d <= L[i] || i === pts.length - 1) {
      var u = L[i] === L[i - 1] ? 1 : Math.min(1, (d - L[i - 1]) / (L[i] - L[i - 1]));
      return { x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * u, y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * u };
    }
    return pts[0];
  }
  function pathOf(texts, m) {   // simpul yang dilewati arahan itu (null bila arahan tidak membawa ke mana-mana)
    var r = Route.solve(MAP, { sentences: texts, start: m.start, heading: m.heading });
    return r.ok ? r.sim.decisions.map(function (d) { return K.nodePos(d.node); }) : null;
  }
  function polyline(pts, col, cls) {
    return UI.g(S.routeG, '<polyline class="' + (cls || '') + '" points="' + pts.map(function (p) { return p.x + ',' + p.y; }).join(' ') + '" fill="none" stroke="' + col + '" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="4 16" opacity=".95"/>');
  }
  function ring(c, r, col) {
    var g = K.lotGeom(c, r);
    return UI.g(S.routeG, '<rect class="bounce" x="' + (g.x + 3) + '" y="' + (g.top + 8) + '" width="84" height="' + (K.BH - 8) + '" rx="14" fill="none" stroke="' + col + '" stroke-width="6" stroke-dasharray="14 8"/>');
  }
  function bump(id, key) { var r = S.run[id] || (S.run[id] = { first: 0, ok: 0, wrong: 0 }); r[key]++; return r; }
  function skillsOf(m) { var t = m.route.instrs[0], s = m.route.instrs[1]; return [t.cmd, t.at, s.at]; }

  function drawTourist(pos, h, expr) {
    S.tour.pose(expr || 'idle'); S.tour.put(pos.x, pos.y + 14, h || SKALA.VIEW.peta.ch);
  }
  function setArrow(pos, heading) {
    var a = heading * 90 * Math.PI / 180, f = { x: Math.sin(a), y: -Math.cos(a) };
    S.arrow.setAttribute('transform', 'translate(' + Math.round(pos.x + f.x * 72) + ',' + Math.round(Math.min(578, Math.max(170, pos.y + f.y * 72))) + ') rotate(' + heading * 90 + ') scale(.7)');
  }

  async function startMission(i) {
    S.m = i; var m = S.mission = S.missions[i]; S.wrongStep = 0; S.picked = {}; S.hintShown = false;
    H.hideCoach(); H.hideHand(); H.glow(null); S.routeG.innerHTML = '';
    H.setMission(STR.hud.tourist(i + 1, S.missions.length));
    S.pos = K.nodePos(m.start); drawTourist(S.pos, null, 'confused'); setArrow(S.pos, m.heading); S.arrow.style.display = '';
    var g = K.lotGeom(m.target.lot.c, m.target.lot.r);
    S.pin.setAttribute('transform', 'translate(' + g.cx + ',' + (g.top + 4) + ')'); S.pin.style.display = '';
    H.setSub([m.question]);
    var cards = m.mode === 'cards';
    S.optEls.forEach(function (b, k) {
      b.style.display = cards ? 'none' : '';
      if (cards) return;
      var o = m.options[k];
      b.querySelector('.lbl').innerHTML = o.texts.map(function (t) { return '<div class="turis-s">' + t + '</div>'; }).join('');
      b.disabled = false; b.style.opacity = ''; b.classList.remove('glow');
    });
    S.cardUI.forEach(function (el) { el.style.display = cards ? '' : 'none'; });
    if (cards) {
      S.slot = { dir: null, mark: null };
      S.markEls.forEach(function (b, k) { b.dataset.mark = m.cards[k]; b.querySelector('.lbl').textContent = Route.NAME[m.cards[k]]; });
      refreshCards();
    }
    S.state = 'busy'; Aud.sfx('bell');
    S.state = 'await'; S.idle = 0;
    if (i === 0 && !Save.data.seenTuris) {
      H.showCoach(STR.turis.onboard, false);
      Tween.wait(4200).then(function () { if (S.state === 'await' && S.mission === m) H.showCoach(STR.turis.lrShort, false); });
    }
    else if (cards && !Save.data.seenCards) { Save.data.seenCards = true; Save.save(); H.showCoach(STR.turis.build, false); }
    await Tween.wait(500);
    if (S.state === 'await') await H.speak(0.9);
  }
  function setOpts(on) { S.optEls.forEach(function (b) { if (!S.picked[b.dataset.k]) b.disabled = !on; }); }

  /* ---- mode kartu kata ---- */
  function refreshCards() {
    var m = S.mission, s = S.slot;
    function slot(v, txt) { return '<span class="t-slot' + (v ? ' fill' : '') + '">' + (v ? txt : '&nbsp;') + '</span>'; }
    S.prev.innerHTML = STR.turis.turnWord + slot(s.dir, s.dir) + STR.turis.atWord + slot(s.mark, s.mark ? Route.NAME[s.mark] : '') + '. ' + m.stopText;
    S.dirEls.forEach(function (b) { b.classList.toggle('glow', s.dir === b.dataset.dir); });
    S.markEls.forEach(function (b) { b.classList.toggle('glow', s.mark === b.dataset.mark); });
    S.checkBtn.disabled = !(s.dir && s.mark) || S.state !== 'await';
  }
  function cardTap(kind, v) {
    if (S.state !== 'await' || !S.mission || S.mission.mode !== 'cards' || document.querySelector('.overlay')) return;
    S.idle = 0; H.hideHand(); S.slot[kind] = v; refreshCards();
  }
  async function checkCards() {
    if (S.state !== 'await' || !S.slot.dir || !S.slot.mark) return;
    var m = S.mission, c = m.route.instrs[0], texts = [Route.T.turn(S.slot.dir, S.slot.mark), m.stopText];
    S.idle = 0; H.hideHand(); H.glow(null);
    if (Route.reaches(MAP, texts, m.start, m.heading, m.target)) return correct(m, { texts: texts });
    return wrong(m, { texts: texts, err: S.slot.dir !== c.cmd ? 'lr' : 'mark' }, -1);
  }

  async function pick(k) {
    if (S.state !== 'await' || document.querySelector('.overlay')) return;
    S.idle = 0; H.hideHand(); H.glow(null); S.optEls.forEach(function (b) { b.classList.remove('glow'); });
    var m = S.mission, o = m.options[k];
    return o.ok ? correct(m, o) : wrong(m, o, k);
  }
  async function correct(m, o) {
    S.state = 'busy'; setOpts(false); Voice.stop(); H.hideCoach();
    var first = S.wrongStep === 0;
    skillsOf(m).forEach(function (id) { Save.record(id, first); var r = bump(id, 'ok'); if (first) r.first++; });
    Save.data.seenTuris = true; Save.save();
    Aud.sfx('good'); H.setCoins(H.coins + (first ? 15 : 8));
    var pts = pathOf(o.texts, m);
    polyline(pts, C.sun);
    S.arrow.style.display = 'none'; S.pin.style.display = 'none';
    await Tween.run(1500, function (e) { var p = ptAt(pts, e); drawTourist(p); }, Ease.easeInOutCubic);
    var g = K.lotGeom(m.target.lot.c, m.target.lot.r);
    ring(m.target.lot.c, m.target.lot.r, C.teal);
    drawTourist(ptAt(pts, 1), null, 'happy'); UI.burst(S.fx, ptAt(pts, 1).x, ptAt(pts, 1).y - 30, 10);
    Aud.sfx('stamp'); Voice.say(STR.turis.thanks, { rate: 0.9 });
    H.setCoins(H.coins + 10);
    await H.banner(STR.turis.thanks);
    await nextMission();
  }
  async function wrong(m, o, k) {
    S.state = 'busy';
    S.wrongStep++; m.wrong++; S.totalWrong++; S.picked[k] = true;
    var err = o.err, tier = Math.min(3, S.wrongStep), t = m.route.instrs[0];
    var sk = err === 'lr' ? t.cmd : t.at; Save.recordWrong(sk); bump(sk, 'wrong'); Save.save();
    Aud.sfx('bad');
    var cards = k < 0;
    if (!cards) { var b = S.optEls[k]; b.disabled = true; b.style.opacity = '.45'; }
    drawTourist(S.pos, null, 'confused');
    var pts = pathOf(o.texts, m), rp = null;
    if (pts) { rp = polyline(pts, C.red); await Tween.run(1100, function (e) { drawTourist(ptAt(pts, e)); }, Ease.easeInOutCubic); await Tween.wait(250); drawTourist(S.pos, null, 'confused'); rp.remove(); }
    H.showCoach(err === 'lr' ? STR.turis.lrHint : STR.turis.markHint, false, 'think');
    if (tier >= 2) { H.hl && H.hl(null); S.arrow.classList.add('bounce'); }
    var show = tier >= 3 || (!cards && S.optEls.filter(function (x) { return !x.disabled; }).length === 1);
    if (cards) {   // kosongkan kartu yang salah; kartu benar tetap
      var c0 = m.route.instrs[0];
      if (S.slot.dir !== c0.cmd) S.slot.dir = null;
      if (S.slot.mark !== c0.at) S.slot.mark = null;
    }
    if (show && cards) {
      var c1 = m.route.instrs[0], rg2 = pathOf(m.route.sentences, m); polyline(rg2, C.sun); ring(m.target.lot.c, m.target.lot.r, C.sun);
      var gd = S.dirEls.filter(function (x) { return x.dataset.dir === c1.cmd; })[0], gm = S.markEls.filter(function (x) { return x.dataset.mark === c1.at; })[0];
      gd.classList.add('glow'); gm.classList.add('glow'); H.showCoach(STR.turis.showRoute, false, 'call');
      var cx2 = parseFloat(gd.style.left) + parseFloat(gd.style.width) / 2, ty2 = parseFloat(gd.style.top);
      if (H.handNew) H.showHandAt(cx2, ty2 + 12, 'down'); else H.showHandAt(cx2 + 40, ty2 + 48);
      m.practice = true;
    } else if (show) {
      var good = S.optEls.filter(function (x) { return m.options[+x.dataset.k].ok; })[0];
      var rg = pathOf(m.options[+good.dataset.k].texts, m); polyline(rg, C.sun); ring(m.target.lot.c, m.target.lot.r, C.sun);
      good.classList.add('glow'); H.showCoach(STR.turis.showRoute, false, 'call');
      var cx = parseFloat(good.style.left) + parseFloat(good.style.width) / 2, ty = parseFloat(good.style.top);
      if (H.handNew) H.showHandAt(cx, ty + 12, 'down'); else H.showHandAt(cx + 40, ty + 48);
      m.practice = true;
    }
    S.state = 'await'; S.idle = 0;
    if (cards) refreshCards();
  }
  async function nextMission() {
    var i = S.m + 1;
    if (i >= S.missions.length) {
      var need = S.missions.filter(function (x) { return x.practice || x.wrong >= 2; });
      if (need.length && !S.practiced) { S.practiced = true; S.missions.push(make()); } else return finish();
    }
    await startMission(i);
  }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  /* mode 'pick' = pilih 1 dari 3 arahan; 'cards' = susun "Turn <kiri/kanan> at the <tempat>." dari kartu (ketuk-ketuk, tanpa seret), kalimat Stop sudah tersedia */
  function make(mode) {
    var t = Route.genTourist(MAP, rnd, S.missions.length === 0 ? { lights: false } : {}); if (!t) throw new Error('misi turis gagal'); t.wrong = 0; t.mode = mode || 'pick';
    if (t.mode === 'cards') {
      var ins = t.route.instrs, p1 = ins[0].at;
      var pool = Route.placesOnMap(MAP).concat(MAP.lights && MAP.lights.length ? ['lights'] : []).filter(function (p) { return p !== p1 && p !== ins[1].at; });
      t.cards = shuffle([p1].concat(shuffle(pool).slice(0, 3))); t.stopText = t.route.sentences[1];
    }
    return t;
  }
  function finish() {
    var w = S.totalWrong, stars = w <= 1 ? 3 : w <= 3 ? 2 : 1, id = LV[4].id;
    Save.data.levels[id] = { stars: Math.max(stars, (Save.data.levels[id] || {}).stars || 0) };
    Save.data.coins = (Save.data.coins || 0) + H.coins; Save.save();
    S.state = 'done';
    Scenes.go('result', { level: 5, stars: stars, coins: H.coins, run: S.run, wrong: w, red: 0, missions: S.missions.length, time: null });
  }

  P.enter = function (root, params) {
    Art.view = 'peta';
    K.setMap(PETA.kotaPasar); MAP = PETA.kotaPasar;   // Level 5 memakai peta kedua (Kota Pasar)
    var seed = U.TEST ? (parseInt((location.search.match(/seed=(\d+)/) || [])[1], 10) || 1) : Date.now() & 0xffffffff;
    rnd = U.rng(seed + 5000);
    S = { totalWrong: 0, run: {}, state: 'busy', idle: 0, missions: [], optEls: [], picked: {} };
    S.missions.push(make(), make(), make('cards'));   // misi 3 = susun kartu kata
    var svg = UI.svgLayer(root);
    UI.g(svg, '<defs><clipPath id="mclip"><rect x="0" y="130" width="1280" height="480"/></clipPath></defs>' +
      '<rect x="0" y="0" width="1280" height="130" fill="' + C.sky + '"/><rect x="0" y="130" width="1280" height="480" fill="#8FD07C"/><rect x="0" y="610" width="1280" height="110" fill="#7DBE6A"/>' +
      '<g class="drift" style="animation-delay:-12s">' + Art.cloud(0, 100, .9) + '</g><g class="fly" style="animation-delay:-6s">' + Art.bird(0, 90) + '</g>');
    var clip = UI.g(svg, ''); clip.setAttribute('clip-path', 'url(#mclip)');
    UI.g(clip, K.drawMap());
    (MAP.lights || []).forEach(function (n) {   // lampu terlihat di peta (landmark "traffic lights"), semuanya hijau dan diam
      var p = K.nodePos(n), g = UI.g(clip, Art.trafficLight(p.x - 50, p.y + 32, SKALA.VIEW.peta.light, { label: true, labelScale: 0.85, labelLeft: true }));
      Art.trafficLightSet(g.querySelector('.tl'), 'green', true);
    });
    UI.g(svg, '<path d="M0 610 H1280" stroke="' + C.ink + '" stroke-width="4"/><path d="M0 130 H1280" stroke="' + C.ink + '" stroke-width="4"/>');
    UI.g(svg, Art.walker(5, 120, 188, SKALA.VIEW.peta.ch * 0.5, 900, 40, 0));   // pejalan ambient di tepi atas peta
    S.routeG = UI.g(svg, '');
    S.pin = UI.g(svg, '<g class="bounce"><path d="M0 0 C-22 -22 -22 -54 0 -54 C22 -54 22 -22 0 0Z" fill="' + C.red + '"' + Art.st(3.5) + '/><circle cy="-36" r="8" fill="#fff"/></g>');
    S.tour = Kit.custSprite(UI.g(svg, ''), 3) || { put: function () { }, pose: function () { } };
    S.arrow = UI.g(svg, '<path d="M0 -24 l-18 24 h12 v16 h12 v-16 h12z" fill="' + C.sun + '"' + Art.st() + '/>');
    S.fx = UI.g(svg, '');

    H = Kit.hud(root, {
      onChoice: function () { }, canSpeak: function () { return S.state === 'await'; }, touch: function () { S.idle = 0; },
      onMenu: function () { UI.menu({ restart: function () { Scenes.go('turis', { level: 5 }); } }); }
    });
    H.coachAvoid = function () {
      var m = S.mission; if (!m) return null;
      var texts = (m.options || []).reduce(function (a, o) { return a.concat(o.texts); }, [m.question]);
      if (m.cards) texts = texts.concat(m.cards.map(function (p) { return Route.NAME[p]; }));
      return K.coachRects(texts, [m.target.lot], [S.pos]);
    };
    for (var k in H.btns) H.btns[k].style.display = 'none';
    H.kata.style.left = '1148px'; H.kata.style.width = '120px';   // tombol gerak diganti 3 pilihan arahan
    for (var j = 0; j < 3; j++) (function (j) {
      /* satu warna netral: merah/teal bermakna kiri/kanan di level lain */
      var b = Input.button('', 'sky', function () { pick(j); }, { x: 12 + j * 378, y: 606, w: 372, h: 106, id: 'opt' + j, aria: STR.turis.pick });
      b.dataset.k = j; b.dataset.opt = j; b.classList.add('t-opt');
      H.layer.appendChild(b); b.style.pointerEvents = 'auto'; S.optEls.push(b);
    })(j);

    /* mode kartu kata: pratinjau kalimat + baki kartu (kiri/kanan, 4 tempat) + tombol Cek */
    S.cardUI = []; S.dirEls = []; S.markEls = [];
    S.prev = U.h('div', 'panel t-prev');
    H.layer.appendChild(S.prev); S.cardUI.push(S.prev);
    function card(label, cls, x, w, id, fn) {
      var b = Input.button(label, cls, fn, { x: x, y: 654, w: w, h: 62, id: id });
      b.classList.add('t-card'); b.style.pointerEvents = 'auto'; H.layer.appendChild(b); S.cardUI.push(b); return b;
    }
    ['left', 'right'].forEach(function (d, i) { var b = card(d, d === 'left' ? 'red' : 'teal', 12 + i * 118, 110, 'cd_' + d, function () { cardTap('dir', d); }); b.dataset.dir = d; S.dirEls.push(b); });
    for (var q = 0; q < 4; q++) (function (q) { var b = card('', 'sun', 250 + q * 194, 188, 'cm_' + q, function () { cardTap('mark', b.dataset.mark); }); S.markEls.push(b); })(q);
    S.checkBtn = card(STR.turis.check, 'sky', 1030, 112, 'cek', checkCards);
    S.cardUI.forEach(function (el) { el.style.display = 'none'; });

    Aud.init(); Aud.streak = 0; Aud.music(true, 'play');
    startMission(0);

    if (U.TEST) {
      window.__test = {
        scene: function () { return Scenes.name; },
        state: function () { return S ? S.state : null; },
        expected: function () { return S && S.state === 'await' ? (S.mission.mode === 'cards' ? 'cards' : 'option') : null; },
        cardAnswer: function () { var c = S.mission.route.instrs[0]; return { dir: c.cmd, mark: c.at }; },
        correct: function () { return S && S.mission ? S.mission.options.findIndex(function (o) { return o.ok; }) : -1; },
        wrongIdx: function () { return S && S.mission ? S.mission.options.findIndex(function (o, i) { return !o.ok && !S.picked[i]; }) : -1; },
        info: function () { return { m: S.m, step: S.wrongStep, wrong: S.totalWrong, missions: S.missions.length, coins: H.coins }; },
        sentences: function () { return S.mission.options.map(function (o) { return o.texts.join(' '); }); },
        mission: function () { return S.mission ? { start: S.mission.start, heading: S.mission.heading, target: S.mission.target, pos: S.pos } : null; },
        light: function () { return null; },
        coachInfo: function () { return H.coachAvoid(); },
        showCoach: function (t) { H.showCoach(t, true); }
      };
    }
  };
  P.update = function (dt) {
    if (!S || S.state !== 'await' || document.querySelector('.overlay')) return;
    S.idle += dt;
    if (S.idle > 8 && !S.hintShown && !H.handOn) {
      S.hintShown = true;
      var b = S.mission.mode === 'cards' ? (S.slot.dir !== S.mission.route.instrs[0].cmd ? S.dirEls.filter(function (x) { return x.dataset.dir === S.mission.route.instrs[0].cmd; })[0] : S.markEls.filter(function (x) { return x.dataset.mark === S.mission.route.instrs[0].at; })[0]) : S.optEls.filter(function (x) { return S.mission.options[+x.dataset.k].ok; })[0];
      var cx = parseFloat(b.style.left) + parseFloat(b.style.width) / 2, ty = parseFloat(b.style.top);
      if (H.handNew) H.showHandAt(cx, ty + 12, 'down'); else H.showHandAt(cx + 40, ty + 48);
    }
  };
  P.exit = function () { Voice.stop(); Aud.music(false); S = null; };
  Scenes.add('turis', P);
})();
