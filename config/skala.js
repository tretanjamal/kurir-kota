/* Acuan skala tunggal: satuan dasar = tinggi orang dewasa (1.0). Semua ukuran objek di peta diturunkan dari sini.
   Pandangan (view):
   - 'dekat' : peta berputar L1/L2, perspektif. Tinggi dewasa A(y) naik linear dari cakrawala (y=296) ke dasar layar (y=570).
   - 'peta'  : peta kisi L3/Bos. Bangunan/pohon digambar kecil (satuan petak), kurir/pelanggan lebih besar agar terbaca di 800x360
               (pembesaran karakter disengaja, rasio antarkarakter dan antarpetak tetap konsisten).
   - 'judul' : layar judul, satu satuan tetap. */
(function (root) {
  var UNIT = {
    adult: 1, child: 0.72, courier: 0.4,      // kurir di sepeda; di peta berputar tidak boleh lebih tinggi dari mobil
    door: 1.12,                                // pintu sedikit lebih tinggi dari dewasa
    car: 0.84, bus: 0.92,                     // di peta berputar mobil digambar di jalan yang lebih jauh dari kurir; dikali agar tampil >= kurir
    lamp: 2.0, light: 0.8,                      // lampu lalu lintas: sedikit lebih tinggi dari kurir, lebih pendek dari rumah
    tree_round: 2.8, tree_tall: 3.0, tree_palm: 3.0,
    bush: 0.7, flower: 0.4,
    house: 4.0, building: 5.5
  };
  var VIEW = {
    dekat: { y0: 296, y1: 570, a0: 32, a1: 185 },
    peta: { u: 20, ch: 105, light: 58 },   // ch = tinggi karakter dewasa/kurir di peta kisi (diperbesar dari satuan petak agar terbaca); light < tinggi rumah (62)
    judul: { u: 64, hero: 256 }   // hero = tinggi kurir pahlawan di layar judul (4 satuan dewasa, sengaja besar)
  };
  var CUST = { 1: 0.95, 2: 0.72, 3: 1, 4: 1.04, 5: 0.98, 6: 0.94 };   // faktor tinggi tiap pelanggan (c2 = anak)
  function A(view, y) {   // tinggi dewasa (px kanvas) pada pandangan dan posisi dasar y
    var v = VIEW[view] || VIEW.dekat;
    if (v.u) return v.u;
    var t = (y - v.y0) / (v.y1 - v.y0); t = Math.max(-0.1, Math.min(1.2, t));
    return v.a0 + (v.a1 - v.a0) * t;
  }
  root.SKALA = {
    UNIT: UNIT, VIEW: VIEW, CUST: CUST, A: A,
    h: function (kind, view, y) { return (UNIT[kind] || 1) * A(view, y || 0); },   // tinggi tampil objek jenis `kind`
    cust: function (n, view, y) { return (CUST[n] || 1) * A(view, y || 0); }
  };
})(window);

