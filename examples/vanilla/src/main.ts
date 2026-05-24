import { createWebMCP, z } from "@webmcp-js/core";

const products = [
  { id: "p_1", name: "Mechanical Keyboard", price: 129 },
  { id: "p_2", name: "USB-C Dock", price: 89 },
  { id: "p_3", name: "Noise Cancelling Headphones", price: 199 }
];

const cart: Array<{ productId: string; quantity: number }> = [];

const mcp = createWebMCP({
  appName: "webmcp.js Vanilla Store",
  showSupportWebMCP: true,
  debug: true,
  unavailable: "warn",
  approval: {
    mode: "browser-dialog",
    rules: [{ match: "cart.add", requireApproval: true }]
  }
});

mcp.tool("products.search", {
  description: "Search products in the catalog",
  input: z.object({ query: z.string().min(1), limit: z.number().min(1).max(20).default(10) }),
  risk: "read",
  run: ({ query, limit }) =>
    products
      .filter((product) => product.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, limit)
});

mcp.tool("products.get_details", {
  description: "Get details for a product",
  input: z.object({ id: z.string() }),
  risk: "read",
  run: ({ id }) => products.find((product) => product.id === id) ?? null
});

mcp.tool("cart.add", {
  description: "Add a product to the current cart",
  input: z.object({ productId: z.string(), quantity: z.number().min(1).default(1) }),
  risk: "high",
  approval: true,
  run: ({ productId, quantity }) => {
    cart.push({ productId, quantity });
    return { cartSize: cart.length };
  }
});

const input = document.querySelector<HTMLInputElement>("#query");
const results = document.querySelector<HTMLUListElement>("#results");
document.querySelector("#search")?.addEventListener("click", async () => {
  const tool = mcp.getTool("products.search");
  const response = await tool?.execute({ query: input?.value ?? "", limit: 10 });
  if (!results || !response?.ok) return;
  results.innerHTML = "";
  for (const product of response.data as typeof products) {
    const item = document.createElement("li");
    item.textContent = `${product.name} - $${product.price}`;
    results.append(item);
  }
});
