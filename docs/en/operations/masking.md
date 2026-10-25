# Masking and storage

Analysis results and remote-log evidence caches are **separate storage paths**. Masked screen values do not imply that the entire database contains no original values.

## Storage scope

| Data | Current behavior |
|---|---|
| Result body/header values | Scalar originals redacted; structure, types and evidence retained |
| Call history | Up to 200 recent calls; query values, original request IDs and client IPs removed |
| API samples | Up to three limited structural/redacted samples per API |
| Sensitive observations/inspections | Locations, types, states, rule versions and references; no original values |
| Splunk incremental evidence | Recent data up to 10 MB per source in `source_evidence`; **may contain originals** |
| WebHDFS originals | Processed in worker memory; missing evidence may require recollection |
| Connection tokens | Separate server-side secret storage, excluded from screen models and Export |
| Specifications, code, settings, history | Retained as necessary for analysis and comparison |

## Displayed values and states

`<string>` and `<number>` represent redacted types, not original call values. A specification Example can be a declared example. NULL / EMPTY / MASKED / REDACTED / UNKNOWN remain separate from PRESENT.

A masked field with clear semantics can still be a type candidate, but it cannot newly establish that the original value passed format validation.

## Reclassification and history

Rule changes reclassify saved evidence without retroactively deleting historical scans or old originals in databases/backups. The bounded Splunk cache is not a complete historical log archive.

Disconnect removes registration and connection state. It is not a mechanism for erasing every original log/specification file or historical scan.

## Operational decisions

Automatic age-based retention and expiry deletion are not currently provided. Set access and retention for databases, backups, input logs and tokens separately, and validate with synthetic data first.
