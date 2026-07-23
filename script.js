// ── STATE ──
const state = {
  lang: "python",
  ext: "py",
  isDark: true,
  isRunning: false,
};

const PLACEHOLDERS = {
  python: 'print("Hello, World!")',
  java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
  cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}',
};

// ── ELEMENTS ──
const codeEditor     = document.getElementById("codeEditor");
const lineNumbers    = document.getElementById("lineNumbers");
const lineCount      = document.getElementById("lineCount");
const fileName       = document.getElementById("fileName");
const runBtn         = document.getElementById("runBtn");
const clearBtn       = document.getElementById("clearBtn");
const clearOutputBtn = document.getElementById("clearOutputBtn");
const themeToggle    = document.getElementById("themeToggle");
const statusLang     = document.getElementById("statusLang");
const statusLines    = document.getElementById("statusLines");
const statusResult   = document.getElementById("statusResult");

const outputPlaceholder = document.getElementById("outputPlaceholder");
const outputRunning     = document.getElementById("outputRunning");
const outputResult      = document.getElementById("outputResult");
const runningLang       = document.getElementById("runningLang");
const resultBadge       = document.getElementById("resultBadge");
const resultTime        = document.getElementById("resultTime");
const resultText        = document.getElementById("resultText");


// ── INIT ──
codeEditor.value = PLACEHOLDERS.python;
updateLineNumbers();


// ── LINE NUMBERS ──
function updateLineNumbers() {
  const lines = codeEditor.value.split("\n");
  lineNumbers.innerHTML = lines.map((_, i) => i + 1).join("<br>");
  const count = lines.length;
  lineCount.textContent = `${count} ${count === 1 ? "line" : "lines"}`;
  statusLines.textContent = `Lines: ${count}`;
}

codeEditor.addEventListener("input", updateLineNumbers);

// Sync scroll between line numbers and editor
codeEditor.addEventListener("scroll", () => {
  lineNumbers.scrollTop = codeEditor.scrollTop;
});


// ── TAB KEY → 4 spaces ──
codeEditor.addEventListener("keydown", (e) => {
  if (e.key === "Tab") {
    e.preventDefault();
    const start = codeEditor.selectionStart;
    const end   = codeEditor.selectionEnd;
    codeEditor.value = codeEditor.value.substring(0, start) + "    " + codeEditor.value.substring(end);
    codeEditor.selectionStart = codeEditor.selectionEnd = start + 4;
    updateLineNumbers();
  }

  // Ctrl+Enter → Run
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    e.preventDefault();
    runCode();
  }
});


// ── LANGUAGE SELECTOR ──
document.querySelectorAll(".lang-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".lang-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    state.lang = btn.dataset.lang;
    state.ext  = btn.dataset.ext;

    codeEditor.value = PLACEHOLDERS[state.lang];
    codeEditor.placeholder = PLACEHOLDERS[state.lang];
    fileName.textContent = `📄 main.${state.ext}`;
    statusLang.textContent = `Lang: ${btn.textContent}`;

    updateLineNumbers();
    resetOutput();
  });
});


// ── THEME TOGGLE ──
themeToggle.addEventListener("click", () => {
  state.isDark = !state.isDark;
  document.body.classList.toggle("light", !state.isDark);
  themeToggle.textContent = state.isDark ? "☀️" : "🌙";
});


// ── CLEAR EDITOR ──
clearBtn.addEventListener("click", () => {
  codeEditor.value = "";
  updateLineNumbers();
  resetOutput();
});


// ── CLEAR OUTPUT ──
clearOutputBtn.addEventListener("click", resetOutput);


// ── TABS ──
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add("active");
  });
});


// ── RESET OUTPUT ──
function resetOutput() {
  outputPlaceholder.classList.remove("hidden");
  outputRunning.classList.add("hidden");
  outputResult.classList.add("hidden");
  statusResult.textContent = "Ready";
}


// ── SHOW OUTPUT ──
function showOutput(type, text, time) {
  outputPlaceholder.classList.add("hidden");
  outputRunning.classList.add("hidden");
  outputResult.classList.remove("hidden");

  resultBadge.textContent  = type === "success" ? "✓ Success" : "✗ Error";
  resultBadge.className    = `result-badge ${type}`;
  resultText.textContent   = text;
  resultText.className     = `result-text ${type}`;
  resultTime.textContent   = time ? `Executed in ${time}ms` : "";
  statusResult.textContent = type === "success" ? "✓ Last run: success" : "✗ Last run: error";

  // Switch to output tab
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
  document.querySelector('[data-tab="output"]').classList.add("active");
  document.getElementById("tab-output").classList.add("active");
}


// ── RUN CODE ──
async function runCode() {
  if (state.isRunning) return;

  const code = codeEditor.value.trim();

  if (!code) {
    showOutput("error", "Error: No code to run. Write some code first.");
    return;
  }

  // Show running state
  state.isRunning = true;
  runBtn.disabled = true;
  runBtn.innerHTML = '<span class="spinner" style="display:inline-block">⟳</span> Running...';
  outputPlaceholder.classList.add("hidden");
  outputResult.classList.add("hidden");
  outputRunning.classList.remove("hidden");
  runningLang.textContent = `Executing ${state.lang} code...`;

  // ── FUTURE: Replace this block with real API call ──
  // const response = await fetch("http://localhost:5000/api/execute", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ code, language: state.lang })
  // });
  // const data = await response.json();
  // showOutput(data.error ? "error" : "success", data.output || data.error, data.time);
  // ── END FUTURE BLOCK ──

  // Mock execution (remove when backend is ready)
  await new Promise(r => setTimeout(r, 1200));

  const execTime = Math.floor(Math.random() * 400 + 100);

  if (code.includes("print(") || code.includes("cout") || code.includes("System.out")) {
    const matches = [...code.matchAll(/["'`](.+?)["'`]/g)];
    const out = matches.length ? matches.map(m => m[1]).join("\n") : "Hello, World!";
    showOutput("success", out, execTime);
  } else if (code.toLowerCase().includes("syntaxerror") || code.includes("!!!")) {
    showOutput("error", `SyntaxError: invalid syntax\n  File "main.${state.ext}", line 1\n    ${code.split("\n")[0]}\n    ^\nSyntaxError: invalid syntax`);
  } else {
    showOutput("success", `Code executed successfully.\n\n(Connect Flask backend to see real output)\nTime: ${execTime}ms`, execTime);
  }

  // Reset run button
  state.isRunning = false;
  runBtn.disabled = false;
  runBtn.innerHTML = "▶ Run";
}


// ── RUN BUTTON ──
runBtn.addEventListener("click", runCode);