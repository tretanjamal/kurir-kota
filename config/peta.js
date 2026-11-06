/* Tata letak peta. cols x rows = jumlah simpang; blok = (cols-1) x (rows-1). Maks. 6x4 blok di layar.
   - kotaMini   : Level 1 (rumah polos, tanpa nama tempat)
   - kotaTempat : Level 2 (peta berputar, 1 tempat per blok; sebuah blok bisa rumah 'h1'..'h4' atau 'tree')
   - kotaBesar  : Level 3 + Bos (peta diam, utara di atas). 2 petak (kiri/kanan) per blok; 'h' = rumah polos, '.' = lahan kosong. */
window.PETA = {
  houses: {
    h1: { wall: '#F4A261', roof: '#EF5B4B' },
    h2: { wall: '#B5E0A2', roof: '#1FA89B' },
    h3: { wall: '#F9D56E', roof: '#EF5B4B' },
    h4: { wall: '#F7F3E3', roof: '#1FA89B' }
  },
  kotaMini: {
    type: 'rot', cols: 5, rows: 4,
    blocks: [
      ['h1', 'tree', 'h2', 'h3'],
      ['tree', 'h4', 'h1', 'tree'],
      ['h2', 'h3', 'tree', 'h4']
    ]
  },
  kotaTempat: {
    type: 'rot', cols: 5, rows: 4,
    blocks: [
      ['bank', 'h1', 'library', 'park'],
      ['market', 'school', 'h2', 'hospital'],
      ['h3', 'post', 'h4', 'bus']
    ],
    lights: [{ i: 1, j: 1 }, { i: 3, j: 2 }, { i: 2, j: 2 }]   // simpang berlampu lalu lintas (mulai Level 2); Level 1 tanpa lampu
  },
  kotaBesar: {
    type: 'static', cols: 6, rows: 3,   // 5 x 2 blok, 10 x 2 petak
    lots: [
      ['.', '.', 'school', 'bus', 'h', 'market', '.', 'h', '.', 'h'],
      ['bank', 'h', 'library', 'h', 'hospital', 'h', '.', 'post', '.', 'park']
    ],
    lights: [{ i: 1, j: 1 }, { i: 4, j: 1 }]   // hanya simpang 4 arah (baris tengah); 2 lampu agar tidak terlalu padat
  },
  /* peta kedua "Kota Pasar" (TAMBAHAN): tata letak lain dengan 8 tempat yang sama; dipakai Level 5 Turis dan ulangan Level 3/Bos.
     Dicari dengan pencarian acak agar tiap relasi posisi punya >= 3 fakta tunggal (lihat test/logic/route.test.js). */
  kotaPasar: {
    type: 'static', cols: 6, rows: 3,
    lots: [
      ['park', 'h', 'school', 'post', 'h', 'hospital', '.', 'h', '.', 'h'],
      ['.', '.', 'library', 'h', 'bus', 'h', '.', 'bank', '.', 'market']
    ],
    lights: [{ i: 1, j: 1 }, { i: 4, j: 1 }]
  }
};


