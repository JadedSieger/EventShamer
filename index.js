require('dotenv').config();
const iohook = require('iohook-raub');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const botName = "Yuura";
const persona = "Abrasive and very trigger-happy with insults but has a good side.";

// Gemini setup
const genAI = new GoogleGenerativeAI(process.env.g_ApiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });



// Keycode maps
const keycodeMap = {
  30: 'a', 48: 'b', 46: 'c', 32: 'd', 18: 'e', 33: 'f',
  34: 'g', 35: 'h', 23: 'i', 36: 'j', 37: 'k', 38: 'l',
  50: 'm', 49: 'n', 24: 'o', 25: 'p', 16: 'q', 19: 'r',
  31: 's', 20: 't', 22: 'u', 47: 'v', 17: 'w', 45: 'x',
  21: 'y', 44: 'z', 2: '1', 3: '2', 4: '3', 5: '4',
  6: '5', 7: '6', 8: '7', 9: '8', 10: '9', 11: '0',
  12: '-', 13: '=', 26: '[', 27: ']', 39: ';', 40: "'",
  41: '`', 43: '\\', 51: ',', 52: '.', 53: '/',
  57: ' ', 14: 'BACKSPACE', 28: '\n',
  42: 'SHIFT', 54: 'SHIFT', 58: 'CAPSLOCK'
};

const shiftMap = {
  '1': '!', '2': '@', '3': '#', '4': '$', '5': '%',
  '6': '^', '7': '&', '8': '*', '9': '(', '0': ')',
  '-': '_', '=': '+', '[': '{', ']': '}', '\\': '|',
  ';': ':', "'": '"', ',': '<', '.': '>', '/': '?',
  '`': '~'
};

// State
let isShiftDown = false;
let inputBuffer = "";
let message = "";
let finalMessages = [];
let isSpeaking = false;

// Idle timer
let idleTimer;
const IDLE_TIMEOUT_MS = 6000;

// Rate limit tracking
let lastRequestTime = 0;
let requestCountToday = 0;
const MAX_RPM = 10;
const MAX_RPD = 250;

let lastPrompt = "";

//Stop redundant requests.
function isRedundant(prompt) {
  if (prompt === lastPrompt) return true;
  lastPrompt = prompt;
  return false;
}


// ========== Timer Logic ==========
function resetIdleTimer() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    flushMessageToGemini();
  }, IDLE_TIMEOUT_MS);
}

// ========== Rate Limiting ==========
function canSendRequest() {
  const now = Date.now();

  const msSinceLast = now - lastRequestTime;
  const minInterval = 60000 / MAX_RPM; // 6000ms for 10 RPM

  if (msSinceLast < minInterval) {
    console.warn(`🕒 Rate limit: wait ${(minInterval - msSinceLast).toFixed(0)}ms`);
    return false;
  }

  if (requestCountToday >= MAX_RPD) {
    console.error(`🚫 Daily limit reached (250 requests)`);
    return false;
  }

  lastRequestTime = now;
  requestCountToday++;
  return true;
}

// ========== Gemini Trigger ==========
async function flushMessageToGemini() {
  const finalInput = message.trim();
  if (!finalInput || !canSendRequest()) return;

  message = "";
  inputBuffer = "";
  finalMessages.push(finalInput);

  const prompt = `You are "${botName}", an ${persona}.\n\nThe user just did:\n"${finalInput}"\n\nRespond accordingly in your own words. If they click too much, respond. If they speak too much, also respond. Apply some Gregory House insults from time to time and be Snarky like Asuka Langley. Don't use * and [] to describe your emotion, words are enough.`;

  if (isRedundant(prompt)) {
    console.log("⚠️ Skipped redundant prompt.");
    return;
  }

  await callGemini(prompt);
}

// ========== Keyboard ==========
iohook.on('keydown', event => {
  const code = event.keycode;
  if (code === 42 || code === 54) {
    isShiftDown = true;
    return;
  }

  let char = keycodeMap[code];
  if (!char) return;

  if (char === 'BACKSPACE') {
    inputBuffer = inputBuffer.slice(0, -1);
    message = message.slice(0, -1);
    resetIdleTimer();
    return;
  }

  if (char.length === 1) {
    char = isShiftDown
      ? (shiftMap[char] || char.toUpperCase())
      : char;
    inputBuffer += char;
    message += char;
  }

  resetIdleTimer();
});

iohook.on('keyup', event => {
  if (event.keycode === 42 || event.keycode === 54) {
    isShiftDown = false;
  }
});

// ========== Mouse ==========
iohook.on('mousedown', event => {
  const btn =
    event.button === 1 ? "left click" :
    event.button === 2 ? "right click" :
    "middle click";

  message += ` [${btn}] `;
  console.log(`🖱️ Mouse ${btn} recorded`);
  resetIdleTimer();
});

// ========== Start Listening ==========
iohook.start();
console.log("🟢 Listening for keyboard and mouse events...");

