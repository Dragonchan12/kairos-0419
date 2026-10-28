// DIALOGUE - plays in the bottom text bar, word-by-word with shake.
// Each line:
// id: event-triggered lines carry an id and NO `at`. Fire with
// triggerDialogue("id"), a message's dlg:"id", a site's dlgPages,
// a file's dlg, or a phone call's dlg. Fires once per loop unless
// repeatable:true.
// speaker: name shown above the Japanese (omit / "" for none = your own thoughts)
// jp: Japanese - spoken first, big. This is what gets recorded.
// en: English subtitle under it (reading only, never voiced)
// audio: clip name WITHOUT extension -> assets/audio/dialogue/<audio>.mp3 (.wav/.ogg fallback)
// at: "HH:MM" 24h - fires automatically when the clock reaches it
// loops: OPTIONAL array of loop numbers this line appears on. Omit = every loop.
// flags/notFlags/locks: knowledge gates. A gated timed line stays pending until you
// learn what unlocks it, then plays on the next tick - so knowing things
// late still gives you the line inside the same night.
// duration: seconds to hold the line when no clip exists (<1000 = seconds)
// Click anywhere / press Space to advance to the next queued line.
//
// Written rule for this game: nobody explains the plot out loud. Bar lines are the
// player's own thoughts or an actual voice on the phone/page - they name facts, never
// mechanics ("go to X then do Y" lives in chat and pages, which the player reads).
// Second rule: bar lines are said by a tired kid at a kitchen table, not by a narrator.
// Concrete things, half sentences, small observations. No slogans, no neat pairings,
// nothing that sounds like a trailer reading itself. Match the register in data/messages.js.
// Target seconds in each block's comment = the VO length for RECORDING_MANIFEST.md.

