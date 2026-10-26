# Masking and data retention

SADE does not store raw values from collected logs. This page lists what is kept, where and for how long. The reasoning behind the design is in [Value-free storage](../technology/value-free-storage.md).

## What is stored

| Data | How it is stored |
|---|---|
| Collection batches | Body and header values as types (`<string>` and so on), request and trace IDs as hashes, path IDs as templates. The latest 20 batches are kept; a batch in use by a running scan is never deleted |
| Large Splunk sources | Call rollups per API plus 5 sample requests per API and status (no values) |
| Call history | The latest 1,000 calls (no values) |
| Client IP, X-Forwarded-For | As is (port dropped) |
| Sensitive data observations | Location, type, evidence grade, inspection state, rule version. No raw values |
| Cloudera checkpoints | Last read position per file |
| Connection tokens | A separate secrets area in the database. Never on screen, in exports or job input |
| Specs, code inventories, settings, job history | As much as comparison and reanalysis need |

## Values on screen

| Shown | Meaning |
|---|---|
| `<string>`, `<integer>`, `<number>`, `<boolean>` | The type of the original value. The value is not stored |
| `<JWT>`, `<Bearer>` | The scheme read from an auth header |
| `(empty)` | An empty value was recorded (for example, sent without auth) |
| `(not recorded)` | The log did not record that value (`-`) |
| `[REDACTED_KEY]` | A key masked in a response that uses data as keys |

A spec's Example may be the example written in the spec. Do not read it as a real call value.

## Upgrading from an older version

Older versions stored raw Splunk events in a `source_evidence` cache, up to 10 MB per source. That cache is not deleted automatically. Check how many entries remain with the command below and handle them under your retention policy.

```bash
docker compose exec api python -m sade_cli doctor
```

Start a new PoC with a fresh data folder.

## Backups

```bash
docker compose exec api python -m sade_cli backup --output /workspace/apps/dashboard/data/poc-backup.db
```

This makes a consistent copy with the SQLite backup API and checks its integrity. It never overwrites an existing file. Backups contain connection tokens, so protect them like the production database.

## Decide before operating

- There is no automatic retention period or expiry yet. Set retention for the database, backups and input logs yourself.
- The database file is not an encrypted secret store. Control access to the data folder.
- Client IPs are kept as is. If customer policy requires masking them, agree on it beforehand.
