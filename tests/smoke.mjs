// Kairos night - headless end-to-end smoke test (real engine, real clicks, real dial pad).
// node tests/smoke.mjs
// Serve the game over http first so cookies behave like a normal site:
// python -m http.server 8123 --bind 127.0.0.1 --directory F:\CodeJam
// The three scenarios mirror the design contract:
// A - a player who already knows everything can finish the night ONCE, in one loop
// B - filing the claim settlement is final - it blocks the true morning forever after
// C - midnight rebuilds the drive; only knowledge carries into the next night
import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:8123/index.html';
const KEY_FILE = 'KURO884_KEY.TXT';                       // Notepad saves this name at C:\ root
const KEY_STRING = 'KURO-884-MD-VERIFY-9F27C4';           // printed by shibuya-night thread #402
const CHAIN = ['know_id', 'key_saved', 'key_in_bin', 'know_motive', 'net_open', 'saved_kenji', 'chose_erase'];

let failures = 0;
const results = [];
async function check(name, fn) {
  try { const detail = await fn(); results.push([name, true]); console.log(`PASS  ${name}${detail ? ' · ' + detail : ''}`); }
  catch (e) { failures++; results.push([name, false]); console.log(`FAIL  ${name} · ${e.message}`); }
}
const ok = (cond, msg) => { if (!cond) throw new Error(msg); return cond; };

