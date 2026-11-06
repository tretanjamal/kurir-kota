/* Daftar level. scene: 'play' (peta berputar) atau 'playmap' (peta diam). */
window.LV = [
  { n: 1, id: 'l1', scene: 'play', name: 'Latihan Arah', sub: 'go straight, turn left, turn right', missions: 3 },
  { n: 2, id: 'l2', scene: 'play', name: 'Tempat Umum', sub: 'bank, library, park, market ...', missions: 4 },
  { n: 3, id: 'l3', scene: 'playmap', name: 'Posisi', sub: 'next to, opposite, between, near', missions: 4 },
  { n: 4, id: 'boss', scene: 'playmap', name: 'Paket Kilat', sub: '3 alamat berurutan', missions: 3 },
  { n: 5, id: 'turis', scene: 'turis', name: 'Turis Tersesat', sub: 'pilih arahan yang benar', missions: 3 }
];
window.LV.done = function (n) { var l = Save.data.levels[LV[n - 1].id]; return !!(l && l.stars > 0); };
window.LV.unlocked = function (n) { return n === 1 || LV.done(n - 1); };
window.LV.start = function (n) { return LV.unlocked(n) ? Scenes.go(LV[n - 1].scene, { level: n }) : Scenes.go('levels'); };
