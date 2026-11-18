# 문서 기준

이 가이드는 SADE 저장소의 `feat/api-asset-prioritization` 브랜치를 기준으로 작성했습니다. 영역마다 기준 커밋이 다릅니다.

| 영역 | 기준 커밋 |
|---|---|
| 연동 (소스 코드, OpenAPI 명세, 로그)과 샘플로 첫 결과 보기 | `50e7238` (2026-11-18). 화면과 버튼 이름, 단계, 사진 |
| 그 밖의 페이지 | `f512bc0` (2026-11-16) |

`f512bc0`에서 `50e7238` 사이에 로그 처리, 코드 스캔, 명세 처리의 서버 동작은 바뀌지 않았습니다. 화면 구성과 이름이 바뀌었고, 매핑은 한 저장소의 가장 최근 스캔 하나만 쓰게 바뀌었습니다.

## 확인한 코드

| 문서 영역 | 확인한 곳 |
|---|---|
| 메뉴, 화면 | `apps/frontend/src/layout/nav.ts`, `App.tsx`, `pages/` (Overview, Inventory, API 상세, Flows, Assessments, logs, management, policy) |
| 관리 우선순위 | `docs/contracts/api_priority.md`, `apps/backend/src/sade_backend/services/inventory_priority.py` |
| 코드 연동 | `apps/backend/src/sade_backend/code_sources.py`, `apps/code-worker/src/sade_code_worker/` |
| 명세 연동 | `code_sources.py`의 명세 등록, `services/spec_fetch.py` |
| 로그 연동 | `apps/backend/src/sade_backend/api/logs.py`, `services/log_mapping.py`, `services/stream_source.py`, `deploy/vector/` |
| 민감정보 | `libs/sade-common/src/sade_common/sensitive/builtin.json` |
| 설치 | `compose.yaml`, `compose.images.yaml`, `.env.example`, 저장소 README |

설명 문서와 실행 코드가 다르면 코드의 메뉴, 한도, 동작을 따랐습니다. 예를 들어 저장소 README는 코드 스캔과 매퍼 자동 실행을 "진행 중"으로 적고 있지만, 이 커밋에서는 동작하므로 동작하는 것으로 적었습니다.

## 유지보수 기준

- 기능이 바뀌면 같은 경로의 한국어, 영어 파일을 함께 고칩니다. `tools/verify_docs.py`가 두 언어의 파일 목록과 링크를 확인합니다.
- 지금 영어 페이지는 한국어 페이지 안내만 담고 있습니다. 영어 본문은 다음 단계에서 씁니다.
- 공개 사이트이므로 실제 기업 이름, 내부 주소, 토큰, 실제 로그를 넣지 않습니다. 예시는 가상 값만 씁니다.
