# 문서 기준

이 가이드는 SADE 저장소의 `feat/api-asset-prioritization` 브랜치를 기준으로 작성했습니다. 영역마다 기준 커밋이 다릅니다.

| 영역 | 기준 커밋 |
|---|---|
| 대시보드 (Overview, Inventory, API 상세, Flows, Data Types, Access Scope, 서비스 이름, 점검과 SADE AI) | `df6e0cc` (2026-11-25). 화면, 사진, 점검 판정 규칙, AI 채팅 동작 |
| 설치 (설치 스크립트, 포트, 오프라인 묶음), 보안 검토 자료, 구성 | `df6e0cc` (2026-11-25) |
| 연동 (소스 코드, OpenAPI 명세, 로그)과 샘플로 첫 결과 보기 | `50e7238` (2026-11-18). 단계별 워크스루 사진. 연동 화면은 `df6e0cc`까지 바뀌지 않았습니다 |
| 그 밖의 페이지 | `f512bc0` (2026-11-16) |

`f512bc0`에서 `50e7238` 사이에 로그 처리, 코드 스캔, 명세 처리의 서버 동작은 바뀌지 않았습니다. 화면 구성과 이름이 바뀌었고, 매핑은 한 저장소의 가장 최근 스캔 하나만 쓰게 바뀌었습니다. SADE AI 점검, 민감정보 규칙 편집, 담당자 변경이 더해졌습니다.

`50e7238`에서 `df6e0cc` 사이에는 아래가 바뀌었습니다.

- 점검: AI 점검 의견과 조치 안내가 없어지고, 프레임워크 점검 103개를 규칙으로 판정하는 화면이 들어왔습니다. API 상세의 점검 결과 탭도 없어졌습니다.
- SADE AI: 채팅 하나로 합쳐졌습니다. 모든 화면 오른쪽에 붙고, 모델을 고르고, 대화를 저장합니다.
- Flows: API별 흐름 탭과 API 하나의 영향 범위가 더해졌습니다.
- Inventory: 주요 필터가 늘 표시됩니다.
- 설치: 설치 스크립트(`sade.sh`, `sade.cmd`), 시작 전 확인, 오프라인 묶음이 더해졌고 대시보드 기본 포트가 8443으로 바뀌었습니다.
- 코드 스캔: Spring Boot DTO 필드와 설정 해석이 보강됐습니다. 이 문서의 코드 스캔 설명은 아직 `f512bc0` 기준입니다.

## 확인한 코드

| 문서 영역 | 확인한 곳 |
|---|---|
| 메뉴, 화면 | `apps/frontend/src/layout/nav.ts`, `App.tsx`, `pages/` (Overview, Inventory, API 상세, Flows, assessments, logs, management, policy) |
| 점검 | `docs/contracts/api.md`의 `/framework-checks`, `apps/backend/src/sade_backend/services/framework_checks.py`, `data/framework_checks.json` |
| SADE AI 채팅 | `docs/contracts/ai_assessments.md`, `services/ai_chat.py`, `services/ai_models.py` |
| API 영향 범위 | `docs/contracts/api.md`의 `/apis/{api_ref}/impact`, `services/impact.py` |
| 관리 우선순위 | `docs/contracts/api_priority.md`, `apps/backend/src/sade_backend/services/inventory_priority.py` |
| 코드 연동 | `apps/backend/src/sade_backend/code_sources.py`, `apps/code-worker/src/sade_code_worker/` |
| 명세 연동 | `code_sources.py`의 명세 등록, `services/spec_fetch.py` |
| 로그 연동 | `apps/backend/src/sade_backend/api/logs.py`, `services/log_mapping.py`, `services/stream_source.py`, `deploy/vector/` |
| 민감정보 | `libs/sade-common/src/sade_common/sensitive/builtin.json` |
| 설치 | `sade.sh`, `sade.ps1`, `sade.cmd`, `compose.yaml`, `compose.images.yaml`, `compose.bundle.yaml`, `.env.example`, 저장소 README |

설명 문서와 실행 코드가 다르면 코드의 메뉴, 한도, 동작을 따랐습니다. 예를 들어 저장소 README는 코드 스캔과 매퍼 자동 실행을 "진행 중"으로 적고 있지만, 이 커밋에서는 동작하므로 동작하는 것으로 적었습니다.

## 유지보수 기준

- 기능이 바뀌면 같은 경로의 한국어, 영어 파일을 함께 고칩니다. `tools/verify_docs.py`가 두 언어의 파일 목록과 링크를 확인합니다.
- 지금 영어 페이지는 한국어 페이지 안내만 담고 있습니다. 영어 본문은 다음 단계에서 씁니다.
- 공개 사이트이므로 실제 기업 이름, 내부 주소, 토큰, 실제 로그를 넣지 않습니다. 예시는 가상 값만 씁니다.
