# Extending for your environment

Log formats, field names, development frameworks and SIEMs differ from company to company. So that the methods are not tied to one environment, SADE separates **what to look for (rules)** from **how to look for it (mechanism)**. Security teams can reflect company specifics by changing rules, and environments not yet supported can be added as modules on the same mechanism.

| Kind of extension | Who | Examples |
|---|---|---|
| **Change settings** | Security team | Add company field names to sensitive data rules, name your log fields, register how services are told apart |
| **Add a module** | Security team with development support | Add an analyzer for an in-house framework, connect another SIEM |

## At a glance

| Area | Implemented now | Change settings | Add a module |
|---|---|---|---|
| Sensitive data | 19 built-in types | Company field names, field paths, value formats (regex), new types, exclusions | New value validators (checksums and so on) |
| Log formats | Common HTTP log names, PostgreSQL and SQL logs | Field mapping, log profile | New log format parsers |
| SIEMs and stores | Splunk, Cloudera | Range, schedule, index | New transports (for example Elasticsearch) |
| Service assignment | Path prefix, service name | Prefixes, aliases (names, IPs) | |
| Exposure | | Host and path rules | |
| code2spec | Spring, Go, Python, Node.js, .NET | Service folders, excluded folders, in-house request parsers | New framework or language analyzers |
| code2flow | HTTP clients in 5 languages, Spring Boot config and DB | Maximum call depth | New clients, config formats, data access layers |
| Gateways | Spring Cloud Gateway, Zuul, nginx, Kong, Ingress | | New gateway config formats |
| Runtime flow | Request ID, hop ID, trace, SQL operation ID | Company ID field names | Company ID propagation standard (logging layer) |

## Change settings

### Catch sensitive data by your own field names

The built-in rules know common names such as `email` and `phone_number`. Companies also use their own, such as `cust_mbl_no`, `emp_rrn` or `mbr_eml`. Add them in **Policy › Rules › Data Types**.

| Goal | How | Example |
|---|---|---|
| Add a company field name to an existing type | Field name rule | `cust_mbl_no` → PHONE |
| Give meaning to a field at one location | Field path rule | `$.member.contact` → EMAIL |
| Turn an in-house ID format into a new type | New type + value pattern | Employee ID `EMP-[0-9]{6}` → EMPLOYEE_ID |
| Exclude a false positive | Exclusion (reason and expiry) | `name` on `/health` |

Saving creates a new rule version and reclassifies what was already collected without contacting the SIEM. Value pattern rules need raw values, so they apply from the next collection. [Data types and rules](../policy/data-types.md)

### Match your log format

Field names are auto-detected first. If detection picks the wrong field or you use company-specific names, set them on the connection.

- **Field mapping**: Set field paths directly for one connection.
- **Log profile**: Put the names your company's logs share into one JSON file and upload it to each connection. It is tried before auto-detection.

```json
{
  "field_aliases": {
    "request_id": ["txn_guid"],
    "service": ["sys_cd"],
    "path": ["req.full_path"]
  },
  "client_event_types": ["egress_call", "ext_api_req"]
}
```

`client_event_types` adds your company's direction values that mean "sent request". [Log field reference](../connect/schema.md)

### Decide services and exposure

- **Service assignment**: Register a path prefix (`/order`) and aliases (other names in logs, server IPs) per service. Calls from an IP registered as an alias count as calls from that service.
- **Exposure**: In **Access Scope**, classify APIs as Internal / Public / Partner by host and path rules. [Access scope](../policy/access-scope.md)

### Scope code analysis

A config file tells the code analyzer about your repository layout.

```json
{
  "service_roots": { "services/accounts": "accounts", "services/orders": "orders" },
  "exclude_dirs": ["lab", "legacy"],
  "generic_body_decoders": ["com.company.common.web.RequestParser.parse"],
  "max_call_depth": 12
}
```

| Setting | Use |
|---|---|
| `service_roots` | Split a monorepo's folders into services |
| `exclude_dirs` | Folders to skip |
| `generic_body_decoders` | In-house request parsers. The type such a function reads becomes the request schema |
| `max_call_depth` | How deep calls are followed from an API |

## Add a module

### Widen code2spec to other frameworks

Today the major Spring, Go, Python, Node.js and .NET frameworks are read. An in-house framework or another language can be added with an analyzer that keeps **the same contract**, and its results flow straight into the inventory, spec comparison and sensitive data analysis.

<div class="sade-steps" markdown>

1. **Parse into syntax trees.** Use a tree-sitter grammar; never run the target code.
2. **Define route registration.** Find the annotations or functions the framework uses to register APIs.
3. **Follow request and response types.** Expand fields from handler parameters and return types.
4. **Record file and line for every result.** Paths that cannot be decided are reported as `unresolved`, not counted as APIs.

</div>

The input and output an analyzer must follow are defined in `packages/sade-codescan/ADAPTER_CONTRACT.md` in the repository; the Spring analyzer (`java_spring.py`) is the reference implementation.

### Widen code2flow to other environments

Service call analysis is built as **a language-neutral walk plus per-language detectors**. The shared part follows calls between functions; each language module only decides "is this an HTTP call?".

| To widen | Add | Implemented now |
|---|---|---|
| In-house HTTP client wrappers | Detection rules in that language's module | RestTemplate, WebClient, Feign, requests, axios and others |
| Config resolution beyond Spring Boot | A config parser module | `application*.yml`, properties, Compose, Ingress |
| Other data access layers (MyBatis, JDBC Template and so on) | A data access detector | Spring Data repositories |
| Other gateways | A routing config parser | Spring Cloud Gateway, Zuul, nginx, Kong, Ingress / HTTPRoute |

### Connect another SIEM

Collection is split into **transport (how events arrive)** and **format parsing (how they are read)**. A new store such as Elasticsearch needs only a transport; field detection, the bulk collection approach and analysis stay the same. [Log normalization](log-normalization.md), [Large-scale SIEM collection](siem-collection.md)

### Align with a company ID propagation standard {#id}

The key to linking service flows and database access accurately is **whether the same request ID is logged everywhere**. That belongs to the company's logging standard, not to SADE, so here is what a security team can request as a development standard.

| Log | What to log |
|---|---|
| Gateway and service access logs | `request_id`, and `traceparent` if possible |
| When a service calls another service | `event_type: client`, `destination`, the same `request_id` (or `hop_id`) |
| Application SQL logs | `request_id`, `operation_id` |
| Database logs | A `/*sade request_id=… operation_id=…*/` comment added before SQL by the shared data access layer |

Use the [Log field reference](../connect/schema.md#levels) to see how far flows get drawn as each field is added.

## Principles when extending

- **Do not guess.** Report what cannot be decided as "unresolved". Plausible fill-ins skew security decisions.
- **Do not run the target.** Code analyzers only read; no builds and no network.
- **Do not store values.** New log formats also delete raw values after judging. [Value-free storage](value-free-storage.md)
- **Record the source.** Every result keeps which log line or which file and line it came from, so the team can check it.
