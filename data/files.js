// FILES: shown in File Explorer (C:\) and openable in Notepad / Image Viewer / Media Player.
// Each file:
// name: filename shown in explorer
// folder: OPTIONAL folder path, e.g. "C:\\Docs" (default = C:\\).
// Folders auto-appear wherever files live inside them; add extra
// (even empty) folders to window.FOLDERS below.
// icon: OPTIONAL image path for the row icon (default picks by type)
// type: "text" (Notepad) | "image" (Image Viewer, needs src) |
// "audio" (Media Player, needs src) | "binary" ("cannot open")
// content: text content (for type "text")
// loops: OPTIONAL array of loop numbers this file exists on (omit = always)
// flags: OPTIONAL knowledge gates - the file only shows up once you know those things
// set: flag(s) learned by OPENING this file ("!flag" clears one)
// delSet/ clearRestore: flag(s) changed when this file is deleted / restored
// dlg: dialogue id fired when opened
// Deleting moves a file to the Recycle Bin for the rest of the night; Restore puts it back.
// The drive contents are rebuilt every night at 18:00. Knowledge is what stays.

window.FILES = [
 // C:\ root
  {
    name: "system32.sys", folder: "C:\\", type: "binary"
  },
  {
    name: "history_timeline.txt", folder: "C:\\", type: "text",
    content:
      "HISTORY TIMELINE - due wednesday\n" +
      "=================================\n" +
      "topic: postwar reconstruction in our town?? (mr takahashi gave me this sheet)\n" +
      "\n" +
      "1964 - new station built, Dogenzaka slope shops start\n" +
      "1989 - arcade block at its biggest\n" +
      "1995 - half of the slope becomes parking\n" +
      "2002 - ???\n" +
      "\n" +
      "i'm not doing this tonight. i'm not doing anything tonight."
  },
  {
    name: "autoexec.txt", folder: "C:\\", type: "text",
    content:
      "@ECHO OFF\nPATH=C:\\WINDOWS;C:\\WINDOWS\\COMMAND;C:\\MOEM\nSET TMP=C:\\TEMP\nREM --- added 3 Jul 2002 (T.) ---\nMODE COM1:9600,N,8,1\nLH C:\\MOEM\\MTN.EXE /v:9600\nGOTO %START%\n\nREM mom kept this machine set up for us. she labelled the modem cable with tape.\nREM her initials are on the tape in biro."
  },
 // photos
  {
    name: "mycat:).png", folder: "C:\\Photos", type: "image", src: "assets/photos/mycat.jpg"
  },
  {
    name: "handout_scan_0414.png", folder: "C:\\Photos", type: "image",
    src: "assets/photos/handout_scan.png",
    set: ["know_geo"],
    dlg: "read_handout",
    note: "Mira photographed the back of Mr. Takahashi's handout with her keitai and sent it to you."
  },
  {
    name: "first_year_hoodie.jpg", folder: "C:\\Photos", type: "image",
    src: "assets/photos/hoodie_photo.jpg",
    flags: ["key_text"]
  },
  {
    name: "photo_album_page.png", folder: "C:\\Photos", type: "image",
    src: "assets/photos/photo_album_page.png",
    loops: [2, 3, 4, 5], dlg: "read_album"
  },
  {
    name: "kairos_station_oct02.jpg", folder: "C:\\Photos", type: "image",
    src: "assets/photos/kairos_station.jpg"
  },
 // docs
  {
    name: "kenji_sms_transcript.txt", folder: "C:\\Docs", type: "text",
    content:
      "typed up from his keitai messages (i copied them into notepad, sun 13 oct)\n" +
      "---------------------------------------------------------------------\n" +
      "\"listen i need you to remember a number for me just in case my phone dies\"\n" +
      "0419\n" +
      "\"password for my geocities page is that number\"\n" +
      "\"and if the keitai is dead ring the house, 555 0192, ring twice, mum sleeps with it off the hook\"\n" +
      "\"the courier wants 2000 more. im trading net cafe logins instead\"\n" +
      "\n" +
      "why would he use mum's birthday as a password. he knew she'd remember it for him.",
    set: ["num_kuroki_home"]            // his home line, from his own messages
  },
  {
    name: "class_contact_sheet.txt", folder: "C:\\Docs", type: "text",
    set: ["num_kenji_cell", "dad_office"],           // unlisted keitai digits + Dad's switchboard
    content:
      "CLASS 2-B EMERGENCY CONTACTS (sheet folded up in the shelf by the shoe lockers)\n" +
      "=========================================================\n" +
      "TANAKA R.     home 555-0221    mum at the flower shop, shuts 18:00\n" +
      "FUJII S.      home 555-0255    dad out on the night ferry\n" +
      "SAITO M.      home 555-0266    ring twice, their dog barks first\n" +
      "HAYASHI T.    shop 555-0311    nobody picks up at the house, try the counters\n" +
      "NISHIMURA K.  keitai 090-5510-4402   he will not answer this, write to him instead\n" +
      "KUROKI K.     keitai 090-5510-1177   battery flat he reckons\n" +
      "              house 555-0192   ex-directory, registrar wrote it in ink in the corner\n" +
      "\n" +
      "(the rows above are printed. the two below are pen, added later, different hand each time)\n" +
      "AOYAMA Y.     office 03-5510-2260   Shinjuku Branch, through the switchboard.\n" +
      "            form tutor says do not ring there in school hours, he shouts\n" +
      "(bottom of the page torn off where somebody ripped the top row away)\n" +
      "i have been staring at the ink number for ten minutes. mum's phone is listed as 'house'.\n" +
      "why would they need his number for an emergency drill. it is october, the drill was june."
  },
  {
    name: "md_index.txt", folder: "C:\\Music", type: "text",
    content:
      "MY MUM'S MINIDISC INDEX (from the box in the hallway, 12 oct)\n" +
      "=============================================================\n" +
      "TR 01 - rain, station platform, 1999\n" +
      "TR 02 - kitchen radio (recorded over and over)\n" +
      "TR 03 - kenji learning the harmonica, badly\n" +
      "TR 04 - For the boys        <-- hospital, jul/aug 2002\n" +
      "\n" +
      "the disc itself went with the walkman to Dogenzaka. unit 3.\n" +
      "dad says there's a slip. claim slips expire friday apparently."
  },
  {
    name: "letter_draft_unsent.txt", folder: "C:\\Docs\\Private", type: "text",
    loops: [3, 4, 5],
    content:
      "(her handwriting, typed here by dad i think)\n\n" +
      "boys -\n" +
      "if you are reading this the ward window was open again and it was raining\n" +
      "and I was awake so I recorded a little something. don't cry at school please.\n" +
      "Kenji, eat something that isn't from a convenience store.\n" +
      "you two will be fine together, that's the part I keep meaning to say.\n\n" +
      "(the rest of the sheet is blank)"
  },
 // late arrivals: these appear once you know things
  {
    name: "august_claimslip_scan.png", folder: "C:\\Docs", type: "image",
    src: "assets/photos/claimslip.png",
    flags: ["know_motive"],
    dlg: "read_slip",
    note: "Dad read it down the phone; the scan arrives from the office fax-to-email after your call."
  },
  {
    name: "liquidation_lot11.txt", folder: "C:\\Downloads", type: "text",
    flags: ["know_id"],
    content:
      "printed from kairosnews.com / liquidation notices\n\n" +
      "DOGENZAKA LOT 11: LIQUIDATION LIST (partial)\n" +
      " SHUTTERED TENANT: MD/CASSETTE REPAIR - UNIT 3\n" +
      " LOTS ACCEPTED FOR SALE 18 OCT 2002, 11:00\n" +
      " 11-A   walkman, silver MZ-series      HELD\n" +
      " 11-K   disc, recorded, labelled\n" +
      "        \"Track 04 - For the boys\"      HELD\n" +
      " HELD = awaiting claimant. claims close Friday 17:00.\n\n" +
      "there is an archive copy kept by the district for anything it has digitised.\n" +
      "the library page says municipal records get archived. so does that mean they have it?"
  },

 // ---- junk on the drive. school scraps, lists, logs, shareware. nothing here helps tonight.
  {
    name: "notes_bak.txt", folder: "C:\\", type: "text",
    content:
      "(this file was here when we got the machine. typed at 2am, kept by accident)\n" +
      "\n" +
      "soy sauce\nbatteries aa\nsoap\nreturn the video, late fee\n" +
      "call the shop about the tyre   NO DO NOT CALL THEM AGAIN\n" +
      "dial *** then your pin? dad wrote it on the receipt in pencil and rubbed it out\n" +
      "\n" +
      "i am not tired i am just sitting here. the fan is loud. the rain started.\n" +
      "write the rest tomorrow\n" +
      "tomorrow said no"
  },
  {
    name: "readme_1995.txt", folder: "C:\\Downloads", type: "text",
    content:
      "***********************************************************\n" +
      " CANYON DRIP  v1.3   shareware by M. Fuyutsuki, Narima (1995)\n" +
      "***********************************************************\n" +
      "You are playing an unregistered copy. Registration is ¥1,500 by\n" +
      "postal order to the box number in the manual. No internet orders.\n" +
      "\n" +
      "KEYS: arrows move, space shoots, Q quits, P pauses (does not pause)\n" +
      "\n" +
      "HIGH SCORE TABLE (copied off my screen, typed by hand)\n" +
      "  1 KUROKUSA   41,200\n" +
      "  2 YUMI       38,455\n" +
      "  3 TANOP     29,90x\n" +
      "  4 ME        11,300   <-- me, aged eleven, proud of it\n" +
      "\n" +
      "NOTE FROM ME, THIS YEAR: this runs fine under Windows now. The sound\n" +
      "is terrible and the bird in level two never stops flying. Leave it open\n" +
      "while you do homework, it makes the room feel like somebody is home."
  },
  {
    name: "shareware_scores.txt", folder: "C:\\TEMP", type: "binary"
  },
  {
    name: "bake_sale_list.txt", folder: "C:\\TEMP", type: "text",
    content:
      "BAKE SALE THINGS WE NEED (home econ, hall table, Friday afternoon)\n" +
      "====================================================\n" +
      "- plate 24, good plates not paper (write name on base of yours!)\n" +
      "- sugar 9 kg for the festival drinks booth, due Tuesday, co-op has bags\n" +
      "- butter 2 blocks (the cheap block tastes like wax, use the round one)\n" +
      "- tea towels 6, plain, no cartoon ones please, they curl when ironed\n" +
      "- jug with a spout (mine leaks at the join so I am bringing the bad one)\n" +
      "- 3 people to carry things at 15:30. nobody volunteers ever. I will ask twice then stop\n" +
      "\n" +
      "(bottom of page, pen) bake sale money goes in the envelope in the staff safe,\n" +
      "hand it to Sawada, do NOT keep it in your bag over the weekend, last time it did not work out."
  },
  {
    name: "garage_junklist_oct.txt", folder: "C:\\TEMP", type: "text",
    content:
      "RIVERSIDE GARAGE, STUFF TO CLEAR BEFORE THE RAIN GETS IN (Dad's list, typed by me)\n" +
      "=================================================================================\n" +
      "TUBE OF PUTTY, hard as rock           bin\n" +
      "PAINT TRAY, blue, crusted            keep, wash it\n" +
      "BOX OF JAR LIDS, no jars             give to the co-op stall?\n" +
      "STEPLADDER, wood, wobbly top rail    keep, fix with the brace screw\n" +
      "OLD RADIO, valves, dust inside       the man who collects radios wants this\n" +
      "LAMPS x3, shade missing on one       market Sunday, put them by the wall\n" +
      "SNOW SHOVELS x4 wooden handles       sell, ad is printed, ¥800 all four\n" +
      " TIN SIGN 'OPEN' shop issue           take photos of it, the collector pays petrol\n" +
      "ASH TRAYS x2                        yes to the collector\n" +
      "CHUNK OF CEILING                    leave it. we are not moving that today\n" +
      "\n" +
      "notes: the shutter on unit 4 is painted shut, do not lean motorbikes there.\n" +
      "lot B bays 12-16 cone out of use. light above bay 9 buzzes on its own."
  },
  {
    name: "bike_mileage_log.txt", folder: "C:\\TEMP", type: "text",
    content:
      "BIKE LOG (I write the date and the route for Mr Takahashi's project, extra credit said)\n" +
      "\n" +
      "Mon - station - co-op stall - home, 7 km, rain stopped at four, gutter full\n" +
      "Tue - west exit - library - home, 5 km, tyre low again, pump at home has no gauge\n" +
      "Wed - did not ride, shoes wet from the sink coming up through the floor\n" +
      "Thu - station - river path - home, 9 km, crows on the market wall at five am\n" +
      "Fri - didn't ride. homework. ate rice balls standing up like a degenerate\n" +
      "Sat - festival ground, 12 km, helped carry a box of books, got paid in barley tea\n" +
      "\n" +
      "TOTAL: about 33 km. Bell is broken, so I ring the bell at the shop front window.\n" +
      "(the last line is true, I did ring it and an old man shouted back something good)"
  },
  {
    name: "chain_letter_april02.txt", folder: "C:\\TEMP", type: "text",
    content:
      "FORWARD THIS TO SEVEN PEOPLE AND YOUR MICROWAVE WILL WORK FOR TEN MORE YEARS\n" +
      "=====================================================================\n" +
      "This letter was passed at cram school in February by a girl from third year\n" +
      "whose cousin works at the ward office copy room. She says her aunt's neighbour\n" +
      "kept this letter in her purse and her kettle did not scale for nine years.\n" +
      "\n" +
      "Rules:\n" +
      " 1 copy it by hand, printing does not count (proven, nobody proved this)\n" +
      " 2 send to seven people, minimum, eleven if you are ambitious\n" +
      " 3 do not read the bit at the bottom twice, it is bad luck\n" +
      "\n" +
      "AT THE BOTTOM OF MY COPY THERE IS NOTHING. The page ends here. Whoever copied\n" +
      "this before me cut the bottom off with scissors, which is the worst joke I have\n" +
      "been made part of this year. I am sending it to eleven people. Two of them are\n" +
      "my teachers, who will notice."
  },
  {
    name: "typing_practice.txt", folder: "C:\\TEMP", type: "text",
    content:
      "TYPING PRACTICE (I have nothing to say. typing so my hands stop being stiff.)\n\n" +
      "the rain rain rain rain RAun rrain rian\n" +
      "k k k k k l ; ; ' ' the enter key is louder than the others\n" +
      "abcdefghijklmnopqrstuvwxyz typewrite typwriter typwriter\n" +
      "MY NAME IS NOT IMPORTANT\n" +
      "555555555555   0000000   11111111   iiiiiiii llllll\n" +
      "(that last row is my hand doing that, it happens when i stay on the keys too long)\n" +
      "i typed the whole alphabet backwards once and found a word in it that isn't a word\n" +
      "STOP NOW GO EAT SOMETHING"
  },
  {
    name: "karaoke_lyrics_page.txt", folder: "C:\\TEMP", type: "text",
    content:
      "PAGE FROM THE LYRICS BOX UNDER THE TABLE (market hall, Sundays, 4th song down)\n" +
      "\n" +
      "  Chorus:  don't look back at the light in the doorway\n" +
      "           don't look back   (repeat x4 with a long note)\n" +
      "\n" +
      "NOTE IN BIRO: the second verse skips on our machine, everybody knows, we sing\n" +
      "it early so the skip looks planned. Volunteer wears white hat.\n" +
      "NOTE 2 IN PEN (different hand): mic cable taped twice, tape has initials, do not pull.\n" +
      "NOTE 3 (somebody's mother, printed on the back?): tea is in the big jug by the plug,\n" +
      "take cups from under the table. Prize last week was a melon bread and a man of sixty won it.\n" +
      "\n" +
      "we end with the instrument one, no words, everyone hums, then the lights come on."
  },
  {
    name: "pigeon_count_oct.txt", folder: "C:\\TEMP", type: "text",
    content:
      "PIGEON COUNT, RIVER GROUND (I am doing this for the project? No. I started this for nothing.)\n" +
      "\n" +
      "Mon - eleven on the wall, four on the rail, none in the bins\n" +
      "Tue - rain, ground empty, they are under the market roof like men at a bus stop\n" +
      "Wed - six, two fat ones, one limping near the tap\n" +
      "Thu - forty? I counted twice, then they moved as a group and I lost count entirely\n" +
      "Fri - forgot to look, rained all day, thinking about it now makes me feel stupid\n" +
      "Sat - festival day, they came out at noon when the crowd thinned. Good timing for them.\n" +
      "\n" +
      "conclusion: pigeons are better at this town than I am. That is my conclusion. Thank you."
  },
  {
    name: "todo_summer02.txt", folder: "C:\\TEMP", type: "text",
    content:
      "SUMMER LIST (july, before everything got loud)\n" +
      "=====================================\n" +
      "[x] return library book (late fee ¥60, paid, they took it without saying anything)\n" +
      "[ ] fix bike tyre, pump has no gauge, buy tube ¥480\n" +
      "[x] clean the fan filter (disgusting, twelve years old dust)\n" +
      "[ ] ask dad about the August receipts drawer (ask him when he is not tired, that never happens)\n" +
      "[x] tell kenji his harmonica is in the lost property list (did, he said WHAT, three times)\n" +
      "[ ] move the box from the hallway (winter coats. do it with him. not alone)\n" +
      "[ ] school shoes, size changed, feet grew again in a year of not noticing\n" +
      "[x] melon bread on Wednesday (mira left it on the doorknob with green tea, she is insufferable)\n" +
      "\n" +
      "(the last two lines on the page are pen, added over time) [ ] sleep\n" +
      "[x] did not sleep, good job, awarded nothing"
  },
  {
    name: "town_hall_notice_oct12.txt", folder: "C:\\Docs", type: "text",
    content:
      "TOWN HALL NOTICE BOARD (photocopied at the counter, October, sheet 3 of the pad)\n" +
      "===========================================================================\n" +
      "- Festival Saturday 19. Rain plan posted at the ward office. Chairs: ninety provided.\n" +
      "- Covered market, north side, tenants meeting Tuesday afternoon, hall busy from two.\n" +
      "- Storeroom clearance: grey pool table free to a collector, one pocket hangs, take rails too.\n" +
      "- Water gauge numbers go up on the board by the door each morning (prefecture request).\n" +
      "- Forms short for three weeks. Ask the desk for a queue ticket. Bring a pen, ours walk off.\n" +
      "- Lost children tent beside the water tap during events, volunteers wear white hats.\n" +
      "- Dog licence renewals at the park fence, Saturday only this month.\n" +
      "- Shoe shelf lockers forced at the high school, second year. Nothing taken. Tutors notified.\n" +
      "\n" +
      "(someone's pen at the bottom of the sheet): the light above bay 9 in lot B buzzes again,\n" +
      "the keeper has asked twice for a workman. Nobody has come. It does it for nobody."
  },
  {
    name: "konbini_shift_notes.txt", folder: "C:\\Docs", type: "text",
    content:
      "SHIFT NOTES TAPED INSIDE THE COUNTER (typed up from a photocopy, part of my project week)\n" +
      "=====================================================================================\n" +
      "- rice balls: front row rotation, red band, fish tail sells fastest by the school rush\n" +
      "- hot case: turn at eleven pm, wipe the glass, the cloth leaves threads (buy coarse ones)\n" +
      "- towels: winter stock arrives late, chain store carries them, co-op stall will not\n" +
      "- soup cans, cold ones, keep them near the door, people buy them walking in, summer habit\n" +
      "- coffee machine descale Thursday night, form by the register, write your start time\n" +
      "- the man with the soba cart is outside Sundays now, he rings once an hour, do not answer\n" +
      "- umbrella stand empty since the storm, shop sells out every rain, order twelve more\n" +
      "- payphones: both work; left one takes coins and gives change, right one eats ¥100 notes\n" +
      "\n" +
      "night manager writes on every sheet: \"do not lean on the case\". Same handwriting all year.\n" +
      "My shift ends when the train with no passengers goes through at midnight, roughly."
  },
  {
    name: "gym_shoe_debt.txt", folder: "C:\\Docs", type: "text",
    content:
      "GYM SHOE DEBT NOTE (folded in my bag since June, I have re-typed it because I lost it twice)\n" +
      "\n" +
      "Name: ________________  Class: 2-__   Shoes borrowed: 1 pair, size 26.5\n" +
      "Reason: PE stored shoes over the weekend shelf, mine were gone, kept by reception\n" +
      "Cost if not returned: ¥3,400   Signed: ____________  Date: __________\n" +
      "\n" +
      "(pencil, small, my hand): they took them back themselves. The label inside says a\n" +
      "name that is not mine and not Kenji's either. It was in MY locker. Nobody has said\n" +
      "one word about how that happened. School says shoe shelves get forced, it is normal,\n" +
      "second year, nothing taken.\n" +
      "\n" +
      "Nothing taken! Great. Everything is fine, in writing, three times this week."
  },
  {
    name: "stationery_order_form.txt", folder: "C:\\Docs", type: "text",
    content:
      "OFFICE STATIONERY ORDER (form 12b, front of the sheet, typed from the copy room stack)\n" +
      "==================================================================================\n" +
      "Date ________  Dept: Shinjuku Branch / KAIROS counter\n" +
      "Carbon slips  x5 pads          Ink rollers  x2         Queue tickets  x1 pad\n" +
      "Ledger labels (long) x1 pack  Stapler pins x1 box      Fax ribbon     x1\n" +
      "Approved by ________________________   Received by ________________________\n" +
      "\n" +
      "Printed note across the bottom: ledger paper is rationed until forms arrive Friday.\n" +
      "Requests for district entries take THREE DAYS. Ask at the desk for the October box.\n" +
      "Ask for the queue ticket. Bring your own pen.\n" +
      "\n" +
      "(somebody wrote in biro in the corner, very small, hard to read: 'the queue moved\n" +
      "to the window with the glass'. That is all. Somebody's Tuesday afternoon.)"
  },
  {
    name: "tapes_i_borrowed.txt", folder: "C:\\Music", type: "text",
    content:
      "THINGS I BORROWED AND DID NOT RETURN (my list, honest one, taped inside the cupboard door)\n" +
      "===================================================================================\n" +
      "- cassette, folk, 1982, neighbour (he died. his son does not listen to tapes.)\n" +
      "- CD, blue cover, borrowed from yamchan, Aug 4, he has mentioned it nine times now\n" +
      "- MD blanks 90min x6, shop stock, they are mine, do not lend them again\n" +
      "- spindle of CDs, market co-op stall, unlabelled boxes, six of them came back bad\n" +
      "- amplifier, hums when cold, fine when warm, belongs to my uncle, that is awkward\n" +
      "- ABBA tape, from a church jumble sale box full of sermons, mother keeps it on the shelf\n" +
      "- radio with valves, garage, the collector wants it, I will give it Sunday if he comes\n" +
      "\n" +
      "one line under all this in pen: \"give things back while people are still there to get them\"\n" +
      "(I did not write it. the handwriting is not mine. It fits under everything so I left it.)"
  },
  {
    name: "print_order_slip.txt", folder: "C:\\Photos", type: "text",
    content:
      "PHOTO DEVELOPMENT ORDER SLIP (photocopied off the envelope we got back Saturday)\n" +
      "===========================================================================\n" +
      "Shop: station front, next to the bakery   Order no. ____3__7___  Done Fri, cost ¥1,150\n" +
      "Film 1: frames 1-24 (2 blank: exposure 9 and exposure 20, both rain, both grey)\n" +
      "Frames noted by hand at the counter, the counter woman writes what she says out loud:\n" +
      "- frame 3: two boys, one laughing too hard, green paint on the wall behind them\n" +
      "- frame 6: the awning by the river, typhoon weather, cardboard in somebody's hands\n" +
      "- frame 12: hall piano, someone's sock visible under it, joke photo, printed anyway\n" +
      "- frame 21: kitchen window open, curtain moved, recorded nothing, print shows the gap\n" +
      "- frame 24: cut in printing, film ended early, half a hand and the walkman shape?\n" +
      "          The counter wrote: 'shape unclear, you tell me'\n" +
      "\n" +
      "we kept the negatives. They live in the envelope in the drawer with all the others."
  }
];

