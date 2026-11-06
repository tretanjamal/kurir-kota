/* Save: progres di localStorage (try/catch); tetap jalan bila penyimpanan diblokir */
(function (root) {
  var KEY = 'kurirkota221.v1';
  var memory = null;
  function fresh() {
    return {
      settings: { santai: false, reduce: false, mute: false },
      onboarded: false, coins: 0,
      skills: {},   // id -> {tries, ok, first}
      stamps: {},   // id -> true
      levels: {}    // id -> {stars}
    };
  }
  var Save = {
    data: fresh(),
    STAMP_AT: 2, // jumlah jawaban benar langsung (tanpa salah) untuk meraih stempel
    load: function () {
      try {
        var raw = root.localStorage.getItem(KEY);
        if (raw) {
          var d = JSON.parse(raw), f = fresh();
          for (var k in f) if (d[k] === undefined) d[k] = f[k];
          for (var s in f.settings) if (d.settings[s] === undefined) d.settings[s] = f.settings[s];
          Save.data = d;
        }
      } catch (e) { Save.data = memory || fresh(); }
    },
    save: function () {
      memory = Save.data;
      try { root.localStorage.setItem(KEY, JSON.stringify(Save.data)); } catch (e) { /* diblokir: abaikan */ }
    },
    /* catat satu simpang: skill, benar langsung (tanpa salah)? */
    record: function (skill, firstTry) {
      var s = Save.data.skills[skill] || (Save.data.skills[skill] = { tries: 0, ok: 0, first: 0 });
      s.tries++; s.ok++; if (firstTry) s.first++;
      if (s.first >= Save.STAMP_AT) Save.data.stamps[skill] = true;
    },
    /* stempel khusus (mis. Kurir Tertib): langsung diberikan */
    award: function (skill) { var s = Save.data.skills[skill] || (Save.data.skills[skill] = { tries: 0, ok: 0, first: 0 }); s.tries++; s.ok++; s.first++; Save.data.stamps[skill] = true; },
    recordWrong: function (skill) {
      var s = Save.data.skills[skill] || (Save.data.skills[skill] = { tries: 0, ok: 0, first: 0 });
      s.tries++;
    },
    reset: function () { Save.data = fresh(); Save.save(); }
  };
  root.Save = Save;
})(typeof window !== 'undefined' ? window : globalThis);

