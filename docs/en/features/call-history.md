# Call history

**APIs → Call History** searches retained recent requests and responses. It is not a live search across the complete source log store.

## Quick access

1. Confirm that Run scan completed.
2. Search by path or method, or filter by response status group.
3. Select a call to inspect capture states, structure and specification differences.
4. Open the associated API details when needed.

| Item | Meaning |
|---|---|
| Time, method, path, status | Recorded call metadata |
| Headers and bodies | Structure/redacted display if captured; otherwise unavailable |
| Specification differences | Differences established for this call |
| Source | Log connection or evidence reference |

## Retained scope

The dashboard retains **up to 200 recent calls** for this list. Pagination reads those saved records rather than searching all original logs. Aggregate call counts can exceed the number of listed records.

New analysis results redact body/header scalar values and remove query values, original request IDs and client IPs from call records. Flow caller summaries are separate derived results; this does not mean all original log values have been erased. See [storage scope](../operations/masking.md).

A missing body is not an empty body. For missing recent calls, check the collection window, field mapping and last scan.
