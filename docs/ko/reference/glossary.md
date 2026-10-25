# 용어

| 용어 | 의미 |
|---|---|
| API / Endpoint | 서비스·HTTP 메서드·정규화한 경로로 구분하는 동작 |
| Inventory | 여러 출처에서 찾은 API 목록 |
| Spec / Code / Log | 명세 선언 / 코드 분석 / 로그 관측의 근거 출처 |
| Shadow | 기준 명세에 없는 관측 API |
| No traffic | 수집 구간에 호출이 기록되지 않음 |
| Route map | 게이트웨이 공개 경로와 백엔드 경로의 선언 연결 |
| Field mapping | 로그 필드 경로를 SADE의 시각·메서드·본문 등으로 연결하는 설정 |
| Field matched | 필드 의미·경로·선언에 의한 유형 근거 |
| Value matched | 실제 로그 값에 대한 지원 프로파일 검증 근거 |
| Profile | 유형별 지원 형식·검증 범위 |
| Source evidence | 분석에 쓰는 수집 증거. Splunk 캐시는 원문 포함 가능 |
| Scan | 수집 후 인벤토리·민감정보·점검·흐름 계산 |
| Sync | 수집과 상태 확인 |
| privacy-refresh | 외부 조회 없이 저장 근거의 민감정보 재분류 |
| Scope | 룰 적용 범위 또는 API 접근 범위 분류. 화면 문맥에 따라 구분 |
| Exclusion | 유형·API·위치·경로에 적용하는 만료일 있는 탐지 예외 |
| Revision | 설정 문서의 변경 버전. 오래된 작업의 덮어쓰기 방지에 사용 |
| Superseded | 입력 변경으로 결과 적용을 중단한 오래된 작업 |
| Not evaluated | 비교·평가 근거 부족. Pass와 다름 |
