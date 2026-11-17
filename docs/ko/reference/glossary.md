# 용어

| 용어 | 뜻 |
|---|---|
| API | 서비스, HTTP 메서드, 경로 틀로 구분하는 동작. 예: `order-service GET /orders/{id}` |
| 경로 틀 | 경로의 값 자리를 `{id}`처럼 바꾼 모양. `/orders/123`과 `/orders/456`은 같은 경로 틀입니다 |
| Inventory | 코드, 명세, 로그에서 찾은 API를 합친 목록 |
| 출처 (Code, Spec, Log) | API나 필드를 어디서 확인했는지: 코드 스캔, 등록한 명세, 수집한 로그 |
| Documented | 등록한 명세에 있는 API |
| Undocumented | 코드에는 있지만 명세에 없는 API |
| Shadow | 코드와 명세 어디에도 없고 로그에서만 보인 API |
| No Spec | 비교할 명세가 없는 서비스의 API |
| 관리 우선순위 (P1~P4) | 먼저 검토할 순서. 근거 신호(S, E, H, U, M, O, D)로 정합니다 |
| 잠정 (provisional) | 지금 근거로 정한 등급이지만, 모르는 신호가 확인되면 더 높아질 수 있는 상태 |
| 미평가 (unassessed) | 근거가 모자라 등급을 말할 수 없는 상태 |
| 접근 범위 (Access Scope) | 호출 주소로 나눈 Public, Partner, Internal |
| 게이트웨이 우회 | 게이트웨이를 거치지 않고 서비스로 직접 들어온 호출 |
| 인증 선언 (Declared Auth) | 코드와 명세에 적힌 인증 요구. 실제로 막히는지는 확인하지 않음 |
| 라우트 맵 (Route map) | 게이트웨이 설정에서 읽은, 바깥 경로를 서비스로 넘기는 규칙 |
| 민감 유형 (Data Type) | SADE가 찾는 민감정보 종류. 기본 19개 |
| 필드 매핑 | 회사 로그 필드를 SADE 필드(ECS 이름)에 맞추는 설정 |
| 매퍼 (Mapper) | 코드, 명세, 로그 결과를 합쳐 Inventory, Flows, 우선순위를 만드는 부분 |
| 분석 실행 (run) | 매퍼가 한 번 만든 결과. 화면은 마지막으로 끝난 실행을 보여 줍니다 |
| CODEOWNERS 후보 | 저장소의 CODEOWNERS 규칙으로 찾은 API 담당 후보 |
