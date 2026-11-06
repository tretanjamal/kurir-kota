/* Portrait: potret kurir dan pelanggan (gambar dari js/data/assets.js, cadangan SVG bila belum ada).
   Potret ditempelkan di tepi ATAS panel dengan dasarnya tersembunyi di belakang panel (lihat .has-portrait di CSS).
   Animasi sederhana lewat transformasi: bernapas + bergoyang (CSS), melompat kecil saat senang (Tween). */
(function (root) {
  var EXPR = { courier: ['call', 'cheer', 'think'], cust: ['idle', 'happy', 'confused'] };
  var HAPPY = { call: 0, cheer: 1, think: 0, idle: 0, happy: 1, confused: 0 };
  /* jenis SVG pelanggan (Art.PEOPLE) yang paling mirip tiap potret c1..c6: nenek, anak, ibu, anak, ibu, kakek */
  var KIND = [1, 0, 2, 0, 2, 1];
  function key(kind, id, expr) { return kind === 'courier' ? 'char_courier_' + expr : 'char_c' + id + '_' + expr; }

  /* cadangan SVG lama */
  function fallback(kind, id, expr) {
    if (kind === 'courier') {
      var ex = expr === 'cheer' ? 'cheer' : expr === 'think' ? 'confused' : 'happy';
      return { w: 120, h: 100, html: '<svg viewBox="-60 -80 120 100" width="100%" height="100%">' + Art.courier('front', ex) + '</svg>' };
    }
    var p = Art.PEOPLE[KIND[(id - 1) % 6]];
    return { w: 84, h: 135, html: '<svg viewBox="-42 -125 84 135" width="100%" height="100%">' + Art.person(p, expr === 'happy') + '</svg>' };
  }

  var P = {
    COUNT: 6,
    KIND: KIND,
    EXPR: EXPR,
    /* indeks pelanggan 1..6 untuk misi ke-m (berputar) */
    custFor: function (m) { return (((m | 0) % 6) + 6) % 6 + 1; },
    personFor: function (id) { return Art.PEOPLE[KIND[(id - 1) % 6]]; },
    /* buat potret setinggi h px. Kembalian: {el, set(expr), hop(), expr}. Posisi diatur oleh pemanggil / P.attach. */
    make: function (kind, id, expr, h) {
      var list = EXPR[kind], frames = {}, aw = 1, ah = 1;
      var rootEl = U.h('div', 'portrait'), mid = U.h('div', 'pm'), inner = U.h('div', 'pi');
      list.forEach(function (e) {
        var k = key(kind, id, e), f = document.createElement('div');
        f.className = 'pf'; f.dataset.e = e;
        if (Assets.has(k)) {
          var a = root.ASSETS.list[k]; aw = a.w; ah = a.h;
          f.innerHTML = '<img alt="" draggable="false" src="' + root.ASSETS.dir + a.file + '">';
        } else { var fb = fallback(kind, id, e); aw = fb.w; ah = fb.h; f.innerHTML = fb.html; }
        frames[e] = f; inner.appendChild(f);
      });
      rootEl.style.height = h + 'px'; rootEl.style.width = Math.round(h * aw / ah) + 'px';
      mid.appendChild(inner); rootEl.appendChild(mid);
      mid.style.animationDelay = '-' + (Math.random() * 4).toFixed(2) + 's'; inner.style.animationDelay = '-' + (Math.random() * 3).toFixed(2) + 's';
      var A = { el: rootEl, expr: null, w: Math.round(h * aw / ah), h: h };
      A.set = function (e) {
        if (!frames[e]) e = list[0];
        for (var k in frames) frames[k].style.display = k === e ? 'block' : 'none';
        var was = A.expr; A.expr = e;
        if (was !== e && HAPPY[e]) A.hop();
      };
      A.hop = function () {
        if (A.hopping) return; A.hopping = true;
        Tween.value(0, 1, 460, Ease.easeInOutCubic, function (v) {
          var s = Math.sin(v * Math.PI);
          rootEl.style.transform = 'translateY(' + (-18 * s).toFixed(1) + 'px) scale(' + (1 - 0.03 * s).toFixed(3) + ',' + (1 + 0.05 * s).toFixed(3) + ')';
        }).then(function () { rootEl.style.transform = ''; A.hopping = false; });
      };
      A.set(expr || list[0]);
      return A;
    },
    /* tempelkan potret di tepi atas panel; dasarnya (overlap px) tersembunyi di belakang panel */
    attach: function (panel, kind, id, expr, h, opt) {
      opt = opt || {};
      var A = P.make(kind, id, expr, h);
      panel.classList.add('has-portrait');
      A.el.style.left = (opt.left == null ? 16 : opt.left) + 'px';
      if (opt.right != null) { A.el.style.left = 'auto'; A.el.style.right = opt.right + 'px'; }
      A.el.style.bottom = 'calc(100% - ' + (opt.overlap == null ? 14 : opt.overlap) + 'px)';
      panel.insertBefore(A.el, panel.firstChild);
      return A;
    }
  };
  root.Portrait = P;
})(window);
