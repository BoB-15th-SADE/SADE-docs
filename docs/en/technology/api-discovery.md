# API discovery and shadow APIs

Logs record the **actual path**, such as `GET /order/orders/1024`. Specs and code hold **path templates**, such as `GET /orders/{id}`. SADE matches each actual path to a template to decide which API a call belongs to, and calls that match nothing become shadow API candidates.

## Steps

<div class="sade-pipe" markdown>
<div markdown>**Assign a service**<p>`/order/...` → order</p></div>
<div markdown>**Strip the prefix**<p>`/order/orders/1024` → `/orders/1024`</p></div>
<div markdown>**Drop non-API paths**<p>Docs, health checks, static files</p></div>
<div class="is-key" markdown>**Match a template**<p>`/orders/1024` → `/orders/{id}`</p></div>
<div markdown>**Merge and tag**<p>Merge duplicates; Spec, Code, Log</p></div>
</div>

### Assigning a service

| Method | Rule |
|---|---|
| Path prefix | The **longest** prefix registered on a service. With both `/product` and `/product/storefront`, `/product/storefront/items` goes to the second |
| Service name in the log | Matched against the service ID, its aliases, then the name without `-service`, `-svc` or `-api`. Host names are used only when they look internal, such as `*.svc` or `*.internal` |

An external host such as `user.partner-bank.com` is not treated as an internal service unless you add it as an alias. Calls that match nothing stay Unassigned.

### Paths that are not APIs

`/v3/api-docs`, `/swagger-ui`, `/actuator`, `/h2-console`, `/static/`, `/favicon.ico` and static files such as `.js`, `.css` and images are not counted as APIs. The excluded count is shown separately.

### Matching a template

SADE picks a template from those collected from specs and code.

<div class="sade-steps" markdown>

1. **An identical path** is used as is.
2. **Candidates that fit the template** are collected. `{id}` matches one segment between slashes. A trailing slash is ignored (`/api/items/` = `/api/items`).
3. **Multi-segment wildcards** (Go `{path...}`, Gin `*path`) are tried after ordinary templates.
4. **Several candidates are narrowed by method.** With `GET /items/{itemId}` and `PUT /items/{id}` in the spec, a PUT goes to `{id}`.

</div>

=== "Path in the spec"

    | Log | Matched API |
    |---|---|
    | `GET /orders/1024` | `GET /orders/{id}` |
    | `PUT /items/7` | `PUT /items/{id}` (told apart from `GET /items/{itemId}` by method) |
    | `GET /files/a/b/c.txt` | `GET /files/{path...}` |

=== "Path not in the spec"

    With no matching template, segments that look like IDs become `{id}` and the call is grouped as a new API. Otherwise thousands of IDs would scatter into thousands of APIs.

    | Replaced segment | Example |
    |---|---|
    | Number | `1024` |
    | UUID | `3fa85f64-5717-4562-b3fc-2c963f66afa6` |
    | Hex, 16 characters or more | `9f2c1d7e4b8a0c11` |
    | Token of 20+ characters containing digits | `a1B2c3D4e5F6g7H8i9J0k` |
    | Email | `user@example.com` |

    `/admin/users/77` → `GET /admin/users/{id}` (not in the spec, so a shadow API)

### Merging duplicate records

When the gateway and the service both log one request, there are two lines. They become one call only when all of these match:

- Same service, request ID, method, path and status
- Same hop ID, if both have one (different hop IDs mean separate calls, such as a retry)
- Matching trace and span, if both have them

Close timestamps alone are never enough. Logs without request IDs cannot be deduplicated, so each line counts.

## Source tags

| Tag | Meaning | Does not guarantee |
|---|---|---|
| `Spec` | In the spec registered for this service | That it is implemented |
| `Code` | A route is registered in this service's code | That it is deployed or reachable |
| `Log` | Calls appear in the collected logs | That it works correctly |

Templates that differ only in parameter names are the same API (`/users/{id}` = `/users/{userId}`, and Gin `:id` too). Header parameters are case-insensitive.

## What counts as a shadow API {#shadow}

A shadow API is **a call seen in the logs, on a service that has a spec, whose method and path are not in that spec**. Nothing else.

| Case | Marked shadow |
|---|---|
| Service with a spec, call not in it | Yes |
| Service with no spec | No (nothing to compare with) |
| Service whose only spec is a draft built from traffic | No (the baseline came from the same traffic) |
| API in code that is never called | No. Shown as `Code only` or `Implemented, no traffic` |

The combined list of specs, code and logs does not prove you have found every deployed API. An API that left no log and whose code was never scanned stays unknown.
