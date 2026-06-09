// ==UserScript==
// @name         Bondage Club Neko Chat Enhancer (English)
// @namespace    https://penyo.ru/
// @version      3.0.0-en
// @description  Bondage Club catgirl enhancer English version - dynamically loads the latest plugin core from GitHub on game refresh
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
// @downloadURL  https://github.com/QAQMOON/bondage-club-neko-chat-enhancer/raw/main/bondage-club-neko.en.user.js
// @updateURL    https://github.com/QAQMOON/bondage-club-neko-chat-enhancer/raw/main/bondage-club-neko.en.user.js
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

  const CHANNEL = "stable-en";
  const RUNTIME_URL = "https://raw.githubusercontent.com/QAQMOON/bondage-club-neko-chat-enhancer/main/dist/bondage-club-neko.en.runtime.js";
  const CACHE_KEY = "bcNekoEnhancer.runtimeCache.stable-en";

  function log(message, detail) {
    console.log(`[BC Neko Enhancer loader/${CHANNEL}] ${message}`, detail || "");
  }

  function warn(message, detail) {
    console.warn(`[BC Neko Enhancer loader/${CHANNEL}] ${message}`, detail || "");
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
    log(`Executing ${source} plugin core`);
    new Function(code)();
  }

  function showFailure(error) {
    warn("Plugin core failed to load", error);
    const show = () => {
      const box = document.createElement("div");
      box.textContent = "Catgirl plugin failed to load. Please check GitHub connection or refresh later.";
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
      runRuntime(code, "latest remote");
    })
    .catch((error) => {
      const cached = readCache();
      if (cached) {
        warn("Remote load failed, using last cache", error);
        runRuntime(cached, "cached");
        return;
      }
      showFailure(error);
    });
})();
