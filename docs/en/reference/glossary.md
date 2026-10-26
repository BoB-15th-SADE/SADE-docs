# Glossary

| Term | Meaning |
|---|---|
| API / Endpoint | An operation identified by service, HTTP method and normalized path |
| Inventory | The list of APIs found across sources |
| Spec / Code / Log | Spec declaration / code analysis / log observation: the evidence an API was found from |
| Shadow | An API seen in logs or code but missing from the spec |
| No traffic | No calls recorded during the collection window |
| Route map | Declared link between a gateway's public path and a backend path |
| Field mapping | Settings that link log field paths to SADE's time, method, body and so on |
| Collect (Collect now) | Fetch logs from a SIEM or files and store them as a collection batch with values removed. Formerly Sync |
| Scan (Run scan) | Recheck the spec against a stored collection batch. No outside reads |
| privacy-refresh | Reclassify sensitive data from stored evidence without outside reads |
| Collection batch | The result of one Collect, stored without raw values |
| Checkpoint | How far each source has been read. The next collection starts after it |
| Window | The unit Splunk is read in. 60 minutes by default, split down to 60 seconds when busy |
| Rollup | Keeping only call counts and status totals per API for large sources |
| Sample | The few requests per API and status kept alongside a rollup |
| traceparent | The W3C Trace Context header, used to link one request across services |
| X-Forwarded-For (XFF) | The original client address before proxies |
| Field matched | Type evidence from field name, path or declaration |
| Value matched | Evidence that a real log value passed a format check |
| Profile | The supported formats and checks for a type |
| Spec check | The result of comparing one call with the spec (Not in spec, Missing, Type differs, No credentials) |
| Scope | The scope a rule applies to, or an API's exposure classification, depending on the screen |
| Exclusion | A detection exception with an expiry, applied to a type, API, location or path |
| Revision | A version of the settings. Keeps stale jobs from overwriting newer settings |
| Superseded | A job whose result was not applied because inputs changed while it ran |
| Partial | A job that processed only some sources or windows |
| Not evaluated | No evidence to compare. Not the same as Pass |
