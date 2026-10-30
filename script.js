/* CryptoLab — all transformations run locally in the browser. */
"use strict";

const TOOLS = [
  {id:"base64",name:"Base64 Encoder / Decoder",icon:"B64",type:"ENCODING",desc:"Convert text to and from Base64 representation.",category:"Encoding",about:"Base64 represents binary data using 64 printable ASCII characters. It is reversible encoding, not encryption."},
  {id:"url",name:"URL Encoder / Decoder",icon:"%2F",type:"ENCODING",desc:"Safely encode or decode URL component text.",category:"Encoding",about:"Percent-encoding represents characters using UTF-8 bytes and %HH sequences. encodeURIComponent is designed for individual URL components."},
  {id:"binary",name:"Binary Encoder / Decoder",icon:"01",type:"ENCODING",desc:"Translate text into 8-bit binary and back.",category:"Encoding",about:"Each UTF-8 byte is displayed as an eight-character binary number. Multi-byte Unicode characters therefore use multiple groups."},
  {id:"hex",name:"Hexadecimal Encoder / Decoder",icon:"0x",type:"ENCODING",desc:"Represent text bytes in readable hexadecimal.",category:"Encoding",about:"Hexadecimal uses two digits (00–FF) to represent each UTF-8 byte. It is a convenient representation, not a security mechanism."},
  {id:"caesar",name:"Caesar Cipher",icon:"C+",type:"CLASSICAL CIPHER",desc:"Shift alphabetic characters and explore all shifts.",category:"Classical cipher",about:"The Caesar cipher shifts each English letter by a fixed number of places. Brute force is practical because there are only 25 non-zero shifts."},
  {id:"rot13",name:"ROT13",icon:"R13",type:"CLASSICAL CIPHER",desc:"Apply the reversible 13-position letter rotation.",category:"Classical cipher",about:"ROT13 rotates A–Z by 13 places. Applying it twice restores the original text. It provides no confidentiality."},
  {id:"vigenere",name:"Vigenère Cipher",icon:"VIG",type:"CLASSICAL CIPHER",desc:"Encrypt and decrypt with a repeating keyword.",category:"Classical cipher",about:"Vigenère applies a repeating sequence of Caesar shifts derived from a keyword. Non-letters are preserved and do not consume key characters."},
  {id:"morse",name:"Morse Code Translator",icon:"·−",type:"ENCODING",desc:"Translate letters, numbers and punctuation to Morse.",category:"Encoding",about:"Morse represents characters as sequences of dots and dashes. This tool separates letters with spaces and words with /."},
  {id:"sha256",name:"SHA-256 Hash Generator",icon:"#",type:"HASHING",desc:"Generate a 256-bit digest using Web Crypto.",category:"Hashing",about:"SHA-256 produces a 256-bit one-way digest. It is not encryption and cannot be decrypted. Do not use plain SHA-256 alone to store passwords."}
];

const MORSE = {
  A:".-",B:"-...",C:"-.-.",D:"-..",E:".",F:"..-.",G:"--.",H:"....",I:"..",J:".---",K:"-.-",L:".-..",M:"--",N:"-.",O:"---",P:".--.",Q:"--.-",R:".-.",S:"...",T:"-",U:"..-",V:"...-",W:".--",X:"-..-",Y:"-.--",Z:"--..",
  "0":"-----","1":".----","2":"..---","3":"...--","4":"....-","5":".....","6":"-....","7":"--...","8":"---..","9":"----.",
  ".":".-.-.-",",":"--..--","?":"..--..","'":".----.","!":"-.-.--","/":"-..-.","(":"-.--.",")":"-.--.-","&":".-... ",":":"---...",";":"-.-.-.","=":"-...-","+":".-.-.","-":"-....-","_":"..--.-",'"':".-..-.","$":"...-..-","@":".--.-."
};
const REVERSE_MORSE = Object.fromEntries(Object.entries(MORSE).map(([k,v])=>[v.trim(),k]));
const $ = (id) => document.getElementById(id);
let currentTool = null;
let toastTimer;

