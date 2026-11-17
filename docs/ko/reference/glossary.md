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
| 필드 매핑 | 기업 로그 필드를 SADE 필드(ECS 이름)에 맞추는 설정 |
| 매퍼 (Mapper) | 코드, 명세, 로그 결과를 합쳐 Inventory, Flows, 우선순위를 만드는 부분 |
| 분석 실행 (run) | 매퍼가 한 번 만든 결과. 화면은 마지막으로 끝난 실행을 보여 줍니다 |
| CODEOWNERS 후보 | 저장소의 CODEOWNERS 규칙으로 찾은 API 담당 후보 |
| Vector | SADE에 들어 있는 로그 수집기. 로그를 받아 필드를 맞추고 값을 가린 뒤 저장합니다 |
| ClickHouse | 값을 가린 로그를 저장하고 집계하는 데이터베이스. SADE 안에서만 씁니다 |
| PostgreSQL | 연결 설정과 분석 결과를 저장하는 데이터베이스. SADE 안에서만 씁니다 |
| ECS | Elastic Common Schema. 로그 필드 이름을 맞추는 공개 규칙. 예: url.path, client.ip |
| CIDR | IP 대역 표기. 10.0.0.0/8은 10.으로 시작하는 모든 주소 |
| X-Forwarded-For | 프록시나 게이트웨이가 원래 클라이언트 IP를 담아 넘기는 HTTP 헤더 |
| trace ID | 한 요청이 여러 서비스를 지날 때 모든 로그가 함께 쓰는 ID |
| context path | 서비스의 모든 경로 앞에 공통으로 붙는 경로. 예: /shop |
| BFF | Backend for Frontend. 화면에 필요한 여러 서비스 호출을 모아 주는 중간 서비스 |
| rsyslog | 리눅스 서버에서 syslog를 보내고 받는 기본 프로그램 |
| SIEM | 여러 시스템의 보안 로그를 모아 검색하고 분석하는 시스템 |
| 컨슈머 그룹 | Kafka에서 메시지를 어디까지 읽었는지 기록하는 읽기 단위 |
| ACL | 접근 제어 목록. Kafka에서 계정마다 읽을 수 있는 토픽과 그룹을 정합니다 |
| offset | Kafka 토픽에서 메시지의 순번. 어디까지 읽었는지 나타냅니다 |
| mTLS | 서버와 클라이언트가 서로 인증서로 확인하는 TLS 연결 |
| SASL | Kafka 같은 서비스에 계정과 비밀번호로 로그인하는 방식 |
| OpenAPI | REST API의 경로, 파라미터, 응답을 적는 표준 명세 형식 |

본문에서 이 용어가 처음 나오는 곳에는 점선 밑줄이 있습니다. 마우스를 올리면 뜻이 나옵니다.
