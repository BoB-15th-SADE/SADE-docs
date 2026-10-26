# Core technology

SADE lines up three kinds of evidence, **logs, specs and code**, on the same API unit, so you can see which APIs exist, what they send and receive, and where requests go. This section explains how each part works. To set things up first, start with the [integration guide](../connect/logs.md).

## The whole path

<div class="sade-pipe" markdown>
<div markdown>**Collect**<p>Read logs from a SIEM or files; register code and specs</p></div>
<div markdown>**Normalize**<p>Turn differently shaped logs into one record</p></div>
<div class="is-key" markdown>**Identify APIs**<p>Match paths to spec and code APIs and tag the source</p></div>
<div markdown>**Analyze**<p>Sensitive data, spec differences, service flows</p></div>
<div markdown>**Store**<p>Keep evidence with the raw values removed</p></div>
</div>

**Collect now** runs everything from collection to storage. **Run scan** repeats the spec check on the stored result and never contacts an outside system.

## Topics

<div class="sade-links" markdown>

[**Log normalization and field detection**<span>Find time, method, path and status in logs whose field names all differ, and turn them into one record.</span>](log-normalization.md)

[**Large-scale SIEM collection**<span>Windows, checkpoints, rollups and samples read hundreds of thousands of events in bounded memory.</span>](siem-collection.md)

[**API discovery and shadow APIs**<span>Match `/orders/1024` to `GET /orders/{id}` and find calls the spec does not cover.</span>](api-discovery.md)

[**Sensitive data detection**<span>Classify 19 types by field name, context and value shape, and record the kind of evidence.</span>](sensitive-data.md)

[**code2spec**<span>Build an OpenAPI 3.1 spec from source code that has no Swagger.</span>](code2spec.md)

[**code2flow**<span>Find service-to-service HTTP calls, gateway routes and database access in code.</span>](code2flow.md)

[**Runtime flow**<span>Rebuild the real path of one request from access logs, application logs and traces.</span>](runtime-flow.md)

[**Per-call spec check**<span>Mark undeclared fields, type differences and requests that succeed without credentials, call by call.</span>](spec-check.md)

[**Value-free storage**<span>Store only evidence, so results can be recomputed without keeping raw values.</span>](value-free-storage.md)

</div>

## What each source can tell you

| Source | Tells you | Cannot tell you |
|---|---|---|
| **Spec** | The request and response shape a service promises | Whether it is called, and by whom |
| **Code** | Implemented APIs, outbound calls, declared auth checks | Whether that code runs, and how often |
| **Log** | Real calls, counts, auth method, fields exchanged | Calls outside the collection window, bodies that were never logged |

SADE does not hide these gaps. Every API and field carries a `Spec` / `Code` / `Log` tag, and missing evidence is shown as "not observed" or "Not evaluated", never as "none".

## Principles

- **No guessing.** When several candidates could match, SADE does not link them. A path it cannot resolve stays "unresolved".
- **No execution.** Code is only read. SADE sends no requests to your services.
- **No stored values.** Anything that needs a value happens in memory; only types and evidence are written.
- **Recomputable.** Stored evidence can be reanalyzed after a rule change, and the same input gives the same result.
