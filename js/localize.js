/* ============================================================
   趋势本土化 · 一键转小红书文案（内容工作台）
   - 三步式：确认趋势 → 生成文案 → 选择账号发布
   - 预置文案库（5 套，对应 5 种风格），生成时以此为基改写
   ============================================================ */
(function () {
  "use strict";

  var DB = window.DB;

  /* ---------- 预置文案库（5 套） ---------- */
  var PRESETS = {
    oldmoney: {
      title: "月薪8k如何穿出老钱感？这件西装套装绝了",
      body: "老钱风2.0的核心不是贵，是\u201c我根本不在乎你觉不觉得贵\u201d。\n这套AURORA & ASH的白色衬衫西装，没有logo、没有亮片、没有多余装饰。但面料一上身你就知道——这不是快时尚能碰瓷的东西。\n搭配逻辑很简单：\n① 内搭同色系吊带（别选白色，选米白）\n② 裤子选微阔腿，走路带风但不拖地\n③ 配饰只戴一件：金属细链或皮质手表\n老钱2.0和1.0最大的区别：松弛感。不是西装笔挺去开会，是周六早上买杯咖啡的随意。肩线微微落下来，袖口露出一截手腕，包随便搭在肩上。\n搜索\u201c老钱风通勤\u201d的姐妹，这套直接抄作业。",
      tags: ["老钱风穿搭", "轻奢女装", "通勤ootd", "AURORAANDASH", "静奢老钱"],
      cover: "真人半身侧身站立，左手拿咖啡杯，右手自然下垂，西装微风吹起衣角。滤镜偏暖灰调，字少，只写\u201c老钱风2.0\u201d。"
    },
    quietlux: {
      title: "为什么真正有钱的女人，衣柜里全是\u201c看起来不贵\u201d的衣服？",
      body: "静奢风的精髓：你穿了8000块的大衣，但看起来像800块的优衣库——这是最高级的凡尔赛。\nAURORA & ASH这季的驼色羊绒大衣，我愿称之为\u201c隐形富豪制造机\u201d：\n面料：100%再生羊绒，手感像在摸云\n剪裁：隐形省道，穿上自动显腰线但不勒\n颜色：雾霭灰驼，不挑肤色不挑内搭\n穿静奢风的3个心法：\n① 全身颜色不超过3个，且必须同色系\n② 材质必须有\u201c暗光感\u201d——远看是平的，近看有纹理\n③ 拒绝一切弹窗式logo，扣子都不带刻字\n真正的奢侈不是让别人看到，是让自己知道。",
      tags: ["静奢风", "QuietLuxury", "羊绒大衣", "轻奢女装", "AURORAANDASH"],
      cover: "大衣平铺在米色沙发上，旁边放一杯手冲咖啡，自然窗光。封面大字：\u201c真正的奢侈，是看起来不贵\u201d。"
    },
    balletcore: {
      title: "把芭蕾课穿到办公室，同事问我是不是换了个人",
      body: "芭蕾风今年从秀场彻底杀进通勤圈了。但注意——不是让你穿tutu裙去开会，是提取芭蕾的轻盈感，嫁接到日常单品上。\n这套AURORA & ASH的黑色缎面连衣裙，灵感来自芭蕾舞者的练功服：\n领口：方领+细绑带（像芭蕾舞衣的系带）\n面料：哑光缎面，走路有微光流动\n裙摆：A字微蓬，坐下不皱站起不塌\n芭蕾风通勤公式：\n① 一件芭蕾感单品 + 一件硬挺单品 = 平衡\n② 缎面裙 + 皮质西装外套 = 刚柔并济\n③ 芭蕾平底鞋 + 西装裤 = 舒适但不随便\n关键细节：头发要扎低马尾或盘发，耳环选小珍珠。整体气质就出来了。",
      tags: ["芭蕾风", "Balletcore", "缎面连衣裙", "轻奢穿搭", "AURORAANDASH"],
      cover: "模特单脚尖点地（假装芭蕾站姿），裙摆微扬，逆光拍摄。封面文字：\u201c把芭蕾穿进办公室\u201d。"
    },
    y2k: {
      title: "翻出我妈2004年的穿搭杂志，发现现在全在抄",
      body: "千禧风回来这件事，我一开始是拒绝的。但穿了两周AURORA & ASH这季的\u201c复古重构\u201d系列，真香了。\n关键单品：微喇西装裤 + 短款皮质夹克 + 低腰（但友好版型）针织上衣\n和20年前不一样的地方：\n① 颜色从荧光变成了低饱和（雾霾蓝、脏粉色、炭灰）\n② 面料从塑料感变成了再生材质（环保PU、植物染）\n③ 剪裁从紧身变成了微宽松（对身材友好太多）\n千禧复古的正确打开方式：\n选一件\u201c有年代感\u201d的单品（低腰裤/微喇/金属扣）\n其他全部选现代极简款压住\n配饰可以大胆：蝴蝶发夹、细链叠戴、小方包\n不是cosplay 2004，是让2004的美在今天重新成立。",
      tags: ["千禧复古", "Y2K", "轻奢女装", "微喇西装裤", "AURORAANDASH"],
      cover: "拼贴风格，左边2004年杂志剪报，右边同款现代穿法对比。封面文字：\u201c2004 vs 2026，谁更好看？\u201d。"
    },
    sustain: {
      title: "一件大衣的碳足迹，比我一个月外卖还少",
      body: "买衣服之前我开始看成分标签了。不是看含不含羊毛，是看这块面料从哪来、到哪去、中间排了多少碳。\nAURORA & ASH这季主推的\u201c再生羊绒\u201d系列，数据我查了：\n原料：回收羊绒纱线再纺，减少70%水资源消耗\n染色：植物染（不是化学染料），颜色会随时间微微变化（这是特色不是瑕疵）\n包装：快递盒是种子纸，埋土里能长出薰衣草\n可持续穿搭不是\u201c糙\u201d，是更高级的精致：\n① 选再生面料 ≠ 将就，是面料故事更好听\n② 一件穿5年 ≠ 穷，是拒绝快时尚浪费\n③ 碳足迹可追踪 ≠ 噱头，是品牌敢公开数据\n穿这件大衣的时候，我知道它对环境友好。这种安心感，比logo值钱。",
      tags: ["可持续时尚", "ESG", "再生羊绒", "环保穿搭", "AURORAANDASH", "CarbonFootprint"],
      cover: "大衣挂在自然光下的木质衣架上，旁边放一张\u201c碳足迹追踪卡\u201d（虚拟设计），显示\u201c本件大衣碳排放：2.3kg CO₂e\u201d。封面文字：\u201c这件大衣的碳足迹，比你一顿火锅还少\u201d。"
    }
  };

  /* ---------- 风格标签 ---------- */
  var STYLE_TAGS = ["老钱风2.0", "静奢风", "芭蕾风", "千禧复古", "可持续面料", "通勤松弛", "新中式", "空气叠穿"];
  var STYLE_TO_KEY = {
    "老钱风2.0": "oldmoney",
    "静奢风": "quietlux",
    "芭蕾风": "balletcore",
    "千禧复古": "y2k",
    "可持续面料": "sustain"
  };
  var TREND_TO_KEY = {
    oldmoney: "oldmoney", quietlux: "quietlux", balletcore: "balletcore", y2k: "y2k", sustain: "sustain"
  };

  /* ---------- 账号库 ---------- */
  var ACC_TABS = ["主号", "种草号", "门店号", "导购号", "明星同款号"];
  var ACCOUNTS = [
    { id: "main1", tab: "主号", name: "AURORA & ASH 官方旗舰店", fans: "128.6w", inter: "8.2w", color: "#C0392B" },
    { id: "main2", tab: "主号", name: "AURORA_ASH 主号", fans: "96.3w", inter: "6.1w", color: "#B07C2F" },
    { id: "seed1", tab: "种草号", name: "晨曦衣橱日记", fans: "32.4w", inter: "2.8w", color: "#3A7D44" },
    { id: "seed2", tab: "种草号", name: "AA·穿搭研究所", fans: "41.2w", inter: "3.5w", color: "#2C6FA6" },
    { id: "seed3", tab: "种草号", name: "AA·圆圆成都", fans: "18.7w", inter: "1.6w", color: "#6B5584" },
    { id: "store1", tab: "门店号", name: "AURORA & ASH 上海恒隆店", fans: "6.8w", inter: "4200", color: "#8a6d3b" },
    { id: "store2", tab: "门店号", name: "AURORA & ASH 北京SKP店", fans: "5.4w", inter: "3100", color: "#7a5c8f" },
    { id: "store3", tab: "门店号", name: "AURORA & ASH 成都IFS店", fans: "4.1w", inter: "2600", color: "#4f7b5f" },
    { id: "guide1", tab: "导购号", name: "AA·小陈在上海", fans: "2.1w", inter: "980", color: "#c07b2f" },
    { id: "guide2", tab: "导购号", name: "AA·李李北京", fans: "1.8w", inter: "760", color: "#b05a6a" },
    { id: "guide3", tab: "导购号", name: "AA·阿敏广州", fans: "1.5w", inter: "620", color: "#557a6b" },
    { id: "star1", tab: "明星同款号", name: "江照Moon同款", fans: "24.6w", inter: "2.2w", color: "#8f4b6e" },
    { id: "star2", tab: "明星同款号", name: "鹿野Sen同款", fans: "19.9w", inter: "1.9w", color: "#4b6e8f" }
  ];

  var COMP_OPTS = ["商品卡(SPU)", "POI门店", "搜索词卡", "无"];

  /* ---------- 内部状态 ---------- */
  var state = {
    trendId: null, trend: null,
    tags: [],                 // 已选风格标签
    regenCount: 0,
    baseTitle: "",
    result: null,             // { title, body, tags[], cover }
    step: 1,
    accountsOpen: false,
    accTab: "主号",
    accId: null,
    time: "now", schedule: "",
    comp: "商品卡(SPU)",
    heat: "否", budget: "",
    typeTimer: null
  };

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function lzToast(msg) {
    var t = $("toast");
    if (!t) return;
    t.textContent = msg; t.hidden = false;
    clearTimeout(lzToast._t);
    lzToast._t = setTimeout(function () { t.hidden = true; }, 2400);
  }

  /* ---------- 选择模板 ---------- */
  function pickPreset() {
    for (var i = 0; i < state.tags.length; i++) {
      if (STYLE_TO_KEY[state.tags[i]]) return PRESETS[STYLE_TO_KEY[state.tags[i]]];
    }
    var key = TREND_TO_KEY[state.trend && state.trend.id] || "oldmoney";
    return PRESETS[key] || PRESETS.oldmoney;
  }

  function titleVars() {
    var t = state.trend;
    if (!t || !t.titleVar) return [];
    return ["dry", "emo", "compare", "suspension", "grass"]
      .map(function (k) { return t.titleVar[k]; })
      .filter(Boolean);
  }

  function currentTitle() {
    if (state.regenCount === 0) return state.baseTitle;
    var vars = titleVars();
    if (!vars.length) return state.baseTitle;
    return vars[(state.regenCount - 1) % vars.length];
  }

  /* ---------- 模态框搭建 ---------- */
  function ensureModal() {
    if ($("lz-modal")) return $("lz-modal");
    var wrap = document.createElement("div");
    wrap.className = "lz-modal";
    wrap.id = "lz-modal";
    wrap.hidden = true;
    wrap.innerHTML =
      '<div class="lz-overlay" data-lz-close></div>' +
      '<div class="lz-sheet" id="lz-sheet"></div>';
    document.body.appendChild(wrap);

    wrap.addEventListener("click", function (e) {
      var target = e.target;
      var hit = function (sel) { return target.closest ? target.closest(sel) : null; };

      if (hit("[data-lz-close]")) { close(); return; }

      var tagBtn = hit("[data-lz-tag]");
      if (tagBtn) {
        var v = tagBtn.getAttribute("data-lz-tag");
        var idx = state.tags.indexOf(v);
        if (idx < 0) state.tags.push(v); else state.tags.splice(idx, 1);
        renderTagsBar();
        return;
      }

      if (hit("[data-lz-gen]")) { generate(); return; }
      if (hit("[data-lz-regen]")) { regenerate(); return; }
      if (hit("[data-lz-copy]")) { copyFull(); return; }

      if (hit("[data-lz-accounts-toggle]")) {
        state.accountsOpen = true; state.step = 3;
        renderAccounts();
        return;
      }

      var tabBtn = hit("[data-lz-acc-tab]");
      if (tabBtn) { state.accTab = tabBtn.getAttribute("data-lz-acc-tab"); renderAccounts(); return; }

      var accBtn = hit("[data-lz-acc-sel]");
      if (accBtn) { state.accId = accBtn.getAttribute("data-lz-acc-sel"); renderAccounts(); return; }

      var timeBtn = hit("[data-lz-time]");
      if (timeBtn) { state.time = timeBtn.getAttribute("data-lz-time"); renderAccountPub(); return; }

      var compBtn = hit("[data-lz-comp]");
      if (compBtn) { state.comp = compBtn.getAttribute("data-lz-comp"); renderAccountPub(); return; }

      var heatBtn = hit("[data-lz-heat]");
      if (heatBtn) { state.heat = heatBtn.getAttribute("data-lz-heat"); renderAccountPub(); return; }

      var delBtn = hit("[data-lz-deltag]");
      if (delBtn) {
        var di = parseInt(delBtn.getAttribute("data-lz-deltag"), 10);
        if (state.result && state.result.tags && !isNaN(di)) { state.result.tags.splice(di, 1); renderTagsRow(); }
        return;
      }

      if (hit("[data-lz-addtag]")) { renderTagInput(); return; }
      if (hit("[data-lz-addtag-ok]")) { commitAddTag(); return; }

      if (hit("[data-lz-confirm]")) { confirmPublish(); return; }
      if (hit("[data-lz-cancelacc]")) { state.accountsOpen = false; state.step = 2; renderAccounts(); return; }
    });

    // 计划时间 change 同步
    wrap.addEventListener("change", function (e) {
      if (e.target && e.target.id === "lz-schedule") { state.schedule = e.target.value; }
    });
    wrap.addEventListener("input", function (e) {
      if (e.target && e.target.id === "lz-budget") { state.budget = e.target.value; }
    });
    wrap.addEventListener("keydown", function (e) {
      if (e.target && e.target.id === "lz-tag-input" && e.key === "Enter") {
        e.preventDefault(); commitAddTag();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !wrap.hidden) close();
    });

    return wrap;
  }

  /* ---------- 打开 / 关闭 ---------- */
  function open(trendId) {
    var trends = (DB && DB.globalTrends) || [];
    var trend = trends.filter(function (t) { return t.id === trendId; })[0] || trends[0];
    if (!trend) { lzToast("未找到该趋势"); return; }

    state.trendId = trend.id;
    state.trend = trend;
    state.regenCount = 0;
    state.result = null;
    state.step = 1;
    state.accountsOpen = false;
    state.accTab = "主号";
    state.accId = null;
    state.time = "now"; state.schedule = "";
    state.comp = "商品卡(SPU)"; state.heat = "否"; state.budget = "";
    clearInterval(state.typeTimer);

    // 预选风格标签（按趋势 id 映射）
    var defStyle = styleNameForKey(TREND_TO_KEY[trend.id]);
    state.tags = defStyle ? [defStyle] : [];

    var wrap = ensureModal();
    renderSheet();
    wrap.hidden = false;
    requestAnimationFrame(function () { requestAnimationFrame(function () { wrap.classList.add("is-open"); }); });
    document.body.style.overflow = "hidden";
  }

  function styleNameForKey(key) {
    for (var name in STYLE_TO_KEY) { if (STYLE_TO_KEY[name] === key) return name; }
    return "";
  }

  function close() {
    var wrap = $("lz-modal");
    if (!wrap) return;
    clearInterval(state.typeTimer);
    wrap.classList.remove("is-open");
    var done = function () { wrap.hidden = true; document.body.style.overflow = ""; };
    setTimeout(done, 260);
  }

  /* ---------- 渲染 ---------- */
  function stepsBar() {
    var steps = [[1, "确认趋势"], [2, "生成文案"], [3, "选择账号"]];
    return '<div class="lz-steps">' + steps.map(function (s) {
      var cls = state.step >= s[0] ? "is-on" : "";
      if (state.step === s[0]) cls += " is-cur";
      return '<span class="lz-step ' + cls + '"><i>' + s[0] + '</i>' + s[1] + '</span>';
    }).join("") + '</div>';
  }

  function renderSheet() {
    var t = state.trend;
    var sheet = $("lz-sheet");
    sheet.innerHTML =
      '<div class="lz-head">' +
        '<div class="lz-head-l"><div class="lz-head-tag">内容本土化 · 一键转小红书</div>' +
        '<div class="lz-head-name">' + esc(t.name) + '</div>' +
        '<div class="lz-head-meta">' + esc(t.zhName) + ' · 来自 ' + esc(t.source) + ' · 适配指数 <b>' + t.adapt + '/100</b></div></div>' +
        '<button class="lz-close" data-lz-close aria-label="关闭">✕</button>' +
      '</div>' +
      '<div class="lz-body">' +
        stepsBar() +
        '<div class="lz-step1">' +
          '<div class="lz-section-label">风格标签（可多选，决定文案方向）</div>' +
          '<div class="lz-tagsbar" id="lz-tagsbar"></div>' +
        '</div>' +
        '<div class="lz-gen-row"><button class="lz-btn lz-btn-gold lz-btn-wide" data-lz-gen>生成小红书文案</button></div>' +
        '<div id="lz-result"></div>' +
        '<div id="lz-accounts"></div>' +
      '</div>';
    renderTagsBar();
    renderAccounts();
    renderPlaceholder();
  }

  function renderTagsBar() {
    var bar = $("lz-tagsbar");
    if (!bar) return;
    bar.innerHTML = STYLE_TAGS.map(function (s) {
      var on = state.tags.indexOf(s) >= 0;
      return '<button class="lz-pill' + (on ? " is-on" : "") + '" data-lz-tag="' + esc(s) + '">' + esc(s) + '</button>';
    }).join("") + '<span class="lz-pill-note">多选 · 生成时仅取第一个匹配预置，其余作为风格标签沉淀</span>';
  }

  function renderPlaceholder() {
    var box = $("lz-result");
    if (!box || state.result) return;
    box.innerHTML = '<div class="lz-empty">选好风格标签后，点击上方「生成小红书文案」，本地化文案将在这里逐字生成。</div>';
  }

  function renderResultCard() {
    var box = $("lz-result");
    if (!box) return;
    var r = state.result;
    if (!r) { renderPlaceholder(); return; }
    var tagsHtml = (r.tags || []).map(function (t, i) {
      return '<span class="lz-rc-tag">#' + esc(t) + '<i data-lz-deltag="' + i + '" title="删除">✕</i></span>';
    }).join("");
    box.innerHTML =
      '<div class="lz-card">' +
        '<div class="lz-card-head"><span>小红书文案 · 智能改写</span><span class="lz-card-badge">' + esc(state.trend.zhName) + '</span></div>' +
        '<h3 class="lz-title">' + esc(r.title) + '</h3>' +
        '<div class="lz-body-text" id="lz-body-text"></div>' +
        '<div class="lz-rc-tags" id="lz-rc-tags">' + tagsHtml + '<span class="lz-rc-add" data-lz-addtag>＋添加标签</span></div>' +
        '<div class="lz-cover">🎬 <b>封面建议：</b>' + esc(r.cover) + '</div>' +
        '<div class="lz-actions">' +
          '<button class="lz-btn lz-btn-gold" data-lz-copy>复制全文</button>' +
          '<button class="lz-btn lz-btn-ghost" data-lz-regen>重新生成</button>' +
          '<button class="lz-btn lz-btn-outline" data-lz-accounts-toggle>选择账号发布 →</button>' +
        '</div>' +
      '</div>';
    renderTagsRow();
  }

  function renderTagsRow() {
    var row = $("lz-rc-tags");
    if (!row || !state.result) return;
    var r = state.result;
    row.innerHTML = (r.tags || []).map(function (t, i) {
      return '<span class="lz-rc-tag">#' + esc(t) + '<i data-lz-deltag="' + i + '" title="删除">✕</i></span>';
    }).join("") + '<span class="lz-rc-add" data-lz-addtag>＋添加标签</span>';
  }

  function renderTagInput() {
    var row = $("lz-rc-tags");
    if (!row || !state.result) return;
    var r = state.result;
    row.innerHTML = (r.tags || []).map(function (t, i) {
      return '<span class="lz-rc-tag">#' + esc(t) + '<i data-lz-deltag="' + i + '" title="删除">✕</i></span>';
    }).join("") +
      '<span class="lz-rc-add lz-rc-input">' +
        '<input id="lz-tag-input" placeholder="输入标签，回车确认" data-lz-tag-input>' +
        '<button data-lz-addtag-ok>确定</button>' +
      '</span>';
    var inp = $("lz-tag-input");
    if (inp) inp.focus();
  }

  function commitAddTag() {
    var inp = $("lz-tag-input");
    var v = (inp && inp.value || "").replace(/^[#\s]+/, "").replace(/\s+$/, "");
    if (v && state.result) { state.result.tags.push(v); }
    renderTagsRow();
  }

  /* ---------- 生成 / 改写 ---------- */
  function generate() {
    var preset = pickPreset();
    state.baseTitle = preset.title;
    state.regenCount = 0;
    state.result = {
      title: currentTitle(),
      body: preset.body,
      tags: preset.tags.slice(),
      cover: preset.cover
    };
    // 追加非预置风格标签（通勤松弛/新中式/空气叠穿等）
    state.tags.forEach(function (t) {
      if (!STYLE_TO_KEY[t] && state.result.tags.indexOf(t) < 0) state.result.tags.push(t);
    });
    state.step = 2; state.accountsOpen = false;
    clearInterval(state.typeTimer);
    renderSteps();
    renderResultCard();
    var el = $("lz-body-text");
    typewrite(el, state.result.body, 30);
  }

  function regenerate() {
    if (!state.result) { generate(); return; }
    state.regenCount += 1;
    state.result.title = currentTitle();
    clearInterval(state.typeTimer);
    renderSteps();
    renderResultCard();
    var el = $("lz-body-text");
    typewrite(el, state.result.body, 30);
    lzToast("已基于预置模板重新生成（角度切换）");
  }

  function typewrite(el, text, speed) {
    if (!el) return;
    clearInterval(state.typeTimer);
    var i = 0;
    state.typeTimer = setInterval(function () {
      i++;
      el.textContent = text.slice(0, i);
      if (i >= text.length) clearInterval(state.typeTimer);
    }, speed);
  }

  function renderSteps() {
    var old = document.querySelector("#lz-sheet .lz-steps");
    if (old) {
      var tmp = document.createElement("div");
      tmp.innerHTML = stepsBar();
      old.parentNode.replaceChild(tmp.firstChild, old);
    }
  }

  /* ---------- 复制 ---------- */
  function copyFull() {
    var r = state.result;
    if (!r) return;
    var text = r.title + "\n\n" + r.body + "\n\n" + (r.tags || []).map(function (t) { return "#" + t; }).join(" ");
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.focus(); ta.select();
      try { document.execCommand("copy"); } catch (e) {}
      document.body.removeChild(ta);
      lzToast("文案已复制到剪贴板");
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { lzToast("文案已复制到剪贴板"); }).catch(fallback);
    } else fallback();
  }

  /* ---------- 账号选择与发布 ---------- */
  function renderAccounts() {
    var box = $("lz-accounts");
    if (!box) return;
    if (!state.accountsOpen) {
      box.innerHTML = "";
      return;
    }
    var tabs = ACC_TABS.map(function (t) {
      return '<button class="lz-acc-tab' + (state.accTab === t ? " is-on" : "") + '" data-lz-acc-tab="' + esc(t) + '">' + esc(t) + '</button>';
    }).join("");
    var list = ACCOUNTS.filter(function (a) { return a.tab === state.accTab; });
    var rows = list.map(function (a) {
      var on = state.accId === a.id;
      return '<div class="lz-acc-row' + (on ? " is-on" : "") + '" data-lz-acc-sel="' + a.id + '">' +
        '<span class="lz-acc-ava" style="background:' + a.color + '">' + esc(a.name.slice(0, 1)) + '</span>' +
        '<div class="lz-acc-info"><div class="lz-acc-name">' + esc(a.name) + '</div>' +
        '<div class="lz-acc-meta">' + esc(a.fans) + ' 粉丝 · 均互动 ' + esc(a.inter) + '</div></div>' +
        '<span class="lz-acc-radio"></span>' +
      '</div>';
    }).join("");

    box.innerHTML =
      '<div class="lz-acc">' +
        '<div class="lz-acc-head"><div class="lz-acc-title">第三步 · 选择账号与发布设置</div>' +
        '<button class="lz-acc-cancel" data-lz-cancelacc>收起</button></div>' +
        '<div class="lz-acc-tabs">' + tabs + '</div>' +
        '<div class="lz-acc-list">' + rows + '</div>' +
        '<div id="lz-pub"></div>' +
      '</div>';
    renderAccountPub();
  }

  function selectedAccount() {
    for (var i = 0; i < ACCOUNTS.length; i++) { if (ACCOUNTS[i].id === state.accId) return ACCOUNTS[i]; }
    return null;
  }

  function renderAccountPub() {
    var box = $("lz-pub");
    if (!box) return;
    var acc = selectedAccount();
    if (!acc) {
      box.innerHTML = '<div class="lz-pub-empty">请先在上方选择一个发布账号</div>';
      return;
    }
    var timeOpts = [
      ["now", "立即发布"], ["schedule", "定时发布"]
    ].map(function (o) {
      return '<button class="lz-seg' + (state.time === o[0] ? " is-on" : "") + '" data-lz-time="' + o[0] + '">' + o[1] + '</button>';
    }).join("");
    var comps = COMP_OPTS.map(function (c) {
      return '<button class="lz-seg' + (state.comp === c ? " is-on" : "") + '" data-lz-comp="' + esc(c) + '">' + esc(c) + '</button>';
    }).join("");
    var heats = [["否", "不加热"], ["是", "投放加热"]].map(function (o) {
      return '<button class="lz-seg' + (state.heat === o[0] ? " is-on" : "") + '" data-lz-heat="' + o[0] + '">' + o[1] + '</button>';
    }).join("");

    var sched = state.time === "schedule"
      ? '<div class="lz-sched"><input type="datetime-local" id="lz-schedule" value="' + esc(state.schedule) + '"></div>' : "";
    var budget = state.heat === "是"
      ? '<div class="lz-pub-budget">加热预算：<span class="lz-yen">¥</span><input id="lz-budget" type="number" min="0" placeholder="如 5000" value="' + esc(state.budget) + '"></div>' : "";

    box.innerHTML =
      '<div class="lz-pub">' +
        '<div class="lz-pub-sel">已选账号：<b>' + esc(acc.name) + '</b></div>' +
        '<div class="lz-pub-row"><span class="lz-pub-label">发布方式</span><div class="lz-segrow">' + timeOpts + '</div></div>' +
        sched +
        '<div class="lz-pub-row"><span class="lz-pub-label">挂载组件</span><div class="lz-segrow">' + comps + '</div></div>' +
        '<div class="lz-pub-row"><span class="lz-pub-label">投放加热</span><div class="lz-segrow">' + heats + '</div></div>' +
        budget +
        '<div class="lz-pub-actions"><button class="lz-btn lz-btn-gold" data-lz-confirm>确认并发布</button></div>' +
      '</div>';
  }

  function confirmPublish() {
    var acc = selectedAccount();
    if (!acc) { lzToast("请先选择账号"); return; }
    var when = state.time === "now" ? "立即" : (state.schedule ? "定时 " + state.schedule : "定时");
    var heat = state.heat === "是" ? "加热 ¥" + (state.budget || "0") : "不加热";
    clearInterval(state.typeTimer);
    close();
    lzToast("已加入发布队列：" + acc.name + " · " + when + " · " + state.comp + " · " + heat);
  }

  /* ---------- 对外接口 ---------- */
  window.openLocalizeModal = function (trendId) { open(trendId); };
  window.LocalizeModal = { open: open, close: close };
})();