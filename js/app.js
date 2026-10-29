/* ============================================================
   主应用逻辑：模块渲染、权限分级、付费解锁、交互
   ============================================================ */
(function () {
  "use strict";

  const DB = window.DB;
  const S = { profile: null, module: "prism", adoptedBeats: [] };
  const UI = {
    touchTab: "talents",
    soundTab: "matrix",
    negDays: "30", negCat: "all", negChan: "all",
    negWord: null,
    spillOverride: {},
    schedule: null,
    crossLang: "en",
    convPlat: "tmall",
    briefTrend: "oldmoney",
    briefVar: "dry",
    briefSources: ["Instagram", "TikTok", "Pinterest", "Vogue Runway", "海外博客"],
    briefCat: "all",
    avoidRisks: [],
    prismTab: "briefing",
    mapSel: null,
  };

  const $ = (id) => document.getElementById(id);

  const RISK_TERMS = {
    "英国": ["大象", "山羊", "雄鸡", "孔雀"],
    "德国": ["纳粹"],
    "日本": ["绿色", "黑白"],
    "中东": ["酒精", "猪肉", "暴露"],
    "泰国": ["褐色"],
    "法国": ["墨绿", "核桃", "纸花"],
    "欧美": ["星期五"],
  };

  const PLAN_RANK = { free: 0, insight: 1, attribution: 2 };
  const tierLabel = { head: "头肩", waist: "腰部", koc: "KOC" };
  const tierColor = { head: "#C0392B", waist: "#B07C2F", koc: "#3A7D44" };

  // 达人转化效率分（0-100，越高转化越强）
  const talentConv = {
    "林屿Lin": 78, "陈默穿搭日记": 80, "顾清和": 62, "七月的通勤包": 92,
    "大圆脸也能穿": 88, "韩系衣柜Hanna": 91, "轻奢冷静期": 95, "小满的衣帽间": 93,
    "打工人的体面": 94, "一周穿搭不重样": 86, "阿May的轻奢清单": 97,
  };
  // 艺人元数据：转化效率 + 舆情指数 + 舆情说明
  const starMeta = {
    "鹿野 Sen":    { conv: 58, sentiment: 90, sentNote: "舆情稳定，无重大负面" },
    "周绵绵 Mian": { conv: 72, sentiment: 78, sentNote: "舆情稳定" },
    "陈一白 Yibai": { conv: 70, sentiment: 94, sentNote: "口碑良好，无负面" },
    "林小满 SUM":  { conv: 75, sentiment: 66, sentNote: "轻微争议可控，建议关注" },
    "江照 Moon":   { conv: 85, sentiment: 32, sentNote: "近期负面舆情发酵（机场接机冲突），负面声量 +186%" },
  };
  // 筛选状态（达人库 / 明星素材库）
  const talentF = { budget: 0, fans: "all", conv: "all" };
  const starF = { budget: 0, fans: "all", conv: "all" };

  /* ---------------- 通用工具 ---------------- */

  function unlocked(level) {
    if (!S.profile) return true;
    return PLAN_RANK[S.profile.plan] >= PLAN_RANK[level];
  }

  function isAgency() { return S.profile && S.profile.roleId === "agency"; }

  // 数值解析：粉丝量(万) / 报价下限(元)
  function wanNum(s) { const m = String(s).replace(/[,，]/g, "").match(/\d+(\.\d+)?/); return m ? parseFloat(m[0]) : 0; }
  function priceMin(s) { const m = String(s).replace(/[¥,，\s]/g, "").match(/\d+(\.\d+)?/); return m ? parseFloat(m[0]) : 0; }
  function fansTier(w) { if (w < 10) return "lt10"; if (w < 100) return "10to100"; if (w < 500) return "100to500"; return "gt500"; }
  function convTier(c) { if (c >= 90) return "high"; if (c >= 70) return "mid"; return "low"; }
  function convColor(c) { return c >= 90 ? "#3A7D44" : c >= 70 ? "#B07C2F" : "#C0392B"; }
  function money(n) { return Number(n).toLocaleString("en-US"); }

  function toast(msg) {
    const t = $("toast");
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(t._t);
    t._t = setTimeout(() => { t.hidden = true; }, 2200);
  }

  function openDrawer(title, html) {
    const d = $("drawer");
    d.innerHTML = `
      <div class="dr-head"><div class="panel-title">${title}</div>
      <button class="dr-close" data-close>✕</button></div>
      <div class="dr-body">${html}</div>`;
    d.hidden = false;
  }
  function closeDrawer() { $("drawer").hidden = true; $("drawer").innerHTML = ""; }

  function openModal(html) {
    const m = $("modal");
    m.innerHTML = `<div class="md-box">${html}</div>`;
    m.hidden = false;
    m.onclick = (e) => { if (e.target === m) closeModal(); };
  }
  function closeModal() { $("modal").hidden = true; $("modal").innerHTML = ""; }

  function lockWrap(level, featureName, innerHtml) {
    if (unlocked(level)) return innerHtml;
    return `<div class="locked-wrap">
      <div class="lock-cover" data-unlock="${level}" data-feature="${featureName}">
        <span class="lk-ico">🔒</span>
        <span class="lk-txt">${featureName} · 升级解锁</span>
      </div>${innerHtml}</div>`;
  }

  function donut(items) {
    const r = 62, sw = 20;
    const view = 2 * (r + sw / 2 + 6);
    const cx = view / 2, cy = view / 2;
    const C = 2 * Math.PI * r;
    let acc = 0;
    const segs = items.map((it) => {
      const len = (C * it.pct) / 100;
      const seg = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${it.color}" stroke-width="${sw}"
        stroke-dasharray="${len.toFixed(2)} ${(C - len).toFixed(2)}" stroke-dashoffset="${(-acc).toFixed(2)}"/>`;
      acc += len;
      return seg;
    }).join("");
    return `<svg viewBox="0 0 ${view} ${view}">${segs}</svg>`;
  }

  function paywallModal(featureName) {
    const cards = DB.plans.map((p) => {
      const cur = S.profile.plan === p.id;
      const features = p.features.map((f) => `<li>· ${f}</li>`).join("");
      return `<div class="plan-card ${cur ? "is-current" : ""}">
        ${cur ? '<span class="badge red current-tag">当前</span>' : ""}
        <div class="p-name">${p.name}</div>
        <div class="p-price" style="color:${p.color}">${p.price}</div>
        <ul class="p-ul">${features}</ul>
        ${cur ? '<button class="btn small" disabled style="opacity:.5">已开通</button>'
              : `<button class="btn primary small" data-upgrade="${p.id}">升级到「${p.name}」</button>`}
      </div>`;
    }).join("");
    openModal(`
      <div style="display:flex;justify-content:space-between;align-items:start">
        <div><h3>${featureName || "解锁更多能力"}</h3>
        <p class="md-sub">按需订阅，随时升级；演示中点击即可生效</p></div>
        <button class="btn ghost small" data-close-modal>✕ 关闭</button>
      </div>
      <div class="plan-grid">${cards}</div>`);
  }

  function upgradeTo(planId) {
    S.profile.plan = planId;
    try { localStorage.setItem("mirra.profile", JSON.stringify(S.profile)); } catch (e) {}
    closeModal();
    toast("已升级套餐，功能解锁");
    render();
  }

  /* ---------------- 通用组件函数 ---------------- */

  // 严重度 → 红色深度（1~5）
  function sevColor(sev) {
    const a = [0.22, 0.38, 0.55, 0.76, 1][Math.max(0, Math.min(4, (sev || 1) - 1))];
    return `rgba(192, 57, 43, ${a})`;
  }
  // 频率 → 字号
  function nwFontSize(freq) { return Math.min(40, Math.max(13, 13 + freq * 0.42)); }
  // 迷你折线 sparkline
  function sparklineSvg(vals, color) {
    const w = 200, h = 34, pad = 2;
    const max = Math.max(...vals), min = Math.min(...vals);
    const pts = vals.map((v, i) => {
      const x = pad + (i / (vals.length - 1)) * (w - pad * 2);
      const y = h - pad - ((v - min) / (max - min || 1)) * (h - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
    const last = vals[vals.length - 1];
    return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" class="sparkline">
      <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
      <circle cx="${(w - pad).toFixed(1)}" cy="${(h - pad - ((last - min) / (max - min || 1)) * (h - pad * 2)).toFixed(1)}" r="2.5" fill="${color}"/>
    </svg>`;
  }

  /* ---------------- 启动 ---------------- */

  window.MirraStartup = function (profile) {
    S.profile = profile;
    // 顶栏用户信息
    const name = profile.name || "AURORA & ASH";
    $("user-name").textContent = name;
    const ua = $("user-avatar");
    ua.textContent = "";
    ua.style.background = "url('./assets/aurora-badge.jpg') center/cover no-repeat #F4EFE8";
    ua.style.backgroundSize = "cover";
    const planName = (DB.plans.find((p) => p.id === profile.plan) || {}).name || "基础免费";
    $("user-role").textContent = `${profile.role} · ${planName}`;
    // 行业
    $("industry-name").textContent = profile.industry || "服饰";
    buildIndustryMenu();
    buildBell();

    // 代理商 → 显示多品牌切换 + 解锁策略后台
    const brandSwitch = $("brand-switch");
    if (isAgency()) {
      brandSwitch.hidden = false;
      const strat = document.querySelector('[data-module="strategy"]');
      strat.classList.remove("is-locked");
      strat.querySelector(".sb-ico").innerHTML = '<img src="./assets/sidebar/nav-6.jpg" alt="策略">';
    } else {
      brandSwitch.hidden = true;
      const strat = document.querySelector('[data-module="strategy"]');
      strat.classList.add("is-locked");
      strat.querySelector(".sb-ico").innerHTML = '<img src="./assets/sidebar/nav-6.jpg" alt="策略">';
    }

    $("module-view").innerHTML = "";
    navigate("prism");
  };

  function navigate(id) {
    const map = {
      prism: "洞察 Prism", touch: "触点 Touchpoint", sound: "声场 Soundfield",
      echo: "回声 Echo", biz: "商业平台跳转", strategy: "平台策略后台", settings: "品牌档案 · 设置",
    };
    if (id === "strategy" && !isAgency()) {
      openStrategyLock(); return;
    }
    S.module = id;
    $("tb-breadcrumb").textContent = id === "deepdive" ? "回声 Echo · 归因深度拆解" : (map[id] || "");
    const navActive = id === "deepdive" ? "echo" : id;
    document.querySelectorAll(".sb-item").forEach((b) => b.classList.toggle("active", b.dataset.module === navActive));
    const view = $("module-view");
    view.innerHTML = RENDER[id] ? RENDER[id]() : "";
    if (MOUNT[id]) MOUNT[id]();
    view.scrollTop = 0;
  }

  function openStrategyLock() {
    openModal(`
      <div style="display:flex;justify-content:space-between;align-items:start">
        <h3>平台策略后台</h3>
        <button class="btn ghost small" data-close-modal>✕</button>
      </div>
      <p class="md-sub">该后台仅对「平台运营」与「代理商」角色开放</p>
      <div style="font-size:13.5px;line-height:1.8;color:var(--muted)">
        包含付费分级管理、行业定价、数据看板与商家运营工具。<br>
        演示中可在「设置 → 品牌档案」将身份切换为 <b>代理商</b> 后进入。
      </div>`);
  }

  /* ---------------- 顶栏交互 ---------------- */

  function buildIndustryMenu() {
    const menu = $("industry-menu");
    menu.innerHTML = DB.industries.map((ind) =>
      `<button data-industry="${ind.id}" class="${ind.id === S.profile.industryId ? "is-on" : ""}">${ind.name}</button>`
    ).join("");
    $("industry-switch").onclick = () => { menu.hidden = !menu.hidden; };
    menu.onclick = (e) => {
      const btn = e.target.closest("button[data-industry]");
      if (!btn) return;
      const ind = DB.industries.find((x) => x.id === btn.dataset.industry);
      S.profile.industryId = ind.id; S.profile.industry = ind.name;
      try { localStorage.setItem("mirra.profile", JSON.stringify(S.profile)); } catch (e2) {}
      $("industry-name").textContent = ind.name;
      menu.hidden = true;
      toast(`已切换行业：${ind.name}（演示内容以服饰数据呈现）`);
    };
    document.addEventListener("click", (e) => {
      if (!e.target.closest("#industry-switch") && !e.target.closest("#industry-menu")) menu.hidden = true;
    });
  }

  function buildBell() {
    const panel = $("bell-panel");
    const notices = [
      { level: "high", time: "20:14", ico: "🚨", msg: "「怎么买」刷屏 12 条，建议挂车笔记置顶" },
      { level: "mid", time: "20:02", ico: "📉", msg: "直播每分钟掉人 18%，建议加热直播间流量" },
      { level: "info", time: "今天", ico: "🔥", msg: "「静奢风」搜索量周环比 +38%，已同步至内容节拍" },
      { level: "info", time: "昨天", ico: "📦", msg: "蒲公英待接单达人 3 位，请及时处理" },
    ];
    panel.innerHTML = `<h4>告警提示</h4>` + notices.map((n) =>
      `<div class="notice ${n.level}"><span class="n-ico">${n.ico}</span>
       <div><div class="n-msg">${n.msg}</div><div class="n-time">${n.time}</div></div></div>`
    ).join("");
    $("bell").onclick = () => {
      panel.hidden = !panel.hidden;
      $("bell-dot").style.opacity = panel.hidden ? "1" : "0";
    };
    document.addEventListener("click", (e) => {
      if (!e.target.closest("#bell") && !e.target.closest("#bell-panel")) panel.hidden = true;
    });
    $("brand-switch").onclick = () => toast("代理商模式：可在此切换托管品牌（演示）");
  }

  /* ============================================================
     模块渲染
     ============================================================ */

  /* ---------- 棱镜 · 洞察 ---------- */
  function renderPrism() {
    const trend = DB.trendTimeline;
    const hero = trend[0];
    const timeline = trend.map((t, i) => `
      <div class="tl-item${i === 0 ? " is-now" : ""}">
        <span class="tl-dot"></span>
        <span class="tl-week">${t.week}</span>
        <div class="tl-body">
          <div class="tl-hot">${t.hot}${i === 0 ? '<span class="tl-now-tag">本周</span>' : ""}</div>
          <div class="tl-kws">${t.keywords.map((k) => `<span class="badge gray">${k}</span>`).join("")}</div>
          <div class="tl-insight">${t.insight}</div>
        </div>
      </div>`).join("");

    const crowds = DB.crowds.map((c) => `
      <div class="panel crowd-card" data-crowd="${c.name}">
        <div class="c-top">
          <div class="c-ico" style="background:${c.color}18;color:${c.color}">${c.icon}</div>
          <span class="badge ${c.trend.startsWith("+") ? "green" : "red"}">${c.trend}</span>
        </div>
        <div class="c-name">${c.name}</div>
        <div class="c-count">${c.count}</div>
        <div class="c-tags">${c.tags.map((t) => `<span class="badge gray">${t}</span>`).join("")}</div>
        <div class="c-desc">${c.desc}</div>
      </div>`).join("");

    const spill = DB.spillover.map((s) => {
      const total = s.station + s.tmall + s.jd + s.vip;
      const segs = [
        { c: "#3A7D44", v: s.station, n: "站内" }, { c: "#C0392B", v: s.tmall, n: "天猫" },
        { c: "#2C6FA6", v: s.jd, n: "京东" }, { c: "#B07C2F", v: s.vip, n: "唯品会" },
      ].map((x) => `<span class="bar-seg" style="flex:${x.v};background:${x.c}" title="${x.n} ${Math.round(x.v / total * 100)}%"></span>`).join("");
      const ov = UI.spillOverride[s.cat];
      return `<tr data-spill="${s.cat}" title="点击查看外溢依据">
        <td><div class="sp-cat">${s.cat}</div>${ov ? `<span class="sp-tag">已手动覆盖</span>` : ""}</td>
        <td><div class="sp-bar"><div class="bar-track">${segs}</div><div class="sp-pct">站内 ${s.station}% · 站外 ${100 - s.station}%</div></div></td>
        <td style="font-size:12px;color:var(--muted)">${ov || s.advise}</td>
      </tr>`;
    }).join("");

    const heroDelta = (hero.insight.match(/[＋+]\d+(\.\d+)?%/g) || ["+38%"])[0];
    const kpis = [
      { label: "兴趣人群", val: (DB.crowds[0].count || "").replace("人", ""), delta: DB.crowds[0].trend, up: DB.crowds[0].trend.startsWith("+"), note: "近7天升温" },
      { label: "品类新客", val: (DB.crowds[1].count || "").replace("人", ""), delta: DB.crowds[1].trend, up: DB.crowds[1].trend.startsWith("+"), note: "周环比" },
      { label: "竞品流入", val: (DB.crowds[2].count || "").replace("人", ""), delta: DB.crowds[2].trend, up: DB.crowds[2].trend.startsWith("+"), note: "周环比" },
      { label: "本周热词", val: hero.hot, delta: heroDelta, up: true, note: "搜索周环比" },
    ];
    const kpiRow = kpis.map((k) => `
      <div class="metric">
        <div class="m-label">${k.label}</div>
        <div class="m-val">${k.val}</div>
        <div class="m-delta ${k.up ? "up" : "down"}">${k.delta} <span class="m-note">${k.note}</span></div>
      </div>`).join("");

    const globalTab = renderGlobal();

    return `
      <div class="page-head">
        <p class="kicker">探索潜在与未知 · 洞察</p>
        <h2>洞察</h2>
        <p class="desc">站内趋势、人群资产与跨域信号，帮你看见「此刻该做什么」。</p>
      </div>

      <div class="tabs" id="prism-tabs" style="margin-bottom:22px">
        <button class="${UI.prismTab === "briefing" ? "is-on" : ""}" data-tab="briefing">全球趋势早报</button>
        <button class="${UI.prismTab === "domestic" ? "is-on" : ""}" data-tab="domestic">国内洞察</button>
        <button class="${UI.prismTab === "global" ? "is-on" : ""}" data-tab="global">出海趋势</button>
      </div>

      <div id="prism-domestic" ${UI.prismTab === "domestic" ? "" : "hidden"}>
        <div class="metric-row kpi-row">${kpiRow}</div>

        <div class="dom-sec" style="margin-top:0">
          ${secHead("01", "本周核心洞察", "热词与搜索信号一览")}
          <div class="insight-hero">
            <div class="ih-main">
              <div class="ih-kicker">本周核心洞察 · ${hero.week}</div>
              <div class="ih-title">${hero.insight}</div>
              <div class="ih-desc">热词「${hero.hot}」正在拉升品类声量。建议抓住 ${[hero.hot, ...hero.keywords.filter((k) => k !== hero.hot)].join("、")} 的搜索增量，提前一周布局笔记与投流节奏。</div>
              <div class="ih-kws">${hero.keywords.map((k) => `<span class="ih-kw">${k}</span>`).join("")}</div>
            </div>
            <div class="ih-side">
              <figure class="ih-float">
                <img src="./assets/trend-float.jpg" alt="高级定制秀场趋势参考" width="893" height="1340">
              </figure>
            </div>
            <div class="ih-floating"></div>
          </div>
        </div>

        <div class="dom-sec">
          ${secHead("02", "内容策划 · 选题节奏", "每周一 11:00 推送「内容节拍」，采纳后自动排入声场日历", `<button type="button" class="btn ghost small" data-refresh-beat>↻ 手动刷新</button>`)}
          ${renderEbit()}
        </div>

        <div class="dom-sec">
          ${secHead("03", "人群资产", "近7天动态人群画像 · 点击卡片下钻")}
          <div class="card-grid g-3">${crowds}</div>
        </div>

        <div class="dom-sec">
          ${secHead("04", "趋势与承接", "行业趋势时间轴 · 种草外溢分配")}
          <div class="card-grid g-2">
            <div class="panel">
              <div class="panel-head"><div><div class="panel-title">行业趋势时间轴</div><div class="panel-sub">近四周搜索与互动信号</div></div></div>
              <div class="timeline">${timeline}</div>
            </div>
            <div class="panel">
              <div class="panel-head"><div><div class="panel-title">种草外溢分配</div><div class="panel-sub">站内 vs 站外承接占比</div></div></div>
              <div class="bar-legend" style="margin-bottom:12px">
                <span><i style="background:#3A7D44"></i>小红书站内</span>
                <span><i style="background:#C0392B"></i>天猫</span>
                <span><i style="background:#2C6FA6"></i>京东</span>
                <span><i style="background:#B07C2F"></i>唯品会</span>
              </div>
              <table class="spill-table"><thead><tr><th>品类</th><th>占比</th><th>建议</th></tr></thead><tbody>${spill}</tbody></table>
            </div>
          </div>
        </div>

        <div class="dom-sec">
          ${secHead("05", "舆情监测", "负面舆情词库 · 实时词云")}
          ${renderNwCloud()}
        </div>
      </div>

      <div id="prism-global" ${UI.prismTab === "global" ? "" : "hidden"}>${globalTab}</div>
      <div id="prism-briefing" ${UI.prismTab === "briefing" ? "" : "hidden"}>${renderBriefing()}</div>`;
  }

  function secHead(num, title, sub = "", extra = "") {
    return `
      <div class="sec-head">
        <span class="sec-no">${num}</span>
        <div class="sec-txt">
          <div class="sec-title">${title}</div>
          ${sub ? `<div class="sec-sub">${sub}</div>` : ""}
        </div>
        ${extra ? `<div class="sec-extra">${extra}</div>` : ""}
      </div>`;
  }

  function renderEbit() {
    const beat = DB.contentBeat.map((b, i) => `
      <div class="ebit">
        <div class="eb-ico">${["📌", "📸", "🔴", "🌿"][i] || "✨"}</div>
        <div style="flex:1">
          <div class="eb-dir">${b.dir}</div>
          <div class="eb-meta">${b.day} ${b.time} · ${b.note}</div>
          <div class="eb-kw">${b.kw.split(" / ").map((k) => `<span class="badge gray">${k}</span>`).join("")}</div>
        </div>
        <button class="btn ghost small" data-adopt="${i}">采纳 → 声场</button>
      </div>`).join("");
    return `
      <div class="panel">
        <div class="card-grid g-2">${beat}</div>
      </div>`;
  }

  function renderNwCloud() {
    const cats = ["all", ...new Set(DB.negativeCloud.map((x) => x.cat))];
    const chans = ["all", ...new Set(DB.negativeCloud.map((x) => x.chan))];
    const catSel = cats.map((c) => `<option value="${c}" ${c === UI.negCat ? "selected" : ""}>${c === "all" ? "全部品类" : c}</option>`).join("");
    const chanSel = chans.map((c) => `<option value="${c}" ${c === UI.negChan ? "selected" : ""}>${c === "all" ? "全部渠道" : c}</option>`).join("");
    const daySel = ["7", "14", "30"].map((d) => `<option value="${d}" ${d === UI.negDays ? "selected" : ""}>近 ${d} 天</option>`).join("");

    const list = DB.negativeCloud.filter((w) =>
      (UI.negCat === "all" || w.cat === UI.negCat) && (UI.negChan === "all" || w.chan === UI.negChan));

    const words = list.map((w) => `
      <span class="nw-word" data-neg="${w.word}" title="${w.word} · 频次 ${w.freq} · 严重度 ${w.sev}/5"
        style="font-size:${nwFontSize(w.freq)}px;color:${sevColor(w.sev)}">
        ${w.word}${w.unmet ? "<span class=\"bluo\" title=\"蓝海机会\">✦</span>" : ""}
      </span>`).join("");

    return `
      <div class="panel">
        <div class="panel-head">
          <div><div class="panel-title">负面舆情词库 · 实时词云</div>
          <div class="panel-sub">气泡大小 = 出现频率 · 红色深浅 = 严重度 · ✦ 为蓝海机会词</div></div>
          <span class="panel-tag" data-neg-all>完整词库</span>
        </div>
        <div class="nw-filter">
          <select class="nw-select" data-neg-days>${daySel}</select>
          <select class="nw-select" data-neg-cat>${catSel}</select>
          <select class="nw-select" data-neg-chan>${chanSel}</select>
        </div>
        <div class="nw-cloud">${words || "<span style=\"color:var(--muted)\">当前筛选无命中词</span>"}</div>
        <div class="nw-legend">
          <span><i style="background:#c0392b;opacity:.3"></i>轻度</span>
          <span><i style="background:#c0392b;opacity:.7"></i>中度</span>
          <span><i style="background:#c0392b"></i>重度</span>
          <span><i style="background:var(--blue)"></i>蓝海机会</span>
        </div>
      </div>`;
  }

  // ---------- 交互世界地图 ----------
  const MAP_ANCHOR = {
    na: [185, 245], sea: [779, 452], eu: [484, 295],
    me: [614, 393], latam: [246, 494], jkoru: [844, 356],
  };

  function lerpColor(c1, c2, t) {
    const p = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    const a = p(c1), b = p(c2);
    const r = Math.round(a[0] + (b[0] - a[0]) * t);
    const g = Math.round(a[1] + (b[1] - a[1]) * t);
    const bl = Math.round(a[2] + (b[2] - a[2]) * t);
    return `rgb(${r},${g},${bl})`;
  }

  function regionColor(type, heat) {
    const t = Math.max(0, Math.min(100, heat)) / 100;
    return type === "red" ? lerpColor("#f2a9b0", "#8b0e1f", t) : lerpColor("#a8cdf0", "#0b3a7a", t);
  }

  function renderWorldMap() {
    const W = (window.WORLD_MAP && window.WORLD_MAP.paths) || [];
    const cidSet = new Set();
    DB.regions.forEach((r) => (r.cids || []).forEach((c) => cidSet.add(c)));
    const neutral = W.filter((p) => !cidSet.has(p.id)).map((p) =>
      `<path class="landpath" d="${p.d}"/>`).join("");

    const BX = 1030, BW = 330, BH = 82;

    const regions = DB.regions.map((r, i) => {
      const [mx, my] = MAP_ANCHOR[r.id] || [500, 300];
      const color = regionColor(r.type, r.heat);
      const by = 20 + i * 94;
      const midX = Math.round((mx + BX) / 2);
      const line = `M ${mx} ${my} H ${midX} V ${by + BH / 2} H ${BX}`;
      const sel = UI.mapSel === r.id ? " sel" : "";
      const typeLabel = r.type === "red" ? "红海·饱和" : "蓝海·潜力";
      const fills = (r.cids || []).map((c) => {
        const pt = W.find((p) => p.id === c);
        return pt ? `<path class="wk-ctry" d="${pt.d}" fill="${color}" fill-opacity="0.5"/>` : "";
      }).join("");
      return `
      <g class="wk${sel}" data-rid="${r.id}">
        <g class="wk-fill">${fills}</g>
        <path class="wline" d="${line}" stroke="${color}"/>
        <g class="wm" data-rid="${r.id}">
          <circle class="mk-pulse" cx="${mx}" cy="${my}" r="13" fill="${color}"/>
          <circle class="mk-ring" cx="${mx}" cy="${my}" r="8" fill="none" stroke="${color}" stroke-width="2"/>
          <circle class="mk-dot" cx="${mx}" cy="${my}" r="4.5" fill="${color}"/>
          <text class="mk-label" x="${mx + 13}" y="${my + 3}">${r.name}</text>
        </g>
        <g class="wb" data-rid="${r.id}">
          <rect class="wb-box" x="${BX}" y="${by}" width="${BW}" height="${BH}" rx="14"/>
          <rect class="wb-accent" x="${BX}" y="${by}" width="5" height="${BH}" rx="2.5" fill="${color}"/>
          <text class="wb-name" x="${BX + 18}" y="${by + 25}">${r.name}</text>
          <text class="wb-growth" x="${BX + 18}" y="${by + 49}" fill="${color}">${r.growth}</text>
          <text class="wb-ctry" x="${BX + 80}" y="${by + 49}">${r.countries.join("、")}</text>
          <text class="wb-desc" x="${BX + 18}" y="${by + 71}">${r.desc}</text>
          <g class="wb-type">
            <rect x="${BX + BW - 86}" y="${by + 10}" width="74" height="20" rx="10" fill="${color}" opacity="0.13"/>
            <text x="${BX + BW - 49}" y="${by + 24}" fill="${color}" text-anchor="middle">${typeLabel}</text>
          </g>
        </g>
      </g>`;
    }).join("");

    return `
    <div class="panel world-panel" style="margin-bottom:18px">
      <div class="panel-head">
        <div><div class="panel-title">目标市场 · 全球热力地图</div>
        <div class="panel-sub">红海 = 趋于饱和（越深越饱和） · 蓝海 = 潜力市场（越深潜力越大） · 悬停/点击高亮</div></div>
        <div class="wm-legend">
          <span><i style="background:#f2a9b0"></i>红海·低饱和</span>
          <span><i style="background:#8b0e1f"></i>红海·高饱和</span>
          <span><i style="background:#a8cdf0"></i>蓝海·低潜力</span>
          <span><i style="background:#0b3a7a"></i>蓝海·高潜力</span>
        </div>
      </div>
      <div class="world-map-wrap">
        <svg class="world-map" viewBox="0 0 1390 666" preserveAspectRatio="xMidYMid meet" role="img" aria-label="目标市场交互世界地图">
          <rect class="wm-ocean" x="0" y="0" width="1010" height="666"/>
          <rect class="wm-panelbg" x="1012" y="0" width="378" height="666"/>
          <line class="wm-divider" x1="1010" y1="0" x2="1010" y2="666"/>
          <g class="land">${neutral}</g>
          <g class="regions">${regions}</g>
        </svg>
      </div>
    </div>`;
  }

  function renderGlobal() {
    const hot = DB.hotWords.sort((a, b) => b.up - a.up).map((h) => `
      <tr><td><b>${h.w}</b></td><td>${h.zh}</td><td>${h.vol}</td>
      <td style="color:var(--green)">+${h.up}%</td>
      <td><div class="comp-bar"><div style="width:${h.comp * 100}%;height:100%;background:${h.comp > 0.6 ? "var(--accent)" : "var(--green)"};border-radius:3px"></div></div></td></tr>`).join("");

    const RISK_LABEL = { high: "高风险", mid: "中风险", note: "注意" };
    const risks = DB.cultureRisks.map((r) => {
      const on = UI.avoidRisks.includes(r.market);
      const words = (RISK_TERMS[r.market] || []).join(" · ");
      return `<button type="button" class="risk-bubble lv-${r.level} ${on ? "is-on" : ""}" data-risk="${r.market}"
        title="${on ? "已规避 · 点击取消" : "点击加入规避"}｜${r.risk}｜依据：${r.basis}｜替代：${r.replace}">
        <span class="rb-dot"></span>
        <span class="rb-main">
          <span class="rb-market">${r.market}</span>
          <span class="rb-words">${words || r.risk}</span>
        </span>
        <span class="rb-tag">${RISK_LABEL[r.level]}</span>
        ${on ? '<span class="rb-check">✓</span>' : ""}
      </button>`;
    }).join("");

    const fests = DB.festivals.map((f) =>
      `<div class="fest"><div class="f-date">${f.date}</div><div class="f-name">${f.name}</div><div class="f-market">${f.market}</div></div>`).join("");

    return `
      ${lockWrap("insight", "出海趋势", `
      ${renderWorldMap()}
      <div class="card-grid g-2">
        <div class="panel">
          <div class="panel-head"><div><div class="panel-title">跨境热词榜</div><div class="panel-sub">按涨幅排序 · 竞争度</div></div></div>
          <table class="hw-table"><thead><tr><th>词</th><th>中文</th><th>搜索量</th><th>涨幅</th><th>竞争度</th></tr></thead><tbody>${hot}</tbody></table>
        </div>
        <div class="panel">
          <div class="panel-head"><div><div class="panel-title">本地化节日日历</div><div class="panel-sub">Q4 关键营销节点</div></div></div>
          <div class="fest-grid">${fests}</div>
        </div>
      </div>
      <div class="panel" style="margin-top:18px">
        <div class="panel-head"><div><div class="panel-title">文化雷区合规库</div><div class="panel-sub">点击气泡即可规避该市场敏感词，后续文案自动避用</div></div></div>
        <div class="risk-bubbles">${risks}</div>
        <div class="risk-legend">
          <span><i style="background:#ff1f3d"></i>高风险</span>
          <span><i style="background:#e2a506"></i>中风险</span>
          <span><i style="background:#2c6fa6"></i>注意</span>
        </div>
      </div>
      ${renderCrossAssist()}
      `)}`;
  }

  const CROSS_TEMPLATES = {
    en: (p) => ({
      copy: `Quiet luxury, made for real life. The Aurora & Ash ${p.en} — clean lines, premium fabric, effortless style. ${p.price || ""} · wears well beyond the season.`,
      meaning: `为真实生活而生的静谧奢华。AURORA & ASH ${p.zh}——利落剪裁、高级面料、毫不费力的风格。${p.price || ""}，穿过季节依旧得体。`,
    }),
    ja: (p) => ({
      copy: `日常に寄り添う、静かなラグジュアリー。Aurora & Ash の${p.ja}——上質な素材とすっきりしたシルエット。${p.price || ""}。`,
      meaning: `贴近日常的静谧奢华。AURORA & ASH ${p.zh}——上乘面料与利落廓形。${p.price || ""}。`,
    }),
    ko: (p) => ({
      copy: `일상에 스며드는 조용한 럭셔리. Aurora & Ash ${p.ko} — 고급스러운 소재, 군더더기 없는 실루엣. ${p.price || ""}.`,
      meaning: `融入日常的静谧奢华。AURORA & ASH ${p.zh}——高级面料、干净利落的廓形。${p.price || ""}。`,
    }),
    th: (p) => ({
      copy: `ลักชัวรีที่นิ่งสงบ เพื่อทุกวันของคุณ ${p.th} จาก Aurora & Ash — ผ้าเนื้อดี ทรงสวย ใส่ได้ทุกโอกาส ${p.price || ""}.`,
      meaning: `为你的每一天而生的静谧奢华。AURORA & ASH ${p.zh}——好面料、好廓形，各种场合都能穿。${p.price || ""}。`,
    }),
    ms: (p) => ({
      copy: `Kemewahan yang tenang, untuk setiap hari anda. ${p.ms} Aurora & Ash — fabrik premium, potongan bersih. ${p.price || ""}.`,
      meaning: `为你每一天而生的静谧奢华。AURORA & ASH ${p.zh}——高级面料、利落剪裁。${p.price || ""}。`,
    }),
    es: (p) => ({
      copy: `Lujo silencioso para tu día a día. El ${p.es} de Aurora & Ash — líneas limpias, tejidos premium y estilo sin esfuerzo. ${p.price || ""}.`,
      meaning: `为你日常而生的静谧奢华。AURORA & ASH ${p.zh}——利落线条、高级面料与毫不费力的风格。${p.price || ""}。`,
    }),
  };

  function findCrossProduct(text) {
    const t = String(text || "").trim();
    if (!t) return DB.crossProducts[0];
    const hit = DB.crossProducts.find((p) => [p.zh, p.en, p.ja, p.ko].some((n) => t.includes(n) || n.includes(t)));
    return hit || { id: "custom", zh: t, en: t, ja: t, ko: t, th: t, ms: t, es: t, price: "", sell: "" };
  }

  function activeAvoidRisks() {
    return UI.avoidRisks.map((m) => DB.cultureRisks.find((r) => r.market === m)).filter(Boolean);
  }

  function avoidRiskTerms(text) {
    let out = text || "";
    activeAvoidRisks().forEach((r) => {
      (RISK_TERMS[r.market] || []).forEach((w) => { out = out.split(w).join(""); });
    });
    return out.replace(/ {2,}/g, " ").replace(/，+/, "，").trim();
  }

  function renderAvoidBar() {
    const list = activeAvoidRisks();
    if (!list.length) return "";
    const chips = list.map((r) => `<span class="avoid-chip ${r.level}">${r.market}</span>`).join("");
    return `<div class="avoid-bar" data-avoid-bar><span class="avoid-ico">🛡</span><span class="avoid-txt">已联动雷区库 · 后续文案自动规避：</span>${chips}<button type="button" class="avoid-clear" data-avoid-clear>清空</button></div>`;
  }

  function crossResult(product) {
    const p = product || DB.crossProducts[0];
    const tpl = CROSS_TEMPLATES[UI.crossLang] ? CROSS_TEMPLATES[UI.crossLang](p) : CROSS_TEMPLATES.en(p);
    return { copy: avoidRiskTerms(tpl.copy), meaning: avoidRiskTerms(tpl.meaning) };
  }

  function renderCrossAssist() {
    const langs = DB.crossLanguages.map((l) => `<button class="lang-chip ${l.id === UI.crossLang ? "is-on" : ""}" data-lang="${l.id}">${l.flag} ${l.name}</button>`).join("");
    const recs = DB.crossProducts.map((p) => `
      <button class="prod-chip" data-cross-product="${p.id}" title="点击填入并生成">
        <span class="pc-name">${p.zh}</span>
        <span class="pc-meta">${p.price} · ${p.rec}</span>
      </button>`).join("");
    const init = crossResult();
    const curLang = (DB.crossLanguages.find((l) => l.id === UI.crossLang) || {}).name || "";
    return `
      <div class="panel" style="margin-top:18px">
        <div class="panel-head"><div><div class="panel-title">洞察 · AI 跨境营销文案助手</div><div class="panel-sub">选择目标市场语言，一键生成本地化种草文案</div></div><span class="badge blue">PRISM CROSS</span></div>

        ${renderAvoidBar()}

        <div class="cross-step"><span class="cs-num">1</span>选择目标市场语言</div>
        <div class="lang-row" data-lang-row>${langs}</div>

        <div class="cross-step"><span class="cs-num">2</span>输入商品，或从系统推荐中一键选用</div>
        <div class="cross-prod-row">
          <input class="cross-input" data-cross-input type="text" placeholder="输入要带货的商品，例如：羊绒大衣" value="${DB.crossProducts[0].zh}" />
          <button class="btn primary" data-cross-gen>⚡ 一键生成文案</button>
        </div>
        <div class="cross-rec-label">系统推荐 · 目标市场潜力单品</div>
        <div class="cross-rec" data-cross-rec>${recs}</div>

        <div class="cross-step"><span class="cs-num">3</span>生成结果 · 左侧本地化文案 / 右侧中文释义</div>
        <div class="cross-cols">
          <div class="cross-col">
            <div class="cross-col-label">本地化种草文案 · <span data-cross-langname>${curLang}</span></div>
            <textarea class="cross-ta" data-cross-copy spellcheck="false">${init.copy}</textarea>
          </div>
          <div class="cross-col">
            <div class="cross-col-label">中文释义</div>
            <textarea class="cross-ta cross-ta-zh" data-cross-meaning readonly>${init.meaning}</textarea>
          </div>
        </div>

        <div class="cross-actions">
          <button class="btn primary" data-cross-copy>📋 复制文案</button>
          <button class="btn ghost" data-cross-publish>🚀 选择账号发布</button>
        </div>
        <div class="cross-note">已基于品牌定位「都市轻奢女装 · Quiet Luxury」生成，含本地化语气与合规自检；中文释义随文案实时同步。</div>
      </div>`;
  }

  /* ---------- 棱镜 · 全球趋势早报 ---------- */
  const adaptHex = (v) => (v >= 80 ? "#C0392B" : v >= 40 ? "#B07C2F" : "#3A7D44");
  const adaptCls = (v) => (v >= 80 ? "hi" : v >= 40 ? "mid" : "lo");

  function briefSparkline(values, up) {
    const w = 220, h = 56, p = 6;
    const max = Math.max(...values), min = Math.min(...values), r = max - min || 1;
    const pts = values.map((v, i) => [p + (i / (values.length - 1)) * (w - 2 * p), h - p - ((v - min) / r) * (h - 2 * p)]);
    const line = pts.map((q, i) => `${i ? "L" : "M"}${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(" ");
    const area = line + ` L${pts[pts.length - 1][0].toFixed(1)},${h - p} L${pts[0][0].toFixed(1)},${h - p} Z`;
    const color = up ? "#C0392B" : "#3A7D44";
    return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" class="brief-spark">
      <path d="${area}" fill="${color}" opacity="0.13"></path>
      <path d="${line}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>`;
  }

  function adaptRing(v) {
    const r = 40, c = 2 * Math.PI * r, color = adaptHex(v);
    return `<svg viewBox="0 0 104 104" width="104" height="104">
      <circle cx="52" cy="52" r="${r}" fill="none" stroke="rgba(0,0,0,0.07)" stroke-width="11"></circle>
      <circle cx="52" cy="52" r="${r}" fill="none" stroke="${color}" stroke-width="11" stroke-linecap="round"
        stroke-dasharray="${(c * v / 100).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 52 52)"></circle>
      <text x="52" y="50" text-anchor="middle" dominant-baseline="central" font-size="25" font-weight="900" fill="#2a241e">${v}</text>
      <text x="52" y="71" text-anchor="middle" font-size="10" fill="#9a9188">/100</text>
    </svg>`;
  }

  function crowdBubbles(items) {
    const maxW = Math.max(...items.map((x) => x.weight));
    const bubbles = items.map((x) => {
      const size = 50 + (x.weight / maxW) * 46;
      const alpha = 0.2 + (x.weight / maxW) * 0.35;
      return `<span class="crowd-bubble" style="width:${size.toFixed(0)}px;height:${size.toFixed(0)}px;background:rgba(192,57,43,${alpha.toFixed(2)})">${x.label}</span>`;
    }).join("");
    return `<div class="crowd-bubbles">${bubbles}</div>`;
  }

  const BRIEF_SOURCES = ["Instagram", "TikTok", "Pinterest", "Vogue Runway", "海外博客"];
  const BRIEF_TYPES = [["all", "全部"], ["穿搭风格", "穿搭风格"], ["视觉创意", "视觉创意"], ["面料工艺", "面料工艺"]];

  function currentBriefTrend() {
    return DB.globalTrends.find((t) => t.id === UI.briefTrend) || DB.globalTrends[0];
  }

  function filteredBriefTrends() {
    return DB.globalTrends.filter((t) =>
      UI.briefSources.includes(t.source) && (UI.briefCat === "all" || t.type === UI.briefCat));
  }

  function toggleBriefSource(s) {
    const i = UI.briefSources.indexOf(s);
    if (i >= 0) {
      if (UI.briefSources.length === 1) { toast("至少保留一个趋势来源"); return; }
      UI.briefSources.splice(i, 1);
    } else {
      UI.briefSources.push(s);
    }
  }

  function refreshBriefing() {
    const root = $("prism-briefing");
    if (root) { root.innerHTML = renderBriefing(); mountMoodboard(root); mountHelix(root); }
  }

  function openComplianceDetail() {
    const t = currentBriefTrend();
    const cu = t.compliance.cultural;
    const copyMap = { ok: ["✅ 可商用", "ok"], need: ["⚠️ 需授权", "need"], risk: ["❌ 高风险", "risk"] };
    const copyList = t.compliance.copyright.map((c) => `<div class="cpy-row"><span>${c.item}</span><span class="cpy-tag ${(copyMap[c.status] || copyMap.need)[1]}">${(copyMap[c.status] || copyMap.need)[0]}</span></div>`).join("");
    const cuLevel = cu.level === "safe" ? "安全" : cu.level === "note" ? "注意" : "禁止";
    openDrawer(`合规详情 · ${t.zhName}`, `
      <div class="comp-detail">
        <div class="cd-section"><div class="cd-title">文化适配检测</div><div class="cd-note">${cu.note}</div>
          <div class="cd-verdict ${cu.level}">${cuLevel} · ${t.zhName}${cu.level === "safe" ? "可直接投放" : cu.level === "note" ? "需针对性调整" : "禁止投放"}</div></div>
        <div class="cd-section"><div class="cd-title">素材版权检查</div>${copyList || '<div class="cd-note">无需额外授权</div>'}</div>
        <div class="cd-section"><div class="cd-title">趋势时效性</div><div class="cd-note">${t.compliance.trend.kind} · 可信度 ${t.compliance.trend.score}/100 · ${t.compliance.trend.note}</div></div>
      </div>`);
  }

  function renderBriefFilters() {
    const srcChips = BRIEF_SOURCES.map((n) => `<button class="fb-chip ${UI.briefSources.includes(n) ? "is-on" : ""}" data-brief-src="${n}">${n}</button>`).join("");
    const catChips = BRIEF_TYPES.map(([v, n]) => `<button class="fb-chip ${UI.briefCat === v ? "is-on" : ""}" data-brief-cat="${v}">${n}</button>`).join("");
    return `
      <div class="brief-filters">
        <div class="bf-row"><span class="fb-label">趋势来源（多选）</span><div class="fb-chips">${srcChips}</div></div>
        <div class="bf-row"><span class="fb-label">趋势类型</span><div class="fb-chips">${catChips}</div></div>
      </div>`;
  }

  function renderTrendCard(t) {
    const up = t.heatCurve[t.heatCurve.length - 1] >= t.heatCurve[0];
    return `
      <div class="trend-card ${t.id === UI.briefTrend ? "is-on" : ""}" data-brief-trend="${t.id}">
        <div class="tc-head"><div class="tc-name">${t.name}<div class="tc-zh">${t.zhName}</div></div><div class="tc-heat">🔥 ${t.heat}</div></div>
        <div class="tc-meta"><span class="badge gray">${t.source}</span><span class="badge gray">${t.type}</span><span class="tc-upd">${t.updated}</span></div>
        <div class="tc-row">
          <div class="tc-spark">${briefSparkline(t.heatCurve, up)}<div class="tc-delta" style="color:${up ? "#C0392B" : "#3A7D44"}">${t.heatDelta}</div></div>
          <div class="tc-adapt">
            <div class="tc-adapt-label">适配指数</div>
            <div class="adapt-track"><div class="adapt-bar ${adaptCls(t.adapt)}" style="width:${t.adapt}%"></div></div>
            <div class="tc-adapt-val" style="color:${adaptHex(t.adapt)}">${t.adapt}/100</div>
          </div>
        </div>
        <button class="btn primary tc-btn" data-brief-go="${t.id}">一键本土化 →</button>
      </div>`;
  }

  function renderBriefFlow(t) {
    const kw = t.keywords.map((k) => `<span class="kw-bubble"><b>${k.en}</b><i>${k.zh}</i></span>`).join("");
    const infl = t.influencers.map((x) => `<span class="infl"><span class="infl-ava">${x.avatar}</span>${x.name}<i>${x.role}</i></span>`).join("");
    const up = t.heatCurve[t.heatCurve.length - 1] >= t.heatCurve[0];
    const reasonTags = t.reasons.map((r, i) => `<span class="reason-tag" style="background:rgba(192,57,43,${(0.16 + (i * 0.09)).toFixed(2)})">${r}</span>`).join("");
    const warnTags = (t.warns || []).map((w) => `<span class="warn-tag">⚠ ${w}</span>`).join("");
    const topics = t.topics.map((tp, i) => `
      <div class="topic-card">
        <div class="topic-title"><span class="topic-no">选题 ${i + 1}</span>${tp.title}</div>
        <div class="topic-cover">🎬 封面：${tp.cover}</div>
        <div class="topic-script">${tp.script.map(([kk, vv]) => `<span class="script-item"><b>${kk}</b>${vv}</span>`).join("")}</div>
        <div class="topic-tags">${tp.tags.map((g) => `<span class="badge gray">${g}</span>`).join("")}<button class="btn ghost small topic-copy" data-topic-copy="${i}">📋 复制</button></div>
      </div>`).join("");
    const varKeys = [["dry", "干货型"], ["emo", "情绪型"], ["compare", "对比型"], ["suspension", "悬念型"], ["grass", "种草型"]];
    const varChips = varKeys.map(([k, n]) => `<button class="fb-chip ${UI.briefVar === k ? "is-on" : ""}" data-brief-var="${k}">${n}</button>`).join("");
    const curVarTitle = t.titleVar[UI.briefVar] || t.titleVar.dry;
    const spus = t.spus.map((s) => `
      <div class="spu-row">
        <span class="spu-thumb">${s.thumb}</span>
        <div class="spu-info"><div class="spu-name">${s.name}</div><div class="spu-reason">${s.reason}</div>
        <div class="spu-scenes">${s.scenes.map((x) => `<span class="badge gray">${x}</span>`).join("")}</div></div>
      </div>`).join("");
    const est = [
      ["进店 UV", t.estimate.uv, "↗"],
      ["互动量", t.estimate.inter, "↗"],
      ["搜索增量", t.estimate.search, "↗"],
    ].map(([k, v, a]) => `<div class="est"><div class="est-k">${k}</div><div class="est-v">${v} <span class="est-a">${a}</span></div></div>`).join("");

    return `
      <div class="panel" style="margin-bottom:16px">
        <div class="panel-head"><div>
          <div class="panel-title">${t.name} · 本土化工作流</div>
          <div class="panel-sub">${t.zhName} · 从识别到投放四步闭环</div>
        </div><button class="btn primary" data-brief-run>⚡ 一键本土化</button></div>
      </div>
      <div class="bflow" id="brief-flow">
        <div class="bstep">
          <div class="bstep-head"><span class="bstep-num">①</span><div style="flex:1"><div class="bstep-title">识别海外趋势</div><div class="bstep-sub">Identify · 实时抓取与品类匹配</div></div><span class="badge gray">${t.source}</span></div>
          <div class="bstep-body">
            <p class="bstep-overview">${t.overview}</p>
            <div class="kw-row">${kw}</div>
            <div class="bstep-split">
              <div class="heat-panel"><div class="bs-label">近 30 天讨论量</div>${briefSparkline(t.heatCurve, up)}<div class="bs-note" style="color:${up ? "var(--accent)" : "var(--green)"}">${t.heatDelta}</div></div>
              <div class="infl-panel"><div class="bs-label">关联海外达人 / 明星</div>${infl}</div>
            </div>
          </div>
        </div>
        <div class="bstep">
          <div class="bstep-head"><span class="bstep-num">②</span><div style="flex:1"><div class="bstep-title">判断国内相关性</div><div class="bstep-sub">Relevance · 适配指数与人群映射</div></div></div>
          <div class="bstep-body">
            <div class="bstep-split">
              <div class="adapt-ring-box">${adaptRing(t.adapt)}<div class="bs-label" style="text-align:center;margin-top:6px">适配指数</div></div>
              <div class="adapt-right">
                <div class="reason-tags">${reasonTags}${warnTags}</div>
                <div class="bs-label" style="margin-top:12px">目标人群映射（气泡大小 = 权重）</div>
                ${crowdBubbles(t.crowd)}
              </div>
            </div>
          </div>
        </div>
        <div class="bstep">
          <div class="bstep-head"><span class="bstep-num">③</span><div style="flex:1"><div class="bstep-title">转换为小红书表达</div><div class="bstep-sub">Localize · 选题 / 封面 / 脚本 / 标题变体</div></div></div>
          <div class="bstep-body">
            <div class="bs-label">推荐选题（3 条）</div>
            <div class="topics">${topics}</div>
            <div class="bs-label" style="margin-top:14px">标题变体生成器</div>
            <div class="fb-chips" style="margin:8px 0">${varChips}</div>
            <div class="vari-box">
              <div class="vari-title">${curVarTitle}</div>
              <button class="btn ghost small" data-brief-copyvar>📋 复制标题</button>
            </div>
          </div>
        </div>
        <div class="bstep">
          <div class="bstep-head"><span class="bstep-num">④</span><div style="flex:1"><div class="bstep-title">匹配本土产品与场景</div><div class="bstep-sub">Mapping · SPU 匹配与效果预估</div></div></div>
          <div class="bstep-body">
            <div class="bs-label">匹配 AURORA & ASH SPU</div>
            <div class="spu-list">${spus}</div>
            <div class="bs-label" style="margin-top:12px">发布时机建议</div>
            <div class="timing-box">🕐 ${t.timing}</div>
            <div class="bs-label" style="margin-top:12px">预期效果预估（虚拟预测）</div>
            <div class="est-row">${est}</div>
          </div>
        </div>
      </div>`;
  }

  function renderComplianceBar(t) {
    const cu = t.compliance.cultural;
    const cuCls = cu.level === "safe" ? "safe" : cu.level === "note" ? "note" : "ban";
    const cuLabel = cu.level === "safe" ? "安全" : cu.level === "note" ? "注意" : "禁止";
    const cuColor = cu.level === "safe" ? "#3A7D44" : cu.level === "note" ? "#B07C2F" : "#C0392B";
    const copyMap = { ok: ["✅ 可商用", "ok"], need: ["⚠️ 需授权", "need"], risk: ["❌ 高风险", "risk"] };
    const copyList = t.compliance.copyright.map((c) => {
      const [label, cls] = copyMap[c.status] || copyMap.need;
      return `<div class="cpy-row"><span>${c.item}</span><span class="cpy-tag ${cls}">${label}</span></div>`;
    }).join("");
    const tr = t.compliance.trend;
    const trUp = tr.score >= 60;
    const trColor = tr.score >= 70 ? "#3A7D44" : tr.score >= 50 ? "#B07C2F" : "#C0392B";
    const trVals = trUp ? [30, 38, 45, 52, 60, 68, tr.score] : [82, 74, 66, 58, 52, 46, tr.score];
    return `
      <div class="compliance-bar">
        <div class="panel" style="margin-bottom:0">
          <div class="panel-head" style="margin-bottom:14px"><div><div class="panel-title">🛡 安全与合规检查</div><div class="panel-sub">投放前全局自检 · 随选中趋势实时刷新</div></div></div>
          <div class="comp-grid">
            <div class="comp-col">
              <div class="comp-title">文化适配检测</div>
              <div class="comp-light ${cuCls}" data-culture-light><span class="dot"></span></div>
              <div class="comp-status" style="color:${cuColor}">${cuLabel}</div>
              <div class="comp-note">${cu.note}</div>
            </div>
            <div class="comp-col">
              <div class="comp-title">素材版权检查</div>
              <div class="cpy-list">${copyList}</div>
            </div>
            <div class="comp-col">
              <div class="comp-title">趋势时效性与虚假热点过滤</div>
              <div class="trend-cred"><span class="tc-kind ${trUp ? "up" : "down"}">${tr.kind}</span><span class="tc-score" style="color:${trColor}">可信度 ${tr.score}</span></div>
              <div style="margin:8px 0">${briefSparkline(trVals, trUp)}</div>
              <div class="comp-note">${tr.note}</div>
            </div>
          </div>
        </div>
      </div>`;
  }

  /* ---------- 海外创意素材积累 · 双螺旋轮播 ---------- */

  const MOOD_RADIUS = 340;
  const MOOD_HELIX = 94;
  const MOOD_TILES = (() => {
    const a = [], b = [];
    for (let r = 1; r <= 4; r++) for (let c = 1; c <= 3; c++) {
      a.push(`./assets/moodboard/tiles/a-${r}-${c}.jpg`);
      b.push(`./assets/moodboard/tiles/b-${r}-${c}.jpg`);
    }
    return { a, b };
  })();
  let _moodRAF = null;
  let _hlxLive = null;
  let _hlxRAF = 0;
  let _hlxVisBound = false;
  let _hlxWinUp = null;

  function renderMoodboard() {
    const ringA = MOOD_TILES.a.map((src, i) => `<div class="mb-slide"><img src="${src}" alt="海外素材 A${i + 1}" loading="lazy"></div>`).join("");
    const ringB = MOOD_TILES.b.map((src, i) => `<div class="mb-slide"><img src="${src}" alt="海外素材 B${i + 1}" loading="lazy"></div>`).join("");
    const total = MOOD_TILES.a.length + MOOD_TILES.b.length;
    return `
      <section class="moodboard" id="moodboard">
        <div class="mb-head">
          <div class="mb-title-wrap">
            <p class="kicker">CREATIVE ASSETS · OVERSEAS</p>
            <h3>海外内容热榜</h3>
          </div>
        </div>
        <div class="mb-stage" id="mb-stage">
          <div class="mb-carousel" id="mb-carousel">
            <div class="mb-ring mb-ring-a">${ringA}</div>
            <div class="mb-ring mb-ring-b">${ringB}</div>
          </div>
          <div class="mb-axis">HELIX · LENS DISPERSION</div>
        </div>
        <div class="mb-foot">
          <span class="mb-hint">移动鼠标可轻移视角</span>
        </div>
      </section>`;
  }

  function renderHelix() {
    return `
      <div class="hlx">
        <section class="board" id="creative" data-fit="page" aria-labelledby="creative-title">
          <div class="frame">
            <div class="stage">
              <div class="axis" aria-hidden="true"></div>
              <div class="helix"></div>
              <div class="lens-rim" aria-hidden="true"></div>
            </div>
            <div class="copy">
              <h2 id="creative-title">先一步<br>创意抵达</h2>
              <p class="now" aria-live="polite">
                <em id="now-no">01</em>
                <span id="now-name">皮纹拼贴</span>
                <span class="now-note" id="now-note">材质 · 人像</span>
              </p>
            </div>
          </div>
          <div class="toolbar">
            <div class="transport">
              <button type="button" id="toggle" aria-pressed="true">暂停</button>
              <button type="button" id="prev">上一帧</button>
              <button type="button" id="next">下一帧</button>
            </div>
            <input id="scrub" type="range" min="0" max="1000" value="0" aria-label="螺旋位置">
            <div class="dots" id="dots" role="tablist" aria-label="九张素材"></div>
            <div class="fits" role="group" aria-label="画幅">
              <button type="button" data-fit="page" aria-pressed="true">页面</button>
              <button type="button" data-fit="banner" aria-pressed="false">16:9</button>
              <button type="button" data-fit="story" aria-pressed="false">4:5</button>
            </div>
          </div>
        </section>
      </div>`;
  }

  function renderBriefing() {
    const filtered = filteredBriefTrends();
    const sel = filtered.find((t) => t.id === UI.briefTrend) || filtered[0] || DB.globalTrends[0];
    const list = filtered.length
      ? filtered.map((t) => renderTrendCard(t)).join("")
      : `<div class="empty">暂无符合条件的趋势，放宽来源或类型筛选后再试。</div>`;
    return `
      <div class="page-head" style="margin-top:0">
        <p class="kicker">PRISM BRIEFING</p>
        <h2 style="font-size:20px">全球趋势早报</h2>
        <p class="desc">实时抓取海外社媒趋势，判断国内相关性，一键转为小红书内容并匹配本土产品与场景。</p>
      </div>
      ${renderHelix()}
      ${renderMoodboard()}
      <div class="briefing-grid">
        <div class="briefing-left">
          <div class="panel" style="margin-bottom:16px">${renderBriefFilters()}</div>
          <div class="trend-list">${list}</div>
        </div>
        <div class="briefing-right">${renderBriefFlow(sel)}</div>
      </div>
      ${renderComplianceBar(sel)}`;
  }

  /* ---------- 触点 · 达人 ---------- */

  function filterBarHtml(scope, min, max, cur) {
    const budget = cur.budget > 0 ? Math.min(cur.budget, max) : max;
    const fansOpts = [["all", "全部"], ["lt10", "<10w"], ["10to100", "10-100w"], ["100to500", "100-500w"], ["gt500", "500w+"]];
    const convOpts = [["all", "全部"], ["high", "高"], ["mid", "中"], ["low", "低"]];
    const fansChips = fansOpts.map(([k, v]) => `<button class="fb-chip ${cur.fans === k ? "is-on" : ""}" data-ffans="${scope}:${k}">${v}</button>`).join("");
    const convChips = convOpts.map(([k, v]) => `<button class="fb-chip ${cur.conv === k ? "is-on" : ""}" data-fconv="${scope}:${k}">${v}</button>`).join("");
    return `
      <div class="filterbar">
        <div class="fb-col fb-slider">
          <span class="fb-label">报价预算（上限）</span>
          <input type="range" min="${min}" max="${max}" step="${Math.max(1, Math.round((max - min) / 40))}" value="${budget}"
            data-fbudget="${scope}" oninput="this.nextElementSibling.textContent='≤ ¥'+Number(this.value).toLocaleString('en-US')" />
          <span class="fb-val">≤ ¥${money(budget)}</span>
        </div>
        <div class="fb-col">
          <span class="fb-label">粉丝量分级</span>
          <div class="fb-chips">${fansChips}</div>
        </div>
        <div class="fb-col">
          <span class="fb-label">转化效率</span>
          <div class="fb-chips">${convChips}</div>
        </div>
      </div>`;
  }

  function budgetOk(price, max, budget) { return budget <= 0 || budget >= max || price <= budget; }

  function renderTouch() {
    const tabs = [["talents", "达人库"], ["stars", "明星素材库"], ["brief", "Brief 生成"], ["assist", "内容辅助"], ["comply", "合规预审"], ["batch", "批量管理"]];
    const btns = tabs.map(([k, v]) => `<button class="${UI.touchTab === k ? "is-on" : ""}" data-ttab="${k}">${v}</button>`).join("");
    const body = {
      talents: renderTouchTalents, stars: renderTouchStars, brief: renderTouchBrief,
      assist: renderTouchAssist, comply: renderTouchComply, batch: renderTouchBatch,
    }[UI.touchTab]();
    return `
      <div class="page-head">
        <p class="kicker">TOUCHPOINT · 达人</p>
        <h2>触点</h2>
        <p class="desc">从海量达人里找到最匹配的一批人，并用 Brief、合规与看板把合作推进到底。</p>
      </div>
      <div class="module-tabs" id="touch-tabs" style="margin-bottom:18px">${btns}</div>
      <div id="touch-body">${body}</div>`;
  }

  function renderTouchTalents() {
    const prices = DB.talents.map((t) => priceMin(t.price));
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const sliderMin = Math.max(1000, Math.floor(minPrice / 1000) * 1000);
    const filterbar = filterBarHtml("talent", sliderMin, maxPrice, talentF);

    const list = DB.talents.filter((t) => {
      const c = talentConv[t.name] || 0;
      if (talentF.fans !== "all" && fansTier(wanNum(t.fans)) !== talentF.fans) return false;
      if (talentF.conv !== "all" && convTier(c) !== talentF.conv) return false;
      if (!budgetOk(priceMin(t.price), maxPrice, talentF.budget)) return false;
      return true;
    });

    const talents = list.map((t) => {
      const c = talentConv[t.name] || 0;
      const cc = convColor(c);
      const initials = t.name.slice(0, 1);
      const stats = [
        ["互动率", t.interRate], ["进店UV", t.uv], ["成交量", t.orders], ["带货GMV", t.gmv],
      ].map(([k, v]) => `<div class="ts"><div class="k">${k}</div><div class="v">${v}</div></div>`).join("");
      return `<div class="panel talent-card">
        <div class="tl-head">
          <div class="talent-avatar">${initials}</div>
          <span class="badge" style="background:${tierColor[t.tier]}18;color:${tierColor[t.tier]}">${tierLabel[t.tier]}</span>
          <span class="badge" style="background:${cc}18;color:${cc}">转化 ${c}</span>
        </div>
        <div><div class="tl-name">${t.name}</div><div class="tl-handle">${t.handle}</div></div>
        <div class="tl-fans">${t.fans} <span style="font-size:11px;color:var(--muted)">粉丝</span></div>
        <div class="tl-tags">${t.tags.map((x) => `<span class="badge gray">${x}</span>`).join("")}</div>
        <div class="tl-intro">${t.intro}</div>
        <div class="talent-stats">${stats}</div>
        <div style="font-size:11.5px;color:var(--muted)">报价 <b style="color:var(--ink)">${t.price}</b></div>
        <div class="tl-actions">
          <button class="btn ghost small" data-talent="${t.name}">查看画像</button>
          <button class="btn primary small" data-order="${t.name}">发起撮合</button>
        </div>
      </div>`;
    }).join("");

    const empty = list.length ? "" : `<div class="empty">没有符合条件的达人，调整筛选条件试试。</div>`;

    return `
      <div class="card-grid g-3" style="margin-bottom:18px">
        <div class="panel"><div class="m-label">达人库总规模</div><div class="m-val">128,600+</div><div class="m-delta up">覆盖 42 个细分行业</div></div>
        <div class="panel"><div class="m-label">本月已撮合</div><div class="m-val">14 单</div><div class="m-delta up">+4 单 环比</div></div>
        <div class="panel"><div class="m-label">平均互动率</div><div class="m-val">7.4%</div><div class="m-delta up">高于行业均值 1.8x</div></div>
      </div>
      <div class="panel">
        <div class="panel-head"><div><div class="panel-title">达人库 · 智能撮合</div><div class="panel-sub">按 报价预算 / 粉丝量 / 转化效率 筛选 · 当前匹配 ${list.length} 人</div></div></div>
        ${filterbar}
        ${empty}
        <div class="card-grid g-3">${talents}</div>
      </div>`;
  }

  function renderTouchStars() {
    const num = (s) => parseFloat(String(s).replace(/[^0-9.]/g, "")) || 0;
    const leakPct = (to, from) => (from ? ((1 - to / from) * 100).toFixed(1) + "%" : "—");

    // 筛选：预算 / 粉丝量 / 转化效率
    const sPrices = DB.stars.map((s) => priceMin(s.price));
    const sMax = Math.max(...sPrices);
    const sMin = Math.max(10000, Math.floor(Math.min(...sPrices) / 10000) * 10000);
    const starFilterbar = filterBarHtml("star", sMin, sMax, starF);
    const filteredStars = DB.stars.filter((s) => {
      const m = starMeta[s.name] || {};
      if (starF.fans !== "all" && fansTier(wanNum(s.fans)) !== starF.fans) return false;
      if (starF.conv !== "all" && convTier(m.conv || 0) !== starF.conv) return false;
      if (!budgetOk(priceMin(s.price), sMax, starF.budget)) return false;
      return true;
    });

    // 每位艺人：信息 + 合作案例 + 个人流转漏斗 + 个人挂链推送
    const starBlocks = filteredStars.map((s) => {
      const meta = starMeta[s.name] || {};
      const sent = meta.sentiment != null ? meta.sentiment : 80;
      const sentCls = sent >= 80 ? "green" : sent >= 60 ? "amber" : "danger";
      const conv = meta.conv || 0;
      const cc = convColor(conv);
      const sentBadge = `<span class="badge ${sentCls}" style="margin-left:6px">舆情 ${sent}</span>`;
      const convBadge = `<span class="badge" style="background:${cc}18;color:${cc};margin-left:6px">转化 ${conv}</span>`;
      const warn = sent < 60 ? `<div class="sentiment-warn">⚠ 舆情预警：${meta.sentNote || "近期负面舆论较多"} —— 建议品牌近期暂停该艺人相关投流，避免负面情绪波及品牌。</div>` : "";
      const collabs = s.collabs.map((c) => `
        <div class="star-collab">
          <div style="font-size:12px;color:var(--muted)">${c.brand} · ${c.item}</div>
          <div class="sc-badge" style="margin-top:6px">互动 ${c.inter} · 搜索 ${c.search}</div>
          <div class="metric-row" style="margin-top:8px">
            <div class="metric" style="padding:10px"><div class="m-label">进店UV</div><div class="m-val" style="font-size:18px">${c.uv}</div></div>
            <div class="metric" style="padding:10px"><div class="m-label">GMV</div><div class="m-val" style="font-size:18px">${c.gmv}</div></div>
          </div>
        </div>`).join("");

      const [av, iv, tv, pv] = s.funnel;
      const stages = [
        ["A", "曝光 Awareness", av, "—", "曝光→兴趣流失：封面/标题吸引力不足，目标人群错配"],
        ["I", "兴趣 Interest", iv, leakPct(iv, av), "兴趣→试转化流失：缺少购买引导与挂链"],
        ["TI", "试转化 Trial", tv, leakPct(tv, iv), "试转化→成交流失：站外跳转链路损耗"],
        ["P", "购买 Purchase", pv, "—", "最终成交 " + (pv / 10000).toFixed(0) + "w 单 · 客单价 ¥1,650"],
      ];
      const funnel = stages.map(([k, n, v, leak, note], i) => `
        <div class="metric" style="padding:12px">
          <div class="m-label">${k} · ${n}</div>
          <div class="m-val" style="font-size:20px">${v >= 10000 ? (v / 10000).toFixed(1) + "w" : v}</div>
          <div style="font-size:11px;color:var(--muted);margin-top:4px">流失 ${leak}</div>
          <div class="progress" style="margin-top:8px"><i style="width:${(v / av * 100).toFixed(1)}%;background:${["#3A7D44", "#B07C2F", "#C0392B", "#6B5584"][i]}"></i></div>
          <div style="font-size:11px;color:var(--muted);line-height:1.5;margin-top:6px">${note}</div>
        </div>`).join("");

      const pushes = s.pushes.map((p) => `
        <div class="kb-card">
          <div class="kb-label">笔记标题</div>
          <div class="kb-t">${p.note}</div>
          <div class="kb-i">明星 + 品牌 双命中 · 承接 ${p.target}</div>
          <div class="kb-meta"><span>${s.name}</span><span class="status-tag low">待确认</span></div>
          <div class="kb-audience"><span class="kb-aud-label">点赞评论目标人群</span>${p.audience}</div>
          <div class="kb-actions"><button class="btn primary" data-link-confirm="${p.note}">确认挂链</button><button class="btn ghost" data-link-detail="${p.note}">详情</button></div>
        </div>`).join("");

      const brandNotes = (s.brandNotes || []).map((n) => `
        <div class="kb-card">
          <div class="kb-label">笔记标题</div>
          <div class="kb-t">${n.note}</div>
          <div class="kb-i">品牌号同款挂链 · 承接 ${n.target}</div>
          <div class="kb-meta"><span class="status-tag blank">未提及明星 · 同款挂链</span><span class="status-tag low">待推送</span></div>
          <div class="kb-audience"><span class="kb-aud-label">点赞评论目标人群</span>${n.audience}</div>
          <div class="kb-actions"><button class="btn primary" data-push-note="${n.note}">推送挂链笔记</button><button class="btn ghost" data-link-detail="${n.note}">详情</button></div>
        </div>`).join("");

      return `
      <div class="panel" style="margin-bottom:18px">
        <div class="sc-head">
          <div class="talent-avatar">${s.name.slice(0, 1)}</div>
          <div style="flex:1"><div class="tl-name">${s.name} <span class="badge gray" style="margin-left:6px">${s.credit} 级</span>${sentBadge}${convBadge}</div>
          <div class="tl-handle">${s.handle} · ${s.fans} 粉丝 · ${s.role}</div></div>
          <span class="badge red">报价 ${s.price}</span>
        </div>
        ${warn}
        <div class="card-grid g-2" style="margin-top:12px">${collabs}</div>
        <div class="sub-block">
          <div class="sub-title">${s.name} · 全网流转漏斗 A → I → TI → P</div>
          <div class="card-grid g-4">${funnel}</div>
        </div>
        <div class="sub-block">
          <div class="sub-title">${s.name} · 自动挂链笔记推送 <span class="badge blue">${s.pushes.length} 条待确认</span></div>
          <div class="card-grid g-3">${pushes}</div>
        </div>
        <div class="sub-block">
          <div class="sub-title">${s.name} · 品牌号同款挂链笔记 <span class="badge gray">${brandNotes ? s.brandNotes.length : 0} 条待推送</span></div>
          <div class="card-grid g-3">${brandNotes}</div>
        </div>
      </div>`;
    }).join("");

    // 近期品牌相关艺人转化对比图（GMV）
    const cmp = DB.stars.map((s) => ({
      name: s.name, fans: s.fans,
      gmv: s.collabs.reduce((a, c) => a + num(c.gmv), 0),
      uv: s.collabs.reduce((a, c) => a + num(c.uv), 0) / (s.collabs.length || 1),
      inter: s.collabs.reduce((a, c) => a + num(c.inter), 0) / (s.collabs.length || 1),
      search: Math.max(...s.collabs.map((c) => num(c.search))),
    }));
    const maxGmv = Math.max(...cmp.map((c) => c.gmv));
    const sorted = [...cmp].sort((a, b) => b.gmv - a.gmv);
    const chart = sorted.map((c, i) => `
      <div class="cmp-row">
        <div class="cmp-name"><span class="cmp-rank">${i + 1}</span>${c.name}<span class="cmp-fans">${c.fans} 粉丝</span></div>
        <div class="cmp-bar"><i style="width:${(c.gmv / maxGmv * 100).toFixed(1)}%"></i></div>
        <div class="cmp-val">¥${c.gmv}w</div>
      </div>`).join("");

    // 智能分析：种草 / 露出 / 直播带货
    const insights = [
      { tag: "露出 · 声量破圈", who: "鹿野 Sen", why: "1,842w 顶流，搜索 +340%~412%，单篇 GMV 最高 ¥213w，适合品牌大曝光与顶流背书（报价偏贵，量级够时优先）。", color: "#C0392B" },
      { tag: "种草 · 深度内容", who: "陈一白 Yibai", why: "模特 + 时尚主编双身份，极简风高度契合 Quiet Luxury 品牌调性，报价 ¥42k-68k 性价比优，适合长笔记种草。", color: "#3A7D44" },
      { tag: "直播带货 · 即时转化", who: "周绵绵 Mian", why: "综艺嘉宾 + 穿搭KOL，镜头感与互动率突出，487w 粉丝圈层精准，适合直播切片带货与粉丝即时转化。", color: "#2C6FA6" },
    ];
    const insightCards = insights.map((x) => `
      <div class="insight-card">
        <div class="insight-tag" style="background:${x.color}">${x.tag}</div>
        <div class="insight-who">${x.who}</div>
        <div class="insight-why">${x.why}</div>
      </div>`).join("");

    // 品牌号同款挂链笔记已并入各艺人的 brandNotes 子块

    return `
      <div class="page-head" style="margin-top:0">
        <p class="kicker">STAR LIBRARY</p>
        <h2 style="font-size:20px">明星素材库</h2>
      </div>
      <div class="panel" style="margin-bottom:18px">
        <div class="panel-head"><div><div class="panel-title">明星素材库 · 艺人筛选</div><div class="panel-sub">按 报价预算 / 粉丝量 / 转化效率 筛选 · 当前匹配 ${filteredStars.length} 人</div></div></div>
        ${starFilterbar}
      </div>
      <div class="panel" style="margin-bottom:18px">
        <div class="panel-head"><div><div class="panel-title">近期品牌相关艺人 · 转化对比</div><div class="panel-sub">GMV 成交总额横向对比 · 按成交额从高到低排序</div></div></div>
        ${chart}
        <div class="chart-legend">单位：万元（GMV）· 数据来自近 30 天站内外合作笔记合计</div>
      </div>
      <div class="panel" style="margin-bottom:18px">
        <div class="panel-head"><div><div class="panel-title">智能分析 · 下一步合作建议</div><div class="panel-sub">按种草 / 露出 / 直播带货三条线择优分配预算</div></div></div>
        <div class="card-grid g-3">${insightCards}</div>
        <div class="chart-legend">补充：林小满 SUM 报价 ¥12k-22k，适合校园 / 年轻客群长尾低成本渗透，作为补充位持续种草。</div>
      </div>
      ${filteredStars.length ? starBlocks : `<div class="panel"><div class="empty">没有符合条件的艺人，调整筛选条件试试。</div></div>`}
    `;
  }

  function renderTouchBrief() {
    const platBtns = DB.conversionPlats.map((p) => `
      <div class="conv-plat ${UI.convPlat === p.id ? "is-on" : ""}" data-conv="${p.id}" style="border-color:${UI.convPlat === p.id ? p.color : "var(--line-soft)"}">
        <span class="cv-dot" style="background:${p.color}"></span>
        <div style="flex:1"><div class="cv-name">${p.name}</div><div class="cv-sub">${p.sub}</div></div>
      </div>`).join("");
    const talentExt = DB.talentExternal.map((t) => `
      <div class="kb-card">
        <div class="kb-t">${t.acct}</div>
        <div class="kb-i" style="color:${t.good ? "var(--green)" : "var(--muted)"}">${t.val}</div>
        <div class="kb-meta"><span>${t.note}</span></div>
      </div>`).join("");
    return `
      <div class="card-grid g-2">
        <div class="panel brief-form">
          <div class="panel-head"><div><div class="panel-title">Brief 智能生成</div><div class="panel-sub">自动预填关键词 / 人群 / 产品</div></div></div>
          <div class="form-grid">
            <div class="form-field"><label>产品</label><input value="羊绒大衣 · Aurora 晨曦系列"></div>
            <div class="form-field"><label>目标人群</label><input value="28-35 岁都市通勤女性"></div>
            <div class="form-field"><label>核心关键词</label><input value="静奢风 / 通勤大衣 / 正反两穿"></div>
            <div class="form-field"><label>达人层级</label><select><option>头肩 + 腰部</option><option>头部</option><option>腰部</option><option>KOC</option></select></div>
            <div class="form-field"><label>交付物料</label><select><option>图文 × 2 + 视频 × 1</option><option>图文 × 1</option><option>视频 × 1</option></select></div>
            <div class="form-field"><label>预算区间</label><input value="¥ 8w - 15w"></div>
          </div>
          <div class="panel-head" style="margin-top:6px"><div><div class="panel-title">转化承接目标</div><div class="panel-sub">外链目标将同步到蒲公英</div></div></div>
          <div class="card-grid g-2">${platBtns}</div>
        </div>
        <div class="panel">
          <div class="panel-head"><div><div class="panel-title">达人历史平台指标</div><div class="panel-sub">结合承接目标给出推荐</div></div></div>
          <div class="card-grid g-1" style="grid-template-columns:1fr">${talentExt}</div>
          <div class="advice-box" style="margin-top:14px">💡 达人天猫进店能力突出，建议承接目标设为 <b>天猫旗舰店</b>，外链目标自动同步到蒲公英。</div>
        </div>
      </div>
      <div class="panel" style="margin-top:16px">
        <div class="panel-head"><div><div class="panel-title">生成结果预览</div><div class="panel-sub">可下载 PDF 或直接发送到蒲公英</div></div></div>
        <div class="brief-out">
          <div class="bo-title">AURORA & ASH · 羊绒大衣 Brief</div>
          <div style="margin-top:8px"><span class="bo-tag">静奢风</span><span class="bo-tag">通勤大衣</span><span class="bo-tag">正反两穿</span></div>
          <div style="margin-top:10px;color:var(--muted)">目标人群 28-35 都市通勤女性 · 达人层级 头肩+腰部 · 物料 图文×2+视频×1 · 预算 ¥8w-15w。<br>承接目标：<b>${(DB.conversionPlats.find((p) => p.id === UI.convPlat) || {}).name || "天猫旗舰店"}</b>。</div>
        </div>
        <div style="display:flex;gap:8px;margin-top:14px">
          <button class="btn primary" data-brief-gen>重新生成</button>
          <button class="btn" data-brief-pdf>导出 PDF</button>
          <button class="btn" data-brief-send>发送到蒲公英</button>
        </div>
      </div>`;
  }

  function renderTouchAssist() {
    return `
      <div class="card-grid g-2">
        <div class="panel">
          <div class="panel-head"><div><div class="panel-title">草稿分析</div><div class="panel-sub">粘贴达人初稿，AI 给出评分与问题清单</div></div></div>
          <textarea class="ql-input" style="width:100%;height:120px;border:1px solid var(--line);border-radius:12px;padding:12px;background:#fffcfa;resize:vertical" placeholder="粘贴达人初稿……">这件羊绒大衣真的是我今年最惊艳的一件，超级柔软，穿上瞬间高级感拉满，姐妹们冲啊，绝对不后悔！</textarea>
          <div style="margin-top:10px"><button class="btn primary" data-assist-analyze>开始分析</button></div>
          <div class="assist-out" data-assist-out hidden>
            <div class="score-row">
              <div class="score-it"><div class="sc-n">76</div><div class="sc-l">综合分</div></div>
              <div class="score-it"><div class="sc-n">82</div><div class="sc-l">种草力</div></div>
              <div class="score-it"><div class="sc-n">61</div><div class="sc-l">合规度</div></div>
              <div class="score-it"><div class="sc-n">71</div><div class="sc-l">转化力</div></div>
            </div>
            <div class="del-lines" style="margin-top:10px">
              <div class="del-rm">「最」「超级」「瞬间」「绝对不后悔」—— 违禁绝对化用语，需删除</div>
              <div class="del-rm">「高级感拉满」—— 夸张程度需收敛</div>
              <div class="del-add">+ 补充面料参数（含绒量）与通勤/约会场景</div>
              <div class="del-add">+ 增加「正反两穿」功能点，强化记忆点</div>
            </div>
          </div>
        </div>
        <div class="panel">
          <div class="panel-head"><div><div class="panel-title">优化初稿</div><div class="panel-sub">AI 重写：去违禁词 + 补种草钩子</div></div></div>
          <div class="assist-out" style="margin-top:0">
            <div class="sc-badge" style="margin-bottom:6px">优化后 · 建议采用</div>
            <div style="font-size:13.5px;line-height:1.9">这件 AURORA & ASH 羊绒大衣，是我今年最心动的一件。高含量山羊绒，贴肤柔滑不扎；正反两穿设计，一件顶两件。通勤搭西装裤利落干练，周末配针织裙松弛慵懒。静奢质感，耐穿不过时。</div>
            <div class="cross-note">已自动移除绝对化用语，补充材质与场景钩子，合规度提升至 96。</div>
          </div>
          <div class="panel-head" style="margin-top:18px"><div><div class="panel-title">风格学习</div><div class="panel-sub">选择品牌历史爆款文案风格</div></div></div>
          <div class="neg-chips" data-style-pick>
            <span class="neg-chip is-on">高级感叙事</span><span class="neg-chip">场景化种草</span><span class="neg-chip">参数党硬核</span><span class="neg-chip">情绪共鸣</span>
          </div>
          <div style="margin-top:14px"><button class="btn primary" data-assist-generate>生成优化稿</button></div>
        </div>
      </div>`;
  }

  function renderTouchComply() {
    const rules = DB.complianceRules.map((r) => {
      const cls = r.tag === "red" ? "comply-hit" : r.tag === "yellow" ? "comply-flag" : "comply-sens";
      const tagLabel = r.tag === "red" ? "违禁词 · 强制" : r.tag === "yellow" ? "广告标识 · 需标识" : "敏感词 · 建议替换";
      return `<div class="${cls}">
        <div style="display:flex;justify-content:space-between;align-items:center"><span class="cp-w">${r.w}</span><span class="cp-tag">${tagLabel}</span></div>
        <div class="cp-law">📖 ${r.law}</div>
        <div class="cp-tip">✓ ${r.tip}</div>
      </div>`;
    }).join("");
    return `
      <div class="card-grid g-2">
        <div class="panel">
          <div class="panel-head"><div><div class="panel-title">内容文案预检</div><div class="panel-sub">粘贴文案，一键检测违禁词 / 广告标识 / 敏感词</div></div></div>
          <textarea class="ql-input" style="width:100%;height:120px;border:1px solid var(--line);border-radius:12px;padding:12px;background:#fffcfa;resize:vertical" placeholder="粘贴待发布的文案……">这款羊绒大衣是全国第一的静奢之选，100%治愈你整个冬天，永久温暖。</textarea>
          <div style="margin-top:10px"><button class="btn primary" data-comply-run>开始预检</button></div>
        </div>
        <div class="panel">
          <div class="panel-head"><div><div class="panel-title">合规规则库</div><div class="panel-sub">服饰日常高发措辞 · 复用于声场预发</div></div></div>
          <div class="comply-legend">
            <span><i style="background:#d64545"></i>违禁词 · 强制删除</span>
            <span><i style="background:#d8b13a"></i>广告标识</span>
            <span><i style="background:#e07a2f"></i>敏感词</span>
          </div>
          <div class="comply-lines">${rules}</div>
        </div>
      </div>
      <div class="panel" style="margin-top:16px" data-comply-result hidden>
        <div class="panel-head"><div><div class="panel-title">预检结果</div><div class="panel-sub"></div></div><span class="badge red">需处理</span></div>
        <div class="comply-lines" data-comply-hits></div>
      </div>`;
  }

  function renderTouchBatch() {
    const stages = ["待接单", "进行中", "已提交", "待审核", "已完成"];
    const pctMap = { "进行中": 55, "待接单": 8, "已提交": 72, "待审核": 88, "已完成": 100 };
    const cols = stages.map((st) => {
      const items = DB.batchProjects.filter((b) => b.stage === st);
      const cards = items.map((b) => {
        const pct = pctMap[st];
        return `<div class="kb-card" data-batch-item="${b.talent}">
          <div class="kb-t">${b.talent}</div>
          <div class="kb-i">${b.item}</div>
          <div class="kb-meta"><span>${b.fans} 粉</span><span class="kb-price">${b.price}</span></div>
          <div class="kb-meta"><span>${b.draft}</span><span>改 ${b.rounds} 轮</span></div>
          <div class="progress"><i style="width:${pct}%"></i></div>
          <div class="kb-meta"><span>截止 ${b.deadline}</span><span>${pct}%</span></div>
          <div class="kb-actions">
            <button class="btn ghost" data-batch-urge="${b.talent}">催稿</button>
            <button class="btn ghost" data-batch-pass="${b.talent}">通过</button>
            <button class="btn ghost" data-batch-reject="${b.talent}" style="color:var(--accent)">驳回</button>
          </div>
        </div>`;
      }).join("");
      const head = st === "进行中"
        ? `<div class="kb-head"><span>${st} <b>${items.length}</b></span><button class="btn primary small" data-batch-all style="height:24px;padding:0 10px;font-size:11px">一键催稿</button></div>`
        : `<div class="kb-head"><span>${st}</span><b>${items.length}</b></div>`;
      return `<div class="kb-col">${head}${cards || "<div style=\"font-size:11px;color:var(--faint);padding:10px\">暂无</div>"}</div>`;
    }).join("");

    // 智能助手：驳回次数多 / 内容不合格率高的达人
    const risks = DB.batchProjects
      .filter((b) => b.rejects > 0)
      .sort((a, b) => b.rejects - a.rejects);
    const riskRows = risks.length
      ? risks.map((t) => {
          const fn = parseFloat(t.failRate);
          const levelCls = fn >= 50 ? "danger" : (fn >= 20 ? "warn" : "ok");
          return `<div class="risk-row">
            <div class="risk-main">
              <div class="risk-name">${t.talent}<span class="risk-item">${t.item} · ${t.fans} 粉</span></div>
              <div class="risk-stats"><span class="risk-badge danger">驳回 ${t.rejects} 次</span><span class="risk-badge ${levelCls}">不合格率 ${t.failRate}</span></div>
            </div>
            <div class="risk-note">${t.riskNote || "跟进交稿节点与拍摄口径，降低反复修改成本"}</div>
            <button class="btn primary small" data-batch-talk="${t.talent}">去蒲公英沟通</button>
          </div>`;
        }).join("")
      : "<div style=\"font-size:12px;color:var(--muted);padding:12px\">当前无高风险达人，稿件质量整体平稳 ✓</div>";

    return `
      <div class="panel">
        <div class="panel-head">
          <div><div class="panel-title">达人合作批量管理看板</div><div class="panel-sub">按阶段看进度，支持催稿 / 通过 / 驳回 · 一键催稿在进行中板块</div></div>
        </div>
        <div class="kanban">${cols}</div>
      </div>
      <div class="panel" style="margin-top:18px">
        <div class="panel-head">
          <div><div class="panel-title">智能助手 · 稿件质量分析</div><div class="panel-sub">驳回次数多 / 内容不合格率高的达人，跳转蒲公英及时沟通</div></div>
          <span class="badge amber">${risks.length} 位需关注</span>
        </div>
        ${riskRows}
      </div>`;
  }

  /* ---------- 声场 · 内容矩阵 ---------- */
  function renderSound() {
    const tabs = [["matrix", "账号矩阵"], ["schedule", "分发调度"], ["occupy", "搜索占位"], ["longtail", "长尾追踪"], ["recycle", "效果回收"]];
    const btns = tabs.map(([k, v]) => `<button class="${UI.soundTab === k ? "is-on" : ""}" data-stab="${k}">${v}</button>`).join("");
    const body = {
      matrix: renderSoundMatrix, schedule: renderSoundSchedule, occupy: renderSoundOccupy,
      longtail: renderSoundLongtail, recycle: renderSoundRecycle,
    }[UI.soundTab]();
    const m = DB.brandMatrix;
    return `
      <div class="page-head">
        <p class="kicker">SOUNDFIELD · 内容矩阵</p>
        <h2>声场</h2>
        <p class="desc">每一个品牌的声音，从这里出发</p>
      </div>
      <div class="module-tabs" id="sound-tabs" style="margin-bottom:18px">${btns}</div>
      <div id="sound-body">${body}</div>`;
  }

  function renderSoundMatrix() {
    const m = DB.brandMatrix;
    const summary = m.summary.map((s) => `
      <div class="ms-item">
        <div class="ms-type"><span class="dot" style="background:${s.type.includes("门店") ? "#2C6FA6" : s.type.includes("导购") ? "#B07C2F" : s.type.includes("种草") ? "#3A7D44" : s.type.includes("包袋") ? "#8B5E3C" : "#C0392B"}"></span>${s.type}</div>
        <div class="ms-stats">${s.n} 个号 · ${s.fans} 粉 · ${s.notes} 篇/月<br>互动 ${s.inter} · ${s.gmv}</div>
      </div>`).join("");

    const accounts = m.accounts.map((a) => `
      <tr>
        <td><span class="acc-avatar" style="background-image:url('./assets/aurora-badge.jpg')"></span>${a.type}</td>
        <td><b>${a.name}</b><div style="font-size:11.5px;color:var(--muted);margin-top:2px">${a.desc}</div></td>
        <td>${a.fans}</td>
        <td>${a.notes}</td>
        <td>${a.inter}</td>
        <td style="color:${a.gmv === "未知" ? "var(--muted)" : "var(--accent)"};font-weight:${a.gmv === "未知" ? "500" : "600"}">${a.gmv}</td>
      </tr>`).join("");

    const routes = DB.brandMatrix.storeRoutes.map((r) => `
      <div class="metric" style="padding:12px">
        <div class="m-label">${r.store}</div>
        <div class="m-val" style="font-size:20px">${r.total}<span style="font-size:11px;color:var(--muted)"> 条</span></div>
        <div style="font-size:11px;color:var(--muted);margin-top:4px">到店 ${r.toStore} · 购买 ${r.buy} · 模糊 ${r.fuzzy}</div>
        <div class="m-delta up">成交 ${r.deal} 单</div>
      </div>`).join("");

    const comments = DB.brandMatrix.comments.map((c) => {
      const badge = c.intent === "buy" ? '<span class="badge red">购买意向</span>'
        : c.intent === "store" ? '<span class="badge blue">到店意向</span>'
        : '<span class="badge gray">模糊意向</span>';
      return `<div class="comment">
        <div class="cm-top"><span class="cm-user">${c.user}</span>
        <span>${badge} <span style="font-size:10.5px;color:var(--faint)">置信 ${(c.conf * 100).toFixed(0)}%</span></span></div>
        <div class="cm-text">${c.text}</div>
        <div class="cm-store">📍 ${c.store}店</div>
      </div>`;
    }).join("");

    const beat = DB.contentBeat.map((b) => `
      <div class="beat-row">
        <div class="br-day">${b.day}</div>
        <div class="br-time">${b.time}</div>
        <div><div class="br-dir">${b.dir}</div>
        <div class="br-kw">关键词：${b.kw}</div><div class="br-note">${b.note}</div></div>
      </div>`).join("");

    const copy = DB.contentLib.map((c) => `
      <div class="copy-card">
        <div class="cp-quote">”</div>
        <div class="cp-tag">${c.tag}</div>
        <div class="cp-headline">${c.headline}</div>
        <div class="cp-desc">${c.desc}</div>
        <div class="cp-gold">✦ ${c.gold}</div>
        <div style="margin-top:14px;display:flex;gap:8px">
          <button class="btn primary small" data-publish="${c.name}">选择账号发布</button>
          <button class="btn ghost small" data-copy="${c.name}">复制文案</button>
        </div>
      </div>`).join("");

    return `
      <div class="panel" style="margin-bottom:18px">
        <div class="panel-head"><div><div class="panel-title">品牌账号矩阵总览</div><div class="panel-sub">${m.brand.stores}</div></div><span class="panel-tag">${m.accounts.length} 个账号</span></div>
        <div class="matrix-summary">${summary}</div>
        <table class="acc-table"><thead><tr><th>类型</th><th>账号 / 定位</th><th>粉丝</th><th>频率</th><th>互动</th><th>GMV</th></tr></thead><tbody>${accounts}</tbody></table>
      </div>

      <div class="card-grid g-2">
        <div class="panel">
          <div class="panel-head"><div><div class="panel-title">门店评论智能路由</div><div class="panel-sub">AI 实时识别购买/到店/模糊意向，自动分配导购跟进</div></div></div>
          <div class="metric-row" style="margin-bottom:14px">${routes}</div>
          <div class="comment-feed">${comments}</div>
        </div>
        <div class="panel">
          <div class="panel-head"><div><div class="panel-title">内容节拍 · 本周推送</div><div class="panel-sub">品牌 × 达人协同分发节奏</div></div></div>
          <div>${beat}</div>
        </div>
      </div>

      <div class="panel" style="margin-top:18px">
        <div class="panel-head"><div><div class="panel-title">内容笔记文库 · 单品文案</div><div class="panel-sub">一键打call优质文案，可直接二次创作或选择账号发布</div></div></div>
        <div class="card-grid g-2">${copy}</div>
      </div>`;
  }

  function renderSoundSchedule() {
    const days = DB.scheduleDays;
    const cols = days.map((d) => {
      const items = DB.scheduleSeed.filter((s) => s.day === d);
      const cards = items.map((s) => `
        <div class="sched-item ${s.status === "已发布" ? "done" : ""}">
          <div class="dh" title="拖动排序">⠿</div>
          <div class="d-day">${s.day}</div>
          <div><div class="d-item">${s.item}</div><div class="d-acct">${s.acct}</div></div>
          <div class="d-action"><span class="d-time">${s.time}</span>
          <span class="status-tag ${s.status === "已发布" ? "ok" : s.status === "待发布" ? "low" : "blank"}">${s.status}</span></div>
        </div>`).join("");
      return `<div class="kb-col"><div class="kb-head"><span>${d}</span><b>${items.length}</b></div>${cards || '<div style="font-size:11px;color:var(--faint);padding:10px">—</div>'}</div>`;
    }).join("");

    const accts = DB.scheduleAccounts.map((a) => `
      <div class="ap-row">
        <span class="ap-dot" style="background:${a.color}"></span>
        <div style="flex:1"><div style="font-size:13px;font-weight:600">${a.name}</div><div style="font-size:11px;color:var(--muted)">${a.type}</div></div>
        <span style="font-size:12px;color:var(--muted)">最佳 ${a.best}</span>
      </div>`).join("");

    const month = DB.monthSchedule.map((w) => `
      <div class="month-week">
        <div class="mw-head">
          <span class="mw-week">${w.week}</span>
          <span class="mw-theme" style="color:${w.color}">${w.theme}</span>
          <span class="mw-tag" style="background:${w.color}1f;color:${w.color}">${w.tag}</span>
        </div>
        <div class="mw-items">
          ${w.items.map((it) => `
            <div class="mw-item">
              <span class="mw-dot" style="background:${w.color}"></span>
              <div class="mw-body">
                <div class="mw-item-txt">${it.item}</div>
                <div class="mw-acct">${it.acct} · ${it.type}</div>
              </div>
              <span class="mw-time">${it.time}</span>
            </div>`).join("")}
        </div>
      </div>`).join("");

    return `
      <div class="card-grid g-2">
        <div class="panel">
          <div class="panel-head">
            <div><div class="panel-title">本周分发调度</div><div class="panel-sub">拖动条目调整排期 · 自动匹配最佳时段</div></div>
            <button class="btn primary small" data-sched-auto>🤖 智能排期</button>
          </div>
          <div style="display:flex;gap:18px;align-items:center;margin-bottom:14px;flex-wrap:wrap;font-size:12.5px;color:var(--muted)">
            <label style="display:inline-flex;align-items:center;gap:6px;cursor:pointer"><input type="checkbox" data-sched-preview checked> 发布前合规预检</label>
            <label style="display:inline-flex;align-items:center;gap:6px;cursor:pointer"><input type="checkbox" data-sched-auto-pub checked> 定时自动发布</label>
          </div>
          <div class="kanban" style="grid-template-columns:repeat(7,1fr)">${cols}</div>
          <div class="cross-note" style="margin-top:14px">📌 广告笔记支持多平台并行分发（小红书 + 天猫 + 京东）；种草笔记默认站内单发，避免稀释自然流量。</div>
        </div>
        <div class="panel">
          <div class="panel-head"><div><div class="panel-title">账号默认发布时间</div><div class="panel-sub">按粉丝活跃时段智能推荐</div></div></div>
          <div class="acct-pick">${accts}</div>
          <div class="advice-box" style="margin-top:14px">💡 「通勤大衣」搜索峰值在晚间 8-9 点，建议主号排期后置至 20:30，预计互动 +14%。</div>
        </div>
      </div>

      <div class="panel" style="margin-top:18px">
        <div class="panel-head">
          <div><div class="panel-title">本月分发调度</div><div class="panel-sub">整月内容策略 · 账号匹配 + 内容排期 · 对齐双11 / 黑五 / 感恩节节点</div></div>
          <button class="btn ghost small" data-month-auto>📅 生成本月排期</button>
        </div>
        <div class="month-grid">${month}</div>
        <div class="cross-note" style="margin-top:14px">📌 本月双轨分发：主号打大促爆发、种草号养长尾占位、导购号收线下到店，线上种草与线下承接闭环。</div>
      </div>`;
  }

  function renderSoundOccupy() {
    const rows = DB.occupyKeywords.map((k) => {
      const seg = (v, c, label) => `<span title="${label} ${v}%" style="flex:${v};background:${c}"></span>`;
      const statusCls = k.status === "达标" ? "ok" : k.status === "不足" ? "low" : "blank";
      return `
        <div class="occ-row">
          <div class="occ-kw">${k.kw}</div>
          <div class="occ-bar">
            <div class="bar-track" style="width:100%">${seg(k.own, "#C0392B", "自有")}${seg(k.comp, "#B07C2F", "竞品")}${seg(k.media, "#2C6FA6", "媒介")}${seg(k.blank, "#e0d8ce", "空白")}</div>
            <div style="font-size:10.5px;color:var(--muted);margin-top:4px">搜索 ${k.search} · 自有 ${k.own}% · 竞品 ${k.comp}% · 媒介 ${k.media}% · 空白 ${k.blank}%</div>
          </div>
          <div class="occ-status"><span class="status-tag ${statusCls}">${k.status}</span></div>
          <button class="btn ghost small" data-occupy-fill="${k.kw}">补位</button>
        </div>`;
    }).join("");

    const need = DB.occupyKeywords.filter((k) => k.status !== "达标");
    return `
      <div class="card-grid g-2">
        <div class="panel">
          <div class="panel-head"><div><div class="panel-title">搜索占位监控</div><div class="panel-sub">目标关键词搜索结果页 TOP20 占比拆解</div></div><span class="badge blue">${DB.occupyKeywords.length} 个监控词</span></div>
          <div class="occ-legend">
            <span><i style="background:#C0392B"></i>自有内容</span>
            <span><i style="background:#B07C2F"></i>竞品内容</span>
            <span><i style="background:#2C6FA6"></i>媒介 / 达人</span>
            <span><i style="background:#e0d8ce"></i>空白位</span>
          </div>
          ${rows}
        </div>
        <div class="panel">
          <div class="panel-head"><div><div class="panel-title">TOP20 空白位补位建议</div><div class="panel-sub">点击补位自动生成占位选题并排入分发调度</div></div></div>
          <div class="advice-box" style="margin-bottom:14px">💡 「静奢风」与「羊绒大衣」自有占比不足 20%，属高价值空白词，建议优先补位。</div>
          <div class="query-list">
            ${need.map((k) => `
              <div class="query-card"><div class="q">「${k.kw}」</div>
              <div class="q-stats"><div class="qs"><div class="k">搜索量</div><div class="v">${k.search}</div></div>
              <div class="qs"><div class="k">自有占比</div><div class="v" style="color:var(--accent)">${k.own}%</div></div></div>
              <div class="q-note">建议补位内容：${k.kw} · 场景化种草 + 参数测评</div></div>`).join("")}
          </div>
        </div>
      </div>`;
  }

  function renderSoundLongtail() {
    const cards = DB.longtailNotes.map((n) => {
      const tag = n.status === "潜力" ? '<span class="lt-tag rise">↑ 潜力</span>' : '<span class="lt-tag fall">↓ 衰退</span>';
      const sparkColor = n.status === "潜力" ? "#3A7D44" : "#B07C2F";
      return `
        <div class="lt-card">
          <div class="lt-top">
            <div><div class="lt-note">${n.note}</div><div class="lt-meta">${n.acct} · 关键词「${n.kw}」</div></div>
            ${tag}
          </div>
          <div class="metric-row">
            <div class="metric" style="padding:10px"><div class="m-label">7/14/30d 排名</div><div class="m-val" style="font-size:17px">${n.rank.join(" → ")}</div></div>
            <div class="metric" style="padding:10px"><div class="m-label">互动率</div><div class="m-val" style="font-size:17px">${n.inter}</div></div>
            <div class="metric" style="padding:10px"><div class="m-label">类目均值</div><div class="m-val" style="font-size:17px">${n.avg}</div></div>
          </div>
          <div style="margin-top:8px">${sparklineSvg(n.rank.slice().reverse(), sparkColor)}</div>
          <div class="kb-actions" style="margin-top:10px">
            ${n.status === "潜力" ? `<button class="btn primary" data-lt-heat="${n.note}">🍟 薯条加热</button>` : `<button class="btn ghost" data-lt-refresh="${n.note}">↻ 内容翻新</button>`}
            <button class="btn ghost" data-lt-detail="${n.note}">详情</button>
          </div>
        </div>`;
    }).join("");

    return `
      <div class="panel">
        <div class="panel-head"><div><div class="panel-title">长尾流量追踪</div><div class="panel-sub">追踪笔记在搜索端 7/14/30 天排名与互动曲线，识别可加热的潜力内容</div></div><span class="badge green">${DB.longtailNotes.filter((n) => n.status === "潜力").length} 篇潜力</span></div>
        <div style="display:flex;gap:14px;margin-bottom:14px;font-size:11.5px;color:var(--muted)">
          <span><i style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#3A7D44;margin-right:4px"></i>排名上升（潜力）</span>
          <span><i style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#B07C2F;margin-right:4px"></i>排名下滑（衰退）</span>
        </div>
        <div class="card-grid g-2">${cards}</div>
      </div>`;
  }

  function renderSoundRecycle() {
    const summary = DB.recycleSummary.map((s) => `
      <div class="metric" style="padding:14px"><div class="m-label">${s.label}</div><div class="m-val" style="font-size:22px">${s.val}</div></div>`).join("");
    const byAccount = DB.recycleByAccount.map((a) => `
      <tr><td><b>${a.acct}</b></td><td>${a.publish}</td><td>${a.inter}</td><td>${a.occupy}</td><td style="color:var(--green);font-weight:600">${a.roi}</td></tr>`).join("");
    return `
      <div class="panel" style="margin-bottom:18px">
        <div class="panel-head"><div><div class="panel-title">分发效果回收</div><div class="panel-sub">矩阵分发 30 天整体回收</div></div></div>
        <div class="rc-grid">${summary}</div>
      </div>
      <div class="panel">
        <div class="panel-head"><div><div class="panel-title">按账号拆解</div><div class="panel-sub">导出周报用于复盘</div></div><button class="btn primary small" data-recycle-export>📄 导出周报</button></div>
        <table class="acc-table"><thead><tr><th>账号</th><th>发布</th><th>互动量</th><th>占位提升</th><th>ROI</th></tr></thead><tbody>${byAccount}</tbody></table>
      </div>`;
  }

  /* ---------- 回声 · 归因 ---------- */
  function renderEcho() {
    const a = DB.attribution;
    const total = a.donut.reduce((s, x) => s + x.val, 0);
    const donutItems = a.donut.map((x) => ({ ...x, pct: (x.val / total) * 100 }));
    const legend = a.donut.map((x) =>
      `<div class="dl"><i style="background:${x.color}"></i>${x.ch} <b style="margin-left:auto">${x.pct}%</b></div>`).join("");

    const rows = a.rows.map((r) => `
      <tr><td>${r.ch}</td><td>${r.read}</td><td>${r.uv}</td><td>${r.cart}</td><td style="color:var(--accent);font-weight:600">${r.gmv}</td><td>${r.window}</td></tr>`).join("");

    const detail = a.detail.map((d) => `
      <div class="query-card"><div class="q">${d.k}</div><div class="q-note">${d.desc}</div></div>`).join("");

    const queries = DB.attributionQueries.map((q) => `
      <div class="query-card">
        <div class="q">「${q.q}」</div>
        <div class="q-stats">
          <div class="qs"><div class="k">投放成本</div><div class="v">${q.cost}</div></div>
          <div class="qs"><div class="k">站外成交</div><div class="v">${q.outside}</div></div>
          <div class="qs"><div class="k">综合 ROI</div><div class="v" style="color:var(--green)">${q.roi}</div></div>
        </div>
        <div class="q-note">${q.note}</div>
      </div>`).join("");

    const live = DB.liveData;
    const maxVal = Math.max(...live.series);
    const bars = live.series.map((v, i) =>
      `<div class="lb" style="height:${(v / maxVal * 100).toFixed(0)}%;${i === live.series.length - 2 ? "opacity:.55" : ""}"></div>`).join("");

    const liveAlerts = live.alerts.map((n) =>
      `<div class="live-alert ${n.level}"><span>${n.level === "high" ? "🚨" : "⚠️"}</span>
      <div><div style="font-size:13px">${n.msg}</div><div class="n-time">${n.time}</div></div></div>`).join("");

    const totalGmv = total.toLocaleString();

    return `
      <div class="page-head">
        <p class="kicker">ECHO · 归因</p>
        <h2>回声</h2>
        <p class="desc">把每一次种草，折算成看得见、花得值的成交结果。</p>
      </div>

      <div class="card-grid g-2">
        <div class="panel">
          <div class="panel-head"><div><div class="panel-title">全域成交归因</div><div class="panel-sub">本月品牌 GMV 渠道构成</div></div></div>
          <div class="donut-wrap">
            <div class="donut">${donut(donutItems)}
              <div class="donut-center"><div class="dc-val">¥${totalGmv}</div><div class="dc-lbl">总成交额</div></div>
            </div>
            <div class="donut-legend">${legend}</div>
          </div>
          <table class="attr-table"><thead><tr><th>渠道</th><th>阅读</th><th>进店UV</th><th>加购</th><th>GMV</th><th>归因窗口</th></tr></thead><tbody>${rows}</tbody></table>
          <div class="advice-box">💡 ${a.advice}</div>
        </div>

        <div class="panel">
          <div class="panel-head"><div><div class="panel-title">智能归因 · 自然语言查询</div><div class="panel-sub">像聊天一样问出：投放效果 / 内容创意 / 营销节点 / 内容形式</div></div></div>
          <div class="query-list">${queries}</div>
          <div style="margin-top:14px;display:flex;gap:8px">
            <input class="ql-input" style="flex:1;height:42px;border:1px solid var(--line);border-radius:12px;padding:0 14px;background:#fffcfa;outline:none" placeholder="试试：九月份秋冬上新那波投得怎么样？" data-attr-input>
            <button class="btn primary" data-attr-ask>询问</button>
          </div>
          <div class="ql-hints">
            <span>可问：</span>
            <button class="ql-hint" data-ql-hint="attr">投放效果</button>
            <button class="ql-hint" data-ql-hint="idea">内容创意</button>
            <button class="ql-hint" data-ql-hint="node">营销节点</button>
            <button class="ql-hint" data-ql-hint="format">内容形式</button>
          </div>
        </div>
      </div>

      <div class="card-grid g-2" style="margin-top:18px">
        <div class="panel">
          <div class="panel-head"><div><div class="panel-title">直播护航</div><div class="panel-sub">直播间实时体征与 AI 告警</div></div><span class="badge green">直播中</span></div>
          <div class="live-metrics">
            <div class="metric"><div class="m-label">GMV</div><div class="m-val">${live.gmv}</div></div>
            <div class="metric"><div class="m-label">在线人数</div><div class="m-val">${live.online}</div></div>
            <div class="metric"><div class="m-label">加购率</div><div class="m-val">${live.cartRate}</div></div>
            <div class="metric"><div class="m-label">每分钟成交</div><div class="m-val">${live.gpm}</div></div>
          </div>
          <div style="font-size:11px;color:var(--muted);margin-bottom:8px">近 12 分钟在场人数趋势</div>
          <div class="live-bar">${bars}</div>
          <div style="margin-top:14px">${liveAlerts}</div>
          <div class="panel" style="margin-top:14px;background:#f5f8fc;border:1px solid rgba(44,111,166,0.28);box-shadow:none">
            <div class="panel-head"><div><div class="panel-title" style="color:var(--blue)">⛵ 千帆联调</div><div class="panel-sub">GPM 告警 → 一键携带参数跳转直播间</div></div><button class="qf-btn" data-qf>去千帆</button></div>
            <div class="qf-params">直播间 ID <b>live_928374</b> · 主推 SPU <b>羊绒大衣 Aurora 晨曦系列</b></div>
            <div class="qf-params">券面额建议 <b>¥300 满 ¥1800 减</b> · 目标 GPM <b>¥1,350</b></div>
          </div>
        </div>

        <div class="panel">
          <div class="panel-head"><div><div class="panel-title">归因深度拆解</div><div class="panel-sub">单达人 / 笔记 / 关键词级下钻 · 全量归因</div></div><span class="panel-tag">全量归因包 ¥2999/月</span></div>
          <div class="query-list">${detail}</div>
          <div style="margin-top:14px;display:flex;gap:10px;align-items:center">
            <button class="btn primary" data-deepdive>进入深度拆解 · 归因工作台 →</button>
            <span style="font-size:12px;color:var(--muted)">5 种下钻模式 · 25+ 交互图表 · AI 解读助手</span>
          </div>
        </div>
      </div>`;
  }

  /* ---------- 商投 ---------- */
  function renderBiz() {
    const cards = DB.bizPlatforms.map((b) => `
      <div class="panel biz-card" data-biz="${b.name}">
        <div class="c-top"><div class="bz-ico" style="background:${b.color}18">${b.icon}</div></div>
        <div class="bz-name">${b.name}</div>
        <div class="bz-desc">${b.desc}</div>
        <div class="bz-metric" style="color:${b.color}">${b.metric}</div>
        <div class="bz-sub">${b.sub}</div>
        <div class="bz-roi">${b.roi}</div>
        <div style="margin-top:12px"><button class="btn small" style="width:100%;justify-content:center">${b.action} →</button></div>
      </div>`).join("");

    return `
      <div class="page-head">
        <p class="kicker">BIZ HUBS</p>
        <h2>商业平台</h2>
        <p class="desc">所有商业一键触达</p>
      </div>
      <div class="biz-grid">${cards}</div>`;
  }

  /* ---------- 策略 ---------- */
  function renderStrategy() {
    const planStats = DB.plans.map((p) => `
      <div class="plan-card">
        <div class="p-name">${p.name}</div>
        <div class="p-price" style="color:${p.color}">${p.price}</div>
        <div class="p-sub" style="font-size:11px;color:var(--muted)">本周期开通商户</div>
        <div class="m-val" style="font-size:24px;font-weight:700">${p.id === "free" ? "1,204" : p.id === "insight" ? "386" : "142"} 家</div>
      </div>`).join("");

    return `
      <div class="page-head">
        <p class="kicker">PLATFORM CONSOLE</p>
        <h2>平台策略后台</h2>
        <p class="desc">仅平台运营与代理商可见：付费分级、行业定价与商家运营数据。</p>
      </div>
      <div class="card-grid g-3" style="margin-bottom:18px">${planStats}</div>

      <div class="card-grid g-2">
        <div class="panel">
          <div class="panel-head"><div><div class="panel-title">行业定价建议</div><div class="panel-sub">代理商批发折扣参考</div></div></div>
          <table class="spill-table"><thead><tr><th>行业</th><th>标准定价</th><th>代理商折扣</th></tr></thead>
          <tbody>
            <tr><td>美妆</td><td>¥999/月</td><td style="color:var(--green)">7 折</td></tr>
            <tr><td>服饰</td><td>¥999/月</td><td style="color:var(--green)">7.5 折</td></tr>
            <tr><td>3C数码</td><td>¥2,999/月</td><td style="color:var(--green)">8 折</td></tr>
            <tr><td>家居</td><td>¥999/月</td><td style="color:var(--green)">7.5 折</td></tr>
          </tbody></table>
        </div>
        <div class="panel">
          <div class="panel-head"><div><div class="panel-title">商家运营数据</div><div class="panel-sub">平台侧核心指标</div></div></div>
          <div class="metric-row">
            <div class="metric"><div class="m-label">入驻品牌</div><div class="m-val">8,420</div></div>
            <div class="metric"><div class="m-label">付费渗透率</div><div class="m-val">17.2%</div></div>
            <div class="metric"><div class="m-label">ARPU</div><div class="m-val">¥1,840</div></div>
            <div class="metric"><div class="m-label">月 GMV</div><div class="m-val">¥1.2亿</div></div>
          </div>
        </div>
      </div>`;
  }

  /* ---------- 设置 ---------- */
  function renderSettings() {
    const p = S.profile;
    const industries = DB.industries.map((x) => `<option value="${x.id}" ${x.id === p.industryId ? "selected" : ""}>${x.icon} ${x.name}</option>`).join("");
    const roles = DB.roles.map((x) => `<option value="${x.id}" ${x.id === p.roleId ? "selected" : ""}>${x.name}</option>`).join("");
    const marketsSel = DB.markets.map((x) =>
      `<span class="ob-chip ${p.markets.includes(x) ? "is-on" : ""}" data-mk="${x}"><span class="c-name">${x}</span></span>`).join("");

    const plans = DB.plans.map((pl) => `
      <div class="plan-card ${p.plan === pl.id ? "is-current" : ""}">
        ${p.plan === pl.id ? '<span class="badge red current-tag">当前</span>' : ""}
        <div class="p-name">${pl.name}</div>
        <div class="p-price" style="color:${pl.color}">${pl.price}</div>
        <ul class="p-ul">${pl.features.map((f) => `<li>· ${f}</li>`).join("")}</ul>
        ${p.plan === pl.id ? "" : `<button class="btn primary small" data-upgrade="${pl.id}">订阅</button>`}
      </div>`).join("");

    return `
      <div class="page-head">
        <p class="kicker">SETTINGS</p>
        <h2>品牌档案 · 设置</h2>
        <p class="desc">全局上下文与订阅管理。</p>
      </div>

      <div class="card-grid g-2">
        <div class="panel">
          <div class="panel-head"><div class="panel-title">品牌信息</div></div>
          <div class="form-field"><label>品牌名称</label><input id="set-name" value="${p.name}"></div>
          <div class="form-field"><label>主营行业</label><select id="set-industry">${industries}</select></div>
          <div class="form-field"><label>身份角色</label><select id="set-role">${roles}</select></div>
          <div class="form-field"><label>目标市场（点击切换）</label><div class="ob-market-grid" id="set-markets">${marketsSel}</div></div>
          <button class="btn primary" data-save-settings>保存修改</button>
        </div>
        <div class="panel">
          <div class="panel-head"><div><div class="panel-title">付费分级订阅</div><div class="panel-sub">按需解锁洞察/归因能力</div></div></div>
          <div class="plan-grid" style="grid-template-columns:1fr">${plans}</div>
        </div>
      </div>`;
  }

  /* ============================================================
     渲染注册表 + 交互挂载
     ============================================================ */

  const RENDER = {
    prism: renderPrism, touch: renderTouch, sound: renderSound,
    echo: renderEcho, biz: renderBiz, strategy: renderStrategy, settings: renderSettings,
    deepdive: () => window.DeepDive ? window.DeepDive.render() : "",
  };

  const MOUNT = {
    prism: mountPrism, touch: mountTouch, sound: mountSound,
    echo: mountEcho, biz: mountBiz, settings: mountSettings,
    deepdive: () => { if (window.DeepDive) window.DeepDive.mount(); },
  };

  function mountPrism() {
    const tabs = $("prism-tabs");
    const PANELS = { domestic: "prism-domestic", global: "prism-global", briefing: "prism-briefing" };
    tabs.onclick = (e) => {
      const btn = e.target.closest("[data-tab]");
      if (!btn) return;
      UI.prismTab = btn.dataset.tab;
      tabs.querySelectorAll("button").forEach((b) => b.classList.toggle("is-on", b === btn));
      Object.entries(PANELS).forEach(([k, id]) => { $(id).hidden = k !== btn.dataset.tab; });
    };
    const view = $("module-view");
    view.querySelectorAll(".crowd-card").forEach((c) => c.onclick = () => openCrowd(c.dataset.crowd));
    view.querySelectorAll("[data-region]").forEach((r) => r.onclick = () => openRegion(r.dataset.region));
    view.querySelectorAll("[data-risk]").forEach((b) => b.onclick = () => {
      const m = b.dataset.risk;
      const i = UI.avoidRisks.indexOf(m);
      if (i >= 0) {
        UI.avoidRisks.splice(i, 1);
        toast(`已取消规避「${m}」市场敏感词`);
      } else {
        UI.avoidRisks.push(m);
        toast(`已规避「${m}」市场敏感词，后续跨境文案将自动避用`);
      }
      render();
    });
    const avoidClear = view.querySelector("[data-avoid-clear]");
    if (avoidClear) avoidClear.onclick = () => { UI.avoidRisks = []; toast("已清空雷区规避设置"); render(); };
    view.querySelectorAll(".wk").forEach((el) => el.onclick = () => {
      const rid = el.dataset.rid;
      UI.mapSel = UI.mapSel === rid ? null : rid;
      render();
    });
    view.querySelectorAll("[data-spill]").forEach((r) => r.onclick = () => openSpill(r.dataset.spill));
    view.querySelectorAll("[data-neg]").forEach((w) => w.onclick = () => openNegWord(w.dataset.neg));
    const all = view.querySelector("[data-neg-all]");
    if (all) all.onclick = () => openDrawer("负面舆情词库", negDrawerHtml());
    view.querySelectorAll("[data-neg-days]").forEach((s) => s.onchange = () => { UI.negDays = s.value; render(); });
    view.querySelectorAll("[data-neg-cat]").forEach((s) => s.onchange = () => { UI.negCat = s.value; render(); });
    view.querySelectorAll("[data-neg-chan]").forEach((s) => s.onchange = () => { UI.negChan = s.value; render(); });
    view.querySelectorAll("[data-adopt]").forEach((b) => b.onclick = () => adoptBeat(parseInt(b.dataset.adopt, 10)));
    const rf = view.querySelector("[data-refresh-beat]");
    if (rf) rf.onclick = () => toast("内容节拍已刷新（演示）");
    view.querySelectorAll("[data-lang]").forEach((b) => b.onclick = () => {
      UI.crossLang = b.dataset.lang;
      view.querySelectorAll("[data-lang]").forEach((x) => x.classList.toggle("is-on", x.dataset.lang === UI.crossLang));
      refreshCross(view);
    });
    view.querySelectorAll("[data-cross-product]").forEach((b) => b.onclick = () => {
      const p = DB.crossProducts.find((x) => x.id === b.dataset.crossProduct);
      const input = view.querySelector("[data-cross-input]");
      if (p) { input.value = p.zh; refreshCross(view, p); }
    });
    const crossGen = view.querySelector("[data-cross-gen]");
    if (crossGen) crossGen.onclick = () => {
      const input = view.querySelector("[data-cross-input]");
      refreshCross(view, findCrossProduct(input.value));
    };
    const crossCopy = view.querySelector("[data-cross-copy]");
    if (crossCopy) crossCopy.onclick = () => {
      const ta = view.querySelector("[data-cross-copy]");
      copyToClipboard(ta ? ta.value : "");
    };
    const crossPub = view.querySelector("[data-cross-publish]");
    if (crossPub) crossPub.onclick = () => openCrossPublish(view);
    const briefRoot = $("prism-briefing");
    if (briefRoot) mountBriefing(briefRoot);
  }

  function mountBriefing(root) {
    root.onclick = (e) => {
      const el = (sel) => e.target.closest(sel);

      const goBtn = el("[data-brief-go]");
      if (goBtn) {
        UI.briefTrend = goBtn.dataset.briefGo;
        refreshBriefing();
        if (window.openLocalizeModal) window.openLocalizeModal(goBtn.dataset.briefGo);
        return;
      }

      const trendBtn = el("[data-brief-trend]");
      if (trendBtn) {
        UI.briefTrend = trendBtn.dataset.briefTrend;
        refreshBriefing();
        return;
      }

      const varBtn = el("[data-brief-var]");
      if (varBtn) {
        UI.briefVar = varBtn.dataset.briefVar;
        refreshBriefing();
        return;
      }

      const srcBtn = el("[data-brief-src]");
      if (srcBtn) {
        toggleBriefSource(srcBtn.dataset.briefSrc);
        refreshBriefing();
        return;
      }

      const catBtn = el("[data-brief-cat]");
      if (catBtn) {
        UI.briefCat = catBtn.dataset.briefCat;
        refreshBriefing();
        return;
      }

      if (el("[data-brief-run]")) {
        toast("已一键生成本土化内容草稿（演示）");
        return;
      }

      const copyVar = el("[data-brief-copyvar]");
      if (copyVar) {
        const t = currentBriefTrend();
        copyToClipboard(t.titleVar[UI.briefVar] || t.titleVar.dry);
        return;
      }

      const topicCopy = el("[data-topic-copy]");
      if (topicCopy) {
        const t = currentBriefTrend();
        const tp = t.topics[parseInt(topicCopy.dataset.topicCopy, 10)];
        if (tp) copyToClipboard(`${tp.title}\n封面：${tp.cover}\n${tp.script.map(([k, v]) => k + "：" + v).join("\n")}\n${tp.tags.join(" ")}`);
        return;
      }

      if (el("[data-culture-light]")) {
        openComplianceDetail();
        return;
      }
    };
    mountMoodboard(root);
    mountHelix(root);
  }

  function mountMoodboard(root) {
    if (!root) return;
    if (_moodRAF) { cancelAnimationFrame(_moodRAF); _moodRAF = null; }
    const stage = root.querySelector("#mb-stage");
    const ringA = root.querySelector(".mb-ring-a");
    const ringB = root.querySelector(".mb-ring-b");
    if (!stage || !ringA || !ringB) return;
    const slidesA = Array.from(ringA.querySelectorAll(".mb-slide"));
    const slidesB = Array.from(ringB.querySelectorAll(".mb-slide"));
    const stp = (n) => (n ? 360 / n : 0);
    const cfg = [
      { ring: ringA, slides: slidesA, tilt: -7, step: stp(slidesA.length), phase: 0, dir: 1, rot: 0 },
      { ring: ringB, slides: slidesB, tilt: 7, step: stp(slidesB.length), phase: stp(slidesB.length) / 2, dir: -1, rot: 180 },
    ];
    cfg.forEach((c) => c.slides.forEach((s, i) => {
      const ang = (i * c.step + c.phase) * Math.PI / 180;
      const lift = Math.sin(ang) * MOOD_HELIX * c.dir;
      s.style.transform = `translateY(${lift.toFixed(1)}px) rotateY(${(i * c.step + c.phase).toFixed(2)}deg) translateZ(${MOOD_RADIUS}px)`;
    }));

    const state = root._mbState || (root._mbState = { gx: 0, gy: 0, tx: 0, ty: 0, bound: false });
    if (!state.bound) {
      state.bound = true;
      root.addEventListener("pointermove", (e) => {
        const st = root.querySelector("#mb-stage");
        const r = st ? st.getBoundingClientRect() : null;
        if (!r || !r.width) return;
        state.tx = ((e.clientX - r.left) / r.width - 0.5) * 16;
        state.ty = ((e.clientY - r.top) / r.height - 0.5) * -12;
      });
      root.addEventListener("pointerleave", () => { state.tx = 0; state.ty = 0; });
    }

    const applySlide = (s, d) => {
      const img = s.querySelector("img");
      const far = Math.min(1, Math.max(0, 1 - d));
      s.style.opacity = (0.42 + 0.58 * d).toFixed(3);
      if (!img) return;
      if (far < 0.03) img.style.filter = "none";
      else {
        const blur = (far * 6.5).toFixed(2);
        const fr = (far * 5).toFixed(2);
        img.style.filter = `blur(${blur}px) saturate(1.22) contrast(1.06) drop-shadow(${fr}px 0 1px rgba(255,50,96,.6)) drop-shadow(${-fr}px 0 1px rgba(52,158,255,.6))`;
      }
    };

    const tick = () => {
      if (!root.isConnected) { _moodRAF = null; return; }
      state.gx += (state.tx - state.gx) * 0.06;
      state.gy += (state.ty - state.gy) * 0.06;
      for (const c of cfg) {
        c.rot -= 0.32;
        const ringRotY = c.rot + state.gx;
        c.ring.style.transform = `rotateX(${(c.tilt + state.gy).toFixed(2)}deg) rotateY(${ringRotY.toFixed(2)}deg)`;
        c.slides.forEach((s, i) => {
          const total = i * c.step + c.phase + ringRotY;
          applySlide(s, Math.cos(total * Math.PI / 180));
        });
      }
      _moodRAF = requestAnimationFrame(tick);
    };
    _moodRAF = requestAnimationFrame(tick);
  }

  function mountHelix(root) {
    if (!root) return;
    if (_hlxRAF) { cancelAnimationFrame(_hlxRAF); _hlxRAF = 0; }
    if (_hlxWinUp) { window.removeEventListener("pointerup", _hlxWinUp); _hlxWinUp = null; }
    const wrap = root.querySelector(".hlx");
    if (!wrap) return;
    const board = wrap.querySelector(".board");
    const stage = wrap.querySelector(".stage");
    const helix = wrap.querySelector(".helix");
    const toggle = wrap.querySelector("#toggle");
    const scrub = wrap.querySelector("#scrub");
    const dots = wrap.querySelector("#dots");
    const nowNo = wrap.querySelector("#now-no");
    const nowName = wrap.querySelector("#now-name");
    const nowNote = wrap.querySelector("#now-note");
    if (!board || !stage || !helix || !toggle || !scrub || !dots || !nowNo || !nowName || !nowNote) return;

    const FRAMES = [
      { src: "./assets/helix/01-hide.png", name: "皮纹拼贴", note: "材质 · 人像" },
      { src: "./assets/helix/02-mui-ne.png", name: "Mui Ne", note: "海边" },
      { src: "./assets/helix/03-phuclong.jpg", name: "Phuc Long", note: "绿色故事" },
      { src: "./assets/helix/04-autumn.jpg", name: "秋日俯拍", note: "时装 · 静物" },
      { src: "./assets/helix/05-blue.jpg", name: "Blue", note: "色彩拼贴" },
      { src: "./assets/helix/06-pink.jpg", name: "粉色布景", note: "棚拍" },
      { src: "./assets/helix/07-mitre.jpg", name: "Mitre", note: "地图 · 饮品" },
      { src: "./assets/helix/08-shutter.jpg", name: "红卷帘", note: "街头造型" },
      { src: "./assets/helix/09-pantone.jpg", name: "Pantone", note: "色卡 · 街头" },
    ];
    const SLOTS = 5;
    const SPEED = 0.028;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const live = (_hlxLive = { hidden: false, last: performance.now() });
    let phase = 0, playing = !reduced, pointer = null, resumeAt = 0, focus = null,
        scrubbing = false, nearIndex = -1;

    const cards = FRAMES.map((frame, i) => {
      const card = document.createElement("article");
      card.className = "card";
      card.dataset.i = String(i);
      card.innerHTML = `
        <div class="plate">
          <img class="base" alt="${frame.name}，${frame.note}" src="${frame.src}" draggable="false">
          <img class="chan red" alt="" src="${frame.src}" draggable="false">
          <img class="chan cyan" alt="" src="${frame.src}" draggable="false">
        </div>`;
      helix.appendChild(card);
      return card;
    });

    FRAMES.forEach((frame, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", frame.name);
      dot.setAttribute("aria-pressed", "false");
      dot.addEventListener("click", () => { goTo(i); hold(playing ? 1600 : Infinity); });
      dots.appendChild(dot);
    });

    function wrap01(value) { return ((value % 1) + 1) % 1; }

    function metrics() {
      const cs = getComputedStyle(stage);
      const num = (name, fallback) => {
        const value = parseFloat(cs.getPropertyValue(name));
        return Number.isFinite(value) ? value : fallback;
      };
      return {
        radius: num("--radius", 132),
        zRange: num("--z-range", 80),
        span: num("--span", 400),
        turns: Math.max(0.4, num("--turns", 1.2)),
        oppose: num("--oppose", 0.62),
        tilt: num("--tilt", 13),
      };
    }

    function phaseFor(index, m) {
      const along = Math.floor(index / 2);
      const strand = index % 2;
      const offset = strand ? Math.PI * m.oppose : 0;
      const uWant = wrap01(0.5 - offset / (Math.PI * 2 * m.turns));
      return wrap01(uWant - along / SLOTS);
    }

    function smoothstep(e0, e1, x) {
      const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
      return t * t * (3 - 2 * t);
    }

    function layout(m, p) {
      let best = -1, bestDepth = -1;
      cards.forEach((card, i) => {
        const strand = i % 2, along = Math.floor(i / 2);
        const u = wrap01(along / SLOTS + p);
        const theta = (u - 0.5) * Math.PI * 2 * m.turns + (strand ? Math.PI * m.oppose : 0);
        const rad = m.radius * (strand ? 0.84 : 1);
        const front = Math.cos(theta);
        const x = Math.sin(theta) * rad;
        const z = front * m.zRange * (strand ? 0.82 : 1);
        const y = (0.5 - u) * m.span + (strand ? 20 : -20);
        const depth = (front + 1) / 2;
        const far = 1 - depth;
        const edge = smoothstep(0, 0.1, u) * smoothstep(0, 0.1, 1 - u);
        const scale = 0.8 + Math.pow(depth, 1.35) * 0.46;
        const blur = Math.pow(far, 1.55) * 4.2;
        const shift = Math.pow(far, 1.15) * 8;
        const fringe = Math.pow(far, 1.05) * 0.82 * edge;
        const opacity = edge * (0.8 + depth * 0.2);
        const rotY = -(x / rad) * 18;
        const rotZ = (x < 0 ? 1 : -1) * m.tilt * (0.55 + depth * 0.45);
        const rotX = -6;

        card.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, ${z.toFixed(2)}px) rotateX(${rotX}deg) rotateY(${rotY.toFixed(2)}deg) rotateZ(${rotZ.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
        card.style.zIndex = String(1000 + Math.round(z));
        card.style.opacity = opacity.toFixed(3);
        card.style.setProperty("--blur", `${blur.toFixed(2)}px`);
        card.style.setProperty("--shift", `${shift.toFixed(2)}px`);
        card.style.setProperty("--fringe", fringe.toFixed(3));
        card.style.setProperty("--depth", depth.toFixed(3));

        if (edge > 0.35 && depth > bestDepth) { bestDepth = depth; best = i; }
      });

      if (best !== nearIndex && best >= 0) {
        nearIndex = best;
        cards.forEach((card, i) => card.classList.toggle("is-near", i === best));
        [...dots.children].forEach((dot, i) => dot.setAttribute("aria-pressed", i === best ? "true" : "false"));
        const frame = FRAMES[best];
        nowNo.textContent = String(best + 1).padStart(2, "0");
        nowName.textContent = frame.name;
        nowNote.textContent = frame.note;
      }
    }

    function goTo(index) {
      const m = metrics();
      const target = phaseFor(index, m);
      let delta = wrap01(target - phase);
      if (delta > 0.5) delta -= 1;
      focus = phase + delta;
    }

    function hold(ms) { resumeAt = ms === Infinity ? Infinity : performance.now() + ms; }

    function setPlaying(next) {
      playing = next;
      toggle.setAttribute("aria-pressed", playing ? "true" : "false");
      toggle.textContent = playing ? "暂停" : "继续";
      if (playing) resumeAt = 0;
    }

    function step(dir) {
      const next = (nearIndex + dir + FRAMES.length) % FRAMES.length;
      goTo(next);
      hold(playing ? 1400 : Infinity);
    }

    function frame(now) {
      const dt = Math.min(0.05, (now - live.last) / 1000);
      live.last = now;
      const m = metrics();

      if (focus !== null) {
        let delta = focus - phase;
        phase += delta * Math.min(1, dt * 4.2);
        if (Math.abs(focus - phase) < 0.0008) { phase = focus; focus = null; }
      } else if (playing && !pointer && !scrubbing && !live.hidden && now > resumeAt) {
        phase += SPEED * dt;
      }

      const shown = wrap01(phase);
      layout(m, shown);
      if (!scrubbing) scrub.value = String(Math.round(shown * 1000));
      _hlxRAF = requestAnimationFrame(frame);
    }

    helix.addEventListener("pointerdown", (event) => {
      if (event.target.closest("button, input, a")) return;
      pointer = { id: event.pointerId, y: event.clientY, phase, moved: 0 };
      helix.classList.add("is-dragging");
      helix.setPointerCapture(event.pointerId);
      focus = null;
    });
    helix.addEventListener("pointermove", (event) => {
      if (!pointer || event.pointerId !== pointer.id) return;
      const dy = event.clientY - pointer.y;
      pointer.moved = Math.max(pointer.moved, Math.abs(dy));
      phase = pointer.phase - dy / helix.clientHeight * 0.9;
    });
    function endPointer(event) {
      if (!pointer || event.pointerId !== pointer.id) return;
      const card = event.target.closest(".card");
      if (pointer.moved < 6 && card) goTo(Number(card.dataset.i));
      if (pointer.moved >= 6 && playing) hold(1500);
      pointer = null;
      helix.classList.remove("is-dragging");
    }
    helix.addEventListener("pointerup", endPointer);
    helix.addEventListener("pointercancel", endPointer);

    toggle.addEventListener("click", () => setPlaying(!playing));
    wrap.querySelector("#prev").addEventListener("click", () => step(-1));
    wrap.querySelector("#next").addEventListener("click", () => step(1));

    wrap.querySelectorAll(".fits button").forEach((button) => {
      button.addEventListener("click", () => {
        board.dataset.fit = button.dataset.fit;
        wrap.querySelectorAll(".fits button").forEach((item) => {
          item.setAttribute("aria-pressed", item === button ? "true" : "false");
        });
      });
    });

    scrub.addEventListener("pointerdown", () => { scrubbing = true; focus = null; });
    scrub.addEventListener("input", () => { phase = Number(scrub.value) / 1000; });
    _hlxWinUp = () => {
      if (!scrubbing) return;
      scrubbing = false;
      if (playing) hold(1200);
    };
    window.addEventListener("pointerup", _hlxWinUp);

    if (!_hlxVisBound) {
      _hlxVisBound = true;
      document.addEventListener("visibilitychange", () => {
        if (!_hlxLive) return;
        _hlxLive.hidden = document.hidden;
        _hlxLive.last = performance.now();
      });
    }

    phase = phaseFor(4, metrics());
    setPlaying(playing);
    _hlxRAF = requestAnimationFrame(frame);
  }

  function refreshCross(view, product) {
    const input = view.querySelector("[data-cross-input]");
    const p = product ? product : findCrossProduct(input ? input.value : "");
    const res = crossResult(p);
    const ta = view.querySelector("[data-cross-copy]");
    const zh = view.querySelector("[data-cross-meaning]");
    if (ta) ta.value = res.copy;
    if (zh) zh.value = res.meaning;
    const lbl = view.querySelector("[data-cross-langname]");
    if (lbl) { const l = DB.crossLanguages.find((x) => x.id === UI.crossLang); lbl.textContent = l ? l.name : ""; }
  }

  function openCrossPublish(view) {
    const ta = view.querySelector("[data-cross-copy]");
    const headline = (ta ? ta.value : "").slice(0, 40) + "…";
    openDrawer(`发布文案 · 跨境种草`, `
      <div class="q" style="font-size:13px;font-weight:500;margin-bottom:12px">${ta ? ta.value : ""}</div>
      <div class="panel-sub" style="margin-bottom:12px">选择要分发的品牌账号，自动进入该账号发布队列并做合规预检。</div>
      ${accountPickerHtml()}`);
    const pick = $("drawer").querySelector("[data-acct-pick]");
    if (pick) pick.onclick = (e) => {
      const row = e.target.closest("[data-acct]");
      if (!row) return;
      toast(`已将跨境种草文案排入 ${row.dataset.acct} 发布队列`);
      closeDrawer();
    };
  }

  function copyToClipboard(text) {
    const done = () => toast("文案已复制到剪贴板");
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else fallbackCopy(text, done);
  }

  function fallbackCopy(text, done) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); done(); } catch (e) { toast("复制失败，请手动复制"); }
    document.body.removeChild(ta);
  }

  function negDrawerHtml() {
    return DB.negativeWords.map((g) => `
      <div class="neg-group"><div class="ng-cat">${g.cat}</div>
      <div class="neg-chips">${g.words.map((w) => `<span class="neg-chip">${w}</span>`).join("")}</div></div>`).join("");
  }

  function openCrowd(name) {
    const c = DB.crowds.find((x) => x.name === name);
    if (!c) return;
    openDrawer("动态人群画像", `
      <div class="metric" style="margin-bottom:14px"><div class="m-label">人群规模</div><div class="m-val">${c.count}</div><div class="m-delta up">${c.trend}</div></div>
      <div class="panel-head" style="margin-top:6px"><div class="panel-title">标签</div></div>
      <div class="neg-chips">${c.tags.map((t) => `<span class="neg-chip">${t}</span>`).join("")}</div>
      <p style="font-size:13.5px;line-height:1.8;color:var(--muted)">${c.desc}。建议产出与之匹配的种草内容，并在投流端优先定向该人群。</p>`);
  }

  function openRegion(name) {
    const r = DB.regions.find((x) => x.name === name);
    if (!r) return;
    openDrawer(`${r.name} · 市场概览`, `
      <div class="metric" style="margin-bottom:12px"><div class="m-label">增长</div><div class="m-val" style="color:var(--green)">${r.growth}</div></div>
      <div class="panel-head"><div class="panel-title">覆盖国家</div></div>
      <div class="neg-chips">${r.countries.map((c) => `<span class="neg-chip">${c}</span>`).join("")}</div>
      <p style="font-size:13.5px;line-height:1.8;color:var(--muted);margin-top:12px">${r.desc}</p>`);
  }

  function openSpill(cat) {
    const s = DB.spillover.find((x) => x.cat === cat);
    if (!s) return;
    const ov = UI.spillOverride[cat];
    const seg = (v, c) => `<span class="bar-seg" style="flex:${v};background:${c}"></span>`;
    openDrawer(`外溢依据 · ${cat}`, `
      <div class="bar-track" style="width:100%;height:14px">${seg(s.station, "#3A7D44")}${seg(s.tmall, "#C0392B")}${seg(s.jd, "#2C6FA6")}${seg(s.vip, "#B07C2F")}</div>
      <div class="bar-legend" style="margin:10px 0 16px">
        <span><i style="background:#3A7D44"></i>站内 ${s.station}%</span>
        <span><i style="background:#C0392B"></i>天猫 ${s.tmall}%</span>
        <span><i style="background:#2C6FA6"></i>京东 ${s.jd}%</span>
        <span><i style="background:#B07C2F"></i>唯品会 ${s.vip}%</span>
      </div>
      <div class="advice-box">💡 ${s.advise}</div>
      <div class="metric-row" style="margin:16px 0">
        <div class="metric"><div class="m-label">站内承接</div><div class="m-val">${s.station}%</div></div>
        <div class="metric"><div class="m-label">天猫承接</div><div class="m-val">${s.tmall}%</div></div>
      </div>
      ${ov ? `<div class="panel" style="margin-bottom:14px"><div class="panel-head"><div class="panel-title">当前手动覆盖</div></div><div style="font-size:13px">${ov}</div></div>` : ""}
      <div class="panel-head" style="margin-top:8px"><div class="panel-title">手动覆盖比例</div></div>
      <div style="display:flex;gap:8px;margin:8px 0 14px">
        <input class="ql-input" style="flex:1;height:40px;border:1px solid var(--line);border-radius:11px;padding:0 12px;background:#fffcfa" placeholder="例：天猫 45% / 站内 35% / 京东 12% / 唯品会 8%" data-spill-input value="${ov || ""}">
        <button class="btn primary" data-spill-save>保存偏好</button>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn" data-goto-sound>去声场配置挂链</button>
        <button class="btn ghost" data-goto-echo>去回声看归因</button>
      </div>`);
    const d = $("drawer");
    const gs = d.querySelector("[data-goto-sound]");
    const ge = d.querySelector("[data-goto-echo]");
    const save = d.querySelector("[data-spill-save]");
    if (gs) gs.onclick = () => { closeDrawer(); navigate("sound"); };
    if (ge) ge.onclick = () => { closeDrawer(); navigate("echo"); };
    if (save) save.onclick = () => {
      const v = d.querySelector("[data-spill-input]").value.trim();
      if (!v) { toast("先输入覆盖比例"); return; }
      UI.spillOverride[cat] = v;
      closeDrawer();
      toast(`已记录「${cat}」外溢偏好`);
      render();
    };
  }

  function openNegWord(word) {
    const w = DB.negativeCloud.find((x) => x.word === word);
    if (!w) return;
    openDrawer(`舆情词「${w.word}」`, `
      <div class="metric-row" style="margin-bottom:14px">
        <div class="metric"><div class="m-label">出现频次</div><div class="m-val">${w.freq}</div></div>
        <div class="metric"><div class="m-label">严重度</div><div class="m-val" style="color:${sevColor(w.sev)}">${w.sev} / 5</div></div>
        <div class="metric"><div class="m-label">关联品类</div><div class="m-val" style="font-size:16px">${w.cat}</div></div>
      </div>
      ${w.unmet ? `<div class="advice-box">🌟 蓝海机会 · ${w.unmetAdvice}</div>` : ""}
      <div class="panel-head" style="margin-top:8px"><div class="panel-title">近 7 天声量趋势</div></div>
      ${sparklineSvg(w.spark, sevColor(w.sev))}
      <div class="panel-head" style="margin-top:14px"><div class="panel-title">相关评论</div></div>
      <div class="comment-feed" style="margin-top:10px">${w.comments.map((c) => `<div class="comment"><div class="cm-top"><span class="cm-user">${c.u}</span><span style="font-size:10.5px;color:var(--faint)">${c.d}</span></div><div class="cm-text">${c.t}</div></div>`).join("")}</div>
      <div style="font-size:11.5px;color:var(--muted);margin-top:12px">渠道：${w.chan}</div>`);
  }

  function adoptBeat(i) {
    const b = DB.contentBeat[i];
    if (!b) return;
    if (S.adoptedBeats.some((x) => x.dir === b.dir)) { toast("该选题已在声场日历中"); return; }
    S.adoptedBeats.push({ ...b, acct: "@AURORA_ASH 主号", status: "待发布", source: true });
    toast(`已采纳「${b.dir}」，已排入声场日历`);
  }

  function mountTouch() {
    const view = $("module-view");
    // 页签切换
    const tabs = view.querySelector("#touch-tabs");
    if (tabs) tabs.onclick = (e) => {
      const b = e.target.closest("[data-ttab]");
      if (!b) return;
      UI.touchTab = b.dataset.ttab;
      render();
    };
    // 筛选器：报价预算 / 粉丝量 / 转化效率（达人库、明星素材库共用）
    view.querySelectorAll("[data-ffans]").forEach((b) => b.onclick = () => {
      const [scope, key] = b.dataset.ffans.split(":");
      (scope === "star" ? starF : talentF).fans = key;
      render();
    });
    view.querySelectorAll("[data-fconv]").forEach((b) => b.onclick = () => {
      const [scope, key] = b.dataset.fconv.split(":");
      (scope === "star" ? starF : talentF).conv = key;
      render();
    });
    view.querySelectorAll("[data-fbudget]").forEach((inp) => inp.onchange = () => {
      (inp.dataset.fbudget === "star" ? starF : talentF).budget = +inp.value;
      render();
    });
    view.querySelectorAll("[data-talent]").forEach((b) => b.onclick = () => openTalent(b.dataset.talent));
    view.querySelectorAll("[data-order]").forEach((b) => b.onclick = () => orderTalent(b.dataset.order));
    // 明星素材库
    view.querySelectorAll("[data-link-confirm]").forEach((b) => b.onclick = () => toast(`已确认挂链「${b.dataset.linkConfirm}」并下发蒲公英（演示）`));
    view.querySelectorAll("[data-push-note]").forEach((b) => b.onclick = () => toast(`已向目标人群推送挂链笔记「${b.dataset.pushNote}」（演示）`));
    view.querySelectorAll("[data-link-detail]").forEach((b) => b.onclick = () => {
      const note = b.dataset.linkDetail;
      let it = null, starName = "", isBrand = false;
      for (const s of DB.stars) {
        const found = s.pushes.find((x) => x.note === note);
        if (found) { it = found; starName = s.name; break; }
        const bn = (s.brandNotes || []).find((x) => x.note === note);
        if (bn) { it = bn; starName = s.name; isBrand = true; break; }
      }
      if (!it) { const fb = (DB.brandLinkPush || []).find((x) => x.note === note); if (fb) { it = fb; isBrand = true; } }
      openDrawer("挂链笔记详情", `
        <div class="q" style="font-size:14px;font-weight:500;margin-bottom:12px">${it.note}</div>
        <div class="metric-row">
          <div class="metric"><div class="m-label">${isBrand ? "笔记类型" : "明星"}</div><div class="m-val" style="font-size:14px">${isBrand ? "品牌号同款挂链（未提及明星）" : starName}</div></div>
          <div class="metric"><div class="m-label">承接目标</div><div class="m-val" style="font-size:14px">${it.target}</div></div>
        </div>
        <div class="advice-box" style="margin-top:14px">🎯 识别点赞评论目标人群：${it.audience}</div>
        <div class="advice-box" style="margin-top:10px">${isBrand ? "💡 点击「推送挂链笔记」将向该目标人群精准下发同款挂链笔记。" : "💡 确认挂链后自动同步蒲公英主图链接与优惠券，实现明星流量 → 站外成交闭环。"}</div>`);
    });
    // Brief 生成
    view.querySelectorAll("[data-conv]").forEach((p) => p.onclick = () => {
      UI.convPlat = p.dataset.conv;
      render();
    });
    view.querySelectorAll("[data-brief-gen]").forEach((b) => b.onclick = () => toast("Brief 已重新生成（演示）"));
    view.querySelectorAll("[data-brief-pdf]").forEach((b) => b.onclick = () => toast("Brief PDF 已导出（演示）"));
    view.querySelectorAll("[data-brief-send]").forEach((b) => b.onclick = () => toast("Brief 已发送到蒲公英（演示）"));
    // 内容辅助
    view.querySelectorAll("[data-assist-analyze]").forEach((b) => b.onclick = () => {
      const out = view.querySelector("[data-assist-out]");
      if (out) out.hidden = false;
      const rm = view.querySelectorAll(".del-rm");
      let hits = 0;
      rm.forEach((x) => { hits++; setTimeout(() => { x.style.opacity = "1"; x.style.transform = "translateX(0)"; }, hits * 120); });
    });
    view.querySelectorAll("[data-assist-generate]").forEach((b) => b.onclick = () => toast("已根据选中风格生成优化稿（演示）"));
    view.querySelectorAll("[data-style-pick]").forEach((g) => g.onclick = (e) => {
      const c = e.target.closest(".neg-chip");
      if (!c) return;
      g.querySelectorAll(".neg-chip").forEach((x) => x.classList.toggle("is-on", x === c));
      toast(`已选择风格：${c.textContent}`);
    });
    // 合规预审
    view.querySelectorAll("[data-comply-run]").forEach((b) => b.onclick = () => runComply(view));
    // 批量管理
    view.querySelectorAll("[data-batch-urge]").forEach((b) => b.onclick = () => toast(`已催稿 ${b.dataset.batchUrge}（演示）`));
    view.querySelectorAll("[data-batch-pass]").forEach((b) => b.onclick = () => toast(`已通过 ${b.dataset.batchPass} 稿件（演示）`));
    view.querySelectorAll("[data-batch-reject]").forEach((b) => b.onclick = () => toast(`已驳回 ${b.dataset.batchReject} 稿件（演示）`));
    view.querySelectorAll("[data-batch-talk]").forEach((b) => b.onclick = () => toast(`已跳转蒲公英后台，与 ${b.dataset.batchTalk} 及时沟通（演示）`));
    const allBtn = view.querySelector("[data-batch-all]");
    if (allBtn) allBtn.onclick = () => toast("已一键催稿全部进行中项目（演示）");
  }

  function runComply(view) {
    const ta = view.querySelector("textarea[placeholder*='粘贴待发布']");
    const text = ta ? ta.value : "";
    const hits = DB.complianceRules.filter((r) => text.includes(r.w));
    const res = view.querySelector("[data-comply-result]");
    if (!res) return;
    res.hidden = false;
    const badge = res.querySelector(".badge");
    const out = view.querySelector("[data-comply-hits]");
    if (hits.length) {
      out.innerHTML = hits.map((r) => `
        <div class="${r.tag === "red" ? "comply-hit" : r.tag === "yellow" ? "comply-flag" : "comply-sens"}">
          <div style="display:flex;justify-content:space-between;align-items:center"><span class="cp-w">${r.w}</span><span class="cp-tag">${r.tag === "red" ? "违禁词 · 强制" : r.tag === "yellow" ? "广告标识 · 需标识" : "敏感词 · 建议替换"}</span></div>
          <div class="cp-law">📖 ${r.law}</div>
          <div class="cp-tip">✓ ${r.tip}</div>
        </div>`).join("");
      badge.textContent = `命中 ${hits.length} 处`;
      badge.className = "badge red";
    } else {
      out.innerHTML = '<div style="color:var(--green);font-size:13px">✅ 未命中违禁词，可安全发布</div>';
      badge.textContent = "通过";
      badge.className = "badge green";
    }
  }

  function openTalent(name) {
    const t = DB.talents.find((x) => x.name === name);
    if (!t) return;
    openDrawer(t.name, `
      <div class="sc-head" style="margin-bottom:14px">
        <div class="talent-avatar">${t.name.slice(0,1)}</div>
        <div style="flex:1"><div class="tl-name">${t.name}</div><div class="tl-handle">${t.handle}</div></div>
        <span class="badge red">${tierLabel[t.tier]}</span>
      </div>
      <div class="metric-row" style="margin-bottom:14px">
        <div class="metric"><div class="m-label">粉丝</div><div class="m-val" style="font-size:20px">${t.fans}</div></div>
        <div class="metric"><div class="m-label">信誉分</div><div class="m-val" style="font-size:20px">${t.credit}</div></div>
        <div class="metric"><div class="m-label">报价</div><div class="m-val" style="font-size:16px">${t.price}</div></div>
      </div>
      <div class="panel-head"><div class="panel-title">受众画像</div></div>
      <p style="font-size:13px;line-height:1.7;color:var(--muted)">${t.audience}</p>
      <div class="panel-head" style="margin-top:8px"><div class="panel-title">达人简介</div></div>
      <p style="font-size:13px;line-height:1.7;color:var(--muted)">${t.intro}</p>
      <button class="btn primary" style="width:100%;justify-content:center;margin-top:16px" data-order-drawer="${t.name}">发起撮合</button>`);
    const b = $("drawer").querySelector("[data-order-drawer]");
    if (b) b.onclick = () => { closeDrawer(); orderTalent(name); };
  }

  function orderTalent(name) {
    toast(`已向 ${name} 发起撮合邀请（演示）`);
  }

  function mountSound() {
    const view = $("module-view");
    // 页签切换
    const tabs = view.querySelector("#sound-tabs");
    if (tabs) tabs.onclick = (e) => {
      const b = e.target.closest("[data-stab]");
      if (!b) return;
      UI.soundTab = b.dataset.stab;
      render();
    };
    // 复制文案
    view.querySelectorAll("[data-copy]").forEach((b) => b.onclick = () => {
      const c = DB.contentLib.find((x) => x.name === b.dataset.copy);
      if (c) { toast(`已复制「${c.headline}」文案`); }
    });
    // 选择账号发布
    view.querySelectorAll("[data-publish]").forEach((b) => b.onclick = () => openPublish(b.dataset.publish));
    // 分发调度
    view.querySelectorAll("[data-sched-auto]").forEach((b) => b.onclick = () => toast("已按最佳时段智能排期（演示）"));
    view.querySelectorAll("[data-month-auto]").forEach((b) => b.onclick = () => toast("已生成 4 周整月内容排期，匹配主号/包袋/种草/导购账号（演示）"));
    view.querySelectorAll("[data-sched-preview]").forEach((c) => c.onchange = () => toast(c.checked ? "已开启发布前合规预检" : "已关闭合规预检"));
    view.querySelectorAll("[data-sched-auto-pub]").forEach((c) => c.onchange = () => toast(c.checked ? "已开启定时自动发布" : "已关闭自动发布"));
    // 搜索占位补位
    view.querySelectorAll("[data-occupy-fill]").forEach((b) => b.onclick = () => {
      toast(`已为「${b.dataset.occupyFill}」生成占位选题，排入分发调度`);
      UI.soundTab = "schedule";
      render();
    });
    // 长尾流量
    view.querySelectorAll("[data-lt-heat]").forEach((b) => b.onclick = () => toast("已提交薯条加热（演示）"));
    view.querySelectorAll("[data-lt-refresh]").forEach((b) => b.onclick = () => toast("已生成内容翻新建议（演示）"));
    view.querySelectorAll("[data-lt-detail]").forEach((b) => b.onclick = () => openDrawer("长尾笔记详情", ltDetailHtml(b.dataset.ltDetail)));
    // 效果回收
    view.querySelectorAll("[data-recycle-export]").forEach((b) => b.onclick = () => toast("分发周报已导出（演示）"));
  }

  function accountPickerHtml() {
    return `<div class="panel-head" style="margin-top:6px"><div class="panel-title">选择发布账号</div></div>
      <div class="acct-pick" data-acct-pick>${DB.scheduleAccounts.map((a) => `
        <div class="ap-row" data-acct="${a.name}">
          <span class="ap-dot" style="background:${a.color}"></span>
          <div style="flex:1"><div style="font-size:13px;font-weight:600">${a.name}</div><div style="font-size:11px;color:var(--muted)">${a.type} · 最佳 ${a.best}</div></div>
          <button class="btn primary small">发布</button>
        </div>`).join("")}</div>`;
  }

  function openPublish(copyName) {
    const c = DB.contentLib.find((x) => x.name === copyName);
    openDrawer(`发布文案 · ${c ? c.headline : ""}`, `
      <div class="panel-sub" style="margin-bottom:12px">选择要分发的品牌账号，自动进入该账号发布队列并做合规预检。</div>
      ${accountPickerHtml()}`);
    const pick = $("drawer").querySelector("[data-acct-pick]");
    if (pick) pick.onclick = (e) => {
      const row = e.target.closest("[data-acct]");
      if (!row) return;
      toast(`已将「${c.headline}」排入 ${row.dataset.acct} 发布队列`);
      closeDrawer();
    };
  }

  function ltDetailHtml(note) {
    const n = DB.longtailNotes.find((x) => x.note === note);
    if (!n) return "<p>未找到数据</p>";
    const rising = n.status === "潜力";
    return `
      <div class="metric-row" style="margin-bottom:14px">
        <div class="metric"><div class="m-label">关键词</div><div class="m-val" style="font-size:16px">${n.kw}</div></div>
        <div class="metric"><div class="m-label">账号</div><div class="m-val" style="font-size:14px">${n.acct}</div></div>
        <div class="metric"><div class="m-label">状态</div><div class="m-val" style="color:${rising ? "var(--green)" : "var(--amber)"}">${rising ? "潜力上升" : "衰退下滑"}</div></div>
      </div>
      <div class="panel-head"><div class="panel-title">排名走势（7 → 14 → 30 天）</div></div>
      ${sparklineSvg(n.rank.slice().reverse(), rising ? "#3A7D44" : "#B07C2F")}
      <div style="font-size:12px;color:var(--muted);margin-top:8px">排名：${n.rank.join(" → ")}</div>
      <div style="font-size:12px;color:var(--muted);margin-top:4px">互动率 ${n.inter} · 类目均值 ${n.avg}</div>
      <div class="advice-box" style="margin-top:14px">💡 ${rising ? "排名持续上升，建议使用薯条加热放大流量，抢占搜索占位。" : "排名逐步下滑，建议翻新封面/标题或补充评论区互动。"}</div>`;
  }

  function mountEcho() {
    const view = $("module-view");
    const ask = view.querySelector("[data-attr-ask]");
    const input = view.querySelector("[data-attr-input]");
    const K = window.KNOWLEDGE;
    const pad = (n) => String(n).padStart(2, "0");
    const classify = (q) => {
      const t = q.toLowerCase();
      const has = (ks) => ks.some((k) => t.includes(k));
      if (has(["趋势", "潮流", "风向", "搜索词", "关键词", "流行", "风格", "踩什么", "什么风", "潮流"])) return "trend";
      if (has(["创意", "选题", "灵感", "想法", "点子", "方向", "做什么内容", "内容做", "内容改", "改进", "优化", "封面", "标题", "怎么改"])) return "idea";
      if (has(["节点", "节日", "日历", "大促", "双11", "双十一", "双旦", "春节", "圣诞", "黑五", "感恩节", "活动", "什么时候", "哪天", "排期", "上新", "周年"])) return "node";
      if (has(["形式", "图文", "视频", "直播", "笔记", "格式", "呈现", "载体", "用什么做", "怎么发"])) return "format";
      return "attr";
    };

    const doAsk = (qText) => {
      const q = (qText || input.value).trim();
      if (!q) { toast("先输入一个问题"); return; }
      const kind = classify(q);
      const head = `<div class="q" style="font-size:14px;font-weight:500;margin-bottom:14px">「${q}」</div>`;
      const foot = `<div style="font-size:12px;color:var(--faint);margin-top:12px">AURORA & ASH 晨曦与灰 · AIPS 归因 · 虚拟数据演示</div>`;

      if (kind === "trend") {
        const styleRows = K.trends.styles.map((s, i) => `
          <div class="nl-row">
            <div class="nl-num">${pad(i + 1)}</div>
            <div class="nl-body">
              <div class="nl-title">${s.name} <span style="color:var(--green);font-weight:700">${s.delta}</span></div>
              <div class="nl-meta">${s.items}</div>
              <div class="nl-meta"><span class="tag">${s.mood}</span></div>
            </div>
          </div>`).join("");
        const termChips = K.trends.searchTerms.map((t) => `<span class="tag" style="margin:2px">${t.term} <b style="color:var(--accent)">${t.vol}</b></span>`).join("");
        openDrawer("2026 服饰潮流趋势库", head +
          `<div class="nl-list">${styleRows}</div>
           <div style="margin-top:16px;font-size:12px;color:var(--muted)">高频搜索词（虚拟月搜索量）</div>
           <div class="nl-meta" style="margin-top:6px">${termChips}</div>
           <div class="advice-box" style="margin-top:16px">🎨 色彩：${K.trends.colors.join("、")}<br>🧵 材质：${K.trends.materials.join("、")}<br>🔧 工艺：${K.trends.crafts.join("、")}</div>
           <div class="advice-box">🔥 主推「通勤松弛 Offduty」+「静奢老钱 2.0」，搜索环比 +268% / +312%，适配白西装、羊绒大衣，避开纯基础款内卷。</div>` + foot);
        return;
      }

      if (kind === "idea") {
        const angleRows = K.angles.map((a, i) => `
          <div class="nl-row">
            <div class="nl-num">${pad(i + 1)}</div>
            <div class="nl-body">
              <div class="nl-title">${a.title}</div>
              <div class="nl-meta"><span class="tag">${a.angle}</span><span>适配风格：${a.style}</span></div>
            </div>
          </div>`).join("");
        const ruleTable = K.creativeRules.map((r) => `<tr><td>${r.if}</td><td>${r.then}</td></tr>`).join("");
        openDrawer("内容创意 · 角度与改法", head +
          `<div class="nl-list">${angleRows}</div>
           <div class="advice-box" style="margin-top:14px">🎬 视觉语言：封面 ${K.visual.cover}；排版 ${K.visual.layout}；视频 ${K.visual.video}。</div>
           <table class="attr-table"><thead><tr><th>若信号</th><th>改进建议</th></tr></thead><tbody>${ruleTable}</tbody></table>` + foot);
        return;
      }

      if (kind === "node") {
        const rows = K.nodes.map((n) => `
          <div class="nl-node">
            <div class="nl-rail"><i style="background:var(--accent)"></i></div>
            <div class="nl-date">${n.period}</div>
            <div class="nl-body">
              <div class="nl-title">${n.node}<span class="nl-win">${n.theme}</span></div>
              <div class="nl-meta">主推 SPU：${n.spu}</div>
            </div>
          </div>`).join("");
        openDrawer("营销节点日历 · 全年节奏", head +
          `<div class="nl-timeline">${rows}</div>
           <div class="advice-box" style="margin-top:14px">💡 ${K.nodeStrategy}</div>` + foot);
        return;
      }

      if (kind === "format") {
        const table = K.formats.map((f) => `<tr><td>${f.form}</td><td>${f.exp}</td><td>${f.save}</td><td>${f.conv}</td><td>${f.stage}</td></tr>`).join("");
        const ruleRows = K.formatRules.map((r) => `
          <div class="nl-row">
            <div class="nl-body"><div class="nl-title"><span class="tag">${r.goal}</span> ${r.action}</div></div>
          </div>`).join("");
        openDrawer("内容形式建议", head +
          `<table class="attr-table"><thead><tr><th>形式</th><th>曝光</th><th>收藏率</th><th>转化倾向</th><th>适用阶段</th></tr></thead><tbody>${table}</tbody></table>
           <div class="nl-list" style="margin-top:16px">${ruleRows}</div>
           <div class="advice-box" style="margin-top:14px">💡 种草期用真人图文占位搜索，爆发期用明星视频 + 直播切片，到店用 POI 实拍笔记承接核销。</div>` + foot);
        return;
      }

      const channelTable = K.channels.map((c) => `<tr><td>${c.channel}</td><td>${c.exp}</td><td>${c.ctr}</td><td>${c.cpe}</td><td>${c.uv}</td><td>${c.roi}</td></tr>`).join("");
      const caseCards = K.cases.map((c) => `
        <div class="query-card">
          <div class="q">${c.by} · ${c.note}</div>
          <div class="q-stats">
            <div class="qs"><div class="k">A 认知曝光</div><div class="v">${c.a}</div></div>
            <div class="qs"><div class="k">I 兴趣互动</div><div class="v">${c.i}</div></div>
            <div class="qs"><div class="k">TI 深度种草</div><div class="v">${c.ti}</div></div>
            <div class="qs"><div class="k">P 成交 GMV</div><div class="v" style="color:var(--green)">${c.p}</div></div>
          </div>
        </div>`).join("");
      const metricLine = K.metrics.map((m) => m.def ? `${m.name}=${m.def}` : m.name).join(" · ");
      openDrawer("投放效果 · 智能归因", head +
        `<table class="attr-table"><thead><tr><th>渠道</th><th>曝光</th><th>CTR</th><th>CPE</th><th>进店UV</th><th>ROI</th></tr></thead><tbody>${channelTable}</tbody></table>
         <div class="nl-list" style="margin-top:16px">${caseCards}</div>
         <div class="advice-box" style="margin-top:14px">⚠️ ${K.diagnosis}</div>
         <div style="font-size:12px;color:var(--faint);margin-top:12px;line-height:1.7">归因指标词典：${metricLine}</div>` + foot);
    };
    ask.onclick = () => doAsk();
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") doAsk(); });
    view.querySelectorAll("[data-ql-hint]").forEach((b) => b.onclick = () => {
      const samples = {
        attr: "九月份秋冬上新那波投得怎么样",
        idea: "秋冬有什么内容创意方向？",
        node: "接下来有哪些营销节点？",
        format: "静奢风适合用什么内容形式？",
      };
      const s = samples[b.dataset.qlHint] || samples.attr;
      input.value = s;
      doAsk(s);
    });
    view.querySelectorAll("[data-qf]").forEach((b) => b.onclick = () => {
      const uid = encodeURIComponent("live_928374");
      const spu = encodeURIComponent("羊绒大衣 Aurora 晨曦系列");
      const coupon = encodeURIComponent("¥300 满 ¥1800 减");
      const gpm = encodeURIComponent("1350");
      const url = `https://qianfan.jd.com/live/manage?liveId=${uid}&mainSpu=${spu}&coupon=${coupon}&targetGpm=${gpm}`;
      window.open(url, "_blank");
      toast("已携带直播间参数跳转千帆（新标签页打开）");
    });
    const dd = view.querySelector("[data-deepdive]");
    if (dd) dd.onclick = () => navigate("deepdive");
  }

  function mountBiz() {
    $("module-view").querySelectorAll("[data-biz]").forEach((b) => b.onclick = () => {
      toast(`正在跳转「${b.dataset.biz}」后台（演示）`);
    });
  }

  function mountSettings() {
    const view = $("module-view");
    view.querySelectorAll("[data-mk]").forEach((c) => c.onclick = () => {
      c.classList.toggle("is-on");
      S.profile.markets = [...view.querySelectorAll("[data-mk].is-on")].map((x) => x.dataset.mk);
    });
    const save = view.querySelector("[data-save-settings]");
    save.onclick = () => {
      const ind = view.querySelector("#set-industry").value;
      const rol = view.querySelector("#set-role").value;
      S.profile.name = view.querySelector("#set-name").value.trim() || S.profile.name;
      S.profile.industryId = ind;
      S.profile.industry = DB.industries.find((x) => x.id === ind).name;
      S.profile.roleId = rol;
      S.profile.role = DB.roles.find((x) => x.id === rol).name;
      S.profile.plan = rol === "sme" ? "free" : rol === "agency" ? "attribution" : S.profile.plan;
      try { localStorage.setItem("mirra.profile", JSON.stringify(S.profile)); } catch (e) {}
      toast("已保存，重新应用配置");
      window.MirraStartup(S.profile);
    };
    view.querySelectorAll("[data-upgrade]").forEach((b) => b.onclick = () => upgradeTo(b.dataset.upgrade));
  }

  /* ---------------- 全局事件委托 ---------------- */

  document.addEventListener("click", (e) => {
    // 关闭按钮
    if (e.target.closest("[data-close]")) closeDrawer();
    if (e.target.closest("[data-close-modal]")) closeModal();
    // 解锁
    const unlock = e.target.closest("[data-unlock]");
    if (unlock) { paywallModal(unlock.dataset.feature); return; }
    // 升级
    const up = e.target.closest("[data-upgrade]");
    if (up) { upgradeTo(up.dataset.upgrade); return; }
  });

  /* ---------------- 侧边导航 ---------------- */

  document.querySelectorAll(".sb-item[data-module]").forEach((b) => {
    b.addEventListener("click", () => navigate(b.dataset.module));
  });

  $("sb-logout").addEventListener("click", () => {
    try { localStorage.removeItem("mirra.profile"); } catch (e) {}
    location.reload();
  });

  $("user-chip").addEventListener("click", () => navigate("settings"));

  // 初始化渲染入口
  function render() { navigate(S.module); }

  window.Mirra = { navigate, render, toast, openDrawer, closeDrawer, openModal, closeModal };
})();