/* ============================================================
   登录页：品牌环滚动 + 登录 → 身份建档 → 进入主应用
   ============================================================ */
(function () {
  "use strict";

  const SCENE = {
    radius: [0.52, 0.72],
    card: [0.074, 0.12],
    perspective: [4.4, 3.5],
    tilt: [28, 18],
    thick: 5,
    spinSeconds: 140,
  };

  const chapters = [
    { kicker: "", lines: ["Business is", "Booming"], latin: true, sub: "品牌、内容与商业共同发生" },
    { kicker: "服饰", lines: ["成衣", "与鞋履"], latin: false, sub: "放进同一套上架节奏" },
    { kicker: "珠宝", lines: ["金工", "与宝石"], latin: false, sub: "连着库存和订单" },
    { kicker: "影像", lines: ["相机", "与镜头"], latin: false, sub: "资产与发布对齐一处" },
    { kicker: "美妆", lines: ["护肤", "与仪容"], latin: false, sub: "配方与渠道沿同一条线" },
    { kicker: "器物", lines: ["家居", "与日常"], latin: false, sub: "咖啡与家电进入同一系统" },
    { kicker: "商业流程", lines: ["从创意", "到交付"], latin: false, sub: "品牌资产接到订单交付" },
  ];

  const ring = document.getElementById("ring");
  const scene = document.getElementById("scene");
  const bar = document.getElementById("bar");
  const hint = document.getElementById("hint");
  const copyInner = document.getElementById("copy-inner");
  const kicker = document.getElementById("kicker");
  const title = document.getElementById("title");
  const lineA = document.getElementById("line-a");
  const lineB = document.getElementById("line-b");
  const sub = document.getElementById("sub");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const brands = window.DB.loginBrands;
  ring.style.setProperty("--count", String(brands.length));
  ring.style.setProperty("--thick", SCENE.thick + "px");

  const cardEls = [];
  brands.forEach(([file, name], index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.style.setProperty("--i", String(index));
    card.innerHTML = `
      <div class="face front"><img src="./assets/${file}" alt="${name}" draggable="false"></div>
      <div class="face back"><img src="./assets/${file}" alt="" draggable="false"></div>
      <div class="edge right"></div>
      <div class="edge left"></div>
      <div class="edge top"></div>
      <div class="edge bottom"></div>
    `;
    ring.appendChild(card);
    cardEls.push(card);
  });

  function lerp(a, b, t) { return a + (b - a) * t; }
  function smoothstep(t) { const x = Math.min(1, Math.max(0, t)); return x * x * (3 - 2 * x); }

  function renderChapter(index) {
    const c = chapters[index];
    kicker.textContent = c.kicker;
    kicker.hidden = !c.kicker;
    lineA.textContent = c.lines[0];
    lineB.textContent = c.lines[1];
    sub.textContent = c.sub;
    sub.hidden = !c.sub;
    title.classList.toggle("is-latin", c.latin);
    title.classList.toggle("is-cjk", !c.latin);
  }

  let shown = 0, pending = 0, fadeTimer = 0;
  function updateChapter(index) {
    if (index === pending) return;
    pending = index;
    if (reduceMotion) { shown = index; renderChapter(index); return; }
    copyInner.classList.add("is-fading");
    clearTimeout(fadeTimer);
    fadeTimer = setTimeout(() => {
      shown = pending;
      renderChapter(shown);
      copyInner.classList.remove("is-fading");
    }, 260);
  }

  let target = 0, current = 0, last = performance.now();
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

    scene.style.setProperty("--perspective", perspective.toFixed(1) + "px");
    scene.style.perspectiveOrigin = `50% ${lerp(48, 46, zoom).toFixed(1)}%`;
    ring.style.top = "50%";
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

  function frame(now) { render(now); requestAnimationFrame(frame); }
  readScroll();
  render(performance.now());
  requestAnimationFrame(frame);
  window.addEventListener("scroll", readScroll, { passive: true });
  window.addEventListener("resize", readScroll);

  /* ---------------- 身份建档 ---------------- */
  const onboarding = document.getElementById("onboarding");
  const loginScreen = document.getElementById("login-screen");
  const app = document.getElementById("app");

  function chips(container, items, opts) {
    container.innerHTML = "";
    items.forEach((it) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ob-chip";
      btn.dataset.value = it.id || it;
      const html = opts && opts.desc
        ? `<span class="c-ico">${it.icon || ""}</span><span class="c-name">${it.name}</span><span class="c-desc">${it.desc || ""}</span>`
        : `<span class="c-ico">${it.icon || ""}</span><span class="c-name">${it.name || it}</span>`;
      btn.innerHTML = html;
      btn.addEventListener("click", () => {
        const multi = container.dataset.multi === "1";
        if (multi) {
          btn.classList.toggle("is-on");
        } else {
          [...container.children].forEach((c) => c.classList.remove("is-on"));
          btn.classList.add("is-on");
        }
        onRoleMaybe(container);
      });
      container.appendChild(btn);
    });
  }

  function onRoleMaybe(container) {
    if (container.id === "ob-roles") {
      const sel = container.querySelector(".is-on");
      document.getElementById("ob-agency-field").hidden = !(sel && sel.dataset.value === "agency");
    }
  }

  function currentValue(container) {
    const on = [...container.querySelectorAll(".is-on")].map((c) => c.dataset.value);
    return on;
  }

  function showOnboarding() {
    onboarding.hidden = false;
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);

    // 按 行业 / 角色 / 市场 分别填充
    const ind = document.getElementById("ob-industries");
    const rol = document.getElementById("ob-roles");
    const mkt = document.getElementById("ob-markets");
    ind.dataset.multi = "0";
    rol.dataset.multi = "0";
    mkt.dataset.multi = "1";
    chips(ind, window.DB.industries);
    chips(rol, window.DB.roles, { desc: true });
    chips(mkt, window.DB.markets);

    // 默认选中：服饰 / 成熟品牌 / 中国内地
    [...ind.children].find((c) => c.dataset.value === "fashion")?.classList.add("is-on");
    [...rol.children].find((c) => c.dataset.value === "brand")?.classList.add("is-on");
    [...mkt.children].find((c) => c.dataset.value === "中国内地")?.classList.add("is-on");
    document.getElementById("ob-agency-field").hidden = true;
  }

  function readProfile() {
    const ind = currentValue(document.getElementById("ob-industries"))[0] || "fashion";
    const rol = currentValue(document.getElementById("ob-roles"))[0] || "brand";
    const mkt = currentValue(document.getElementById("ob-markets"));
    const industry = (window.DB.industries.find((x) => x.id === ind) || {}).name || "服饰";
    const role = (window.DB.roles.find((x) => x.id === rol) || {}).name || "成熟品牌";
    return {
      name: document.getElementById("ob-name").value.trim() || "AURORA & ASH 晨曦与灰",
      industryId: ind,
      industry,
      roleId: rol,
      role,
      markets: mkt.length ? mkt : ["中国内地"],
      stores: parseInt(document.getElementById("ob-stores").value, 10) || 1,
      plan: rol === "sme" ? "free" : rol === "agency" ? "attribution" : "insight",
    };
  }

  function enter(profile) {
    try { localStorage.setItem("mirra.profile", JSON.stringify(profile)); } catch (e) {}
    onboarding.hidden = true;
    loginScreen.hidden = true;
    app.hidden = false;
    document.body.style.overflow = "";
    window.scrollTo(0, 0);
    if (window.MirraStartup) window.MirraStartup(profile);
  }

  // 登录按钮：自动进入（无需账号密码）
  document.getElementById("open-login").addEventListener("click", () => {
    let saved = null;
    try { saved = localStorage.getItem("mirra.profile"); } catch (e) {}
    if (saved) {
      try { enter(JSON.parse(saved)); return; } catch (e) {}
    }
    showOnboarding();
  });

  document.getElementById("ob-go").addEventListener("click", () => enter(readProfile()));
  document.getElementById("ob-skip").addEventListener("click", () => {
    enter({
      name: "AURORA & ASH 晨曦与灰", industryId: "fashion", industry: "服饰",
      roleId: "brand", role: "成熟品牌", markets: ["中国内地"], stores: 1, plan: "insight",
    });
  });
})();