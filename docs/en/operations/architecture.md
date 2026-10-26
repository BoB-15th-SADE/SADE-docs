# Architecture and workers

SADE consists of a dashboard/API server, SQLite and background workers. In the SADE repository the code lives in `apps/dashboard/backend` (server and workers), `apps/dashboard/web` (screens) and `packages/sade-codescan` (code analysis). Workers perform collection and analysis rather than long-running browser requests.

## Components

| Component | Role |
|---|---|
| API server | Serve UI, validate/save settings, queue jobs and return results |
| SQLite | Settings, jobs, collection batches (no values), results, rule versions, checkpoints |
| Heavy worker | Log collection, scans (Run scan), code scans |
| Light worker | Saved-evidence `privacy-refresh` |
| CodeScan | Code APIs, fields, gateway configuration and HTTP calls |

Default Compose starts `api`, `worker` and `worker-light` against the same database. A single worker without `--lane` can process all jobs sequentially.

## Run without Docker

Run each command in a separate terminal from the SADE repository.

```bash
cd apps/dashboard/backend
python api_server.py --host 127.0.0.1 --port 8765
```

```bash
cd apps/dashboard/backend
python -m sade_cli worker --lane heavy
```

```bash
cd apps/dashboard/backend
python -m sade_cli worker --lane light
```

The dashboard runtime uses Python's standard library. Code analysis additionally requires CodeScan dependencies and git, included in the Docker image. For local CodeScan, follow the tool installation guide and configure `--scanner-python` / `--scanner-dir`.

## Result reads

`/api/model` provides summaries; dedicated endpoints load individual APIs and pages of saved calls. `/api/request-flow` and `/api/flow-explorer` read only what the request flow and Flows views need from stored results. Refreshing or searching the dashboard does not fetch remote logs. `/api/export` provides the complete model.

Production builds include application code in the image and mount only data, imports and certificates. Add `compose.dev.yaml` for development source mounts.

Built-in server authentication and organization-level RBAC are not currently provided. Deployments beyond the local default need access controls and storage protection supplied by the environment.
