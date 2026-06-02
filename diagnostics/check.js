const RAW_BASE = "https://raw.githubusercontent.com/QAQMOON/meow-/main/";

const resources = [
  {
    id: "stable-loader",
    name: "油猴正式版入口",
    url: `${RAW_BASE}bondage-club-neko.user.js`,
    kind: "script",
  },
  {
    id: "dev-loader",
    name: "油猴测试版入口",
    url: `${RAW_BASE}bondage-club-neko-dev.user.js`,
    kind: "script",
  },
  {
    id: "stable-runtime",
    name: "正式版 runtime",
    url: `${RAW_BASE}dist/bondage-club-neko.runtime.js`,
    kind: "runtime",
  },
  {
    id: "dev-runtime",
    name: "测试版 runtime",
    url: `${RAW_BASE}dist/bondage-club-neko.dev.runtime.js`,
    kind: "runtime",
  },
  {
    id: "actions",
    name: "远程动作库",
    url: `${RAW_BASE}actions/catgirl-actions.json`,
    kind: "actions",
  },
  {
    id: "kaomoji",
    name: "远程颜文字库",
    url: `${RAW_BASE}kaomoji/cute-kaomoji.json`,
    kind: "kaomoji",
  },
];

const resourceList = document.getElementById("resource-list");
const runChecksButton = document.getElementById("run-checks");
const diagnosticInput = document.getElementById("diagnostic-input");
const diagnosticOutput = document.getElementById("diagnostic-output");
const analyzeDiagnosticButton = document.getElementById("analyze-diagnostic");
const clearDiagnosticButton = document.getElementById("clear-diagnostic");

function statusLabel(status) {
  if (status === "ok") return "正常";
  if (status === "warn") return "注意";
  if (status === "bad") return "异常";
  return "检查中";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderResource(item, status = "pending", detail = "等待检查") {
  let el = document.getElementById(`resource-${item.id}`);
  if (!el) {
    el = document.createElement("div");
    el.className = "item";
    el.id = `resource-${item.id}`;
    resourceList.appendChild(el);
  }
  el.innerHTML = `
    <div class="row">
      <div>
        <div class="name">${escapeHtml(item.name)}</div>
        <div class="meta"><a href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(item.url)}</a></div>
        <div class="meta">${escapeHtml(detail)}</div>
      </div>
      <div class="status ${status}">${statusLabel(status)}</div>
    </div>
  `;
}

function extractVersion(text) {
  const meta = text.match(/@version\s+([^\s]+)/);
  const constant = text.match(/const\s+VERSION\s*=\s*"([^"]+)"/);
  return constant?.[1] || meta?.[1] || "";
}

function validateJsonResource(item, data) {
  if (item.kind === "actions") {
    const actions = Array.isArray(data.actions) ? data.actions : [];
    return {
      ok: actions.length > 0,
      detail: `版本 ${data.version || "unknown"}，动作主题 ${actions.length} 个`,
    };
  }
  if (item.kind === "kaomoji") {
    const groups = Array.isArray(data.groups) ? data.groups : [];
    const count = groups.reduce((total, group) => total + (Array.isArray(group.items) ? group.items.length : 0), 0);
    return {
      ok: groups.length > 0 && count > 0,
      detail: `版本 ${data.version || "unknown"}，分类 ${groups.length} 个，颜文字 ${count} 个`,
    };
  }
  return { ok: true, detail: "JSON 可解析" };
}

async function checkResource(item) {
  renderResource(item, "pending", "正在检查");
  try {
    const response = await fetch(`${item.url}?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) {
      renderResource(item, "bad", `HTTP ${response.status}`);
      return;
    }
    const text = await response.text();
    if (item.kind === "actions" || item.kind === "kaomoji") {
      const data = JSON.parse(text);
      const result = validateJsonResource(item, data);
      renderResource(item, result.ok ? "ok" : "bad", result.detail);
      return;
    }
    const version = extractVersion(text);
    const hasRuntimeShape = item.kind !== "runtime" || text.includes("BCNekoEnhancer");
    const detail = version ? `版本 ${version}` : "未找到版本号";
    renderResource(item, version && hasRuntimeShape ? "ok" : "warn", detail);
  } catch (error) {
    renderResource(item, "bad", error instanceof Error ? error.message : String(error));
  }
}

async function runChecks() {
  resources.forEach((item) => renderResource(item));
  await Promise.all(resources.map(checkResource));
}

function renderDiagnosticSummary(data) {
  const runtime = data.runtime || {};
  const libraries = data.libraries || {};
  const peers = data.peers || {};
  const checks = [
    ["ModSDK", runtime.sdkRegistered],
    ["聊天 hook", runtime.chatHooks],
    ["头顶猫图标 hook", runtime.statusBadgeHook],
    ["房间效果 hook", runtime.roomEffectsHook],
    ["设置页", runtime.settingsRegistered],
  ];
  const failed = checks.filter(([, ok]) => !ok).map(([name]) => name);
  const summary = `
    <div class="summary">
      <div><span>插件版本</span><strong>${escapeHtml(data.version || "unknown")}</strong></div>
      <div><span>当前界面</span><strong>${escapeHtml(data.screen || "unknown")}</strong></div>
      <div><span>动作库</span><strong>${escapeHtml(libraries.actions?.version || "unknown")}</strong></div>
      <div><span>颜文字</span><strong>${escapeHtml(libraries.kaomoji?.items ?? "unknown")}</strong></div>
      <div><span>猫娘同好</span><strong>${escapeHtml(peers.count ?? 0)}</strong></div>
    </div>
  `;
  const status = failed.length ? "warn" : "ok";
  const message = failed.length
    ? `需要关注：${failed.join("、")}`
    : "游戏内诊断看起来正常";
  diagnosticOutput.innerHTML = `
    ${summary}
    <div class="item" style="margin-top: 12px;">
      <div class="row">
        <div>
          <div class="name">${message}</div>
          <div class="meta">生成时间：${escapeHtml(data.generatedAt || "unknown")}</div>
        </div>
        <div class="status ${status}">${statusLabel(status)}</div>
      </div>
    </div>
  `;
}

function analyzeDiagnostic() {
  const raw = diagnosticInput.value.trim();
  if (!raw) {
    diagnosticOutput.innerHTML = `<div class="item"><div class="status warn">注意</div><div class="meta">请先粘贴 diagnostic JSON。</div></div>`;
    return;
  }
  try {
    const data = JSON.parse(raw);
    renderDiagnosticSummary(data);
  } catch (error) {
    diagnosticOutput.innerHTML = `<div class="item"><div class="status bad">异常</div><div class="meta">JSON 解析失败：${escapeHtml(error.message)}</div></div>`;
  }
}

runChecksButton.addEventListener("click", runChecks);
analyzeDiagnosticButton.addEventListener("click", analyzeDiagnostic);
clearDiagnosticButton.addEventListener("click", () => {
  diagnosticInput.value = "";
  diagnosticOutput.innerHTML = "";
});

runChecks();
