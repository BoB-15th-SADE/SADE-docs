# Connection and analysis issues

Start with the last job's state and error. Testing access, collecting evidence and performing full analysis are different stages.

| Symptom | Check | Next action |
|---|---|---|
| Persistent Queued | Workers, shared DB and lane | Read Compose worker logs |
| Classifying never finishes | worker-light | Start the light worker; inspect job errors |
| Test succeeds, scan fails | Read permissions, payload format, size | Reduce range; check DataNode allowlist and JSON |
| HTTP 401 / 403 | Expired token or missing read/search rights | Update the connection token and permissions |
| TLS trust failure | Corporate CA and file path | Mount the CA under certs and configure its path |
| No APIs | Time/method/path/status mapping | Review Test preview and Field mapping |
| Unassigned APIs | Service assignment/log service value | Review IDs, aliases and path prefixes |
| Missing headers/body | Source logging and capture | Check mapping; absent source data is not fabricated |
| Field matched only | Declaration, masking or unsupported value profile | Read sensitive inspection reasons |
| Partial update after rule edit | Scope or unavailable saved evidence | Check All APIs; run a new scan when needed |
| Settings changed / Superseded | Input revision changed during work | Reload current settings and reapply edits |
| Code exists but no flow link | Dynamic targets, mapping, unsupported clients | Inspect Code evidence and Links may be missing |

## Check workers

Run in the SADE repository.

```bash
docker compose ps
docker compose logs --tail 100 worker worker-light
```

A healthy API does not establish worker liveness. Scheduled execution also requires a worker.

## Share a useful report

Include job ID, version, time range, reason code and synthetic input. Share redacted structures instead of tokens or original logs. See connection-specific errors for [Splunk](../connect/splunk.md) and [WebHDFS](../connect/cloudera.md).
