/* Scene Hasil: bintang satu per satu, keterampilan dikuasai, Catatan Kurir */
(function () {
  var C = Art.C, R = {};
  function gl(id) { return SENT.gloss.filter(function (g) { return g.id === id; })[0]; }
  R.enter = function (root, p) {
    var level = p.level || 1;
    var svg = UI.svgLayer(root);
    UI.g(svg, '<defs><linearGradient id="rsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6EC6EA"/><stop offset="1" stop-color="#FDE9B8"/></linearGradient></defs><rect width="1280" height="720" fill="url(#rsky)"/>' +
      '<g class="drift" style="animation-delay:-20s">' + Art.cloud(0, 70, 1) + '</g><g class="drift" style="animation-delay:-55s;animation-duration:90s">' + Art.cloud(0, 150, .8) + '</g>');
    var t = U.h('div', 'txt', STR.result.title);
    t.classList.add('r-title');
    root.appendChild(t);
    var stars = [];
    for (var i = 0; i < 3; i++) {
      var on = i < p.stars;
      stars.push({ g: UI.g(svg, Art.starShape(54, on ? C.sun : '#D6D8E4'), 'translate(' + (500 + i * 140) + ',184) scale(0)'), on: on, x: 500 + i * 140 });
    }
    var coin = U.h('div', 'pill r-coin');
    coin.innerHTML = '<svg class="r-coin-ico" viewBox="-16 -16 32 32" width="34" height="34"><circle r="13" fill="' + C.sun + '"' + Art.st(3) + '/><text y="6" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="16" fill="' + C.ink + '">$</text></svg><span id="rc">0</span>';
    root.appendChild(coin);
    var sub = U.h('div', 'txt', STR.levels.names[level - 1] + (p.time ? '  •  ' + STR.result.time(p.time) : '') + '  •  ' + STR.result.msg[Math.max(0, Math.min(3, p.stars))]);
    sub.classList.add('r-sub');
    root.appendChild(sub);

    var order = SENT.gloss.map(function (g) { return g.id; });
    var ids = Object.keys(p.run).sort(function (a, b) { return order.indexOf(a) - order.indexOf(b); });
    // kiri: keterampilan dikuasai
    var L = U.h('div', 'panel r-skills');
    L.innerHTML = '<div class="r-h">' + STR.result.skills + '</div>';
    var focus = [null, 'dir', 'place', 'pos', 'pos', 'dir'][level];   // jenis keterampilan inti level ini tampil lebih dulu
    function inFocus(k) { var g = gl(k); return g && g.kind === focus ? 0 : 1; }
    ids.sort(function (x, y) { return inFocus(x) - inFocus(y); });   // sort stabil: urutan glosarium tetap di dalam kelompok
    var mastered = ids.filter(function (k) { return p.run[k].first > 0 && gl(k); });
    if (!mastered.length) L.innerHTML += '<div class="r-none">' + STR.result.none + '</div>';
    (level === 5 ? mastered.slice(0, 1) : mastered.slice(0, 4)).forEach(function (k) {
      var g = gl(k), row = U.h('div', 'r-row');
      row.innerHTML = '<svg viewBox="-34 -34 68 68" width="50" height="50">' + Art.wordBadge(g, 30) + '</svg><span>' + (level === 5 ? STR.turis.kidSkill : STR.skillKid(g)) + '</span>';
      L.appendChild(row);
    });
    if (level !== 5 && mastered.length > 4) { var mo = U.h('div', 'r-more', STR.result.more(mastered.length - 4)); L.appendChild(mo); }
    root.appendChild(L);
    // potret: kurir menempel di tepi atas panel kiri, pelanggan di panel catatan (dasar tertutup panel)
    var ce = p.stars >= 3 ? 'cheer' : p.stars === 2 ? 'call' : 'think', cid = Portrait.custFor((level - 1) * 2 + (p.stars | 0));
    var pc = Portrait.attach(L, 'courier', 0, 'call', 176, { left: 40, overlap: 16 });
    // kanan: catatan kurir untuk pemain (tanpa data pribadi); guru tetap bisa membaca tabelnya
    var T = U.h('div', 'panel r-teach');
    var STC = { good: '#1FA89B', ok: '#FFC93C', practice: '#EF5B4B' };
    function statusOf(first, ok, wrong) { return wrong === 0 && first === ok ? 'good' : wrong <= 1 ? 'ok' : 'practice'; }
    var sum = [STR.teacher.sumTitle, STR.teacher.sumLevel(STR.levels.names[level - 1], p.stars)];
    var anyPractice = false;
    function row(name, first, ok, wrong) {
      var s = statusOf(first, ok, wrong), word = STR.teacher.status[s];
      if (s === 'practice') anyPractice = true;
      sum.push(STR.teacher.sumRow(name, first, ok, word));
      return '<tr><td>' + name + '</td><td class="c">' + first + ' / ' + ok + '</td><td class="c"><span class="dot" style="background:' + STC[s] + '"></span>' + word + '</td></tr>';
    }
    ids = ids.slice().sort(function (x, y) { return p.run[y].wrong - p.run[x].wrong; });   // keterampilan yang perlu latihan tampil sendiri, bukan tercampur di "Lainnya"
    var shown = ids.slice(0, 3), rest = ids.slice(3), rows = '';
    if (level === 5) {   // peran terbalik: ringkas jadi "memilih arahan" dan "kiri/kanan" (bukan menyimak per kata)
      var ta = { first: 0, ok: 0, wrong: 0 }, tl = { first: 0, ok: 0, wrong: 0 };
      ids.forEach(function (k) { var t = (k === 'left' || k === 'right') ? tl : ta; t.first += p.run[k].first; t.ok += p.run[k].ok; t.wrong += p.run[k].wrong; });
      rows += row(STR.turis.skill, ta.first + tl.first, ta.ok + tl.ok, ta.wrong + tl.wrong);
      if (tl.ok + tl.wrong) rows += row(STR.turis.skillLR, tl.first, tl.ok, tl.wrong);
      shown = []; rest = [];
    }
    rows += shown.map(function (k) {
      var r = p.run[k], g = gl(k);
      return row(g ? STR.teacher.skillName(g) : k, r.first, r.ok, r.wrong);
    }).join('');
    if (rest.length) {
      var a = 0, b = 0, c = 0; rest.forEach(function (k) { a += p.run[k].first; b += p.run[k].ok; c += p.run[k].wrong; });
      rows += row(STR.teacher.other + ' (' + rest.length + ')', a, b, c);
    }
    function wrongOf(list) { return list.reduce(function (s, k) { return s + ((p.run[k] || {}).wrong || 0); }, 0); }
    var places = Route.PLACES, pos = Route.RELS;
    var tip = wrongOf(['left', 'right']) >= 2 ? STR.teacher.lrTip : wrongOf(places) >= 2 ? STR.teacher.placeTip : wrongOf(pos) >= 2 ? STR.teacher.posTip : wrongOf(['straight', 'stop']) >= 2 ? STR.teacher.dirTip : (p.red >= 1 ? STR.teacher.lightTip(p.red) : p.run.tertib ? STR.teacher.lightOk : anyPractice ? STR.teacher.mixTip : (level >= 5 ? STR.teacher.okTipLast : STR.teacher.okTip));
    tip += Save.data.settings.santai ? ' ' + STR.teacher.santaiNote : '';
    if (p.run.lights || p.run.tl_stop || p.run.tl_go) sum.push(STR.teacher.lightIntro);
    sum.push(tip);
    T.innerHTML = '<div class="t-h">' + STR.result.teacher + '</div>' +
      '<div class="t-intro">' + STR.teacher.intro[level - 1] + '</div>' +
      '<table class="t-table"><tr class="t-head"><th>' + STR.teacher.col[0] + '</th><th>' + STR.teacher.col[1] + '</th><th>' + STR.teacher.col[2] + '</th></tr>' + rows + '</table>' +
      '<div class="t-tip">' + tip + '</div>';
    var cp = Input.button(STR.result.copy, 'sky small', function () {
      var text = sum.join('\n');
      function done() { cp.querySelector('.lbl').textContent = STR.result.copied; }
      try { navigator.clipboard.writeText(text).then(done, fb); } catch (e) { fb(); }
      function fb() {
        var ta = document.createElement('textarea'); ta.value = text; ta.className = 'r-offscreen';
        document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); done(); } catch (e) { } ta.remove();
      }
    }, { x: 392, y: 4, w: 192, h: 48, id: 'copy' });
    T.appendChild(cp);
    root.appendChild(T);
    var pu = Portrait.attach(T, 'cust', cid, 'idle', 176, { right: 44, overlap: 18 });

    // tombol
    var btns = [];
    if (level < LV.length) btns.push(['next', STR.btn.next, 'sun', function () { LV.start(level + 1); }]);
    btns.push(['again', STR.btn.again, 'teal', function () { LV.start(level); }]);
    btns.push(['levels', STR.btn.levels, 'sky', function () { Scenes.go('levels'); }]);
    btns.push(['home', STR.btn.home, 'red', function () { Scenes.go('title'); }]);
    var w = 290, gap = 24, total = btns.length * w + (btns.length - 1) * gap, x0 = (1280 - total) / 2;
    btns.forEach(function (b, i) { root.appendChild(Input.button(b[1], b[2], b[3], { x: x0 + i * (w + gap), y: 622, w: w, h: 76, id: b[0] })); });
    var f = root.querySelector('.btn'); if (f) f.focus();

    (async function () {
      await Tween.wait(350);
      pc.set(ce);
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        Aud.sfx(s.on ? 'star' : 'empty', i);
        if (s.on) UI.burst(svg, s.x, 184, 8);
        await Tween.value(0, 1, 380, Ease.easeOutBack, function (v) { s.g.setAttribute('transform', 'translate(' + s.x + ',184) scale(' + v + ')'); });
        await Tween.wait(160);
      }
      var tk = 0;
      Tween.run(900, function (e) { var n = Math.floor(e * 14); if (n > tk) { tk = n; Aud.sfx('tick'); } }, Ease.easeOutCubic);
      await UI.countUp(document.getElementById('rc'), 0, p.coins, 900);
      Aud.sfx('fanfare', p.stars);
      pu.set(p.stars >= 2 ? 'happy' : 'idle');
      await Tween.wait(700);
      if (p.stars >= 3) Voice.say('Great job!', { rate: 0.9 });
      Aud.music(true, 'calm');
    })();
    if (U.TEST) window.__test = { scene: function () { return Scenes.name; }, stars: p.stars, result: p, level: level };
  };
  R.exit = function () { Voice.stop(); };
  Scenes.add('result', R);
})();