async function boot() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1000, height: 680 } });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e && e.message)));
  page.on('console', m => {
    if (m.type() !== 'error') return;
    if (/Failed to load resource/i.test(m.text())) { missingAssets++; return; }   // asset docs pending, not an engine bug
    errs.push(m.text());
  });
  page.setDefaultTimeout(15000);
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });               // fresh profile → no cookies
  await page.click('#logon-screen .lg-user[data-action="play"]');
  await page.waitForFunction(() => window.ENGINE && ENGINE.state() !== null);
  await page.evaluate(() => ENGINE.setSpeed(0));                          // frozen clock: scripted beats only
  return { browser, page, errs };
}
let missingAssets = 0;                                                     // reported at the end, for ASSET_REQUESTS.md
const armPrompt = (p, answer) => p.once('dialog', d => d.accept(answer).catch(() => {}));
const flags = p => p.evaluate(() => ENGINE.flagsList());
const jump = (p, t) => p.evaluate(x => ENGINE.jump(x), t);                // "21:20"
const navMs = async (p, url) => {                                          // modem animation: site.delay + step granularity
  const ms = await p.evaluate(u => {
    const dom = String(u).split('/')[0];
    const s = (window.SITES || []).find(x => x.domain === dom);
    const d = (s && s.delay) || 1500;
    return Math.ceil(d / 120) * 120 + 600;
  }, url);
  return Math.min(Math.max(ms, 1200), 5200);
};
const nav = async (p, url) => {
  await p.evaluate(u => ENGINE.go(u), url);
  await p.waitForTimeout(await navMs(p, url));
};
const frameHtml = p => p.evaluate(() => ENGINE.frameHtml());               // static page source (load animations, gates)
const renderedText = p => p.evaluate(() => {                               // live DOM text: includes what page scripts write
  const f = document.getElementById('browser-frame');
  try { const d = f.contentDocument; return d && d.body ? d.body.textContent.replace(/\s+/g, ' ').trim() : ''; } catch (e) { return ''; }
});
const stripTags = h => String(h).replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");   // rendered text only · never script source
const rowsIn = (p, sel) => p.evaluate(s => [...document.querySelectorAll(s + ' .file-row')].map(r => r.textContent.trim()), sel);
const dblRow = async (p, name) => {                                       // walk into a folder like a player
  const done = await p.evaluate(n => {
    const el = [...document.querySelectorAll('#file-list .file-row')].find(r => r.textContent.includes(n));
    if (!el) return false; el.dispatchEvent(new MouseEvent('dblclick', { bubbles: true })); return true;
  }, name);
  ok(done, `folder row "${name}" not present`);
  await p.waitForTimeout(200);
};
async function saveNotepad(p, text, { name = "notes.txt" } = {}) {         // the real Save button flow
  await p.evaluate(() => ENGINE.app('notepad'));
  await p.click('#notepad-close-window');          // closing the window is what clears the open document
  await p.evaluate(() => ENGINE.app('notepad'));   // reopen: a brand-new untitled buffer
  await p.fill('#notepad-area', text);
  armPrompt(p, name);                              // answer the "Save as" box like a player typing a filename
  await p.click('#notepad-save');                  // engine prompts whenever no named file is open
  await p.waitForTimeout(650);
}
async function dialNumber(p, number) {              // keypad clicks, then Dial, like a player lifting fresh
  await p.click('#phone-end', { force: true }).catch(() => {});        // free the line before dialling
  await p.waitForTimeout(200);                                        // queued timers from the last call flush
  await p.evaluate(() => {
    const bar = document.getElementById('dialogue-bar');               // VO captions sit over the touch pad
    if (bar) bar.classList.remove('visible');
    const el = document.getElementById('phone-line-state');            // wipe old reports: this dial only
    if (el) el.textContent = "";
  });
  await p.evaluate(() => ENGINE.app('phone'));
  for (const ch of number) if (/[0-9*#]/.test(ch)) await p.click(`#phone-pad button[data-key="${ch}"]`, { force: true });
  await p.click('#phone-dial', { force: true });
}
async function phoneList(p) {                       // what the Phone window currently lists
  return p.evaluate(() => [...document.querySelectorAll('#phone-quick .ph-quick-btn')].map(b => b.textContent.trim()));
}
async function hangUp(p) {                                            // put the receiver back on the hook
  await p.click('#phone-end', { force: true }).catch(() => {});
  await p.waitForTimeout(250);
}
async function dialText(p, number, waitMs = 2600) {      // every state the line shows after THIS dial
  await dialNumber(p, number);                           // the report field was wiped first: nothing stale counts
  const seen = [];
  for (let t = 0; t < waitMs; t += 200) {
    seen.push(await p.evaluate(() => document.getElementById('phone-line-state').textContent.trim()));
    await p.waitForTimeout(200);
  }
  return seen.filter(Boolean).join(' | ');
}
async function rollMidnight(p) {                                          // let the real midnight run
  await jump(p, '23:59');
  await p.evaluate(() => ENGINE.midnightNow());
  await p.waitForFunction(() => !ENGINE.state().running || ENGINE.won(), undefined, { timeout: 18000 });
  const won = await p.evaluate(() => ENGINE.won());
  if (!won) await p.waitForFunction(() => ENGINE.state().running, undefined, { timeout: 30000 });
  return won;
}

// A - the whole chain inside one night
async function scenarioTrue() {
  const { browser, page, errs } = await boot();

  await check('A0 engine boots with every hook the data files call', async () => {
    const missing = await page.evaluate(() => ['hasFlag', 'setFlag', 'clearFlag', 'clearFlags', 'deliverMsg',
      'triggerDialogue', 'findEnding', 'ENGINE', 'PHONES', 'ENDINGS', 'ALL_FLAGS', 'SITES', 'DIALOGUE', 'FILES']
      .filter(k => window[k] === undefined));
    ok(missing.length === 0, 'missing exports: ' + missing.join(','));
    ok(await page.evaluate(() => !!document.getElementById('win-phone')), 'phone window missing from index.html');
    ok((await flags(page)).length === 0, 'a fresh cache should know nothing');
    return `playing loop ${await page.evaluate(() => ENGINE.loop())}, clock frozen for the harness`;
  });

  await check('A1 the key string counts only when saved at C:\\ root', async () => {
    const docsFile = 'kairos_math_dump.txt';                              // unique names keep row selection unambiguous
    const normCrumb = s => String(s).replace(/\s+/g, "").toUpperCase();   // engine prints "C:\ " style crumbs
    await page.evaluate(() => ENGINE.app('explorer'));
    ok(normCrumb(await page.evaluate(() => document.getElementById('crumb-path').textContent)) === 'C:\\',
      'explorer should open at the drive root');
    await dblRow(page, 'Docs');                                            // browse into a folder like a player
    await saveNotepad(page, KEY_STRING, { name: docsFile });  // words filed deep in a folder
    ok(!(await flags(page)).includes('key_saved'), 'saving inside a folder must NOT make a verification key');
    ok((await rowsIn(page, '#file-list')).some(n => n.toUpperCase().includes(docsFile.toUpperCase())),
      'the folder save should exist as a file');
    await page.click('#crumb-up');                                         // one level up: back to C:\
    await page.waitForTimeout(250);
    ok(normCrumb(await page.evaluate(() => document.getElementById('crumb-path').textContent)) === 'C:\\',
      'expected to be standing at C:\\, got: ' + await page.evaluate(() => document.getElementById('crumb-path').textContent));
    await saveNotepad(page, KEY_STRING, { name: KEY_FILE });  // same text, saved at the root: now it IS a key
    ok((await flags(page)).includes('key_saved'), 'root save did not grant key_saved');
    await page.evaluate(() => ENGINE.app('explorer'));
    const rootRows = await rowsIn(page, '#file-list');
    ok(rootRows.some(n => n.toUpperCase().includes(KEY_FILE)), 'saved key listed on C:\\ · rows: ' + rootRows.join(' | '));
  });

  await check('A2 deleting it into the Recycle Bin hides it from the wipe script', async () => {
    const picked = await page.evaluate(f => {
      const el = [...document.querySelectorAll('#file-list .file-row')].find(r => r.textContent.toUpperCase().includes(f.toUpperCase()));
      if (!el) return false; el.click(); return true;
    }, KEY_FILE);
    ok(picked, 'key file row missing on C:\\');
    await page.click('#file-delete');                                      // selection-armed Delete button
    await page.waitForTimeout(350);
    const k = await flags(page);
    ok(k.includes('key_in_bin'), 'delete-to-bin did not grant key_in_bin');
    ok(k.includes('key_saved'), 'the bin state sits on top of knowing the string');
    ok(!(await page.evaluate(f => ENGINE.state().files.some(x => x.name.toUpperCase() === f.toUpperCase()), KEY_FILE)),
      'the file must leave C:\\ after deletion');
  });

  await check('A3 restoring it puts a live key back where the scanner can read it', async () => {
    await page.evaluate(() => ENGINE.app('recycle'));
    const picked = await page.evaluate(f => {
      const el = [...document.querySelectorAll('#recycle-list .file-row')].find(r => r.textContent.toUpperCase().includes(f.toUpperCase()));
      if (!el) return false; el.click(); return true;
    }, KEY_FILE);
    ok(picked, 'deleted key not visible in the Recycle Bin');
    await page.click('#bin-restore');
    await page.waitForTimeout(350);
    const k = await flags(page);
    ok(!k.includes('key_in_bin'), 'restoring must clear key_in_bin · a live file is visible again');
    ok(k.includes('key_saved'), 'you still know the string after restoring');
    await page.evaluate(() => ENGINE.app('explorer'));
    await page.evaluate(f => {
      const el = [...document.querySelectorAll('#file-list .file-row')].find(r => r.textContent.toUpperCase().includes(f.toUpperCase()));
      if (el) el.click();
    }, KEY_FILE);
    await page.click('#file-delete');                                      // straight back into the bin for the rest of the night
    await page.waitForTimeout(350);
    ok((await flags(page)).includes('key_in_bin'), 're-deleting must re-grant key_in_bin');
  });

  await check('A4 time gate + knowledge gate answer like dead servers', async () => {
    await jump(page, '20:30');
    await nav(page, 'midnight-chat.net/tower.html');
    ok(/offline|refused|not accepting|closed|maintenance/i.test(await frameHtml(page)),
      'Night Net should refuse connections before 21:00');
    await nav(page, '0x-kuro.net/release.html');
    ok(/cannot find|not found|404|misspelled|offline|authorisation|required/i.test(await frameHtml(page)),
      'broker host must not hand out settlements without an ID');
    ok(!(await flags(page)).includes('net_open'), 'pre-gate visit grants nothing');
  });

  await check('A4b unread numbers are not listed and dial like invented ones', async () => {
    await jump(page, '19:35');                                     // the PD desk picks up from 19:30 once known
    await page.evaluate(() => ENGINE.app('phone'));
    const empty = await phoneList(page);
    ok(empty.length === 0, 'a fresh night lists nothing · got: ' + empty.join(' | '));
    const cold = await dialText(page, '5550134', 1700);                  // library line: published, unread
    ok(/not in the directory/i.test(cold), 'an unread published number must get the same tone as a made-up one · line said: ' + cold);
    await hangUp(page);
    return 'no listings, busy tone on a real unlearned number';
  });

  await check('A4c papers publish lines: each source lists only what it prints', async () => {
    await nav(page, 'kairosnews.com/tips.html');                   // the paper prints two of them
    ok((await flags(page)).includes('know_news'), 'reading the tips page counts as reading the paper');
    await page.evaluate(() => ENGINE.app('phone'));
    let list = await phoneList(page);
    ok(list.some(n => n.includes('555-0100')), 'the printed desk number should be listed · ' + list.join(' | '));
    ok(!list.some(n => n.includes('555-0117')), 'a residential line the paper never printed stays out');
    await nav(page, 'townphone-directory.org/');                   // business hours only
    ok((await flags(page)).includes('dir_read'), 'landing on the town listings records them as read');
    await page.evaluate(() => ENGINE.app('phone'));
    list = await phoneList(page);
    ['555-0117', '555-0134', '03-5510-8871'].forEach(n =>
      ok(list.some(x => x.includes(n)), 'printed listing should show ' + n + ' · ' + list.join(' | ')));
    ok(!list.some(n => n.includes('555-0192')), "the Kuroki house is ex-directory, the listings do not carry it");
    const spoken = await dialText(page, '5550134', 2600);     // known line, closed after 19:05: rings to nobody
    ok(!/not in the directory/i.test(spoken) && /(ring|no answer)/i.test(spoken),
       'a line you have read rings out instead of refusing you · got: ' + spoken);
    await hangUp(page);
    return list.length + ' lines listed after reading papers';
  });

  await check('A4d the unlisted lines arrive from his own paperwork', async () => {
    await jump(page, '20:10');                                      // his keitai ansible picks up from 20:00
    await page.evaluate(() => ENGINE.app('phone'));
    let pre = await phoneList(page);
    ok(!pre.some(n => n.includes('090-5510-1177')), 'his keitai is not a public listing · ' + pre.join(' | '));
    ok(!pre.some(n => n.includes('555-0192')), 'the Kuroki house stays ex-directory · ' + pre.join(' | '));
    const coldKeitai = await dialText(page, '09055101177', 1600);
    ok(/not in the directory/i.test(coldKeitai), 'an unread keitai number dials like an invented one · got: ' + coldKeitai);
    await hangUp(page);
    await page.evaluate(() => ENGINE.app('explorer'));              // read the two documents like a player
    await dblRow(page, 'Docs');
    await dblRow(page, 'kenji_sms_transcript.txt');
    await dblRow(page, 'class_contact_sheet.txt');
    const k = await flags(page);
    ['num_kuroki_home', 'num_kenji_cell'].forEach(f =>
      ok(k.includes(f), 'opening his paperwork must record that you know ' + f));
    await page.evaluate(() => ENGINE.app('phone'));
    const now = await phoneList(page);
    ok(now.some(n => n.includes('090-5510-1177')) && now.some(n => n.includes('555-0192')),
       'both private lines should be in the handset directory now · ' + now.join(' | '));
    const answered = await dialText(page, '09055101177', 3800);
    ok(!/not in the directory/i.test(answered), 'the keitai line rings once you have the digits · got: ' + answered);
    await hangUp(page);
    return 'private numbers gated on paper, then dialable';
  });

  await check('A5 geocities chain: home teaches geo, private dir locks then unlocks to the transaction ID', async () => {
    await nav(page, 'geocities.jp/ken_md98/');                            // folder address, trailing slash like GeoCities indexes
    ok((await flags(page)).includes('know_geo'), 'landing on his page must teach know_geo');
    await nav(page, 'geocities.jp/ken_md98/pin0419.html');
    ok(/digit|password|members|private|authorisation|locked|rights/i.test(await frameHtml(page)),
      'private dir must lock you out without the code');
    ok(!(await flags(page)).includes('know_id'), 'a locked dir must not grant the ID');
    await page.evaluate(() => window.setFlag('know_code', true));         // read from C:\Docs\kenji_sms_transcript.txt
    await nav(page, 'geocities.jp/ken_md98/pin0419.html');
    ok((await flags(page)).includes('know_id'), 'unlocked dir must grant know_id');
    ok(/MD-884-SHIBUYA/.test(await frameHtml(page)), 'the private dir must print the transaction ID');
  });

  await check('A6 Night Net after 21:00 · #tower names both handles and gives the release address', async () => {
    await jump(page, '21:05');
    await nav(page, 'midnight-chat.net/tower.html');
    const body = stripTags(await frameHtml(page));
    ok((await flags(page)).includes('net_open'), '#tower must grant net_open once the board is live');
    ok(/null_courier/.test(body) && /0x-kuro\.net\/release\.html/.test(body),
      '#tower must carry both broker handles + the release URL');
  });

  await check('A7 shibuya-night thread #402 carries the exact verification string', async () => {
    await nav(page, 'shibuya-night.net/guestbook.html');
    ok((await flags(page)).includes('key_text'), 'guestbook #402 must grant key_text');
    ok(new RegExp(KEY_STRING).test(await frameHtml(page)), 'thread #402 must print the string exactly');
  });

  await check('A8 kitchen handset: the office line answers after 21:15 and teaches why anyone would sell it', async () => {
    ok((await flags(page)).includes('dir_read') || (await flags(page)).includes('dad_office'),
       'setup: the switchboard number has to be learned from paperwork before the dialler accepts it');
    await jump(page, '21:16');
    await page.evaluate(() => ENGINE.app('phone'));
    ok((await phoneList(page)).some(n => n.includes('03-5510-2260')), 'the office line should be in the directory by now');
    await dialNumber(page, '0355102260');
    await page.waitForFunction(() => window.hasFlag('know_motive'), undefined, { timeout: 25000 });
    return 'know_motive learned by phone';
  });

  await check('A9 the settlement host reads the bin state live and release completes', async () => {
    await jump(page, '21:40');
    await nav(page, '0x-kuro.net/release.html');
    const body = await renderedText(page);   // the host's KEY CHECK line is written by page script at load
    ok(/MD-884-SHIBUYA/.test(body), 'release page must echo the transaction ID');
    ok(/key present in bin/i.test(body), 'host must read live bin state · got: …' + body.slice(-220));
    ok(/Track 04|For the boys/i.test(body), 'the goods description must name Mom\'s recording');
    await nav(page, '0x-kuro.net/settle_erase.html');
    const k = await flags(page);
    ok(k.includes('chose_erase'), 'visiting the erase settlement records the decision');
    ok(k.includes('saved_kenji'), 'bin key + known motive + erase must complete the settlement');
  });

  await check('A10 midnight ends the night instead of looping it', async () => {
    ok(await page.evaluate(() => window.findEnding() !== null), 'midnight check should find the true morning now');
    const won = await rollMidnight(page);
    ok(won === true, 'S.won should be set · the night ended, no new loop started');
    await page.waitForTimeout(3700);                                       // 2.2s distortion + 0.9s flash, then the overlay opens
    ok((await page.evaluate(() => document.getElementById('ending-screen').className)).includes('show'),
      'ending overlay not visible');
    ok(/MORNING/i.test(await page.textContent('.lg-welcome')), 'logon welcome did not change to a morning title');
    const k = await flags(page);
    CHAIN.forEach(f => ok(k.includes(f), 'knowledge lost at the ending: ' + f));
    ok(!(await page.evaluate(() => ENGINE.state().running)), 'clock should stay stopped after the ending');
  });

  ok(errs.length === 0, 'page/console errors: ' + errs.join(' | '));
  await browser.close();
}

// B - choosing the claim keeps the night
async function scenarioClaim() {
  const { browser, page, errs } = await boot();

  await check('B1 a filed claim is final and blocks the true morning', async () => {
    await page.evaluate(() => (window.ALL_FLAGS || [])
      .filter(f => !['chose_erase', 'chose_claim', 'saved_kenji', 'key_in_bin', 'key_saved'].includes(f))
      .forEach(f => window.setFlag(f, true)));                             // knows every fact, has settled nothing
    ok(await page.evaluate(() => window.findEnding()) === null,
      'the true ending must need an actual settlement, not just knowledge');
    await jump(page, '22:05');
    await nav(page, '0x-kuro.net/settle_claim.html');
    const k = await flags(page);
    ok(k.includes('chose_claim'), 'settle_claim must record chose_claim');
    ok(!k.includes('saved_kenji'), 'a goods recovery is not a release');
    ok(await page.evaluate(() => window.findEnding()) === null, 'chose_claim must block the true ending');
  });

  await check('B2 the decision survives the loop and stays blocking', async () => {
    const before = await page.evaluate(() => ENGINE.loop());
    const won = await rollMidnight(page);
    ok(won === false, 'a blocked midnight must not end the night');
    const k = await flags(page);
    ok(k.includes('chose_claim'), 'the decision flag must survive into the next night');
    ok(await page.evaluate(() => ENGINE.loop()) > before, 'loop counter should advance on a blocked midnight');
    ok(await page.evaluate(() => window.findEnding()) === null, 'true ending stays blocked by the earlier decision');
    return `now playing loop ${await page.evaluate(() => ENGINE.loop())}`;
  });

  ok(errs.length === 0, 'page/console errors: ' + errs.join(' | '));
  await browser.close();
}

// C - knowledge carries, physical things do not
async function scenarioCarry() {
  const { browser, page, errs } = await boot();

  await check('C1 at midnight the drive is rebuilt and only knowledge carries', async () => {
    await saveNotepad(page, KEY_STRING, { name: KEY_FILE });
    ok((await flags(page)).includes('key_saved'), 'setup: key should be saved tonight');
    ok(await page.evaluate(f => ENGINE.state().files.some(x => x.name.toUpperCase() === f.toUpperCase()), KEY_FILE),
      'setup: the saved file should be listed on C:\\');
    await page.evaluate(() => setFlag('know_id', true));
    await page.evaluate(() => window.deliverMsg({ from: 'Mira', text: 'ping' }));   // mid-night lines are state too
    await rollMidnight(page);
    const after = await page.evaluate(() => ({
      flags: ENGINE.flagsList(), files: ENGINE.state().files.map(f => f.name), bin: ENGINE.state().recycle.map(f => f.name)
    }));
    ok(after.flags.includes('know_id') && after.flags.includes('key_saved'), 'knowledge must carry across the loop');
    ok(!after.files.includes(KEY_FILE), 'the physical key file must NOT persist · the drive rebuilds every night');
    ok(!after.bin.includes(KEY_FILE), 'nor does last night\'s bin entry');
    ok(after.files.length >= 2 && after.bin.length >= 1, 'drive + bin should rebuild from data each night');
    return `flags carried: ${after.flags.length}, files relisted: ${after.files.length}`;
  });

  await check('C2 wiping knowledge puts you back to needing to learn it all', async () => {
    await page.evaluate(() => window.clearFlags());
    const k = await flags(page);
    ok(k.filter(f => CHAIN.includes(f)).length === 0, 'clear-knowledge must empty the chain: ' + k.join(','));
    ok(await page.evaluate(() => window.findEnding()) === null, 'no ending without knowledge');
    await jump(page, '18:30');
    await nav(page, 'midnight-chat.net/tower.html');                       // board closed this early either way
    ok(/offline|refused|maintenance|closed/i.test(await frameHtml(page)), 'Night Net gate holds after reset');
    await nav(page, 'geocities.jp/ken_md98/pin0419.html');
    ok(!(await flags(page)).includes('know_code'),
      'the private dir must not hand out its content when the code is unknown (locks are evaluated live)');
    ok(!(await flags(page)).includes('know_id'), 'and no transaction ID from a locked dir');
  });

  ok(errs.length === 0, 'page/console errors: ' + errs.join(' | '));
  await browser.close();
}

console.log('--- A · full chain in one night ---');
await scenarioTrue();
console.log('--- B · claim path blocks the true morning ---');
await scenarioClaim();
console.log('--- C · what carries over ---');
await scenarioCarry();
const total = results.length;
console.log(`\n${failures ? failures + ' FAILURE(S)' : 'ALL PASS'} · ${total - failures}/${total} checks`);
process.exitCode = failures ? 1 : 0;
