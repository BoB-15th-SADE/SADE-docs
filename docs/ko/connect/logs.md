# 로그 연결 방식

Connect > Log Sources에서 로그를 연결합니다. 로그로 실제 호출된 API, 호출 수, 호출한 주소, 서비스 사이 흐름을 확인합니다.

[![Log Sources 화면](../../assets/screens/logs.png){ loading=lazy }](../../assets/screens/logs.png)
<small>예시 화면 (가상 데이터)</small>

- 위쪽 "우선순위 판단에 빠진 자료" 표는 관리 우선순위를 판단하지 못한 항목, 그 자료가 있는 로그 필드, 영향받는 API 수를 보여 줍니다.
- 아래쪽 Your sources 표는 연결한 소스의 상태와 마지막 수집 시각을 보여 줍니다.

## 방식 고르기

| 방식 | 맞는 환경 | 방향 | 기업에서 준비할 것 | 안내 |
|---|---|---|---|---|
| CSV 업로드 | 연동 승인 전 시험, 기간을 정한 점검 | 사람이 파일을 올림 | SIEM, 게이트웨이, 서비스에서 내보낸 CSV | [CSV 업로드](logs-csv.md) |
| syslog 수신 | 서버나 게이트웨이가 rsyslog로 보낼 수 있을 때 | 기업 서버 → SADE (TCP 6514, TLS) | rsyslog 설정, 방화벽 허용 | [syslog 수신](logs-syslog.md) |
| Kafka 구독 | 로그가 Kafka 토픽에 모일 때 | SADE → Kafka 브로커 (읽기만) | 브로커 주소, 읽기 권한, 인증 정보 | [Kafka 구독](logs-kafka.md) |

!!! tip "CSV로 먼저 확인하기"
    하루치 로그를 CSV로 올려 필드 매핑을 확인한 뒤 syslog나 Kafka를 연결하기를 권합니다. 같은 로그 줄은 어느 경로로 들어와도 한 번만 저장합니다.

## 공통 단계

세 방식 모두 화면 위에 같은 단계가 나옵니다. CSV는 연결 대신 업로드로 시작합니다.

| 단계 | CSV | syslog, Kafka | 하는 일 |
|---|---|---|---|
| 1 | 업로드 | Connect | 파일을 고르거나, 연결 정보를 넣습니다 |
| 2 | | 샘플 받기 | 들어오는 메시지 최대 50개를 보여 줍니다. 아직 저장하지 않습니다 |
| 3 | 필드 매핑 | 필드 매핑 | 기업 필드를 SADE 필드에 맞춥니다 |
| 4 | 저장 결과 확인 | 저장 결과 확인 | ClickHouse에 저장된 줄을 열어 값이 맞는지 봅니다 |
| 5 | 반영 | 반영 | 로그 분석을 돌려 Inventory와 Flows를 다시 만듭니다 |

## 들어온 로그가 저장되기까지

<div class="sade-steps" markdown>

1. 필드 바꾸기

    매핑한 대로 기업 필드 이름을 [로그 필드](schema.md) 이름(ECS)으로 바꿉니다. 매핑하지 않은 필드는 버립니다.

2. 정리

    시각을 UTC로 맞추고, 메서드를 대문자로, 경로에서 쿼리를 뗍니다. 보관 기간보다 오래된 줄은 버립니다.

3. 민감 유형 찾기와 값 가리기

    본문에서 민감 유형을 찾아 이름만 남기고, 값은 `<string>`, `<integer>` 같은 타입으로 바꿉니다. 자세한 방식은 [로그 처리와 값 가리기](../how-it-works/log-processing.md)에 있습니다.

4. 저장

    ClickHouse에 저장합니다. 원래 줄 내용이 같은 줄은 한 번만 남깁니다.

5. 분석

    반영을 누르면 API별로 집계하고 코드, 명세와 합쳐 Inventory와 Flows를 만듭니다.

</div>

## 로그 시각과 시간대