// Extra folders that show up even when empty (paths use backslashes)
window.FOLDERS = [
  "C:\\Docs\\Private",
  "C:\\Music",
  "C:\\Downloads",
  "C:\\TEMP"
];

// Recycle Bin contents same fields as FILES (type/content/src/icon), fully openable
window.RECYCLE = [
  { name: "voicemail_0412.wav", type: "audio", src: "assets/audio/MiraVoicemail1.mp3", dialogue_trigger: "MiraVoicemail1" },
  {
    name: "old_history_timeline_draft.txt", type: "text",
    content: "(an earlier draft of the timeline. one line underlined twice: \"the shops on the slope know each other\")"
  }
];

// KEY HANDLERS - the broker's settlement rules, implemented as plain file behaviour.
// Copying a string into Notepad means nothing. SAVING it to the root of C:\ makes it
// a live key. Deleting it into the Recycle Bin hides it from the wipe script (Kenji's
// idea, and null_courier's posted rule). Restoring it puts the live key back on the drive.
(function () {
  var VERIFY_STRING = "KURO-884-MD-VERIFY-9F27C4";     // shibuya-night thread #402, exact
  var savedKeyFile = null;                            // filename that validated this night

  function flat(s) { return String(s || "").toUpperCase().replace(/[\\/]+/g, "").trim(); }
  function isRoot(folder) { return flat(folder) === "C:"; }
  function normText(s) { return String(s || "").toUpperCase().replace(/[\s\u00A0]+/g, ""); }

  window.SAVE_HANDLER = function (text, name, folder) {
    var body = normText(text);
    if (body.indexOf(normText(VERIFY_STRING)) === -1) return [];       // not the verification string
    if (!isRoot(folder)) {                                             // their scanner only reads the system drive root
      fireDataHint("key_wrong_place");
      return [];
    }
    savedKeyFile = String(name).toLowerCase();
    fireDataHint("key_saved_ok");                     // tell the player the key is live where the scanner reads
    return ["key_saved"];
  };

  window.DELETE_HANDLER = function (f) {
    if (savedKeyFile && f && String(f.name).toLowerCase() === savedKeyFile) return ["key_in_bin"];
    return [];
  };

  window.RESTORE_HANDLER = function (f) {
    if (savedKeyFile && f && String(f.name).toLowerCase() === savedKeyFile) return ["!key_in_bin", "key_saved"];
    return [];
  };

  function fireDataHint(id) { try { if (window.triggerDialogue) window.triggerDialogue(id); } catch (e) {} }
})();

window.ALL_FLAGS = [
  "know_geo", "know_code", "know_id", "key_text", "key_saved", "key_in_bin",
  "know_motive", "net_open", "saved_kenji", "chose_erase",
  "know_netcafe", "know_archive", "know_timer",
  "board_read", "dir_read", "know_news",
  "num_kuroki_home", "num_kenji_cell", "dad_office"
];
