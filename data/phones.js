// PHONE - numbers you can dial on the kitchen handset. Data only; game.js owns the dialler.
// Each entry: { number:"555-0117", name:"Sato Residence", note:"shown in the directory list",
// also:["5550117"], // extra spellings that count as the same line
// calls:[ { at:"21:00", until:"23:55", // window when this call answers
// loops:[...], flags:["know_id"], // gates: this person answers only then
// Entry-level gates control DISCOVERABILITY (the number stays out of the Phone directory, and
// dialling it gives the same tone as an invented number): flags:["dir_read"] = must know them all,
// anyFlags:["dir_read","know_news"] = reading any one source lists the line. No hints are printed.
// state:"voice"|"voicemail"|"busy"|"noanswer",
// audio:"call_xxx", speaker:"…", jp:"日本語", en:"subtitle",
// duration:seconds if no audio, dlg:"dialogue id", once:true,
// set:["net_open"] | ["!flag"], // knowledge gained by talking to them
// msg:[{from:"Mira", text:"…"}] } ] } // chat injected right after the call
// Phone copy rule: these are real phone answers. People say their own name first, trail off,
// repeat a question, answer the part they heard. Paperwork facts stay exact, everything around
// them stays messy. Nobody delivering a plot summary.
window.PHONES = [
  {
    number: "555-0117", name: "Sato Residence", note: "family of four, brother works nights",
    also: ["5550117", "035550117"],
    flags: ["dir_read"],                                       // printed in the town listings
    calls: [
      { at: "18:00", until: "21:00", state: "noanswer" },
      {
        at: "21:00", until: "23:59", state: "voice", once: true,
        speaker: "Mira's brother", audio: "call_satobro_tower", duration: 14,
        jp: "あ、姉が言ってた人ですね。変に聞こえると思うんですけど、あのブローカー、昼と夜で名前を使い分けてます。昼が0x-kuroで、夜がnull_courier。同じ人です。",
        en: "oh, you're the one my sister mentioned. this is going to sound odd, but that broker splits his names by shift. 0x-kuro in the daytime, null_courier at night. same man.",
        set: ["net_open"],
        dlg: "after_satobro",
        msg: [
          { from: "Mira", text: "that's my brother on the phone lol. he says hi. he says you need the release page address" },
          { from: "Mira", text: "0x-kuro.net/release.html. he made me type it into the night net so i'd remember it too" }
        ]
      },
      { at: "23:30", until: "24:00", state: "busy" }
    ]
  },
  {
    number: "555-0192", name: "Kuroki Residence", note: "Kenji's house, his mother answers",
    also: ["5550192"],
    anyFlags: ["num_kuroki_home", "dad_office"],               // unlisted family, you need someone's paperwork
    calls: [
      { at: "18:00", until: "20:00", state: "noanswer" },
      {
        at: "20:00", until: "23:00", state: "voicemail", once: true,
        speaker: "Kuroki (ansible)", audio: "call_kuroki_ansible", duration: 16,
        jp: "こちらは黒木です。ただ今、席をはずしております。ご用の方は伝言をお残しください。",
        en: "this is the Kuroki residence. no one is home. please record your message after the tone.",
        set: []
      },
      {
        at: "23:00", until: "24:00", state: "voice", once: true,
        speaker: "Kenji's mother", audio: "call_kenji_mom_late", duration: 15,
        jp: "もしもしい……健司ですか。出てくれるのですか。探しています、昨日、捜索願を出しまして。どこにいるのか、あなたしかご存じないと言われたので",
        en: "...hello? is this Kenji? are you there? we're looking for him, we filed the report yesterday. someone said you were the only one who knew where he was.",
        set: []
      }
    ]
  },
  {
    number: "555-0100", name: "Kairos Police", note: "24h desk",
    also: ["5550100"],
    anyFlags: ["dir_read", "know_news"],                       // printed listings, or the paper's tips line
    calls: [
      { at: "18:00", until: "19:30", state: "busy" },
      {
        at: "19:30", until: "23:50", state: "voice", once: true,
        speaker: "Kairos PD desk", audio: "call_police_desk", duration: 17,
        jp: "黒木くんの端末の記録ですね。カフェ・ザガの四番の端末で十九時十九分に切断されています。それと同じ時刻に管理者による一括消去の予定が入ってます。店から報告がありました。",
        en: "the Kuroki boy's terminal record, yes. booth four at Café Zaga, cut off at nineteen nineteen. on that same timestamp a bulk wipe is booked by the account administrator. the shop reported it in.",
        set: ["know_netcafe"]
      }
    ]
  },
  {
    number: "555-0134", name: "Town Library", note: "closes 19:00",
    also: ["5550134"],
    flags: ["dir_read"],                                       // town listings only
    calls: [
      {
        at: "18:00", until: "19:05", state: "voice", once: true,
        speaker: "Library front desk", audio: "call_library_desk", duration: 13,
        jp: "はい、区立図書館です。区の台帳には音源の複製が記録されております。請求書の出ている品は金曜日まで保留します。それを過ぎますと業者のほうへ渡ります。",
        en: "yes, municipal library. the district ledger keeps archival copies of audio items. anything with a claim slip is held until friday. after that it goes out to the liquidator.",
        set: ["know_archive"]
      },
      { at: "19:05", until: "24:00", state: "noanswer" }
    ]
  },
  {
    number: "03-5510-8890", name: "Café Zaga (Dogenzaka)", note: "net café, open late",
    also: ["0355108890", "55108890"],
    anyFlags: ["dir_read", "know_news"],                       // listings, or the news tips page prints it
    calls: [
      {
        at: "18:00", until: "20:59", state: "voice", once: true,
        speaker: "Café Zaga staff", audio: "call_cafe_zaga", duration: 12,
        jp: "四番ですね……七時台に来た子なら覚えてます。百円で十分間、誰かにメールしてました。あ、消去の刻印は十一時半です。壁に貼った用紙に印刷でありますよ。",
        en: "booth four... I remember the kid from around seven. hundred yen for ten minutes, he was mailing someone. oh, the erase stamp says eleven thirty. it's printed on the sheet by our wall.",
        set: ["know_timer"]
      },
      {
        at: "21:00", until: "24:00", state: "busy"
      }
    ]
  },
  {
    number: "03-5510-2260", name: "Shinjuku Branch office", note: "switchboard, night shift, Dad",
    also: ["0355102260", "55102260"],
    anyFlags: ["dir_read", "dad_office"],                      // the switchboard is public, his name is not
    calls: [
      { at: "18:00", until: "21:14", state: "busy" },
      {
        at: "21:15", until: "23:55", state: "voice", once: true,
        speaker: "Dad", audio: "call_dad_ledger", duration: 24,
        jp: "八八四番の請求書が見つかったよ。ここにね、君の母の名前と健司の名前が並んで書いてあるんだ。精算を請求として通すと黒木の名前は台帳に残る。解除すれば名前は抜ける。ただ、台帳ごと消した場合は録音が先になくなる。先に聞いておきたかったんだ。",
        en: "i found slip eight eighty four. your mother's name and kenji's are written here one under the other. file it as a claim and kuroki's name stays in the ledger for good. withdraw the entry and his name comes out. but if the whole ledger goes, the recording goes first. i wanted you to hear that from me.",
        set: ["know_motive"],
        dlg: "after_dad_ledger",
        msg: [
          { from: "Dad", text: "I'll stay at the office till midnight. Whatever you decide tonight, don't carry it alone tomorrow" },
          { from: "Dad", text: "The slip says 'Track 04 - For the boys'. She wrote that herself. I'd like you to know she wrote it" }
        ]
      }
    ]
  },
  {
    number: "090-5510-1177", name: "Kenji (keitai)", note: "his cell, battery dead by evening",
    also: ["09055101177", "55101177"],
    flags: ["num_kenji_cell"],                                 // unlisted keitai: only his paperwork has it
    calls: [
      { at: "18:00", until: "19:59", state: "noanswer" },
      {
        at: "20:00", until: "24:00", state: "voicemail", once: true,
        speaker: "Ansible (Kenji's)", audio: "call_kenji_ansible", duration: 11,
        jp: "あー、黒木です。今出れません。用事ある人はメール入れといて。……じゃ。",
        en: "kuroki here. can't pick up. leave me a mail... later."
      }
    ]
  },
  {
    number: "03-5510-8871", name: "Dogenzaka Repair Unit 3", note: "DISCONNECTED 09/2002",
    also: ["0355108871", "55108871"],
    flags: ["dir_read"],                                       // the liquidation notice prints this line
    calls: [
      { at: "18:00", until: "24:00", state: "noanswer" }
    ]
  }
];

window.PHONE_DIRECTORY_HINTS = [
  "Directory listings are printed by the library media room and online at townphone-directory.org (business hours).",
  "Office numbers answered after 21:00 are answered by whoever is on shift."
];
