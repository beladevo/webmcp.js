# Security

WebMCP tools are executable application actions. Treat every registered tool as part of your app security surface.

## Risk Levels

- `read`: reads public or low-sensitivity state
- `low`: small local changes with limited user impact
- `medium`: user-visible changes or reads of user-specific data
- `high`: submissions, messages, cart changes, account changes, or other meaningful side effects
- `critical`: checkout, payments, destructive actions, privileged workflows, or security-sensitive operations

High and critical risk tools require approval by default.

## Approval

Use approval for actions a user or supervising agent should review before execution. `browser-dialog` is acceptable for development. Production apps should usually use `approval.mode: "custom"` so the approval flow can show app-specific details.

Unsafe:

```ts
mcp.tool("checkout.start", {
  risk: "critical",
  run: startCheckout
});
```

Safer:

```ts
mcp.tool("checkout.start", {
  risk: "critical",
  approval: {
    required: true,
    reason: "Checkout starts a purchase flow."
  },
  run: startCheckout
});
```

## Authentication

Approvals do not replace application authentication. User-specific tools should call app services that enforce the current session and authorization checks.

## Audit Data

Audit hook input is redacted by default. Override `audit.redact` only with a function that removes secrets and personal data.

Do not log:

- Access tokens
- Payment data
- Session identifiers
- Private messages
- Passwords or recovery codes
- Full freeform user content unless explicitly approved by your app policy

## Tool Design

Prefer narrow tools:

```ts
"cart.add";
"support.submit_ticket";
"checkout.start";
```

Avoid broad tools:

```ts
"site.do_anything";
"admin.execute";
"user.update";
```

Narrow tools are easier to validate, approve, audit, and test.
