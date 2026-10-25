# 화면 둘러보기

대시보드의 메뉴는 **연결 → 분석 → 결과 확인 → 룰 조정** 순서로 구성됩니다. Settings에서 화면 언어를 바꿀 수 있으며 이 문서에서는 영문 메뉴도 함께 사용합니다.

| 메뉴 | 하는 일 | 가이드 |
|---|---|---|
| Connect → Log Sources | 로그 연결·매핑·수집 설정 | [로그 연결](../connect/logs.md) |
| Connect → Specifications | 서비스와 OpenAPI 등록 | [명세 연결](../connect/specs.md) |
| Connect → Source Code | GitHub·코드 인벤토리·route map 관리 | [소스코드](../connect/code.md) |
| Overview | 현재 분석 결과 요약 | [API 인벤토리](../features/inventory.md) |
| Scans | 로그 스캔 상태와 이력 확인 | [스캔과 작업](../operations/scans.md) |
| APIs → Inventory | 서비스별 API 목록과 상세 패널 | [API 상세](../features/api-details.md) |
| APIs → Call History | 저장된 호출 검색 | [호출 기록](../features/call-history.md) |
| APIs → Sensitive Data | 유형별 민감 필드 탐색 | [민감정보](../features/sensitive-data.md) |
| Flows | 서비스 호출 지도 | [서비스 흐름](../features/flows.md) |
| Policy → Rules → Data Types | 탐지 유형과 룰 관리 | [룰 관리](../policy/data-types.md) |
| Policy → Rules → Access Scope | 호스트·경로 기반 범위 분류 | [접근 범위](../policy/access-scope.md) |
| Policy → Findings | 명세 점검 결과 | [점검 결과](../features/findings.md) |

## 상태 표시 읽기

- **Spec / Code / Log**는 근거 출처입니다. 하나의 API에 여러 출처가 합쳐질 수 있습니다.
- **Scan required**는 현재 입력과 마지막 전체 분석 결과가 맞지 않아 새 스캔이 필요하다는 표시입니다.
- **Not evaluated / —**는 미평가 또는 근거 미기록입니다. 안전·부재·불일치 판정으로 읽지 않습니다.
- 작업을 저장한 직후에는 백그라운드 계산이 끝날 때까지 결과 갱신을 기다립니다.
