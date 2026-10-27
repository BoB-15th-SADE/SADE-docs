# API inventory

**APIs › Inventory** lists APIs by service. APIs found in specs, code and logs are merged into one entry, with a tag for each source that confirmed it. It is the starting point for knowing your API assets and finding shadow APIs that fell out of management.

## How to read it

<div class="sade-steps" markdown>

1. Pick a service. Each shows its API count, how many APIs carry sensitive data and whether it was called.
2. In the API list, check method and path, evidence (`Spec` / `Code` / `Log`), auth method, exposure and sensitive data.
3. Narrow down with the tabs, filters and search, for example shadow APIs only, or APIs with sensitive data candidates.
4. Click an API to open [API details](api-details.md).

</div>

## Tabs and filters

| Tab | Shows |
|---|---|
| All | Every API of this service |
| Sensitive | APIs with sensitive data candidates |
| Shadow | APIs seen in calls but missing from the spec, on services that have one |

Filter by **Method**, **Access type** (exposure) and **Service**, or type part of a path into search.

## Keep in mind

- **Not logged** does not mean retired. The API may just not have been used during the window.
- Services with only a spec have no call counts or value observations. A spec is a declaration.
- Call counts cover every collected log. Large Splunk sources count every call too.
- APIs that differ only in path parameter names are merged (`/users/{id}` = `/users/{userId}`).

If paths group oddly or services split wrongly, check [field mapping](../connect/logs.md#field-mapping), [service assignment](../connect/logs.md#routing) and the service's path prefix first.

[<span class="q">Curious?</span><span class="t">How `/orders/1024` becomes `GET /orders/{id}` and shadow APIs are decided</span><span class="arrow">→</span>](../technology/api-discovery.md){ .sade-curious }
