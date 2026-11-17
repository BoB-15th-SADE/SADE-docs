# 문서 변경 내역

## 2026-11-17 (3)

- 왼쪽 메뉴를 네 묶음(시작하기, 연동, 사용 방법, 더 알아보기)으로 줄였습니다. 로그, 규칙과 설정, 동작 원리, 운영, 참고는 펼치고 접는 하위 메뉴로 바꿨습니다.
- 메뉴 이름을 짧게 바꿨습니다. 예: 관리 우선순위 (P1~P4) → 관리 우선순위
- 오른쪽에 페이지 목차를 넣었습니다.
- 긴 문단을 나누고, 표 앞의 이름 줄을 소제목으로 바꿨습니다. 문단, 표, 목록 사이 간격을 넓혔습니다.

## 2026-11-17 (2)

- 테마별로 단계를 나눠 내용을 늘렸습니다.
- 시작하기에 "샘플 로그로 첫 결과 보기"(가상 샘플 CSV 포함)와 "점검 흐름"(자료 연결부터 담당자 전달까지 7단계)을 넣었습니다.
- 로그 연동을 연결 방식, CSV 업로드, syslog 수신, Kafka 구독 네 페이지로 나눴습니다. 화면 단계(업로드 또는 Connect → 샘플 받기 → 필드 매핑 → 저장 결과 확인 → 반영)대로 적었습니다.
- 분석 다시 돌리기(Analyze again), 서비스 이름 규칙, 저장한 로그 지우기를 넣었습니다.
- 소스 코드, OpenAPI 명세 연동을 단계별로 다시 썼습니다. 화면에 없는 scan root 안내를 뺐습니다.
- "동작 원리" 섹션을 새로 만들었습니다. 처리 순서, API 식별, 로그 처리와 값 가리기, 코드 스캔, 민감정보 탐지, 노출 판정.
- Inventory, API 상세, Flows, 관리 우선순위, Access Scope에 사용 예와 계산 예시를 넣었습니다.
- Inventory의 Access Scope 값을 화면에 맞췄습니다(Public, Internal, —). Partner는 Observed Access Scope와 API 상세에서 봅니다.
- API 상세 Sensitive Data 탭 설명을 현재 화면(위치, 필드, 유형, 출처)에 맞췄습니다.
- CSV 시간대가 `SADE_LOG_TIMEZONE`을 따르는 점을 넣었습니다.

## 2026-11-17

- 화면 사진 17장을 넣었습니다. Overview, Inventory, API 상세(개요, 관리, 담당자), Flows, Log Sources(CSV, syslog, Kafka), Specifications, Source Code, Data Types, Access Scope, Settings, Assessments. 개발용 가짜 API로 띄운 화면이며 값은 모두 가상입니다.
- 한국어 화면에 나오는 이름(예: Spec 누락, 관리 탭)을 표에 함께 적었습니다.
- 기준을 SADE `feat/api-asset-prioritization` `f512bc0`로 올렸습니다. 새 구조(컨테이너 7개, PostgreSQL, ClickHouse, Vector)에 맞춰 문서를 다시 썼습니다.
- 관리 우선순위(P1~P4), Overview, 프레임워크 점검(준비 중) 페이지를 새로 넣었습니다.
- 연동을 소스 코드(GitHub), OpenAPI 명세(파일, 내부 주소), 로그(CSV, syslog, Kafka)로 정리했습니다.
- 설치 안내를 새 구조의 `.env`, `docker compose`, GHCR 이미지 실행에 맞췄습니다.
- 지금 버전에 없는 기능의 페이지를 내렸습니다: Splunk, Cloudera, 호출 기록과 Trace Details, Findings, 수집과 스캔, CLI, HTTP API, 방법론 페이지.
- 영어 페이지는 다음 단계에서 다시 씁니다. 지금은 한국어 페이지로 안내합니다.

## 2026-10-27

- 기준을 SADE `refactor/project-structure` `2373ca9`로 올렸습니다.
- 문서 전체를 문제 → 방법론 → 참조 구현 → 확장 흐름으로 다시 썼습니다. "핵심 기술" 섹션을 "방법론"으로 바꾸고 기업 환경에 맞게 확장하기를 추가했습니다.
- 방법론 페이지마다 구현 범위와 확장 절을 넣었습니다.
- 입력을 로그·명세·코드 세 가지로 정리하고 로그 파일 연결 페이지를 내렸습니다.
- DB 로그(PostgreSQL·pgAudit·애플리케이션 SQL)로 API와 DB·테이블을 잇는 방법, 민감정보 Data Flow, Trace Details 화면을 반영했습니다.
- 공통 ID가 없는 기록은 시간·경로만으로 잇지 않도록 바뀐 동작을 반영했습니다.
- 로그 필드 레퍼런스에 DB 로그 필드와 추정 연결용 필드를 추가했습니다.

## 2026-10-26 (2)

- 로그 필드 레퍼런스와 필드별 Flow 범위 시뮬레이터를 추가했습니다.
- 한국어 문장의 번역투 표현을 정리했습니다.

## 2026-10-26

- 기준을 SADE `refactor/project-structure` 브랜치 `4029826`로 올렸습니다.
- 연동 가이드를 새로 썼습니다. 연동 한눈에 보기, Splunk, Cloudera, 로그 파일과 OpenTelemetry, 명세, GitHub 코드 스캔. 브라우저에서 내 로그 한 줄을 붙여 넣어 필요한 필드가 있는지 확인하는 도구를 넣었습니다.
- 핵심 기술 섹션을 추가했습니다. 로그 정규화, SIEM 대량 수집, API 발견, 민감정보 탐지, code2spec, code2flow, 런타임 흐름, 명세 점검, 값을 남기지 않는 저장.
- 사용 방법 페이지마다 관련 기술 페이지로 가는 "궁금하신가요?" 링크를 달았습니다.
- 작업 설명을 현재 동작에 맞췄습니다. Collect now는 로그를 가져오고, Run scan은 저장된 결과만 다시 검사합니다.
- Flows 환경 지도(Clients → Gateways → Hosts → Destinations), 요청 흐름, `/api/collect`, `/api/request-flow`, `/api/flow-explorer`를 반영했습니다.
- 클라이언트 IP와 X-Forwarded-For를 원문으로 저장하는 점, traceparent 해석을 반영했습니다.
- 예전 Splunk 원문 캐시, 호출 200건 제한 같은 지난 설명을 지웠습니다.

## 2026-10-25

- SADE `feat/integration`, `dcab3bb` 기준으로 한국어·영어 사용 가이드를 정리했습니다.
- 데이터 유형·룰·예외·버전 복원과 자동 재분류를 추가했습니다.
- HTTP API·CLI·문제 해결·지원 범위를 추가했습니다.

이 페이지는 문서 개편 기록입니다. 제품 릴리스나 배포 완료를 뜻하지 않습니다. 어떤 코드를 보고 썼는지는 문서 기준을 보세요.
