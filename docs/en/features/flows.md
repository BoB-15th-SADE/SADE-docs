# Service flows

**Flows** maps outside callers, gateways, services and external code-call targets. Switch LOG / SPEC / CODE to distinguish what each source establishes.

## Quick access

1. Register related specifications, code or logs and complete the relevant scans.
2. Select sources in Flows; all three are enabled initially.
3. Select a service circle for its relationships and APIs.
4. Select a line for the APIs and evidence supporting that relationship.
5. Select an API for its main path and other direct calls.

## What a line establishes

| Relationship | Evidence | Does not establish |
|---|---|---|
| Observed call | Explicit caller in receiver logs and matching request ID where needed | That every request follows this route |
| Declared gateway route | Forwarding rule in a route map | Runtime traffic through the route |
| HTTP call in code | Client-call file, line and target | Execution, frequency or field-level transfer |

A matching request ID alone does not create a relationship. Specifications declare accepted APIs, so **SPEC alone does not create call lines**.

## Navigate the map

Select a service or line to highlight its context and open the panel. Press Esc or close the panel to return. Drag to pan and use zoom controls or Ctrl/⌘+scroll.

## Limits

- Runtime addresses, unsupported HTTP clients and missing logs can leave links unresolved.
- Analysis covers HTTP REST, not gRPC or message queues.
- The same sensitive type on both APIs does not prove that the same value traveled between them.
- Rebuilding full flows after inventory changes can require Run scan. Check Scan required.
