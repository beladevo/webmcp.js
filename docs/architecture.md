# Architecture

webmcp.js is an execution and safety layer around WebMCP tool registration. It does not define a protocol.

## Adapter

The default adapter checks for:

```ts
globalThis.navigator?.modelContext?.registerTool;
```

When present, webmcp.js passes a `RegisteredWebMCPTool` to that function. When absent, behavior follows `unavailable`: `silent`, `warn`, or `throw`.

The adapter is replaceable because WebMCP runtime APIs are still subject to change.

## Registry

`createWebMCP` keeps local handles for registered tools. The registry is used for:

- Tests
- React cleanup
- Explicit unregister calls
- Local execution when native WebMCP is unavailable

## Validation

Tool input is validated before approval checks. Zod schemas are accepted as the developer-facing schema format and converted to JSON Schema-compatible values for registration.

Non-Zod schema values are passed through as provided. webmcp.js does not validate arbitrary JSON Schema at runtime in this initial version.

## Execution Flow

1. Validate input.
2. Decide whether approval is required from risk defaults, approval rules, and tool overrides.
3. Ask the approval provider when required.
4. Run the tool function.
5. Return `{ ok: true, data }` or `{ ok: false, error }`.

The `run` function is not called when validation fails, approval is required without a provider, or approval is rejected.

## Audit Hooks

Audit hooks run around execution. Input is redacted by default before hooks receive it. Applications can provide a custom redaction function.

## React Package

`@webmcp-js/react` creates or receives a webmcp.js instance through context. `useWebMCPTool` registers a tool in an effect and unregisters it during cleanup when the adapter supports unregister.

## Testing Package

`@webmcp-js/testing` provides an in-memory adapter and assertions for validation, approval requirements, approval rejection, and successful execution.
