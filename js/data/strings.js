/* Semua teks UI (Bahasa Indonesia) agar mudah ditinjau guru. Isi arahan bahasa Inggris ada di sentences.js dan dibangkitkan route.js */
window.STR = {
  title: 'Kurir Kota',
  subtitle: 'Petualangan Arah Bahasa Inggris',
  btn: {
    start: 'GO!', book: 'Buku', bookFull: 'Buku Kurir', santai: 'Santai', replay: 'Ulang', slow: 'Pelan', words: 'Kata', menu: 'Menu',
    back: 'Kembali', again: 'Main lagi', home: 'Beranda', close: 'Tutup', resume: 'Lanjut', next: 'Lanjut', levels: 'Rute'
  },
  /* tombol gerak: kata Inggris yang didengar */
  move: { left: 'Turn left', straight: 'Go straight', right: 'Turn right', stop: 'Stop' },
  toggles: {
    sound: function (on) { return on ? 'Suara: nyala' : 'Suara: mati'; },
    reduce: function (on) { return on ? 'Kurangi animasi: ya' : 'Kurangi animasi: tidak'; },
    santai: function (on) { return on ? 'Mode Santai: nyala' : 'Mode Santai: mati'; }
  },
  santaiInfo: 'Mode Santai: tanpa batas waktu.',
  /* panel Pengaturan, tombol ikon bulat, layar penuh */
  settings: {
    title: 'Pengaturan', on: 'Nyala', off: 'Mati', sound: 'Suara', reduce: 'Kurangi animasi', santai: 'Mode Santai',
    santaiHint: 'Tanpa batas waktu', reduceHint: 'Gerak lebih tenang', soundHint: 'Musik dan efek',
    aria: 'Pengaturan', ariaPause: 'Jeda dan pengaturan'
  },
  icons: {
    soundOn: 'Suara nyala. Ketuk untuk mematikan', soundOff: 'Suara mati. Ketuk untuk menyalakan',
    fsEnter: 'Layar penuh', fsExit: 'Keluar dari layar penuh', fsDenied: 'Layar penuh tidak bisa dibuka di sini'
  },
  titleHint: { go: 'Go straight!' },
  /* pop-up layar judul: Informasi, Referensi, Pengembang */
  about: {
    info: {
      btn: 'Informasi', title: 'Informasi',
      tabs: { goal: 'Tujuan Pembelajaran', how: 'Cara Bermain', route: 'Daftar Rute' },
      goalLead: 'Setelah menjadi Kurir Kota, kamu dapat:',
      goals: [
        'Menyimak dan memahami arahan: <b>go straight, turn left, turn right, stop</b>.',
        'Mengenali nama tempat umum: <b>bank, hospital, market, library, school, park, post office, bus station</b>.',
        'Menemukan lokasi dengan kata posisi: <b>next to, opposite, between, near</b>.',
        'Memahami kata lalu lintas: <b>traffic lights, stop, wait, go, zebra cross</b>.',
        'Memilih arahan yang tepat untuk membantu orang lain.'
      ],
      how: [
        'Telepon berdering: <b>dengarkan arahannya</b>. Ketuk <b>Ulang</b> atau <b>Pelan</b> untuk mendengar lagi.',
        'Di tiap simpang, ketuk <b>Turn left</b>, <b>Go straight</b>, <b>Turn right</b>, atau <b>Stop</b>.',
        'Kiri dan kanan dihitung dari arah hadap kurir. Lihat lencana <b>L</b> dan <b>R</b>.',
        'Lampu merah? Tunggu sampai hijau, baru jalan.',
        'Salah tidak apa-apa! Kurir memberi petunjuk, lalu kamu coba lagi. Lupa artinya? Ketuk <b>Kata</b>.',
        'Paket sampai? Kumpulkan koin, bintang, dan stempel di <b>Buku Kurir</b>.'
      ],
      routeLead: 'Rute terbuka satu per satu. Waktu bermain sekitar 15-20 menit.',
      routes: [
        'Ikuti satu perintah arah di tiap simpang.',
        'Belok dan berhenti di tempat yang disebut.',
        'Temukan rumah dengan next to, opposite, between, near.',
        'Antar 3 alamat berurutan. Mode Santai tanpa batas waktu.',
        'Pilih dan susun arahan yang benar untuk turis.'
      ]
    },
    ref: {
      btn: 'Referensi', title: 'Referensi',
      srcTitle: 'Sumber Materi',
      src: 'Emilia, E., Wijayanti, M.A., dkk. (2025). <i>Panduan Mata Pelajaran Bahasa Inggris</i>. Badan Standar, Kurikulum, dan Asesmen Pendidikan, Kementerian Pendidikan Dasar dan Menengah Republik Indonesia.',
      aiTitle: 'Keterangan Penggunaan Kecerdasan Artifisial',
      aiLead: 'Gim ini dibuat dengan bantuan kecerdasan artifisial (AI):',
      ai: [
        '<b>Gambar</b> (karakter, bangunan, kendaraan, latar): ChatGPT dari OpenAI.',
        '<b>Musik latar</b>: Suno.',
        '<b>Kode program dan draf teks</b>: Claude dari Anthropic.'
      ],
      aiEnd: 'Pengembang mengarahkan, memilih, dan meninjau hasilnya sebelum digunakan.'
    },
    dev: {
      btn: 'Pengembang', title: 'Pengembang',
      name: 'Jamaluddin', org: 'UPTD SMPN 2 Robatal', email: 'jamaluddin551@guru.smp.belajar.id', year: 'Tahun pembuatan: 2026',
      photoAlt: 'Foto Jamaluddin',
      achTitle: 'Prestasi dan Pengalaman',
      ach: [
        'Narasumber Digitalisasi Pembelajaran Kemendikdasmen',
        'Guru Pejuang Digital',
        'Juara 1 Lomba Inovasi Guru SMP Kabupaten Sampang 2026',
        'Juara 1 Guru Inspiratif SMP Kabupaten Sampang 2026',
        'Komunitas Belajar Terbaik BLPT Kemendikdasmen 2024'
      ]
    }
  },
  hud: {
    mission: function (n, total, level) { return 'Antaran ' + n + ' dari ' + total + '  •  ' + level; },
    tourist: function (n, total) { return 'Turis ' + n + ' dari ' + total; },
    address: function (n, total, time) { return 'Alamat ' + n + ' dari ' + total + (time ? '  •  ' + time : '  •  Santai'); }
  },
  levels: {
    title: 'Pilih Rute', locked: 'Terkunci', stars: 'bintang', mission: 'antaran', address: 'alamat', tourist: 'turis',
    lockedHint: function (name) { return 'Selesaikan rute "' + name + '" dulu, ya!'; },
    names: ['Latihan Arah', 'Tempat Umum', 'Posisi', 'Paket Kilat', 'Turis Tersesat'],
    subs: ['Ikuti arahan di tiap simpang', 'Kenali nama tempat di kota', 'Temukan rumah dari posisinya', 'Antar 3 paket berurutan', 'Pilih arahan yang benar untuk turis']
  },
  /* Level 5 Turis Tersesat (peran terbalik) */
  turis: {
    onboard: 'Turis menghadap panah kuning. Pilih arahan yang sampai ke tempat itu.',
    turnWord: 'Turn', atWord: 'at the', lrShort: 'Kiri dan kanan dihitung dari arah hadap turis.',
    lrHint: 'Kiri dan kanan dihitung dari arah hadap turis (panah kuning), bukan dari layar.',
    markHint: 'Cek lagi: turis harus belok di tempat atau lampu yang disebut, lalu berhenti di tempat yang ditanya.',
    showRoute: 'Ini jalannya. Pilih arahan yang cocok dengan garis kuning.',
    thanks: 'Thank you!', check: 'Cek', build: 'Susun arahan: ketuk kartu kiri/kanan dan kartu tempat, lalu Cek.', pick: 'Ketuk satu arahan', route: 'rute',
    skill: 'Memilih arahan untuk turis', skillLR: 'Kiri/kanan dari sudut turis', kidSkill: 'Aku bisa memberi arahan yang benar untuk orang lain.'
  },
  coach: {
    onboard1: 'Dengar telepon, lalu ketuk tombol yang sama.',
    onboardStop: 'Rumah pelanggan sudah dekat. Ketuk Stop!',
    onboardPlace: 'Cari tempat yang disebut. Terus lurus sampai ketemu!',
    onboardLocate: 'Ketuk tombol arahnya dulu, lalu ketuk bangunannya.',
    idle: 'Ketuk tombol ini ya!',
    listenAgain: 'Dengarkan lagi, ya!',
    lrSwap: 'Kiri dan kanan tertukar. Lihat L dan R di dekat kurir!',
    needStop: 'Itu rumah pelanggan! Ketuk Stop.',
    tooEarly: 'Belum sampai. Ikuti arahannya dulu.',
    notStraight: 'Arahannya bukan lurus. Dengarkan lagi.',
    wrongTurn: 'Ayo dengar sekali lagi.',
    showAnswer: 'Ini jawabannya. Ketuk yang menyala!',
    practice: 'Kita coba lagi yang serupa nanti.',
    notYet: function (name) { return 'Belum sampai di ' + name + '. Terus lurus dulu!'; },
    here: function (name, act) { return 'Itu ' + name + '! ' + act; },
    actTurnLeft: 'Sekarang belok kiri.', actTurnRight: 'Sekarang belok kanan.', actStop: 'Ketuk Stop.',
    forgotPlace: 'Lupa nama tempat? Ketuk Kata.',
    pickHouse: 'Yang kamu cari rumah polos, bukan tempat bernama.',
    locateWrong: 'Bukan itu. Dengarkan lagi dan lihat gambar kecilnya.',
    locateNear: 'Tepat satu bangunan ada dekat tempat itu.',
    locateRel: {
      near: 'Tepat satu bangunan ada dekat tempat itu.',
      next: '"Next to" artinya bersebelahan, satu sisi jalan dengan tempat itu.',
      opposite: '"Opposite" artinya di seberang jalan dari tempat itu.',
      between: '"Between" artinya di tengah, di antara dua tempat.'
    },
    turnNotStraight: 'Arahannya belok, bukan lurus. Dengarkan lagi.',
    movesFirst: 'Selesaikan perintah belok dulu.',
    useTap: 'Sekarang ketuk bangunannya.'
  },
  deliver: { done: 'Paket terkirim!' },
  menu: { title: 'Jeda', restart: 'Ulangi rute' },
  gloss: { title: 'Kata-kata Penting', tapHear: 'Ketuk untuk mendengar', tabs: { dir: 'Arah', place: 'Tempat', pos: 'Posisi', traffic: 'Lalu Lintas' } },
  /* lampu lalu lintas (Level 2 ke atas): pengingat tidak pernah menggagalkan misi */
  traffic: {
    remind: 'Red means stop! Merah artinya berhenti.',
    redWait: 'Lampu merah! Berhenti di garis dan tunggu hijau.',
    yellowWait: 'Kuning: tunggu dulu, bersiap.',
    santaiWait: 'Lampu merah. Kurir menunggu hijau, lalu jalan sendiri.',
    green: 'Hijau! Sekarang boleh jalan.',
    stopLine: 'Garis berhenti',
    words: { red: 'STOP', yellow: 'WAIT', green: 'GO' }
  },
  book: {
    title: 'Buku Kurir', sub: 'Stempel kata yang sudah kamu kuasai',
    locked: 'Belum', empty: 'Kumpulkan stempel dengan menjawab benar langsung!'
  },
  result: {
    title: 'Hebat, Kurir!', coins: 'Koin', skills: 'Yang sudah kamu kuasai',
    none: 'Ayo coba lagi untuk meraih stempel baru!', more: function (n) { return '+ ' + n + ' lagi di Buku Kurir'; },
    teacher: 'Catatan Kurir', copy: 'Salin catatan', copied: 'Tersalin!',
    msg: ['Ayo coba lagi, kamu pasti bisa!', 'Bagus! Masih ada bintang menunggu.', 'Keren! Satu bintang lagi menunggu.', 'Sempurna! Kurir terbaik!'], time: function (t) { return 'Waktu ' + t; }
  },
  skillKid: function (g) {
    if (g.kind === 'traffic') return { lights: '"Traffic lights" artinya lampu lalu lintas.', tl_stop: 'Merah artinya "stop": berhenti.', tl_wait: 'Kuning artinya "wait": tunggu.', tl_go: 'Hijau artinya "go": jalan.', zebra: '"Zebra cross" artinya penyeberangan zebra.', tertib: 'Aku selalu berhenti saat lampu merah. Kurir Tertib!' }[g.id];
    if (g.kind === 'dir') return { straight: '"Go straight" artinya jalan lurus.', left: '"Turn left" artinya belok kiri.', right: '"Turn right" artinya belok kanan.', stop: '"Stop" artinya berhenti.' }[g.id];
    if (g.kind === 'place') return 'Aku kenal "' + g.en + '": ' + g.idn + '.';
    return '"' + g.en + '" artinya ' + g.idn + '.';
  },
  /* panel Catatan Kurir di layar hasil: disapa ke pemain ("kamu") karena murid bermain sendiri */
  teacher: {
    intro: [
      'Kamu berlatih menyimak perintah arah: go straight, turn left, turn right, stop. Kiri dan kanan dihitung dari arah hadap kurir.',
      'Kamu berlatih menyimak nama tempat dalam arahan, mis. "Turn left at the bank. Stop at the library." Lurus terus sampai tempat yang disebut.',
      'Kamu berlatih posisi: next to, opposite, between, near. Ingat perintah beloknya, lalu ketuk rumah yang cocok dengan posisinya.',
      'Paket Kilat: 3 alamat berurutan yang menggabungkan arah, nama tempat, dan posisi.',
      'Turis Tersesat: kamu memilih arahan yang benar untuk turis dan menyusun kalimat dari kartu. Awas kiri/kanan tertukar dan tempat yang salah!'
    ],
    lightIntro: 'Mulai Level 2 ada lampu lalu lintas: kamu belajar "traffic lights" sebagai penanda belok dan berlatih berhenti saat lampu merah (stop, wait, go, zebra cross).',
    col: ['Kemampuan', 'Benar langsung', 'Status'],
    status: { good: 'Lancar', ok: 'Cukup', practice: 'Perlu latihan' },
    sumTitle: 'Catatan Kurir Kota',
    sumLevel: function (name, stars) { return 'Level: ' + name + ' | Bintang: ' + stars + '/3'; },
    sumRow: function (name, first, ok, status) { return '- ' + name + ': ' + first + ' dari ' + ok + ' benar langsung (' + status + ')'; },
    lrTip: 'Kiri-kanan sering tertukar: coba angkat tangan kiri/kanan sambil mengucapkan "left" dan "right".',
    placeTip: 'Beberapa nama tempat masih keliru: buka Kata, lalu ucapkan nama tempat sambil melihat gambarnya.',
    posTip: 'Posisi masih tertukar: buka Kata, lalu bandingkan gambar "next to" (bersebelahan) dengan "opposite" (di seberang jalan).',
    lightTip: function (n) { return 'Kamu ' + n + ' kali menerobos lampu merah. Ingat "Red means stop": tunggu hijau dulu, baru ketuk.'; },
    lightOk: 'Kamu selalu berhenti saat lampu merah (stempel Kurir Tertib).',
    okTip: 'Kamu menyimak dengan baik. Lanjut ke rute berikutnya!',
    mixTip: 'Ada yang perlu latihan: main lagi rute ini dan perhatikan arahan yang tadi keliru.',
    okTipLast: 'Kamu menyelesaikan semua rute dengan baik. Coba beri arahan kepada temanmu!',
    dirTip: 'Perintah lurus atau berhenti masih keliru: coba ucapkan "go straight" dan "stop" sambil berjalan di tempat.',
    skillName: function (g) {
      if (g.kind === 'traffic') return 'Lalu lintas: ' + g.en;
      if (g.kind === 'dir') return 'Menyimak "' + g.en.toLowerCase() + '"';
      if (g.kind === 'place') return 'Nama tempat: ' + g.en;
      return 'Posisi: ' + g.en;
    },
    other: 'Lainnya',
    santaiNote: 'Mode Santai aktif (tanpa batas waktu).'
  },
  portrait: 'Putar perangkatmu ke samping ya!',
  noVoice: 'Suara tidak tersedia di perangkat ini. Baca teks di layar.'
};

