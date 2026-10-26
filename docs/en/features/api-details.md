# API details

Click an API in Inventory to open the detail panel on the right. It puts what the spec, code and logs say about that API side by side.

## Tabs

| Tab | Shows |
|---|---|
| **Overview** | Service, host, evidence, auth method (declared in the spec and observed in logs), exposure, sensitive data summary |
| **Fields** | Request and response fields, type, required flag, `Spec` / `Code` / `Log` evidence, sensitive data type |
| **Code** | Implementation file and line, gateway routing, spec vs code differences, other services the code calls |
| **Sensitive data** | Location, field, type, Field matched, Value matched, inspection state |
| **Calls** | Recent calls of this API, spec check, link to request flow |

## Fields

Requests and responses are shown separately. For responses you can switch between **Example / Schema** per status code. Examples may come from the spec or be placeholders built from the structure; do not read them as real values.

A tick in an evidence column means that source confirmed the field. An empty cell is not "absent"; that source may not have been collected or scanned yet. The **Not in code** and **Only in code** filters show where spec and implementation differ.

## Code

| Item | Meaning |
|---|---|
| Implementation | Where the code handling this API lives. For a gateway API, the service reached through routing rules and the file and line of the rule |
| Spec vs code | Counts of matching, different, unresolved and code-only fields among those compared |
| Calls to other services | Other services and libraries this API's code calls, with file and line |
| Access in code | Permission or auth wrappers declared on the route (for example `RequirePermission("wallet:read")`) |

`No access check declared` does not mean "no auth". It means nothing was declared at route registration; the gateway or handler may still check.

## Auth

Overview shows auth on two lines: the method the spec declares and the method callers actually sent in logs. Seeing Bearer in logs does not mean the server enforces auth. Find calls that succeeded without credentials with **No credentials** under Calls.

## Calls

Only this API's calls, in the same format as Call History. Use the **Spec check** filter to see only calls that differ from the spec; pick a call to see its request, response and the offending lines. See [Call history and request flow](call-history.md).

[<span class="q">Curious?</span><span class="t">How spec and code are compared field by field (code2spec)</span><span class="arrow">→</span>](../technology/code2spec.md){ .sade-curious }
