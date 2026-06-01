# Bondage Club 猫娘聊天室增强

一个给 Bondage Club 用的猫娘主题 userscript，主打聊天语气转换、聊天美化和动作轮盘。

## 功能

- 发送消息自动转换成猫娘语气
- 接收消息可选择显示转换
- 聊天室美化与猫爪表情雨
- 右下角动作快捷轮盘
- GitHub 远程动作库，支持后续扩展更多动作主题
- GitHub 远程颜文字库，支持后续扩展更多猫猫颜文字分类
- 扩展组件设置页，支持细项开关和概率调节
- 动作可自动选目标、手动选目标，或只对自己生效

## 安装

先安装油猴或其他 userscript 管理器，然后打开下面这个链接安装：

https://github.com/QAQMOON/meow-/raw/main/bondage-club-neko.user.js

## 更新

直接在油猴里检查脚本更新即可；仓库里的 `main` 分支会保持最新版本。

## 动作库

动作文案放在：

https://github.com/QAQMOON/meow-/blob/main/actions/catgirl-actions.json

插件启动时会尝试从 GitHub 加载动作库；如果加载失败，会使用上次缓存，缓存也没有时会使用内置默认动作。

新增动作主题时，在 `actions` 数组里追加一项即可：

```json
{
  "id": "kiss",
  "label": "亲亲",
  "enabled": true,
  "self": [
    "轻轻碰了碰自己的指尖，假装这是一个小小亲亲喵~"
  ],
  "target": [
    "轻轻亲了亲 {target}，然后害羞地别过脸喵~"
  ]
}
```

`label` 会显示在动作轮盘按钮上；`self` 用于没有目标或只对自己时；`target` 用于对其他角色释放时。

## 颜文字库

颜文字库放在：

https://github.com/QAQMOON/meow-/blob/main/kaomoji/cute-kaomoji.json

插件启动时会尝试从 GitHub 加载颜文字库；如果加载失败，会使用上次缓存，缓存也没有时会使用内置默认猫猫颜文字。

新增颜文字时，在对应分类的 `items` 数组里追加字符串即可。新增分类时，在 `groups` 数组里追加一项：

```json
{
  "id": "kiss",
  "label": "亲亲",
  "enabled": true,
  "items": [
    "( ˘ ³˘)♥",
    "(๑˘ ³˘๑)"
  ]
}
```

`enabled` 设为 `false` 可以暂时禁用某个分类；插件会从所有启用分类里随机抽取颜文字。

## 说明

这是面向 Bondage Club 的界面增强脚本，不是独立网页应用。
如果你在游戏里看到设置页，请优先在“设置 -> 扩展组件”里找“猫娘设置”。
