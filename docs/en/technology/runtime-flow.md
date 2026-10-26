# Runtime flow: logs and traces

"Which services did this request pass through, and how far did it go?" is the question security teams ask most. SADE **joins the log fragments each service left for the same request** and rebuilds the real path. If [code2flow](code2flow.md) shows where code *can* call, this shows where requests *did* go.

## Inputs

| Input | What it holds | Counted as calls |
|---|---|---|
| Access log | Requests a service **received** | Yes |
| Application log | Requests a service **sent** (target, direction) | No |
| OpenTelemetry span | Parent-child links, host, database access | No |

A request recorded in several places is counted once, on the receiving side.

## How fragments are joined

The receiving side and the sending side are matched in this order. Once a step decides, later steps are skipped.

<div class="sade-steps" markdown>

1. **Trace.** Same trace ID, and the receiver's (SERVER) parent span ID equals the sender's (CLIENT) span ID. The strongest evidence.
2. **Hop ID.** The same ID attached to one service-to-service call.
3. **Request ID.** Same request ID, same target service, method and path, within 30 seconds.

</div>

- With several candidates, nothing is joined. Concurrent requests to the same API must not get mixed up.
- When trace data conflicts, the request ID does not override it.
- With no caller information, the peer IP is the caller. If that IP is an alias of a registered service, that service is the caller.

### Logs with only traceparent

Gateway and service access logs often carry a single W3C `traceparent` header instead of trace fields.

```text
traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
                └──────────── trace ID ────────────┘ └ parent span ┘
```

The span in a received request's `traceparent` is **the caller's span**, so on access logs SADE reads it as trace ID and parent span ID. Separate trace fields in the log take precedence. Legacy HTTP logs do not read it, so the existing merge of gateway and service logs by request ID stays the same.

### The real caller behind a proxy

Behind a gateway, a service log's peer IP is usually the gateway. The real outside caller is the first address of `X-Forwarded-For`. SADE keeps both.

| Value | Example | Used for |
|---|---|---|
| `client_ip` | `10.0.4.12` (gateway) | Caller of the previous hop; Flows grouping |
| `forwarded_for` | `203.0.113.7` | Original client. Shown in Call History as "203.0.113.7 via 10.0.4.12" |

Public addresses are kept as they are; only the port is dropped. Security teams need to trace callers.

## Two views

=== "One request (Request flow)"

    Pick a request in Call History or API details › Calls to see every record linked to it as a tree.

    - Each point shows the sensitive fields in its request and response, and how much was inspected.
    - Up to 1,000 records per request.
    - Missing parents, multiple candidates, conflicting spans and cycles show as **Partial** with a reason.
    - The same field type at several points does not mean the same value was passed along.

=== "Whole environment (Flows)"

    Many requests together, laid out as **Clients → Gateways → Hosts → Destinations**.

    - **Clients**: observed callers. Pick an IP to expand only its request paths.
    - **Gateways**: decided from deployment data, names and routing rules
    - **Hosts**: servers grouped by collected host data (`host.id`, `k8s.node.name` and similar). Without it, "Host not observed"
    - **Destinations**: observed PostgreSQL databases and external hosts outside the scan

    Requests to the same entry API with different downstream paths form different groups. When only the entry API is seen and nothing links further, it shows "Entry API observed".

## Database access

PostgreSQL client spans (`kind: 3`, `db.system.name: postgresql`) link requests to the databases they touched. If the parent span belongs to the calling service, the link is per API; otherwise per service.

Query text, parameters, connection strings and result rows are not stored. Operation names are limited to fixed values such as SELECT and INSERT. The absence of an error status does not confirm that a transaction succeeded.

## LOG / SPEC / CODE

The three buttons in Flows choose what the lines are based on. They change only the view; nothing is collected or scanned again.

| Source | Nodes (services and APIs) | Lines |
|---|---|---|
| LOG | APIs seen in logs and spans | Real calls, callers, span links, database access |
| CODE | APIs in code | HTTP calls in code (dotted), gateway routes (dashed) |
| SPEC | APIs in specs | None. A spec does not say who calls it |

## Limits

- Large SIEM sources keep raw requests only for samples per API, so flows are visible within those samples ([Large-scale SIEM collection](siem-collection.md)).
- Sampled traces or services that do not log break the path. Breaks are shown with a reason.
- HTTP logs alone never create database access; it needs spans.
- Message queues and gRPC flows are not covered.
