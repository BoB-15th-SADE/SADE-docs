# Log files and OpenTelemetry

Use files to start without a SIEM connection, or to add access logs, application logs and OpenTelemetry spans for exact service-to-service flows.

## Where to put files

With Docker, put files in `imports/` in the install folder. It is mounted read-only inside the container.

| Install folder | Path to enter on screen |
|---|---|
| `sade/imports/access.jsonl` | `/workspace/imports/access.jsonl` or `../../imports/access.jsonl` |

!!! warning "`imports/access.jsonl` points somewhere else"
    Paths are relative to the dashboard folder. `imports/...` means `/workspace/apps/dashboard/imports/`, which is not the default volume.

## Which file source to choose

=== "Access log"

    Requests a service **received**: gateway access logs or a service's own access log.

    - Counted as calls.
    - Reads `traceId`, `spanId` and `parentSpanId` when present; otherwise reads the trace and caller span from the W3C `traceparent` header.
    - With `X-Forwarded-For`, the first address is kept separately as the original client.

    ```json
    {"time":"2026-10-26T09:12:03+09:00","service":"order","method":"GET","path":"/orders/1024","status":200,
     "request_id":"9f2c1d7e4b","traceparent":"00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01"}
    ```

=== "Application log"

    Requests a service **sent** to another service: HTTP client logs.

    - Does not add to call counts. Paired with the receiver's access log to add who called.
    - Needs a target (`destination`) and direction (`event_type: client` and similar).

    ```json
    {"time":"2026-10-26T09:12:03.010+09:00","service":"gateway","event_type":"client",
     "destination":"order","method":"GET","path":"/orders/1024","status":200,"request_id":"9f2c1d7e4b"}
    ```

=== "OpenTelemetry spans"

    Span files exported by a collector or instrumentation. Optional.

    - Reads OTLP `resourceSpans` JSON, a JSON array of spans, or JSONL with one span per line.
    - An HTTP SERVER span whose parent is a CLIENT span is evidence of a service-to-service call.
    - PostgreSQL client spans (`kind: 3`, `db.system.name: postgresql`) draw database access.
    - Does not add to call counts.

=== "SIEM CSV export"

    CSV exported from Splunk, Elastic or QRadar is read too. A `_raw` column with JSON is used first. For stores without a direct connection, such as Elasticsearch, export JSONL or CSV and connect it this way.

## Connect

<div class="sade-steps" markdown>

1. Under Files in **Connect › Log Sources**, choose Access log, Application log or OpenTelemetry spans.
2. Enter the path under **Log file**.
3. For access and application logs, pick a service under advanced settings › **Service matching**, or split by the service name in the log.
4. Click **Save connection**, then **Collect now**.
5. Check the linked paths in **Flows** and **Call History › Request flow**.

</div>

## Pairing rules

The receiving side (access) and sending side (application) are paired into one call in this order.

| Order | Evidence | Condition |
|---|---|---|
| 1 | Trace | Same trace ID, and the receiver's `parentSpanId` equals the sender's `spanId` |
| 2 | Hop ID | Same `hop_id` |
| 3 | Request ID | Same request ID, same target service, method and path, within 30 seconds |

- Conflicting trace data is not overridden by other evidence.
- With several candidates, nothing is paired. SADE does not guess.
- Access and application records of the same request are not counted twice.

[<span class="q">Curious?</span><span class="t">How the path of one request is rebuilt from logs and traces</span><span class="arrow">→</span>](../technology/runtime-flow.md){ .sade-curious }

## What is read from OpenTelemetry {#opentelemetry}

| Purpose | Fields |
|---|---|
| Linking | `traceId`, `spanId`, `parentSpanId`, `kind` |
| Time | `startTimeUnixNano`, `endTimeUnixNano` |
| Service | `serviceName` or resource `service.name` |
| HTTP | `http.request.method`, `http.route` (only when it is a path), `url.path`, `url.full` |
| Database | `db.system.name` (or `db.system`), `db.namespace`, `server.address`, `db.operation.name` |
| Host | `host.id`, `host.name`, `k8s.node.uid`, `k8s.node.name` |

Query text, parameters, connection strings and results of database spans are not stored. Operation names are limited to fixed values such as SELECT and INSERT.

## Good combinations

| You have | You see |
|---|---|
| One gateway log | Gateway → API |
| + service access logs | Calls per service; gateway and service logs merged |
| + application logs | Service-to-service calls (by request ID) |
| + traces (`traceparent` or spans) | The most exact service-to-service calls; the full path of one request |
| + PostgreSQL spans | Which API touched which database |
