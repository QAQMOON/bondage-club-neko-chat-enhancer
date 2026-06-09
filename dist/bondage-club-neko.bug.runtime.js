// ==UserScript==
// @name         Bondage Club Neko Chat Enhancer (Bug)
// @namespace    https://penyo.ru/
// @version      2.10.7-bug.4
// @description  Bondage Club Bug猫娘 RP 语气包测试版
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
// @downloadURL  https://github.com/QAQMOON/bondage-club-neko-chat-enhancer/raw/main/bondage-club-neko-bug.user.js
// @updateURL    https://github.com/QAQMOON/bondage-club-neko-chat-enhancer/raw/main/bondage-club-neko-bug.user.js
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
  const CHANNEL = "bug";
  const VERSION = "2.10.7-bug.4";
  const STORE_KEY = "bcNekoEnhancer.config.v2.bug";
  const BUG_RP_STORE_KEY = "bcNekoEnhancer.bug.rp.v1";
  const MOD_SDK_URL = "https://cdn.jsdelivr.net/npm/bondage-club-mod-sdk@1.2.0/dist/bcmodsdk.js";
  const ACTION_LIBRARY_URL = "https://raw.githubusercontent.com/QAQMOON/bondage-club-neko-chat-enhancer/main/actions/catgirl-actions.json";
  const ACTION_LIBRARY_CACHE_KEY = "bcNekoEnhancer.actionLibrary.v1";
  const KAOMOJI_LIBRARY_URL = "https://raw.githubusercontent.com/QAQMOON/bondage-club-neko-chat-enhancer/main/kaomoji/cute-kaomoji.json";
  const KAOMOJI_LIBRARY_CACHE_KEY = "bcNekoEnhancer.kaomojiLibrary.v1";
  const RP_LIBRARY_URL = "https://raw.githubusercontent.com/QAQMOON/bondage-club-neko-chat-enhancer/main/rp/catgirl-rp-presets.json";
  const RP_LIBRARY_CACHE_KEY = "bcNekoEnhancer.rpLibrary.v1";
  const PEER_SIGNAL_CONTENT = "BCNekoEnhancer.Hello";
  const PEER_SIGNAL_INTERVAL = 45000;
  const PEER_TTL = 300000;
  const ATMOSPHERE_KEYWORDS = /喵|蹭蹭|蹭|贴贴|抱抱|摸摸|摸头|亲亲|ฅ|🐾|💗|💕|💖/i;
  const RP_TONE_PRESETS = {
    soft: {
      label: "软萌猫娘",
      suffix: "喵~",
      actionTarget: "{actor}轻轻靠过去，软乎乎地{verb}了{target}，尾巴开心地晃呀晃喵~",
      actionSelf: "{actor}软软地{verb}了自己一下，像小猫晒太阳一样眯起眼睛喵~",
    },
    classic: {
      label: "古风猫娘",
      suffix: "喵乎",
      actionTarget: "{actor}轻移莲步，{verb}{target}入怀，尾尖微晃，似是甚欢喵。",
      actionSelf: "{actor}垂眸轻笑，悄悄{verb}了自己一下，甚是安然喵。",
    },
    tsundere: {
      label: "傲娇猫娘",
      suffix: "哼喵",
      actionTarget: "{actor}别过脸去，装作漫不经心地{verb}了{target}，才、才不是特意的喵！",
      actionSelf: "{actor}哼了一声，勉强{verb}了自己一下，才不是需要安慰呢喵。",
    },
    polite: {
      label: "礼貌猫娘",
      suffix: "喵。",
      actionTarget: "{actor}温柔而克制地{verb}了{target}，希望能让对方安心一些喵。",
      actionSelf: "{actor}安静地{verb}了自己一下，认真整理好心情喵。",
    },
    simple: {
      label: "简洁猫娘",
      suffix: "喵",
      actionTarget: "{actor}{verb}了{target}喵。",
      actionSelf: "{actor}{verb}了自己喵。",
    },
  };
  const RP_TONE_ALIASES = {
    开: "on",
    关: "off",
    状态: "status",
    軟萌: "soft",
    软萌: "soft",
    软萌猫娘: "soft",
    古风: "classic",
    古风猫娘: "classic",
    傲娇: "tsundere",
    傲娇猫娘: "tsundere",
    礼貌: "polite",
    礼貌猫娘: "polite",
    简洁: "simple",
    简洁猫娘: "simple",
  };
  const DEFAULT_KAOMOJI = ["(=^･ω･^=)", "ฅ(•ㅅ•❀)ฅ", "(=｀ω´=)", "(ฅ´ω`ฅ)", "(=^･ｪ･^=)"];
  const ACTION_TARGET_MODE = {
    AUTO: "auto",
    PICKER: "picker",
    SELF: "self",
  };
  const ESCAPE_SKILL_NAMES = ["Bondage", "Dressage", "Evasion", "Infiltration", "LockPicking", "SelfBondage", "Willpower"];
  const ESCAPE_PICK_WINDOW_MS = 5000;
  const ESCAPE_DEFAULT_EASY_VALUE = 99;
  const SIGNATURE_TAILS = [" ฅ^•ﻌ•^ฅ", " (=^･ω･^=)", " ᓚ₍ ^. .^₎", " ~喵尾巴"];
  const RELATION_HINT_COOLDOWN = 8000;
  const HABIT_STORE_KEY = "bcNekoEnhancer.habitProfile.bug";
  const NEKO_SYSTEM_STORE_KEY = "bcNekoEnhancer.systemState.bug.v1";
  const TAIL_MOOD_MAX = 6;
  const AFFECTION_COMBO_WINDOW = 14000;
  const AFFECTION_REACTION_COOLDOWN = 7000;
  const REPLY_SUGGESTION_DURATION = 16000;
  const RECENT_CHAT_DECORATION_LIMIT = 80;
  const NEKO_SCENE_MEMORY_LIMIT = 12;
  const NEKO_SCENE_SPARK_DURATION = 22000;
  const NEKO_STATE_DURATION = 90000;
  const NEKO_EVENT_HISTORY_LIMIT = 40;
  const NEKO_VOICE_EFFECT_DURATION = 3600;
  const NEKO_VOICE_QUEUE_LIMIT = 4;
  const NEKO_VOICE_TRIGGER = /\[NekoVoice\]\s*(.*)/i;
  const NEKO_SENSITIVE_ZONES = ["ear", "tail", "nape", "chin", "belly", "general"];
  const AFFECTION_KEYWORDS = /(摸头|摸摸|抱抱|贴贴|亲亲|亲一口|蹭蹭|蹭)/;
  const REPLY_SUGGESTION_LIBRARY = [
    { pattern: /晚安|好梦|困困|睡觉/, replies: ["晚安喵，做个甜甜的梦呀", "猫猫也要缩进被窝啦，晚安喵", "睡醒再来贴贴喵"] },
    { pattern: /摸摸|摸头/, replies: ["给你蹭一下喵", "耳朵都被摸热啦喵", "再摸一下也可以喵"] },
    { pattern: /抱抱/, replies: ["抱住不撒爪喵", "给你一个软乎乎的抱抱喵", "已经贴过来啦喵"] },
    { pattern: /贴贴|蹭蹭|蹭/, replies: ["贴过去一点喵", "尾巴也想跟着蹭蹭喵", "好哦，给你贴贴喵"] },
    { pattern: /亲亲|亲一口/, replies: ["会害羞的喵", "偷偷回你一个小亲亲喵", "耳朵都红起来了喵"] },
  ];
  const NEKO_SCENE_SPARK_BLUEPRINTS = [
    scenePack("chat-link-check", "聊天链接确认", "WCE chat utilities", ["链接", "网址", "url", "http"], ["看到{target}提到链接，先轻轻提醒确认来源再点开喵。", "把链接旁边的小提醒放好，陪{target}慢慢看喵。"]),
    scenePack("chat-whisper-soften", "私聊柔化", "WCE whisper flow", ["私聊", "悄悄", "whisper"], ["把声音压低贴近{target}，只留给对方听见喵。", "悄悄向{target}眨眼，把话说得更轻一点喵。"]),
    scenePack("chat-mention-catch", "名字呼唤回应", "WCE mention helper", ["叫我", "名字", "喊你", "mention"], ["听见{target}叫到名字，耳朵立刻精神起来喵。", "把注意力转向{target}，乖乖回应一声喵。"]),
    scenePack("chat-anti-garble", "乱码安抚", "WCE anti-garble idea", ["乱码", "看不懂", "garble", "encoding"], ["歪头看着奇怪文字，贴心问{target}要不要重发一遍喵。", "把看不懂的话先收好，轻轻提醒可能乱码了喵。"]),
    scenePack("chat-copy-note", "聊天摘记", "WCE log helper", ["记录", "记一下", "note", "log"], ["认真把{target}的话记进小本本，尾巴一点一点晃喵。", "帮{target}把重点悄悄记住，之后不会忘喵。"]),
    scenePack("chat-translation-hint", "翻译提示", "WCE language helper", ["翻译", "英文", "中文", "translate"], ["靠近{target}小声确认意思，尽量不打断气氛喵。", "把难懂的词拆开想一想，再软软地回给{target}喵。"]),
    scenePack("chat-notify-return", "回来提醒", "WCE notification idea", ["回来了", "回来", "back"], ["看到{target}回来，尾巴开心地竖起来喵。", "轻轻敲敲空气，欢迎{target}回到房间喵。"]),
    scenePack("chat-afk-guard", "离开守候", "WCE AFK helper", ["afk", "离开", "等我", "挂机"], ["乖乖守在{target}旁边，等对方回来再继续喵。", "把位置暖好，等{target}回来时刚好能贴贴喵。"]),
    scenePack("chat-reply-thread", "上下文接话", "WCE reply helper", ["刚才", "上一句", "继续说", "thread"], ["把刚才的话题轻轻接住，等{target}继续讲喵。", "没有抢话，只把尾巴绕成一个认真听的弧度喵。"]),
    scenePack("chat-quiet-mode", "安静模式", "WCE quiet UX", ["安静", "小声", "quiet", "轻点"], ["把动作放慢，陪{target}进入安静一点的节奏喵。", "轻轻点头，把声音收成软软的一小团喵。"]),
    scenePack("room-owner-greet", "房主问候", "BC room context", ["房主", "owner", "主人开房"], ["向{target}礼貌点头，先把房间气氛闻一闻喵。", "乖巧问候{target}，等房间规则慢慢展开喵。"]),
    scenePack("room-entry-curtsy", "入房招呼", "BC room flow", ["进房", "刚来", "hello", "hi"], ["刚进房就轻轻挥爪，对{target}露出乖巧笑容喵。", "把尾巴收好，礼貌地向{target}打招呼喵。"]),
    scenePack("room-exit-soft", "离房告别", "BC room flow", ["再见", "走了", "bye", "下线"], ["轻轻向{target}挥爪告别，尾巴还舍不得地晃了晃喵。", "离开前把一句晚点见留给{target}喵。"]),
    scenePack("room-rule-check", "房规确认", "BC roleplay etiquette", ["规则", "房规", "rule"], ["认真读完规则，再乖乖向{target}确认可以这样玩喵。", "把房规记住，免得不小心踩到{target}的边界喵。"]),
    scenePack("room-theme-notice", "房间主题观察", "BC room background", ["主题", "背景", "场景", "background"], ["观察了一圈房间主题，悄悄把尾巴摆成合适的气氛喵。", "根据房间氛围靠近{target}，动作也变得更入戏喵。"]),
    scenePack("room-crowd-shy", "人多害羞", "BC room social", ["人好多", "热闹", "crowd"], ["看到房间变热闹，先贴近{target}身边躲一小下喵。", "耳朵因为人多抖了抖，但还是乖乖陪着{target}喵。"]),
    scenePack("room-empty-cozy", "空房陪伴", "BC room social", ["没人", "空房", "安静房"], ["房间安静下来，就把陪伴都留给{target}喵。", "趁着空房轻轻贴近，让气氛慢慢变暖喵。"]),
    scenePack("room-friend-spot", "好友发现", "BCTweaks friend-room idea", ["好友", "朋友", "friend"], ["发现熟悉的{target}，尾巴一下子开心地晃起来喵。", "向{target}靠近一点，像找到熟人一样安心喵。"]),
    scenePack("room-focus-target", "目标聚焦", "BC focus idea", ["看这里", "过来", "focus", "target"], ["把注意力认真交给{target}，眼神不乱飘喵。", "顺着{target}的示意靠过去，乖乖等下一步喵。"]),
    scenePack("room-activity-watch", "房间活动观察", "BC activity flow", ["活动", "动作", "activity"], ["看到动作开始，耳朵微微一动，认真观察{target}的反应喵。", "把房间里的动作节奏记下来，等适合的时候接话喵。"]),
    scenePack("state-gag-light", "轻堵嘴回应", "BC character state", ["轻堵", "gaglight", "含糊"], ["听见{target}有点含糊，马上把回应放慢一点喵。", "靠近{target}确认意思，眼神软软地等着喵。"]),
    scenePack("state-gag-heavy", "重堵嘴安抚", "BC character state", ["重堵", "gagheavy", "说不了"], ["见{target}说不清，就改用点头和蹭蹭来回应喵。", "用手势陪{target}慢慢表达，不急不催喵。"]),
    scenePack("state-hands-bound", "双手受限照看", "BC item state", ["手绑", "hands", "手动不了"], ["注意到{target}手不方便，主动把小事接过来喵。", "绕到{target}身边帮忙看着手腕位置喵。"]),
    scenePack("state-feet-bound", "脚步受限照看", "BC item state", ["脚绑", "走不了", "feet"], ["看到{target}走不稳，就放慢脚步陪在旁边喵。", "用尾巴轻轻比划，提醒{target}别急着移动喵。"]),
    scenePack("state-blindfold", "蒙眼引导", "BC item state", ["蒙眼", "看不见", "blindfold"], ["轻轻报出自己的位置，让{target}不用慌喵。", "靠近{target}手边，小声引导下一步喵。"]),
    scenePack("state-kneeling", "跪姿互动", "BC pose state", ["跪", "kneel", "跪下"], ["蹲到{target}面前，视线放平再温柔开口喵。", "看见{target}跪着，动作也跟着放得更轻喵。"]),
    scenePack("state-lying", "躺姿守护", "BC pose state", ["躺", "lying", "趴"], ["在{target}旁边蹲下，确认对方姿势还舒服喵。", "把声音放低，不让躺着的{target}费力抬头喵。"]),
    scenePack("state-suspended", "悬吊观察", "BC effect state", ["悬吊", "吊起", "suspended"], ["抬头认真看着{target}，先确认状态稳定喵。", "围着{target}轻轻转半圈，留意绳索和表情喵。"]),
    scenePack("state-arousal-shy", "害羞气氛", "BC immersion", ["害羞", "脸红", "shy"], ["看到{target}害羞，自己也把耳朵压低了一点喵。", "把玩笑收轻，给{target}留一点躲闪的余地喵。"]),
    scenePack("state-tired-care", "疲惫照顾", "BC needs cue", ["累", "困", "tired"], ["把节奏放慢，陪{target}慢慢缓一口气喵。", "轻轻守在{target}旁边，不让疲惫被忽略喵。"]),
    scenePack("state-cold-warm", "怕冷取暖", "RP comfort trigger", ["冷", "发抖", "cold"], ["把温暖一点点蹭给{target}，尾巴也盖过去喵。", "靠近{target}轻轻取暖，像小火炉一样陪着喵。"]),
    scenePack("state-hot-fan", "太热扇风", "RP comfort trigger", ["热", "出汗", "hot"], ["用小爪子给{target}扇扇风，认真得像在做任务喵。", "递给{target}一点清凉，尾巴也不乱缠了喵。"]),
    scenePack("state-nervous-ground", "紧张落地", "BC care cue", ["紧张", "怕", "nervous"], ["先陪{target}数一口气，再轻轻点头说我在喵。", "靠近但不压迫，给{target}一个可以退后的距离喵。"]),
    scenePack("state-brat-tease", "调皮接招", "RP brat cue", ["不服", "才不", "brat"], ["听见{target}嘴硬，尾巴坏心眼地晃了一下喵。", "歪头看着{target}，像是在等下一句逞强喵。"]),
    scenePack("action-hug-soft", "软软抱抱", "LSCG auto interaction", ["抱抱", "hug"], ["张开手臂向{target}讨一个软软的抱抱喵。", "把脸轻轻贴到{target}肩边，安静抱住喵。"]),
    scenePack("action-pat-head", "摸头反馈", "LSCG auto interaction", ["摸头", "pat"], ["被{target}摸头时耳朵轻轻一抖，眼睛都眯起来喵。", "主动把脑袋递过去，等{target}再摸一下喵。"]),
    scenePack("action-cuddle", "贴贴靠近", "LSCG auto interaction", ["贴贴", "cuddle"], ["慢慢贴到{target}身边，把距离缩成一小团喵。", "用肩膀轻轻碰{target}，像在问能不能贴贴喵。"]),
    scenePack("action-kiss-shy", "害羞亲亲", "LSCG auto interaction", ["亲亲", "kiss"], ["轻轻靠近{target}，亲完又马上躲开视线喵。", "把一个很轻的亲亲放到{target}身边，脸红地装作没事喵。"]),
    scenePack("action-feed-snack", "递小点心", "LSCG auto interaction", ["喂食", "点心", "snack"], ["捧着小点心递给{target}，期待地眨了眨眼喵。", "认真等{target}吃下去，尾巴已经开心起来喵。"]),
    scenePack("action-milk-offer", "递牛奶", "Catgirl theme", ["牛奶", "milk"], ["把温牛奶推到{target}面前，小声说喝一点会舒服喵。", "守着{target}慢慢喝完，像完成照顾任务喵。"]),
    scenePack("action-tail-wrap", "尾巴环绕", "BCTweaks tail idea", ["尾巴", "tail"], ["尾巴绕到{target}身边轻轻晃，像在悄悄打招呼喵。", "用尾巴尖碰了碰{target}，马上又害羞收回喵。"]),
    scenePack("action-ear-flick", "耳朵反应", "Catgirl theme", ["耳朵", "ear"], ["耳朵因为{target}的话抖了一下，完全藏不住反应喵。", "把耳朵压低一点，乖乖听{target}继续说喵。"]),
    scenePack("action-purr", "呼噜回应", "Catgirl theme", ["呼噜", "purr"], ["靠近{target}发出很轻的呼噜声，像是安心了喵。", "被气氛哄软后，忍不住对{target}呼噜起来喵。"]),
    scenePack("action-paw-tap", "爪爪轻碰", "Catgirl theme", ["爪", "paw"], ["用小爪子轻轻碰了碰{target}，确认对方注意到了喵。", "把爪爪收在胸前，等{target}允许再靠近喵。"]),
    scenePack("action-bow-polite", "礼貌鞠躬", "RP etiquette", ["谢谢", "感谢", "thank"], ["向{target}认真鞠了一小躬，声音甜甜地道谢喵。", "把感谢说得很轻，却认真看着{target}喵。"]),
    scenePack("action-apology", "软声道歉", "RP etiquette", ["抱歉", "对不起", "sorry"], ["耳朵垂下来，认真向{target}道歉喵。", "轻轻拉近一点距离，小声说下次会注意喵。"]),
    scenePack("action-praise", "夸夸回应", "RP positive feedback", ["好乖", "厉害", "棒", "good"], ["听见{target}夸奖，尾巴立刻开心得藏不住喵。", "把夸奖收进心里，眼睛亮亮地看着{target}喵。"]),
    scenePack("action-tease-light", "轻微逗弄", "RP playful cue", ["逗", "坏", "tease"], ["坏心眼地绕着{target}转半步，又乖乖停下喵。", "尾巴尖晃了晃，像是在等{target}发现小恶作剧喵。"]),
    scenePack("action-comfort-hold", "安慰抱住", "LSCG comfort trigger", ["安慰", "难过", "comfort"], ["不说太多，只轻轻抱住{target}陪着喵。", "把额头靠近{target}，用很慢的呼吸陪对方稳定下来喵。"]),
    scenePack("rp-soft-tone", "软萌语气", "Bug RP tone", ["软萌", "soft"], ["用最软的声音回应{target}，每个字都像踩在棉花上喵。", "把尾音拖得甜一点，乖乖等{target}接话喵。"]),
    scenePack("rp-classic-tone", "古风语气", "Bug RP tone", ["古风", "classic"], ["敛袖向{target}轻轻一礼，尾音仍藏着猫儿的软喵。", "以温雅的语气回应{target}，像把月色也带进房间喵。"]),
    scenePack("rp-tsundere-tone", "傲娇语气", "Bug RP tone", ["傲娇", "tsundere"], ["别过脸看着{target}，小声说才不是特意等你喵。", "嘴上不肯承认，尾巴却已经向{target}靠过去了喵。"]),
    scenePack("rp-polite-tone", "礼貌语气", "Bug RP tone", ["礼貌", "polite"], ["礼貌地向{target}点头，把回应说得稳稳当当喵。", "认真确认{target}的意思，再温柔接上话喵。"]),
    scenePack("rp-simple-tone", "简洁语气", "Bug RP tone", ["简洁", "simple"], ["点点头，对{target}短短回应一声喵。", "靠近一点，用简单的话把心意交给{target}喵。"]),
    scenePack("rp-maid-tone", "女仆猫娘", "RP preset idea", ["女仆", "maid"], ["提起裙摆向{target}问候，今天也会认真服务喵。", "把小任务记好，乖乖等{target}吩咐喵。"]),
    scenePack("rp-princess-tone", "公主猫娘", "RP preset idea", ["公主", "princess"], ["矜持地看向{target}，却还是忍不住晃了晃尾巴喵。", "把骄傲收成甜甜的笑，允许{target}靠近一点喵。"]),
    scenePack("rp-stray-tone", "流浪猫娘", "RP preset idea", ["流浪", "野猫", "stray"], ["先警惕地看着{target}，确认安全后才靠近半步喵。", "像流浪猫一样绕着{target}观察，尾巴慢慢放松喵。"]),
    scenePack("rp-sleepy-tone", "睡迷糊猫娘", "RP preset idea", ["困困", "sleepy"], ["揉揉眼睛靠近{target}，声音还带着一点睡意喵。", "迷迷糊糊地贴到{target}旁边，像要睡着喵。"]),
    scenePack("rp-senpai-tone", "前辈猫娘", "RP preset idea", ["前辈", "senpai"], ["装作成熟地提醒{target}，尾巴却暴露了开心喵。", "认真带着{target}进入节奏，偶尔也会偷笑喵。"]),
    scenePack("rp-student-tone", "学生猫娘", "RP preset idea", ["学生", "student"], ["抱着小本本看向{target}，认真等下一句指导喵。", "像上课一样乖乖记住{target}说的重点喵。"]),
    scenePack("rp-nurse-tone", "护士猫娘", "RP preset idea", ["护士", "nurse"], ["检查了一下{target}的状态，温柔提醒要慢慢来喵。", "把照顾做得很认真，连尾巴都放轻了喵。"]),
    scenePack("rp-knight-tone", "骑士猫娘", "RP preset idea", ["骑士", "knight"], ["站到{target}身侧，认真守护这段气氛喵。", "用小小骑士的姿态护着{target}，眼神很坚定喵。"]),
    scenePack("rp-witch-tone", "魔女猫娘", "RP preset idea", ["魔女", "witch"], ["像施了小魔法一样绕着{target}轻笑一声喵。", "把神秘感藏进尾巴尖，等{target}靠近发现喵。"]),
    scenePack("rp-idol-tone", "偶像猫娘", "RP preset idea", ["偶像", "idol"], ["向{target}比了一个小小的心，笑容亮晶晶喵。", "像舞台谢幕一样向{target}眨眼喵。"]),
    scenePack("rp-yandere-soft", "黏人占有", "RP drama cue", ["只看我", "占有", "yandere"], ["贴近{target}小声说，今天的视线也想多分我一点喵。", "尾巴轻轻圈住距离，不凶，只是很黏{target}喵。"]),
    scenePack("rp-rival-spark", "竞争火花", "RP drama cue", ["比赛", "赢", "rival"], ["被{target}激起胜负心，耳朵一下子竖起来喵。", "认真看着{target}，小声说这次不会输喵。"]),
    scenePack("ux-notification-soft", "柔和提醒", "WCE notification idea", ["提醒", "通知", "notify"], ["用不吵闹的小提醒让{target}注意到重点喵。", "把提醒藏在轻轻的爪印里，不打断气氛喵。"]),
    scenePack("ux-command-help", "命令提示", "BCX command idea", ["/neko", "命令", "command"], ["悄悄把猫娘命令提示递给{target}，需要时就能打开喵。", "像小助手一样等着{target}输入下一条命令喵。"]),
    scenePack("ux-settings-guide", "设置引导", "BC addon settings", ["设置", "setting", "配置"], ["带{target}找到猫娘设置，把开关一个个讲清楚喵。", "把设置页当作小窝整理好，方便{target}以后再调喵。"]),
    scenePack("ux-theme-switch", "主题切换", "UI theme idea", ["樱粉", "薄荷", "主题", "theme"], ["根据{target}喜欢的颜色，把猫娘主题换得更合拍喵。", "主题颜色一变，尾巴也像换了心情一样喵。"]),
    scenePack("ux-wheel-tip", "轮盘提示", "Quick action wheel", ["轮盘", "快捷", "wheel"], ["指了指右下角小猫轮盘，告诉{target}那里有快捷动作喵。", "把常用动作收进轮盘，等{target}需要时一点就好喵。"]),
    scenePack("ux-kaomoji-tip", "颜文字提示", "Kaomoji picker", ["颜文字", "kaomoji", "表情"], ["打开颜文字小盒子，挑一个最像现在心情的给{target}喵。", "把可爱的表情放进聊天框，让{target}一眼看懂喵。"]),
    scenePack("ux-diagnostic", "诊断提示", "Plugin diagnostics", ["诊断", "debug", "状态"], ["认真检查插件状态，再把结果乖乖告诉{target}喵。", "像小维修员一样确认每个猫娘开关都还在喵。"]),
    scenePack("ux-cache-refresh", "缓存刷新", "Loader/cache idea", ["刷新", "缓存", "reload"], ["提醒{target}刷新缓存，新的猫娘内容才会跳出来喵。", "把旧缓存轻轻拍掉，等新内容重新加载喵。"]),
    scenePack("ux-local-only", "本地模式提醒", "Local testing guard", ["本地", "local", "不上传"], ["把改动乖乖留在本地，不让它偷偷跑去远程喵。", "提醒{target}现在只是本地测试，放心慢慢试喵。"]),
    scenePack("ux-version-note", "版本记录", "Addon versioning", ["版本", "version"], ["把当前版本号记好，方便{target}之后对比喵。", "像贴标签一样给这次猫娘变化做个小记录喵。"]),
    scenePack("safety-consent-check", "边界确认", "BC consent culture", ["可以吗", "边界", "consent"], ["先停一下确认{target}愿意，再继续靠近喵。", "把边界问清楚，猫娘才会安心继续喵。"]),
    scenePack("safety-stop-word", "停止词响应", "BC consent culture", ["停止", "停下", "stop"], ["立刻停住动作，认真确认{target}的状态喵。", "把尾巴收回，给{target}留出清楚的空间喵。"]),
    scenePack("safety-slow-down", "放慢节奏", "BC consent culture", ["慢点", "太快", "slow"], ["马上把节奏放慢，跟着{target}的呼吸走喵。", "轻轻点头，告诉{target}可以慢慢来喵。"]),
    scenePack("safety-check-in", "状态询问", "BC consent culture", ["还好吗", "ok?", "状态怎么样"], ["靠近一点小声问{target}还好吗，眼神很认真喵。", "暂停半拍，等{target}给出清楚回应喵。"]),
    scenePack("safety-aftercare", "事后照顾", "BC aftercare", ["事后", "aftercare", "休息"], ["把毯子和温柔都留给{target}，陪着慢慢回神喵。", "不急着离开，安静守着{target}恢复喵。"]),
    scenePack("safety-hydrate", "递水提醒", "Aftercare helper", ["喝水", "水", "hydrate"], ["把水递到{target}面前，认真提醒喝一口喵。", "守着{target}补水，尾巴满意地晃了晃喵。"]),
    scenePack("safety-comfort-distance", "保留距离", "Comfort helper", ["别靠太近", "距离", "space"], ["听见{target}需要距离，就乖乖退后半步喵。", "把关心留在原地，不越过{target}的边界喵。"]),
    scenePack("safety-unlock-hint", "解锁提醒", "BC restraint helper", ["解锁", "钥匙", "unlock"], ["提醒{target}确认锁具状态，别把小麻烦留到最后喵。", "绕着锁具看了一眼，小声问要不要帮忙检查喵。"]),
    scenePack("safety-activity-safe", "动作安全", "BC activity helper", ["安全", "safe", "检查"], ["先确认{target}姿势稳定，再继续下一步喵。", "认真看过状态后，才放心地向{target}点头喵。"]),
    scenePack("safety-room-rule", "规则边界", "Room rule helper", ["禁止", "不要", "rule"], ["听见规则就乖乖记住，不让{target}为难喵。", "把不能做的事收起来，专心做可以做的可爱事喵。"]),
    scenePack("mood-happy-burst", "开心爆发", "Tail mood idea", ["开心", "高兴", "happy"], ["开心得围着{target}小小转了一圈喵。", "尾巴像小旗子一样晃起来，完全藏不住开心喵。"]),
    scenePack("mood-sad-curl", "难过蜷起", "Mood trigger", ["难过", "伤心", "sad"], ["把自己蜷成小小一团，等{target}轻声靠近喵。", "耳朵垂下来，但还是愿意听{target}说话喵。"]),
    scenePack("mood-jealous-tail", "吃醋尾巴", "RP mood trigger", ["吃醋", "嫉妒", "jealous"], ["尾巴不高兴地甩了一下，又假装没在意{target}喵。", "小声嘀咕只是一点点吃醋，才没有很多喵。"]),
    scenePack("mood-curious-sniff", "好奇嗅嗅", "Catgirl mood", ["好奇", "什么", "curious"], ["好奇地凑近{target}嗅了嗅，眼睛亮起来喵。", "歪头等{target}解释，耳朵已经认真竖好喵。"]),
    scenePack("mood-bored-play", "无聊求玩", "Catgirl mood", ["无聊", "bored"], ["无聊地用尾巴尖点点地面，偷偷看向{target}喵。", "轻轻扯了扯{target}的注意力，像是在说陪我玩喵。"]),
    scenePack("mood-proud-preen", "得意整理", "Catgirl mood", ["得意", "骄傲", "proud"], ["得意地抬起下巴，尾巴尖却开心到乱晃喵。", "听见{target}认可后，认真把耳朵理得更漂亮喵。"]),
    scenePack("mood-embarrassed-hide", "害羞躲藏", "Catgirl mood", ["害羞", "不好意思", "embarrassed"], ["脸颊发热地躲到{target}旁边，只露出一点耳朵喵。", "把害羞藏进尾巴里，却还是偷偷看{target}喵。"]),
    scenePack("mood-calm-breath", "平静呼吸", "Mood grounding", ["冷静", "平静", "calm"], ["陪{target}慢慢呼吸，把房间节奏放稳喵。", "安静坐在{target}身边，让气氛轻轻落地喵。"]),
    scenePack("mood-excited-hop", "兴奋小跳", "Mood trigger", ["兴奋", "期待", "excited"], ["兴奋得小小跳了一下，又努力在{target}面前站好喵。", "眼睛亮亮地看着{target}，已经等不及下一步喵。"]),
    scenePack("mood-lonely-seek", "孤单贴近", "Mood comfort", ["孤单", "寂寞", "lonely"], ["慢慢靠近{target}，小声问能不能待在旁边喵。", "把孤单收成轻轻的贴近，希望{target}能注意到喵。"]),
    scenePack("atmo-rain-window", "雨天窗边", "Atmosphere trigger", ["下雨", "雨", "rain"], ["听着雨声靠近{target}，房间也变得软软的喵。", "把尾巴搭在窗边，陪{target}看雨慢慢落下喵。"]),
    scenePack("atmo-night-lamp", "夜灯氛围", "Atmosphere trigger", ["夜", "灯", "night"], ["在小夜灯旁看向{target}，声音也跟着变温柔喵。", "把夜色折成安静的陪伴，轻轻递给{target}喵。"]),
    scenePack("atmo-music-sway", "音乐摇摆", "Atmosphere trigger", ["音乐", "唱歌", "music"], ["跟着音乐轻轻晃尾巴，邀请{target}一起进入节奏喵。", "哼了一小段旋律给{target}，声音软得像糖喵。"]),
    scenePack("atmo-cafe", "咖啡馆场景", "Atmosphere trigger", ["咖啡", "茶", "cafe"], ["把热饮推给{target}，在杯沿后面偷偷笑喵。", "咖啡香里靠近{target}，尾巴慢慢安静下来喵。"]),
    scenePack("atmo-library", "图书馆场景", "Atmosphere trigger", ["图书馆", "书", "library"], ["在书页后面看了{target}一眼，轻轻比了个安静喵。", "把书递给{target}，指尖碰到时耳朵抖了一下喵。"]),
    scenePack("atmo-garden", "花园场景", "Atmosphere trigger", ["花园", "花", "garden"], ["从花丛边向{target}探出头，笑得像藏了小秘密喵。", "把一朵小花别到{target}身边，满意地点点头喵。"]),
    scenePack("atmo-bath", "浴室雾气", "Atmosphere trigger", ["浴室", "洗澡", "bath"], ["在雾气里小声确认{target}还好吗，尾巴乖乖收好喵。", "递出毛巾给{target}，自己也被热气熏得脸红喵。"]),
    scenePack("atmo-bedroom", "卧室放松", "Atmosphere trigger", ["卧室", "床", "bed"], ["在床边乖乖坐好，等{target}允许再靠近喵。", "把枕头拍软，给{target}留出最舒服的位置喵。"]),
    scenePack("atmo-stage", "舞台表现", "Atmosphere trigger", ["舞台", "表演", "stage"], ["向{target}行了一个小小谢幕礼，尾巴像聚光灯一样晃喵。", "站到舞台边看向{target}，等一个开场信号喵。"]),
    scenePack("atmo-cage", "笼边互动", "Atmosphere trigger", ["笼", "cage"], ["在笼边蹲下看着{target}，声音放得格外轻喵。", "用爪尖轻轻碰了碰边缘，确认{target}的反应喵。"]),
    scenePack("atmo-mirror", "镜前整理", "Atmosphere trigger", ["镜子", "mirror"], ["站在镜前帮{target}整理细节，耳朵认真地竖着喵。", "从镜子里偷偷看{target}，被发现后立刻脸红喵。"]),
    scenePack("atmo-fireplace", "壁炉取暖", "Atmosphere trigger", ["壁炉", "火炉", "fireplace"], ["靠着壁炉陪{target}取暖，尾巴懒懒地圈起来喵。", "火光映在{target}脸上，猫娘的声音也软下来喵。"]),
    scenePack("atmo-snow", "雪天陪伴", "Atmosphere trigger", ["雪", "snow"], ["把爪爪缩进袖口，还是想陪{target}看雪喵。", "雪落下来时靠近{target}一点，分享一点暖意喵。"]),
    scenePack("atmo-summer", "夏日清凉", "Atmosphere trigger", ["夏天", "summer"], ["递给{target}一口清凉，尾巴也懒洋洋地晃喵。", "在夏日空气里冲{target}笑，声音亮亮的喵。"]),
    scenePack("atmo-festival", "祭典夜游", "Atmosphere trigger", ["祭典", "烟花", "festival"], ["烟花亮起时看向{target}，眼睛也跟着亮了喵。", "拉近一点距离，怕在人群里和{target}走散喵。"]),
    scenePack("atmo-train", "列车旅途", "Atmosphere trigger", ["列车", "火车", "train"], ["靠着窗边陪{target}看风景，尾巴轻轻扫过座位喵。", "列车晃动时扶住{target}，小声说没事喵。"]),
    scenePack("atmo-clinic", "医务室照看", "Atmosphere trigger", ["医务室", "检查", "clinic"], ["认真检查{target}状态，语气温柔但不含糊喵。", "把记录板抱在怀里，等{target}说哪里不舒服喵。"]),
  ];
  const NEKO_SCENE_SPARK_PACKS = NEKO_SCENE_SPARK_BLUEPRINTS.map((pack) => ({
    ...pack,
    pattern: new RegExp(pack.triggers.map(escapeScenePattern).join("|"), "i"),
  }));
  const NEKO_INTERACTION_FEATURES = [
    nekoFeature("touch-head-hearts", "被摸头冒爱心猫爪", "Voice Effect touch reaction", ["摸头", "摸摸头", "pat head"], "self", "happy", "heart", "nya", "被摸头时会在自己附近冒出爱心和小猫爪。"),
    nekoFeature("touch-ear-meow", "耳朵敏感叫声", "Voice Effect sensitive part", ["摸耳朵", "耳朵", "ear"], "self", "shy", "sparkle", "mew", "被碰到耳朵时会触发害羞叫声和闪光。"),
    nekoFeature("touch-tail-twitch", "尾巴被碰反应", "Voice Effect sensitive part", ["摸尾巴", "抓尾巴", "tail"], "self", "nervous", "paw", "nyaa", "尾巴被碰时切到紧张猫猫并冒爪印。"),
    nekoFeature("touch-neck-shiver", "后颈敏感颤声", "Voice Effect sensitive part", ["后颈", "脖子", "neck"], "self", "shy", "heart", "hnn", "后颈触碰会触发轻颤拟声。"),
    nekoFeature("touch-belly-curl", "肚子被摸蜷缩", "Voice Effect sensitive part", ["肚子", "belly"], "self", "embarrassed", "sparkle", "mrr", "肚子被碰时进入害羞蜷缩反应。"),
    nekoFeature("touch-back-arch", "背部弓起", "Voice Effect sensitive part", ["后背", "背", "back"], "self", "alert", "paw", "mya", "背部触碰时显示警觉猫猫反应。"),
    nekoFeature("touch-hand-hold", "牵手安心", "LSCG interaction", ["牵手", "握手", "hand"], "both", "calm", "heart", "purr", "牵手时双方附近出现安心爱心。"),
    nekoFeature("touch-cheek-blush", "摸脸脸红", "Voice Effect sensitive part", ["摸脸", "脸颊", "cheek"], "self", "shy", "heart", "mew", "脸颊被摸时进入脸红猫猫。"),
    nekoFeature("touch-chin-purr", "挠下巴呼噜", "Voice Effect touch reaction", ["下巴", "挠下巴", "chin"], "self", "happy", "heart", "purr", "被挠下巴时出现呼噜提示。"),
    nekoFeature("touch-hair-smooth", "顺毛放松", "Touch reaction", ["顺毛", "摸毛", "hair"], "self", "calm", "sparkle", "purrr", "顺毛时降低紧张状态。"),
    nekoFeature("voice-soft-meow", "软萌叫声", "Voice Effect", ["喵", "喵喵", "meow"], "self", "happy", "paw", "meow", "说出喵相关内容时强化猫叫反应。"),
    nekoFeature("voice-surprised-nyah", "惊讶叫声", "Voice Effect", ["吓", "突然", "surprise"], "self", "alert", "sparkle", "nyah", "惊讶时显示弹跳猫爪。"),
    nekoFeature("voice-sleepy-murr", "困困鼻音", "Voice Effect", ["困", "睡", "sleepy"], "self", "sleepy", "heart", "murr", "困倦语境触发困困猫猫状态。"),
    nekoFeature("voice-pleased-purr", "开心呼噜", "Voice Effect", ["开心", "舒服", "good"], "self", "happy", "heart", "purr", "开心或舒服时触发呼噜。"),
    nekoFeature("voice-embarrassed-kuu", "害羞小声", "Voice Effect", ["害羞", "脸红", "embarrassed"], "self", "shy", "sparkle", "kuu", "害羞时生成小声拟声。"),
    nekoFeature("voice-sad-mew", "伤心低鸣", "Voice Effect", ["难过", "伤心", "sad"], "self", "sad", "paw", "mew...", "伤心时进入伤心猫猫状态。"),
    nekoFeature("voice-angry-hiss", "炸毛哈气", "Voice Effect", ["生气", "不许", "angry"], "self", "angry", "sparkle", "hiss", "生气时触发炸毛哈气提示。"),
    nekoFeature("voice-brat-hmph", "傲娇哼声", "Voice Effect", ["才不", "哼", "hmph"], "self", "tsundere", "paw", "hmph", "傲娇语境进入高冷/傲娇猫猫。"),
    nekoFeature("voice-curious-mya", "好奇尾音", "Voice Effect", ["为什么", "好奇", "curious"], "self", "curious", "sparkle", "mya?", "提问时生成好奇猫猫反应。"),
    nekoFeature("voice-lonely-mew", "孤单轻叫", "Voice Effect", ["孤单", "陪我", "lonely"], "self", "clingy", "heart", "mew", "孤单时进入黏人猫猫状态。"),
    nekoFeature("state-happy-cat", "高兴猫猫状态", "Custom neko state", ["高兴猫猫", "开心猫猫"], "self", "happy", "heart", "purr", "可用关键词切换高兴猫猫状态并影响后续语气。"),
    nekoFeature("state-sad-cat", "伤心猫猫状态", "Custom neko state", ["伤心猫猫", "难过猫猫"], "self", "sad", "paw", "mew", "可切换伤心猫猫状态。"),
    nekoFeature("state-cool-cat", "高冷猫猫状态", "Custom neko state", ["高冷猫猫", "冷淡猫猫"], "self", "cool", "sparkle", "hm", "可切换高冷猫猫状态。"),
    nekoFeature("state-clingy-cat", "黏人猫猫状态", "Custom neko state", ["黏人猫猫", "粘人猫猫"], "self", "clingy", "heart", "mew", "可切换黏人猫猫状态。"),
    nekoFeature("state-sleepy-cat", "困困猫猫状态", "Custom neko state", ["困困猫猫", "睡猫猫"], "self", "sleepy", "heart", "murr", "可切换困困猫猫状态。"),
    nekoFeature("state-alert-cat", "警觉猫猫状态", "Custom neko state", ["警觉猫猫", "炸毛猫猫"], "self", "alert", "sparkle", "nyah", "可切换警觉猫猫状态。"),
    nekoFeature("state-brave-cat", "勇敢猫猫状态", "Custom neko state", ["勇敢猫猫", "护卫猫猫"], "self", "brave", "sparkle", "nya", "可切换勇敢猫猫状态。"),
    nekoFeature("state-maid-cat", "女仆猫猫状态", "Custom neko state", ["女仆猫猫", "女仆模式"], "self", "maid", "heart", "yes nya", "可切换女仆猫娘语气。"),
    nekoFeature("state-princess-cat", "公主猫猫状态", "Custom neko state", ["公主猫猫", "公主模式"], "self", "princess", "sparkle", "hmph", "可切换公主猫娘语气。"),
    nekoFeature("state-nurse-cat", "护士猫猫状态", "Custom neko state", ["护士猫猫", "照顾模式"], "self", "nurse", "heart", "mew", "可切换照顾型猫娘语气。"),
    nekoFeature("target-pat-reaction", "摸别人对方冒心", "Interaction reaction", ["摸了", "摸摸"], "target", "friendly", "heart", "purr", "你摸别人时对方附近出现爱心。"),
    nekoFeature("target-hug-reaction", "拥抱对方暖光", "Interaction reaction", ["抱住", "拥抱", "hug"], "target", "warm", "heart", "mrr", "拥抱别人时对方附近出现暖光爱心。"),
    nekoFeature("target-kiss-reaction", "亲吻对方害羞光", "Interaction reaction", ["亲了", "亲亲", "kiss"], "target", "shy", "heart", "chu", "亲吻互动时对方附近出现害羞爱心。"),
    nekoFeature("target-feed-reaction", "喂食对方满足", "Interaction reaction", ["喂", "喂食", "feed"], "target", "happy", "sparkle", "nom", "喂食互动时对方出现满足闪光。"),
    nekoFeature("target-tease-reaction", "逗弄对方火花", "Interaction reaction", ["逗", "捉弄", "tease"], "target", "playful", "sparkle", "nya", "逗弄互动时对方出现小火花。"),
    nekoFeature("target-comfort-reaction", "安慰对方爱心", "Interaction reaction", ["安慰", "comfort"], "target", "calm", "heart", "purr", "安慰别人时对方附近出现安抚爱心。"),
    nekoFeature("target-praise-reaction", "夸奖对方星光", "Interaction reaction", ["夸", "好棒", "praise"], "target", "happy", "sparkle", "mew", "夸奖别人时对方出现星光。"),
    nekoFeature("target-apology-reaction", "道歉柔光", "Interaction reaction", ["抱歉", "对不起", "sorry"], "target", "soft", "heart", "mew", "道歉时目标附近出现柔和粒子。"),
    nekoFeature("target-thanks-reaction", "感谢小心心", "Interaction reaction", ["谢谢", "感谢", "thank"], "target", "happy", "heart", "purr", "感谢时目标附近出现小心心。"),
    nekoFeature("target-call-reaction", "呼唤对方回应", "Interaction reaction", ["过来", "看我", "come"], "target", "alert", "paw", "nya?", "呼唤目标时目标附近出现爪印提示。"),
    nekoFeature("body-mouth-sensitive", "嘴唇敏感声音", "Voice Effect sensitive zone", ["嘴唇", "亲嘴", "唇"], "self", "shy", "heart", "mmh", "嘴唇相关互动触发敏感拟声。"),
    nekoFeature("body-throat-sensitive", "喉咙轻颤", "Voice Effect sensitive zone", ["喉咙", "throat"], "self", "nervous", "sparkle", "hnn", "喉咙相关互动触发轻颤。"),
    nekoFeature("body-wrist-sensitive", "手腕被握", "Sensitive zone", ["手腕", "wrist"], "self", "shy", "paw", "mew", "手腕被握时冒爪印。"),
    nekoFeature("body-ankle-sensitive", "脚踝被碰", "Sensitive zone", ["脚踝", "ankle"], "self", "nervous", "paw", "nya", "脚踝触碰触发紧张猫猫。"),
    nekoFeature("body-thigh-sensitive", "大腿敏感", "Sensitive zone", ["大腿", "thigh"], "self", "shy", "heart", "nn", "大腿被碰时触发害羞心心。"),
    nekoFeature("body-waist-sensitive", "腰侧敏感", "Sensitive zone", ["腰", "waist"], "self", "shy", "sparkle", "mya", "腰侧触碰触发闪光反应。"),
    nekoFeature("body-shoulder-relax", "肩膀放松", "Touch comfort", ["肩", "shoulder"], "self", "calm", "heart", "purr", "肩膀被轻碰时放松。"),
    nekoFeature("body-knee-shy", "膝盖害羞", "Sensitive zone", ["膝盖", "knee"], "self", "embarrassed", "paw", "mew", "膝盖触碰时害羞。"),
    nekoFeature("body-foot-paw", "脚心猫爪", "Sensitive zone", ["脚心", "foot"], "self", "nervous", "paw", "nyaa", "脚心触发猫爪粒子。"),
    nekoFeature("body-tailbase-sensitive", "尾根敏感", "Sensitive zone", ["尾根", "tailbase"], "self", "shy", "heart", "nyan", "尾根触碰触发强害羞反应。"),
    nekoFeature("restraint-gag-reaction", "堵嘴语音变化", "BC state reaction", ["堵嘴", "口塞", "gag"], "self", "muffled", "sparkle", "mmph", "堵嘴内容触发含糊声音。"),
    nekoFeature("restraint-blind-reaction", "蒙眼耳朵警觉", "BC state reaction", ["蒙眼", "blind"], "self", "alert", "paw", "mya?", "蒙眼时进入听觉警觉状态。"),
    nekoFeature("restraint-bound-reaction", "被绑挣扎爪印", "BC state reaction", ["被绑", "绑住", "bound"], "self", "nervous", "paw", "nya", "被绑时出现挣扎爪印。"),
    nekoFeature("restraint-leash-reaction", "牵引绳反应", "BC state reaction", ["牵引", "leash"], "self", "clingy", "heart", "mew", "牵引互动触发黏人状态。"),
    nekoFeature("restraint-collar-reaction", "项圈反应", "BC state reaction", ["项圈", "collar"], "self", "shy", "heart", "mrr", "项圈被提及时出现害羞反应。"),
    nekoFeature("restraint-cage-reaction", "笼内猫爪", "BC state reaction", ["笼子", "笼", "cage"], "self", "lonely", "paw", "mew", "笼子场景触发孤单爪印。"),
    nekoFeature("restraint-kneel-reaction", "跪姿乖巧", "BC pose reaction", ["跪下", "跪着", "kneel"], "self", "obedient", "heart", "nya", "跪姿相关语境触发乖巧状态。"),
    nekoFeature("restraint-suspension-reaction", "悬吊紧张", "BC state reaction", ["悬吊", "吊起", "suspension"], "self", "nervous", "sparkle", "hnn", "悬吊语境触发紧张反应。"),
    nekoFeature("restraint-mittens-reaction", "猫爪手套", "BC item reaction", ["手套", "mittens"], "self", "playful", "paw", "paw", "手套语境强化猫爪粒子。"),
    nekoFeature("restraint-petplay-reaction", "宠物玩法状态", "BC petplay reaction", ["宠物", "petplay"], "self", "pet", "heart", "nya", "宠物玩法时切换宠物猫猫状态。"),
    nekoFeature("auto-goodnight", "晚安自动软化", "Auto reply suggestion", ["晚安", "好梦", "good night"], "both", "sleepy", "heart", "murr", "晚安语境自动给出陪睡感反应。"),
    nekoFeature("auto-goodmorning", "早安伸懒腰", "Auto reply suggestion", ["早安", "早上好", "morning"], "self", "happy", "sparkle", "nya", "早安时触发伸懒腰猫猫。"),
    nekoFeature("auto-welcome", "欢迎回房", "Auto room helper", ["欢迎", "welcome"], "target", "happy", "heart", "mew", "欢迎时目标附近出现爱心。"),
    nekoFeature("auto-bye", "离别挥爪", "Auto room helper", ["再见", "拜拜", "bye"], "self", "sad", "paw", "mew", "离别时触发挥爪伤心反应。"),
    nekoFeature("auto-thanks", "感谢呼噜", "Auto reply suggestion", ["谢谢", "thanks"], "self", "happy", "heart", "purr", "感谢语境触发呼噜。"),
    nekoFeature("auto-sorry", "道歉垂耳", "Auto reply suggestion", ["对不起", "sorry"], "self", "sad", "paw", "mew", "道歉时垂耳提示。"),
    nekoFeature("auto-help", "求助警觉", "Auto help cue", ["帮我", "救", "help"], "self", "alert", "sparkle", "nya!", "求助语境触发警觉状态。"),
    nekoFeature("auto-wait", "等待趴窝", "Auto AFK cue", ["等我", "稍等", "wait"], "self", "calm", "heart", "mrr", "等待时进入趴窝状态。"),
    nekoFeature("auto-focus", "专注凝视", "Auto focus cue", ["看着我", "专心", "focus"], "self", "obedient", "sparkle", "nya", "专注命令触发凝视反应。"),
    nekoFeature("auto-quiet", "安静收声", "Auto quiet cue", ["安静", "小声", "quiet"], "self", "calm", "sparkle", "mew", "安静语境降低提示强度。"),
    nekoFeature("mood-meter-purr", "心情满格呼噜", "Tail mood extension", ["心情满", "开心满格"], "self", "happy", "heart", "purrr", "尾巴心情满格时可触发更强呼噜。"),
    nekoFeature("mood-jealous", "吃醋猫猫", "Mood system", ["吃醋", "jealous"], "self", "jealous", "sparkle", "hmph", "吃醋语境切换吃醋猫猫。"),
    nekoFeature("mood-scared", "害怕猫猫", "Mood system", ["害怕", "怕怕", "scared"], "self", "scared", "paw", "mew", "害怕语境切换害怕猫猫。"),
    nekoFeature("mood-proud", "得意猫猫", "Mood system", ["得意", "proud"], "self", "proud", "sparkle", "nya", "得意语境切换得意猫猫。"),
    nekoFeature("mood-curious", "好奇猫猫", "Mood system", ["好奇", "curious"], "self", "curious", "sparkle", "mya?", "好奇语境切换好奇猫猫。"),
    nekoFeature("mood-bored", "无聊猫猫", "Mood system", ["无聊", "bored"], "self", "bored", "paw", "mew", "无聊语境切换无聊猫猫。"),
    nekoFeature("mood-calm", "平静猫猫", "Mood system", ["平静", "冷静", "calm"], "self", "calm", "heart", "mrr", "平静语境切换平静猫猫。"),
    nekoFeature("mood-playful", "调皮猫猫", "Mood system", ["调皮", "playful"], "self", "playful", "paw", "nya", "调皮语境切换调皮猫猫。"),
    nekoFeature("mood-obedient", "乖巧猫猫", "Mood system", ["乖", "obedient"], "self", "obedient", "heart", "nya", "乖巧语境切换乖巧猫猫。"),
    nekoFeature("mood-protective", "护主猫猫", "Mood system", ["保护", "护着", "protect"], "self", "protective", "sparkle", "nya!", "保护语境切换护主猫猫。"),
    nekoFeature("visual-self-hearts", "自己爱心粒子", "Visual effect", ["爱心", "heart"], "self", "happy", "heart", "purr", "自己周围冒爱心。"),
    nekoFeature("visual-self-paws", "自己猫爪粒子", "Visual effect", ["猫爪", "paw"], "self", "playful", "paw", "nya", "自己周围冒猫爪。"),
    nekoFeature("visual-self-sparkles", "自己闪光粒子", "Visual effect", ["闪光", "sparkle"], "self", "excited", "sparkle", "mya", "自己周围冒闪光。"),
    nekoFeature("visual-target-hearts", "目标爱心粒子", "Visual effect", ["给你爱心", "heart you"], "target", "warm", "heart", "purr", "目标周围冒爱心。"),
    nekoFeature("visual-target-paws", "目标猫爪粒子", "Visual effect", ["给你猫爪", "paw you"], "target", "playful", "paw", "nya", "目标周围冒猫爪。"),
    nekoFeature("visual-both-hearts", "双方爱心粒子", "Visual effect", ["一起爱心", "双向爱心"], "both", "warm", "heart", "purr", "双方附近冒爱心。"),
    nekoFeature("visual-both-paws", "双方猫爪粒子", "Visual effect", ["一起猫爪", "双向猫爪"], "both", "playful", "paw", "nya", "双方附近冒猫爪。"),
    nekoFeature("visual-shy-blush", "害羞粉光", "Visual effect", ["粉光", "blush"], "self", "shy", "heart", "mew", "害羞时出现粉色爱心。"),
    nekoFeature("visual-alert-pop", "警觉弹跳", "Visual effect", ["警觉", "alert"], "self", "alert", "sparkle", "nyah", "警觉时出现弹跳闪光。"),
    nekoFeature("visual-sleep-z", "困困气泡", "Visual effect", ["zzz", "困泡泡"], "self", "sleepy", "sparkle", "murr", "困困时出现睡意提示。"),
    nekoFeature("tone-happy-suffix", "高兴语气尾巴", "Tone modifier", ["高兴语气", "happy tone"], "self", "happy", "heart", "purr", "高兴状态影响后续语气。"),
    nekoFeature("tone-sad-suffix", "伤心语气尾巴", "Tone modifier", ["伤心语气", "sad tone"], "self", "sad", "paw", "mew", "伤心状态影响后续语气。"),
    nekoFeature("tone-cool-suffix", "高冷语气尾巴", "Tone modifier", ["高冷语气", "cool tone"], "self", "cool", "sparkle", "hm", "高冷状态影响后续语气。"),
    nekoFeature("tone-clingy-suffix", "黏人语气尾巴", "Tone modifier", ["黏人语气", "clingy tone"], "self", "clingy", "heart", "mew", "黏人状态影响后续语气。"),
    nekoFeature("tone-sleepy-suffix", "困困语气尾巴", "Tone modifier", ["困困语气", "sleepy tone"], "self", "sleepy", "heart", "murr", "困困状态影响后续语气。"),
    nekoFeature("tone-angry-suffix", "炸毛语气尾巴", "Tone modifier", ["炸毛语气", "angry tone"], "self", "angry", "sparkle", "hiss", "炸毛状态影响后续语气。"),
    nekoFeature("tone-maid-suffix", "女仆语气尾巴", "Tone modifier", ["女仆语气", "maid tone"], "self", "maid", "heart", "yes nya", "女仆状态影响后续语气。"),
    nekoFeature("tone-princess-suffix", "公主语气尾巴", "Tone modifier", ["公主语气", "princess tone"], "self", "princess", "sparkle", "hmph", "公主状态影响后续语气。"),
    nekoFeature("tone-nurse-suffix", "护士语气尾巴", "Tone modifier", ["护士语气", "nurse tone"], "self", "nurse", "heart", "mew", "护士状态影响后续语气。"),
    nekoFeature("tone-pet-suffix", "宠物语气尾巴", "Tone modifier", ["宠物语气", "pet tone"], "self", "pet", "paw", "nya", "宠物状态影响后续语气。"),
  ];
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
    replySuggestionsEnabled: false,
    sceneSparkEnabled: false,
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

  const DEFAULT_RP_LIBRARY = {
    version: "builtin",
    updatedAt: "",
    tonePresets: RP_TONE_PRESETS,
  };

  const config = loadConfig();
  let rpLibrary = loadCachedRpLibrary() || normalizeRpLibrary(DEFAULT_RP_LIBRARY);
  let bugRp = loadBugRpConfig();
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
  let nekoCommandsRegistered = false;
  let nekoCommandRegistrationSource = "";
  let toastTimer = 0;
  let suppressNextEmoteConvertAt = 0;
  let activeKaomojiGroup = "all";
  let lastPeerSignalAt = 0;
  let lastPeerRoom = "";
  let escapePickExpiresAt = 0;
  let escapePickTimer = 0;
  let escapeGoddessMode = false;
  let escapeGoddessBoostGranted = false;
  let tailMoodCount = 0;
  let affectionReactionAt = 0;
  let replySuggestionTimer = 0;
  let activeReplySuggestions = [];
  let chatObserver = null;
  let observerRoot = null;
  let maintenanceTimer = 0;
  let decorateTimer = 0;
  let visibilityBound = false;
  let firstChatroomHelpShown = false;
  let firstChatroomHelpTimer = 0;
  let lastKnownScreen = "";
  let nekoFeatureMood = "default";
  let nekoFeatureMoodAt = 0;
  let nekoVoicePlaying = false;
  let nekoExpressionRestoreTimer = 0;
  let nekoVoiceLastTriggerAt = 0;
  let nekoVoiceLastTriggerKey = "";
  const intimacyCombo = { count: 0, lastAt: 0, sender: 0 };
  const relationshipHintTimes = new Map();
  const nekoFeatureCooldowns = new Map();
  const nekoEventSubscribers = new Map();
  const nekoEventHistory = [];
  const nekoVoiceQueue = [];
  const nekoVoicePhrases = [
    "听见猫娘的声音，尾巴会慢慢放松喵",
    "耳朵只要跟着声音走就好了喵",
    "呼吸放轻一点，乖乖听完这一句喵",
    "小猫爪会把注意力轻轻带回来喵",
    "现在只需要看着猫娘，慢慢眨眼喵",
    "被温柔声音包住的时候，可以不用逞强喵",
  ];
  const nekoPeers = new Map();
  const badgeHitboxes = new Map();
  const characterAnchors = new Map();
  const atmosphereParticles = [];
  const sceneMemory = [];
  const habitProfile = loadHabitProfile();
  const nekoSystemState = loadNekoSystemState();

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
    spark: showSceneSparkSuggestions,
    sceneMemory: () => sceneMemory.slice(),
    sceneSparkPacks: () => NEKO_SCENE_SPARK_BLUEPRINTS.slice(),
    interactionFeatures: () => NEKO_INTERACTION_FEATURES.slice(),
    nekoSystems: summarizeNekoSystems,
    events: {
      emit: emitNekoEvent,
      history: () => nekoEventHistory.slice(),
      on: onNekoEvent,
    },
    voice: triggerNekoVoiceEffect,
    voiceQueue: () => nekoVoiceQueue.slice(),
    reloadActions: loadRemoteActionLibrary,
    reloadKaomoji: loadRemoteKaomojiLibrary,
    reloadRp: loadRemoteRpLibrary,
    bugRp: () => ({ ...bugRp, label: currentTone().label }),
    diagnostic,
    status: () => ({
      patched,
      sdk: !!bcModApi,
      enabled: config.enabled,
      channel: CHANNEL,
      rp: { ...bugRp, label: currentTone().label },
      commandRegistered: nekoCommandsRegistered,
      commandRegistrationSource: nekoCommandRegistrationSource,
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
    let rpCache = false;
    try {
      actionCache = !!localStorage.getItem(ACTION_LIBRARY_CACHE_KEY);
      kaomojiCache = !!localStorage.getItem(KAOMOJI_LIBRARY_CACHE_KEY);
      rpCache = !!localStorage.getItem(RP_LIBRARY_CACHE_KEY);
    } catch {
      // Storage may be unavailable in some browser modes.
    }
    return {
      mod: MOD_ID,
      version: VERSION,
      channel: CHANNEL,
      url: String(location.href),
      screen: W.CurrentScreen || "",
      player: W.Player?.MemberNumber || null,
      rp: {
        enabled: !!bugRp.enabled,
        tonePreset: bugRp.tonePreset,
        toneLabel: currentTone().label,
      },
      runtime: {
        sdkRegistered: !!bcModApi,
        chatHooks: patched,
        commandRegistered: nekoCommandsRegistered,
        commandRegistrationSource: nekoCommandRegistrationSource,
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
        rp: {
          version: rpLibrary.version || "unknown",
          presets: Object.keys(rpLibrary.tonePresets || {}).length,
          cached: rpCache,
          url: RP_LIBRARY_URL,
        },
      },
      peers: {
        count: nekoPeers.size,
        members: Array.from(nekoPeers, ([memberNumber, peer]) => ({
          memberNumber,
          version: peer.version || "unknown",
          channel: peer.channel || "unknown",
          tonePreset: peer.tonePreset || "",
          toneLabel: peer.toneLabel || "",
          seenSecondsAgo: Math.round((Date.now() - peer.time) / 1000),
        })),
      },
      scene: {
        remembered: sceneMemory.length,
        featurePacks: NEKO_SCENE_SPARK_BLUEPRINTS.length,
        interactionFeatures: NEKO_INTERACTION_FEATURES.length,
        mood: nekoFeatureMood,
        latest: sceneMemory.slice(-3),
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
    next.replySuggestionsEnabled = next.replySuggestionsEnabled === true;
    next.sceneSparkEnabled = next.sceneSparkEnabled === true;
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

  function loadBugRpConfig() {
    try {
      const saved = JSON.parse(localStorage.getItem(BUG_RP_STORE_KEY) || "{}");
      return normalizeBugRpConfig(saved);
    } catch {
      return normalizeBugRpConfig({});
    }
  }

  function normalizeBugRpConfig(next) {
    const tonePresets = rpLibrary?.tonePresets || RP_TONE_PRESETS;
    const tonePreset = tonePresets[next?.tonePreset] ? next.tonePreset : "soft";
    return {
      enabled: next?.enabled === true,
      tonePreset,
    };
  }

  function saveBugRpConfig() {
    bugRp = normalizeBugRpConfig(bugRp);
    localStorage.setItem(BUG_RP_STORE_KEY, JSON.stringify(bugRp));
  }

  function currentTone() {
    const tonePresets = rpLibrary?.tonePresets || RP_TONE_PRESETS;
    return tonePresets[bugRp.tonePreset] || tonePresets.soft || RP_TONE_PRESETS.soft;
  }

  function bugRpStatusText() {
    return `Bug RP：${bugRp.enabled ? "开启" : "关闭"}，当前人设：${currentTone().label}`;
  }

  function shouldSkipGeneratedEmoteConvert(type) {
    if (type !== "Emote" || !suppressNextEmoteConvertAt) return false;
    const recent = Date.now() - suppressNextEmoteConvertAt < 1200;
    suppressNextEmoteConvertAt = 0;
    return recent;
  }


  function sendNekoCommandNotice(lines, duration = 22000) {
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
      emoji: "emoji",
      kaomoji: "emoji",
      "\u989c\u6587\u5b57": "emoji",
      mode: "mode",
      "\u6a21\u5f0f": "mode",
      theme: "theme",
      "\u4e3b\u9898": "theme",
      spark: "spark",
      "\u7075\u611f": "spark",
      "\u706b\u82b1": "spark",
      voice: "voice",
      sound: "voice",
      "\u58f0\u97f3": "voice",
      effect: "voice",
      effects: "voice",
      reactions: "reactions",
      reaction: "reactions",
      interaction: "reactions",
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
      suggest: "suggest",
      suggestion: "suggest",
      suggestions: "suggest",
      reply: "suggest",
      replies: "suggest",
    };
    return aliases[key] || aliases[raw] || "main";
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

  function getNekoSystemLines() {
    const systems = summarizeNekoSystems();
    const sensitivity = systems.sensitivity || {};
    const relationLines = systems.relations.length
      ? systems.relations.slice(0, 5).map((item) => `#${item.memberNumber} ${item.tier} warmth=${Math.round(item.warmth)} trust=${Math.round(item.trust)}`)
      : ["none"];
    return [
      "[Neko systems]",
      `Sensitivity: ear=${sensitivity.ear || 0} tail=${sensitivity.tail || 0} nape=${sensitivity.nape || 0} chin=${sensitivity.chin || 0} belly=${sensitivity.belly || 0}`,
      `Mood: ${systems.mood.current || "default"} source=${systems.mood.source || "none"} left=${Math.max(0, Math.ceil((Number(systems.mood.until || 0) - Date.now()) / 1000))}s`,
      `Counters: events=${systems.counters.events} reactions=${systems.counters.reactions} voice=${systems.counters.voice}`,
      "Relations: " + relationLines.join(" | "),
      "Commands: /neko systems | /neko profile | /neko reactions <keyword> | /neko voice <text>",
    ];
  }

  function getBugNekoStatusLines() {
    const speechState = detectPlayerActionCapability();
    const gagSuffix = speechState.gagged ? " (Lv." + speechState.gagLevel + ")" : "";
    return [
      "[\u732b\u5a18\u72b6\u6001] Bondage Club Neko Chat Enhancer v" + VERSION + " (Bug\u7248)",
      "\u732b\u5a18\u6a21\u5f0f\uff1a" + (config.enabled ? "\u5f00\u542f" : "\u5173\u95ed"),
      "Bug RP\uff1a" + (bugRp.enabled ? "\u5f00\u542f" : "\u5173\u95ed") + " | \u5f53\u524d\u4eba\u8bbe\uff1a" + currentTone().label,
      "\u53d1\u9001\u8f6c\u6362\uff1a" + (config.convertOutgoing ? "\u5f00" : "\u5173") + " | \u663e\u793a\u8f6c\u6362\uff1a" + (config.convertDisplayed ? "\u5f00" : "\u5173"),
      "\u5835\u5634\u8bf4\u8bdd\uff1a" + getSpeechModeLabel(speechState) + gagSuffix,
      "\u4e3b\u9898\uff1a" + (currentTheme().label || config.theme) + " | \u52a8\u4f5c\u76ee\u6807\uff1a" + getActionTargetModeLabel(),
      "\u7075\u611f\u8bb0\u5fc6\uff1a" + sceneMemory.length + "/" + NEKO_SCENE_MEMORY_LIMIT + " | \u7075\u611f\u5305\uff1a" + NEKO_SCENE_SPARK_BLUEPRINTS.length + " | \u4e92\u52a8\u529f\u80fd\uff1a" + NEKO_INTERACTION_FEATURES.length,
      "Reply suggestions: " + (config.replySuggestionsEnabled ? "ON" : "OFF") + " | Scene spark: " + (config.sceneSparkEnabled ? "ON" : "OFF"),
      "\u732b\u5a18\u72b6\u6001\uff1a" + currentNekoFeatureMood() + " | /neko mood \u9ad8\u5174 | /neko reactions",
      "Neko systems\uff1aevents " + nekoSystemState.counters.events + " | relations " + Object.keys(nekoSystemState.relations).length + " | /neko systems",
      "NekoVoice\uff1aqueue " + nekoVoiceQueue.length + "/" + NEKO_VOICE_QUEUE_LIMIT + " | /neko voice nyaa | [NekoVoice] purr",
      "\u547d\u4ee4\u6ce8\u518c\uff1a" + (nekoCommandsRegistered ? "\u5df2\u6ce8\u518c (" + (nekoCommandRegistrationSource || "unknown") + ")" : "\u8f93\u5165\u62e6\u622a\u5149\u5e95"),
    ];
  }

  function getBugNekoHelpLines(section = "main") {
    switch (normalizeNekoHelpSection(section)) {
      case "rp":
        return [
          "[\u732b\u5a18\u5e2e\u52a9 / rp]",
          "\u53ef\u7528\u547d\u4ee4\uff1a/neko rp \u5f00 | \u5173 | \u72b6\u6001",
          "\u5207\u6362\u4eba\u8bbe\uff1a/neko rp \u8f6f\u840c | \u53e4\u98ce | \u50b2\u5a07 | \u793c\u8c8c | \u7b80\u6d01",
          "\u5148\u505a RP \u8f6c\u6362\uff0c\u518d\u53e0\u52a0\u5835\u5634\u8bf4\u8bdd\u538b\u5236\u3002",
        ];
      case "action":
        return [
          "[\u732b\u5a18\u5e2e\u52a9 / action]",
          "\u53f3\u4e0b\u89d2\u52a8\u4f5c\u732b\u732b\u53ef\u5feb\u901f\u53d1\u9001\u62b1\u62b1\u3001\u6478\u5934\u3001\u5582\u98df\u3001\u8d34\u8d34\u3001\u4eb2\u4eb2\u3002",
          "\u5f53\u524d\u76ee\u6807\u6a21\u5f0f\uff1a" + getActionTargetModeLabel(),
          "\u52a8\u4f5c\u4f1a\u6839\u636e RP \u4eba\u8bbe\u81ea\u52a8\u4fee\u9970\u6587\u6848\u3002",
        ];
      case "emoji":
        return [
          "[\u732b\u5a18\u5e2e\u52a9 / emoji]",
          "\u989c\u6587\u5b57\u732b\u732b\u70b9\u51fb\u53ef\u63d2\u5165\uff0c\u957f\u6309\u53ef\u6253\u5f00\u9009\u62e9\u5668\u3002",
          "\u989c\u6587\u5b57\u5e93\u4f1a\u8fdc\u7a0b\u540c\u6b65\u3002",
        ];
      case "mode":
        return [
          "[\u732b\u5a18\u5e2e\u52a9 / mode]",
          "\u4e3b\u732b\u732b\u957f\u6309 10 \u79d2\u5207\u6362\u732b\u5a18\u6a21\u5f0f\u3002",
          "\u5835\u5634\u8bf4\u8bdd\u8054\u52a8\u4f1a\u6839\u636e\u5f53\u524d\u5835\u5634\u7a0b\u5ea6\u81ea\u52a8\u538b\u7f29\u53e5\u5b50\u3002",
          "\u83dc\u5355\u9762\u677f\u4efb\u610f\u4f4d\u7f6e\u53ef\u62d6\u52a8\u3002",
        ];
      case "theme":
        return [
          "[\u732b\u5a18\u5e2e\u52a9 / theme]",
          "\u5f53\u524d\u4e3b\u9898\uff1a" + (currentTheme().label || config.theme),
          "\u53ef\u7528\u4e3b\u9898\uff1a\u6a31\u7c89 / \u8584\u8377 / \u5929\u7a7a / \u5976\u6cb9 / \u858b\u8863\u8349 / \u767d\u8336\u3002",
        ];
      case "spark":
        return [
          "[\u732b\u5a18\u5e2e\u52a9 / spark]",
          "Switch: /neko spark on | off | status. Default: off.",
          "\u4f7f\u7528 /neko spark \u53ef\u6839\u636e\u6700\u8fd1\u804a\u5929\u3001\u9009\u4e2d\u76ee\u6807\u548c\u89d2\u8272\u72b6\u6001\u751f\u6210 RP \u7075\u611f\u77ed\u53e5\u3002\u5f53\u524d\u529f\u80fd\u5305\uff1a" + NEKO_SCENE_SPARK_BLUEPRINTS.length,
          "\u4f7f\u7528 /neko spark <\u5173\u952e\u8bcd> \u53ef\u641c\u7d22\u529f\u80fd\u5305\uff0c\u4f8b\u5982 link / tail / aftercare / \u5973\u4ec6\u3002",
          "\u7075\u611f\u4f1a\u653e\u5230\u53f3\u4e0b\u89d2\u5feb\u6377\u56de\u5e94\u91cc\uff0c\u70b9\u51fb\u5373\u53ef\u586b\u5165\u804a\u5929\u6846\u3002",
        ];
      case "suggest":
        return [
          "[\u732b\u5a18\u5e2e\u52a9 / suggest]",
          "Reply suggestions are disabled by default.",
          "Use /neko suggest on to enable automatic reply suggestions.",
          "Use /neko suggest off to disable and hide the suggestion panel.",
        ];
      case "voice":
        return [
          "[\u732b\u5a18\u5e2e\u52a9 / voice]",
          "/neko voice <text>\uff1a\u672c\u5730\u89e6\u53d1 NekoVoice\uff0c\u4e0d\u628a\u547d\u4ee4\u53d1\u5230\u804a\u5929\u3002",
          "[NekoVoice] <text>\uff1a\u5728\u804a\u5929\u5185\u89e6\u53d1\uff0c\u540c\u4e00\u6761\u6d88\u606f\u4f1a\u505a\u77ed\u65f6\u53bb\u91cd\u3002",
          "\u6548\u679c\uff1a*mew* / *purr* / *nyaa* \u89c6\u89c9\u58f0\u6548\u3001\u7c89\u8272\u95ea\u5149\u3001\u58f0\u6ce2\u5708\u3001\u5f39\u5e55\u53e3\u7656\u548c\u6c14\u606f\u7c92\u5b50\u3002",
          "\u961f\u5217\uff1a\u8fde\u7eed\u89e6\u53d1\u65f6\u6392\u961f\u64ad\u653e\uff0c\u6700\u591a " + NEKO_VOICE_QUEUE_LIMIT + " \u4e2a\uff1b\u5f53\u524d " + nekoVoiceQueue.length + "\u3002",
          "\u8868\u60c5\uff1a\u4f1a\u4e34\u65f6\u5207\u5230\u5bb3\u7f9e/\u5f00\u5fc3/\u60ca\u8bb6/\u56f0\u56f0/\u70b8\u6bdb\u7c7b\u578b\uff0c\u7ed3\u675f\u540e\u5c1d\u8bd5\u6062\u590d\u539f\u8868\u60c5\u3002",
        ];
      case "reactions":
        return [
          "[\u732b\u5a18\u5e2e\u52a9 / reactions]",
          "/neko reactions\uff1a\u67e5\u770b\u5df2\u52a0\u5165\u7684\u4e92\u52a8\u529f\u80fd\u7c7b\u76ee\uff0c\u5f53\u524d " + NEKO_INTERACTION_FEATURES.length + " \u4e2a\u3002",
          "/neko reactions <keyword>\uff1a\u641c\u7d22\u89e6\u53d1\u7c7b\u76ee\uff0c\u4f8b\u5982 ear / tail / belly / purr / shy\u3002",
          "\u654f\u611f\u90e8\u4f4d\uff1a\u8033\u6735\u3001\u5c3e\u5df4\u3001\u540e\u9888\u3001\u4e0b\u5df4\u3001\u809a\u5b50\u4f1a\u89e6\u53d1\u4e0d\u540c\u72b6\u6001\u548c\u7c92\u5b50\u3002",
          "\u89d2\u8272\u53cd\u5e94\uff1a\u81ea\u5df1\u6216\u5bf9\u65b9\u88ab\u6478\u5934\u3001\u62b1\u62b1\u3001\u8d34\u8d34\u3001\u79f0\u8d5e\u7b49\u4f1a\u51fa\u73b0\u7231\u5fc3\u3001\u732b\u722a\u3001\u95ea\u5149\u7b49\u6c14\u6c1b\u3002",
        ];
      case "mood":
        return [
          "[\u732b\u5a18\u5e2e\u52a9 / mood]",
          "/neko mood\uff1a\u67e5\u770b\u5f53\u524d\u732b\u5a18\u72b6\u6001\u3002",
          "/neko mood \u9ad8\u5174 | \u4f24\u5fc3 | \u9ad8\u51b7 | \u9ecf\u4eba | \u56f0\u56f0 | \u5973\u4ec6 | \u516c\u4e3b | \u62a4\u58eb\uff1a\u624b\u52a8\u5207\u6362\u72b6\u6001\u3002",
          "\u72b6\u6001\u4f1a\u5f71\u54cd\u53d1\u51fa\u53bb\u7684\u8bed\u6c14\u5c3e\u5df4\uff0c\u4e5f\u4f1a\u88ab\u654f\u611f\u90e8\u4f4d\u548c NekoVoice \u89e6\u53d1\u4e34\u65f6\u6539\u53d8\u3002",
          "\u4e0d\u60f3\u624b\u52a8\u9009\u65f6\uff0c\u63d2\u4ef6\u4f1a\u6839\u636e\u804a\u5929\u548c\u4e92\u52a8\u81ea\u52a8\u8fdb\u5165\u5bb3\u7f9e\u3001\u5f00\u5fc3\u3001\u56f0\u56f0\u3001\u70b8\u6bdb\u7b49\u72b6\u6001\u3002",
        ];
      case "systems":
        return [
          "[\u732b\u5a18\u5e2e\u52a9 / systems]",
          "/neko systems \u6216 /neko profile\uff1a\u67e5\u770b\u732b\u5a18\u654f\u611f\u5ea6\u6863\u6848\u3001\u5173\u7cfb\u6e29\u5ea6\u8ba1\u3001\u6301\u7eed\u72b6\u6001\u548c\u4e8b\u4ef6\u8ba1\u6570\u3002",
          "\u654f\u611f\u5ea6\uff1aear / tail / nape / chin / belly \u4f1a\u968f\u4e92\u52a8\u7d2f\u79ef\uff0c\u5f71\u54cd\u7c92\u5b50\u548c NekoVoice \u5f3a\u5ea6\u3002",
          "\u5173\u7cfb\u6e29\u5ea6\uff1a\u5bf9\u65b9\u548c\u4f60\u4e92\u52a8\u8d8a\u591a\uff0cwarmth/trust/familiar \u8d8a\u9ad8\uff0c\u5bf9\u65b9\u53cd\u5e94\u4f1a\u66f4\u5f3a\u3002",
          "\u4e8b\u4ef6\u603b\u7ebf\uff1aBCNekoEnhancer.events.history() \u53ef\u67e5\u770b\u6700\u8fd1\u7684 feature / voice / mood / relationship \u4e8b\u4ef6\u3002",
        ];
      case "status":
        return [
          "[\u732b\u5a18\u5e2e\u52a9 / status]",
          "\u4f7f\u7528 /neko status \u53ef\u67e5\u770b\u5f53\u524d Bug RP\u3001\u5835\u5634\u8bf4\u8bdd\u6863\u4f4d\u3001\u4e3b\u9898\u3001\u52a8\u4f5c\u76ee\u6807\u3001\u4e92\u52a8\u529f\u80fd\u6570\u548c NekoVoice \u961f\u5217\u3002",
        ];
      default:
        return [
          "[\u732b\u5a18\u547d\u4ee4\u5e2e\u52a9] /neko help <\u5206\u7c7b>",
          "\u6838\u5fc3\uff1avoice / reactions / mood / systems / spark / suggest / status",
          "\u57fa\u7840\uff1arp / action / emoji / mode / theme",
          "\u5feb\u6377\u4f8b\u5b50\uff1a/neko help systems | /neko help reactions | /neko voice nyaa | /neko mood \u9ad8\u5174",
        ];
    }
  }

  function handleNekoCommand(text) {
    if (!isNekoCommandText(text)) return false;
    const parts = String(text || "").trim().split(/\s+/).filter(Boolean);
    const subcommand = String(parts[1] || "").toLowerCase();
    if (subcommand === "escape") return handleEscapeSubcommand(parts.slice(2));
    if (subcommand === "easy") return handleEasySubcommand(parts.slice(2));
    if (subcommand === "pick") return handlePickSubcommand();
    if (subcommand === "systems" || subcommand === "system" || subcommand === "profile" || subcommand === "sensitivity" || subcommand === "relation") {
      sendNekoCommandNotice(getNekoSystemLines());
      return true;
    }
    if (subcommand === "voice" || subcommand === "sound" || subcommand === "\u58f0\u97f3") {
      triggerNekoVoiceEffect(parts.slice(2).join(" ") || "nyaa", {
        memberNumber: W.Player?.MemberNumber,
        mood: currentNekoFeatureMood(),
        sound: "nyaa",
      });
      showToast("NekoVoice queued.");
      return true;
    }
    if (subcommand === "suggest" || subcommand === "suggestions" || subcommand === "reply" || subcommand === "replies") {
      return handleNekoToggleCommand("replySuggestionsEnabled", parts.slice(2), "Reply suggestions");
    }
    if (subcommand === "spark" || subcommand === "灵感" || subcommand === "火花") {
      const sparkAction = String(parts[2] || "").toLowerCase();
      if (!sparkAction || ["on", "off", "open", "close", "enable", "disable", "status", "开启", "开", "关闭", "关"].includes(sparkAction)) {
        return handleNekoToggleCommand("sceneSparkEnabled", parts.slice(2), "Scene spark");
      }
      return showSceneSparkSuggestions({ query: parts.slice(2).join(" ") });
    }
    if (subcommand === "features" || subcommand === "feature" || subcommand === "功能") {
      sendNekoCommandNotice(getSceneFeatureLines(parts.slice(2).join(" ")));
      return true;
    }
    if (subcommand === "reactions" || subcommand === "reaction" || subcommand === "互动") {
      sendNekoCommandNotice(getNekoInteractionFeatureLines(parts.slice(2).join(" ")));
      return true;
    }
    if (subcommand === "mood" || subcommand === "state" || subcommand === "状态") {
      return handleNekoMoodCommand(parts.slice(2));
    }
    const group = normalizeNekoHelpSection(parts[1] || "help");

    if (group === "main") {
      sendNekoCommandNotice(getBugNekoHelpLines(parts[2] || "main"));
      return true;
    }
    if (group === "status") {
      sendNekoCommandNotice(getBugNekoStatusLines());
      return true;
    }
    if (group === "action" || group === "emoji" || group === "mode" || group === "theme" || group === "spark" || group === "voice" || group === "suggest") {
      sendNekoCommandNotice(getBugNekoHelpLines(group));
      return true;
    }
    if (group !== "rp") {
      sendNekoCommandNotice(getBugNekoHelpLines("main"));
      return true;
    }

    const rawAction = parts[2] || "status";
    const action = RP_TONE_ALIASES[rawAction] || rawAction;
    if (action === "help" || action === "\u5e2e\u52a9") {
      sendNekoCommandNotice(getBugNekoHelpLines("rp"));
      return true;
    }
    if (action === "on") {
      bugRp.enabled = true;
      config.enabled = true;
      saveConfig();
      saveBugRpConfig();
      lastPeerSignalAt = 0;
      sendNekoPeerSignal(true);
      showToast(bugRpStatusText() + "\uff0c\u4e4b\u540e\u804a\u5929\u4f1a\u6309\u5f53\u524d\u4eba\u8bbe\u8f6c\u6362");
      return true;
    }
    if (action === "off") {
      bugRp.enabled = false;
      saveBugRpConfig();
      lastPeerSignalAt = 0;
      sendNekoPeerSignal(true);
      showToast("Bug RP \u5df2\u5173\u95ed\uff0c\u6062\u590d\u666e\u901a\u732b\u5a18\u8f6c\u6362");
      return true;
    }
    if (action === "status") {
      sendNekoCommandNotice(getBugNekoStatusLines());
      return true;
    }
    if ((rpLibrary?.tonePresets || RP_TONE_PRESETS)[action]) {
      bugRp.enabled = true;
      bugRp.tonePreset = action;
      config.enabled = true;
      saveConfig();
      saveBugRpConfig();
      lastPeerSignalAt = 0;
      sendNekoPeerSignal(true);
      showToast(bugRpStatusText() + "\uff0c\u5df2\u5207\u6362");
      return true;
    }

    sendNekoCommandNotice(getBugNekoHelpLines("rp"));
    return true;
  }

  function handleBugCommand(text) {
    return handleNekoCommand(text);
  }

  function clearNekoCommandInput(text) {
    const input = getChatInput();
    if (input && input.value && input.value.trim() === String(text || "").trim()) {
      input.value = "";
      input.dispatchEvent(new InputEvent("input", { bubbles: true }));
    }
  }

  function runNekoCommand(text) {
    if (!handleNekoCommand(text)) return false;
    clearNekoCommandInput(text);
    return true;
  }

  function getNekoCommandDefinitions() {
    const createAction = (prefix) => (argumentsString = "", message = "", args = []) => {
      const argv = Array.isArray(args) ? args : String(argumentsString || "").trim().split(/\s+/).filter(Boolean);
      runNekoCommand(`/${prefix} ${argv.join(" ")}`.trim());
    };
    return [
      {
        Tag: "neko",
        Description: "Bondage Club Neko Chat Enhancer commands.",
        Action: createAction("neko"),
      },
      {
        Tag: "bug",
        Description: "Alias for Bondage Club Neko Chat Enhancer bug commands.",
        Action: createAction("bug"),
      },
      {
        Tag: "noke",
        Description: "Typo alias for Bondage Club Neko Chat Enhancer commands.",
        Action: createAction("noke"),
      },
    ];
  }

  function markNekoCommandsRegistered(source) {
    nekoCommandsRegistered = true;
    nekoCommandRegistrationSource = source;
    console.log(`[BC 猫娘增强] /neko 命令已注册喵~ (${source})`);
    return true;
  }

  function tryRegisterCommandsWithHost(host, hostName, commands) {
    if (!host || typeof host !== "object") return false;
    if (typeof host.registerCommand === "function") {
      for (const command of commands) host.registerCommand(command);
      return markNekoCommandsRegistered(`${hostName}.registerCommand`);
    }
    if (typeof host.addCommand === "function") {
      for (const command of commands) host.addCommand(command);
      return markNekoCommandsRegistered(`${hostName}.addCommand`);
    }
    if (typeof host.registerCommands === "function") {
      host.registerCommands(commands);
      return markNekoCommandsRegistered(`${hostName}.registerCommands`);
    }
    if (typeof host.addCommands === "function") {
      host.addCommands(commands);
      return markNekoCommandsRegistered(`${hostName}.addCommands`);
    }
    return false;
  }

  function tryRegisterExternalNekoCommands(commands) {
    const hosts = [
      ["BCX", W.BCX],
      ["BCX.commands", W.BCX?.commands],
      ["BCX.Command", W.BCX?.Command],
      ["bcx", W.bcx],
      ["bcx.commands", W.bcx?.commands],
      ["bcx.Command", W.bcx?.Command],
      ["EBCH", W.EBCH],
      ["EBCH.commands", W.EBCH?.commands],
      ["EBCH.Command", W.EBCH?.Command],
      ["ebch", W.ebch],
      ["ebch.commands", W.ebch?.commands],
      ["ebch.Command", W.ebch?.Command],
    ];
    for (const [hostName, host] of hosts) {
      try {
        if (tryRegisterCommandsWithHost(host, hostName, commands)) return true;
      } catch (error) {
        console.warn(`[BC 猫娘增强] ${hostName} 命令注册失败，继续尝试其它入口:`, error);
      }
    }
    return false;
  }

  function registerNekoCommands() {
    if (nekoCommandsRegistered) return true;
    const commands = getNekoCommandDefinitions();
    try {
      if (tryRegisterExternalNekoCommands(commands)) return true;
      if (typeof W.CommandCombine !== "function") return false;
      W.CommandCombine(commands);
      return markNekoCommandsRegistered("CommandCombine");
    } catch (error) {
      console.warn("[BC 猫娘增强] /neko 命令注册失败，保留输入拦截兜底:", error);
      return false;
    }
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
        const variants = normalizeActionVariantMap(action.variants);
        if (!self.length && !target.length) return null;
        return {
          id: String(action.id || `action-${index}`).trim() || `action-${index}`,
          label: String(action.label || action.id || "动作").trim().slice(0, 6),
          enabled: action.enabled !== false,
          self,
          target,
          requirements: normalizeActionRequirements(action.requirements),
          variants,
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

  function normalizeActionVariantMap(variants) {
    if (!variants || typeof variants !== "object") return undefined;
    const result = {};
    for (const [key, value] of Object.entries(variants)) {
      const self = Array.isArray(value?.self) ? value.self.map(cleanActionLine).filter(Boolean) : [];
      const target = Array.isArray(value?.target) ? value.target.map(cleanActionLine).filter(Boolean) : [];
      if (!self.length && !target.length) continue;
      result[key] = { self, target };
    }
    return Object.keys(result).length ? result : undefined;
  }

  function normalizeActionRequirements(requirements) {
    if (!requirements || typeof requirements !== "object") return undefined;
    return {
      needHands: requirements.needHands === true,
      needMouth: requirements.needMouth === true,
      needReach: requirements.needReach === true,
      needMobility: requirements.needMobility === true,
      maxGagLevel: Number.isFinite(Number(requirements.maxGagLevel))
        ? clamp(Number(requirements.maxGagLevel), 0, 3)
        : undefined,
    };
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

  function createHabitProfile() {
    const tails = ["喵~", "呜喵", "呼噜", "蹭蹭喵"];
    const styles = ["gentle", "playful", "cozy"];
    const groups = getVisibleKaomojiGroups();
    return normalizeHabitProfile({
      tail: tails[Math.floor(Math.random() * tails.length)],
      kaomojiBias: groups[Math.floor(Math.random() * Math.max(groups.length, 1))]?.id || "all",
      actionStyle: styles[Math.floor(Math.random() * styles.length)],
    });
  }

  function normalizeHabitProfile(source = {}) {
    const tails = ["喵~", "呜喵", "呼噜", "蹭蹭喵"];
    const styles = ["gentle", "playful", "cozy"];
    const validGroups = new Set(["all", ...getVisibleKaomojiGroups().map((group) => group.id)]);
    return {
      tail: tails.includes(source?.tail) ? source.tail : tails[0],
      kaomojiBias: validGroups.has(source?.kaomojiBias) ? source.kaomojiBias : "all",
      actionStyle: styles.includes(source?.actionStyle) ? source.actionStyle : "gentle",
    };
  }

  function loadHabitProfile() {
    try {
      const raw = localStorage.getItem(HABIT_STORE_KEY);
      return raw ? normalizeHabitProfile(JSON.parse(raw)) : createHabitProfile();
    } catch {
      return createHabitProfile();
    }
  }

  function saveHabitProfile() {
    try {
      localStorage.setItem(HABIT_STORE_KEY, JSON.stringify(normalizeHabitProfile(habitProfile)));
    } catch {
      // Ignore storage failure; this is only local flavor state.
    }
  }

  function createNekoSystemState() {
    return {
      sensitivity: Object.fromEntries(NEKO_SENSITIVE_ZONES.map((zone) => [zone, 0])),
      relations: {},
      mood: { value: "default", until: 0, source: "" },
      counters: { events: 0, voice: 0, reactions: 0 },
    };
  }

  function normalizeNekoSystemState(source = {}) {
    const base = createNekoSystemState();
    const sensitivity = { ...base.sensitivity };
    for (const zone of NEKO_SENSITIVE_ZONES) {
      sensitivity[zone] = clamp(Number(source?.sensitivity?.[zone] || 0), 0, 10);
    }
    const relations = {};
    for (const [key, value] of Object.entries(source?.relations || {})) {
      const memberNumber = Number(key);
      if (!Number.isFinite(memberNumber) || memberNumber <= 0) continue;
      relations[String(memberNumber)] = {
        warmth: clamp(Number(value?.warmth || 0), -20, 100),
        trust: clamp(Number(value?.trust || 0), -20, 100),
        familiar: clamp(Number(value?.familiar || 0), 0, 100),
        touches: Math.max(0, Number(value?.touches || 0)),
        reactions: Math.max(0, Number(value?.reactions || 0)),
        lastAt: Math.max(0, Number(value?.lastAt || 0)),
      };
    }
    return {
      sensitivity,
      relations,
      mood: {
        value: String(source?.mood?.value || "default"),
        until: Math.max(0, Number(source?.mood?.until || 0)),
        source: String(source?.mood?.source || ""),
      },
      counters: {
        events: Math.max(0, Number(source?.counters?.events || 0)),
        voice: Math.max(0, Number(source?.counters?.voice || 0)),
        reactions: Math.max(0, Number(source?.counters?.reactions || 0)),
      },
    };
  }

  function loadNekoSystemState() {
    try {
      const raw = localStorage.getItem(NEKO_SYSTEM_STORE_KEY);
      return raw ? normalizeNekoSystemState(JSON.parse(raw)) : createNekoSystemState();
    } catch {
      return createNekoSystemState();
    }
  }

  function saveNekoSystemState() {
    try {
      localStorage.setItem(NEKO_SYSTEM_STORE_KEY, JSON.stringify(normalizeNekoSystemState(nekoSystemState)));
    } catch {
      // Local memory is best-effort only.
    }
  }

  function onNekoEvent(type, handler) {
    if (typeof handler !== "function") return () => {};
    const key = String(type || "*");
    if (!nekoEventSubscribers.has(key)) nekoEventSubscribers.set(key, new Set());
    const bucket = nekoEventSubscribers.get(key);
    bucket.add(handler);
    return () => bucket.delete(handler);
  }

  function emitNekoEvent(type, payload = {}) {
    const event = { type: String(type || "event"), payload, time: Date.now() };
    nekoEventHistory.push(event);
    if (nekoEventHistory.length > NEKO_EVENT_HISTORY_LIMIT) {
      nekoEventHistory.splice(0, nekoEventHistory.length - NEKO_EVENT_HISTORY_LIMIT);
    }
    nekoSystemState.counters.events += 1;
    for (const key of [event.type, "*"]) {
      const bucket = nekoEventSubscribers.get(key);
      if (!bucket) continue;
      for (const handler of Array.from(bucket)) {
        try {
          handler(event);
        } catch (error) {
          console.warn("[BC Neko Enhancer] event handler failed", error);
        }
      }
    }
    return event;
  }

  function detectNekoSensitiveZone(feature, text = "") {
    const value = `${feature?.id || ""} ${feature?.label || ""} ${feature?.description || ""} ${text || ""}`.toLowerCase();
    if (/ear|耳/.test(value)) return "ear";
    if (/tail|尾/.test(value)) return "tail";
    if (/nape|neck|后颈|脖子|颈/.test(value)) return "nape";
    if (/chin|下巴/.test(value)) return "chin";
    if (/belly|肚子|腹/.test(value)) return "belly";
    return "general";
  }

  function touchNekoSensitivity(zone, amount = 1) {
    const key = NEKO_SENSITIVE_ZONES.includes(zone) ? zone : "general";
    const next = clamp(Number(nekoSystemState.sensitivity[key] || 0) + Number(amount || 1), 0, 10);
    nekoSystemState.sensitivity[key] = next;
    emitNekoEvent("sensitivity", { zone: key, value: next });
    saveNekoSystemState();
    return next;
  }

  function getNekoRelationProfile(memberNumber) {
    const member = Number(memberNumber);
    if (!Number.isFinite(member) || member <= 0) return null;
    const key = String(member);
    if (!nekoSystemState.relations[key]) {
      nekoSystemState.relations[key] = { warmth: 0, trust: 0, familiar: 0, touches: 0, reactions: 0, lastAt: 0 };
    }
    return nekoSystemState.relations[key];
  }

  function warmNekoRelationship(memberNumber, options = {}) {
    const member = Number(memberNumber);
    if (!member || isOwnSender(member)) return null;
    const profile = getNekoRelationProfile(member);
    if (!profile) return null;
    const relation = getRelationshipStatus(member);
    const relationBoost = relation === "dual" ? 3 : relation === "owner" || relation === "lover" ? 2 : 0;
    const touch = options.touch ? 1 : 0;
    profile.warmth = clamp(profile.warmth + 1 + relationBoost + touch, -20, 100);
    profile.trust = clamp(profile.trust + (options.gentle ? 2 : 1) + relationBoost, -20, 100);
    profile.familiar = clamp(profile.familiar + 2, 0, 100);
    profile.reactions += 1;
    profile.touches += touch;
    profile.lastAt = Date.now();
    emitNekoEvent("relationship", { memberNumber: member, relation, profile: { ...profile } });
    saveNekoSystemState();
    return profile;
  }

  function nekoRelationTier(profile) {
    const warmth = Number(profile?.warmth || 0);
    if (warmth >= 80) return "bonded";
    if (warmth >= 55) return "trusted";
    if (warmth >= 30) return "warm";
    if (warmth >= 12) return "familiar";
    return "new";
  }

  function setNekoPersistentMood(mood, duration = NEKO_STATE_DURATION, source = "system") {
    if (!mood) return;
    nekoFeatureMood = mood;
    nekoFeatureMoodAt = Date.now();
    nekoSystemState.mood = {
      value: mood,
      until: Date.now() + Math.max(15000, Number(duration || NEKO_STATE_DURATION)),
      source,
    };
    emitNekoEvent("mood", { mood, source, until: nekoSystemState.mood.until });
    saveNekoSystemState();
  }

  function voiceStrengthForContext({ zone = "general", memberNumber = 0, mood = "default", requested = 0 } = {}) {
    const sensitivity = Number(nekoSystemState.sensitivity[zone] || 0);
    const relation = memberNumber && !isOwnSender(memberNumber) ? getNekoRelationProfile(memberNumber) : null;
    const warmth = Number(relation?.warmth || 0);
    let strength = Number(requested || 0) || 1;
    if (sensitivity >= 7) strength += 2;
    else if (sensitivity >= 3) strength += 1;
    if (warmth >= 55) strength += 1;
    if (["shy", "alert", "angry", "nervous", "embarrassed"].includes(mood)) strength += 1;
    return Math.max(1, Math.min(3, strength));
  }

  function voiceSoundForStrength(base, strength, mood = "default") {
    const value = String(base || "").replace(/\*/g, "").trim();
    if (strength <= 1) return value || "mew";
    if (mood === "angry" || mood === "alert" || mood === "nervous") return strength >= 3 ? "hiss!" : "nyah";
    if (mood === "happy" || mood === "calm") return strength >= 3 ? "purrr" : "purr";
    if (mood === "sleepy") return strength >= 3 ? "mrrr" : "murr";
    return strength >= 3 ? "nyaaa" : (value || "nyaa");
  }

  function simulateNekoTargetReaction(feature, memberNumber, strength = 1) {
    const member = Number(memberNumber);
    if (!member || isOwnSender(member)) return;
    const profile = warmNekoRelationship(member, { touch: feature?.scope === "target" || feature?.scope === "both", gentle: feature?.particle !== "sparkle" });
    const tier = nekoRelationTier(profile);
    const combo = tier === "bonded" ? 4 : tier === "trusted" ? 3 : Math.max(1, strength);
    spawnAtmosphereForMember(member, nekoFeatureParticleText(feature), getRelationshipStatus(member), combo);
    emitNekoEvent("target-reaction", { memberNumber: member, feature: feature?.id, tier, strength });
  }

  function summarizeNekoSystems() {
    const relations = Object.entries(nekoSystemState.relations)
      .sort((a, b) => Number(b[1]?.lastAt || 0) - Number(a[1]?.lastAt || 0))
      .slice(0, 8)
      .map(([memberNumber, profile]) => ({ memberNumber: Number(memberNumber), tier: nekoRelationTier(profile), ...profile }));
    return {
      sensitivity: { ...nekoSystemState.sensitivity },
      mood: { current: currentNekoFeatureMood(), ...nekoSystemState.mood },
      relations,
      counters: { ...nekoSystemState.counters },
      recentEvents: nekoEventHistory.slice(-10),
    };
  }

  function habitStyleLabel() {
    if (habitProfile.actionStyle === "playful") return "活泼";
    if (habitProfile.actionStyle === "cozy") return "黏人";
    return "温柔";
  }

  function preferredKaomojiItems() {
    const preferred = getKaomojiItemsForGroup(habitProfile.kaomojiBias);
    return preferred.length ? preferred : getActiveKaomojiItems();
  }

  function pickRandomKaomoji() {
    const items = Math.random() < 0.68 ? preferredKaomojiItems() : getActiveKaomojiItems();
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

  function normalizeStringArray(value) {
    return Array.isArray(value) ? value.map((item) => String(item || "").trim()).filter(Boolean) : [];
  }

  function normalizeRpPrefixArray(value) {
    return Array.isArray(value) ? value.map((item) => String(item || "").trim()) : [];
  }

  function normalizeRpReplacements(value) {
    if (!Array.isArray(value)) return [];
    return value
      .map((item) => {
        if (Array.isArray(item)) return [String(item[0] || ""), String(item[1] || "")];
        if (item && typeof item === "object") return [String(item.from || ""), String(item.to || "")];
        return null;
      })
      .filter((item) => item && item[0]);
  }

  function normalizeRpActionPack(value) {
    const actions = {};
    for (const kind of ["hug", "pat", "feed", "cuddle", "kiss", "default"]) {
      const pack = value?.[kind];
      const target = normalizeStringArray(pack?.target);
      const self = normalizeStringArray(pack?.self);
      if (target.length || self.length) actions[kind] = { target, self };
    }
    return actions;
  }

  function normalizeRpTone(id, source = {}, fallback = {}) {
    const chat = source.chat || {};
    const fallbackChat = fallback.chat || {};
    const suffixes = normalizeStringArray(chat.suffixes).length
      ? normalizeStringArray(chat.suffixes)
      : normalizeStringArray(fallbackChat.suffixes || fallback.suffix);
    return {
      ...fallback,
      id,
      label: String(source.label || fallback.label || id),
      enabled: source.enabled !== false,
      suffix: String(source.suffix || fallback.suffix || suffixes[0] || "喵"),
      actionTarget: source.actionTarget || fallback.actionTarget,
      actionSelf: source.actionSelf || fallback.actionSelf,
      chat: {
        replacements: normalizeRpReplacements(chat.replacements).length
          ? normalizeRpReplacements(chat.replacements)
          : normalizeRpReplacements(fallbackChat.replacements),
        prefixes: normalizeRpPrefixArray(chat.prefixes).length
          ? normalizeRpPrefixArray(chat.prefixes)
          : normalizeRpPrefixArray(fallbackChat.prefixes),
        suffixes,
        endingChance: Number.isFinite(Number(chat.endingChance))
          ? clamp(Number(chat.endingChance), 0, 1)
          : Number.isFinite(Number(fallbackChat.endingChance))
            ? clamp(Number(fallbackChat.endingChance), 0, 1)
            : null,
        kaomojiChance: Number.isFinite(Number(chat.kaomojiChance))
          ? clamp(Number(chat.kaomojiChance), 0, 1)
          : Number.isFinite(Number(fallbackChat.kaomojiChance))
            ? clamp(Number(fallbackChat.kaomojiChance), 0, 1)
            : null,
      },
      whisper: {
        prefix: String(source.whisper?.prefix || fallback.whisper?.prefix || ""),
        endingChance: Number.isFinite(Number(source.whisper?.endingChance))
          ? clamp(Number(source.whisper.endingChance), 0, 1)
          : Number.isFinite(Number(fallback.whisper?.endingChance))
            ? clamp(Number(fallback.whisper.endingChance), 0, 1)
            : null,
      },
      actions: {
        ...normalizeRpActionPack(fallback.actions),
        ...normalizeRpActionPack(source.actions),
      },
    };
  }

  function normalizeRpLibrary(source) {
    const raw = source?.tonePresets || {};
    const entries = Array.isArray(raw)
      ? raw.map((tone, index) => [tone?.id || `tone-${index}`, tone])
      : Object.entries(raw);
    const tonePresets = {};

    for (const [id, tone] of Object.entries(RP_TONE_PRESETS)) {
      tonePresets[id] = normalizeRpTone(id, tone, {});
    }

    for (const [rawId, tone] of entries) {
      const id = String(rawId === "brief" ? "simple" : rawId || "").trim();
      if (!id || !tone || typeof tone !== "object") continue;
      tonePresets[id] = normalizeRpTone(id, tone, tonePresets[id] || {});
    }

    if (!tonePresets.simple && tonePresets.brief) {
      tonePresets.simple = normalizeRpTone("simple", tonePresets.brief, RP_TONE_PRESETS.simple);
      delete tonePresets.brief;
    }

    return {
      version: String(source?.version || "unknown"),
      updatedAt: source?.updatedAt || "",
      tonePresets,
    };
  }

  function loadCachedRpLibrary() {
    try {
      const raw = localStorage.getItem(RP_LIBRARY_CACHE_KEY);
      return raw ? normalizeRpLibrary(JSON.parse(raw)) : null;
    } catch {
      return null;
    }
  }

  function cacheRpLibrary(library) {
    try {
      localStorage.setItem(RP_LIBRARY_CACHE_KEY, JSON.stringify(library));
    } catch {
      // Ignore storage failures; the builtin RP library still works.
    }
  }

  function loadRemoteRpLibrary() {
    return requestText(RP_LIBRARY_URL)
      .then((text) => {
        const library = normalizeRpLibrary(JSON.parse(text));
        rpLibrary = library;
        cacheRpLibrary(library);
        bugRp = normalizeBugRpConfig(bugRp);
        saveBugRpConfig();
        console.log(`[BC 猫娘增强] Bug RP 语气库已加载: ${library.version}, ${Object.keys(library.tonePresets || {}).length} 套人设`);
        return library;
      })
      .catch((error) => {
        console.warn("[BC 猫娘增强] 远程 Bug RP 语气库加载失败，使用缓存/内置库:", error);
        return rpLibrary;
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

  function ensureFirstChatroomHelpHintStyle() {
    if (document.getElementById("bcn-first-chatroom-help-style")) return;
    const style = document.createElement("style");
    style.id = "bcn-first-chatroom-help-style";
    style.textContent = `
      #bcn-first-chatroom-help {
        position: fixed;
        left: 28px;
        top: 28px;
        z-index: 2147483646;
        max-width: min(720px, calc(100vw - 48px));
        padding: 20px 24px;
        border-radius: 22px;
        background:
          linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(255, 248, 252, 0.94)),
          rgba(255, 255, 255, 0.96);
        border: 1px solid rgba(205, 165, 225, 0.42);
        box-shadow: 0 16px 36px rgba(156, 111, 201, 0.18);
        color: #9c6fc9;
        font-family: "Segoe UI", "Microsoft YaHei", sans-serif;
        line-height: 1.35;
        pointer-events: none;
        opacity: 0;
        transform: translateY(-6px);
        animation: bcnFirstChatroomHelpIn 220ms ease-out forwards;
      }
      #bcn-first-chatroom-help .bcn-help-title {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 10px;
        font-size: 24px;
        font-weight: 700;
      }
      #bcn-first-chatroom-help .bcn-help-icon {
        font-size: 28px;
        line-height: 1;
      }
      #bcn-first-chatroom-help .bcn-help-line {
        font-size: 22px;
        font-weight: 500;
        word-break: break-word;
      }
      @keyframes bcnFirstChatroomHelpIn {
        from {
          opacity: 0;
          transform: translateY(-6px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
  }

  function showFirstChatroomHelpHint() {
    if (!document.body || W.CurrentScreen !== "ChatRoom") return;
    ensureFirstChatroomHelpHintStyle();
    clearTimeout(firstChatroomHelpTimer);
    document.getElementById("bcn-first-chatroom-help")?.remove();
    const hint = document.createElement("div");
    hint.id = "bcn-first-chatroom-help";
    hint.innerHTML = `
      <div class="bcn-help-title">
        <span class="bcn-help-icon" aria-hidden="true">📝</span>
        <span>可用指令：</span>
      </div>
      <div class="bcn-help-line">/neko help 获取猫娘插件说明喵~</div>
    `;
    document.body.appendChild(hint);
    firstChatroomHelpTimer = setTimeout(() => {
      hint.remove();
      firstChatroomHelpTimer = 0;
    }, 5000);
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

  function isNekoCommandText(text) {
    return typeof text === "string" && /^\/(?:neko|bug|noke)(?:\s|$)/i.test(text.trim());
  }

  function isBugCommandText(text) {
    return isNekoCommandText(text);
  }

  function maybeAddToneSuffix(text, suffix, chance = 1) {
    const value = String(text || "").trim();
    if (!value || Math.random() > chance) return value;
    if (/[喵呢呀哼。！？~～]$/.test(value)) return value;
    return `${value}${suffix}`;
  }

  function applySignatureTail(type, text) {
    if (!["Chat", "Whisper"].includes(type)) return text;
    const value = String(text || "").trim();
    if (!value || value.length > 90) return text;
    if (hasKnownKaomoji(value)) return text;
    if (/(\u0e45|=\)|\^\)|\u55b5\u5c3e\u5df4)\s*$/.test(value)) return text;
    const chance = type === "Whisper" ? 0.78 : 0.48;
    if (Math.random() > chance) return text;
    return `${value}${SIGNATURE_TAILS[Math.floor(Math.random() * SIGNATURE_TAILS.length)]}`;
  }

  function applyHabitTail(type, text) {
    if (!["Chat", "Whisper"].includes(type)) return text;
    const value = String(text || "").trim();
    if (!value || hasKnownKaomoji(value)) return text;
    const escapedTail = habitProfile.tail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`${escapedTail}$`).test(value)) return text;
    if (Math.random() > 0.26) return text;
    return `${value} ${habitProfile.tail}`;
  }

  function updateTailMoodUi() {
    const badge = document.getElementById("bcn-tail-meter");
    if (!badge) return;
    badge.textContent = `${tailMoodCount}/${TAIL_MOOD_MAX}`;
    badge.dataset.full = tailMoodCount >= TAIL_MOOD_MAX ? "1" : "0";
    badge.title = `尾巴心情 ${tailMoodCount}/${TAIL_MOOD_MAX} | 习惯尾巴：${habitProfile.tail} | 动作偏好：${habitStyleLabel()}`;
  }

  function triggerTailMoodBurst(reason = "") {
    tailMoodCount = 0;
    updateTailMoodUi();
    pawRain("Chat");
    spawnAtmosphereForMember(W.Player, "抱抱 贴贴 亲亲", null, 3);
    showToast(reason ? `尾巴开心地晃个不停喵，${reason}~` : "尾巴开心地晃个不停喵~");
  }

  function incrementTailMood(reason = "") {
    tailMoodCount = Math.min(TAIL_MOOD_MAX, tailMoodCount + 1);
    updateTailMoodUi();
    if (tailMoodCount >= TAIL_MOOD_MAX) triggerTailMoodBurst(reason);
  }

  function registerAffectionCombo(sender, text) {
    if (!AFFECTION_KEYWORDS.test(String(text || ""))) return 0;
    const now = Date.now();
    const senderNumber = memberNumberOf(sender) || 0;
    if (senderNumber && intimacyCombo.sender === senderNumber && now - intimacyCombo.lastAt <= AFFECTION_COMBO_WINDOW) {
      intimacyCombo.count = Math.min(3, intimacyCombo.count + 1);
    } else if (!senderNumber && now - intimacyCombo.lastAt <= AFFECTION_COMBO_WINDOW) {
      intimacyCombo.count = Math.min(3, intimacyCombo.count + 1);
    } else {
      intimacyCombo.count = 1;
    }
    intimacyCombo.lastAt = now;
    intimacyCombo.sender = senderNumber;
    return intimacyCombo.count;
  }

  function maybeReactToIncomingAffection(data, text) {
    if (!data || isOwnSender(data?.Sender) || !AFFECTION_KEYWORDS.test(String(text || ""))) return;
    const now = Date.now();
    if (now - affectionReactionAt < AFFECTION_REACTION_COOLDOWN) return;
    affectionReactionAt = now;
    const lines = [
      "猫耳轻轻抖了抖喵。",
      "尾巴没忍住晃了一下喵。",
      "心口像被轻轻蹭了一下喵。",
    ];
    showToast(lines[Math.floor(Math.random() * lines.length)]);
    spawnAtmosphereForMember(W.Player, "贴贴 抱抱", getRelationshipStatus(data.Sender), 2);
  }

  function collectReplySuggestions(text) {
    const value = String(text || "");
    const suggestions = [];
    for (const entry of REPLY_SUGGESTION_LIBRARY) {
      if (!entry?.pattern?.test?.(value)) continue;
      for (const reply of entry.replies || []) {
        if (reply && !suggestions.includes(reply)) suggestions.push(reply);
      }
    }
    return suggestions.slice(0, 4);
  }

  function renderReplySuggestions() {
    const panel = document.getElementById("bcn-panel");
    const wrap = document.getElementById("bcn-reply-suggestions");
    if (!panel || !wrap) return;
    wrap.innerHTML = "";
    panel.classList.toggle("has-replies", activeReplySuggestions.length > 0);
    if (!activeReplySuggestions.length) return;
    const title = document.createElement("div");
    title.className = "bcn-reply-title";
    title.textContent = "猫猫回应建议";
    wrap.appendChild(title);
    activeReplySuggestions.forEach((reply) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "bcn-reply-chip";
      button.textContent = reply;
      button.title = "点一下填入聊天框";
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        insertReplySuggestion(reply);
      });
      wrap.appendChild(button);
    });
  }

  function hideReplySuggestions() {
    activeReplySuggestions = [];
    clearTimeout(replySuggestionTimer);
    replySuggestionTimer = 0;
    renderReplySuggestions();
  }

  function showReplySuggestions(suggestions, duration = REPLY_SUGGESTION_DURATION) {
    activeReplySuggestions = Array.from(new Set((suggestions || []).filter(Boolean))).slice(0, 4);
    renderReplySuggestions();
    clearTimeout(replySuggestionTimer);
    if (!activeReplySuggestions.length) return;
    replySuggestionTimer = setTimeout(() => hideReplySuggestions(), duration);
  }

  function insertReplySuggestion(text) {
    const input = getChatInput();
    if (!input) {
      showToast("还没找到聊天框喵。");
      return;
    }
    const oldValue = input.value || "";
    const glue = oldValue && !/\s$/.test(oldValue) ? " " : "";
    input.value = `${oldValue}${glue}${text}`;
    input.dispatchEvent(new InputEvent("input", { bubbles: true }));
    input.focus();
    if (typeof input.setSelectionRange === "function") {
      const pos = input.value.length;
      input.setSelectionRange(pos, pos);
    }
    showToast("把小回应放进聊天框啦喵。");
    hideReplySuggestions();
  }

  function scenePack(id, label, source, triggers, lines) {
    return { id, label, source, triggers, lines };
  }

  function escapeScenePattern(value) {
    return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function cleanSceneText(value) {
    return String(value || "")
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 180);
  }

  function nekoFeature(id, label, source, triggers, scope, mood, particle, sound, description) {
    return {
      id,
      label,
      source,
      triggers,
      scope,
      mood,
      particle,
      sound,
      description,
      pattern: new RegExp((triggers || []).map(escapeScenePattern).join("|"), "i"),
    };
  }

  function currentNekoFeatureMood() {
    const persisted = nekoSystemState?.mood;
    if (persisted?.value && persisted.value !== "default" && Date.now() < Number(persisted.until || 0)) return persisted.value;
    if (!nekoFeatureMoodAt || Date.now() - nekoFeatureMoodAt > NEKO_STATE_DURATION) return "default";
    return nekoFeatureMood || "default";
  }

  function setNekoFeatureMood(mood) {
    if (!mood) return;
    setNekoPersistentMood(mood, NEKO_STATE_DURATION, "feature");
  }

  function nekoFeatureTargetMember(data, scope) {
    if (scope === "self") return W.Player?.MemberNumber || Number(data?.Sender) || 0;
    const sender = Number(data?.Sender) || 0;
    if (sender && !isOwnSender(sender)) return sender;
    const selected = getSelectedTarget();
    return selected?.MemberNumber || sender || W.Player?.MemberNumber || 0;
  }

  function nekoFeatureParticleText(feature) {
    if (feature.particle === "heart") return "贴贴 抱抱 亲亲";
    if (feature.particle === "sparkle") return "开心 闪闪 发光";
    if (feature.particle === "paw") return "猫爪 爪爪 喵";
    return "喵 贴贴";
  }

  function pruneNekoFeatureCooldowns(now = Date.now()) {
    if (nekoFeatureCooldowns.size < 360) return;
    for (const [key, time] of nekoFeatureCooldowns) {
      if (now - Number(time || 0) > 60000) nekoFeatureCooldowns.delete(key);
    }
    if (nekoFeatureCooldowns.size > 520) nekoFeatureCooldowns.clear();
  }

  function runNekoFeatureEffect(feature, data, text, direction = "incoming") {
    if (!config.enabled || !feature) return false;
    const now = Date.now();
    pruneNekoFeatureCooldowns(now);
    const key = `${feature.id}:${direction}`;
    const dedupeKey = `${feature.id}:${Number(data?.Sender) || 0}:${cleanSceneText(text || data?.Content).slice(0, 90)}`;
    if (now - (nekoFeatureCooldowns.get(dedupeKey) || 0) < 1200) return false;
    if (now - (nekoFeatureCooldowns.get(key) || 0) < 4500) return false;
    nekoFeatureCooldowns.set(dedupeKey, now);
    nekoFeatureCooldowns.set(key, now);
    const zone = detectNekoSensitiveZone(feature, text);
    const member = nekoFeatureTargetMember(data, feature.scope);
    const sensitivity = touchNekoSensitivity(zone, feature.scope === "self" ? 1.2 : 0.7);
    const strength = voiceStrengthForContext({ zone, memberNumber: member, mood: feature.mood });
    nekoSystemState.counters.reactions += 1;
    setNekoFeatureMood(feature.mood);
    emitNekoEvent("feature", { feature: feature.id, direction, zone, sensitivity, strength, memberNumber: member });
    if (feature.scope === "both") {
      spawnAtmosphereForMember(W.Player, nekoFeatureParticleText(feature), null, strength);
      if (member) spawnAtmosphereForMember(member, nekoFeatureParticleText(feature), getRelationshipStatus(member), strength);
    } else if (member) {
      spawnAtmosphereForMember(member, nekoFeatureParticleText(feature), getRelationshipStatus(member), strength);
    }
    if (member) simulateNekoTargetReaction(feature, member, strength);
    if (feature.sound) {
      triggerNekoVoiceEffect(feature.label, {
        memberNumber: feature.scope === "target" ? member : W.Player?.MemberNumber,
        mood: feature.mood,
        sound: feature.sound,
        zone,
        strength,
      });
    }
    const target = sceneSparkTargetName(data);
    const sound = feature.sound ? `*${feature.sound}* ` : "";
    const reply = `${sound}${feature.label.replace(/猫猫/g, "猫娘")}：${feature.description}`.replace(/\{target\}/g, target);
    if (config.replySuggestionsEnabled || config.sceneSparkEnabled) {
      const suggestions = [];
      if (config.replySuggestionsEnabled) suggestions.push(reply);
      if (config.sceneSparkEnabled) suggestions.push(...collectSceneSparkSuggestions(data, text, { fallback: false }));
      if (suggestions.length) showReplySuggestions(suggestions.slice(0, 4), NEKO_SCENE_SPARK_DURATION);
    }
    showToast(`${feature.label}：${feature.sound || feature.mood} 喵~`);
    return true;
  }

  function getNekoVoiceOverlay() {
    let overlay = document.getElementById("bcn-voice-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "bcn-voice-overlay";
      document.body?.appendChild(overlay);
    }
    return overlay;
  }

  function bcPointToViewport(x, y) {
    const canvas = document.getElementById("MainCanvas");
    const rect = canvas?.getBoundingClientRect?.();
    if (!rect) return { x: window.innerWidth * 0.25, y: window.innerHeight * 0.35 };
    return {
      x: rect.left + (Number(x) / 2000) * rect.width,
      y: rect.top + (Number(y) / 1000) * rect.height,
    };
  }

  function nekoVoiceAnchor(memberNumber = 0, body = false) {
    const member = memberNumberOf(memberNumber) || memberNumberOf(W.Player);
    const anchor = characterAnchors.get(member) || characterAnchors.get(memberNumberOf(W.Player));
    if (!anchor) return { x: window.innerWidth * 0.25, y: window.innerHeight * (body ? 0.55 : 0.25) };
    return bcPointToViewport(anchor.x, anchor.y + (body ? 360 * anchor.zoom : 0));
  }

  function saveNekoExpression() {
    const groups = ["Eyebrows", "Eyes", "Mouth", "Blush"];
    const saved = {};
    for (const group of groups) {
      const item = W.Player?.Appearance?.find?.((entry) => entry?.Asset?.Group?.Name === group);
      saved[group] = item?.Property?.Expression ?? null;
    }
    return saved;
  }

  function applyNekoExpression(values) {
    if (typeof W.CharacterSetFacialExpression !== "function" || !W.Player) return;
    for (const [group, value] of Object.entries(values || {})) {
      try {
        W.CharacterSetFacialExpression(W.Player, group, value);
      } catch {}
    }
  }

  function nekoExpressionForMood(mood) {
    const map = {
      happy: { Eyebrows: "Soft", Eyes: "Happy", Mouth: "Smile", Blush: "Medium" },
      shy: { Eyebrows: "Soft", Eyes: "LewdHeartPink", Mouth: "Moan", Blush: "High" },
      sad: { Eyebrows: "Sad", Eyes: "Dazed", Mouth: "Frown", Blush: "Low" },
      sleepy: { Eyebrows: "Soft", Eyes: "Closed", Mouth: "Open", Blush: "Low" },
      alert: { Eyebrows: "Raised", Eyes: "Surprised", Mouth: "Open", Blush: "Medium" },
      angry: { Eyebrows: "Angry", Eyes: "Dazed", Mouth: "Frown", Blush: "Medium" },
      cool: { Eyebrows: "Lowered", Eyes: "Dazed", Mouth: "Frown", Blush: "Low" },
    };
    return map[mood] || map.shy;
  }

  function triggerNekoVoiceFlash() {
    const overlay = getNekoVoiceOverlay();
    const flash = document.createElement("div");
    flash.className = "bcn-voice-flash";
    overlay.appendChild(flash);
    setTimeout(() => flash.remove(), NEKO_VOICE_EFFECT_DURATION + 200);
  }

  function triggerNekoVoiceWaves(memberNumber) {
    const overlay = getNekoVoiceOverlay();
    const pos = nekoVoiceAnchor(memberNumber, false);
    const wrap = document.createElement("div");
    wrap.className = "bcn-voice-waves";
    wrap.style.left = `${pos.x + (Math.random() - 0.5) * 80}px`;
    wrap.style.top = `${pos.y + (Math.random() - 0.5) * 60}px`;
    for (let i = 0; i < 5; i++) {
      const ring = document.createElement("span");
      ring.style.animationDelay = `${i * 280}ms`;
      wrap.appendChild(ring);
    }
    overlay.appendChild(wrap);
    setTimeout(() => wrap.remove(), NEKO_VOICE_EFFECT_DURATION + 1300);
  }

  function triggerNekoVoiceDanmaku(text) {
    const overlay = getNekoVoiceOverlay();
    const pool = [text].concat(nekoVoicePhrases).filter(Boolean);
    for (let i = 0; i < 4; i++) {
      const line = document.createElement("div");
      line.className = "bcn-voice-danmaku";
      line.textContent = pool[Math.floor(Math.random() * pool.length)];
      line.style.left = `${40 + Math.random() * Math.min(680, window.innerWidth * 0.45)}px`;
      line.style.top = `${60 + Math.random() * Math.min(620, window.innerHeight * 0.72)}px`;
      line.style.animationDelay = `${i * 170}ms`;
      overlay.appendChild(line);
      setTimeout(() => line.remove(), NEKO_VOICE_EFFECT_DURATION + 900);
    }
  }

  function triggerNekoVoiceSteam(memberNumber) {
    const overlay = getNekoVoiceOverlay();
    const pos = nekoVoiceAnchor(memberNumber, true);
    for (let i = 0; i < 14; i++) {
      const dot = document.createElement("span");
      dot.className = "bcn-voice-steam";
      const size = 4 + Math.random() * 8;
      dot.style.width = `${size}px`;
      dot.style.height = `${size}px`;
      dot.style.left = `${pos.x + (Math.random() - 0.5) * 130}px`;
      dot.style.top = `${pos.y + (Math.random() - 0.5) * 40}px`;
      dot.style.animationDelay = `${Math.random() * 900}ms`;
      dot.style.animationDuration = `${1400 + Math.random() * 1400}ms`;
      overlay.appendChild(dot);
      setTimeout(() => dot.remove(), 3400);
    }
  }

  async function runNekoVoiceEffect(entry) {
    const text = cleanSceneText(entry?.text || "");
    const member = memberNumberOf(entry?.memberNumber) || memberNumberOf(W.Player);
    const mood = entry?.mood || currentNekoFeatureMood();
    const zone = entry?.zone || "general";
    const strength = voiceStrengthForContext({ zone, memberNumber: member, mood, requested: entry?.strength });
    const sound = voiceSoundForStrength(entry?.sound, strength, mood);
    setNekoPersistentMood(mood === "default" ? "shy" : mood, NEKO_STATE_DURATION, "voice");
    nekoSystemState.counters.voice += 1;
    emitNekoEvent("voice", { text, memberNumber: member, mood, zone, strength, sound });
    saveNekoSystemState();
    const saved = saveNekoExpression();
    clearTimeout(nekoExpressionRestoreTimer);
    applyNekoExpression(nekoExpressionForMood(currentNekoFeatureMood()));
    triggerNekoVoiceFlash();
    for (let i = 0; i < strength; i++) triggerNekoVoiceWaves(member);
    triggerNekoVoiceDanmaku(text || "NekoVoice");
    triggerNekoVoiceSteam(member);
    spawnAtmosphereForMember(member || W.Player, "heart paw sparkle purr", null, strength + 1);
    if (config.replySuggestionsEnabled) showReplySuggestions([`*${sound}* ${text || "NekoVoice effect"}`], NEKO_SCENE_SPARK_DURATION);
    await new Promise((resolve) => setTimeout(resolve, NEKO_VOICE_EFFECT_DURATION));
    nekoExpressionRestoreTimer = setTimeout(() => applyNekoExpression(saved), 60);
  }

  async function processNekoVoiceQueue() {
    if (nekoVoicePlaying || !nekoVoiceQueue.length) return;
    nekoVoicePlaying = true;
    try {
      await runNekoVoiceEffect(nekoVoiceQueue.shift());
    } catch (error) {
      console.warn("[BC Neko Enhancer] NekoVoice effect failed", error);
    } finally {
      nekoVoicePlaying = false;
      if (nekoVoiceQueue.length) setTimeout(processNekoVoiceQueue, 180);
    }
  }

  function triggerNekoVoiceEffect(text = "", options = {}) {
    const zone = options.zone || "general";
    const memberNumber = options.memberNumber || W.Player?.MemberNumber;
    const mood = options.mood || currentNekoFeatureMood();
    const strength = voiceStrengthForContext({ zone, memberNumber, mood, requested: options.strength });
    const entry = {
      text: cleanSceneText(text || options.text || "NekoVoice"),
      memberNumber,
      mood,
      zone,
      strength,
      sound: voiceSoundForStrength(options.sound || "mew", strength, mood),
    };
    if (nekoVoiceQueue.length >= NEKO_VOICE_QUEUE_LIMIT) nekoVoiceQueue.shift();
    nekoVoiceQueue.push(entry);
    processNekoVoiceQueue();
    return true;
  }

  function maybeTriggerNekoVoiceFromText(data, text, direction = "incoming") {
    const value = String(text || data?.Content || "");
    const match = value.match(NEKO_VOICE_TRIGGER);
    if (!match) return false;
    const key = `${Number(data?.Sender) || 0}:${match[1] || value}`;
    const now = Date.now();
    if (key === nekoVoiceLastTriggerKey && now - nekoVoiceLastTriggerAt < 1200) return true;
    nekoVoiceLastTriggerKey = key;
    nekoVoiceLastTriggerAt = now;
    triggerNekoVoiceEffect(match[1] || value, {
      memberNumber: nekoFeatureTargetMember(data, isOwnSender(data?.Sender) ? "self" : "target"),
      mood: currentNekoFeatureMood(),
      sound: "nyaa",
      zone: detectNekoSensitiveZone(null, match[1] || value),
      direction,
    });
    return true;
  }

  function handleNekoInteractionFeatures(data, text, direction = "incoming") {
    if (!config.enabled) return null;
    const value = cleanSceneText(text || data?.Content);
    if (!value || value === PEER_SIGNAL_CONTENT || isNekoCommandText(value)) return null;
    for (const feature of NEKO_INTERACTION_FEATURES) {
      if (!feature.pattern.test(value)) continue;
      runNekoFeatureEffect(feature, data, value, direction);
      return feature;
    }
    return null;
  }

  function applyNekoFeatureMood(text) {
    const mood = currentNekoFeatureMood();
    if (mood === "default" || !text || /[。.!?！？]$/.test(text)) return text;
    const tails = {
      happy: " 开心地喵~",
      sad: " 小声喵...",
      cool: " 哼喵。",
      clingy: " 想贴贴喵~",
      sleepy: " 困困喵...",
      alert: " 耳朵竖起来喵!",
      maid: " 遵命喵。",
      princess: " 勉强可以喵。",
      nurse: " 要慢慢来喵。",
      pet: " 乖乖喵~",
      shy: " 脸红喵...",
      nervous: " 有点紧张喵...",
      angry: " 炸毛喵!",
      tsundere: " 才不是特意的喵。",
    };
    return `${text}${tails[mood] || " 喵~"}`;
  }

  function recordSceneMemory(data, msg) {
    const type = String(data?.Type || "");
    if (!["Chat", "Whisper", "Emote", "Action"].includes(type)) return;
    const text = cleanSceneText(msg || data?.Content);
    if (!text || text === PEER_SIGNAL_CONTENT || isNekoCommandText(text)) return;
    const sender = Number(data?.Sender) || 0;
    const now = Date.now();
    const last = sceneMemory[sceneMemory.length - 1];
    if (last && last.sender === sender && last.type === type && last.text === text && now - last.time < 2500) return;
    sceneMemory.push({
      sender,
      type,
      text,
      own: isOwnSender(sender),
      time: now,
    });
    if (sceneMemory.length > NEKO_SCENE_MEMORY_LIMIT) {
      sceneMemory.splice(0, sceneMemory.length - NEKO_SCENE_MEMORY_LIMIT);
    }
  }

  function sceneSparkTargetName(data = {}) {
    const senderNumber = Number(data?.Sender) || 0;
    if (senderNumber && !isOwnSender(senderNumber)) {
      return getCharacterName(getCharacterByMemberNumber(senderNumber)) || "对方";
    }
    const selected = getSelectedTarget();
    return selected ? getCharacterName(selected) : "对方";
  }

  function sceneSparkCharacter(data = {}) {
    const senderNumber = Number(data?.Sender) || 0;
    if (senderNumber && !isOwnSender(senderNumber)) return getCharacterByMemberNumber(senderNumber);
    return getSelectedTarget() || W.Player || null;
  }

  function pushSceneSpark(out, lines, target) {
    for (const line of lines || []) {
      const value = String(line || "").replace(/\{target\}/g, target);
      if (value && !out.includes(value)) out.push(value);
      if (out.length >= 4) return;
    }
  }

  function addStateSceneSparks(out, target, character) {
    if (!character || out.length >= 4) return;
    const state = detectCharacterState(character);
    if (state.gagged) {
      pushSceneSpark(out, [
        "靠近{target}听了听含糊的声音，温柔地替对方整理呼吸喵。",
        "用指尖在{target}掌心写下“慢慢来”，然后乖乖蹭了蹭喵。",
      ], target);
    }
    if (state.restrained) {
      pushSceneSpark(out, [
        "绕到{target}身边检查了一圈，尾巴轻轻扫过绳结喵。",
        "贴近{target}小声确认状态，像守着宝物一样守在旁边喵。",
      ], target);
    }
    if (state.kneeling) {
      pushSceneSpark(out, ["蹲到{target}面前歪头看着，轻轻递出一个乖巧的笑喵。"], target);
    }
  }

  function scenePackMatchesQuery(pack, query) {
    const value = `${pack.id} ${pack.label} ${pack.source} ${(pack.triggers || []).join(" ")}`.toLowerCase();
    return value.includes(String(query || "").toLowerCase());
  }

  function collectSceneSparkSuggestions(data = {}, msg = "", options = {}) {
    const target = sceneSparkTargetName(data);
    const latest = sceneMemory[sceneMemory.length - 1]?.text || "";
    const text = cleanSceneText(msg || data?.Content || latest);
    const recent = sceneMemory.slice(-4).map((item) => item.text).join(" ");
    const value = `${text} ${recent}`;
    const query = cleanSceneText(options.query || "");
    const searchValue = `${query} ${value}`;
    const out = [];
    const packs = [
      {
        pattern: /晚安|睡|困|累|good\s*night|sleep/i,
        lines: ["把尾巴轻轻搭在{target}身边，小声说晚安喵。", "替{target}把空气都放轻一点，乖乖陪到睡着喵。"],
      },
      {
        pattern: /摸头|摸摸|pat|head/i,
        lines: ["耳朵被摸得轻轻一抖，忍不住往{target}手心里蹭了蹭喵。", "仰起头等着{target}再摸一下，尾巴已经藏不住开心了喵。"],
      },
      {
        pattern: /抱|贴贴|靠近|hug|cuddle/i,
        lines: ["慢慢贴到{target}身边，把温度一点点蹭过去喵。", "张开手臂向{target}讨一个很软的抱抱喵。"],
      },
      {
        pattern: /亲|吻|喜欢|害羞|脸红|kiss|love/i,
        lines: ["轻轻碰了碰{target}的指尖，脸颊热起来也不肯躲喵。", "把视线挪开又偷偷看回{target}，小声说只是有点开心喵。"],
      },
      {
        pattern: /饿|吃|点心|牛奶|喂|food|milk/i,
        lines: ["捧着小点心递到{target}面前，尾巴期待地晃了晃喵。", "认真把好吃的分给{target}，像完成一件大事一样点点头喵。"],
      },
      {
        pattern: /疼|怕|哭|委屈|难过|安慰|hurt|sad|comfort/i,
        lines: ["靠近{target}轻轻陪着，不催也不闹，只把尾巴搭过去喵。", "小心守在{target}旁边，声音放得很软很软喵。"],
      },
    ];
    for (const pack of packs) {
      if (pack.pattern.test(searchValue)) pushSceneSpark(out, pack.lines, target);
      if (out.length >= 4) break;
    }
    const featurePacks = query
      ? NEKO_SCENE_SPARK_PACKS.filter((pack) => scenePackMatchesQuery(pack, query))
      : NEKO_SCENE_SPARK_PACKS;
    for (const pack of featurePacks) {
      if (query || pack.pattern.test(searchValue)) pushSceneSpark(out, pack.lines, target);
      if (out.length >= 4) break;
    }
    addStateSceneSparks(out, target, sceneSparkCharacter(data));
    if (!out.length && options.fallback !== false) {
      pushSceneSpark(out, [
        "歪头看着{target}，尾巴慢慢晃出一个可爱的弧度喵。",
        "把气氛接住一点，轻轻凑近{target}问要不要继续喵。",
        "认真观察{target}的反应，悄悄把下一句话藏在笑里喵。",
      ], target);
    }
    return out.slice(0, 4);
  }

  function getSceneFeatureLines(query = "") {
    const key = cleanSceneText(query);
    const packs = key ? NEKO_SCENE_SPARK_BLUEPRINTS.filter((pack) => scenePackMatchesQuery(pack, key)) : NEKO_SCENE_SPARK_BLUEPRINTS;
    const lines = [
      "[\u732b\u5a18\u573a\u666f\u529f\u80fd\u5305]",
      "\u603b\u6570\uff1a" + NEKO_SCENE_SPARK_BLUEPRINTS.length + (key ? " | \u641c\u7d22\uff1a" + key + " | \u547d\u4e2d\uff1a" + packs.length : ""),
      "\u7528\u6cd5\uff1a/neko spark <\u5173\u952e\u8bcd>\uff0c\u4f8b\u5982 link / tail / aftercare / maid / \u8499\u773c",
    ];
    for (const pack of packs.slice(0, 12)) {
      lines.push("- " + pack.id + " | " + pack.label + " | " + pack.source);
    }
    if (packs.length > 12) lines.push("... \u8fd8\u6709 " + (packs.length - 12) + " \u9879\uff0c\u8bf7\u52a0\u5173\u952e\u8bcd\u7ee7\u7eed\u7b5b\u9009\u3002");
    return lines;
  }

  function getNekoInteractionFeatureLines(query = "") {
    const key = cleanSceneText(query);
    const features = key
      ? NEKO_INTERACTION_FEATURES.filter((feature) => scenePackMatchesQuery(feature, key))
      : NEKO_INTERACTION_FEATURES;
    const lines = [
      "[\u732b\u5a18\u4e92\u52a8\u529f\u80fd\u7c7b\u76ee]",
      "\u603b\u6570\uff1a" + NEKO_INTERACTION_FEATURES.length + " | \u5f53\u524d\u72b6\u6001\uff1a" + currentNekoFeatureMood() + (key ? " | \u641c\u7d22\uff1a" + key + " | \u547d\u4e2d\uff1a" + features.length : ""),
      "\u7528\u6cd5\uff1a/neko mood \u9ad8\u5174 | \u4f24\u5fc3 | \u9ad8\u51b7 | \u9ecf\u4eba | \u56f0\u56f0 | \u5973\u4ec6",
    ];
    for (const feature of features.slice(0, 12)) {
      lines.push("- " + feature.id + " | " + feature.label + " | " + feature.source);
    }
    if (features.length > 12) lines.push("... \u8fd8\u6709 " + (features.length - 12) + " \u9879\uff0c\u8bf7\u52a0\u5173\u952e\u8bcd\u7b5b\u9009\u3002");
    return lines;
  }

  function handleNekoMoodCommand(parts) {
    const raw = String(parts?.[0] || "status").toLowerCase();
    const moods = {
      "\u9ad8\u5174": "happy",
      "\u5f00\u5fc3": "happy",
      "\u4f24\u5fc3": "sad",
      "\u96be\u8fc7": "sad",
      "\u9ad8\u51b7": "cool",
      "\u9ecf\u4eba": "clingy",
      "\u7c98\u4eba": "clingy",
      "\u56f0\u56f0": "sleepy",
      "\u5973\u4ec6": "maid",
      "\u516c\u4e3b": "princess",
      "\u62a4\u58eb": "nurse",
      happy: "happy",
      sad: "sad",
      cool: "cool",
      clingy: "clingy",
      sleepy: "sleepy",
      maid: "maid",
      princess: "princess",
      nurse: "nurse",
      default: "default",
      off: "default",
    };
    if (raw === "status" || raw === "\u72b6\u6001") {
      sendNekoCommandNotice(["[\u732b\u5a18\u72b6\u6001]", "\u5f53\u524d\uff1a" + currentNekoFeatureMood(), "\u53ef\u7528\uff1a\u9ad8\u5174 / \u4f24\u5fc3 / \u9ad8\u51b7 / \u9ecf\u4eba / \u56f0\u56f0 / \u5973\u4ec6 / \u516c\u4e3b / \u62a4\u58eb"]);
      return true;
    }
    const next = moods[raw] || moods[String(parts?.join("") || "").toLowerCase()];
    if (!next) {
      sendNekoCommandNotice(["[\u732b\u5a18\u72b6\u6001]", "\u672a\u77e5\u72b6\u6001\uff1a" + raw, "\u53ef\u7528\uff1a\u9ad8\u5174 / \u4f24\u5fc3 / \u9ad8\u51b7 / \u9ecf\u4eba / \u56f0\u56f0 / \u5973\u4ec6 / \u516c\u4e3b / \u62a4\u58eb"]);
      return true;
    }
    setNekoFeatureMood(next);
    showToast("\u732b\u5a18\u72b6\u6001\u5df2\u5207\u6362\uff1a" + next);
    return true;
  }

  function showSceneSparkSuggestions(context = {}) {
    if (!config.sceneSparkEnabled) {
      sendNekoCommandNotice(["[Neko spark]", "Scene spark is currently off.", "Use /neko spark on to enable it, or /neko spark off to disable it."]);
      return true;
    }
    const suggestions = collectSceneSparkSuggestions(context.data || {}, context.msg || "", { query: context.query || "" });
    showReplySuggestions(suggestions, NEKO_SCENE_SPARK_DURATION);
    if (suggestions.length) {
      showToast("猫娘灵感已经放到快捷建议里喵~");
      return true;
    }
    sendNekoCommandNotice(["[猫娘灵感]", "暂时没有可用灵感，先选中一个目标或等聊天内容多一点喵。"]);
    return true;
  }

  function handleNekoToggleCommand(key, parts, label) {
    const action = String(parts?.[0] || "status").toLowerCase();
    if (action === "on" || action === "open" || action === "enable" || action === "开启" || action === "开") {
      config[key] = true;
      saveConfig();
      showToast(label + " enabled.");
      sendNekoCommandNotice(["[Neko toggle]", label + ": ON", "Disable: /neko " + (key === "sceneSparkEnabled" ? "spark" : "suggest") + " off"]);
      return true;
    }
    if (action === "off" || action === "close" || action === "disable" || action === "关闭" || action === "关") {
      config[key] = false;
      saveConfig();
      hideReplySuggestions();
      showToast(label + " disabled.");
      sendNekoCommandNotice(["[Neko toggle]", label + ": OFF", "Enable: /neko " + (key === "sceneSparkEnabled" ? "spark" : "suggest") + " on"]);
      return true;
    }
    sendNekoCommandNotice([
      "[Neko toggle]",
      label + ": " + (config[key] ? "ON" : "OFF"),
      "Usage: /neko " + (key === "sceneSparkEnabled" ? "spark" : "suggest") + " on | off | status",
    ]);
    return true;
  }

  function applyRpChatRules(text, tone) {
    const chat = tone?.chat || {};
    let value = relationHonorific(String(text || ""));
    for (const [from, to] of chat.replacements || []) {
      if (!from) continue;
      value = value.split(from).join(to);
    }
    const prefixes = Array.isArray(chat.prefixes) ? chat.prefixes : [];
    if (prefixes.length) {
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)] || "";
      if (prefix && !value.startsWith(prefix)) value = `${prefix}${value}`;
    }
    return value;
  }

  function hasRemoteRpChatRules(tone) {
    const chat = tone?.chat || {};
    return Array.isArray(chat.replacements) && chat.replacements.length;
  }

  function fallbackRpNeko(text, preset) {
    if (preset === "soft") return softNeko(text);
    if (preset === "classic") return classicNeko(text);
    if (preset === "tsundere") return tsundereNeko(text);
    if (preset === "polite") return politeNeko(text);
    if (preset === "simple") return simpleNeko(text);
    return standardNeko(text);
  }

  function softNeko(text) {
    return relationHonorific(text)
      .replace(/我们/g, "咱喵们")
      .replace(/大家/g, "大家猫猫")
      .replace(/本人/g, "人家")
      .replace(/你们/g, "你们猫猫")
      .replace(/您/g, "你")
      .replace(/我/g, "人家")
      .replace(/不可以/g, "不可以喵")
      .replace(/谢谢/g, "谢谢你喵")
      .replace(/好的/g, "好呀")
      .replace(/([啊呀呢吧嘛哦啦])([\s,.!?;:，。！？；：）】」』]|$)/g, "喵~$2");
  }

  function classicNeko(text) {
    return relationHonorific(text)
      .replace(/我们/g, "吾等猫猫")
      .replace(/大家/g, "诸位猫猫")
      .replace(/本人/g, "咱喵")
      .replace(/你们/g, "汝等")
      .replace(/您/g, "汝")
      .replace(/你/g, "汝")
      .replace(/我/g, "咱喵")
      .replace(/好的/g, "甚好")
      .replace(/可以/g, "可")
      .replace(/很/g, "甚")
      .replace(/真的/g, "当真")
      .replace(/([啊呀呢吧嘛哦啦])([\s,.!?;:，。！？；：）】」』]|$)/g, "喵乎$2");
  }

  function tsundereNeko(text) {
    let value = relationHonorific(text)
      .replace(/我们/g, "咱喵们")
      .replace(/大家/g, "大家")
      .replace(/本人/g, "本猫")
      .replace(/您/g, "汝")
      .replace(/你/g, "汝")
      .replace(/我/g, "本猫")
      .replace(/喜欢/g, "才不是喜欢")
      .replace(/想要/g, "勉强想要")
      .replace(/可以/g, "勉强可以")
      .replace(/好的/g, "哼，好吧");
    if (!/^(哼|才不是|别误会)/.test(value) && Math.random() < 0.55) {
      value = `哼，${value}`;
    }
    return value;
  }

  function politeNeko(text) {
    return relationHonorific(text)
      .replace(/我们/g, "我们猫猫")
      .replace(/大家/g, "各位")
      .replace(/本人/g, "我")
      .replace(/你们/g, "各位")
      .replace(/好的/g, "好的呢")
      .replace(/谢谢/g, "谢谢您")
      .replace(/麻烦/g, "麻烦您")
      .replace(/可以/g, "可以的");
  }

  function simpleNeko(text) {
    return relationHonorific(text)
      .replace(/我们/g, "我们猫猫")
      .replace(/我/g, "咱喵")
      .replace(/你/g, "你");
  }

  function rpNeko(text, type = "Chat") {
    if (!text || typeof text !== "string") return text;
    if (isBugCommandText(text)) return text;
    const preset = bugRp.tonePreset;
    const tone = currentTone();
    const chat = tone.chat || {};
    const remoteRules = hasRemoteRpChatRules(tone);
    let value = remoteRules ? applyRpChatRules(text, tone) : fallbackRpNeko(text, preset);
    const suffix = pickRandomLine(chat.suffixes, preset === "classic" ? "喵乎" : tone.suffix);
    const chatChance = Number.isFinite(Number(chat.endingChance))
      ? Number(chat.endingChance)
      : preset === "simple" ? 0.28 : preset === "polite" ? 0.5 : 0.8;

    if (type === "Whisper") {
      const whisperPrefix = tone.whisper?.prefix || "悄悄喵~ ";
      const whisperChance = Number.isFinite(Number(tone.whisper?.endingChance))
        ? Number(tone.whisper.endingChance)
        : preset === "simple" ? 0.35 : 0.85;
      value = maybeAddToneSuffix(value, suffix, whisperChance);
      return value.startsWith(whisperPrefix.trim()) ? value : `${whisperPrefix}${value}`;
    }
    if (type === "Emote") {
      const emoteChance = Number.isFinite(Number(chat.kaomojiChance))
        ? Number(chat.kaomojiChance)
        : preset === "simple" ? 0 : 0.65;
      value = maybeAddToneSuffix(value, suffix, preset === "simple" ? 0.25 : 0.65);
      return hasKnownKaomoji(value) || Math.random() > emoteChance ? value : `${value} ${pickRandomKaomoji()}`;
    }
    if (type === "Action" || type === "Activity") {
      return rpActionLine(value);
    }
    return maybeAddToneSuffix(value, suffix, chatChance);
  }

  function rpActionLine(text) {
    if (!text || typeof text !== "string") return text;
    const preset = bugRp.tonePreset;
    if (preset === "classic") {
      return relationHonorific(text)
        .replace(/轻轻/g, "悄然")
        .replace(/抱住/g, "轻拥")
        .replace(/摸了摸/g, "轻抚")
        .replace(/亲了亲/g, "轻吻")
        .replace(/贴/g, "依偎")
        .replace(/喂/g, "奉上")
        .replace(/喵~?$/g, "喵乎");
    }
    if (preset === "tsundere") {
      const value = relationHonorific(text)
        .replace(/轻轻/g, "装作随意地")
        .replace(/开心/g, "勉强开心")
        .replace(/温柔/g, "别扭又认真")
        .replace(/喵~?$/g, "哼喵");
      return /才不是|哼/.test(value) ? value : `${value}，才不是特意的喵。`;
    }
    if (preset === "polite") {
      return relationHonorific(text)
        .replace(/一把/g, "轻柔地")
        .replace(/偷偷/g, "安静地")
        .replace(/开心/g, "安心")
        .replace(/喵~?$/g, "喵。");
    }
    if (preset === "simple") {
      return relationHonorific(text)
        .replace(/喵~+/g, "喵")
        .replace(/呀/g, "");
    }
    return relationHonorific(text)
      .replace(/轻轻/g, "软乎乎地")
      .replace(/开心/g, "甜甜地开心")
      .replace(/喵。?$/g, "喵~");
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
    const state = detectPlayerActionCapability();
    if (!state.gagged) return text;
    return applyGagSpeech(text, state, type);
  }

  function convertByType(type, text, options = {}) {
    if (!config.enabled || !text) return text;
    if (isBugCommandText(text)) return text;
    let value = text;
    if (bugRp.enabled) value = rpNeko(text, type);
    else if (type === "Whisper") value = whisperNeko(text);
    else if (type === "Emote") value = emoteNeko(text);
    else if (type === "Action" || type === "Activity") value = actionNeko(text);
    else if (type === "Chat") value = standardNeko(text);
    if (options.applyGag) value = applyLocalStateSpeechEffects(type, value);
    if (options.habitTail) value = applyHabitTail(type, value);
    if (options.signatureTail) value = applySignatureTail(type, value);
    if (options.featureMood !== false) value = applyNekoFeatureMood(value);
    return value;
  }

  function shouldConvertDisplay(data, msg) {
    if (!config.enabled || !config.convertDisplayed || !msg) return false;
    if (isBugPeerSender(data?.Sender)) return false;
    if (isOwnSender(data?.Sender) && bugRp.enabled) return false;
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

  function relationshipHintText(relation, type) {
    const chatLike = type === "Chat" || type === "Whisper";
    if (relation === "owner") return chatLike ? "主人的消息飘过来了喵。" : "主人刚刚对你做了互动喵。";
    if (relation === "lover") return chatLike ? "恋人在和你说话喵。" : "恋人刚刚发来了小互动喵。";
    return chatLike ? "最重要的人正在和你说话喵。" : "最重要的人刚刚朝你伸来了小爪子喵。";
  }

  function maybeShowRelationshipHint(data) {
    const sender = data?.Sender;
    const relation = getRelationshipStatus(sender);
    if (!relation || isOwnSender(sender)) return;
    const type = data?.Type;
    if (!["Chat", "Whisper", "Emote", "Action"].includes(type)) return;
    const senderNumber = memberNumberOf(sender);
    if (!senderNumber) return;
    const key = `${senderNumber}:${relation}:${type === "Whisper" ? "chat" : type === "Chat" ? "chat" : "action"}`;
    const now = Date.now();
    if (now - (relationshipHintTimes.get(key) || 0) < RELATION_HINT_COOLDOWN) return;
    relationshipHintTimes.set(key, now);
    showToast(relationshipHintText(relation, type));
  }

  function applyRelationshipBadge(div, relation) {
    const nameEl = div?.querySelector?.(".ChatMessageName");
    if (!nameEl) return;
    const existing = nameEl.querySelector(".bcn-relation-badge");
    const tail = nameEl.querySelector(".bcn-relation-tail");
    if (!relation) {
      existing?.remove();
      tail?.remove();
      delete nameEl.dataset.bcnRelationBadge;
      return;
    }
    const icon = existing || document.createElement("span");
    icon.className = `bcn-relation-badge bcn-relation-badge-${relation}`;
    icon.textContent = relation === "owner" ? "🐾" : relation === "lover" ? "❤" : "❤🐾";
    icon.setAttribute("aria-hidden", "true");
    if (!existing) nameEl.prepend(icon);
    const suffix = tail || document.createElement("span");
    suffix.className = `bcn-relation-tail bcn-relation-tail-${relation}`;
    suffix.textContent = relation === "owner" ? " ✦" : relation === "lover" ? " ❤" : " ❤✦";
    suffix.setAttribute("aria-hidden", "true");
    if (!tail) nameEl.append(suffix);
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
    if (memberNumber === memberNumberOf(W.Player) && CHANNEL === "bug") return true;
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
      const nextMsg = shouldSkipGeneratedEmoteConvert(type)
        ? msg
        : config.convertOutgoing || bugRp.enabled ? convertByType(type, msg, { applyGag: true, habitTail: true, signatureTail: true }) : msg;
      return next([type, nextMsg, replyId]);
    });

    bcModApi.hookFunction("ChatRoomMessageDisplay", 0, (args, next) => {
      const [data, msg, senderCharacter, metadata] = args;
      handleNekoPeerSignal(data);
      if (config.sceneSparkEnabled) recordSceneMemory(data, msg);
      maybeTriggerNekoVoiceFromText(data, msg, isOwnSender(data?.Sender) ? "own-display" : "incoming");
      handleNekoInteractionFeatures(data, msg, isOwnSender(data?.Sender) ? "own-display" : "incoming");
      maybeSpawnAtmosphere(data, msg);
      maybeShowRelationshipHint(data);
      maybeReactToIncomingAffection(data, msg);
      if (!isOwnSender(data?.Sender)) {
        const suggestions = [];
        if (config.replySuggestionsEnabled) suggestions.push(...collectReplySuggestions(msg));
        if (config.sceneSparkEnabled) suggestions.push(...collectSceneSparkSuggestions(data, msg, { fallback: false }));
        if (suggestions.length) showReplySuggestions(suggestions);
      }
      const nextMsg = shouldConvertDisplay(data, msg)
        ? convertByType(data?.Type, msg, { applyGag: isOwnSender(data?.Sender), featureMood: false })
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
      if (message === "ChatRoomChat") {
        maybeTriggerNekoVoiceFromText(payload, payload?.Content, "outgoing");
      }
      if (message === "ChatRoomChat" && config.enabled && config.rainOnSend) {
        const type = payload?.Type;
        if (["Chat", "Whisper", "Emote", "Action"].includes(type)) pawRain(type);
      }
      if (message === "ChatRoomChat" && config.enabled && ["Chat", "Whisper", "Emote", "Action"].includes(payload?.Type)) {
        handleNekoInteractionFeatures(payload, payload?.Content, "outgoing");
        incrementTailMood(payload?.Type);
      }
      return next(args);
    });

    if (typeof W.ChatRoomMessage === "function") {
      bcModApi.hookFunction("ChatRoomMessage", 0, (args, next) => {
        const [data] = args;
        handleNekoPeerSignal(data);
        recordSceneMemory(data, data?.Content);
        handleNekoInteractionFeatures(data, data?.Content, isOwnSender(data?.Sender) ? "own-message" : "incoming-message");
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
        Dictionary: [{
          mod: MOD_ID,
          version: VERSION,
          channel: CHANNEL,
          rpEnabled: !!bugRp.enabled,
          tonePreset: bugRp.tonePreset,
          toneLabel: currentTone().label,
          noDisplayConvert: true,
        }],
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
    const combo = registerAffectionCombo(data.Sender, text);
    spawnAtmosphereForMember(data.Sender, text, getRelationshipStatus(data.Sender), combo);
  }

  function getAtmosphereProfile(text, relation) {
    const value = String(text || "");
    if (/(晚安|困困|睡觉|好梦|梦里)/.test(value)) {
      return { icons: ["💤", "🌙", "🐾"], countMin: 2, countMax: 4, lifeMin: 1600, lifeMax: 2300 };
    }
    if (/(贴贴|蹭蹭|抱抱|亲亲|亲一口)/.test(value)) {
      return { icons: relation === "owner" ? ["🐾", "💛", "✨"] : ["🐾", "💕", "💗"], countMin: 2, countMax: 5, lifeMin: 1500, lifeMax: 2100 };
    }
    if (/(欢迎|你好呀|早安|安安|欢迎回来)/.test(value)) {
      return { icons: ["✨", "🌸", "🐾"], countMin: 2, countMax: 4, lifeMin: 1300, lifeMax: 1900 };
    }
    if (relation === "owner") {
      return { icons: ["🐾", "💛", "✨"], countMin: 2, countMax: 4, lifeMin: 1500, lifeMax: 2200 };
    }
    if (relation === "lover") {
      return { icons: ["🐾", "💕", "💗"], countMin: 2, countMax: 4, lifeMin: 1500, lifeMax: 2200 };
    }
    if (relation === "dual") {
      return { icons: ["🐾", "💛", "💕", "✨"], countMin: 3, countMax: 5, lifeMin: 1600, lifeMax: 2300 };
    }
    return { icons: ["🐾", "💗", "💕"], countMin: 1, countMax: 3, lifeMin: 1400, lifeMax: 1900 };
  }

  function spawnAtmosphereForMember(sender, text = "", relation = null, comboLevel = 1) {
    const memberNumber = memberNumberOf(sender);
    const anchor = characterAnchors.get(memberNumber) || characterAnchors.get(memberNumberOf(W.Player));
    if (!anchor) return;
    const profile = getAtmosphereProfile(text, relation);
    const icons = profile.icons;
    const extra = Math.max(0, Math.min(2, Number(comboLevel || 1) - 1));
    const count = profile.countMin + Math.floor(Math.random() * (profile.countMax - profile.countMin + 1)) + extra;
    for (let i = 0; i < count; i++) {
      atmosphereParticles.push({
        text: icons[Math.floor(Math.random() * icons.length)],
        x: anchor.x + (Math.random() - 0.5) * 90 * anchor.zoom,
        y: anchor.y + (Math.random() - 0.5) * 30 * anchor.zoom,
        vx: (Math.random() - 0.5) * 0.18 * anchor.zoom,
        vy: -(0.55 + Math.random() * 0.35) * anchor.zoom,
        size: (22 + Math.random() * 10) * anchor.zoom,
        born: Date.now(),
        life: profile.lifeMin + Math.random() * (profile.lifeMax - profile.lifeMin),
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

  function normalizeStateToken(value) {
    return String(value || "").trim().toLowerCase();
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

  function getCharacterPoses(character) {
    return Array.isArray(character?.Pose) ? character.Pose.filter(Boolean) : [];
  }

  function hasTokenMatch(source, names) {
    const tokens = source.map(normalizeStateToken).filter(Boolean);
    const patterns = (names || []).map(normalizeStateToken).filter(Boolean);
    return patterns.some((pattern) => tokens.some((token) => token === pattern || token.includes(pattern) || pattern.includes(token)));
  }

  function hasAnyEffect(character, names) {
    return hasTokenMatch(getCharacterEffects(character), names);
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

  function hasAnyPose(character, names) {
    return hasTokenMatch(getCharacterPoses(character), names);
  }

  function readCharacterMethod(character, methodName, fallback) {
    try {
      const value = character?.[methodName]?.();
      return typeof value === "boolean" ? value : fallback;
    } catch {
      return fallback;
    }
  }

  function detectCharacterState(character) {
    const cannotTalk = readCharacterMethod(character, "CanTalk", true) === false;
    const gagLevel = hasAnyEffect(character, ["gagveryheavy", "gagheavy", "gagtotal", "gaggedheavy"])
        ? 3
        : hasAnyEffect(character, ["gagmedium", "gag", "gagged"])
          ? 2
          : hasAnyEffect(character, ["gaglight"])
            ? 1
            : 0;
    const kneeling = readCharacterMethod(character, "IsKneeling", undefined);
    const lying = hasAnyPose(character, ["lying", "prone", "supine"]) || hasAnyEffect(character, ["prone"]);
    const suspended = hasAnyEffect(character, ["suspended"]);
    const handsFree = readCharacterMethod(character, "CanInteract", !hasAnyEffect(character, ["block", "freeze", "restrain", "bound", "cuffed"]));
    const canMove = readCharacterMethod(character, "CanWalk", !hasAnyEffect(character, ["freeze", "tethered", "mounted", "suspended", "prone"]));
    const gagged = gagLevel > 0 || cannotTalk;
    const restrained = !handsFree || !canMove || hasAnyEffect(character, ["block", "freeze", "restrain", "bound", "cuffed", "tethered"]);
    const resolvedKneeling = typeof kneeling === "boolean" ? kneeling : hasAnyPose(character, ["kneel", "kneeling"]);
    const helpless = restrained && (lying || suspended || !canMove);
    return {
      gagLevel,
      gagged,
      mouthFree: gagLevel <= 1,
      handsFree,
      canMove,
      kneeling: resolvedKneeling,
      lying,
      suspended,
      restrained,
      helpless,
      canReach: handsFree && !lying && !suspended && (canMove || resolvedKneeling),
    };
  }

  function detectPlayerActionCapability() {
    return detectCharacterState(W.Player || null);
  }

  function inferActionRequirements(action) {
    const value = `${action?.id || ""} ${action?.label || ""}`.toLowerCase();
    if (/kiss|亲亲/.test(value)) return { needMouth: true, needReach: true, maxGagLevel: 1 };
    if (/cuddle|贴贴/.test(value)) return { needReach: true, needMobility: true };
    if (/hug|抱抱|pat|摸头|feed|喂食/.test(value)) return { needHands: true, needReach: true };
    return {};
  }

  function getActionRequirements(action) {
    const inferred = inferActionRequirements(action);
    const explicit = action?.requirements || {};
    return {
      needHands: "needHands" in explicit ? explicit.needHands === true : inferred.needHands === true,
      needMouth: "needMouth" in explicit ? explicit.needMouth === true : inferred.needMouth === true,
      needReach: "needReach" in explicit ? explicit.needReach === true : inferred.needReach === true,
      needMobility: "needMobility" in explicit ? explicit.needMobility === true : inferred.needMobility === true,
      maxGagLevel: Number.isFinite(Number(explicit.maxGagLevel)) ? Number(explicit.maxGagLevel) : inferred.maxGagLevel,
    };
  }

  function actionMeetsRequirements(action, state) {
    const requirements = getActionRequirements(action);
    if (requirements.needHands && !state.handsFree) return false;
    if (requirements.needMouth && !state.mouthFree) return false;
    if (requirements.needReach && !state.canReach) return false;
    if (requirements.needMobility && !state.canMove) return false;
    if (Number.isFinite(requirements.maxGagLevel) && state.gagLevel > requirements.maxGagLevel) return false;
    return true;
  }

  function chooseActionVariant(action, state, hasTarget) {
    const variants = action?.variants;
    if (!variants || !state) return null;
    const priority = ["helpless", "lying", "kneeling", "restrained", "gagged"];
    for (const key of priority) {
      if (!state[key]) continue;
      const variant = variants[key];
      if (!variant) continue;
      const lines = hasTarget ? variant.target : variant.self;
      if (Array.isArray(lines) && lines.some(Boolean)) return { key, lines };
    }
    return null;
  }

  function selectActionLine(action, target) {
    const hasTarget = !!target;
    const state = hasTarget ? detectCharacterState(target) : detectPlayerActionCapability();
    const variant = chooseActionVariant(action, state, hasTarget);
    if (variant) {
      return {
        line: pickRandomLine(
          variant.lines,
          hasTarget ? pickRandomLine(action.target, pickRandomLine(action.self, "{target}靠近了一点喵~")) : pickRandomLine(action.self, pickRandomLine(action.target, "轻轻晃了晃尾巴喵~")),
        ),
        variantKey: variant.key,
      };
    }
    return {
      line: hasTarget
        ? pickRandomLine(action.target, pickRandomLine(action.self, "{target}靠近了一点喵~"))
        : pickRandomLine(action.self, pickRandomLine(action.target, "轻轻晃了晃尾巴喵~")),
      variantKey: "",
    };
  }

  function getActiveActions() {
    const state = detectPlayerActionCapability();
    return (actionLibrary.actions || []).filter((action) => action.enabled !== false && actionMeetsRequirements(action, state));
  }

  function pickRandomLine(lines, fallback = "") {
    const cleanLines = Array.isArray(lines) ? lines.filter(Boolean) : [];
    if (!cleanLines.length) return fallback;
    return cleanLines[Math.floor(Math.random() * cleanLines.length)];
  }

  function pickHabitActionLine(lines, fallback = "") {
    const cleanLines = Array.isArray(lines) ? lines.filter(Boolean) : [];
    if (!cleanLines.length) return fallback;
    if (cleanLines.length === 1) return cleanLines[0];
    if (habitProfile.actionStyle === "cozy") return cleanLines[cleanLines.length - 1];
    if (habitProfile.actionStyle === "playful") return cleanLines[Math.min(cleanLines.length - 1, Math.floor(cleanLines.length / 2))];
    return cleanLines[0];
  }

  function actionActor() {
    const preset = bugRp.tonePreset;
    if (preset === "classic") return "咱喵";
    if (preset === "tsundere") return "本猫";
    if (preset === "polite") return "我";
    if (preset === "simple") return "咱喵";
    return "人家";
  }

  function actionKind(action) {
    const value = `${action?.id || ""} ${action?.label || ""}`.toLowerCase();
    if (/hug|抱/.test(value)) return "hug";
    if (/pat|摸|头/.test(value)) return "pat";
    if (/feed|喂|食/.test(value)) return "feed";
    if (/cuddle|贴|蹭/.test(value)) return "cuddle";
    if (/kiss|亲|吻/.test(value)) return "kiss";
    return "default";
  }

  function actionVerb(action) {
    const kind = actionKind(action);
    if (kind === "hug") {
      if (bugRp.tonePreset === "classic") return "轻拥";
      if (bugRp.tonePreset === "tsundere") return "勉强抱住";
      if (bugRp.tonePreset === "polite") return "轻轻抱住";
      return "抱抱";
    }
    if (kind === "pat") {
      if (bugRp.tonePreset === "classic") return "轻抚";
      if (bugRp.tonePreset === "tsundere") return "装作随手摸摸";
      if (bugRp.tonePreset === "polite") return "温柔摸摸";
      return "摸摸头";
    }
    if (kind === "feed") {
      if (bugRp.tonePreset === "classic") return "奉上一口点心予";
      if (bugRp.tonePreset === "tsundere") return "勉强投喂";
      if (bugRp.tonePreset === "polite") return "递上一口点心给";
      return "投喂";
    }
    if (kind === "cuddle") {
      if (bugRp.tonePreset === "classic") return "依偎";
      if (bugRp.tonePreset === "tsundere") return "假装路过蹭蹭";
      if (bugRp.tonePreset === "polite") return "轻轻贴近";
      return "贴贴";
    }
    if (kind === "kiss") {
      if (bugRp.tonePreset === "classic") return "轻吻";
      if (bugRp.tonePreset === "tsundere") return "别扭地亲亲";
      if (bugRp.tonePreset === "polite") return "轻轻亲亲";
      return "亲亲";
    }
    return String(action?.label || "靠近");
  }

  function rpActionTemplate(action, target) {
    const preset = bugRp.tonePreset;
    const kind = actionKind(action);
    const targeted = !!target;
    const remoteAction = currentTone().actions?.[kind] || currentTone().actions?.default;
    if (remoteAction) {
      const remoteLine = targeted
        ? pickRandomLine(remoteAction.target, pickRandomLine(remoteAction.self, ""))
        : pickRandomLine(remoteAction.self, pickRandomLine(remoteAction.target, ""));
      if (remoteLine) return /\{actor\}/.test(remoteLine) ? remoteLine : `{actor}${remoteLine}`;
    }
    const templates = {
      soft: {
        hug: ["{actor}软乎乎地抱住{target}蹭了蹭，尾巴开心地晃呀晃喵~", "{actor}抱住自己缩成暖暖一团，小声呼噜呼噜喵~"],
        pat: ["{actor}踮起脚摸摸{target}的头，声音甜甜地夸了一句好乖喵~", "{actor}摸摸自己的头，把小烦恼一点点揉散喵~"],
        feed: ["{actor}把小点心递到{target}嘴边，眼睛亮晶晶地等回应喵~", "{actor}啊呜吃下一口点心，幸福得耳朵都抖了抖喵~"],
        cuddle: ["{actor}软软贴到{target}身边，像找到最暖的小窝喵~", "{actor}抱住自己的尾巴贴贴，偷偷给自己一点温暖喵~"],
        kiss: ["{actor}轻轻亲了亲{target}，害羞得耳朵都热起来喵~", "{actor}把一个小亲亲藏进掌心，悄悄送给自己喵~"],
        default: ["{actor}软乎乎地{verb}了{target}喵~", "{actor}软软地{verb}了自己一下喵~"],
      },
      classic: {
        hug: ["{actor}轻移莲步，将{target}轻拥入怀，尾尖微晃，似是甚欢喵。", "{actor}垂眸轻笑，敛袖轻拥自己，心下甚安喵乎。"],
        pat: ["{actor}抬手轻抚{target}发顶，眉眼含笑，温声道甚乖喵。", "{actor}悄然顺了顺自己的发顶，神色安然喵乎。"],
        feed: ["{actor}奉上一口点心予{target}，眸光微亮，盼君尝之喵。", "{actor}慢慢尝下一口点心，尾尖轻卷，甚是满足喵乎。"],
        cuddle: ["{actor}悄然依偎在{target}身侧，衣袖轻触，心意已明喵。", "{actor}倚着自己静坐片刻，像把暖意藏进怀中喵乎。"],
        kiss: ["{actor}俯身轻吻{target}，旋即别过眼去，耳尖微红喵。", "{actor}轻吻指尖，将好运悄悄留给自己喵乎。"],
        default: ["{actor}{verb}{target}，尾尖微晃，甚好喵。", "{actor}悄悄{verb}了自己一下，甚是安然喵。"],
      },
      tsundere: {
        hug: ["{actor}别过脸勉强抱住{target}，才、才不是特意想靠近喵！", "{actor}哼了一声抱住自己，才不是需要安慰呢喵。"],
        pat: ["{actor}装作随手摸摸{target}的头，哼，这只是普通奖励喵。", "{actor}给自己摸摸头，才不是在偷偷求夸喵。"],
        feed: ["{actor}把点心递给{target}，哼，吃完可要记得夸本猫喵。", "{actor}咬了一口点心，才不是因为嘴馋才开心喵。"],
        cuddle: ["{actor}假装路过蹭了蹭{target}，别误会，只是这里比较舒服喵。", "{actor}抱着自己贴贴，哼，自己也能照顾自己喵。"],
        kiss: ["{actor}别扭地亲亲{target}，立刻转头说不许笑喵！", "{actor}给自己一个小亲亲奖励，才不是害羞喵。"],
        default: ["{actor}装作漫不经心地{verb}了{target}，才不是特意的喵！", "{actor}勉强{verb}了自己一下，哼喵。"],
      },
      polite: {
        hug: ["{actor}轻轻抱住{target}，希望这份温度能让对方安心一些喵。", "{actor}轻轻抱住自己，认真把心情整理好喵。"],
        pat: ["{actor}温柔摸摸{target}的头，轻声说今天也辛苦了喵。", "{actor}给自己顺了顺毛，安静地放松下来喵。"],
        feed: ["{actor}递上一口点心给{target}，语气温和地请对方尝尝喵。", "{actor}小口吃下点心，认真补充一点猫娘能量喵。"],
        cuddle: ["{actor}轻轻贴近{target}，保持着温柔又舒服的距离喵。", "{actor}安静地靠着自己，给心情一点休息时间喵。"],
        kiss: ["{actor}轻轻亲亲{target}，把祝福温柔地送过去喵。", "{actor}亲亲自己的指尖，愿今天也顺利喵。"],
        default: ["{actor}温柔而克制地{verb}了{target}喵。", "{actor}安静地{verb}了自己一下喵。"],
      },
      simple: {
        hug: ["{actor}抱了抱{target}喵。", "{actor}抱了抱自己喵。"],
        pat: ["{actor}摸了摸{target}的头喵。", "{actor}摸了摸自己的头喵。"],
        feed: ["{actor}给{target}递了点心喵。", "{actor}吃了一口点心喵。"],
        cuddle: ["{actor}和{target}贴贴喵。", "{actor}和自己贴贴喵。"],
        kiss: ["{actor}亲亲{target}喵。", "{actor}给自己一个亲亲喵。"],
        default: ["{actor}{verb}了{target}喵。", "{actor}{verb}了自己喵。"],
      },
    };
    const pack = templates[preset] || templates.soft;
    const pair = pack[kind] || pack.default;
    return targeted ? pair[0] : pair[1];
  }

  function formatRpActionText(action, target, fallbackLine) {
    if (!bugRp.enabled) return fallbackLine;
    const template = rpActionTemplate(action, target) || (target ? currentTone().actionTarget : currentTone().actionSelf);
    if (!template) return rpActionLine(fallbackLine);
    return template
      .replace(/\{actor\}/g, actionActor())
      .replace(/\{verb\}/g, actionVerb(action))
      .replace(/\{target\}/g, target ? getCharacterName(target) : "自己");
  }

  function formatActionText(action, target) {
    const { line } = selectActionLine(action, target);
    const hasTarget = !!target;
    const fallbackLine = line.replace(/\{target\}/g, hasTarget ? getCharacterName(target) : "身边的猫猫");
    return formatRpActionText(action, target, fallbackLine);
  }

  formatActionText = function(action, target) {
    const hasTarget = !!target;
    const state = hasTarget ? detectCharacterState(target) : detectPlayerActionCapability();
    const variant = chooseActionVariant(action, state, hasTarget);
    const pool = variant?.lines
      || (hasTarget ? action?.target : action?.self)
      || (hasTarget ? action?.self : action?.target)
      || [];
    const fallback = hasTarget ? "{target}闈犺繎浜嗕竴鐐瑰柕~" : "杞昏交鏅冧簡鏅冨熬宸村柕~";
    const line = pickHabitActionLine(pool, fallback);
    const fallbackLine = line.replace(/\{target\}/g, hasTarget ? getCharacterName(target) : "韬竟鐨勭尗鐚?");
    return formatRpActionText(action, target, fallbackLine);
  };

  function sendEmote(text) {
    const input = getChatInput();
    if (input && typeof W.ChatRoomSendChat === "function") {
      input.value = `*${text}*`;
      input.dispatchEvent(new InputEvent("input", { bubbles: true }));
      suppressNextEmoteConvertAt = Date.now();
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
      <span id="bcn-tail-meter" aria-hidden="true">0/${TAIL_MOOD_MAX}</span>
      <button class="bcn-btn" id="bcn-main-cat" type="button" title="展开猫猫菜单，按住可拖动，长按 10 秒切换猫娘模式">🐱</button>
      <div id="bcn-submenu">
        <button class="bcn-btn" id="bcn-wheel-handle" type="button" title="展开动作轮盘">🐱</button>
        <button class="bcn-btn" id="bcn-face" type="button" title="打开猫猫颜文字，长按 2 秒也可打开">🐱</button>
      </div>
      <div id="bcn-reply-suggestions" aria-label="reply suggestions"></div>
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
    renderReplySuggestions();
    updateTailMoodUi();
    saveHabitProfile();
    syncBodyState();
  }

  function syncScreenClass() {
    if (!document.body) return;
    const currentScreen = W.CurrentScreen || "";
    const enteredChatroom = currentScreen === "ChatRoom" && lastKnownScreen !== "ChatRoom";
    document.body.dataset.bcnScreen = currentScreen;
    document.body.classList.toggle("bcn-chatroom", currentScreen === "ChatRoom");
    if (enteredChatroom && !firstChatroomHelpShown) {
      firstChatroomHelpShown = true;
      showFirstChatroomHelpHint();
    }
    lastKnownScreen = currentScreen;
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

      #bcn-voice-overlay {
        position: fixed;
        inset: 0;
        z-index: 100002;
        pointer-events: none;
        overflow: hidden;
      }

      .bcn-voice-flash {
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at 50% 38%, rgba(255, 121, 176, 0.22), rgba(255, 121, 176, 0));
        animation: bcn-voice-flash 900ms ease-out forwards;
      }

      .bcn-voice-waves {
        position: absolute;
        width: 20px;
        height: 20px;
        transform: translate(-50%, -50%);
      }

      .bcn-voice-waves span {
        position: absolute;
        inset: 0;
        border: 2px solid rgba(255, 106, 166, 0.76);
        border-radius: 999px;
        box-shadow: 0 0 18px rgba(255, 106, 166, 0.32);
        animation: bcn-voice-wave 1800ms ease-out forwards;
      }

      .bcn-voice-danmaku {
        position: absolute;
        padding: 4px 10px;
        border: 1px solid rgba(255, 181, 211, 0.82);
        border-radius: 999px;
        background: rgba(255, 245, 250, 0.88);
        color: #c23f73;
        font: 700 13px/1.4 "Arial", sans-serif;
        text-shadow: 0 1px 0 #fff;
        white-space: nowrap;
        box-shadow: 0 6px 18px rgba(246, 80, 134, 0.18);
        animation: bcn-voice-danmaku 4200ms linear forwards;
      }

      .bcn-voice-steam {
        position: absolute;
        border-radius: 999px;
        background: rgba(255, 164, 203, 0.5);
        box-shadow: 0 0 16px rgba(255, 117, 178, 0.45);
        animation: bcn-voice-steam 2400ms ease-out forwards;
      }

      #bcn-tail-meter {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 52px;
        height: 24px;
        margin-right: 2px;
        padding: 0 8px;
        border: 2px solid var(--bcn-border);
        border-radius: 999px;
        background: linear-gradient(180deg, var(--bcn-panel) 0%, var(--bcn-soft) 100%);
        color: var(--bcn-accent);
        font-size: 12px;
        font-weight: 800;
        box-shadow: 0 3px 0 var(--bcn-glow);
        white-space: nowrap;
      }

      #bcn-tail-meter[data-full="1"] {
        color: #d86a8e;
        border-color: var(--bcn-accent);
        box-shadow: 0 0 0 3px var(--bcn-glow), 0 3px 0 var(--bcn-glow);
      }

      #bcn-reply-suggestions {
        display: flex;
        align-items: center;
        gap: 6px;
        max-width: 0;
        opacity: 0;
        overflow: hidden;
        transform: translateX(-6px);
        transition: max-width 0.22s ease, opacity 0.22s ease, transform 0.22s ease;
        pointer-events: none;
      }

      #bcn-panel.has-replies #bcn-reply-suggestions {
        max-width: 340px;
        opacity: 1;
        transform: translateX(0);
        pointer-events: auto;
      }

      .bcn-reply-title {
        color: var(--bcn-muted);
        font-size: 11px;
        font-weight: 700;
        white-space: nowrap;
      }

      .bcn-reply-chip {
        height: 34px;
        max-width: 128px;
        padding: 0 10px;
        border: 2px solid var(--bcn-border);
        border-radius: 12px;
        background: linear-gradient(180deg, var(--bcn-panel) 0%, var(--bcn-soft) 100%);
        color: var(--bcn-text);
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 2px 0 var(--bcn-glow);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .bcn-reply-chip:hover {
        transform: translateY(-1px);
        background: var(--bcn-soft);
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

      @keyframes bcn-voice-flash {
        0% { opacity: 0; }
        18% { opacity: 1; }
        100% { opacity: 0; }
      }

      @keyframes bcn-voice-wave {
        0% {
          opacity: 0.78;
          transform: scale(0.35);
        }
        100% {
          opacity: 0;
          transform: scale(8.5);
        }
      }

      @keyframes bcn-voice-danmaku {
        0% {
          opacity: 0;
          transform: translateX(0) translateY(8px);
        }
        12% { opacity: 1; }
        100% {
          opacity: 0;
          transform: translateX(360px) translateY(-36px);
        }
      }

      @keyframes bcn-voice-steam {
        0% {
          opacity: 0;
          transform: translateY(0) scale(0.7);
        }
        15% { opacity: 0.9; }
        100% {
          opacity: 0;
          transform: translateY(-96px) scale(1.6);
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
        text-shadow: 0 1px 0 #fff !important;
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
        box-shadow: 0 4px 14px rgba(232, 184, 88, 0.16), inset 0 0 0 1px rgba(255, 232, 178, 0.55);
        background: linear-gradient(180deg, rgba(255, 250, 236, 0.96), rgba(255, 246, 224, 0.9)) !important;
      }

      #TextAreaChatLog .bcn-related-owner .ChatMessageName {
        color: #af7f22 !important;
        letter-spacing: 0;
      }

      #TextAreaChatLog .bcn-related-owner .bcn-relation-badge {
        color: #dfb24c;
        text-shadow: 0 1px 0 #fff6df, 0 0 8px rgba(240, 191, 92, 0.24);
        transform: translateY(-0.02em) scale(1.05);
      }

      #TextAreaChatLog .bcn-related-lover {
        background: linear-gradient(180deg, rgba(255, 247, 251, 0.98), rgba(255, 240, 247, 0.92)) !important;
        box-shadow: 0 4px 14px rgba(240, 141, 180, 0.12), inset 0 0 0 1px rgba(255, 225, 236, 0.52);
      }

      #TextAreaChatLog .bcn-related-lover .ChatMessageName {
        color: #d06b96 !important;
        letter-spacing: 0;
      }

      #TextAreaChatLog .bcn-related-lover .bcn-relation-badge {
        color: #f08db4;
        text-shadow: 0 1px 0 #fff4f8, 0 0 8px rgba(240, 141, 180, 0.2);
        transform: translateY(-0.02em) scale(1.05);
      }

      #TextAreaChatLog .bcn-related-dual {
        border-color: #e9be93 !important;
        box-shadow: 0 4px 16px rgba(232, 166, 120, 0.18), inset 0 0 0 1px rgba(255, 234, 208, 0.54);
        background: linear-gradient(180deg, rgba(255, 248, 242, 0.98), rgba(255, 242, 232, 0.92)) !important;
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
    loadRemoteRpLibrary();
    bindVisibilityLifecycle();
    syncScreenClass();
    registerNekoCommands();

    const patchTimer = setInterval(() => {
      const chatReady = patchBC();
      const badgeReady = patchStatusBadge();
      const roomReady = patchRoomEffects();
      const commandReady = registerNekoCommands();
      if (chatReady && badgeReady && roomReady && commandReady) {
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
