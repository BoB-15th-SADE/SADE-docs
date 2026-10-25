# FAQ

## Are both specifications and logs required?

No. Specifications/code populate declared APIs and sensitive-field candidates; logs alone can also build an inventory. Actual value observations and contract assessment each need their respective evidence.

## Must I Sync before Scan?

No. Run scan includes log collection. Sync separately checks collection or imports a particular source. See [job types](../operations/scans.md).

## Do rule changes apply globally?

Shared All APIs rules apply to every matching API. API/location-scoped rules affect that scope only. Saving queues reclassification without rewriting historical scans.

## How do I correct false positives?

Edit aliases, paths and value conditions or disable rules in Data Types. Delete custom rules, or add scoped exclusions with a reason and expiry. This guide does not assume arbitrary editing of individual result rows.

## Does sensitive data establish a violation?

No. It classifies information and evidence. Field matched, Value matched, access scope, actual transmission and policy violation are separate judgments.

## Does a missing check mean safe?

It can mean missing capture, unsupported inspection or insufficient evidence. Read states and reasons. Code/spec declarations are not runtime value validation.

## Are original personal values never stored?

Analysis results redact values, but the Splunk evidence cache may contain originals. Historical databases and backups are not retroactively scrubbed. See [storage scope](../operations/masking.md).

## Are Slack alerts, SSO and organization permissions supported?

Those features are not implemented in the current project. This guide documents current behavior.
