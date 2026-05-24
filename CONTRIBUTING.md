# Contributing

Contributions should improve WebMCP tool registration, validation, approvals, auditability, examples, or tests.

## Development

```bash
pnpm install
pnpm build
pnpm test
pnpm lint
```

Packages live in `packages/*`. Examples live in `examples/*`.

## Rules

- Do not claim browser behavior that is not documented or tested.
- Do not add a dependency unless it removes real implementation risk.
- Keep public API changes documented.
- Add tests when changing validation, approvals, adapters, React behavior, or testing helpers.
- Keep examples focused on WebMCP tool exposure, not general app UI.

## Security

Follow [SECURITY.md](./SECURITY.md) for vulnerability reports.
