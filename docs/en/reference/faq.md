# FAQ

## Are both specifications and logs required?

No. Specifications/code populate declared APIs and sensitive-field candidates; logs alone can also build an inventory. Actual value observations and contract assessment each need their respective evidence.

## How do Collect now and Run scan differ?

**Collect now** fetches logs from the SIEM or files. **Run scan** only rechecks the spec against what was already collected. Start with Collect now; after changing a spec, Run scan is enough. See [Collection and scans](../operations/scans.md).

## Once connected, does it keep collecting?

Turn on the source's **Schedule** and the worker collects on that interval, reading only what came after the last checkpoint. With Schedule off, it collects only when you click Collect now.

## Does it read a large Splunk in full?

Yes, window by window. Call counts and status totals cover everything; the requests you can open on screen are a few samples per API and status. See [Large-scale SIEM collection](../technology/siem-collection.md).

## Do rule changes apply globally?

Shared All APIs rules apply to every matching API. API/location-scoped rules affect that scope only. Saving queues reclassification without rewriting historical scans.

## How do I correct false positives?

Edit aliases, paths and value conditions or disable rules in Data Types. Delete custom rules, or add scoped exclusions with a reason and expiry. This guide does not assume arbitrary editing of individual result rows.

## Does sensitive data establish a violation?

No. It classifies information and evidence. Field matched, Value matched, access scope, actual transmission and policy violation are separate judgments.

## Does a missing check mean safe?

It can mean missing capture, unsupported inspection or insufficient evidence. Read states and reasons. Code/spec declarations are not runtime value validation.

## Are original personal values never stored?

Body and header values are not stored; only types and locations are. The exception is client IP and X-Forwarded-For, kept as is for security analysis. Raw Splunk caches from older versions are not deleted automatically; see [Masking and data retention](../operations/masking.md).

## Findings is empty.

That is expected. Company policy rules are the next step, so nothing shows in Findings yet. Spec check results are in the Shadow tab of Inventory and the Spec check column of Call History.

## Are Slack alerts, SSO and organization permissions supported?

Those features are not implemented in the current project. This guide documents current behavior.
