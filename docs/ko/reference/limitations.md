# 지원 범위와 제한

## 입력

| 입력 | 지원 | 미지원 |
|---|---|---|
| 소스 코드 | GitHub.com, Enterprise Cloud, Enterprise Server의 Java Spring Boot. 어노테이션으로 선언한 API | Kotlin 등 다른 언어와 프레임워크, Spring WebFlux 함수형 라우터, GitLab, Bitbucket, 폴더 업로드 |
| 서비스 주소 해석 | docker compose 설정 | Kubernetes, Helm 설정 |
| 명세 | OpenAPI 3.0, 3.1 JSON, 2 MiB 이하. 파일 업로드, 허용한 내부 주소 | YAML, Swagger 2.0, 외부 `$ref` |
| 로그 | CSV(5개, 파일당 200 MB), syslog TLS(RFC 5424, 3164), 내부망 평문 syslog, Kafka(JSON, nginx, Apache, 수집기가 감싼 메시지) | Splunk 같은 SIEM 직접 연동, Kafka Avro, Protobuf, Kerberos, OAUTHBEARER |
| API 종류 | HTTP REST API | GraphQL, gRPC, SOAP |

## 제한

- 로그인과 권한 관리가 없습니다. 방화벽으로 대시보드 접속 주소를 제한합니다.
- 인증은 선언만 읽습니다.
    - 요청이 실제로 막히는지 확인하지 않습니다.
    - 객체 단위 권한 검사(BOLA, IDOR)는 판정하지 않습니다.
    - 전역 보안 설정은 일부만 해석합니다.
- 수집한 범위만 압니다. 수집 기간에 호출되지 않은 API는 로그로 찾지 못합니다. 로그에 본문이 없으면 로그로 민감정보를 찾지 못합니다.
- 관리 우선순위는 검토 순서입니다. 취약점과 법 위반은 판정하지 않으며, 근거가 없으면 미평가로 둡니다.
- Data Types는 보기만 됩니다. 기업 고유 규칙 저장은 다음 버전에 들어갑니다.
- 게이트웨이 경로 규칙, context path, 주소별 서비스 이름은 설정 API로만 넣을 수 있습니다. 서비스 이름 화면에는 이름 합치기만 있습니다.
- syslog, Kafka로 들어온 로그는 저장만 됩니다. 분석은 Log Sources의 로그 분석에서 다시 분석을 눌러야 돕니다.
- SADE AI 점검은 외부 AI 모델을 씁니다. 기본은 무료 Gemini 모델만 실행하며, 결과는 검토 의견입니다. 한 번에 API 40개까지 점검합니다.
- Overview의 Assessments Score는 계산하지 않아 "미점검"으로 나옵니다.
- 담당자는 CODEOWNERS 후보와 커밋 이력까지 보여 줍니다. 담당자 지정은 아직 동작하지 않습니다.
- SADE는 트래픽 경로에 장비를 두지 않고, API를 호출해 점검하지 않으며, 요청을 차단하지 않습니다. 명세 주소를 허용한 경우에만 그 주소에서 명세 파일을 받아 옵니다.
