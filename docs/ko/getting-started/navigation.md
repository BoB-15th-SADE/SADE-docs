# 화면 둘러보기

메뉴와 화면 제목은 영어, 설명은 한국어로 표시합니다. 화면의 English, 한국어 버튼으로 언어를 바꿉니다.

| 메뉴 | 화면 | 기능 |
|---|---|---|
| Overview | [Overview](../features/overview.md) | 우선순위 분포, 우선순위 상위 API 5개, 자산 수, 관측한 접근 범위, 민감 유형 |
| Connect | [Log Sources](../connect/logs.md) | [CSV 업로드](../connect/logs-csv.md), [syslog 수신](../connect/logs-syslog.md), [Kafka 구독](../connect/logs-kafka.md), 분석 다시 돌리기, 서비스 이름 규칙 |
| | [Specifications](../connect/specs.md) | OpenAPI 명세 등록, 코드에서 만든 명세 |
| | [Source Code](../connect/code.md) | GitHub 저장소 스캔, 코드 인벤토리, 라우트 맵 |
| APIs | [Inventory](../features/inventory.md) | 전체 API 목록과 필터 |
| | [Flows](../features/flows.md) | 서비스, API, DB, 외부 목적지 연결 그래프 |
| Rules | [Data Types](../policy/data-types.md) | 민감정보 유형 19개와 탐지 규칙 |
| | [Access Scope](../policy/access-scope.md) | 내부, 파트너 주소 대역 |
| Assessments | [프레임워크 점검](../features/assessments.md) | 프레임워크 기반 점검 (준비 중) |
| Settings (메뉴 아래쪽) | [Settings](../policy/access-scope.md#settings) | 같은 서비스의 다른 이름 합치기 |

Inventory에서 API를 누르면 [API 상세](../features/api-details.md)가 열립니다.

## 공통 표시

- 화면 사진은 개발용 가짜 API로 띄운 화면입니다. 서비스, 주소, 숫자는 모두 가상 값입니다.

- 출처 배지 `Code`, `Spec`, `Log`: API나 필드를 확인한 입력입니다.
- 분석 실행(run): 화면의 숫자는 마지막으로 끝난 분석 결과입니다. 로그를 새로 넣거나 설정을 바꾸면 다시 분석하라는 안내가 나옵니다. 분석이 끝난 뒤 Inventory와 Flows가 바뀝니다.
- 모름, 미평가: 근거가 없는 항목에 붙습니다.
