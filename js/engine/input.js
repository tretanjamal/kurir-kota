/* Input: tombol anak (Pointer Events via click, keyboard Tab/Enter/panah), bunyi klik <100 ms */
(function (root) {
  var Input = {
    /* buat tombol. opts: cls (warna), x,y,w,h (posisi absolut di stage), data */
    button: function (label, cls, onTap, o) {
      o = o || {};
      var b = U.h('button', 'btn ' + (cls || 'sun'));
      b.type = 'button';
      b.innerHTML = '<span class="lbl">' + label + '</span>';
      if (o.x != null) { b.style.left = o.x + 'px'; b.style.top = o.y + 'px'; b.style.width = o.w + 'px'; b.style.height = o.h + 'px'; }
      if (o.aria) b.setAttribute('aria-label', o.aria);
      if (o.id) b.dataset.id = o.id;
      var sounded = false;
      b.addEventListener('pointerdown', function () {
        if (b.disabled) return;
        Aud.init(); Aud.sfx('click'); sounded = true;
      });
      b.addEventListener('click', function (e) {
        if (b.disabled) return;
        Aud.init();
        if (!sounded) Aud.sfx('click'); // keyboard / uji
        sounded = false;
        if (onTap) onTap(e, b);
      });
      return b;
    },
    /* toggle: tombol dua keadaan (label berubah) */
    toggle: function (getLabel, get, set, cls, o) {
      var b = Input.button(getLabel(), cls, function () {
        set(!get()); b.querySelector('.lbl').innerHTML = getLabel(); b.setAttribute('aria-pressed', get() ? 'true' : 'false');
      }, o);
      b.setAttribute('aria-pressed', get() ? 'true' : 'false');
      return b;
    }
  };

  /* Esc: tutup jendela yang terbuka (Lanjut/Tutup), atau buka menu Jeda/Pengaturan dari tombol gerigi */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var ov = document.querySelector('.overlay');
    var b = ov ? ov.querySelector('[data-id=resume],[data-id=close]') : document.querySelector('[data-id=menu],[data-id=settings]');
    if (b && !b.disabled) { e.preventDefault(); b.click(); }
  });

  /* navigasi panah antar tombol aktif */
  document.addEventListener('keydown', function (e) {
    var k = e.key;
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].indexOf(k) < 0) return;
    var scope = document.querySelector('.overlay .btn') ? document.querySelector('.overlay') : document.getElementById('scene-root');
    var list = Array.prototype.filter.call(scope.querySelectorAll('.btn'), function (b) { return !b.disabled && b.offsetParent !== null; });
    if (!list.length) return;
    var cur = list.indexOf(document.activeElement);
    var dir = (k === 'ArrowLeft' || k === 'ArrowUp') ? -1 : 1;
    var next = cur < 0 ? (dir > 0 ? 0 : list.length - 1) : (cur + dir + list.length) % list.length;
    list[next].focus();
    e.preventDefault();
  });
  document.addEventListener('pointerdown', function () { Aud.init(); }, { passive: true });
  root.Input = Input;
})(window);
