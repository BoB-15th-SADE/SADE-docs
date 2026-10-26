# Documentation baseline

This guide was written on **2026-10-26** against commit [`4029826`](https://github.com/BoB-15th-SADE/SADE/commit/4029826) on the `refactor/project-structure` branch of the SADE repository. It does not assume main behaves the same.

## Code reviewed

| Area | Code checked (`apps/dashboard/`) |
|---|---|
| Menus and screens | `web/app.js`, `api-detail.js`, `call-history.js`, `flow-ui.js`, `flow-explorer.js`, `request-flow.js`, `privacy-ui.js`, `data-types.js`, `connector-ui.js`, `code-ui.js` |
| Connections and collection | `backend/remote_sources.py`, `splunk_collect.py`, `connectors.py`, `field_detect.py`, `log_rollup.py`, `collection_store.py` |
| Analysis | `backend/analysis.py`, `engine.py`, `specs.py`, `evidence.py`, `code_evidence.py` |
| Flows | `backend/flows.py`, `flow_environment.py`, `flow_explorer.py`, `flow_sources.py`, `request_flows.py` |
| Sensitive data | `backend/privacy.py`, `privacy_config.py`, `privacy_profiles.py` |
| HTTP API and jobs | `backend/api_server.py`, `scanner_core.py`, `storage.py`, `operations.py` |
| CLI and code scan | `backend/sade_cli.py`, `code_scan.py`, `github.py`, `packages/sade-codescan` |
| Deployment | `compose.yaml`, `compose.dev.yaml`, `compose.poc.yaml`, `apps/dashboard/Dockerfile` |
| Background docs | Repository README, `docs/PRIVACY_DETECTION.md`, `FLOWS.md`, `GITHUB_CODE_SCAN.md`, `REMOTE_CONNECTIONS.md`, `CODE_EVIDENCE.md`, `POC.md` |

Where written docs and running code disagreed, the code's menus, limits and job behavior won. For example, the repository README lists three default policies, but this commit has no policy module, so Findings is described as empty.

## Maintenance

When a feature changes, update the Korean and English files at the same path together. `tools/verify_docs.py` checks that both languages have the same files and that links resolve. When default type counts, HTTP routes, menus, limits or retention change, update the usage pages and [Scope and limits](limitations.md) as well.
