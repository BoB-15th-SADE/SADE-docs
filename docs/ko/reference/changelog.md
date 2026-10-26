# 문서 변경 내역

## 2026-10-26

- 기준을 SADE `refactor/project-structure` 브랜치 `4029826`로 올렸습니다.
- **연동 가이드**를 새로 썼습니다. 연동 한눈에 보기, Splunk, Cloudera, 로그 파일과 OpenTelemetry, 명세, GitHub 코드 스캔. 브라우저에서 내 로그 한 줄을 붙여 넣어 필요한 필드가 있는지 확인하는 도구를 넣었습니다.
- **핵심 기술** 섹션을 추가했습니다. 로그 정규화, SIEM 대량 수집, API 발견, 민감정보 탐지, code2spec, code2flow, 런타임 흐름, 명세 점검, 값을 남기지 않는 저장.
- 사용 방법 페이지마다 관련 기술 페이지로 가는 "궁금하신가요?" 링크를 달았습니다.
- 작업 설명을 현재 동작에 맞췄습니다. Collect now는 로그를 가져오고, Run scan은 저장된 결과만 다시 검사합니다.
- Flows 환경 지도(Clients → Gateways → Hosts → Destinations), 요청 흐름, `/api/collect`, `/api/request-flow`, `/api/flow-explorer`를 반영했습니다.
- 클라이언트 IP와 X-Forwarded-For를 원문으로 저장하는 점, traceparent 해석을 반영했습니다.
- 예전 Splunk 원문 캐시, 호출 200건 제한 같은 지난 설명을 지웠습니다.

## 2026-10-25

- SADE `feat/integration`, `dcab3bb` 기준으로 한국어·영어 사용 가이드를 정리했습니다.
- 데이터 유형·룰·예외·버전 복원과 자동 재분류를 추가했습니다.
- HTTP API·CLI·문제 해결·지원 범위를 추가했습니다.

이 페이지는 문서 개편 기록입니다. 제품 릴리스나 배포 완료를 뜻하지 않습니다. 검토 근거는 [문서 기준](baseline.md)을 보세요.
