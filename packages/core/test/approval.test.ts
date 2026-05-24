import { describe, expect, it } from "vitest";
import { decideApproval, matchesToolName } from "../src/index.js";

describe("approval", () => {
  it("matches wildcard tool names", () => {
    expect(matchesToolName("products.*", "products.search")).toBe(true);
    expect(matchesToolName("products.*", "cart.add")).toBe(false);
  });

  it("does not require approval for read and low risk by default", () => {
    expect(decideApproval({ name: "products.search", risk: "read" }).required).toBe(false);
    expect(decideApproval({ name: "cart.preview", risk: "low" }).required).toBe(false);
  });

  it("requires approval for high and critical risk by default", () => {
    expect(decideApproval({ name: "cart.add", risk: "high" }).required).toBe(true);
    expect(decideApproval({ name: "checkout.start", risk: "critical" }).required).toBe(true);
  });

  it("honors approval rules before risk defaults", () => {
    expect(
      decideApproval({
        name: "cart.add",
        risk: "high",
        config: {
          rules: [{ match: "cart.*", requireApproval: false }]
        }
      }).required
    ).toBe(false);
  });

  it("honors tool-level approval overrides before rules", () => {
    expect(
      decideApproval({
        name: "products.search",
        risk: "read",
        toolApproval: true,
        config: {
          rules: [{ match: "products.*", requireApproval: false }]
        }
      }).required
    ).toBe(true);
  });
});
