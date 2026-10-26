# Large-scale SIEM collection

An enterprise SIEM holds millions of HTTP log events a day. Copying all of them into SADE would mean building a second SIEM, and memory and disk would not keep up. SADE **counts every call but keeps only a few raw requests per API**.

## The idea

| What you need to know | Data needed | What SADE does |
|---|---|---|
| Which APIs were called and how often, first and last call, auth method mix, shadow APIs | The **count** of every call | Reads everything, stores only rollups |
| What real requests looked like, undeclared fields, sensitive values, the path of one request | A few **raw** requests | Stores a few recent requests per API and status |

The raw logs stay in your SIEM. SADE takes only what it needs to decide.

## How a collection runs

<div class="sade-pipe" markdown>
<div markdown>**Split into windows**<p>60-minute windows</p></div>
<div markdown>**Stream the search**<p>One export per window, line by line</p></div>
<div markdown>**Hold the edge**<p>Last 60 s carried to the next window</p></div>
<div class="is-key" markdown>**Rollup + samples**<p>Call counts and a few raw requests</p></div>
<div markdown>**Checkpoint**<p>Read up to here</p></div>
</div>

### 1. Windows, read line by line

The collection range (for example the last 7 days) is cut into 60-minute windows, with one Splunk export search per window. Results are processed as they arrive, one line at a time, so the full response is never held in memory and there is no response size limit.

### 2. Busy windows split themselves

Traffic is uneven. A few thousand events an hour can turn into tens of thousands in minutes during a sale or an outage. When a window passes 50,000 events, SADE stops, halves the window and reads again, down to one minute. However bursty the traffic, about 50,000 events sit in memory at once.

!!! info "Split windows are not parsed"
    Parsing happens after a window is fully read. A window that gets split is dropped without spending time on parsing.

### 3. Keeping requests whole across window edges

Gateway and service logs for the same request carry slightly different times. If one is at 10:59:59.9 and the other at 11:00:00.1, they land in different windows and **one call is counted twice**.

When any event of a request falls in the last 60 seconds of a window, SADE carries **all of that request's events** to the next window, where they meet their partner and merge into one call. The final window of the range is counted in full.

=== "Without the hold"

    | Event | Time | Window | Result |
    |---|---|---|---|
    | Service log | 10:59:59.8 | 10:00 window | 1 call |
    | Gateway log | 11:00:00.1 | 11:00 window | 1 call |
    | | | | **2 calls (wrong)** |

=== "With the hold"

    | Event | Time | Handling | Result |
    |---|---|---|---|
    | Service log | 10:59:59.8 | Held: the request has an event in the last 60 s | |
    | Gateway log | 11:00:00.1 | Merged with the held partner in the 11:00 window | |
    | | | | **1 call** |

### 4. Rollups and samples

Each window is assigned to services with **the same rules analysis uses**, and gateway and service events of one request are merged into one call. Then two things are built.

**Rollup items**
: One per (service, method, path shape, status, auth method, caller …), holding the call count and the first and last call time. Path shapes group `/orders/1024` and `/orders/77` under `/orders/{id}`, so the number of items stays small.

**Samples**
: Five raw requests per (service, method, path shape, status). Recent windows come first; within a window, requests with the **smallest hash of their request ID** win. The hash is the same whichever log it is computed from, so the request picked from the gateway log and the one picked from the service log are the same request. Sampled requests keep their full path.

### 5. How analysis treats them

| Item | Call counts, auth stats | Call History, spec check, sensitive values, Flows |
|---|---|---|
| Rollup item | Counted `_count` times | Not used |
| Sampled request | Not counted (already in the rollup) | Used |

No call is counted twice, and the numbers on screen still cover all traffic.

### 6. Checkpoints and resuming

- Each finished window moves the "read up to here" mark. The next collection starts there, so no window is counted twice.
- If a middle window fails, finished windows are saved and the status is Partial. The next collection resumes at the failed window. If the first window fails, the previous data stays as it was.
- When events are held at an edge, the checkpoint stops at the hold line (60 seconds before the window end). If the run stops there, the next one reads the held events again.
- When Latest is `now`, SADE reads up to 5 minutes before now, so events indexed late are picked up next time. Events indexed more than 5 minutes late can be missed.

## Verification

We computed results twice from the same logs, once with rollup and samples and once storing every event, and compared them.

| Data | Compared | Differences |
|---|---|---|
| 16,000 YAS log events | Calls per API, first and last call, auth stats, shadow APIs, total calls, success and error counts | 0 (also 0 after a save and reload) |
| 60,000 YAS log events, forced window splits | Same as above (209 APIs, 33,474 calls) | 0 |

For volume, 232,292 YAS events (104 MB) were served from a local HTTPS server that answers like Splunk export.

| | Old way (one response) | Windowed collection |
|---|---|---|
| Result | Failed above 10 MB | All 94 windows collected |
| Stored | | 130,402 calls, 209 APIs, 8.4 MB batch |
| Peak memory | | About 380 MB |
| Recollecting the same range | | 0 new windows, 0.3 s, no change in numbers |

## Limits

- Call History, the spec check, value-based sensitive data detection and Flows work **on samples**. A field sent in one call out of ten thousand can be missed.
- Every raw event is still transferred and counted in SADE. At hundreds of millions of events a day the transfer gets large; pre-aggregating in the SIEM is being considered as the next step.
- App log and trace sources need every event for matching, so they are stored in full rather than rolled up (up to 200,000 events).
- Testing against a real enterprise Splunk server is in progress.
