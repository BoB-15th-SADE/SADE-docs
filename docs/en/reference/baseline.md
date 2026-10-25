# Documentation baseline

Reviewed **2026-10-25** against the current project's `feat/integration` branch at [`dcab3bb688a2c26c95ee10d6fa2d7a2ad79e8076`](https://github.com/BoB-15th-SADE/SADE/tree/dcab3bb688a2c26c95ee10d6fa2d7a2ad79e8076). This does not assume feature parity with main.

## Reviewed implementation

| Area | Sources |
|---|---|
| Navigation and details | `web/app.js`, `api-detail.js`, `privacy-ui.js`, `data-types.js`, `connector-ui.js`, `code-ui.js` |
| Connections/collection | `remote_sources.py`, `connectors.py`, `field_detect.py`, `scanner_core.py` |
| Detection/rules | `privacy.py`, `privacy_rules.py`, `privacy_profiles.py` |
| HTTP API/jobs | `api_server.py`, `scanner_core.py`, `repository.py` |
| CLI/CodeScan | `sade_cli.py`, `codescan_runner.py`, `github_connect.py` |
| Deployment/workers | `compose.yaml`, `compose.dev.yaml`, `apps/sade-dashboard/Dockerfile` |
| Supporting explanations | Project README and `docs/PRIVACY_DETECTION.md`, `FLOWS.md`, `GITHUB_CODE_SCAN.md` |

Where project prose differed from implementation, current code determined menus, bounds and behavior. For example, remote HTTP timeout is 90 seconds, and saving rules triggers automatic reclassification rather than requiring a manual Scan.

## Maintenance

Update matching Korean/English paths together. Changes to type counts, HTTP routes, menus, validation or retention must also update their usage steps and limits.

The layout uses Material's [navigation sections](https://squidfunk.github.io/mkdocs-material/setup/setting-up-navigation/#navigation-sections) and [template extension](https://squidfunk.github.io/mkdocs-material/customization/#overriding-blocks). The supplied Akto reference informed navigation and reading flow, not product features, copy or branding.
