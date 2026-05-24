import {
  createWebMCP,
  type CreateWebMCPOptions,
  type RegisteredWebMCPTool,
  type RegisteredToolHandle,
  type WebMCPAdapter
} from "@webmcp-js/core";

export function createTestAdapter() {
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

export function createTestWebMCP(options: CreateWebMCPOptions = {}) {
  const testAdapter = createTestAdapter();
  const mcp = createWebMCP({ ...options, adapter: options.adapter ?? testAdapter.adapter });
  return Object.assign(mcp, { testAdapter });
}

export function expectTool<TInput, TOutput>(tool: RegisteredToolHandle<TInput, TOutput>) {
  let input: unknown = {};

  return {
    withInput(nextInput: unknown) {
      input = nextInput;
      return this;
    },
    async toPass() {
      const result = await tool.execute(input);
      if (!result.ok) {
        throw new Error(
          `Expected tool to pass, received ${result.error.code}: ${result.error.message}`
        );
      }
      return result.data;
    },
    async toFailWith(code: string) {
      const result = await tool.execute(input);
      if (result.ok || result.error.code !== code) {
        throw new Error(`Expected ${code}, received ${result.ok ? "ok" : result.error.code}.`);
      }
    },
    async toRequireApproval() {
      await this.toFailWith("APPROVAL_REQUIRED");
    },
    async toRejectApproval() {
      await this.toFailWith("APPROVAL_REJECTED");
    },
    async toFailValidation() {
      await this.toFailWith("VALIDATION_FAILED");
    }
  };
}

export type { RegisteredToolHandle, RegisteredWebMCPTool } from "@webmcp-js/core";
