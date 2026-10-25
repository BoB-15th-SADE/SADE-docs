# Dashboard navigation

The dashboard follows **connect → analyze → inspect → refine rules**. Change the dashboard language in Settings; this guide uses the English menu names.

| Menu | Purpose | Guide |
|---|---|---|
| Connect → Log Sources | Connection, mapping and collection settings | [Log sources](../connect/logs.md) |
| Connect → Specifications | Services and OpenAPI registration | [Specifications](../connect/specs.md) |
| Connect → Source Code | GitHub, code inventories and route maps | [Source code](../connect/code.md) |
| Overview | Current analysis summary | [API inventory](../features/inventory.md) |
| Scans | Log scan status and history | [Scans and jobs](../operations/scans.md) |
| APIs → Inventory | Service APIs and the details panel | [API details](../features/api-details.md) |
| APIs → Call History | Search retained calls | [Call history](../features/call-history.md) |
| APIs → Sensitive Data | Browse sensitive fields by type | [Sensitive data](../features/sensitive-data.md) |
| Flows | Service-call map | [Service flows](../features/flows.md) |
| Policy → Rules → Data Types | Detection types and rules | [Rule management](../policy/data-types.md) |
| Policy → Rules → Access Scope | Host/path scope classification | [Access scope](../policy/access-scope.md) |
| Policy → Findings | Specification checks | [Findings](../features/findings.md) |

## Read status labels

- **Spec / Code / Log** identify evidence sources; an API may have all three.
- **Scan required** means current inputs and the last full analysis differ.
- **Not evaluated / —** mean unevaluated or unrecorded, not safe, absent or mismatched.
- After saving changes, allow background processing to finish before reading the updated result.
