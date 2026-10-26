# SADE documentation

SADE lines up the **SIEM logs, API specs and source code** you already have into one API list, so you can see which APIs your company runs, what data they exchange and where requests go. It installs no agent in your services and does not intercept traffic.

<div class="sade-links" markdown>

[**Install and connect**<span>Install with Docker and connect your first log in about ten minutes.</span>](getting-started/quickstart.md)

[**Integration guide**<span>Connect Splunk, Cloudera, log files, OpenAPI and GitHub.</span>](connect/logs.md)

[**Using SADE**<span>How to read the inventory, sensitive data, service flows and spec checks.</span>](features/inventory.md)

[**Core technology**<span>How it works inside, from log normalization to code2spec and code2flow.</span>](technology/index.md)

</div>

## Questions it answers

| Question | Where to look |
|---|---|
| Which APIs do we really run, and which are missing from the spec? | [API inventory](features/inventory.md) |
| What personal or sensitive data does each API exchange? | [Sensitive data](features/sensitive-data.md) |
| Which services does one request pass through, and how far does it go? | [Service flows](features/flows.md), [Request flow](features/call-history.md) |
| Where do real calls differ from the spec? Which calls succeed without credentials? | [Call history and spec check](features/call-history.md) |

## Three kinds of evidence

| Evidence | Tells you | Keep in mind |
|---|---|---|
| **Log** | Real calls, counts, auth method, fields exchanged | Calls outside the collection window and bodies not logged are unknown |
| **Spec** | The requests and responses a service promises | Does not mean the API is called or implemented |
| **Code** | Implemented APIs, calls in code, declared auth checks | Does not prove it runs, or how often |

You can start with any one of them. A spec alone gives an API list and sensitive data candidates. Logs add real calls; code adds implementation and service-to-service calls. Every API and field carries a `Spec` / `Code` / `Log` tag showing where it came from.

## How it works

<div class="sade-pipe" markdown>
<div markdown>**Connect**<p>Splunk, Cloudera, files, OpenAPI, GitHub</p></div>
<div markdown>**Collect** (Collect now)<p>Read logs; store evidence with values removed</p></div>
<div class="is-key" markdown>**Analyze**<p>API identification, sensitive data, flows</p></div>
<div markdown>**Check** (Run scan)<p>Spec check on stored results</p></div>
</div>

- **Collect now** reads outside logs and updates the inventory, sensitive data and Flows. Set a schedule and it runs on its own.
- **Run scan** uses only stored results. It does not contact the SIEM again.
- Collected results keep **no raw body or header values.** Values become types such as `<string>`.

## Before you read results

SADE's findings are **evidence about what was observed**. Sensitive data, spec differences and shadow APIs are things to review; they do not automatically establish a legal violation or that every API is safe. Items without evidence show as "not observed" or "Not evaluated", never as "none". See [Scope and limits](reference/limitations.md).
