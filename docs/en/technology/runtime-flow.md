# Runtime flow reconstruction

When investigating an incident or reviewing how personal data is processed, security teams ask the same question: **"Which services and which database did this request reach, and what personal data moved along the way?"** But logs pile up separately per service, gateway and database, and joining them by hand is hard.

SADE **joins scattered log fragments of the same request** to rebuild the real path. If [code2flow](code2flow.md) shows where code *can* call, this shows where requests *did* go.

## Inputs

All of them are logs, used as they already sit in your SIEM or data lake.

| Log | What it holds | Counted as calls |
|---|---|---|
| Access log | Requests a service **received** | Yes |
| Application log | Requests a service **sent** to another service (target, direction) | No |
| Application SQL log | SQL a service ran, with the request's IDs | No |
| PostgreSQL log (JSON, pgAudit) | SQL the database received and the tables it touched | No |

A request recorded in several places is counted once, on the receiving side. The fields each log needs are in the [Log field reference](../connect/schema.md#levels).

## How services are linked

Receiving and sending records are matched in this order. Once a step decides, later steps are skipped.

<div class="sade-steps" markdown>

1. **Trace.** Same trace ID, and the receiver's (SERVER) parent span ID equals the sender's (CLIENT) span ID. The strongest evidence.
2. **Hop ID.** The same ID attached to one service-to-service call.
3. **Request ID.** Same request ID, same target service, method and path, within 30 seconds.

</div>

- With several matching candidates, nothing is linked, so concurrent requests to the same API never get mixed up.
- When trace data differs, records are not linked even if the request ID matches.
- **Without any shared ID, records are not linked even if time and path are close.** These flows feed security decisions, so lines are never drawn on a guess.
- With no caller information, the peer IP is the caller. An IP registered as a service alias means that service.

### Logs with only traceparent

Gateway and service access logs often carry a single W3C `traceparent` header instead of trace fields.

```text
traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
                └──────────── trace ID ────────────┘ └ parent span ┘
```

The span in a received request's `traceparent` is **the caller's span**, so on access logs SADE reads it as trace ID and parent span ID. Separate trace fields in the log take precedence. If you instrument with OpenTelemetry, logging this value alongside each line is enough.

### The real caller behind a proxy

Behind a gateway, a service log's peer IP is usually the gateway. The real outside caller is the first address of `X-Forwarded-For`. SADE keeps both.

| Value | Example | Used for |
|---|---|---|
| `client_ip` | `10.0.4.12` (gateway) | Caller of the previous hop; Flows grouping |
| `forwarded_for` | `203.0.113.7` | Original client. Call History shows "203.0.113.7 via 10.0.4.12" |

Public addresses are kept as they are, with only the port removed, because callers need to be traced.

## Linking database access {#database}

**Database logs alone**, with no traces or instrumentation, link which API touched which database and table. This builds on the fact that many companies already ship PostgreSQL logs or pgAudit audit logs to their SIEM.

### Two kinds of database logs

| Log | Written by | Main values |
|---|---|---|
| **Application SQL log** | The service (for example the Hibernate SQL logger) | `timestamp`, `service`, `sql`, `request_id`, `operation_id`, `parent_hop_id`, `instance_id`, `thread`, `duration_ms` |
| **PostgreSQL log** | The database (JSON logs, pgAudit) | `application_name`, the statement or pgAudit table data |

For PostgreSQL logs, set **Database Host, Port and Name** on the connection so SADE knows which database server the log describes. `application_name` maps to a service only when it exactly equals a registered service ID, name or alias. Give each service its own `application_name`.

### Linking order

<div class="sade-steps" markdown>

1. **Request ID** groups the HTTP records and SQL records of one request.
2. **SQL operation ID** links the same execution in the application SQL log and the PostgreSQL log.
3. **Parent hop ID** picks out the service request that ran the SQL.

</div>

If adding log fields is hard, the IDs can go in a comment before the SQL.

```sql
/*sade request_id=9f2c1d7e4b operation_id=q-31*/ SELECT ... FROM member WHERE ...
```

A request ID in HTTP headers or MDC does not reach PostgreSQL logs on its own. The company's shared data access layer has to add it.

### Without IDs: inferred links

Application SQL without IDs is linked as **Inferred**, drawn dashed, only when **all** of these hold:

- Same service, same instance (`instance_id`), same thread (`thread`)
- Ran inside that service's request interval (`request_start` to `request_end`)
- Exactly one request matches that interval

With no interval, several concurrent requests or a different instance, nothing is linked.

### Tables and storage

- SQL is parsed with SQLGlot to find **directly referenced tables** and tell reads from writes. CTE names are not counted as tables; names without a schema stay "unresolved".
- Parse and Bind records do not count as executions.
- **SQL text, literals, parameters, result values and error messages are dropped at collection.** Only operation kind and table names are kept.
- A record of executed SQL does not mean data was returned, a transaction committed or data left the company.

!!! warning "Before turning on database logging"
    SADE never changes database logging settings. SQL logs are large and parameters may contain personal data, so review log volume and SIEM retention before enabling them.

## Where sensitive data moves (Data Flow) {#data-flow}

Turn on **Sensitive Data** in Flows and **sensitive data types confirmed in real logs** appear on the graph.

| Shown | Meaning |
|---|---|
| Number on a node | Sensitive data types confirmed at that service's capture points |
| Line labels | Request (caller → called) and response (called → caller) directions shown separately |
| Line details | Field path, caller and receiver capture points, basis (Field Meaning Matched / Value Format Matched) |

- **Choose a trace** and only what was confirmed in that request is shown. Other requests and branches never mix in.
- Fields only in specs or code, classification candidates and types seen elsewhere in the trace are not carried onto a line.
- SQL table references alone never carry a sensitive data type.
- Places with no captured body show **Not Collected**; inspected bodies with no findings are shown separately.
- The same type on both ends **does not mean the same value was passed along.**

## Two views

=== "One request (Trace Details)"

    Open a call in Call History and click **Trace Details** to open a screen for that request.

    - A **timeline** drawn from real span parent links and execution times.
    - Pick a span to see the sensitive data in its request and response and how it was captured.
    - Switch to other stored request examples.
    - Partially observed spans and spans without timing are marked as such. Up to 1,000 records per request.

=== "Whole environment (Flows)"

    Many requests together, laid out as **Clients → Gateways → Hosts → Destinations**.

    - **Clients**: callers found in logs. Pick an IP to expand only its request paths.
    - **Gateways**: decided from deployment data, names and routing rules
    - **Hosts**: servers grouped by host data in logs (`host.name`, `k8s.node.name` and similar). Without it, "Host not observed"
    - **Destinations**: PostgreSQL databases confirmed by database logs, and external hosts that code calls

    Nodes can be dragged, and lines are redrawn around them. When only the entry API is seen and nothing links further, it shows "Entry API observed".

## LOG / SPEC / CODE

The three buttons in Flows choose what the lines are based on. They change only the view; nothing is collected or scanned again.

| Source | Nodes (services and APIs) | Lines |
|---|---|---|
| LOG | APIs seen in logs | Real calls, callers, database access |
| CODE | APIs in code | HTTP calls in code (dotted), gateway routes (dashed) |
| SPEC | APIs in specs | None. A spec does not say who calls it |

## Scope and extension

| | Implemented now | Widen the same way |
|---|---|---|
| Service links | Trace, hop ID, request ID | Name your company's ID fields in a log profile |
| Databases | PostgreSQL logs, pgAudit, application SQL logs | Add parsers for other database logs |
| Link accuracy | Depends on the IDs in your logs | Add ID propagation to the company logging standard |

Flow accuracy comes down to **whether the same request ID is logged everywhere**. What a security team can request as a development standard is listed in [Extending for your environment](extending.md#id).

## Limits

- Large SIEM sources keep raw requests only for samples per API, so flows are visible within those samples ([Large-scale SIEM collection](siem-collection.md)).
- Services that do not log, or broken IDs, cut the path. Breaks are shown with a reason.
- Databases are limited to PostgreSQL.
- Message queues and gRPC flows are not covered.
