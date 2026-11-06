/* Scene: scaler 1280x720 (letterbox), loop rAF berbasis delta, manajer scene dengan transisi */
(function (root) {
  var W = 1280, H = 720;
  var Stage = { el: null, scale: 1 };

  /* Scaler */
  function fit() {
    var vw = root.innerWidth, vh = root.innerHeight;
    var s = Math.min(vw / W, vh / H);
    Stage.scale = s;
    // layar kecil: area ketuk tombol diperluas (tampilan tetap) agar tiap tombol >= 44 px sungguhan; maks. 12 px logis agar tombol bertetangga tidak bertumpuk
    document.documentElement.style.setProperty('--pad', Math.min(12, Math.max(0, (44 / s - 64) / 2)).toFixed(1) + 'px');
    var x = (vw - W * s) / 2, y = (vh - H * s) / 2;
    Stage.el.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + s + ')';
    document.getElementById('rotate').style.display = vh > vw ? 'flex' : 'none';
  }

  /* Loop */
  var Loop = {
    fns: [], last: 0, paused: false,
    add: function (fn) { Loop.fns.push(fn); },
    remove: function (fn) { var i = Loop.fns.indexOf(fn); if (i >= 0) Loop.fns.splice(i, 1); },
    start: function () {
      function tick(ts) {
        var dt = Math.min(ts - Loop.last, 50) / 1000;
        Loop.last = ts;
        if (!Loop.paused && dt > 0) {
          Tween.update(dt);
          for (var i = 0; i < Loop.fns.length; i++) Loop.fns[i](dt);
        }
        root.requestAnimationFrame(tick);
      }
      Loop.last = performance.now();
      root.requestAnimationFrame(tick);
    }
  };
  document.addEventListener('visibilitychange', function () {
    var hid = document.hidden;
    Loop.paused = hid;
    if (!hid) Loop.last = performance.now();
    Aud.setHidden(hid);
    if (hid) Voice.stop();
  });

  /* Scenes */
  var Scenes = {
    reg: {}, cur: null, name: '', root: null, cover: null, busy: false,
    add: function (n, s) { Scenes.reg[n] = s; },
    go: function (name, params) {
      if (Scenes.busy) return Promise.resolve();
      Scenes.busy = true;
      var op = { v: 0 };
      var out = Scenes.cur ? Tween.run(160, function (e) { Scenes.cover.style.opacity = e; }, Ease.easeOutQuad) : Promise.resolve();
      return out.then(function () {
        if (Scenes.cur && Scenes.cur.exit) Scenes.cur.exit();
        Voice.stop();
        Tween.clear();
        Loop.fns.length = 0;
        Scenes.root.innerHTML = '';
        Scenes.name = name;
        Scenes.cur = Scenes.reg[name];
        Scenes.cur.enter(Scenes.root, params || {});
        if (Scenes.cur.update) Loop.add(Scenes.cur.update);
        return Tween.run(220, function (e) { Scenes.cover.style.opacity = 1 - e; }, Ease.easeOutQuad);
      }).then(function () { Scenes.busy = false; }, function (e) { Scenes.busy = false; throw e; });   // jangan macet bila enter() melempar error
    }
  };

  function boot() {
    Stage.el = document.getElementById('stage');
    Scenes.root = document.getElementById('scene-root');
    Scenes.cover = document.getElementById('cover');
    root.addEventListener('resize', fit);
    root.addEventListener('orientationchange', fit);
    fit();
    Loop.start();
  }
  root.Stage = Stage; root.Loop = Loop; root.Scenes = Scenes; root.bootStage = boot;
})(window);
