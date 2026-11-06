/* Route: kalimat arahan <-> rute. Pembangkit misi (rute bertempat, mencari lokasi dengan next to / opposite / between / near),
   parser kalimat, simulasi, dan solver yang membaca KALIMAT untuk memastikan tujuan dan rute tunggal. Murni logika (bisa diuji di Node). */
(function (root) {
  var Nav = (typeof require !== 'undefined' && typeof module !== 'undefined') ? require('./nav.js') : root.Nav;
  var PLACES = ['bank', 'library', 'park', 'market', 'school', 'hospital', 'post', 'bus'];
  /* 'lights' = lampu lalu lintas: landmark simpang (map.lights), bukan tempat; hanya boleh jadi syarat belok ("Turn left at the traffic lights."), tidak untuk Stop/relasi posisi */
  var NAME = { bank: 'bank', library: 'library', park: 'park', market: 'market', school: 'school', hospital: 'hospital', post: 'post office', bus: 'bus station', lights: 'traffic lights' };
  var BYNAME = {}; PLACES.concat(['lights']).forEach(function (p) { BYNAME[NAME[p]] = p; });
  function isLight(map, node) { return !!(map.lights && map.lights.some(function (l) { return l.i === node.i && l.j === node.j; })); }
  var RELS = ['next', 'opposite', 'between', 'near'];

  /* ---------- kalimat ---------- */
  var T = {
    go: function () { return 'Go straight.'; },
    turn: function (d, p) { return 'Turn ' + d + (p ? ' at the ' + NAME[p] : '') + '.'; },
    stopAt: function (p) { return 'Stop at the ' + NAME[p] + '.'; },
    locate: function (f) {
      if (f.rel === 'next') return 'Stop next to the ' + NAME[f.refs[0]] + '.';
      if (f.rel === 'opposite') return 'Stop opposite the ' + NAME[f.refs[0]] + '.';
      if (f.rel === 'near') return 'Stop near the ' + NAME[f.refs[0]] + '.';
      return 'Stop between the ' + NAME[f.refs[0]] + ' and the ' + NAME[f.refs[1]] + '.';
    }
  };
  function place(name) { return PLACES.indexOf(BYNAME[name]) >= 0; }   // nama tempat sungguhan (bukan landmark lampu, bukan tak dikenal)
  /* teks -> struktur instruksi (sumber kebenaran adalah teks) */
  function parse(text) {
    var m;
    if (text === 'Go straight.') return { text: text, cmd: 'straight' };
    if ((m = text.match(/^Turn (left|right)(?: at the ([a-z ]+))?\.$/))) return { text: text, cmd: m[1], at: m[2] ? BYNAME[m[2]] : null };
    if ((m = text.match(/^Stop at the ([a-z ]+)\.$/))) return place(m[1]) ? { text: text, cmd: 'stop', at: BYNAME[m[1]] } : null;
    if ((m = text.match(/^Stop next to the ([a-z ]+)\.$/))) return place(m[1]) ? { text: text, cmd: 'locate', rel: 'next', refs: [BYNAME[m[1]]] } : null;
    if ((m = text.match(/^Stop opposite the ([a-z ]+)\.$/))) return place(m[1]) ? { text: text, cmd: 'locate', rel: 'opposite', refs: [BYNAME[m[1]]] } : null;
    if ((m = text.match(/^Stop near the ([a-z ]+)\.$/))) return place(m[1]) ? { text: text, cmd: 'locate', rel: 'near', refs: [BYNAME[m[1]]] } : null;
    if ((m = text.match(/^Stop between the ([a-z ]+) and the ([a-z ]+)\.$/))) return place(m[1]) && place(m[2]) ? { text: text, cmd: 'locate', rel: 'between', refs: [BYNAME[m[1]], BYNAME[m[2]]] } : null;
    return null;
  }

  /* ---------- peta: blok dan petak ---------- */
  function blockPlaces(map, b) {
    if (!Nav.blockExists(map, b)) return [];
    if (map.type === 'rot') { var k = map.blocks[b.bj][b.bi]; return PLACES.indexOf(k) >= 0 ? [k] : []; }
    return [map.lots[b.bj][2 * b.bi], map.lots[b.bj][2 * b.bi + 1]].filter(function (x) { return PLACES.indexOf(x) >= 0; });
  }
  function placesOnMap(map) {
    var out = [], bi, bj;
    for (bj = 0; bj < map.rows - 1; bj++) for (bi = 0; bi < map.cols - 1; bi++)
      blockPlaces(map, { bi: bi, bj: bj }).forEach(function (p) { out.push(p); });
    return out;
  }
  function lotAt(map, c, r) { return (map.lots[r] && map.lots[r][c] !== undefined) ? map.lots[r][c] : undefined; }
  function lotsOf(map) {
    var out = [], r, c;
    for (r = 0; r < map.lots.length; r++) for (c = 0; c < map.lots[r].length; c++) out.push({ c: c, r: r, v: map.lots[r][c] });
    return out;
  }
  function nonEmpty(v) { return v !== undefined && v !== '.'; }
  function lotBlock(l) { return { bi: Math.floor(l.c / 2), bj: l.r }; }
  function placeLot(map, p) { var a = lotsOf(map).filter(function (l) { return l.v === p; }); return a[0] || null; }

  /* kandidat petak menurut relasi terhadap petak (c,r) */
  function candidates(map, rel, c, r) {
    var ncols = map.lots[0].length, arr = [], dc, dr;
    if (rel === 'next') arr.push({ c: c % 2 === 0 ? c + 1 : c - 1, r: r });
    else if (rel === 'opposite') {
      if (c % 2 === 0) { if (c - 1 >= 0) arr.push({ c: c - 1, r: r }); } else if (c + 1 < ncols) arr.push({ c: c + 1, r: r });
      arr.push({ c: c, r: r - 1 }, { c: c, r: r + 1 });
    } else if (rel === 'near') {
      for (dr = -1; dr <= 1; dr++) for (dc = -1; dc <= 1; dc++) if (dc || dr) arr.push({ c: c + dc, r: r + dr });
    }
    return arr.filter(function (a) { return nonEmpty(lotAt(map, a.c, a.r)); }).map(function (a) { return { c: a.c, r: a.r, v: lotAt(map, a.c, a.r) }; });
  }
  /* petak target menurut kalimat lokasi (parsed). Hasil harus tepat 1 rumah polos agar tunggal. */
  function locateTargets(map, ins) {
    var l;
    if (ins.rel === 'between') {
      var a = placeLot(map, ins.refs[0]), b = placeLot(map, ins.refs[1]);
      if (!a || !b || a.r !== b.r || Math.abs(a.c - b.c) !== 2) return [];
      var mid = lotAt(map, (a.c + b.c) / 2, a.r);
      return nonEmpty(mid) ? [{ c: (a.c + b.c) / 2, r: a.r, v: mid }] : [];
    }
    l = placeLot(map, ins.refs[0]);
    return l ? candidates(map, ins.rel, l.c, l.r) : [];
  }
  /* semua fakta relasi yang tunggal dan bertarget rumah polos */
  function facts(map) {
    var out = [];
    PLACES.forEach(function (p) {
      var l = placeLot(map, p); if (!l) return;
      ['next', 'opposite', 'near'].forEach(function (rel) {
        var f = { rel: rel, refs: [p] }, t = locateTargets(map, parse(T.locate(f)));
        if (t.length === 1 && t[0].v === 'h') { f.target = t[0]; out.push(f); }
      });
    });
    lotsOf(map).forEach(function (l) {
      if (l.v !== 'h') return;
      var a = lotAt(map, l.c - 1, l.r), b = lotAt(map, l.c + 1, l.r);
      if (PLACES.indexOf(a) >= 0 && PLACES.indexOf(b) >= 0) out.push({ rel: 'between', refs: [a, b], target: { c: l.c, r: l.r, v: 'h' } });
    });
    return out;
  }
  function blockCorners(b) { return [{ i: b.bi, j: b.bj }, { i: b.bi + 1, j: b.bj }, { i: b.bi, j: b.bj + 1 }, { i: b.bi + 1, j: b.bj + 1 }]; }
  function adjacentToBlock(node, b) { return blockCorners(b).some(function (n) { return n.i === node.i && n.j === node.j; }); }

  /* ---------- aturan landmark ---------- */
  function cornerNames(map) { return map.type === 'rot' ? ['FL', 'FR'] : ['FL', 'FR', 'BL', 'BR']; }
  function atLandmark(map, node, h, place) {
    if (place === 'lights') return isLight(map, node);
    return cornerNames(map).some(function (w) { return blockPlaces(map, Nav.relCorner(node, h, w)).indexOf(place) >= 0; });
  }
  /* sisi (L/R) tempat berdiri landmark di sudut depan simpang (peta berputar) */
  function frontSide(map, node, h, place) {
    var ws = ['FL', 'FR'];
    for (var k = 0; k < 2; k++) if (blockPlaces(map, Nav.relCorner(node, h, ws[k])).indexOf(place) >= 0) return ws[k][1];
    return null;
  }

  /* ---------- simulasi ---------- */
  /* instrs: hasil parse. Mengembalikan {decisions:[{node,heading,expected,instr,at?}], end:{node,heading}} atau null */
  function simulate(map, start, h0, instrs) {
    var n = { i: start.i, j: start.j }, h = h0, i = 0, seen = {}, dec = [], guard = 0;
    while (guard++ < 40) {
      var key = n.i + ',' + n.j;
      if (!Nav.inBounds(map, n) || seen[key]) return null;
      seen[key] = true;
      var ins = instrs[i], exp;
      if (!ins) return null;
      if (ins.cmd === 'locate') {
        dec.push({ node: { i: n.i, j: n.j }, heading: h, expected: 'locate', instr: i });
        return { decisions: dec, end: { node: { i: n.i, j: n.j }, heading: h } };
      }
      if (ins.at) exp = atLandmark(map, n, h, ins.at) ? ins.cmd : 'straight';
      else exp = ins.cmd;
      var d = { node: { i: n.i, j: n.j }, heading: h, expected: exp, instr: i };
      if (ins.at && exp === ins.cmd) d.atLandmark = ins.at;
      dec.push(d);
      if (exp === 'stop') return { decisions: dec, end: { node: { i: n.i, j: n.j }, heading: h } };
      var consumed = !ins.at || exp === ins.cmd;
      h = Nav.turn(h, exp); n = Nav.step(n, h);
      if (consumed) i++;
    }
    return null;
  }

  function mk(map, start, h0, texts) {
    var instrs = texts.map(parse), sim = simulate(map, start, h0, instrs);
    if (!sim) return null;
    var m = { start: start, heading: h0, sentences: texts, text: texts.join(' '), instrs: instrs, decisions: sim.decisions, end: sim.end, kind: instrs[instrs.length - 1].cmd === 'locate' ? 'locate' : 'route' };
    return m;
  }
  function randStart(map, rnd) { return { i: Math.floor(rnd() * map.cols), j: Math.floor(rnd() * map.rows) }; }

  /* misi rute bertempat. kind: 'A' stop at P | 'B' turn at P1, stop at P2 | 'C' go straight, turn at P1, stop at P2 */
  function genRoute(map, rnd, kind, o) {
    o = o || {};
    var pl = placesOnMap(map);
    for (var t = 0; t < 4000; t++) {
      var start = o.start || randStart(map, rnd), h = o.heading != null ? o.heading : Math.floor(rnd() * 4);
      var p1 = pl[Math.floor(rnd() * pl.length)], p2 = pl[Math.floor(rnd() * pl.length)];
      /* landmark belok: lampu lalu lintas bila peta punya (o.lights = wajib; selain itu kadang-kadang) */
      if (kind !== 'A' && map.lights && map.lights.length && (o.lights || (o.lights !== false && rnd() < 0.3))) p1 = 'lights';
      else if (o.lights) continue;
      if (p1 === p2) continue;
      var d = rnd() < 0.5 ? 'left' : 'right', texts;
      if (kind === 'A') texts = [T.stopAt(p2)];
      else if (kind === 'B') texts = [T.turn(d, p1), T.stopAt(p2)];
      else texts = [T.go(), T.turn(d, p1), T.stopAt(p2)];
      var m = mk(map, start, h, texts);
      if (!m) continue;
      var n = m.decisions.length;
      if (n < (o.min || 2) || n > (o.max || 7)) continue;
      m.dest = destOf(map, m);
      if (!m.dest) continue;
      return m;
    }
    return null;
  }
  function destOf(map, m) {
    var last = m.instrs[m.instrs.length - 1];
    if (last.cmd !== 'stop') return null;
    var e = m.end;
    if (map.type === 'rot') { var side = frontSide(map, e.node, e.heading, last.at); return side ? { place: last.at, side: side } : null; }
    var l = placeLot(map, last.at);
    return l ? { place: last.at, lot: { c: l.c, r: l.r } } : null;
  }

  /* misi lokasi: nMoves perintah polos lalu 'Stop <relasi> ...' ke rumah polos yang menempel pada simpang akhir */
  function genLocate(map, rnd, rel, nMoves, o) {
    o = o || {};
    var fs = facts(map).filter(function (f) { return !rel || f.rel === rel; });
    for (var t = 0; t < 4000; t++) {
      var start = o.start || randStart(map, rnd), h = o.heading != null ? o.heading : Math.floor(rnd() * 4);
      var cmds = Nav.genCommands(rnd, nMoves, null).slice(0, nMoves);
      var steps = Nav.walk(map, start, h, cmds.concat(['stop']));
      if (!steps) continue;
      var last = steps[steps.length - 1];
      var okf = fs.filter(function (f) { return adjacentToBlock(last.node, lotBlock(f.target)); });
      if (!okf.length) continue;
      var f = okf[Math.floor(rnd() * okf.length)];
      var texts = cmds.map(function (c) { return c === 'straight' ? T.go() : T.turn(c, null); }).concat([T.locate(f)]);
      var m = mk(map, start, h, texts);
      if (!m) continue;
      m.dest = { rel: f.rel, lot: { c: f.target.c, r: f.target.r } };
      return m;
    }
    return null;
  }

  /* solver: membaca KALIMAT, memastikan rute tunggal dan tujuan sama dengan klaim misi */
  function solve(map, m) {
    var instrs = m.sentences.map(parse);
    if (instrs.some(function (x) { return !x; })) return { ok: false, why: 'kalimat tidak terurai' };
    var sim = simulate(map, m.start, m.heading, instrs);
    if (!sim) return { ok: false, why: 'rute tidak valid' };
    var last = instrs[instrs.length - 1];
    if (last.cmd === 'locate') {
      var tg = locateTargets(map, last);
      if (tg.length !== 1 || tg[0].v !== 'h') return { ok: false, why: 'target tidak tunggal' };
      if (!adjacentToBlock(sim.end.node, lotBlock(tg[0]))) return { ok: false, why: 'target tidak menempel simpang akhir' };
      return { ok: true, sim: sim, lot: { c: tg[0].c, r: tg[0].r } };
    }
    return { ok: true, sim: sim, dest: destOf(map, { instrs: instrs, end: sim.end }) };
  }

  /* ---------- L5 Turis Tersesat: peran terbalik ----------
     Turis berdiri di sebuah simpang menghadap arah tertentu dan menanyakan satu tempat. Murid memilih 1 dari 3 arahan (1-2 kalimat).
     Tepat satu arahan sampai di tempat itu (diperiksa solver); dua lainnya salah dengan jenis kesalahan nyata:
       'lr'   = kiri/kanan tertukar, 'mark' = landmark belokan salah (tempat lain atau lampu lalu lintas). */
  function ask(p) { return 'How do I get to the ' + NAME[p] + '?'; }
  function askSentences(map) { return placesOnMap(map).map(ask); }
  function reaches(map, texts, start, h, target) {
    var m = { sentences: texts, start: start, heading: h }, r = solve(map, m);
    return !!(r.ok && r.dest && r.dest.lot && r.dest.lot.c === target.lot.c && r.dest.lot.r === target.lot.r);
  }
  function genTourist(map, rnd, o) {
    o = o || {};
    for (var t = 0; t < 3000; t++) {
      var m = genRoute(map, rnd, 'B', { start: o.start, lights: o.lights, min: 3, max: 6 });
      if (!m || !m.dest) continue;
      var turn = m.instrs[0], stop = m.instrs[1], p1 = turn.at, flip = turn.cmd === 'left' ? 'right' : 'left';
      var lr = [T.turn(flip, p1), m.sentences[1]];
      var marks = placesOnMap(map).concat(map.lights && map.lights.length ? ['lights'] : []).filter(function (p) { return p !== p1 && p !== stop.at; });
      var mk2 = [];
      marks.forEach(function (p) { mk2.push([T.turn(turn.cmd, p), m.sentences[1]]); });
      mk2 = mk2.filter(function (x) { return !reaches(map, x, m.start, m.heading, m.dest); });
      if (reaches(map, lr, m.start, m.heading, m.dest) || !mk2.length) continue;
      var pick = mk2[Math.floor(rnd() * mk2.length)];
      var opts = [{ texts: m.sentences.slice(), ok: true, err: null }, { texts: lr, ok: false, err: 'lr' }, { texts: pick, ok: false, err: 'mark' }];
      for (var i = opts.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)), x = opts[i]; opts[i] = opts[j]; opts[j] = x; }
      return { start: m.start, heading: m.heading, target: m.dest, route: m, options: opts, question: ask(stop.at) };
    }
    return null;
  }

  /* semua kalimat yang mungkin (untuk naskah_audio.csv) */
  function allSentences(map) {
    var out = [T.go(), T.turn('left'), T.turn('right')];
    var pl = placesOnMap(map);
    pl.forEach(function (p) { out.push(T.turn('left', p), T.turn('right', p), T.stopAt(p)); });
    if (map.lights && map.lights.length) out.push(T.turn('left', 'lights'), T.turn('right', 'lights'));
    return out;
  }

  var Route = {
    PLACES: PLACES, NAME: NAME, RELS: RELS, T: T, parse: parse, blockPlaces: blockPlaces, placesOnMap: placesOnMap,
    lotAt: lotAt, lotsOf: lotsOf, placeLot: placeLot, lotBlock: lotBlock, candidates: candidates, locateTargets: locateTargets,
    facts: facts, adjacentToBlock: adjacentToBlock, atLandmark: atLandmark, isLight: isLight, frontSide: frontSide, simulate: simulate,
    genRoute: genRoute, genLocate: genLocate, solve: solve, allSentences: allSentences, genTourist: genTourist, reaches: reaches, ask: ask, askSentences: askSentences, nonEmpty: nonEmpty
  };
  root.Route = Route;
  if (typeof module !== 'undefined') module.exports = Route;
})(typeof window !== 'undefined' ? window : globalThis);
