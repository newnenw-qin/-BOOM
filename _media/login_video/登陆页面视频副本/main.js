// 圆环尺寸、倾斜和滚动节奏都集中在这里，方便继续调。
const SCENE = {
  // 起始相对短边，结束相对屏宽。圆孔放下一行标题，结束时两侧卡片越出屏幕。
  radius: [0.52, 0.72],
  card: [0.074, 0.12],
  // 透视距离跟着半径走，近处卡片只是轻轻变大，不会扑到镜头前。
  perspective: [4.4, 3.5],
  tilt: [28, 18],
  thick: 5,
  spinSeconds: 140,
};

const brands = [
  ["icicle.jpg", "ICICLE"],
  ["guyu.jpg", "谷雨"],
  ["roseonly.jpg", "roseonly"],
  ["dji.jpg", "DJI"],
  ["xueersi.jpg", "学而思"],
  ["fabrique.jpg", "Fabrique"],
  ["littleswan.jpg", "小天鹅 Little Swan"],
  ["fakeme.jpg", "Fakeme"],
  ["casio.jpg", "CASIO"],
  ["joypeace.jpg", "JOY & PEACE"],
  ["fliggy.jpg", "飞猪旅行"],
  ["fanbeauty.jpg", "FANBEAUTY"],
  ["smeg.jpg", "smeg"],
  ["revive.jpg", "RéVive"],
  ["tasogare.jpg", "隅田川咖啡"],
  ["chowtaiseng.jpg", "周大生"],
  ["tautropfen.jpg", "TAUTROPFEN"],
  ["vitagreen.jpg", "维特健灵"],
  ["apple.jpg", "Apple"],
  ["tieforher.jpg", "TIE FOR HER"],
  ["bewinch.jpg", "碧云泉"],
  ["laurastar.jpg", "LAURASTAR"],
  ["thorne.jpg", "THORNE"],
];

const chapters = [
  {
    kicker: "",
    lines: ["Business is", "Booming"],
    latin: true,
    sub: "品牌、内容与商业共同发生",
  },
  {
    kicker: "服饰",
    lines: ["成衣", "与鞋履"],
    latin: false,
    sub: "放进同一套上架节奏",
  },
  {
    kicker: "珠宝",
    lines: ["金工", "与宝石"],
    latin: false,
    sub: "连着库存和订单",
  },
  {
    kicker: "影像",
    lines: ["相机", "与镜头"],
    latin: false,
    sub: "资产与发布对齐一处",
  },
  {
    kicker: "美妆",
    lines: ["护肤", "与仪容"],
    latin: false,
    sub: "配方与渠道沿同一条线",
  },
  {
    kicker: "器物",
    lines: ["家居", "与日常"],
    latin: false,
    sub: "咖啡与家电进入同一系统",
  },
  {
    kicker: "商业流程",
    lines: ["从创意", "到交付"],
    latin: false,
    sub: "品牌资产接到订单交付",
  },
];

const scene = document.getElementById("scene");
const ring = document.getElementById("ring");
const bar = document.getElementById("bar");
const hint = document.getElementById("hint");
const copyInner = document.getElementById("copy-inner");
const kicker = document.getElementById("kicker");
const title = document.getElementById("title");
const lineA = document.getElementById("line-a");
const lineB = document.getElementById("line-b");
const sub = document.getElementById("sub");

const dialog = document.getElementById("login");
const form = document.getElementById("login-form");
const fields = document.getElementById("login-fields");
const done = document.getElementById("login-done");
const note = document.getElementById("form-note");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

ring.style.setProperty("--count", String(brands.length));
ring.style.setProperty("--thick", SCENE.thick + "px");

const cardEls = [];

brands.forEach(([file, name], index) => {
  const card = document.createElement("div");
  card.className = "card";
  card.style.setProperty("--i", String(index));
  card.innerHTML = `
    <div class="face front"><img src="assets/${file}" alt="${name}" draggable="false"></div>
    <div class="face back"><img src="assets/${file}" alt="" draggable="false"></div>
    <div class="edge right"></div>
    <div class="edge left"></div>
    <div class="edge top"></div>
    <div class="edge bottom"></div>
  `;
  ring.appendChild(card);
  cardEls.push(card);
});

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function smoothstep(t) {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

function renderChapter(index) {
  const chapter = chapters[index];
  kicker.textContent = chapter.kicker;
  kicker.hidden = !chapter.kicker;
  lineA.textContent = chapter.lines[0];
  lineB.textContent = chapter.lines[1];
  sub.textContent = chapter.sub;
  sub.hidden = !chapter.sub;
  title.classList.toggle("is-latin", chapter.latin);
  title.classList.toggle("is-cjk", !chapter.latin);
}

let shown = 0;
let pending = 0;
let fadeTimer = 0;

function updateChapter(index) {
  if (index === pending) return;
  pending = index;
  if (reduceMotion) {
    shown = index;
    renderChapter(index);
    return;
  }
  copyInner.classList.add("is-fading");
  clearTimeout(fadeTimer);
  fadeTimer = setTimeout(() => {
    shown = pending;
    renderChapter(shown);
    copyInner.classList.remove("is-fading");
  }, 260);
}

let target = 0;
let current = 0;
let last = performance.now();

function readScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  target = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
}

