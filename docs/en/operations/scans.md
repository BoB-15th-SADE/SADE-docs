# Scans and jobs

API requests enqueue collection and analysis rather than running them directly. Workers execute the jobs while the dashboard polls their state.

## Job types

| Job | External reads | Result |
|---|---|---|
| Sync / Sync all | Log collection | Collection state, counts and evidence availability; no full assessment |
| Run scan | Includes log collection | Inventory, sensitive data, checks, flows and a scan record |
| GitHub Scan selected | Clone repositories and analyze code | Inventories, generated specs, route maps and HTTP calls |
| Automatic `privacy-refresh` | None | Sensitive-data reclassification from saved evidence; no new checks or scan record |

**Sync is optional before Run scan.** Use it to check collection or import a particular source. Automatic classification after registration or rule changes differs from fetching new logs.

## Job states

The normal sequence is `Queued → Running → Completed`. For Failed, inspect the reason and correct the input before retrying. Superseded means inputs changed and the old job could not apply its result.

Scans focuses on log-scan history. GitHub code scans and reclassification do not each create a log-scan row. Also inspect connection job indicators or CLI jobs.

## Scheduled scans

Choose Manual / Every hour / Every 6 hours / Every day in the log connection. A running worker checks schedules and enqueues scans; an open browser tab is not required.

## Results not updating

- A persistent Queued state suggests a missing worker or worker lane.
- A failed source can fail a full scan.
- Long-running Classifying after a rule change requires checking worker-light.
- Missing or stale evidence cannot establish a new Value matched result through reclassification alone. Run scan to obtain the needed logs.

See [architecture and workers](architecture.md) and [troubleshooting](../troubleshooting/index.md).
