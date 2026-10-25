# 문서 기준

이 가이드는 **2026-10-25**, 현재 프로젝트의 `feat/integration` 브랜치와 커밋 [`dcab3bb688a2c26c95ee10d6fa2d7a2ad79e8076`](https://github.com/BoB-15th-SADE/SADE/tree/dcab3bb688a2c26c95ee10d6fa2d7a2ad79e8076)을 기준으로 작성했습니다. main의 기능과 동일하다고 가정하지 않습니다.

## 검토한 구현

| 문서 영역 | 확인한 코드·설정 |
|---|---|
| 메뉴·상세 화면 | `web/app.js`, `api-detail.js`, `privacy-ui.js`, `data-types.js`, `connector-ui.js`, `code-ui.js` |
| 연동과 수집 | `remote_sources.py`, `connectors.py`, `field_detect.py`, `scanner_core.py` |
| 탐지와 룰 | `privacy.py`, `privacy_rules.py`, `privacy_profiles.py` |
| HTTP API·작업 | `api_server.py`, `scanner_core.py`, `repository.py` |
| CLI·CodeScan | `sade_cli.py`, `codescan_runner.py`, `github_connect.py` |
| 배포와 worker | `compose.yaml`, `compose.dev.yaml`, `apps/sade-dashboard/Dockerfile` |
| 보충 설명 | 프로젝트 README 및 `docs/PRIVACY_DETECTION.md`, `FLOWS.md`, `GITHUB_CODE_SCAN.md` |

설명 문서와 실행 코드가 다르면 현재 코드의 메뉴·한도·작업 동작을 우선했습니다. 예를 들어 원격 HTTP 대기 시간은 현재 코드의 90초를 사용하고, 룰 저장 후에는 수동 Scan 지시 대신 자동 재분류를 설명합니다.

## 유지보수 기준

새 기능을 추가할 때 한국어·영어의 같은 파일 경로를 함께 갱신합니다. 기본 유형 수·HTTP 경로·메뉴·검증 범위·보관 방식을 변경하면 연결된 사용 절차와 제한 사항도 수정합니다.

MkDocs 화면은 [Material의 navigation sections](https://squidfunk.github.io/mkdocs-material/setup/setting-up-navigation/#navigation-sections)와 [템플릿 확장](https://squidfunk.github.io/mkdocs-material/customization/#overriding-blocks)을 사용합니다. Akto 참조 이미지에서는 목차와 읽기 흐름만 참고했으며 기능·문구·브랜드를 복제하지 않습니다.
