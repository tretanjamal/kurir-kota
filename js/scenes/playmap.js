/* Scene Bermain (peta diam, utara di atas): Level 3 Posisi dan Bos Paket Kilat.
   Kurir tampak atas bergerak di peta penuh; L/R dan panah hadap ikut berputar bersama kurir. */
(function () {
  var C = Art.C, P = {}, NS = 'http://www.w3.org/2000/svg';
  var X0 = 90, DX = 220, Y0 = 222, DY = 165, BW = 180, BH = 122;   // Y0 dinaikkan agar kurir di baris atas tidak menembus bilah misi
  var CFOOT = 12, PARK_K = 0.75;   // titik pijak roda di bawah pusat kurir; skala kurir saat menepi di depan rumah
  var MAP = PETA.kotaBesar;
  var RELS3 = ['next', 'opposite', 'between', 'near'];
  var S = null, rnd = null, H = null;
  var BOSS_TIME = 150;

  function nodePos(n) { return { x: X0 + n.i * DX, y: Y0 + n.j * DY }; }
  function lotGeom(c, r) {
    var bi = c >> 1, s = c & 1, x0 = X0 + bi * DX + 20, y0 = Y0 + r * DY + 20;
    return { x: x0 + s * 90, w: 90, base: y0 + BH - 14, top: y0, cx: x0 + s * 90 + 45, s: s, bi: bi };
  }
  /* pintu sebenarnya sebuah petak: dari ukuran gambar yang dipasang (lihat drawMap). Rumah: pintu di 0,495 lebar, dasar di 0,86 tinggi, tinggi 0,325 */
  function houseMirror(c, r) { return ((c ^ r) & 1) === 1; }   // variasi: sebagian rumah dicerminkan (pintu ikut berpindah)
  function doorOf(c, r) {
    var g = lotGeom(c, r), v = MAP.lots[r][c], isH = v === 'h';
    var key = isH ? 'house_' + ['h1', 'h2', 'h3', 'h4'][(c * 3 + r * 5) % 4] : 'place_' + v, a = window.ASSETS.list[key];
    if (a && Assets.has(key)) {
      var bw = isH ? 84 : 88, bh = isH ? 62 : (v === 'hospital' ? 108 : 78), s = Math.min(bw / a.w, bh / a.h), iw = a.w * s, ih = a.h * s;
      var dd = a.door || { cx: .495, base: .86, h: .325 };
      return isH ? { x: g.cx + (houseMirror(c, r) ? 0.5 - dd.cx : dd.cx - 0.5) * iw, y: g.base - ih * (1 - dd.base), h: ih * dd.h, house: true } : { x: g.cx, y: g.base - ih * 0.04, h: Math.min(20, ih * 0.22), house: false };
    }
    return { x: g.cx, y: g.base - 6, h: 18, house: isH };
  }
  function lotKind(v) { return v === '.' ? 'empty' : v === 'h' ? 'house' : 'place'; }
  function fmt(t) { t = Math.floor(t); return Math.floor(t / 60) + ':' + ('0' + (t % 60)).slice(-2); }

  /* ---------- peta penuh ---------- */
  function drawMap() {
    var s = '', i, j, ink = [], fill = [];
    var x1 = X0 + (MAP.cols - 1) * DX, y1 = Y0 + (MAP.rows - 1) * DY, hw = 22;
    function bar(x, y, w, h) {
      ink.push('<rect x="' + (x - 4) + '" y="' + (y - 4) + '" width="' + (w + 8) + '" height="' + (h + 8) + '" rx="5" fill="' + C.ink + '"/>');
      fill.push('<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="3" fill="' + C.road + '"/>');
    }
    for (j = 0; j < MAP.rows; j++) bar(X0 - hw, Y0 + j * DY - hw, x1 - X0 + 2 * hw, 2 * hw);
    for (i = 0; i < MAP.cols; i++) bar(X0 + i * DX - hw, Y0 - hw, 2 * hw, y1 - Y0 + 2 * hw);
    s += ink.join('') + fill.join('');
    var dash = ' stroke="#FFF4DC" stroke-width="4" stroke-dasharray="22 18" fill="none"';
    for (j = 0; j < MAP.rows; j++) s += '<path d="M' + X0 + ' ' + (Y0 + j * DY) + ' H' + x1 + '"' + dash + '/>';
    for (i = 0; i < MAP.cols; i++) s += '<path d="M' + (X0 + i * DX) + ' ' + Y0 + ' V' + y1 + '"' + dash + '/>';
    for (j = 0; j < MAP.rows; j++) for (i = 0; i < MAP.cols; i++) s += '<rect x="' + (X0 + i * DX - hw) + '" y="' + (Y0 + j * DY - hw) + '" width="' + 2 * hw + '" height="' + 2 * hw + '" fill="' + C.road + '"/>';
    for (var bj = 0; bj < MAP.rows - 1; bj++) for (var bi = 0; bi < MAP.cols - 1; bi++)
      s += '<rect x="' + (X0 + bi * DX + 20) + '" y="' + (Y0 + bj * DY + 20) + '" width="' + BW + '" height="' + BH + '" rx="14" fill="#A8DB93"' + Art.st(3) + '/>';
    var labels = '';
    for (var r = 0; r < MAP.lots.length; r++) for (var c = 0; c < MAP.lots[r].length; c++) {
      var v = MAP.lots[r][c], g = lotGeom(c, r), k;
      if (v === '.') { s += Art.tree(g.cx - 14, g.base - 6, 1, true) + Art.bush(g.cx + 20, g.base - 2, 1); continue; }
      if (v === 'h') {
        var keys = ['h1', 'h2', 'h3', 'h4'], st = PETA.houses[keys[(c * 3 + r * 5) % 4]];
        var hi = Art.slotImage('house_' + keys[(c * 3 + r * 5) % 4], g.cx, g.base, 84, 62);
        if (hi && houseMirror(c, r)) hi = '<g transform="translate(' + (2 * g.cx) + ',0) scale(-1,1)">' + hi + '</g>';
        s += hi || '<g transform="translate(' + (g.x + 14) + ',' + g.base + ') scale(.58)">' + Art.house(st, 100, 92, 28) + '</g>';
      } else {
        var si = Art.slotImage('place_' + v, g.cx, g.base, 88, v === 'hospital' ? 108 : 78);
        if (si) s += si;
        else { var pl = Art.place(v); k = Math.min(0.62, 80 / (pl.w + pl.d)); s += '<g transform="translate(' + (g.x + 4) + ',' + g.base + ') scale(' + k + ')">' + pl.svg + '</g>'; }
        var sib = MAP.lots[r][c ^ 1], dx = sib && sib !== 'h' && sib !== '.' ? 34 : 12;
        labels += Art.label(Route.NAME[v], g.cx + (g.s ? dx : -dx), g.base + 22);
      }
    }
    return s + zebras() + labels;
  }
  /* zebra cross di empat lengan tiap simpang berlampu (di luar kotak simpang) */
  function zebras() {
    var s = '';
    (MAP.lights || []).forEach(function (n) {
      var p = nodePos(n), i, o = 20;
      for (i = 0; i < 6; i++) {
        var d = -17.5 + i * 7;
        s += '<rect x="' + (p.x + d) + '" y="' + (p.y - 37) + '" width="4.5" height="12" rx="1" fill="#FFF4DC"/><rect x="' + (p.x + d) + '" y="' + (p.y + 25) + '" width="4.5" height="12" rx="1" fill="#FFF4DC"/>' +
          '<rect x="' + (p.x - 37) + '" y="' + (p.y + d) + '" width="12" height="4.5" rx="1" fill="#FFF4DC"/><rect x="' + (p.x + 25) + '" y="' + (p.y + d) + '" width="12" height="4.5" rx="1" fill="#FFF4DC"/>';
      }
    });
    return s;
  }
  /* ---------- lampu lalu lintas (peta diam) ---------- */
  var DUR = { red: 2.6, green: 6, yellow: 1.5 }, NEXT = { red: 'green', green: 'yellow', yellow: 'red' };
  function lightAt(n) { for (var i = 0; i < S.lights.length; i++) if (S.lights[i].i === n.i && S.lights[i].j === n.j) return S.lights[i]; return null; }
  function lightSet(L, ph) { L.ph = ph; L.t = 0; Art.trafficLightSet(L.el, ph, !L.armed); }
  function armHere() {
    var d = cur(), L = d.expected === 'locate' ? null : lightAt(d.node);
    S.curL = L; if (!L) return;
    L.armed = true; L.tapped = false; L.counted = false; L.queued = null;
    lightSet(L, (d.node.i * 3 + d.node.j + S.m) % 3 === 2 ? 'green' : 'red');
    if (L.ph === 'red' && !Save.data.seenLight) { Save.data.seenLight = true; Save.save(); H.showCoach(STR.traffic.redWait, true); L.coach = true; }
  }
  function lightsTick(dt) {
    S.lights.forEach(function (L) {
      L.t += dt; if (L.t < DUR[L.ph]) return;
      var was = L.ph, nx = NEXT[was]; lightSet(L, nx);
      if (!L.armed) return;
      Aud.sfx('tl_' + nx);
      if (was !== 'red') return;
      if (!L.tapped && !L.counted) {
        L.counted = true; S.redStops++;
        ['tl_stop', 'tl_wait', 'zebra'].forEach(function (id) { Save.record(id, true); var r = bump(id, 'ok'); r.first++; });
        Save.save();
      }
      if (L.coach) { L.coach = false; H.showCoach(STR.traffic.green, false, 'cheer'); }
      if (L.queued && S.state === 'await') { var q = L.queued; L.queued = null; Tween.wait(350).then(function () { choose(q); }); }
    });
  }
  async function lightBlock(cmd, L) {
    if (Save.data.settings.santai) { L.queued = cmd; H.showCoach(STR.traffic.santaiWait, false, 'think'); Aud.sfx('pop'); return; }
    if (L.ph === 'yellow') { H.showCoach(STR.traffic.yellowWait, false, 'think'); Aud.sfx('tl_yellow'); return; }
    S.state = 'busy'; L.tapped = true; S.redRuns++;
    Save.recordWrong('tl_stop'); bump('tl_stop', 'wrong'); Save.save();
    Aud.sfx('bad');
    var a = S.angle * Math.PI / 180, f = { x: Math.sin(a), y: -Math.cos(a) }, base = { x: S.pos.x, y: S.pos.y }, o = { t: 0 };
    S.cr.classList.add('riding');
    await Tween.to(o, { t: 16 }, 240, Ease.easeInOutCubic, function () { S.pos = { x: base.x + f.x * o.t, y: base.y + f.y * o.t }; drawCourier(); });
    S.cr.classList.remove('riding');
    H.showCoach(STR.traffic.remind, false, 'think'); L.coach = true;
    Voice.say(SENT.traffic.remind.text, { rate: 0.9 });
    await Tween.to(o, { t: 0 }, 380, Ease.easeInOutCubic, function () { S.pos = { x: base.x + f.x * o.t, y: base.y + f.y * o.t }; drawCourier(); });
    S.state = 'await';
  }
  /* pusat tampilan sebuah petak (untuk cincin sorot) */
  function lotBox(c, r) { var g = lotGeom(c, r); return { x: g.x + 3, y: g.top + 8, w: 84, h: BH - 8 }; }
  /* kotak yang jangan ditutup kotak pelatih: tempat yang disebut di texts (termasuk labelnya), petak lots, dan tokoh di pts */
  function coachRects(texts, lots, pts) {
    var all = texts.join(' '), out = [];
    function addLot(l) { var g = lotGeom(l.c, l.r); out.push({ x: g.cx - 100, y: g.top, w: 200, h: BH + 26 }); }
    Route.placesOnMap(MAP).forEach(function (p) { if (all.indexOf(Route.NAME[p]) >= 0) addLot(Route.placeLot(MAP, p)); });
    lots.forEach(addLot);
    pts.forEach(function (p) { out.push({ x: p.x - 60, y: p.y - 90, w: 120, h: 110 }); });
    return out;
  }

  /* ---------- kurir ---------- */
  function drawCourier() {
    var p = S.pos, a = S.angle * Math.PI / 180, f = { x: Math.sin(a), y: -Math.cos(a) }, rr = { x: Math.cos(a), y: Math.sin(a) };
    if (S.cr && S.cr.classList.contains('cr3d')) {
      var ck = S.crK || 1;   // S.crK: skala kurir saat menepi di depan rumah, jangkar di titik pijak roda
      S.cwrap.setAttribute('transform', 'translate(' + Math.round(p.x - rr.x * 9) + ',' + Math.round(p.y - rr.y * 9 + CFOOT * (1 - ck)) + ') scale(' + ck.toFixed(3) + ')');   // lajur kiri (Indonesia): sedikit di kiri garis tengah
      var pose = S.cr.classList.contains('confused') ? 'confused' : S.cr.classList.contains('cheer') ? 'cheer' : null;
      Art.courierFrame(S.cr, Math.round((((S.angle % 360) + 360) % 360) / 45) % 8, S.phase || 0, pose);
    } else S.cwrap.setAttribute('transform', 'translate(' + p.x + ',' + p.y + ') rotate(' + S.angle + ') scale(.55)');
    /* penanda di luar kotak badan kurir (helm sampai roda) agar wajah tidak tertutup: titik tepi kotak searah (dx,dy) + jarak r.
       Dijaga tetap di area peta; bila terjepit di tepi dan kembali menimpa kepala, digeser ke samping (geser = arah menjauhi badan). */
    var ch = SKALA.VIEW.peta.ch, top = p.y + CFOOT - ch, bot = p.y + CFOOT, cy = (top + bot) / 2;
    function out(dx, dy, r, hw) {
      var t = Math.min(Math.abs(dx) > 0.01 ? (hw + r) / Math.abs(dx) : 1e9, Math.abs(dy) > 0.01 ? (ch / 2 + r) / Math.abs(dy) : 1e9);
      return { x: p.x + dx * t, y: cy + dy * t + (Math.abs(dy) < 0.5 ? 24 : 0) };   // penanda di samping: setinggi badan, di bawah kepala
    }
    function clamp(q, r, sx, sy) {
      var x = Math.max(32, Math.min(1248, q.x)), y = Math.max(166, Math.min(582, q.y));
      if (y !== q.y && y - r < bot && y + r > top) { x += sx; y += sy; }
      return 'translate(' + Math.round(x) + ',' + Math.round(y) + ')';
    }
    S.badgeL.setAttribute('transform', clamp(out(-rr.x, -rr.y, 32, 34), 30, -f.x * 84, -f.y * 84) + ' scale(.78)');
    S.badgeR.setAttribute('transform', clamp(out(rr.x, rr.y, 32, 34), 30, -f.x * 84, -f.y * 84) + ' scale(.78)');
    S.arrow.setAttribute('transform', clamp(out(f.x, f.y, 22, 40), 20, 56, 0) + ' rotate(' + S.angle + ') scale(.7)');
  }
  function placeAt(node, heading) { S.pos = nodePos(node); S.angle = heading * 90; drawCourier(); }

  /* ---------- misi ---------- */
  function makeMissionL3(i, rel) {
    var nm = i < 2 ? 1 : 2;
    for (var t = 0; t < 30; t++) { var m = Route.genLocate(MAP, rnd, rel, nm); if (m) { m.wrong = 0; m.rel = rel; return m; } }
    throw new Error('misi L3 gagal');
  }
  function makeBoss(i, prev) {
    var o = prev ? { start: prev.node, heading: prev.heading } : {}, m = null;
    for (var t = 0; t < 20 && !m; t++) {
      if (i === 1) m = Route.genLocate(MAP, rnd, RELS3[Math.floor(rnd() * 4)], 2, o);
      else m = Route.genRoute(MAP, rnd, i === 0 ? 'B' : 'C', o);
      if (!m && t > 10) o = {};
    }
    if (!m) throw new Error('misi Bos gagal');
    m.wrong = 0; return m;
  }
  function cur() { return S.mission.decisions[S.k]; }
  function curIns() { return S.mission.instrs[cur().instr]; }
  function glossOf(id) { return SENT.gloss.filter(function (x) { return x.id === id; })[0]; }

  async function startMission(i) {
    S.m = i;
    if (S.level === 4) S.mission = S.missions[i] = makeBoss(i, S.prevEnd); else S.mission = S.missions[i];
    var m = S.mission; S.k = 0; S.wrongStep = 0; S.hintShown = false;
    updateMissionLabel();
    H.hideCoach(); H.hideHand(); H.glow(null); H.hl(null); H.diagram(null); S.ringG.innerHTML = '';
    S.custG.innerHTML = ''; S.pkgG.innerHTML = '';
    S.crK = 1; S.parked = null;
    setCourierSprite(false);
    placeAt(m.decisions[0].node, m.decisions[0].heading);
    S.badgeL.style.display = S.badgeR.style.display = S.arrow.style.display = '';
    S.state = 'busy'; H.setMoveEnabled(true); setLots(false);
    H.setSub(m.sentences); S.expected = m.decisions[0].expected;
    Aud.sfx('bell'); H.phone.classList.add('ring'); Aud.sfx('phone');
    Tween.wait(1000).then(function () { H.phone.classList.remove('ring'); });
    armHere();
    S.state = 'await'; S.idle = 0;
    var seen = S.level === 3 ? 'seen3' : 'seen4';
    if (S.m === 0 && !Save.data[seen]) H.showCoach(m.kind === 'locate' ? STR.coach.onboardLocate : STR.coach.onboardPlace, true);
    await Tween.wait(S.firstRing ? 150 : 700); S.firstRing = true;
    if (S.state === 'await') await H.speak(0.9);
  }
  function updateMissionLabel() {
    if (S.level === 4) H.setMission(STR.hud.address(S.m + 1, 3, Save.data.settings.santai ? null : fmt(S.time)));
    else H.setMission(STR.hud.mission(S.m + 1, S.missions.length, STR.levels.names[2]));
  }
  function setCourierSprite(confused) {
    S.cwrap.innerHTML = Art.courierSpriteOK() ? Art.courierSprite(SKALA.VIEW.peta.ch, CFOOT) : Art.bikeTop();
    S.cr = S.cwrap.querySelector('.cr'); S.phase = 0;
    if (confused) S.cr.classList.add('confused');
  }
  function setLots(on) {
    S.lotBtns.forEach(function (b) { b.disabled = !on; b.style.pointerEvents = on ? 'auto' : 'none'; });
  }
  function bump(id, key) { var r = S.run[id] || (S.run[id] = { first: 0, ok: 0, wrong: 0 }); r[key]++; return r; }
  function skillsAt(d, ins, success) {
    if (d.expected === 'locate') return [ins.rel];
    if (d.atLandmark) return [d.atLandmark, d.expected];
    if (ins.at) return success ? [] : [ins.at];
    return [d.expected];
  }
  function wrongHint(chosen, d, ins) {
    var LR = (chosen === 'left' && d.expected === 'right') || (chosen === 'right' && d.expected === 'left');
    if (LR) return STR.coach.lrSwap;
    if (ins && ins.at) {
      var nm = glossOf(ins.at).en;
      if (d.atLandmark) return STR.coach.here(nm, d.expected === 'left' ? STR.coach.actTurnLeft : d.expected === 'right' ? STR.coach.actTurnRight : STR.coach.actStop);
      return STR.coach.notYet(nm);
    }
    if (chosen === 'stop') return STR.coach.tooEarly;
    if (d.expected === 'straight') return STR.coach.notStraight;
    if (chosen === 'straight') return STR.coach.turnNotStraight;
    return STR.coach.wrongTurn;
  }

  async function choose(cmd) {
    if (S.state !== 'await' || document.querySelector('.overlay')) return;
    S.idle = 0; S.hintShown = false; H.hideHand(); H.glow(null);
    var d = cur();
    if (d.expected === 'locate') { H.showCoach(STR.coach.useTap, false); return; }
    if (S.curL && S.curL.armed && cmd !== 'stop' && S.curL.ph !== 'green') return lightBlock(cmd, S.curL);   // lampu belum hijau: kurir menunggu
    return cmd === d.expected ? correct(d) : wrongMove(cmd, d);
  }
  async function correct(d) {
    S.state = 'busy';
    Voice.stop(); H.onWord(999); H.hideCoach(); H.diagram(null); H.hl(null);
    var ins = curIns(), first = S.wrongStep === 0;
    if (S.curL && S.curL.armed) {
      S.curL.armed = false; Art.trafficLightSet(S.curL.el, S.curL.ph, true);
      if (d.expected !== 'stop') { Save.record('tl_go', true); var rg = bump('tl_go', 'ok'); rg.first++; }
      S.curL = null;
    }
    skillsAt(d, ins, true).forEach(function (id) { Save.record(id, first); var r = bump(id, 'ok'); if (first) r.first++; });
    Save.save();
    Aud.sfx('good'); UI.burst(S.fx, S.pos.x, S.pos.y, 10);
    H.setCoins(H.coins + (first ? 10 : 5));
    if (d.expected === 'stop') { await deliverTo(Route.placeLot(MAP, ins.at)); return; }
    await advance(d);
  }
  async function wrongMove(cmd, d) {
    S.state = 'busy';
    var ins = curIns();
    S.wrongStep++; S.mission.wrong++; S.totalWrong++;
    skillsAt(d, ins, false).forEach(function (id) { Save.recordWrong(id); bump(id, 'wrong'); });
    Save.save();
    var tier = Math.min(3, S.wrongStep);
    Aud.sfx('bad');
    var a = S.angle * Math.PI / 180, f = { x: Math.sin(a), y: -Math.cos(a) }, rr = { x: Math.cos(a), y: Math.sin(a) };
    var v = cmd === 'left' ? { x: -rr.x, y: -rr.y } : cmd === 'right' ? rr : cmd === 'straight' ? f : { x: 0, y: 0 };
    var base = { x: S.pos.x, y: S.pos.y }, o = { t: 0 };
    await Tween.to(o, { t: 18 }, 240, Ease.easeInOutCubic, function () { S.pos = { x: base.x + v.x * o.t, y: base.y + v.y * o.t }; drawCourier(); });
    setCourierSprite(true); drawCourier();
    var q = UI.g(S.fx, '<text text-anchor="middle" font-family="Nunito" font-weight="900" font-size="40" fill="' + C.red + '" stroke="' + C.ink + '" stroke-width="5" paint-order="stroke">?</text>', 'translate(' + base.x + ',' + (base.y - 46) + ')');
    H.showCoach(wrongHint(cmd, d, ins) + (tier === 3 ? ' ' + STR.coach.showAnswer : ''), false, 'think');
    await Tween.to(o, { t: 0 }, 340, Ease.easeInOutCubic, function () { S.pos = { x: base.x + v.x * o.t, y: base.y + v.y * o.t }; drawCourier(); });
    q.remove(); setCourierSprite(false); drawCourier();
    S.state = 'await';
    if (tier >= 2) {
      if (ins.at) { H.hl(Route.NAME[ins.at].split(' ')); H.kata.classList.add('glow'); H.showCoach(STR.coach.forgotPlace, false, 'think'); }
      else H.hl([d.expected]);
      if (d.expected === 'left' || d.expected === 'right') (d.expected === 'left' ? S.badgeL : S.badgeR).classList.add('bounce');
    }
    if (tier >= 3) { H.kata.classList.remove('glow'); H.glow(d.expected); H.showHandBtn(d.expected); S.mission.practice = true; }
    Voice.stop();
    await H.speak(tier >= 2 ? 0.75 : 0.9);
  }

  function ring(c, r, col, cls) {
    var b = lotBox(c, r);
    return UI.g(S.ringG, '<rect class="' + (cls || '') + '" x="' + b.x + '" y="' + b.y + '" width="' + b.w + '" height="' + b.h + '" rx="14" fill="none" stroke="' + col + '" stroke-width="6" stroke-dasharray="14 8"/>');
  }
  async function tapLot(c, r) {
    if (S.state !== 'await' || document.querySelector('.overlay')) return;
    var d = cur(); if (d.expected !== 'locate') { H.showCoach(STR.coach.movesFirst, false); return; }
    S.idle = 0; S.hintShown = false; H.hideHand(); H.glow(null);
    var m = S.mission, ins = curIns(), tg = m.dest.lot;
    if (c === tg.c && r === tg.r) {
      S.state = 'busy';
      Voice.stop(); H.onWord(999); H.hideCoach(); H.diagram(null); H.hl(null); S.ringG.innerHTML = ''; setLots(false);
      var first = S.wrongStep === 0;
      Save.record(ins.rel, first); var rr = bump(ins.rel, 'ok'); if (first) rr.first++; Save.save();
      Aud.sfx('good'); H.setCoins(H.coins + (first ? 10 : 5));
      await deliverTo(tg); return;
    }
    S.state = 'busy';
    S.wrongStep++; m.wrong++; S.totalWrong++;
    Save.recordWrong(ins.rel); bump(ins.rel, 'wrong'); Save.save();
    var tier = Math.min(3, S.wrongStep), v = MAP.lots[r][c];
    Aud.sfx('bad');
    var wr = ring(c, r, C.red, 'bounce');
    if (v === 'h') { var dd = doorOf(c, r); Kit.peek({ layer: S.custG, cust: Portrait.custFor(S.m + (S.cycle || 0) + 1), door: dd, doorH: dd.h, peekH: 84 }); }
    H.showCoach(lotKind(v) === 'place' ? STR.coach.pickHouse : (STR.coach.locateRel[ins.rel] || STR.coach.locateWrong), false, 'think');
    await Tween.wait(700); wr.remove();
    S.state = 'await';
    if (tier >= 2) {
      H.diagram(ins.rel); H.hl([ins.rel === 'next' ? 'next' : ins.rel]);
      ins.refs.forEach(function (p) { var l = Route.placeLot(MAP, p); ring(l.c, l.r, C.teal, 'bounce'); });
    }
    if (tier >= 3) {
      var g = lotGeom(tg.c, tg.r); ring(tg.c, tg.r, C.sun, 'bounce'); H.showHandAt(g.cx, g.base - 22, 'up'); m.practice = true;
    }
    Voice.stop(); H.reset();
    await H.speak(tier >= 2 ? 0.75 : 0.9);
  }

  async function advance(d) {
    S.state = 'busy';
    var nx = S.mission.decisions[S.k + 1], to = nodePos(nx.node);
    var ang0 = S.angle, dA = d.expected === 'left' ? -90 : d.expected === 'right' ? 90 : 0;
    S.cr.classList.add('riding'); Aud.sfx('chain');
    if (dA) await Tween.value(ang0, ang0 + dA, 300, Ease.easeInOutCubic, function (v) { S.angle = v; drawCourier(); });
    var from = { x: S.pos.x, y: S.pos.y };
    await Tween.run(800, function (e) { S.pos = { x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e }; drawCourier(); }, Ease.easeInOutCubic);
    S.k++; S.cr.classList.remove('riding'); Aud.ride(false);
    var nd = cur(); S.expected = nd.expected; S.wrongStep = 0; S.hintShown = false; S.idle = 0;
    if (H.active !== nd.instr) { H.setActive(nd.instr); Aud.sfx('pop'); }
    if (nd.expected === 'locate') {
      H.setMoveEnabled(false); setLots(true); H.showCoach(STR.coach.useTap, false);
    }
    armHere();
    S.state = 'await';
  }

  /* kurir bersepeda di sepanjang jalan melewati titik pts. k = skala kurir di titik akhir. Waktu Bos tidak berjalan selama ini. */
  async function rideAlong(pts, k) {
    S.autoRide = true;
    S.cr.classList.add('riding'); Aud.sfx('chain');
    var k0 = S.crK || 1, total = 0, done = 0, i;
    for (i = 0; i < pts.length; i++) total += Math.abs(pts[i].x - (i ? pts[i - 1].x : S.pos.x)) + Math.abs(pts[i].y - (i ? pts[i - 1].y : S.pos.y));
    for (i = 0; i < pts.length; i++) {
      var from = { x: S.pos.x, y: S.pos.y }, to = pts[i], dx = to.x - from.x, dy = to.y - from.y, dist = Math.abs(dx) + Math.abs(dy);
      if (dist < 1) continue;
      var want = dy < 0 ? 0 : dx > 0 ? 90 : dy > 0 ? 180 : 270, a0 = S.angle, dA = ((want - a0) % 360 + 540) % 360 - 180;
      if (Math.abs(dA) > 1) await Tween.value(a0, a0 + dA, 200, Ease.easeInOutCubic, function (v) { S.angle = v; drawCourier(); });
      await Tween.run(Math.max(260, dist / 0.42), function (e) {
        S.pos = { x: from.x + dx * e, y: from.y + dy * e };
        S.crK = k0 + (k - k0) * (done + dist * e) / total;
        drawCourier();
      }, Ease.easeInOutCubic);
      done += dist; S.pos = { x: to.x, y: to.y }; S.crK = k0 + (k - k0) * done / total; drawCourier();
    }
    S.cr.classList.remove('riding'); Aud.ride(false);
    S.autoRide = false;
  }
  /* pintu menghadap jalan di bawah bloknya: kurir menyusur jalan sampai tepat di depan pintu (pelanggan di sisi lain pintu) */
  function parkSpot(lot, dr) {
    var rowY = Y0 + (lot.r + 1) * DY, side = dr.x >= S.pos.x ? 1 : -1, gap = 40, pts = [];
    if (Math.abs(S.pos.y - rowY) > 1) pts.push({ x: S.pos.x, y: rowY });
    pts.push({ x: dr.x - side * gap, y: rowY });
    return { pts: pts, cust: { x: dr.x + side * gap, y: rowY + 4 } };
  }
  async function deliverTo(lot) {
    var m = S.mission, start = { x: S.pos.x, y: S.pos.y };
    S.badgeL.style.display = S.badgeR.style.display = S.arrow.style.display = 'none';
    H.setMoveEnabled(false); setLots(false);
    var dr = doorOf(lot.c, lot.r), park = parkSpot(lot, dr), fh = SKALA.VIEW.peta.ch * PARK_K;
    await rideAlong(park.pts, PARK_K);
    Aud.sfx('bell');
    var np = S.pos;
    S.parked = { courier: { x: np.x, y: np.y + CFOOT }, door: { x: dr.x, y: dr.y }, cust: park.cust };
    var ci = Portrait.custFor(S.m + (S.cycle || 0)), person = Portrait.personFor(ci);
    var cleanup = await Kit.deliver({
      custG: S.custG, pkgG: S.pkgG, fx: S.fx, from: dr, doorH: dr.h, finalH: fh, to: park.cust, pkgFrom: { x: np.x, y: np.y },
      avoid: [{ x: np.x - 45, y: np.y + CFOOT - fh - 8, w: 90, h: fh + 16 }],
      person: person, cust: ci, layer: H.layer, rnd: rnd, onCheer: function () { S.cr.classList.add('cheer'); drawCourier(); }
    });
    H.setCoins(H.coins + 20); Aud.sfx('stamp');
    var seen = S.level === 3 ? 'seen3' : 'seen4';
    if (S.m === 0) { Save.data[seen] = true; Save.save(); }
    S.prevEnd = { node: m.end.node, heading: m.end.heading };
    cleanup.hideBubble(); await H.banner(STR.deliver.done);
    cleanup(); S.cycle = (S.cycle || 0) + 1;
    if (S.level === 4 && S.m + 1 < S.missions.length) {   // Bos: alamat berikutnya mulai dari simpang tadi, kurir kembali ke sana (bukan melompat)
      S.cr.classList.remove('cheer');
      await rideAlong(park.pts.slice(0, -1).reverse().concat([start]), 1);
    }
    await nextMission();
  }
  async function nextMission() {
    var i = S.m + 1;
    if (i >= S.missions.length) {
      var need = S.level === 3 ? S.missions.filter(function (x) { return x.practice || x.wrong >= 2; }) : [];
      if (need.length && !S.practiced) {
        S.practiced = true; var pm = makeMissionL3(0, need[0].rel); S.missions.push(pm);
      } else return finish();
    }
    S.state = 'busy';
    await startMission(i);
  }
  function finish() {
    var w = S.totalWrong, stars;
    if (S.level === 4) {
      var fast = Save.data.settings.santai || S.time <= BOSS_TIME;
      stars = 1 + (w <= 4 ? 1 : 0) + (w <= 2 && fast ? 1 : 0);
    } else stars = w <= 1 ? 3 : w <= 3 ? 2 : 1;
    if (S.redRuns >= 2 && !Save.data.settings.santai) stars = Math.min(stars, 2);   // menerobos merah >= 2 kali: bintang bonus hilang, misi tetap selesai
    if (S.redStops >= 1 && S.redRuns === 0) { Save.award('tertib'); S.run.tertib = { first: 1, ok: 1, wrong: 0 }; }   // stempel Kurir Tertib
    var id = LV[S.level - 1].id;
    Save.data.levels[id] = { stars: Math.max(stars, (Save.data.levels[id] || {}).stars || 0) };
    Save.data.coins = (Save.data.coins || 0) + H.coins; Save.save();
    S.state = 'done';
    Scenes.go('result', { level: S.level, stars: stars, coins: H.coins, run: S.run, wrong: w, red: S.redRuns, missions: S.missions.length, time: S.level === 4 && !Save.data.settings.santai ? fmt(S.time) : null });
  }

  /* ---------- scene ---------- */
  P.enter = function (root, params) {
    var level = params.level || 3; Art.view = 'peta';
    /* peta kedua (Kota Pasar) dipakai saat level ini diulang; ?map=pasar memaksa (uji) */
    MAP = (U.TEST && /map=pasar/.test(location.search)) || (LV.done(level) && !U.TEST) ? PETA.kotaPasar : PETA.kotaBesar;
    var seed = U.TEST ? (parseInt((location.search.match(/seed=(\d+)/) || [])[1], 10) || 1) : Date.now() & 0xffffffff;
    rnd = U.rng(seed + level * 1000);
    S = { level: level, totalWrong: 0, redRuns: 0, redStops: 0, lights: [], curL: null, run: {}, state: 'busy', idle: 0, firstRing: false, missions: [], time: 0, lotBtns: [] };
    if (level === 3) RELS3.forEach(function (rel, i) { S.missions.push(makeMissionL3(i, rel)); });
    else for (var i = 0; i < 3; i++) S.missions.push(null);

    var svg = UI.svgLayer(root);
    UI.g(svg, '<defs><clipPath id="mclip"><rect x="0" y="130" width="1280" height="480"/></clipPath></defs>' +
      '<rect x="0" y="0" width="1280" height="130" fill="' + C.sky + '"/><rect x="0" y="130" width="1280" height="480" fill="#8FD07C"/><rect x="0" y="610" width="1280" height="110" fill="#7DBE6A"/>' +
      '<g class="drift" style="animation-delay:-12s">' + Art.cloud(0, 100, .9) + '</g><g class="fly" style="animation-delay:-6s">' + Art.bird(0, 90) + '</g>');
    var clip = UI.g(svg, ''); clip.setAttribute('clip-path', 'url(#mclip)');
    UI.g(clip, drawMap());
    (MAP.lights || []).forEach(function (n, k) {   // lampu di sudut barat daya tiap simpang (tidak menutupi label tempat) berlampu; berputar sendiri, mulai dari fase berbeda
      var p = nodePos(n), g = UI.g(clip, Art.trafficLight(p.x - 50, p.y + 32, SKALA.VIEW.peta.light, { label: true, labelScale: 0.85, labelLeft: true }));
      var L = { i: n.i, j: n.j, el: g.querySelector('.tl'), ph: ['green', 'red'][k % 2], t: k * 1.3, armed: false };
      Art.trafficLightSet(L.el, L.ph, true); S.lights.push(L);
    });
    UI.g(svg, '<path d="M0 610 H1280" stroke="' + C.ink + '" stroke-width="4"/><path d="M0 130 H1280" stroke="' + C.ink + '" stroke-width="4"/>');
    UI.g(svg, Art.walker(2, 120, 188, SKALA.VIEW.peta.ch * 0.5, 900, 40, 0));   // pejalan ambient di tepi atas peta
    S.ringG = UI.g(svg, '');
    S.custG = UI.g(svg, ''); S.pkgG = UI.g(svg, '');
    S.cwrap = UI.g(svg, '');
    S.badgeL = UI.g(svg, Art.handBadge('L')); S.badgeR = UI.g(svg, Art.handBadge('R'));
    S.arrow = UI.g(svg, '<path d="M0 -24 l-18 24 h12 v16 h12 v-16 h12z" fill="' + C.sun + '"' + Art.st() + '/>');
    S.fx = UI.g(svg, '');
    S.pos = { x: 0, y: 0 }; S.angle = 0;

    H = Kit.hud(root, {
      onChoice: choose, canSpeak: function () { return S.state === 'await'; }, touch: function () { S.idle = 0; },
      onMenu: function () { UI.menu({ restart: function () { Scenes.go('playmap', { level: S.level }); } }); }
    });
    H.coachAvoid = function () { var m = S.mission; return m ? coachRects(m.sentences, m.dest && m.dest.lot ? [m.dest.lot] : [], [S.pos]) : null; };
    // tombol ketuk bangunan (keyboard: Tab)
    for (var r = 0; r < MAP.lots.length; r++) for (var c = 0; c < MAP.lots[r].length; c++) (function (c, r) {
      var v = MAP.lots[r][c]; if (v === '.') return;
      var g = lotGeom(c, r), b = U.h('button', 'lot');
      b.type = 'button'; b.dataset.c = c; b.dataset.r = r;
      b.setAttribute('aria-label', v === 'h' ? 'rumah di baris ' + (r + 1) + ' kolom ' + (c + 1) : Route.NAME[v]);
      b.style.cssText = 'left:' + g.x + 'px;top:' + (g.top + 6) + 'px;width:90px;height:' + (BH - 4) + 'px;pointer-events:none';
      b.disabled = true;
      b.addEventListener('pointerdown', function () { if (!b.disabled) { Aud.init(); Aud.sfx('pop'); } });
      b.addEventListener('click', function () { tapLot(c, r); });
      H.layer.appendChild(b); S.lotBtns.push(b);
    })(c, r);

    Aud.init(); Aud.streak = 0; Aud.music(true, 'play');
    startMission(0);

    if (U.TEST) {
      window.__test = {
        scene: function () { return Scenes.name; },
        state: function () { return S ? S.state : null; },
        expected: function () { return S && S.state === 'await' ? S.expected : null; },
        target: function () { return S && S.mission && S.mission.dest && S.mission.dest.lot; },
        info: function () { return { m: S.m, step: S.k, wrong: S.totalWrong, missions: S.missions.length, coins: H.coins, time: S.time }; },
        sentences: function () { return S.mission.sentences; },
        deliverInfo: function () { return S ? S.parked : null; },
        /* posisikan kurir untuk uji; kembalikan pusat lencana/panah dan kotak kepala */
        poseAt: function (i, j, a) {
          S.pos = nodePos({ i: i, j: j }); S.angle = a; drawCourier();
          function ctr(el) { var m = el.getCTM(), r = document.querySelector('#scene-root svg').getCTM(); return { x: (m.e - r.e) / r.a, y: (m.f - r.f) / r.d }; }
          var top = S.pos.y + CFOOT - SKALA.VIEW.peta.ch;
          return { L: ctr(S.badgeL), R: ctr(S.badgeR), arrow: ctr(S.arrow), head: { x: S.pos.x - 34, y: top, w: 68, h: 56 } };
        },
        grid: function () { return { cols: MAP.cols, rows: MAP.rows }; },
        light: function () { return S && S.curL && S.curL.armed ? S.curL.ph : null; },
        lightInfo: function () { return S ? { redRuns: S.redRuns, redStops: S.redStops } : null; },
        coachInfo: function () { return H.coachAvoid(); },
        showCoach: function (t) { H.showCoach(t, true); }
      };
    }
  };
  P.update = function (dt) {
    if (!S || S.state === 'done') return;
    if (S.cr && S.cr.classList.contains('cr3d') && S.cr.classList.contains('riding')) { S.phase = (S.phase || 0) + dt * 8; drawCourier(); }
    if (S.lights.length && !document.querySelector('.overlay')) lightsTick(dt);
    if (S.level === 4 && !S.autoRide && !document.querySelector('.overlay')) {
      var before = Math.floor(S.time); S.time += dt;
      if (Math.floor(S.time) !== before && !Save.data.settings.santai) updateMissionLabel();
    }
    if (S.state !== 'await' || document.querySelector('.overlay')) return;
    S.idle += dt;
    if (S.idle > 8 && !S.hintShown && !H.handOn) {
      S.hintShown = true;
      if (S.expected === 'locate') { var t = S.mission.dest.lot, g = lotGeom(t.c, t.r); H.showHandAt(g.cx, g.base - 22, 'up'); } else H.showHandBtn(S.expected);
    }
  };
  P.exit = function () { Voice.stop(); Aud.music(false); S = null; };
  window.PlayMapKit = { drawMap: drawMap, nodePos: nodePos, lotGeom: lotGeom, BH: BH, coachRects: coachRects, setMap: function (m) { MAP = m; }, getMap: function () { return MAP; } };   // dipakai scene turis.js (peta yang sama)
  Scenes.add('playmap', P);
})();