// ========== Gemini Call ==========
async function callGemini(prompt) {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response.text();
    console.log(`${botName}: ${response}`);
    speakWithYuura(response);
    return response;
  } catch (err) {
    console.error("❌ Gemini error:", err.message || err);
    return "[Gemini failed to respond]";
  }
}

//OS Monitor
const {Monitor} = require('os-monitor');  
const monitor = new Monitor();
const ONE_GB = 1024 * 1024 * 1024;

monitor.start({
  delay: 5000,
  freemem: 500 * 1024 * 1024, // 500MB threshold
  uptime: 86400,              // 1 day
  critical1: 0.9,             // 1-minute load avg
  silent: false
});


monitor.on('freemem', (data) =>{
  const memMB = (data.freemem / 1024 / 1024).toFixed(1);
  const msg = `Warning: Low memory; ${memMB}.`;
  console.log(msg);
  message += msg;
  resetIdleTimer();
});

monitor.on('loadavg1', (data) => {
  const msg = `Warning: High CPU Load; ${data.loadavg[0].toFixed(2)}`;
  console.log(msg);
  message += msg;
  resetIdleTimer();
});

monitor.on('uptime', (data) => {
const uptimeHours = (data.uptime / 3600).toFixed(1);
const msg = `System running for ${uptimeHours} hours.`;
console.log(msg);
message += msg;
resetIdleTimer();
});

//ps-list
const psList = require('ps-list').default;

let knownProcesses = new Set();
let runningCache = new Set();

// Add more to this list if needed
const IGNORED_PROCESSES = new Set([
  '[System Process]', 'System', 'Registry', 'Memory Compression',
  'smss.exe', 'csrss.exe', 'wininit.exe', 'winlogon.exe', 'services.exe',
  'lsass.exe', 'svchost.exe', 'fontdrvhost.exe', 'dwm.exe', 'spoolsv.exe',
  'atiesrxx.exe', 'atieclxx.exe', 'AGMService.exe', 'AGSService.exe',
  'sqlwriter.exe', 'unsecapp.exe', 'taskhostw.exe', 'sihost.exe',
  'jusched.exe', 'jucheck.exe', 'SearchHost.exe', 'SearchIndexer.exe',
  'RuntimeBroker.exe', 'ApplicationFrameHost.exe', 'StartMenuExperienceHost.exe',
  'Widgets.exe', 'WidgetService.exe', 'ShellHost.exe', 'ShellExperienceHost.exe',
  'CrossDeviceService.exe', 'CrossDeviceResume.exe', 'MpDefenderCoreService.exe',
  'MsMpEng.exe', 'NisSrv.exe', 'SecurityHealthSystray.exe', 'SecurityHealthService.exe',
  'TextInputHost.exe', 'ctfmon.exe', 'cmd.exe', 'conhost.exe', 'powershell.exe',
  'node.exe', 'opera_crashreporter.exe', 'GigabyteUpdateService.exe',
  'GooglePlayGamesServices.exe', 'crashpad_handler.exe', 'SDXHelper.exe',
  'PhoneExperienceHost.exe', 'Video.UI.exe', 'explorer.exe','python.exe','audiodg.exe','ffplay.exe','edge-tts.exe'
]);

async function monitorProcesses() {
  try {
    const processes = await psList();
    const current = new Set(processes.map(p => p.name));

    for (const procName of current) {
      if (!runningCache.has(procName)) {
        // Skip ignored/system processes
        if (IGNORED_PROCESSES.has(procName)) continue;

        // Found a new, non-system process
        if (!knownProcesses.has(procName)) {
          console.log(`App opened: ${procName}`);
          message += ` [opened ${procName}] `;
          knownProcesses.add(procName);
          resetIdleTimer();
          break; // 🛑 Only log one per cycle
        }
      }
    }

    runningCache = current;
  } catch (err) {
    console.error("❌ ps-list error:", err.message || err);
  }
}

setInterval(monitorProcesses, 3000);


//TTS
//child execc for RVC
const path = require("path");
const { exec } = require("child_process");

function speakWithYuura(text) {
  const pythonScript = path.join(__dirname, "tts", "infer_rvc.py");
  const quotedText = `"${text.replace(/(["\\])/g, '\\$1')}"`;
if (isSpeaking) {
    console.log("⏳ Still speaking. Ignoring input:", text);
    return; // Block until current playback ends
  }

  isSpeaking = true;

  exec(
    `python ${pythonScript} ${quotedText}`,
    {
      cwd: "C:/Programming/Retrieval-based-Voice-Conversion-WebUI" // ✅ RVC working directory
    },
    (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ RVC Error: ${error.message}`);
        return;
      }
      if (stderr) console.error(`⚠️ RVC stderr: ${stderr}`);
      console.log(stdout);

      // ✅ Playback the generated audio
      const player = require("play-sound")({ players: ["ffplay", "vlc"], ffplay: ['-nodisp','-autoexit'] });
      player.play("tts/output/yuura_final.wav", (err) => {
        if (err) console.error("🔇 Playback error:", err);
        isSpeaking = false;
      });
    }
  );
}