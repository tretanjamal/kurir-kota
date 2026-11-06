/* Scene Pilih Rute: 5 level, kunci berurutan, bintang tersimpan. Kartu terkunci tetap bisa diketuk agar ada umpan balik (goyang + pesan), tetapi tidak membuka level. */
(function () {
  var C = Art.C, L = {};
  function icon(n) {
    if (n === 1) return Art.moveBadge('straight', 44) + '<g transform="translate(-56,18) scale(.5)">' + Art.moveBadge('left', 30) + '</g><g transform="translate(56,18) scale(.5)">' + Art.moveBadge('right', 30) + '</g>';
    if (n === 2) return ['bank', 'library', 'park'].map(function (p, i) { return '<g transform="translate(' + ((i - 1) * 62) + ',' + (i === 1 ? -6 : 10) + ')">' + Art.wordBadge({ id: p, kind: 'place' }, i === 1 ? 34 : 28) + '</g>'; }).join('');
    if (n === 3) return '<g transform="translate(-34,0)">' + Art.wordBadge({ id: 'next', kind: 'pos' }, 38) + '</g><g transform="translate(34,0)">' + Art.wordBadge({ id: 'opposite', kind: 'pos' }, 38) + '</g>';
    if (n === 5) return '<circle r="42" fill="#FFF4DC" stroke="#2B2D42" stroke-width="4"/><text y="20" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="60" fill="#EF5B4B" stroke="#2B2D42" stroke-width="3" paint-order="stroke">?</text><g transform="translate(-62,30) scale(.6)">' + Art.moveBadge('left', 30) + '</g><g transform="translate(62,30) scale(.6)">' + Art.moveBadge('right', 30) + '</g>';
    return '<g transform="scale(2.3)">' + Art.pkg() + '</g><g transform="translate(40,-34) scale(.9)">' + Art.starShape(22) + '</g>';
  }
  function lockIcon() {
    return '<path d="M-22 -8 V-24 A22 22 0 0 1 22 -24 V-8" fill="none" stroke="#2B2D42" stroke-width="10"/><rect x="-36" y="-10" width="72" height="62" rx="14" fill="#FFF4DC"' + Art.st() + '/><circle cy="14" r="9" fill="#2B2D42"/><path d="M0 16 V36" stroke="#2B2D42" stroke-width="8" stroke-linecap="round"/>';
  }
  function refuse(b, i) {
    Aud.sfx('empty');
    UI.toast(STR.levels.lockedHint(STR.levels.names[i - 1]));
    b.classList.remove('nope'); void b.offsetWidth; b.classList.add('nope');
  }
  /* tangan penunjuk ke kartu berikutnya bila diam 8 detik */
  function idleHand(root, card) {
    var hand = U.h('div', 'handptr'), idle = 0;
    hand.style.display = 'none';
    if (Assets.has('ui_hand')) {
      var ah = ASSETS.list.ui_hand, q = ah.q || 1;
      hand.innerHTML = '<div class="hrot"><img class="hp" alt="" src="' + ASSETS.dir + ah.file + '" style="left:' + (-ah.tx / q) + 'px;top:' + (-ah.ty / q) + 'px;width:' + (ah.w / q) + 'px;height:' + (ah.h / q) + 'px;transform-origin:' + (ah.tx / q) + 'px ' + (ah.ty / q) + 'px"></div>';
    } else hand.innerHTML = '<svg viewBox="-30 -4 90 90">' + Art.pointerHand() + '</svg>';
    hand.style.left = (parseFloat(card.style.left) + parseFloat(card.style.width) / 2) + 'px';
    hand.style.top = (parseFloat(card.style.top) + 300) + 'px';
    root.appendChild(hand);
    function touch() { idle = 0; hand.style.display = 'none'; }
    root.addEventListener('pointerdown', touch);
    root.addEventListener('keydown', touch);
    Loop.add(function (dt) {
      if (document.querySelector('.overlay')) return touch();
      idle += dt;
      if (idle >= 8) hand.style.display = 'block';
    });
  }
  L.enter = function (root) {
    var svg = UI.svgLayer(root);
    UI.g(svg, (Assets.has('bg_menu') ? Assets.image('bg_menu', 0, 0, 1280, 720) + '<rect width="1280" height="720" fill="#FFF4DC" opacity=".32"/>' : '<defs><linearGradient id="lsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6EC6EA"/><stop offset="1" stop-color="#FDE9B8"/></linearGradient></defs><rect width="1280" height="720" fill="url(#lsky)"/>') +
      '<g class="drift" style="animation-delay:-20s">' + Art.cloud(0, 80, 1) + '</g><g class="drift" style="animation-delay:-55s;animation-duration:90s">' + Art.cloud(0, 150, .8) + '</g>' +
      '<path d="M0 640 H1280 V720 H0Z" fill="' + C.road + '"' + Art.st() + '/><path d="M0 680 H1280" stroke="#FFF4DC" stroke-width="6" stroke-dasharray="46 34"/>');
    var t = U.h('div', 'txt', STR.levels.title);
    t.classList.add('lv-title');
    root.appendChild(t);
    LV.forEach(function (lv, i) {
      var ok = LV.unlocked(lv.n), stars = (Save.data.levels[lv.id] || {}).stars || 0;
      var st = '';
      for (var k = 0; k < 3; k++) st += '<g transform="translate(' + (k * 46 + 23) + ',22)">' + Art.starShape(19, k < stars ? C.sun : '#D6D8E4') + '</g>';
      var html = '<div class="lv-in">' +
        '<svg viewBox="-90 -60 180 120" width="200" height="130">' + (ok ? icon(lv.n) : lockIcon()) + '</svg>' +
        '<div class="lv-n">' + STR.levels.names[i] + '</div>' +
        '<div class="lv-s">' + STR.levels.subs[i] + '</div>' +
        '<svg viewBox="0 0 138 44" width="138" height="44">' + st + '</svg>' +
        '<div class="lv-c">' + lv.missions + ' ' + (lv.n === 4 ? STR.levels.address : lv.n === 5 ? STR.levels.tourist : STR.levels.mission) + '</div>' +
        (ok ? '' : '<div class="lv-lock">' + STR.levels.locked + '</div>') + '</div>';
      var b = Input.button(html, ok ? (stars ? 'teal' : 'sun') : 'slate locked', function (e, el) { if (ok) LV.start(lv.n); else refuse(el, i); }, { x: 40 + i * 242, y: 130, w: 232, h: 440, id: 'lv' + lv.n, aria: STR.levels.names[i] + (ok ? '' : ', ' + STR.levels.locked) });
      b.classList.add('lv-card');
      if (!ok) b.setAttribute('aria-disabled', 'true');
      root.appendChild(b);
    });
    root.appendChild(Input.button(STR.btn.home, 'red', function () { Scenes.go('title'); }, { x: 340, y: 590, w: 280, h: 76, id: 'home' }));
    root.appendChild(Input.button(STR.btn.book, 'sky', function () { Scenes.go('book'); }, { x: 660, y: 590, w: 280, h: 76, id: 'book' }));
    root.appendChild(UI.santaiToggle({ x: 976, y: 590, w: 264, h: 76, id: 'santai' }));   // Mode Santai bisa dipilih sebelum bermain
    var bar = UI.iconBar(root, { onGear: function () { UI.settings().onClose = function () { bar.refresh(); }; }, gearId: 'settings', gearAria: STR.settings.aria });
    var next = null;
    LV.forEach(function (lv) { if (!next && LV.unlocked(lv.n) && !LV.done(lv.n)) next = lv.n; });
    var tgt = root.querySelector('[data-id=lv' + (next || 1) + ']'); if (tgt) tgt.focus();
    if (next) idleHand(root, tgt);
    function pulseNext() { if (next && !U.TEST) tgt.classList.add('pulse'); }
    Aud.music(true, 'calm');
    // level yang baru terbuka: bunyi + kartu memantul sekali
    var fl = Save.data.flags || (Save.data.flags = {});
    if (next && next > 1 && !fl['unl' + next]) {
      fl['unl' + next] = 1; Save.save();
      Aud.sfx('unlock');
      if (tgt) Tween.run(520, function (e) { tgt.style.transform = 'scale(' + (1 + 0.06 * Math.sin(e * Math.PI)) + ')'; }, Ease.easeInOutCubic).then(function () { tgt.style.transform = ''; pulseNext(); });
    } else pulseNext();
  };
  L.exit = function () { };
  Scenes.add('levels', L);
})();

