# Approvals

Approvals decide whether a WebMCP tool may run now. They are the library-level gate for human-in-the-loop confirmation, agent approval, or any application-specific approval flow.

Approvals do not replace application authentication. If a tool depends on a signed-in user, check that in your app service or inside the tool function before changing state.

## Defaults

The default policy is `risk-based`.

- `read`: no approval
- `low`: no approval
- `medium`: no approval
- `high`: approval required
- `critical`: approval required

This default keeps low-impact tools fast and blocks high-impact tools until an approval provider accepts the call.

## Configure Approval

Browser dialog:

```ts
createWebMCP({
  approval: {
    mode: "browser-dialog"
  }
});
```

Custom provider:

```ts
createWebMCP({
  approval: {
    mode: "custom",
    approve: async ({ tool, input, risk, reason }) => {
      return approvalService.request({ tool, input, risk, reason });
    }
  }
});
```

No provider:

```ts
createWebMCP({
  approval: {
    mode: "none"
  }
});
```

If a tool requires approval and no provider is configured, execution returns `APPROVAL_REQUIRED`.

## Policies

```ts
createWebMCP({
  approval: {
    policy: "risk-based"
  }
});
```

- `risk-based`: high and critical tools require approval
- `require-all`: every tool requires approval
- `allow-all`: no tool requires approval unless a rule or tool override says otherwise

## Rules

Rules are checked in order. The first matching rule applies.

```ts
createWebMCP({
  approval: {
    mode: "custom",
    approve: requestApproval,
    rules: [
      { match: "products.*", requireApproval: false },
      { match: "cart.add", requireApproval: true },
      {
        match: "checkout.*",
        requireApproval: true,
        reason: "Checkout starts a purchase flow."
      }
    ]
  }
});
```

`*` matches any sequence of characters:

- `products.*` matches `products.search`
- `checkout.*` matches `checkout.start`
- `*` matches every tool

## Tool Overrides

Use `approval: true` for tools that always need approval.

```ts
mcp.tool("support.submit_ticket", {
  description: "Submit a support ticket",
  risk: "medium",
  approval: {
    required: true,
    reason: "Submitting a ticket sends user-provided content."
  },
  run: submitTicket
});
```

Use `approval: false` only when a high or critical tool has another explicit review step before it changes state.
