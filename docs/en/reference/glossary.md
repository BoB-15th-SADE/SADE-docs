# Glossary

| Term | Meaning |
|---|---|
| API / Endpoint | An operation identified by service, HTTP method and normalized path |
| Inventory | API list assembled from multiple evidence sources |
| Spec / Code / Log | Specification declarations / code analysis / log observations |
| Shadow | Observed API outside an available baseline specification |
| No traffic | No calls recorded in the collection window |
| Route map | Declared gateway-to-backend path mappings |
| Field mapping | Connect source-log paths to SADE time/method/body fields |
| Field matched | Type evidence from meaning, path or declaration |
| Value matched | Supported profile validation of an actual log value |
| Profile | A type's supported formats and validation scope |
| Source evidence | Collected input used for analysis; Splunk cache can contain originals |
| Scan | Collect logs and calculate inventory, sensitive data, checks and flows |
| Sync | Collect logs and inspect import state |
| privacy-refresh | Reclassify saved evidence without external reads |
| Scope | Rule application range or API access classification, depending on context |
| Exclusion | Expiring type/API/location/path detection exception |
| Revision | Configuration version used to prevent stale job writes |
| Superseded | An outdated job stopped from applying after inputs changed |
| Not evaluated | Insufficient assessment evidence; not Pass |
