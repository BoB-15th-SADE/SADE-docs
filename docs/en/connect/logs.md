# Connecting logs

SADE identifies APIs from HTTP logs that a company already keeps in its log stores (SIEM, data lake).
It does not install agents or intercept traffic.

## Supported integrations

| Integration | Category | How it reads | Page |
|---|---|---|---|
| Splunk | SIEM | Search REST API (`/services/search/v2/jobs/export`) | [Connect Splunk](splunk.md) |
| Cloudera | Data lake | WebHDFS (JSONL files in HDFS) | [Connect Cloudera](cloudera.md) |

!!! info "Not supported yet"
    Direct Elasticsearch and Amazon S3 connections are not supported yet.

## Steps

1. In **Connect > Log Sources**, pick Splunk or Cloudera under Integrations.
2. Enter the connection details and collection range.
3. **Test connection** checks access and search permission (nothing is saved).
4. **Save** stores the connection (saving does not mean the connection works).
5. **Run scan** collects and analyzes logs. Use **Sync** when you only need to check collection.
6. Review results in **APIs > Inventory** and **Call History**.

- You can connect logs before registering an OpenAPI spec.
- Calls not assigned to a service still appear in Inventory and can be assigned later.
- Run scan includes collection; a separate Sync is optional. See [scans and jobs](../operations/scans.md).

## Supported log formats

| Log type | Format | Analysis | Requirements |
|---|---|---|---|
| API gateway logs | JSON HTTP events | Inventory, Call History | Timestamp, method, path, status |
| Web access logs | JSON HTTP events | Inventory, Call History | Plain combined text must be converted to JSON |
| Application logs | JSON HTTP events | Inventory, Call History | HTTP fields required; error messages alone are not enough |
| Auth / identity logs | JSON identity events | Planned for remote import | Summaries are supported for file import only |
| Syslog (plain text) | Not supported | - | Convert to JSON first |

- Each event must be one JSON object (Splunk `_raw`, or one line of a Cloudera file).
- The log's name (gateway, access, application) does not matter as long as the HTTP fields are present.

## Log fields

### Required

| SADE field | Meaning | Auto-detected names (examples) |
|---|---|---|
| `timestamp` | Request time (ISO 8601 with time zone, or epoch seconds or milliseconds) | `@timestamp`, `_time`, `timestamp`, `observed_at_epoch` |
| `method` | HTTP method | `method`, `http.request.method`, `request_method` |
| `path` | Request path | `request_path`, `url.path`, `uri`, `request.uri` |
| `status` | Response status code | `status`, `status_code`, `http.response.status_code` |

Events without the required fields are skipped.

### Recommended

| SADE field | What it adds | Auto-detected names (examples) |
|---|---|---|
| `service` | Group APIs by service | `service.name`, `service`, `kubernetes.labels.app` |
| `request_id` | Link logs of the same request | `request_id`, `trace_id`, `correlation_id` |
| `hop_id` | Link both sides of one service-to-service call | `hop_id` |
| `event_type` | Inbound or outbound | `event_type`, `span.kind`, `direction` |
| `destination` | External destination | `destination.address`, `upstream_host` |
| `client_ip` | Caller address | `client_ip`, `source.ip`, `remote_addr` |
| `duration_ms`, `response_bytes` | Latency, size | `duration_ms`, `bytes_sent` |
| `request_headers`, `response_headers` | Auth scheme, headers | `request.headers` |
| `request_body`, `response_body` | Field specs, sensitive data detection | `request.body`, `response_body` |

- Headers and bodies are optional. When missing they are shown as not captured; SADE does not assume they were empty or free of personal data.
- Bodies may be JSON objects, arrays or JSON strings.

### Field mapping {#field-mapping}

- **Auto-detect (default)**: tries the names above on the imported events, checks the value types and picks the best match.
  Names from Elastic ECS, OpenTelemetry, Envoy, NGINX JSON, Kong and Splunk CIM are included.
- **Manual**: enter the field **path**, not a value.
    - Example: for `{"http":{"method":"GET"}}`, enter `http.method` for Method.
- **Log profile (optional)**: a JSON file with company-specific names, tried before the generic names.

```json
{
  "field_aliases": { "path": ["req.full_path"], "service": ["app_name"] },
  "client_event_types": ["egress_call"]
}
```

## Splitting logs into services {#routing}

Choose under **Service** in the connection settings.

| Option | Behavior | When to use |
|---|---|---|
| Assign later | Unassigned | No spec registered yet |
| A specific service | All logs of this connection go to one service | Indexes or paths are already split per service |
| All services, by path prefix | The path prefix decides the service (e.g. `/orders` → orders) | One gateway log mixes several services |
| All services, by logged service name | The service field in the log decides | Logs carry a service name |

- Services are registered in **Connect > Specifications** (name, base URL, path prefix, OpenAPI).
- Logged service values are matched against service IDs, aliases and internal host names (`*.svc`, `*.internal`, ...).
- Calls that match no service are shown as Unassigned.

## When one call is logged more than once

- Inbound and outbound events with the same `hop_id` are merged into one call.
- Without `hop_id`, events are merged only when request ID, method, path and status all match. Similar timestamps alone never merge calls.

## Security and storage

- Tokens are stored apart from settings in the SADE server database and are never shown or exported.
- A stored token is not reused if the endpoint or auth mode changes.
- TLS certificates are always verified. Use a CA file for company certificates; there is no option to disable verification.
- Header and body values are shown as types (`<string>`, ...). See [Masking and retention](../operations/masking.md).

## Limits

| Item | Limit |
|---|---|
| Data per read | 10 MB per connection (larger results fail instead of being analyzed partially) |
| Request timeout | 90 seconds |
| Registrations | 100 services, 100 log connections |
