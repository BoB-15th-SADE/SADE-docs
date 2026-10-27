# Splunk

SADE fetches JSON HTTP logs from Splunk indexes through the Search REST API. You enter three values: **address, token and index**.

## Before you start

Go through this with your Splunk admin. Click an item to tick it.

- [ ] The SADE server can reach the search head's management port (default `8089`) over HTTPS.
- [ ] You know the index names that hold the logs. Separate several with commas (up to 10).
- [ ] You have an auth token that **can search** those indexes. This is not the HEC token used to send logs in.
- [ ] Events in the index have JSON in `_raw`. Text events must be converted to JSON at ingestion.
- [ ] (With internal certificates) The CA certificate file is in `certs/` in the SADE install folder.

!!! warning "Not the HEC token"
    An HTTP Event Collector token can only **send** logs. SADE needs an **auth token** for a user with search permission.

## 1. Prepare Splunk

=== "Search-only role"

    Create a role for SADE that can search only the indexes it needs.

    1. In **Settings › Roles › New Role**, create a role such as `sade_reader`.
    2. Under **Capabilities**, enable `search`.
    3. Under **Indexes**, allow only the target indexes, such as `api_gateway` and `service_access`.
    4. Create a user with only this role, such as `sade`.

=== "Auth token"

    1. In **Settings › Tokens**, make sure token authentication is enabled.
    2. Under **New Token**, choose the `sade` user.
    3. Set an expiry and copy the token. It is not shown again once you leave the page.

=== "Network"

    - The path SADE server → Splunk search head `:8089` (HTTPS) must be open.
    - Splunk Cloud may need the SADE address on the management port allow list.
    - If the search head certificate does not match the address you connect to, TLS verification fails. Use a certificate that includes the address.

## 2. Connect in SADE

<div class="sade-steps" markdown>

1. Open **Connect › Log Sources › Splunk › Connect**.
2. Enter three values.

    | Field | Example |
    |---|---|
    | Search API URL | `https://splunk.company.internal:8089` |
    | Index | `api_gateway,service_access` |
    | Authentication token | The token you created |

3. Click **Test connection**. It runs the same search with `| head 20` to check 20 events. Zero events still counts as success if permission is there.
4. Click **Save connection**.
5. Click **Collect now** in the Log Sources list. Progress shows on the source row and in Scans.

</div>

Everything else works with defaults. Change them only when you need to.

| Default | Where to change |
|---|---|
| Range: last 24 hours | Collection › Time range (1 hour, 7 days, 30 days, custom, Splunk time syntax) |
| Schedule: manual | Collection › Schedule (hourly, every 6 hours, daily) |
| Connection name: `Splunk · index` | Advanced › Connection name |
| Service matching: path prefix (when services exist) | Advanced › Service matching ([Splitting logs by service](logs.md#routing)) |
| All sourcetypes | Advanced › Sourcetype, when one index mixes formats |
| Auto-detect fields, time from `_time` | Advanced › Field mapping |
| System trusted certificates | Advanced › Private CA certificate |

## The search SADE sends

```text
search (index="api_gateway" OR index="service_access") sourcetype="..." | fields _time _raw _cd index
```

- The search is built only from the indexes and sourcetype you entered. You never write SPL, and no other search runs.
- It is sent to `POST /services/search/v2/jobs/export` and the response is read line by line.
- Events whose `_raw` is not JSON are skipped. If none are JSON, the collection fails.

## How a collection runs

<div class="sade-pipe" markdown>
<div markdown>**Split into windows**<p>The range is cut into 1-hour windows</p></div>
<div markdown>**Search each window**<p>One search per window, read line by line</p></div>
<div class="is-key" markdown>**Rollup + samples**<p>Every call counted; a few raw requests per API</p></div>
<div markdown>**Checkpoint**<p>Records finished windows</p></div>
</div>

- **Volume is fine.** There is no response size limit. A window with more than 50,000 events is halved and read again.
- **Counts cover everything.** Call counts, first and last call, auth stats and shadow APIs use every event.
- **Only a few raw requests are kept.** Five recent requests per API and status are kept for Call History, the spec check, value-based sensitive data and Flows.
- **It resumes.** The next collection starts at the checkpoint, so no window is counted twice. After a failure, finished windows are saved and the next run continues from there.
- **Late events are caught.** When Latest is `now`, SADE reads up to 5 minutes before now and picks up the rest next time.

[<span class="q">Curious?</span><span class="t">Windows, edge handling, rollups and samples, and the verification results</span><span class="arrow">→</span>](../technology/siem-collection.md){ .sade-curious }

## Schedule

Set Schedule to hourly, every 6 hours or daily and the worker collects automatically, each time reading only what came after the last checkpoint. Scheduled collection needs Latest to be `now` or a fixed Unix time. It runs as long as the worker runs, with or without a dashboard tab open.

Collection updates the inventory, sensitive data and Flows. The spec check updates when you click **Run scan**.

## Common errors

| Message | Cause | Fix |
|---|---|---|
| `Remote server returned HTTP 401` | Wrong or expired token | Issue a new token |
| `Remote server returned HTTP 403` | No search permission on the index | Allow the index on the token user's role |
| `TLS failed: the server certificate is not trusted` | Internal certificate | Set a CA certificate in advanced settings |
| `TLS failed: the server certificate does not match this address` | Certificate name differs from the address | Connect with a name in the certificate |
| `Cannot reach the remote server (no response)` | Address, port, firewall | Check the path to `8089`. If the search gives no first response for 90 s, shorten the range |
| `Splunk returned only non-JSON events` | `_raw` is not JSON | Pick a JSON index or sourcetype |
| `One window has more than 500,000 events` | Too many events even in a 1-minute window | Narrow by sourcetype |
| `Stopped after N of M windows` | A middle window failed | Fix the cause and click Collect now. It resumes at the failed window |

## Notes

- Window length (60 minutes) and samples per API (5) are not on the screen. If needed, set `window_minutes` (5–1440) and `samples_per_api` (1–100) on the source through the HTTP API.
- Testing against a real enterprise Splunk server is still in progress. It was verified with 232,292 YAS events on a mock export server.
- Splunk documentation: [Search endpoint descriptions](https://help.splunk.com/en/splunk-enterprise/rest-api-reference/10.6/search-endpoints/search-endpoint-descriptions)
