# 지원 범위와 제한

## 지원하는 입력

| 입력 | 지원 | 아직 안 됨 |
|---|---|---|
| 소스 코드 | GitHub.com, Enterprise Cloud, Enterprise Server의 **Java Spring Boot** | 다른 언어와 프레임워크, GitLab, Bitbucket, 폴더 업로드 |
| 서비스 주소 해석 | docker compose 설정 | Kubernetes, Helm 설정 |
| 명세 | OpenAPI 3.0, 3.1 **JSON**, 2 MiB 이하, 파일 업로드와 허용한 내부 주소 | YAML, Swagger 2.0, 외부 `$ref` |
| 로그 | CSV(5개, 200 MB), syslog TLS(RFC 5424, 3164), 내부망 평문 syslog, Kafka(JSON, nginx, Apache, 수집기 봉투) | Splunk 등 SIEM 직접 연동, Kafka Avro, Protobuf, Kerberos, OAUTHBEARER |
| API 종류 | HTTP 기반 REST API | GraphQL, gRPC, SOAP |

## 알려진 제한

- **로그인과 권한 관리가 없습니다.** 대시보드를 여는 주소를 방화벽으로 제한하세요.
- **인증은 선언만 봅니다.** 코드와 명세에 적힌 인증 선언을 읽으며, 실제 요청이 막히는지, 객체 단위 권한(BOLA, IDOR)이 맞는지는 확인하지 않습니다. 전역 보안 설정은 일부만 해석합니다.
- **관측한 범위만 압니다.** 수집 기간에 호출되지 않은 API는 로그로 알 수 없고, 로그에 없는 본문은 민감정보를 찾지 못합니다.
- **우선순위는 검토 순서입니다.** 취약점이나 법 위반을 확정하지 않으며, 근거가 없으면 미평가로 둡니다.
- **Data Types는 보기만 됩니다.** 회사 고유 규칙 저장은 연결 중입니다.
- **프레임워크 점검은 준비 중입니다.** Assessments 화면은 준비 상태와 데모만 보여 줍니다.
- **담당자 지정은 후보까지입니다.** CODEOWNERS 후보와 커밋 이력을 보여 주며, 담당자를 직접 지정하는 기능은 아직 없습니다.
- **SADE는 막지 않습니다.** 트래픽 경로에 장비를 두지 않고, 서비스에 요청을 보내지 않으며, 차단하지 않습니다.
