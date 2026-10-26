# HTTP API

These are the dashboard's current HTTP routes. The default base is `http://127.0.0.1:8765`; POST bodies are JSON objects. This is not a versioned public SaaS contract, so match it to the project version.

## Read results and state

| Method | Route | Result |
|---|---|---|
| GET | `/api/health` | API/database access; not worker liveness |
| GET | `/api/model` | Dashboard summary, job and sensitive-data state |
| GET | `/api/export` | Complete model |
| GET | `/api/apis/{id}` | Details/calls for a URL-encoded API ID |
| GET | `/api/calls` | Retained call page |
| GET | `/api/request-flow` | Request flow tree for one call |
| GET | `/api/flow-explorer` | Traces for a client IP or service picked in Flows |
| GET | `/api/jobs/{id}` | Job status, outcome and errors |
| GET | `/api/connections` | Registered services and sources |
| GET | `/api/privacy/config` | Active classification configuration, types and rules |
| GET | `/api/github/repos` | Repositories readable through the saved GitHub connection |

`/api/calls` accepts `offset` (default 0), `limit` (default 20, maximum 200), `api`, `method`, `status` (2/3/4/5), `check` and `q`. It returns `calls`, `total`, `offset` and `limit`. `check` is `any` or one spec check reason.

`/api/request-flow` takes **exactly one** of `call`, `event` or `trace` (up to 200 characters). It returns 404 when the saved result has no flow.

`/api/flow-explorer` takes one of `client` (an observed IP) or `service`, plus `offset` and `limit` (1–100, default 50).

## Start jobs

| Method | Route | Input/behavior |
|---|---|---|
| POST | `/api/collect` | `{}` or `{"source_id":"…"}`; collect logs (Collect now), HTTP 202 |
| POST | `/api/connectors/import` | Same as `/api/collect`; kept for older screens |
| POST | `/api/scan` | `{}` or `{"collection_id":"…"}`; recheck a stored collection (Run scan), no outside reads, HTTP 202 |
| POST | `/api/github/scan` | Selected GitHub repositories; queue code scan |
| POST | `/api/connectors/test` | Test a draft connection without saving |
| POST | `/api/connectors/browse` | Browse WebHDFS folders without saving |

Poll `/api/jobs/{id}` with the response's `job.id`. HTTP 202 means queued, not completed. Without `collection_id`, the latest collection is scanned.

```bash
curl -X POST http://127.0.0.1:8765/api/collect -H "Content-Type: application/json" -d "{}"
curl -X POST http://127.0.0.1:8765/api/scan -H "Content-Type: application/json" -d "{}"
```

## Change configuration

| Route (POST) | Purpose |
|---|---|
| `/api/services` | Register services/specifications |
| `/api/connections/source` | Save a log source |
| `/api/connections` | Save connection registry |
| `/api/code` / `/api/routing` | Register inventory / route map |
| `/api/settings` | General/access-scope settings |
| `/api/privacy/config` | Save `config` or restore `version`; optional `workspace_revision` checks conflicts |
| `/api/connections/disconnect` | Disconnect registration |
| `/api/github/connect` / `/api/github/disconnect` | Manage GitHub connection |
| `/api/github/routes/restore` | Allow route-map registration for a repository again |

Saving configuration can queue sensitive-field reclassification. On a settings conflict, reload current settings before retrying your edit.

## Test classification

`POST /api/privacy/test` accepts `sample`, `location`, and optional `config`, `api_id`, `rule_id`. The sample limit is 32 KiB. The response includes `matches`, `reason_codes`, `field_count` and `stored:false`. Match properties such as `data_type` use internal type IDs.

```json
{"sample":{"email":"person@example.com"},"location":"request.body"}
```

There is no built-in user authentication. Browser writes from a different Origin are rejected; this is not a substitute for deployment authentication.