window.DIALOGUE = [

 // night openers (one per loop, all at 18:02)
  { // 7s
    speaker: "You",
    jp: "……また十八時二分だ。起きたばかりなのに、なんでこの時計を知っているんだ",
    en: "...it's 18:02 again. I just woke up. why do I already know this clock.",
    audio: "intro1",
    at: "18:02",
    loops: [1]
  },
  { // 6s, loop 2: recognising the night without explaining it
    speaker: "You",
    jp: "さっきの夜はどこへ行ったんだっけ。……夢じゃなかったよな",
    en: "where did last night go? that wasn't a dream, right.",
    audio: "start_loop2",
    at: "18:02",
    loops: [2]
  },
  { // 7s, loop 3+: stopped asking why, started working
    speaker: "You",
    jp: "今夜でやめる。五回目は作らない、それだけ考えてればいいのか",
    en: "ending it tonight. no fifth night. is that enough to think about?",
    audio: "start_loop3",
    at: "18:02",
    loops: [3, 4, 5, 6, 7, 8]
  },
  { // 6s, late room tone, only after the Night Net has you
    speaker: "",
    jp: "受話器を持ったまま何分経つんだこれ。自分の息の音がしてるだけだ",
    en: "how many minutes of just holding the receiver. only sound left is my breathing.",
    audio: "room_tone_2326",
    at: "23:26",
    flags: ["net_open"],
    notFlags: ["saved_kenji"]
  },

 // files opened
  { // 6s, C:\Photos\handout_scan_0414.png (Mira's keitai photo of the handout)
    id: "read_handout",
    speaker: "You",
    jp: "プリントの裏に書いとくのかよ。字が汚くて三回読み返した",
    en: "of course he wrote it on the back of a math handout. bad handwriting, I read it three times.",
    audio: "read_handout",
    duration: 6
  },
  { // 7s, photo_album_page.png (loops 2+, scanned album page)
    id: "read_album",
    speaker: "You",
    jp: "うちのアルバムは全部日付なしだ。母が撮ったものばかりだから、たぶんそれで",
    en: "every date stamp is missing from our albums. mom shot all of them, so that's probably why.",
    audio: "read_album",
    loops: [2, 3, 4, 5, 6, 7, 8],
    duration: 8
  },
  { // 6s, august_claimslip_scan.png (arrives after Dad reads slip 884)
    id: "read_slip",
    speaker: "You",
    jp: "母の字だ。「四番目、男の子たちへ」。走り書きでしかないのに",
    en: "that's mom's handwriting. \"track four, for the boys\". just a scrawl, and nothing more.",
    audio: "read_slip",
    duration: 6
  },

 // pages you read
  { // 4s, deadpan beat of normalcy on cutecats.com/gallery.html
    id: "saw_gallery",
    speaker: "",
    jp: "……猫だ。",
    en: "...cats.",
    audio: "saw_gallery",
    duration: 4
  },
  { // 7s, kairosnews.com/tips.html : printed names and ledgers
    id: "saw_tips",
    speaker: "You",
    jp: "記事に名前が出るってことは、台帳にもそのまま載るってことだよな",
    en: "so if a name gets printed in the article, it goes into the record the same way.",
    audio: "saw_tips",
    duration: 7
  },
  { // 7s, midnight-chat.net /tower.html (#tower, satobro)
    id: "night_net_brother",
    speaker: "You",
    jp: "会ったこともないのにあっち側なのか。まあ、姉の弟だからよ",
    en: "he's already picked a side and we've never met. well. he is mira's brother.",
    audio: "night_net_brother",
    duration: 8
  },
  { // 5s, midnight-chat.net /slope.html (terminal 4 log + wipe stamp)
    id: "saw_slope_log",
    speaker: "You",
    jp: "壁に貼った用紙のまま、十一時半一括消去って書いてある",
    en: "the sheet taped to their wall says bulk wipe at eleven thirty, plain as that.",
    audio: "saw_slope_log",
    duration: 8
  },
  { // 7s, geocities.jp/ken_md98/pin0419.html unlocked
    id: "saw_id_page",
    speaker: "You",
    jp: "四一九って、母の誕生日じゃん。自分の鍵にあれ入れたのか",
    en: "0419. that's mom's birthday. he used it as his own lock.",
    audio: "saw_id_page",
    duration: 7
  },
  { // 6s, shibuya-night.net guestbook thread #402
    id: "saw_thread402",
    speaker: "You",
    jp: "残り百円の端末でこれを打ってるんだよね。何回打ち直したんだろう",
    en: "he typed this with a hundred yen left on the terminal. i wonder how many times he redid it.",
    audio: "saw_thread402",
    duration: 6
  },
  { // 5s, 0x-kuro.net/release.html answers you
    id: "saw_release",
    speaker: "You",
    jp: "書式が二つある。夜を閉じるのはどっちだ",
    en: "there are two settlement forms. which one closes tonight.",
    audio: "saw_release",
    duration: 5
  },
  { // 8s, settlement A executed (archive erased, ledger withdrawn)
    id: "saw_settle_page",
    speaker: "You",
    jp: "台帳のほうが抜けたんだな。先に無くなったのは録音の方か",
    en: "so the ledger came out. what went first was the recording.",
    audio: "saw_settle_page",
    flags: ["saved_kenji"],
    duration: 8
  },
  { // 8s, settlement B filed (goods recovered, ledger stands)
    id: "saw_claim_page",
    speaker: "You",
    jp: "ディスクは帰ってくるんだ。僕の名前はどこにも出ない。健司だけが残る",
    en: "the disc comes home. my name never shows up on anything. only kenji stays printed.",
    audio: "saw_claim_page",
    duration: 8
  },

 // the broker's one physical rule
  { // 4s, fires once per night when a saved key lands where the scanner reads it
    id: "key_saved_ok",
    speaker: "",
    jp: "ドライブの一番上に入れた。向こうから読める位置だ",
    en: "it's sitting at the top level of the drive now. reachable from their side.",
    audio: "key_saved_ok",
    duration: 4
  },
  { // 5s, repeatable: the key was saved somewhere the scanner cannot read
    id: "key_wrong_place",
    speaker: "",
    jp: "一番上に置かないと、ただのテキストファイルだよな",
    en: "if it isn't saved at the top level it's just a text file again.",
    audio: "key_wrong_place",
    repeatable: true,
    duration: 5
  },

 // post-call thoughts (the calls themselves are voiced in data/phones.js)
  { // 6s, after Mira's brother on the kitchen line
    id: "after_satobro",
    speaker: "You",
    jp: "一つの男が名前言い分けてただけなのか。うまいやり方だよな",
    en: "one man splitting his own name by shift. clean way to run it, honestly.",
    audio: "after_satobro",
    duration: 6
  },
  { // 8s, after Dad reads slip 884 at the office
    id: "after_dad_ledger",
    speaker: "You",
    jp: "母の名前の下に、健司の名前があるんだよな。金曜までに決めろと言われた",
    en: "under mom's name there is kenji's name. dad said decide before friday.",
    audio: "after_dad_ledger",
    duration: 8
  },

 // pre-night voicemail (openable from the recycle bin)
  { // 15s, existing authored line, kept verbatim; clip lives in assets/audio/ too so Media Player can play it
    id: "MiraVoicemail1",
    speaker: "Mira",
    duration: 15,
    jp: "やあ、親友！ここ数日会ってなかったから、どうしてるかなと思って連絡したんだ。例の……あの件とか、いろいろあるからね。",
    en: "Hello there <span style='color: red; font-weight: bold;'> ???</span>! I haven't seen you in a couple days I wanted to check in with how you were doing. Considering everything going on with... you know..."
  }
];
