# Supported scope and limits

This describes implemented behavior, not planned support.

## Data and connections

| Area | Current scope |
|---|---|
| Remote logs | JSON HTTP events via Splunk Search REST API and Cloudera WebHDFS |
| Specifications | OpenAPI 3.0 / 3.1 JSON, maximum upload 10 MB |
| Remote reads | Up to 10 MB per source/read, HTTP timeout 90 seconds |
| Log connection UI | Splunk and Cloudera; no direct S3/Elasticsearch connection |
| Local parsers | Some HTTP/identity compatibility through CLI/existing registrations; no remote identity profile |
| Cloudera validation | Mock WebHDFS flows; real enterprise deployment validation remains separate |
| Large collections | Not complete paginated ingestion or long-term archival |
| GitHub | Up to 50 repositories per job, 2,000 listed repositories |

## Analysis boundaries

- Unrecorded bodies/headers and calls outside the window remain unknown.
- No free-text name/address NER or XML/binary/decompression analysis.
- Issuer-specific account/license/CI/DI value validation is unsupported; field semantics remain available.
- Supported syntax does not prove issuance, ownership, authentication or JWT signature validity.
- HTTP REST only; no gRPC or message-queue relationship analysis.
- Dynamic HTTP targets and unsupported clients can leave flow links missing.
- The two specification checks are not a complete security, authorization or compliance assessment.

## Inspection and retention bounds

Default sensitive-data bounds: 1 MiB body, depth 32, 10,000 array elements, 16,384-character strings and 30,000 fields per location. Exceeded limits, unsupported formats and parse errors record partial/unavailable reasons. Sample Test has a separate 32 KiB limit.

The dashboard retains up to 200 call records and three samples per API. Splunk's recent original-evidence cache holds up to 10 MB per source and is not a reproducible archive of every historical input.

There is no built-in SSO, server user authentication, organization RBAC, Slack alerting or age-based retention setting. SADE does not automatically establish lawful third-party disclosure or legal classification.
