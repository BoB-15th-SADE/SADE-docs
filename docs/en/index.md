# What is SADE

SADE is a **methodology and toolset** that analyzes **logs, OpenAPI specs and source code** together
to identify the APIs a company runs and to make response body fields and personal data flows visible.

## Why it is needed

- Companies do not know every API they run. Undocumented APIs and deprecated APIs that are still called remain.
- Even with a spec, the fields that actually travel in response bodies are not documented.
- It is not visible which APIs send personal data, or which services it passes through on the way out.

## How SADE approaches it

| Step | Method | Result |
|---|---|---|
| API identification | Combine logs, OpenAPI specs and source code per endpoint | API specs down to request and response body fields |
| Sensitive data | Built-in and custom rules | APIs and fields that handle personal data |
| Flow visibility | Call relations in code, trace IDs in logs | Service-to-service call paths |
| Policy | Write policies such as third-party transfer as rules | Transfers that differ from the policy |

## What it can and cannot tell

- It can tell
    - APIs and fields actually called during the collection window
    - Differences between the spec and actual calls
    - Fields that look like personal data, and where they appear
- It cannot tell
    - Anything the logs do not record (without bodies, body fields cannot be judged)
    - Calls outside the collection window
    - Results are indicators; the final judgment of a violation is made by a reviewer.

!!! note "Status"
    This documentation is a work in progress. Pages marked "Planned" will be filled in.
