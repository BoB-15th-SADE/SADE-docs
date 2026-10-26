# Value-free storage

A tool that finds personal data should not pile up more of it; that would be a new leak path of its own. SADE **uses log values only in memory** to make decisions and stores evidence with the values removed. It is still designed so you can reanalyze after a rule change and find your way back to the original log line.

## When values are removed

<div class="sade-pipe" markdown>
<div markdown>**Read**<p>Raw logs from a SIEM or file</p></div>
<div class="is-key" markdown>**Decide in memory**<p>Value checks, auth method, field types</p></div>
<div markdown>**Seal**<p>Replace values with types and hashes</p></div>
<div markdown>**Store**<p>Collection batch (SQLite)</p></div>
</div>

Decisions that need a value (checking resident registration number structure, recognizing a JWT, deciding a field type) finish in memory during collection. Only the result is kept as evidence; the raw value is dropped before storage.

## What is kept, and how

| Original | What is stored | Example |
|---|---|---|
| Body values | Field path and type | `"email": "user@example.com"` → `"email": <string>` |
| Header values | Type. Safe headers such as Content-Type stay as is | `authorization: Bearer eyJ...` → `<string>`, with the auth method `JWT` recorded separately |
| Empty values | Kept empty | `authorization: ""` → `(empty)`. Nothing to hide, and it shows the call was sent without auth |
| Query values | Name kept, value replaced by type | `?email=a@b.com` → `?email=<string>` |
| IDs in paths | Path template | `/customers/a@b.com` → `/customers/{email}` |
| Request, trace and span IDs | Hash | Still usable for joining records of one request |
| Original location | Hash plus Splunk `_cd`, index and time, or HDFS file and offset | You can find the raw log again |
| Client IP, X-Forwarded-For | **As is** (port dropped) | Security teams need to trace callers |
| Sensitive data results | Type, location, grade, rule applied, inspection state | No values |
| Database spans | System, database name, operation | Query text, parameters and results are dropped |

Responses that use data as object keys (`{"user@example.com": {...}}`) have those keys treated like values and replaced with `[REDACTED_KEY]`.

## Why reanalysis still works

| Redo | Needs | Possible from stored evidence? |
|---|---|---|
| Reclassify after changing aliases or context rules | Field paths, sibling field names | Yes |
| Recheck after changing the spec | Field paths and types, auth method | Yes |
| Rejoin the path of one request | Hashed IDs, span links | Yes |
| Apply a new value rule (for example a new regex) | The original value | **Collect again** |

After a rule change, a light job recomputes from stored evidence without contacting the SIEM. If a new value check is needed, earlier results are kept as "stale candidates", and no new Value matched appears until you collect again.

## Tokens and secrets

- Splunk, WebHDFS and GitHub tokens are stored apart from settings. They never appear on screen, in exports, job records, error messages or command lines.
- If the address, transport or auth method changes after a token was saved, that token is not reused.
- The database file is not an encrypted secret store. Control access to the data folder.

## Older data

Raw caches left by versions before this design (`source_evidence`) are not deleted automatically. `sade_cli doctor` reports how many remain, so whoever owns the data can handle them under their retention policy. Start a new PoC with a fresh data folder.

## Limits

- Since values are not kept, you cannot see real values on screen. When you need one, go to the original location in your SIEM.
- Whether a source is pre-masking (WIRE) or already masked (LOG_REDACTED) is accurate only when the operator sets it on the source. The default is UNKNOWN.
