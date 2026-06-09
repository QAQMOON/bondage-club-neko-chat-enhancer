// ==UserScript==
// @name         Bondage Club Neko Chat Enhancer
// @namespace    https://penyo.ru/
// @version      2.10.8
// @description  Bondage Club 猫娘消息转换、聊天室美化、猫爪表情雨和动作快捷轮盘
// @author       Penyo (Modified)
// @match        *://www.bondageprojects.com/club_game*
// @match        *://www.bondageprojects.elementfx.com/*
// @match        *://bondageprojects.elementfx.com/*
// @match        *://www.bondageprojects.elementfx.com/R*/BondageClub/*
// @match        *://bondageprojects.elementfx.com/R*/BondageClub/*
// @match        *://www.bondage-europe.com/*
// @match        *://bondage-europe.com/*
// @match        *://www.bondage-europe.com/R*/BondageClub/*
// @match        *://bondage-europe.com/R*/BondageClub/*
// @match        *://www.bondage-asia.com/*
// @match        *://bondage-asia.com/*
// @match        *://www.bondage-asia.com/club/R*/*
// @match        *://bondage-asia.com/club/R*/*
// @include      /^https:\/\/(www\.)?bondage(projects\.elementfx|-(europe|asia))\.com\/.*/
// @downloadURL  https://github.com/QAQMOON/bondage-club-neko-chat-enhancer/raw/main/bondage-club-neko.user.js
// @updateURL    https://github.com/QAQMOON/bondage-club-neko-chat-enhancer/raw/main/bondage-club-neko.user.js
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @connect      raw.githubusercontent.com
// @connect      cdn.jsdelivr.net
// @run-at       document-start
// @license      WTFPL
// ==/UserScript==

