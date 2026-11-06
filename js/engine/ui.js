/* UI: pengaturan, overlay (menu, glosarium), partikel, hitung naik, SVG layer */
(function (root) {
  var NS = 'http://www.w3.org/2000/svg';
  var UI = {
    applySettings: function () {
      var s = Save.data.settings;
      document.body.classList.toggle('reduce', !!s.reduce);
      Tween.speed = s.reduce ? 0.45 : 1;
      Aud.setMuted(!!s.mute);
    },
    setting: function (key, val) { Save.data.settings[key] = val; Save.save(); UI.applySettings(); },
    soundToggle: function (o) {
      return Input.toggle(function () { return STR.toggles.sound(!Save.data.settings.mute); },
        function () { return !Save.data.settings.mute; }, function (v) { UI.setting('mute', !v); }, 'sky small', o);
    },
    reduceToggle: function (o) {
      return Input.toggle(function () { return STR.toggles.reduce(Save.data.settings.reduce); },
        function () { return Save.data.settings.reduce; }, function (v) { UI.setting('reduce', v); }, 'sky small', o);
    },
    santaiToggle: function (o) {
      return Input.toggle(function () { return STR.toggles.santai(Save.data.settings.santai); },
        function () { return Save.data.settings.santai; }, function (v) { UI.setting('santai', v); }, 'teal small', o);
    },
    /* ---- ikon tombol bulat (viewBox -20..20), dipakai berulang di semua layar ---- */
    icon: function (name, on) {
      var k = 'fill="none" stroke="#2B2D42" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"';
      if (name === 'sound') return '<svg viewBox="-20 -20 40 40" width="40" height="40"><path d="M-18 -5 h7 l8 -8 v26 l-8 -8 h-7z" fill="#fff" stroke="#2B2D42" stroke-width="3.4" stroke-linejoin="round"/>' +
        (on ? '<path d="M2 -6 q5 6 0 12 M8 -13 q11 13 0 26" ' + k + '/>' : '<path d="M3 -7 l12 14 M15 -7 l-12 14" fill="none" stroke="#EF5B4B" stroke-width="4.6" stroke-linecap="round"/>') + '</svg>';
      if (name === 'fs') return '<svg viewBox="-20 -20 40 40" width="40" height="40">' + (on ?
        '<path d="M-6 -17 v11 h-11 M6 -17 v11 h11 M-6 17 v-11 h-11 M6 17 v-11 h11" ' + k + '/>' :
        '<path d="M-17 -6 v-11 h11 M17 -6 v-11 h-11 M-17 6 v11 h11 M17 6 v11 h-11" ' + k + '/>') + '</svg>';
      if (name === 'gear') {
        var teeth = ''; for (var i = 0; i < 8; i++) teeth += '<rect x="-3.6" y="-18" width="7.2" height="9" rx="2" fill="#fff" stroke="#2B2D42" stroke-width="3" transform="rotate(' + i * 45 + ')"/>';
        return '<svg viewBox="-20 -20 40 40" width="40" height="40">' + teeth + '<circle r="12.5" fill="#fff" stroke="#2B2D42" stroke-width="3.4"/><circle r="5" fill="#8ED6F0" stroke="#2B2D42" stroke-width="3"/></svg>';
      }
      /* ikon kecil di depan tulisan tombol: satu ukuran dan gaya agar deret tombol layar judul seragam */
      function lead(body) { return '<svg viewBox="-20 -20 40 40" width="34" height="34" style="margin-right:8px;flex:none">' + body + '</svg>'; }
      var ln = 'stroke="#2B2D42" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"';
      if (name === 'book') return lead('<path d="M-17 -12 q9 -4 17 2 q8 -6 17 -2 v26 q-9 -4 -17 2 q-8 -6 -17 -2z" fill="#fff" ' + ln + '/><path d="M0 -10 v26" ' + ln + ' fill="none"/>');
      if (name === 'info') return lead('<circle r="16" fill="#fff" ' + ln + '/><circle cy="-8" r="2.6" fill="#2B2D42"/><path d="M0 -1 v10" fill="none" stroke="#2B2D42" stroke-width="4.4" stroke-linecap="round"/>');
      if (name === 'ref') return lead('<path d="M-13 -17 h18 l8 8 v26 h-26z" fill="#fff" ' + ln + '/><path d="M5 -17 v8 h8 M-7 -1 h14 M-7 7 h14" fill="none" ' + ln + '/>');
      if (name === 'dev') return lead('<circle cy="-8" r="8" fill="#fff" ' + ln + '/><path d="M-15 16 q0 -14 15 -14 q15 0 15 14z" fill="#fff" ' + ln + '/>');
      return '';
    },
    /* pesan singkat ramah (hilang sendiri) */
    toast: function (text) {
      var host = document.getElementById('stage'), t = U.h('div', 'toast'); t.textContent = text; host.appendChild(t);
      setTimeout(function () { t.remove(); }, 2600);
    },
    /* deret tombol ikon bulat di pojok kanan atas: suara, layar penuh, roda gigi. Posisi SAMA di semua layar (x 1056/1128/1200, y 14, 64 px).
       o.onGear = fungsi untuk roda gigi (Pengaturan di judul, Jeda saat bermain), o.gearId, o.gearAria. Mengembalikan elemen-elemennya. */
    iconBar: function (parent, o) {
      var X = [1056, 1128, 1200], Y = 14, S = 64, out = {};
      function mk(html, x, id, aria, tap) {
        var b = Input.button(html, 'sky small', tap, { x: x, y: Y, w: S, h: S, id: id, aria: aria });
        b.style.padding = '0'; b.style.pointerEvents = 'auto'; b.style.zIndex = 20; parent.appendChild(b); return b;
      }
      var snd = mk(UI.icon('sound', !Save.data.settings.mute), X[0], 'sound', '', function () { UI.setting('mute', !Save.data.settings.mute); refresh(); });
      var fsb = null;
      if (root.FS && FS.supported()) fsb = mk(UI.icon('fs', FS.isFull()), X[1], 'fullscreen', '', function () { FS.toggle(function () { UI.toast(STR.icons.fsDenied); }); });
      var gear = mk(UI.icon('gear'), X[2], o.gearId || 'settings', o.gearAria || STR.settings.aria, function () { o.onGear && o.onGear(); });
      function refresh() {
        var on = !Save.data.settings.mute;
        snd.querySelector('.lbl').innerHTML = UI.icon('sound', on); snd.setAttribute('aria-label', on ? STR.icons.soundOn : STR.icons.soundOff); snd.setAttribute('aria-pressed', on ? 'true' : 'false');
        if (fsb) { var f = FS.isFull(); fsb.querySelector('.lbl').innerHTML = UI.icon('fs', f); fsb.setAttribute('aria-label', f ? STR.icons.fsExit : STR.icons.fsEnter); fsb.setAttribute('aria-pressed', f ? 'true' : 'false'); }
      }
      if (fsb) { FS.onChange(refresh); }
      refresh(); out.refresh = refresh; out.sound = snd; out.fs = fsb; out.gear = gear;
      return out;
    },
    /* panel Pengaturan: sakelar besar (ikon + tulisan + Nyala/Mati) */
    settings: function () {
      return UI.overlay(760, 560, function (p, close) {
        p.appendChild(U.h('div', 'txt', STR.settings.title)).classList.add('ov-t-set');
        var rows = [
          { id: 'sound', name: STR.settings.sound, hint: STR.settings.soundHint, icon: function (on) { return UI.icon('sound', on); }, get: function () { return !Save.data.settings.mute; }, set: function (v) { UI.setting('mute', !v); } },
          { id: 'reduce', name: STR.settings.reduce, hint: STR.settings.reduceHint, icon: function () { return '<svg viewBox="-20 -20 40 40" width="40" height="40"><circle r="15" fill="#fff" stroke="#2B2D42" stroke-width="3.4"/><path d="M-8 0 h16 M-4 -7 h8 M-4 7 h8" stroke="#2B2D42" stroke-width="3.4" stroke-linecap="round"/></svg>'; }, get: function () { return !!Save.data.settings.reduce; }, set: function (v) { UI.setting('reduce', v); } },
          { id: 'santai', name: STR.settings.santai, hint: STR.settings.santaiHint, icon: function () { return '<svg viewBox="-20 -20 40 40" width="40" height="40"><circle r="15" fill="#fff" stroke="#2B2D42" stroke-width="3.4"/><path d="M0 -8 V0 L7 4" fill="none" stroke="#2B2D42" stroke-width="3.4" stroke-linecap="round"/></svg>'; }, get: function () { return !!Save.data.settings.santai; }, set: function (v) { UI.setting('santai', v); } }
        ];
        rows.forEach(function (r, i) {
          var b = Input.button('', 'sky', function () { r.set(!r.get()); paint(); document.dispatchEvent(new Event('settingschange')); }, { x: 40, y: 100 + i * 124, w: 680, h: 108, id: 'sw-' + r.id });
          b.style.borderRadius = '30px'; b.style.padding = '0';
          function paint() {
            var on = r.get();
            b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); b.style.setProperty('--c', on ? '#1FA89B' : '#9AA3C2'); b.style.setProperty('--d', on ? '#0F6F66' : '#5F688C');
            b.querySelector('.lbl').innerHTML = '<span class="sw-row"><span class="sw-ic">' + r.icon(on) + '</span><span class="sw-tx"><b>' + r.name + '</b><i>' + r.hint + '</i></span>' +
              '<span class="sw-sw"><span class="sw-track' + (on ? ' on' : '') + '"><span class="sw-knob"></span></span><b class="sw-st">' + (on ? STR.settings.on : STR.settings.off) + '</b></span></span>';
          }
          b.querySelector('.lbl').style.width = '100%'; paint(); p.appendChild(b);
        });
        p.appendChild(Input.button(STR.btn.close, 'red', close, { x: 240, y: 466, w: 280, h: 76, id: 'close' }));
      });
    },
    /* pop-up layar judul. numList: baris bernomor; label: ganti nomor dengan teks (mis. nama rute) */
    numList: function (items, label) {
      return '<ol class="ab-list">' + items.map(function (t, i) {
        return '<li><span class="ab-num">' + (i + 1) + '</span><span class="ab-tx">' + (label ? '<b class="ab-name">' + label[i] + '</b>' : '') + t + '</span></li>';
      }).join('') + '</ol>';
    },
    aboutShell: function (title, id, build) {
      return UI.overlay(1120, 640, function (p, close) {
        p.classList.add('ab-panel'); p.setAttribute('role', 'dialog'); p.setAttribute('aria-label', title); p.dataset.about = id;
        p.appendChild(U.h('div', 'txt ab-title', title));
        var area = U.h('div', 'ab-area'); p.appendChild(area);
        build(p, area);
        p.appendChild(Input.button(STR.btn.close, 'red', close, { x: 420, y: 550, w: 280, h: 72, id: 'close' }));
      });
    },
    info: function () {
      var S = STR.about.info;
      return UI.aboutShell(S.title, 'info', function (p, area) {
        var keys = ['goal', 'how', 'route'], tabs = {};
        var html = {
          goal: '<div class="ab-lead">' + S.goalLead + '</div>' + UI.numList(S.goals),
          how: UI.numList(S.how),
          route: '<div class="ab-lead">' + S.routeLead + '</div>' + UI.numList(S.routes, STR.levels.names)
        };
        area.classList.add('ab-tabbed');
        function show(k) {
          area.innerHTML = html[k]; area.dataset.tab = k;
          keys.forEach(function (x) { tabs[x].classList.toggle('sun', x === k); tabs[x].classList.toggle('sky', x !== k); tabs[x].setAttribute('aria-pressed', x === k ? 'true' : 'false'); });
        }
        keys.forEach(function (k, i) {
          tabs[k] = Input.button(S.tabs[k], 'sky small', function () { show(k); }, { x: [40, 400, 720][i], y: 74, w: [340, 300, 360][i], h: 64, id: 'tab-' + k });
          p.appendChild(tabs[k]);
        });
        show('goal');
      });
    },
    references: function () {
      var S = STR.about.ref;
      return UI.aboutShell(S.title, 'ref', function (p, area) {
        area.innerHTML = '<section class="ab-card"><h3>' + S.srcTitle + '</h3><p>' + S.src + '</p></section>' +
          '<section class="ab-card"><h3>' + S.aiTitle + '</h3><p>' + S.aiLead + '</p><ul class="ab-dots">' + S.ai.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul><p>' + S.aiEnd + '</p></section>';
      });
    },
    developer: function () {
      var S = STR.about.dev;
      return UI.aboutShell(S.title, 'dev', function (p, area) {
        var pic = Assets.has('dev_foto') ? '<img class="ab-photo" src="' + ASSETS.dir + ASSETS.list.dev_foto.file + '" alt="' + S.photoAlt + '">' : '<div class="ab-photo ab-photo-none" aria-hidden="true">' + S.name.charAt(0) + '</div>';
        area.classList.add('ab-dev');
        area.innerHTML = '<div class="ab-who">' + pic + '<div class="ab-name-big">' + S.name + '</div><div>' + S.org + '</div><div class="ab-mail">' + S.email + '</div><div>' + S.year + '</div></div>' +
          '<section class="ab-card ab-ach"><h3>' + S.achTitle + '</h3><ul class="ab-dots">' + S.ach.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul></section>';
      });
    },
    svgLayer: function (parent, cls) {
      var s = document.createElementNS(NS, 'svg');
      s.setAttribute('viewBox', '0 0 1280 720'); s.setAttribute('class', 'layer ' + (cls || ''));
      parent.appendChild(s); return s;
    },
    g: function (parent, html, transform) {
      var g = document.createElementNS(NS, 'g');
      if (transform) g.setAttribute('transform', transform);
      g.innerHTML = html || '';
      parent.appendChild(g); return g;
    },
    /* partikel kecil di grup SVG */
    burst: function (parent, x, y, n, colors) {
      if (Save.data.settings.reduce) return;
      colors = colors || [Art.C.sun, Art.C.red, Art.C.teal, '#fff'];
      for (var i = 0; i < n; i++) (function (i) {
        var a = (i / n) * Math.PI * 2 + Math.random() * 0.5, sp = 70 + Math.random() * 90;
        var e = document.createElementNS(NS, 'g');
        e.innerHTML = i % 2 ? Art.starShape(9, colors[i % colors.length]) : '<circle r="6" fill="' + colors[i % colors.length] + '" stroke="' + Art.C.ink + '" stroke-width="3"/>';
        parent.appendChild(e);
        Tween.run(650, function (k) {
          e.setAttribute('transform', 'translate(' + (x + Math.cos(a) * sp * k) + ',' + (y + Math.sin(a) * sp * k + 120 * k * k) + ') scale(' + (1 - k * 0.7) + ')');
          e.setAttribute('opacity', 1 - k * k);
        }, Ease.easeOutCubic).then(function () { e.remove(); });
      })(i);
    },
    countUp: function (el, from, to, ms) {
      return Tween.value(from, to, ms, Ease.easeOutCubic, function (v) { el.textContent = Math.round(v); });
    },
    /* overlay modal. build(panel, close) mengisi isi */
    overlay: function (w, h, build) {
      var o = U.h('div', 'overlay');
      var p = U.h('div', 'panel'); p.style.cssText = 'left:' + (1280 - w) / 2 + 'px;top:' + (720 - h) / 2 + 'px;width:' + w + 'px;height:' + h + 'px';
      o.appendChild(p);
      var host = document.getElementById('stage');
      host.appendChild(o);
      var prev = document.activeElement;
      function close() { o.remove(); if (prev && prev.focus) try { prev.focus(); } catch (e) { } if (api.onClose) api.onClose(); }
      var api = { el: o, panel: p, close: close };
      build(p, close);
      p.style.transform = 'scale(.8)'; p.style.opacity = 0;
      Tween.run(260, function (e) { p.style.transform = 'scale(' + (0.8 + 0.2 * e) + ')'; p.style.opacity = Math.min(1, e * 2); }, Ease.easeOutBack);
      var first = p.querySelector('.btn'); if (first) first.focus();
      return api;
    },
    menu: function (opts) {
      return UI.overlay(640, 590, function (p, close) {
        p.appendChild(U.h('div', 'txt', STR.menu.title)).classList.add('ov-t-menu');
        p.appendChild(Input.button(STR.btn.resume, 'sun', close, { x: 120, y: 100, w: 400, h: 76, id: 'resume' }));
        if (opts.restart) p.appendChild(Input.button(STR.menu.restart, 'teal', function () { close(); opts.restart(); }, { x: 120, y: 200, w: 400, h: 76 }));
        p.appendChild(UI.soundToggle({ x: 120, y: 300, w: 400, h: 64 }));
        p.appendChild(UI.reduceToggle({ x: 120, y: 384, w: 400, h: 64 }));
        p.appendChild(Input.button(STR.btn.home, 'red', function () { close(); Scenes.go('title'); }, { x: 120, y: 480, w: 400, h: 76 }));
      });
    },
    glossary: function (kind) {
      return UI.overlay(1200, 680, function (p, close) {
        p.style.left = '40px'; p.style.top = '20px';
        p.appendChild(U.h('div', 'txt', STR.gloss.title)).classList.add('ov-t-gl');
        p.appendChild(U.h('div', 'txt', STR.gloss.tapHear)).classList.add('ov-s-gl');
        var kinds = ['dir', 'place', 'pos', 'traffic'], tabs = {}, area = U.h('div'); area.className = 'gl-area';
        function show(k) {
          area.innerHTML = '';
          kinds.forEach(function (x) { tabs[x].style.opacity = x === k ? 1 : .7; tabs[x].setAttribute('aria-pressed', x === k ? 'true' : 'false'); });
          SENT.gloss.filter(function (g) { return g.kind === k && g.id !== 'tertib'; }).forEach(function (wd, i) {   // 'tertib' hanya stempel di Buku Kurir
            if (k === 'place' && Assets.has('place_' + wd.id)) {   // kartu tempat: bingkai gambar seragam (gambar utuh, di tengah), kata Inggris tebal, arti, tombol suara
              var pc = i % 4, pr = Math.floor(i / 4), px = 16 + pc * 292, py = pr * 192, pa = ASSETS.list['place_' + wd.id];
              var fw = 244, fh = 100, ps = Math.min(fw / pa.w, fh / pa.h), iw = pa.w * ps, ih = pa.h * ps;
              var pcard = U.h('div', 'panel'); pcard.style.cssText = 'left:' + px + 'px;top:' + py + 'px;width:276px;height:184px;border-radius:24px';
              pcard.innerHTML = '<svg viewBox="0 0 260 112" style="position:absolute;left:6px;top:6px;width:260px;height:112px"><rect x="2" y="2" width="256" height="108" rx="16" fill="#CFEBBF" stroke="#2B2D42" stroke-width="3"/>' +
                '<image href="' + ASSETS.dir + pa.file + '" x="' + (130 - iw / 2) + '" y="' + (56 - ih / 2) + '" width="' + iw + '" height="' + ih + '"/></svg>' +
                '<div class="txt" style="left:14px;top:118px;font-size:28px;line-height:1.05;width:180px">' + wd.en + '</div>' +
                '<div class="txt" style="left:14px;top:152px;font-size:22px;line-height:1;font-weight:700;color:#5B6784;width:180px">' + wd.idn + '</div>';
              var pb = Input.button('<svg viewBox="-20 -20 40 40" width="32" height="32">' + Art.speaker() + '</svg>', 'teal', function () { Voice.say(wd.say, { rate: 0.8 }); },
                { x: 204, y: 124, w: 56, h: 56, aria: 'Dengarkan ' + wd.en });
              pb.style.borderRadius = '28px'; pcard.appendChild(pb); area.appendChild(pcard); return;
            }
            var col = i % 4, row = Math.floor(i / 4), x = 16 + col * 292, y = row * 192;
            var card = U.h('div', 'panel'); card.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:276px;height:176px;border-radius:24px';
            var art = k === 'pos' ? '<svg viewBox="0 0 300 120" style="position:absolute;left:12px;top:8px;width:252px;height:100px">' + Art.relDiagram(wd.id) + '</svg>'
              : '<svg viewBox="-40 -40 80 80" style="position:absolute;left:10px;top:8px;width:84px;height:84px">' + Art.wordBadge(wd, 36) + '</svg>';
            card.innerHTML = art + (k === 'pos' ? '' : '<div class="txt" style="left:100px;top:14px;font-size:28px;line-height:1.05;width:160px">' + wd.en + '</div>') +
              '<div class="txt" style="left:12px;top:' + (k === 'pos' ? 112 : 100) + 'px;font-size:22px;font-weight:700;color:#5B6784;width:190px">' + wd.idn + '</div>';
            var b = Input.button('<svg viewBox="-20 -20 40 40" width="36" height="36">' + Art.speaker() + '</svg>', 'teal', function () { Voice.say(wd.say, { rate: 0.8 }); },
              { x: 206, y: 100, w: 64, h: 64, aria: 'Dengarkan ' + wd.en });
            b.style.borderRadius = '32px'; card.appendChild(b); area.appendChild(card);
          });
        }
        kinds.forEach(function (k, i) {
          tabs[k] = Input.button(STR.gloss.tabs[k], 'sky small', function () { show(k); }, { x: 170 + i * 220, y: 98, w: 200, h: 64 });
          p.appendChild(tabs[k]);
        });
        p.appendChild(area);
        p.appendChild(Input.button(STR.btn.close, 'red', close, { x: 460, y: 582, w: 280, h: 76 }));
        show(kind || 'dir');
      });
    }
  };
  root.UI = UI;
})(window);


