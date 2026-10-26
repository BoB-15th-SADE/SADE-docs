# 로그 파일과 OpenTelemetry

SIEM 연결 없이 로그 파일로 시작하거나, 서비스 간 흐름을 정확하게 보려고 Access·Application 로그와 OpenTelemetry span을 함께 넣을 때 쓰는 방법입니다.

## 파일 놓는 곳

Docker로 설치했다면 설치 폴더의 `imports/`에 파일을 둡니다. 컨테이너 안에서는 읽기 전용으로 연결됩니다.

| 설치 폴더 | 화면에 넣는 경로 |
|---|---|
| `sade/imports/access.jsonl` | `/workspace/imports/access.jsonl` 또는 `../../imports/access.jsonl` |

!!! warning "`imports/access.jsonl`이라고 쓰면 다른 곳을 가리킵니다"
    경로는 대시보드 폴더 기준입니다. `imports/...`는 `/workspace/apps/dashboard/imports/`를 뜻해서 기본 볼륨과 다릅니다.

## 어떤 파일 소스를 고를까

=== "Access log"

    서비스가 **받은** 요청 기록입니다. 게이트웨이 접근 로그나 서비스의 접근 로그가 여기에 해당합니다.

    - 호출 수를 셉니다.
    - `traceId`·`spanId`·`parentSpanId`가 있으면 읽고, 없으면 W3C `traceparent` 헤더에서 trace와 호출자 span을 읽습니다.
    - `X-Forwarded-For`가 있으면 첫 주소를 원래 클라이언트로 따로 남깁니다.

    ```json
    {"time":"2026-10-26T09:12:03+09:00","service":"order","method":"GET","path":"/orders/1024","status":200,
     "request_id":"9f2c1d7e4b","traceparent":"00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01"}
    ```

=== "Application log"

    서비스가 다른 서비스를 **부른** 기록입니다. HTTP 클라이언트 로그가 여기에 해당합니다.

    - 호출 수를 늘리지 않습니다. 받은 쪽 Access 로그와 연결해 "누가 불렀는지"를 채워 줍니다.
    - 호출 대상(`destination`)과 방향(`event_type: client` 등)이 필요합니다.

    ```json
    {"time":"2026-10-26T09:12:03.010+09:00","service":"gateway","event_type":"client",
     "destination":"order","method":"GET","path":"/orders/1024","status":200,"request_id":"9f2c1d7e4b"}
    ```

=== "OpenTelemetry spans"

    Collector나 계측 도구가 내보낸 span 파일입니다. 선택 사항입니다.

    - OTLP `resourceSpans` JSON, span 배열 JSON, span마다 한 줄인 JSONL을 읽습니다.
    - HTTP SERVER span의 부모가 CLIENT span이면 두 서비스 사이의 호출로 인정합니다.
    - PostgreSQL 클라이언트 span(`kind: 3`, `db.system.name: postgresql`)으로 DB 접근을 그립니다.
    - 호출 수는 늘리지 않습니다.

=== "SIEM CSV 내보내기"

    Splunk·Elastic·QRadar에서 내보낸 CSV도 읽습니다. `_raw` 열에 JSON이 있으면 그 열을 먼저 씁니다. Elasticsearch처럼 직접 연결이 없는 저장소는 JSONL이나 CSV로 내보내 이 방법으로 연결하세요.

## 연결하기

<div class="sade-steps" markdown>

1. **Connect › Log Sources**의 Files에서 Access log, Application log, OpenTelemetry spans 중 하나를 고릅니다.
2. **Log file**에 경로를 넣습니다.
3. Access·Application 로그는 추가 설정 › **Service matching**에서 서비스를 고르거나 로그의 서비스 이름으로 나눕니다.
4. **Save connection** 후 **Collect now**를 누릅니다.
5. **Flows**와 **Call History › Request flow**에서 연결된 경로를 확인합니다.

</div>

## 짝짓기 규칙

받은 쪽(Access)과 보낸 쪽(Application) 기록을 아래 순서로 맞춰 보고, 맞으면 한 번의 호출로 봅니다.

| 순서 | 기준 | 조건 |
|---|---|---|
| 1 | Trace | 같은 trace ID이고, 받은 쪽의 `parentSpanId`가 보낸 쪽의 `spanId`와 같음 |
| 2 | Hop ID | 같은 `hop_id` |
| 3 | Request ID | 같은 request ID, 같은 대상 서비스·메서드·경로, 30초 이내 |

- trace 정보가 서로 다르면 요청 ID가 같아도 잇지 않습니다.
- 맞는 후보가 여러 개면 추측하지 않고 잇지 않습니다.
- 같은 요청의 Access와 Application 기록은 호출 수를 두 번 세지 않습니다.

[<span class="q">궁금하신가요?</span><span class="t">로그와 trace로 요청 하나의 경로를 복원하는 방법</span><span class="arrow">→</span>](../technology/runtime-flow.md){ .sade-curious }

## OpenTelemetry에서 읽는 값 {#opentelemetry}

| 용도 | 필드 |
|---|---|
| 연결 | `traceId`, `spanId`, `parentSpanId`, `kind` |
| 시각 | `startTimeUnixNano`, `endTimeUnixNano` |
| 서비스 | `serviceName` 또는 resource의 `service.name` |
| HTTP | `http.request.method`, `http.route`(경로일 때만), `url.path`, `url.full` |
| DB | `db.system.name`(또는 `db.system`), `db.namespace`, `server.address`, `db.operation.name` |
| 호스트 | `host.id`, `host.name`, `k8s.node.uid`, `k8s.node.name` |

DB span의 쿼리 문장, 파라미터, 연결 문자열, 결과는 저장하지 않습니다. 연산 이름은 SELECT, INSERT처럼 정해진 값만 남깁니다.

## 함께 쓰면 좋은 조합

로그마다 넣을 필드는 [로그 필드 레퍼런스](schema.md)를 보세요.

| 가진 것 | 보이는 것 |
|---|---|
| 게이트웨이 로그 하나 | 게이트웨이 → API까지 |
| + 서비스 Access 로그 | 서비스별 호출 수, 게이트웨이와 서비스 로그 합치기 |
| + Application 로그 | 서비스 간 호출 (요청 ID 기준) |
| + trace (`traceparent` 또는 span) | 서비스 간 호출을 가장 정확하게, 요청 하나의 전체 경로 |
| + PostgreSQL span | 어떤 API가 어떤 DB에 접근했는지 |
