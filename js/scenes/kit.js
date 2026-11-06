/* Kit: HUD bermain bersama (panel telepon + subtitle karaoke, tombol gerak, koin, coach, tangan penunjuk, banner, diagram) */
(function () {
  var C = Art.C;
  window.Kit = {
    hud: function (root, cfg) {
      var H = { text: '', sentences: [], active: 0, coins: cfg.coins || 0, handOn: false, coachSeq: 0 };
      var layer = H.layer = U.h('div', 'scene'); layer.style.pointerEvents = 'none'; root.appendChild(layer);
      function hp(el) { el.style.pointerEvents = 'auto'; return el; }

      var top = U.h('div', 'panel'); top.classList.add('k-top'); layer.appendChild(top);
      H.phone = U.h('div'); H.phone.className = 'k-phone';
      H.phone.innerHTML = '<svg viewBox="-34 -34 68 68" width="68" height="68"><circle r="32" fill="' + C.teal + '"' + Art.st() + '/><g transform="scale(1.1)">' + Art.phoneIcon() + '</g></svg>';
      layer.appendChild(H.phone);
      H.sub = U.h('div', 'sub'); H.sub.setAttribute('aria-live', 'polite'); layer.appendChild(H.sub);

      function canSpeak() { return !cfg.canSpeak || cfg.canSpeak(); }
      layer.appendChild(hp(Input.button('<svg viewBox="-16 -16 32 32" width="30" height="30" style="margin-right:8px"><path d="M8 -6 A10 10 0 1 0 10 4" fill="none" stroke="#2B2D42" stroke-width="4.5" stroke-linecap="round"/><path d="M2 -14 L10 -6 L0 -2z" fill="#2B2D42"/></svg>' + STR.btn.replay, 'sun small',
        function () { if (canSpeak()) { cfg.touch && cfg.touch(); H.reset(); H.speak(0.9); } }, { x: 584, y: 32, w: 150, h: 64, id: 'replay' })));
      layer.appendChild(hp(Input.button(STR.btn.slow, 'sky small',
        function () { if (canSpeak()) { cfg.touch && cfg.touch(); H.reset(); H.speak(0.75); } }, { x: 744, y: 32, w: 128, h: 64, id: 'slow' })));

      var coinPill = U.h('div', 'pill'); coinPill.classList.add('k-coin');
      coinPill.innerHTML = '<svg viewBox="-16 -16 32 32" width="30" height="30" style="margin-right:8px"><circle r="13" fill="' + C.sun + '"' + Art.st(3) + '/><text y="6" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="16" fill="' + C.ink + '">$</text></svg><span id="coins">' + H.coins + '</span>';
      layer.appendChild(coinPill); H.coinEl = coinPill.querySelector('#coins');
      H.iconBar = UI.iconBar(layer, { onGear: function () { cfg.onMenu && cfg.onMenu(); }, gearId: 'menu', gearAria: STR.settings.ariaPause });
      var mp = H.missionEl = U.h('div', 'pill'); mp.classList.add('k-mission');
      layer.appendChild(mp);

      H.btns = {};
      [['left', 'red', 20, 268], ['straight', 'sun', 308, 296], ['right', 'teal', 624, 268], ['stop', 'slate', 912, 180]].forEach(function (d) {
        var cmd = d[0];
        var lab = '<svg viewBox="-27 -27 54 54" width="48" height="48" style="margin-right:8px">' + Art.moveIcon(cmd) + '</svg>' + STR.move[cmd];
        var b = Input.button(lab, d[1], function () { cfg.onChoice(cmd); }, { x: d[2], y: 618, w: d[3], h: 76, id: cmd });
        if (cmd === 'stop') b.querySelector('.lbl').innerHTML = STR.move.stop;
        b.dataset.cmd = cmd; H.btns[cmd] = b; layer.appendChild(hp(b));
      });
      H.kata = hp(Input.button(STR.btn.words, 'teal', function () { cfg.touch && cfg.touch(); H.hideHand(); H.kata.classList.remove('glow'); UI.glossary(); }, { x: 1112, y: 618, w: 148, h: 76, id: 'words' }));
      layer.appendChild(H.kata);

      H.coach = U.h('div', 'panel coach'); H.coach.style.display = 'none'; H.coach.innerHTML = '<div class="t"></div>';
      var spk = Input.button('<svg viewBox="-20 -20 40 40" width="38" height="38">' + Art.speaker() + '</svg>', 'sky', function () {
        Voice.say(H.coach.dataset.text || '', { lang: 'id-ID', rate: 0.95 });
      }, { aria: 'Bacakan' });
      spk.style.pointerEvents = 'auto'; H.coach.appendChild(spk); H.coach.style.pointerEvents = 'auto';
      H.coach.addEventListener('pointerdown', function (e) { if (!e.target.closest('button')) H.hideCoach(); });   // ketuk kotak pelatih untuk menutup (tidak menghalangi peta)
      H.coachPortrait = Portrait.attach(H.coach, 'courier', 0, 'call', 124, { left: -6, overlap: 14 });
      layer.appendChild(H.coach);

      H.diagramEl = U.h('div', 'panel'); H.diagramEl.classList.add('k-diagram');
      layer.appendChild(H.diagramEl);

      H.hand = U.h('div', 'handptr'); H.hand.style.display = 'none';
      if (Assets.has('ui_hand')) {   // gambar: ujung jari tepat di titik target (left/top .handptr); .hrot memutar arah; .hp mengetuk (mengecil-membesar) di sekitar ujung jari
        var ah = ASSETS.list.ui_hand, q = ah.q || 1;
        H.hand.innerHTML = '<div class="hrot"><img class="hp" alt="" src="' + ASSETS.dir + ah.file + '" style="left:' + (-ah.tx / q) + 'px;top:' + (-ah.ty / q) + 'px;width:' + (ah.w / q) + 'px;height:' + (ah.h / q) + 'px;transform-origin:' + (ah.tx / q) + 'px ' + (ah.ty / q) + 'px"></div>';
        H.handNew = true;
      } else H.hand.innerHTML = '<svg viewBox="-30 -4 90 90">' + Art.pointerHand() + '</svg>';
      layer.appendChild(H.hand);

      /* ---- subtitle karaoke ---- */
      H.setSub = function (sentences) {
        H.sentences = sentences; H.text = sentences.join(' ');
        var html = '';
        sentences.forEach(function (s, si) {
          s.split(/\s+/).forEach(function (w) {
            var k = w.toLowerCase().replace(/[^a-z]/g, '');
            html += '<span class="w' + (k === 'left' || k === 'right' ? ' key ' + k : '') + '" data-k="' + k + '" data-s="' + si + '">' + w + '</span>';
          });
        });
        H.sub.innerHTML = html; H.sub.classList.toggle('multi', sentences.length > 1);
        H.spans = H.sub.querySelectorAll('.w'); H.setActive(0);
        H.fitSub();
      };
      /* kalimat panjang dikecilkan sampai muat di kotak (tinggi dan lebar), minimum 22 px */
      H.fitSub = function () {
        var el = H.sub; el.style.fontSize = ''; el.style.lineHeight = '';
        var size = parseFloat(getComputedStyle(el).fontSize) || 36;
        if (!el.clientHeight) return;
        while (el.scrollHeight > el.clientHeight + 1 && size > 22) { size -= 2; el.style.fontSize = size + 'px'; el.style.lineHeight = '1.08'; }
      };
      H.spans = []; H.sentences = []; H.active = 0; H.text = '';
      H.setActive = function (i) {
        H.active = i;
        for (var k = 0; k < H.spans.length; k++) H.spans[k].classList.toggle('dim', H.sentences.length > 1 && +H.spans[k].dataset.s !== i);
      };
      H.onWord = function (i) { for (var k = 0; k < H.spans.length; k++) H.spans[k].classList.toggle('on', k <= i || i >= H.spans.length); };
      H.reset = function () { for (var k = 0; k < H.spans.length; k++) H.spans[k].classList.remove('on'); };
      H.speak = function (rate) { return Voice.say(H.text, { rate: rate || 0.9, onWord: H.onWord }); };
      H.hl = function (words) {
        for (var k = 0; k < H.spans.length; k++) {
          var sp = H.spans[k];
          sp.classList.toggle('hl', !!words && words.indexOf(sp.dataset.k) >= 0 && +sp.dataset.s === H.active);
        }
      };

      /* ---- coach, tangan, glow ---- */
      /* peta penuh: scene mengisi H.coachAvoid (kotak yang jangan ditutup); kotak pelatih memilih posisi bawah (kiri/tengah/kanan) yang paling sedikit menabrak */
      function placeCoach() {
        var rects = H.coachAvoid && H.coachAvoid(); if (!rects) return;
        var bottom = H.coach.offsetTop + H.coach.offsetHeight, top = H.coach.offsetTop, best = 24, min = Infinity;
        [24, 415, 806].forEach(function (x) {
          var mine = [{ x: x, y: top, w: 450, h: bottom - top }, { x: x - 6, y: top - 110, w: 100, h: 110 }], n = 0;   // badan kotak + potret kurir di atasnya
          rects.forEach(function (r) { if (mine.some(function (q) { return q.x < r.x + r.w && q.x + q.w > r.x && q.y < r.y + r.h && q.y + q.h > r.y; })) n++; });
          if (n < min) { min = n; best = x; }
        });
        H.coach.style.left = best + 'px';
      }
      H.showCoach = function (text, sticky, expr) {
        H.coachPortrait.expr = null; H.coachPortrait.set(expr || 'call');
        H.coach.style.display = 'flex'; H.coach.querySelector('.t').textContent = text; H.coach.dataset.text = text;
        placeCoach();
        var seq = ++H.coachSeq;
        H.coach.style.transform = 'scale(.85)';
        Tween.run(260, function (e) { H.coach.style.transform = 'scale(' + (0.85 + 0.15 * e) + ')'; }, Ease.easeOutBack);
        if (!sticky) Tween.wait(5500).then(function () { if (seq === H.coachSeq) H.coach.style.display = 'none'; });
      };
      H.hideCoach = function () { H.coachSeq++; H.coach.style.display = 'none'; };
      /* (x,y) = posisi UJUNG JARI (gambar baru) ; dir 'up' = jari ke kiri-atas (badan di kanan-bawah), 'down' = jari ke kiri-bawah, badan di kanan-atas (tidak menutupi tombol).
         Cadangan SVG lama: tetap memakai geseran lama. */
      H.showHandAt = function (x, y, dir) {
        var h = H.hand, nw = H.handNew, ox = nw ? 70 : 80, oy = nw ? (dir === 'down' ? 60 : 50) : 40;
        if (nw) h.firstChild.style.transform = dir === 'down' ? 'rotate(-90deg)' : 'none';
        if (!nw) { x += 0; }
        if (!H.handOn) { h.style.left = (x + ox) + 'px'; h.style.top = (y + oy) + 'px'; h.style.display = 'block'; H.handOn = true; }
        var from = { x: parseFloat(h.style.left), y: parseFloat(h.style.top) };
        Tween.run(520, function (e) { h.style.left = (from.x + (x - from.x) * e) + 'px'; h.style.top = (from.y + (y - from.y) * e) + 'px'; }, Ease.easeInOutCubic);
      };
      H.showHandBtn = function (cmd) {
        var b = H.btns[cmd] || H.kata, cx = parseFloat(b.style.left) + parseFloat(b.style.width) / 2, ty = parseFloat(b.style.top);
        if (H.handNew) H.showHandAt(cx, ty + 12, 'down'); else H.showHandAt(cx + 40, ty + 48);
      };      H.hideHand = function () { H.hand.style.display = 'none'; H.handOn = false; };
      H.glow = function (cmd) {
        for (var k in H.btns) H.btns[k].classList.remove('glow');
        H.kata.classList.remove('glow');
        if (cmd) (H.btns[cmd] || H.kata).classList.add('glow');
      };
      H.setMoveEnabled = function (on) { for (var k in H.btns) H.btns[k].disabled = !on; };
      H.diagram = function (rel) {
        if (!rel) { H.diagramEl.style.display = 'none'; return; }
        H.diagramEl.innerHTML = '<svg viewBox="0 0 300 120" width="312" height="132" style="display:block">' + Art.relDiagram(rel) + '</svg>';
        H.diagramEl.style.display = 'block';
      };

      H.setCoins = function (n) {
        var from = H.coins; H.coins = n; UI.countUp(H.coinEl, from, n, 500); Aud.sfx('coin');
      };
      H.setMission = function (t) { H.missionEl.textContent = t; };
      H.banner = function (text) {
        var b = U.h('div', 'panel'); b.classList.add('k-banner');
        b.textContent = text; layer.appendChild(b);
        Tween.run(380, function (e) { b.style.transform = 'rotate(-4deg) scale(' + (2 - e) + ')'; b.style.opacity = Math.min(1, e * 3); }, Ease.easeOutBack);
        return Tween.wait(1700).then(function () { b.remove(); });
      };
      return H;
    },

    /* pelanggan gambar seluruh badan (assets.js cust_c<n>_{idle,happy,confused}); null bila gambar tidak ada -> SVG lama */
    custSprite: function (layer, n) {
      var L = window.ASSETS.list, b = L['cust_c' + n + '_idle'];
      if (!n || !b || !Assets.has('cust_c' + n + '_idle') || !Assets.has('cust_c' + n + '_happy') || !Assets.has('cust_c' + n + '_confused')) return null;
      var g = UI.g(layer, '<image class="ci" x="' + (-b.px) + '" y="' + (-b.py) + '" width="' + b.w + '" height="' + b.h + '" href="' + window.ASSETS.dir + b.file + '"/>', ''), im = g.firstChild;
      g.setAttribute('opacity', 0);
      return {
        g: g,
        pose: function (nm) { im.setAttribute('href', window.ASSETS.dir + L['cust_c' + n + '_' + nm].file); },
        /* pijak di (x,y), tinggi isi h px */
        put: function (x, y, h, op, rot) {
          g.setAttribute('transform', 'translate(' + x + ',' + y + ') rotate(' + (rot || 0) + ') scale(' + (h / b.ch) + ')');
          g.setAttribute('opacity', op == null ? 1 : op);
        }
      };
    },
    /* pelanggan muncul dari pintu (geser keluar + pantulan kecil), makin besar saat melangkah mendekat (perspektif). doorH = tinggi pintu */
    custExit: async function (cs, door, to, doorH, finalH) {
      var h0 = Math.max(10, doorH * 0.9);
      await Tween.run(360, function (e) {
        var k = Ease.easeOutBack(e);
        cs.put(door.x, door.y + (1 - Math.min(1, e)) * 3, h0 * (0.45 + 0.55 * Math.min(1.12, k)), Math.min(1, e * 3));
      }, Ease.linear);
      var pos = { x: door.x, y: door.y };
      await Tween.run(1150, function (e) {
        var x = door.x + (to.x - door.x) * e, y = door.y + (to.y - door.y) * e, h = h0 + (finalH - h0) * e;
        cs.put(x, y - Math.abs(Math.sin(e * Math.PI * 4)) * finalH * 0.035 * Math.min(1, e * 3), h);
      }, Ease.easeInOutCubic);
      cs.put(to.x, to.y, finalH);
    },
    /* alamat salah: penghuni melongok bingung dari pintu lalu masuk lagi (tidak memblokir) */
    peek: async function (o) {
      var cs = Kit.custSprite(o.layer, o.cust); if (!cs) return;
      cs.pose('confused');
      var hp = o.peekH || Math.max(50, o.doorH * 2.2);
      await Tween.run(300, function (e) { cs.put(o.door.x, o.door.y + (1 - e) * 6, hp * (0.5 + 0.5 * Ease.easeOutBack(e)), Math.min(1, e * 3)); }, Ease.linear);
      await Tween.run(900, function (e) { cs.put(o.door.x, o.door.y, hp, 1, Math.sin(e * 18) * 4 * (1 - e)); }, Ease.linear);
      await Tween.run(220, function (e) { cs.put(o.door.x, o.door.y + e * 6, hp * (1 - 0.4 * e), 1 - e); }, Ease.linear);
      cs.g.remove();
    },

    /* serah terima paket: pelanggan keluar dari pintu o.door (jika ada gambar) lalu mendekat ke o.to */
    deliver: async function (o) {
      // o: {custG, pkgG, fx, from:{x,y}, to:{x,y}, pkgFrom:{x,y}, person, cust, doorH, finalH, rnd, onCheer()}
      var cs = Kit.custSprite(o.custG, o.cust), pg, pp, pos = { x: o.from.x, y: o.from.y };
      if (cs) {
        await Kit.custExit(cs, o.from, o.to, o.doorH || 44, o.finalH || 175);
        pg = cs.g;
      } else {
        pg = UI.g(o.custG, Art.person(o.person, true), 'translate(' + o.from.x + ',' + o.from.y + ')');
        pp = pg.querySelector('.person'); pp.classList.add('run');
        await Tween.to(pos, { x: o.to.x, y: o.to.y }, 1150, Ease.easeInOutCubic, function () { pg.setAttribute('transform', 'translate(' + pos.x + ',' + pos.y + ')'); });
        pp.classList.remove('run');
      }
      var pk = null;   // sprite pelanggan sudah memegang paket di gambarnya: paket SVG hanya untuk cadangan tanpa gambar
      if (cs) await Tween.wait(450);
      else {
        pk = UI.g(o.pkgG, Art.pkg(), 'translate(' + o.pkgFrom.x + ',' + o.pkgFrom.y + ')');
        var p0 = { x: o.pkgFrom.x, y: o.pkgFrom.y };
        await Tween.to(p0, { x: o.to.x, y: o.to.y - 62 }, 450, Ease.easeInOutCubic, function () { pk.setAttribute('transform', 'translate(' + p0.x + ',' + p0.y + ')'); });
      }
      Aud.sfx('handoff');
      if (cs) { cs.pose('happy'); var fh = o.finalH || 175; Tween.run(520, function (e) { cs.put(o.to.x, o.to.y - Math.abs(Math.sin(e * Math.PI * 2)) * fh * 0.07 * (1 - e), fh); }, Ease.linear); } else pp.classList.add('cheer');
      if (o.onCheer) o.onCheer();
      UI.burst(o.fx, o.to.x, o.to.y - (o.finalH || 175) * 0.7, 14);
      Aud.sfx('good');
      var thx = U.pick(o.rnd, SENT.thanks).text, bub = null;
      var fh2 = o.finalH || 175;
      if (o.layer) bub = Kit.bubble(o.layer, thx, { x: o.to.x, top: o.to.y - fh2, bottom: o.to.y, w: fh2 * 0.5 }, o.avoid || []);
      Voice.say(thx, { rate: 0.95 });
      await Tween.wait(900);
      var cleanup = function () { if (bub) bub.close(); pg.remove(); if (pk) pk.remove(); };
      cleanup.hideBubble = function () { if (bub) bub.close(); };   // balon menutup sebelum spanduk "Paket terkirim!" agar tidak saling menutupi
      return cleanup;
    },

    /* balon ucapan tepat di atas kepala penerima (ekornya menunjuk kepala). head = {x, top, bottom, w}: kotak karakter di koordinat panggung.
       Menghindari kotak karakter/kurir (avoid) dan area HUD/tombol; bila atas penuh, pindah ke samping kepala. Kembali {el, close()} */
    bubble: function (layer, text, head, avoid) {
      var el = U.h('div', 'panel spk'); el.classList.add('k-coach');
      el.textContent = text; layer.appendChild(el);
      var w = el.offsetWidth, h = el.offsetHeight, GAP = 24, YMIN = 142, YMAX = 600, XMIN = 16, XMAX = 1264;
      var hr = { x: head.x - head.w / 2, y: head.top, w: head.w, h: head.bottom - head.top };
      var obs = [hr].concat(avoid);
      function hit(r) { for (var i = 0; i < obs.length; i++) { var q = obs[i]; if (r.x < q.x + q.w && r.x + r.w > q.x && r.y < q.y + q.h && r.y + r.h > q.y) return q; } return null; }
      var cands = [
        { side: 'down', x: head.x - w / 2, y: head.top - GAP - h },
        { side: 'right', x: head.x + head.w / 2 + GAP, y: head.top + 10 },
        { side: 'left', x: head.x - head.w / 2 - GAP - w, y: head.top + 10 }
      ], pick = null, best = null;
      for (var i = 0; i < cands.length && !pick; i++) {
        var c = cands[i], r = { x: c.x, y: c.y, w: w, h: h };
        for (var t = 0; t < 4; t++) {   // geser menjauhi penghalang horizontal, lalu jepit ke area aman
          var q = hit(r); if (!q || q === hr || c.side !== 'down') break;
          r.x = (r.x + w / 2 < q.x + q.w / 2) ? q.x - w - 8 : q.x + q.w + 8;
          r.x = Math.max(XMIN, Math.min(XMAX - w, r.x));
        }
        r.x = Math.max(XMIN, Math.min(XMAX - w, r.x)); r.y = Math.max(YMIN, Math.min(YMAX - h, r.y));
        c.x = r.x; c.y = r.y;
        if (!hit(r)) pick = c; else if (!best) best = c;
      }
      pick = pick || best || cands[0];
      el.style.left = pick.x + 'px'; el.style.top = pick.y + 'px';
      // ekor: segitiga menunjuk kepala
      var tail = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); tail.setAttribute('width', 36); tail.setAttribute('height', 30); tail.setAttribute('viewBox', '0 0 36 30');
      tail.style.cssText = 'position:absolute;overflow:visible;pointer-events:none';
      var pts, tx, ty;
      if (pick.side === 'down') {
        tx = Math.max(24, Math.min(w - 60, head.x - pick.x - 18)); tail.style.left = tx + 'px'; tail.style.top = (h - 6) + 'px';
        pts = '2,0 34,0 18,28'; el.style.transformOrigin = (tx + 18) + 'px ' + (h + 22) + 'px';
      } else {
        ty = Math.max(10, Math.min(h - 40, head.top + 24 - pick.y)); tail.style.top = ty + 'px';
        if (pick.side === 'right') { tail.style.left = '-30px'; pts = '34,2 34,28 2,15'; el.style.transformOrigin = '-20px 50%'; }
        else { tail.style.left = (w - 6) + 'px'; pts = '2,2 2,28 34,15'; el.style.transformOrigin = (w + 20) + 'px 50%'; }
      }
      tail.innerHTML = '<polygon points="' + pts + '" fill="#FFF4DC" stroke="#2B2D42" stroke-width="4" stroke-linejoin="round"/>' +
        '<line x1="' + (pick.side === 'down' ? '5' : pick.side === 'right' ? '35' : '1') + '" y1="' + (pick.side === 'down' ? '-1' : '3') + '" x2="' + (pick.side === 'down' ? '31' : pick.side === 'right' ? '35' : '1') + '" y2="' + (pick.side === 'down' ? '-1' : '27') + '" stroke="#FFF4DC" stroke-width="7"/>';
      el.appendChild(tail);
      var reduce = Save && Save.data && Save.data.settings && Save.data.settings.reduce;
      Tween.value(0, 1, reduce ? 1 : 280, Ease.easeOutBack, function (v) { el.style.opacity = Math.min(1, v * 1.5); el.style.transform = 'scale(' + Math.max(0.01, v) + ')'; });
      return {
        el: el, side: pick.side,
        close: function () {
          if (!el.parentNode) return;
          Tween.value(1, 0, reduce ? 1 : 180, Ease.easeInOutCubic, function (v) { el.style.opacity = v; el.style.transform = 'scale(' + (0.8 + 0.2 * v) + ')'; }).then(function () { el.remove(); });
        }
      };
    }
  };
})();
