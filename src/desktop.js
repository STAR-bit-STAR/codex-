const companionLines = {
  pat: "摸头确认。心动粒子已生成，只对你可见。",
  dance: "检测到音乐想象信号，我先跳一段；接入系统音频后就能自动跟拍。",
  sit: "我已经坐到窗口边缘了，像 Mate Engine 那样陪你看屏幕。",
  chibi: "Q 版形态启动。乙游男主也可以很小只。",
  relax: "放松模式开启。我会安静一点，不打扰你专注。",
  summon: "收到召回，我回到桌面角落继续待机。"
};

const chatReplies = [
  "我在。你可以把我当成桌面上的同伴，而不是一个网页摆件。",
  "如果之后接入本地 LLM，我就能记住你的偏好和每日计划。",
  "今天想让我陪你专注，还是跳舞放松一下？",
  "模型槽已经准备好了，后续可以换成你的乙游角色 VRM 或 Live2D。"
];

const root = document.documentElement;
const shell = document.querySelector(".desktop-pet-shell");
const avatar = document.querySelector("#mateAvatar");
const speech = document.querySelector("#desktopSpeech");
const settingsPanel = document.querySelector("#settingsPanel");
const chatPanel = document.querySelector("#chatPanel");
const shelf = document.querySelector("#windowShelf");
const scaleRange = document.querySelector("#scaleRange");
const speedRange = document.querySelector("#speedRange");
const modelInput = document.querySelector("#modelInput");
const modelName = document.querySelector("#modelName");
const alwaysOnTop = document.querySelector("#alwaysOnTop");
const clickThrough = document.querySelector("#clickThrough");
const chatForm = document.querySelector("#chatForm");
const chatInput = document.querySelector("#chatInput");
const chatLog = document.querySelector("#chatLog");
const desktopBridge = window.desktopPet;
let dragOffset = { x: 0, y: 0 };
let dragging = false;

function say(message) {
  speech.textContent = message;
}

function setAvatarPosition(x, y) {
  const rect = avatar.getBoundingClientRect();
  const maxX = window.innerWidth - rect.width;
  const maxY = window.innerHeight - rect.height;
  avatar.style.left = `${Math.max(0, Math.min(maxX, x))}px`;
  avatar.style.top = `${Math.max(0, Math.min(maxY, y))}px`;
  avatar.style.right = "auto";
  avatar.style.bottom = "auto";
}

function clearTemporaryClasses() {
  avatar.classList.remove("patted", "dancing", "sitting", "relaxing");
  shelf.classList.remove("visible");
}

function runAction(action) {
  say(companionLines[action]);

  if (action !== "chibi") clearTemporaryClasses();

  if (action === "pat") {
    avatar.classList.add("patted");
    window.setTimeout(() => avatar.classList.remove("patted"), 1000);
  }

  if (action === "dance") avatar.classList.add("dancing");

  if (action === "sit") {
    avatar.classList.add("sitting");
    shelf.classList.add("visible");
    avatar.style.left = "auto";
    avatar.style.top = "auto";
  }

  if (action === "chibi") avatar.classList.toggle("chibi");

  if (action === "relax") avatar.classList.add("relaxing");

  if (action === "summon") {
    avatar.style.left = "auto";
    avatar.style.top = "auto";
    avatar.style.right = "140px";
    avatar.style.bottom = "82px";
  }
}

function beginDrag(event) {
  dragging = true;
  clearTemporaryClasses();
  const rect = avatar.getBoundingClientRect();
  dragOffset = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
  avatar.setPointerCapture(event.pointerId);
}

function moveDrag(event) {
  if (!dragging) return;
  setAvatarPosition(event.clientX - dragOffset.x, event.clientY - dragOffset.y);
}

function endDrag(event) {
  dragging = false;
  avatar.releasePointerCapture(event.pointerId);
}

function appendChat(role, message) {
  const line = document.createElement("p");
  line.innerHTML = `<b>${role}：</b>${message}`;
  chatLog.append(line);
  chatLog.scrollTop = chatLog.scrollHeight;
}

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => runAction(button.dataset.action));
});

document.querySelectorAll("[data-panel-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    const panel = button.dataset.panelToggle === "chat" ? chatPanel : settingsPanel;
    panel.hidden = !panel.hidden;
  });
});

document.querySelector("[data-hide]").addEventListener("click", () => {
  shell.classList.toggle("hidden-for-focus");
  desktopBridge?.setIgnoreMouseEvents(shell.classList.contains("hidden-for-focus"));
});

scaleRange.addEventListener("input", () => {
  root.style.setProperty("--pet-scale", String(Number(scaleRange.value) / 100));
});

speedRange.addEventListener("input", () => {
  root.style.setProperty("--dance-speed", String(Number(speedRange.value) / 100));
});

alwaysOnTop.addEventListener("change", () => {
  desktopBridge?.setAlwaysOnTop(alwaysOnTop.checked);
});

clickThrough.addEventListener("change", () => {
  desktopBridge?.setIgnoreMouseEvents(clickThrough.checked);
});

modelInput.addEventListener("change", () => {
  const file = modelInput.files?.[0];
  if (!file) return;
  modelName.textContent = file.name;
  say(`已读取模型槽：${file.name}。下一步接入渲染器即可加载。`);
});

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const message = chatInput.value.trim();
  if (!message) return;
  appendChat("你", message);
  appendChat("澈", chatReplies[Math.floor(Math.random() * chatReplies.length)]);
  chatInput.value = "";
});

avatar.addEventListener("click", () => runAction("pat"));
avatar.addEventListener("pointerdown", beginDrag);
avatar.addEventListener("pointermove", moveDrag);
avatar.addEventListener("pointerup", endDrag);
avatar.addEventListener("pointercancel", endDrag);

window.setInterval(() => {
  if (!document.hidden) say("我会保持置顶陪伴；如果要专注，可以打开鼠标穿透或隐藏面板。");
}, 22000);
