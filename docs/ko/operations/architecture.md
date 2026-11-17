# 구성과 데이터 처리

## 컨테이너

`docker compose up` 한 번에 아래 컨테이너가 뜹니다. 호스트에 포트를 여는 컨테이너는 frontend(443)와 vector(syslog 6514, 켰을 때 평문 1514)입니다. 나머지는 내부 네트워크에서만 닿습니다.

| 서비스 | 하는 일 |
|---|---|
| frontend | Nginx. 443으로 대시보드를 내주고 `/api/` 요청을 backend로 넘깁니다 |
| backend | FastAPI. 화면 API, 연결 설정, 명세 등록, CSV 업로드와 민감 탐지, 결과 조회를 맡습니다. 분석은 하지 않습니다 |
| code-worker | GitHub 코드를 읽어 API, 서비스 호출, 생성 OpenAPI를 만들고 민감 유형을 판정합니다 |
| analysis-worker | ClickHouse 로그를 API별로 집계합니다. 매퍼가 코드, 명세, 로그를 합쳐 Inventory, Flows, 관리 우선순위를 만듭니다 |
| postgres | 입력(staging), 결과(result), 운영 설정(ops)을 저장합니다 |
| clickhouse | 값을 가린 로그를 저장하고 집계합니다 |
| vector | CSV, syslog, Kafka 로그를 받아 필드를 맞추고 값을 가린 뒤 ClickHouse에 씁니다 |
| migrate, syslog-certs | 시작할 때 한 번 돌고 끝납니다. DB 마이그레이션 적용, syslog 인증서 생성 |

```text
GitHub ──────────▶ code-worker ───────────────┐
OpenAPI 명세 ────▶ backend ───────────────────┤
CSV ─────────────▶ backend ─▶ vector ─┐       ▼
syslog, Kafka ─────────────▶ vector ─┤   PostgreSQL ◀──▶ analysis-worker
                                      ▼       │           (집계, 매퍼, 우선순위)
                                 ClickHouse ──┼──────────▶ analysis-worker
                                              ▼
                                 backend ─▶ frontend (대시보드)
```

- 컨테이너끼리는 PostgreSQL 표로 자료를 주고받습니다.
- 코드 스캔, 명세 등록, 로그 분석, 설정 저장이 끝나면 매핑이 자동으로 다시 돕니다. 결과는 모두 만들어진 뒤 한 번에 바뀝니다.
- 화면은 마지막으로 끝난 분석 결과만 읽습니다.

## 데이터 처리

| 구분 | 내용 |
|---|---|
| 남기는 것 | 시각, 서비스, 서버, 메서드, 경로 틀, 응답 코드, trace ID, 출발지 IP, 필드 이름과 타입, 민감 유형 이름 |
| 남기지 않는 것 | 요청과 응답 본문의 값, 민감정보 값, 토큰과 비밀번호 |
| 본문 | 저장 전에 값을 타입으로 바꿉니다. 예: `{"phone":"010-1234-5678"}` → `{"phone":"<string>"}` |
| 코드 | 스캔할 커밋의 파일을 GitHub API로 읽고, 분석 결과(API, 위치, 호출)만 저장합니다 |
| 연결 정보 | GitHub 토큰은 `SADE_SECRET_KEY`로 암호화해 DB에 둡니다. Kafka 인증 정보는 `kafka-secrets` 볼륨에 둡니다. 둘 다 화면과 API 응답에 내보내지 않습니다 |
| 외부 전송 | SADE는 분석 자료를 밖으로 보내지 않습니다. 밖으로 나가는 연결은 이용자가 직접 연결한 GitHub, Kafka, 허용한 명세 주소입니다 |

## 보관 기간

| 자료 | 기본 | 설정 |
|---|---|---|
| 값을 가린 로그 줄 | 30일 | `SADE_LOG_RETENTION_DAYS` |
| API별 날짜별 호출 수 | 400일 | `SADE_LOG_DAILY_RETENTION_DAYS` |
| API 최초 발견, 마지막 호출 시각 | 로그 줄이 지워진 뒤에도 유지 | |

## 설정 {#settings}

`.env`에서 바꾸고 `docker compose up -d`로 다시 시작합니다.

| 이름 | 기본 | 뜻 |
|---|---|---|
| `SADE_HTTPS_BIND`, `SADE_HTTPS_PORT` | `127.0.0.1`, `443` | 대시보드 주소와 포트. 다른 PC에서 열려면 `0.0.0.0` 등으로 바꿉니다 |
| `SADE_SYSLOG_HOST` | `localhost` | 다른 서버가 syslog를 보낼 이 서버의 이름이나 IP. 인증서 이름이 됩니다 |
| `SADE_SYSLOG_PORT` | `6514` | TLS syslog 포트 |
| `SADE_SYSLOG_PLAIN_BIND`, `SADE_SYSLOG_PLAIN_PORT` | `127.0.0.1`, `1514` | 평문 syslog 주소와 포트 |
| `SADE_LOG_RETENTION_DAYS` | 30 | 가린 로그 보관 일수 |
| `SADE_LOG_DAILY_RETENTION_DAYS` | 400 | 날짜별 호출 수 보관 일수 |
| `SADE_EXTRA_HOSTS` | 없음 | DNS에 없는 이름을 `이름=IP`로, 쉼표로 이어 적습니다 (예: Kafka 브로커) |
| `SADE_SPEC_FETCH_ALLOWED_URLS` | 없음 | 명세를 가져올 내부 주소 목록 |
| `SADE_LOG_ID_MIN_VALUES` | 20 | 경로의 같은 자리에 값 종류가 이보다 많으면 ID(`{id}`)로 봅니다 |
| `SADE_PATH_CASE_INSENSITIVE_SERVICES` | 없음 | 경로 대소문자를 구분하지 않을 서비스 |

## 업데이트

```bash
git pull
docker compose up -d --build
```

- PostgreSQL 마이그레이션은 `migrate`가 시작할 때 적용합니다.
- 로그용 표와 열은 backend가 시작할 때 없으면 만듭니다.
- ClickHouse 초기화 파일은 데이터 볼륨이 빈 첫 실행에만 돕니다.
