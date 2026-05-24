import { describe, expect, it, vi } from "vitest";
import { createWebMCP, z } from "../src/index.js";
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

describe("createWebMCP", () => {
  it("registers a typed tool through the adapter", async () => {
    const { adapter, tools } = memoryAdapter();
    const mcp = createWebMCP({ adapter });

    const handle = mcp.tool("products.search", {
      description: "Search products",
      input: z.object({ query: z.string().min(1) }),
      run: ({ query }) => [{ id: query }]
    });

    await Promise.resolve();

    expect(tools.has("products.search")).toBe(true);
    await expect(handle.execute({ query: "shoes" })).resolves.toEqual({
      ok: true,
      data: [{ id: "shoes" }]
    });
  });

  it("returns a structured validation error", async () => {
    const mcp = createWebMCP({ adapter: memoryAdapter().adapter });
    const tool = mcp.tool("products.search", {
      description: "Search products",
      input: z.object({ query: z.string().min(1) }),
      run: () => []
    });

    const result = await tool.execute({ query: "" });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("VALIDATION_FAILED");
  });

  it("requires approval for high risk tools by default", async () => {
    const mcp = createWebMCP({ adapter: memoryAdapter().adapter });
    const tool = mcp.tool("cart.add", {
      description: "Add item to cart",
      input: z.object({ sku: z.string() }),
      risk: "high",
      run: () => ({ ok: true })
    });

    const result = await tool.execute({ sku: "sku_1" });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("APPROVAL_REQUIRED");
  });

  it("requires approval for critical tools by default", async () => {
    const mcp = createWebMCP({ adapter: memoryAdapter().adapter });
    const tool = mcp.tool("checkout.start", {
      description: "Start checkout",
      input: z.object({ cartId: z.string() }),
      risk: "critical",
      run: () => ({ checkoutId: "chk_1" })
    });

    const result = await tool.execute({ cartId: "cart_1" });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("APPROVAL_REQUIRED");
  });

  it("runs after custom approval accepts", async () => {
    const approve = vi.fn(() => true);
    const mcp = createWebMCP({
      adapter: memoryAdapter().adapter,
      approval: { mode: "custom", approve }
    });
    const tool = mcp.tool("checkout.start", {
      description: "Start checkout",
      input: z.object({ cartId: z.string() }),
      risk: "critical",
      run: ({ cartId }) => ({ checkoutId: cartId })
    });

    const result = await tool.execute({ cartId: "cart_1" });

    expect(approve).toHaveBeenCalledOnce();
    expect(result).toEqual({ ok: true, data: { checkoutId: "cart_1" } });
  });

  it("returns approval rejected when custom approval declines", async () => {
    const mcp = createWebMCP({
      adapter: memoryAdapter().adapter,
      approval: { mode: "custom", approve: () => false }
    });
    const tool = mcp.tool("cart.add", {
      description: "Add item",
      risk: "high",
      run: () => "added"
    });

    const result = await tool.execute({});

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("APPROVAL_REJECTED");
  });

  it("uses approval rules to require approval for lower risk tools", async () => {
    const mcp = createWebMCP({
      adapter: memoryAdapter().adapter,
      approval: {
        rules: [{ match: "support.*", requireApproval: true }]
      }
    });
    const tool = mcp.tool("support.submit_ticket", {
      description: "Submit support ticket",
      risk: "medium",
      run: () => ({ id: "ticket_1" })
    });

    const result = await tool.execute({});

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("APPROVAL_REQUIRED");
  });

  it("unregisters tools when the adapter supports it", async () => {
    const { adapter, tools } = memoryAdapter();
    const mcp = createWebMCP({ adapter });
    const tool = mcp.tool("products.search", {
      description: "Search",
      run: () => []
    });
    await Promise.resolve();

    await tool.unregister();

    expect(tools.has("products.search")).toBe(false);
    expect(mcp.getTool("products.search")).toBeUndefined();
  });
});
