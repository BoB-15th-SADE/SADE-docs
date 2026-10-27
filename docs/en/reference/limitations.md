# Scope and limits

This is what the current implementation covers. Features that exist only on the roadmap are not listed as supported.

## Data and connections

| Item | Current scope |
|---|---|
| Remote logs | JSON HTTP events from the Splunk Search REST API and Cloudera WebHDFS |
| Database logs | PostgreSQL JSON and pgAudit, application SQL JSON (chosen as the Log Format on Splunk and WebHDFS) |
| Specs | OpenAPI 3.0 / 3.1 JSON, uploads up to 10 MB |
| Splunk collection | Full collection in time windows. Up to 500,000 events per window and 5,000 windows per run |
| WebHDFS collection | Up to 256 MB and 100,000 files and folders per run. The rest is read by the next run |
| Remote HTTP timeout | 90 seconds per request |
| Not supported | Direct Elasticsearch and Amazon S3 connections (can be added with the same collection approach) |
| GitHub | Up to 50 repositories per job, up to 2,000 listed |

## Analysis limits

- Bodies and headers that were never logged, and calls outside the collection window, cannot be judged.
- No free-text NER for names or addresses, and no XML, binary or decompression analysis.
- Account, driver's license, CI and DI values are not validated against issuer formats; field meaning is used instead.
- Value format checks are not the same as verifying issuance, ownership, successful authentication or JWT signatures.
- HTTP REST only. gRPC and message queues are not analyzed.
- HTTP targets decided at runtime and unsupported code libraries can be missing from flows. Database access is read from Spring Data in code and from PostgreSQL and application SQL logs.
- Records without a shared ID (trace, hop ID, request ID, SQL operation ID) are not linked even if time and path are close. Only application SQL is linked by inference (Inferred) when instance, thread and request interval all match.
- The spec check is not a full security assessment, authorization test or compliance check.
- Company policy rules (Findings) do not exist yet.

## Inspection and retention limits

| Item | Limit |
|---|---|
| Sensitive data inspection | 1 MiB body, depth 32, 10,000 array items, 16,384-character strings, 30,000 fields per location |
| Detection sample test | 32 KiB |
| Collection batches | Latest 20 kept |
| Call History | Latest 1,000 calls overall |
| Trace Details | 1,000 records per request |
| Large Splunk samples | 5 per service, method, path shape and status |

Going over a limit or hitting an unsupported format records a partial or unavailable inspection with a reason.

There is no built-in SSO, server user authentication, organization RBAC, Slack alerting or automatic retention setting. SADE does not automatically decide whether sharing sensitive data with third parties is permitted, or its legal classification.
