# 문제 해결

## 설치

| 증상 | 원인과 해결 |
|---|---|
| `port is already allocated` | 443이나 6514를 다른 프로그램이 씁니다. `.env`의 `SADE_HTTPS_PORT`, `SADE_SYSLOG_PORT`를 바꿉니다 |
| 화면은 뜨는데 오류가 남 | `docker compose ps`에서 `migrate` 상태를 보고, `docker compose logs migrate backend`를 확인합니다 |
| 다른 PC에서 대시보드가 안 열림 | `SADE_HTTPS_BIND`가 `127.0.0.1`입니다. 열 주소로 바꾸고 방화벽으로 접속 주소를 제한합니다 |
| 비밀번호를 바꾼 뒤 DB 접속 실패 | 비밀번호는 데이터 볼륨과 짝입니다. 처음 값으로 되돌립니다 |
| 브라우저 인증서 경고 | 자체 서명 인증서입니다. 기업 인증서를 `nginx-certs` 볼륨에 `tls.crt`, `tls.key`로 넣습니다 |

## 코드와 명세

| 증상 | 원인과 해결 |
|---|---|
| GitHub 연결 저장이 실패함 | `SADE_SECRET_KEY`가 비었거나 형식이 틀렸습니다. 키를 넣고 다시 시작합니다 |
| 공개 저장소 스캔이 중간에 실패함 | 토큰 없는 GitHub.com 요청은 IP마다 시간당 60회로 제한됩니다. 읽기 전용 토큰을 넣습니다 |
| API가 하나도 나오지 않음 | 지원 언어는 Java Spring Boot입니다. Code inventories의 Issues와 Unresolved handlers를 확인합니다 |
| 같은 서비스가 두 개로 보임 | 코드, 명세, 로그의 서비스 이름이 다릅니다. 명세는 코드와 같은 이름으로 올리고, 나머지는 [Settings](../policy/access-scope.md#settings)에서 합칩니다 |
| 명세 업로드 거절 | OpenAPI 3.0, 3.1 JSON, 2 MiB 이하, 외부 `$ref` 없는 한 파일이어야 합니다 |
| From URL 거절 | `SADE_SPEC_FETCH_ALLOWED_URLS`에 그 주소가 정확히 있어야 합니다. 주소 이름은 backend 컨테이너에서 사설 주소로 풀려야 합니다 |

## 로그

| 증상 | 원인과 해결 |
|---|---|
| 로그를 넣었는데 Inventory가 그대로임 | 저장만 하고 분석하지 않은 상태입니다. Log Sources에서 Analyze again이나 Apply를 누릅니다 |
| API에 들어가지 않은 줄이 많음 | `service.name`과 `host.name`이 둘 다 없습니다. CSV는 파일별 고정 서비스 이름, Kafka는 토픽별 서비스 이름, 그 밖에는 서버나 IP 이름 규칙을 넣습니다 |
| 시각이 9시간 밀림 | 시간대 없는 UTC 시각입니다. syslog, Kafka는 소스 시간대를 UTC로 바꾸고, CSV는 `.env`의 `SADE_LOG_TIMEZONE`을 `UTC`로 바꿉니다 |
| Kafka에서 브로커 이름을 찾지 못함 | 이름이 서버의 `/etc/hosts`에만 있습니다. `.env`의 `SADE_EXTRA_HOSTS`에 넣고 다시 시작합니다 |
| syslog TLS 연결 실패 | `SADE_SYSLOG_HOST`가 `localhost`입니다. 실제 이름이나 IP로 바꾸고 `docker compose up -d`, `docker compose restart vector`를 실행한 뒤 새 인증서를 보내는 서버에 다시 넣습니다 |
| 로그 소스가 "확인 필요" | Vector가 멈췄거나, Kafka가 응답하지 않거나, syslog가 1시간 넘게 들어오지 않았습니다. 화면에 나온 이유를 확인합니다 |

## 우선순위

| 증상 | 원인과 해결 |
|---|---|
| 미평가 API가 많음 | 판단할 근거가 모자랍니다. API 상세의 Management 탭에서 빠진 자료를 확인하고 채웁니다 ([관리 우선순위](../features/priority.md#evidence)) |
| 예전 분석에 우선순위가 없음 | 우선순위 기능 전에 만든 결과입니다. 다시 분석하면 채워집니다 |
