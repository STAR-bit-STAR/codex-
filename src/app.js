const lines = {
  pat: [
    "嗯……再摸一下也可以，只给你特权。",
    "心动值 +1，我的发型没有乱吧？",
    "被你发现了，我今天也在等你上线。"
  ],
  feed: [
    "甜点收到！下次约会我会记得回礼。",
    "这口味像夏日祭的棉花糖，很适合你。",
    "能量补满，现在可以继续陪你啦。"
  ],
  focus: [
    "我会坐在旁边守着你，25 分钟后给你奖励台词。",
    "专注模式启动。别怕，我负责把分心怪赶走。",
    "把今天的小目标交给我，我们一起完成。"
  ],
  outfit: [
    "夜游约会装已切换。要不要一起看星星？",
    "这套衣服会不会太犯规？你的表情已经告诉我答案了。",
    "换装成功，新的剧情卡片正在路上。"
  ],
  idle: [
    "点点我，我会回应你。",
    "如果累了，就让我陪你休息三分钟。",
    "今日羁绊任务还没做完，我在这里等你。"
  ],
  task: [
    "任务完成！心动手账已更新。",
    "你又向理想中的自己靠近了一点。",
    "奖励一句悄悄话：我一直都相信你。"
  ]
};

const storyFragments = [
  "“今天也辛苦了。我会把你的努力，全部记在心动手账里。”",
  "“如果世界太吵，就把我的声音当成只属于你的 BGM。”",
  "“完成任务的你很耀眼，所以今晚的星星也要让你先选。”",
  "“下次更新，我想拥有更多只对你说的表情。”"
];

const state = {
  hearts: Number(localStorage.getItem("heartScore") ?? 0),
  outfit: localStorage.getItem("petOutfit") ?? "default"
};

const pet = document.querySelector("#pet");
const petLayer = document.querySelector("#petLayer");
const speech = document.querySelector("#speech");
const heartScore = document.querySelector("#heartScore");
const bondLevel = document.querySelector("#bondLevel");
const petMood = document.querySelector("#petMood");
const storyText = document.querySelector("#storyText");
const installButton = document.querySelector("#installButton");
let deferredInstallPrompt;
let dragOffset = { x: 0, y: 0 };
let isDragging = false;

function pick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function updateStats(mood = "期待中") {
  const level = Math.max(1, Math.floor(state.hearts / 5) + 1);
  heartScore.textContent = String(state.hearts);
  bondLevel.textContent = String(level);
  petMood.textContent = mood;
  localStorage.setItem("heartScore", String(state.hearts));
}

function speak(text, mood = "心动中") {
  speech.textContent = text;
  petMood.textContent = mood;
}

function animatePet(className = "happy") {
  pet.classList.remove("happy", "focus", "bounce");
  pet.classList.add(className, "bounce");
  window.setTimeout(() => pet.classList.remove("bounce"), 560);
}

function addHearts(amount, mood) {
  state.hearts += amount;
  updateStats(mood);
}

function runAction(action) {
  const moodMap = {
    pat: "被摸摸",
    feed: "满足中",
    focus: "陪你专注",
    outfit: "约会准备"
  };
  const rewardMap = {
    pat: 1,
    feed: 2,
    focus: 3,
    outfit: 1
  };

  speak(pick(lines[action]), moodMap[action]);
  addHearts(rewardMap[action], moodMap[action]);
  animatePet(action === "focus" ? "focus" : "happy");

  if (action === "outfit") {
    state.outfit = state.outfit === "midnight" ? "default" : "midnight";
    pet.classList.toggle("midnight", state.outfit === "midnight");
    localStorage.setItem("petOutfit", state.outfit);
  }

  if (state.hearts % 4 === 0) {
    storyText.textContent = pick(storyFragments);
  }
}

function beginDrag(event) {
  isDragging = true;
  const rect = petLayer.getBoundingClientRect();
  dragOffset = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
  pet.setPointerCapture(event.pointerId);
}

function movePet(event) {
  if (!isDragging) return;
  const parentRect = document.querySelector(".workspace").getBoundingClientRect();
  const nextX = event.clientX - parentRect.left - dragOffset.x;
  const nextY = event.clientY - parentRect.top - dragOffset.y;
  petLayer.style.left = `${Math.max(0, Math.min(parentRect.width - 220, nextX))}px`;
  petLayer.style.top = `${Math.max(0, Math.min(parentRect.height - 260, nextY))}px`;
  petLayer.style.right = "auto";
  petLayer.style.bottom = "auto";
}

function endDrag(event) {
  isDragging = false;
  pet.releasePointerCapture(event.pointerId);
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("./sw.js");
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  installButton.hidden = false;
});

installButton.addEventListener("click", async () => {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = undefined;
  installButton.hidden = true;
});

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => runAction(button.dataset.action));
});

document.querySelectorAll("[data-task]").forEach((task) => {
  task.addEventListener("change", () => {
    if (!task.checked) return;
    addHearts(2, "任务达成");
    speak(pick(lines.task), "任务达成");
    storyText.textContent = pick(storyFragments);
    animatePet("happy");
  });
});

pet.addEventListener("click", () => runAction("pat"));
pet.addEventListener("pointerdown", beginDrag);
pet.addEventListener("pointermove", movePet);
pet.addEventListener("pointerup", endDrag);
pet.addEventListener("pointercancel", endDrag);

window.setInterval(() => {
  if (document.hasFocus()) speak(pick(lines.idle), "陪伴中");
}, 18000);

pet.classList.toggle("midnight", state.outfit === "midnight");
updateStats();
registerServiceWorker();
