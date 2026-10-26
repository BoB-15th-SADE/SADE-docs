# Documentation changes

## 2026-10-26

- Moved the baseline to SADE `refactor/project-structure`, commit `4029826`.
- Rewrote the **integration guide**: Integration overview, Splunk, Cloudera, log files and OpenTelemetry, specs, GitHub code scan. Added an in-browser checker that tells you whether one of your log lines has the fields SADE needs.
- Added a **Core technology** section: log normalization, large-scale SIEM collection, API discovery, sensitive data detection, code2spec, code2flow, runtime flow, spec check, value-free storage.
- Added "Curious?" links from each usage page to the related technology page.
- Matched job descriptions to current behavior: Collect now fetches logs; Run scan only rechecks stored results.
- Covered the Flows environment map (Clients → Gateways → Hosts → Destinations), request flow, `/api/collect`, `/api/request-flow` and `/api/flow-explorer`.
- Covered storing client IPs and X-Forwarded-For as is, and traceparent parsing.
- Removed outdated statements such as the raw Splunk cache and the 200-call limit.

## 2026-10-25

- Organized the Korean and English guides against SADE `feat/integration`, `dcab3bb`.
- Added data types, rules, exclusions, version restore and automatic reclassification.
- Added HTTP API, CLI, troubleshooting and scope pages.

This page records documentation changes. It does not mean a product release or deployment. For the review basis, see [Documentation baseline](baseline.md).
