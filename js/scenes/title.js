/* Scene Judul: latar + empat bangunan yang muncul memantul, logo turun memantul, kurir pahlawan melaju di jalan dengan balon "Go straight!", tombol GO! berdenyut.
   Tombol ikon (suara, layar penuh, pengaturan) di pojok kanan atas; Buku Kurir di kiri bawah. Cadangan: latar/bangunan SVG lama bila gambar tidak termuat. */
(function () {
  var C = Art.C, T = {};
  var GROUND = 704, SPEED = 150;      // garis tapak roda kurir di jalan (px panggung), kecepatan laju (px/dtk)
  var BKEYS = ['title_b1', 'title_b2', 'title_b3', 'title_b4'];

  /* kurir pahlawan: gambar (title_hero), cadangan arah E dari 8 arah peta, lalu SVG lama. Ukuran dari config/skala.js (judul.hero). */
  function heroSpec() {
    var L = ASSETS.list, H = SKALA.VIEW.judul.hero;
    if (Assets.has('title_hero')) {
      var a = L.title_hero, k = H / a.h, w = a.w * k;
      return { svg: '<image href="' + ASSETS.dir + a.file + '" x="' + (-a.px * k) + '" y="' + (-a.py * k) + '" width="' + w + '" height="' + H + '"/>', w: w, h: H, headX: (0.46 * a.w - a.px) * k - 6, rx: w * 0.28 };
    }
    if (Assets.has('courierD')) {
      var d = L.courierD, kk = H / d.ch, ww = d.w * kk;
      return { svg: '<image href="' + ASSETS.dir + d.files.e + '" x="' + (-d.px * kk) + '" y="' + (-d.py * kk) + '" width="' + ww + '" height="' + (d.h * kk) + '"/>', w: ww, h: H, headX: ww * 0.1, rx: ww * 0.3 };
    }
    return { svg: '<g transform="translate(0,-60) scale(.8)">' + Art.courier('back', 'happy') + '</g>', w: 150, h: 220, headX: 0, rx: 50 };
  }

  T.enter = function (root) {
    Art.view = 'judul';
    var reduce = !!Save.data.settings.reduce;
    var svg = UI.svgLayer(root);
    var imgBg = Assets.has('title_bg') && BKEYS.every(Assets.has), legacyImg = Assets.has('bg_title');
    var g = '', blds = [];
    if (imgBg) g += Assets.image('title_bg', 0, 0, 1280, 720);
    else if (legacyImg) g += Assets.image('bg_title', 0, 0, 1280, 720);
    else {
      g += '<defs><linearGradient id="tsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6EC6EA"/><stop offset="1" stop-color="#FDE9B8"/></linearGradient></defs>';
      g += '<rect width="1280" height="720" fill="url(#tsky)"/><circle cx="1110" cy="150" r="56" fill="' + C.sun + '"' + Art.st() + '/>';
    }
    g += '<g class="drift" style="animation-delay:-8s">' + Art.cloud(0, 150, 1.3) + '</g><g class="drift" style="animation-delay:-40s;animation-duration:90s">' + Art.cloud(0, 330, 1) + '</g><g class="drift" style="animation-delay:-60s;animation-duration:80s">' + Art.cloud(0, 90, .8) + '</g>';
    g += '<g class="fly" style="animation-delay:-5s">' + Art.bird(0, 270) + '</g><g class="fly" style="animation-delay:-9s">' + Art.bird(50, 290) + '</g>';
    if (!imgBg && !legacyImg) {
      g += '<path d="M0 480 Q200 400 420 460 T820 450 T1280 440 V720 H0Z" fill="#8FD07C"' + Art.st() + '/>';
      g += '<rect x="0" y="600" width="1280" height="120" fill="' + C.road + '"' + Art.st() + '/><path d="M0 660 H1280" stroke="#FFF4DC" stroke-width="6" stroke-dasharray="46 34"/>';
      g += '<rect x="0" y="560" width="1280" height="44" fill="#E8D9B0"' + Art.st() + '/>';
      g += Art.building(60, 560, 120, 160, 40, '#F4A261', C.red, 'bank') + Art.building(210, 560, 110, 210, 36, '#F7F3E3', C.teal, 'hospital');
      g += Art.building(930, 560, 130, 150, 40, '#B5E0A2', C.red, 'market') + Art.building(1090, 560, 120, 190, 36, '#F9D56E', C.teal, 'school');
      g += Art.tree(360, 560, 1.1, true) + Art.tree(880, 560, 1.2, true);
    }
    UI.g(svg, g);
    // bangunan (muncul memantul satu per satu)
    if (imgBg) BKEYS.forEach(function (k) {
      var a = ASSETS.list[k], cx = a.x + a.dw / 2;
      var bg = UI.g(svg, '<image href="' + ASSETS.dir + a.file + '" x="' + (-a.dw / 2) + '" y="' + (-a.dh) + '" width="' + a.dw + '" height="' + a.dh + '"/>', 'translate(' + cx + ',' + a.base + ') scale(' + (reduce ? 1 : 0.001) + ')');
      blds.push({ g: bg, cx: cx, base: a.base });
    });

    // logo (turun memantul, lalu bergoyang pelan) + lambang di pojok kiri atas, seimbang dengan deret ikon di pojok kanan atas
    var drop = UI.g(svg, '', 'translate(0,' + (reduce ? 0 : -420) + ')');
    var sway = UI.g(drop, '', ''); if (!reduce) sway.setAttribute('class', 'logosway');
    UI.g(sway, '<g transform="rotate(-3 640 200)"><rect x="250" y="94" width="780" height="220" rx="46" fill="#000" opacity=".2" transform="translate(0 10)"/>' +
      '<rect x="250" y="94" width="780" height="220" rx="46" fill="' + C.cream + '"' + Art.st(6) + '/>' +
      '<text x="640" y="206" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="112" fill="' + C.red + '" stroke="' + C.ink + '" stroke-width="12" paint-order="stroke" stroke-linejoin="round">' + STR.title + '</text>' +
      '<text x="640" y="272" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="38" fill="' + C.teal + '" stroke="' + C.ink + '" stroke-width="7" paint-order="stroke" stroke-linejoin="round">' + STR.subtitle + '</text></g>');
    if (Assets.has('title_emblem')) {
      var em = ASSETS.list.title_emblem, k = em.dh / em.h;
      UI.g(sway, '<g class="sway2"><image href="' + ASSETS.dir + em.file + '" x="' + (76 - em.w * k / 2) + '" y="' + (74 - em.dh / 2) + '" width="' + (em.w * k) + '" height="' + em.dh + '"/></g>');
    }

    // kurir pahlawan: bayangan elips di tanah (tetap saat memantul), badan memantul, balon menempel pada kepala
    var hs = heroSpec();
    var shadow = UI.g(svg, '<ellipse rx="' + hs.rx + '" ry="' + (hs.rx * 0.16) + '" fill="#2B2D42" fill-opacity=".22"/>', 'translate(-300,' + GROUND + ')');
    var hero = UI.g(svg, '<g class="hb">' + hs.svg + '</g>', 'translate(-300,' + GROUND + ')');
    var hb = hero.querySelector('.hb');
    var BW = 212, BH = 70;
    var bub = UI.g(svg, '<rect class="bb" width="' + BW + '" height="' + BH + '" rx="26" fill="#fff"' + Art.st() + '/><path class="bt" d="" fill="#fff"' + Art.st() + '/><line class="bs" stroke="#fff" stroke-width="7"/>' +
      '<text class="bx" x="' + (BW / 2) + '" y="46" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="32" fill="' + C.ink + '">' + STR.titleHint.go + '</text>', '');
    bub.setAttribute('opacity', 0);
    var bb = bub.querySelector('.bb'), bt = bub.querySelector('.bt'), bs = bub.querySelector('.bs'), bx = bub.querySelector('.bx');
    var st = { x: reduce ? 330 : -300, t: 0, bell: false, live: reduce, bubOn: reduce };

    function place() {
      var x = Math.round(st.x), bob = 0;
      if (!Save.data.settings.reduce && st.live) bob = Math.round(5 * Math.abs(Math.sin(st.t * 9.4)));
      hero.setAttribute('transform', 'translate(' + x + ',' + GROUND + ')');
      shadow.setAttribute('transform', 'translate(' + x + ',' + GROUND + ') scale(' + (1 - bob * 0.03).toFixed(3) + ')');
      hb.setAttribute('transform', 'translate(0,' + (-bob) + ') rotate(' + (Save.data.settings.reduce ? 0 : (Math.sin(st.t * 4.7) * 0.8).toFixed(2)) + ' 0 0)');
      // balon: di atas kepala (agak ke kiri supaya tangan yang melambai tidak tertutup), ekor menunjuk puncak kepala; terjepit di area aman layar
      var hx = x + hs.headX, hy = GROUND - hs.h + 14;
      var bx0 = Math.max(14, Math.min(1266 - BW, hx - BW * 0.62)), by0 = hy - BH - 30;
      var tx = Math.max(bx0 + 34, Math.min(bx0 + BW - 34, hx));
      bub.setAttribute('transform', 'translate(' + Math.round(bx0) + ',' + Math.round(by0) + ')');
      var ex = hx - bx0, ey = hy - by0 - 4;
      bt.setAttribute('d', 'M' + (tx - bx0 - 15) + ' ' + (BH - 2) + ' L' + ex + ' ' + ey + ' L' + (tx - bx0 + 15) + ' ' + (BH - 2));
      bs.setAttribute('x1', tx - bx0 - 12); bs.setAttribute('x2', tx - bx0 + 12); bs.setAttribute('y1', BH - 1); bs.setAttribute('y2', BH - 1);
      var vis = st.bubOn && hx > 40 && hx < 1240;
      bub.setAttribute('opacity', vis ? 1 : 0);
    }
    place();
    Loop.add(function (dt) {
      st.t += dt;
      if (st.live && !Save.data.settings.reduce) {
        st.x += SPEED * dt;
        if (st.x > 1560) { st.x = -300; st.bell = false; }
        if (!st.bell && st.x > 600) { st.bell = true; Aud.sfx('bell'); }
      }
      place();
    });

    // tombol
    var start = Input.button(STR.btn.start, U.TEST ? 'sun' : 'sun pulse', function () {
      Aud.sfx('bell');
      Scenes.go('levels');
    }, { x: 480, y: 590, w: 320, h: 92, id: 'start' });
    start.style.fontSize = '46px';
    var bar = UI.iconBar(root, { onGear: function () { UI.settings().onClose = function () { bar.refresh(); }; }, gearId: 'settings', gearAria: STR.settings.aria });
    // deret bawah simetris terhadap GO!: dua tombol seukuran di tiap sisi, sejajar di tengah tinggi GO!
    var SW = 212, SG = 12, SY = 604, SL = 480 - 20 - SW, SR = 800 + 20;
    function side(id, icon, label, x, tap) { var b = Input.button(UI.icon(icon) + label, 'sky small', tap, { x: x, y: SY, w: SW, h: 64, id: id }); return b; }
    var book = side('book', 'book', STR.btn.bookFull, SL - SG - SW, function () { Scenes.go('book'); });
    var aboutBtns = [
      side('about-info', 'info', STR.about.info.btn, SL, function () { UI.info(); }),
      side('about-ref', 'ref', STR.about.ref.btn, SR, function () { UI.references(); }),
      side('about-dev', 'dev', STR.about.dev.btn, SR + SW + SG, function () { UI.developer(); })
    ];
    [book, aboutBtns[0], start, aboutBtns[1], aboutBtns[2]].forEach(function (b) { root.appendChild(b); });   // urutan Tab mengikuti urutan di layar
    function aboutShow(v) { aboutBtns.forEach(function (b) { b.style.opacity = v; }); }
    document.addEventListener('settingschange', function onS() { if (!document.getElementById('scene-root') || Scenes.name !== 'title') { document.removeEventListener('settingschange', onS); return; } bar.refresh(); });

    // urutan pembuka (< 2 dtk): bangunan -> logo -> kurir masuk -> GO!
    if (reduce) { start.style.opacity = 1; book.style.opacity = 1; aboutShow(1); st.live = false; }
    else {
      start.style.opacity = 0; book.style.opacity = 0; aboutShow(0);
      blds.forEach(function (b, i) {
        Tween.wait(90 * i).then(function () {
          return Tween.value(0, 1, 340, Ease.easeOutBack, function (v) { b.g.setAttribute('transform', 'translate(' + b.cx + ',' + b.base + ') scale(' + Math.max(0.001, v) + ')'); });
        });
      });
      Tween.wait(420).then(function () {
        Aud.sfx('pop');
        return Tween.value(0, 1, 520, Ease.easeOutBack, function (v) { drop.setAttribute('transform', 'translate(0,' + (-420 * (1 - v)) + ')'); });
      });
      Tween.wait(900).then(function () { st.live = true; st.x = -230; });
      Tween.wait(1250).then(function () { st.bubOn = true; return Tween.wait(1); });
      var shown = false;
      function reveal() {   // tombol GO! muncul; ketukan di mana saja sebelum waktunya memunculkannya lebih cepat (tidak ada ketukan yang hilang)
        if (shown) return; shown = true;
        start.style.pointerEvents = ''; book.style.opacity = 1; aboutShow(1);
        return Tween.value(0, 1, 300, Ease.easeOutBack, function (v) { start.style.opacity = Math.min(1, v * 1.6); start.style.transform = 'scale(' + (0.6 + 0.4 * v) + ')'; }).then(function () { start.style.transform = ''; });
      }
      Tween.wait(1350).then(reveal);
      root.addEventListener('pointerdown', function early() { root.removeEventListener('pointerdown', early); reveal(); });
    }
    start.focus();
    Aud.music(true, 'calm');
    root.addEventListener('pointerdown', function () { Aud.init(); Aud.music(true, 'calm'); }, { once: true });
  };
  T.exit = function () { };
  Scenes.add('title', T);
})();
