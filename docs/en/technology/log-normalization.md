# Log normalization and field detection

Every company logs differently. The HTTP method might be `method` in one place, `http.request.method` in another and `verb` in a third. SADE **finds the fields by looking at the logs**, so you rarely have to map anything. Whatever the source, each event becomes the same record before analysis.

## Two layers

<div class="sade-pipe" markdown>
<div markdown>**Transport**<p>Splunk REST, WebHDFS</p></div>
<div class="is-key" markdown>**Adapter**<p>HTTP JSON logs, PostgreSQL and SQL logs</p></div>
<div markdown>**Common record**<p>Every analysis reads the same shape</p></div>
</div>

How events arrive and how they are read are kept apart. JSON from Splunk and JSON from an HDFS file go through the same adapter. Adding a new SIEM means writing only the transport; detection and analysis stay as they are.

## Automatic field detection

<div class="sade-steps" markdown>

1. **Flatten.** Nested JSON becomes dotted paths. `{"http":{"request":{"method":"GET"}}}` becomes `http.request.method`. Up to four levels deep.
2. **Group by shape.** Events with the same set of keys are grouped. If gateway and application logs share one index, each group is detected on its own.
3. **Try candidate names.** Each SADE field has a list of common names. For every event in a group, SADE checks whether the value under each name looks like that field.
4. **Pick the best fit.** The name that fits the most events wins. A company-specific name (log profile) is tried first.
5. **Check required fields.** A group missing any of time, method, path or status is not treated as HTTP traffic and is skipped. The skipped count shows in the source status.

</div>

### What "looks like that field" means

SADE checks the **value**, not just the name. A field called `status` whose value is `"ok"` is not used as a status code.

| Field | Value rule |
|---|---|
| Method | One of nine HTTP methods such as `GET` or `POST` |
| Path | Starts with `/`, or a full `https://host/path` URL (only the path is kept) |
| Status | Integer from 100 to 599 |
| Time | ISO 8601 with a time zone, or epoch seconds or milliseconds |
| Request ID, service, destination | String or integer up to 256 characters |
| Trace ID / span ID | Non-zero hex, 32 / 16 digits |
| Headers | JSON object |

A timestamp without a time zone (`2026-10-26 09:12:03`) is rejected rather than guessed. Servers run in different zones, and a wrong guess would scramble both request order and collection windows.

### Recognized naming schemes

The candidate lists include names from Elastic ECS, OpenTelemetry semantic conventions, Envoy, NGINX JSON, Kong and Splunk CIM. The path alone has 16 candidates, including `request_path`, `path`, `url.path`, `request_uri`, `http.target` and `url.original`.

The log checker on [Integration overview](../connect/logs.md#log-check) uses these same lists.

## Body forms

A body can arrive in three forms, and SADE tells them apart.

=== "Body with values"

    ```json
    {"response_body": {"id": 7, "email": "user@example.com"}}
    ```
    Values are checked for sensitive data, and field names and types are compared with the spec. Values are removed before storage.

=== "Field names only"

    ```json
    {"response_body": {"status": "observed", "fields": [{"path": "$.email", "data_type": "string"}]}}
    ```
    Used by collectors that never keep values. Good for spec comparison; no value checks. If the list was cut (`partial_schema`, over 2,000 entries) SADE does not conclude "no undeclared fields".

=== "Capture envelope"

    ```json
    {"response_body": {"state": "captured", "data": {"id": 7}}}
    ```
    Used by body-logging plugins such as the one for Kong, which record states like captured, empty or skipped as too large.

A log with no body is recorded as "not captured". SADE does not read that as an empty body or as "no personal data".

## The common record

After parsing, one log line looks like this (selected fields).

| Field | Content |
|---|---|
| `method`, `request_path`, `status`, `observed_at_epoch` | The four essentials |
| `request_id`, `_correlation_id` | Request ID. Without one, an internal ID is built from the line and never shown as a real request ID |
| `request_headers`, `response_headers` | Header object and whether headers were captured |
| `request_body`, `response_body` | Body state and content |
| `client_ip`, `_forwarded_for` | Peer address; first address of X-Forwarded-For |
| `_service`, `_destination`, `_event_type`, `_hop_id` | Used for flows |
| `_trace_id`, `_span_id`, `_parent_span_id` | Trace on access and app logs; filled from `traceparent` when missing |
| `_source_id`, `_source_ref`, `_native_locator` | Which line of which source (Splunk `_cd`, HDFS file offset) |

### Small details that matter

- A `-` that access logs write for a missing header means "no value". It is never used as a request ID.
- For `X-Forwarded-For: 203.0.113.7, 10.0.0.2` only the first address is kept as the original client. `client_ip` stays the address of the previous hop.
- A direction of `client`, `SPAN_KIND_CLIENT`, `outbound` or `egress` marks an outgoing request. With no direction, the request is treated as incoming.
- The same event fetched twice is kept once, using a key built from its content.

## Scope and extension

| | Implemented now | Widen the same way |
|---|---|---|
| Field names | Names from Elastic ECS, OpenTelemetry, Envoy, NGINX JSON, Kong, Splunk CIM | Name company fields with Field mapping or a log profile (no code change) |
| Log formats | JSON HTTP logs, PostgreSQL JSON and pgAudit, application SQL JSON | Add a parser for a new format; transport and analysis stay the same |
| Direction values | `client`, `outbound`, `egress` and others | Add company values with `client_event_types` in a log profile |

[Extending for your environment](extending.md)

## Limits

- Plain syslog or combined text is not read over remote connections. Convert it to JSON first.
- One connection uses one mapping. Split very different log formats by sourcetype or path and create separate connections.
- Detection works from names and value shapes. Two fields with the same shape and different meanings (for example two kinds of status code) need a manual mapping.
