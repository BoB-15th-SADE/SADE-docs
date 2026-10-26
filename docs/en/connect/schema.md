# Log field reference

Every field SADE reads from logs, in one place. Use it when you design a log format, or to see how far the logs you already have will take you.

- Each event must be one JSON object. Use any name listed under **Recognized names** and SADE finds it automatically. Nested objects are found by dotted path (`http.request.method`).
- If you use a name that is not listed, set it in the connection's Field mapping or upload a [log profile](logs.md#field-mapping).
- The **four required fields** are enough to collect. Everything else widens what you can see.

## What each field adds {#levels}

Tick the fields your logs have to see how much of Flows gets drawn.

<div class="sade-flowsim" data-lang="en"></div>

| Step | Add | You now see |
|---|---|---|
| 1 | `timestamp`, `method`, `path`, `status` | API inventory, call counts, shadow APIs |
| 2 | `client_ip` | Flows Clients: which IP called which API |
| 3 | `service` (or a path prefix registered on the service) | APIs grouped by service |
| 4 | `request_id` (on both gateway and service logs) | Gateway and service records of one request merged into one call, not counted twice |
| 5 | A caller-side record: `event_type` (client) + `destination` | **Service → service** lines, paired by the `request_id` from step 4 or a `hop_id` |
| 6 | `trace_id`, `span_id`, `parent_span_id` (or `traceparent`) | The most exact service lines, the full path of one request, and the Trace list |
| 7 | `host.name` or `k8s.node.name` | Hosts: which server runs each service |
| 8 | OpenTelemetry PostgreSQL spans | Destinations: which API touched which database |

!!! warning "IDs alone do not draw service-to-service lines"
    A `request_id` or `trace_id` says "same request". It does not say **who called whom**. To draw a line from service A to B, A must also leave a record saying "I sent this to B". Either one works:

    - An application log line from A with `event_type: "client"` and `destination: "B"`
    - An OpenTelemetry CLIENT span from A

    If the `parent_span_id` in B's log (or the parent span in its `traceparent`) equals A's CLIENT span ID, the two are linked by trace. Otherwise SADE looks for a record with the same `hop_id` or `request_id` within 30 seconds.

## One request across three logs

One request going user → gateway → order → payment, as it appears in three logs.

=== "① Gateway access log"

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

    Records the caller IP, the original client, the auth method, response fields and the server. The path prefix `/order` assigns it to the order service.

=== "② order application log (sent)"

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

    `event_type: client` and `destination` record that order called payment. It does not add to call counts.

=== "③ payment access log (received)"

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

    `parent_span_id` equals the `span_id` in ②, so the **order → payment** line is linked by trace. Without trace fields, the same `request_id` in ② and ③ within 30 seconds links them.

Set the **Flow log type** of connection ② to Application and of ③ to Access. Trace fields and `traceparent` are read only for these two types, never for the default (Legacy HTTP log).

## Fields

**Recognized names** are listed in the order auto-detection tries them. When several are present, the one whose values fit best wins.

### Core (required) {#core}

An event missing any of these is not treated as an HTTP log and is skipped.

| Field | Type | Recognized names | Example | Used for |
|---|---|---|---|---|
| `timestamp` | Date | `observed_at_epoch`, `_time`, `@timestamp`, `observed_at`, `timestamp`, `time`, `start_time`, `started_at`, `time_iso8601`, `ts`, `datetime`, `eventTime`, `requestTime`, `event.created` | `2026-10-26T09:12:03+09:00` | Collection windows, first and last call, call order |
| `method` | String | `method`, `request_method`, `http_method`, `http.method`, `http.request.method`, `request.method`, `verb`, `httpMethod`, `req.method` | `GET` | API identification |
| `path` | String | `request_path`, `path`, `uri_path`, `url.path`, `request.uri`, `uri`, `request_uri`, `http.target`, `url_path`, `request.path`, `req.url`, `url`, `request.url`, `requestUri`, `http.url`, `url.original` | `/orders/1024` | API identification, service assignment |
| `status` | Integer | `status`, `response_code`, `status_code`, `http_status`, `http.status_code`, `http.response.status_code`, `response.status`, `res.statusCode`, `statusCode`, `response.status_code` | `200` | Success and error counts, spec check |

- `timestamp` must be ISO 8601 with a time zone (`Z` or `+09:00`) or epoch seconds or milliseconds. Without a zone it is rejected.
- If `path` holds a full `https://host/path` URL, only the path is used.

### Correlation {#correlation}

IDs that tie records of the same request together. They decide how exact Flows and request flow are.

| Field | Type | Recognized names | Example | Used for |
|---|---|---|---|---|
| `request_id` | String or integer (≤ 256 chars) | `request_id`, `x_request_id`, `requestId`, `http.request.id`, `request.id`, `req.id`, `correlation_id` | `9f2c1d7e4b` | Merging gateway and service records; pairing services when there is no trace |
| `hop_id` | String or integer | `hop_id`, `hop.id` | `h-71` | One ID per service-to-service call, logged by both sender and receiver |
| `trace_id` | 32 hex digits | `traceId`, `trace_id`, `trace.id`, `otel.trace_id` | `4bf92f35…0e4736` | The whole path of one request |
| `span_id` | 16 hex digits | `spanId`, `span_id`, `span.id`, `otel.span_id` | `00f067aa0ba902b7` | This record's span |
| `parent_span_id` | 16 hex digits | `parentSpanId`, `parent_span_id`, `parent.span_id`, `otel.parent_span_id` | `a1b2c3d4e5f60718` | The caller's span; links service lines by trace |
| `traceparent` | W3C header | `traceparent`, `trace_parent`, `request_headers.traceparent`, `http.request.headers.traceparent` | `00-4bf9…-a1b2…-01` | Fills `trace_id` and `parent_span_id` on access logs without trace fields |

