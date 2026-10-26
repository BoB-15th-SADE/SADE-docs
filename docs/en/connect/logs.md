# Integration overview

SADE reads logs and documents you already have. It installs no agent in your services and does not intercept traffic. Start here to see what you can connect and what your logs need to contain.

## What you can connect

<div class="sade-catalog" markdown>

[**Splunk**<span>Search indexes through the Search REST API</span><span class="sade-pill ok">Supported</span>](splunk.md)

[**Cloudera**<span>Read JSONL files in HDFS through WebHDFS</span><span class="sade-pill ok">Supported</span>](cloudera.md)

[**Log files**<span>Access logs, application logs, SIEM CSV exports</span><span class="sade-pill ok">Supported</span>](files.md)

[**OpenTelemetry**<span>OTLP JSON and span JSONL files</span><span class="sade-pill ok">Supported</span>](files.md#opentelemetry)

[**OpenAPI specs**<span>Upload OpenAPI 3.0 / 3.1 JSON</span><span class="sade-pill ok">Supported</span>](specs.md)

[**GitHub**<span>Pick repositories and extract APIs and call relations from code</span><span class="sade-pill ok">Supported</span>](code.md)

<div markdown>**Elasticsearch / OpenSearch**<span>No direct connection yet. Export to JSONL and connect as a file</span><span class="sade-pill no">Not supported</span></div>

<div markdown>**Amazon S3**<span>No direct connection yet. Download and connect as a file</span><span class="sade-pill no">Not supported</span></div>

<div markdown>**Raw syslog**<span>Convert to JSON events first</span><span class="sade-pill no">Not supported</span></div>

</div>

Specs, code and logs can be added one at a time, in any order. A spec alone gives an API list and sensitive data candidates. Logs add real calls; code adds implementation evidence and service-to-service calls.

## First connection

<div class="sade-steps" markdown>

1. **Connect logs.** In Connect › Log Sources, pick Splunk or Cloudera and enter the connection details. Collection range and schedule have defaults.
2. Check access and search permission with **Test connection**, then click **Save connection**. Saving does not mean the connection works.
3. Fetch logs with **Collect now**. The API inventory, sensitive data and Flows fill in.
4. (Optional) Upload an OpenAPI spec in Connect › Specifications. Shadow APIs and the spec check need one.
5. Run the spec check with **Run scan**. It uses only the stored collection and does not contact the SIEM again.

</div>

## What your logs need

The kind of log (gateway, access, application) does not matter. **Each event must be one JSON object** with the fields below. SADE finds the names automatically for common schemes (Elastic ECS, OpenTelemetry, Envoy, NGINX JSON, Kong, Splunk CIM).

=== "Required"

    | Field | Example names | Without it |
    |---|---|---|
    | Time | `time`, `@timestamp`, `_time` | Not collected |
    | Method | `method`, `http.request.method` | Not collected |
    | Path | `path`, `url.path`, `request_uri` | Not collected |
    | Status | `status`, `http.response.status_code` | Not collected |

    These four alone give you the **API inventory, call counts and shadow APIs**. Time must be ISO 8601 with a zone (`Z` or `+09:00`) or epoch seconds or milliseconds.

=== "Recommended"

    | Field | Example | Adds |
    |---|---|---|
    | Request ID | `request_id`, `X-Request-ID` | Merges gateway and service logs into one call |
    | Request headers | `Authorization`, `Cookie`, `X-API-Key` | Auth method analysis; calls that succeed without credentials |
    | Response body | Values, or only field names and types | Per-call spec check; sensitive data by value |
    | Service name | `service.name` | Service assignment without path prefixes |

    Auth headers may be masked. If the scheme word survives, as in `Bearer ***`, SADE reads the auth method.

=== "Nice to have"

    | Field | Example | Adds |
    |---|---|---|
    | Trace | `traceId`, `spanId`, `parentSpanId`, W3C `traceparent` | The most exact service-to-service flow |
    | Target, direction | `destination.address`, `span.kind` | Who called whom |
    | Original client | `X-Forwarded-For` | The real caller IP behind a proxy |
    | Peer IP | `client_ip`, `remote_addr` | Telling callers apart |
    | Latency, size | `duration_ms`, `bytes_sent` | Shown in Call History |

Headers and bodies are optional. When they are missing, SADE shows "not captured" and does not conclude they were empty or free of personal data.

The full field list, and how far Flows gets drawn with each field, is in the [Log field reference](schema.md).

### Check your own log {#log-check}

Paste one log line to see which fields SADE finds and which features it supports. The check runs in your browser and sends nothing anywhere. Masked or made-up values give the same result.

<div class="sade-logcheck" data-lang="en">
  <div class="sade-logcheck__head"><span>One log line (JSON)</span><div class="sade-logcheck__samples"><button type="button" data-sample="nginx">nginx JSON</button><button type="button" data-sample="ecs">Elastic ECS</button><button type="button" data-sample="minimal">Required only</button><button type="button" data-sample="broken">Not JSON</button></div></div>
  <textarea spellcheck="false" aria-label="One log line" placeholder='{"time":"2026-10-26T09:12:03+09:00","method":"GET","path":"/api/orders/1","status":200}'></textarea>
  <div class="sade-logcheck__note">Uses the same alias lists as auto-detection. traceparent is read on sources whose flow log type is Access.</div>
  <div class="sade-logcheck__result" aria-live="polite"></div>
</div>

[<span class="q">Curious?</span><span class="t">How fields are found automatically and differently shaped logs become one record</span><span class="arrow">→</span>](../technology/log-normalization.md){ .sade-curious }

## Field mapping {#field-mapping}

| Mode | When |
|---|---|
| **Auto-detect** (default) | Most cases. Looks for known names in fetched events and checks value shapes too. |
| **Manual** | When auto-detect picked the wrong field. Enter a **field path**, not a value. For `{"http":{"method":"GET"}}`, put `http.method` under Method. |
| **Log profile** | When you have many company-specific names. Upload JSON like the one below and its names are tried first. |

```json
{
  "field_aliases": { "path": ["req.full_path"], "service": ["app_name"] },
  "client_event_types": ["egress_call"]
}
```

## Splitting logs by service {#routing}

One log often mixes calls for many services. Choose how to split them under the connection's advanced settings › **Service matching**. When some service has a path prefix registered, new connections start with path matching.

| Choice | Behavior | Use when |
|---|---|---|
| Match by path prefix | Decided by the start of the path (`/order/...` → order) | One gateway log mixes many services |
| Match by service name in logs | Decided by the service field in the log | Logs carry a service name |
| A specific service | Every log of this connection goes to one service | Each service has its own index or path |
| Assign later | Left Unassigned | No specs or services registered yet |

Register services and path prefixes on the [OpenAPI specs](specs.md) screen. Calls that match no service stay Unassigned and can be assigned later.

## Flow log type

**Flow log type** in advanced settings decides how this log is used when drawing service-to-service flows.

| Type | Meaning | Counted as calls |
|---|---|---|
| Legacy HTTP log (default) | Plain HTTP log. Records of one request are merged by request ID | Yes |
| Access log | Requests a service **received**. Reads trace fields and `traceparent` | Yes |
| Application log | Requests a service **sent** (caller, target) | No. Adds caller information only |

If service-to-service flow matters, connect access logs and application logs separately. See [Log files and OpenTelemetry](files.md).

## Security and storage

- Auth tokens are stored apart from settings in a separate area of the SADE database. They never appear on screen, in exports or job records.
- If the address or auth method changes, the saved token is not reused.
- TLS certificates are always verified. Point to a CA file for internal certificates; there is no option to turn verification off.
- Collected results **do not store raw body or header values.** Values become types such as `<string>`, and request and trace IDs become hashes. Client IPs are kept as they are.

[<span class="q">Curious?</span><span class="t">How SADE judges sensitive data and spec differences after removing values</span><span class="arrow">→</span>](../technology/value-free-storage.md){ .sade-curious }
