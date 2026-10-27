# SADE

The first questions an enterprise security team runs into are simple: **which APIs does the company run, what personal data moves through them, and how far does a request travel?** The material to answer them already exists inside the company, scattered: call logs in the SIEM, source code in repositories, API specs with development teams. The trouble is that these three are not connected.

SADE is a **methodology** for this problem and a **reference implementation** that tests it in real environments. Without installing agents or intercepting traffic, it rebuilds API assets and data flows from the logs, code and specs the company already has.

<div class="sade-links" markdown>

[**Methods**<span>code2spec, code2flow, sensitive data detection, runtime flow reconstruction and more, problem by problem</span>](technology/index.md)

[**Extending for your environment**<span>Widen frameworks, field names, log formats and SIEMs to fit your company</span>](technology/extending.md)

[**Integration guide**<span>Connect Splunk, Cloudera, OpenAPI specs and GitHub code</span>](connect/logs.md)

[**Install and try it**<span>Install with Docker, connect your first log and see results</span>](getting-started/quickstart.md)

</div>

## The problems

| Security team's question | Why it is hard today | SADE's approach |
|---|---|---|
| Which APIs do we really run? Which are missing from the spec? | Specs are stale or missing; real calls live only in the SIEM | Match real log paths to spec and code APIs and separate calls that match nothing as shadow APIs ([API discovery](technology/api-discovery.md)) |
| What is the API contract of a service with no Swagger? | Development teams do not maintain specs | Build an OpenAPI spec from source code alone ([code2spec](technology/code2spec.md)) |
| Which APIs exchange personal data? | Field names differ by company and team | Judge by field name, sibling fields and value format, and add company-specific names as rules ([Sensitive data detection](technology/sensitive-data.md)) |
| Which services and databases does one request pass through? | Each service logs separately | Join scattered logs by request ID and trace ([Runtime flow reconstruction](technology/runtime-flow.md)) |
| Which call paths never showed up in logs? | Logs cannot show what was not called during the window | Find service calls and database access in code ([code2flow](technology/code2flow.md)) |
| Which calls send personal data the spec never mentions? | Reviewing only the spec misses them | Compare every call with the spec and mark differences ([Per-call spec check](technology/spec-check.md)) |

## Three inputs

| Input | Tells you | Cannot tell you |
|---|---|---|
| **Logs** (SIEM, data lake) | Real calls, counts, auth method, fields exchanged, database access | Calls outside the collection window, bodies not logged |
| **Specs** (OpenAPI) | The request and response shape a service promises | Whether it is called or implemented |
| **Code** (Git repositories) | Implemented APIs, calls to other services, database access, auth checks | Whether that code runs, and how often |

You can start with any one, and each one you add fills gaps in the others. Every API and field carries a `Spec` / `Code` / `Log` tag showing where it was confirmed.

## Scope of the reference implementation

The methodology is not tied to a product or language. This implementation covers representative enterprise environments so you can try it right away.

| Area | Implemented now | Can be widened the same way to |
|---|---|---|
| Log collection | Splunk, Cloudera (WebHDFS) | Elasticsearch, other SIEMs and data lakes |
| Log formats | JSON HTTP logs (ECS, OTel, Envoy, NGINX, Kong, Splunk CIM names), PostgreSQL and application SQL logs | Company-specific log formats, other database logs |
| Code → spec | Major Spring, Go, Python, Node.js and .NET frameworks | In-house frameworks, other languages |
| Code → call flow | HTTP clients in 5 languages; config resolution and database access for Spring Boot | Config and data layers of other frameworks |
| Sensitive data | 19 personal, financial and credential types | Company field names, in-house ID formats |

See [Extending for your environment](technology/extending.md).

## Principles

- **No guessing.** When evidence is short, SADE leaves a gap marked "not confirmed" instead of linking. For security decisions, a blank beats a plausible guess.
- **No execution.** Code is only read. SADE sends no requests to your services.
- **No stored values.** So a tool that finds personal data does not pile it up, raw values are deleted right after they are judged.

What SADE shows is **what was confirmed within the collected range**. It does not decide legal violations or that every API is safe; it narrows down what the security team should review. See [Scope and limits](reference/limitations.md).