function renderCards(containerId, items=TOOLS) {
  const container = $(containerId);
  container.innerHTML = "";
  items.forEach(tool => {
    const card = document.createElement("article");
    card.className = "tool-card";
    card.innerHTML = `<div class="tool-card-top"><span class="tool-icon"></span><span class="tool-type"></span></div><h3></h3><p></p><button class="card-open" type="button">Open tool <span>→</span></button>`;
    card.querySelector(".tool-icon").textContent = tool.icon;
    card.querySelector(".tool-type").textContent = tool.type;
    card.querySelector("h3").textContent = tool.name;
    card.querySelector("p").textContent = tool.desc;
    card.querySelector("button").addEventListener("click", () => openTool(tool.id));
    container.appendChild(card);
  });
  if (!items.length) container.innerHTML = '<p class="muted">No tools match your search.</p>';
}

function showView(name) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  const target = $(`${name}View`);
  if (target) target.classList.add("active");
  document.querySelectorAll(".nav-item").forEach(btn => btn.classList.toggle("active", btn.dataset.view === name || (name === "tool" && btn.dataset.view === "tools")));
  $("crumbCurrent").textContent = name === "tool" ? (currentTool?.name || "Tool") : ({dashboard:"Dashboard",tools:"All tools",learn:"Learn cryptography"}[name] || name);
  $("sidebar").classList.remove("open");
  window.scrollTo({top:0,behavior:"smooth"});
}

function openTool(id) {
  const tool = TOOLS.find(t => t.id === id);
  if (!tool) return;
  currentTool = tool;
  $("toolCategory").textContent = tool.category.toUpperCase();
  $("toolTitle").textContent = tool.name;
  $("toolDescription").textContent = tool.desc;
  $("toolChip").textContent = tool.type;
  $("algorithmText").textContent = tool.about;
  $("toolInput").value = "";
  $("toolOutput").value = "";
  $("toolMessage").textContent = "";
  $("toolMessage").className = "tool-message";
  $("extraControls").innerHTML = "";
  buildControls(tool);
  buildActions(tool);
  updateCounters();
  addRecent(tool);
  showView("tool");
  $("toolInput").focus();
}

function addRecent(tool) {
  const box = $("recentTools");
  const existing = [...box.querySelectorAll("button")].filter(b => b.dataset.id !== tool.id);
  box.innerHTML = "";
  const items = [tool, ...existing.map(b => TOOLS.find(t=>t.id===b.dataset.id)).filter(Boolean)].slice(0,4);
  items.forEach(item => {
    const b = document.createElement("button");
    b.className = "recent-tool"; b.dataset.id = item.id; b.textContent = "↳  " + item.name;
    b.addEventListener("click",()=>openTool(item.id)); box.appendChild(b);
  });
}

function buildControls(tool) {
  if (tool.id === "caesar") {
    $("extraControls").innerHTML = '<div class="control-group"><label for="shiftValue">SHIFT VALUE</label><input id="shiftValue" type="number" min="1" max="25" value="3"></div>';
  } else if (tool.id === "vigenere") {
    $("extraControls").innerHTML = '<div class="control-group"><label for="cipherKey">KEYWORD</label><input id="cipherKey" type="text" maxlength="64" placeholder="e.g. LEMON" autocomplete="off"></div>';
  } else if (tool.id === "morse") {
    $("extraControls").innerHTML = '<span class="hint">Letters separated by spaces · words separated by /</span>';
  } else if (tool.id === "sha256") {
    $("extraControls").innerHTML = '<span class="hint">SHA-256 · 256-bit digest · 64 hexadecimal characters</span>';
  }
}

function actionButton(label, cls, handler) {
  const b = document.createElement("button");
  b.type="button"; b.className=`button ${cls}`; b.textContent=label; b.addEventListener("click",handler); return b;
}
function buildActions(tool) {
  const row = $("actionRow"); row.innerHTML = "";
  const transform = (mode) => () => runTool(mode);
  if (tool.id === "sha256") {
    row.append(actionButton("Generate SHA-256", "button-primary", transform("hash")));
  } else if (tool.id === "rot13") {
    row.append(actionButton("Convert", "button-primary", transform("convert")));
  } else if (tool.id === "caesar" || tool.id === "vigenere") {
    row.append(actionButton("Encrypt", "button-primary", transform("encrypt")));
    row.append(actionButton("Decrypt", "button-secondary", transform("decrypt")));
    if (tool.id === "caesar") row.append(actionButton("Brute-force all shifts", "button-ghost", bruteForceCaesar));
  } else if (tool.id === "morse") {
    row.append(actionButton("Text → Morse", "button-primary", transform("encode")));
    row.append(actionButton("Morse → Text", "button-secondary", transform("decode")));
  } else {
    row.append(actionButton("Encode", "button-primary", transform("encode")));
    row.append(actionButton("Decode", "button-secondary", transform("decode")));
  }
  if (tool.id !== "sha256") row.append(actionButton("Swap ↔", "button-ghost", swapText));
}

