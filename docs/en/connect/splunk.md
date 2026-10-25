# Connecting Splunk

SADE searches JSON HTTP logs stored in Splunk indexes through the Splunk Search REST API.

## Quick setup

1. Open **Connect → Log Sources → Splunk → Connect**.
2. Enter the HTTPS Search API URL, indexes, token and collection window.
3. Review service assignment and automatic field mapping.
4. Choose **Test connection**, then **Save**.
5. **Run scan** to collect/analyze logs and inspect Inventory.

The incremental Splunk evidence cache can contain original personal data and credentials. Read [masking and storage](../operations/masking.md) before collecting real traffic.

## What you need

| Item | Description |
|---|---|
| Search API URL | Search head management port reachable from the SADE server (e.g. `https://splunk.company.internal:8089`) |
| Indexes | Indexes that hold HTTP logs (up to 10) |
| Authentication token | A Splunk authentication token that can search those indexes |
| CA certificate (optional) | When Splunk uses a company certificate |

!!! warning "Not an HEC token"
    SADE needs an **authentication token with search permission**, not an HTTP Event Collector (HEC) token.
    Create it in Splunk Web under **Settings > Tokens** for a user whose role can search the indexes.

## Settings

### Connection

| Field | Required | Description |
|---|---|---|
| Name | Yes | Display name |
| Search API URL | Yes | Starts with `https://`; no credentials or query strings |
| Index | Yes | Comma separated (e.g. `api_gateway,service_access`) |
| Sourcetype | No | Use when one index mixes log formats |
| Authentication token | Yes | Needed for Test and Sync; leave blank to keep the stored token |
| CA certificate file | No | Path to a certificate inside the SADE project folder |

### Collection

| Field | Description |
|---|---|
| Time range | Last 1 hour, 24 hours, 7 days, 30 days, custom (From / To), Splunk time syntax |
| Earliest / Latest | Splunk syntax (`-24h@h`, `now`) or Unix timestamps |
| Schedule | Manual, every hour, every 6 hours, daily. Scheduled sources need Latest = `now` or a Unix timestamp |

### API analysis

- **Service**: how logs are split into services ([Splitting logs into services](logs.md#routing))

### Field mapping

- Auto-detect by default; the default timestamp is Splunk `_time`. ([Field mapping](logs.md#field-mapping))

## The search SADE runs

```text
search (index="api_gateway" OR index="service_access") sourcetype="..." | fields _time _raw _cd index
```

- The search is built only from the indexes and sourcetype you enter; users do not write SPL.
- Each result's `_raw` is parsed as a JSON event. Non-JSON events are skipped; if none are JSON the read fails.
- **Test connection** adds `| head 20` and reads 20 events. Zero events is still a successful search.

## Repeated collection

| Latest | On the next collection |
|---|---|
| `now` or relative | Searches from the previous end time minus 10 minutes up to now |
| Fixed Unix timestamp | Searches the same fixed range again (does not extend to now) |

- Overlapping results are de-duplicated by Splunk event ID (`_cd`) or event content.
- Up to the latest 10 MB of events per connection are kept in the SADE database; opening the dashboard never re-runs the search.
- A failed collection, or one whose settings changed midway, does not move the collection cursor.

## Common errors

| Message | Cause and fix |
|---|---|
| `Remote server returned HTTP 401` | Wrong or expired token. Create a new token |
| `Remote server returned HTTP 403` | No search permission on the index. Check the token user's role |
| `TLS failed: the server certificate is not trusted` | Company certificate. Set the CA certificate file |
| `Cannot reach the remote server (no response)` | Check address, port and firewall. If the search runs over 90 seconds, narrow the time range |
| `Decoded Splunk results exceed 10 MB` | Narrow the time range or filter by sourcetype |
| `Splunk returned only non-JSON events` | Choose an index or sourcetype whose `_raw` is JSON |

## Reference

- Splunk docs: [Search endpoint descriptions](https://help.splunk.com/en/splunk-enterprise/rest-api-reference/10.6/search-endpoints/search-endpoint-descriptions)
