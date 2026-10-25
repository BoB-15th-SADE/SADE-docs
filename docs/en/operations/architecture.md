# Architecture and workers

SADE consists of a dashboard/API server, SQLite and background workers. Workers perform collection and analysis rather than long-running browser requests.

## Components

| Component | Role |
|---|---|
| API server | Serve UI, validate/save settings, queue jobs and return results |
| SQLite | Settings, jobs, results, rule versions and Splunk evidence cache |
| Heavy worker | Sync, log scans and CodeScan |
| Light worker | Saved-evidence `privacy-refresh` |
| CodeScan | Code APIs, fields, gateway configuration and HTTP calls |

Default Compose starts `api`, `worker` and `worker-light` against the same database. A single worker without `--lane` can process all jobs sequentially.

## Run without Docker

Run each command in a separate terminal from the SADE repository.

```bash
cd apps/sade-dashboard
python api_server.py --host 127.0.0.1 --port 8765
```

```bash
cd apps/sade-dashboard
python -m sade_cli worker --lane heavy
```

```bash
cd apps/sade-dashboard
python -m sade_cli worker --lane light
```

The dashboard runtime uses Python's standard library. Code analysis additionally requires CodeScan dependencies and git, included in the Docker image. For local CodeScan, follow the tool installation guide and configure `--scanner-python` / `--scanner-dir`.

## Result reads

`/api/model` provides summaries; dedicated endpoints load individual APIs and pages of saved calls. Refreshing or searching the dashboard does not fetch remote logs. `/api/export` provides the complete model.

Production builds include application code in the image and mount only data, imports and certificates. Add `compose.dev.yaml` for development source mounts.

Built-in server authentication and organization-level RBAC are not currently provided. Deployments beyond the local default need access controls and storage protection supplied by the environment.
