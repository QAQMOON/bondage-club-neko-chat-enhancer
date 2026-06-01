// ==UserScript==
// @name         Bondage Club 猫娘聊天室增强（测试版）
// @namespace    https://penyo.ru/
// @version      3.0.0
// @description  Bondage Club 猫娘增强动态加载测试版；刷新游戏时自动拉取 GitHub 最新测试主体
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
// @downloadURL  https://github.com/QAQMOON/meow-/raw/main/bondage-club-neko-dev.user.js
// @updateURL    https://github.com/QAQMOON/meow-/raw/main/bondage-club-neko-dev.user.js
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

  const CHANNEL = "dev";
  const RUNTIME_URL = "https://raw.githubusercontent.com/QAQMOON/meow-/main/dist/bondage-club-neko.dev.runtime.js";
  const CACHE_KEY = "bcNekoEnhancer.runtimeCache.dev";

  function log(message, detail) {
    console.log(`[BC 猫娘增强 loader/${CHANNEL}] ${message}`, detail || "");
  }

  function warn(message, detail) {
    console.warn(`[BC 猫娘增强 loader/${CHANNEL}] ${message}`, detail || "");
  }

  function requestText(url) {
    const nextUrl = `${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`;
    if (typeof GM_xmlhttpRequest === "function") {
      return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
          method: "GET",
          url: nextUrl,
          timeout: 12000,
          onload: (response) => {
            if (response.status >= 200 && response.status < 300) resolve(response.responseText);
            else reject(new Error(`HTTP ${response.status}`));
          },
          onerror: () => reject(new Error("network error")),
          ontimeout: () => reject(new Error("timeout")),
        });
      });
    }
    return fetch(nextUrl, { cache: "no-store" }).then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.text();
    });
  }

  function readCache() {
    try {
      return localStorage.getItem(CACHE_KEY) || "";
    } catch {
      return "";
    }
  }

  function writeCache(code) {
    try {
      localStorage.setItem(CACHE_KEY, code);
    } catch {
      // Runtime still executes even when storage is unavailable.
    }
  }

  function runRuntime(code, source) {
    if (!code || !code.trim()) throw new Error("empty runtime");
    log(`执行${source}插件主体`);
    new Function(code)();
  }

  function showFailure(error) {
    warn("插件主体加载失败", error);
    const show = () => {
      const box = document.createElement("div");
      box.textContent = "猫娘测试版加载失败，请检查 GitHub 连接或稍后刷新。";
      box.style.cssText = [
        "position:fixed",
        "right:18px",
        "bottom:18px",
        "z-index:100000",
        "padding:10px 14px",
        "border:2px solid #ff8fbd",
        "border-radius:12px",
        "background:#fff5f9",
        "color:#7d405c",
        "font-weight:700",
        "box-shadow:0 8px 22px rgba(255,143,189,.24)",
      ].join(";");
      document.body?.appendChild(box);
      setTimeout(() => box.remove(), 7000);
    };
    if (document.body) show();
    else document.addEventListener("DOMContentLoaded", show, { once: true });
  }

  requestText(RUNTIME_URL)
    .then((code) => {
      writeCache(code);
      runRuntime(code, "远程最新");
    })
    .catch((error) => {
      const cached = readCache();
      if (cached) {
        warn("远程加载失败，改用上次缓存", error);
        runRuntime(cached, "缓存");
        return;
      }
      showFailure(error);
    });
})();
