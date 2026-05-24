import type { RegisteredToolHandle } from "./types.js";

interface BadgeController {
  update(): void;
}

interface BadgeOptions {
  appName?: string;
  text: string;
  isRuntimeAvailable: () => boolean;
  listTools: () => RegisteredToolHandle[];
}

const BADGE_ID = "webmcp-js-badge";

export function createBadge(options: BadgeOptions): BadgeController | undefined {
  if (typeof document === "undefined") return undefined;
  if (document.getElementById(BADGE_ID)) return undefined;

  const root = document.createElement("div");
  root.id = BADGE_ID;
  root.style.cssText = [
    "position:fixed",
    "right:16px",
    "bottom:16px",
    "z-index:2147483647",
    "font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
    "color:#111827"
  ].join(";");

  const button = document.createElement("button");
  button.type = "button";
  button.textContent = options.text;
  button.setAttribute("aria-expanded", "false");
  button.style.cssText = [
    "border:1px solid #d1d5db",
    "border-radius:999px",
    "background:#ffffff",
    "box-shadow:0 10px 30px rgba(17,24,39,0.18)",
    "color:#111827",
    "cursor:pointer",
    "font:600 13px/1 ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
    "padding:9px 12px"
  ].join(";");

  const panel = document.createElement("section");
  panel.hidden = true;
  panel.setAttribute("aria-label", "WebMCP tools and information");
  panel.style.cssText = [
    "position:absolute",
    "right:0",
    "bottom:44px",
    "width:min(360px,calc(100vw - 32px))",
    "max-height:min(460px,calc(100vh - 88px))",
    "overflow:auto",
    "border:1px solid #d1d5db",
    "border-radius:8px",
    "background:#ffffff",
    "box-shadow:0 18px 48px rgba(17,24,39,0.22)",
    "padding:14px",
    "box-sizing:border-box"
  ].join(";");

  root.append(panel, button);
  document.body.append(root);

  function addText(parent: HTMLElement, tag: "div" | "p" | "span", text: string, cssText: string) {
    const element = document.createElement(tag);
    element.textContent = text;
    element.style.cssText = cssText;
    parent.append(element);
    return element;
  }

  function renderPanel() {
    const tools = options.listTools();
    panel.replaceChildren();

    addText(
      panel,
      "div",
      options.appName ? `${options.appName} WebMCP` : "WebMCP",
      "font:700 15px/1.3 ui-sans-serif,system-ui;margin:0 0 4px;color:#111827"
    );
    addText(
      panel,
      "p",
      `${tools.length} tool${tools.length === 1 ? "" : "s"} registered. Runtime ${
        options.isRuntimeAvailable() ? "available" : "unavailable"
      }.`,
      "font:400 13px/1.45 ui-sans-serif,system-ui;margin:0 0 12px;color:#4b5563"
    );

    if (tools.length === 0) {
      addText(
        panel,
        "p",
        "No tools are registered on this page.",
        "font:400 13px/1.45 ui-sans-serif,system-ui;margin:0;color:#6b7280"
      );
      return;
    }

    const list = document.createElement("div");
    list.style.cssText = "display:grid;gap:10px";
    for (const tool of tools) {
      const item = document.createElement("article");
      item.style.cssText = [
        "border:1px solid #e5e7eb",
        "border-radius:8px",
        "padding:10px",
        "background:#f9fafb"
      ].join(";");

      addText(
        item,
        "div",
        tool.name,
        "font:700 13px/1.35 ui-sans-serif,system-ui;margin:0 0 4px;color:#111827;word-break:break-word"
      );
      addText(
        item,
        "p",
        tool.definition.description,
        "font:400 12px/1.45 ui-sans-serif,system-ui;margin:0 0 8px;color:#4b5563"
      );
      addText(
        item,
        "div",
        `Risk: ${tool.definition.risk ?? "read"} | Approval: ${
          tool.definition.approval ? "configured" : "default"
        }`,
        "font:500 12px/1.4 ui-sans-serif,system-ui;margin:0;color:#374151"
      );
      list.append(item);
    }
    panel.append(list);
  }

  button.addEventListener("click", () => {
    panel.hidden = !panel.hidden;
    button.setAttribute("aria-expanded", String(!panel.hidden));
    if (!panel.hidden) renderPanel();
  });

  return {
    update() {
      button.textContent = options.text;
      if (!panel.hidden) renderPanel();
    }
  };
}
