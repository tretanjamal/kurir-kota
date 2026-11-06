/* Boot */
(function () {
  Save.load();
  document.getElementById('rotate-text').textContent = STR.portrait;
  document.getElementById('cover').style.opacity = 1;
  UI.applySettings();
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches && !Save.data.settings.reduce) {
    Save.data.settings.reduce = true; UI.applySettings();
  }
  bootStage();
  Assets.load(function () {
    var start = 'title';
    var m = location.search.match(/scene=(\w+)/);
    if (U.TEST && m && Scenes.reg[m[1]]) start = m[1];
    var lv = location.search.match(/level=(\d)/);
    Scenes.go(start, { level: lv ? parseInt(lv[1], 10) : 1 });
    if (U.TEST) window.__test = window.__test || { scene: function () { return Scenes.name; } };
  });
})();
