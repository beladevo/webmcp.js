// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";
import { createWebMCP } from "../src/index.js";
import type { RegisteredWebMCPTool, WebMCPAdapter } from "../src/index.js";

function memoryAdapter() {
  const tools = new Map<string, RegisteredWebMCPTool>();
  const adapter: WebMCPAdapter = {
    isAvailable: () => true,
    registerTool: (tool) => {
      tools.set(tool.name, tool);
    },
    unregisterTool: (name) => {
      tools.delete(name);
    }
  };
  return { adapter, tools };
}

describe("WebMCP badge", () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it("is hidden by default", () => {
    createWebMCP({ adapter: memoryAdapter().adapter });

    expect(document.querySelector("#webmcp-js-badge")).toBeNull();
  });

  it("shows registered tools when enabled", () => {
    const mcp = createWebMCP({
      adapter: memoryAdapter().adapter,
      appName: "Storefront",
      showSupportWebMCP: true
    });

    mcp.tool("products.search", {
      description: "Search products in the catalog",
      risk: "read",
      run: () => []
    });

    const button = document.querySelector<HTMLButtonElement>("#webmcp-js-badge button");
    expect(button?.textContent).toBe("We support WebMCP");

    button?.click();

    expect(document.body.textContent).toContain("Storefront WebMCP");
    expect(document.body.textContent).toContain("products.search");
    expect(document.body.textContent).toContain("Search products in the catalog");
    expect(document.body.textContent).toContain("Runtime available");
  });

  it("supports configurable badge text", () => {
    createWebMCP({
      adapter: memoryAdapter().adapter,
      showSupportWebMCP: true,
      supportWebMCPBadgeText: "AI tools available"
    });

    const button = document.querySelector<HTMLButtonElement>("#webmcp-js-badge button");
    expect(button?.textContent).toBe("AI tools available");
  });
});