function updateCounters() {
  $("inputCount").textContent = `${$("toolInput").value.length} characters`;
  $("outputCount").textContent = `${$("toolOutput").value.length} characters`;
}
function message(text, success=false) {
  $("toolMessage").textContent = text;
  $("toolMessage").className = "tool-message" + (success ? " success" : "");
}
function setOutput(value) {
  $("toolOutput").value = value;
  updateCounters();
}
function validateShift() {
  const raw = $("shiftValue").value;
  const n = Number(raw);
  if (!/^\d+$/.test(raw) || !Number.isInteger(n) || n < 1 || n > 25) throw new Error("Shift must be a whole number from 1 to 25.");
  return n;
}
function caesar(text, shift) {
  return text.replace(/[a-z]/gi, ch => {
    const base = ch === ch.toUpperCase() ? 65 : 97;
    return String.fromCharCode((ch.charCodeAt(0)-base+shift+26)%26+base);
  });
}
function vigenere(text, key, decrypt=false) {
  if (!key || !/^[a-z]+$/i.test(key)) throw new Error("Enter a keyword containing English letters only (A–Z).");
  let index = 0;
  return text.replace(/[a-z]/gi, ch => {
    const base = ch === ch.toUpperCase() ? 65 : 97;
    const shift = key.toUpperCase().charCodeAt(index++ % key.length)-65;
    return String.fromCharCode((ch.charCodeAt(0)-base+(decrypt ? -shift : shift)+26)%26+base);
  });
}
function bytesToBinary(bytes) { return Array.from(bytes, b=>b.toString(2).padStart(8,"0")).join(" "); }
function binaryToBytes(text) {
  const normalized = text.trim();
  if (!normalized) return new Uint8Array();
  if (!/^[01]+(?:[\s]+[01]+)*$/.test(normalized)) throw new Error("Use only 0s and 1s, with optional spaces between bytes.");
  const groups = normalized.split(/\s+/);
  if (groups.some(g=>g.length!==8)) throw new Error("Each binary byte must contain exactly 8 bits.");
  return Uint8Array.from(groups, g=>parseInt(g,2));
}
function bytesToHex(bytes) { return Array.from(bytes,b=>b.toString(16).padStart(2,"0")).join(" "); }
function hexToBytes(text) {
  const normalized = text.trim().replace(/\s+/g,"");
  if (!normalized) return new Uint8Array();
  if (!/^[0-9a-f]+$/i.test(normalized)) throw new Error("Hexadecimal input may contain only characters 0–9 and A–F.");
  if (normalized.length%2) throw new Error("Hexadecimal input must contain an even number of digits (two per byte).");
  return Uint8Array.from(normalized.match(/.{2}/g), pair=>parseInt(pair,16));
}
function decodeUtf8(bytes) {
  try { return new TextDecoder("utf-8",{fatal:true}).decode(bytes); }
  catch { throw new Error("The decoded bytes are not valid UTF-8 text."); }
}
function base64Encode(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = ""; bytes.forEach(b=>binary+=String.fromCharCode(b));
  return btoa(binary);
}
function base64Decode(text) {
  const clean = text.replace(/\s+/g,"");
  if (clean.length%4!==0 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(clean)) throw new Error("Invalid Base64 input. Check its characters and padding.");
  const binary = atob(clean);
  return decodeUtf8(Uint8Array.from(binary,c=>c.charCodeAt(0)));
}
function morseEncode(text) {
  return text.toUpperCase().split(/\s+/).filter(Boolean).map(word=>[...word].map(ch=>{
    if (!MORSE[ch]) throw new Error(`Morse translation does not support: "${ch}".`);
    return MORSE[ch].trim();
  }).join(" ")).join(" / ");
}
function morseDecode(text) {
  const trimmed=text.trim();
  if (!trimmed) return "";
  return trimmed.split(/\s*\/\s*/).map(word=>word.trim().split(/\s+/).map(code=>{
    if (!REVERSE_MORSE[code]) throw new Error(`Unknown Morse sequence: "${code}".`);
    return REVERSE_MORSE[code];
  }).join("")).join(" ");
}
async function runTool(mode) {
  const input=$("toolInput").value;
  try {
    let output="";
    switch(currentTool.id) {
      case "base64": output=mode==="encode"?base64Encode(input):base64Decode(input); break;
      case "url":
        try { output=mode==="encode"?encodeURIComponent(input):decodeURIComponent(input); }
        catch { throw new Error("Invalid URL-encoded input. Check percent sequences such as %20."); }
        break;
      case "binary": output=mode==="encode"?bytesToBinary(new TextEncoder().encode(input)):decodeUtf8(binaryToBytes(input)); break;
      case "hex": output=mode==="encode"?bytesToHex(new TextEncoder().encode(input)):decodeUtf8(hexToBytes(input)); break;
      case "caesar": { const shift=validateShift(); output=caesar(input,mode==="encrypt"?shift:-shift); break; }
      case "rot13": output=caesar(input,13); break;
      case "vigenere": output=vigenere(input,$("cipherKey").value,mode==="decrypt"); break;
      case "morse": output=mode==="encode"?morseEncode(input):morseDecode(input); break;
      case "sha256": {
        if (!window.crypto?.subtle) throw new Error("Web Crypto is unavailable. Open this page on HTTPS or localhost in a modern browser.");
        const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(input));
        output=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,"0")).join("");
        break;
      }
    }
    setOutput(output); message("Transformation completed successfully.",true);
  } catch(err) { setOutput(""); message(err.message || "Unable to process this input."); }
}
function bruteForceCaesar() {
  const input=$("toolInput").value;
  const results=[];
  for(let shift=1;shift<=25;shift++) results.push(`Shift ${String(shift).padStart(2,"0")}: ${caesar(input,-shift)}`);
  setOutput(results.join("\n")); message("Displayed all 25 possible Caesar shifts.",true);
}
function swapText() {
  const input=$("toolInput").value, output=$("toolOutput").value;
  $("toolInput").value=output; $("toolOutput").value=input; updateCounters(); message("Input and output swapped.",true);
}
function clearTool() {
  $("toolInput").value=""; $("toolOutput").value=""; updateCounters(); message("Input and output cleared.",true); $("toolInput").focus();
}
async function copyOutput() {
  const value=$("toolOutput").value;
  if (!value) { message("There is no output to copy."); return; }
  try {
    await navigator.clipboard.writeText(value);
    message("Output copied to clipboard.",true); showToast("Output copied to clipboard");
  } catch {
    $("toolOutput").focus(); $("toolOutput").select();
    try { document.execCommand("copy"); message("Output copied to clipboard.",true); showToast("Output copied to clipboard"); }
    catch { message("Clipboard access was blocked by your browser."); }
  }
}
function showToast(text) {
  const toast=$("toast"); toast.textContent=text; toast.classList.add("show");
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>toast.classList.remove("show"),2200);
}

document.querySelectorAll("[data-view]").forEach(el=>el.addEventListener("click",()=>{
  const view=el.dataset.view;
  if (view==="tools" || view==="dashboard" || view==="learn") showView(view);
}));
$("toolInput").addEventListener("input",updateCounters);
$("toolOutput").addEventListener("input",updateCounters);
$("clearButton").addEventListener("click",clearTool);
$("copyButton").addEventListener("click",copyOutput);
$("menuToggle").addEventListener("click",()=>$("sidebar").classList.toggle("open"));
$("toolSearch").addEventListener("input",e=>{
  const q=e.target.value.trim().toLowerCase();
  renderCards("dashboardTools",TOOLS.filter(t=>(t.name+" "+t.desc+" "+t.category).toLowerCase().includes(q)));
});
document.addEventListener("keydown",e=>{
  if (e.key==="/" && !["INPUT","TEXTAREA"].includes(document.activeElement.tagName)) {e.preventDefault();$("toolSearch").focus();}
  if (e.key==="Escape") $("sidebar").classList.remove("open");
});
renderCards("dashboardTools");
renderCards("allTools");
