import { describe, it } from "vitest";
import { z } from "@webmcp-js/core";
import { createTestWebMCP, expectTool } from "../src/index.js";

describe("@webmcp-js/testing", () => {
  it("asserts approval requirements", async () => {
    const mcp = createTestWebMCP();
    const tool = mcp.tool("checkout.start", {
      description: "Start checkout",
      input: z.object({ cartId: z.string() }),
      risk: "critical",
      approval: true,
      run: () => ({ checkoutId: "chk_1" })
    });

    await expectTool(tool).withInput({ cartId: "cart_1" }).toRequireApproval();
  });

  it("asserts validation failures", async () => {
    const mcp = createTestWebMCP();
    const tool = mcp.tool("products.search", {
      description: "Search products",
      input: z.object({ query: z.string().min(1) }),
      run: () => []
    });

    await expectTool(tool).withInput({ query: "" }).toFailValidation();
  });
});
