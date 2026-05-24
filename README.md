# webmcp.js

TypeScript toolkit for exposing typed, validated, approval-aware WebMCP tools.

webmcp.js is not an official W3C, Chrome, Google, Microsoft, MCP, or MCP-B project. WebMCP is an emerging browser API proposal. Names, availability, and runtime behavior may change.

## What This Library Does

webmcp.js helps a web app register structured tools with `navigator.modelContext` when that API exists. It does not define a new protocol and does not install a WebMCP runtime.

It adds:

- Typed tool definitions
- Zod input validation
- JSON Schema generation for registration
- Risk levels
- Approval rules
- Human or agent approval before sensitive actions
- Redacted audit hooks
- React registration hooks
- Test adapters and assertions

Zod is only the developer-facing schema API used by this library. WebMCP tool registration uses JSON Schema-compatible data.

## WebMCP Status

WebMCP is intended to let pages expose explicit actions such as `products.search`, `cart.add`, or `checkout.start` through `navigator.modelContext`. The goal is to give supporting agents and browser features structured capabilities instead of relying only on DOM inspection or click automation.

The API should be treated as experimental. Chrome documentation has described local development behind a Chrome flag, origin trial availability in Chrome 149, an imperative JavaScript API, and declarative HTML/form annotations. Those platform details belong to the browser/runtime, not to webmcp.js.

## Install

```bash
pnpm add @webmcp-js/core zod
```

## Register A Read Tool

```ts
import { createWebMCP } from "@webmcp-js/core";
import { z } from "zod";

const mcp = createWebMCP({
  appName: "Storefront",
  debug: true,
  unavailable: "warn"
});

mcp.tool("products.search", {
  description: "Search products in the catalog",
  input: z.object({
    query: z.string().min(1),
    limit: z.number().min(1).max(50).default(10)
  }),
  risk: "read",
  run: async ({ query, limit }) => productService.search(query, limit)
});
```

If `navigator.modelContext.registerTool` is available, the tool is registered with the native runtime. If it is unavailable, the local tool handle still exists for tests and progressive enhancement behavior.

## Register A Sensitive Tool

```ts
mcp.tool("checkout.start", {
  description: "Start checkout for the current cart",
  input: z.object({ cartId: z.string() }),
  risk: "critical",
  approval: {
    required: true,
    reason: "Checkout starts a purchase flow."
  },
  audit: true,
  run: async ({ cartId }) => checkoutService.start(cartId)
});
```

Tool execution returns structured results:

```ts
{
  ok: false,
  error: {
    code: "APPROVAL_REQUIRED",
    message: "Tool checkout.start requires approval, but no approval provider is configured.",
    risk: "critical"
  }
}
```

## Approval Defaults

The default approval policy is `risk-based`.

- `read`: allowed
- `low`: allowed
- `medium`: allowed
- `high`: approval required
- `critical`: approval required

```ts
const mcp = createWebMCP({
  approval: {
    mode: "custom",
    approve: requestToolApproval,
    policy: "risk-based",
    rules: [
      { match: "products.*", requireApproval: false },
      { match: "cart.add", requireApproval: true },
      { match: "checkout.*", requireApproval: true, reason: "Checkout starts a purchase flow." }
    ]
  }
});
```

Rules use simple `*` wildcard matching against tool names.

## Approval Providers

Browser dialog:

```ts
createWebMCP({
  approval: { mode: "browser-dialog" }
});
```

Custom provider:

```ts
createWebMCP({
  approval: {
    mode: "custom",
    approve: async ({ tool, input, risk, reason }) =>
      approvalService.request({ tool, input, risk, reason })
  }
});
```

If a tool requires approval and no provider is configured, execution returns `APPROVAL_REQUIRED`.

## Audit Hooks

Inputs are redacted by default before audit hooks receive them.

```ts
createWebMCP({
  audit: {
    redact: (input) => ({ type: typeof input }),
    onToolCallDenied: (event) => securityLog.warn(event),
    onToolCallError: (event) => securityLog.error(event)
  }
});
```

Do not log secrets, tokens, payment data, private messages, or full freeform user content unless your application policy explicitly allows it.

## React

```bash
pnpm add @webmcp-js/react @webmcp-js/core zod
```

```tsx
import { WebMCPProvider, useWebMCPTool } from "@webmcp-js/react";
import { z } from "zod";

function ProductPage({ product }) {
  useWebMCPTool("cart.add_current_product", {
    description: "Add the current product to the cart",
    input: z.object({ quantity: z.number().min(1).default(1) }),
    risk: "high",
    approval: true,
    run: async ({ quantity }) => cart.add(product.id, quantity)
  });

  return <ProductView product={product} />;
}

export function App() {
  return (
    <WebMCPProvider appName="Storefront" debug approval={{ mode: "browser-dialog" }}>
      <ProductPage />
    </WebMCPProvider>
  );
}
```

`useWebMCPTool` registers on mount and unregisters on unmount when the adapter supports `unregisterTool`.

## Testing

```ts
import { createTestWebMCP, expectTool } from "@webmcp-js/testing";
import { z } from "zod";

test("critical tool requires approval", async () => {
  const mcp = createTestWebMCP();

  const tool = mcp.tool("checkout.start", {
    description: "Start checkout",
    input: z.object({ cartId: z.string() }),
    risk: "critical",
    approval: true,
    run: async () => ({ checkoutId: "chk_1" })
  });

  await expectTool(tool).withInput({ cartId: "cart_1" }).toRequireApproval();
});
```

## Native Runtime And Polyfills

The default adapter uses `navigator.modelContext.registerTool` when it exists. It does not create `navigator.modelContext`.

If you choose to use a polyfill, initialize it before creating the webmcp.js instance:

```ts
import { initializeWebMCPPolyfill } from "@mcp-b/webmcp-polyfill";
initializeWebMCPPolyfill();

import { createWebMCP } from "@webmcp-js/core";
```

webmcp.js does not depend on the full MCP-B runtime by default.

## Security Rules

- Validate every input.
- Keep tools narrow and named for one action.
- Require approval for high-impact tools.
- Enforce application auth for user-specific tools in your app services.
- Do not expose secrets in tool output.
- Redact audit events.
- Keep the human UI working without WebMCP.
- Review iframe and Permissions Policy behavior for the browser/runtime you target.

## Limitations

- Browser support is experimental.
- Tools require an active page context.
- Tool discoverability requires visiting the page.
- Unsupported browsers need a compatible runtime or polyfill.
- This library cannot guarantee platform behavior outside its adapter and execution wrapper.

## Roadmap

- More JSON Schema conversion tests
- Better approval and audit test helpers
- Next.js example
- Vue and Svelte adapters
- Integration tests against a real WebMCP runtime when practical
- Form-to-tool helpers after the core API is stable

## License

MIT.