(function () {
  "use strict";

  const W = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
  const MOD_ID = "BCNekoEnhancer";
  const VERSION = "2.10.8";
  const STORE_KEY = "bcNekoEnhancer.config.v2";
  const MOD_SDK_URL = "https://cdn.jsdelivr.net/npm/bondage-club-mod-sdk@1.2.0/dist/bcmodsdk.js";
  const ACTION_LIBRARY_URL = "https://raw.githubusercontent.com/QAQMOON/bondage-club-neko-chat-enhancer/main/actions/catgirl-actions.json";
  const ACTION_LIBRARY_CACHE_KEY = "bcNekoEnhancer.actionLibrary.v1";
  const KAOMOJI_LIBRARY_URL = "https://raw.githubusercontent.com/QAQMOON/bondage-club-neko-chat-enhancer/main/kaomoji/cute-kaomoji.json";
  const KAOMOJI_LIBRARY_CACHE_KEY = "bcNekoEnhancer.kaomojiLibrary.v1";
  const PEER_SIGNAL_CONTENT = "BCNekoEnhancer.Hello";
  const PEER_SIGNAL_INTERVAL = 45000;
  const PEER_TTL = 300000;
  const ATMOSPHERE_KEYWORDS = /喵|蹭蹭|蹭|贴贴|抱抱|摸摸|摸头|亲亲|ฅ|🐾|💗|💕|💖/i;
  const DEFAULT_KAOMOJI = ["(=^･ω･^=)", "ฅ(•ㅅ•❀)ฅ", "(=｀ω´=)", "(ฅ´ω`ฅ)", "(=^･ｪ･^=)"];
  const ACTION_TARGET_MODE = {
    AUTO: "auto",
    PICKER: "picker",
    SELF: "self",
  };
  const ESCAPE_SKILL_NAMES = ["Bondage", "Dressage", "Evasion", "Infiltration", "LockPicking", "SelfBondage", "Willpower"];
  const ESCAPE_PICK_WINDOW_MS = 5000;
  const ESCAPE_DEFAULT_EASY_VALUE = 99;
  const THEME_PRESETS = {
    sakura: {
      label: "樱粉",
      soft: "#fff1f6",
      panel: "#ffffff",
      accent: "#f65086",
      border: "#ffd4e2",
      text: "#8a3f5b",
      muted: "#9d7a86",
      icon: "#f65086",
      glow: "rgba(246, 80, 134, 0.22)",
    },
    mint: {
      label: "薄荷",
      soft: "#effff9",
      panel: "#ffffff",
      accent: "#59cdb4",
      border: "#c5eee4",
      text: "#2f665c",
      muted: "#668078",
      icon: "#6fd8c4",
      glow: "rgba(89, 205, 180, 0.20)",
    },
    sky: {
      label: "天空",
      soft: "#eef8ff",
      panel: "#ffffff",
      accent: "#64b8ee",
      border: "#c8e5f8",
      text: "#315f82",
      muted: "#647b8c",
      icon: "#8ed2f6",
      glow: "rgba(100, 184, 238, 0.20)",
    },
    cream: {
      label: "奶油",
      soft: "#fff8df",
      panel: "#ffffff",
      accent: "#efbd75",
      border: "#f1dfb3",
      text: "#715b2f",
      muted: "#85785d",
      icon: "#efc49a",
      glow: "rgba(239, 189, 117, 0.20)",
    },
    lavender: {
      label: "薰衣草",
      soft: "#f7f0ff",
      panel: "#ffffff",
      accent: "#b58add",
      border: "#decaf0",
      text: "#604a7c",
      muted: "#7e708e",
      icon: "#cda7dc",
      glow: "rgba(181, 138, 221, 0.20)",
    },
    tea: {
      label: "白茶",
      soft: "#f3f8f4",
      panel: "#ffffff",
      accent: "#9bb9aa",
      border: "#d4e2d9",
      text: "#43564f",
      muted: "#6d7a75",
      icon: "#c7d7bf",
      glow: "rgba(155, 185, 170, 0.18)",
    },
  };
  const THEME_ORDER = ["sakura", "mint", "sky", "cream", "lavender", "tea"];

  const defaults = {
    enabled: true,
    convertOutgoing: true,
    convertDisplayed: true,
    decorateChat: true,
    rainOnSend: true,
    quickWheel: true,
    notifyIncoming: true,
    nyanChance: 0.55,
    menuCollapsed: true,
    wheelCollapsed: true,
    wheelX: null,
    wheelY: null,
    actionTargetMode: ACTION_TARGET_MODE.AUTO,
    theme: "sakura",
    actions: [
      {
        label: "抱抱",
        text: "轻轻抱住{target}，把脸颊贴过去蹭了蹭喵~",
        selfText: "抱住自己软软地蹭了蹭尾巴喵~",
      },
      {
        label: "摸头",
        text: "踮起脚摸了摸{target}的头，认真夸奖了一句：好乖喵~",
        selfText: "摸了摸自己的头，假装被夸奖得很开心喵~",
      },
      {
        label: "喂食",
        text: "把小点心递到{target}嘴边，期待地晃了晃尾巴：啊呜喵~",
        selfText: "捧着小点心小口吃掉，满足地眯起眼睛喵~",
      },
    ],
  };

  const DEFAULT_ACTION_LIBRARY = {
    version: "builtin",
    actions: defaults.actions.map((action, index) => ({
      id: ["hug", "pat", "feed"][index] || `builtin-${index}`,
      label: action.label,
      enabled: true,
      self: [action.selfText],
      target: [action.text],
    })),
  };

  const DEFAULT_KAOMOJI_LIBRARY = {
    version: "builtin",
    groups: [
      {
        id: "cat",
        label: "猫猫",
        enabled: true,
        items: DEFAULT_KAOMOJI,
      },
    ],
  };

  const config = loadConfig();
  let actionLibrary = loadCachedActionLibrary() || normalizeActionLibrary(DEFAULT_ACTION_LIBRARY);
  let kaomojiLibrary = loadCachedKaomojiLibrary() || normalizeKaomojiLibrary(DEFAULT_KAOMOJI_LIBRARY);
  const processedMessages = new WeakSet();
  const atmosphereMessages = new WeakSet();
  let patched = false;
  let statusBadgePatched = false;
  let roomEffectsPatched = false;
  let bcModApi = null;
  let sdkLoadingPromise = null;
  let settingsRegistered = false;
  let toastTimer = 0;
  let activeKaomojiGroup = "all";
  let lastPeerSignalAt = 0;
  let lastPeerRoom = "";
  let escapePickExpiresAt = 0;
  let escapePickTimer = 0;
  let escapeGoddessMode = false;
  let escapeGoddessBoostGranted = false;
  const nekoPeers = new Map();
  const badgeHitboxes = new Map();
  const characterAnchors = new Map();
  const atmosphereParticles = [];
  let chatObserver = null;
  let observerRoot = null;
  let maintenanceTimer = 0;
  let decorateTimer = 0;
  let visibilityBound = false;
  const RECENT_CHAT_DECORATION_LIMIT = 100;

  console.log(`[BC 猫娘增强] v${VERSION} userscript injected:`, location.href);
  W.BCNekoEnhancer = {
    config,
    actionLibrary: () => actionLibrary,
    kaomojiLibrary: () => kaomojiLibrary,
    version: VERSION,
    insertFace,
    insertKaomoji,
    toggleKaomojiPicker,
    toggle: toggleNekoMode,
    rain: pawRain,
    sendAction: sendQuickAction,
    reloadActions: loadRemoteActionLibrary,
    reloadKaomoji: loadRemoteKaomojiLibrary,
    diagnostic,
    status: () => ({
      patched,
      sdk: !!bcModApi,
      enabled: config.enabled,
      screen: W.CurrentScreen,
      url: location.href,
      escapePickActive: isEscapePickActive(),
      escapeGoddessMode,
    }),
  };

  function diagnostic() {
    cleanupNekoPeers();
    const activeActions = (actionLibrary.actions || []).filter((action) => action.enabled !== false);
    const activeKaomojiGroups = getVisibleKaomojiGroups();
    const activeKaomojiItems = getActiveKaomojiItems();
    let actionCache = false;
    let kaomojiCache = false;
    try {
      actionCache = !!localStorage.getItem(ACTION_LIBRARY_CACHE_KEY);
      kaomojiCache = !!localStorage.getItem(KAOMOJI_LIBRARY_CACHE_KEY);
    } catch {
      // Storage may be unavailable in some browser modes.
    }
    return {
      mod: MOD_ID,
      version: VERSION,
      url: String(location.href),
      screen: W.CurrentScreen || "",
      player: W.Player?.MemberNumber || null,
      runtime: {
        sdkRegistered: !!bcModApi,
        chatHooks: patched,
        statusBadgeHook: statusBadgePatched,
        roomEffectsHook: roomEffectsPatched,
        settingsRegistered,
      },
      config: {
        enabled: !!config.enabled,
        convertOutgoing: !!config.convertOutgoing,
        convertDisplayed: !!config.convertDisplayed,
        decorateChat: !!config.decorateChat,
        rainOnSend: !!config.rainOnSend,
        quickWheel: !!config.quickWheel,
        notifyIncoming: !!config.notifyIncoming,
        theme: config.theme,
        actionTargetMode: config.actionTargetMode,
        nyanChance: config.nyanChance,
      },
      libraries: {
        actions: {
          version: actionLibrary.version || "unknown",
          total: (actionLibrary.actions || []).length,
          enabled: activeActions.length,
          cached: actionCache,
          url: ACTION_LIBRARY_URL,
        },
        kaomoji: {
          version: kaomojiLibrary.version || "unknown",
          groups: (kaomojiLibrary.groups || []).length,
          enabledGroups: activeKaomojiGroups.length,
          items: activeKaomojiItems.length,
          cached: kaomojiCache,
          url: KAOMOJI_LIBRARY_URL,
        },
      },
      peers: {
        count: nekoPeers.size,
        members: Array.from(nekoPeers, ([memberNumber, peer]) => ({
          memberNumber,
          version: peer.version || "unknown",
          seenSecondsAgo: Math.round((Date.now() - peer.time) / 1000),
        })),
      },
      generatedAt: new Date().toISOString(),
    };
  }

  function loadConfig() {
    try {
      return normalizeConfig({ ...defaults, ...JSON.parse(localStorage.getItem(STORE_KEY) || "{}") });
    } catch {
      return normalizeConfig({ ...defaults });
    }
  }

  function normalizeConfig(next) {
    next.nyanChance = clamp(Number(next.nyanChance ?? defaults.nyanChance), 0, 1);
    if (!Object.values(ACTION_TARGET_MODE).includes(next.actionTargetMode)) {
      next.actionTargetMode = ACTION_TARGET_MODE.AUTO;
    }
    if (!THEME_PRESETS[next.theme]) {
      next.theme = defaults.theme;
    }
    next.menuCollapsed = next.menuCollapsed !== false;
    next.wheelCollapsed = next.wheelCollapsed !== false;
    next.wheelX = Number.isFinite(Number(next.wheelX)) ? Number(next.wheelX) : null;
    next.wheelY = Number.isFinite(Number(next.wheelY)) ? Number(next.wheelY) : null;
    const fallbackActions = defaults.actions;
    next.actions = (Array.isArray(next.actions) && next.actions.length ? next.actions : fallbackActions)
      .map((action, index) => ({
        label: String(action.label || fallbackActions[index]?.label || "动作").slice(0, 6),
        text: String(action.text || fallbackActions[index]?.text || "{target}靠近了一点喵~"),
        selfText: String(action.selfText || fallbackActions[index]?.selfText || "轻轻晃了晃尾巴喵~"),
      }))
      .slice(0, 6);
    return next;
  }

  function saveConfig() {
    normalizeConfig(config);
    localStorage.setItem(STORE_KEY, JSON.stringify(config));
  }

  function currentTheme() {
    return THEME_PRESETS[config.theme] || THEME_PRESETS.sakura;
  }

  function hexToRgb(hex) {
    const value = String(hex || "").replace("#", "").trim();
    if (!/^[0-9a-f]{6}$/i.test(value)) return { r: 255, g: 255, b: 255 };
    return {
      r: parseInt(value.slice(0, 2), 16),
      g: parseInt(value.slice(2, 4), 16),
      b: parseInt(value.slice(4, 6), 16),
    };
  }

  function withAlpha(hex, alpha) {
    const rgb = hexToRgb(hex);
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${clamp(Number(alpha), 0, 1)})`;
  }

  function lighten(hex, amount) {
    const rgb = hexToRgb(hex);
    const ratio = clamp(Number(amount), 0, 1);
    const mix = (channel) => Math.round(channel + (255 - channel) * ratio);
    return `rgb(${mix(rgb.r)}, ${mix(rgb.g)}, ${mix(rgb.b)})`;
  }

  function applyTheme() {
    if (!document.body) return;
    const theme = currentTheme();
    document.body.dataset.bcnTheme = config.theme;
    document.body.style.setProperty("--bcn-soft", theme.soft);
    document.body.style.setProperty("--bcn-panel", theme.panel);
    document.body.style.setProperty("--bcn-accent", theme.accent);
    document.body.style.setProperty("--bcn-border", theme.border);
    document.body.style.setProperty("--bcn-text", theme.text);
    document.body.style.setProperty("--bcn-muted", theme.muted);
    document.body.style.setProperty("--bcn-icon", theme.icon);
    document.body.style.setProperty("--bcn-glow", theme.glow);
  }

  function normalizeActionLibrary(source) {
    const actions = Array.isArray(source?.actions) ? source.actions : [];
    const normalized = actions
      .map((action, index) => {
        const self = Array.isArray(action.self) ? action.self.map(cleanActionLine).filter(Boolean) : [];
        const target = Array.isArray(action.target) ? action.target.map(cleanActionLine).filter(Boolean) : [];
        if (!self.length && !target.length) return null;
        return {
          id: String(action.id || `action-${index}`).trim() || `action-${index}`,
          label: String(action.label || action.id || "动作").trim().slice(0, 6),
          enabled: action.enabled !== false,
          self,
          target,
        };
      })
      .filter(Boolean);
    return {
      version: String(source?.version || "unknown"),
      updatedAt: source?.updatedAt || "",
      actions: normalized.length ? normalized : DEFAULT_ACTION_LIBRARY.actions,
    };
  }

  function cleanActionLine(line) {
    return String(line || "").replace(/\{user\}\s*/g, "").trim();
  }

  function loadCachedActionLibrary() {
    try {
      const raw = localStorage.getItem(ACTION_LIBRARY_CACHE_KEY);
      return raw ? normalizeActionLibrary(JSON.parse(raw)) : null;
    } catch {
      return null;
    }
  }

  function cacheActionLibrary(library) {
    try {
      localStorage.setItem(ACTION_LIBRARY_CACHE_KEY, JSON.stringify(library));
    } catch {
      // Ignore storage failures; the builtin action library still works.
    }
  }

  function loadRemoteActionLibrary() {
    return requestText(ACTION_LIBRARY_URL)
      .then((text) => {
        const library = normalizeActionLibrary(JSON.parse(text));
        actionLibrary = library;
        cacheActionLibrary(library);
        renderWheel();
        console.log(`[BC 猫娘增强] 动作库已加载: ${library.version}, ${library.actions.length} 个主题`);
        return library;
      })
      .catch((error) => {
        console.warn("[BC 猫娘增强] 远程动作库加载失败，使用缓存/内置库:", error);
        return actionLibrary;
      });
  }

  function normalizeKaomojiLibrary(source) {
    const groups = Array.isArray(source?.groups) ? source.groups : [];
    const normalized = groups
      .map((group, index) => {
        const items = Array.isArray(group.items)
          ? group.items.map((item) => String(item || "").trim()).filter(Boolean)
          : [];
        if (!items.length) return null;
        return {
          id: String(group.id || `group-${index}`).trim() || `group-${index}`,
          label: String(group.label || group.id || "颜文字").trim().slice(0, 12),
          enabled: group.enabled !== false,
          items,
        };
      })
      .filter(Boolean);
    return {
      version: String(source?.version || "unknown"),
      updatedAt: source?.updatedAt || "",
      groups: normalized.length ? normalized : DEFAULT_KAOMOJI_LIBRARY.groups,
    };
  }

  function getActiveKaomojiItems() {
    const items = kaomojiLibrary.groups
      .filter((group) => group.enabled !== false)
      .flatMap((group) => group.items)
      .filter(Boolean);
    return items.length ? items : DEFAULT_KAOMOJI;
  }

  function getVisibleKaomojiGroups() {
    return kaomojiLibrary.groups.filter((group) => group.enabled !== false && group.items.length);
  }

  function getKaomojiItemsForGroup(groupId) {
    if (groupId === "all") return getActiveKaomojiItems();
    const group = getVisibleKaomojiGroups().find((item) => item.id === groupId);
    return group?.items?.length ? group.items : getActiveKaomojiItems();
  }

  function pickRandomKaomoji() {
    const items = getActiveKaomojiItems();
    return items[Math.floor(Math.random() * items.length)] || DEFAULT_KAOMOJI[0];
  }

  function hasKnownKaomoji(text) {
    return getActiveKaomojiItems().some((face) => text.includes(face));
  }

  function loadCachedKaomojiLibrary() {
    try {
      const raw = localStorage.getItem(KAOMOJI_LIBRARY_CACHE_KEY);
      return raw ? normalizeKaomojiLibrary(JSON.parse(raw)) : null;
    } catch {
      return null;
    }
  }

  function cacheKaomojiLibrary(library) {
    try {
      localStorage.setItem(KAOMOJI_LIBRARY_CACHE_KEY, JSON.stringify(library));
    } catch {
      // Ignore storage failures; the builtin kaomoji library still works.
    }
  }

  function loadRemoteKaomojiLibrary() {
    return requestText(KAOMOJI_LIBRARY_URL)
      .then((text) => {
        const library = normalizeKaomojiLibrary(JSON.parse(text));
        kaomojiLibrary = library;
        cacheKaomojiLibrary(library);
        renderKaomojiPicker();
        console.log(`[BC 猫娘增强] 颜文字库已加载: ${library.version}, ${getActiveKaomojiItems().length} 个颜文字`);
        return library;
      })
      .catch((error) => {
        console.warn("[BC 猫娘增强] 远程颜文字库加载失败，使用缓存/内置库:", error);
        return kaomojiLibrary;
      });
  }

  function requestText(url) {
    if (typeof GM_xmlhttpRequest === "function") {
      return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
          method: "GET",
          url,
          timeout: 10000,
          onload: (response) => {
            if (response.status >= 200 && response.status < 300) resolve(response.responseText);
            else reject(new Error(`HTTP ${response.status}`));
          },
          onerror: () => reject(new Error("network error")),
          ontimeout: () => reject(new Error("timeout")),
        });
      });
    }
    return fetch(url, { cache: "no-cache" }).then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.text();
    });
  }

  function loadModSdk() {
    if (W.bcModSdk?.registerMod) {
      return Promise.resolve(W.bcModSdk);
    }
    if (sdkLoadingPromise) return sdkLoadingPromise;
    sdkLoadingPromise = requestText(MOD_SDK_URL).then((code) => new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.textContent = `${code}\n//# sourceURL=${MOD_SDK_URL}`;
      script.onload = () => script.remove();
      (document.head || document.documentElement).appendChild(script);
      setTimeout(() => {
        script.remove();
        if (W.bcModSdk?.registerMod) resolve(W.bcModSdk);
        else reject(new Error("BC mod SDK loaded without bcModSdk"));
      }, 0);
    }));
    return sdkLoadingPromise;
  }

  function registerModSdk() {
    return loadModSdk()
      .then((sdk) => {
        if (bcModApi) return bcModApi;
        bcModApi = sdk.registerMod({
          name: MOD_ID,
          fullName: "Bondage Club Neko Chat Enhancer",
          version: VERSION,
          repository: "https://github.com/QAQMOON/bondage-club-neko-chat-enhancer",
        }, { allowReplace: true });
        console.log("[BC 猫娘增强] BC Mod SDK 已注册喵~");
        return bcModApi;
      })
      .catch((error) => {
        console.warn("[BC 猫娘增强] BC Mod SDK 加载失败，稍后重试:", error);
        return null;
      });
  }

  function clamp(value, min, max) {
    if (!Number.isFinite(value)) return min;
    return Math.min(max, Math.max(min, value));
  }

  function toggleConfig(key) {
    config[key] = !config[key];
    saveConfig();
    syncBodyState();
  }

  function syncBodyState() {
    if (!document.body) return;
    applyTheme();
    document.body.classList.toggle("bcn-enabled", config.enabled);
    document.body.classList.toggle("bcn-wheel-on", config.quickWheel);
    document.body.classList.toggle("bcn-menu-collapsed", config.menuCollapsed);
    document.body.classList.toggle("bcn-wheel-collapsed", config.wheelCollapsed);
    const mainButton = document.getElementById("bcn-main-cat");
    if (mainButton) {
      mainButton.title = config.menuCollapsed
        ? "展开猫猫菜单，按住可拖动，长按 10 秒切换猫娘模式"
        : "收起猫猫菜单，按住可拖动，长按 10 秒切换猫娘模式";
    }
    const handleButton = document.getElementById("bcn-wheel-handle");
    if (handleButton) {
      handleButton.textContent = config.wheelCollapsed ? "🐱" : "🐱";
      handleButton.title = config.wheelCollapsed ? "展开动作轮盘" : "收起动作轮盘";
    }
  }

  function syncKaomojiPickerState(open) {
    document.body?.classList.toggle("bcn-kaomoji-open", !!open);
    const picker = document.getElementById("bcn-kaomoji-picker");
    const button = document.getElementById("bcn-face");
    picker?.classList.toggle("is-open", !!open);
    button?.classList.toggle("is-active", !!open);
    if (button) {
      button.title = open ? "收起猫猫颜文字" : "打开猫猫颜文字，长按 2 秒也可打开";
    }
  }

  function addStyle(css) {
    if (typeof GM_addStyle === "function") {
      GM_addStyle(css);
      return;
    }
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
  }

  function randomNyan() {
    return Math.random() < config.nyanChance ? "です" : "";
  }

  function relationHonorific(text) {
    return text
      .replace(/主人(?!大人|様)/g, "主人大人")
      .replace(/恋人(?!殿下|大人)/g, "恋人殿下");
  }

  function standardNeko(text) {
    if (!text || typeof text !== "string") return text;
    return relationHonorific(text)
      .replace(/我们/g, "咱喵和其它猫猫们")
      .replace(/大家/g, "各位猫猫们")
      .replace(/本人/g, "咱喵")
      .replace(/你们/g, "汝等")
      .replace(/您/g, "汝")
      .replace(/你/g, "汝")
      .replace(/我/g, "咱喵")
      .replace(/玩家/g, "猫猫")
      .replace(/角色/g, "猫设")
      .replace(/孝子|xz|卫兵|小丑|资本|水军|海军|二游|节奏/g, "杂鱼")
      .replace(/恋爱|溜冰|爆改|白嫖|洗白|抄袭|借鉴|退坑|好似/g, "援交")
      .replace(/([也矣兮乎者焉哉]|[啊吗呢吧哇呀哦嘛喔咯呜捏])([\s,.!?;:，。！？；：）】」』]|$)/g, `喵${randomNyan()}$2`)
      .replace(/([的了辣])([\s,.!?;:，。！？；：）】」』]|$)/g, `$1喵${randomNyan()}$2`);
  }

  function actionNeko(text) {
    text = relationHonorific(text || "");
    if (/喵喵[）)]?$/.test(text)) return text;
    return text.replace(/[）)]?$/, (end) => ` 喵喵${end || ""}`);
  }

  function emoteNeko(text) {
    text = relationHonorific(standardNeko(text || ""));
    if (hasKnownKaomoji(text)) return text;
    return `${text} ${pickRandomKaomoji()}`;
  }

  function whisperNeko(text) {
    text = standardNeko(text || "");
    return text.startsWith("悄悄喵~") ? text : `悄悄喵~ ${text}`;
  }

  function getCharacterEffects(character) {
    if (!character) return [];
    if (Array.isArray(character.Effect)) return character.Effect.filter(Boolean);
    try {
      const effects = typeof W.CharacterGetEffects === "function" ? W.CharacterGetEffects(character) : [];
      return Array.isArray(effects) ? effects.filter(Boolean) : [];
    } catch {
      return [];
    }
  }

  function hasAnyEffect(character, names) {
    const effects = getCharacterEffects(character).map((effect) => String(effect || "").trim().toLowerCase());
    const patterns = (names || []).map((name) => String(name || "").trim().toLowerCase()).filter(Boolean);
    return patterns.some((pattern) => effects.some((effect) => effect === pattern || effect.includes(pattern) || pattern.includes(effect)));
  }

  function isUltraBcLoaded() {
    try {
      if (W.Player?.UBC) return true;
      if (typeof W.UBCver === "string" && W.UBCver) return true;
      const mods = W.bcModSdk?.getModsInfo?.();
      if (!mods || typeof mods[Symbol.iterator] !== "function") return false;
      for (const mod of mods) {
        const name = String(mod?.name || "");
        const fullName = String(mod?.fullName || "");
        const repository = String(mod?.repository || "");
        if (/ULTRAbc/i.test(name) || /Ultra Bondage Club/i.test(fullName) || /tetris245\/ULTRAbc/i.test(repository)) return true;
      }
    } catch {}
    return false;
  }

  function detectPlayerGagState() {
    const character = W.Player || null;
    const cannotTalk = (() => {
      try {
        return character?.CanTalk?.() === false;
      } catch {
        return false;
      }
    })();
    const gagLevel = hasAnyEffect(character, ["gagveryheavy", "gagheavy", "gagtotal", "gaggedheavy"])
        ? 3
        : hasAnyEffect(character, ["gagmedium", "gag", "gagged"])
          ? 2
          : hasAnyEffect(character, ["gaglight"])
            ? 1
            : 0;
    const gagged = gagLevel > 0 || cannotTalk;
    return { gagged, gagLevel };
  }

  function getSpeechModeLabel(speechState) {
    const gagLevel = typeof speechState === "object" ? Number(speechState?.gagLevel || 0) : Number(speechState || 0);
    if (gagLevel >= 3) return "\u91cd\u5835\u5634";
    if (gagLevel === 2) return "\u4e2d\u5835\u5634";
    if (gagLevel === 1) return "\u8f7b\u5835\u5634";
    return "\u6b63\u5e38";
  }

  function applyGagSpeech(text, speechState, type = "Chat") {
    const gagLevel = typeof speechState === "object" ? Number(speechState?.gagLevel || 0) : Number(speechState || 0);
    if (!text || !gagLevel || gagLevel <= 0) return text;
    let value = String(text).trim();
    if (!value) return text;
    const splitIndex = value.search(/[\uff0c\u3002\uff01\uff1f,.!?]/);
    if (gagLevel >= 3) {
      const core = splitIndex >= 0 ? value.slice(0, splitIndex) : value;
      return `${core.slice(0, 8) || "\u5514"}\u2026\u2026\u5514\u55b5`;
    }
    if (gagLevel === 2) {
      if (splitIndex >= 0) value = value.slice(0, Math.max(6, splitIndex));
      value = value.replace(/[\u554a\u5440\u5566\u54e6\u5462\u561b]/g, "\u5514").replace(/[\uff0c\u3002\uff01\uff1f,.!?]+/g, "\u2026");
      return /(\u5514\u55b5|\u55ef\u5514)/.test(value) ? value : `${value}\u2026\u2026\u5514\u55b5`;
    }
    value = value.replace(/[\u554a\u5440\u5566\u54e6]/g, "\u5514");
    if (type === "Whisper") return `${value}\u2026\u5514`;
    return /[\u5514\u55b5]/.test(value) ? `${value}\u2026` : `${value} \u5514\u55b5`;
  }

  function applyLocalStateSpeechEffects(type, text) {
    if (!["Chat", "Whisper", "Emote"].includes(type)) return text;
    if (isUltraBcLoaded()) return text;
    const state = detectPlayerGagState();
    if (!state.gagged) return text;
    return applyGagSpeech(text, state, type);
  }

  function convertByType(type, text, options = {}) {
    if (!config.enabled || !text) return text;
    let value = text;
    if (type === "Whisper") value = whisperNeko(text);
    else if (type === "Emote") value = emoteNeko(text);
    else if (type === "Action" || type === "Activity") value = actionNeko(text);
    else if (type === "Chat") value = standardNeko(text);
    if (options.applyGag) value = applyLocalStateSpeechEffects(type, value);
    return value;
  }

  function shouldConvertDisplay(data, msg) {
    if (!config.enabled || !config.convertDisplayed || !msg) return false;
    if (isBugPeerSender(data?.Sender)) return false;
    const type = data?.Type;
    if (type === "Whisper" && String(msg).startsWith("悄悄喵~")) return false;
    if ((type === "Action" || type === "Activity") && /喵喵[）)]?$/.test(String(msg))) return false;
    if (type === "Emote" && hasKnownKaomoji(String(msg))) return false;
    return ["Chat", "Whisper", "Emote", "Action", "Activity"].includes(type);
  }

  function isOwnSender(sender) {
    return Number(sender) === Number(W.Player?.MemberNumber);
  }

  function getCharacterByMemberNumber(memberNumber) {
    const value = memberNumberOf(memberNumber);
    if (!value) return null;
    if (memberNumberOf(W.Player) === value) return W.Player || null;
    return W.ChatRoomCharacter?.find?.((character) => memberNumberOf(character) === value) || null;
  }

  function collectRelationshipNumbers(target, value, keys, depth = 0) {
    if (!target || value == null || depth > 3) return;
    const direct = memberNumberOf(value);
    if (direct) {
      target.add(direct);
      return;
    }
    if (Array.isArray(value)) {
      for (const entry of value) collectRelationshipNumbers(target, entry, keys, depth + 1);
      return;
    }
    if (typeof value !== "object") return;
    for (const key of keys) {
      if (key in value) collectRelationshipNumbers(target, value[key], keys, depth + 1);
    }
  }

  function collectOwnerNumbers(source) {
    const values = new Set();
    if (!source) return values;
    collectRelationshipNumbers(values, source.Owner, ["MemberNumber", "Owner", "OwnerNumber", "OwnerMemberNumber"]);
    collectRelationshipNumbers(values, source.OwnerNumber, ["MemberNumber", "Owner", "OwnerNumber", "OwnerMemberNumber"]);
    collectRelationshipNumbers(values, source.Ownership, ["MemberNumber", "Owner", "OwnerNumber", "OwnerMemberNumber"]);
    return values;
  }

  function collectLoverNumbers(source) {
    const values = new Set();
    if (!source) return values;
    collectRelationshipNumbers(values, source.Lovership, ["MemberNumber", "Lover", "LoverMemberNumber", "MemberNumber1", "MemberNumber2"]);
    collectRelationshipNumbers(values, source.Lover, ["MemberNumber", "Lover", "LoverMemberNumber", "MemberNumber1", "MemberNumber2"]);
    collectRelationshipNumbers(values, source.LoverMemberNumber, ["MemberNumber", "Lover", "LoverMemberNumber", "MemberNumber1", "MemberNumber2"]);
    collectRelationshipNumbers(values, source.Lovers, ["MemberNumber", "Lover", "LoverMemberNumber", "MemberNumber1", "MemberNumber2"]);
    return values;
  }

  function hasOwnerRelationship(character, senderNumber) {
    const playerOwners = collectOwnerNumbers(W.Player);
    if (playerOwners.has(senderNumber)) return true;
    const characterOwners = collectOwnerNumbers(character);
    return characterOwners.has(memberNumberOf(W.Player));
  }

  function hasLoverRelationship(character, senderNumber) {
    const playerLovers = collectLoverNumbers(W.Player);
    if (playerLovers.has(senderNumber)) return true;
    const characterLovers = collectLoverNumbers(character);
    return characterLovers.has(memberNumberOf(W.Player));
  }

  function getRelationshipStatus(sender) {
    const character = getCharacterByMemberNumber(sender);
    const senderNumber = memberNumberOf(sender);
    if (!character || !senderNumber || senderNumber === memberNumberOf(W.Player)) return null;
    const owner = hasOwnerRelationship(character, senderNumber);
    const lover = hasLoverRelationship(character, senderNumber);
    if (owner && lover) return "dual";
    if (owner) return "owner";
    if (lover) return "lover";
    return null;
  }

  function applyRelationshipBadge(div, relation) {
    const nameEl = div?.querySelector?.(".ChatMessageName");
    if (!nameEl) return;
    const existing = nameEl.querySelector(".bcn-relation-badge");
    if (!relation) {
      existing?.remove();
      delete nameEl.dataset.bcnRelationBadge;
      return;
    }
    const icon = existing || document.createElement("span");
    icon.className = `bcn-relation-badge bcn-relation-badge-${relation}`;
    icon.textContent = relation === "owner" ? "🐾" : relation === "lover" ? "❤" : "❤🐾";
    icon.setAttribute("aria-hidden", "true");
    if (!existing) nameEl.prepend(icon);
    nameEl.dataset.bcnRelationBadge = relation;
  }

  function syncRelationshipDecoration(div, sender) {
    if (!div) return;
    div.classList.remove("bcn-related-message", "bcn-related-owner", "bcn-related-lover", "bcn-related-dual");
    delete div.dataset.bcnRelation;
    const relation = getRelationshipStatus(sender);
    if (!relation) {
      applyRelationshipBadge(div, null);
      return;
    }
    div.classList.add("bcn-related-message", `bcn-related-${relation}`);
    div.dataset.bcnRelation = relation;
    applyRelationshipBadge(div, relation);
  }

  function isBugPeerSender(sender) {
    const memberNumber = memberNumberOf(sender);
    if (!memberNumber) return false;
    const peer = nekoPeers.get(memberNumber);
    return !!peer && peer.channel === "bug" && peer.noDisplayConvert === true;
  }

  function decorateMessage(div, data) {
    if (!div) return div;
    if (!processedMessages.has(div)) {
      processedMessages.add(div);
      const type = data?.Type || [...div.classList].find((name) => name.startsWith("ChatMessage"))?.replace("ChatMessage", "");
      div.dataset.bcnType = type || "Unknown";

      if (isOwnSender(data?.Sender || div.dataset.sender)) {
        div.classList.add("bcn-own-message");
      }

      if (config.decorateChat) {
        div.classList.add("bcn-card-message");
      }
    }
    syncRelationshipDecoration(div, data?.Sender || div.dataset.sender);
    return div;
  }

  function patchBC() {
    if (patched) return true;
    if (!bcModApi || !W.ChatRoomGenerateChatRoomChatMessage || !W.ChatRoomMessageDisplay || !W.ServerSend) return false;
    patched = true;

    if (typeof W.ChatRoomSendChat === "function") {
      bcModApi.hookFunction("ChatRoomSendChat", 10000, (args, next) => {
        const input = getChatInput();
        const text = input?.value || "";
        if (runNekoCommand(text)) return undefined;
        return next(args);
      });
    }

    if (typeof W.ChatRoomClick === "function") {
      bcModApi.hookFunction("ChatRoomClick", 10, (args, next) => {
        const result = next(args);
        if (isEscapePickActive()) setTimeout(() => tryConsumeEscapePick(), 0);
        return result;
      });
    }

    if (typeof W.DialogClick === "function") {
      bcModApi.hookFunction("DialogClick", 10, (args, next) => {
        const result = next(args);
        if (isEscapePickActive()) setTimeout(() => tryConsumeEscapePick(), 0);
        return result;
      });
    }

    if (typeof W.CommandParse === "function") {
      bcModApi.hookFunction("CommandParse", 10000, (args, next) => {
        const text = String(args?.[0] || "");
        if (runNekoCommand(text)) return true;
        return next(args);
      });
    }

    bcModApi.hookFunction("ChatRoomGenerateChatRoomChatMessage", 0, (args, next) => {
      const [type, msg, replyId] = args;
      const nextMsg = config.convertOutgoing ? convertByType(type, msg, { applyGag: true }) : msg;
      return next([type, nextMsg, replyId]);
    });

    bcModApi.hookFunction("ChatRoomMessageDisplay", 0, (args, next) => {
      const [data, msg, senderCharacter, metadata] = args;
      handleNekoPeerSignal(data);
      maybeSpawnAtmosphere(data, msg);
      const nextMsg = shouldConvertDisplay(data, msg)
        ? convertByType(data?.Type, msg, { applyGag: isOwnSender(data?.Sender) })
        : msg;
      const div = next([data, nextMsg, senderCharacter, metadata]);
      decorateMessage(div, data);
      if (config.notifyIncoming && data?.Sender && !isOwnSender(data.Sender) && ["Chat", "Whisper"].includes(data.Type)) {
        showToast(data.Type === "Whisper" ? "悄悄喵~ 有私聊来了！" : "喵~ 新消息来啦！");
      }
      return div;
    });

    bcModApi.hookFunction("ServerSend", 0, (args, next) => {
      const [message, payload] = args;
      if (message === "ChatRoomChat" && handleNekoCommand(payload?.Content)) {
        return undefined;
      }
      if (message === "ChatRoomChat" && config.enabled && config.rainOnSend) {
        const type = payload?.Type;
        if (["Chat", "Whisper", "Emote", "Action"].includes(type)) pawRain(type);
      }
      return next(args);
    });

    if (typeof W.ChatRoomMessage === "function") {
      bcModApi.hookFunction("ChatRoomMessage", 0, (args, next) => {
        const [data] = args;
        handleNekoPeerSignal(data);
        maybeSpawnAtmosphere(data, data?.Content);
        return next(args);
      });
    }

    console.log("[BC 猫娘增强] 已通过 BC Mod SDK 接入聊天函数喵~");
    return true;
  }

  function patchStatusBadge() {
    if (statusBadgePatched) return true;
    if (!bcModApi || typeof W.ChatRoomDrawCharacterStatusIcons !== "function") return false;
    statusBadgePatched = true;

    bcModApi.hookFunction("ChatRoomDrawCharacterStatusIcons", 10, (args, next) => {
      const result = next(args);
      rememberCharacterAnchorFromDraw(args);
      drawOwnCharacterBadge(args);
      return result;
    });

    console.log("[BC Neko Enhancer] character cat badge hooked");
    return true;
  }

  function patchRoomEffects() {
    if (roomEffectsPatched) return true;
    if (!bcModApi || typeof W.ChatRoomRun !== "function") return false;
    roomEffectsPatched = true;

    bcModApi.hookFunction("ChatRoomRun", 10, (args, next) => {
      const result = next(args);
      sendNekoPeerSignal(false);
      drawAtmosphereParticles();
      drawNekoBadgeTooltip();
      return result;
    });

    console.log("[BC Neko Enhancer] room neko effects hooked");
    return true;
  }

  function drawOwnCharacterBadge(drawArgs) {
    const character = drawArgs?.[0];
    if (!character || W.CurrentScreen !== "ChatRoom") return;
    if (!shouldShowNekoBadge(character)) return;

    const charX = Number(drawArgs?.[1]);
    const charY = Number(drawArgs?.[2]);
    const zoom = Number(drawArgs?.[3]) || 1;
    if (!Number.isFinite(charX) || !Number.isFinite(charY)) return;

    const size = 35 * zoom;
    const badgeX = charX + 477.5 * zoom;
    const badgeY = charY + 22.5 * zoom;
    rememberCharacterAnchor(character, charX, charY, zoom);
    rememberBadgeHitbox(character, badgeX, badgeY, size);
    drawCatBadge(badgeX, badgeY, size);
  }

  function drawCatBadge(x, y, size) {
    if (typeof W.DrawTextFit === "function") {
      W.DrawTextFit("\uD83D\uDC31", x, y, size, "#ffc928", "#7a5600");
      return;
    }

    const canvas = W.MainCanvas;
    if (!canvas || typeof canvas.save !== "function") return;
    canvas.save();
    canvas.font = `${Math.round(size)}px "Segoe UI Emoji", "Noto Color Emoji", "Apple Color Emoji", sans-serif`;
    canvas.textAlign = "center";
    canvas.textBaseline = "middle";
    canvas.shadowColor = "rgba(255, 201, 40, 0.46)";
    canvas.shadowBlur = Math.max(2, size * 0.16);
    canvas.fillText("\uD83D\uDC31", x, y);
    canvas.restore();
  }

  function memberNumberOf(characterOrNumber) {
    const memberNumber = typeof characterOrNumber === "object" ? characterOrNumber?.MemberNumber : characterOrNumber;
    const value = Number(memberNumber);
    return Number.isFinite(value) ? value : null;
  }

  function shouldShowNekoBadge(character) {
    const memberNumber = memberNumberOf(character);
    if (!memberNumber) return false;
    if (memberNumber === memberNumberOf(W.Player)) return true;
    cleanupNekoPeers();
    return nekoPeers.has(memberNumber);
  }

  function rememberCharacterAnchorFromDraw(drawArgs) {
    const character = drawArgs?.[0];
    const charX = Number(drawArgs?.[1]);
    const charY = Number(drawArgs?.[2]);
    const zoom = Number(drawArgs?.[3]) || 1;
    if (!character || !Number.isFinite(charX) || !Number.isFinite(charY)) return;
    rememberCharacterAnchor(character, charX, charY, zoom);
  }

  function rememberCharacterAnchor(character, charX, charY, zoom) {
    const memberNumber = memberNumberOf(character);
    if (!memberNumber) return;
    characterAnchors.set(memberNumber, {
      x: charX + 250 * zoom,
      y: charY + 65 * zoom,
      zoom,
      time: Date.now(),
    });
  }

  function rememberBadgeHitbox(character, x, y, size) {
    const memberNumber = memberNumberOf(character);
    if (!memberNumber) return;
    badgeHitboxes.set(memberNumber, {
      x: x - size / 2,
      y: y - size / 2,
      w: size,
      h: size,
      cx: x,
      cy: y,
      time: Date.now(),
    });
  }

  function handleNekoPeerSignal(data) {
    if (!data || data.Type !== "Hidden" || data.Content !== PEER_SIGNAL_CONTENT) return;
    const memberNumber = memberNumberOf(data.Sender);
    if (!memberNumber || memberNumber === memberNumberOf(W.Player)) return;
    const info = Array.isArray(data.Dictionary) ? data.Dictionary[0] || {} : {};
    nekoPeers.set(memberNumber, {
      version: String(info.version || "unknown"),
      channel: String(info.channel || "stable"),
      tonePreset: String(info.tonePreset || ""),
      toneLabel: String(info.toneLabel || ""),
      noDisplayConvert: info.noDisplayConvert === true,
      time: Date.now(),
    });
    sendNekoPeerSignal(false);
  }

  function sendNekoPeerSignal(force) {
    if (W.CurrentScreen !== "ChatRoom" || typeof W.ServerSend !== "function" || !W.Player?.MemberNumber) return;
    const roomKey = String(W.ChatRoomData?.Name || W.ChatRoomData?.Background || W.CurrentScreen || "ChatRoom");
    const now = Date.now();
    if (roomKey !== lastPeerRoom) {
      lastPeerRoom = roomKey;
      lastPeerSignalAt = 0;
      badgeHitboxes.clear();
      characterAnchors.clear();
    }
    if (!force && now - lastPeerSignalAt < PEER_SIGNAL_INTERVAL) return;
    lastPeerSignalAt = now;
    try {
      W.ServerSend("ChatRoomChat", {
        Type: "Hidden",
        Content: PEER_SIGNAL_CONTENT,
        Sender: W.Player.MemberNumber,
        Dictionary: [{ mod: MOD_ID, version: VERSION, channel: "stable", noDisplayConvert: false }],
      });
    } catch (error) {
      console.warn("[BC Neko Enhancer] failed to send peer signal", error);
    }
  }

  function cleanupNekoPeers() {
    const now = Date.now();
    for (const [memberNumber, peer] of nekoPeers) {
      if (now - peer.time > PEER_TTL) nekoPeers.delete(memberNumber);
    }
    for (const [memberNumber, hitbox] of badgeHitboxes) {
      const active = memberNumber === memberNumberOf(W.Player) || nekoPeers.has(memberNumber);
      if (now - hitbox.time > 1200 || !active) badgeHitboxes.delete(memberNumber);
    }
    for (const [memberNumber, anchor] of characterAnchors) {
      if (now - anchor.time > 3000) characterAnchors.delete(memberNumber);
    }
  }

  function maybeSpawnAtmosphere(data, message) {
    if (!data || data.Type === "Hidden" || atmosphereMessages.has(data)) return;
    const type = data.Type;
    if (!["Chat", "Whisper", "Emote", "Action", "Activity"].includes(type)) return;
    const text = String(message || data.Content || "");
    if (!ATMOSPHERE_KEYWORDS.test(text)) return;
    atmosphereMessages.add(data);
    spawnAtmosphereForMember(data.Sender);
  }

  function spawnAtmosphereForMember(sender) {
    const memberNumber = memberNumberOf(sender);
    const anchor = characterAnchors.get(memberNumber) || characterAnchors.get(memberNumberOf(W.Player));
    if (!anchor) return;
    const icons = ["\uD83D\uDC3E", "\uD83D\uDC97", "\uD83D\uDC95"];
    const count = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      atmosphereParticles.push({
        text: icons[Math.floor(Math.random() * icons.length)],
        x: anchor.x + (Math.random() - 0.5) * 90 * anchor.zoom,
        y: anchor.y + (Math.random() - 0.5) * 30 * anchor.zoom,
        vx: (Math.random() - 0.5) * 0.18 * anchor.zoom,
        vy: -(0.55 + Math.random() * 0.35) * anchor.zoom,
        size: (22 + Math.random() * 10) * anchor.zoom,
        born: Date.now(),
        life: 1400 + Math.random() * 500,
      });
    }
    if (atmosphereParticles.length > 48) {
      atmosphereParticles.splice(0, atmosphereParticles.length - 48);
    }
  }

  function drawAtmosphereParticles() {
    if (!atmosphereParticles.length) return;
    const canvas = W.MainCanvas;
    if (!canvas || typeof canvas.save !== "function") return;
    const now = Date.now();
    for (let i = atmosphereParticles.length - 1; i >= 0; i--) {
      const particle = atmosphereParticles[i];
      const age = now - particle.born;
      if (age >= particle.life) {
        atmosphereParticles.splice(i, 1);
        continue;
      }
      const progress = age / particle.life;
      canvas.save();
      canvas.globalAlpha = Math.max(0, 1 - progress);
      canvas.font = `${Math.round(particle.size)}px "Segoe UI Emoji", "Noto Color Emoji", "Apple Color Emoji", sans-serif`;
      canvas.textAlign = "center";
      canvas.textBaseline = "middle";
      canvas.shadowColor = "rgba(255, 201, 40, 0.35)";
      canvas.shadowBlur = 6;
      canvas.fillText(particle.text, particle.x + particle.vx * age, particle.y + particle.vy * age);
      canvas.restore();
    }
  }

  function drawNekoBadgeTooltip() {
    cleanupNekoPeers();
    if (W.CurrentScreen !== "ChatRoom" || typeof W.MouseIn !== "function") return;
    for (const [memberNumber, hitbox] of badgeHitboxes) {
      if (!W.MouseIn(hitbox.x, hitbox.y, hitbox.w, hitbox.h)) continue;
      const peer = nekoPeers.get(memberNumber);
      const isSelf = memberNumber === memberNumberOf(W.Player);
      const version = isSelf ? VERSION : peer?.version || "unknown";
      const label = isSelf ? `猫娘插件 v${version}` : `猫娘同好 v${version}`;
      const width = Math.max(190, label.length * 18);
      const x = Math.max(10, Math.min(2000 - width - 10, hitbox.cx - width / 2));
      const y = Math.max(10, hitbox.cy + hitbox.h + 8);
      if (typeof W.DrawRect === "function") {
        W.DrawRect(x, y, width, 44, "#fff8dc");
      }
      if (typeof W.DrawTextFit === "function") {
        W.DrawTextFit(label, x + width / 2, y + 22, width - 16, "#7a5600", "#fff8dc");
      }
      break;
    }
  }

  function scheduleDecorateChat(delay = 120) {
    clearTimeout(decorateTimer);
    decorateTimer = setTimeout(() => {
      decorateTimer = 0;
      if (document.hidden) return;
      decorateExistingChat();
    }, delay);
  }

  function decorateExistingChat(root = null) {
    let nodes = root?.querySelectorAll
      ? Array.from(root.querySelectorAll(".ChatMessage"))
      : Array.from(document.querySelectorAll("#TextAreaChatLog .ChatMessage"));
    if (!root && nodes.length > RECENT_CHAT_DECORATION_LIMIT) {
      nodes = nodes.slice(-RECENT_CHAT_DECORATION_LIMIT);
    }
    nodes.forEach((div) => {
      decorateMessage(div, {
        Type: div.className.match(/ChatMessage(Chat|Whisper|Emote|Action|Activity|ServerMessage|LocalMessage)/)?.[1],
        Sender: Number(div.dataset.sender),
      });
    });
  }

  function pawRain(type = "Chat") {
    const icons = type === "Whisper" ? ["💗", "🐾", "💌"] : type === "Emote" ? ["🐾", "💕", "ฅ"] : ["🐾", "💗", "💖"];
    const count = type === "Action" ? 12 : 20;
    for (let i = 0; i < count; i++) {
      const drop = document.createElement("span");
      drop.className = "bcn-rain-drop";
      drop.textContent = icons[Math.floor(Math.random() * icons.length)];
      drop.style.left = `${Math.random() * 96 + 2}vw`;
      drop.style.animationDuration = `${2.8 + Math.random() * 2.8}s`;
      drop.style.animationDelay = `${Math.random() * 0.45}s`;
      drop.style.fontSize = `${18 + Math.random() * 24}px`;
      document.body.appendChild(drop);
      setTimeout(() => drop.remove(), 6500);
    }
  }

  function showToast(text) {
    let toast = document.getElementById("bcn-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "bcn-toast";
      document.body.appendChild(toast);
    }
    toast.textContent = `♪ ${text}`;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  function getChatInput() {
    return document.getElementById("InputChat")
      || document.querySelector("textarea[name='InputChat']")
      || document.querySelector("textarea")
      || document.querySelector("input[type='text']");
  }


  function sendNekoCommandNotice(lines, duration = 20000) {
    const text = Array.isArray(lines) ? lines.join("\n") : String(lines || "");
    if (!text) return false;
    try {
      if (typeof W.ChatRoomSendLocal === "function" && W.CurrentScreen === "ChatRoom") {
        W.ChatRoomSendLocal(text, duration);
        return true;
      }
    } catch {}
    showToast(text.split(/\n+/)[0]);
    return false;
  }

  function normalizeNekoHelpSection(section) {
    const raw = String(section || "").trim();
    const key = raw.toLowerCase();
    const aliases = {
      "": "main",
      help: "main",
      "\u5e2e\u52a9": "main",
      rp: "rp",
      "\u732b\u5a18rp": "rp",
      action: "action",
      "\u52a8\u4f5c": "action",
      escape: "escape",
      easy: "escape",
      pick: "escape",
      "\u9003\u8131": "escape",
      emoji: "emoji",
      kaomoji: "emoji",
      "\u989c\u6587\u5b57": "emoji",
      mode: "mode",
      "\u6a21\u5f0f": "mode",
      theme: "theme",
      "\u4e3b\u9898": "theme",
      spark: "spark",
      "\u7075\u611f": "spark",
      voice: "voice",
      sound: "voice",
      "\u58f0\u97f3": "voice",
      reactions: "reactions",
      reaction: "reactions",
      interactions: "reactions",
      "\u4e92\u52a8": "reactions",
      mood: "mood",
      state: "mood",
      "\u5fc3\u60c5": "mood",
      systems: "systems",
      system: "systems",
      profile: "systems",
      sensitivity: "systems",
      relation: "systems",
      status: "status",
      "\u72b6\u6001": "status",
    };
    return aliases[key] || aliases[raw] || "main";
  }

  function getNekoLibraryStatusLines() {
    cleanupNekoPeers();
    const activeActions = getActiveActions();
    const visibleKaomojiGroups = getVisibleKaomojiGroups();
    const activeKaomojiItems = getActiveKaomojiItems();
    const selectedTarget = getSelectedTarget();
    const actionTargets = getActionTargets();
    const cached = { actions: false, kaomoji: false };
    try {
      cached.actions = !!localStorage.getItem(ACTION_LIBRARY_CACHE_KEY);
      cached.kaomoji = !!localStorage.getItem(KAOMOJI_LIBRARY_CACHE_KEY);
    } catch {
      // Ignore storage read failures; status should still be usable.
    }
    return {
      activeActions,
      visibleKaomojiGroups,
      activeKaomojiItems,
      selectedTarget,
      actionTargets,
      cached,
    };
  }

  function formatSelectedTargetStatus(target) {
    if (!target) return "\u65e0";
    const number = target.MemberNumber ? "#" + target.MemberNumber : "";
    return getCharacterName(target) + (number ? " " + number : "");
  }

  function getActionTargetModeLabel() {
    if (config.actionTargetMode === ACTION_TARGET_MODE.PICKER) return "\u624b\u52a8\u9009\u76ee\u6807";
    if (config.actionTargetMode === ACTION_TARGET_MODE.SELF) return "\u53ea\u5bf9\u81ea\u5df1";
    return "\u81ea\u52a8\u76ee\u6807";
  }

  function isPlayerCharacter(character) {
    return !!character && !!W.Player && character.MemberNumber === W.Player.MemberNumber;
  }

  function isRestraintAppearanceItem(item) {
    const groupName = item?.Asset?.Group?.Name;
    return typeof groupName === "string" && groupName.startsWith("Item");
  }

  function getPlayerRestraintItems() {
    return (W.Player?.Appearance || []).filter(isRestraintAppearanceItem);
  }

  function refreshPlayerAppearance() {
    if (!W.Player) return;
    if (typeof W.CharacterRefresh === "function") W.CharacterRefresh(W.Player);
    if (W.CurrentScreen === "ChatRoom" && typeof W.ChatRoomCharacterUpdate === "function") {
      W.ChatRoomCharacterUpdate(W.Player);
    }
  }

  function refreshPlayerItemGroup(groupName) {
    if (!W.Player || !groupName) return;
    if (W.CurrentScreen === "ChatRoom" && typeof W.ChatRoomCharacterItemUpdate === "function") {
      W.ChatRoomCharacterItemUpdate(W.Player, groupName);
      return;
    }
    refreshPlayerAppearance();
  }

  function setEscapeSkillModifier(amount, durationMs) {
    if (!W.Player || typeof W.SkillSetModifier !== "function") return false;
    for (const skill of ESCAPE_SKILL_NAMES) {
      W.SkillSetModifier(W.Player, skill, amount, durationMs);
    }
    return true;
  }

  function unlockPlayerRestraints() {
    if (!W.Player || typeof W.InventoryUnlock !== "function") return 0;
    let unlocked = 0;
    for (const item of getPlayerRestraintItems()) {
      if (!item?.Asset?.AllowLock) continue;
      if (!item?.Property?.LockedBy) continue;
      try {
        W.InventoryUnlock(W.Player, item);
        unlocked += 1;
      } catch {}
    }
    if (unlocked > 0) refreshPlayerAppearance();
    return unlocked;
  }

  function lowerPlayerRestraintDifficulty(amount) {
    if (!W.Player) return 0;
    const value = Math.max(0, Math.min(99, Number(amount) || ESCAPE_DEFAULT_EASY_VALUE));
    let changed = 0;
    for (const item of getPlayerRestraintItems()) {
      const currentDifficulty = Number.isFinite(Number(item?.Difficulty))
        ? Number(item.Difficulty)
        : Number.isFinite(Number(item?.Property?.Difficulty))
          ? Number(item.Property.Difficulty)
          : 99;
      const nextDifficulty = Math.max(0, currentDifficulty - value);
      if (Number(item?.Difficulty) !== nextDifficulty) {
        item.Difficulty = nextDifficulty;
        changed += 1;
      }
      if (item?.Property && typeof item.Property === "object") {
        item.Property.Difficulty = nextDifficulty;
      }
    }
    if (changed > 0) refreshPlayerAppearance();
    return changed;
  }

  function leaveCurrentRoomNow() {
    let left = false;
    if (typeof W.ChatRoomLeave === "function") {
      W.ChatRoomLeave();
      left = true;
    }
    if (typeof W.CommonSetScreen === "function") {
      W.CommonSetScreen("Online", "ChatSearch");
      left = true;
    }
    return left;
  }

  function isEscapePickActive() {
    return escapePickExpiresAt > Date.now();
  }

  function clearEscapePickMode(message = "") {
    escapePickExpiresAt = 0;
    clearTimeout(escapePickTimer);
    escapePickTimer = 0;
    if (message) showToast(message);
  }

  function armEscapePickMode() {
    clearEscapePickMode();
    escapePickExpiresAt = Date.now() + ESCAPE_PICK_WINDOW_MS;
    escapePickTimer = setTimeout(() => {
      clearEscapePickMode("Neko pick timed out.");
    }, ESCAPE_PICK_WINDOW_MS + 80);
    showToast("Neko pick armed: click one of your item slots.");
  }

  function tryConsumeEscapePick() {
    if (!isEscapePickActive()) return false;
    const currentCharacter = W.CurrentCharacter;
    if (!isPlayerCharacter(currentCharacter)) return false;
    const groupName = currentCharacter?.FocusGroup?.Name || W.Player?.FocusGroup?.Name || W.DialogFocusItem?.Asset?.Group?.Name;
    if (!groupName || typeof W.InventoryGet !== "function" || typeof W.InventoryRemove !== "function") return false;
    const item = W.InventoryGet(W.Player, groupName);
    if (!item || !isRestraintAppearanceItem(item)) return false;
    W.InventoryRemove(W.Player, groupName);
    refreshPlayerItemGroup(groupName);
    if (typeof W.DialogLeave === "function") {
      try {
        W.DialogLeave();
      } catch {}
    }
    clearEscapePickMode();
    showToast(`Neko pick removed ${groupName}.`);
    return true;
  }

  function getEscapeStatusLines() {
    return [
      "[Neko escape]",
      `Goddess mode: ${escapeGoddessMode ? "ON" : "OFF"}`,
      `Pick remove: ${isEscapePickActive() ? "ARMED" : "IDLE"}`,
      "Commands:",
      "/neko escape release | unlock | boost | leave | goddess on | goddess off | status",
      "/neko easy 99",
      "/neko pick",
    ];
  }

  function getEscapeHelpLines() {
    return [
      "[Neko escape]",
      "/neko escape release  - unlock all currently locked restraint items on yourself",
      "/neko escape unlock   - alias of release",
      "/neko escape boost    - +5 to escape-related skills for 1 hour",
      "/neko escape leave    - leave the current room immediately",
      "/neko escape goddess on|off",
      "/neko escape status",
      "/neko easy 99         - lower most current restraint difficulties by 99",
      "/neko pick            - 5 second single-item remove mode",
    ];
  }

  function handleEscapeSubcommand(parts) {
    const action = String(parts?.[0] || "status").toLowerCase();
    if (action === "release" || action === "unlock") {
      const unlocked = unlockPlayerRestraints();
      showToast(unlocked > 0 ? `Neko escape unlocked ${unlocked} restraint item(s).` : "Neko escape found no locked restraint items.");
      return true;
    }
    if (action === "boost") {
      if (!setEscapeSkillModifier(5, 3600000)) {
        showToast("Neko escape boost is unavailable here.");
        return true;
      }
      showToast("Neko escape boost active for 1 hour.");
      return true;
    }
    if (action === "leave") {
      if (!leaveCurrentRoomNow()) {
        showToast("Neko escape leave is unavailable here.");
        return true;
      }
      return true;
    }
    if (action === "goddess") {
      const mode = String(parts?.[1] || "status").toLowerCase();
      if (mode === "on") {
        escapeGoddessMode = true;
        unlockPlayerRestraints();
        lowerPlayerRestraintDifficulty(99);
        if (!escapeGoddessBoostGranted) {
          escapeGoddessBoostGranted = setEscapeSkillModifier(10, 3600000);
        }
        showToast("Neko goddess mode enabled.");
        return true;
      }
      if (mode === "off") {
        escapeGoddessMode = false;
        showToast("Neko goddess mode disabled.");
        return true;
      }
      sendNekoCommandNotice(getEscapeStatusLines());
      return true;
    }
    if (action === "status") {
      sendNekoCommandNotice(getEscapeStatusLines());
      return true;
    }
    sendNekoCommandNotice(getEscapeHelpLines());
    return true;
  }

  function handleEasySubcommand(parts) {
    const amount = Math.max(0, Math.min(99, Number(parts?.[0]) || ESCAPE_DEFAULT_EASY_VALUE));
    const changed = lowerPlayerRestraintDifficulty(amount);
    showToast(changed > 0 ? `Neko easy lowered ${changed} restraint difficulty value(s) by ${amount}.` : "Neko easy found no restraint items to adjust.");
    return true;
  }

  function handlePickSubcommand() {
    armEscapePickMode();
    return true;
  }

  function getNekoStatusLines() {
    const speechState = detectPlayerGagState();
    const gagSuffix = speechState.gagged ? " (Lv." + speechState.gagLevel + ")" : "";
    const status = getNekoLibraryStatusLines();
    const pickLeft = isEscapePickActive()
      ? Math.max(0, Math.ceil((escapePickExpiresAt - Date.now()) / 1000)) + "s"
      : "\u672a\u5f00\u542f";
    return [
      "[\u732b\u5a18\u72b6\u6001] Bondage Club Neko Chat Enhancer v" + VERSION + " (\u6b63\u5f0f\u7248)",
      "\u732b\u5a18\u6a21\u5f0f\uff1a" + (config.enabled ? "\u5f00\u542f" : "\u5173\u95ed"),
      "\u53d1\u9001\u8f6c\u6362\uff1a" + (config.convertOutgoing ? "\u5f00" : "\u5173") + " | \u663e\u793a\u8f6c\u6362\uff1a" + (config.convertDisplayed ? "\u5f00" : "\u5173"),
      "\u804a\u5929\u88c5\u9970\uff1a" + (config.decorateChat ? "\u5f00" : "\u5173") + " | \u53d1\u9001\u732b\u722a\u96e8\uff1a" + (config.rainOnSend ? "\u5f00" : "\u5173") + " | \u65b0\u6d88\u606f\u63d0\u9192\uff1a" + (config.notifyIncoming ? "\u5f00" : "\u5173"),
      "\u5835\u5634\u8bf4\u8bdd\uff1a" + getSpeechModeLabel(speechState) + gagSuffix,
      "\u4e3b\u9898\uff1a" + (currentTheme().label || config.theme),
      "\u52a8\u4f5c\u76ee\u6807\uff1a" + getActionTargetModeLabel(),
      "\u5f53\u524d\u9009\u4e2d\uff1a" + formatSelectedTargetStatus(status.selectedTarget) + " | \u53ef\u4e92\u52a8\u76ee\u6807\uff1a" + status.actionTargets.length,
      "\u52a8\u4f5c\u5e93\uff1a" + status.activeActions.length + "/" + ((actionLibrary.actions || []).length) + " \u53ef\u7528 | \u7f13\u5b58\uff1a" + (status.cached.actions ? "\u6709" : "\u65e0") + " | v" + (actionLibrary.version || "unknown"),
      "\u989c\u6587\u5b57\uff1a" + status.activeKaomojiItems.length + " \u4e2a | \u5206\u7ec4\uff1a" + status.visibleKaomojiGroups.length + "/" + ((kaomojiLibrary.groups || []).length) + " | \u7f13\u5b58\uff1a" + (status.cached.kaomoji ? "\u6709" : "\u65e0"),
      "\u540c\u63d2\u4ef6\u73a9\u5bb6\uff1a" + nekoPeers.size + " | SDK\uff1a" + (bcModApi ? "\u5df2\u6ce8\u518c" : "\u672a\u6ce8\u518c") + " | hooks\uff1a" + (patched ? "\u5df2\u63a5\u5165" : "\u672a\u63a5\u5165"),
      "\u9003\u8131\u8f85\u52a9\uff1apick " + pickLeft + " | goddess " + (escapeGoddessMode ? "ON" : "OFF"),
      "\u732b\u732b\u83dc\u5355\uff1a" + (config.menuCollapsed ? "\u5df2\u6536\u8d77" : "\u5df2\u5c55\u5f00") + " | \u5feb\u6377\u52a8\u4f5c\uff1a" + (config.quickWheel ? "\u5f00" : "\u5173"),
    ];
  }

  function getNekoHelpLines(section = "main") {
    switch (normalizeNekoHelpSection(section)) {
      case "rp":
        return [
          "[\u732b\u5a18\u5e2e\u52a9 / rp]",
          "\u8fd9\u4e00\u7c7b\u7528\u4e8e\u732b\u5a18 RP \u8bed\u6c14\u548c\u8f93\u51fa\u98ce\u683c\u3002",
          "\u6b63\u5f0f\u7248\u6682\u4e0d\u63d0\u4f9b /neko rp \u5207\u6362\u6307\u4ee4\uff0c\u4e3b\u8981\u4f7f\u7528\u666e\u901a\u732b\u5a18\u8f6c\u6362\u3002",
          "Bug \u7248\u63d0\u4f9b\u72ec\u7acb RP \u4eba\u8bbe\u5207\u6362\uff0c\u6d4b\u8bd5\u7248\u63d0\u4f9b\u72b6\u6001\u548c\u7075\u611f\u7cfb\u7edf\u3002",
          "\u5835\u5634\u72b6\u6001\u4f1a\u5728 RP \u8f6c\u6362\u4e4b\u540e\u518d\u505a\u538b\u5236\uff0c\u4fdd\u7559\u4eba\u8bbe\u5473\u9053\u3002",
        ];
      case "action":
        return [
          "[\u732b\u5a18\u5e2e\u52a9 / action]",
          "\u53f3\u4e0b\u89d2\u52a8\u4f5c\u732b\u732b\u53ef\u5feb\u901f\u53d1\u9001\u62b1\u62b1\u3001\u6478\u5934\u3001\u5582\u98df\u3001\u8d34\u8d34\u3001\u4eb2\u4eb2\u3002",
          "\u5f53\u524d\u76ee\u6807\u6a21\u5f0f\uff1a" + getActionTargetModeLabel(),
          "\u5de6\u952e\u4f18\u5148\u5bf9\u5f53\u524d\u9009\u4e2d\u76ee\u6807\u751f\u6548\uff0c\u83dc\u5355\u5c55\u5f00\u540e\u53ef\u5feb\u6377\u4f7f\u7528\u3002",
        ];
      case "escape":
        return getEscapeHelpLines();
      case "emoji":
        return [
          "[\u732b\u5a18\u5e2e\u52a9 / emoji]",
          "\u989c\u6587\u5b57\u732b\u732b\u53ef\u70b9\u51fb\u63d2\u5165\uff0c\u957f\u6309\u6253\u5f00\u989c\u6587\u5b57\u9009\u62e9\u5668\u3002",
          "\u989c\u6587\u5b57\u5e93\u4f1a\u8fdc\u7a0b\u52a0\u8f7d\uff0c\u5206\u7c7b\u66f4\u65b0\u540e\u5237\u65b0\u5373\u53ef\u751f\u6548\u3002",
        ];
      case "mode":
        return [
          "[\u732b\u5a18\u5e2e\u52a9 / mode]",
          "\u4e3b\u732b\u732b\u957f\u6309 10 \u79d2\u53ef\u5207\u6362\u732b\u5a18\u6a21\u5f0f\u3002",
          "\u5835\u5634\u8bf4\u8bdd\u8054\u52a8\u4f1a\u6839\u636e\u5f53\u524d\u5835\u5634\u7a0b\u5ea6\u81ea\u52a8\u538b\u7f29\u53e5\u5b50\u3002",
          "\u53d1\u9001\u8f6c\u6362\u3001\u63a5\u6536\u663e\u793a\u8f6c\u6362\u3001\u804a\u5929\u5ba4\u7f8e\u5316\u90fd\u53ef\u5728\u732b\u5a18\u8bbe\u7f6e\u9875\u8c03\u6574\u3002",
        ];
      case "theme":
        return [
          "[\u732b\u5a18\u5e2e\u52a9 / theme]",
          "\u5f53\u524d\u4e3b\u9898\uff1a" + (currentTheme().label || config.theme),
          "\u53ef\u7528\u4e3b\u9898\uff1a\u6a31\u7c89 / \u8584\u8377 / \u5929\u7a7a / \u5976\u6cb9 / \u858b\u8863\u8349 / \u767d\u8336\u3002",
          "\u4e3b\u9898\u53ef\u5728\u6269\u5c55\u7ec4\u4ef6\u8bbe\u7f6e\u9875\u5185\u5207\u6362\u3002",
        ];
      case "spark":
        return [
          "[\u732b\u5a18\u5e2e\u52a9 / spark]",
          "\u6d4b\u8bd5\u7248\u53ef\u7528\uff1a/neko spark \u4f1a\u6839\u636e\u6700\u8fd1\u804a\u5929\u3001\u9009\u4e2d\u76ee\u6807\u548c\u89d2\u8272\u72b6\u6001\u751f\u6210 RP \u7075\u611f\u77ed\u53e5\u3002",
          "\u6b63\u5f0f\u7248\u5f53\u524d\u672a\u542f\u7528 spark \u751f\u6210\u5668\uff0c\u5efa\u8bae\u5728\u6d4b\u8bd5\u7248\u9a8c\u8bc1\u7a33\u5b9a\u540e\u518d\u5408\u5165\u3002",
        ];
      case "voice":
        return [
          "[\u732b\u5a18\u5e2e\u52a9 / voice]",
          "\u6d4b\u8bd5\u7248\u53ef\u7528\uff1a/neko voice <text> \u672c\u5730\u89e6\u53d1 NekoVoice\uff0c[NekoVoice] <text> \u53ef\u4ece\u804a\u5929\u5185\u89e6\u53d1\u3002",
          "\u6548\u679c\u5305\u62ec *mew* / *purr* / *nyaa* \u89c6\u89c9\u58f0\u6548\u3001\u7c89\u8272\u95ea\u5149\u3001\u58f0\u6ce2\u5708\u3001\u5f39\u5e55\u53e3\u7656\u548c\u6c14\u606f\u7c92\u5b50\u3002",
          "\u6b63\u5f0f\u7248\u5f53\u524d\u672a\u542f\u7528 NekoVoice\uff0c\u907f\u514d\u89c6\u89c9\u5e72\u6270\u8fc7\u5f3a\u3002",
        ];
      case "reactions":
        return [
          "[\u732b\u5a18\u5e2e\u52a9 / reactions]",
          "\u6d4b\u8bd5\u7248\u53ef\u7528\uff1a/neko reactions \u67e5\u770b\u4e92\u52a8\u529f\u80fd\u7c7b\u76ee\uff0c/neko reactions <keyword> \u641c\u7d22\u89e6\u53d1\u7c7b\u76ee\u3002",
          "\u529f\u80fd\u5305\u62ec\u654f\u611f\u90e8\u4f4d\u53cd\u5e94\u3001\u5bf9\u65b9\u4e92\u52a8\u53cd\u5e94\u3001\u89d2\u8272\u72b6\u6001\u53cd\u5e94\u548c\u7c92\u5b50\u53cd\u9988\u3002",
          "\u6b63\u5f0f\u7248\u5f53\u524d\u4fdd\u7559\u57fa\u7840\u52a8\u4f5c\u8f6e\u76d8\uff0c\u672a\u542f\u7528 101 \u4e2a\u6d4b\u8bd5\u4e92\u52a8\u7c7b\u76ee\u3002",
        ];
      case "mood":
        return [
          "[\u732b\u5a18\u5e2e\u52a9 / mood]",
          "\u6d4b\u8bd5\u7248\u53ef\u7528\uff1a/neko mood \u67e5\u770b\u72b6\u6001\uff0c/neko mood \u9ad8\u5174 | \u4f24\u5fc3 | \u9ad8\u51b7 | \u9ecf\u4eba | \u56f0\u56f0 \u7b49\u53ef\u624b\u52a8\u5207\u6362\u3002",
          "\u72b6\u6001\u4f1a\u5f71\u54cd\u8bed\u6c14\u5c3e\u5df4\u3001\u7c92\u5b50\u548c\u4e92\u52a8\u53cd\u5e94\u3002",
          "\u6b63\u5f0f\u7248\u5f53\u524d\u672a\u542f\u7528\u72b6\u6001\u6301\u7eed\u7cfb\u7edf\u3002",
        ];
      case "systems":
        return [
          "[\u732b\u5a18\u5e2e\u52a9 / systems]",
          "\u6d4b\u8bd5\u7248\u53ef\u7528\uff1a/neko systems \u6216 /neko profile \u67e5\u770b\u654f\u611f\u5ea6\u6863\u6848\u3001\u5173\u7cfb\u6e29\u5ea6\u8ba1\u3001\u6301\u7eed\u72b6\u6001\u548c\u4e8b\u4ef6\u8ba1\u6570\u3002",
          "\u654f\u611f\u5ea6\uff1aear / tail / nape / chin / belly \u4f1a\u968f\u4e92\u52a8\u7d2f\u79ef\u3002",
          "\u5173\u7cfb\u6e29\u5ea6\uff1a\u5bf9\u65b9\u548c\u4f60\u4e92\u52a8\u8d8a\u591a\uff0cwarmth/trust/familiar \u8d8a\u9ad8\u3002",
          "\u6b63\u5f0f\u7248\u5f53\u524d\u672a\u542f\u7528\u8fd9\u4e9b\u5b9e\u9a8c\u7cfb\u7edf\u3002",
        ];
      case "status":
        return [
          "[\u732b\u5a18\u5e2e\u52a9 / status]",
          "\u4f7f\u7528 /neko status \u53ef\u67e5\u770b\u63d2\u4ef6\u5f00\u5173\u3001\u8f6c\u6362\u5f00\u5173\u3001\u804a\u5929\u88c5\u9970\u3001\u5835\u5634\u8bf4\u8bdd\u6863\u4f4d\u3001\u4e3b\u9898\u548c\u52a8\u4f5c\u76ee\u6807\u3002",
          "\u73b0\u5728\u4e5f\u4f1a\u663e\u793a\u52a8\u4f5c\u5e93\u3001\u989c\u6587\u5b57\u5e93\u3001\u5f53\u524d\u9009\u4e2d\u76ee\u6807\u3001\u540c\u63d2\u4ef6\u73a9\u5bb6\u3001SDK/hooks \u548c\u9003\u8131\u8f85\u52a9\u72b6\u6001\u3002",
        ];
      default:
        return [
          "[\u732b\u5a18\u547d\u4ee4\u5e2e\u52a9] /neko help <\u5206\u7c7b>",
          "\u6b63\u5f0f\u7248\u53ef\u7528\uff1arp / action / emoji / mode / theme / status / escape",
          "\u6d4b\u8bd5\u7248\u8bf4\u660e\uff1aspark / voice / reactions / mood / systems",
          "\u5feb\u6377\u4f8b\u5b50\uff1a/neko help status | /neko help action | /neko status",
        ];
    }
  }

  function isNekoCommandText(text) {
    return typeof text === "string" && /^\/(?:neko|noke|bug)(?:\s|$)/i.test(text.trim());
  }

  function clearNekoCommandInput(text) {
    const input = getChatInput();
    if (input && input.value && input.value.trim() === String(text || "").trim()) {
      input.value = "";
      input.dispatchEvent(new InputEvent("input", { bubbles: true }));
    }
  }

  function handleNekoCommand(text) {
    if (!isNekoCommandText(text)) return false;
    const parts = String(text || "").trim().split(/\s+/).filter(Boolean);
    const subcommand = String(parts[1] || "").toLowerCase();
    if (subcommand === "escape") return handleEscapeSubcommand(parts.slice(2));
    if (subcommand === "easy") return handleEasySubcommand(parts.slice(2));
    if (subcommand === "pick") return handlePickSubcommand();
    const group = normalizeNekoHelpSection(parts[1] || "help");
    if (group === "main") {
      sendNekoCommandNotice(getNekoHelpLines(parts[2] || "main"));
      return true;
    }
    if (group === "status") {
      sendNekoCommandNotice(getNekoStatusLines());
      return true;
    }
    sendNekoCommandNotice(getNekoHelpLines(group));
    return true;
  }

  function runNekoCommand(text) {
    if (!handleNekoCommand(text)) return false;
    clearNekoCommandInput(text);
    return true;
  }

  function insertKaomoji(face) {
    const input = getChatInput();
    if (!input) {
      showToast("还没找到聊天框，进入聊天室后再点喵~");
      return;
    }

    const oldValue = input.value || "";
    const start = Number.isFinite(input.selectionStart) ? input.selectionStart : oldValue.length;
    const end = Number.isFinite(input.selectionEnd) ? input.selectionEnd : oldValue.length;
    const insert = `${oldValue && !/\s$/.test(oldValue.slice(0, start)) ? " " : ""}${face}`;
    input.value = `${oldValue.slice(0, start)}${insert}${oldValue.slice(end)}`;
    input.dispatchEvent(new InputEvent("input", { bubbles: true }));
    input.focus();
    if (typeof input.setSelectionRange === "function") {
      const pos = start + insert.length;
      input.setSelectionRange(pos, pos);
    }
    showToast("猫猫颜文字已插入喵~");
  }

  function insertFace() {
    insertKaomoji(pickRandomKaomoji());
  }

  function toggleNekoMode(button) {
    config.enabled = !config.enabled;
    saveConfig();
    syncBodyState();
    const toggleButton = button || document.getElementById("bcn-toggle");
    if (toggleButton) {
      toggleButton.textContent = config.enabled ? "😺" : "😿";
      toggleButton.title = config.enabled ? "关闭猫娘模式" : "开启猫娘模式";
    }
    showToast(config.enabled ? "猫娘模式开启喵~" : "猫娘模式已关闭");
  }

  function getCharacterName(character) {
    return W.CharacterNickname?.(character) || character?.Nickname || character?.Name || "对方";
  }

  function getSelectedTarget() {
    const current = W.CurrentCharacter;
    if (current && !current.IsPlayer?.()) return current;
    const target = W.ChatRoomCharacter?.find?.((c) => c.MemberNumber === W.ChatRoomTargetMemberNumber);
    return target || null;
  }

  function getActionTargets() {
    return (W.ChatRoomCharacter || [])
      .filter((c) => c && c.MemberNumber !== W.Player?.MemberNumber)
      .map((character) => ({
        character,
        name: getCharacterName(character),
        memberNumber: character.MemberNumber,
      }));
  }

  function getActiveActions() {
    return (actionLibrary.actions || []).filter((action) => action.enabled !== false);
  }

  function pickRandomLine(lines, fallback = "") {
    const cleanLines = Array.isArray(lines) ? lines.filter(Boolean) : [];
    if (!cleanLines.length) return fallback;
    return cleanLines[Math.floor(Math.random() * cleanLines.length)];
  }

  function formatActionText(action, target) {
    const hasTarget = !!target;
    const line = hasTarget
      ? pickRandomLine(action.target, pickRandomLine(action.self, "{target}靠近了一点喵~"))
      : pickRandomLine(action.self, pickRandomLine(action.target, "轻轻晃了晃尾巴喵~"));
    return line.replace(/\{target\}/g, hasTarget ? getCharacterName(target) : "身边的猫猫");
  }

  function sendEmote(text) {
    const input = getChatInput();
    if (input && typeof W.ChatRoomSendChat === "function") {
      input.value = `*${text}*`;
      input.dispatchEvent(new InputEvent("input", { bubbles: true }));
      W.ChatRoomSendChat();
      input.focus();
      return true;
    }
    navigator.clipboard?.writeText(`*${text}*`);
    showToast("动作已复制，进聊天室后可直接发送喵~");
    return false;
  }

  function sendQuickAction(action, target = undefined) {
    if (!action) return;
    const selected = target === undefined ? getSelectedTarget() : target;
    if (config.actionTargetMode === ACTION_TARGET_MODE.PICKER && target === undefined) {
      showTargetPicker(action);
      return;
    }
    const finalTarget = config.actionTargetMode === ACTION_TARGET_MODE.SELF ? null : selected;
    if (sendEmote(formatActionText(action, finalTarget)) && config.rainOnSend) pawRain("Action");
  }

  function showTargetPicker(action, anchor) {
    hideTargetPicker();
    const targets = getActionTargets();
    if (!targets.length) {
      sendQuickAction(action, null);
      return;
    }

    const picker = document.createElement("div");
    picker.id = "bcn-target-picker";
    picker.innerHTML = `
      <div class="bcn-target-title">选择互动对象</div>
      <button type="button" data-self="1">自己</button>
      ${targets.map((target) => `<button type="button" data-member="${target.memberNumber}">${escapeHtml(target.name)}</button>`).join("")}
    `;
    document.body.appendChild(picker);

    if (anchor) {
      const rect = anchor.getBoundingClientRect();
      picker.style.right = `${Math.max(14, window.innerWidth - rect.right)}px`;
      picker.style.bottom = `${Math.max(74, window.innerHeight - rect.top + 8)}px`;
    }

    picker.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button) return;
      const target = button.dataset.self
        ? null
        : targets.find((item) => String(item.memberNumber) === button.dataset.member)?.character || null;
      hideTargetPicker();
      sendQuickAction(action, target);
    });

    setTimeout(() => {
      document.addEventListener("pointerdown", closeTargetPickerOnOutside, { once: true });
    }, 0);
  }

  function closeTargetPickerOnOutside(event) {
    if (!event.target.closest?.("#bcn-target-picker")) hideTargetPicker();
  }

  function hideTargetPicker() {
    document.getElementById("bcn-target-picker")?.remove();
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[char]));
  }

  function editActions() {
    window.open?.("https://github.com/QAQMOON/bondage-club-neko-chat-enhancer/blob/main/actions/catgirl-actions.json", "_blank", "noopener");
    showToast("动作库现在从 GitHub JSON 管理喵~");
  }

  function renderWheel() {
    const wheel = document.getElementById("bcn-wheel");
    if (!wheel) return;
    wheel.innerHTML = "";
    const actions = getActiveActions().slice(0, 5);
    actions.forEach((action, index) => {
      const btn = document.createElement("button");
      btn.className = "bcn-wheel-btn";
      btn.type = "button";
      btn.textContent = action.label;
      btn.title = `${action.label}\n左键随机动作，右键选择目标`;
      btn.style.setProperty("--i", String(index));
      btn.addEventListener("click", () => sendQuickAction(action));
      btn.addEventListener("contextmenu", (ev) => {
        ev.preventDefault();
        showTargetPicker(action, btn);
      });
      wheel.appendChild(btn);
    });
    for (let index = actions.length; index < 6; index++) {
      const blank = document.createElement("span");
      blank.className = "bcn-wheel-blank";
      blank.style.setProperty("--i", String(index));
      wheel.appendChild(blank);
    }
  }

  function renderKaomojiPicker() {
    const picker = document.getElementById("bcn-kaomoji-picker");
    if (!picker) return;
    const groups = getVisibleKaomojiGroups();
    if (activeKaomojiGroup !== "all" && !groups.some((group) => group.id === activeKaomojiGroup)) {
      activeKaomojiGroup = "all";
    }
    const items = getKaomojiItemsForGroup(activeKaomojiGroup);
    const tabs = [
      { id: "all", label: "全部" },
      ...groups.map((group) => ({ id: group.id, label: group.label })),
    ];

    picker.innerHTML = `
      <div class="bcn-kaomoji-tabs"></div>
      <div class="bcn-kaomoji-grid"></div>
    `;

    const tabWrap = picker.querySelector(".bcn-kaomoji-tabs");
    tabs.forEach((tab) => {
      const button = document.createElement("button");
      button.className = `bcn-kaomoji-tab${tab.id === activeKaomojiGroup ? " is-active" : ""}`;
      button.type = "button";
      button.textContent = tab.label;
      button.title = `显示${tab.label}颜文字`;
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        activeKaomojiGroup = tab.id;
        renderKaomojiPicker();
        syncKaomojiPickerState(true);
      });
      tabWrap.appendChild(button);
    });

    const grid = picker.querySelector(".bcn-kaomoji-grid");
    items.forEach((face, index) => {
      const button = document.createElement("button");
      button.className = "bcn-kaomoji-item";
      button.type = "button";
      button.textContent = face;
      button.title = face;
      button.style.setProperty("--i", String(index % 18));
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        insertKaomoji(face);
        hideKaomojiPicker();
      });
      grid.appendChild(button);
    });
  }

  function showKaomojiPicker() {
    setWheelCollapsed(true);
    renderKaomojiPicker();
    syncKaomojiPickerState(true);
    document.removeEventListener("pointerdown", closeKaomojiPickerOnOutside);
    setTimeout(() => {
      document.addEventListener("pointerdown", closeKaomojiPickerOnOutside);
    }, 0);
  }

  function hideKaomojiPicker() {
    syncKaomojiPickerState(false);
    document.removeEventListener("pointerdown", closeKaomojiPickerOnOutside);
  }

  function toggleKaomojiPicker() {
    if (document.getElementById("bcn-kaomoji-picker")?.classList.contains("is-open")) {
      hideKaomojiPicker();
    } else {
      showKaomojiPicker();
    }
  }

  function closeKaomojiPickerOnOutside(event) {
    if (event.target?.closest?.("#bcn-kaomoji-picker, #bcn-face")) {
      return;
    }
    hideKaomojiPicker();
  }

  function bindKaomojiButton(button, dragState) {
    let longPressTimer = 0;
    let longPressTriggered = false;

    const clearLongPress = () => {
      clearTimeout(longPressTimer);
      longPressTimer = 0;
    };

    button.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      longPressTriggered = false;
      clearLongPress();
      longPressTimer = setTimeout(() => {
        if (dragState.hasMoved() || dragState.wasJustDragged()) return;
        longPressTriggered = true;
        showKaomojiPicker();
      }, 2000);
    });

    ["pointerup", "pointercancel", "pointerleave"].forEach((type) => {
      button.addEventListener(type, clearLongPress);
    });

    button.addEventListener("click", (event) => {
      event.stopPropagation();
      if (dragState.wasJustDragged() || longPressTriggered) {
        longPressTriggered = false;
        return;
      }
      toggleKaomojiPicker();
    });

    button.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      clearLongPress();
      pawRain("Chat");
    });
  }

  function syncWheelPosition(panel) {
    if (!panel) return;
    const hasSavedPos = Number.isFinite(config.wheelX) && Number.isFinite(config.wheelY);
    if (hasSavedPos) {
      const pos = clampPanelPosition(panel, config.wheelX, config.wheelY);
      config.wheelX = pos.left;
      config.wheelY = pos.top;
      panel.style.left = `${pos.left}px`;
      panel.style.top = `${pos.top}px`;
      panel.style.right = "auto";
      panel.style.bottom = "auto";
      return;
    }
    panel.style.left = "auto";
    panel.style.top = "auto";
    panel.style.right = "18px";
    panel.style.bottom = "18px";
  }

  function clampPanelPosition(panel, left, top) {
    const maxLeft = Math.max(0, window.innerWidth - panel.offsetWidth - 6);
    const maxTop = Math.max(0, window.innerHeight - panel.offsetHeight - 6);
    return {
      left: Math.round(clamp(left, 6, maxLeft)),
      top: Math.round(clamp(top, 6, maxTop)),
    };
  }

  function setWheelCollapsed(collapsed) {
    config.wheelCollapsed = !!collapsed;
    saveConfig();
    syncBodyState();
  }

  function toggleWheelCollapsed() {
    hideKaomojiPicker();
    setWheelCollapsed(!config.wheelCollapsed);
  }

  function setMenuCollapsed(collapsed) {
    config.menuCollapsed = !!collapsed;
    if (config.menuCollapsed) {
      config.wheelCollapsed = true;
      hideKaomojiPicker();
      document.removeEventListener("pointerdown", closeMenuOnOutside);
    }
    saveConfig();
    syncBodyState();
    if (!config.menuCollapsed) {
      setTimeout(() => {
        document.addEventListener("pointerdown", closeMenuOnOutside);
      }, 0);
    }
  }

  function toggleMenuCollapsed() {
    setMenuCollapsed(!config.menuCollapsed);
  }

  function closeMenuOnOutside(event) {
    if (event.target?.closest?.("#bcn-panel")) return;
    setMenuCollapsed(true);
  }

  function makePanelDraggable(panel) {
    let dragging = false;
    let moved = false;
    let panelJustDragged = false;
    let startX = 0;
    let startY = 0;
    let originLeft = 0;
    let originTop = 0;

    const stopDrag = () => {
      if (!dragging) return;
      dragging = false;
      panel.classList.remove("is-dragging");
      if (moved) {
        panelJustDragged = true;
        saveConfig();
        setTimeout(() => {
          panelJustDragged = false;
        }, 150);
      }
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
    };

    const onMove = (event) => {
      if (!dragging) return;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      if (!moved && Math.hypot(dx, dy) > 5) {
        moved = true;
        hideKaomojiPicker();
      }
      if (!moved) return;
      const pos = clampPanelPosition(panel, originLeft + dx, originTop + dy);
      panel.style.left = `${pos.left}px`;
      panel.style.top = `${pos.top}px`;
      panel.style.right = "auto";
      panel.style.bottom = "auto";
      config.wheelX = pos.left;
      config.wheelY = pos.top;
      syncBodyState();
    };

    const onUp = () => {
      stopDrag();
    };

    panel.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      if (event.target?.closest?.("#bcn-wheel, #bcn-kaomoji-picker")) return;
      dragging = true;
      moved = false;
      startX = event.clientX;
      startY = event.clientY;
      originLeft = panel.getBoundingClientRect().left;
      originTop = panel.getBoundingClientRect().top;
      panel.classList.add("is-dragging");
      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
    });

    return {
      isDragging: () => dragging,
      hasMoved: () => moved,
      wasJustDragged: () => panelJustDragged,
    };
  }

  function bindMainCatButton(button, dragState) {
    let longPressTimer = 0;
    let longPressTriggered = false;

    const clearLongPress = () => {
      clearTimeout(longPressTimer);
      longPressTimer = 0;
    };

    button.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      longPressTriggered = false;
      clearLongPress();
      longPressTimer = setTimeout(() => {
        if (dragState.hasMoved() || dragState.wasJustDragged()) return;
        longPressTriggered = true;
        toggleNekoMode();
      }, 10000);
    });

    ["pointerup", "pointercancel", "pointerleave"].forEach((type) => {
      button.addEventListener(type, clearLongPress);
    });

    button.addEventListener("click", (event) => {
      event.stopPropagation();
      if (dragState.wasJustDragged() || longPressTriggered) {
        longPressTriggered = false;
        return;
      }
      toggleMenuCollapsed();
    });

    button.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      showToast("按住主猫猫 10 秒可切换猫娘模式喵~");
    });
  }

  function bindWheelButton(button, dragState) {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      if (dragState.wasJustDragged()) return;
      toggleWheelCollapsed();
    });

    button.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      showToast("点击动作猫猫可展开动作轮盘喵~");
    });
  }

  function createPanel() {
    if (document.getElementById("bcn-panel")) return;

    const decor = document.createElement("div");
    decor.id = "bcn-soft-paws";
    decor.innerHTML = Array.from({ length: 18 }, (_, i) => {
      const icon = i % 3 === 0 ? "💗" : "🐾";
      const left = 3 + Math.random() * 92;
      const top = 4 + Math.random() * 88;
      const scale = 0.65 + Math.random() * 1.05;
      return `<span style="left:${left}%;top:${top}%;transform:scale(${scale})">${icon}</span>`;
    }).join("");
    document.body.appendChild(decor);

    const panel = document.createElement("div");
    panel.id = "bcn-panel";
    panel.innerHTML = `
      <button class="bcn-btn" id="bcn-main-cat" type="button" title="展开猫猫菜单，按住可拖动，长按 10 秒切换猫娘模式">🐱</button>
      <div id="bcn-submenu">
        <button class="bcn-btn" id="bcn-wheel-handle" type="button" title="展开动作轮盘">🐱</button>
        <button class="bcn-btn" id="bcn-face" type="button" title="打开猫猫颜文字，长按 2 秒也可打开">🐱</button>
      </div>
      <div class="bcn-wheel-wrap">
        <div id="bcn-wheel"></div>
      </div>
      <div id="bcn-kaomoji-picker" aria-label="猫猫颜文字选择器"></div>
    `;
    document.body.appendChild(panel);

    const dragState = makePanelDraggable(panel);
    const mainButton = document.getElementById("bcn-main-cat");
    bindMainCatButton(mainButton, dragState);

    const faceButton = document.getElementById("bcn-face");
    bindKaomojiButton(faceButton, dragState);

    const handleButton = document.getElementById("bcn-wheel-handle");
    bindWheelButton(handleButton, dragState);

    syncWheelPosition(panel);
    renderWheel();
    renderKaomojiPicker();
    syncBodyState();
  }

  function syncScreenClass() {
    if (!document.body) return;
    document.body.dataset.bcnScreen = W.CurrentScreen || "";
    document.body.classList.toggle("bcn-chatroom", W.CurrentScreen === "ChatRoom");
  }

  function getChatLogRoot() {
    return document.getElementById("TextAreaChatLog") || null;
  }

  function disconnectObserver() {
    if (chatObserver) {
      chatObserver.disconnect();
      chatObserver = null;
    }
    observerRoot = null;
  }

  function installObserver() {
    const nextRoot = getChatLogRoot();
    if (!nextRoot) {
      disconnectObserver();
      return false;
    }
    if (chatObserver && observerRoot === nextRoot) return true;
    disconnectObserver();
    chatObserver = new MutationObserver((mutations) => {
      if (document.hidden) return;
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes || []) {
          if (!(node instanceof Element)) continue;
          if (node.classList?.contains("ChatMessage")) {
            decorateExistingChat(node);
            continue;
          }
          if (node.querySelector) {
            const nested = node.querySelector(".ChatMessage");
            if (nested) {
              decorateExistingChat(node);
              continue;
            }
          }
        }
      }
      scheduleDecorateChat(120);
    });
    chatObserver.observe(nextRoot, { childList: true, subtree: true });
    observerRoot = nextRoot;
    scheduleDecorateChat(0);
    return true;
  }

  function runMaintenance() {
    if (document.hidden) return;
    installObserver();
    patchStatusBadge();
    patchRoomEffects();
    registerSettingsUI();
    syncScreenClass();
    scheduleDecorateChat(0);
  }

  function stopMaintenance() {
    clearTimeout(decorateTimer);
    decorateTimer = 0;
    if (maintenanceTimer) {
      clearInterval(maintenanceTimer);
      maintenanceTimer = 0;
    }
    disconnectObserver();
  }

  function startMaintenance() {
    if (maintenanceTimer) return;
    runMaintenance();
    maintenanceTimer = setInterval(runMaintenance, 12000);
  }

  function bindVisibilityLifecycle() {
    if (visibilityBound) return;
    visibilityBound = true;
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stopMaintenance();
        return;
      }
      startMaintenance();
    });
    window.addEventListener("focus", () => {
      if (!document.hidden) startMaintenance();
    });
    window.addEventListener("beforeunload", stopMaintenance, { once: true });
  }

  const NekoSettingsUI = (() => {
    const exitButton = { x: 1830, y: 62, w: 72, h: 72 };
    const slider = { x: 800, y: 356, w: 386, h: 14 };
    const cards = {
      left: { x: 62, y: 150, w: 610, h: 740 },
      middle: { x: 695, y: 150, w: 640, h: 740 },
      right: { x: 1360, y: 150, w: 580, h: 740 },
    };
    const featureRows = [
      { key: "convertOutgoing", y: 250, title: "转换发送语气（convertOutgoing）", desc: "发送的消息自动转换为猫娘语气～" },
      { key: "convertDisplayed", y: 348, title: "转换显示语气（convertDisplayed）", desc: "接收的消息也会变成猫娘语气哦～" },
      { key: "decorateChat", y: 524, title: "聊天室美化（decorateChat）", desc: "美化聊天界面，添加猫娘风格装饰～" },
      { key: "rainOnSend", y: 622, title: "猫爪表情雨（rainOnSend）", desc: "发送消息时，下起猫爪表情雨～" },
      { key: "quickWheel", y: 720, title: "动作快捷轮盘（quickWheel）", desc: "右下角显示抱抱、摸头、喂食动作～" },
      { key: "notifyIncoming", y: 842, title: "新消息通知（notifyIncoming）", desc: "有新消息时显示通知提醒～" },
    ];
    const enabledRow = { key: "enabled", x: 750, y: 250 };
    const targetButton = { x: 725, y: 660, w: 230, h: 78 };
    const actionButton = { x: 725, y: 775, w: 230, h: 78 };
    const themeRows = THEME_ORDER.map((id, index) => ({
      id,
      x: 1405,
      y: 286 + index * 92,
      w: 490,
      h: 72,
    }));

    function load() {
      hideTargetPicker();
    }

    function unload() {
      hideTargetPicker();
    }

    function exit() {
      hideTargetPicker();
    }

    function run() {
      try {
        drawSettingsBackground();
        drawHeader();
        drawFeatureCard();
        drawBehaviorCard();
        drawThemeCard();
      } catch (err) {
        console.error("[BCNekoSettings] render failed:", err);
      }
    }

    function click() {
      if (W.MouseIn?.(exitButton.x, exitButton.y, exitButton.w, exitButton.h)) {
        W.PreferenceExit?.();
        return;
      }

      for (const row of featureRows) {
        if (W.MouseIn?.(104, row.y - 18, 42, 42)) {
          toggleConfig(row.key);
          return;
        }
      }

      if (W.MouseIn?.(slider.x - 12, slider.y - 28, slider.w + 130, 72)) {
        const mouseX = Number(W.MouseX ?? 0);
        config.nyanChance = clamp((mouseX - slider.x) / slider.w, 0, 1);
        saveConfig();
        return;
      }

      if (W.MouseIn?.(enabledRow.x, enabledRow.y - 18, 42, 42)) {
        toggleConfig("enabled");
        return;
      }

      if (W.MouseIn?.(targetButton.x, targetButton.y, targetButton.w, targetButton.h)) {
        cycleActionTargetMode();
        return;
      }

      if (W.MouseIn?.(actionButton.x, actionButton.y, actionButton.w, actionButton.h)) {
        editActions();
        return;
      }

      for (const row of themeRows) {
        if (W.MouseIn?.(row.x, row.y, row.w, row.h)) {
          config.theme = row.id;
          saveConfig();
          syncBodyState();
          showToast(`已切换到${THEME_PRESETS[row.id].label}主题喵~`);
          return;
        }
      }
    }

    function drawSettingsBackground() {
      const canvas = getDrawCanvas();
      if (!canvas) return;
      const theme = currentTheme();
      canvas.save();
      const gradient = canvas.createLinearGradient(0, 0, 2000, 1000);
      gradient.addColorStop(0, lighten(theme.soft, 0.72));
      gradient.addColorStop(0.54, "#ffffff");
      gradient.addColorStop(1, theme.soft);
      canvas.fillStyle = gradient;
      canvas.fillRect(0, 0, 2000, 1000);
      roundedRect(canvas, 10, 10, 1980, 950, 54, "rgba(255,255,255,0.56)", theme.border, 2);
      write("🐾", 108, 92, 70, withAlpha(theme.icon, 0.14), 700, "center");
      write("🐾", 620, 105, 30, withAlpha(theme.icon, 0.82), 700, "center");
      write("🐾", 1280, 105, 30, withAlpha(theme.icon, 0.82), 700, "center");
      canvas.restore();
    }

    function drawHeader() {
      const theme = currentTheme();
      W.DrawButton?.(exitButton.x, exitButton.y, exitButton.w, exitButton.h, "", "White", "Icons/Exit.png", "返回");
      write("🐾", 690, 92, 42, theme.icon, 700, "center");
      write("猫 娘 聊 天 室 增 强", 1000, 91, 48, theme.text, 800, "center");
      write("🐾", 1310, 92, 42, theme.icon, 700, "center");
      write(`v${VERSION}`, 1210, 134, 22, theme.muted, 700, "left");
    }

    function drawFeatureCard() {
      const theme = currentTheme();
      drawCard(cards.left);
      drawCardTitle(cards.left.x + 62, cards.left.y + 60, "💬", "猫娘语气转换");
      drawFeatureRow(featureRows[0], theme);
      drawFeatureRow(featureRows[1], theme);
      drawDivider(cards.left.x + 32, 444, cards.left.w - 64);
      drawCardTitle(cards.left.x + 62, 493, "🐾", "聊天相关");
      drawFeatureRow(featureRows[2], theme);
      drawFeatureRow(featureRows[3], theme);
      drawFeatureRow(featureRows[4], theme);
      drawDivider(cards.left.x + 32, 788, cards.left.w - 64);
      drawCardTitle(cards.left.x + 62, 835, "🔔", "通知与提醒");
      drawFeatureRow(featureRows[5], theme);
    }

    function drawBehaviorCard() {
      const theme = currentTheme();
      const percent = Math.round(config.nyanChance * 100);
      drawCard(cards.middle);
      drawCardTitle(cards.middle.x + 62, cards.middle.y + 60, "⚙", "行为设置");

      drawCheckBox(enabledRow.x, enabledRow.y, !!config.enabled);
      write("猫娘模式（enabled）", enabledRow.x + 70, enabledRow.y + 2, 24, theme.text, 700);
      write(config.enabled ? "当前会转换语气并启用装饰～" : "当前暂停转换，只保留设置入口～", enabledRow.x + 70, enabledRow.y + 38, 18, theme.muted, 500);

      drawSlider();
      write(`${percent}%`, slider.x + slider.w + 48, slider.y + 5, 25, theme.accent, 700, "left");
      write("语气词插入概率（nyanChance）", cards.middle.x + 40, 447, 23, theme.text, 700);
      write("控制句尾语气词出现的概率（0~100%）", cards.middle.x + 40, 485, 18, theme.muted, 500);

      roundedRect(getDrawCanvas(), cards.middle.x + 30, 540, cards.middle.w - 60, 108, 16, withAlpha(theme.soft, 0.9), theme.border, 2);
      write("喵～", cards.middle.x + 60, 581, 28, theme.accent, 800);
      write("语气词让聊天更可爱哦～", cards.middle.x + 60, 622, 18, theme.muted, 500);
      write("ฅ^•ω•^ฅ", cards.middle.x + cards.middle.w - 52, 590, 44, theme.accent, 800, "right");

      drawLargeButton(targetButton, "◎", targetModeLabel());
      write("互动目标模式", targetButton.x + 265, targetButton.y + 24, 22, theme.accent, 800);
      write("自动：优先当前选中角色，其次聊天目标。", targetButton.x + 265, targetButton.y + 59, 17, theme.muted, 500);

      drawLargeButton(actionButton, "⚡", "动作库");
      write("从 GitHub 动作库加载；", actionButton.x + 265, actionButton.y + 24, 18, theme.muted, 500);
      write("失败时将使用缓存或内置动作。", actionButton.x + 265, actionButton.y + 56, 18, theme.muted, 500);
    }

    function drawThemeCard() {
      const theme = currentTheme();
      drawCard(cards.right);
      drawCardTitle(cards.right.x + 62, cards.right.y + 60, "🎨", "主题设置");
      write("选择你喜欢的主题颜色", cards.right.x + 105, cards.right.y + 103, 17, theme.muted, 500);

      themeRows.forEach((row) => {
        const option = THEME_PRESETS[row.id];
        const selected = config.theme === row.id;
        roundedRect(getDrawCanvas(), row.x, row.y, row.w, row.h, 16, selected ? withAlpha(option.soft, 0.86) : "rgba(255,255,255,0.82)", selected ? option.accent : "#e8e8e8", selected ? 3 : 1);
        write("🐾", row.x + 48, row.y + row.h / 2 + 1, 31, option.icon, 700, "center");
        write(option.label, row.x + 90, row.y + row.h / 2 + 1, 24, selected ? option.text : "#2f2f2f", selected ? 800 : 600);
        if (selected) {
          circle(getDrawCanvas(), row.x + row.w - 16, row.y + 2, 20, option.accent, option.accent, 0);
          write("✓", row.x + row.w - 16, row.y + 3, 24, "#fff", 900, "center");
        }
      });
      write("主题设置将立即生效并保存", cards.right.x + 48, cards.right.y + cards.right.h - 62, 18, theme.muted, 500);
    }

    function drawFeatureRow(row, theme) {
      drawCheckBox(104, row.y, !!config[row.key]);
      write(row.title, 172, row.y + 2, 23, theme.text, 700);
      write(row.desc, 172, row.y + 39, 18, theme.muted, 500);
    }

    function drawSlider() {
      const canvas = getDrawCanvas();
      if (!canvas) return;
      const theme = currentTheme();
      canvas.save();
      roundedRect(canvas, slider.x, slider.y, slider.w, slider.h, 999, withAlpha(theme.accent, 0.28), "transparent", 0);
      roundedRect(canvas, slider.x, slider.y, slider.w * config.nyanChance, slider.h, 999, theme.accent, "transparent", 0);
      circle(canvas, slider.x + slider.w * config.nyanChance, slider.y + slider.h / 2, 17, "#fff", theme.accent, 3);
      canvas.restore();
    }

    function drawCard(rect) {
      const theme = currentTheme();
      roundedRect(getDrawCanvas(), rect.x, rect.y, rect.w, rect.h, 28, "rgba(255,255,255,0.78)", withAlpha(theme.border, 0.78), 1.5);
      shadowHint(rect.x, rect.y, rect.w, rect.h, theme.glow);
    }

    function drawCardTitle(x, y, icon, title) {
      const theme = currentTheme();
      write(icon, x - 5, y, 34, theme.icon, 800, "center");
      write(title, x + 40, y, 28, theme.accent, 800);
    }

    function drawLargeButton(rect, icon, label) {
      const theme = currentTheme();
      roundedRect(getDrawCanvas(), rect.x, rect.y, rect.w, rect.h, 14, withAlpha(theme.soft, 0.76), theme.border, 1.5);
      write(icon, rect.x + 45, rect.y + rect.h / 2 + 1, 32, theme.icon, 800, "center");
      write(label, rect.x + 85, rect.y + rect.h / 2 + 1, 24, theme.text, 800);
    }

    function drawCheckBox(x, y, checked) {
      const theme = currentTheme();
      roundedRect(getDrawCanvas(), x, y - 18, 40, 40, 8, checked ? theme.accent : "#fff", checked ? theme.accent : theme.border, 2);
      if (checked) write("✓", x + 20, y + 2, 32, "#fff", 900, "center");
    }

    function drawDivider(x, y, w) {
      const canvas = getDrawCanvas();
      if (!canvas) return;
      const theme = currentTheme();
      canvas.save();
      canvas.strokeStyle = withAlpha(theme.border, 0.7);
      canvas.lineWidth = 2;
      canvas.beginPath();
      canvas.moveTo(x, y);
      canvas.lineTo(x + w, y);
      canvas.stroke();
      canvas.restore();
    }

    function shadowHint(x, y, w, h, color) {
      const canvas = getDrawCanvas();
      if (!canvas) return;
      canvas.save();
      canvas.shadowColor = color;
      canvas.shadowBlur = 18;
      canvas.shadowOffsetY = 8;
      canvas.strokeStyle = "rgba(255,255,255,0.1)";
      canvas.strokeRect(x + 2, y + 2, w - 4, h - 4);
      canvas.restore();
    }

    function roundedRect(canvas, x, y, w, h, radius, fill, stroke, lineWidth = 1) {
      if (!canvas) return;
      const r = Math.min(radius, w / 2, h / 2);
      canvas.save();
      canvas.beginPath();
      canvas.moveTo(x + r, y);
      canvas.lineTo(x + w - r, y);
      canvas.quadraticCurveTo(x + w, y, x + w, y + r);
      canvas.lineTo(x + w, y + h - r);
      canvas.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      canvas.lineTo(x + r, y + h);
      canvas.quadraticCurveTo(x, y + h, x, y + h - r);
      canvas.lineTo(x, y + r);
      canvas.quadraticCurveTo(x, y, x + r, y);
      canvas.closePath();
      if (fill && fill !== "transparent") {
        canvas.fillStyle = fill;
        canvas.fill();
      }
      if (stroke && stroke !== "transparent" && lineWidth > 0) {
        canvas.strokeStyle = stroke;
        canvas.lineWidth = lineWidth;
        canvas.stroke();
      }
      canvas.restore();
    }

    function circle(canvas, x, y, radius, fill, stroke, lineWidth = 1) {
      if (!canvas) return;
      canvas.save();
      canvas.beginPath();
      canvas.arc(x, y, radius, 0, Math.PI * 2);
      if (fill) {
        canvas.fillStyle = fill;
        canvas.fill();
      }
      if (stroke && lineWidth > 0) {
        canvas.strokeStyle = stroke;
        canvas.lineWidth = lineWidth;
        canvas.stroke();
      }
      canvas.restore();
    }

    function write(text, x, y, size, color, weight = 500, align = "left") {
      const canvas = getDrawCanvas();
      if (!canvas) return;
      canvas.save();
      canvas.font = `${weight} ${size}px Arial, "Microsoft YaHei", sans-serif`;
      canvas.textAlign = align;
      canvas.textBaseline = "middle";
      canvas.fillStyle = color;
      canvas.fillText(text, x, y);
      canvas.restore();
    }

    return { load, run, click, unload, exit };
  })();

  function registerSettingsUI() {
    if (settingsRegistered || typeof W.PreferenceRegisterExtensionSetting !== "function") return false;
    W.PreferenceRegisterExtensionSetting({
      Identifier: MOD_ID,
      ButtonText: "猫娘设置",
      Image: "Icons/Chat.png",
      load: () => NekoSettingsUI.load(),
      run: () => NekoSettingsUI.run(),
      click: () => NekoSettingsUI.click(),
      unload: () => NekoSettingsUI.unload(),
      exit: () => NekoSettingsUI.exit(),
    });
    settingsRegistered = true;
    console.log("[BC 猫娘增强] 扩展组件设置页已注册");
    return true;
  }

  function cycleActionTargetMode() {
    const modes = [ACTION_TARGET_MODE.AUTO, ACTION_TARGET_MODE.PICKER, ACTION_TARGET_MODE.SELF];
    const index = modes.indexOf(config.actionTargetMode);
    config.actionTargetMode = modes[(index + 1) % modes.length];
    saveConfig();
  }

  function targetModeLabel() {
    if (config.actionTargetMode === ACTION_TARGET_MODE.PICKER) return "手动选择";
    if (config.actionTargetMode === ACTION_TARGET_MODE.SELF) return "只对自己";
    return "自动目标";
  }

    function drawText(text, x, y, color, backColor = "", size = 28) {
      const canvas = getDrawCanvas();
      if (!canvas || typeof W.DrawText !== "function") return;
      const prevFont = canvas.font;
      const nextFont = typeof prevFont === "string" && /\d+px/.test(prevFont)
        ? prevFont.replace(/\d+px/, `${Math.round(size * 1.2)}px`)
        : `${Math.round(size * 1.2)}px Arial`;
      canvas.font = nextFont;
      W.DrawText(text, x, y, color, backColor);
      canvas.font = prevFont;
    }

    function drawLabel(text, x, y, maxWidth, color, size = 24) {
      const canvas = getDrawCanvas();
      if (!canvas || typeof W.DrawTextFit !== "function") return;
      const prevAlign = canvas.textAlign;
      const prevFont = canvas.font;
      canvas.textAlign = "left";
      const nextFont = typeof prevFont === "string" && /\d+px/.test(prevFont)
        ? prevFont.replace(/\d+px/, `${Math.round(size * 1.2)}px`)
        : `${Math.round(size * 1.2)}px Arial`;
      canvas.font = nextFont;
      W.DrawTextFit(text, x, y, maxWidth, color);
      canvas.textAlign = prevAlign;
      canvas.font = prevFont;
    }

    function getDrawCanvas() {
      const canvas = W.MainCanvas;
      if (canvas && typeof canvas.save === "function" && typeof canvas.restore === "function") return canvas;
      if (canvas && typeof canvas.getContext === "function") {
        const ctx = canvas.getContext("2d");
        if (ctx && typeof ctx.save === "function") return ctx;
      }
      const el = document.getElementById("MainCanvas");
      const ctx = el?.getContext?.("2d");
      if (ctx && typeof ctx.save === "function") return ctx;
      return null;
    }

  function sectionTitle(text, x, y) {
    drawText(`— ${text} —`, x, y, "#e84f91", "#ffe1ed", 30);
  }

  function drawButton(x, y, w, h, text, color) {
    W.DrawButton?.(x, y, w, h, text, color, "", "");
  }

  function installStyles() {
    addStyle(`
      body {
        --bcn-soft: #fff1f6;
        --bcn-panel: #ffffff;
        --bcn-accent: #f65086;
        --bcn-border: #ffd4e2;
        --bcn-text: #8a3f5b;
        --bcn-muted: #9d7a86;
        --bcn-icon: #f65086;
        --bcn-glow: rgba(246, 80, 134, 0.22);
      }

      body.bcn-enabled #MainCanvas {
        filter: saturate(1.06) brightness(1.03);
      }

      #bcn-soft-paws {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 8;
        overflow: hidden;
      }

      body:not(.bcn-enabled) #bcn-soft-paws {
        display: none !important;
      }

      #bcn-soft-paws span {
        position: absolute;
        opacity: 0.14;
        color: var(--bcn-icon);
        font-size: 54px;
        text-shadow: 0 8px 24px var(--bcn-glow);
      }

      #bcn-panel {
        position: fixed;
        right: 18px;
        bottom: 18px;
        z-index: 100000;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 8px;
        width: fit-content;
        height: fit-content;
        padding: 6px 8px;
        border: 2px solid var(--bcn-border);
        border-radius: 16px;
        background: var(--bcn-panel);
        box-shadow: 0 10px 28px var(--bcn-glow);
        backdrop-filter: blur(8px);
        cursor: grab;
        transition: gap 0.22s ease;
      }

      body.bcn-menu-collapsed #bcn-panel {
        gap: 0;
      }

      #bcn-panel.is-dragging {
        user-select: none;
        cursor: grabbing;
      }

      .bcn-btn,
      .bcn-wheel-btn {
        min-width: 42px;
        min-height: 42px;
        border: 2px solid var(--bcn-border);
        border-radius: 14px;
        background: linear-gradient(180deg, var(--bcn-panel) 0%, var(--bcn-soft) 100%);
        color: var(--bcn-text);
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 3px 0 var(--bcn-glow);
      }

      #bcn-submenu {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 8px;
        max-width: 130px;
        opacity: 1;
        transform: translateX(0) scale(1);
        overflow: hidden;
        transition: max-width 0.22s ease, opacity 0.22s ease, transform 0.22s ease;
        pointer-events: auto;
      }

      body.bcn-menu-collapsed #bcn-submenu {
        max-width: 0;
        opacity: 0;
        transform: translateX(-8px) scale(0.96);
        pointer-events: none;
      }

      #bcn-main-cat,
      #bcn-wheel-handle,
      #bcn-face {
        width: 52px;
        height: 52px;
        min-width: 52px;
        min-height: 52px;
        font-size: 25px;
      }

      .bcn-btn:hover,
      .bcn-wheel-btn:hover {
        transform: translateY(-1px);
        background: var(--bcn-soft);
      }

      .bcn-wheel-wrap {
        position: absolute;
        right: 8px;
        bottom: calc(100% + 8px);
        overflow: hidden;
        max-width: 0;
        padding: 0;
        border: 2px solid var(--bcn-border);
        border-radius: 16px;
        background: var(--bcn-panel);
        box-shadow: 0 10px 28px var(--bcn-glow);
        backdrop-filter: blur(8px);
        transition: max-width 0.22s ease, opacity 0.22s ease, transform 0.22s ease, padding 0.22s ease;
        opacity: 0;
        transform: translateY(8px) scale(0.96);
        pointer-events: none;
      }

      body.bcn-wheel-on .bcn-wheel-wrap {
        max-width: 560px;
        padding: 12px;
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }

      .bcn-wheel-wrap,
      .bcn-wheel-btn,
      .bcn-wheel-blank {
        transition: max-width 0.22s ease, opacity 0.22s ease, transform 0.22s ease, filter 0.22s ease, padding 0.22s ease;
      }

      #bcn-wheel {
        display: none;
        grid-template-columns: repeat(3, minmax(82px, 1fr));
        gap: 10px;
        width: min(58vw, 360px);
        max-width: 360px;
        align-items: center;
      }

      body.bcn-wheel-on #bcn-wheel,
      body.bcn-wheel-on .bcn-wheel-wrap #bcn-wheel {
        display: grid;
      }

      body.bcn-wheel-on .bcn-wheel-btn,
      body.bcn-wheel-on .bcn-wheel-blank {
        animation: bcn-pop 0.24s ease both;
        animation-delay: calc(var(--i, 0) * 0.04s);
      }

      body.bcn-wheel-collapsed .bcn-wheel-wrap {
        max-width: 0;
        padding: 0;
        opacity: 0;
        transform: translateY(8px) scale(0.96);
        pointer-events: none;
      }

      #bcn-face.is-active {
        outline: 3px solid var(--bcn-glow);
        background: linear-gradient(180deg, var(--bcn-panel) 0%, var(--bcn-soft) 100%);
      }

      .bcn-wheel-btn {
        min-width: 0;
        min-height: 58px;
        padding: 0 14px;
        font-size: 19px;
      }

      .bcn-wheel-blank {
        min-height: 58px;
        border: 2px solid var(--bcn-border);
        border-radius: 14px;
        background: linear-gradient(180deg, var(--bcn-panel) 0%, var(--bcn-soft) 100%);
        box-shadow: inset 0 0 0 1px rgba(255,255,255,0.52), 0 3px 0 var(--bcn-glow);
        pointer-events: none;
      }

      body.bcn-wheel-collapsed .bcn-wheel-btn,
      body.bcn-wheel-collapsed .bcn-wheel-blank {
        opacity: 0;
        transform: translateX(-10px) scale(0.92);
        filter: blur(0.5px);
        pointer-events: none;
      }

      @keyframes bcn-pop {
        0% {
          opacity: 0;
          transform: translateX(-10px) scale(0.92);
        }
        70% {
          opacity: 1;
          transform: translateX(2px) scale(1.03);
        }
        100% {
          opacity: 1;
          transform: translateX(0) scale(1);
        }
      }

      #bcn-kaomoji-picker {
        position: absolute;
        right: 0;
        bottom: calc(100% + 10px);
        width: min(420px, calc(100vw - 24px));
        max-height: min(420px, calc(100vh - 120px));
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 10px;
        border: 2px solid var(--bcn-border);
        border-radius: 16px;
        background: var(--bcn-panel);
        box-shadow: 0 14px 32px var(--bcn-glow), 0 2px 10px rgba(80, 40, 60, 0.12);
        backdrop-filter: blur(10px);
        opacity: 0;
        transform: translateY(8px) scale(0.96);
        transform-origin: right bottom;
        pointer-events: none;
        transition: opacity 0.2s ease, transform 0.2s ease;
      }

      #bcn-kaomoji-picker.is-open {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }

      .bcn-kaomoji-tabs {
        display: flex;
        gap: 6px;
        max-width: 100%;
        overflow-x: auto;
        padding: 0 0 4px;
        scrollbar-width: thin;
      }

      .bcn-kaomoji-tab,
      .bcn-kaomoji-item {
        border: 2px solid var(--bcn-border);
        border-radius: 12px;
        background: linear-gradient(180deg, var(--bcn-panel) 0%, var(--bcn-soft) 100%);
        color: var(--bcn-text);
        cursor: pointer;
        box-shadow: 0 2px 0 var(--bcn-glow);
      }

      .bcn-kaomoji-tab {
        flex: 0 0 auto;
        min-height: 30px;
        padding: 0 10px;
        font-size: 13px;
        font-weight: 700;
        white-space: nowrap;
      }

      .bcn-kaomoji-tab.is-active {
        border-color: var(--bcn-accent);
        background: linear-gradient(180deg, var(--bcn-panel) 0%, var(--bcn-soft) 100%);
        color: var(--bcn-accent);
      }

      .bcn-kaomoji-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(118px, 1fr));
        gap: 8px;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 2px 4px 4px 2px;
        scrollbar-width: thin;
      }

      .bcn-kaomoji-item {
        min-height: 42px;
        padding: 0 8px;
        font-size: 18px;
        font-family: "Segoe UI Emoji", "Noto Color Emoji", "Apple Color Emoji", "Meiryo", sans-serif;
        font-weight: 700;
        line-height: 1.1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        animation: bcn-pop 0.2s ease both;
        animation-delay: calc(var(--i, 0) * 0.012s);
      }

      .bcn-kaomoji-tab:hover,
      .bcn-kaomoji-item:hover {
        transform: translateY(-1px);
        background: var(--bcn-soft);
      }

      @media (max-width: 520px) {
        #bcn-kaomoji-picker {
          width: min(330px, calc(100vw - 16px));
          max-height: min(360px, calc(100vh - 96px));
        }

        .bcn-kaomoji-grid {
          grid-template-columns: repeat(auto-fill, minmax(94px, 1fr));
        }

        .bcn-kaomoji-item {
          font-size: 16px;
        }
      }

      #TextAreaChatLog {
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), var(--bcn-soft)) !important;
        border: 2px solid var(--bcn-border) !important;
        border-radius: 14px !important;
        padding: 8px !important;
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.85), 0 8px 22px var(--bcn-glow);
      }

      #chat-room-bot,
      #chat-room-reply-indicator > * {
        border: 2px solid var(--bcn-border) !important;
        border-radius: 14px !important;
        background: rgba(255, 255, 255, 0.96) !important;
        color: var(--bcn-text) !important;
        box-shadow: 0 6px 18px var(--bcn-glow);
      }

      #chat-room-bot:has(#InputChat:focus) {
        outline: 2px solid var(--bcn-accent) !important;
        box-shadow: 0 0 0 4px var(--bcn-glow) !important;
      }

      #InputChat {
        padding: 12px 16px !important;
        color: var(--bcn-text) !important;
      }

      #InputChat::placeholder {
        color: var(--bcn-muted) !important;
      }

      #chat-room-send::before {
        background-image: none !important;
        mask-image: none !important;
        content: "🐾";
        color: var(--bcn-icon);
        font-size: 1.4em;
        display: grid;
        place-items: center;
      }

      #TextAreaChatLog .ChatMessage {
        margin: 7px 6px !important;
        padding: 9px 54px 9px 14px !important;
        border: 2px solid var(--bcn-border);
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.78) !important;
        color: var(--bcn-text);
        box-shadow: 0 4px 12px var(--bcn-glow);
      }

      #TextAreaChatLog .ChatMessage::after {
        content: "🐾";
        position: absolute;
        right: 12px;
        bottom: 5px;
        opacity: 0.55;
        color: var(--bcn-icon);
      }

      #TextAreaChatLog .bcn-own-message {
        border-color: var(--bcn-accent) !important;
        background: linear-gradient(90deg, var(--bcn-soft), rgba(255, 255, 255, 0.9)) !important;
      }

      #TextAreaChatLog .bcn-own-message::before {
        content: "🐾";
        position: absolute;
        left: -9px;
        top: -9px;
        width: 25px;
        height: 25px;
        display: grid;
        place-items: center;
        border-radius: 999px;
        background: #fff;
        border: 2px solid var(--bcn-accent);
        box-shadow: 0 4px 10px var(--bcn-glow);
      }

      #TextAreaChatLog .ChatMessageWhisper {
        border-color: #69aef7 !important;
        background: linear-gradient(90deg, rgba(235, 246, 255, 0.96), rgba(255, 255, 255, 0.88)) !important;
        color: #1c5c9c !important;
      }

      #TextAreaChatLog .ChatMessageEmote,
      #TextAreaChatLog .ChatMessageAction,
      #TextAreaChatLog .ChatMessageActivity {
        margin: 4px 8px !important;
        padding: 2px 42px 2px 10px !important;
        border: none !important;
        border-radius: 0 !important;
        background: transparent !important;
        box-shadow: none !important;
        color: var(--bcn-muted) !important;
        font-style: normal !important;
        font-size: 0.94em !important;
      }

      #TextAreaChatLog .ChatMessageEmote::after,
      #TextAreaChatLog .ChatMessageAction::after,
      #TextAreaChatLog .ChatMessageActivity::after {
        content: none !important;
      }

      #TextAreaChatLog .ChatMessageEmote .ChatMessageName,
      #TextAreaChatLog .ChatMessageAction .ChatMessageName,
      #TextAreaChatLog .ChatMessageActivity .ChatMessageName {
        color: var(--bcn-muted) !important;
      }

      #TextAreaChatLog .ChatMessageName {
        color: var(--label-color, var(--bcn-text)) !important;
        -webkit-text-stroke: 0.45px rgba(61, 82, 86, 0.58);
        paint-order: stroke fill;
        text-shadow:
          0 0 1px rgba(61, 82, 86, 0.72),
          0 1px 2px rgba(61, 82, 86, 0.3),
          0 0 6px rgba(255, 255, 255, 0.28) !important;
        font-weight: 800;
      }

      #TextAreaChatLog .bcn-relation-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 1.15em;
        margin-right: 0.2em;
        font-size: 0.92em;
        vertical-align: baseline;
      }

      #TextAreaChatLog .bcn-related-owner {
        border-color: #f2d087 !important;
        box-shadow: 0 4px 14px rgba(232, 184, 88, 0.16);
      }

      #TextAreaChatLog .bcn-related-owner .ChatMessageName {
        color: #af7f22 !important;
      }

      #TextAreaChatLog .bcn-related-owner .bcn-relation-badge {
        color: #dfb24c;
        text-shadow: 0 1px 0 #fff6df, 0 0 8px rgba(240, 191, 92, 0.24);
      }

      #TextAreaChatLog .bcn-related-lover .ChatMessageName {
        color: #d06b96 !important;
      }

      #TextAreaChatLog .bcn-related-lover .bcn-relation-badge {
        color: #f08db4;
        text-shadow: 0 1px 0 #fff4f8, 0 0 8px rgba(240, 141, 180, 0.2);
      }

      #TextAreaChatLog .bcn-related-dual {
        border-color: #e9be93 !important;
        box-shadow: 0 4px 16px rgba(232, 166, 120, 0.18);
      }

      #TextAreaChatLog .bcn-related-dual .ChatMessageName {
        color: #c68463 !important;
      }

      #TextAreaChatLog .bcn-related-dual .bcn-relation-badge {
        color: #d88b8b;
        text-shadow: 0 1px 0 #fff6f8, 0 0 8px rgba(226, 169, 119, 0.22);
      }

      body.bcn-enabled input,
      body.bcn-enabled textarea,
      body.bcn-enabled select {
        border: 2px solid var(--bcn-border) !important;
        border-radius: 10px !important;
        background-color: rgba(255, 255, 255, 0.96) !important;
        color: var(--bcn-text) !important;
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.8);
      }

      body.bcn-enabled button:not(.bcn-btn):not(.bcn-wheel-btn):not(.bcn-kaomoji-tab):not(.bcn-kaomoji-item),
      body.bcn-enabled .button {
        border-radius: 10px !important;
      }

      #bcn-target-picker {
        position: fixed;
        right: 18px;
        bottom: 82px;
        z-index: 100003;
        min-width: 168px;
        max-width: min(320px, 78vw);
        padding: 10px;
        display: grid;
        gap: 7px;
        border: 2px solid var(--bcn-border);
        border-radius: 14px;
        background: var(--bcn-panel);
        box-shadow: 0 14px 32px var(--bcn-glow);
        color: var(--bcn-text);
        font-weight: 700;
      }

      .bcn-target-title {
        padding: 2px 6px 5px;
        color: var(--bcn-accent);
        text-align: center;
        font-size: 14px;
      }

      #bcn-target-picker button {
        min-height: 34px;
        padding: 5px 9px;
        border: 1px solid var(--bcn-border);
        border-radius: 10px;
        background: var(--bcn-panel);
        color: var(--bcn-text);
        font-weight: 700;
        cursor: pointer;
      }

      #bcn-target-picker button:hover {
        background: var(--bcn-soft);
      }

      #bcn-toast {
        position: fixed;
        left: 50%;
        bottom: 92px;
        z-index: 100001;
        transform: translateX(-50%) translateY(16px);
        opacity: 0;
        padding: 10px 20px;
        border: 2px solid var(--bcn-border);
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.94);
        color: var(--bcn-accent);
        font-size: 22px;
        font-weight: 800;
        box-shadow: 0 12px 28px var(--bcn-glow);
        transition: opacity 0.22s ease, transform 0.22s ease;
        pointer-events: none;
      }

      #bcn-toast.show {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }

      .bcn-rain-drop {
        position: fixed;
        top: -48px;
        z-index: 100002;
        pointer-events: none;
        color: var(--bcn-icon);
        text-shadow: 0 3px 10px var(--bcn-glow);
        animation-name: bcn-rain-fall;
        animation-timing-function: linear;
        animation-fill-mode: forwards;
      }

      @keyframes bcn-rain-fall {
        0% {
          transform: translateY(-60px) rotate(0deg);
          opacity: 0;
        }
        8% {
          opacity: 0.92;
        }
        100% {
          transform: translateY(112vh) rotate(360deg);
          opacity: 0;
        }
      }
    `);
  }

  function init() {
    installStyles();
    createPanel();
    registerModSdk();
    loadRemoteActionLibrary();
    loadRemoteKaomojiLibrary();
    bindVisibilityLifecycle();
    syncScreenClass();

    const patchTimer = setInterval(() => {
      const chatReady = patchBC();
      const badgeReady = patchStatusBadge();
      const roomReady = patchRoomEffects();
      if (chatReady && badgeReady && roomReady) {
        clearInterval(patchTimer);
        startMaintenance();
      }
      runMaintenance();
    }, 800);

    console.log("[BC ??????] ?????");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
