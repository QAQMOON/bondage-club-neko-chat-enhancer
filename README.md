# Bondage Club Neko Chat Enhancer

[中文版](README.zh-CN.md) | English

A catgirl-themed chat enhancer for Bondage Club.

## Features

- Auto-converts chat messages to catgirl speech style for both sender and receiver
- Chatroom beautification with paw decorations, emoji rain, and new message notifications
- Draggable cat menu in bottom-right corner with action wheel and kaomoji picker
- Quick actions (hug, pat, feed, cuddle, kiss) with auto-target, manual target, or self-only modes
- Remote action library and kaomoji library hosted on GitHub for easy expansion
- Extension settings panel with toggle switches, probability sliders, and theme color customization

## Preview

### Cute Catgirl-Themed Chatroom

Pink catgirl-themed chatroom that auto-converts sent messages to catgirl speech and beautifies local chat display. Paired with paw decorations, emoji rain, and handy kaomoji panel for cuter, smoother chatting, meow~

<!-- ![Cute Catgirl-Themed Chatroom](assets/preview-chat-kaomoji.png) -->

### Quick Action Wheel

Built-in quick actions like hug, pat, feed for daily interactions and RP use. Action templates support continuous expansion via remote GitHub action library, making it easier to add kiss, cuddle, and other actions later.

<!-- ![Quick Action Wheel](assets/preview-actions.png) -->

## Installation

### Recommended: FUSAM Add-on Manager

FUSAM Integration:
https://sidiousious.gitlab.io/bc-addon-loader/

Search for `BCNeko` or `Bondage Club Neko Chat Enhancer` in FUSAM add-on manager to enable/disable the catgirl plugin. FUSAM lets you manage multiple Bondage Club plugins in one place, ideal for long-term use.

### Userscript Installation

Alternatively, install Tampermonkey or another userscript manager, then choose a version to install:

Production version:
https://github.com/QAQMOON/bondage-club-neko-chat-enhancer/raw/main/bondage-club-neko.user.js

Dev version:
https://github.com/QAQMOON/bondage-club-neko-chat-enhancer/raw/main/bondage-club-neko-dev.user.js

Bug version:
https://github.com/QAQMOON/bondage-club-neko-chat-enhancer/raw/main/bondage-club-neko-bug.user.js

English version (UI localized):
https://github.com/QAQMOON/bondage-club-neko-chat-enhancer/raw/main/bondage-club-neko.en.user.js

The Bug version is recommended for userscript installation only, for testing experimental features like RP speech packs; it's not included in FUSAM. The English version has all UI text and settings translated to English.

## Updates

The plugin now uses dynamic loading. After installing the production, dev, or bug version entry script, every time you refresh the game or re-enter, it will automatically pull the latest plugin core from GitHub for that version.

- Production version loads `dist/bondage-club-neko.runtime.js`
- Dev version loads `dist/bondage-club-neko.dev.runtime.js`
- Bug version loads `dist/bondage-club-neko.bug.runtime.js`

If GitHub is temporarily unreachable, the plugin will try to use the last successfully loaded cached version. The loader entry script rarely changes; you only need to check for updates in your userscript manager when the entry script itself updates.

## Action Library

Action templates are stored at:

https://github.com/QAQMOON/bondage-club-neko-chat-enhancer/blob/main/actions/catgirl-actions.json

The plugin tries to load the action library from GitHub on startup; if loading fails, it uses the last cache, or built-in default actions if there's no cache.

To add a new action theme, append an item to the `actions` array:

```json
{
  “id”: “kiss”,
  “label”: “亲亲”,
  “enabled”: true,
  “self”: [
    “轻轻碰了碰自己的指尖，假装这是一个小小亲亲喵~”
  ],
  “target”: [
    “轻轻亲了亲 {target}，然后害羞地别过脸喵~”
  ]
}
```

`label` displays on the action wheel button; `self` is used when there's no target or acting on self; `target` is used when acting on another character.

## Kaomoji Library

Kaomoji library is stored at:

https://github.com/QAQMOON/bondage-club-neko-chat-enhancer/blob/main/kaomoji/cute-kaomoji.json

The plugin tries to load the kaomoji library from GitHub on startup; if loading fails, it uses the last cache, or built-in default cat kaomoji if there's no cache.

To add new kaomoji, append a string to the corresponding category's `items` array. To add a new category, append an item to the `groups` array:

```json
{
  “id”: “kiss”,
  “label”: “亲亲”,
  “enabled”: true,
  “items”: [
    “( ˘ ³˘)♥”,
    “(๑˘ ³˘๑)”
  ]
}
```

Setting `enabled` to `false` temporarily disables a category; the plugin randomly picks kaomoji from all enabled categories.

## Notes

This is a UI enhancement script for Bondage Club, not a standalone web app.
If you see the settings page in-game, look for “Catgirl Settings” under “Settings -> Extension Components” first.