- A `-` written by access logs for a missing header counts as no value.
- Without a request ID SADE builds an internal ID from the line, but never uses it to link logs.
- All-zero or wrong-length trace values are rejected.

### Caller and destination {#caller}

Fields that tell who called whom. Service-to-service lines need a **caller-side record** with these fields.

| Field | Type | Recognized names | Example | Used for |
|---|---|---|---|---|
| `service` | String | `service.name`, `service_name`, `service`, `kubernetes.labels.app`, `app`, `source_service` | `order` | The service that wrote this record; service assignment and caller |
| `destination` | String | `destination.address`, `server.address`, `destination.service`, `peer.service`, `net.peer.name`, `upstream_host`, `upstream.host` | `payment` | Target service of a sent request |
| `event_type` | String | `span.kind`, `network.direction`, `direction`, `event_type`, `event.kind` | `client` | Direction. `client`, `SPAN_KIND_CLIENT`, `outbound`, `egress` or `http_client` mean sent; anything else means received |

- Without `service`, logs are split by the path prefixes registered on services ([Splitting logs by service](logs.md#routing)).
- `destination` must match a service ID or alias for a line to appear. `payment-service`, `payment-svc` and `payment-api` match `payment`.

### Client {#client}

| Field | Type | Recognized names | Example | Used for |
|---|---|---|---|---|
| `client_ip` | IP address | `client_ip`, `src`, `src_ip`, `remote_addr`, `source.ip`, `client.ip`, `downstream_remote_address`, `x_forwarded_for`, `clientIp`, `remote_ip`, `client.address` | `10.0.4.12` | Flows Clients, caller IP |
| `forwarded_for` | IP address | `x_forwarded_for`, `http_x_forwarded_for`, `xff`, `http.request.headers.x-forwarded-for`, the `x-forwarded-for` request header | `203.0.113.7, 10.0.0.2` | The first address is kept as the original client; Call History shows "203.0.113.7 via 10.0.4.12" |

IPs, public ones included, are stored as is with only the port removed. Requests from an IP registered as a service alias count as calls from that service.

### Host {#host}

| Field | Type | Example | Used for |
|---|---|---|---|
| `host.id`, `host.name` | String | `app-03` | Flows Hosts: the server or VM a service runs on |
| `k8s.node.uid`, `k8s.node.name` | String | `node-a` | Kubernetes node |
| `k8s.cluster.uid`, `k8s.cluster.name` | String | `prod` | Tells apart nodes with the same name in different clusters |
| `container.id` | String | `3f9c…` | Filters out container names mistakenly reported as host names |

Hosts come only from these fields. SADE never guesses them from peer addresses or service URLs; without them, "Host not observed" is shown.

### Headers and bodies {#payload}

| Field | Type | Recognized names | Used for |
|---|---|---|---|
| `request_headers` | Object | `request_headers`, `request.headers`, `http.request.headers`, `req.headers` | Auth method (`Authorization`, `Cookie`, `X-API-Key`), calls that succeed without credentials, sensitive data in headers |
| `response_headers` | Object | `response_headers`, `response.headers`, `http.response.headers`, `res.headers` | Sensitive data in response headers such as `Set-Cookie` |
| `request_body` | JSON | `request_body`, `request.body`, `http.request.body.content`, `req.body`, `requestBody`, `req_body` | Request fields, sensitive data |
| `response_body` | JSON | `response_body`, `response.body`, `http.response.body.content`, `res.body`, `responseBody`, `resp_body` | Spec check, response fields, sensitive data |

- Auth headers may be masked. If the scheme word survives, as in `Bearer ***`, the auth method is read.
- Bodies may be raw values, field names and types only, or a capture envelope ([Log normalization](../technology/log-normalization.md)).
- Missing headers or bodies show as "not captured". SADE does not treat them as empty.

### Performance {#performance}

| Field | Type | Recognized names | Used for |
|---|---|---|---|
| `duration_ms` | Number (ms) | `duration_ms`, `duration`, `latency`, `latencies.request`, `elapsed_ms`, `responseTime` | Latency in Call History |
| `response_bytes` | Number | `response_bytes`, `bytes_out`, `bytes_sent`, `body_bytes_sent`, `http.response.bytes`, `response.size`, `http.response.body.bytes` | Response size |

NGINX `request_time` is in seconds and is not mapped automatically. Log milliseconds instead.

## OpenTelemetry spans

Fields read from span files are listed in [Log files and OpenTelemetry](files.md#opentelemetry). Spans never add to call counts; they add service relationships, hosts and database access.

[<span class="q">Curious?</span><span class="t">The rules that join scattered log records into the path of one request</span><span class="arrow">→</span>](../technology/runtime-flow.md){ .sade-curious }
