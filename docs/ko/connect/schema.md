# 로그 필드 레퍼런스

SADE가 로그에서 읽는 필드를 모두 정리했습니다. 로그 형식을 새로 정하거나 이미 쌓고 있는 로그로 어디까지 볼 수 있는지 확인할 때 쓰세요.

- 이벤트 하나가 JSON 객체 하나면 됩니다. 필드 이름은 아래 **인식하는 이름** 중 하나를 쓰면 자동으로 찾습니다. 중첩 객체는 점으로 이은 경로(`http.request.method`)로 찾습니다.
- 여기에 없는 이름을 쓰고 있다면 연결의 Field mapping에서 직접 지정하거나 [로그 프로필](logs.md#field-mapping)을 올리면 됩니다.
- **필수 4개**만 있어도 수집됩니다. 나머지는 있을수록 보이는 범위가 넓어집니다.

## 필드를 더할수록 보이는 범위 {#levels}

내 로그에 있는 필드를 체크해 보세요. Flows에서 어디까지 그려지는지 바로 보여 줍니다.

<div class="sade-flowsim" data-lang="ko"></div>

| 단계 | 더할 필드 | 새로 보이는 것 |
|---|---|---|
| 1 | `timestamp`, `method`, `path`, `status` | API 인벤토리, 호출 수, Shadow API |
| 2 | `client_ip` | Flows의 Clients: 어떤 IP가 어떤 API를 불렀는지 |
| 3 | `service` (또는 서비스의 경로 접두사 등록) | API를 서비스별로 묶음 |
| 4 | `request_id` (게이트웨이와 서비스 로그 양쪽) | 같은 요청의 게이트웨이·서비스 기록을 한 호출로 합침. 두 번 세지 않음 |
| 5 | 호출한 쪽 기록: `event_type`(client) + `destination` | **서비스 → 서비스** 선. 4단계의 `request_id`나 `hop_id`로 짝을 지음 |
| 6 | `trace_id`, `span_id`, `parent_span_id` (또는 `traceparent`) | 서비스 간 선을 가장 정확하게 잇고, 요청 하나의 전체 경로와 Trace 목록이 생김 |
| 7 | `host.name` 또는 `k8s.node.name` | Hosts: 어느 서버에서 도는 서비스인지 |
| 8 | OpenTelemetry PostgreSQL span | Destinations: 어느 API가 어느 DB에 접근했는지 |

!!! warning "ID만으로는 서비스 간 선이 생기지 않습니다"
    `request_id`나 `trace_id`는 "같은 요청"이라는 표시일 뿐, **누가 불렀는지**는 알려 주지 않습니다. 서비스 A가 B를 부른 선을 그리려면 A 쪽에 "B로 보냈다"는 기록이 하나 더 있어야 합니다. 둘 중 하나면 됩니다.

    - A의 Application 로그: `event_type: "client"`, `destination: "B"`가 있는 줄
    - A의 OpenTelemetry CLIENT span

    받은 쪽 B의 로그에 있는 `parent_span_id`(또는 `traceparent`의 부모 span)가 A의 CLIENT span ID와 같으면 trace로 잇고, 없으면 같은 `hop_id`나 `request_id`로 30초 안의 기록을 찾아 잇습니다.

## 같은 요청을 남기는 예

사용자 → 게이트웨이 → order → payment 순서로 지나간 요청 하나가 세 로그에 남은 모습입니다.

=== "① 게이트웨이 Access 로그"

    ```json
    {
      "@timestamp": "2026-10-26T09:12:03.120+09:00",
      "http.request.method": "POST",
      "url.path": "/order/checkout",
      "http.response.status_code": 201,
      "request_id": "9f2c1d7e4b",
      "client_ip": "10.0.4.12",
      "x_forwarded_for": "203.0.113.7",
      "host.name": "edge-01",
      "duration_ms": 84.2,
      "request_headers": {"authorization": "Bearer ***", "content-type": "application/json"},
      "response_body": {"orderId": "A-1024"}
    }
    ```

    호출자 IP, 원래 클라이언트, 인증 방식, 응답 필드, 서버가 남습니다. 경로 접두사 `/order`로 order 서비스에 배정됩니다.

=== "② order Application 로그 (보낸 요청)"

    ```json
    {
      "@timestamp": "2026-10-26T09:12:03.150+09:00",
      "service.name": "order",
      "event_type": "client",
      "destination.address": "payment",
      "http.request.method": "POST",
      "url.path": "/payments",
      "http.response.status_code": 200,
      "request_id": "9f2c1d7e4b",
      "trace_id": "4bf92f3577b34da6a3ce929d0e0e4736",
      "span_id": "b7ad6b7169203331"
    }
    ```

    `event_type: client`와 `destination`이 "order가 payment를 불렀다"는 기록입니다. 호출 수에는 더하지 않습니다.

=== "③ payment Access 로그 (받은 요청)"

    ```json
    {
      "@timestamp": "2026-10-26T09:12:03.158+09:00",
      "service.name": "payment",
      "http.request.method": "POST",
      "url.path": "/payments",
      "http.response.status_code": 200,
      "request_id": "9f2c1d7e4b",
      "trace_id": "4bf92f3577b34da6a3ce929d0e0e4736",
      "span_id": "00f067aa0ba902b7",
      "parent_span_id": "b7ad6b7169203331",
      "host.name": "app-03"
    }
    ```

    `parent_span_id`가 ②의 `span_id`와 같아서 **order → payment** 선이 trace로 이어집니다. trace 필드가 없어도 ②와 ③의 `request_id`가 같고 30초 안이면 request ID로 잇습니다.

②는 연결의 **Flow log type**을 Application으로, ③은 Access로 설정해야 합니다. trace 필드와 `traceparent`는 이 두 유형에서만 읽고, 기본값(Legacy HTTP log)에서는 읽지 않습니다.

## 필드 목록

표의 **인식하는 이름**은 자동 감지가 시도하는 순서입니다. 위에 있을수록 먼저 시도하고, 여러 이름이 있으면 값 모양이 가장 많이 맞는 것을 고릅니다.

### 기본 (필수) {#core}

하나라도 없으면 그 이벤트는 HTTP 로그로 보지 않고 건너뜁니다.

| 필드 | 타입 | 인식하는 이름 | 예 | 쓰이는 곳 |
|---|---|---|---|---|
| `timestamp` | 날짜 | `observed_at_epoch`, `_time`, `@timestamp`, `observed_at`, `timestamp`, `time`, `start_time`, `started_at`, `time_iso8601`, `ts`, `datetime`, `eventTime`, `requestTime`, `event.created` | `2026-10-26T09:12:03+09:00` | 수집 구간, 처음·마지막 호출, 호출 순서 |
| `method` | 문자열 | `method`, `request_method`, `http_method`, `http.method`, `http.request.method`, `request.method`, `verb`, `httpMethod`, `req.method` | `GET` | API 식별 |
| `path` | 문자열 | `request_path`, `path`, `uri_path`, `url.path`, `request.uri`, `uri`, `request_uri`, `http.target`, `url_path`, `request.path`, `req.url`, `url`, `request.url`, `requestUri`, `http.url`, `url.original` | `/orders/1024` | API 식별, 서비스 배정 |
| `status` | 정수 | `status`, `response_code`, `status_code`, `http_status`, `http.status_code`, `http.response.status_code`, `response.status`, `res.statusCode`, `statusCode`, `response.status_code` | `200` | 성공·오류 집계, 명세 점검 |

- `timestamp`는 시간대가 있는 ISO 8601(`Z` 또는 `+09:00`)이나 epoch 초·밀리초여야 합니다. 시간대가 없으면 오류로 처리합니다.
- `path`에 `https://호스트/경로` 전체 주소가 있으면 경로만 씁니다.

### 요청 연결 {#correlation}

같은 요청의 기록을 서로 잇는 ID입니다. Flows와 요청 흐름의 정확도를 결정합니다.

| 필드 | 타입 | 인식하는 이름 | 예 | 쓰이는 곳 |
|---|---|---|---|---|
| `request_id` | 문자열·정수 (256자 이하) | `request_id`, `x_request_id`, `requestId`, `http.request.id`, `request.id`, `req.id`, `correlation_id` | `9f2c1d7e4b` | 게이트웨이·서비스 기록 합치기, trace가 없을 때 서비스 간 짝짓기 |
| `hop_id` | 문자열·정수 | `hop_id`, `hop.id` | `h-71` | 서비스 간 호출 한 번마다 붙는 ID. 보낸 쪽과 받은 쪽에 같은 값 |
| `trace_id` | 16진수 32자리 | `traceId`, `trace_id`, `trace.id`, `otel.trace_id` | `4bf92f35…0e4736` | 같은 요청의 전체 경로 |
| `span_id` | 16진수 16자리 | `spanId`, `span_id`, `span.id`, `otel.span_id` | `00f067aa0ba902b7` | 이 기록의 구간 ID |
| `parent_span_id` | 16진수 16자리 | `parentSpanId`, `parent_span_id`, `parent.span_id`, `otel.parent_span_id` | `a1b2c3d4e5f60718` | 나를 부른 쪽의 span. 서비스 간 선을 trace로 이음 |
| `traceparent` | W3C 헤더 | `traceparent`, `trace_parent`, `request_headers.traceparent`, `http.request.headers.traceparent` | `00-4bf9…-a1b2…-01` | Access 로그에 trace 필드가 없을 때 `trace_id`와 `parent_span_id`를 채움 |

- 접근 로그가 헤더가 없을 때 쓰는 `-`는 값이 없는 것으로 봅니다.
- 요청 ID가 없으면 SADE가 줄 내용으로 내부 ID를 만들지만, 다른 로그와 잇는 데는 쓰지 않습니다.
- trace 필드는 모두 0인 값이나 길이가 틀린 값을 받지 않습니다.

### 호출 관계 {#caller}

누가 누구를 불렀는지 알려 주는 필드입니다. 서비스 간 선은 이 필드가 있는 **보낸 쪽 기록**이 있어야 생깁니다.

| 필드 | 타입 | 인식하는 이름 | 예 | 쓰이는 곳 |
|---|---|---|---|---|
| `service` | 문자열 | `service.name`, `service_name`, `service`, `kubernetes.labels.app`, `app`, `source_service` | `order` | 이 기록을 남긴 서비스. 서비스 배정과 호출자 |
| `destination` | 문자열 | `destination.address`, `server.address`, `destination.service`, `peer.service`, `net.peer.name`, `upstream_host`, `upstream.host` | `payment` | 보낸 요청의 대상 서비스 |
| `event_type` | 문자열 | `span.kind`, `network.direction`, `direction`, `event_type`, `event.kind` | `client` | 방향. `client`, `SPAN_KIND_CLIENT`, `outbound`, `egress`, `http_client`면 보낸 요청, 그 밖에는 받은 요청 |

- `service`가 없으면 서비스에 등록한 경로 접두사로 나눕니다([로그를 서비스로 나누기](logs.md#routing)).
- `destination` 값은 서비스 ID나 별칭과 맞아야 선이 생깁니다. `payment-service`, `payment-svc`, `payment-api`는 `payment`로 맞춥니다.

### 클라이언트 {#client}

| 필드 | 타입 | 인식하는 이름 | 예 | 쓰이는 곳 |
|---|---|---|---|---|
| `client_ip` | IP 주소 | `client_ip`, `src`, `src_ip`, `remote_addr`, `source.ip`, `client.ip`, `downstream_remote_address`, `x_forwarded_for`, `clientIp`, `remote_ip`, `client.address` | `10.0.4.12` | Flows의 Clients, 호출자 IP |
| `forwarded_for` | IP 주소 | `x_forwarded_for`, `http_x_forwarded_for`, `xff`, `http.request.headers.x-forwarded-for`, 요청 헤더의 `x-forwarded-for` | `203.0.113.7, 10.0.0.2` | 첫 주소를 원래 클라이언트로 저장. Call History에 "203.0.113.7 via 10.0.4.12"로 표시 |

IP는 공인 주소도 그대로 저장하고 포트만 뗍니다. 서비스에 별칭으로 등록한 IP에서 온 요청은 그 서비스가 부른 것으로 봅니다.

### 호스트 {#host}

| 필드 | 타입 | 예 | 쓰이는 곳 |
|---|---|---|---|
| `host.id`, `host.name` | 문자열 | `app-03` | Flows의 Hosts. 서비스가 도는 서버·VM |
| `k8s.node.uid`, `k8s.node.name` | 문자열 | `node-a` | Kubernetes 노드 |
| `k8s.cluster.uid`, `k8s.cluster.name` | 문자열 | `prod` | 같은 이름의 노드를 클러스터별로 구분 |
| `container.id` | 문자열 | `3f9c…` | 컨테이너 이름이 호스트 이름으로 잘못 쓰인 경우를 걸러냄 |

호스트는 이 필드로만 정합니다. 접속 주소나 서비스 URL로 추측하지 않으며, 없으면 "Host not observed"로 표시합니다.

### 헤더와 본문 {#payload}

| 필드 | 타입 | 인식하는 이름 | 쓰이는 곳 |
|---|---|---|---|
| `request_headers` | 객체 | `request_headers`, `request.headers`, `http.request.headers`, `req.headers` | 인증 방식(`Authorization`, `Cookie`, `X-API-Key`), 인증 없이 성공한 호출, 헤더 민감정보 |
| `response_headers` | 객체 | `response_headers`, `response.headers`, `http.response.headers`, `res.headers` | `Set-Cookie` 등 응답 헤더 민감정보 |
| `request_body` | JSON | `request_body`, `request.body`, `http.request.body.content`, `req.body`, `requestBody`, `req_body` | 요청 필드, 민감정보 |
| `response_body` | JSON | `response_body`, `response.body`, `http.response.body.content`, `res.body`, `responseBody`, `resp_body` | 명세 점검, 응답 필드, 민감정보 |

- 인증 헤더는 값을 가려도 됩니다. `Bearer ***`처럼 방식 단어만 남아 있으면 인증 방식을 읽습니다.
- 본문은 값 그대로, 필드 이름과 타입만, 수집 상태 봉투 세 가지 형태를 받습니다([로그 정규화](../technology/log-normalization.md)).
- 헤더나 본문이 없으면 "수집 안 됨"으로 표시합니다. 비어 있다고 판단하지 않습니다.

### 성능 {#performance}

| 필드 | 타입 | 인식하는 이름 | 쓰이는 곳 |
|---|---|---|---|
| `duration_ms` | 숫자 (밀리초) | `duration_ms`, `duration`, `latency`, `latencies.request`, `elapsed_ms`, `responseTime` | Call History의 응답 시간 |
| `response_bytes` | 숫자 | `response_bytes`, `bytes_out`, `bytes_sent`, `body_bytes_sent`, `http.response.bytes`, `response.size`, `http.response.body.bytes` | 응답 크기 |

NGINX의 `request_time`은 초 단위라서 자동으로 연결하지 않습니다. 밀리초로 바꿔 남기세요.

## OpenTelemetry span

span 파일에서 읽는 필드는 [로그 파일과 OpenTelemetry](files.md#opentelemetry)에 있습니다. span은 호출 수를 늘리지 않고, 서비스 간 관계와 호스트, DB 접근만 더합니다.

[<span class="q">궁금하신가요?</span><span class="t">흩어진 로그 조각을 요청 하나의 경로로 잇는 규칙</span><span class="arrow">→</span>](../technology/runtime-flow.md){ .sade-curious }
