/* Nav: arah hadap, kiri/kanan, pembangkit rute dan solver. Murni logika, bisa diuji di Node. */
(function (root) {
  // 0=Utara 1=Timur 2=Selatan 3=Barat; sumbu y turun ke bawah
  var DIRS = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }];
  var NAMES = ['north', 'east', 'south', 'west'];

  function leftOf(h) { return (h + 3) % 4; }
  function rightOf(h) { return (h + 1) % 4; }
  function turn(h, cmd) { return cmd === 'left' ? leftOf(h) : cmd === 'right' ? rightOf(h) : h; }
  function step(n, h) { return { i: n.i + DIRS[h].x, j: n.j + DIRS[h].y }; }
  function inBounds(map, n) { return n.i >= 0 && n.j >= 0 && n.i < map.cols && n.j < map.rows; }
  /* arah relatif tujuan t terhadap hadap h: straight/right/back/left */
  function relDir(h, t) { return ['straight', 'right', 'back', 'left'][(t - h + 4) % 4]; }

  /* blok di pojok simpang n; (sx,sy) = -1/+1. Blok (bi,bj) ada di antara simpang bi..bi+1, bj..bj+1 */
  function cornerBlock(n, sx, sy) { return { bi: n.i + (sx < 0 ? -1 : 0), bj: n.j + (sy < 0 ? -1 : 0) }; }
  function blockExists(map, b) { return b.bi >= 0 && b.bj >= 0 && b.bi < map.cols - 1 && b.bj < map.rows - 1; }
  /* pojok relatif ('FL','FR','BL','BR') -> blok, terhadap hadap h di simpang n */
  function relCorner(n, h, which) {
    var f = DIRS[h], l = DIRS[leftOf(h)];
    var fs = which[0] === 'F' ? 1 : -1, ls = which[1] === 'L' ? 1 : -1;
    return cornerBlock(n, fs * f.x + ls * l.x, fs * f.y + ls * l.y);
  }

  /* jalankan perintah dari (start,heading0). Mengembalikan langkah [{node,heading,cmd}] atau null bila keluar peta/ulang simpang */
  function walk(map, start, heading0, cmds) {
    var n = { i: start.i, j: start.j }, h = heading0, seen = {}, out = [];
    for (var k = 0; k < cmds.length; k++) {
      var key = n.i + ',' + n.j;
      if (!inBounds(map, n) || seen[key]) return null;
      seen[key] = true;
      out.push({ node: { i: n.i, j: n.j }, heading: h, cmd: cmds[k] });
      if (cmds[k] === 'stop') { if (k !== cmds.length - 1) return null; break; }
      h = turn(h, cmds[k]);
      n = step(n, h);
    }
    return out;
  }
  function customerCorner(map, last) {
    var opts = ['FR', 'FL'];
    for (var k = 0; k < opts.length; k++) {
      var b = relCorner(last.node, last.heading, opts[k]);
      if (blockExists(map, b)) return { bi: b.bi, bj: b.bj, side: opts[k][1] === 'L' ? 'L' : 'R', which: opts[k] };
    }
    return null;
  }
  /* bangkitkan misi: cmds (diakhiri 'stop') -> {steps, customer}. rnd = fungsi acak. */
  function buildMission(map, cmds, rnd) {
    for (var tries = 0; tries < 400; tries++) {
      var start = { i: Math.floor(rnd() * map.cols), j: Math.floor(rnd() * map.rows) };
      var h = Math.floor(rnd() * 4);
      var steps = walk(map, start, h, cmds);
      if (!steps) continue;
      var cust = customerCorner(map, steps[steps.length - 1]);
      if (!cust) continue;
      return { steps: steps, customer: cust };
    }
    return null;
  }
  /* acak perintah gerak sepanjang n yang memuat semua 'must' (mis. ['left','right']) lalu 'stop' */
  function genCommands(rnd, n, must) {
    var pool = ['straight', 'left', 'right'], c = [], k;
    for (k = 0; k < n; k++) c.push(pool[Math.floor(rnd() * 3)]);
    (must || []).forEach(function (m, idx) { c[(idx * 2 + Math.floor(rnd() * 2)) % n] = m; });
    // hindari dua belokan sama berurutan lebih dari 2 kali
    for (k = 2; k < n; k++) if (c[k] !== 'straight' && c[k] === c[k - 1] && c[k] === c[k - 2]) c[k] = 'straight';
    c.push('stop');
    return c;
  }
  /* solver: tujuan akhir dari perintah (verifikasi tunggal karena perintah deterministik) */
  function solve(map, mission) {
    var cmds = mission.steps.map(function (s) { return s.cmd; });
    var first = mission.steps[0];
    var re = walk(map, first.node, first.heading, cmds);
    if (!re) return null;
    var last = re[re.length - 1];
    return { node: last.node, heading: last.heading, customer: customerCorner(map, last) };
  }

  var Nav = {
    DIRS: DIRS, NAMES: NAMES, leftOf: leftOf, rightOf: rightOf, turn: turn, step: step, inBounds: inBounds,
    relDir: relDir, relCorner: relCorner, blockExists: blockExists, walk: walk, customerCorner: customerCorner,
    buildMission: buildMission, genCommands: genCommands, solve: solve
  };
  root.Nav = Nav;
  if (typeof module !== 'undefined') module.exports = Nav;
})(typeof window !== 'undefined' ? window : globalThis);
