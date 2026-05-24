import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { z } from "@webmcp-js/core";
import type { RegisteredWebMCPTool, WebMCPAdapter } from "@webmcp-js/core";
import { WebMCPProvider, useWebMCPTool } from "../src/index.js";

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

function ProductTool() {
  useWebMCPTool("cart.add_current_product", {
    description: "Add current product",
    input: z.object({ quantity: z.number().min(1).default(1) }),
    risk: "high",
    approval: true,
    run: ({ quantity }) => ({ quantity })
  });
  return null;
}

describe("@webmcp-js/react", () => {
  it("registers on mount and unregisters on unmount", async () => {
    const { adapter, tools } = memoryAdapter();
    const result = render(
      <WebMCPProvider adapter={adapter}>
        <ProductTool />
      </WebMCPProvider>
    );
    await Promise.resolve();

    expect(tools.has("cart.add_current_product")).toBe(true);

    result.unmount();
    await Promise.resolve();

    expect(tools.has("cart.add_current_product")).toBe(false);
  });
});
