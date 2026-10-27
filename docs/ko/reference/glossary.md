# 용어

| 용어 | 의미 |
|---|---|
| API / Endpoint | 서비스, HTTP 메서드, 정규화한 경로로 구분하는 동작 |
| Inventory | 여러 출처에서 찾은 API 목록 |
| Spec / Code / Log | API를 어디서 확인했는지: 명세 / 코드 / 로그 |
| Shadow | 명세에 없는데 로그나 코드에서 보인 API |
| No traffic | 수집 기간에 호출이 기록되지 않음 |
| Route map | 게이트웨이 공개 경로와 백엔드 경로를 잇는 선언 |
| Field mapping | 로그 필드 경로를 SADE의 시각·메서드·본문 등에 연결하는 설정 |
| Collect (Collect now) | SIEM·파일에서 로그를 가져와 값을 지운 수집 배치로 저장하는 작업. 예전 이름은 Sync |
| Scan (Run scan) | 저장된 수집 배치로 명세 점검을 다시 하는 작업. 외부 조회 없음 |
| privacy-refresh | 외부 조회 없이 저장된 결과로 민감정보를 다시 분류하는 작업 |
| 수집 배치 (Collection) | 한 번의 Collect 결과. 원문 값 없이 저장 |
| 체크포인트 | 소스별로 어디까지 읽었는지 기록. 다음 수집은 그 이후부터 읽음 |
| 시간 창 (Window) | Splunk를 나눠 읽는 단위. 기본 60분, 많으면 60초까지 쪼갬 |
| 집계 (Rollup) | 대용량 소스에서 API별 호출 수·상태 합계만 남기는 방식 |
| 대표 요청 (Sample) | 집계와 함께 남기는 API·상태별 요청 몇 건 |
| traceparent | W3C Trace Context 헤더. 서비스 사이 같은 요청을 잇는 데 사용 |
| X-Forwarded-For (XFF) | 프록시를 거치기 전 원래 클라이언트 주소 |
| Field matched | 필드 이름·경로·명세 선언으로 유형을 판단함 |
| Value matched | 실제 로그 값이 그 유형의 형식 검사를 통과함 |
| Profile | 유형별 지원 형식과 검증 범위 |
| Spec check | 호출 하나를 명세와 비교한 결과 (Not in spec, Missing, Type differs, No credentials) |
| Scope | 룰 적용 범위 또는 API 접근 범위. 화면 문맥에 따라 구분 |
| Exclusion | 유형·API·위치·경로에 거는 만료일 있는 탐지 예외 |
| Revision | 설정의 변경 버전. 오래된 작업이 새 설정을 덮어쓰지 않게 함 |
| Superseded | 실행 중 입력이 바뀌어 결과를 적용하지 않은 작업 |
| Partial | 일부 소스나 구간만 처리된 작업 |
| Not evaluated | 비교할 자료가 없음. Pass와 다름 |
| Trace Details | 요청 하나의 기록 지점을 타임라인으로 보여 주는 화면 |
| Data Flow | Flows 그래프에 실제 로그에서 확인한 민감정보 유형을 요청·응답 방향별로 표시하는 기능 |
| SQL operation ID | 애플리케이션 SQL 로그와 DB 로그의 같은 실행을 잇는 ID |
| Inferred | 공통 ID 없이 인스턴스·스레드·요청 처리 구간으로 추정한 연결. 점선으로 표시 |
| 참조 구현 | 방법론을 대표 환경(Splunk, Spring Boot 등)에서 동작하도록 만든 구현 |
