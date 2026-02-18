/* ================= CREATE WINDOW ================= */

const win = document.createElement("div");
win.id = "mahiru-window";
win.style.display = "none";

win.innerHTML = `
  <div id="mw-header">
    💬 Mahiru Chat
    <button id="mw-close">✕</button>
  </div>
  <div id="mw-body"></div>
`;

document.body.appendChild(win);

/* ================= STYLE ================= */

const style = document.createElement("style");
style.textContent = `
#mahiru-window {
  position: fixed;
  top: 120px;
  left: 120px;
  width: 380px;
  height: 520px;
  background: white;
  border-radius: 14px;
  box-shadow: 0 10px 30px rgba(0,0,0,.3);
  display: flex;
  flex-direction: column;
  resize: both;
  overflow: hidden;
  z-index: 2147483647;
  font-family: system-ui;
}

#mw-header {
  background: #4f8cff;
  color: white;
  padding: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: move;
}

#mw-body {
  flex: 1;
  overflow: hidden;
}

#mahiru-window * {
  pointer-events: auto;
}
`;
document.head.appendChild(style);

/* ================= IFRAME ================= */

const iframe = document.createElement("iframe");
iframe.src = `chrome-extension://mbhgcjbfeefpgojkbcpgpapalfmhbalp/popup.html`;
iframe.style.width = "100%";
iframe.style.height = "100%";
iframe.style.border = "none";

document.getElementById("mw-body").appendChild(iframe);

/* ================= DRAG ================= */

const header = document.getElementById("mw-header");

let drag = false, dx = 0, dy = 0;

header.onmousedown = e => {
  drag = true;
  dx = e.clientX - win.offsetLeft;
  dy = e.clientY - win.offsetTop;
};

document.onmousemove = e => {
  if (!drag) return;
  win.style.left = e.clientX - dx + "px";
  win.style.top = e.clientY - dy + "px";
};

document.onmouseup = () => drag = false;

/* ================= CLOSE BUTTON ================= */

document.getElementById("mw-close").onclick = () => {
  win.style.display = "none";
};

/* ================= TOGGLE CTRL + ~ ================= */

document.addEventListener("keydown", e => {
  if (e.ctrlKey && e.key === "`") {
    win.style.display =
      win.style.display === "none" ? "flex" : "none";
  }
});





