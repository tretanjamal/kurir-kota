/* Daftar aset gambar terpusat: kunci -> berkas di assets/img/.
   Bila `file` kosong/null atau gagal dimuat, gim memakai grafik SVG bawaan (cadangan).
   w,h = ukuran piksel berkas (sudah dipotong ke batas isi, termasuk garis tinta tambahan). Gambar diskalakan `contain` ke kotak SVG-nya (art2.js).
   Dibuat oleh tools/proses-aset.py dari assets/masuk/. Spesifikasi dan prompt: docs/ASET-PROMPT.md. */
window.ASSETS = {
  dir: 'assets/img/',
  list: {
    dev_foto: { file: 'dev_foto.webp', w: 360, h: 360 },   // foto pengembang di pop-up Pengembang (tools/proses-foto.js)
    bg_title: { file: 'bg_title.webp', w: 1280, h: 720 },
    bg_menu: { file: 'bg_menu.webp', w: 1280, h: 720 },
    place_bank: { file: 'place_bank.webp', w: 754, h: 517 },
    place_hospital: { file: 'place_hospital.webp', w: 610, h: 687 },
    place_library: { file: 'place_library.webp', w: 720, h: 483 },
    place_school: { file: 'place_school.webp', w: 808, h: 420 },
    place_market: { file: 'place_market.webp', w: 752, h: 453 },
    place_post: { file: 'place_post.webp', w: 576, h: 396 },
    place_bus: { file: 'place_bus.webp', w: 832, h: 237 },
    place_park: { file: 'place_park.webp', w: 708, h: 284 },
    house_h1: { file: 'house_h1.webp', w: 520, h: 362, door: { cx: 0.494, base: 0.859, h: 0.33 } },
    house_h2: { file: 'house_h2.webp', w: 520, h: 344, door: { cx: 0.492, base: 0.861, h: 0.33 } },
    house_h3: { file: 'house_h3.webp', w: 520, h: 345, door: { cx: 0.492, base: 0.861, h: 0.33 } },
    house_h4: { file: 'house_h4.webp', w: 520, h: 346, door: { cx: 0.492, base: 0.864, h: 0.33 } },
    /* kurir A (gambar ChatGPT, diolah tools/proses-kurir-final.py): sheet 8 baris arah N,NE,E,SE,S,SW,W,NW x maks 6 kolom frame mengayuh.
       n = jumlah frame terpakai per arah (SE/S/SW hanya 4 frame yang wajahnya paling konsisten; SE frame ke-6 dibuang). Sel cw x ch, titik pijak (px,py) = dasar bayangan, helmet = lebar helm (px) untuk skala. */
    /* kurir 8 arah (satu gambar per arah, tanpa bayangan; kanvas sama, titik pijak (px,py) = dasar roda). ch = tinggi isi, dh = tinggi tampil terbesar, q = 2x */
    courierD: { w: 304, h: 371, px: 152, py: 371, ch: 370, dh: 185, q: 2, hr: 0.3649, dirs: ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'],
      files: { n: 'courier_d_n.webp', ne: 'courier_d_ne.webp', e: 'courier_d_e.webp', se: 'courier_d_se.webp', s: 'courier_d_s.webp', sw: 'courier_d_sw.webp', w: 'courier_d_w.webp', nw: 'courier_d_nw.webp' } },
    /* reaksi kurir (satu kanvas, pivot sama): bersorak dan bingung */
    /* layar judul: latar bersih + 4 bangunan terpisah (x,y,dw,dh dalam px panggung), kurir pahlawan (px,py = dasar roda, dh = tinggi tampil), lambang */
    title_bg: { file: 'title_bg.webp', w: 1672, h: 941, road_top: 620.9 },
    title_b1: { file: 'title_b1.webp', w: 460, h: 328, x: 0.0, y: 369.8, dw: 352.2, dh: 251.1, base: 620.9 },
    title_b2: { file: 'title_b2.webp', w: 373, h: 291, x: 351.4, y: 398.1, dw: 285.6, dh: 222.8, base: 620.9 },
    title_b3: { file: 'title_b3.webp', w: 355, h: 232, x: 636.2, y: 443.3, dw: 271.8, dh: 177.6, base: 620.9 },
    title_b4: { file: 'title_b4.webp', w: 487, h: 367, x: 907.2, y: 339.9, dw: 372.8, dh: 281.0, base: 620.9 },
    title_hero: { file: 'title_hero.webp', w: 412, h: 512, dh: 256, q: 2, px: 208, py: 511 },
    title_emblem: { file: 'title_emblem.webp', w: 241, h: 240, dh: 120, q: 2 },
    courierRx_cheer: { file: 'courier_react_cheer.webp', w: 133, h: 236, px: 66, py: 234, helmet: 80 },
    courierRx_confused: { file: 'courier_react_confused.webp', w: 133, h: 236, px: 66, py: 234, helmet: 80 },
    /* pelanggan seluruh badan c1-c6 x (idle, happy, confused): kanvas sama, tinggi isi 170 px, pijak di dasar bayangan kaki */
    cust_c1_idle: { file: 'cust_c1_idle.webp', w: 90, h: 173, px: 45, py: 172, ch: 170 },
    cust_c1_happy: { file: 'cust_c1_happy.webp', w: 90, h: 173, px: 45, py: 172, ch: 170 },
    cust_c1_confused: { file: 'cust_c1_confused.webp', w: 90, h: 173, px: 45, py: 172, ch: 170 },
    cust_c2_idle: { file: 'cust_c2_idle.webp', w: 90, h: 173, px: 45, py: 172, ch: 170 },
    cust_c2_happy: { file: 'cust_c2_happy.webp', w: 90, h: 173, px: 45, py: 172, ch: 170 },
    cust_c2_confused: { file: 'cust_c2_confused.webp', w: 90, h: 173, px: 45, py: 172, ch: 170 },
    cust_c3_idle: { file: 'cust_c3_idle.webp', w: 90, h: 173, px: 45, py: 172, ch: 170 },
    cust_c3_happy: { file: 'cust_c3_happy.webp', w: 90, h: 173, px: 45, py: 172, ch: 170 },
    cust_c3_confused: { file: 'cust_c3_confused.webp', w: 90, h: 173, px: 45, py: 172, ch: 170 },
    cust_c4_idle: { file: 'cust_c4_idle.webp', w: 90, h: 173, px: 45, py: 172, ch: 170 },
    cust_c4_happy: { file: 'cust_c4_happy.webp', w: 90, h: 173, px: 45, py: 172, ch: 170 },
    cust_c4_confused: { file: 'cust_c4_confused.webp', w: 90, h: 173, px: 45, py: 172, ch: 170 },
    cust_c5_idle: { file: 'cust_c5_idle.webp', w: 90, h: 173, px: 45, py: 172, ch: 170 },
    cust_c5_happy: { file: 'cust_c5_happy.webp', w: 90, h: 173, px: 45, py: 172, ch: 170 },
    cust_c5_confused: { file: 'cust_c5_confused.webp', w: 90, h: 173, px: 45, py: 172, ch: 170 },
    cust_c6_idle: { file: 'cust_c6_idle.webp', w: 90, h: 173, px: 45, py: 172, ch: 170 },
    cust_c6_happy: { file: 'cust_c6_happy.webp', w: 90, h: 173, px: 45, py: 172, ch: 170 },
    cust_c6_confused: { file: 'cust_c6_confused.webp', w: 90, h: 173, px: 45, py: 172, ch: 170 },
    /* lingkungan + kendaraan + tangan penunjuk (tools/proses-env.py): pivot (px,py) = tengah-dasar; dh = tinggi tampil (px) pada skala 1; file dibuat q kali lebih besar.
       veh_*_side menghadap kanan (kiri = cermin di kode). Burung: 1 frame (dua frame asli tidak sejajar rapi), gerak naik-turun lewat CSS. ui_hand: ujung jari di (tx,ty), lebar tampil dw. */
    env_tree_round: { file: 'env_tree_round.webp', w: 174, h: 195, px: 87, py: 195, dh: 118, q: 1.5 },
    env_tree_tall: { file: 'env_tree_tall.webp', w: 130, h: 240, px: 65, py: 240, dh: 138, q: 1.5 },
    env_tree_palm: { file: 'env_tree_palm.webp', w: 188, h: 240, px: 94, py: 240, dh: 138, q: 1.5 },
    env_traffic_light: { file: 'env_traffic_light.webp', w: 105, h: 350, px: 52, py: 350, dh: 216, q: 1.62, lamps: { x: 0.4117, y: [0.1484, 0.3267, 0.506], r: 0.1974 } },
    env_lamp: { file: 'env_lamp.webp', w: 72, h: 225, px: 36, py: 225, dh: 150, q: 1.5 },
    env_bush_a: { file: 'env_bush_a.webp', w: 94, h: 78, px: 47, py: 78, dh: 51.9, q: 1.5 },
    env_bush_b: { file: 'env_bush_b.webp', w: 92, h: 78, px: 46, py: 78, dh: 51.9, q: 1.5 },
    env_bush_c: { file: 'env_bush_c.webp', w: 92, h: 78, px: 46, py: 78, dh: 52, q: 1.5 },
    env_flower_a: { file: 'env_flower_a.webp', w: 84, h: 60, px: 42, py: 60, dh: 40, q: 1.5 },
    env_flower_b: { file: 'env_flower_b.webp', w: 86, h: 60, px: 43, py: 60, dh: 39.9, q: 1.5 },
    env_flower_c: { file: 'env_flower_c.webp', w: 82, h: 59, px: 41, py: 59, dh: 39.7, q: 1.5 },
    env_cloud_s: { file: 'env_cloud_s.webp', w: 88, h: 57, px: 44, py: 57, dh: 37.9, q: 1.5 },
    env_cloud_m: { file: 'env_cloud_m.webp', w: 128, h: 78, px: 64, py: 78, dh: 51.7, q: 1.5 },
    env_cloud_l: { file: 'env_cloud_l.webp', w: 162, h: 96, px: 81, py: 96, dh: 64, q: 1.5 },
    veh_car_back: { file: 'veh_car_back.webp', w: 96, h: 93, px: 48, py: 93, dh: 62.2, q: 1.5 },
    veh_car_front: { file: 'veh_car_front.webp', w: 96, h: 93, px: 48, py: 93, dh: 62.1, q: 1.5 },
    veh_car_side: { file: 'veh_car_side.webp', w: 132, h: 93, px: 66, py: 93, dh: 62, q: 1.5 },
    veh_bus_back: { file: 'veh_bus_back.webp', w: 114, h: 120, px: 57, py: 120, dh: 79.9, q: 1.5 },
    veh_bus_front: { file: 'veh_bus_front.webp', w: 122, h: 120, px: 61, py: 120, dh: 80.2, q: 1.5 },
    veh_bus_side: { file: 'veh_bus_side.webp', w: 170, h: 117, px: 85, py: 117, dh: 78, q: 1.5 },
    env_bird1: { file: 'env_bird1.webp', w: 68, h: 66, px: 49, py: 33, dh: 44, q: 1.5 },
    ui_hand: { file: 'ui_hand.webp', w: 144, h: 143, tx: 5, ty: 3, dw: 96, q: 1.5 },
    /* potret karakter: 3 ekspresi per set. kurir: call, cheer, think. pelanggan c1-c6: idle, happy, confused */
    char_c1_confused: { file: 'char_c1_confused.webp', w: 237, h: 450 },
    char_c1_happy: { file: 'char_c1_happy.webp', w: 237, h: 450 },
    char_c1_idle: { file: 'char_c1_idle.webp', w: 237, h: 450 },
    char_c2_confused: { file: 'char_c2_confused.webp', w: 229, h: 450 },
    char_c2_happy: { file: 'char_c2_happy.webp', w: 229, h: 450 },
    char_c2_idle: { file: 'char_c2_idle.webp', w: 229, h: 450 },
    char_c3_confused: { file: 'char_c3_confused.webp', w: 228, h: 450 },
    char_c3_happy: { file: 'char_c3_happy.webp', w: 228, h: 450 },
    char_c3_idle: { file: 'char_c3_idle.webp', w: 228, h: 450 },
    char_c4_confused: { file: 'char_c4_confused.webp', w: 225, h: 450 },
    char_c4_happy: { file: 'char_c4_happy.webp', w: 225, h: 450 },
    char_c4_idle: { file: 'char_c4_idle.webp', w: 225, h: 450 },
    char_c5_confused: { file: 'char_c5_confused.webp', w: 234, h: 450 },
    char_c5_happy: { file: 'char_c5_happy.webp', w: 234, h: 450 },
    char_c5_idle: { file: 'char_c5_idle.webp', w: 234, h: 450 },
    char_c6_confused: { file: 'char_c6_confused.webp', w: 230, h: 450 },
    char_c6_happy: { file: 'char_c6_happy.webp', w: 230, h: 450 },
    char_c6_idle: { file: 'char_c6_idle.webp', w: 230, h: 450 },
    char_courier_call: { file: 'char_courier_call.webp', w: 343, h: 430 },
    char_courier_cheer: { file: 'char_courier_cheer.webp', w: 343, h: 430 },
    char_courier_think: { file: 'char_courier_think.webp', w: 343, h: 430 }
  },
  /* musik latar: loop mp3 mono 96 kbps (dibundel juga sebagai data URI di js/data/music.js agar jalan lewat file://) */
  audio: {
    dir: 'assets/audio/',
    bgm_title: { file: 'bgm_title.mp3', loop: 36.50, lufs: -17.5, mood: 'calm' },
    bgm_gameplay: { file: 'bgm_gameplay.mp3', loop: 41.60, lufs: -22.4, mood: 'play' }
  }
};

