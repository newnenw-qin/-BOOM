/* ============================================================
   归因深度拆解 · 全量归因包（Attribution Deep-Dive）
   5 种下钻模式 · 25+ 交互 SVG 图表 · 右侧 AI 浮动解读助手
   ============================================================ */
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const Mirra = window.Mirra || { navigate: () => {}, toast: () => {} };

  /* ---------------- 调色板 ---------------- */
  const RED = "#E60012", GREEN = "#00B42A", GOLD = "#C7A86B";
  const INK = "#34322f", MUTED = "#9a958e", LINE = "#E8E8E8";
  const BLUE = "#2C6FA6", AMBER = "#B07C2F", VIOLET = "#6B5584";
  const CH = { a: "#C0392B", b: "#E08B7F", c: "#2C6FA6", d: "#8BAED0", e: "#B07C2F" };
  const SPU_COLORS = ["#2C3E50", "#C0392B", "#8E7A5A", "#6B5584", "#2C6FA6"];

  /* ---------------- 数据 ---------------- */

  // ① 按笔记拆解
  const NOTES = [
    { id: "N1", cover: "#e8d5c4", coverT: "🧥", title: "白色西装套装，通勤的第一套战袍", kols: "林屿Lin", date: "09-14", expo: 128.4, inter: 8.6, ctr: 6.7, uv: 3.2, sconv: 11.2, cart: 5.8, gmv: 86.4, roi: 4.7, fun: [128.4, 8.6, 3100, 540] },
    { id: "N2", cover: "#cab9a6", coverT: "🧶", title: "羊绒大衣，一件穿十年", kols: "鹿野 Sen", date: "09-18", expo: 96.2, inter: 5.4, ctr: 5.6, uv: 2.1, sconv: 9.4, cart: 6.1, gmv: 132.0, roi: 5.1, fun: [96.2, 5.4, 2400, 520] },
    { id: "N3", cover: "#d9d2c7", coverT: "👗", title: "通勤一周穿搭·五天不重样", kols: "陈默穿搭日记", date: "09-22", expo: 88.5, inter: 9.2, ctr: 10.4, uv: 2.6, sconv: 7.8, cart: 6.9, gmv: 74.2, roi: 3.9, fun: [88.5, 9.2, 2200, 380] },
    { id: "N4", cover: "#c9c2b8", coverT: "👖", title: "小个子也能撑起阔腿拖地裤", kols: "七月的通勤包", date: "09-26", expo: 112.8, inter: 7.4, ctr: 6.6, uv: 3.0, sconv: 10.1, cart: 5.4, gmv: 68.0, roi: 4.2, fun: [112.8, 7.4, 2600, 410] },
    { id: "N5", cover: "#f0d9d2", coverT: "🧸", title: "芭蕾核·奶油色开衫搭半裙", kols: "韩系衣柜Hanna", date: "10-02", expo: 143.6, inter: 12.1, ctr: 8.4, uv: 3.8, sconv: 12.6, cart: 7.2, gmv: 98.5, roi: 5.4, fun: [143.6, 12.1, 3900, 680] },
    { id: "N6", cover: "#b8c4cc", coverT: "👜", title: "静奢风手袋·通勤闭眼入", kols: "轻奢冷静期", date: "10-06", expo: 76.9, inter: 4.2, ctr: 5.5, uv: 1.8, sconv: 6.9, cart: 4.2, gmv: 45.3, roi: 3.4, fun: [76.9, 4.2, 1400, 210] },
    { id: "N7", cover: "#3a3a3a", coverT: "🖤", title: "黑色大衣不显老·三个配色公式", kols: "打工人的体面", date: "10-10", expo: 101.3, inter: 6.8, ctr: 6.7, uv: 2.4, sconv: 8.8, cart: 5.1, gmv: 59.6, roi: 4.0, fun: [101.3, 6.8, 2100, 360] },
    { id: "N8", cover: "#d7c7b6", coverT: "🤳", title: "通勤大衣测评·微胖/小个子/高个", kols: "大圆脸也能穿", date: "10-15", expo: 135.2, inter: 10.6, ctr: 7.8, uv: 3.5, sconv: 12.0, cart: 6.6, gmv: 88.9, roi: 4.9, fun: [135.2, 10.6, 3400, 590] },
  ];

  const TRAFFIC = [
    { name: "发现页", val: 38, color: "#C0392B" }, { name: "搜索", val: 27, color: "#2C6FA6" },
    { name: "关注", val: 16, color: "#B07C2F" }, { name: "转发", val: 11, color: "#8BAED0" }, { name: "站外", val: 8, color: "#8e7a5a" },
  ];

  const SEARCH_WORDS = [
    { w: "白色西装套装", vol: 58600, same: true }, { w: "通勤穿搭", vol: 42100, same: true },
    { w: "小个子西装", vol: 28900, same: false }, { w: "轻奢通勤", vol: 24700, same: true },
    { w: "西装外套女", vol: 19800, same: false }, { w: "通勤防晒西装", vol: 15400, same: false },
    { w: "奶油色套装", vol: 13200, same: true }, { w: "面试西装", vol: 9600, same: false },
    { w: "西装半裙", vol: 8300, same: false }, { w: "极简通勤", vol: 7100, same: true },
  ];

  // ② 按达人拆解
  const KOLS = [
    { id: "K1", name: "鹿野 Sen", pid: "PY-1032-88", tier: "head", avatar: "#2c3e50", avT: "🦌", price: "¥35w", notes: 2, expo: 380, gmv: 320, roi: 5.0, cpe: 2.6, rating: "S", fans: "248w", match: 87,
      radar: [92, 88, 90, 86, 94, 78],
      notesList: [{ t: "羊绒大衣，一件穿十年", spu: "羊绒大衣", gmv: 210 }, { t: "这件风衣赢麻了", spu: "风衣", gmv: 110 }],
      roiTrend: [4.2, 4.6, 4.4, 4.9, 4.7, 5.0] },
    { id: "K2", name: "林屿Lin", pid: "PY-0871-52", tier: "waist", avatar: "#8e7a5a", avT: "🌊", price: "¥15w", notes: 3, expo: 220, gmv: 180, roi: 4.6, cpe: 3.2, rating: "A", fans: "86w", match: 84,
      radar: [70, 76, 74, 71, 80, 88],
      notesList: [{ t: "白色西装套装·通勤战袍", spu: "西装套装", gmv: 86 }, { t: "西装半裙两穿", spu: "半裙", gmv: 58 }, { t: "通勤开衫叠穿", spu: "针织开衫", gmv: 36 }],
      roiTrend: [4.9, 4.4, 4.1, 4.6, 4.3, 4.6] },
    { id: "K3", name: "陈默穿搭日记", pid: "PY-2204-19", tier: "koc", avatar: "#6b5584", avT: "🌿", price: "¥6w", notes: 4, expo: 150, gmv: 98, roi: 4.0, cpe: 1.9, rating: "B+", fans: "19w", match: 79,
      radar: [55, 82, 78, 60, 74, 92],
      notesList: [{ t: "通勤一周穿搭", spu: "搭配合集", gmv: 74 }, { t: "通勤鞋包混搭", spu: "包袋", gmv: 24 }],
      roiTrend: [3.6, 3.9, 4.2, 4.0, 4.3, 4.0] },
    { id: "K4", name: "江照 Moon", pid: "PY-1555-07", tier: "waist", avatar: "#b07c2f", avT: "🌙", price: "¥22w", notes: 2, expo: 180, gmv: 126, roi: 3.8, cpe: 3.6, rating: "C", fans: "62w", match: 68,
      radar: [74, 70, 66, 58, 62, 64],
      notesList: [{ t: "黑色大衣三式", spu: "大衣", gmv: 68 }, { t: "通勤基础款清单", spu: "基础款", gmv: 58 }],
      roiTrend: [4.4, 4.1, 3.6, 3.9, 3.5, 3.8] },
    { id: "K5", name: "顾清和", pid: "PY-0966-41", tier: "waist", avatar: "#2c6fa6", avT: "🕊️", price: "¥18w", notes: 3, expo: 145, gmv: 92, roi: 3.6, cpe: 3.0, rating: "C", fans: "51w", match: 72,
      radar: [68, 66, 70, 55, 71, 70],
      notesList: [{ t: "轻奢通勤外套", spu: "外套", gmv: 52 }, { t: "雾霾蓝西装", spu: "西装", gmv: 40 }],
      roiTrend: [3.9, 3.7, 3.4, 3.6, 3.5, 3.6] },
    { id: "K6", name: "周绵绵 Mian", pid: "PY-1810-30", tier: "head", avatar: "#c0392b", avT: "🩰", price: "¥28w", notes: 2, expo: 300, gmv: 260, roi: 4.5, cpe: 2.8, rating: "S-", fans: "203w", match: 81,
      radar: [88, 84, 86, 80, 88, 80],
      notesList: [{ t: "芭蕾核开衫半裙", spu: "针织套装", gmv: 140 }, { t: "静奢风通勤手袋", spu: "包袋", gmv: 120 }],
      roiTrend: [4.1, 4.4, 4.2, 4.6, 4.4, 4.5] },
  ];

  // ③ 按关键词拆解
  const KEYWORDS = [
    { w: "白色西装套装", src: "搜索框", vol: 58600, wow: "+42%", notes: 12, uv: 8200, gmv: 86.4, roi: 4.7, up: true },
    { w: "平价轻奢", src: "达人标题", vol: 21400, wow: "+340%", notes: 2, uv: 1400, gmv: 18.6, roi: 3.2, up: true },
    { w: "通勤穿搭", src: "笔记正文", vol: 128000, wow: "+18%", notes: 34, uv: 15600, gmv: 132.0, roi: 4.5, up: true },
    { w: "小个子大衣", src: "评论区", vol: 8900, wow: "+26%", notes: 9, uv: 2400, gmv: 24.8, roi: 3.8, up: true },
    { w: "静奢风", src: "搜索框", vol: 45200, wow: "+95%", notes: 21, uv: 9300, gmv: 98.5, roi: 5.2, up: true },
    { w: "羊绒大衣", src: "笔记正文", vol: 33600, wow: "+12%", notes: 18, uv: 7200, gmv: 132.0, roi: 5.1, up: true },
    { w: "芭蕾核", src: "达人标题", vol: 19800, wow: "+210%", notes: 7, uv: 3100, gmv: 40.2, roi: 4.6, up: true },
    { w: "通勤手袋", src: "搜索框", vol: 12100, wow: "+30%", notes: 11, uv: 2600, gmv: 45.3, roi: 3.9, up: true },
    { w: "黑色大衣配色", src: "评论区", vol: 7400, wow: "+15%", notes: 6, uv: 1100, gmv: 15.8, roi: 3.5, up: true },
    { w: "微胖身材西装", src: "笔记正文", vol: 5200, wow: "+8%", notes: 4, uv: 900, gmv: 12.4, roi: 3.1, up: true },
  ];

  // 全局状态
  const state = {
    tab: "note", selNote: 0, selKol: 0, selKw: 1, // keyword 默认选中「平价轻奢」以配合覆盖不足解读
    granularity: "day", asideCollapsed: false,
  };

  /* ---------------- 工具 ---------------- */
  const escA = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const tipAttr = (lines) => `data-tip="${escA(lines.join("\n"))}"`;
  const money = (n) => "¥" + Number(n).toLocaleString("en-US");
  const wf = (n) => (n >= 10000 ? (n / 10000).toFixed(1) + "w" : Number(n).toLocaleString("en-US"));

  // 确定性序列生成
  function genSeries(n, peak, scale, wobble) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const d = i - peak;
      const v = Math.exp(-(d * d) / 18) * scale + scale * 0.06 * Math.sin(i * (wobble || 0.7));
      out.push(Math.max(1, Math.round(v * 10) / 10));
    }
    return out;
  }

  /* ================= 图表生成器（SVG） ================= */

  function lineChart(w, h, series, opts) {
    opts = opts || {};
    const pad = { l: 34, r: opts.axisR ? 34 : 8, t: 10, b: 22 };
    const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
    let allMax = 0, allMin = Infinity;
    series.forEach((s) => s.data.forEach((v) => { allMax = Math.max(allMax, v); allMin = Math.min(allMin, v); }));
    const max = allMax * 1.12, min = 0;
    const x = (i) => pad.l + (i / (series[0].data.length - 1)) * iw;
    const y = (v) => pad.t + ih - ((v - min) / (max - min || 1)) * ih;
    let svg = "";
    if (opts.grid !== false) {
      for (let g = 0; g <= 4; g++) {
        const gy = pad.t + (ih * g) / 4;
        svg += `<line x1="${pad.l}" y1="${gy}" x2="${w - pad.r}" y2="${gy}" stroke="${LINE}" stroke-width="1"/>`;
        if (!opts.noY) svg += `<text x="${pad.l - 5}" y="${gy + 3}" text-anchor="end" font-size="9" fill="${MUTED}">${Math.round((4 - g) * max / 4)}${opts.unit || ""}</text>`;
      }
    }
    series.forEach((s) => {
      const pts = s.data.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
      svg += `<polyline points="${pts}" fill="none" stroke="${s.color}" stroke-width="${s.width || 2}"/>`;
      s.data.forEach((v, i) => {
        const cx = x(i), cy = y(v);
        svg += `<circle cx="${cx}" cy="${cy}" r="2.6" fill="${s.color}" ${tipAttr([s.name, `第${i + 1}天 · ${v}${opts.unit || ""}`])}/>`;
      });
    });
    if (opts.markIdx != null && series[0]) {
      const mx = x(opts.markIdx), my = y(series[0].data[opts.markIdx]);
      svg += `<circle cx="${mx}" cy="${my}" r="5" fill="${RED}" stroke="#fff" stroke-width="2"/>`;
      svg += `<text x="${mx}" y="${my - 10}" text-anchor="middle" font-size="9" fill="${RED}">${opts.markLabel || "爆发日"}</text>`;
    }
    svg += `<text x="${w - pad.r}" y="${h - 6}" text-anchor="end" font-size="9" fill="${MUTED}">${opts.xLabel || ""}</text>`;
    if (opts.legend) {
      let lx = pad.l;
      opts.legend.forEach((lg) => { svg += `<text x="${lx}" y="${pad.t - 1}" font-size="9" fill="${lg.color}">● ${lg.name}</text>`; lx += 62; });
    }
    return `<svg viewBox="0 0 ${w} ${h}" class="dd-chart" preserveAspectRatio="xMinYMid meet">${svg}</svg>`;
  }

  function hBars(w, h, items, opts) {
    opts = opts || {};
    const padL = opts.padL || 96, rh = 20, gap = 8;
    const max = Math.max(...items.map((i) => i.val));
    let svg = "";
    items.forEach((it, i) => {
      const yy = i * (rh + gap) + 6;
      const bw = (it.val / max) * (w - padL - 70);
      svg += `<text x="${padL - 6}" y="${yy + rh / 2 + 3}" text-anchor="end" font-size="10" fill="${INK}">${it.label}</text>`;
      svg += `<rect x="${padL}" y="${yy}" width="${bw}" height="${rh}" rx="4" fill="${it.color || CH.b}" ${tipAttr([it.label, `${it.val}${opts.unit || ""}` + (it.sub ? " · " + it.sub : "")])}/>`;
      svg += `<text x="${padL + bw + 6}" y="${yy + rh / 2 + 3}" font-size="10" fill="${INK}" font-weight="700">${it.val}${opts.unit || ""}</text>`;
      if (it.tag) svg += `<text x="${padL + bw + 46}" y="${yy + rh / 2 + 3}" font-size="9" fill="${it.tag === "同款" ? GREEN : MUTED}">${it.tag}</text>`;
    });
    return `<svg viewBox="0 0 ${w} ${h}" class="dd-chart" preserveAspectRatio="xMinYMid meet">${svg}</svg>`;
  }

  function donutChart(size, items, center) {
    const r = size / 2 - 12, sw = 16, cx = size / 2, cy = size / 2;
    const C = 2 * Math.PI * r;
    const total = items.reduce((s, i) => s + i.val, 0) || 1;
    let acc = 0;
    let svg = "";
    items.forEach((it) => {
      const len = (C * it.val) / total;
      svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${it.color}" stroke-width="${sw}"
        stroke-dasharray="${len.toFixed(1)} ${(C - len).toFixed(1)}" stroke-dashoffset="${(-acc).toFixed(1)}" ${tipAttr([it.name, it.val + "%"])}/>`;
      acc += len;
    });
    svg += `<text x="${cx}" y="${cy - 2}" text-anchor="middle" font-size="17" font-weight="900" fill="${INK}">${center.val || ""}</text>`;
    svg += `<text x="${cx}" y="${cy + 14}" text-anchor="middle" font-size="9" fill="${MUTED}">${center.label || ""}</text>`;
    return `<svg viewBox="0 0 ${size} ${size}" class="dd-chart">${svg}</svg>`;
  }

  function radarChart(size, dims, actual, industry) {
    const cx = size / 2, cy = size / 2, R = size / 2 - 26, n = dims.length;
    const pt = (vals, i) => {
      const ang = (Math.PI * 2 * i) / n - Math.PI / 2;
      return [cx + Math.cos(ang) * R * (vals[i] / 100), cy + Math.sin(ang) * R * (vals[i] / 100)];
    };
    let svg = "";
    // 网格
    for (let ring = 1; ring <= 4; ring++) {
      const rr = (R * ring) / 4;
      const poly = dims.map((_, i) => {
        const ang = (Math.PI * 2 * i) / n - Math.PI / 2;
        return `${(cx + Math.cos(ang) * rr).toFixed(1)},${(cy + Math.sin(ang) * rr).toFixed(1)}`;
      }).join(" ");
      svg += `<polygon points="${poly}" fill="none" stroke="${LINE}" stroke-width="1"/>`;
    }
    dims.forEach((dm, i) => {
      const ang = (Math.PI * 2 * i) / n - Math.PI / 2;
      svg += `<line x1="${cx}" y1="${cy}" x2="${cx + Math.cos(ang) * R}" y2="${cy + Math.sin(ang) * R}" stroke="${LINE}" stroke-width="1"/>`;
      svg += `<text x="${cx + Math.cos(ang) * (R + 13)}" y="${cy + Math.sin(ang) * (R + 13) + (i === 0 ? -6 : 3)}" text-anchor="middle" font-size="9" fill="${MUTED}">${dm}</text>`;
    });
    const ind = dims.map((_, i) => pt(industry, i).join(",")).join(" ");
    const act = dims.map((_, i) => pt(actual, i).join(",")).join(" ");
    svg += `<polygon points="${ind}" fill="none" stroke="${MUTED}" stroke-width="1.5" stroke-dasharray="4 3"/>`;
    svg += `<polygon points="${act}" fill="rgba(192,57,43,0.16)" stroke="${RED}" stroke-width="2"/>`;
    dims.forEach((_, i) => {
      const [px, py] = pt(actual, i);
      svg += `<circle cx="${px}" cy="${py}" r="3" fill="${RED}" ${tipAttr([dims[i], actual[i] + " 分", "行业均值 " + industry[i]])}/>`;
    });
    return `<svg viewBox="0 0 ${size} ${size}" class="dd-chart">${svg}</svg>`;
  }

  function scatterChart(w, h, points, selIdx, opts) {
    opts = opts || {};
    const pad = { l: 40, r: 14, t: 12, b: 30 };
    const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
    const maxX = Math.max(...points.map((p) => p.x)) * 1.1, maxY = Math.max(...points.map((p) => p.y)) * 1.15;
    const x = (v) => pad.l + (v / maxX) * iw, y = (v) => pad.t + ih - (v / maxY) * ih;
    let svg = "";
    for (let g = 0; g <= 4; g++) {
      const gy = pad.t + (ih * g) / 4;
      svg += `<line x1="${pad.l}" y1="${gy}" x2="${w - pad.r}" y2="${gy}" stroke="${LINE}"/>`;
      svg += `<text x="${pad.l - 4}" y="${gy + 3}" text-anchor="end" font-size="9" fill="${MUTED}">${Math.round((4 - g) * maxY / 4)}</text>`;
    }
    points.forEach((p, i) => {
      const r = 6 + (p.roi / 6) * 14;
      const sel = i === selIdx;
      svg += `<circle cx="${x(p.x)}" cy="${y(p.y)}" r="${r}" fill="${sel ? RED : CH.c}" opacity="${sel ? 0.9 : 0.55}" stroke="${sel ? "#fff" : "none"}" stroke-width="2" ${tipAttr([p.name, `互动 ${p.x}w · GMV ¥${p.y}w`, `ROI ${p.roi}`])}/>`;
    });
    svg += `<text x="${pad.l}" y="${h - 8}" font-size="9" fill="${MUTED}">互动量（w） →</text>`;
    svg += `<text x="${pad.l}" y="${pad.t - 2}" font-size="9" fill="${MUTED}">GMV（¥万） · 气泡=ROI</text>`;
    return `<svg viewBox="0 0 ${w} ${h}" class="dd-chart" preserveAspectRatio="xMinYMid meet">${svg}</svg>`;
  }

  function stackedBar(w, h, cats, series) {
    const pad = { l: 30, r: 8, t: 10, b: 26 };
    const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
    const bw = (iw / cats.length) * 0.5;
    let totals = cats.map((_, i) => series.reduce((s, sr) => s + sr.data[i], 0));
    const max = Math.max(...totals) * 1.15;
    const x = (i) => pad.l + ((i + 0.5) / cats.length) * iw - bw / 2;
    let svg = "";
    cats.forEach((c, i) => {
      let accY = 0;
      series.forEach((sr) => {
        const v = sr.data[i], bh = (v / max) * ih;
        const yy = pad.t + ih - accY - bh;
        svg += `<rect x="${x(i)}" y="${yy}" width="${bw}" height="${bh}" fill="${sr.color}" rx="2" ${tipAttr([c, sr.name, "GMV ¥" + v + "w"])}/>`;
        accY += bh;
      });
      svg += `<text x="${x(i) + bw / 2}" y="${pad.t + ih + 12}" text-anchor="middle" font-size="8.5" fill="${MUTED}">${c}</text>`;
    });
    return `<svg viewBox="0 0 ${w} ${h}" class="dd-chart" preserveAspectRatio="xMinYMid meet">${svg}</svg>`;
  }

  function areaStack(w, h, cats, series) {
    const pad = { l: 34, r: 8, t: 8, b: 22 };
    const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
    let totals = cats.map((_, i) => series.reduce((s, sr) => s + sr.data[i], 0));
    const max = Math.max(...totals) * 1.12;
    const x = (i) => pad.l + (i / (cats.length - 1)) * iw;
    const y = (v) => pad.t + ih - (v / max) * ih;
    let svg = "";
    // 从下往上堆叠面积
    const layers = series.map((sr, si) => {
      const cum = cats.map((_, i) => series.slice(0, si + 1).reduce((s, s2) => s + s2.data[i], 0));
      const prev = cats.map((_, i) => si === 0 ? 0 : series.slice(0, si).reduce((s, s2) => s + s2.data[i], 0));
      let path = cum.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
      path += " " + prev.slice().reverse().map((v, i) => `L${x(cats.length - 1 - i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
      path += " Z";
      const mid = (cum.reduce((s, v) => s + v, 0) / cats.length);
      return `<path d="${path}" fill="${sr.color}" opacity="0.82" ${tipAttr([sr.name, cats.length + " 天累计 GMV ¥" + Math.round(cum.reduce((s, v) => s + v, 0)) + "w"])}/>`;
    });
    svg += layers.join("");
    for (let g = 0; g <= 3; g++) {
      const gy = pad.t + (ih * g) / 3;
      svg += `<line x1="${pad.l}" y1="${gy}" x2="${w - pad.r}" y2="${gy}" stroke="rgba(255,255,255,0.5)"/>`;
    }
    return `<svg viewBox="0 0 ${w} ${h}" class="dd-chart" preserveAspectRatio="xMinYMid meet">${svg}</svg>`;
  }

  function funnelH(w, h, steps) {
    const label = ["A 曝光", "I 互动", "TI 深度种草", "P 购买"];
    const colors = ["#2c3e50", "#2c6fa6", "#b07c2f", "#c0392b"];
    const max = steps[0].val;
    const rh = 30, gap = 12;
    let svg = "";
    steps.forEach((s, i) => {
      const bw = Math.max(40, (s.val / max) * (w - 120));
      const yy = i * (rh + gap) + 8;
      const rate = i === 0 ? "100%" : Math.round((s.val / steps[i - 1].val) * 100) + "%";
      svg += `<rect x="90" y="${yy}" width="${bw}" height="${rh}" rx="5" fill="${colors[i]}" ${tipAttr([label[i], wf(s.val), "环比转化 " + rate])}/>`;
      svg += `<text x="90" y="${yy + rh + 10}" font-size="9" fill="${MUTED}">${label[i]}</text>`;
      svg += `<text x="${90 + bw + 8}" y="${yy + 19}" font-size="11" font-weight="900" fill="${colors[i]}">${wf(s.val)}</text>`;
      if (i > 0) svg += `<text x="${90 + bw + 8}" y="${yy + 33}" font-size="8.5" fill="${GREEN}">${rate}</text>`;
    });
    return `<svg viewBox="0 0 ${w} ${h}" class="dd-chart" preserveAspectRatio="xMinYMid meet">${svg}</svg>`;
  }

  function wordCloud(w, h, words) {
    // 简单螺旋布局
    const positions = [
      [0.16, 0.22], [0.48, 0.16], [0.78, 0.26], [0.12, 0.52], [0.42, 0.46],
      [0.74, 0.62], [0.26, 0.8], [0.56, 0.82], [0.86, 0.86], [0.66, 0.36],
    ];
    const maxV = Math.max(...words.map((x) => x.vol));
    let svg = "";
    words.forEach((wd, i) => {
      const fs = Math.max(11, 11 + (wd.vol / maxV) * 26);
      const op = 0.35 + (wd.roi / 5.5);
      const col = wd.roi >= 4.5 ? RED : (wd.roi >= 3.8 ? BLUE : MUTED);
      const [px, py] = positions[i % positions.length];
      svg += `<text x="${w * px}" y="${h * py}" font-size="${fs.toFixed(1)}" font-weight="700" fill="${col}" opacity="${op.toFixed(2)}" ${tipAttr([wd.w, "搜索量 " + wf(wd.vol), "关联笔记 " + wd.notes + " 篇", "GMV ¥" + wd.gmv + "w · ROI " + wd.roi])}>${wd.w}</text>`;
    });
    return `<svg viewBox="0 0 ${w} ${h}" class="dd-chart" preserveAspectRatio="xMinYMid meet">${svg}</svg>`;
  }

  function heatmap(w, h, rows, matrix, maxV) {
    const padL = 96, padT = 16, cellH = Math.min(22, (h - padT - 20) / rows.length);
    const cellW = (w - padL - 10) / matrix[0].length;
    let svg = "";
    rows.forEach((r, ri) => {
      svg += `<text x="${padL - 6}" y="${padT + ri * cellH + cellH / 2 + 3}" text-anchor="end" font-size="9" fill="${MUTED}">${r}</text>`;
      matrix[ri].forEach((v, ci) => {
        const a = Math.max(0.06, v / maxV);
        svg += `<rect x="${padL + ci * cellW + 1}" y="${padT + ri * cellH + 1}" width="${cellW - 2}" height="${cellH - 2}" rx="3" fill="${RED}" opacity="${a.toFixed(2)}" ${tipAttr([r, "第 " + (ci + 1) + " 天", "GMV ¥" + v + "w"])}/>`;
      });
    });
    return `<svg viewBox="0 0 ${w} ${h}" class="dd-chart" preserveAspectRatio="xMinYMid meet">${svg}</svg>`;
  }

  function calendarHeatmap(w, n, peakDays) {
    const cols = 53, rows = 7, cell = Math.floor(w / cols), gap = 1;
    const tot = cols * rows;
    let svg = "";
    for (let i = 0; i < tot; i++) {
      const c = i % cols, r = Math.floor(i / cols);
      // 峰值日附近高亮
      let v = 0.05 + 0.1 * Math.sin(i * 0.5);
      peakDays.forEach((p, pi) => v += Math.exp(-Math.pow(i - p, 2) / (40 + pi * 20)));
      v = Math.min(1, v);
      const a = 0.08 + v * 0.92;
      svg += `<rect x="${c * cell + 1}" y="${r * cell + 2}" width="${cell - gap}" height="${cell - gap}" rx="2" fill="${RED}" opacity="${a.toFixed(2)}" ${tipAttr(["第 " + (i + 1) + " 天", "GMV 热度 " + Math.round(v * 100)])}/>`;
    }
    return `<svg viewBox="0 0 ${w} ${rows * cell + 4}" class="dd-chart" preserveAspectRatio="xMinYMid meet">${svg}</svg>`;
  }

  function vBars(w, h, items, opts) {
    opts = opts || {};
    const pad = { l: 30, r: 8, t: 14, b: 26 };
    const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
    const bw = (iw / items.length) * 0.55;
    const vals = items.map((i) => i.val);
    const max = Math.max(...vals.map((v) => Math.abs(v))) * 1.2 || 1;
    const x = (i) => pad.l + ((i + 0.5) / items.length) * iw - bw / 2, y = (v) => pad.t + ih - ((v < 0 ? 0 : v) / max) * ih;
    let svg = `<line x1="${pad.l}" y1="${pad.t + ih}" x2="${w - pad.r}" y2="${pad.t + ih}" stroke="${INK}" stroke-width="1"/>`;
    items.forEach((it, i) => {
      const v = it.val, yy = v < 0 ? pad.t + ih : y(v), bh = Math.abs(v) / max * ih;
      svg += `<rect x="${x(i)}" y="${yy}" width="${bw}" height="${bh}" rx="3" fill="${v < 0 ? GREEN : (it.c || RED)}" ${tipAttr([it.label, (v >= 0 ? "+" : "") + v + (opts.unit || "")])}/>`;
      svg += `<text x="${x(i) + bw / 2}" y="${pad.t + ih + 12}" text-anchor="middle" font-size="8.5" fill="${MUTED}">${it.label}</text>`;
    });
    return `<svg viewBox="0 0 ${w} ${h}" class="dd-chart" preserveAspectRatio="xMinYMid meet">${svg}</svg>`;
  }

  function waterfall(w, h, items) {
    // items: [{label, val, dir:'up'|'down', total}]
    const pad = { l: 60, r: 8, t: 14, b: 26 };
    const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
    const bw = (iw / items.length) * 0.5;
    const maxV = Math.max(...items.map((i) => i.end || i.val || 1)) * 1.1;
    const x = (i) => pad.l + ((i + 0.5) / items.length) * iw - bw / 2;
    let svg = "";
    items.forEach((it, i) => {
      const yy = pad.t + ih - (it.end / maxV) * ih;
      const bh = (it.size / maxV) * ih;
      svg += `<rect x="${x(i)}" y="${yy}" width="${bw}" height="${bh}" rx="3" fill="${it.color}" ${tipAttr([it.label, (it.dir === "up" ? "+" : it.dir === "down" ? "−" : "") + "¥" + it.val + "w", "累计 ¥" + it.end + "w"])}/>`;
      svg += `<text x="${x(i) + bw / 2}" y="${pad.t + ih + 12}" text-anchor="middle" font-size="8" fill="${MUTED}">${it.label}</text>`;
    });
    return `<svg viewBox="0 0 ${w} ${h}" class="dd-chart" preserveAspectRatio="xMinYMid meet">${svg}</svg>`;
  }

  function sankey(w, h, leftNode, links) {
    const padL = 14, padR = 14, midX = w * 0.34;
    const lh = h - 30, rh = h - 30;
    let svg = "";
    const ly = (i, n) => 15 + (i + 0.5) * (lh / n), ry = (i, n) => 15 + (i + 0.5) * (rh / n);
    const lN = links.length, rN = 3;
    links.forEach((lk, i) => {
      const x1 = padL, y1 = ly(i, lN), y2 = ry(i % rN, rN);
      const bw = 10 + (lk.val / 100) * 22;
      svg += `<path d="M${x1},${y1 - bw / 2} L${midX},${y1 - bw / 2} L${w - padR - 46},${y2 - bw / 2} L${w - padR - 46},${y2 + bw / 2} L${midX},${y1 + bw / 2} Z" fill="${lk.color}" opacity="0.75" ${tipAttr([leftNode + " · " + lk.name, lk.val + "%", "流向 → " + ["曝光", "进店", "成交"][i % rN]])}/>`;
      svg += `<text x="${x1 + 4}" y="${y1 + 3}" font-size="9" fill="${INK}">${lk.name}</text>`;
      svg += `<text x="${midX + 6}" y="${y1 + 3}" font-size="8.5" fill="${MUTED}">${lk.val}%</text>`;
    });
    return `<svg viewBox="0 0 ${w} ${h}" class="dd-chart" preserveAspectRatio="xMinYMid meet">${svg}</svg>`;
  }

  /* ================= 渲染 · Tabs ================= */

  function renderTabs() {
    const tabs = [
      ["note", "① 按笔记拆解"], ["kol", "② 按达人拆解"], ["kw", "③ 按关键词拆解"],
      ["time", "④ 按时间趋势"], ["person", "⑤ 单达人深度下钻"],
    ];
    return tabs.map(([k, label]) => `<button class="dd-tab ${state.tab === k ? "is-on" : ""}" data-dd-tab="${k}">${label}</button>`).join("");
  }

  function card(title, sub, badges, body, extra) {
    return `<div class="dd-card ${extra || ""}">
      <div class="dd-card-head">${title ? `<div><div class="dd-card-title">${title}</div>${sub ? `<div class="dd-card-sub">${sub}</div>` : ""}</div>` : ""}${badges ? `<div class="dd-card-badges">${badges}</div>` : ""}</div>
      <div class="dd-card-body">${body}</div>
    </div>`;
  }

  /* ① 笔记 */
  function noteTableHtml() {
    const rows = NOTES.map((n, i) => `
      <tr class="dd-row ${i === state.selNote ? "is-sel" : ""}" data-sel-note="${i}">
        <td><div class="dd-cover" style="background:${n.cover}">${n.coverT}</div></td>
        <td><div class="dd-ttl" title="${n.title}">${n.title}</div><div class="dd-sub-l">${n.date} · ${n.kols}</div></td>
        <td>${wf(n.expo)}</td><td>${n.inter}w</td><td>${n.ctr}%</td><td>${n.uv}w</td>
        <td>${n.sconv}%</td><td>${n.cart}%</td><td class="dd-gmv">${n.gmv.toFixed(1)}w</td>
        <td class="dd-roi">${n.roi}</td>
        <td>${wf(n.fun[0]).replace("w", "")}w/${wf(n.fun[1])}/${wf(n.fun[2])}/${wf(n.fun[3])}</td>
      </tr>`).join("");
    return `<div class="dd-table-wrap"><table class="dd-table">
      <thead><tr>
        <th></th><th>笔记 / 达人</th><th>曝光</th><th>互动</th><th>CTR</th><th>进店UV</th>
        <th>搜索转</th><th>加购</th><th>GMV</th><th>ROI</th><th>A→I→TI→P</th>
      </tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  function noteChartsHtml() {
    const n = NOTES[state.selNote];
    const pk = 3 + state.selNote % 3;
    const expo = genSeries(30, pk, 12 + state.selNote, 0.7);
    const conv = genSeries(30, pk, 2.6, 0.9).map((v, i) => +(v * (i > pk ? 1.1 : 0.8)).toFixed(2));
    const scatterPoints = NOTES.map((x) => ({ name: x.kols, x: x.inter, y: x.gmv, roi: x.roi }));

    const c1 = card("水平漏斗 · A → I → TI → P", "各层级人数与环比转化，流失层绿色标注", "",
      funnelH(430, 168, n.fun.map((v, i) => ({ val: v }))));
    const c2 = card("双轴折线 · 发布后 30 天", "左轴曝光 / 右轴转化", "", lineChart(430, 190, [
      { name: "曝光", color: BLUE, data: expo },
      { name: "转化", color: RED, data: conv },
    ], { markIdx: pk, markLabel: "爆发日", legend: [{ name: "曝光", color: BLUE }, { name: "转化", color: RED }], axisR: true, unit: "w" }));
    const c3 = card("流量来源占比", "内嵌总进店 UV", "", `<div class="dd-flex"><div>${donutChart(150, TRAFFIC, { val: n.uv.toFixed(1) + "w", label: "总进店UV" })}</div><div class="dd-legend">${TRAFFIC.map((t) => `<div class="dd-lg"><i style="background:${t.color}"></i>${t.name} <b>${t.val}%</b></div>`).join("")}</div></div>`);
    const c4 = card("散点 · 互动 × GMV（气泡=ROI）", "多笔记对比，红点为当前选中", "", scatterChart(430, 240, scatterPoints, state.selNote));
    const c5 = card("该笔记带动的搜索词 Top10", "同款词覆盖状态", "", hBars(430, 300, SEARCH_WORDS.map((s) => ({ label: s.w, val: s.vol, tag: s.same ? "同款" : "" })), { unit: "", padL: 92 }));
    return `<div class="dd-charts">${c1}${c2}${c3}${c4}${c5}</div>`;
  }

  function noteTabHtml() {
    return `<div class="dd-tabpane dd-note">
      ${card("笔记列表 · 单篇粒度", "点击任一行下钻该笔记详情", `<span class="dd-badge gold">${NOTES.length} 篇合作笔记</span>`, noteTableHtml())}
      ${noteChartsHtml()}
    </div>`;
  }

  /* ② 达人 */
  function kolCardsHtml() {
    return `<div class="dd-kol-row">${KOLS.map((k, i) => `
      <div class="dd-kol ${i === state.selKol ? "is-sel" : ""}" data-sel-kol="${i}">
        <div class="dd-kol-top"><div class="dd-av" style="background:${k.avatar}">${k.avT}</div>
          <div><div class="dd-kol-name">${k.name}</div><div class="dd-sub-l">${k.pid}</div></div>
          <span class="dd-tier t-${k.tier}">${k.tier === "head" ? "头部" : k.tier === "waist" ? "腰部" : "KOC"}</span></div>
        <div class="dd-kol-metrics">
          <div><b>${k.gmv}w</b><span>总GMV</span></div><div><b>${k.expo}w</b><span>总曝光</span></div>
          <div><b>${k.roi}</b><span>平均ROI</span></div><div><b>¥${k.cpe}</b><span>CPE/次</span></div>
        </div>
        <div class="dd-kol-meta"><span>报价 <b>${k.price}</b></span><span>合作 <b>${k.notes}</b> 篇</span><span class="dd-rating r-${k.rating}">${k.rating}</span></div>
      </div>`).join("")}</div>`;
  }

  function kolChartsHtml() {
    const k = KOLS[state.selKol];
    const dims = ["曝光力", "互动力", "种草力", "转化力", "内容质量", "性价比"];
    const industry = [80, 78, 76, 70, 82, 75];
    const bubble = KOLS.map((x) => ({ name: x.name, x: parseFloat(x.price.replace("¥", "").replace("w", "")), y: x.gmv, size: x.inter || x.expo / 10, roi: x.roi }));

    const c1 = card("六维能力雷达", "实线=本达人 · 虚线=行业均值", "", `<div class="dd-flex center">${radarChart(240, dims, k.radar, industry)}</div>`);
    const c2 = card("合作笔记 GMV 贡献堆叠", "按 SPU 分层", "", stackedBar(430, 190, k.notesList.map((x) => x.t.length > 5 ? x.t.slice(0, 5) + "…" : x.t), k.notesList.map((x, i) => ({ name: x.spu, color: SPU_COLORS[i % SPU_COLORS.length], data: k.notesList.map((y, j) => j === i ? y.gmv : 0) }))));
    const c3 = card("近 6 次合作 ROI 趋势", "标注本次 ROI", "", lineChart(430, 170, [{ name: "ROI", color: RED, data: k.roiTrend }], { markIdx: k.roiTrend.length - 1, markLabel: "本次", noY: false }));
    const c4 = card("达人气泡矩阵 · 报价 × GMV", "气泡大小=互动 · 颜色=ROI", "", scatterChart(430, 230, bubble, state.selKol));
    const c5 = card("桑基图 · 粉丝流向", "流失环节绿色标注", "", sankey(430, 190, "达人粉丝", [
      { name: "粉丝触达", val: 100, color: "#2c3e50" }, { name: "笔记曝光", val: 62, color: "#2c6fa6" },
      { name: "进店浏览", val: 31, color: "#8baed0" }, { name: "实际成交", val: 14, color: "#c0392b" },
    ]));
    return `<div class="dd-charts">${c1}${c2}${c3}${c4}${c5}</div>`;
  }

  function kolTabHtml() {
    return `<div class="dd-tabpane dd-kol-pane">
      ${card("达人拆解 · 横向对比", "点击达人卡片下钻分析", "", kolCardsHtml())}
      ${kolChartsHtml()}
    </div>`;
  }

  /* ③ 关键词 */
  function kwTableHtml() {
    return `<div class="dd-table-wrap"><table class="dd-table">
      <thead><tr><th>关键词</th><th>来源</th><th>搜索量</th><th>周环比</th><th>关联笔记</th><th>进店UV</th><th>GMV</th><th>ROI</th></tr></thead>
      <tbody>${KEYWORDS.map((k, i) => `
        <tr class="dd-row ${i === state.selKw ? "is-sel" : ""}" data-sel-kw="${i}">
          <td class="dd-kw">${k.w}</td>
          <td><span class="dd-src">${k.src}</span></td>
          <td>${wf(k.vol)}</td>
          <td class="${k.up ? "up" : "down"}">${k.wow}</td>
          <td>${k.notes}</td><td>${wf(k.uv)}</td>
          <td class="dd-gmv">${k.gmv.toFixed(1)}w</td><td class="dd-roi">${k.roi}</td>
        </tr>`).join("")}</tbody></table></div>`;
  }

  function kwChartsHtml() {
    const k = KEYWORDS[state.selKw];
    const pk = 8 + state.selKw % 4;
    const brand = genSeries(30, pk, 30 + state.selKw * 2, 0.6);
    const industry = genSeries(30, pk, 40, 0.4);
    const days = 14, notes = ["N1", "N2", "N3", "N4", "N5", "N6"];
    const matrix = notes.map((_, ri) => Array.from({ length: days }, (_, ci) => Math.round((0.3 + Math.sin((ci + ri) * 0.6) * 0.15 + (ci === 10 ? 0.5 : 0) + ri * 0.12) * 9 * 10) / 10));
    const maxH = Math.max(...matrix.flat());
    const funnelSteps = [{ label: "搜索", val: k.vol }, { label: "点击笔记", val: Math.round(k.vol * 0.21) }, { label: "进店", val: Math.round(k.uv * 10000) }, { label: "加购", val: Math.round(k.uv * 10000 * 0.32) }, { label: "成交", val: Math.round(k.gmv * 40) }];
    const platforms = [{ name: "小红书", rate: k.notes >= 10 ? 82 : (k.notes * 6) }, { name: "淘宝", rate: 48 }, { name: "京东", rate: 35 }];

    const c1 = card("关键词词云", "大小=搜索量 · 颜色=转化率，点击词云筛选", "", wordCloud(430, 210, KEYWORDS));
    const c2 = card("搜索量 vs 行业大盘（近 30 天）", "竖线=内容发布日", "", lineChart(430, 180, [
      { name: "品牌", color: RED, data: brand }, { name: "大盘", color: MUTED, data: industry },
    ], { markIdx: pk, markLabel: "发布日", legend: [{ name: "品牌", color: RED }, { name: "大盘", color: MUTED }], unit: "w" }));
    const c3 = card("热力图 · 日期 × 笔记", "颜色深浅=当日该词 GMV", "", heatmap(430, 160, notes, matrix, maxH));
    const c4 = card("搜索 → 成交漏斗", "标注流失最大环节", "", funnelH(430, 220, funnelSteps.map((s) => ({ val: s.val }))));
    const c5 = card("各平台占位情况", "占位率进度条", "", `<div class="dd-plats">${platforms.map((p) => `
        <div class="dd-plat"><div class="dd-plat-name">${p.name}</div><div class="dd-plat-bar"><i style="width:${p.rate}%"></i></div><b>${p.rate}%</b></div>`).join("")}</div><div class="dd-plat-note">小红书占位 ${k.notes} 篇 · 淘宝/京东为站内承接</div>`);
    return `<div class="dd-charts">${c1}${c2}${c3}${c4}${c5}</div>`;
  }

  function kwTabHtml() {
    return `<div class="dd-tabpane dd-kw-pane">
      ${card("关键词拆解 · 词级粒度", "点击关键词行下钻分析", "", kwTableHtml())}
      ${kwChartsHtml()}
    </div>`;
  }

  /* ④ 时间趋势 */
  function timeControls() {
    return `<div class="dd-ctrl">
      <div class="dd-gran">${["day", "week", "month"].map((g) => `<button class="${state.granularity === g ? "is-on" : ""}" data-gran="${g}">${g === "day" ? "日" : g === "week" ? "周" : "月"}</button>`).join("")}</div>
      <div class="dd-range">近 30 天 <span>▾</span></div>
    </div>`;
  }

  function timeTabHtml() {
    const channels = [
      { name: "站内", color: "#2c3e50" }, { name: "天猫", color: "#c0392b" }, { name: "京东", color: "#b07c2f" }, { name: "到店核销", color: "#6b5584" },
    ];
    const days = 30;
    const dayCats = Array.from({ length: days }, (_, i) => "D" + (i + 1));
    const daily = channels.map((ch, ci) => ({ name: ch.name, color: ch.color, data: genSeries(days, 9 + ci, 22 + ci * 9, 0.7 + ci * 0.1) }));
    const total = daily[0].data.reduce((s, v, i) => s + daily.reduce((s2, d) => s2 + d.data[i], 0), 0);
    const multi = [
      { name: "曝光", color: BLUE, data: genSeries(days, 10, 88, 0.6) },
      { name: "互动", color: AMBER, data: genSeries(days, 10, 64, 0.7) },
      { name: "进店", color: VIOLET, data: genSeries(days, 10, 52, 0.8) },
      { name: "成交", color: RED, data: genSeries(days, 12, 40, 0.9) },
    ];
    const weeks = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"];
    const roiWeeks = weeks.map((w, i) => ({ label: w, val: +(4.1 + Math.sin(i * 0.9) * 0.5 + (i === 5 ? 0.4 : 0)).toFixed(1) }));
    const waterfallData = [
      { label: "上月基数", val: 1050, size: 1050, end: 1050, dir: "base", color: "#9a958e" },
      { label: "新增笔记", val: 180, size: 180, end: 1230, dir: "up", color: RED },
      { label: "达人增量", val: 320, size: 320, end: 1550, dir: "up", color: "#c0392b" },
      { label: "内容日历", val: 90, size: 90, end: 1640, dir: "up", color: BLUE },
      { label: "自然流失", val: 400, size: 400, end: 1240, dir: "down", color: GREEN },
    ];

    const c1 = card("每日 GMV 堆叠（按渠道）", "总 GMV " + money(Math.round(total)) , `<span class="dd-badge">总 ¥${Math.round(total)}w</span>`, areaStack(430, 190, dayCats, daily));
    const c2 = card("核心指标趋势 · 归一化指数", "可 hover 查看各线", "", lineChart(430, 180, multi, { legend: multi.map((m) => ({ name: m.name, color: m.color })), noY: true }));
    const c3 = card("全年日历热力图", "颜色深浅=当日 GMV · 快速定位高峰", "", calendarHeatmap(700, 371, [78, 112, 170, 245, 320, 355]), "span");
    const c4 = card("各周 ROI 对比", "标注最高 / 最低", "", vBars(430, 190, roiWeeks, { unit: "" }));
    const c5 = card("本月 GMV 瀑布", "增量来源可视化", "", waterfall(430, 210, waterfallData));
    return `<div class="dd-tabpane dd-time-pane">
      ${timeControls()}
      <div class="dd-charts">${c2}${c1}${c4}${c5}${c3}</div>
    </div>`;
  }

  /* ⑤ 单达人深度下钻 */
  function personTabHtml() {
    const k = KOLS[0]; // 默认选中鹿野 Sen
    const funnel = [380, 23, 8600, 1420];
    const spuDonut = [
      { name: "羊绒大衣", val: 66, color: "#2c3e50" }, { name: "风衣", val: 34, color: "#c0392b" },
    ];
    const kwRank = [{ w: "羊绒大衣", v: 132 }, { w: "静奢风", v: 98 }, { w: "通勤穿搭", v: 74 }, { w: "奶油色", v: 52 }];
    const left = `
      ${card("全部合作笔记", "点击展开详情", "", k.notesList.map((n, i) => `<div class="dd-mini-note"><i style="background:${SPU_COLORS[i]}">${i + 1}</i><div><b>${n.t}</b><span>${n.spu} · GMV ¥${n.gmv}w</span></div></div>`).join(""))}
      ${card("粉丝画像气泡", "年龄 / 城市分布", "", `<div class="dd-fan-tags"><span>25-34岁 58%</span><span>一线城市 44%</span><span>通勤白领 72%</span><span>高消费力 61%</span></div>`)}
      ${card("历史合作 ROI 折线", "", "", lineChart(430, 150, [{ name: "ROI", color: RED, data: k.roiTrend }], { markIdx: 5, markLabel: "本次" }))}`;
    const mid = `
      ${card("流转漏斗 A→I→TI→P", "动态更新", "", funnelH(400, 168, funnel.map((v) => ({ val: v }))))}
      ${card("各 SPU 贡献占比", "", "", `<div class="dd-flex center">${donutChart(150, spuDonut, { val: "¥320w", label: "总GMV" })}</div><div class="dd-legend">${spuDonut.map((s) => `<div class="dd-lg"><i style="background:${s.color}"></i>${s.name} <b>${s.val}%</b></div>`).join("")}</div>`)}
      ${card("搜索词贡献排名", "", "", hBars(400, 150, kwRank.map((x) => ({ label: x.w, val: x.v })), { unit: "w", padL: 82 }))}`;
    const right = `
      ${card("内容改进建议", "优先级排序", "", `<div class="dd-sugg-mini">${ASST.person.suggestions.map((s) => `<div class="dd-sugg ${s.prio}"><span>${PRIO_ICON[s.prio]}</span>${s.text}</div>`).join("")}</div>`)}
      ${card("下次合作策略", "", "", `<div class="dd-strat">${ASST.person.strategy}</div>`)}
      ${card("营销影响小结", "", "", `<div class="dd-impact">${ASST.person.impact}</div>`)}`;
    return `<div class="dd-tabpane dd-person-pane">
      ${card("达人档案 · " + k.name, k.pid + " · 蒲公英合作账号", `<span class="dd-tier t-${k.tier}">${k.tier === "head" ? "头部" : "腰部"}</span><span class="dd-badge gold">${k.rating} 级</span>`,
        `<div class="dd-profile"><div class="dd-av big" style="background:${k.avatar}">${k.avT}</div>
        <div class="dd-profile-meta"><div><b>${k.fans}</b><span>粉丝</span></div><div><b>${k.price}</b><span>报价</span></div><div><b>${k.notes}</b><span>合作数</span></div><div><b>${k.roi}</b><span>平均ROI</span></div><div><b>87%</b><span>人群匹配</span></div></div></div>`)}
      <div class="dd-three">
        <div class="dd-col">${left}</div>
        <div class="dd-col">${mid}</div>
        <div class="dd-col">${right}</div>
      </div>
    </div>`;
  }

  /* ================= AI 解读助手 ================= */
  const PRIO_ICON = { urgent: "🔴", high: "🟡", opt: "🟢" };
  const PRIO_NAME = { urgent: "紧急", high: "重要", opt: "优化" };

  const ASST = {
    note: {
      score: 62, scoreLabel: "内容质量评分",
      summary: "当前选中<b>《白色西装套装，通勤的第一套战袍》</b>（林屿Lin），累计曝光 128.4w，GMV ¥86.4w，ROI 4.7。",
      impact: `<p>该笔记发布第 <b class="up">3</b> 天进入搜索页，带动「白色西装套装」搜索量 <b class="up">+286%</b>，但 P 层转化率仅 <b class="down">2.1%</b>，低于均值 3.8%。瓶颈在于挂链位置过深。</p>`,
      suggestions: [
        { prio: "urgent", text: "优化封面 CTR", steps: "当前首图 CTR 6.7%，建议替换为「白色西装 + 通勤」实拍定妆照，标题前置「通勤战袍」关键词。", open: false },
        { prio: "high", text: "前置商品卡", steps: "将商品卡从结尾移到正文第 2 段，缩短从种草到点击的路径。", open: false },
        { prio: "opt", text: "追加评论区置顶链接", steps: "在评论区置顶店铺 / 商品链接，承接长尾搜索流量。", open: false },
      ],
    },
    kol: {
      rating: "A", ratingLabel: "达人综合评级",
      summary: "当前选中<b>林屿Lin</b>（腰部 · 报价 ¥15w · 合作 3 篇），总 GMV ¥180w，平均 ROI 4.6。",
      impact: `<p>粉丝画像与 AURORA & ASH 目标人群匹配度 <b class="up">87%</b>，但互动成本 <b class="down">¥3.2/次</b>，高于同层级均值 ¥2.1。内容调性偏休闲，与「晨曦与灰」极简轻奢感存在偏差。</p>`,
      suggestions: [
        { prio: "urgent", text: "调整 Brief 强调通勤轻奢", steps: "下次 Brief 明确「通勤轻奢」场景与灰调质感关键词，弱化休闲宽松表达。", open: false },
        { prio: "high", text: "增加静物细节特写", steps: "加入面料 / 缝线 / 五金静物镜头，放大质感价值感。", open: false },
        { prio: "opt", text: "续约但压价至 ¥12w 档", steps: "基于 CPE 偏高，建议续约报价压至 ¥12w 以内。", open: false },
      ],
    },
    kw: {
      score: 34, scoreLabel: "关键词商业价值评分",
      summary: "当前选中关键词<b>「平价轻奢」</b>，搜索量 2.14w，周环比 +340%。",
      impact: `<p>「平价轻奢」搜索量月增 <b class="up">340%</b>，但 AURORA & ASH 占位笔记仅 <b class="down">2 篇</b>，被竞品占据前 3 位，内容覆盖严重不足。</p>`,
      suggestions: [
        { prio: "urgent", text: "紧急补 3–5 篇「平价轻奢」场景笔记", steps: "围绕「平价轻奢通勤」产出 3–5 篇图文 + 短视频，抢占搜索占位。", open: false },
        { prio: "high", text: "达人 Brief 强制包含该词", steps: "在合作 Brief 的正文 / 标题关键词清单中强制写入「平价轻奢」。", open: false },
        { prio: "opt", text: "聚光投放加词包", steps: "在聚光投放计划中新增「平价轻奢 / 轻奢平价」词包，扩大竞价覆盖。", open: false },
      ],
    },
    time: {
      score: 82, scoreLabel: "周期健康度评分",
      summary: "近 30 天 GMV 累计 <b>¥1,240w</b>，环比 <b class='up'>+18%</b>。",
      impact: `<p>主要由 <b>鹿野 Sen</b> 合作笔记（贡献 <b class="up">¥320w</b>）和内容日历优化（发布频次 <b class="up">+40%</b>）驱动。⚠️ 第 3 周 GMV 骤降 <b class="down">23%</b>，原因为江照 Moon 笔记评论区负面反馈（已消解）。</p>`,
      suggestions: [
        { prio: "high", text: "维持每周 12–15 篇发布频次", steps: "保持当前内容日历节奏，重点倾斜高 ROI 的静奢 / 通勤方向。", open: false },
        { prio: "urgent", text: "追加 ¥8w 聚光追投高 ROI 笔记", steps: "对 ROI 前 20% 的笔记追加聚光投放预算，放大成熟流量。", open: false },
        { prio: "opt", text: "筹备斋月特别企划", steps: "借势海外斋月节点，筹备「通勤 + 节日」双场景内容。", open: false },
      ],
    },
    person: {
      rating: "S", ratingLabel: "达人综合评级",
      summary: "聚焦<b>鹿野 Sen</b>（头部 · 报价 ¥35w · 粉丝 248w），合作 2 篇贡献 GMV ¥320w。",
      impact: `<p>鹿野 Sen 转化力 <b class="up">86</b> 分，粉丝结构与品牌轻奢人群高度重合，是本次 GMV 增量的首要贡献者，建议作为长期头部合作伙伴维系。</p>`,
      suggestions: [
        { prio: "high", text: "升级为年框头部合作", steps: "以年框形式锁定档期，争取更好报价与优先排期。", open: false },
        { prio: "opt", text: "输出「面料溯源」定制内容", steps: "为其定制羊绒源头工厂纪实，强化高端价值感。", open: false },
        { prio: "opt", text: "建立专属反哺机制", steps: "持续追踪其笔记关键词贡献，反哺 Brief 优化。", open: false },
      ],
      strategy: "锁定为年框头部伙伴，优先排产羊绒大衣与风衣两条高 ROI 线，Brief 持续强化「晨曦与灰」的通勤轻奢叙事。",
    },
  };

  function asideBody() {
    const a = ASST[state.tab === "note" ? "note" : state.tab === "kol" ? "kol" : state.tab === "kw" ? "kw" : state.tab === "time" ? "time" : "person"];
    let scoreHtml;
    if (a.rating) {
      scoreHtml = `<div class="dd-score"><div class="dd-score-big">${a.rating}</div><div class="dd-score-label">${a.ratingLabel}</div></div>`;
    } else {
      const r = 27, C = 2 * Math.PI * r, off = C - (a.score / 100) * C;
      const col = a.score >= 70 ? GREEN : a.score >= 40 ? AMBER : RED;
      scoreHtml = `<div class="dd-score"><svg viewBox="0 0 70 70" class="dd-ring"><circle cx="35" cy="35" r="${r}" fill="none" stroke="#eee" stroke-width="6"/><circle cx="35" cy="35" r="${r}" fill="none" stroke="${col}" stroke-width="6" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${off}" transform="rotate(-90 35 35)"/><text x="35" y="39" text-anchor="middle" font-size="16" font-weight="900" fill="${col}">${a.score}</text></svg><div class="dd-score-label">${a.scoreLabel}</div></div>`;
    }
    const suggs = a.suggestions.map((s, i) => `
      <div class="dd-sugg ${s.prio}">
        <div class="dd-sugg-head" data-sugg="${i}"><span>${PRIO_ICON[s.prio]}</span><b>${s.text}</b><i class="dd-caret">▾</i></div>
        <div class="dd-sugg-steps" data-sugg-steps="${i}" hidden><span>${PRIO_NAME[s.prio]} · 操作步骤</span>${s.steps}</div>
      </div>`).join("");
    return `
      <div class="dd-score-row">${scoreHtml}</div>
      <div class="dd-aside-sec"><div class="dd-aside-h">当前视图摘要</div><p class="dd-aside-sum">${a.summary}</p></div>
      <div class="dd-aside-sec"><div class="dd-aside-h">营销影响评估</div><div class="dd-impact">${a.impact}</div></div>
      <div class="dd-aside-sec"><div class="dd-aside-h">内容改进建议</div><div class="dd-sugg-list">${suggs}</div></div>
      <div class="dd-aside-actions">
        <button class="dd-btn primary" data-aside-act="brief">生成优化 Brief</button>
        <button class="dd-btn" data-aside-act="ad">追加投放</button>
        <button class="dd-btn ghost" data-aside-act="ignore">忽略此建议</button>
      </div>
      <div class="dd-aside-sec"><div class="dd-aside-h">追问助手</div>
        <div class="dd-follow"><input placeholder="如：为什么第3天转化率下降？" data-follow-input>
        <button data-follow-ask>提问</button></div>
        <div class="dd-follow-ans" data-follow-ans></div>
      </div>`;
  }

  function asideHtml() {
    return `<div class="dd-aside-inner">
      <div class="dd-aside-head"><div class="dd-aside-title">🤖 AI 解读助手</div><button class="dd-collapse" data-aside-collapse>${state.asideCollapsed ? "◀" : "▶"}</button></div>
      ${state.asideCollapsed ? "" : asideBody()}
    </div>`;
  }

  /* ================= 渲染主入口 ================= */
  function render() {
    const body = state.tab === "note" ? noteTabHtml()
      : state.tab === "kol" ? kolTabHtml()
      : state.tab === "kw" ? kwTabHtml()
      : state.tab === "time" ? timeTabHtml()
      : personTabHtml();
    return `<div class="dd">
      <div class="dd-head">
        <button class="dd-back" data-dd-back>← 返回回声</button>
        <div><h2 class="dd-title">归因深度拆解 <span class="dd-badge gold">全量归因包 ¥2999/月</span></h2>
        <p class="dd-sub">单达人 / 笔记 / 关键词级全量归因下钻 · 动态交互图表 + AI 解读</p></div>
      </div>
      <div class="dd-tabs">${renderTabs()}</div>
      <div class="dd-main ${state.asideCollapsed ? "aside-off" : ""}">
        <div class="dd-body">${body}</div>
        <aside class="dd-aside">${asideHtml()}</aside>
      </div>
      <div class="dd-tip" hidden></div>
    </div>`;
  }

  /* ================= 交互 ================= */
  function answerFollowUp(q) {
    const t = q.toLowerCase();
    if (t.includes("转化") || t.includes("下降") || t.includes("第3天") || t.includes("第三天")) return "推理：转化在第 3 天后下降，主要因为发现页流量进入平稳期 + 挂链位置偏深导致 P 层流失。建议把商品卡前置到正文第 2 段，并在评论区置顶链接承接长尾。";
    if (t.includes("封面") || t.includes("ctr") || t.includes("点击率")) return "推理：封面 CTR 偏低的核心是首图信息层级不清。建议用「真人上身 + 单品高对比 + 场景文案」三元素重构首图，A/B 测 2 版，目标 CTR 提升 1–2pct。";
    if (t.includes("roi") || t.includes("投产") || t.includes("投放")) return "推理：当前 ROI 由「达人自然流量 + 聚光付费」双通道贡献。高 ROI 笔记集中在静奢 / 通勤方向，建议对 ROI 前 20% 笔记追加预算，砍掉 ROI < 2 的长尾。";
    if (t.includes("词") || t.includes("搜索") || t.includes("占位")) return "推理：关键词占位不足会直接损失搜索流量。优先用「图文笔记」抢占搜索型关键词，达人 Brief 强制植入目标词，配合聚光词包竞价的组合拳。";
    return "推理：已结合当前视图的曝光→互动→种草→转化全链路数据，初步定位瓶颈在「P 层转化」，建议优先优化商品卡位置与评论区承接，再观察 3 天数据反馈。";
  }

  function mount() {
    const root = document.querySelector(".dd");
    if (!root) return;
    const view = $("module-view");

    // Tab 切换
    root.querySelectorAll("[data-dd-tab]").forEach((b) => b.onclick = () => {
      state.tab = b.dataset.ddTab;
      view.innerHTML = render();
      mount();
      view.scrollTop = 0;
    });

    // 返回回声
    const back = root.querySelector("[data-dd-back]");
    if (back) back.onclick = () => Mirra.navigate("echo");

    // 助手收起 / 展开
    const col = root.querySelector("[data-aside-collapse]");
    if (col) col.onclick = () => { state.asideCollapsed = !state.asideCollapsed; view.innerHTML = render(); mount(); };

    // 建议展开
    root.querySelectorAll("[data-sugg]").forEach((h) => h.onclick = () => {
      const steps = root.querySelector(`[data-sugg-steps="${h.dataset.sugg}"]`);
      if (steps) steps.hidden = !steps.hidden;
    });

    // 助手动作按钮
    root.querySelectorAll("[data-aside-act]").forEach((b) => b.onclick = () => {
      if (b.dataset.asideAct === "brief") { Mirra.toast("已生成优化 Brief，跳转触点模块"); Mirra.navigate("touch"); }
      else if (b.dataset.asideAct === "ad") { Mirra.toast("携带高 ROI 笔记参数，跳转投放控制台"); Mirra.navigate("biz"); }
      else { b.closest(".dd-sugg-list") ? null : null; Mirra.toast("已标记此建议为已读"); }
    });

    // 追问
    const fAsk = root.querySelector("[data-follow-ask]");
    const fInput = root.querySelector("[data-follow-input]");
    const fAns = root.querySelector("[data-follow-ans]");
    const askFn = () => {
      const q = fInput.value.trim();
      if (!q) return;
      fAns.innerHTML = `<div class="dd-follow-q">Q：${q}</div><div class="dd-follow-a"><span>DeepSeek V4 Pro</span>${answerFollowUp(q)}</div>`;
      fInput.value = "";
    };
    if (fAsk) { fAsk.onclick = askFn; fInput.addEventListener("keydown", (e) => { if (e.key === "Enter") askFn(); }); }

    // 笔记行选中
    root.querySelectorAll("[data-sel-note]").forEach((r) => r.onclick = () => {
      state.selNote = +r.dataset.selNote;
      view.innerHTML = render(); mount();
    });
    // 达人卡片选中
    root.querySelectorAll("[data-sel-kol]").forEach((c) => c.onclick = () => {
      state.selKol = +c.dataset.selKol;
      view.innerHTML = render(); mount();
    });
    // 关键词行选中
    root.querySelectorAll("[data-sel-kw]").forEach((c) => c.onclick = () => {
      state.selKw = +c.dataset.selKw;
      view.innerHTML = render(); mount();
    });
    // 时间粒度
    root.querySelectorAll("[data-gran]").forEach((g) => g.onclick = () => {
      state.granularity = g.dataset.gran;
      view.innerHTML = render(); mount();
    });

    // Tooltip
    const tip = root.querySelector(".dd-tip");
    root.addEventListener("mouseover", (e) => {
      const t = e.target.closest("[data-tip]");
      if (!t) return;
      tip.innerHTML = (t.getAttribute("data-tip") || "").split("\n").join("<br>");
      tip.hidden = false;
    });
    root.addEventListener("mousemove", (e) => {
      if (tip.hidden) return;
      let x = e.clientX + 14, y = e.clientY + 14;
      if (x + 160 > window.innerWidth) x = e.clientX - 170;
      if (y + 60 > window.innerHeight) y = e.clientY - 70;
      tip.style.left = x + "px"; tip.style.top = y + "px";
    });
    root.addEventListener("mouseout", (e) => {
      const t = e.target.closest("[data-tip]");
      if (t) tip.hidden = true;
    });
  }

  window.DeepDive = { render, mount };
})();