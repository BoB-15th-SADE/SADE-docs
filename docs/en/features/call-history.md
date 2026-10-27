# Call history and request flow

**APIs › Call History** shows the most recent collected calls. It picks out calls that need attention right away, such as personal data the spec does not declare going out in a response or calls that succeed without credentials, and lets you follow the path one request took.

## The list

| Column | Content |
|---|---|
| Time | Call time (in the viewer's time zone) |
| Request | Method and path, with CORS preflight and masked query marks |
| Status | Response status code |
| **Spec check** | Why it differs from the spec: Not in spec, Missing, Type differs, No credentials |
| Latency | Response time |

Filter by method, status class (2xx–5xx) and **Spec check** (Any mismatch, or one reason). Even one odd call among ten thousand is easy to find with the Spec check filter.

## Opening a call

Click a call to see its request and response in HTTP form.

```text
GET /backoffice/customers/{email} HTTP/1.1
user-agent: <string>
authorization: (empty)              ← No credentials

200
content-type: application/json
{
  "id": <string>,
  "phoneNumber": <string>           ← Not in spec
}
```

- Offending lines are red, with the reason attached.
- Values are not stored, so they show as types such as `<string>` and `<integer>`. Auth headers show their scheme, such as `<JWT>`; empty values show as `(empty)`.
- **Client** shows the original client and the previous hop together, for example `203.0.113.7 via 10.0.4.12`.

## Trace Details {#request-flow}

Click **Trace Details** in a call's details to open a screen for that request. When you come back, your list and filters are where you left them.

<div class="sade-steps" markdown>

1. Records linked to the same request, through gateway, services and database, appear as a **timeline** drawn from real span parent links and execution times.
2. Pick a span to see the sensitive data in its request and response and how it was captured.
3. What linked the records (trace, hop ID, request ID, SQL operation ID) is shown, and where links could not be made, the reason (missing parent, several candidates, conflict).
4. Switch to other stored request examples of the same API.

</div>

The same field type at several points does not mean the same value was passed along. Up to 1,000 records per request are shown; beyond that, when the chain breaks, or when timing is missing, it is marked **Partial**.

## What is kept

- The list holds the latest **1,000 calls** overall. Call counts on screen can be larger than the number of rows.
- Large Splunk sources keep only a few raw requests per API and status. Call counts and success and error totals cover everything.
- A call without a body shows "not captured". That does not mean the call had no fields.

[<span class="q">Curious?</span><span class="t">The rules for comparing each call with the spec</span><span class="arrow">→</span>](../technology/spec-check.md){ .sade-curious }

[<span class="q">Curious?</span><span class="t">How scattered log fragments are joined into the path of one request</span><span class="arrow">→</span>](../technology/runtime-flow.md){ .sade-curious }
