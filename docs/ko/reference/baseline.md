# 문서 기준

이 가이드는 **2026-10-27**, SADE 저장소의 `refactor/project-structure` 브랜치 커밋 [`2373ca9`](https://github.com/BoB-15th-SADE/SADE/commit/2373ca9)을 기준으로 작성했습니다. main과 같다고 가정하지 않습니다.

## 검토한 구현

| 문서 영역 | 확인한 코드 (`apps/dashboard/`) |
|---|---|
| 메뉴·화면 | `web/app.js`, `api-detail.js`, `call-history.js`, `flow-ui.js`, `flow-explorer.js`, `flow-layout.js`, `flow-data.js`, `request-flow.js`, `privacy-ui.js`, `data-types.js`, `connector-ui.js`, `code-ui.js` |
| 연동과 수집 | `backend/remote_sources.py`, `splunk_collect.py`, `connectors.py`, `field_detect.py`, `log_rollup.py`, `collection_store.py`, `sql_logs.py` |
| 분석 | `backend/analysis.py`, `engine.py`, `specs.py`, `evidence.py`, `code_evidence.py` |
| 흐름 | `backend/flows.py`, `flow_environment.py`, `flow_explorer.py`, `flow_sources.py`, `flow_data.py`, `log_links.py`, `request_flows.py` |
| 민감정보 | `backend/privacy.py`, `privacy_config.py`, `privacy_profiles.py` |
| HTTP API·작업 | `backend/api_server.py`, `scanner_core.py`, `storage.py`, `operations.py` |
| CLI·코드 스캔 | `backend/sade_cli.py`, `code_scan.py`, `github.py`, `packages/sade-codescan` |
| 배포 | `compose.yaml`, `compose.dev.yaml`, `compose.poc.yaml`, `apps/dashboard/Dockerfile` |
| 보충 설명 | 저장소 README, `docs/PRIVACY_DETECTION.md`, `FLOWS.md`, `GITHUB_CODE_SCAN.md`, `REMOTE_CONNECTIONS.md`, `CODE_EVIDENCE.md`, `POC.md` |

설명 문서와 실행 코드가 다르면 코드의 메뉴, 한도, 작업 동작을 따랐습니다. 예를 들어 저장소 README는 기본 정책 3개를 적고 있지만 이 커밋에는 정책 모듈이 없으므로, Findings는 비어 있다고 적었습니다.

## 유지보수 기준

기능을 바꾸면 한국어·영어의 같은 경로 파일을 함께 고칩니다. `tools/verify_docs.py`가 두 언어의 파일 목록과 링크를 확인합니다. 기본 유형 수, HTTP 경로, 메뉴, 한도, 보관 방식이 바뀌면 사용 방법과 [지원 범위와 제한](limitations.md)도 고칩니다.
