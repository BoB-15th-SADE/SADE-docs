# Collection and scans

SADE work is split into **Collect** and **Scan**. The screen only queues jobs; workers run them.

## Three actions

| Button | What it does | Contacts outside systems | Updates |
|---|---|---|---|
| **Collect now** | Fetch logs and store evidence with values removed | Yes (Splunk, WebHDFS, files) | Inventory, sensitive data, Flows, Call History |
| **Run scan** | Spec check on the stored collection | No | Spec check, shadow APIs, scan history |
| **Refresh** | Reload stored results | No | The screen only |

Some jobs run on their own.

| Job | When | Contacts outside systems |
|---|---|---|
| GitHub code scan | **Scan selected** in Source Code | Clones repositories |
| Sensitive data reclassification (`privacy-refresh`) | Automatically after registering specs or code, or saving rules | No |
| Scheduled collection | Every Schedule interval of a source | Yes |

## Why they are separate

- **Less SIEM load**: Changing a spec or rule does not search the SIEM again.
- **Same data, fair comparison**: Rechecking the same collection lets you compare before and after a rule change.
- **Safe checkpoints**: Only collection moves the "read up to here" mark. Scans never touch it.
- **Failure isolation**: If the SIEM connection drops, scans keep working on the last collection.

## States

`Queued → Running → Completed` is the normal path.

| State | Meaning |
|---|---|
| Failed | Failed. Check the reason, fix the input and run again |
| Partial | Only some sources or windows were collected. The next collection continues |
| Superseded | Settings changed while running, so the result was not applied |

## Scheduled collection

Set a log source's **Schedule** to Every hour, Every 6 hours or Every day and the worker collects on that interval, each time reading only what came after the last checkpoint. It runs as long as the worker runs, with or without the dashboard open. The spec check updates only when you click Run scan.

## Workers

| Worker | Runs |
|---|---|
| `worker` (heavy) | Collection, scans, code scans |
| `worker-light` | Sensitive data reclassification |

If jobs stay Queued, check that the workers are up.

```bash
docker compose ps
docker compose logs --tail 100 worker worker-light
```

## When results do not change

- If a collection is Partial, collect again. It resumes at the failed window; finished windows are not read again.
- If a rule change produces no new value evidence (Value matched), the change may need raw values. Collect again.
- If Shadow or Spec check does not change after uploading a spec, click Run scan.

See also [Architecture](architecture.md) and [Troubleshooting](../troubleshooting/index.md).
