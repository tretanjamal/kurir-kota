/* Kalimat arahan (isi bahasa Inggris). L1: kalimat per simpang. L2/L3/Bos dibangkitkan oleh js/engine/route.js (kalimat ada di naskah_audio.csv
   lewat tools/gen-naskah.js). */
window.SENT = {
  first: { id: 's_hi_01', text: 'Hi! Please go straight.' },
  cmd: {
    straight: [
      { id: 's_st_01', text: 'Go straight.' }, { id: 's_st_02', text: 'Please go straight.' }, { id: 's_st_03', text: 'Now go straight.' }
    ],
    left: [
      { id: 's_lf_01', text: 'Turn left.' }, { id: 's_lf_02', text: 'Please turn left.' }, { id: 's_lf_03', text: 'Now turn left.' }
    ],
    right: [
      { id: 's_rt_01', text: 'Turn right.' }, { id: 's_rt_02', text: 'Please turn right.' }, { id: 's_rt_03', text: 'Now turn right.' }
    ],
    stop: [
      { id: 's_sp_01', text: 'Stop here.' }, { id: 's_sp_02', text: 'Please stop here.' }, { id: 's_sp_03', text: 'Stop. This is the house!' }
    ]
  },
  thanks: [{ id: 's_th_01', text: 'Thank you!' }, { id: 's_th_02', text: 'Thanks a lot!' }, { id: 's_th_03', text: 'Great job!' }],
  /* kalimat lampu lalu lintas yang dibacakan (pengingat, petunjuk menunggu, tanda hijau) */
  traffic: {
    remind: { id: 's_tl_01', text: 'Red means stop!' },
    wait: { id: 's_tl_02', text: 'Stop and wait.' },
    go: { id: 's_tl_03', text: 'Green means go!' }
  },
  /* glosarium: kind = dir | place | pos | traffic; level = level yang memperkenalkannya */
  gloss: [
    { id: 'straight', kind: 'dir', en: 'Go straight', idn: 'Jalan lurus', level: 1, say: 'Go straight.' },
    { id: 'left', kind: 'dir', en: 'Turn left', idn: 'Belok kiri', level: 1, say: 'Turn left.' },
    { id: 'right', kind: 'dir', en: 'Turn right', idn: 'Belok kanan', level: 1, say: 'Turn right.' },
    { id: 'stop', kind: 'dir', en: 'Stop', idn: 'Berhenti', level: 1, say: 'Stop.' },
    { id: 'bank', kind: 'place', en: 'bank', idn: 'tempat menabung uang', level: 2, say: 'bank' },
    { id: 'library', kind: 'place', en: 'library', idn: 'perpustakaan', level: 2, say: 'library' },
    { id: 'park', kind: 'place', en: 'park', idn: 'taman', level: 2, say: 'park' },
    { id: 'market', kind: 'place', en: 'market', idn: 'pasar', level: 2, say: 'market' },
    { id: 'school', kind: 'place', en: 'school', idn: 'sekolah', level: 2, say: 'school' },
    { id: 'hospital', kind: 'place', en: 'hospital', idn: 'rumah sakit', level: 2, say: 'hospital' },
    { id: 'post', kind: 'place', en: 'post office', idn: 'kantor pos', level: 2, say: 'post office' },
    { id: 'bus', kind: 'place', en: 'bus station', idn: 'terminal bus', level: 2, say: 'bus station' },
    { id: 'next', kind: 'pos', en: 'next to', idn: 'di sebelah', level: 3, say: 'next to' },
    { id: 'opposite', kind: 'pos', en: 'opposite', idn: 'di seberang jalan', level: 3, say: 'opposite' },
    { id: 'between', kind: 'pos', en: 'between', idn: 'di antara', level: 3, say: 'between' },
    { id: 'near', kind: 'pos', en: 'near', idn: 'dekat', level: 3, say: 'near' },
    { id: 'lights', kind: 'traffic', en: 'traffic lights', idn: 'lampu lalu lintas', level: 2, say: 'traffic lights' },
    { id: 'tl_stop', kind: 'traffic', en: 'stop', idn: 'berhenti (lampu merah)', level: 2, say: 'Stop!' },
    { id: 'tl_wait', kind: 'traffic', en: 'wait', idn: 'tunggu (lampu kuning)', level: 2, say: 'Wait.' },
    { id: 'tl_go', kind: 'traffic', en: 'go', idn: 'jalan (lampu hijau)', level: 2, say: 'Go!' },
    { id: 'zebra', kind: 'traffic', en: 'zebra cross', idn: 'penyeberangan zebra', level: 2, say: 'zebra cross' },
    { id: 'tertib', kind: 'traffic', en: 'Kurir Tertib', idn: 'selalu berhenti saat lampu merah', level: 2, say: 'Red means stop!' }
  ]
};
