(function () {
"use strict"; // no annoying error messages

// constants
var NIGHT_START = 18 * 60;          // 18:00 in minutes
var NIGHT_END   = 24 * 60;          // 24:00
var GAME_MIN_PER_SEC = 0.5;         // base speed: 360 game min / 720 real sec = 12 min night on loop 1
var TICK_MS = 250; // clock tick
var DISTORT_MS = 2200;              // how long the midnight distortion lasts
var FLASH_MS = 900;                 // white flash hold

// state (all wiped at midnight)
var S = null;
function freshState() {
  return {
    running: false,
    gameMin: NIGHT_START,
    firedMsgs: {},
    chatHistory: [],
    unreadBy: {},
    activeChat: null,
    dialogueQueue: [],
    dialogueShown: {},
    dlgIndex: -1,
    wordTimers: [],
    audio: null,
    dlgFadeTimer: null,
    media: null,
    mediaFile: null,
    browserHist: [], histPos: -1, loadTimer: null,
    folder: "C:\\",
    zTop: 100,
    files: null,          // tonight's C:\ contents (set by startNight)
    recycle: null,        // tonight's Recycle Bin contents
    selFile: null,        // selected row in explorer
    binSel: null,         // selected row in recycle bin
    noteName: null,       // file currently open in Notepad
    phoneNum: "",
    phoneBusy: false,
    called: {},           // numbers dialled this night
    sfx: null,            // one-shot clip player (ring/busy/dtmf)
    won: false            // this night already ended by knowing enough
  };
}
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
// cookie helpers (loop count persists across loops/reloads)
function setCookie(k, v) { document.cookie = k + "=" + encodeURIComponent(v) + ";path=/;max-age=31536000"; }
function getCookie(k) {
  var m = document.cookie.match(new RegExp("(?:^|; )" + k + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : null;
}
function loopCount() { return parseInt(getCookie("loop_count") || "0", 10); }   // completed loops
function currentLoop() { return loopCount() + 1; }  // playing now: loop N+1

// KNOWLEDGE FLAGS, the only thing that survives midnight besides the loop count.
// What the player has figured out (codes read, pages seen, calls placed, files opened).
// Content gates on data entries with flags:["a","b"] (all required) / notFlags:["c"].
var FLAG_COOKIE = "kairos_flags";
function loadFlags() {
  var raw = getCookie(FLAG_COOKIE);
  if (!raw) return {};
  var f = {};
  raw.split(",").forEach(function (k) { k = decodeURIComponent(k).trim(); if (k) f[k] = 1; });
  return f;
}
var FLAGS = loadFlags();
function saveFlags() { setCookie(FLAG_COOKIE, Object.keys(FLAGS).join(",")); }
function hasFlag(f) { return !!FLAGS[f]; }
window.hasFlag = hasFlag;                              // callable from site pages (parent.hasFlag) and data
function setFlag(f, silent) {                          // marks something as known, persists across nights
  if (!f || FLAGS[f]) return false;
  FLAGS[f] = 1; saveFlags();
  refreshPhoneDirectory();                             // numbers you have read start showing up
  if (!silent && window.DIALOGUE) fireDialogue(S ? Math.floor(S.gameMin) : 0);
  showMenuChrome();
  return true;
}
window.setFlag = setFlag;
function clearFlags() { FLAGS = {}; saveFlags(); refreshPhoneDirectory(); }
window.clearFlags = clearFlags;
function clearFlag(f) {                                 // forgetting is a real consequence too
  if (!f || !FLAGS[f]) return false;
  delete FLAGS[f]; saveFlags(); refreshPhoneDirectory(); showMenuChrome();
  return true;
}
window.clearFlag = clearFlag;
function allFlagsKnown(list) { return (list || []).every(hasFlag); }
function needsHidden(list) { return (list || []).some(hasFlag); }
function gateOk(item) {                                // shared condition test for any data entry
  if (!item) return false;
  if (item.flags && !allFlagsKnown(item.flags)) return false;
  if (item.notFlags && needsHidden(item.notFlags)) return false;
  return true;
}

// settings (persist across loops, not part of the night)
var SETTINGS_DEFAULTS = { rain: 100, dialogue: 85, notify: 60, crt: 100 };
var SETTINGS = loadSettings();
function loadSettings() {
  var s = {};
  try { s = JSON.parse(getCookie("loop_settings") || "{}"); } catch (e) { s = {}; }
  Object.keys(SETTINGS_DEFAULTS).forEach(function (k) {
    if (typeof s[k] !== "number" || isNaN(s[k])) s[k] = SETTINGS_DEFAULTS[k];
    s[k] = Math.max(0, Math.min(100, s[k]));
  });
  return s;
}
function saveSettings() { setCookie("loop_settings", JSON.stringify(SETTINGS)); }

// apply current settings to every channel live
function applySettings() {
 // rain: scale the master gain by the slider
  if (!rain.disabled && rain.master && rain.ctx) {
    var now = rain.ctx.currentTime;
    rain.master.gain.cancelScheduledValues(now);
    rain.master.gain.setValueAtTime(rain.master.gain.value, now);
    rain.master.gain.linearRampToValueAtTime(rain.level * SETTINGS.rain / 100, now + 0.25);
  }
 // dialogue/notify: applied at play time (see playAudio/playNotify volumes)
 // crt overlay opacity, 0 hides it entirely
  var crt = document.getElementById("crt-overlay");
  if (crt) crt.style.opacity = String(SETTINGS.crt / 100);
}

// dom shortcuts
function $(id) { return document.getElementById(id); }
var screenEl, trayClock, chatLog, urlBar, frame, loadbar, loadPct, statusText;


// Clock

function fmtTime(min) {
  var h = Math.floor(min / 60), m = Math.floor(min % 60);
  var hh24 = h % 24;
  var ap = hh24 >= 12 ? "PM" : "AM";
  var h12 = hh24 % 12; if (h12 === 0) h12 = 12;
  return { h: hh24, m: m, str: h12 + ":" + (m < 10 ? "0" : "") + m + " " + ap };
}
function trayStr(min) { return "10/14/02 " + fmtTime(min).str; }

// deeper loops have less to read: the clock picks up once the player knows the night
function nightRamp() {
  var L = currentLoop();
  if (L <= 1) return 1;      // first night plays at full weight
  if (L <= 3) return 1.4;    // 2nd-3rd nights: ~8.5 real minutes
  return 2;                  // 4th night onward: ~6 real minutes
}

function tick() {
  if (!S.running) return;
  S.gameMin += GAME_MIN_PER_SEC * nightRamp() * (TICK_MS / 1000);
  if (S.gameMin >= NIGHT_END) { midnight(); return; }
  var t = fmtTime(S.gameMin);
  trayClock.textContent = trayStr(S.gameMin);
  var cal = $("cal-clock");
  if (cal) cal.textContent = "Oct 14, 2002, " + t.str;

  fireMessages(t.h * 60 + t.m);
  fireDialogue(t.h * 60 + t.m);
}


// Chat messages

// LOOP branches are spent when they don't match (that night's script is fixed).
// KNOWLEDGE gates are not spent: content stays pending until you learn what unlocks it.
function loopsOnly(item) {
  if (!item.loops) return true;
  return item.loops.indexOf(currentLoop()) !== -1;
}
function onContentLoop(item) { return loopsOnly(item) && gateOk(item); }
function msgOnLoop(msg) { return onContentLoop(msg); }
function timeOf(str) { // "HH:MM" -> minutes ("24:00" allowed)
  var p = str.split(":"); return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
}
function fireMessages(nowMin) {
  (window.MESSAGES || []).forEach(function (msg, i) {
    if (S.firedMsgs[i]) return;
    if (!loopsOnly(msg)) { S.firedMsgs[i] = true; return; }         // this loop's branch is used up
    if (!gateOk(msg)) return;                                        // locked: keeps waiting for the knowledge
    if (timeOf(msg.time) <= nowMin) {
      S.firedMsgs[i] = true;
      var sets = msg.set ? (Array.isArray(msg.set) ? msg.set : [msg.set]) : null;   // an authored reply can record knowledge
      if (sets) sets.forEach(function (f) { setFlag(f, true); });
      msg.thread = threadOf(msg.from); // "You" replies fold into the contact you're answering
      S.chatHistory.push(msg);
      buildSidebar();                  // contact may be new this tick
      var shownNow = !$(APPS.chat.win).classList.contains("hidden") && S.activeChat === msg.thread;
      appendChat(msg, false);          // renders only if it's the active thread
      notifyTaskbar("chat");
      if (!shownNow && msg.from !== "You") {            // your own replies never count as unread
        S.unreadBy[msg.thread] = (S.unreadBy[msg.thread] || 0) + 1;
        refreshUnread();
        if (nowMin < timeOf(msg.time) + 5) {
          playNotify();
        }
      } else if (shownNow) {
 // already viewing this chat: ensure unread is 0 and clear badges
        S.unreadBy[msg.thread] = 0;
        refreshUnread();
      }
      if (msg.dlg) triggerDialogue(msg.dlg);            // message carries dialogue: fire its id
    }
  });
}
// chat threads: sidebar per contact, exclamation on unread contacts
// a thread exists once somebody has actually written. pre-night history is known from the start;
// night contacts (KAIROSKIT and friends) only join the list when their message lands.
function contacts() {
  var seen = {}, out = [];
  (window.PAST || []).forEach(function (m) { if (m.from !== "You" && !seen[m.from]) { seen[m.from] = 1; out.push(m.from); } });
  (S.chatHistory || []).forEach(function (m) { if (m.from !== "You" && !seen[m.from]) { seen[m.from] = 1; out.push(m.from); } });
  return out;   // "You" is not a contact, your replies live inside the thread you're answering
}
// which conversation does this message belong to? Yours goes to whoever spoke last before it.
function threadOf(from, history) {
  if (from !== "You") return from;
  var hist = history || S.chatHistory;
  for (var j = hist.length - 1; j >= 0; j--) {
    var m = hist[j];
    if (m.from !== "You") return m.thread || m.from;
  }
  return contacts()[0] || "Inbox";   // a reply before anyone spoke: fold into first contact
}
// pre-night messages for a thread (window.PAST), folded the same way as live ones.
// Entries render in file order; a `day:` label (e.g. "Oct 12") inserts a day separator
// whenever the day changes between consecutive messages.
function pastFor(thread) {
  var hist = [];
  (window.PAST || []).forEach(function (m) {
    var copy = { time: m.time, from: m.from, text: m.text, past: true, day: m.day || null };
    copy.thread = m.thread || threadOf(m.from, hist);
    hist.push(copy);
  });
  return hist.filter(function (m) { return m.thread === thread; });
}
function buildSidebar() {
  var sb = $("chat-sidebar"); if (!sb) return;
  sb.innerHTML = "";
  contacts().forEach(function (c) {
    var it = document.createElement("div");
    it.className = "chat-side-item" + (c === S.activeChat ? " active" : "") + ((S.unreadBy[c] || 0) > 0 ? " has-unread" : "");
    it.innerHTML = "<span>" + esc(c) + "</span><img class='chat-side-unread' src='assets/icons/badge_excl.png' alt='!'>";
    it.addEventListener("click", function () { selectChat(c); });
    sb.appendChild(it);
  });
}
function selectChat(c) {
  S.activeChat = c;
  S.unreadBy[c] = 0;                 // opening a thread marks its messages read
  buildSidebar(); renderThread(); refreshUnread();
}
function renderThread() {
  chatLog.innerHTML = "";
 // wall at the top of the scroll: older history can't load
  var wall = document.createElement("div");
  wall.className = "chat-wall";
  wall.textContent = "failed to load older messages.";
  chatLog.appendChild(wall);
 // past (pre-night) messages first, oldest at top; `day:` labels insert day separators
  var lastDay = null;
  pastFor(S.activeChat).forEach(function (m) {
    if (m.day && m.day !== lastDay) {
      lastDay = m.day;
      var sep = document.createElement("div");
      sep.className = "chat-day-sep";
      sep.textContent = m.day;
      chatLog.appendChild(sep);
    }
    appendChat(m, true);
  });
 // tonight's messages, in arrival order
  var tonight = S.chatHistory.filter(function (m) { return m.thread === S.activeChat; });
  if (tonight.length && lastDay !== null && lastDay !== "Oct 14") {
    var sep2 = document.createElement("div");
      sep2.className = "chat-day-sep";
      sep2.textContent = "Oct 14";
      chatLog.appendChild(sep2);

  }
  tonight.forEach(function (m) { appendChat(m, true); });
  chatLog.scrollTop = chatLog.scrollHeight;   // start at the bottom: only the last ~2 messages visible
}
// desktop-icon badge: any contact unread AND the window is closed
function refreshUnread() {
  var total = 0; Object.keys(S.unreadBy).forEach(function (k) { total += S.unreadBy[k]; });
  var ic = document.querySelector('.icon[data-app="chat"]');
  if (ic) ic.classList.toggle("has-unread", total > 0 && $(APPS.chat.win).classList.contains("hidden"));
  buildSidebar();   // sidebar badges live-update per contact
}
function playNotify() {
  var exts = ["mp3", "wav", "ogg"];
  function tryExt(i) {
    if (i >= exts.length) return;             // silent fallback: no notify file present
    var a = new Audio("assets/audio/notify." + exts[i]);
    a.volume = SETTINGS.notify / 100;     // notify volume setting (default slightly quiet)
    a.onerror = function () { tryExt(i + 1); };
    a.play().catch(function () {});
  }
  tryExt(0);
}
function renderAllChat() {
  var target = S.activeChat || contacts()[0] || null;
  if (target) {
    selectChat(target); // selects contact AND clears S.unreadBy[target] to 0
  } else {
    buildSidebar();
    renderThread();
    refreshUnread();
  }
}
function appendChat(msg, instant) {
  var thread = msg.thread || threadOf(msg.from);
  if (thread !== S.activeChat) return;   // threads: only the selected conversation renders live
  var mine = msg.from === "You";
  var d = document.createElement("div");
  d.className = "chat-msg" + (mine ? " mine" : "");
  if (instant) d.style.animation = "none";
  var t = timeOf(msg.time), f = fmtTime(t);
  d.innerHTML = '<span class="chat-time">' + f.str + '</span> <b class="chat-from">' +
                esc(msg.from) + '</b><br/>' + esc(msg.text || "\u00a0");
  chatLog.appendChild(d);
  chatLog.scrollTop = chatLog.scrollHeight;
}


// Dialogue bar

function dlgOnLoop(line) { return onContentLoop(line); }
function fireDialogue(nowMin) {
  (window.DIALOGUE || []).forEach(function (line, i) {
    if (S.dialogueShown[i]) return;
    if (!line.at) return;      // id-only lines fire via triggerDialogue, not the clock
    if (!loopsOnly(line)) { S.dialogueShown[i] = true; return; }     // spent on other loops' scripts
    if (!gateOk(line)) return;                                        // locked until known
    if (timeOf(line.at) <= nowMin) {
      S.dialogueShown[i] = true;
      queueDialogue(i);
    }
  });
}
// event-triggered dialogue
// In data/dialogue.js give a line id: "some_id" (omit `at`). Then anywhere in the
// JS call triggerDialogue("some_id") fires once per loop, preempts any active line.
function queueDialogue(i) {
  var preempt = S.dlgIndex !== -1 && $("dialogue-bar").classList.contains("visible");
  S.dialogueQueue.push(i);
  if (preempt) discardDialogue();     // new line arrives mid-line: old one is discarded, not queued behind
  if (S.dlgIndex === -1) playNextDialogue();
}
function triggerDialogue(id, force) {
  var lines = window.DIALOGUE || [];
  for (var i = 0; i < lines.length; i++) {
    if (lines[i].id !== id) continue;

 // Only block if already shown AND not marked as repeatable/forced
    if (S.dialogueShown[i] && !lines[i].repeatable && !force) return;

    if (!dlgOnLoop(lines[i])) return;
    S.dialogueShown[i] = true;
    queueDialogue(i);
    return true;
  }
  return false;
}
window.triggerDialogue = triggerDialogue;      // callable from data files & dev console
function playNextDialogue() {
  var next = S.dialogueQueue.shift();
  if (next === undefined) { hideDialogue(); S.dlgIndex = -1; return; }
  S.dlgIndex = next;
  showDialogueLine(window.DIALOGUE[next]);
}
// hard-discard the active line: timers, audio, fade, nothing leaks into the next line
function discardDialogue() {
  clearWordTimers();
  clearTimeout(S.dlgFadeTimer);
  stopAudio();
  S.dlgIndex = -1;
  var bar = $("dialogue-bar");
  bar.classList.remove("visible", "dlg-fade");
  bar.style.display = "";   // reset inline hide from a finished fade
  bar.style.opacity = "";
}

function showDialogueLine(line) {
  var bar = $("dialogue-bar");
  clearTimeout(S.dlgFadeTimer);      // cancel any pending auto-fade of the previous line
  bar.classList.remove("dlg-fade");
  bar.style.display = ""; bar.style.opacity = "";     // undo inline styles from a finished fade
  bar.classList.add("visible");
  $("dlg-speaker").textContent = line.speaker || "";
  $("dlg-en").innerHTML = line.en || "";
  var jpEl = $("dlg-jp");
  jpEl.innerHTML = "";
  clearWordTimers();

 // split Japanese into tokens (CJK chars pop per-char, latin runs pop per-word)
  var tokens = line.jp.match(/[一-龥々ー・。、！？…「」『』（）\s]|[A-Za-z0-9]+|[^\s]/g) || [line.jp];
  tokens.forEach(function (tok) {
    var w = document.createElement("span");
    w.className = "dlg-word";
    w.textContent = tok;
    jpEl.appendChild(w);
  });
  var spans = jpEl.querySelectorAll(".dlg-word");
  spans.forEach(function (sp, i) {
    S.wordTimers.push(setTimeout(function () { sp.classList.add("show"); }, 120 + i * 130));
  });

  $("dlg-hint").textContent = "click to continue";
  playDialogue(line.audio);
  if (line.duration) {
    var durMs = line.duration < 1000 ? line.duration * 1000 : line.duration;
    scheduleDlgFade(durMs);
  } else if (!line.audio) {
 // Fallback for silent lines without an explicit duration
    var wordMs = 120 + jpEl.querySelectorAll(".dlg-word").length * 130;
    scheduleDlgFade(wordMs + 2500);
  }
}
// fade out a couple seconds after the voice clip ends; silent lines fade after their words finish
function scheduleDlgFade(delayMs) {
  clearTimeout(S.dlgFadeTimer);
  S.dlgFadeTimer = setTimeout(function () {
    var bar = $("dialogue-bar");
    if (!bar.classList.contains("visible")) return;
    bar.classList.add("dlg-fade");
    S.dlgFadeTimer = setTimeout(function () {
      bar.classList.remove("visible", "dlg-fade");
      bar.style.display = ""; bar.style.opacity = "";
      stopAudio();
      S.dlgIndex = -1;
      playNextDialogue();   // queue (if any) continues after the fade
    }, 700);                // matches .dlg-fade transition duration
  }, delayMs);
}
function hideDialogue() {
  clearTimeout(S.dlgFadeTimer);
  var bar = $("dialogue-bar");
  bar.classList.remove("visible", "dlg-fade");
  bar.style.display = ""; bar.style.opacity = "";
  stopAudio();
}
function clearWordTimers() { (S.wordTimers || []).forEach(clearTimeout); S.wordTimers = []; }

function advanceDialogue() {
  if (!$("dialogue-bar").classList.contains("visible")) return;
 // reveal any not-yet-shown words instantly, then move on
  document.querySelectorAll("#dlg-jp .dlg-word:not(.show)").forEach(function (w) { w.classList.add("show"); });
  clearWordTimers();
  playNextDialogue();
}

function playDialogue(name) {
  stopAudio();
  if (!name) return;
  var exts = ["mp3", "wav", "ogg"];
  function tryExt(i) {
    if (i >= exts.length) return;   // silent fallback: no audio file present
    var a = new Audio("assets/audio/dialogue/" + name + "." + exts[i]);
    a.volume = SETTINGS.dialogue / 100;   // dialogue volume setting (default slightly quiet)
    a.preload = "auto";
    a.onerror = function () { tryExt(i + 1); };
    a.onended = function () { scheduleDlgFade(2000); };   // voice finished → bar fades out ~2s later
    a.play().then(function () { S.audio = a; }).catch(function () { /* autoplay blocked, silent */ });
  }
  tryExt(0);
}
function playAudio(name) {
  if (!name) return;
  var exts = ["mp3", "wav", "ogg"];
  function tryExt(i) {
    if (i >= exts.length) return;   // silent fallback: no audio file present
    var a = new Audio("assets/audio/" + name + "." + exts[i]);
    a.volume = SETTINGS.dialogue / 100;   // dialogue volume setting (default slightly quiet)
    a.preload = "auto";
    a.onerror = function () { tryExt(i + 1); };
    a.play().then(function () { S.audio = a; }).catch(function () { /* autoplay blocked, silent */ });
  }
  tryExt(0);
}
function stopAudio() { if (S && S.audio) { try { S.audio.pause(); } catch (e) {} S.audio = null; } }


// Browser

var HOME_URL = "cutecats.com/";

function parseUrl(raw) {
  var u = String(raw || "").trim().replace(/^https?:\/\//i, "").replace(/^www\./i, "");
  if (!u) return null;
  var slash = u.indexOf("/");
  var domain = slash === -1 ? u : u.slice(0, slash);
  var path = slash === -1 ? "/" : u.slice(slash);
  if (domain && !domain.includes(".")) domain += ".com";   // type "cutecats" → cutecats.com
  var autoExt = false;                                  // remembers that WE added the extension
  if (path !== "/" && !/\/$/.test(path) && !/\.\w+$/.test(path.split("/").pop())) { path += ".html"; autoExt = true; } // "gallery" → gallery.html. A trailing slash stays a folder.
  return { domain: domain.toLowerCase(), path: path, autoExt: autoExt };
}
 
// Typed bare hosts resolve like any unknown address: see screen404 below.
function browserNavigate(urlStr, pushHistory) {
  var parsed = parseUrl(urlStr);
  urlBar.value = parsed ? parsed.domain + parsed.path : urlStr;
  if (!parsed) return showScreen(screen404(urlStr));

  if (pushHistory !== false) {
    S.browserHist = S.browserHist.slice(0, S.histPos + 1);
    S.browserHist.push(parsed.domain + parsed.path);
    S.histPos = S.browserHist.length - 1;
  }

  var site = (window.SITES || []).find(function (s) { return s.domain.toLowerCase() === parsed.domain; });
  if (!site) return showScreen(screen404(parsed.domain + parsed.path));

 // a site nobody has mentioned to you yet behaves like it does not exist
  if (site.flags || site.notFlags) {
    if (!gateOk(site)) return showScreen(screen404(parsed.domain + parsed.path));
  }

 // time gate: site only exists during certain hours
  if (site.gate) {
    var now = Math.floor(S.gameMin), a = timeOf(site.gate.start), b = timeOf(site.gate.end);
    if (now < a || now >= b) return showScreen(screenOffline(site, parsed.path));
  }

 // Address resolution: players type real period web addresses. A trailing slash means a
 // folder ("geocities.jp/ken_md98/" is an index), and folders may carry no dot-extension.
  var rawPath = parsed.path.replace(/\/+$/, "") || "/";
  var noSlash = rawPath.replace(/^\/+/, "");      // "gallery.html" | "ken_md98" | ""
  var last = noSlash.split("/").pop();
  var cands = [rawPath, "/" + noSlash, noSlash];  // exact → leading-slash form → bare key
  if (noSlash === "") cands.push("");
  if (last && !/\.\w+$/.test(last)) {             // dotless final segment: a folder, keep its own name addressable
    var dir = noSlash.slice(0, Math.max(0, noSlash.length - last.length - 1));
    [dir ? dir + "/" + last : last].forEach(function (c) { if (cands.indexOf(c) === -1) cands.push(c); });
  }
  if (parsed.autoExt) {                           // WE added .html, so a folder typed without a trailing slash
    var stripped = noSlash.replace(/\.html$/, "");
    if (stripped && stripped !== noSlash) {
      [stripped, "/" + stripped].forEach(function (c) { if (cands.indexOf(c) === -1) cands.push(c); });
    }
  }

  var key = null;
  for (var ci = 0; ci < cands.length; ci++) {
    if (site.pages[cands[ci]] !== undefined) { key = cands[ci]; break; }
  }
  if (key === null) {
    // bare host or a path that is not published: the site simply does not answer
    return showScreen(screen404(parsed.domain + parsed.path));
  }

 // knowledge lock on a page: type the right address, know the right things, get in
  if (site.locks && site.locks[key] && !allFlagsKnown(site.locks[key])) {
    return showScreen(screenLocked(site, key));
  }

 // same URL, different page once you know more
  var pageHtml = site.pages[key];
  var vs = site.variants && site.variants[key];
  if (vs) {
    for (var vi = 0; vi < vs.length; vi++) {
      if (gateOk(vs[vi]) && vs[vi].html !== undefined) { pageHtml = vs[vi].html; break; }
    }
  }

 // landing here is itself a piece of knowledge
  if (site.sets && site.sets[key]) flagField(site.sets[key]).forEach(function (fl) { setFlag(fl, true); });
  fireDialogue(Math.floor(S.gameMin));

  slowLoad(site.delay || 1500, function () {
    frame.srcdoc = wrapPage(pageHtml, site.title);
    statusText.textContent = "Done. " + site.title;
 // site carries dialogue: site.dlg fires on any page; site.dlgPages["path.html"] fires on that page
    var dlgId = (site.dlgPages && (site.dlgPages[rawPath] || site.dlgPages[noSlash] || site.dlgPages["/" + noSlash]))
             || (noSlash === "" && site.dlg) || null;
    if (dlgId) triggerDialogue(dlgId);
  });
}
function showScreen(html) {
  clearTimeout(S.loadTimer);
  loadbar.style.width = "100%";
  frame.srcdoc = '<!DOCTYPE html><html><head><meta charset="utf-8"></head>' + html + '</html>';
  statusText.textContent = "Done";
}

function wrapPage(html, title) {
  return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + esc(title || "") +
    '</title><style>body{font-family:Tahoma,sans-serif;font-size:13px;margin:12px;background:white;color:black;}a{color:#0000ee;}</style></head><body>' +
    html + '</body></html>';
}

// slow loading with progress bar + live percentage + URL-bar fill (IE5 style)
function slowLoad(ms, done) {
  clearTimeout(S.loadTimer);
  statusText.textContent = "Opening...";
  loadbar.style.width = "0%";
  if (loadPct) loadPct.textContent = "0%";
  var start = Date.now();
  function step() {
    var p = Math.min(100, ((Date.now() - start) / ms) * 100);
    loadbar.style.width = p + "%";
    if (loadPct) loadPct.textContent = Math.floor(p) + "%";
 // the URL bar itself fills blue from left to right while loading
    urlBar.style.background = "linear-gradient(90deg, #000080 " + p.toFixed(1) + "%, #ffffff " + p.toFixed(1) + "%)";
    urlBar.style.color = "#fff";
    if (p < 100) S.loadTimer = setTimeout(step, 120);
    else {
      if (loadPct) loadPct.textContent = "";
      urlBar.style.background = "#fff";
      urlBar.style.color = "#000";
      done();
    }
  }
  S.loadTimer = setTimeout(step, 120);
}

// built-in screens
function screen404(url) {
  return '<body><div class="ie-screen"><h2>&#9888; Cannot find server</h2>' +
    '<p>The page at <b>' + esc(url) + '</b> cannot be displayed. The server does not exist, ' +
    'the address is misspelled, or the site has been taken offline.</p><hr>' +
    '<p style="font-size:11px;color:#555;">Edge. Address not found. DNS lookup failed for ' + esc(String(url).split("/")[0]) + '</p></div>';
}
function screenOffline(site, path) {
  return '<body><div class="ie-screen"><h2>&#128225; Server offline</h2>' +
    '<p><b>' + esc(site.domain) + '</b> is only reachable between <b>' + esc(site.gate.start) +
    '</b> and <b>' + esc(site.gate.end) + '</b>.</p>' +
    '<p>The connection to ' + esc(path) + ' was refused by the remote host.</p><hr>' +
    '<p style="font-size:11px;color:#555;">Edge. Connection reset. site exists outside current hours</p></div>';
}
// page you can reach but can't use yet: the site answers with its own excuses
function screenLocked(site, key) {
  var custom = site.lockScreens && (site.lockScreens[key] || site.lockScreens["/"]);
  if (custom) return '<body>' + custom + '</body>';
  var hint = site.lockHints && (site.lockHints[key] || site.lockHints["/"]);
  return '<body><div class="ie-screen"><h2>&#128274; Authorisation required</h2>' +
    '<p>The document <b>' + esc(key) + '</b> exists on this server. Your account has no rights to it.</p>' +
    (hint ? '<p>' + hint + '</p>' : '') + '<hr>' +
    '<p style="font-size:11px;color:#555;">' + esc(site.title) + ', access log updated at ' +
    esc(fmtTime(Math.floor(S.gameMin)).str) + '</p></div>';
}

// in-page link interception (relative links navigate our fake web)
function frameLinkNav(e) {
  var a = e.target.closest ? e.target.closest("a") : null;
  if (!a || !a.getAttribute("href")) return;
  e.preventDefault();
  var href = a.getAttribute("href").replace(/^https?:\/\//i, "").replace(/^www\./i, "");
  if (/^about:/i.test(href)) return;
  var cur = parseUrl(urlBar.value);
  var first = href.split("/")[0];
 // cross-site link only when the FIRST segment looks like a domain, contains a dot
 // and is NOT itself an html file. "gallery.html" / "./x.html" / "/x.html" are always
 // relative subpages of the current site: cutecats.com/gallery.html
  var isCrossSite = /\./.test(first) && !/\.html?$/i.test(first) && first !== "." && first !== "..";
  var clean = href.replace(/^\.?\//, "");            // strip ./ and leading /
  var target = isCrossSite ? href : (cur ? cur.domain + "/" + clean : clean);
  browserNavigate(target, true);
}

function histNav(dir) {
  var np = S.histPos + dir;
  if (np < 0 || np >= S.browserHist.length) return;
  S.histPos = np;
  browserNavigate(S.browserHist[np], false);
}


// MIDNIGHT, distortion -> white flash -> hard reset

var midnightFired = false;
function midnight() {
  if (midnightFired) return;
  midnightFired = true;
  S.running = false;
  stopAudio(); clearWordTimers(); clearTimeout(S.loadTimer); clearTimeout(S.dlgFadeTimer); stopMedia();

  var ending = findEnding();                       // knowing enough is the only way out of this night
  if (ending && !hasFlag("won_" + ending.id)) { playEnding(ending); return; }

  screenEl.classList.add("distorting");
  setTimeout(function () {
    $("white-flash").classList.add("on");
    setTimeout(function () {
      hardReset();                  // wipe everything, loop++ in cookie
      $("white-flash").classList.remove("on");
      var banner = $("day-banner");
      banner.textContent = "LOOP " + currentLoop() + ": OCTOBER 14, 2002";
      banner.classList.add("show");
      setTimeout(function () { banner.classList.remove("show"); }, 3500);
      midnightFired = false;
      startNight();                 // begin again at 18:00
    }, FLASH_MS);
  }, DISTORT_MS);
}


// ENDINGS - declarative, in data/endings.js (window.ENDINGS). Midnight checks them:
// { id:"morning", needAll:["know_id","key_in_bin"], notAny:["chose_claim"], loops:[...], flags/notFlags,
// lines:[ { speaker, jp, en, audio, duration } ], titleAfter:"This Morning" }
// Nothing about an ending is explained. It just gets quieter, then it stops happening.
var ENDING_TIMERS = [];
function findEnding() {
  var list = window.ENDINGS || [];
  for (var i = 0; i < list.length; i++) {
    var e = list[i];
    if (!loopsOnly(e) || !gateOk(e)) continue;
    if (e.needAll && !allFlagsKnown(e.needAll)) continue;
    if (e.notAny && needsHidden(e.notAny)) continue;
    if (hasFlag("won_" + e.id)) continue;
    return e;
  }
  return null;
}
window.findEnding = findEnding;
function morningTitle(id) {                                   // which morning you woke into is data-defined
  var list = window.ENDINGS || [];
  for (var i = 0; i < list.length; i++) if (list[i].id === id && list[i].titleAfter) return list[i].titleAfter;
  return "This Morning";
}
function clearEndingTimers() { ENDING_TIMERS.forEach(clearTimeout); ENDING_TIMERS = []; }
// ending overlay shares its inner nodes with index.html - reset them, never wipe the parent
function resetEndingScreen(el) {
  if (!el) return;
  el.classList.remove("show");
  var ph = el.querySelector(".ending-hint"); if (ph) ph.remove();
  ["ending-speaker", "ending-jp", "ending-en"].forEach(function (id) {
    var n = document.getElementById(id); if (n) { n.innerHTML = ""; n.textContent = ""; }
  });
}
function showLogonTitle(txt) {
  var h = document.querySelector(".lg-welcome");
  if (h) h.textContent = txt;
}
function playEnding(end) {
  S.won = true;
  setFlag("won_" + end.id, true);
  var el = $("ending-screen");
  var lines = end.lines || [];
  showLogonTitle(end.titleAfter || "This Morning");       // the menu remembers which night you finished
  setCookie("night_ended", end.id);

  screenEl.classList.add("distorting");
  setTimeout(function () {
    $("white-flash").classList.add("on");
    setTimeout(function () {
      hardReset();                                         // the night ends here: no new loop starts
      S.running = false;
      $("white-flash").classList.remove("on");
      screenEl.classList.remove("distorting");
      if (el) { resetEndingScreen(el); el.classList.add("show"); }
      runEndingLines(lines, 0, function () { finishEnding(end); });
    }, FLASH_MS);
  }, DISTORT_MS);
}
function runEndingLines(lines, i, done) {
  var el = $("ending-screen");
  if (!el) { done(); return; }
  if (i >= lines.length) { ENDING_TIMERS.push(setTimeout(done, 1400)); return; }
  var line = lines[i] || {};
  var jpEl = $("ending-jp"), enEl = $("ending-en"), spEl = $("ending-speaker");
  spEl.textContent = line.speaker || "";
  enEl.innerHTML = line.en || "";
  jpEl.innerHTML = "";
  var tokens = String(line.jp || "").match(/[一-龥々ー・。、！？…「」『』（）\s]|[A-Za-z0-9]+|[^\s]/g) || [String(line.jp || "")];
  tokens.forEach(function (tok, k) {
    var w = document.createElement("span");
    w.className = "dlg-word"; w.textContent = tok; jpEl.appendChild(w);
    ENDING_TIMERS.push(setTimeout(function () { w.classList.add("show"); }, 160 + k * 135));
  });
  if (line.audio) playAudio(line.audio);                   // ending voice comes from assets/audio/
  var ms = line.duration ? line.duration * 1000 : (280 + tokens.length * 135 + 2300);
  ENDING_TIMERS.push(setTimeout(function () {
    if (line.audio) stopAudio();
    runEndingLines(lines, i + 1, done);
  }, Math.max(1200, ms)));
}
function finishEnding(end) {
  var el = $("ending-screen");
  var prompt = document.createElement("div");
  prompt.className = "ending-hint";
  prompt.textContent = "the night is over. wake up";
  el.appendChild(prompt);
  var onExit = function () {
    clearEndingTimers();
    el.removeEventListener("click", onExit);
    resetEndingScreen(el);
    setRainLevel(RAIN.volMenu);
    $("logon-screen").style.display = "flex";             // the logon is the only menu: now a morning one
    showMenuChrome();
  };
  el.addEventListener("click", onExit);
}


// POST-END MORNING STATE - the game keeps running after you win, quietly.

function hardReset() {
  setCookie("loop_count", loopCount() + 1);   // ONLY the loop count survives
  document.querySelectorAll(".window.app-window").forEach(function (w) {
    w.classList.add("hidden");
    if (w.dataset.maximized === "1") restoreWindow(w);
  });
  $("taskbar-apps").innerHTML = "";
  chatLog.innerHTML = "";
  frame.srcdoc = "";
  urlBar.value = HOME_URL;
  loadbar.style.width = "0%";
  statusText.textContent = "Ready";
  hideDialogue();
  screenEl.classList.remove("distorting");
  var bic = document.querySelector('.icon[data-app="chat"]');   // wipe unread badge for the new loop
  if (bic) bic.classList.remove("has-unread");
  var es = $("ending-screen");                                   // any ending overlay is cleared with the night
  clearEndingTimers();
  resetEndingScreen(es);
  S = freshState();                                              // full state wipe
  S.files = baseFiles();                                         // desktop contents rebuilt from the authored source
  S.recycle = baseRecycle();                                     // deleted files are not hiding in tomorrow's bin
}


// WINDOWS: drag, min/max/close, z-order, taskbar

var APPS = {
  browser:  { win: "win-browser",  label: "Edge" },
  chat:     { win: "win-chat",     label: "Chat Terminal" },
  explorer: { win: "win-explorer", label: "My Computer" },
  notepad:  { win: "win-notepad",  label: "Notepad" },
  clock:    { win: "win-clock",    label: "Calendar" },
  recycle:  { win: "win-recycle",  label: "Recycle Bin" },
  image:    { win: "win-image",    label: "Image Viewer" },
  phone:    { win: "win-phone",    label: "Phone" },
  media:    { win: "win-media",    label: "Media Player" }
};

function openApp(app) {
  var cfg = APPS[app]; if (!cfg) return;
  var w = $(cfg.win);
  w.classList.remove("hidden");
  focusWindow(w);
  ensureTaskbarButton(app);
  clearNotify(app);
  if (app === "chat") { renderAllChat(); }   // opening shows sidebar + active thread; per-contact unread handled by selectChat
  if (app === "explorer") renderFiles();
  if (app === "recycle") renderRecycle();
  if (app === "phone") buildPhoneShortcuts();     // the directory listing is live data
  if (app === "clock") buildCalendar();
}
function closeApp(app) {
  var w = $(APPS[app].win);
  w.classList.add("hidden");
  removeTaskbarButton(app);
  if (app === "media") stopMedia(true);   // closing Media Player fully stops the clip and dialogue
}
function toggleMinimize(app) {
  var w = $(APPS[app].win);
  if (w.classList.contains("hidden")) { w.classList.remove("hidden"); focusWindow(w); }
  else w.classList.add("hidden");
}
function ensureTaskbarButton(app) {
  if ($("tb-" + app)) return;
  var b = document.createElement("button");
  b.className = "btn taskbar-app-btn"; b.id = "tb-" + app;
  b.textContent = APPS[app].label;
  b.addEventListener("click", function () {
    var w = $(APPS[app].win);
    if (w.classList.contains("hidden")) openApp(app);
    else w.classList.add("hidden");
  });
  $("taskbar-apps").appendChild(b);
}
function removeTaskbarButton(app) { var b = $("tb-" + app); if (b) b.remove(); }
function notifyTaskbar(app) { var b = $("tb-" + app); if (b && $(APPS[app].win).classList.contains("hidden")) b.classList.add("notify"); }
function clearNotify(app) { var b = $("tb-" + app); if (b) b.classList.remove("notify"); }

function focusWindow(w) { 
  S.zTop += 1; 
  w.style.zIndex = String(S.zTop); 
  syncActiveTaskbar(); 
}
function syncActiveTaskbar() {
  var top = -1;
  Object.keys(APPS).forEach(function (a) {
    var ww = $(APPS[a].win);
    if (!ww.classList.contains("hidden")) top = Math.max(top, parseInt(ww.style.zIndex || "0", 10));
  });
  Object.keys(APPS).forEach(function (app) {
    var b = $("tb-" + app), w = $(APPS[app].win);
    if (!b) return;
    b.classList.toggle("active", !w.classList.contains("hidden") && parseInt(w.style.zIndex || "0", 10) === top);
  });
}

function restoreWindow(w) {
  delete w.dataset.maximized;
  if (w.dataset.prev) {
    var p = JSON.parse(w.dataset.prev);
    w.style.left = p.left; w.style.top = p.top; w.style.width = p.width; w.style.height = p.height;
  }
}
function maximizeToggle(app) {
  var w = $(APPS[app].win);
  if (w.dataset.maximized === "1") { restoreWindow(w); return; }
  w.dataset.prev = JSON.stringify({ left: w.style.left, top: w.style.top, width: w.style.width, height: w.style.height });
  w.dataset.maximized = "1";
  w.style.left = "0px"; w.style.top = "0px";
  w.style.width = "calc(100vw - 4px)"; w.style.height = "calc(100vh - 32px)";
}

function wireWindow(app) {
  var w = $(APPS[app].win);
  var bar = w.querySelector(".title-bar");
  var btns = bar.querySelectorAll("button");
  if (btns[0]) btns[0].addEventListener("click", function () { toggleMinimize(app); });
  if (btns[1]) btns[1].addEventListener("click", function () { maximizeToggle(app); });
  if (btns[2]) btns[2].addEventListener("click", function () { closeApp(app); });
  w.addEventListener("mousedown", function () { focusWindow(w); });

 // drag by title bar
  var drag = null;
  bar.addEventListener("mousedown", function (e) {
    if (e.target.tagName === "BUTTON") return;
    drag = { dx: e.clientX - w.offsetLeft, dy: e.clientY - w.offsetTop };
    e.preventDefault();
  });
  document.addEventListener("mousemove", function (e) {
    if (!drag) return;
    w.style.left = Math.max(0, e.clientX - drag.dx) + "px";
    w.style.top = Math.max(0, e.clientY - drag.dy) + "px";
  });
  document.addEventListener("mouseup", function () { drag = null; });
}


// FILE EXPLORER / NOTEPAD / RECYCLE BIN / CALENDAR
// Paths use backslashes: "C:\", "C:\Docs", "C:\Docs\Private"
// Files declare their folder with `folder:` (default "C:\\").
// Folders auto-appear wherever a file lives inside them; window.FOLDERS
// adds extra (even empty) folders explicitly.

function normPath(p) { return String(p || "C:\\").replace(/\//g, "\\").replace(/\\+$/, "") + "\\"; }
function parentOf(p) {
  var t = normPath(p).slice(0, -1).split("\\");   // ["C:","Docs"]
  if (t.length <= 1) return "C:\\";
  return t.slice(0, -1).join("\\") + "\\";
}
function leafOf(p) { var t = normPath(p).slice(0, -1).split("\\"); return t[t.length - 1]; }

function fileOnLoop(f) {
  if (!loopsOnly(f)) return false;                       // some files only exist on certain loops
  return gateOk(f);                                      // others only appear once you know something
}
// Runtime desktop contents for THIS night (wiped at midnight like everything else).
// window.FILES / window.RECYCLE are the authored source; players can delete, restore, save.
function baseFiles() { return (window.FILES || []).slice(); }
function baseRecycle() { return (window.RECYCLE || []).slice(); }

function allFolders() {
  var set = {};
  (S && S.files ? S.files : baseFiles()).forEach(function (f) {
    var parts = normPath(f.folder || "C:\\").slice(0, -1).split("\\");
    for (var i = 2; i <= parts.length; i++) set[parts.slice(0, i).join("\\") + "\\"] = true;
  });
  (window.FOLDERS || []).forEach(function (p) { set[normPath(p)] = true; });
  delete set["C:\\"];
  return Object.keys(set);
}

function renderFiles() {
  var list = $("file-list"); list.innerHTML = "";
  var here = normPath(S.folder);
  if (!S.files) S.files = baseFiles();

 // child folders of current dir
  var kids = allFolders().filter(function (f) {
    return parentOf(f) === here && f !== here;
  }).sort();
  kids.forEach(function (f) {
    var row = mkRow("assets/icons/folder.png", leafOf(f));
    row.addEventListener("dblclick", function () { S.folder = normPath(f); S.selFile = null; renderFiles(); });
    list.appendChild(row);
  });

 // files in current dir
  var shownSel = -1;
  S.files.forEach(function (f, idx) {
    if (!fileOnLoop(f)) return;
    if (normPath(f.folder || "C:\\") !== here) return;
    var row = mkRow(f.icon || iconFor(f), f.name);
    row.addEventListener("click", function () { S.selFile = f; markRow(row); syncFileTools(); });
    row.addEventListener("dblclick", function () { S.selFile = f; openFile(f); });
    if (S.selFile === f) shownSel = idx;
    list.appendChild(row);
  });

  if (!list.children.length) list.innerHTML = "<p style='font-size:12px;color:#555;'>This folder is empty.</p>";
  renderCrumb(); syncFileTools();
}
// per-file default icon by type, so new content looks right without extra art
function iconFor(f) {
  if (f.type === "audio") return "assets/icons/audio.png";
  if (f.type === "image") return "assets/icons/photo.png";
  return "assets/icons/file.png";
}
function mkRow(icon, label) {
  var row = document.createElement("div");
  row.className = "file-row";
  row.innerHTML = '<img src="' + icon + '"><span>' + esc(label) + '</span>';
  return row;
}
// single-selection highlight across the file / bin lists
function markRow(row) {
  document.querySelectorAll(".file-row.selected").forEach(function (x) { x.classList.remove("selected"); });
  row.classList.add("selected");
}
function renderCrumb() {
  var el = $("crumb-path"); if (!el) return;
  var parts = normPath(S.folder).slice(0, -1).split("\\");   // ["C:","Docs"]
  var html = "", acc = "";
  parts.forEach(function (seg, i) {
    acc += seg + "\\";
    var path = acc;
    html += '<span class="crumb-seg" data-p="' + esc(path) + '">' + esc(seg) + "</span>\\ ";
  });
  el.innerHTML = html || "C:\\";
  el.querySelectorAll(".crumb-seg").forEach(function (s) {
    s.addEventListener("click", function () { S.folder = normPath(s.dataset.p); S.selFile = null; renderFiles(); });
  });
}

// FILE OPERATIONS: delete to the Recycle Bin, restore it, save Notepad text to disk.
// Deleting hides things from anything watching the drive; restoring puts them back.

function flagField(v) { return !v ? [] : (Array.isArray(v) ? v : [v]); }
function applyFileFlags(f, keys) {                      // f.set / f.clear run when a file is opened, deleted, restored
  flagField(f && f[keys]).forEach(function (x) { x.charAt(0) === "!" ? clearFlag(x.slice(1)) : setFlag(x, true); });
}
function deleteSelected() {
  var f = S.selFile; if (!f) return;
  var at = S.files.indexOf(f); if (at === -1) return;
  S.files.splice(at, 1);
  var copy = {}; Object.keys(f).forEach(function (k) { copy[k] = f[k]; });
  copy.from = normPath(f.folder || "C:\\");
  S.recycle.push(copy);
  S.selFile = null;
  applyFileFlags(f, "delSet"); applyFileFlags(f, "delClear");
  if (window.DELETE_HANDLER) {                            // data decides what was just hidden from the drive
    try { flagField(window.DELETE_HANDLER(f, { flags: FLAGS, bin: S.recycle.length })).forEach(function (x) { setFlag(x, true); }); } catch (e) {}
  }
  renderFiles(); renderRecycle(); fireDialogue(Math.floor(S.gameMin));
}
function restoreSelected() {
  var f = S.binSel; if (!f) return;
  var at = S.recycle.indexOf(f); if (at === -1) return;
  S.recycle.splice(at, 1);
  var back = {}; Object.keys(f).forEach(function (k) { back[k] = f[k]; });
  back.folder = f.from || "C:\\"; delete back.from;
  S.files.push(back);
  S.binSel = null;
  applyFileFlags(f, "setRestore"); applyFileFlags(f, "clearRestore");
  if (window.RESTORE_HANDLER) {                           // pulling a file back onto the live drive is knowledge too
    try { flagField(window.RESTORE_HANDLER(f, { flags: FLAGS })).forEach(function (x) { x.charAt(0) === "!" ? clearFlag(x.slice(1)) : setFlag(x, true); }); } catch (e) {}
  }
  renderFiles(); renderRecycle(); fireDialogue(Math.floor(S.gameMin));
}
function newNotepad() {
  openFileInNotepad({ name: "untitled.txt", type: "text", content: "" });
}
function notepadSave() {
  var area = $("notepad-area");
  var name = (S.noteName && S.noteName.indexOf(".") > -1) ? S.noteName : prompt("Save as (in " + leafOf(S.folder) + "):", "notes.txt");
  if (!name) return;
  name = String(name).trim().replace(/[\\\/:*?"<>|]/g, "");
  if (!/\.\w+$/.test(name)) name += ".txt";
  var text = area.value;
  var existing = S.files.filter(function (x) { return x.name.toLowerCase() === name.toLowerCase() && normPath(x.folder || "C:\\") === normPath(S.folder); })[0];
  if (existing) { existing.content = text; existing.type = "text"; }
  else S.files.push({ name: name, folder: normPath(S.folder), type: "text", content: text, saved: true });
  S.noteName = name;
  $("notepad-title").textContent = name + " (Notepad)";
  area.readOnly = false;
  renderFiles();
  if (window.SAVE_HANDLER) {                            // data decides what a piece of text means now
    try {
      var res = window.SAVE_HANDLER(text, name, normPath(S.folder));
      flagField(res).forEach(function (x) { setFlag(x, true); });
    } catch (e) {}
  }
  fireDialogue(Math.floor(S.gameMin));
  notifyTaskbar("explorer");
}
function openFileInNotepad(f) {
  $("notepad-title").textContent = f.name + " (Notepad)";
  var area = $("notepad-area");
  if (f.type === "text") { area.value = f.content || ""; area.readOnly = false; }
  else { area.value = "Cannot open. This file format is not supported by Notepad."; area.readOnly = true; }
  S.noteName = f.name;
  openApp("notepad");
}
// multi-type opener: text -> Notepad, image -> Image Viewer, audio -> Media Player, else "cannot open"
function openFile(f) {
  applyFileFlags(f, "set"); applyFileFlags(f, "clear");     // reading something teaches you things
  if (f.dlg) triggerDialogue(f.dlg);
  fireDialogue(Math.floor(S.gameMin));
  if (f.type === "image" && f.src) {
    $("image-title").textContent = f.name + " (Image Viewer)";
    $("image-view").src = f.src;
    openApp("image");
  } else if (f.type === "audio" && f.src) {
    openMedia(f);
  } else if (f.type === "text") {
    openFileInNotepad(f);
  } else {
    openFileInNotepad({ name: f.name, type: "binary" });
  }
}

// PHONE - dial a number. A person picks up, the machine picks up, the line sits engaged,
// or nobody is there, depending on what they know and what you have learned.
// Data lives in window.PHONES (see data/phones.js): [{ number:"555-0117", name:"Sato Residence",
// calls:[ { at:"21:00", until:"23:00", flags:["net_open"], state:"voice", audio:"call_sato_brother",
// speaker:"Mira's brother", jp:"…", en:"…", duration:9, set:"mira_helped", once:true,
// msg:[{from:"Mira",text:"…"}] } ] }]
// states: "voice" (clip + caption), "voicemail" (the tape picks up), "busy", "noanswer".
// Hours when nothing happens all give the busy signal, never a hint about when to retry.
var PH_VM_WAIT_MS = 4800;   // extra seconds the machine takes to pick up

function playSfx(name, vol, onDone) {                     // one-shot clip from assets/audio/
  if (!name) { if (onDone) onDone(); return null; }
  var exts = ["mp3", "wav", "ogg"];
  function tryExt(i) {
    if (i >= exts.length) { if (onDone) setTimeout(onDone, 400); return; }
    var a = new Audio("assets/audio/" + name + "." + exts[i]);
    a.volume = (vol === undefined ? SETTINGS.notify : vol) / 100;
    a.onerror = function () { tryExt(i + 1); };
    a.onended = function () { if (onDone) onDone(); };
    a.play().then(function () { S.sfx = a; }).catch(function () { if (onDone) onDone(); });
  }
  tryExt(0);
  return null;
}
function showInlineDialogue(line) {                        // one-off line that isn't part of the script queue
  discardDialogue();
  clearTimeout(S.dlgFadeTimer); clearWordTimers();
  S.dlgIndex = -1;
  showDialogueLine(line);
}
function deliverMsg(m) {                                   // drop a message into the chat mid-night
  var msg = { time: fmtTime(Math.floor(S.gameMin)).str.split(" ").slice(0).join(""), from: m.from, text: m.text, thread: m.thread || threadOf(m.from) };
  msg.time = (m.time || (Math.floor(S.gameMin / 60) + ":" + ("0" + Math.floor(S.gameMin % 60)).slice(-2)));
  S.chatHistory.push(msg);
  buildSidebar();
  appendChat(msg, false);
  notifyTaskbar("chat");
  if (msg.from !== "You") { S.unreadBy[msg.thread] = (S.unreadBy[msg.thread] || 0) + 1; refreshUnread(); playNotify(); }
  if (m.set) flagField(m.set).forEach(function (f) { setFlag(f, true); });
  if (m.dlg) triggerDialogue(m.dlg);
  return msg;
}
window.deliverMsg = deliverMsg;                            // PHONES handlers, site pages, dev console

function phoneMatches(c) {
  if (!loopsOnly(c) || !gateOk(c)) return false;
  var now = Math.floor(S.gameMin);
  if (c.at && now < timeOf(c.at)) return false;
  if (c.until && now > timeOf(c.until)) return false;
  return true;
}
function digitsOnly(s) { return String(s || "").replace(/[^0-9*#]/g, ""); }
function normNum(s) { return digitsOnly(s).replace(/^0+(?=\d)/, ""); }   // 0555-0117 == 555-0117
function matchPhone(entry, typed) {
  var t = normNum(typed), all = [entry.number].concat(entry.also || []);
  for (var i = 0; i < all.length; i++) if (normNum(all[i]) === t) return true;
  return false;
}
function phoneDigits(s) { return digitsOnly(s); }
// Directory rule: a number you have never read is NOT a number you can dial. Listings live in
// paper and pages first (data/phones.js gates): flags:["dir_read"] means know them all,
// anyFlags:["dir_read","know_news"] means knowing any one of them puts the line in your book.
// An unlearned line answers exactly like an invented one: busy signal, no commentary, no hint.
function phoneKnown(p) {
  if (!p) return false;
  if (!gateOk(p)) return false;                                       // flags / notFlags semantics
  var any = p.anyFlags || [];
  if (any.length && !any.some(hasFlag)) return false;                 // none of the sources read yet
  return true;
}
window.phoneKnown = phoneKnown;
function refreshPhoneDirectory() {                                     // listing changes as you learn
  try { if (window.PHONES && document.getElementById("phone-quick")) buildPhoneShortcuts(); } catch (e) {}
}
window.refreshPhoneDirectory = refreshPhoneDirectory;

// dialler
function dialNumber(raw) {
  var entry = (window.PHONES || []).filter(function (p) { return matchPhone(p, raw) && phoneKnown(p); })[0];
  var win = $("win-phone"), lineEl = $("phone-line-state"), numEl = $("phone-display");
  if (numEl) numEl.textContent = raw;
  if (!entry) {                                 // made up digits and unread numbers get the same tone
    if (lineEl) lineEl.innerHTML = "<span style='color:#a00;'>Number not in the directory.</span>";
    playSfx("busy_tone", SETTINGS.notify);
    return;
  }
  var rows = entry.calls || [];
  var matches = [];
  rows.forEach(function (c, i) {
    if (!phoneMatches(c)) return;
    matches.push({ c: c, i: i, spent: !!(c.once && S.called[entry.number + "#" + i]) });
  });
  // later windows describe this hour first: the 23:30 busy window wins over an exhausted 21:00 call
  matches.sort(function (a, b) { return timeOf(b.c.at || "0:00") - timeOf(a.c.at || "0:00"); });
  var hit = null;
  for (var mi = 0; mi < matches.length; mi++) { if (!matches[mi].spent) { hit = matches[mi]; break; } }
  var avail = hit ? hit.c : null;
  var idx = hit ? hit.i : -1;
  var nowMin = Math.floor(S.gameMin);
  var lastEnd = rows.reduce(function (m, c) { return Math.max(m, timeOf(c.until || "0:00")); }, 0);
  var shuttered = !avail && rows.length > 0 && nowMin > lastEnd;   // every published window has passed
  S.phoneBusy = true;
  if (lineEl) lineEl.textContent = "Dialling " + raw + "…";
  playSfx("dtmf", SETTINGS.notify);

  setTimeout(function () {
    function engaged(msg, after) {                                // busy tone, nothing else happens
      if (lineEl) lineEl.textContent = msg;
      playSfx("busy_tone", SETTINGS.notify, function () { S.phoneBusy = false; setPhoneState(after || "Line open."); });
    }
    function noAnswer() {                                         // nobody is there to pick up
      if (lineEl) lineEl.textContent = "No answer.";
      playSfx("busy_tone", SETTINGS.notify, function () { S.phoneBusy = false; setPhoneState("Line open."); });
    }
    function followUp(row) {                                      // what a call leaves behind once they hang up
      applyFileFlags(row, "set"); applyFileFlags(row, "clear");
      if (row.dlg) triggerDialogue(row.dlg);
      if (row.msg) row.msg.forEach(deliverMsg);
      saveFlags();
    }
    var st = avail ? (avail.state || "voice") : "noanswer";

    if (shuttered) { engaged("The exchange is closed for tonight.", "Line open. Nobody on the late shift picks up."); return; }
    if (!avail || st === "noanswer") { noAnswer(); return; }     // nobody home at this hour

    if (st === "busy") {
      engaged("The line is engaged.");
      followUp(avail);
      return;
    }
    if (idx > -1 && avail.once) S.called[entry.number + "#" + idx] = 1;

    var speakMs = avail.duration ? (avail.duration < 1000 ? avail.duration * 1000 : avail.duration) : 9000;
    var answer = function () {
      S.phoneBusy = false;
      applyFileFlags(avail, "set"); applyFileFlags(avail, "clear");       // a conversation teaches things
      if (st === "voicemail") {
        if (lineEl) lineEl.textContent = "The machine picked up. Beep.";
      } else {
        if (lineEl) lineEl.textContent = "Connected. Calling " + entry.name;
      }
      if (avail.audio || avail.jp) {
        showInlineDialogue({ speaker: avail.speaker || entry.name, jp: avail.jp || "", en: avail.en || "", audio: avail.audio, duration: avail.duration });
      }
      // the other side hangs up first, then the chat lights up: notify chimes never fight the voice
      setTimeout(function () { followUp(avail); }, speakMs + 400);
    };

    if (st === "voicemail") {
      if (lineEl) lineEl.textContent = "Ringing… ringing…";
      playSfx("ring_loop", SETTINGS.notify, function () {              // let it ring all the way out
        playSfx("ring_loop", SETTINGS.notify, function () { setTimeout(answer, PH_VM_WAIT_MS); });
      });
    } else {
      if (lineEl) lineEl.textContent = "Ringing…";
      playSfx("ring_loop", SETTINGS.notify, function () { setTimeout(answer, 900); });
    }
  }, 700);
}
function setPhoneState(txt) {
  var el = $("phone-line-state");
  if (el) el.textContent = txt;
  var d = $("phone-display"); if (d && !d.textContent) d.textContent = "";
}
function wirePhoneUI() {
  var pad = $("phone-pad"), disp = $("phone-display");
  if (pad && disp) {
    Array.prototype.slice.call(pad.querySelectorAll("button[data-key]")).forEach(function (b) {
      b.addEventListener("click", function () {
        if (disp.value.length > 18) return;               // the handset takes digits even mid-ring
        disp.value += b.dataset.key;
        if (!S.phoneBusy) playSfx("dtmf", SETTINGS.notify / 2);
      });
    });
  }
  var dial = $("phone-dial"), clr = $("phone-clear"), end = $("phone-end");
  if (dial) dial.addEventListener("click", function () {
    var v = (disp ? disp.value : "").trim();
    if (!v || S.phoneBusy) return;
    dialNumber(v);
  });
  if (clr) clr.addEventListener("click", function () { if (disp) disp.value = ""; setPhoneState("Line open."); });
  if (end) end.addEventListener("click", function () {
    stopAudio(); S.phoneBusy = false; if (disp) disp.value = "";
    setPhoneState("Line open. The receiver is off the hook.");
  });
}
// number buttons build from window.PHONES so new directory entries get a shortcut
// only numbers you have actually READ show up here. Nothing listed = nothing dialable yet.
function buildPhoneShortcuts() {
  var box = $("phone-quick"); if (!box) return;
  box.innerHTML = "<div class='ph-quick-label'>Directory</div>";
  var known = (window.PHONES || []).filter(phoneKnown);
  if (!known.length) {
    box.innerHTML += "<div class='ph-quick-empty'>Nothing in the directory.</div>";
    return;
  }
  known.forEach(function (p) {
    var b = document.createElement("button");
    b.className = "btn ph-quick-btn";
    b.textContent = p.number + "  " + (p.name || "");
    b.title = p.note || p.name || p.number;
    b.addEventListener("click", function () { $("phone-display").value = p.number; dialNumber(p.number); });
    box.appendChild(b);
  });
}


// Media player
function fmtSec(s) { s = Math.floor(s || 0); return Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2); }

function openMedia(f) {
  stopMedia(true); // Full reset of previous track & dialogue
  S.mediaFile = f;

  $("media-title").textContent = f.name + " (Media Player)";
  $("media-file").textContent = "Playing: " + f.name;

  var a = new Audio(f.src);
  a.volume = ($("media-vol").value || 80) / 100;
  S.media = a;

  function upd() { 
    $("media-time").textContent = fmtSec(a.currentTime) + " / " + (isFinite(a.duration) ? fmtSec(a.duration) : "?"); 
  }
  a.addEventListener("timeupdate", upd);
  a.addEventListener("loadedmetadata", upd);

 // When audio finishes naturally:
  a.addEventListener("ended", function () { 
    a.currentTime = 0; 
    upd(); 
    scheduleDlgFade(1500); // Dialogue fades out 1.5s after audio ends
  });

  $("media-time").textContent = "0:00 / ?";

 // Start playback & trigger dialogue in exact sync with the audio
  a.play().then(function () {
    if (f.dialogue_trigger) {
      triggerDialogue(f.dialogue_trigger, true);
      clearTimeout(S.dlgFadeTimer); // Prevent character-count from cutting it off early
    }
  }).catch(function () { 
    $("media-file").textContent = f.name + " (could not play)"; 
  });

  openApp("media");
}

function stopMedia(fullReset) {
  if (S && S.media) {
    try {
      S.media.pause();
      S.media.currentTime = 0; // Rewind to start
    } catch (e) {}

    if (fullReset) {
      S.media = null;
      S.mediaFile = null;
    }
  }

 // Cutting off early: immediately stops and removes the dialogue bar
  discardDialogue();

  var timeEl = $("media-time");
  if (timeEl && S && S.media && isFinite(S.media.duration)) {
    timeEl.textContent = "0:00 / " + fmtSec(S.media.duration);
  }
}
function renderRecycle() {
  var list = $("recycle-list");
  if (!list) return;
  if (!S.recycle) S.recycle = baseRecycle();
  list.innerHTML = "";
  S.recycle.forEach(function (f) {
    var row = mkRow(f.icon || iconFor(f), f.name);
    row.addEventListener("click", function () { S.binSel = f; markRow(row); syncFileTools(); });
    row.addEventListener("dblclick", function () { S.binSel = f; openFile(f); });
    list.appendChild(row);
  });
  if (!list.children.length) list.innerHTML = "<p style='font-size:12px;color:#555;'>The Recycle Bin is empty.</p>";
}
function syncFileTools() {
  var del = $("file-delete"), res = $("bin-restore");
  if (del) del.disabled = !S.selFile;
  if (res) res.disabled = !S.binSel;
  var nm = $("file-sel-name");                     // name the selected row, like a real status bar
  if (nm) nm.textContent = S.selFile ? S.selFile.name : "";
}
function buildCalendar() {
  var grid = $("cal-grid");
  if (grid.dataset.built === "1") return;
  grid.dataset.built = "1";
 // October 2002 starts on a Tuesday (Sun=0)
  var html = "<tr>" + ["S", "M", "T", "W", "T", "F", "S"].map(function (d) { return "<td><b>" + d + "</b></td>"; }).join("") + "</tr><tr>";
  for (var i = 0; i < 2; i++) html += "<td></td>";
  for (var d = 1; d <= 31; d++) {
    html += "<td" + (d === 14 ? ' style="background:#c00000;color:white;font-weight:bold;"' : "") + ">" + d + "</td>";
    if ((d + 2) % 7 === 0 && d !== 31) html += "</tr><tr>";
  }
  grid.innerHTML = html + "</tr>";
}


// Boot / menu screen

function showMenuChrome() {
  var n = loopCount();
  var inline = $("loop-count-inline");          // optional element, safe if removed from HTML
  if (inline) inline.textContent = String(n);
  var badge = $("loop-badge"); // optional element too
  if (badge) badge.textContent = n > 0 ? "LOOP " + (n + 1) : "";
  var ended = getCookie("night_ended");         // finished nights rename the logon; loops are optional
  showLogonTitle(ended ? morningTitle(ended) : "Last Night");
}
function startNight() {
  S.gameMin = NIGHT_START;
  S.running = true;
  S.files = baseFiles();                     // tonight's desktop contents
  S.recycle = baseRecycle();
  S.selFile = null; S.binSel = null; S.noteName = null; S.called = {}; S.phoneBusy = false;
  buildPhoneShortcuts();
  setPhoneState("Line open. The receiver is off the hook.");
  var ended = getCookie("night_ended");      // after the last night, the menu reads as morning
  if (ended) showLogonTitle(morningTitle(ended));
  playAudio("logon")
  setRainLevel(RAIN.volGame);   
  trayClock.textContent = trayStr(S.gameMin);
  browserNavigate(HOME_URL, true);
  $("logon-screen").style.display = "none";
  fireMessages(NIGHT_START);   // anything scheduled at exactly 18:00
  fireDialogue(NIGHT_START);
}


// RAIN, soft muffled background loop, crossfaded so the seam is smooth.
// File: assets/audio/rain.mp3 (falls back.wav/.ogg). Two layers alternate:
// near the end of layer A we fade A out while fading a fresh copy B in from 0.
// Muffled = lowpass filter on everything. Menu plays it quieter than gameplay.
// Tuning knobs live in RAIN below.

var RAIN = {
  name: "rain",
  exts: ["mp3", "wav", "ogg"],
  volGame: 0.45,      // night volume (master gain)
  volMenu: 0.12,      // main menu volume, quieter
  fadeSec: 2.5,       // crossfade length at the loop seam
  cutoffHz: 600       // lowpass cutoff, lower = more muffled
};
var rain = { ctx: null, master: null, lp: null, layers: [null, null], active: -1, swapping: false, level: RAIN.volMenu, disabled: false };

function rainCtx() {
  if (rain.ctx) return rain.ctx;
  var AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) { rain.disabled = true; return null; }
  rain.ctx = new AC();
  rain.lp = rain.ctx.createBiquadFilter();
  rain.lp.type = "lowpass";
  rain.lp.frequency.value = RAIN.cutoffHz;
  rain.master = rain.ctx.createGain();
  rain.master.gain.value = rain.level;
  rain.lp.connect(rain.master);
  rain.master.connect(rain.ctx.destination);
  return rain.ctx;
}

function makeRainLayer(idx, ready) {
  var ctx = rainCtx(); if (!ctx) return;
  function tryExt(i) {
    if (i >= RAIN.exts.length) { rain.disabled = true; return; }   // no file, stay silent
    var el = new Audio("assets/audio/" + RAIN.name + "." + RAIN.exts[i]);
    el.preload = "auto";
    el.addEventListener("canplaythrough", function () {
      var src = ctx.createMediaElementSource(el);
      var gain = ctx.createGain();
      gain.gain.value = 0;
      src.connect(gain); gain.connect(rain.lp);
      rain.layers[idx] = { el: el, gain: gain };
      if (ready) ready(rain.layers[idx]);
    });
    el.addEventListener("error", function () { tryExt(i + 1); });
  }
  tryExt(0);
}

function rampGain(g, target, secs) {
  var now = rain.ctx.currentTime;
  g.gain.cancelScheduledValues(now);
  g.gain.setValueAtTime(g.gain.value, now);
  g.gain.linearRampToValueAtTime(Math.max(target, 0.0001), now + secs);
}

function startRain() {
  if (rain.disabled || rain.active !== -1) return;
  makeRainLayer(0, function (L) {
    if (rain.active !== -1) return;
    L.el.play().then(function () {
      rain.active = 0;
      rampGain(L.gain, 1, 1.2);            // gentle fade-in on start
    }).catch(function () { /*do nothing if it fails */});
  });
}

function rainTick() {
  if (rain.disabled || rain.active === -1 || rain.swapping) return;
  var cur = rain.layers[rain.active];
  if (!cur || !isFinite(cur.el.duration)) return;
  var dur = cur.el.duration;
  var fade = Math.min(RAIN.fadeSec, Math.max(0.6, dur / 3));
  var remaining = dur - cur.el.currentTime;
  if (remaining > fade) return;

 // seam reached: crossfade in a fresh copy of the same file from t=0
  rain.swapping = true;
  var nextIdx = 1 - rain.active;
  makeRainLayer(nextIdx, function (N) {
    N.el.currentTime = 0;
    N.el.play().then(function () {
      rampGain(N.gain, 1, fade);      // new layer up
      rampGain(cur.gain, 0, fade);    // old layer down, same time, smooth seam
      var oldActive = rain.active;
      rain.active = nextIdx;
      setTimeout(function () {         // retire the finished layer
        try { cur.el.pause(); } catch (e) {}
        rain.layers[oldActive] = null;
        rain.swapping = false;
      }, fade * 1000 + 250);
    }).catch(function () { rain.swapping = false; });
  });
}

function setRainLevel(v) {
  rain.level = v;
  if (rain.disabled || !rain.master) return;
  var now = rain.ctx.currentTime;
  rain.master.gain.cancelScheduledValues(now);
  rain.master.gain.setValueAtTime(rain.master.gain.value, now);
  rain.master.gain.linearRampToValueAtTime(v * SETTINGS.rain / 100, now + 0.8);   // smooth menu<->game shift, scaled by slider
}

// browsers block autoplay until a user gesture, retry on the first click/key.
function rainUnlock() {
  function once() {
    document.removeEventListener("pointerdown", once);
    document.removeEventListener("keydown", once);
    if (rain.ctx && rain.ctx.state === "suspended") rain.ctx.resume();
    startRain();
  }
  document.addEventListener("pointerdown", once);
  document.addEventListener("keydown", once);
}


// Utilities

function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }


// INIT (runs once per page load, midnight reset is in-place, no reload)

window.addEventListener("DOMContentLoaded", function () {
  screenEl = $("screen"); trayClock = $("tray-clock"); chatLog = $("chat-log");
  urlBar = $("url-bar"); frame = $("browser-frame"); loadbar = $("loadbar"); loadPct = $("loadbar-pct"); statusText = $("browser-status-text");
  S = freshState();
  showMenuChrome();

 // WIN98 LOGON SCREEN, the logon IS the menu. "You" plays; others open their panel in place.
  document.querySelectorAll(".lg-user").forEach(function (u) {
    u.addEventListener("click", function () {
      var act = u.dataset.action;
      if (act === "play") startNight();
      else togglePanel("panel-" + act);   // settings / credits / about overlay the right pane
    });
  });
  $("lg-turnoff").addEventListener("click", function () {
    $("shutdown-screen").style.display = "flex";
    stopAudio();
    if (!rain.disabled && rain.ctx) rain.ctx.suspend();
  });
  $("shutdown-screen").addEventListener("click", function () {
    $("shutdown-screen").style.display = "none";
    if (!rain.disabled && rain.ctx) rain.ctx.resume();
  });

 // media player controls
 // media player controls
  $("media-play").addEventListener("click", function () {
    if (S.media && S.media.paused) {
      var atStart = S.media.currentTime === 0;
      S.media.play().then(function () {
 // If starting from the beginning, restart the dialogue in sync
        if (atStart && S.mediaFile && S.mediaFile.dialogue_trigger) {
          triggerDialogue(S.mediaFile.dialogue_trigger, true);
          clearTimeout(S.dlgFadeTimer);
        }
      }).catch(function () {});
    }
  });

  $("media-stop").addEventListener("click", function () {
    stopMedia(false); // Stops audio, rewinds to 0:00, discards dialogue, but keeps the track loaded so Play works
  });

  $("media-vol").addEventListener("input", function () { 
    if (S.media) S.media.volume = $("media-vol").value / 100; 
  });

 // file tools: delete hides things from anything reading the drive, restore puts them back
  var fd = $("file-delete"); if (fd) fd.addEventListener("click", deleteSelected);
  var br = $("bin-restore"); if (br) br.addEventListener("click", restoreSelected);
  var fn = $("file-new"); if (fn) fn.addEventListener("click", newNotepad);
  var ns = $("notepad-save"); if (ns) ns.addEventListener("click", notepadSave);
  var nn = $("notepad-new"); if (nn) nn.addEventListener("click", newNotepad);
  var cc = $("notepad-close-window"); if (cc) cc.addEventListener("click", function () { S.noteName = null; closeApp("notepad"); });

 // phone: touch-tone pad + dialled numbers from window.PHONES
  wirePhoneUI();
  buildPhoneShortcuts();

 // rain: starts on the main menu at the quieter level; gesture-unlock for autoplay rules
  startRain();
  rainUnlock();
  setInterval(rainTick, 250);

 // logon panels: Settings / Credits / About toggle over the right pane
  function togglePanel(id) {
    var p = $(id);
    ["panel-credits", "panel-about", "panel-settings"].forEach(function (other) {
      if (other !== id) $(other).style.display = "none";
    });
    p.style.display = p.style.display === "block" ? "none" : "block";
  }

 // settings sliders: init from persisted values, live-apply on drag, persist immediately
  [["vol-rain", "val-rain", "rain"], ["vol-dialogue", "val-dialogue", "dialogue"],
   ["vol-notify", "val-notify", "notify"], ["vol-crt", "val-crt", "crt"]].forEach(function (row) {
    var slider = $(row[0]), valEl = $(row[1]), key = row[2];
    slider.value = SETTINGS[key];
    valEl.textContent = SETTINGS[key] + "%";
    slider.addEventListener("input", function () {
      SETTINGS[key] = parseInt(slider.value, 10);
      valEl.textContent = SETTINGS[key] + "%";
      saveSettings();
      applySettings();
    });
  });
  applySettings();   // CRT opacity etc. from persisted settings on load

 // desktop icons: click selects, double-click opens
  document.querySelectorAll(".desktop-icons .icon").forEach(function (ic) {
    ic.addEventListener("click", function () {
      document.querySelectorAll(".icon.selected").forEach(function (x) { x.classList.remove("selected"); });
      ic.classList.add("selected");
    });
    ic.addEventListener("dblclick", function () { openApp(ic.dataset.app); });
  });
  $("screen").addEventListener("mousedown", function (e) {
    if (!e.target.closest(".icon")) document.querySelectorAll(".icon.selected").forEach(function (x) { x.classList.remove("selected"); });
  });

 // windows
  Object.keys(APPS).forEach(wireWindow);

 // start menu
  var startBtn = document.querySelector(".start-btn"), menu = $("start-menu");
  startBtn.addEventListener("click", function (e) { e.stopPropagation(); menu.classList.toggle("open"); });
  document.addEventListener("click", function (e) { if (!e.target.closest("#start-menu") && !e.target.closest(".start-btn")) menu.classList.remove("open"); });
  menu.querySelectorAll(".start-item[data-app]").forEach(function (it) {
    it.addEventListener("click", function () { menu.classList.remove("open"); openApp(it.dataset.app); });
  });
  $("menu-return").addEventListener("click", function () {
    S.running = false; stopAudio(); clearWordTimers(); clearTimeout(S.loadTimer);
    setRainLevel(RAIN.volMenu);        // quieter rain back on the menu
    menu.classList.remove("open");
    $("logon-screen").style.display = "flex";   // back to the logon (the only menu)
  });

 // browser controls
  $("nav-go").addEventListener("click", function () { browserNavigate(urlBar.value, true); });
  urlBar.addEventListener("keydown", function (e) { if (e.key === "Enter") browserNavigate(urlBar.value, true); });
  $("nav-back").addEventListener("click", function () { histNav(-1); });
  $("nav-fwd").addEventListener("click", function () { histNav(+1); });
  frame.addEventListener("load", function () {
    try {
      var doc = frame.contentDocument;
      if (doc && !doc.__wired) {
        doc.__wired = true;
        doc.addEventListener("click", frameLinkNav);
      }
    } catch (err) {}
  });

 // explorer navigation
  $("crumb-up").addEventListener("click", function () {
    S.folder = parentOf(S.folder);
    renderFiles();
  });

 // dialogue advance: click bar / spacebar
  $("dialogue-bar").addEventListener("click", advanceDialogue);
  document.addEventListener("keydown", function (e) {
    if (e.code === "Space" && S.running && document.activeElement.tagName !== "TEXTAREA" && document.activeElement.tagName !== "INPUT") {
      e.preventDefault(); advanceDialogue();
    }
  });

 // DEBUG/TEST API - headless harnesses drive the real UI through this instead of reaching
 // into engine internals that live inside this IIFE. Ships in production code, changes
 // nothing about normal play: gameplay never calls it.
  window.ENGINE = {
    version: 13,
    flagsList: function () { return Object.keys(FLAGS); },
    setSpeed: function (minPerSec) { GAME_MIN_PER_SEC = Number(minPerSec) || 0; },  // 0 = clock frozen
    getSpeed: function () { return GAME_MIN_PER_SEC; },
    time: function () { return S ? Math.floor(S.gameMin) : -1 },
    jump: function (v) {                                                  // minutes | seconds | "HH:MM"
      var m = (typeof v === "string") ? timeOf(v) : (v > 1380 ? v / 60 : v);
      S.gameMin = m;
      trayClock.textContent = trayStr(m);
      fireMessages(Math.floor(m)); fireDialogue(Math.floor(m));
    },
    midnightNow: function () { midnightFired = false; midnight(); },
    startNight: function () { startNight(); },
    loop: function () { return currentLoop(); },
    state: function () { return S; },
    won: function () { return !!(S && S.won); },
    app: function (name) { openApp(name); },
    newNote: function () { newNotepad(); },                              // File→New equivalent (forces a name prompt on save)
    go: function (url) { browserNavigate(url, true); },                    // as if typed in the address bar
    frameHtml: function () { try { return frame.srcdoc || ""; } catch (e) { return ""; } }
  };

  setInterval(tick, TICK_MS);
});
})();
