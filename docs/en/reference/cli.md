# CLI commands

CLI and dashboard use the same queue and analysis code. Run commands from `apps/dashboard/backend` in the SADE repository.

## Core commands

| Command | Purpose |
|---|---|
| `python -m sade_cli collect` | Collect logs from enabled sources (`sync` does the same) |
| `python -m sade_cli collect --source-id SOURCE_ID` | Collect one source |
| `python -m sade_cli scan` | Recheck the latest collection; no outside reads |
| `python -m sade_cli scan --collection-id ID` | Check a specific collection batch |
| `python -m sade_cli privacy-refresh` | Reclassify saved evidence without external reads |
| `python -m sade_cli jobs` | List current jobs |
| `python -m sade_cli worker --lane heavy` | Collection, log and code-scan worker |
| `python -m sade_cli worker --lane light` | Sensitive-data reclassification worker |
| `python -m sade_cli migrate` | Initialize SQLite while preserving existing JSON files |
| `python -m sade_cli doctor` | Storage and collection diagnostics; read-only, prints no tokens |
| `python -m sade_cli backup --output FILE` | SQLite backup with an integrity check |

`--submit` on `collect`, `scan` and `privacy-refresh` queues the job and exits, requiring a running worker. Without it, the CLI executes the queued job through the shared worker code.

## Scan local code

```bash
python -m sade_cli code-scan /path/to/repository --id local-code --name "Local code" --create-services
```

Set `--scanner-python`, `--scanner-dir` and `--config` as needed. Map code labels with `--map LABEL=SERVICE`. The scan includes inventory and HTTP calls.

## Import existing results

```bash
python -m sade_cli code-import --file /path/to/inventory.json --id local-code --name "Local code" --create-services
python -m sade_cli route-import --file /path/to/route-map.json --id local-routes --name "Gateway routes"
python -m sade_cli flow-scan /path/to/repository --id local-code
```

`flow-scan` rereads service calls for a registered inventory. Replace `/path/to/...` with actual files/directories. Use each command's `--help` for complete options.
