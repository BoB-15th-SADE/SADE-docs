# Methods overview

SADE's methods start from one question: **how accurately can API assets and personal data flows be rebuilt from material the company already has?** Instead of new appliances or agents, logs, specs and code are matched on the same API unit, each filling the gaps of the others.

Each method solves a separate problem. Companies hold different material, so you can apply only the methods you need, or adapt some to your environment.

## The whole path

<div class="sade-pipe" markdown>
<div markdown>**Collect**<p>Logs from SIEMs and data lakes, code from repositories, specs</p></div>
<div markdown>**Normalize**<p>Different log formats into one shape</p></div>
<div class="is-key" markdown>**Identify APIs**<p>Match real paths to spec and code APIs</p></div>
<div markdown>**Analyze**<p>Sensitive data, spec differences, service flows</p></div>
<div markdown>**Store**<p>Values removed, results kept</p></div>
</div>

## Methods by problem

| Security problem | Method | Input |
|---|---|---|
| Log formats differ by company and device, so analysis cannot start | [Log normalization and field detection](log-normalization.md) | Logs |
| Bulk SIEM logs are hard to move into an analysis tool | [Large-scale SIEM collection](siem-collection.md) | Logs |
| APIs missing from the spec (shadow APIs) are invisible | [API discovery and shadow APIs](api-discovery.md) | Logs + specs + code |
| Nobody knows which APIs exchange personal data | [Sensitive data detection](sensitive-data.md) | Logs + specs + code |
| Specs are missing or stale | [code2spec](code2spec.md) | Code |
| Service calls and database access that never reached the logs | [code2flow](code2flow.md) | Code |
| One request cannot be traced across services and databases | [Runtime flow reconstruction](runtime-flow.md) | Logs |
| Calls that send data the spec does not declare, or succeed without auth | [Per-call spec check](spec-check.md) | Logs + specs |
| The analysis tool itself becoming a personal data store | [Value-free storage](value-free-storage.md) | All |

## How the three inputs fill each other's gaps

| Input | Tells you | Cannot tell you | Filled by |
|---|---|---|---|
| **Logs** | Real calls, counts, auth method, fields exchanged | Calls outside the window, bodies not logged | Code (possible paths), specs (field definitions) |
| **Specs** | Promised request and response shapes | Whether called or implemented | Logs (real calls), code (implementation) |
| **Code** | Implemented APIs, called services, database access | Whether it runs, and how often | Logs (whether and how often) |

Every API and field records which input confirmed it as `Spec` / `Code` / `Log`. Missing evidence shows as "not confirmed" or "Not evaluated", never as "none".

## Reference implementation and extension

At the end of each method page, **Scope and extension** lists what this implementation covers and how to widen it the same way. All extension points are collected in [Extending for your environment](extending.md).

## Principles

- **No guessing.** With several candidates nothing is linked; an unresolvable path stays "unresolved".
- **No execution.** Code is only read. SADE sends no requests to your services.
- **No stored values.** Anything needing a value finishes in memory; only types and results are stored.
- **Recomputable.** After a rule change, stored results can be reanalyzed, and the same input gives the same result.