- 시간대가 적힌 시각(`Z`, `+09:00`)은 그대로 읽습니다.
- 시간대가 없는 시각은 소스에 정한 시간대로 읽습니다. 소스에 정하지 않으면 `.env`의 `SADE_LOG_TIMEZONE`(기본 Asia/Seoul)을 씁니다.
- UTC로 찍는 서버를 그대로 두면 9시간 밀립니다.
- CSV는 `SADE_LOG_TIMEZONE`만 씁니다. syslog는 소스별로, Kafka는 소스별과 토픽별로 시간대를 정합니다.

## 분석 다시 돌리기

로그를 저장하는 것과 분석하는 것은 따로 돕니다. syslog, Kafka로 계속 들어온 로그는 저장만 되고, 분석은 자동으로 돌지 않습니다.

- Log Sources의 Log analysis 영역에 마지막 분석 시각과, 그 뒤에 저장되거나 지워진 줄 수가 나옵니다.
- "마지막 분석 뒤에 로그가 바뀌었습니다" 안내가 나오면 Analyze again을 누릅니다. 분석이 끝나야 Inventory와 Flows에 반영됩니다.
- 코드 스캔, 명세 등록, 설정 저장 뒤의 매핑은 자동으로 돕니다. 이때 로그는 마지막 로그 분석 결과를 씁니다.

## 서비스 이름이 없는 로그

`service.name`과 `host.name`이 모두 없는 줄은 API에 들어가지 않습니다. `service.name`이 없고 `host.name`만 있는 줄은 서버 이름을 서비스 이름처럼 써서 분석합니다.

Log Sources의 Logs without a service name 영역에서 이런 줄 수를 확인하고, 아래 방법으로 서비스 이름을 붙입니다.

| 방법 | 내용 |
|---|---|
| 매핑에서 정하기 | CSV는 파일마다 고정 값이나 경로 첫 구간, Kafka는 토픽별 서비스 이름, syslog는 보내는 쪽 appname |
| 서비스 이름 규칙(Service naming rules) | 서버 이름(Server name), 출발지 IP 대역(Source IP range), 요청 경로 앞부분(Request path prefix)으로 서비스 이름을 정함 |

### 서비스 이름 규칙

<div class="sade-steps" markdown>

1. Service naming rules에서 Add rule을 누릅니다.

2. 규칙 종류를 고르고 맞출 값과 서비스 이름을 넣습니다. 예: Request path prefix `/order` → `order-service`

3. 저장한 뒤 Analyze again을 누릅니다. 저장한 로그에도 새 이름이 적용됩니다.

</div>

- 규칙은 `service.name`이 빈 줄에만 적용합니다.
- 위에서부터 처음 맞는 규칙 하나를 씁니다. 순서는 위아래 화살표로 바꿉니다.

## 저장한 로그 지우기

- CSV: Recent uploads에서 업로드 하나를 취소(Cancel this upload)하면 그 업로드가 저장한 줄을 지웁니다.
- syslog, Kafka: Delete stored rows로 그 소스가 저장한 줄을 모두 지웁니다. 다른 소스의 줄은 남습니다. 연결은 유지되어 이후 메시지는 계속 저장됩니다.
- 지운 줄은 되돌릴 수 없습니다. 지운 뒤 Analyze again을 눌러야 Inventory와 Flows에서 빠집니다.

## 어떤 로그를 받으면 좋은지

| 로그 | 채워지는 결과 |
|---|---|
| 게이트웨이나 로드밸런서 접근 로그 | 외부에서 들어온 API, 출발지 IP, 접근 범위 |
| 서비스 접근 로그 | 서비스별 API와 호출 수 |
| 서비스가 다른 서비스를 부른 기록(outbound) | 서비스 사이 선, 외부 목적지 |
| 요청, 응답 본문(가능한 경우) | 로그 근거의 민감 유형 |

게이트웨이 로그만 있어도 Inventory는 만들어집니다. 게이트웨이 뒤 서비스의 로그에는 출발지가 게이트웨이 주소로 찍히므로, 원래 주소(`X-Forwarded-For`)를 `network.forwarded_ip`로 매핑합니다.
