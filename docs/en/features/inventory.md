# API inventory

**APIs → Inventory** lists APIs by service, merging methods and paths from specifications, code and logs while retaining their sources.

## Quick access

1. Select a service collection.
2. Review methods, paths and sources; narrow them with search and filters.
3. Select an API to open its [details panel](api-details.md).
4. Inspect runtime differences in **Calls / Findings** and structure in **Fields**.

## Sources and states

| Label | Meaning |
|---|---|
| Spec | Declared in a specification |
| Code | Found in registered code |
| Log | Observed in collected logs |
| Shadow | Observed outside an available baseline specification |
| No traffic | Not observed during the collected window |
| No spec | No independent baseline specification |

A specification-only view does not produce runtime counts, value observations or passing checks. No traffic does not establish that an API is retired.

## Path normalization

Numeric IDs, UUIDs and similar path components are normalized to group calls to the same API. For example, `/users/123` and `/users/456` may become `/users/{id}`. Service path prefixes and route maps affect matching.

Code-generated specifications do not count as independent Spec evidence. Merging sources keeps declaration counts separate from observed calls.

For missing fields or incorrect grouping, check [field mapping](../connect/logs.md#field-mapping) and [service assignment](../connect/logs.md#routing) first.
