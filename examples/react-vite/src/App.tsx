import { createRoot } from "react-dom/client";
import { z } from "@webmcp-js/core";
import { WebMCPProvider, useWebMCPTool } from "@webmcp-js/react";

const products = [{ id: "p_1", name: "Mechanical Keyboard" }];

function ProductsPage() {
  const product = products[0]!;

  useWebMCPTool("products.search", {
    description: "Search products in the catalog",
    input: z.object({ query: z.string().min(1) }),
    risk: "read",
    run: ({ query }) =>
      products.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))
  });

  useWebMCPTool("cart.add_current_product", {
    description: "Add the current product to the cart",
    input: z.object({ quantity: z.number().min(1).default(1) }),
    risk: "high",
    approval: true,
    run: ({ quantity }) => ({ productId: product.id, quantity })
  });

  useWebMCPTool("support.submit_ticket", {
    description: "Submit a support ticket for the current user",
    input: z.object({ subject: z.string().min(1), message: z.string().min(1) }),
    risk: "high",
    approval: { required: true, reason: "Submitting a ticket sends user-provided content." },
    run: ({ subject }) => ({ ticketId: "ticket_1", subject })
  });

  return (
    <main>
      <h1>{product.name}</h1>
      <p>
        Available actions: product search, add to cart with approval, and support ticket submission.
      </p>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <WebMCPProvider appName="React Store" debug approval={{ mode: "browser-dialog" }}>
    <ProductsPage />
  </WebMCPProvider>
);
