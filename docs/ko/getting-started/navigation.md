# 화면 둘러보기

왼쪽 메뉴는 **연결 → 현황 → API 살펴보기 → 규칙** 순서입니다. 화면은 영어 메뉴 이름을 쓰고, Settings에서 한국어로 바꿀 수 있습니다.

| 메뉴 | 하는 일 | 가이드 |
|---|---|---|
| **Connect › Log Sources** | Splunk, Cloudera, 로그 파일 연결과 수집 | [연동 한눈에 보기](../connect/logs.md) |
| **Connect › Specifications** | 서비스와 OpenAPI 명세 등록 | [OpenAPI 명세](../connect/specs.md) |
| **Connect › Source Code** | GitHub 스캔, 코드 인벤토리, route map | [GitHub 코드 스캔](../connect/code.md) |
| **Overview** | 전체 현황 요약 | |
| **Scans** | 수집·스캔 작업 이력과 상태 | [수집과 스캔](../operations/scans.md) |
| **APIs › Inventory** | 서비스별 API 목록과 상세 | [API 인벤토리](../features/inventory.md) |
| **APIs › Call History** | 최근 호출, Spec check, 요청 흐름 | [호출 기록과 요청 흐름](../features/call-history.md) |
| **APIs › Sensitive Data** | 민감정보 유형별 API | [민감정보](../features/sensitive-data.md) |
| **Flows** | 호출자 → 게이트웨이 → 서버 → DB 지도 | [서비스 흐름](../features/flows.md) |
| **Policy › Rules › Data Types** | 민감정보 유형과 규칙 | [데이터 유형과 룰](../policy/data-types.md) |
| **Policy › Rules › Access Scope** | 호스트·경로로 공개 범위 분류 | [접근 범위](../policy/access-scope.md) |
| **Policy › Findings** | 정책 위반 결과 | [점검 결과](../features/findings.md) |

메뉴 묶음(APIs, Policy, Rules)은 다시 누르면 접힙니다.

## 자주 보는 표시

| 표시 | 뜻 |
|---|---|
| `Spec` / `Code` / `Log` | 그 API나 필드를 확인한 근거. 여러 개가 함께 붙을 수 있음 |
| Shadow | 명세가 있는 서비스에서 명세에 없는 호출이 보임 |
| Not logged / Not scanned | 수집했지만 호출이 없음 / 아직 수집 전 |
| Not evaluated, `—` | 판단할 근거가 없음. "문제없음"이나 "없음"이 아님 |
| Partial | 일부만 수집·연결됨. 이유가 함께 표시됨 |
| Scan required | 입력이 바뀌어 다시 Run scan이 필요함 |

## 세 가지 버튼

| 버튼 | 하는 일 | 외부 접속 |
|---|---|---|
| **Collect now** | 로그를 가져와 인벤토리, 민감정보, Flows 갱신 | 함 |
| **Run scan** | 저장된 수집 결과로 명세 점검 | 안 함 |
| **Refresh** | 저장된 결과를 다시 불러옴 | 안 함 |
