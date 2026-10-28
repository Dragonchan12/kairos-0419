// WEBSITES, add/edit sites here.
// Each site:
// domain: the URL you type (no http:// needed), e.g. "cutecats.com"
// title: shown in the browser status bar
// delay: ms to simulate slow loading (default 1500)
// gate: OPTIONAL time lock {start:"20:30", end:"23:00"}, 24h clock.
// pages: map of path -> HTML content. Path "" or "/" is the homepage.
// Links inside pages should use plain <a href="path.html"> style
// relative links, they work automatically inside the page frame.
// flags / notFlags: OPTIONAL knowledge gates for the WHOLE site. Until you know
// the right things the server behaves like it does not exist (DNS 404).
// locks: per-page knowledge lock, e.g. locks:{ "/pin0419.html":["know_code"] }
// lockHints / lockScreens: what the locked page says about why it refuses you
// variants: same URL, different page once you know more: [{flags:[...], html:...}]
// sets: landing on a page is itself knowledge, e.g. sets:{ "/":["know_geo"] }
// dlg / dlgPages: dialogue ids fired when a page finishes loading
// Pages may run scripts and talk to the game shell: parent.hasFlag("x"),
// parent.setFlag("y"), parent.triggerDialogue("id"), parent.deliverMsg({from:,text:}).
window.SITES = [
  {
    domain: "cutecats.com",
    title: "Cutest Cats on the Web!",
    delay: 1800,
    dlgPages: { "gallery.html": "saw_gallery" },   // dialogue fires when this page finishes loading
    pages: {
      "/": `
        <h1 style="color:#c2185b;font-family:'Comic Sans MS',cursive;">★ The Cutest Cats on the Internet ★</h1>
        <p>Welcome to Cutecats.com! Home of feline goodness since 2001.</p>
        <ul>
          <li><a href="home.html">Home</a></li>
          <li><a href="gallery.html">Gallery</a></li>
          <li><a href="guestbook.html">Guestbook</a></li>
        </ul>
        <marquee behavior="scroll" direction="left" style="background:#ffe4ec;padding:4px;border:2px ridge #c2185b;">
          Thank you for visiting!! Don't forget to sign the guestbook!! ^_^
        </marquee>
        <p style="color:#888;font-size:11px;">You are visitor number 004,213</p>`,
      "home.html": `
        <h1 style="color:#c2185b;">Home</h1>
        <p>This site is dedicated to cats. Cats are great. Here is a cat:</p>
        <pre style="font-size:20px;"> /\\_/\\
( o.o )
  &gt; ^ &lt;</pre>
        <a href="/">Back to index</a>`,
      "gallery.html": `
        <style>
          .cat-grid { border: 3px ridge #c2185b; background: #fff0f5; border-collapse: collapse; }
          .cat-grid td { border: 1px dotted #c2185b; padding: 8px; text-align: center; vertical-align: middle; width: 140px; height: 120px; font-size: 12px; }
          .cat-grid img { max-width: 130px; max-height: 100px; width: auto; height: auto; object-fit: cover; border: 2px solid #fff; box-shadow: 1px 1px 0 #888; display: block; margin: 0 auto 4px; }
        </style>
        <h1 style="color:#c2185b;">Gallery (under construction)</h1>
        <table class="cat-grid">
          <tr>
            <td>
              <img src="assets/photos/catcurl2.jpg" alt="Cat curled up">
              cat curled up!!
            </td>
            <td><img src="assets/photos/catplant.jpg" alt="Cat eating a plant">
              cat eating my plants :\<</td>
          </tr>
          <tr>
            <td>
              <img src="assets/photos/catbox.jpg" alt="Cat in a box">
              cat in a box!!
            </td>
            <td><img src="assets/photos/catcurled.jpg" alt="Cat curled">
              cat curled up!!</td>
          </tr>
          <tr>
            <td>
              <img src="assets/photos/catstare.jpg" alt="Cat looking at us">
              he looking at us
            </td>
            <td><img src="assets/photos/catstretch.jpg" alt="Cat stretched">
              he stretch</td>
          </tr>
          <tr>
            <td>
              <img src="assets/photos/catstretch2.jpg" alt="Cat still stretch">
              he really stretch
            </td>
            <td><img src="assets/photos/catstretch3.jpg" alt="Cat stretched">
              he stretch MORE</td>
          </tr>
                    <tr>
            <td>
              <img src="assets/photos/catstare2.jpg" alt="Cat looking at us again">
              he looking at us again
            </td>
            <td><img src="assets/photos/catlay.jpg" alt="Cat laying down">
              he sit</td>
          </tr>
        </table>
        <br><a href="/">Back to index</a>`,
      "guestbook.html": `
        <h1 style="color:#c2185b;">Guestbook</h1>
        <div style="background:white;border:2px inset;padding:6px;max-width:400px;">
          <p><b>xX_kittenlover_Xx</b> wrote:<br/>OMG best cat site EVER 5 stars!!1!</p>
          <hr/>
          <p><b>anon</b> wrote:<br/>cute gatos little gatos and more gatos</p>
        </div>
        <br><a href="/">Back to index</a>`
    }
  },

 // Kairos News Network - the town's own page of record. Mira is alive, so no
 // obituary anywhere on this site. Kenji's absence is printed small.
  {
    domain: "kairosnews.com",
    title: "Kairos News Network",
    delay: 2200,
    sets: { "/": ["know_news"], "tips.html": ["know_news"] },   // reading the paper anywhere counts
    dlgPages: { "tips.html": "saw_tips" },
    pages: {
      "/": `
        <style>
          .nn { font-family: Georgia, serif; }
          .nn h1 { font-size: 26px; letter-spacing: 2px; margin-bottom: 2px; }
          .nn .rule { border-top: 3px double #000; }
          .nn h3 { font-size: 16px; margin-bottom: 2px; }
          .nn p { font-size: 13px; line-height: 1.45; }
          .nn .dat { font-size: 11px; color: #444; }
          .nn td { vertical-align: top; padding-right: 14px; font-size: 12px; }
        </style>
        <div class="nn">
          <h1>KAIROS NEWS NETWORK</h1>
          <div class="dat">Vol. 41 No. 287 &nbsp;·&nbsp; Monday, October 14, 2002 &nbsp;·&nbsp; ¥180</div>
          <div class="rule"></div>
          <h3>Second day absent: family files report for KUROKI, 17</h3>
          <p>Kuroki Kenji, a second-year student at Kairos High School, has not been seen
          since Sunday evening. His family reported him missing at 9:40 AM this morning.
          Police say there are <i>"no signs of foul play"</i>, though an unanswered call was
          placed from his cell phone at 11:11 PM on the night he disappeared.</p>
          <p>School officials say a locker in the east corridor was found open and untouched
          over the weekend. Neighbours describe him as <i>"loud, always in that green hoodie."</i></p>
          <p><a href="tips.html">If you have information (tips line and hours)</a></p>
          <hr/>
          <table width="100%" class="nn"><tr>
            <td width="48%">
              <h3>Dogenzaka repair shop closes, contents to liquidation</h3>
              <p>The miniDisc and cassette repair shop on the Dogenzaka slope closed in
              September without notice. The landlord says unclaimed items will be sold as a
              lot on <b>Friday, Oct 18</b>. Claim slips issued before August are honoured
              until Friday only.</p>
              <p><a href="liquidation.html">Liquidation notices</a></p>
            </td>
            <td width="48%">
              <h3>Town notes</h3>
              <p>&middot; Sato family curry stand returns to the station Saturday.<br/>
              &middot; Library: media room closed Tuesdays for rewiring.<br/>
              &middot; Town phone listings, all residential + office lines: townphone-directory.org<br/>
              &middot; Kairos Night Net modem pool, node 7: midnight-chat.net. Nights only, from 21:00.<br/>
              &middot; Rain totals for October already above average.</p>
            </td>
          </tr></table>
          <hr/>
          <table width="100%" class="nn"><tr>
            <td width="48%">
              <h3>In today's paper</h3>
              <p>&middot; <a href="festival.html">Autumn festival: booth list and rain plan</a><br/>
              &middot; <a href="weather.html">Weather, and the tide table for the week</a><br/>
              &middot; <a href="transit.html">Timetable notes, last train changed</a><br/>
              &middot; <a href="parking.html">Parking notices: Dogenzaka lot B</a><br/>
              &middot; <a href="schoolnotes.html">Kairos High: notes, lost property, bake sale</a><br/>
              &middot; <a href="letters.html">Letters to the editor</a><br/>
              &middot; <a href="classifieds.html">Classifieds (all small ads)</a><br/>
              &middot; <a href="crossword.html">Crossword, puzzle of the day</a></p>
            </td>
            <td width="48%">
              <h3>Read on the wire</h3>
              <p>&middot; Prefecture asks towns to post water gauge numbers through October.<br/>
              &middot; Two arcade owners in Kairos say they have asked for a joint security camera.<br/>
              &middot; Barley prices up again at the market. The produce co-op blames transport.<br/>
              &middot; The ward office is short of forms for three weeks. Ask for the queue ticket.</p>
            </td>
          </tr></table>
          <hr/>
          <p class="dat">World Cup post-mortem: six months on, the town's screen is still
          unplugged. "We got used to the quiet," one shopkeeper said.</p>
          <p class="dat">Riverside shops report fewer afternoon customers since the ramp closed.
          Three say they will keep the same hours anyway. "The crows are early this year," one said.</p>
        </div>`,
      "tips.html": `
        <style>body{font-family:Georgia,serif;} .d{border:2px solid #000;padding:6px;background:#f4f4f4;}</style>
        <h2 style="font-size:20px;">Tips: Kuroki disappearance</h2>
        <p>Kairos PD asks anyone who saw a student in a green hooded sweatshirt near the
        Dogenzaka slope between Sunday and Monday to call <b>555-0100</b>.</p>
        <p>The last data session on Kuroki's cellular account terminated 9:19 PM Sunday at a
        net café on the slope (<b>Café Zaga, 03-5510-8890</b>). Requests for the terminal log
        were made this morning. Management has not responded.</p>
        <div class="d">
          <b>Notice from the district ledger office</b><br/>
          Purchase ledgers carrying personal names are public record when a settlement is
          contested. Entries may be withdrawn by written request of the party named.
        </div>
        <p><a href="/">Back to index</a></p>`,
      "liquidation.html": `
        <style>body{font-family:'Courier New',monospace;font-size:12px;} table{border-collapse:collapse;} td{padding:2px 10px;border-bottom:1px solid #ccc;}</style>
        <h3>DOGENZAKA LOT 11: LIQUIDATION LIST (partial)</h3>
        <pre>SHUTTERED TENANT: MD/CASSETTE REPAIR - UNIT 3
LOTS ACCEPTED FOR SALE 18 OCT 2002, 11:00
================================================
LOT   ITEM                       CLAIM SLIP
 11-A  walkman, silver MZ-series   HELD
 11-B  optical cable, OEM          n/a
 11-C  recordable MD discs (bulk)  n/a
 ...
 11-K  disc, recorded, labelled
       "Track 04 - For the boys"   HELD
================================================
HELD = awaiting claimant. Claims close Friday 17:00.</pre>
        <p>A lot number is printed in ink on the disc hub, not readable in this scan.</p>
        <p><a href="/">Back to index</a></p>`,

      // ---- filler pages below: the rest of the paper, nothing in them bears on tonight -------
      "festival.html": `
        <style>body{font-family:Georgia,serif;} h2{font-size:21px;} p{font-size:13px;line-height:1.5;} .sm{font-size:11px;color:#444;}</style>
        <h2>Kairos Autumn Festival, Saturday 19 October</h2>
        <p><b>Programme as posted at the ward office.</b> Gates open 10:00 on the river ground, behind
        the old market wall. Rain plan: if the ground closes at eleven the booths move under the covered
        market, same order, half depth.</p>
        <table width="100%" cellpadding="4">
          <tr><th>Row</th><th>Booth</th><th>Hours</th><th>Note</th></tr>
          <tr><td>A1-A6</td><td>Produce co-op, dried goods</td><td>10:00-15:00</td><td>card table only, no cash change</td></tr>
          <tr><td>B1-B3</td><td>Home economics class, drinks booth</td><td>10:30-14:00</td><td>barley tea, ¥100 a cup</td></tr>
          <tr><td>C1</td><td>Flower stall, fishermen's widows</td><td>10:00-13:00</td><td>they give away the last stems</td></tr>
          <tr><td>D2-D7</td><td>Used books, library friends</td><td>all day</td><td>two boxes unlabelled, ask at the table</td></tr>
          <tr><td>E1</td><td>Park committee, raffle tickets</td><td>tickets close early</td><td>book fourteen has eleven numbers in it</td></tr>
          <tr><td>F4</td><td>Martial arts demo</td><td>13:00, 15:30</td><td>nobody on this street knows who runs that any more</td></tr>
        </table>
        <p>The committee apologises for the sound truck driving the street loop in the afternoon. Two
        residents complained last year about the volume between houses. The driver says he plays whatever
        is already in the deck of his car.</p>
        <p>Lost children are taken to the tent beside the water tap. Volunteers wear white hats. A dog
        licence renewal desk will be set up by the fence on Saturday and not on Sunday.</p>
        <p class="sm">Committee note (posted): "Please do not put chairs out from home. We have ninety of
        our own and we count them."</p>
        <p><a href="/">Back to index</a></p>`,

      "weather.html": `
        <style>body{font-family:Georgia,serif;} h2{font-size:21px;} p{font-size:13px;line-height:1.5;} td{font-size:12px;padding:2px 12px;border-bottom:1px solid #ccc;}</style>
        <h2>Weather: Kairos district, seven days</h2>
        <table>
          <tr><th>Day</th><th>Overnight</th><th>Day</th><th>Rain mm</th><th>Wind</th></tr>
          <tr><td>Tonight</td><td>rain, heavy near the mouth</td><td>rain clearing</td><td>38</td><td>SW 6</td></tr>
          <tr><td>Tue</td><td>cloud</td><td>bright periods</td><td>4</td><td>NW 3</td></tr>
          <tr><td>Wed</td><td>cloud</td><td>showers after four</td><td>11</td><td>S 4</td></tr>
          <tr><td>Thu</td><td>light rain</td><td>rain all day</td><td>27</td><td>E 5</td></tr>
          <tr><td>Fri</td><td>rain</td><td>heavy, gusts</td><td>61</td><td>SW 9</td></tr>
          <tr><td>Sat</td><td>heavy</td><td>clearing late morning</td><td>44</td><td>SW 7</td></tr>
          <tr><td>Sun</td><td>cloud</td><td>fine</td><td>2</td><td>N 2</td></tr>
        </table>
        <p>The October total is above the eleven year average for the second time in three years. The
        station master says the ramp under the footbridge goes under water in about nine minutes of hard
        rain, and that this happens more than it used to.</p>
        <h2 style="font-size:17px;">Tide table (standard port, rounded)</h2>
        <table>
          <tr><th>Date</th><th>High</th><th>m</th><th>Low</th><th>m</th></tr>
          <tr><td>Mon 14</td><td>03:18</td><td>1.6</td><td>09:44</td><td>0.6</td></tr>
          <tr><td>Tue 15</td><td>04:02</td><td>1.7</td><td>10:29</td><td>0.5</td></tr>
          <tr><td>Wed 16</td><td>04:47</td><td>1.8</td><td>11:15</td><td>0.5</td></tr>
          <tr><td>Thu 17</td><td>05:33</td><td>1.9</td><td>12:02</td><td>0.4</td></tr>
          <tr><td>Fri 18</td><td>06:21</td><td>2.1</td><td>12:51</td><td>0.4</td></tr>
        </table>
        <p class="sm">The pier steps are slippery after two in the afternoon. Two gull net injuries were
        recorded this month at the fish market steps. A man who fishes from the east wall says there is no
        crab worth taking this season and never has been, "that's a story people tell you".</p>
        <p><a href="/">Back to index</a></p>`,

      "transit.html": `
        <style>body{font-family:'Courier New',monospace;font-size:12px;}</style>
        <h3>Timetable notes on local services, effective Monday 14 October</h3>
<pre>KAIROS / SHIBUYA (local, all stops)
 first up             05:41   unchanged
 school extra         07:12   (fills by 07:09, guard says do not run for it)
 daytime gaps         every 20 min, 10:00-14:00
 late service         leaves Kairos 00:04
 last on the branch   22:57   three cars, middle one heated only</pre>
        <p>The late service will be shortened to two cars through November. Staff say one door does not
        open at the third car as usual. Use the second.</p>
        <p>Road works on the slope continue until Friday. Buses that turn at the top of the slope use the
        lower stop. The driver has posted his own note asking people to stand back from the pole, because
        the mirror does not see the kerb.</p>
        <p>Taxi rank outside the station: four cars between evening and midnight, three of them share one
        radio. One driver declined to comment about waiting times at the west exit.</p>
        <p><a href="/">Back to index</a></p>`,

      "parking.html": `
        <style>body{font-family:'Courier New',monospace;font-size:12px;} table{border-collapse:collapse;} td{padding:2px 10px;border-bottom:1px solid #ddd;}</style>
        <h3>Dogenzaka lot B: notices posted by the lot keeper</h3>
        <table width="100%">
          <tr><td>Barrier arm out of order Mon and Tue. Gate open, pay in the box.</td></tr>
          <tr><td>Bays 12 to 16 out of use. Oil stain under the third bay. Cone left there.</td></tr>
          <tr><td>Late hours free of charge. Nobody takes the tickets out of the box any more.</td></tr>
          <tr><td>A white van with no plates has been in bay 2 since Tuesday. It moves when it rains.</td></tr>
          <tr><td>Motorbikes use the wall side. Do not lean against unit 4 shutter.</td></tr>
        </table>
        <p>Lot B opens at half seven, closes at eleven, gate chained after. The keeper is a man named on
        the hut window who says he does not know why the light above bay 9 buzzes when nothing happens
        there.</p>
        <p style="font-size:11px;color:#555;">The landlord's notice for the shuttered tenant is printed separately,
        <a href="liquidation.html">here</a>.</p>
        <p><a href="/">Back to index</a></p>`,

      "schoolnotes.html": `
        <style>body{font-family:Georgia,serif;} h2{font-size:20px;} p,li{font-size:13px;line-height:1.5;} td{font-size:12px;padding:2px 10px;border-bottom:1px solid #ddd;}</style>
        <h2>Kairos High School notes, week of 14 October</h2>
        <ul>
          <li>Midterms begin Thursday. The library reading room stays open until six during the week.</li>
          <li>Hall floor polish Wednesday afternoon. Bag your shoes if you have a plastic bag for them.</li>
          <li>Home economics needs nine kilos of sugar by Tuesday for the festival drinks booth.</li>
          <li>Swimming pool heated from Monday. Bring your own towel, school towels are in repair.</li>
          <li>Three students report the shoe shelf lockers forced over the weekend, again. Nothing taken, second year.</li>
        </ul>
        <h3 style="font-size:16px;">Lost property, listed as found</h3>
        <table width="100%">
          <tr><td>1 grey hoodie, sleeve frayed, no name inside</td><td>found by the river path awning</td></tr>
          <tr><td>blue folder, empty, corner torn off</td><td>east corridor, near the water tap</td></tr>
          <tr><td>tin harmonica, three holes taped over</td><td>cram school bin, handed in by an adult</td></tr>
          <tr><td>key ring, 2 keys and a rubber band</td><td>no locker matches it, kept at reception</td></tr>
          <tr><td>calculator, grey, battery cover missing</td><td>staff room drawer</td></tr>
          <tr><td>one school sock, blue striped</td><td>under the hall piano, on its own</td></tr>
        </table>
        <p>The bake sale takes the good plates. If you lend dishes write your name under the base. Washing
        up is done by the third-year committee, who say things come back scratched.</p>
        <p>A reminder from the form tutors: midterms are coming up. They ask parents to keep contact
        details current because the school rings homes when an evening class is called off.</p>
        <p><a href="/">Back to index</a></p>`,

      "letters.html": `
        <style>body{font-family:Georgia,serif;} h2{font-size:20px;} p{font-size:13px;line-height:1.5;} .sig{font-size:11px;color:#444;}</style>
        <h2>Letters to the editor</h2>
        <p>"The crows have taken to the roof of the market wall and the neighbours and I have been up from
        five every morning this week. We do not want them shot. We want somebody to move the bins away from
        that wall, which nobody has done in two years."<br/><span class="sig">Riverside row, woman, 71</span></p>
        <p>"About the sound truck at Saturday events. Last month it played the same track eleven times
        between six and seven in the evening, outside houses with babies in them. It was a brass band
        recording and it sounded fine the first four times."<br/><span class="sig">Hill side, man, retired (sic)</span></p>
        <p>"Six months after the screens went quiet on the arcade block there are still people walking past
        to look at nothing. That is my point. Put something up. A board. Paint. Anything. The town looks like
        it is waiting for news."<br/><span class="sig">Station front shopkeeper</span></p>
        <p>"Replying to last week's letter about the curry stand queue: yes we stood in it forty minutes in
        the rain, and yes the portions were small, and no, my husband is not going to stop going there. Do
        not print my address."<br/><span class="sig">Name withheld, Kairos</span></p>
        <p>"The ward office ran out of forms. They told me to come back Thursday with a queue ticket. Their
        notice says the forms arrive Friday. This is not new. This is how it works now."<br/>
        <span class="sig">Produce co-op bookkeeper</span></p>
        <p style="font-size:11px;color:#555;">Letters are copied by hand into the ledger. The paper prints what fits.</p>
        <p><a href="/">Back to index</a></p>`,

      "classifieds.html": `
        <style>body{font-family:'Courier New',monospace;font-size:12px;} td{vertical-align:top;padding:3px 12px;border-bottom:1px solid #ddd;}</style>
        <h3>Classifieds (all). Small ads, ¥180 a line.</h3>
        <table width="100%">
          <tr><td width="48%"><b>LOST CAT</b>, orange, white bib, answers to Mochi. Hill side. Ring after five, 555-0344. Reward, will pay.</td>
              <td><b>MUSIC LESSONS</b>, piano, upright at my house, children from six. I do not teach for exams. Tuesday afternoon slots open.</td></tr>
          <tr><td><b>PART TIME KITCHEN</b>, evening staff, weekends, two wanted. Station front. Ask at the counter for the sheet.</td>
              <td><b>WANTED: old radios</b>, working or not, valves, any brand. Also lamps, ash trays, tin signs. I collect from your shed and pay petrol.</td></tr>
          <tr><td><b>BIKE, girl's frame, blue</b>, needs tyres. ¥3,400. Ring 555-0288 late afternoon. Bell is broken, keep that in mind.</td>
              <td><b>FLAT TO LET</b>, one room upstairs, shared bath, near the market wall. Quiet tenants, no evening parties. From next Monday.</td></tr>
          <tr><td><b>SNOW SHOVELS</b>, four, wooden handles, good condition. ¥800 all four. Take them now. Winter is arriving like last winter did not.</td>
              <td><b>TUTORING, math</b>, second year syllabus, home visits, modest fee. I have notes from eleven years of the same exam paper.</td></tr>
          <tr><td><b>MORNING HOUSEKEEPING</b>, two houses needed before the end of October. Reference required. Speak to the shop on the corner.</td>
              <td><b>DESK LAMP</b>, green shade, school issue, works. ¥600. It has a name written inside the shade in biro and we cannot read it.</td></tr>
          <tr><td colspan="2"><b>CORRECTIONS</b>: the used deck advertised last week was withdrawn by the seller, "found it already". Do not ring him.</td></tr>
        </table>
        <p style="font-size:11px;color:#555;">Ads close Wednesday noon. Names print as given. The paper does not check phone numbers.</p>
        <p><a href="/">Back to index</a></p>`,

      "crossword.html": `
        <style>body{font-family:'Courier New',monospace;font-size:12px;} .g{border-collapse:collapse;} .g td{width:24px;height:24px;border:1px solid #777;text-align:center;font-size:13px;}</style>
        <h3>Puzzle of the day</h3>
        <table class="g">
          <tr><td>#</td><td>A</td><td>B</td><td>C</td><td>D</td></tr>
          <tr><td>E</td><td>F</td><td>G</td><td>H</td><td>I</td></tr>
          <tr><td>J</td><td>K</td><td>L</td><td>M</td><td>N</td></tr>
          <tr><td>O</td><td>P</td><td>Q</td><td>R</td><td>S</td></tr>
          <tr><td>T</td><td>U</td><td>V</td><td>W</td><td>X</td></tr>
        </table>
<pre>ACROSS
 2 - station ramp, six letters
 4 - shop that fixes things, seven letters
 6 - rain on a tin roof, five letters
DOWN
 1 - tide going out, four letters
 3 - booth row letter, three letters
 5 - ward office queue, eight letters</pre>
        <p>The answers are posted last Saturday and nobody takes them off the wall. Three people have told
        the committee they solved this same puzzle twice from memory, which the committee finds funny and
        then does not like.</p>
        <p style="font-size:11px;color:#555;">Pens are not provided at the booth. Take a pencil.</p>
        <p><a href="/">Back to index</a></p>`
    }
  },

 // Kairos Night Net - a local BBS that only accepts connections late.
 // Not haunted. Just slow, cheap, and full of people who are awake.
  {
    domain: "midnight-chat.net",
    title: "Kairos Night Net",
    delay: 3600,
    gate: { start: "21:00", end: "24:00" },   // the modem pool only answers after 9 PM
    sets: { "tower.html": ["net_open"] },
    dlgPages: { "tower.html": "night_net_brother", "slope.html": "saw_slope_log" },
    variants: {
      "/": [
        { flags: ["know_id"], html: `
            <body style="background:#000;color:#0f0;font-family:'Courier New',monospace;">
            <h2>KAIROSKIT &middot; NIGHT NET &middot; node 7</h2>
            <hr color="#0f0"/>
            <pre>connected from: KAIROS/212-55xx  (56k, 48000 bps)
rooms open tonight:  #math-room   #tower   slope-board
users online: satobro(2), kenju?, null_courier(idle), you</pre>
            <p><b>[21:??] satobro:</b> if you're reading this, my sister told you to look for me.<br/>
            <b>[21:??] satobro:</b> go to <a href="tower.html">#tower</a>. i work nights at tower records shibuya and i know the broker's rules.</p>
            <p><b>[--:--] system:</b> user <b>ken_md98</b> last logged 19:19 from CAFÉ ZAGA / TERMINAL 4.</p>
            <p>_ <span style="color:#070">modem pool closes at midnight</span></p>` }
      ]
    },
    pages: {
      "/": `
        <body style="background:#000;color:#0f0;font-family:'Courier New',monospace;">
        <h2>KAIROSKIT &middot; NIGHT NET &middot; node 7</h2>
        <hr color="#0f0"/>
        <pre>connected from: KAIROS/212-55xx  (56k, 48000 bps)
rooms open tonight:  #math-room   #tower   slope-board
users online: satobro(2), you</pre>
        <ul>
          <li><a href="math-room.html">#math-room</a> (3 users, loud)</li>
          <li><a href="tower.html">#tower</a> (staff, Tower Records Shibuya)</li>
          <li><a href="slope.html">slope-board</a> (Café Zaga terminal postings)</li>
          <li><a href="karaoke.html">#karaoke</a> (4 users, drunk on barley tea)</li>
          <li><a href="diner.html">#diner</a> (5 users, eating standing up)</li>
          <li><a href="fishlab.html">#fish-lab</a> (2 users, tide charts)</li>
          <li><a href="rainwatch.html">#rain-watch</a> (6 users, nobody sleeping)</li>
          <li><a href="tradepub.html">#trades-pub</a> (buying, selling, arguing about price)</li>
        </ul>
        <p>[satobro]: yo. anyone awake. my sister is freaking out and won't call anybody</p>
        <p>_ <span style="color:#070">modem pool closes at midnight</span></p>`,
      "math-room.html": `
        <body style="background:#000;color:#0f0;font-family:'Courier New',monospace;">
        <h2>#math-room</h2>
        <p>[21:14] m_melona: ugh history timeline due wednesday and kenji has my notes<br/>
        [21:15] m_melona: his mom is calling every ten minutes. someone tell him to answer his keitai pls<br/>
        [21:16] kairos_yuu: ???<br/>
        [21:16] m_melona: anyway i'm copying off yuu tomorrow. brb rice is ready
        [21:29] kairos_yuu: who moved my eraser. there is no eraser in this house any more
        [21:31] m_melona: your mother threw out the whole pencil box i heard her tell the neighbour
        [21:31] kairos_yuu: lol accurate
        [21:4x] gacha_granny: wrong room olds. where is the karaoke room someone point me
        [21:44] m_melona: grandma this is math. go to #karaoke, third link down the list
        [21:47] kairos_yuu: she found it faster than me and i have been on this node two years
        [21:52] m_melona: ok back to fractions. ask me anything except the timeline project, kenji took my notes</p>
        <p><a href="/">back</a></p>`,
      "tower.html": `
        <body style="background:#000;color:#0f0;font-family:'Courier New',monospace;">
        <h2>#tower &nbsp;<span style="font-size:11px;">Tower Records Shibuya, night staff</span></h2>
        <p>[21:0x] <b>satobro:</b> Mira's brother. she asked me to look something up for you<br/>
        [21:0x] <b>satobro:</b> the broker on shibuya-night goes by null_courier at night, 0x-kuro in the day. same guy.<br/>
        [21:0x] <b>satobro:</b> he runs a release page. no index, no links. address only:<br/>
        <b>&nbsp;&nbsp;0x-kuro.net/release.html&nbsp;&nbsp;</b><br/>
        [21:0x] <b>satobro:</b> you need an ID on the URL to make it answer you. the transaction ID. KENJI HAS IT<br/>
        [21:0x] <b>satobro:</b> and listen, the locker key must be physically off the drive. delete it. their scanner reads C:\\ root txt files, not the bin.<br/>
        [21:0x] <b>satobro:</b> don't empty the bin. emptied = destroyed. the bin is just... hidden.</p>
        <p><a href="/">back</a></p>`,
      "slope.html": `
        <body style="background:#000;color:#0f0;font-family:'Courier New',monospace;">
        <h2>slope-board &middot; CAFÉ ZAGA TERMINAL POSTINGS</h2>
<pre>TERM 4: session log (partial)
19:15  login OK  user=ken_md98  credit ¥100
19:19  POST thread #402 / guestbook
19:19  CONNECT shibuya-night.net  → ABORT (credit)
-------
23:30  AUTOMATIC WIPE SCHEDULED BY HOST ADMIN (null_courier)
       pending settlements unconfirmed at wipe = VOID
-------
NOTE FROM STAFF 21:xx: terminal 4 is out of order since Monday.</pre>
        <p>Wipe timer printed on the room scheduler by the counter. Nobody crossed it out.</p>
        <p><a href="/">back</a></p>`,

      // ---- rooms with nothing going on. people awake at night, talking about nothing -----
      "karaoke.html": `
        <body style="background:#000;color:#0f0;font-family:'Courier New',monospace;">
        <h2>#karaoke &nbsp;<span style="font-size:11px;">the market hall runs it Sundays, bring your own lyrics</span></h2>
<pre>[21:07] gacha_granny: I do not know the words to any of them. I go for the company and the tea
[21:09] m_melona: granny you sing the old enka songs better than anybody there
[21:09] gacha_granny: I sing two songs and stand up straight. That is the whole trick
[21:18] hill_side_hiro: the machine in the hall skips the second verse on one disk. Everybody knows, nobody tells the volunteer
[21:22] kairosteru: Sunday prize was a melon bread last week. Won by a man of sixty who sang pop
[21:31] yamchan: lyrics book is in the box under the table. Take a page if yours is wet from rain
[21:40] gacha_granny: mic cable has tape on it marked with biro. Somebody's initials, again everything here is taped
[21:58] kairosteru: closing time they play the same instrument track four times and everybody leaves anyway</pre>
        <p><a href="/">back</a></p>`,

      "diner.html": `
        <body style="background:#000;color:#0f0;font-family:'Courier New',monospace;">
        <h2>#diner &nbsp;<span style="font-size:11px;">for people eating at this hour</span></h2>
<pre>[21:12] soba_or_bust: egg sandwich at the 24 hour place. New bread. It falls apart now, softer, cheaper
[21:14] night_diner_mod: make it at home, carry it in the bag from the counter, nobody minds
[21:26] cdrsue: hot towels are worse as well. This is the real news of October and I will die on this
[21:29] yamchan: the soba cart went to the west exit. Sundays only. Forty minutes standing in rain
[21:36] gacha_granny: bring notes, he has no change after nine and says so on a card in his pocket
[21:52] hill_side_hiro: best rice ball is the one with the fish tail, from the shop by the co-op, not the chain
[22:05] soba_or_bust: chain store wins on the sweet corn soup can. Cold one. Summer habit, still buying them
[22:20] night_diner_mod: my supper tonight is noodles out of the pot at eleven. This board makes me feel normal</pre>
        <p><a href="/">back</a></p>`,

      "fishlab.html": `
        <body style="background:#000;color:#0f0;font-family:'Courier New',monospace;">
        <h2>#fish-lab &nbsp;<span style="font-size:11px;">homework, tanks, tide charts, complaints about crabs</span></h2>
<pre>[21:17] kairos_yuu: the tide table in the paper this week is up to 2.1 m on Friday. That is boat weather
[21:19] gacha_granny: the east wall man says there is never crab worth taking. He said it in 2001 too
[21:27] kairosteru: tank pump noise keeps my father awake, so he bought a second pump and now both hum
[21:45] kairos_yuu: biology ask for river samples Sunday. Bring a jar. Not a jam jar, the lid rusts
[21:48] gacha_granny: my jar has a rubber band round it. The rubber band is older than my daughter
[22:16] kairos_yuu: crows on the market wall again at five am. Everyone here awake. That's a support group
[22:31] gacha_granny: the water gauge numbers go up the ward office wall now. Prefecture asked. Nothing else changed</pre>
        <p><a href="/">back</a></p>`,

      "rainwatch.html": `
        <body style="background:#000;color:#0f0;font-family:'Courier New',monospace;">
        <h2>#rain-watch &nbsp;<span style="font-size:11px;">the people who cannot sleep and talk about the weather</span></h2>
<pre>[21:04] hill_side_hiro: nine minutes hard rain and the ramp under the footbridge goes under. Facts from the station master
[21:08] yamchan: our gutter fills and comes back up through the kitchen sink. Same as last October. Plumber quotes Tuesday
[21:21] kairosteru: I can hear the roof from inside. I lie down and count it like a game
[21:29] soba_or_bust: umbrella in the hall since March, nobody puts it back, the shop sells out of them every storm
[21:51] gacha_granny: forty four mm Saturday. Festival ground closes eleven and moves the booths under cover. Posted in the paper
[22:07] kairos_yuu: I like the rain loud on the tin above the shed. It is a good thing to be awake for
[22:23] hill_side_hiro: six one on Friday. Fill the jugs, wash the front step, put the shoes in, that is all you do
[22:39] yamchan: the white van in bay 2 of lot B has no plates and only moves when it rains. Discuss.</pre>
        <p><a href="/">back</a></p>`,

      "tradepub.html": `
        <body style="background:#000;color:#0f0;font-family:'Courier New',monospace;">
        <h2>#trades-pub &nbsp;<span style="font-size:11px;">buying, selling, arguing about price. Numbers are for PMs, not the board</span></h2>
<pre>[21:33] yamchan: AT keyboard beige working, I will pay train fare to collect it. No listings here, mod says
[21:38] ogaki_media: stall Saturdays, used spindles unlabelled. Cheap. That's the pitch
[21:57] tape_deck_tanaka: my burner tray motor sounds like a cat in a box. Shoe insole foam ring. Ten years I have done this
[22:10] cdrsue: 6 failed discs out of eighty off a market spindle. Good odds. Post brand by private message
[22:26] mdjunkie99: who wants a green school desk lamp with a name inside the shade? Nobody claims it
[22:41] hill_side_hiro: free pool table town hall storeroom, grey felt, one pocket hangs. You move it
[22:58] ogaki_media: sermons on tape, one ABBA. From a church jumble. My mother keeps the ABBA one
[23:12] night_diner_mod: closing the room at midnight, go eat something. This board is not food</pre>
        <p><a href="/">back</a></p>`
    }
  },

 // Town phone directory - printed by the library, online in a ugly table.
  {
    domain: "townphone-directory.org",
    title: "Kairos Phone Directory",
    delay: 1200,
    gate: { start: "18:00", end: "21:30" },   // business hours only
    sets: { "/": ["dir_read"] },
    pages: {
      "/": `
        <style>td{padding:2px 10px;} .n{font-family:'Courier New',monospace;}</style>
        <h2>Kairos Town Directory (business hours)</h2>
        <table border="1" cellpadding="4">
          <tr><th>Listing</th><th>Number</th><th>Notes</th></tr>
          <tr><td>Sato Residence</td><td class="n">555-0117</td><td>family of four, brother works nights</td></tr>
          <tr><td>Kairos Police</td><td class="n">555-0100</td><td>24h desk</td></tr>
          <tr><td>Town Library</td><td class="n">555-0134</td><td>closes 19:00</td></tr>
          <tr><td>Café Zaga, Dogenzaka slope</td><td class="n">03-5510-8890</td><td>net café, open late</td></tr>
          <tr><td>Aoyama T., Shinjuku Branch (office)</td><td class="n">03-5510-2260</td><td>switchboard, night shift</td></tr>
          <tr><td>Dogenzaka Repair Unit 3</td><td class="n">03-5510-8871</td><td>DISCONNECTED 09/2002</td></tr>
          <tr><td>Disconnected lines</td><td class="n">555-????</td><td>see library desk for paper list</td></tr>
        </table>
        <p style="font-size:11px;color:#555;">Listings updated by the Kairos Library media room.
        A printed copy is filed at the front desk. Calls placed to office numbers after 21:00 are answered by whoever is on shift.</p>`
    }
  },

 // Kenji's GeoCities page. Under construction forever. Password-protected dir.
  {
    domain: "geocities.jp",
    title: "GeoCities Japan - ken_md98",
    delay: 2000,
    locks: { "ken_md98/pin0419.html": ["know_code"] },
    lockHints: {
      "ken_md98/pin0419.html": "The directory requires a 4 digit code. Kenji says it is easy to remember."
    },
    sets: {
      "ken_md98": ["know_geo"],
      "ken_md98/backup.html": ["know_code"],
      "ken_md98/pin0419.html": ["know_id"]
    },
    dlgPages: { "ken_md98/pin0419.html": "saw_id_page" },
    pages: {
      "ken_md98": `
        <style>body{background:#003366;color:#fff;font-family:'MS UI Gothic',sans-serif;}a{color:#ffef6b;}</style>
        <center>
          <h1>*~*KEN'S MD ZONE*~*</h1>
          <marquee behavior="scroll" direction="left" width="90%">minidisc &gt;&gt; transfers &gt;&gt; shibuya-night #402 &gt;&gt; Dogenzaka &gt;&gt;</marquee>
          <img src="assets/photos/mdwalkman.jpg" alt="" style="border:2px solid #fff;padding:2px;background:#000;max-width:220px;"><br/>
          <span style="font-size:11px;color:#bcd;">this page under construction since Aug 2002. sign my guestbook!</span>
          <hr color="#336699"/>
          <a href="ken_md98/backup.html">→ my backup text (public)</a><br/>
          <a href="ken_md98/pin0419.html">→ /PIN0419/ (PRIVATE, members only)</a><br/>
          <a href="http://shibuya-night.net/">shibuya-night.net</a> &nbsp;·&nbsp; webring next
          <p style="font-size:10px;color:#8fa;">Best viewed in Internet Explorer 5 at 800x600. No frames.</p>
        </center>`,
      "ken_md98/backup.html": `
        <pre style="font-family:'Courier New',monospace;font-size:12px;">KENJI BAKUP FILE - do not delete plz

- broker handle: null_courier   (day name: 0x-kuro)
- forum: shibuya-night thread #402 (guestbook is archived, he said)
- repair shop: DOGENZAKA UNIT 3, closed sept, sold as lot Friday
- the disc: she recorded it in the hospital. "Track 04 - For the boys"
- my mom has NO IDEA about any of this so don't call home

password for my private dir = her birthday. 0419. easy right??
i typed it in a folder name i trust myself to remember it

if you're reading this and i didn't come back:
the private dir has the transaction id + how settlement works.
</pre>
        <a href="ken_md98/">back to index</a>`,
      "ken_md98/pin0419.html": `
        <style>body{background:#000;color:#cfe;font-family:'Courier New',monospace;font-size:12px;}b{color:#ff6;}</style>
        <h3>/PIN0419/: KENJI TRANSFER NOTES (private)</h3>
<pre>TRANSACTION ID : <b>MD-884-SHIBUYA</b>
SETTLEMENT HOST: <b>0x-kuro.net</b>  (release page, address only)
WIPE TIMER     : 23:30 tonight. unconfirmed settlements VOID.

HOW TO SETTLE (from null_courier's rules, copied exactly):
 1. verification string is posted in shibuya-night <b>thread #402</b>, guestbook.
    copy it EXACTLY into a plain text file on C:\\ and SAVE IT.
    the host reads saved keys off your drive. unsaved words are nothing.
 2. then DELETE the key file. put it in the RECYCLE BIN.
    their wipe script scans live files only. a file sitting in the bin is
    invisible to it. do NOT empty the bin. emptied = destroyed.
 3. bring the claim slip number to the release page before the timer.

IF YOU CHOOSE THE OTHER ROUTE (recovery claim, settle_claim):
 the disc comes back, the ledger entry stays with MY NAME on it.
 that's what happened to me. i signed it. i can't get out of it alone.
 i'm at CAFÉ ZAGA / TERMINAL 4. 100 yen left. don't tell my mom.
</pre>
        <script>try{ if(parent.hasFlag && parent.hasFlag("key_in_bin")) { document.getElementById("bin").innerHTML = "KEY STATE: bin. good. leave it there."; } }catch(e){}</script>
        <p id="bin">KEY STATE: unknown.</p>
        <a href="ken_md98/" style="color:#8fd;">back to index</a>`
    }
  },

 // shibuya-night.net - the forum Kenji lives on. vBulletin-ish, ugly, real.
  {
    domain: "shibuya-night.net",
    title: "shibuya-night // board index",
    delay: 2800,
    sets: { "guestbook.html": ["key_text"], "/": ["board_read"] },
    dlgPages: { "guestbook.html": "saw_thread402" },
    pages: {
      "/": `
        <style>body{font-family:Verdana,Arial,sans-serif;font-size:12px;background:#e6ebf5;}
        .hd{background:#003366;color:#fff;padding:6px;font-weight:bold;}
        table{border-collapse:collapse;width:100%;} th{background:#c3d1ea;text-align:left;font-size:11px;padding:3px 6px;border:1px solid #7d94bd;}
        td{background:#fff;border:1px solid #b6c4dd;padding:3px 6px;}</style>
        <div class="hd">shibuya-night &nbsp;<span style="font-weight:normal;font-size:11px;">hardware · transfers · MD/CD-R · Shibuya/Dogenzaka meet ups</span></div>
        <table>
          <tr><th>Forum</th><th>Threads</th><th>Last post</th></tr>
          <tr><td><a href="transfers.html">Transfers &amp; trades (Japan)</a></td><td>1,204</td><td>today 19:19 by ken_md98</td></tr>
          <tr><td><a href="guestbook.html">Guestbook / thread #402, BROKER RULES</a></td><td>402</td><td>today 19:19 by ken_md98</td></tr>
          <tr><td><a href="repairshop.html">Dogenzaka repair shop (dead)</a></td><td>88</td><td>Sep 30 by mod</td></tr>
          <tr><td><a href="burners.html">CD-R &amp; burners</a></td><td>641</td><td>Oct 13 22:07 by cdrsue</td></tr>
          <tr><td><a href="arcade.html">Arcade &amp; pinball (Kairos)</a></td><td>219</td><td>Sep 28 by pinball_wiz_82</td></tr>
          <tr><td><a href="diner.html">Off-topic: the night diner</a></td><td>1,118</td><td>Oct 13 23:5x by soba_or_bust</td></tr>
          <tr><td><a href="feedback.html">Site feedback &amp; links</a></td><td>97</td><td>Oct 12 20:14 by mod</td></tr>
          <tr><td><a href="introduce.html">Introductions (new users)</a></td><td>304</td><td>Oct 11 by yamchan</td></tr>
        </table>
        <p style="font-size:11px;color:#444;">Registered users only for posting. Guestbook is public.<br/>
        Ad: <span style="color:#00c;">MD recordable discs bulk lot, see null_courier, PM only.</span></p>`,
      "transfers.html": `
        <style>body{font-family:Verdana,Arial,sans-serif;font-size:12px;background:#e6ebf5;}.m{background:#fff;border:1px solid #b6c4dd;margin-bottom:6px;padding:6px;}</style>
        <h3>Transfers &amp; trades (Japan), page 1</h3>
        <div class="m"><b>#407 "courier changed drop rules"</b><br/>null_courier: locker PIN moved behind a verification hash. deposit required before 23:30 Tuesday, all times JST. unconfirmed settlements void at wipe.<br/><span style="color:#666;font-size:11px;">Posted today 18:5x</span></div>
        <div class="m"><b>#403 RE: ken's disc job (Dogenzaka unit 3)</b><br/>satobro_twr: bro that shop is GONE. landlord sold contents as a lot. the claim slip is the only paper that matters and it isn't in your name.<br/><span style="color:#666;font-size:11px;">ken_md98 replied 19:1x then vanished from the board</span></div>
        <p>Older threads live on <a href="transfers2.html">page 2 of this board</a>.</p>
        <p><a href="/">back to index</a></p>`,
      "guestbook.html": `
        <style>body{font-family:'Courier New',monospace;font-size:12px;background:#f5f5ef;}
        .post{border:1px solid #999;background:#fff;padding:6px;margin-bottom:8px;max-width:640px;}
        .meta{color:#555;font-size:11px;}</style>
        <h3>Guestbook, thread #402</h3>
        <div class="post">
          <div class="meta">#402 · posted 19:19 by ken_md98 (from CAFÉ ZAGA / TERM 4)</div>
          copying the string so i don't lose it<br/>
          paste EXACT like he said, all caps, one line:<br/>
          <span style="font-size:16px;letter-spacing:1px;background:#ff6;">KURO-884-MD-VERIFY-9F27C4</span><br/>
          file on C:\\ then delete into bin. 11:30. i have 100 yen.<br/>
          if anyone finds this after me, the disc says FOR THE BOYS. it's not mine. give it to them.
        </div>
        <div class="post">
          <div class="meta">#401 · posted 18:5x by null_courier</div>
          rules repeated once. key must be SAVED to a file, then REMOVED from live drive
          (recycle = fine). host reads filenames under root of system drive. no folders.<br/>
          settlements settle two ways: RELEASE (archive entry erased, ledger cleared)
          or CLAIM (goods recovered, ledger stays). choose one. both are final at midnight.
        </div>
        <script>try{parent.deliverMsg && parent.deliverMsg({ from:"Kenji", text:"the string is in #402!! copy it exact!! save it as a txt then put it in the recycle bin, 100 yen left, hurry" });}catch(e){}</script>
        <p><a href="/">back to index</a></p>`,
      "repairshop.html": `
        <style>body{font-family:Verdana,Arial,sans-serif;font-size:12px;}</style>
        <h3>Dogenzaka repair shop (dead), archive</h3>
        <p><b>mod:</b> locked thread. The tenant vacated September 2002. Unclaimed items go to
        liquidation Friday 18 Oct. Do not post asking for lost discs here.</p>
        <p style="color:#555;font-size:11px;">pinned reply, Aug 2002: <i>"the silver MZ is at unit 3 with the disc still inside, they wrote a slip, come get it"</i>, poster unknown.</p>
        <p><a href="/">back to index</a>`,

      // ---- boards nobody needs tonight. chatter, trades, arguments about media -------
      "burners.html": `
        <style>body{font-family:Verdana,Arial,sans-serif;font-size:12px;background:#e6ebf5;}
        .m{background:#fff;border:1px solid #b6c4dd;margin-bottom:6px;padding:6px;}
        .meta{color:#666;font-size:11px;}</style>
        <h3>CD-R &amp; burners, page 1 of 6</h3>
        <div class="m"><b>#611 burning MD audio at 1x vs 4x, real difference?</b><br/>
        tape_deck_tanaka: my ears are forty six years old and I say yes.<br/>
        cdrsue: that's what everybody says. Nobody posts a scan.<br/>
        mdjunkie99: the drive does the same writing at both speeds on my machine. The laser just stops for longer.<br/>
        gacha_granny: slow burns make better coasters. That is the only proven benefit.<br/>
        <span class="meta">14 replies · last Oct 13 22:07 by cdrsue</span></div>
        <div class="m"><b>#598 coaster thread, post your worst burn</b><br/>
        cdrsue: mine reads in my drive and nowhere else, so it stays on the desk as a memory<br/>
        yamchan: put tape over the hub hole, it fixes nothing and looks official<br/>
        pinball_wiz_82: use a coaster from a bar and write the speed on it, then you can brag<br/>
        <span class="meta">92 replies · last Sep 21</span></div>
        <div class="m"><b>#583 bulk spindle media from the market stall, test results</b><br/>
        soba_or_bust: 80 discs, ¥2,900 the spindle, 48x rated. Six failed. Six! Out of eighty that is good odds<br/>
        mdjunkie99: report the brand name and we will all stop buying it next week like we did with the blue ones<br/>
        soba_or_bust: not printing it. I am not going to be the man who gets a stall shut down<br/>
        <span class="meta">31 replies · last Oct 4</span></div>
        <div class="m"><b>#560 my burner tray motor sounds like a cat in a box</b><br/>
        tape_deck_tanaka: foam ring, cut from a shoe insole, glue on the rail, ten years I have done this<br/>
        gacha_granny: my daughter's room smells like that drive. Warm plastic. Nothing wrong with it<br/>
        <span class="meta">18 replies · last Aug 30</span></div>
        <div class="m"><b>#536 which spindle brand, October prices, town list</b><br/>
        yamchan: co-op stall has them, cheaper than the chain store by about six hundred yen, unlabelled boxes<br/>
        mod: keep shop names out of this board, this is not a phone book<br/>
        <span class="meta">27 replies · last Jul 19</span></div>
        <p style="font-size:11px;color:#444;">Registered users only for posting.<br/><a href="/">back to index</a></p>`,

      "arcade.html": `
        <style>body{font-family:Verdana,Arial,sans-serif;font-size:12px;background:#e6ebf5;}
        .m{background:#fff;border:1px solid #b6c4dd;margin-bottom:6px;padding:6px;}
        .meta{color:#666;font-size:11px;}</style>
        <h3>Arcade &amp; pinball (Kairos)</h3>
        <div class="m"><b>#219 are the arcade screens coming back on?</b><br/>
        pinball_wiz_82: six months nobody plugs them in and people still walk past. The block is quieter than the parking<br/>
        kairosteru: my brother says the owner is thinking of two cameras. Two! For a street<br/>
        night_diner_mod: they unplugged them for the power bill, everyone knows that, drop it<br/>
        <span class="meta">40 replies · last Sep 28</span></div>
        <div class="m"><b>#216 FREE pool table to a collector</b><br/>
        hill_side_hiro: town hall storeroom, the felt is grey and one pocket hangs. You move it, you take it, take the rails too<br/>
        mdjunkie99: pics?<br/>
        hill_side_hiro: camera broke in August. Take my word, it is a table<br/>
        <span class="meta">9 replies · last Sep 26</span></div>
        <div class="m"><b>#209 pachinko place shuttered early Tuesday</b><br/>
        gacha_granny: no notice, shutters down at eleven in the morning, a man standing outside looking at his own hands<br/>
        yamchan: third one closed since I joined this board. This town eats its shops<br/>
        mod: locked after page four. Post on diner if you want to talk about where to eat afterwards<br/>
        <span class="meta">61 replies, locked</span></div>
        <div class="m"><b>#198 high score board reset, initials written over mine</b><br/>
        pinball_wiz_82: three letters were there before, now a name I do not know is on top of Wave Master<br/>
        tape_deck_tanaka: service man resets with a key on Tuesdays, write your score on paper first, always<br/>
        <span class="meta">12 replies · last Jun 30</span></div>
        <div class="m"><b>#187 the fighting machine only takes ¥100 coins. Fix.</b><br/>
        kairosteru: five yen works if you press the coin gate with your nail. Takes practice, worth it<br/>
        night_diner_mod: tell the operator, he will tune it. He tunes for regulars and ignores tourists<br/>
        <span class="meta">23 replies · last May 4</span></div>
        <p style="font-size:11px;color:#444;">Registered users only for posting.<br/><a href="/">back to index</a></p>`,

      "diner.html": `
        <style>body{font-family:Verdana,Arial,sans-serif;font-size:12px;background:#e6ebf5;}
        .m{background:#fff;border:1px solid #b6c4dd;margin-bottom:6px;padding:6px;}
        .meta{color:#666;font-size:11px;}</style>
        <h3>Off-topic: the night diner</h3>
        <div class="m"><b>#1118 they changed the bread at the twenty-four hour place</b><br/>
        soba_or_bust: softer, cheaper, the egg sandwich falls apart now. The old bread had crust<br/>
        gacha_granny: make your own sandwich then. Bring it in the paper bag from the counter, nobody minds<br/>
        cdrsue: the hot towels are worse as well. That is the real news here<br/>
        yamchan: everything is worse by small amounts, that is how it goes<br/>
        <span class="meta">48 replies · last Oct 13 23:5x</span></div>
        <div class="m"><b>#1102 the soba cart moved to the west exit, Sundays only</b><br/>
        hill_side_hiro: forty minutes standing in rain with a paper cup, hands warm, that's my review<br/>
        tape_deck_tanaka: bring notes, he has no change after nine at night. Ten years he says the same thing<br/>
        kairosteru: the woman beside him sells tissues out of a bag and business is very good<br/>
        <span class="meta">26 replies · last Oct 6</span></div>
        <div class="m"><b>#1094 curry stand queue etiquette, rules written down</b><br/>
        night_diner_mod: 1 you do not send a person forward to hold your place, 2 you walk back to the end if you leave<br/>
        mdjunkie99: number two is where wars start<br/>
        gacha_granny: forty minutes in the rain builds character and ruins shoes<br/>
        <span class="meta">73 replies · last Sep 30</span></div>
        <div class="m"><b>#1080 barley tea, my mother's ratio, posted for the young ones</b><br/>
        gacha_granny: pot boiling, one spoonful, off the heat, lid on for four minutes, then cold water straight into a jug.<br/>
        gacha_granny: it tastes like nothing if you leave the leaves in. She never left the leaves in.<br/>
        <span class="meta">15 replies · last Sep 12</span></div>
        <div class="m"><b>#1071 best shop for hot towels in winter, list thread</b><br/>
        yamchan: the chain store carries them, the co-op stall does not, that's all I know<br/>
        pinball_wiz_82: write the whole town's list like the phone book people do at the library, funny idea<br/>
        mod: yes, keep numbers off this board please, there is a directory site for that<br/>
        <span class="meta">34 replies · last Aug 22</span></div>
        <p style="font-size:11px;color:#444;">Registered users only for posting.<br/><a href="/">back to index</a></p>`,

      "feedback.html": `
        <style>body{font-family:'Courier New',monospace;font-size:12px;background:#f5f5ef;}</style>
        <h3>Site feedback &amp; links (moderated)</h3>
<pre>[Oct 12 20:14] mod: banners are 468x60 again. 120 pixels wide looks thin, don't post those
[Oct 12 19:52] yamchan: banner code breaks my sidebar in IE5, use table layout, copy from arcade page
[Oct 11 23:40] cdrsue: webring joined from Narima, the relay goes round in order, no skipping
[Oct 11 21:33] tape_deck_tanaka: the site was down Sep 30 half a day. Same as every September. Hosted in Osaka
[Oct 10 22:1x] mdjunkie99: guestbook gets spam posts, robot ones. Delete them?
[Oct 10 22:20] mod: they cost nothing and hurt nothing. Leave them
[Oct 9 20:05] hill_side_hiro: when somebody picks up the home phone my connection dies mid-page.
             Modem on the same line. That is a fact of life, not a bug report
[Oct 8 18:44] gacha_granny: nobody under fourteen posts here, ask your father if you need an account
[Sep 27 21:11] kairosteru: add a search box? 
[Sep 27 21:15] mod: no. Read the boards in order. It is a forum, not a library</pre>
        <p style="color:#444;font-size:11px;">Old posts stay. Nobody deletes history here except the spam.<br/>
        <a href="/">back to index</a></p>`,

      "introduce.html": `
        <style>body{font-family:Verdana,Arial,sans-serif;font-size:12px;background:#e6ebf5;}
        .m{background:#fff;border:1px solid #b6c4dd;margin-bottom:6px;padding:6px;}
        .meta{color:#666;font-size:11px;}</style>
        <h3>Introductions (new users), page 1</h3>
        <div class="m"><b>#304 hello from Narima, I fix keyboards</b><br/>
        yamchan: forty one, I repair the office keyboards and the mouse balls. This board had answers about
        my burner so I made an account. Sorry for the photos, none<br/><span class="meta">posted Oct 11</span></div>
        <div class="m"><b>#300 hi, second year, do I have to post?</b><br/>
        school_bag_suzuki: my friend has an account here and reads this board at lunch. Told me it exists.
        My mother says stop reading strangers. Hello everyone<br/><span class="meta">posted Oct 9</span></div>
        <div class="m"><b>#297 new here, from Ogaki, media seller</b><br/>
        ogaki_media: small stall, Saturdays, used spindles, cables. The market co-op knows me, ask them.
        No listings posted by me, per board rules<br/><span class="meta">posted Oct 5</span></div>
        <div class="m"><b>#288 forty six years old and slow on computers</b><br/>
        tape_deck_tanaka: three children grown up. I read this board with tea at night after the news ends.<br/>
        gacha_granny: hello fellow insomniac<br/><span class="meta">posted Sep 24</span></div>
        <div class="m"><b>#271 hello (lurker of four years signing in)</b><br/>
        hill_side_hiro: signed up to say thanks to two people who answered a question about a lamp in August. That's all<br/>
        <span class="meta">Sep 19 · 6 replies, all "welcome"</span></div>
        <p style="font-size:11px;color:#444;">Registered users only for posting.<br/><a href="/">back to index</a></p>`,

      "transfers2.html": `
        <style>body{font-family:Verdana,Arial,sans-serif;font-size:12px;background:#e6ebf5;}</style>
        <h3>Transfers &amp; trades (Japan), page 2, archived threads</h3>
<pre>  #396 wanted: AT keyboard, beige, working, will pay train fare to collect
  #390 my speaker pair is blown, one cone tore, any repair place know?
  #384 cable with the flat phone plug, three of them, ¥200 each
  #377 sold - microwave, door handle taped, works, buyer collected Sat morning
  #371 the market co-op sells unlabelled spindles cheaper than the chain store, that is all I will say
  #366 lamp with green shade, school issue?, battery inside it?? no, mains. Works. 
  #359 trade: bike bell chrome for a door mirror, fair swap, town hall gate
  #348 Sunday 14:00 pachinko car park meet,Bring nothing, just show
  #341 MD blanks 14pc bulk 90 min, cheap. Reply by PM. Sold by Wed.
  #336 closing thread - moving house, everything goes, chairs boxes records, take what you want
  #329 burnt CD-ROMs sold as coasters, 40 pieces, free box
  #322 how do cleaners get the glue off a disc hub? Thread of methods
  #315 15 year old amplifier "Marantz lookalike", hums when cold, fine when warm
  #310 free box of cassettes from a church jumble sale, all sermons and one ABBA tape
  #303 pinball rubbers, new set, size chart posted in the arcade board
  #298 8cm CD single, promo, scratched, anyone play these on a computer drive
  #293 who wants an arcade coin door, dead machine parts, must move today, family coming for the van
  #288 wanted: someone who can read service manuals in English, my English is a dictionary and hope</pre>
        <p style="font-size:11px;color:#444;">Old threads stay up. Dead ads stay too.<br/>
        <a href="transfers.html">newest page</a> · <a href="/">back to index</a></p>`
    }
  },

 // 0x-kuro.net - the broker. No index, no graphics, tiny documents, cold.
 // Reachable only once you have an ID to present.
  {
    domain: "0x-kuro.net",
    title: "null_courier // settlement host",
    delay: 4200,
    flags: ["know_id"],                     // without the transaction ID it does not resolve
    lockHints: { "/release.html": "The release page answers registered IDs only." },
    locks: {},
    sets: {
      "/": [],
      "settle_erase.html": ["chose_erase"],
      "settle_claim.html": ["chose_claim"]
    },
    dlgPages: { "release.html": "saw_release", "settle_erase.html": "saw_settle_page", "settle_claim.html": "saw_claim_page" },
    pages: {
      "/": `
        <pre style="font-family:'Courier New',monospace;font-size:12px;background:#111;color:#cfe;padding:10px;">NULL_COURIER // SETTLEMENT HOST

authenticated ids accepted this session: 1

release   → /release.html
claims    → /settle_claim.html
erase     → /settle_erase.html

no indexes. no guestbook. no refunds.
host time JST. wipe at 23:30.
</pre>`,
      "release.html": `
        <pre id="rel" style="font-family:'Courier New',monospace;font-size:12px;background:#0f1113;color:#d6e6c8;padding:10px;">TRANSACTION MD-884-SHIBUYA
posted by : ken_md98 (name on ledger entry 884-K)
goods held: LOT 11-K - recorded MD, hub label: Track 04 - For the boys
archive copy of recording present in district media archive : YES
ledger entry status : OPEN - contestable until 23:30

two settlements available. one is final.

 [ A ] RELEASE - archive erased + ledger cleared   → <a href="settle_erase.html">/settle_erase.html</a>
 [ B ] CLAIM   - goods recovered, ledger stands    → <a href="settle_claim.html">/settle_claim.html</a>
</pre>
        <script>try{
          var k = parent.hasFlag("key_in_bin"), m = parent.hasFlag("know_motive");
          var s = "";
          if (!k) s += "<br/>KEY CHECK: <b>NO SAVED KEY IN BIN</b>, settlement will refuse you.";
          else    s += "<br/>KEY CHECK: <b>key present in bin, accepted.</b>";
          if (!m) s += "<br/>MOTIVE CHECK: unverified claimant. bring a party named on the ledger.";
          document.getElementById("rel").innerHTML = document.getElementById("rel").innerHTML.replace("wipe at 23:30.", "") + s;
        }catch(e){}</script>`,
      "settle_erase.html": `
        <pre style="font-family:'Courier New',monospace;font-size:12px;background:#0b0f0d;color:#cfe;padding:10px;">SETTLEMENT A: RELEASE
action: district media archive entry for LOT 11-K erased.
        ledger entry 884-K withdrawn. name KUROKI removed from record.
effect on goods: destroyed with the archive copy. no recovery possible.
this is irreversible and it happens now.</pre>
        <div id="v" style="font-family:'Courier New',monospace;font-size:12px;border:2px solid #333;background:#fff;padding:8px;"></div>
        <script>try{
          var ok = parent.hasFlag("key_in_bin") && parent.hasFlag("know_motive");
          document.getElementById("v").innerHTML = ok
            ? "VERIFICATION: key accepted (bin). motive verified. LEDGER WITHDRAWN.<br/>The archive copy is gone. Terminal closed by host."
            : "SETTLEMENT REFUSED. live key in bin + verified motive required. nothing saved.";
          if (ok) { window.parent.setFlag("saved_kenji", true); }
        }catch(e){}</script>
        <p><a href="release.html">back to release</a></p>`,
      "settle_claim.html": `
        <pre style="font-family:'Courier New',monospace;font-size:12px;background:#0b0f0d;color:#fee;padding:10px;">SETTLEMENT B: CLAIM RECOVERY
action: LOT 11-K released to claimant. disc travels by courier, arrives tomorrow.
        ledger entry 884-K stays OPEN. name on ledger stays: KUROKI.
effect: goods recovered. archive copy of recording survives (not retrievable here).</pre>
        <div id="v2" style="font-family:'Courier New',monospace;font-size:12px;border:2px solid #333;background:#fff;padding:8px;">CLAIM FILED. you will keep this night.</div>
        <script>try{ document.getElementById("v2").innerHTML += "<br/>ledger stands. party named: KUROKI. settlement final at midnight."; }catch(e){}</script>
        <p><a href="release.html">back to release</a></p>`
    }
  },

 // Library media room page - quiet period flavour plus one usable fact.
  {
    domain: "kairos-lib.or.jp",
    title: "Kairos Town Library: Media Room",
    delay: 1500,
    gate: { start: "18:00", end: "24:00" },
    pages: {
      "/": `
        <style>body{font-family:Georgia,serif;} .box{border:1px solid #777;background:#fbfaf5;padding:8px;max-width:560px;}</style>
        <h2>Kairos Town Library: Media Room</h2>
        <div class="box"><b>Closed Tuesdays for rewiring.</b><br/>
        Home computer sessions limited to 60 minutes. Modem pool opens 21:00 (midnight-chat.net, node seven).<br/>
        Request slips for municipal records at the front desk. District ledger requests take 3 days.</div>
        <ul>
          <li>Local paper microfilm: Kairos News Network, 1961 to present.</li>
          <li>CD-ROM phone directory (same listings as townphone-directory.org).</li>
          <li>Lost &amp; found slips from shuttered businesses are retained 90 days.</li>
        </ul>
        <p style="font-size:11px;color:#555;">Front desk: 555-0134. Ask for the October box.</p>`
    }
  }
];
