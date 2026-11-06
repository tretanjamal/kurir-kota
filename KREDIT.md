# Kredit: Kurir Kota: Petualangan Arah Bahasa Inggris (ID 221)

**Kreator:** Jamaluddin, UPTD SMPN 2 Robatal. Tahun pembuatan 2026. Foto di pop-up Pengembang (`assets/img/dev_foto.webp`) disediakan kreator.

## Sumber materi
Emilia, E., Wijayanti, M.A., dkk. (2025). Panduan Mata Pelajaran Bahasa Inggris. Badan Standar, Kurikulum, dan Asesmen Pendidikan, Kementerian Pendidikan Dasar dan Menengah Republik Indonesia.

## Penggunaan kecerdasan artifisial
Gambar: ChatGPT (OpenAI). Musik latar: Suno. Kode program dan draf teks: Claude (Anthropic). Rincian gambar dan musik ada di bawah. Keterangan yang sama tampil di pop-up Referensi.

## Font
- **Nunito** (Black, Bold, SemiBold), hak cipta The Nunito Project Authors (Vernon Adams, Jacques Le Bailly, Manvel Shmavonyan, Alexei Vanyashin). Lisensi **SIL Open Font License 1.1** (https://openfontlicense.org). Dibundel lokal di `assets/fonts/`.

## Grafik
- Kurir, pelanggan, ikon, tombol, bintang, stempel, jalan, pohon, awan, burung, mobil, dan label digambar dengan kode SVG di `js/engine/art.js` dan `art2.js`. Tanpa aset gambar pihak ketiga.
- Gambar diam berikut dibuat dengan **ChatGPT (pembuat gambar OpenAI)** atas arahan kreator, diterima dan diproses 1 November 2026 (dipotong ke batas isi, diubah ukuran, dikompres ke WebP; garis tinta tipis ditambahkan dan warna gelap diseragamkan ke palet dengan tools/proses-aset.py), disimpan di `assets/img/`. Prompt memakai "prompt gaya induk" dan deskripsi per aset di `docs/ASET-PROMPT.md` (folder pengembangan, tidak ikut zip). SVG lama tetap sebagai cadangan bila berkas gagal dimuat.

| Berkas | Dipakai di | Prompt (ringkas; teks lengkap di docs/ASET-PROMPT.md) |
|---|---|---|
| `bg_title.webp` | latar layar judul | jalan kota siang, 4 bangunan, langit kosong untuk judul |
| `bg_menu.webp` | latar Pilih Rute | latar menu lembut, kontras rendah |
| `place_bank.webp` | bank | bank dua lantai kuning, tiang putih, koin emas |
| `place_hospital.webp` | rumah sakit | rumah sakit tinggi putih, lambang palang merah |
| `place_library.webp` | perpustakaan | bata cokelat, atap teal, lambang buku |
| `place_school.webp` | sekolah | sekolah oranye, atap merah, bendera |
| `place_market.webp` | pasar | toko hijau, kanopi belang merah-putih, peti buah |
| `place_post.webp` | kantor pos | biru langit, atap merah, lambang amplop, kotak pos |
| `place_bus.webp` | terminal bus | atap lebar gelap, dinding teal, lambang bus |
| `place_park.webp` | taman | rumput oval, kolam, dua pohon, bangku |
| `house_h1.webp` ... `house_h4.webp` | rumah polos (4 warna) | rumah polos tanpa tanda, dinding/atap berbeda tiap gaya |
- Potret karakter, dibuat dengan **ChatGPT (pembuat gambar OpenAI)**, diterima dan diproses 1 November 2026 (satu gambar berisi 3 ekspresi dipotong per ekspresi, dikompres ke WebP). Dipakai sebagai potret di panel petunjuk (kurir), panel terima kasih dan layar hasil (kurir + pelanggan). Kurir kecil di peta dan pelanggan yang berlari tetap SVG. Animasi (bernapas, bergoyang, melompat) dibuat dengan transformasi di kode.

| Berkas | Isi (kiri ke kanan) | Prompt (ringkas) |
|---|---|---|
| `char_courier_call/cheer/think.webp` | kurir anak berhelm kuning, jaket teal, tas cokelat: menelepon, bersorak, berpikir | potret setengah badan gaya induk, 3 ekspresi berdampingan, latar transparan |
| `char_c1_*.webp` | nenek berkacamata, kebaya + batik: diam, senang memegang paket, bingung | pelanggan seluruh badan, 3 ekspresi berdampingan |
| `char_c2_*.webp` | anak laki-laki topi merah, kaus teal | sama |
| `char_c3_*.webp` | anak perempuan berjilbab biru, blus kuning, rok hijau | sama |
| `char_c4_*.webp` | bapak berkemeja batik | sama |
| `char_c5_*.webp` | anak perempuan berambut hitam, jaket oranye, rok biru tua | sama |
| `char_c6_*.webp` | kakek berpeci, bertongkat | sama |
(Ekspresi pelanggan: `idle`, `happy`, `confused`.)
- `key_art` (ilustrasi promosi) hanya untuk thumbnail dan tidak dimuat gim.

## Audio
- Efek suara (SFX) disintesis dengan Web Audio API di `js/engine/audio.js`. Tanpa berkas SFX pihak ketiga. Sintesis musik lama tetap ada di kode sebagai cadangan bila berkas musik gagal dimuat.
- Arahan berbahasa Inggris dibacakan oleh suara en-US bawaan perangkat (speechSynthesis). Transkrip lengkap ada di `naskah_audio.csv`.

## Kode
- HTML, CSS, dan JavaScript murni tanpa pustaka luar dan tanpa langkah build.

## Privasi
- Tanpa iklan, tautan keluar, chat, atau pengumpulan data pribadi. Progres hanya disimpan di penyimpanan lokal peramban perangkat.

## Kurir dan pelanggan (gambar sprite)
- Kurir di peta (`courier_a.webp`, sheet 8 arah x frame mengayuh) dan dua pose reaksi (`courier_react_cheer/confused.webp`): gambar dibuat dengan ChatGPT (char_courier_sheet.png dan char_courier_bike_react.png), lalu diolah oleh tools/proses-kurir-final.py: latar dihapus dengan isian dari tepi, bayangan pucat dijadikan tembus pandang, frame diselaraskan ulang, frame melenceng dibuang (SE frame ke-6), arah berwajah (SE, S, SW) hanya 4 frame yang wajahnya paling konsisten, konversi WebP. Total berkas kurir 221 KB.
- Pelanggan seluruh badan c1-c6 (`cust_c<n>_{idle,happy,confused}.webp`, 112 KB total): gambar ChatGPT (char_customer_c1..c6.png) dipotong per pose, skala dan titik pijak disamakan. Potret pelanggan di panel tetap memakai char_c<n>_*.webp.
- Kurir SVG lama (Art.courier, Art.bikeTop) dan orang SVG lama (Art.person) tetap di kode sebagai cadangan bila gambar tidak termuat.
- Model kurir 3D (Three.js 0.160.0, lisensi MIT) hanya percobaan di tools/render3d; TIDAK dipakai di gim dan tidak ikut zip.
## Musik latar (dibuat dengan Suno)
Dua lagu dibuat dengan Suno (AI), lalu diedit untuk gim ini oleh tools/proses-musik.py: dipotong menjadi loop di batas birama dengan crossfade 0,5 dtk, kerasnya diseragamkan, mp3 mono 96 kbps.
- bgm_title.mp3 (layar judul/menu/hasil): loop 36,5 dtk, -17,5 LUFS (diturunkan saat diputar agar sama keras dengan musik bermain). Prompt: [ISI: salin prompt Suno]
- bgm_gameplay.mp3 (semua level): loop 41,6 dtk, -22,4 LUFS. Prompt: [ISI]
- Tanggal pembuatan: [ISI]. Paket Suno: [ISI: Free/Pro/Premier; hak komersial hanya pada paket berbayar]. ID lagu: [ISI]
Catatan: tanggal, paket, dan prompt belum diketahui oleh pengembang alat; mohon isi sebelum publikasi.


## Lingkungan, kendaraan, tangan penunjuk (gambar sprite)
- Gambar dibuat dengan ChatGPT (env_tree_round/tall/palm, env_bush, env_flowers, env_cloud, env_bird, env_lamp_post, veh_car, veh_minibus, ui_hand_pointer), dipotong per versi dan disamakan skala/titik pijaknya oleh tools/proses-env.py, dikonversi WebP (total sekitar 100 KB).
- Pohon dan semak bergoyang dari pangkal (CSS), awan bergeser pelan, burung memakai 1 frame dengan gerak naik-turun (dua frame asli tidak sejajar rapi), mobil/minibus: samping (kiri = cermin kanan) untuk jalan datar, depan/belakang untuk jalan tegak, tangan penunjuk mengetuk dengan ujung jari tepat di target.
- SVG lama (Art.tree, bush, cloud, bird, car, pointerHand) tetap di kode sebagai cadangan bila gambar tak termuat.

## Kurir di peta (8 arah)
Gambar kurir courier_d_{n,ne,e,se,s,sw,w,nw}.webp berasal dari 8 gambar char_courier_dir_* (dibuat dengan ChatGPT), diproses dengan tools/proses-kurir-arah.py (bayangan dibuang, defringe, samakan tinggi). Reaksi: char_courier_bike_react.png. Bayangan kurir digambar lewat kode.

## Layar judul
Kurir pahlawan (title_hero), lambang (title_emblem), latar dan empat bangunan terpisah (title_bg, title_b1-4, dari bg_title) dibuat dengan ChatGPT dan diproses dengan tools/proses-judul.py (defringe, WebP, bangunan dipisah dari latar). Ikon tombol (suara, layar penuh, roda gigi, buku) digambar lewat kode.

## Lampu lalu lintas
- env_traffic_light.png (tiang + rumah lampu, tiga lampu padam) dibuat dengan ChatGPT; diproses tools/proses-lampu.py (halo gelap dibuang, dipangkas, WebP ~6 KB). Lampu menyala, simbol, papan kata, zebra cross, dan garis berhenti digambar lewat kode; bunyi pergantian lampu disintesis WebAudio.

## Level 5 Turis Tersesat dan peta Kota Pasar (2026-11-02)
- Seluruh grafik peta Kota Pasar memakai aset yang sama dengan peta Kota Besar (tata letak lain, dicari dengan program; tanpa aset baru). Pejalan ambient memakai sprite pelanggan yang sama.
- Thumbnail: key art `key_art.png` (lihat bagian aset) dengan judul dan tombol bertulis, ditata lewat tools/thumbnail.html memakai font Nunito (OFL).
