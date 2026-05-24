
## What It Shows

webmcp.js lets a web app expose explicit, validated actions to a compatible WebMCP runtime while still keeping local tool handles for testing and progressive enhancement.

```ts
import { createWebMCP, z } from "@webmcp-js/core";

const mcp = createWebMCP({
  appName: "Demo Store",
  showSupportWebMCP: true,
  approval: { mode: "browser-dialog" }
});

mcp.tool("products.search", {
  description: "Search products in the catalog",
  input: z.object({
    query: z.string().min(1),
    limit: z.number().min(1).max(20).default(10)
  }),
  risk: "read",
  run: async ({ query, limit }) => productService.search(query, limit)
});

mcp.tool("cart.add", {
  description: "Add a product to the current cart",
  input: z.object({
    productId: z.string(),
    quantity: z.number().min(1).default(1)
  }),
  risk: "high",
  approval: true,
  run: async ({ productId, quantity }) => cart.add(productId, quantity)
});
```

## Documentation Links

- [Getting Started](/guide/getting-started): install and register your first tool.
- [Core Concepts](/guide/core-concepts): tools, validation, risk levels, and structured results.
- [Approvals](/guide/approvals): browser dialog and custom approval providers.
- [Security](/guide/security): practical rules for exposing executable app actions.
- [React](/guide/react): `WebMCPProvider` and `useWebMCPTool`.
- [Testing](/guide/testing): in-memory adapter and assertions.
- [API Reference](/reference/api): exports, interfaces, result types, and error codes.
- [Configuration](/reference/configuration): all `createWebMCP` options.

## Repository Examples

- [Vanilla TypeScript example](/guide/examples#vanilla-typescript)
- [React Vite example](/guide/examples#react-vite)

## GitHub Website URL

After Vercel deploys the site, set the repository website URL to:

```txt
https://your-vercel-domain.vercel.app/demo
```

You can also use the root URL if you prefer the full documentation homepage:

```txt
https://your-vercel-domain.vercel.app/
```
