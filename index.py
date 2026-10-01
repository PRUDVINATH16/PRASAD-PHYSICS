from pathlib import Path

html = r'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Human vs Camera Text Test</title>
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    min-height: 100vh;
    background: #111;
    color: #eee;
    font-family: Arial, sans-serif;
    display: flex;
    flex-direction: column;
  }

  header {
    padding: 14px 18px;
    border-bottom: 1px solid #333;
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
  }

  header strong { font-size: 16px; }

  input, button, select {
    background: #222;
    color: #eee;
    border: 1px solid #555;
    border-radius: 6px;
    padding: 7px 9px;
  }

  button { cursor: pointer; }
  button:hover { background: #333; }

  .stage {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 35px 20px;
    overflow: hidden;
  }

  .document {
    width: min(900px, 94vw);
    min-height: 500px;
    background: white;
    color: black;
    padding: 70px;
    border-radius: 3px;
    box-shadow: 0 0 35px #000;
  }

  #protectedText {
    font-family: Georgia, "Times New Roman", serif;
    font-size: 32px;
    line-height: 1.65;
    letter-spacing: 0px;
    font-weight: 500;
    user-select: none;
  }

  .word {
    display: inline-block;
    transition: transform 0s;
  }

  .info {
    position: fixed;
    bottom: 12px;
    left: 12px;
    background: rgba(0,0,0,.75);
    padding: 8px 10px;
    border-radius: 5px;
    font-size: 12px;
    color: #bbb;
  }

  @media (max-width: 650px) {
    .document { padding: 30px; min-height: 400px; }
    #protectedText { font-size: 22px; }
  }
</style>
</head>
<body>

<header>
  <strong>Human vs Camera Experiment</strong>

  <label>
    Mode:
    <select id="mode">
      <option value="normal">Normal</option>
      <option value="temporal">Temporal shift</option>
      <option value="jitter">Micro position</option>
      <option value="combined">Combined</option>
    </select>
  </label>

  <label>
    Speed:
    <input id="speed" type="range" min="20" max="200" value="70">
  </label>

  <label>
    Strength:
    <input id="strength" type="range" min="0" max="10" value="3">
  </label>

  <button id="pause">Pause</button>
</header>

<div class="stage">
  <div class="document">
    <div id="protectedText">
      CONFIDENTIAL REPORT<br><br>
      This document contains sensitive information intended
      only for authorized readers. The text should remain easy
      for a person to read while we test whether a camera can
      reproduce the same visual information accurately.
      <br><br>
      The quick brown fox jumps over the lazy dog.
      <br><br>
      Human readability is the primary requirement.
    </div>
  </div>
</div>

<div class="info" id="status">Mode: Normal</div>

<script>
const text = document.getElementById("protectedText");
const mode = document.getElementById("mode");
const speed = document.getElementById("speed");
const strength = document.getElementById("strength");
const pause = document.getElementById("pause");
const status = document.getElementById("status");

let words = [];
let timer = null;
let frame = 0;
let running = true;

function prepareWords() {
  // Preserve <br> elements while wrapping text words.
  const nodes = [...text.childNodes];
  text.innerHTML = "";

  nodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      const parts = node.textContent.split(/(\s+)/);
      parts.forEach(part => {
        if (/^\s+$/.test(part)) {
          text.appendChild(document.createTextNode(part));
        } else if (part) {
          const span = document.createElement("span");
          span.className = "word";
          span.textContent = part;
          text.appendChild(span);
          words.push(span);
        }
      });
    } else {
      text.appendChild(node.cloneNode(true));
    }
  });
}

function reset() {
  words.forEach(w => {
    w.style.transform = "translate(0,0)";
    w.style.opacity = "1";
    w.style.filter = "none";
  });
}

function render() {
  if (!running) return;

  const m = mode.value;
  const s = Number(strength.value);

  frame++;

  words.forEach((word, i) => {
    let x = 0;
    let y = 0;

    if (m === "temporal" || m === "combined") {
      // Alternates between two very close positions.
      const phase = (frame + i * 3) % 2;
      x += phase ? s * 0.55 : -s * 0.55;
      y += phase ? s * 0.18 : -s * 0.18;
    }

    if (m === "jitter" || m === "combined") {
      // Different words move by tiny amounts.
      const phase = (frame * 7 + i * 11) % 5;
      x += (phase - 2) * s * 0.18;
      y += (((phase * 3) % 5) - 2) * s * 0.12;
    }

    word.style.transform = `translate(${x}px, ${y}px)`;
  });

  status.textContent =
    `Mode: ${m} | Strength: ${s} | Animation: ${running ? "ON" : "OFF"}`;
}

function restart() {
  clearInterval(timer);
  const interval = Number(speed.value);
  timer = setInterval(render, interval);
}

mode.addEventListener("change", () => {
  reset();
  restart();
});

speed.addEventListener("input", restart);
strength.addEventListener("input", render);

pause.addEventListener("click", () => {
  running = !running;
  pause.textContent = running ? "Pause" : "Resume";
  if (running) restart();
  else reset();
  render();
});

prepareWords();
restart();
</script>
</body>
</html>
'''

path = Path("/mnt/data/human_vs_camera_test.html")
path.write_text(html, encoding="utf-8")
print(f"Created: {path}")