function render(now) {
  readScroll();
  const dt = Math.min(48, now - last);
  last = now;
  if (reduceMotion) current = target;
  else current += (target - current) * (1 - Math.exp(-dt / 140));
  if (Math.abs(target - current) < 0.00004) current = target;

  const zoom = smoothstep(current / 0.96);
  const short = Math.min(window.innerWidth, window.innerHeight);
  const narrow = window.innerWidth < 800;
  const radius = narrow
    ? lerp(short * 0.48, Math.min(window.innerWidth * 0.78, short * 0.92), zoom)
    : lerp(short * SCENE.radius[0], window.innerWidth * SCENE.radius[1], zoom);
  const cardW = narrow
    ? lerp(44, 66, zoom)
    : lerp(short * SCENE.card[0], Math.min(short * SCENE.card[1], 168), zoom);
  const perspective = radius * lerp(SCENE.perspective[0], SCENE.perspective[1], zoom);
  const tilt = narrow ? lerp(40, 32, zoom) : lerp(SCENE.tilt[0], SCENE.tilt[1], zoom);
  const spin = reduceMotion ? -8 : (now / (SCENE.spinSeconds * 1000)) * 360;
  const gap = narrow ? lerp(6, 14, zoom) : lerp(0, 16, zoom);
  cardEls.forEach((card, index) => {
    const facing = Math.cos((index / brands.length) * Math.PI * 2 + (spin * Math.PI) / 180);
    card.style.setProperty("--shift", (-facing * gap).toFixed(1) + "px");
  });

  const anchor = 50;
  scene.style.setProperty("--perspective", perspective.toFixed(1) + "px");
  scene.style.perspectiveOrigin = `50% ${lerp(48, 46, zoom).toFixed(1)}%`;
  ring.style.top = anchor.toFixed(2) + "%";
  ring.style.setProperty("--radius", radius.toFixed(1) + "px");
  ring.style.setProperty("--card-w", cardW.toFixed(1) + "px");
  ring.style.setProperty("--card-h", (cardW * 1.16).toFixed(1) + "px");
  ring.style.setProperty("--tilt", tilt.toFixed(2) + "deg");
  ring.style.setProperty("--spin", spin.toFixed(3) + "deg");

  bar.style.width = (current * 100).toFixed(2) + "%";
  hint.classList.toggle("is-gone", current > 0.03);

  const index = Math.min(chapters.length - 1, Math.floor(current * chapters.length * 0.999));
  updateChapter(index);
}

function frame(now) {
  render(now);
  requestAnimationFrame(frame);
}

readScroll();
render(performance.now());
requestAnimationFrame(frame);
window.addEventListener("scroll", readScroll, { passive: true });
window.addEventListener("resize", readScroll);

function showNote(message) {
  note.hidden = false;
  note.textContent = message;
}

function resetLogin() {
  form.reset();
  note.hidden = true;
  note.textContent = "";
  fields.hidden = false;
  done.hidden = true;
}

document.getElementById("open-login").addEventListener("click", () => {
  resetLogin();
  dialog.showModal();
  emailInput.focus();
});

document.getElementById("close-login").addEventListener("click", () => dialog.close());
document.getElementById("done-close").addEventListener("click", () => dialog.close());

dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

dialog.addEventListener("close", resetLogin);

document.getElementById("forgot").addEventListener("click", () => {
  if (!emailInput.value.trim()) {
    showNote("先填写邮箱，重置说明会留在这里。");
    emailInput.focus();
    return;
  }
  showNote("这是界面演示，暂不发送重置邮件。");
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  note.hidden = true;
  if (!emailInput.checkValidity()) {
    showNote("请填写有效的邮箱。");
    emailInput.focus();
    return;
  }
  if (!passwordInput.value.trim()) {
    showNote("请填写密码。");
    passwordInput.focus();
    return;
  }
  document.getElementById("done-copy").textContent = emailInput.value.trim();
  fields.hidden = true;
  done.hidden = false;
  document.getElementById("done-close").focus();
});
