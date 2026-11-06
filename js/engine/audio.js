/* Audio: SFX + musik sintesis WebAudio, ducking, dan Voice (speechSynthesis + karaoke) */
(function (root) {
  var A = {
    ctx: null, master: null, sfxBus: null, musicBus: null, duckGain: null,
    muted: false, hidden: false, musicOn: false, mood: 'play', streak: 0, _timer: 0, _next: 0, _beat: 0,

    init: function () {
      if (A.ctx) { if (A.ctx.state === 'suspended' && !A.hidden) A.ctx.resume(); return; }
      var AC = root.AudioContext || root.webkitAudioContext;
      if (!AC) return;
      try {
        var c = A.ctx = new AC();
        var comp = c.createDynamicsCompressor();
        A.master = c.createGain(); A.sfxBus = c.createGain(); A.musicBus = c.createGain(); A.duckGain = c.createGain();
        A.sfxBus.gain.value = 0.9; A.musicBus.gain.value = 0.16;
        A.sfxBus.connect(A.master);
        A.bgmBus = c.createGain(); A.bgmBus.gain.value = 0.55;   // semua lagu disamakan ke keras gameplay lewat _trackGain
        A.bgmBus.connect(A.duckGain);
        A.musicBus.connect(A.duckGain); A.duckGain.connect(A.master);
        A.master.connect(comp); comp.connect(c.destination);
        A.applyMute();
      } catch (e) { A.ctx = null; }
    },
    applyMute: function () {
      if (!A.master) return;
      A.master.gain.setTargetAtTime(A.muted || A.hidden ? 0 : 1, A.ctx.currentTime, 0.02);
    },
    setMuted: function (m) { A.muted = m; A.applyMute(); },
    setHidden: function (hid) {
      A.hidden = hid; A.applyMute();
      if (!A.ctx) return;
      if (hid) A.ctx.suspend(); else A.ctx.resume();
    },
    duck: function (on) {
      if (!A.duckGain) return;
      A.duckGain.gain.setTargetAtTime(on ? 0.25 : 1, A.ctx.currentTime, 0.08);
    },

    tone: function (f, t0, dur, type, vol, bus, f2) {
      var c = A.ctx; if (!c) return;
      var o = c.createOscillator(), g = c.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(f, t0);
      if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol || 0.2, t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g); g.connect(bus || A.sfxBus);
      o.start(t0); o.stop(t0 + dur + 0.05);
    },
    noise: function (t0, dur, vol, freq, bus) {
      var c = A.ctx; if (!c) return;
      var n = Math.floor(c.sampleRate * dur), buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
      var s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
      s.buffer = buf; f.type = 'lowpass'; f.frequency.value = freq || 1500;
      g.gain.value = vol || 0.2;
      s.connect(f); f.connect(g); g.connect(bus || A.sfxBus); s.start(t0);
    },
    rnd: function (arr) { return arr[Math.floor(Math.random() * arr.length)]; },
    /* denting logam: parsial tak-harmonik (rasio bel) dengan peluruhan tiap parsial berbeda */
    metal: function (f, t0, dur, vol) {
      [[1, 1, 1], [2.76, 0.5, 0.6], [5.4, 0.28, 0.35], [8.93, 0.14, 0.2]].forEach(function (p) {
        A.tone(f * p[0], t0, dur * p[2], 'sine', vol * p[1]);
      });
    },
    /* klik rantai berulang selama kurir mengayuh: jitter waktu + aksen tiap 4 klik; berhenti sendiri bila lupa dimatikan */
    ride: function (on) {
      var c = A.ctx;
      clearInterval(A._rideT); clearTimeout(A._rideStop);
      if (!on || !c || A.muted || A.hidden) { A._riding = false; return; }
      A._riding = true; A._rn = 0; A._rnext = c.currentTime + 0.02;
      var step = function () {
        if (!A.ctx || A.hidden) return;
        while (A._rnext < A.ctx.currentTime + 0.25) {
          var acc = A._rn % 4 === 0, tt = A._rnext;
          A.noise(tt, 0.012, acc ? 0.1 : 0.065, 3000 + Math.random() * 2500);
          A.tone(acc ? 1900 : 2500 + Math.random() * 400, tt, 0.012, 'square', acc ? 0.022 : 0.012);
          if (acc) A.noise(tt, 0.05, 0.02, 900);
          A._rn++; A._rnext += 0.085 + Math.random() * 0.02;
        }
      };
      step(); A._rideT = setInterval(step, 80);
      A._rideStop = setTimeout(function () { A.ride(false); }, 4000);
    },
    /* suasana kota sangat pelan: desis angin + kicau burung acak; lewat duckGain sehingga ikut turun saat arahan */
    ambience: function (on) {
      var c = A.ctx; if (!c) return;
      clearTimeout(A._birdT);
      if (!on) {
        if (A._amb) { var g0 = A._amb.g; g0.gain.cancelScheduledValues(c.currentTime); g0.gain.setTargetAtTime(0, c.currentTime, 0.3);
          var s0 = A._amb.s; setTimeout(function () { try { s0.stop(); } catch (e) { } }, 1500); A._amb = null; }
        return;
      }
      if (A._amb) return;
      var n = c.sampleRate * 2, buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0), last = 0;
      for (var i = 0; i < n; i++) { last = (last + (Math.random() * 2 - 1) * 0.1) / 1.02; d[i] = last * 3; }   // desis lembut (noise cokelat)
      for (i = 0; i < 2000; i++) d[n - 1 - i] = d[n - 1 - i] * (i / 2000) + d[2000 - 1 - i] * (1 - i / 2000);   // sambungan mulus
      var s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(), lfo = c.createOscillator(), lg = c.createGain();
      s.buffer = buf; s.loop = true; f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 0.4;
      g.gain.value = 0.0001; g.gain.setTargetAtTime(0.0055, c.currentTime, 1.2);
      lfo.frequency.value = 0.17; lg.gain.value = 0.002; lfo.connect(lg); lg.connect(g.gain); lfo.start();
      s.connect(f); f.connect(g); g.connect(A.duckGain); s.start();
      A._amb = { s: s, g: g };
      var bird = function () {
        A._birdT = setTimeout(bird, 2500 + Math.random() * 5500);
        if (!A.ctx || A.hidden || A.muted || !A._amb) return;
        var t = A.ctx.currentTime + 0.02, f0 = 2400 + Math.random() * 1900, kind = Math.floor(Math.random() * 3), k;
        var pan = c.createStereoPanner ? c.createStereoPanner() : null; if (pan) { pan.pan.value = Math.random() * 1.4 - 0.7; pan.connect(A.duckGain); }
        var chirp = function (ff, t0, dur, ff2) {
          var o = c.createOscillator(), og = c.createGain();
          o.type = 'sine'; o.frequency.setValueAtTime(ff, t0); o.frequency.exponentialRampToValueAtTime(ff2, t0 + dur);
          og.gain.setValueAtTime(0.0001, t0); og.gain.exponentialRampToValueAtTime(0.022, t0 + dur * 0.2); og.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
          o.connect(og); og.connect(pan || A.duckGain); o.start(t0); o.stop(t0 + dur + 0.03);
        };
        if (kind === 0) { for (k = 0; k < 2 + Math.floor(Math.random() * 2); k++) chirp(f0 * (1 + k * 0.08), t + k * 0.13, 0.09, f0 * 1.25); }          // "tit-tit"
        else if (kind === 1) { for (k = 0; k < 6; k++) chirp(f0, t + k * 0.055, 0.04, f0 * 1.1); }                                                     // trill cepat
        else { chirp(f0 * 1.2, t, 0.28, f0 * 0.8); chirp(f0 * 0.9, t + 0.34, 0.2, f0 * 1.15); }                                                       // siul turun-naik
      };
      A._birdT = setTimeout(bird, 1200);
    },
    sfx: function (name, arg) {
      var c = A.ctx; if (!c || A.muted || A.hidden) return;
      var t = c.currentTime, i;
      switch (name) {
        case 'click': A.tone(640, t, 0.07, 'triangle', 0.18, null, 420); break;
        case 'bell': {   // bel sepeda: dua denting logam (sebagian tak-harmonik), nada & jarak sedikit berbeda tiap kali
          var bf = A.rnd([1568, 1661, 1760, 1865]) * (1 + (Math.random() - 0.5) * 0.02), gap = 0.13 + Math.random() * 0.05;
          A.metal(bf, t, 0.75, 0.15); A.metal(bf * 1.015, t + gap, 0.95, 0.17);
          A.noise(t, 0.012, 0.05, 7000); A.noise(t + gap, 0.012, 0.05, 7000);   // klik palu bel
          break;
        }
        case 'phone': {  // dering telepon kartun: dua rentetan nada bergetar + "bwip" awal
          var p0 = A.rnd([1, 1.06, 0.94]), n = 10 + Math.floor(Math.random() * 3);
          A.tone(500 * p0, t, 0.07, 'sine', 0.16, null, 1000 * p0);
          for (i = 0; i < 2; i++) for (var k = 0; k < n; k++) {
            var tt = t + 0.1 + i * 0.62 + k * 0.034, ff = (k % 2 ? 1180 : 1480) * p0;
            A.tone(ff, tt, 0.03, 'square', 0.09); A.tone(ff * 2.01, tt, 0.03, 'sine', 0.07);
          }
          break;
        }
        case 'chain': A.ride(true); break;
        case 'handoff': {   // serah terima paket: gesek kertas + bunyi buk lembut + dua nada ramah
          A.noise(t, 0.16, 0.1, 3200); A.noise(t + 0.05, 0.1, 0.07, 5200);
          A.tone(150 * A.rnd([1, 1.08, 0.93]), t + 0.12, 0.14, 'sine', 0.3, null, 80);
          A.tone(659, t + 0.2, 0.16, 'triangle', 0.12); A.tone(880, t + 0.3, 0.22, 'triangle', 0.12);
          break;
        }
        case 'good': {
          var up = Math.pow(2, Math.min(5, A.streak) / 12);   // nada naik tiap jawaban benar beruntun
          A.streak++;
          [523, 659, 784, 1047].forEach(function (f, n) { A.tone(f * up, t + n * 0.07, 0.18, 'triangle', 0.2); });
          break;
        }
        case 'bad': A.streak = 0; A.tone(260, t, 0.22, 'sine', 0.13, null, 190); break;
        case 'tick': A.tone(1568, t, 0.03, 'square', 0.04); break;
        case 'unlock': [523, 784, 1047].forEach(function (f, n) { A.tone(f, t + n * 0.09, 0.25, 'triangle', 0.18); }); A.tone(2093, t + 0.3, 0.4, 'sine', 0.08); break;
        case 'fanfare': {   // arg = jumlah bintang (0-3)
          var seq = [[392, 523], [392, 523, 659], [392, 523, 659, 784], [392, 523, 659, 784, 1047, 1319]][Math.max(0, Math.min(3, arg || 0))];
          seq.forEach(function (f, n) { A.tone(f, t + n * 0.11, 0.3, 'triangle', 0.2); A.tone(f / 2, t + n * 0.11, 0.3, 'sine', 0.1); });
          break;
        }
        case 'coin': A.tone(1318, t, 0.06, 'square', 0.07); A.tone(1760, t + 0.05, 0.12, 'square', 0.07); break;
        case 'whoosh': A.noise(t, 0.35, 0.12, 900); break;
        case 'stamp': {   // stempel: ketukan karet berat + gesek tinta/kertas + denting kecil; dua variasi tinggi nada
          var sp = A.rnd([1, 0.88, 1.12]);
          A.noise(t, 0.09, 0.55, 420); A.tone(130 * sp, t, 0.16, 'sine', 0.5, null, 55);
          A.noise(t + 0.015, 0.05, 0.12, 4200);
          A.tone(980 * sp, t + 0.09, 0.22, 'triangle', 0.09); A.metal(1568 * sp, t + 0.1, 0.35, 0.05);
          break;
        }
        case 'star': A.tone([523, 659, 784, 1047, 1319, 1568][Math.min(5, arg || 0)], t, 0.4, 'triangle', 0.22); A.tone([1047, 1319, 1568][Math.min(2, arg || 0)], t + 0.02, 0.5, 'sine', 0.07); break;
        case 'empty': A.tone(330, t, 0.16, 'sine', 0.08, null, 280); break;
        case 'pop': A.tone(500, t, 0.08, 'sine', 0.15, null, 900); break;
        /* lampu lalu lintas: tiap warna punya bunyi sendiri (bukan hanya warna): merah = dua nada turun, kuning = satu denting, hijau = tiga nada naik */
        case 'tl_red': A.tone(392, t, 0.16, 'triangle', 0.16); A.tone(294, t + 0.15, 0.24, 'triangle', 0.16); break;
        case 'tl_yellow': A.tone(698, t, 0.12, 'sine', 0.15); break;
        case 'tl_green': [523, 659, 784].forEach(function (f, n) { A.tone(f, t + n * 0.08, 0.16, 'triangle', 0.16); }); break;
      }
    },

    /* musik: loop 16 ketukan, pentatonik C, dijadwalkan dengan lookahead. Suasana: calm (judul/menu), play (semua level) */
    MOODS: {
      calm: { bpm: 92, vol: 0.8, mel: [4, -1, 2, -1, 0, -1, 2, 4, -1, 5, -1, 4, 2, -1, 0, -1], bass: [130.8, 98, 110, 87.3], hat: false },
      play: { bpm: 112, vol: 1, mel: [0, 2, 4, 2, 5, 4, 2, 0, 4, 5, 7, 5, 4, 2, 4, -1], bass: [130.8, 110, 87.3, 98], hat: true }
    },
    /* Musik utama: loop mp3 (js/data/music.js, data URI agar jalan lewat file://). Sintesis di bawah = CADANGAN
       bila data musik tidak ada / gagal didekode. */
    TRACK: { calm: 'title', play: 'gameplay' },
    /* penguat per lagu agar sama keras dengan musik saat bermain (dari nilai LUFS di assets.js) */
    _trackGain: function (k) {
      var au = root.ASSETS && root.ASSETS.audio, a = au && au['bgm_' + k], ref = au && au.bgm_gameplay;
      return a && ref ? Math.pow(10, (ref.lufs - a.lufs) / 20) : 1;
    },
    bufs: {}, _src: null, _srcGain: null, _decoding: false,
    _req: {},
    /* muat malas: satu <script> data per lagu (js/data/music_<nama>.js), lalu dekode. Gagal = tetap sintesis. */
    loadTrack: function (k) {
      if (A._req[k] || !A.ctx || !root.document) return;
      A._req[k] = true;
      var decode = function () {
        try {
          var b64 = root.MUSIC[k].split(',')[1], bin = atob(b64), u = new Uint8Array(bin.length);
          for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
          var done = function (buf) { A.bufs[k] = buf; if (A.musicOn && A.TRACK[A.mood] === k) A._startTrack(); };
          var p = A.ctx.decodeAudioData(u.buffer, done, function () { });
          if (p && p.catch) p.catch(function () { });
        } catch (e) { }
      };
      if (root.MUSIC && root.MUSIC[k]) { decode(); return; }
      var s = root.document.createElement('script');
      s.src = 'js/data/music_' + k + '.js'; s.onload = decode; s.onerror = function () { };
      root.document.head.appendChild(s);
    },
    _stopTrack: function (fade) {
      var s = A._src, g = A._srcGain; A._src = A._srcGain = null;
      if (!s) return;
      var t = A.ctx.currentTime;
      g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(0, t + fade);
      try { s.stop(t + fade + 0.05); } catch (e) { }
    },
    _startTrack: function () {
      var buf = A.bufs[A.TRACK[A.mood]]; if (!buf) return false;
      A._stopTrack(0.6);
      var c = A.ctx, s = c.createBufferSource(), g = c.createGain(), t = c.currentTime;
      s.buffer = buf; s.loop = true; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(A._trackGain(A.TRACK[A.mood]), t + 0.6);
      s.connect(g); g.connect(A.bgmBus); s.start(t);
      A._src = s; A._srcGain = g;
      clearInterval(A._timer);   // hentikan sintesis cadangan
      return true;
    },
    music: function (on, mood) {
      mood = mood || 'play';
      if (!A.ctx) { A.musicOn = false; return; }
      if (on && A.musicOn && mood === A.mood) return;
      if (!on && !A.musicOn) return;
      A.musicOn = on; A.mood = mood;
      clearInterval(A._timer);
      if (!on) { A._stopTrack(0.4); A.ambience(false); A.ride(false); return; }
      A.ambience(true);
      A.loadTrack(A.TRACK[mood]);
      if (!A._pre) { A._pre = true; setTimeout(function () { Object.keys(A.TRACK).forEach(function (m) { A.loadTrack(A.TRACK[m]); }); }, 4000); }
      if (A._startTrack()) return;
      A._stopTrack(0.3);
      // data belum siap/tidak ada: sintesis cadangan (berpindah ke mp3 begitu siap)
      A._next = A.ctx.currentTime + 0.1; A._beat = 0;
      A._timer = setInterval(A._sched, 100);
    },
    _sched: function () {
      var c = A.ctx; if (!c || A.hidden) return;
      var M = A.MOODS[A.mood] || A.MOODS.play, spb = 60 / M.bpm, mel = M.mel;
      var pent = [261.6, 293.7, 329.6, 392, 440, 523.3, 587.3, 659.3, 784];
      while (A._next < c.currentTime + 0.3) {
        var b = A._beat, n = mel[b % mel.length];
        if (n >= 0) A.tone(pent[n % pent.length] * (n >= 5 ? 1 : 2), A._next, spb * 0.9, 'triangle', 0.5 * M.vol, A.musicBus);
        if (b % 4 === 0) A.tone(M.bass[Math.floor(b / 4) % 4], A._next, spb * 1.8, 'sine', 0.9 * M.vol, A.musicBus);
        if (M.hat && b % 2 === 1) A.noise(A._next, 0.03, 0.08, 6000, A.musicBus);
        A._next += spb; A._beat++;
      }
    }
  };
  /* Voice: speechSynthesis en-US + karaoke. Selalu selesai (tidak ada softlock). */
  var V = {
    token: 0,
    voice: function (lang) {
      var ss = root.speechSynthesis; if (!ss) return null;
      var vs = ss.getVoices() || [], pre = lang.slice(0, 2), best = null;
      for (var i = 0; i < vs.length; i++) {
        if (vs[i].lang === lang || vs[i].lang.replace('_', '-') === lang) return vs[i];
        if (!best && vs[i].lang.slice(0, 2) === pre) best = vs[i];
      }
      return best;
    },
    available: function () { return !!root.speechSynthesis && !U.TEST; },
    stop: function () {
      V.token++;
      try { if (root.speechSynthesis) root.speechSynthesis.cancel(); } catch (e) { }
      A.duck(false);
    },
    /* opts: rate, lang, onWord(i) (i = indeks kata yang sedang dibaca, words.length = selesai) */
    say: function (text, opts) {
      opts = opts || {};
      V.stop();
      var my = V.token, words = text.split(/\s+/), rate = opts.rate || 0.9, lang = opts.lang || 'en-US';
      var perWord = U.TEST ? 0.02 : 0.42 / rate, total = words.length * perWord + 0.3;
      var finished = false, sawBoundary = false;
      A.duck(true);
      function mark(i) { if (my === V.token && opts.onWord) opts.onWord(i); }
      return new Promise(function (resolve) {
        function finish() {
          if (finished) return; finished = true;
          if (my === V.token) { mark(words.length); A.duck(false); }
          resolve();
        }
        // karaoke berbasis waktu (cadangan bila tidak ada event boundary)
        var acc = 0;
        for (var i = 0; i < words.length; i++) (function (idx) {
          Tween.wait(acc * 1000 / Tween.speed).then(function () { if (!sawBoundary && !finished) mark(idx); });
          acc += perWord;
        })(i);
        Tween.wait((total + 0.9) * 1000 / Tween.speed).then(finish);
        var vc = V.available() ? V.voice(lang) : null;
        if (V.available() && !A.muted && (vc || lang === 'en-US')) {
          try {
            var u = new SpeechSynthesisUtterance(text);
            u.lang = lang; u.rate = rate; u.pitch = 1.05;
            var v = V.voice(lang); if (v) u.voice = v;
            u.onboundary = function (e) {
              if (e.name && e.name !== 'word') return;
              sawBoundary = true;
              var idx = text.slice(0, e.charIndex).split(/\s+/).length - 1;
              if (text.slice(0, e.charIndex).length === 0) idx = 0;
              mark(Math.max(0, Math.min(words.length - 1, idx)));
            };
            u.onend = finish;
            u.onerror = function () { /* timer akan menyelesaikan */ };
            root.speechSynthesis.speak(u);
          } catch (e) { /* abaikan, subtitle tetap jalan */ }
        }
      });
    }
  };
  root.Aud = A;
  root.Voice = V;
})(typeof window !== 'undefined' ? window : globalThis);
