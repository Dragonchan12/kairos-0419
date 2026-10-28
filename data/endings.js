// ENDINGS - declarative. game.js checks these at midnight, in list order.
// { id:"morning",
// needAll:["key_saved","key_in_bin"], // every flag required to fire this ending
// notAny:["chose_claim"], // blocks the ending if any of these are known
// flags / notFlags / loops // standard gates, same as messages/dialogue
// titleAfter:"This Morning", // renames the logon screen afterwards
// lines:[ { speaker, jp, en, audio, duration } ] } // played word-by-word on black
// Nothing about an ending explains itself. Knowledge is the only gate: knowing enough
// ends the night, and a single loop can be the last one.
window.ENDINGS = [
  {
    id: "true_morning",
    titleAfter: "This Morning",
    needAll: ["know_id", "key_saved", "key_in_bin", "know_motive", "net_open", "saved_kenji", "chose_erase"],
    notAny: ["chose_claim"],
    lines: [
      {
        speaker: "",
        jp: "回線が落ちた。",
        en: "The line drops.",
        audio: "ending_line_drop",
        duration: 4
      },
      {
        speaker: "Kenji",
        jp: "……姉ちゃんには言うなよ。今、歩き始めたとこ。",
        en: "...don't tell my sister. I just started walking.",
        audio: "ending_kenji_walking",
        duration: 7
      },
      {
        speaker: "Mira",
        jp: "うち起きてるから。何時でもいいから電話して。",
        en: "I'm up. Call me whenever you want, any hour.",
        audio: "ending_mira_up",
        duration: 7
      },
      {
        speaker: "Dad",
        jp: "…鍵はかけたか。",
        en: "...did you latch the door.",
        audio: "ending_dad_latch",
        duration: 5
      },
      {
        speaker: "",
        jp: "ディスクには何も入ってなかった。四番目のトラックだけが、無音のままだった",
        en: "Nothing was recorded on the disc. Only track four stayed silent the whole way through.",
        audio: "ending_track04_parent",
        duration: 10
      },
      {
        speaker: "",
        jp: "午前六時十一分。雨は止んでいた。",
        en: "6:11 AM. The rain had stopped.",
        audio: "",
        duration: 6
      }
    ]
  }
];

// The full knowledge set a complete night touches (excludes chose_claim,
// which deliberately blocks the true ending). Listed in files.js as window.ALL_FLAGS.
