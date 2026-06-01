// ==UserScript==
// @name         Bondage Club 猫娘聊天室增强
// @namespace    https://penyo.ru/
// @version      2.9.0
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
// @downloadURL  https://github.com/QAQMOON/meow-/raw/main/bondage-club-neko.user.js
// @updateURL    https://github.com/QAQMOON/meow-/raw/main/bondage-club-neko.user.js
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
  const VERSION = "2.9.0";
  const STORE_KEY = "bcNekoEnhancer.config.v2";
  const MOD_SDK_URL = "https://cdn.jsdelivr.net/npm/bondage-club-mod-sdk@1.2.0/dist/bcmodsdk.js";
  const ACTION_LIBRARY_URL = "https://raw.githubusercontent.com/QAQMOON/meow-/main/actions/catgirl-actions.json";
  const ACTION_LIBRARY_CACHE_KEY = "bcNekoEnhancer.actionLibrary.v1";
  const KAOMOJI_LIBRARY_URL = "https://raw.githubusercontent.com/QAQMOON/meow-/main/kaomoji/cute-kaomoji.json";
  const KAOMOJI_LIBRARY_CACHE_KEY = "bcNekoEnhancer.kaomojiLibrary.v1";
  const DEFAULT_KAOMOJI = ["(=^･ω･^=)", "ฅ(•ㅅ•❀)ฅ", "(=｀ω´=)", "(ฅ´ω`ฅ)", "(=^･ｪ･^=)"];
  const ACTION_TARGET_MODE = {
    AUTO: "auto",
    PICKER: "picker",
    SELF: "self",
  };

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
  let patched = false;
  let bcModApi = null;
  let sdkLoadingPromise = null;
  let settingsRegistered = false;
  let toastTimer = 0;
  let activeKaomojiGroup = "all";

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
    status: () => ({ patched, sdk: !!bcModApi, enabled: config.enabled, screen: W.CurrentScreen, url: location.href }),
  };

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
          fullName: "Bondage Club 猫娘聊天室增强",
          version: VERSION,
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

  function convertByType(type, text) {
    if (!config.enabled || !text) return text;
    if (type === "Whisper") return whisperNeko(text);
    if (type === "Emote") return emoteNeko(text);
    if (type === "Action" || type === "Activity") return actionNeko(text);
    if (type === "Chat") return standardNeko(text);
    return text;
  }

  function shouldConvertDisplay(data, msg) {
    if (!config.enabled || !config.convertDisplayed || !msg) return false;
    const type = data?.Type;
    if (type === "Whisper" && String(msg).startsWith("悄悄喵~")) return false;
    if ((type === "Action" || type === "Activity") && /喵喵[）)]?$/.test(String(msg))) return false;
    if (type === "Emote" && hasKnownKaomoji(String(msg))) return false;
    return ["Chat", "Whisper", "Emote", "Action", "Activity"].includes(type);
  }

  function isOwnSender(sender) {
    return Number(sender) === Number(W.Player?.MemberNumber);
  }

  function decorateMessage(div, data) {
    if (!div || processedMessages.has(div)) return div;
    processedMessages.add(div);

    const type = data?.Type || [...div.classList].find((name) => name.startsWith("ChatMessage"))?.replace("ChatMessage", "");
    div.dataset.bcnType = type || "Unknown";

    if (isOwnSender(data?.Sender || div.dataset.sender)) {
      div.classList.add("bcn-own-message");
    }

    if (config.decorateChat) {
      div.classList.add("bcn-card-message");
    }

    return div;
  }

  function patchBC() {
    if (patched || !bcModApi || !W.ChatRoomGenerateChatRoomChatMessage || !W.ChatRoomMessageDisplay || !W.ServerSend) return false;
    patched = true;

    bcModApi.hookFunction("ChatRoomGenerateChatRoomChatMessage", 0, (args, next) => {
      const [type, msg, replyId] = args;
      const nextMsg = config.convertOutgoing ? convertByType(type, msg) : msg;
      return next([type, nextMsg, replyId]);
    });

    bcModApi.hookFunction("ChatRoomMessageDisplay", 0, (args, next) => {
      const [data, msg, senderCharacter, metadata] = args;
      const nextMsg = shouldConvertDisplay(data, msg) ? convertByType(data?.Type, msg) : msg;
      const div = next([data, nextMsg, senderCharacter, metadata]);
      decorateMessage(div, data);
      if (config.notifyIncoming && data?.Sender && !isOwnSender(data.Sender) && ["Chat", "Whisper"].includes(data.Type)) {
        showToast(data.Type === "Whisper" ? "悄悄喵~ 有私聊来了！" : "喵~ 新消息来啦！");
      }
      return div;
    });

    bcModApi.hookFunction("ServerSend", 0, (args, next) => {
      const [message, payload] = args;
      if (message === "ChatRoomChat" && config.enabled && config.rainOnSend) {
        const type = payload?.Type;
        if (["Chat", "Whisper", "Emote", "Action"].includes(type)) pawRain(type);
      }
      return next(args);
    });

    console.log("[BC 猫娘增强] 已通过 BC Mod SDK 接入聊天函数喵~");
    return true;
  }

  function decorateExistingChat() {
    document.querySelectorAll("#TextAreaChatLog .ChatMessage").forEach((div) => {
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
    window.open?.("https://github.com/QAQMOON/meow-/blob/main/actions/catgirl-actions.json", "_blank", "noopener");
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

  function installObserver() {
    const observer = new MutationObserver(() => decorateExistingChat());
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  const NekoSettingsUI = (() => {
    const checkboxSize = 58;
    const leftX = 155;
    const labelX = 235;
    const slider = { x: 1040, y: 405, w: 310, h: 18 };
    const rows = [
      ["convertOutgoing", 230, "转换发送语气（convertOutgoing）", "发送的消息自动转换为猫娘语气～"],
      ["convertDisplayed", 335, "转换显示语气（convertDisplayed）", "接收的消息也会变成猫娘语气哦～"],
      ["decorateChat", 505, "聊天室美化（decorateChat）", "美化聊天界面，添加猫娘风格装饰～"],
      ["rainOnSend", 610, "猫爪表情雨（rainOnSend）", "发送消息时下起猫爪表情雨～"],
      ["quickWheel", 715, "动作快捷轮盘（quickWheel）", "右下角显示抱抱、摸头、喂食动作～"],
      ["notifyIncoming", 860, "新消息通知（notifyIncoming）", "有新消息时显示通知提醒～"],
    ];

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
        drawLeftColumn();
        drawRightColumn();
      } catch (err) {
        console.error("[BCNekoSettings] render failed:", err);
      }
    }

    function click() {
      if (W.MouseIn?.(1815, 75, 90, 90)) {
        W.PreferenceExit?.();
        return;
      }

      for (const [key, y] of rows) {
        if (W.MouseIn?.(leftX, y, checkboxSize, checkboxSize)) {
          toggleConfig(key);
          return;
        }
      }

      if (W.MouseIn?.(slider.x - 12, slider.y - 28, slider.w + 130, 72)) {
        const mouseX = Number(W.MouseX ?? 0);
        config.nyanChance = clamp((mouseX - slider.x) / slider.w, 0, 1);
        saveConfig();
        return;
      }

      if (W.MouseIn?.(960, 315, checkboxSize, checkboxSize)) {
        toggleConfig("enabled");
        return;
      }

      if (W.MouseIn?.(1040, 610, 220, 58)) {
        cycleActionTargetMode();
        return;
      }

      if (W.MouseIn?.(1040, 700, 220, 58)) {
        editActions();
      }
    }

    function drawSettingsBackground() {
      const canvas = getDrawCanvas();
      if (!canvas) return;
      canvas.save();
      const gradient = canvas.createLinearGradient(0, 0, 2000, 1000);
      gradient.addColorStop(0, "#fff8fb");
      gradient.addColorStop(0.52, "#fffdfd");
      gradient.addColorStop(1, "#ffe7f0");
      canvas.fillStyle = gradient;
      canvas.fillRect(0, 0, 2000, 1000);
      canvas.strokeStyle = "rgba(255, 143, 189, 0.72)";
      canvas.lineWidth = 9;
      canvas.strokeRect(36, 32, 1928, 932);
      canvas.strokeStyle = "rgba(255, 194, 215, 0.72)";
      canvas.lineWidth = 3;
      canvas.strokeRect(54, 50, 1892, 896);
      canvas.restore();
    }

    function drawHeader() {
      W.DrawButton?.(1815, 75, 90, 90, "", "White", "Icons/Exit.png", "返回");
      drawText("猫娘聊天室增强", 1000, 112, "#8d4d67", "#ffe0ed", 40);
      drawText(`v${VERSION}`, 1222, 135, "#b98095", "", 24);
      drawText("🐾", 665, 122, "#ff8fbd", "", 36);
      drawText("🐾", 1335, 122, "#ff8fbd", "", 36);
    }

    function drawLeftColumn() {
      sectionTitle("猫娘语气转换", 395, 200);
      sectionTitle("聊天相关", 350, 475);
      sectionTitle("通知与提醒", 360, 830);

      rows.forEach(([key, y, title, desc]) => {
        W.DrawCheckbox?.(leftX, y, checkboxSize, checkboxSize, "", !!config[key]);
        drawLabel(title, labelX, y + 28, 560, "#8d4d67", 27);
        drawLabel(desc, labelX, y + 66, 620, "#a47d89", 21);
      });
    }

    function drawRightColumn() {
      sectionTitle("行为设置", 1245, 250);
      W.DrawCheckbox?.(960, 315, checkboxSize, checkboxSize, "", config.enabled);
      drawLabel(`猫娘模式（enabled）`, 1040, 345, 520, "#d84686", 27);
      drawLabel(config.enabled ? "当前会转换语气并启用装饰～" : "当前暂停转换，只保留设置入口～", 1040, 382, 540, "#a47d89", 21);

      drawLabel("语气词插入概率（nyanChance）", 1040, 470, 540, "#8d4d67", 27);
      drawSlider();

      drawButton(1040, 610, 220, 58, targetModeLabel(), "#fff7fb");
      drawLabel("互动目标模式", 1280, 640, 440, "#8d4d67", 24);
      drawLabel("自动：优先当前选中角色，其次聊天目标。右键动作按钮可手动选择。", 1040, 690, 690, "#a47d89", 19);

      drawButton(1040, 700, 220, 58, "动作库", "#fff7fb");
      drawLabel("从 GitHub 动作库加载；失败时使用缓存或内置动作。", 1280, 730, 560, "#a47d89", 19);

      drawNekoPreview();
    }

    function drawSlider() {
      const canvas = getDrawCanvas();
      if (!canvas) return;
      const percent = Math.round(config.nyanChance * 100);
      canvas.save();
      canvas.fillStyle = "#ffd6e6";
      canvas.fillRect(slider.x, slider.y, slider.w, slider.h);
      canvas.fillStyle = "#ff78ad";
      canvas.fillRect(slider.x, slider.y, slider.w * config.nyanChance, slider.h);
      canvas.strokeStyle = "#ff8fbd";
      canvas.lineWidth = 3;
      canvas.strokeRect(slider.x, slider.y, slider.w, slider.h);
      canvas.beginPath();
      canvas.arc(slider.x + slider.w * config.nyanChance, slider.y + slider.h / 2, 30, 0, Math.PI * 2);
      canvas.fillStyle = "#fff";
      canvas.fill();
      canvas.stroke();
      canvas.restore();
      drawText(`${percent}%`, 1425, 416, "#8d4d67", "", 26);
      drawLabel("很少", slider.x, slider.y + 65, 90, "#bf8a9d", 17);
      drawLabel("适中", slider.x + 138, slider.y + 65, 90, "#d84686", 17);
      drawLabel("很多", slider.x + 282, slider.y + 65, 90, "#bf8a9d", 17);
    }

    function drawNekoPreview() {
      drawText("ฅ^•ﻌ•^ฅ", 1530, 560, "#ff78ad", "#ffe4ef", 64);
      drawText("喵～", 1125, 555, "#d84686", "", 32);
      drawLabel("语气词让聊天更可爱哦～", 1040, 600, 420, "#8d4d67", 23);
      drawText("🐾", 1515, 690, "#ffb0cb", "", 52);
      drawText("💗", 1595, 745, "#ff8fbd", "", 45);
      drawText("🐱", 1665, 690, "#ff78ad", "", 58);
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
      body.bcn-enabled {
        --bcn-pink: #ff8fbd;
        --bcn-pink-soft: #ffe8f1;
        --bcn-blue: #69aef7;
        --bcn-ink: #5a4037;
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

      #bcn-soft-paws span {
        position: absolute;
        opacity: 0.14;
        color: #ff7aa9;
        font-size: 54px;
        text-shadow: 0 8px 24px rgba(255, 120, 170, 0.2);
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
        border: 2px solid rgba(255, 143, 189, 0.75);
        border-radius: 16px;
        background: rgba(255, 250, 252, 0.88);
        box-shadow: 0 10px 28px rgba(255, 143, 189, 0.28);
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
        border: 2px solid #ff9fc5;
        border-radius: 14px;
        background: linear-gradient(180deg, #fff 0%, #ffe8f1 100%);
        color: #8d4d67;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 3px 0 #f6b7ce;
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
        background: #fff5f9;
      }

      .bcn-wheel-wrap {
        position: absolute;
        right: 8px;
        bottom: calc(100% + 8px);
        overflow: hidden;
        max-width: 0;
        padding: 0;
        border: 2px solid rgba(255, 143, 189, 0.7);
        border-radius: 16px;
        background: rgba(255, 250, 252, 0.92);
        box-shadow: 0 10px 28px rgba(255, 143, 189, 0.24);
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
        outline: 3px solid rgba(178, 140, 255, 0.38);
        background: linear-gradient(180deg, #fff7fb 0%, #ffdce9 100%);
      }

      .bcn-wheel-btn {
        min-width: 0;
        min-height: 58px;
        padding: 0 14px;
        font-size: 19px;
      }

      .bcn-wheel-blank {
        min-height: 58px;
        border: 2px solid rgba(255, 159, 197, 0.64);
        border-radius: 14px;
        background: linear-gradient(180deg, rgba(255,255,255,0.72) 0%, rgba(255,232,241,0.54) 100%);
        box-shadow: inset 0 0 0 1px rgba(255,255,255,0.52), 0 3px 0 rgba(246, 183, 206, 0.55);
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
        border: 2px solid rgba(255, 143, 189, 0.78);
        border-radius: 16px;
        background: rgba(255, 250, 252, 0.96);
        box-shadow: 0 14px 32px rgba(255, 143, 189, 0.26), 0 2px 10px rgba(80, 40, 60, 0.12);
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
        border: 2px solid rgba(255, 159, 197, 0.82);
        border-radius: 12px;
        background: linear-gradient(180deg, #fff 0%, #fff1f7 100%);
        color: #7d405c;
        cursor: pointer;
        box-shadow: 0 2px 0 rgba(246, 183, 206, 0.92);
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
        border-color: #b28cff;
        background: linear-gradient(180deg, #fff 0%, #f3e9ff 100%);
        color: #6d4bad;
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
        background: #fff5f9;
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
        background: linear-gradient(180deg, rgba(255, 251, 253, 0.96), rgba(255, 242, 248, 0.95)) !important;
        border: 2px solid #ff9fc5 !important;
        border-radius: 14px !important;
        padding: 8px !important;
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.85), 0 8px 22px rgba(255, 143, 189, 0.18);
      }

      #chat-room-bot,
      #chat-room-reply-indicator > * {
        border: 2px solid #ff9fc5 !important;
        border-radius: 14px !important;
        background: rgba(255, 252, 254, 0.96) !important;
        color: #5a4037 !important;
        box-shadow: 0 6px 18px rgba(255, 143, 189, 0.14);
      }

      #chat-room-bot:has(#InputChat:focus) {
        outline: 2px solid #ff7daf !important;
        box-shadow: 0 0 0 4px rgba(255, 180, 210, 0.35) !important;
      }

      #InputChat {
        padding: 12px 16px !important;
        color: #5a4037 !important;
      }

      #InputChat::placeholder {
        color: #b995a5 !important;
      }

      #chat-room-send::before {
        background-image: none !important;
        mask-image: none !important;
        content: "🐾";
        color: #ff6fa9;
        font-size: 1.4em;
        display: grid;
        place-items: center;
      }

      #TextAreaChatLog .ChatMessage {
        margin: 7px 6px !important;
        padding: 9px 54px 9px 14px !important;
        border: 2px solid rgba(255, 143, 189, 0.58);
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.78) !important;
        color: #5a4037;
        box-shadow: 0 4px 12px rgba(255, 143, 189, 0.12);
      }

      #TextAreaChatLog .ChatMessage::after {
        content: "🐾";
        position: absolute;
        right: 12px;
        bottom: 5px;
        opacity: 0.55;
        color: #ff7aa9;
      }

      #TextAreaChatLog .bcn-own-message {
        border-color: #ff5fa2 !important;
        background: linear-gradient(90deg, rgba(255, 241, 248, 0.96), rgba(255, 255, 255, 0.9)) !important;
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
        border: 2px solid #ff8fbd;
        box-shadow: 0 4px 10px rgba(255, 143, 189, 0.25);
      }

      #TextAreaChatLog .ChatMessageWhisper {
        border-color: #69aef7 !important;
        background: linear-gradient(90deg, rgba(235, 246, 255, 0.96), rgba(255, 255, 255, 0.88)) !important;
        color: #1c5c9c !important;
      }

      #TextAreaChatLog .ChatMessageEmote,
      #TextAreaChatLog .ChatMessageAction,
      #TextAreaChatLog .ChatMessageActivity {
        border-color: #ffb3ce !important;
        color: #8a6170 !important;
        font-style: normal !important;
      }

      #TextAreaChatLog .ChatMessageName {
        color: var(--label-color, #90526b) !important;
        text-shadow: 0 1px 0 #fff !important;
        font-weight: 800;
      }

      body.bcn-enabled input,
      body.bcn-enabled textarea,
      body.bcn-enabled select {
        border: 2px solid #e5b88f !important;
        border-radius: 10px !important;
        background-color: rgba(255, 252, 247, 0.95) !important;
        color: #3e2f2a !important;
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
        border: 2px solid #ff8fbd;
        border-radius: 14px;
        background: rgba(255, 252, 254, 0.97);
        box-shadow: 0 14px 32px rgba(255, 112, 170, 0.28);
        color: #8d4d67;
        font-weight: 700;
      }

      .bcn-target-title {
        padding: 2px 6px 5px;
        color: #d84686;
        text-align: center;
        font-size: 14px;
      }

      #bcn-target-picker button {
        min-height: 34px;
        padding: 5px 9px;
        border: 1px solid #ffbdd5;
        border-radius: 10px;
        background: #fff7fb;
        color: #8d4d67;
        font-weight: 700;
        cursor: pointer;
      }

      #bcn-target-picker button:hover {
        background: #ffe8f1;
      }

      #bcn-toast {
        position: fixed;
        left: 50%;
        bottom: 92px;
        z-index: 100001;
        transform: translateX(-50%) translateY(16px);
        opacity: 0;
        padding: 10px 20px;
        border: 2px solid #ff8fbd;
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.94);
        color: #ff4d91;
        font-size: 22px;
        font-weight: 800;
        box-shadow: 0 12px 28px rgba(255, 143, 189, 0.24);
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
        color: #ff70aa;
        text-shadow: 0 3px 10px rgba(255, 100, 160, 0.45);
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
    installObserver();
    syncScreenClass();

    const patchTimer = setInterval(() => {
      if (patchBC()) clearInterval(patchTimer);
      registerSettingsUI();
      decorateExistingChat();
      syncScreenClass();
    }, 800);

    setInterval(() => {
      registerSettingsUI();
      decorateExistingChat();
      syncScreenClass();
    }, 2000);

    console.log("[BC 猫娘增强] 启动喵~");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
