/* ============================================================
   可调取虚拟数据库 —— 小红书商业化 AI Agent 演示数据
   ============================================================ */
window.DB = (function () {
  "use strict";

  // ---------- 登录页品牌环 ----------
  const loginBrands = [
    ["icicle.jpg", "ICICLE"], ["guyu.jpg", "谷雨"], ["roseonly.jpg", "roseonly"],
    ["dji.jpg", "DJI"], ["xueersi.jpg", "学而思"], ["fabrique.jpg", "Fabrique"],
    ["littleswan.jpg", "小天鹅"], ["fakeme.jpg", "Fakeme"], ["casio.jpg", "CASIO"],
    ["joypeace.jpg", "JOY & PEACE"], ["fliggy.jpg", "飞猪旅行"], ["fanbeauty.jpg", "FANBEAUTY"],
    ["smeg.jpg", "smeg"], ["revive.jpg", "RéVive"], ["tasogare.jpg", "隅田川咖啡"],
    ["chowtaiseng.jpg", "周大生"], ["tautropfen.jpg", "TAUTROPFEN"], ["vitagreen.jpg", "维特健灵"],
    ["apple.jpg", "Apple"], ["tieforher.jpg", "TIE FOR HER"], ["bewinch.jpg", "碧云泉"],
    ["laurastar.jpg", "LAURASTAR"], ["thorne.jpg", "THORNE"],
  ];

  // ---------- 行业 & 身份 ----------
  const industries = [
    { id: "beauty", name: "美妆", icon: "💄" },
    { id: "fashion", name: "服饰", icon: "👗" },
    { id: "maternal", name: "母婴", icon: "🍼" },
    { id: "pet", name: "宠物", icon: "🐾" },
    { id: "food", name: "食品", icon: "🍜" },
    { id: "home", name: "家居", icon: "🛋️" },
    { id: "digital", name: "3C数码", icon: "📱" },
    { id: "auto", name: "汽车", icon: "🚗" },
    { id: "other", name: "其他", icon: "✨" },
  ];

  const roles = [
    { id: "sme", name: "中小商家", desc: "简易向导模式 · 核心指标 + 行动建议", icon: "🏪" },
    { id: "brand", name: "成熟品牌", desc: "深度解析模式 · 全量功能 + 竞品扫描", icon: "🏢" },
    { id: "agency", name: "代理商", desc: "多品牌切换 · 托管店铺计费", icon: "🤝" },
  ];

  const markets = ["中国内地", "东南亚", "北美", "日韩"];

  // ---------- 付费分级 ----------
  const plans = [
    { id: "free", name: "基础免费", price: "¥0", color: "#999", features: ["洞察·基础趋势", "触点·基础撮合", "声场·基础发布", "回声·基础归因"] },
    { id: "insight", name: "高级洞察包", price: "¥999/月", color: "#D4534A", features: ["全量上下游词链", "自定义人群追踪", "行业周报月报", "出海趋势"] },
    { id: "attribution", name: "全量归因包", price: "¥2999/月", color: "#C0392B", features: ["单达人/笔记/关键词级归因", "站外成交回溯", "竞品对比", "全域度量"] },
  ];

  // ---------- 达人库（触点·智能撮合）----------
  const talents = [
    { tier: "head", name: "林屿Lin", handle: "pgy_linyu_0912", fans: "386.2w", credit: "A", price: "¥85,000-120,000", orders: 14, interRate: "5.8%", uv: "4.2w", gmv: "38.6w", audience: "女 25-34岁占68% · 一线/新一线72%", tags: ["高级感", "通勤", "女装"], intro: "都市轻奢女装头部，通勤场景种草标杆" },
    { tier: "head", name: "陈默穿搭日记", handle: "pgy_chenmo_style", fans: "312.7w", credit: "A+", price: "¥68,000-95,000", orders: 11, interRate: "6.2%", uv: "3.6w", gmv: "31.2w", audience: "女 25-34岁占61% · 一线65%", tags: ["穿搭", "职场"], intro: "职场通勤穿搭头部达人" },
    { tier: "head", name: "顾清和", handle: "pgy_guqinghe_2024", fans: "258.4w", credit: "A", price: "¥55,000-78,000", orders: 9, interRate: "4.9%", uv: "2.8w", gmv: "24.9w", audience: "女 30-39岁占55% · 一线/海外58%", tags: ["轻奢", "熟龄"], intro: "轻奢熟龄女性客群高转化" },
    { tier: "waist", name: "七月的通勤包", handle: "pgy_julyy_commute", fans: "87.3w", credit: "A", price: "¥18,000-28,000", orders: 18, interRate: "7.1%", uv: "1.4w", gmv: "12.8w", audience: "女 25-34岁占74% · 新一线68%", tags: ["通勤包", "收纳"], intro: "通勤包袋场景种草，进店率高" },
    { tier: "waist", name: "大圆脸也能穿", handle: "pgy_bigface_fashion", fans: "64.5w", credit: "A-", price: "¥12,000-20,000", orders: 22, interRate: "8.3%", uv: "1.1w", gmv: "9.6w", audience: "女 25-34岁占71% · 二线/新一线63%", tags: ["大码", "平价"], intro: "平价实穿型腰部达人，互动率高" },
    { tier: "waist", name: "韩系衣柜Hanna", handle: "pgy_hanna_krstyle", fans: "52.1w", credit: "B+", price: "¥9,000-15,000", orders: 25, interRate: "9.1%", uv: "9,800", gmv: "7.4w", audience: "女 18-24岁占52% · 新一线/二线71%", tags: ["韩系", "少女"], intro: "韩系少女风格，年轻客群" },
    { tier: "waist", name: "轻奢冷静期", handle: "pgy_quietluxury_li", fans: "41.8w", credit: "A-", price: "¥10,000-16,000", orders: 16, interRate: "5.6%", uv: "8,200", gmv: "11.2w", audience: "女 30-39岁占63% · 一线55%", tags: ["轻奢", "静奢"], intro: "静奢风腰部达人，客单价高" },
    { tier: "koc", name: "小满的衣帽间", handle: "pgy_xiaoman_closet", fans: "8.6w", credit: "B+", price: "¥1,800-3,000", orders: 31, interRate: "11.2%", uv: "1,200", gmv: "1.9w", audience: "女 25-34岁占69% · 新一线64%", tags: ["素人", "衣柜"], intro: "素人感KOC，真实种草" },
    { tier: "koc", name: "打工人的体面", handle: "pgy_office_chic", fans: "6.2w", credit: "B", price: "¥1,200-2,200", orders: 28, interRate: "10.8%", uv: "950", gmv: "1.4w", audience: "女 25-34岁占73% · 一线/新一线61%", tags: ["职场", "平价"], intro: "打工人职场穿搭KOC" },
    { tier: "koc", name: "一周穿搭不重样", handle: "pgy_7days_outfit", fans: "4.9w", credit: "B", price: "¥800-1,500", orders: 34, interRate: "12.6%", uv: "720", gmv: "9,800", audience: "女 18-24岁占58% · 二线67%", tags: ["学生", "平价"], intro: "学生党穿搭KOC，性价比" },
    { tier: "koc", name: "阿May的轻奢清单", handle: "pgy_amay_luxury", fans: "3.7w", credit: "B+", price: "¥600-1,200", orders: 26, interRate: "9.7%", uv: "580", gmv: "1.2w", audience: "女 30-39岁占61% · 一线48%", tags: ["轻奢", "清单"], intro: "轻奢好物清单型KOC" },
  ];

  // ---------- 品牌账号矩阵（声场）----------
  const brandMatrix = {
    brand: { name: "AURORA & ASH", cn: "晨曦与灰", tag: "都市轻奢女装 · 通勤极简 · 均价 ¥1,200-3,800", hq: "上海静安区", stores: "北京/上海/深圳/成都/杭州 共5家", platforms: "小红书/天猫/京东/唯品会" },
    accounts: [
      { type: "主品牌号", typeColor: "#C0392B", name: "@AURORA_ASH 晨曦与灰", fans: "48.6w", notes: "12篇/月", inter: "3.2w", gmv: "¥86w/月", desc: "新品发布/品牌大片/秀场直击/明星上身" },
      { type: "包袋号", typeColor: "#8B5E3C", name: "@AA_Atelier 晨曦工坊", fans: "18.3w", notes: "8篇/月", inter: "1.8w", gmv: "¥32w/月", desc: "包袋设计故事/材质工艺/搭配教程" },
      { type: "种草号", typeColor: "#3A7D44", name: "@晨曦衣橱日记", fans: "12.7w", notes: "20篇/月", inter: "2.6w", gmv: "¥41w/月", desc: "一周穿搭/职场通勤/素人感UGC" },
      { type: "门店号", typeColor: "#2C6FA6", name: "@AURORA_ASH 北京三里屯店", fans: "6.8w", notes: "6篇/月", inter: "4,200", gmv: "未知", desc: "POI：三里屯太古里北区L1-23" },
      { type: "门店号", typeColor: "#2C6FA6", name: "@AURORA_ASH 上海静安店", fans: "9.2w", notes: "8篇/月", inter: "6,800", gmv: "未知", desc: "旗舰店·面积最大·新品首发优先" },
      { type: "门店号", typeColor: "#2C6FA6", name: "@AURORA_ASH 深圳万象城店", fans: "5.4w", notes: "5篇/月", inter: "3,600", gmv: "未知", desc: "POI：万象城L2-256" },
      { type: "门店号", typeColor: "#2C6FA6", name: "@AURORA_ASH 成都太古里店", fans: "7.1w", notes: "6篇/月", inter: "5,200", gmv: "未知", desc: "西南区旗舰·种草转化最高" },
      { type: "门店号", typeColor: "#2C6FA6", name: "@AURORA_ASH 杭州万象城店", fans: "4.9w", notes: "5篇/月", inter: "3,100", gmv: "未知", desc: "POI：万象城L1-108" },
      { type: "售后号", typeColor: "#777", name: "@AURORA_ASH 售后服务中心", fans: "2.3w", notes: "4篇/月", inter: "私信1,200条/月", gmv: "解决率94%", desc: "保养/干洗/尺码指南/售后政策" },
      { type: "导购号", typeColor: "#B07C2F", name: "@AA_静静在上海", fans: "3.2w", notes: "15篇/月", inter: "—", gmv: "未知", desc: "资深搭配师·5年" },
      { type: "导购号", typeColor: "#B07C2F", name: "@AA_小雨在北京", fans: "2.8w", notes: "12篇/月", inter: "—", gmv: "未知", desc: "职场通勤专家" },
      { type: "导购号", typeColor: "#B07C2F", name: "@AA_圆圆成都", fans: "2.6w", notes: "16篇/月", inter: "—", gmv: "未知", desc: "微胖穿搭博主" },
    ],
    summary: [
      { type: "主品牌号", n: 1, fans: "48.6w", notes: 12, inter: "38.4w", gmv: "¥86w" },
      { type: "包袋号", n: 1, fans: "18.3w", notes: 8, inter: "14.4w", gmv: "¥32w" },
      { type: "种草号", n: 1, fans: "12.7w", notes: 20, inter: "52.0w", gmv: "¥41w" },
      { type: "门店号", n: 5, fans: "33.4w", notes: 30, inter: "22.7w", gmv: "未知" },
      { type: "导购号", n: 8, fans: "19.8w", notes: 112, inter: "—", gmv: "未知" },
    ],
    // 门店评论路由数据
    storeRoutes: [
      { store: "北京三里屯", total: 86, toStore: 42, buy: 38, fuzzy: 20, deal: 26 },
      { store: "上海静安", total: 124, toStore: 35, buy: 45, fuzzy: 20, deal: 41 },
      { store: "深圳万象城", total: 67, toStore: 48, buy: 32, fuzzy: 20, deal: 18 },
      { store: "成都太古里", total: 98, toStore: 38, buy: 42, fuzzy: 20, deal: 33 },
      { store: "杭州万象城", total: 54, toStore: 44, buy: 34, fuzzy: 22, deal: 15 },
    ],
    // 门店评论流示例
    comments: [
      { store: "上海静安", user: "小鹿乱撞", text: "这个大衣有货吗？可以线上下单吗", intent: "buy", conf: 0.94 },
      { store: "上海静安", user: "米娅Mia", text: "周末想去店里试穿，营业到几点", intent: "store", conf: 0.91 },
      { store: "北京三里屯", user: "阿茶", text: "这个包包是什么牌子呀", intent: "fuzzy", conf: 0.82 },
      { store: "成都太古里", user: "葡萄不酸", text: "同款链接在哪里，能直接买吗", intent: "buy", conf: 0.96 },
      { store: "北京三里屯", user: "Yuki", text: "店铺地址发一下，想线下逛逛", intent: "store", conf: 0.88 },
      { store: "杭州万象城", user: "一只酸奶", text: "这套穿搭好好看", intent: "fuzzy", conf: 0.79 },
    ],
  };

  // ---------- 负面词库 ----------
  const negativeWords = [
    { cat: "服饰鞋包", words: ["版型差", "显胖", "掉色", "缩水", "起球", "起毛", "扎人", "线头多", "磨脚", "开胶", "货不对板", "化纤感重"] },
    { cat: "美妆个护", words: ["不吸收", "搓泥", "闷痘", "过敏", "假白", "卡粉", "刺鼻", "漏液", "假货", "没效果", "拔干"] },
    { cat: "食品饮料", words: ["太甜", "味道怪", "不新鲜", "过期", "发霉", "漏气", "分量少", "缺斤少两", "齁甜"] },
    { cat: "3C数码", words: ["卡顿", "发热", "续航差", "噪音大", "按键失灵", "续航虚标", "客服推诿", "掉帧"] },
    { cat: "家居日用", words: ["塑料感", "异味", "掉色", "不耐用", "设计反人类", "安装困难", "甲醛", "晃动"] },
    { cat: "通用/物流", words: ["发货慢", "丢件", "态度差", "色差大", "与描述不符", "智商税", "不值这个价"] },
  ];

  // ---------- 动态人群画像 ----------
  const crowds = [
    { name: "升温兴趣人群", count: "28.4万人", trend: "+12.6%", tags: ["秋冬通勤", "羊绒大衣", "繁荣主义"], icon: "🔥", color: "#C0392B", desc: "近7天对通勤轻奢女装兴趣快速升温，搜索与收藏双增" },
    { name: "品类强相关新客", count: "16.2万人", trend: "+8.3%", tags: ["真丝衬衫", "职场新人", "第一套轻奢"], icon: "🌱", color: "#3A7D44", desc: "最近一周进入品类的新客群，关注性价比与第一套通勤装" },
    { name: "竞品流入用户", count: "9.8万人", trend: "-2.1%", tags: ["极简", "羊毛", "国货平替"], icon: "🔄", color: "#2C6FA6", desc: "从对标竞品流向本品牌，诉求集中在面料与版型" },
  ];

  // ---------- 行业趋势时间轴 ----------
  const trendTimeline = [
    { week: "10月 第3周", keywords: ["蕾丝打底", "层次感", "繁荣主义"], hot: "繁荣主义", insight: "「繁荣主义」搜索量周环比 +38%，出游场景成核心增长极" },
    { week: "10月 第2周", keywords: ["复古麂皮", "美拉德回归", "办公室穿搭"], hot: "复古麂皮", insight: "麂皮材质笔记互动率超均值 1.6 倍" },
    { week: "10月 第1周", keywords: ["新中式通勤", "正反两穿", "精致平替"], hot: "正反两穿", insight: "一衣多穿话题收藏率显著抬升" },
    { week: "9月 第4周", keywords: ["美拉德叠穿", "通勤大衣", "暖棕"], hot: "通勤大衣", insight: "降温带动大衣搜索量提前两周启动" },
  ];

  // ---------- 内容节拍（周推送）----------
  const contentBeat = [
    { day: "周一", time: "晚 8:00", dir: "繁荣主义系列上新预告", kw: "繁荣主义 / 蕾丝打底", note: "承接出游场景热度，主推层叠蕾丝单品" },
    { day: "周三", time: "午 12:30", dir: "繁荣主义层次感穿搭拆解", kw: "层次感 / 出游穿搭", note: "导购号矩阵分发，素人感UGC" },
    { day: "周五", time: "晚 7:30", dir: "奢华出游主题直播预告", kw: "繁荣主义 / 秀场", note: "主号直播预热，引导预约" },
    { day: "周日", time: "早 9:00", dir: "周末出游繁荣主义穿搭", kw: "出游 / 层叠蕾丝", note: "种草号软性种草，挂商品卡" },
  ];

  // ---------- 种草外溢建议 ----------
  const spillover = [
    { cat: "羊绒大衣", station: 45, tmall: 35, jd: 12, vip: 8, advise: "建议提升红猫天猫挂链占比至 40%" },
    { cat: "通勤西装", station: 60, tmall: 25, jd: 10, vip: 5, advise: "站内承接为主，维持现状" },
    { cat: "真丝衬衫", station: 50, tmall: 30, jd: 10, vip: 10, advise: "天猫进店率高于均值，适度外溢" },
    { cat: "轻奢包袋", station: 70, tmall: 18, jd: 7, vip: 5, advise: "客单价高，站内必争" },
  ];

  // ---------- 地域控制台 ----------
  const regions = [
    { id: "na", name: "北美", countries: ["美国", "加拿大"], growth: "+18%", desc: "海外月活最高，高客单品类", type: "red", heat: 68, cids: ["us", "ca"] },
    { id: "sea", name: "东南亚", countries: ["马来西亚", "新加坡", "泰国", "印尼"], growth: "+32%", desc: "人口年轻，新手首选", type: "blue", heat: 92, cids: ["my", "sg", "th", "id"] },
    { id: "eu", name: "欧洲", countries: ["英国", "德国", "法国"], growth: "+9%", desc: "高客单、合规严", type: "red", heat: 90, cids: ["gb", "de", "fr"] },
    { id: "me", name: "中东", countries: ["沙特", "阿联酋"], growth: "+21%", desc: "高毛利、本土化要求高", type: "blue", heat: 62, cids: ["sa", "ae"] },
    { id: "latam", name: "拉美", countries: ["墨西哥", "巴西", "智利"], growth: "+26%", desc: "红利区，清关慢", type: "blue", heat: 80, cids: ["mx", "br", "cl"] },
    { id: "jkoru", name: "日韩独联体", countries: ["日本", "韩国", "俄罗斯"], growth: "+14%", desc: "低退货、靠质感信任", type: "red", heat: 78, cids: ["jp", "kr", "ru"] },
  ];

  // ---------- 跨境热词 ----------
  const hotWords = [
    { w: "Sustainable", zh: "可持续", en: "Sustainable", vol: 128, up: 42, comp: 0.6 },
    { w: "Eco-friendly", zh: "环保", en: "Eco-friendly", vol: 96, up: 35, comp: 0.55 },
    { w: "K-beauty", zh: "韩妆", en: "K-beauty", vol: 240, up: 28, comp: 0.8 },
    { w: "Modest fashion", zh: "保守时尚", en: "Modest fashion", vol: 74, up: 51, comp: 0.35 },
    { w: "Minimalist", zh: "极简风", en: "Minimalist", vol: 182, up: 15, comp: 0.7 },
    { w: "Halal", zh: "清真", en: "Halal", vol: 58, up: 47, comp: 0.3 },
    { w: "Quiet luxury", zh: "静奢", en: "Quiet luxury", vol: 165, up: 39, comp: 0.62 },
    { w: "Glocalization", zh: "全球本土化", en: "Glocalization", vol: 41, up: 60, comp: 0.25 },
    { w: "Value for money", zh: "性价比", en: "Value for money", vol: 110, up: 22, comp: 0.5 },
  ];

  // ---------- 文化雷区 ----------
  const cultureRisks = [
    { level: "high", market: "英国", risk: "包装忌大象、山羊、雄鸡、孔雀图案", basis: "英国文化禁忌", replace: "改用简约几何图形" },
    { level: "high", market: "德国", risk: "严禁纳粹相关符号及军团图案", basis: "德国法律禁止", replace: "规避任何民族符号" },
    { level: "high", market: "日本", risk: "忌绿色与黑白相间（丧事联想）", basis: "日本民俗", replace: "优先暖色系" },
    { level: "mid", market: "中东", risk: "禁用猪肉、酒精、过度暴露形象", basis: "伊斯兰教法", replace: "人物需保守着装" },
    { level: "mid", market: "泰国", risk: "忌褐色，尊重佛教", basis: "泰国文化", replace: "避免褐色主视觉" },
    { level: "note", market: "法国", risk: "忌墨绿色、核桃、纸花", basis: "法国习俗", replace: "局部点缀即可" },
    { level: "note", market: "欧美", risk: "忌数字13与星期五", basis: "文化习惯", replace: "促销避开13日" },
  ];

  // ---------- 本地节日日历 ----------
  const festivals = [
    { date: "10-28", market: "北美", name: "万圣节预热", type: "holiday", color: "#8B5E3C" },
    { date: "11-01", market: "北美/欧洲", name: "万圣节", type: "shopping", color: "#C0392B" },
    { date: "11-03", market: "日本", name: "文化之日（三连休）", type: "holiday", color: "#2C6FA6" },
    { date: "11-08", market: "东南亚", name: "排灯节", type: "holiday", color: "#B07C2F" },
    { date: "11-11", market: "中国/东南亚", name: "双11 / 10.10大促", type: "shopping", color: "#C0392B" },
    { date: "11-15", market: "墨西哥", name: "El Buen Fin", type: "shopping", color: "#C0392B" },
    { date: "11-20", market: "中东", name: "白色星期五", type: "shopping", color: "#C0392B" },
    { date: "11-23", market: "日本", name: "勤劳感谢日", type: "holiday", color: "#2C6FA6" },
    { date: "11-28", market: "北美", name: "感恩节", type: "holiday", color: "#8B5E3C" },
    { date: "11-29", market: "全球", name: "黑色星期五", type: "shopping", color: "#C0392B" },
  ];

  // ---------- 行业趋势事件库 ----------
  const trendEvents = [
    { name: "夜人节", tag: "情绪放松", cat: "官方IP", desc: "下班后的精神疗养乐园，主打情绪放松" },
    { name: "慢人节", tag: "生活节奏", cat: "官方IP", desc: "倡导「慢慢来样样好」的生活节奏" },
    { name: "RED GALA", tag: "年度大秀", cat: "官方IP", desc: "用快乐为春天开幕的年度大秀" },
    { name: "马路生活节", tag: "线下体验", cat: "官方IP", desc: "深耕城市烟火气" },
    { name: "心动买买节", tag: "双11种草", cat: "节点大促", desc: "双11核心种草与转化IP" },
    { name: "1年1度购物狂欢", tag: "年度1件", cat: "节点大促", desc: "双11核心IP，鼓励买手分享私藏好物" },
    { name: "618全球购", tag: "跨境大促", cat: "节点大促", desc: "跨境与全球购核心大促节点" },
    { name: "38女神节", tag: "女性消费", cat: "节点大促", desc: "聚焦女性消费与自我表达" },
    { name: "惊喜盒子", tag: "互动组件", cat: "互动玩法", desc: "站内互动组件，激励参与与转化" },
    { name: "笔记漂流瓶", tag: "社交互动", cat: "互动玩法", desc: "通过笔记互换激发社交" },
    { name: "100件可持续小事", tag: "环保", cat: "环保IP", desc: "Plogging、无痕露营等环保IP" },
    { name: "林里小黄鸭", tag: "UGC收集", cat: "品牌IP", desc: "收集小黄鸭激发UGC收集欲" },
  ];

  // ---------- 全域成交归因 ----------
  const attribution = {
    donut: [
      { ch: "小红书站内", val: 45200, pct: 52, color: "#3A7D44" },
      { ch: "天猫(红猫)", val: 28600, pct: 33, color: "#C0392B" },
      { ch: "京东(小红盟)", val: 9800, pct: 11, color: "#2C6FA6" },
      { ch: "唯品会(小红链)", val: 3400, pct: 4, color: "#B07C2F" },
    ],
    rows: [
      { ch: "站内", read: "120k", uv: "8.2k", cart: "1.1k", gmv: "¥45.2k", window: "当日" },
      { ch: "红猫·天猫", read: "85k", uv: "4.1k", cart: "680", gmv: "¥28.6k", window: "15天" },
      { ch: "小红盟·京东", read: "42k", uv: "1.8k", cart: "320", gmv: "¥9.8k", window: "30天" },
      { ch: "小红链·唯品会", read: "18k", uv: "900", cart: "150", gmv: "¥3.4k", window: "15天" },
    ],
    advice: "「精华液」品类天猫外溢 ROI 4.2，高于站内 3.1 → 建议增加红猫挂链笔记占比，从当前 30% 提至 50%",
    detail: [
      { k: "按笔记拆解", desc: "《静奢大衣》笔记带来站外成交最多，单篇天猫 GMV ¥3.2w" },
      { k: "按达人拆解", desc: "达人「林屿Lin」外链转化最好，天猫进店 UV 4.2w" },
      { k: "按关键词拆解", desc: "「通勤大衣」搜索词最终导向天猫成交占比最高" },
      { k: "按时间趋势", desc: "种草阅读→进店→成交的延迟曲线峰值在第 3 天" },
    ],
  };

  // ---------- 商业平台快捷跳转 ----------
  const bizPlatforms = [
    { name: "聚光", icon: "💡", desc: "投流 · 消耗/ROI", metric: "¥12.4w", sub: "消耗/月", roi: "ROI 3.1", action: "去后台", color: "#C0392B" },
    { name: "薯条", icon: "🍟", desc: "笔记加热 · 花费", metric: "68篇", sub: "加热笔记", roi: "花费 ¥2.1w", action: "去后台", color: "#B07C2F" },
    { name: "蒲公英", icon: "🌱", desc: "达人撮合/下单", metric: "14单", sub: "进行中", roi: "待接单 3", action: "去后台", color: "#3A7D44" },
    { name: "千帆", icon: "⛵", desc: "店铺/直播", metric: "¥86w", sub: "月GMV", roi: "在线 1.2k", action: "去后台", color: "#2C6FA6" },
    { name: "乘风", icon: "🌊", desc: "效果投放 · 智能出价", metric: "¥8.6w", sub: "消耗/月", roi: "ROI 2.8", action: "去后台", color: "#6B5584" },
  ];

  // ---------- 直播护航 ----------
  const liveData = {
    gmv: "¥23.6w", online: "1,240", cartRate: "8.2%", gpm: "¥1,180",
    series: [820, 900, 1120, 1280, 1210, 1330, 1460, 1380, 1520, 1600, 1490, 1580],
    alerts: [
      { time: "20:14", msg: "「怎么买」刷屏 12 条，建议挂车笔记置顶", level: "high" },
      { time: "20:02", msg: "每分钟掉人 18%，建议加热直播间流量", level: "mid" },
    ],
  };

  // ---------- 内容笔记文库（单品文案）----------
  const contentLib = [
    { name: "猎装衬衫", tag: "松弛通勤", headline: "本周 TOP 单品｜不必奔赴旷野的松弛", desc: "精选亚麻混纺面料，触感轻薄透气又自带挺括筋骨。", gold: "时刻轻行，自在从容。" },
    { name: "晚霞套装", tag: "印象派针织", headline: "本周 TOP 单品｜不必远赴巴黎的黄昏", desc: "多重色阶纱线糅合印象派柔和笔触，触感绵软。", gold: "霞色落肩，温柔自生。" },
    { name: "琥珀外套", tag: "复古麂皮", headline: "本周 TOP 单品｜不必奔赴老街的复古", desc: "焦糖仿麂皮绒面，蝙蝠袖剪裁包容身形。", gold: "焦糖落肩，自在成诗。" },
    { name: "双生风衣", tag: "正反两穿", headline: "本周 TOP 单品｜无需抉择的双面风度", desc: "正反两穿巧思，即风格AB面，亦生活AB面。", gold: "一衣两境，随心切换。" },
  ];

  // ---------- 明星素材库 ----------
  const stars = [
    { name: "鹿野 Sen", fans: "1,842w", role: "歌手/演员", credit: "S", price: "¥280,000-450,000", handle: "pgy_luye_sen",
      funnel: [5200000, 1860000, 418000, 34200],
      collabs: [
        { brand: "AURORA & ASH 晨曦与灰", item: "黑色皮质拼接西装街拍", inter: "28.6w", search: "+340%", uv: "12.4w", gmv: "¥186w" },
        { brand: "AURORA & ASH 晨曦与灰", item: "米色羊绒大衣机场图", inter: "31.2w", search: "+412%", uv: "14.8w", gmv: "¥213w" },
      ],
      pushes: [
        { note: "鹿野 Sen 黑色皮质拼接西装街拍", target: "天猫红猫", audience: "24-35 岁都市轻奢女性 · 皮质单品高意图" },
        { note: "鹿野 Sen 米色羊绒大衣机场图", target: "京东小红盟", audience: "高净值通勤人群 · 羊绒大衣换季诉求" },
      ],
      brandNotes: [
        { note: "黑色皮质拼接西装 · 通勤穿搭实测", target: "天猫红猫", audience: "24-35 岁都市轻奢女性 · 皮质西装高意图" },
        { note: "米色羊绒大衣 · 冬季怎么搭不出错", target: "京东小红盟", audience: "高净值通勤人群 · 羊绒换季诉求" },
      ] },
    { name: "周绵绵 Mian", fans: "487w", role: "综艺嘉宾/穿搭KOL", credit: "A", price: "¥55,000-88,000", handle: "pgy_zhoumian_mian",
      funnel: [2100000, 610000, 96000, 6400],
      collabs: [
        { brand: "AURORA & ASH 晨曦与灰", item: "格纹西装通勤look", inter: "8.6w", search: "+178%", uv: "3.2w", gmv: "¥48w" },
        { brand: "AURORA & ASH 晨曦与灰", item: "黑色皮衣叠穿日常", inter: "7.9w", search: "+156%", uv: "2.8w", gmv: "¥39w" },
      ],
      pushes: [
        { note: "周绵绵 Mian 格纹西装通勤 look", target: "站内商品卡", audience: "25-30 岁职场新人 · 通勤穿搭种草" },
        { note: "周绵绵 Mian 黑色皮衣叠穿日常", target: "天猫红猫", audience: "年轻女性 · 皮衣个性穿搭诉求" },
      ],
      brandNotes: [
        { note: "格纹西装 · 一周通勤搭配公式", target: "站内商品卡", audience: "25-30 岁职场新人 · 通勤穿搭种草" },
        { note: "黑色皮衣 · 叠穿不显壮的穿法", target: "天猫红猫", audience: "年轻女性 · 皮衣个性穿搭诉求" },
      ] },
    { name: "陈一白 Yibai", fans: "362w", role: "模特/时尚主编", credit: "A", price: "¥42,000-68,000", handle: "pgy_chenyibai_official",
      funnel: [1500000, 420000, 64000, 4300],
      collabs: [
        { brand: "AURORA & ASH 晨曦与灰", item: "驼色大衣极简风", inter: "6.4w", search: "+134%", uv: "2.4w", gmv: "¥36w" },
        { brand: "AURORA & ASH 晨曦与灰", item: "丝质衬衫职场穿搭", inter: "5.8w", search: "+121%", uv: "2.1w", gmv: "¥31w" },
      ],
      pushes: [
        { note: "陈一白 Yibai 驼色大衣极简风", target: "站内商品卡", audience: "25-35 岁极简风女性 · 驼色大衣偏好" },
        { note: "陈一白 Yibai 丝质衬衫职场穿搭", target: "天猫红猫", audience: "25-32 岁都市白领 · 职场衬衫诉求" },
      ],
      brandNotes: [
        { note: "驼色大衣 · 极简造型的选款逻辑", target: "站内商品卡", audience: "25-35 岁极简风女性 · 驼色大衣偏好" },
        { note: "丝质衬衫 · 职场显质感的穿法", target: "天猫红猫", audience: "25-32 岁都市白领 · 职场衬衫诉求" },
      ] },
    { name: "林小满 SUM", fans: "128w", role: "新生代演员/文艺感穿搭", credit: "B", price: "¥12,000-22,000", handle: "pgy_linxiaoman_sum",
      funnel: [860000, 230000, 31000, 2100],
      collabs: [
        { brand: "AURORA & ASH 晨曦与灰", item: "奶白色针织套装校园风", inter: "4.2w", search: "+98%", uv: "1.6w", gmv: "¥19w" },
        { brand: "AURORA & ASH 晨曦与灰", item: "牛仔外套休闲街拍", inter: "3.8w", search: "+87%", uv: "1.3w", gmv: "¥15w" },
      ],
      pushes: [
        { note: "林小满 SUM 奶白色针织套装校园风", target: "站内商品卡", audience: "18-24 岁学生党 · 温柔系穿搭" },
        { note: "林小满 SUM 牛仔外套休闲街拍", target: "京东小红盟", audience: "18-28 岁休闲风人群 · 牛仔外套诉求" },
      ],
      brandNotes: [
        { note: "奶白色针织套装 · 温柔系穿搭指南", target: "站内商品卡", audience: "18-24 岁学生党 · 温柔风穿搭" },
        { note: "牛仔外套 · 休闲街拍怎么穿", target: "京东小红盟", audience: "18-28 岁休闲风人群 · 牛仔外套诉求" },
      ] },
    { name: "江照 Moon", fans: "1,256w", role: "演员/时尚博主", credit: "A", price: "¥180,000-320,000", handle: "pgy_jiangzhao_moon",
      funnel: [1280000, 386000, 64200, 8800],
      collabs: [
        { brand: "AURORA & ASH 晨曦与灰", item: "白色衬衫西装套装", inter: "22.4w", search: "+286%", uv: "9.6w", gmv: "¥142w" },
        { brand: "AURORA & ASH 晨曦与灰", item: "黑色缎面连衣裙", inter: "19.8w", search: "+251%", uv: "8.3w", gmv: "¥118w" },
      ],
      pushes: [
        { note: "江照上身 AURORA & ASH 白色西装套装", target: "天猫红猫", audience: "25-35 岁都市女性 · 通勤穿搭高意图" },
        { note: "Moon 的秋冬通勤大衣 look", target: "站内商品卡", audience: "一线城市轻熟女 · 秋冬大衣换季诉求" },
        { note: "机场私服 · AURORA & ASH 托特包", target: "京东小红盟", audience: "高频通勤白领 · 包袋预算 2000+" },
      ],
      brandNotes: [
        { note: "白色西装套装 · 值得入手的 3 个理由", target: "天猫红猫", audience: "25-35 岁都市女性 · 通勤穿搭高意图" },
        { note: "黑色缎面连衣裙 · 显瘦显白实测", target: "站内商品卡", audience: "轻熟客群 · 缎面裙偏好" },
      ] },
  ];

  // ---------- 智能归因演示（自然语言查询）----------
  const attributionQueries = [
    { q: "看看九月份秋冬上新服装那波投得怎么样", cost: "¥38.6w", outside: "¥52.4w", roi: "4.7", note: "秋冬上新投放，达人与聚光双通道协同" },
    { q: "那达人@林屿Lin那篇呢", cost: "¥8.5w", outside: "¥16.2w", roi: "5.1", note: "林屿Lin 通勤大衣单篇，天猫进店率高" },
  ];

  // ---------- 自然语言查询扩展：内容创意 / 营销节点 / 内容形式 ----------
  const contentIdeas = [
    { idea: "「一件大衣的 72 小时」沉浸纪实：选料 → 缝制 → 上身，连续三天分镜追更", angle: "品牌纪实", account: "@AURORA_ASH 主号", form: "短视频", kpi: "互动 +22%" },
    { idea: "「通勤一周不重样」：同一件单品的 5 种搭法，从周一到周五", angle: "实用穿搭", account: "@晨曦衣橱日记", form: "图文合集", kpi: "收藏 +18%" },
    { idea: "素人试穿对比：微胖 / 小个子 / 高个子三种身材同一件上身", angle: "信任种草", account: "@AA_圆圆成都", form: "测评笔记", kpi: "转化 +15%" },
    { idea: "包袋「材质拆解实验室」：五金、皮料、缝线的成本与工艺公开", angle: "价值证明", account: "@AA_Atelier 工坊", form: "图文/视频", kpi: "客单价提升" },
  ];

  const marketingNodes = [
    { date: "10-28", node: "万圣节预热", action: "发布节日氛围穿搭，主号预告蓄水", window: "提前 3 天", color: "#8B5E3C" },
    { date: "11-01", node: "万圣节", action: "当日互动作答引流，门店同步打卡", window: "当天爆发", color: "#C0392B" },
    { date: "11-11", node: "双11 大促", action: "全矩阵满减攻略 + 直播冲 GMV", window: "11/09 起冲刺", color: "#C0392B" },
    { date: "11-20", node: "中东白色星期五", action: "跨境文案适配 + 保守着装方向", window: "提前一周", color: "#2C6FA6" },
    { date: "11-28", node: "感恩节", action: "暖棕系穿搭 + 回馈粉丝互动", window: "前置 2 天", color: "#8B5E3C" },
    { date: "11-29", node: "黑色星期五", action: "全球购直降 + 门店同步价", window: "11/27 预热", color: "#C0392B" },
  ];

  const contentFormats = [
    { form: "图文笔记", suit: "种草 / 攻略 / 合集", edge: "搜索占位强、长尾沉淀", play: "9:16 竖版 · 首图抓眼", note: "适合「静奢风」「通勤穿搭」等搜索型关键词占位" },
    { form: "短视频", suit: "质感展示 / 上身动效", edge: "信息流推荐强、传播快", play: "15–45s · 前 3s 定胜负", note: "面料垂坠感、行走动效最适合视频呈现" },
    { form: "直播", suit: "大促转化 / 新品首发", edge: "即时成交、GPM 可放大", play: "讲款节奏 + 优惠钩子", note: "配合千帆投放放大 GPM，主推 SPU 集中讲透" },
    { form: "测评 / 对比", suit: "信任背书 / 导购承接", edge: "长尾口碑、素人更可信", play: "多产品 / 多身材对比", note: "UGC 感更可信，适合导购号承接进店流量" },
  ];

  // ---------- 负面舆情词云（品牌相关 · 服饰）----------
  const negativeCloud = [
    { word: "起球", freq: 46, sev: 3, cat: "羊绒大衣", chan: "全渠道", unmet: false, unmetAdvice: "",
      comments: [
        { u: "栗子不甜", t: "穿了两周袖口就起球了，有点失望", d: "10-18" },
        { u: "Momo", t: "面料摸着舒服但起球明显，纠结要不要退", d: "10-20" },
        { u: "阿茶", t: "想买但看好多人说起球，劝退", d: "10-21" },
      ],
      spark: [18, 22, 31, 40, 46, 43, 46] },
    { word: "缩水", freq: 38, sev: 4, cat: "羊毛针织", chan: "种草号", unmet: false, unmetAdvice: "",
      comments: [
        { u: "一只酸奶", t: "手洗还是缩了一码，客服说正常", d: "10-19" },
        { u: "葡萄不酸", t: "洗了一次领口就变形了", d: "10-21" },
      ],
      spark: [20, 24, 28, 36, 34, 38, 38] },
    { word: "掉色", freq: 31, sev: 3, cat: "深色外套", chan: "全渠道", unmet: true, unmetAdvice: "深色外套「显瘦显白」搜索 +14%，建议推固色工艺卖点 + 洗护指南内容",
      comments: [
        { u: "Yuki", t: "黑色大衣内衬把白衬衫染了", d: "10-17" },
        { u: "小鹿乱撞", t: "第一水洗掉色严重", d: "10-20" },
      ],
      spark: [15, 18, 22, 24, 28, 31, 31] },
    { word: "货不对板", freq: 22, sev: 5, cat: "直播款", chan: "主号", unmet: true, unmetAdvice: "直播专场「所见即所得」搜索 +12%，建议上模特实拍 + 同款同批次承诺",
      comments: [
        { u: "Miss L", t: "直播间看的和到手完全两码事", d: "10-20" },
        { u: "不吃香菜", t: "色差巨大，版型也差很多", d: "10-22" },
        { u: "圆滚滚", t: "退货运费还不给报销", d: "10-22" },
      ],
      spark: [8, 10, 12, 15, 18, 22, 22] },
    { word: "版型差", freq: 27, sev: 2, cat: "通勤西装", chan: "主号", unmet: false, unmetAdvice: "",
      comments: [
        { u: "工位观察员", t: "肩线对不上，显肩宽", d: "10-18" },
        { u: "Mia", t: "腰身收得不好，显臃肿", d: "10-21" },
      ],
      spark: [12, 15, 18, 22, 25, 27, 27] },
    { word: "不值这个价", freq: 9, sev: 4, cat: "轻奢包袋", chan: "导购号", unmet: true, unmetAdvice: "轻奢包袋「平替」「值不值」搜索 +9%，建议做「开箱测评 + 用料拆解」内容证明价值",
      comments: [
        { u: "钱包空空", t: "这个价格感觉可以买到更好的", d: "10-19" },
        { u: "理性消费", t: "营销做得好，实物一般", d: "10-22" },
      ],
      spark: [3, 4, 5, 6, 7, 9, 9] },
    { word: "扎人", freq: 19, sev: 2, cat: "毛衣", chan: "种草号", unmet: false, unmetAdvice: "",
      comments: [
        { u: "冬天冷", t: "羊毛扎脖子，要搭打底", d: "10-16" },
      ],
      spark: [8, 10, 12, 15, 17, 19, 19] },
    { word: "线头多", freq: 15, sev: 1, cat: "真丝衬衫", chan: "导购号", unmet: false, unmetAdvice: "",
      comments: [
        { u: "细节控", t: "走线有点粗糙，线头没剪", d: "10-18" },
      ],
      spark: [6, 7, 9, 11, 13, 15, 15] },
    { word: "色差大", freq: 13, sev: 1, cat: "图片款", chan: "全渠道", unmet: false, unmetAdvice: "",
      comments: [
        { u: "网购达人", t: "图片是暖棕，实物偏灰", d: "10-20" },
      ],
      spark: [5, 6, 8, 10, 11, 13, 13] },
    { word: "发货慢", freq: 8, sev: 1, cat: "预售物流", chan: "全渠道", unmet: false, unmetAdvice: "",
      comments: [
        { u: "着急穿", t: "预售等了 12 天还没发", d: "10-21" },
      ],
      spark: [4, 4, 5, 6, 7, 8, 8] },
  ];

  // ---------- 合规预审词库 ----------
  const complianceRules = [
    { w: "最", level: "违禁词", tag: "red", law: "《广告法》第九条：不得使用「国家级、最高级、最佳」等绝对化用语", tip: "改用「优选 / 更 / 口碑」等相对表述" },
    { w: "第一", level: "违禁词", tag: "red", law: "《广告法》第九条：绝对化用语", tip: "改用「领先 / 人气款」" },
    { w: "顶级", level: "违禁词", tag: "red", law: "《广告法》第九条：绝对化用语", tip: "删除或改为「重磅」" },
    { w: "100%", level: "违禁词", tag: "red", law: "《广告法》：不得对功效作绝对化承诺", tip: "改为「高含量」并备注数据来源" },
    { w: "永久", level: "违禁词", tag: "red", law: "《广告法》：禁止夸大耐久性", tip: "改为「长效」" },
    { w: "国家级", level: "违禁词", tag: "red", law: "《广告法》第九条", tip: "删除" },
    { w: "美白", level: "敏感词", tag: "orange", law: "化妆品/服饰功效宣称风险（示例）", tip: "替换为「提亮 / 匀净」" },
    { w: "治愈", level: "敏感词", tag: "orange", law: "医疗用语风险", tip: "替换为「舒缓 / 放松」" },
    { w: "抗菌", level: "敏感词", tag: "orange", law: "涉嫌医疗功效", tip: "替换为「清爽 / 易打理」" },
  ];

  // ---------- 批量管理（达人合作看板）----------
  const batchProjects = [
    { talent: "林屿Lin", item: "通勤大衣", brief: "已确认", draft: "待收稿", rounds: 2, deadline: "10/26", stage: "进行中", price: "¥85,000", fans: "386.2w", rejects: 2, failRate: "32%", riskNote: "头部达人档期紧，建议锁定交稿节点并预留修改时限" },
    { talent: "陈默穿搭日记", item: "双生风衣", brief: "待确认", draft: "未开始", rounds: 0, deadline: "10/27", stage: "待接单", price: "¥68,000", fans: "312.7w", rejects: 0, failRate: "—" },
    { talent: "七月的通勤包", item: "轻奢包袋", brief: "已确认", draft: "已收稿", rounds: 1, deadline: "10/25", stage: "已提交", price: "¥18,000", fans: "87.3w", rejects: 1, failRate: "12%" },
    { talent: "轻奢冷静期", item: "琥珀外套", brief: "已确认", draft: "修改中", rounds: 3, deadline: "10/28", stage: "待审核", price: "¥10,000", fans: "41.8w", rejects: 4, failRate: "68%", riskNote: "修改 3 轮仍未过审，建议电话沟通拍摄脚本与配色口径" },
    { talent: "大圆脸也能穿", item: "晚霞套装", brief: "已确认", draft: "已收稿", rounds: 1, deadline: "10/24", stage: "已完成", price: "¥12,000", fans: "64.5w", rejects: 0, failRate: "6%" },
    { talent: "小满的衣帽间", item: "猎装衬衫", brief: "待确认", draft: "未开始", rounds: 0, deadline: "10/29", stage: "待接单", price: "¥1,800", fans: "8.6w", rejects: 0, failRate: "—" },
    { talent: "打工人的体面", item: "真丝衬衫", brief: "已确认", draft: "待收稿", rounds: 1, deadline: "10/26", stage: "进行中", price: "¥1,200", fans: "6.2w", rejects: 3, failRate: "55%", riskNote: "低价位达人内容质感不稳，建议发送品牌素材包 + 示例笔记" },
  ];

  // ---------- 矩阵分发调度 ----------
  const scheduleDays = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
  const scheduleAccounts = [
    { name: "@AURORA_ASH 主号", type: "主号", best: "晚8点", color: "#C0392B" },
    { name: "@AA_Atelier 工坊", type: "包袋号", best: "晚7点", color: "#8B5E3C" },
    { name: "@晨曦衣橱日记", type: "种草号", best: "午12点", color: "#3A7D44" },
    { name: "@AA_静静在上海", type: "导购号", best: "晚9点", color: "#B07C2F" },
    { name: "@AA_圆圆成都", type: "导购号", best: "晚8点", color: "#B07C2F" },
  ];
  const scheduleSeed = [
    { day: "周一", acct: "@AURORA_ASH 主号", item: "通勤大衣上新预告", time: "晚8:00", status: "已发布" },
    { day: "周一", acct: "@晨曦衣橱日记", item: "一周穿搭不重样", time: "午12:30", status: "待发布" },
    { day: "周二", acct: "@AA_Atelier 工坊", item: "轻奢包袋开箱", time: "晚7:00", status: "待发布" },
    { day: "周三", acct: "@AA_静静在上海", item: "通勤西装搭配", time: "晚9:00", status: "待发布" },
    { day: "周四", acct: "@AURORA_ASH 主号", item: "羊绒大衣工艺大片", time: "晚8:00", status: "待发布" },
    { day: "周五", acct: "@晨曦衣橱日记", item: "秋冬新品直播预告", time: "晚7:30", status: "待发布" },
  ];

  // ---------- 本月分发调度 ----------
  const monthSchedule = [
    { week: "第1周 11/01-11/08", theme: "秋冬新品上市", tag: "新品", color: "#C0392B", items: [
      { acct: "@AURORA_ASH 主号", type: "广告笔记", item: "羊绒大衣系列首发工艺大片", time: "11/03 晚8:00" },
      { acct: "@AA_Atelier 工坊", type: "种草", item: "轻奢通勤包袋开箱 · 通勤穿搭", time: "11/04 晚7:00" },
      { acct: "@晨曦衣橱日记", type: "种草", item: "一周通勤穿搭 · 大衣篇", time: "11/06 午12:30" },
      { acct: "@AA_静静在上海", type: "导购承接", item: "新品到店试穿预约 · 早鸟价", time: "11/07 晚9:00" },
    ]},
    { week: "第2周 11/09-11/15", theme: "双11大促冲刺", tag: "大促", color: "#E2A506", items: [
      { acct: "@AURORA_ASH 主号", type: "广告笔记", item: "双11 满减攻略 + 预售提前购", time: "11/09 晚8:00" },
      { acct: "@晨曦衣橱日记", type: "种草", item: "双11 必入清单 · 静奢风单品", time: "11/10 午12:00" },
      { acct: "@AA_圆圆成都", type: "导购承接", item: "直播预告 · 大促价直降", time: "11/11 晚8:00" },
      { acct: "@AA_Atelier 工坊", type: "种草", item: "大促返场 · 包袋配饰组合", time: "11/14 晚7:00" },
    ]},
    { week: "第3周 11/16-11/22", theme: "大促返场 · 日常穿搭", tag: "长尾", color: "#3A7D44", items: [
      { acct: "@晨曦衣橱日记", type: "种草", item: "通勤西装一周不重样", time: "11/18 午12:30" },
      { acct: "@AURORA_ASH 主号", type: "品牌", item: "面料工艺溯源 · 静奢理念片", time: "11/19 晚8:00" },
      { acct: "@AA_小雨在北京", type: "导购承接", item: "职场通勤搭配答疑直播", time: "11/21 晚8:00" },
    ]},
    { week: "第4周 11/23-11/30", theme: "黑五 · 圣诞预热", tag: "节日", color: "#2C6FA6", items: [
      { acct: "@AURORA_ASH 主号", type: "广告笔记", item: "黑五全球购 · 轻奢单品直降", time: "11/28 晚8:00" },
      { acct: "@AA_Atelier 工坊", type: "种草", item: "圣诞礼盒 · 包袋配饰推荐", time: "11/26 晚7:00" },
      { acct: "@晨曦衣橱日记", type: "种草", item: "感恩节配色穿搭 · 暖棕系", time: "11/27 午12:00" },
      { acct: "@AA_圆圆成都", type: "导购承接", item: "黑五门店同步价 · 到店预约", time: "11/29 晚8:00" },
    ]},
  ];

  // ---------- 搜索占位监控 ----------
  const occupyKeywords = [
    { kw: "通勤大衣", search: "12.8w", own: 18, comp: 32, media: 6, blank: 6, status: "达标" },
    { kw: "静奢风", search: "9.6w", own: 8, comp: 41, media: 9, blank: 4, status: "不足" },
    { kw: "羊绒大衣", search: "7.2w", own: 5, comp: 38, media: 5, blank: 5, status: "不足" },
    { kw: "轻奢包袋", search: "5.4w", own: 12, comp: 22, media: 4, blank: 8, status: "达标" },
    { kw: "通勤西装", search: "4.8w", own: 15, comp: 28, media: 6, blank: 3, status: "达标" },
    { kw: "正反两穿", search: "3.1w", own: 2, comp: 15, media: 2, blank: 9, status: "空白" },
  ];

  // ---------- 长尾流量追踪 ----------
  const longtailNotes = [
    { note: "静奢大衣｜不必奔赴旷野的松弛", acct: "@AURORA_ASH 主号", kw: "静奢风", rank: [18, 9, 3], inter: "9.2%", avg: "5.1%", status: "潜力" },
    { note: "羊绒大衣怎么挑不踩雷", acct: "@晨曦衣橱日记", kw: "羊绒大衣", rank: [42, 30, 22], inter: "8.8%", avg: "6.0%", status: "潜力" },
    { note: "轻奢包袋开箱测评", acct: "@AA_Atelier 工坊", kw: "轻奢包袋", rank: [12, 18, 25], inter: "4.1%", avg: "5.4%", status: "衰退" },
    { note: "通勤西装一周穿搭", acct: "@AA_静静在上海", kw: "通勤西装", rank: [8, 15, 27], inter: "3.6%", avg: "5.8%", status: "衰退" },
    { note: "正反两穿风衣测评", acct: "@AURORA_ASH 主号", kw: "正反两穿", rank: [35, 20, 11], inter: "7.4%", avg: "5.2%", status: "潜力" },
  ];

  // ---------- 分发效果回收 ----------
  const recycleSummary = [
    { label: "总发布数", val: "128 篇" },
    { label: "总互动量", val: "214.6w" },
    { label: "搜索占位提升词", val: "18 个" },
    { label: "矩阵整体 ROI", val: "1 : 4.6" },
  ];
  const recycleByAccount = [
    { acct: "@AURORA_ASH 主号", publish: 36, inter: "86.2w", occupy: 7, roi: "1:5.8" },
    { acct: "@晨曦衣橱日记", publish: 44, inter: "68.4w", occupy: 6, roi: "1:5.2" },
    { acct: "@AA_Atelier 工坊", publish: 20, inter: "32.1w", occupy: 3, roi: "1:3.9" },
    { acct: "导购号矩阵", publish: 28, inter: "27.9w", occupy: 2, roi: "1:3.1" },
  ];

  // ---------- 跨境营销文案 · 目标语言 ----------
  const crossLanguages = [
    { id: "en", name: "英语 English", flag: "🇺🇸" },
    { id: "ja", name: "日语 日本語", flag: "🇯🇵" },
    { id: "ko", name: "韩语 한국어", flag: "🇰🇷" },
    { id: "th", name: "泰语 ไทย", flag: "🇹🇭" },
    { id: "ms", name: "马来语 Melayu", flag: "🇲🇾" },
    { id: "es", name: "西语 Español", flag: "🇪🇸" },
  ];

  // ---------- 系统推荐 · 目标市场潜力单品 ----------
  const crossProducts = [
    { id: "coat",  zh: "羊绒大衣", en: "Cashmere Coat", ja: "カシミアコート", ko: "캐시미어 코트", th: "เสื้อโค้ทแคชเมียร์", ms: "Kot Kasmir", es: "Abrigo de cachemira", price: "$289", cat: "外套", sell: "极简剪裁 · 都市通勤", rec: "欧美市场潜力 Top 1 · 搜索 +68%" },
    { id: "scarf", zh: "真丝方巾", en: "Silk Scarf", ja: "シルクスカーフ", ko: "실크 스카프", th: "ผ้าพันคอไหม", ms: "Skaf Sutera", es: "Pañuelo de seda", price: "$68", cat: "配饰", sell: "撞色印花 · 送礼首选", rec: "日本市场搜索 +42%" },
    { id: "bag",   zh: "通勤托特包", en: "Leather Tote", ja: "レザートートバッグ", ko: "레더 토트백", th: "กระเป๋าโท้ตหนัง", ms: "Beg Tote Kulit", es: "Tote de piel", price: "$159", cat: "包袋", sell: "大容量 · 轻奢质感", rec: "东南亚市场增速 +58%" },
    { id: "dress", zh: "针织连衣裙", en: "Knit Dress", ja: "ニットワンピース", ko: "니트 원피스", th: "เดรสถัก", ms: "Gaun Rajut", es: "Vestido de punto", price: "$129", cat: "裙装", sell: "法式慵懒 · 一衣三穿", rec: "欧洲市场搜索 +35%" },
  ];

  const crossCopySamples = {
    en: "Quiet luxury, redefined. The Aurora & Ash cashmere coat — tailored for the modern commute, made to last beyond seasons.",
    ja: "静かなラグジュアリーを、あなたの毎日に。Aurora & Ash のカシミアコートは、通勤にも、週末にもなじむ一着です。",
    ko: "조용한 럭셔리를 일상에. Aurora & Ash 캐시미어 코트는 출근길에도, 주말에도 어울리는 단 하나의 아이템입니다.",
    th: "ลักชัวรีที่นิ่งสงบ ในทุกวันของคุณ เสื้อโค้ทแคชเมียร์ Aurora & Ash ใส่ได้ทั้งวันทำงานและวันพักผ่อน",
    ms: "Kemewahan yang tenang, untuk setiap hari anda. Kot kasmir Aurora & Ash — digayakan untuk ulang-alik moden.",
    es: "Lujo silencioso, redefinido. El abrigo de cachemira Aurora & Ash — pensado para el trayecto diario y más allá.",
  };

  // ---------- 全球趋势早报 ----------
  const globalTrends = [
    {
      id: "oldmoney", name: "Old Money Aesthetic 2.0", zhName: "老钱风 2.0",
      source: "TikTok", heat: 94, type: "穿搭风格", adapt: 87, updated: "2 小时前",
      overview: "欧美社媒掀起「克制贵气」穿搭：无 logo 的精裁西装、中性色羊绒、珍珠首饰，强调「看起来出身不凡但不张扬」。",
      keywords: [
        { en: "Old Money", zh: "老钱风" },
        { en: "Tailored", zh: "精裁" },
        { en: "Quiet Luxury", zh: "静奢" },
        { en: "Neutral Tones", zh: "中性色" },
      ],
      heatCurve: [20, 26, 24, 35, 42, 38, 55, 62, 58, 71, 82, 90],
      heatDelta: "+186%",
      influencers: [
        { name: "Sofia Richie", role: "模特", avatar: "S" },
        { name: "Gwyneth Paltrow", role: "演员", avatar: "G" },
      ],
      reasons: ["国内轻奢受众对 Old Money 风格接受度高", "与 AURORA & ASH 极简调性高度吻合", "小红书搜索量月环比 +156%"],
      warns: [],
      crowd: [
        { label: "28-35 都市通勤女性", weight: 42 },
        { label: "轻奢消费人群", weight: 30 },
        { label: "职场中高管", weight: 28 },
      ],
      topics: [
        { title: "月薪8k如何穿出Old Money感？这件西装套装绝了", cover: "证件风正面构图 · 米白精裁西装 + 珍珠耳钉 · 纯色留白", script: [["开头钩子", "「老钱风不是钱堆出来的，是克制」"], ["穿搭拆解", "西装版型三个关键点：肩线 / 驳领 / 收腰"], ["购买引导", "挂链单品 @AURORA_ASH 主号"], ["互动话题", "「你的通勤穿搭预算是多少？」"]], tags: ["#OldMoney穿搭", "#轻奢女装", "#通勤ootd", "#AURORAANDASH"] },
        { title: "被夸「贵气」的通勤三件套，其实一套才2k+", cover: "对镜自拍 · 一衣多穿 3 连拍 · 晨光暖调", script: [["开头钩子", "「同事问我是不是涨薪了」"], ["穿搭拆解", "西装 + 羊绒 + 珍珠的三件套公式"], ["购买引导", "单篇挂链 3 件单品"], ["互动话题", "「最显贵的通勤单品是？」"]], tags: ["#老钱风", "#通勤穿搭", "#极简衣橱"] },
        { title: "Old Money 2.0 到底怎么穿？看这 5 张图就够了", cover: "红黑对比色卡 + 单品平铺图 · 高对比", script: [["开头钩子", "「还在追 logo？真正的贵气是看不见 logo」"], ["穿搭拆解", "5 套 Look 拆解 color/剪裁/配饰"], ["购买引导", "合集挂链 · 全店同款"], ["互动话题", "「你心中的老钱风单品是？」"]], tags: ["#OldMoney", "#静奢风", "#穿搭灵感"] },
      ],
      titleVar: { dry: "干货型：普通人也能复刻的「老钱风」通勤公式，避开 3 个廉价感雷区", emo: "情绪型：别再用 logo 撑气场了，真正的贵气是「看不见的克制」", compare: "对比型：花 2k 和花 2w 穿出老钱风，差别居然在这 3 个细节里", suspension: "悬念型：为什么越有钱的人越不爱露 logo？答案藏在这件外套里", grass: "种草型：被问爆链接的米白西装，两百块预算也能穿出「贵气感」" },
      spus: [
        { name: "黑色皮质拼接西装", thumb: "🧥", reason: "Old Money 2.0 核心单品", scenes: ["上新推广", "明星同款借势"] },
        { name: "燕麦色羊绒大衣", thumb: "🧥", reason: "中性色精裁外套", scenes: ["日常种草"] },
        { name: "淡水珍珠耳钉", thumb: "💎", reason: "克制贵气配饰点睛", scenes: ["日常种草", "节日送礼"] },
      ],
      timing: "本周四 20:00-22:00（Old Money 内容夜间讨论峰值）",
      estimate: { uv: "2,800", inter: "4.2w", search: "+38%" },
      compliance: {
        cultural: { level: "safe", note: "无宗教 / 政治 / 种族 / 性别敏感元素，可直接投放" },
        copyright: [
          { item: "TikTok 走秀片段截图", status: "need" },
          { item: "ins 穿搭博主素材", status: "need" },
        ],
        trend: { kind: "可持续趋势", score: 88, note: "近 30 天稳定爬升，非机器刷量或短期炒作" },
      },
    },
    {
      id: "quietlux", name: "Quiet Luxury", zhName: "静奢风",
      source: "Instagram", heat: 91, type: "穿搭风格", adapt: 92, updated: "1 小时前",
      overview: "「无 logo 但一眼高级」成为 ins 高净值内容主流：顶级面料、剪裁与克制的配色，强调质感而非炫耀。",
      keywords: [
        { en: "Quiet Luxury", zh: "静奢风" },
        { en: "Understated", zh: "低调克制" },
        { en: "Cashmere", zh: "羊绒" },
        { en: "Minimal", zh: "极简" },
      ],
      heatCurve: [30, 34, 40, 45, 52, 60, 58, 68, 75, 72, 84, 88],
      heatDelta: "+142%",
      influencers: [
        { name: "Carolyn Bessette", role: "时尚 icon", avatar: "C" },
        { name: "Mary-Kate Olsen", role: "设计师", avatar: "M" },
      ],
      reasons: ["品牌主打 Quiet Luxury 定位，趋势即品牌主线", "国内「去 logo 化」搜索 +88%", "与高净值人群人群画像 100% 重叠"],
      warns: [],
      crowd: [
        { label: "高净值女性", weight: 44 },
        { label: "极简主义者", weight: 32 },
        { label: "职场精英", weight: 24 },
      ],
      topics: [
        { title: "不露 logo 的高级感，是这 3 件单品给的", cover: "低饱和静物 · 羊绒质感特写 · 留白构图", script: [["开头钩子", "「高级感是减法不是加法」"], ["穿搭拆解", "羊绒 / 真丝 / 精裁的质感三件套"], ["购买引导", "挂链全店静奢系列"], ["互动话题", "「你会为看不到 logo 的面料买单吗」"]], tags: ["#静奢风", "#QuietLuxury", "#高级感穿搭"] },
        { title: "同事都问我衣服什么牌子的，其实就是「无 logo」", cover: "办公室场景抓拍 · 自然光", script: [["开头钩子", "「被问了一整个季度」"], ["穿搭拆解", "宽阔剪裁 + 高级面料的辨识度"], ["购买引导", "单篇挂链主推款"], ["互动话题", "「你更看重 logo 还是质感」"]], tags: ["#静奢", "#通勤穿搭", "#质感控"] },
        { title: "静奢风不是「性冷淡」，是「毫不费力的贵」，看这 4 套", cover: "暖调静奢 Lookbook 平铺", script: [["开头钩子", "「静奢 = 极简 + 温度」"], ["穿搭拆解", "4 套 Look 拆面料与配色"], ["购买引导", "合集挂链"], ["互动话题", "「静奢风和你想象的差别大吗」"]], tags: ["#静奢风", "#极简主义", "#穿搭灵感"] },
      ],
      titleVar: { dry: "干货型：静奢风 ≠ 性冷淡，3 个要点穿出「毫不费力的贵」", emo: "情绪型：不露 logo 的高级感，才是成年人真正的体面", compare: "对比型：静奢风 vs 老钱风，到底差在哪？一篇讲透", suspension: "悬念型：为什么真正有钱的人，衣柜里反而没有 logo", grass: "种草型：这几件「无 logo」单品，穿上就被问链接" },
      spus: [
        { name: "乳白山羊绒针织衫", thumb: "🧶", reason: "静奢核心面料单品", scenes: ["日常种草", "上新推广"] },
        { name: "真丝缎面半裙", thumb: "👗", reason: "质感 + 克制配色", scenes: ["日常种草"] },
      ],
      timing: "每日 12:00-13:00 午休浏览 + 21:00-23:00 睡前种草双峰",
      estimate: { uv: "3,100", inter: "5.1w", search: "+52%" },
      compliance: {
        cultural: { level: "safe", note: "无敏感元素，与品牌主线高度一致" },
        copyright: [
          { item: "ins 静奢博主 Lookbook", status: "need" },
        ],
        trend: { kind: "可持续趋势", score: 92, note: "品牌原生主线，长期稳定，可信度高" },
      },
    },
    {
      id: "balletcore", name: "Balletcore", zhName: "芭蕾风",
      source: "Pinterest", heat: 78, type: "视觉创意", adapt: 52, updated: "4 小时前",
      overview: "芭蕾元素进入日常：缎面裹身、蝴蝶结、浅粉/奶油色、针织袜套，主打柔美浪漫的视觉语言。",
      keywords: [
        { en: "Balletcore", zh: "芭蕾风" },
        { en: "Satin Wrap", zh: "缎面裹身" },
        { en: "Bow", zh: "蝴蝶结" },
        { en: "Pastel", zh: "马卡龙色" },
      ],
      heatCurve: [55, 50, 62, 58, 70, 78, 72, 66, 60, 54, 48, 42],
      heatDelta: "+24%",
      influencers: [
        { name: "Sydney Sweeney", role: "演员", avatar: "S" },
        { name: "Bella Hadid", role: "模特", avatar: "B" },
      ],
      reasons: ["柔美感与部分礼服线人群吻合", "小红书「芭蕾风」搜索仍活跃"],
      warns: ["该趋势在国内已有审美疲劳风险，越是跟风越难起量"],
      crowd: [
        { label: "少女感人群", weight: 38 },
        { label: "法式浪漫受众", weight: 30 },
        { label: "轻礼服需求", weight: 22 },
      ],
      topics: [
        { title: "芭蕾风怎么穿不「装嫩」？缎面裹身 + 硬朗单品平衡", cover: "缎面裙 + 皮质外套混搭 · 反差构图", script: [["开头钩子", "「芭蕾风 ≠ 少女专属」"], ["穿搭拆解", "柔 + 刚的混搭公式"], ["购买引导", "缎面单品挂链"], ["互动话题", "「芭蕾风你会怎么搭」"]], tags: ["#芭蕾风", "#缎面裙", "#混搭穿搭"] },
        { title: "通勤也能穿的「轻芭蕾」，重点是这 2 个单品", cover: "低饱和通勤场景", script: [["开头钩子", "「把浪漫穿进办公室」"], ["穿搭拆解", "缎面衬衫 / 蝴蝶结发饰的点睛"], ["购买引导", "轻芭蕾单品挂链"], ["互动话题", "「通勤敢穿缎面吗」"]], tags: ["#芭蕾风", "#通勤穿搭", "#法式浪漫"] },
        { title: "种草一种很新的「芭蕾通勤」风格", cover: "对镜自拍 · 奶油色调", script: [["开头钩子", "「这是什么神仙风格」"], ["穿搭拆解", "针织袜套 + 缎面半裙的减法"], ["购买引导", "合集挂链"], ["互动话题", "「芭蕾风 + 通勤可行吗」"]], tags: ["#芭蕾通勤", "#奶油色系", "#ootd"] },
      ],
      titleVar: { dry: "干货型：芭蕾风不翻车的 3 个公式，通勤也能驾驭", emo: "情绪型：把浪漫穿进日常，是成年女性的温柔力量", compare: "对比型：芭蕾风 vs 法式风，甜与飒只差一个单品", suspension: "悬念型：为什么芭蕾风在国内凉了一半，却还值得做", grass: "种草型：这条缎面半裙，是我今年最不后悔的下单" },
      spus: [
        { name: "香槟色缎面裹身裙", thumb: "👗", reason: "芭蕾风核心单品", scenes: ["日常种草", "节日送礼"] },
        { name: "奶油白针织开衫", thumb: "🧶", reason: "柔美叠穿", scenes: ["日常种草"] },
      ],
      timing: "周末午后 14:00-16:00（少女感人群活跃高峰）",
      estimate: { uv: "1,400", inter: "2.6w", search: "+12%" },
      compliance: {
        cultural: { level: "note", note: "注意「芭蕾」元素避免与专业芭蕾版权/品牌联名混淆" },
        copyright: [
          { item: "Pinterest 芭蕾风拼贴图", status: "need" },
        ],
        trend: { kind: "短期热点", score: 54, note: "搜索已进入下行通道，建议小额测试而非重仓" },
      },
    },
    {
      id: "y2k", name: "Y2K Revival", zhName: "千禧复古风",
      source: "TikTok", heat: 83, type: "穿搭风格", adapt: 28, updated: "3 小时前",
      overview: "低腰裤、亮片、泡泡袖、镭射面料等千禧元素回潮，主打强烈的视觉冲击与怀旧感。",
      keywords: [
        { en: "Y2K", zh: "千禧风" },
        { en: "Low-rise", zh: "低腰" },
        { en: "Sequin", zh: "亮片" },
        { en: "Chrome", zh: "镭射" },
      ],
      heatCurve: [40, 48, 60, 74, 82, 90, 84, 76, 68, 58, 50, 44],
      heatDelta: "+95%",
      influencers: [
        { name: "Dua Lipa", role: "歌手", avatar: "D" },
        { name: "Z世代 KOL", role: "博主", avatar: "Z" },
      ],
      reasons: ["强视觉冲击易出爆款，年轻客群话题度高"],
      warns: ["与轻奢女装目标人群错位，易拉低品牌调性", "国内已大面积跟风，同质化严重，建议不投入"],
      crowd: [
        { label: "18-24 学生/职场新人", weight: 46 },
        { label: "潮流尝鲜人群", weight: 34 },
        { label: "轻奢核心人群", weight: 12 },
      ],
      topics: [
        { title: "Y2K 风回潮，但这 3 类人千万别跟", cover: "高饱和对比图 · 醒目大字", script: [["开头钩子", "「跟风前先看看自己适不适合」"], ["穿搭拆解", "身材/风格适配检查"], ["购买引导", "（谨慎挂链）"], ["互动话题", "「你 hold 得住 Y2K 吗」"]], tags: ["#Y2K", "#千禧风", "#穿搭避雷"] },
        { title: "千禧复古只穿 20% 就好，重点是这个单品", cover: "极简 + 千禧元素局部点缀", script: [["开头钩子", "「复古不等于用力过猛」"], ["穿搭拆解", "亮片 / 镭射只作点缀"], ["购买引导", "局部单品挂链"], ["互动话题", "「千禧元素你敢上身吗」"]], tags: ["#千禧风", "#复古穿搭"] },
        { title: "别急着买亮片裙，先看这 5 个翻车现场", cover: "翻车 vs 正确对比", script: [["开头钩子", "「一键避雷」"], ["穿搭拆解", "5 个常见翻车点"], ["购买引导", "（内容科普为主）"], ["互动话题", "「你踩过哪些雷」"]], tags: ["#穿搭避雷", "#Y2K"] },
      ],
      titleVar: { dry: "干货型：Y2K 回潮怎么穿才不显廉价？3 个避雷要点", emo: "情绪型：别让「千禧风」毁了你经营多年的高级感", compare: "对比型：Y2K vs 静奢风，年轻态和质感你选哪个", suspension: "悬念型：Y2K 回潮背后，藏着 Z 世代什么心理", grass: "种草型：（谨慎）这几个千禧点缀单品，点到为止刚刚好" },
      spus: [
        { name: "微闪针织背心", thumb: "👚", reason: "千禧元素「点到为止」的低风险切入", scenes: ["清仓"] },
      ],
      timing: "不建议近期主力投放，可作为对比内容小额度测试",
      estimate: { uv: "600", inter: "1.1w", search: "+8%" },
      compliance: {
        cultural: { level: "note", note: "低腰/紧身元素注意身材焦虑与冒犯性表达" },
        copyright: [
          { item: "TikTok 千禧走秀片段", status: "risk" },
        ],
        trend: { kind: "短期热点", score: 41, note: "已过峰值，疑似短期炒作，建议观望" },
      },
    },
    {
      id: "sustain", name: "Sustainable Textile", zhName: "可持续面料",
      source: "Vogue Runway", heat: 66, type: "面料工艺", adapt: 74, updated: "5 小时前",
      overview: "再生羊绒、天然染色、可降解纤维在高端秀场持续升温，「买少但买好」成为可持续消费叙事。",
      keywords: [
        { en: "Sustainable", zh: "可持续" },
        { en: "Recycled", zh: "再生" },
        { en: "Natural Dye", zh: "天然染色" },
        { en: "Traceable", zh: "可溯源" },
      ],
      heatCurve: [18, 22, 26, 30, 36, 42, 48, 52, 58, 62, 66, 70],
      heatDelta: "+58%",
      influencers: [
        { name: "Stella McCartney", role: "设计师", avatar: "S" },
        { name: "Emma Watson", role: "演员", avatar: "E" },
      ],
      reasons: ["可持续叙事契合品牌长期价值观", "小红书「买少买精」话题持续升温", "适合塑造品牌质感与差异化"],
      warns: [],
      crowd: [
        { label: "理性消费人群", weight: 40 },
        { label: "环保关注者", weight: 32 },
        { label: "高知女性", weight: 28 },
      ],
      topics: [
        { title: "买少但买好，一件顶十件的「可持续衣橱」思路", cover: "极简衣橱平铺 · 大地色系", script: [["开头钩子", "「你的衣柜缺的不是衣服，是取舍」"], ["穿搭拆解", "一衣多搭的可持续公式"], ["购买引导", "可溯源单品挂链"], ["互动话题", "「你衣柜里最长情的一件是？」"]], tags: ["#可持续时尚", "#买少买精", "#胶囊衣橱"] },
        { title: "为什么越来越多有钱人开始「少买」了", cover: "静物质感特写", script: [["开头钩子", "「消费降级还是消费升级？」"], ["穿搭拆解", "慢时尚 vs 快时尚"], ["购买引导", "再生面料系列挂链"], ["互动话题", "「你愿意为可持续多花钱吗」"]], tags: ["#可持续", "#慢时尚", "#静奢"] },
        { title: "一件羊绒穿十年，这才是真正的性价比", cover: "羊绒质感微距", script: [["开头钩子", "「真正的贵，是穿得久」"], ["穿搭拆解", "耐磨面料的长期主义"], ["购买引导", "羊绒单品挂链"], ["互动话题", "「你与哪件衣服最久」"]], tags: ["#羊绒", "#长期主义", "#质感"] },
      ],
      titleVar: { dry: "干货型：可持续衣橱的 3 个底层逻辑，买少也能穿好", emo: "情绪型：真正的奢侈，是和时间做朋友", compare: "对比型：快时尚 vs 慢时尚，一件羊绒的十年账", suspension: "悬念型：为什么越懂时尚的人，衣柜越空", grass: "种草型：这件可溯源羊绒，值得你多看一眼" },
      spus: [
        { name: "再生羊绒针织衫", thumb: "🧶", reason: "可持续面料核心单品", scenes: ["上新推广", "品牌造势"] },
        { name: "天然染色真丝方巾", thumb: "🧣", reason: "可溯源工艺单品", scenes: ["节日送礼"] },
      ],
      timing: "配合「世界环境日」「可持续消费月」等节点长期铺排",
      estimate: { uv: "2,200", inter: "3.4w", search: "+26%" },
      compliance: {
        cultural: { level: "safe", note: "无敏感元素，且强化品牌正向价值" },
        copyright: [
          { item: "Vogue Runway 秀场图", status: "need" },
        ],
        trend: { kind: "可持续趋势", score: 78, note: "长期爬升，可作为品牌质感长期内容线" },
      },
    },
  ];

  // ---------- 转化承接目标 ----------
  const conversionPlats = [
    { id: "station", name: "小红书站内", sub: "商品卡 / 直播间", color: "#3A7D44", hint: "去站内商品卡搜「AURORA & ASH」" },
    { id: "tmall", name: "天猫旗舰店", sub: "红猫 · 种草直达", color: "#C0392B", hint: "去天猫搜「AURORA & ASH 旗舰店」" },
    { id: "jd", name: "京东自营", sub: "小红盟", color: "#2C6FA6", hint: "去京东搜「AURORA & ASH 自营」" },
    { id: "vip", name: "唯品会", sub: "小红链", color: "#B07C2F", hint: "去唯品会搜「AURORA & ASH」" },
  ];
  const talentExternal = [
    { acct: "站内成交", val: "平均单篇 ¥2,100", good: false, note: "低于行业均值" },
    { acct: "天猫进店", val: "平均单篇 380 UV", good: true, note: "高于行业均值 32% 💡" },
    { acct: "京东加购", val: "平均单篇 45 件", good: false, note: "与行业持平" },
  ];

  return {
    loginBrands, industries, roles, markets, plans, talents, brandMatrix,
    negativeWords, crowds, trendTimeline, contentBeat, spillover, regions,
    hotWords, cultureRisks, festivals, trendEvents, attribution, bizPlatforms,
    liveData, contentLib, stars, attributionQueries,
    contentIdeas, marketingNodes, contentFormats,
    negativeCloud, complianceRules, batchProjects,
    scheduleDays, scheduleAccounts, scheduleSeed, monthSchedule,
    occupyKeywords, longtailNotes, recycleSummary, recycleByAccount,
    crossLanguages, crossProducts, crossCopySamples, conversionPlats, talentExternal,
    globalTrends,
  };
})();