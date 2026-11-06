/* Scene Buku Kurir: stempel per kata yang dikuasai, dikelompokkan Arah / Tempat / Posisi */
(function () {
  var C = Art.C, B = {};
  function stamp(g, on) {
    var col = on ? C.red : '#B8BDD0';
    return '<g><circle r="62" fill="' + C.cream + '"' + Art.st() + '/><circle r="52" fill="none" stroke="' + col + '" stroke-width="4" stroke-dasharray="8 6"/>' +
      (on ? Art.stampIcon(g) : '<text y="16" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="52" fill="#B8BDD0">?</text>') +
      '<text y="108" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="26" fill="' + (on ? C.ink : C.slate) + '">' + g.en + '</text></g>';
  }
  B.enter = function (root) {
    var svg = UI.svgLayer(root);
    UI.g(svg, '<rect width="1280" height="720" fill="#FDE9B8"/><rect x="60" y="30" width="1160" height="570" rx="36" fill="#C98B4B"' + Art.st(6) + '/>' +
      '<rect x="84" y="50" width="1112" height="530" rx="26" fill="' + C.cream + '"' + Art.st(4) + '/><path d="M640 54 V576" stroke="#E8D9B0" stroke-width="6"/>');
    var t = U.h('div', 'txt', STR.book.title); t.classList.add('bk-title');
    root.appendChild(t);
    var sub = U.h('div', 'txt', STR.book.sub); sub.classList.add('bk-sub');
    root.appendChild(sub);
    var total = 0, have = 0;
    SENT.gloss.forEach(function (g) { total++; if (Save.data.stamps[g.id]) have++; });
    var cnt = U.h('div', 'txt', have + ' / ' + total); cnt.classList.add('bk-cnt');
    root.appendChild(cnt);
    var stampsG = UI.g(svg, ''), kinds = ['dir', 'place', 'pos', 'traffic'], tabs = {}, token = 0, empty = U.h('div', 'txt', STR.book.empty);
    empty.classList.add('bk-empty'); root.appendChild(empty);
    function show(kind) {
      var my = ++token; stampsG.innerHTML = '';
      kinds.forEach(function (k) { tabs[k].classList.toggle('glow', false); tabs[k].setAttribute('aria-pressed', k === kind ? 'true' : 'false'); tabs[k].style.opacity = k === kind ? 1 : .75; });
      var list = SENT.gloss.filter(function (g) { return g.kind === kind; }), per = list.length > 4 ? 4 : list.length;
      list.forEach(function (g, i) {
        var on = !!Save.data.stamps[g.id], col = i % 4, row = Math.floor(i / 4);
        var sc = list.length > 4 ? 0.8 : 1, x = 200 + col * 290, y = (list.length > 4 ? 290 : 340) + row * (list.length > 4 ? 150 : 190);   // baris pertama di bawah deretan tab
        var el = UI.g(stampsG, stamp(g, on), 'translate(' + x + ',' + y + ') scale(0) rotate(-8)');
        Tween.wait(90 * i).then(function () {
          if (my !== token) return;
          if (on) Aud.sfx('stamp');
          return Tween.value(0, 1, 340, Ease.easeOutBack, function (v) { el.setAttribute('transform', 'translate(' + x + ',' + y + ') scale(' + (v * sc) + ') rotate(-8)'); });
        });
      });
      empty.style.display = have ? 'none' : 'block';
    }
    kinds.forEach(function (k, i) {
      tabs[k] = Input.button(STR.gloss.tabs[k], 'sky small', function () { show(k); }, { x: 230 + i * 220, y: 156, w: 200, h: 64, id: 'tab' + k });
      root.appendChild(tabs[k]);
    });
    var back = Input.button(STR.btn.back, 'red', function () { Scenes.go('title'); }, { x: 490, y: 622, w: 300, h: 76, id: 'back' });
    root.appendChild(back); back.focus();
    show('dir');
    if (U.TEST) window.__test = { scene: function () { return Scenes.name; }, stamps: Save.data.stamps };
  };
  B.exit = function () { };
  Scenes.add('book', B);
})();


