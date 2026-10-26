# Per-call spec check

When the spec and real responses disagree, access control and privacy reviews built on the spec miss things. A common case is a `phoneNumber` going out in a response the spec never mentions. SADE **compares each call with the spec** and marks the difference on that call.

## What it marks

| Mark | Meaning | Example |
|---|---|---|
| **Not in spec** | The response has a field the spec does not declare | `phoneNumber` in the response but not in the schema |
| **Missing** | A field the spec requires is absent | `required: [id]` but no `id` |
| **Type differs** | The type differs from the spec | Spec says `integer`, response has `"30"` |
| **No credentials** | The spec requires auth, and the call **succeeded** without it | `security: [bearer]`, no Authorization, 200 |

An API that is not in the spec at all is marked separately as a [shadow API](api-discovery.md#shadow).

## Rules

<div class="sade-steps" markdown>

1. **Only success responses are compared.** A 2xx body is compared with that status's response schema. Error bodies for 4xx and 5xx are rarely specified, so comparing them only adds noise.
2. **Fields are matched by path.** Nested objects and arrays are expanded into paths like `items[].price`. `$ref`, `allOf`, `anyOf` and `oneOf` are followed.
3. **Compatible types count as equal.** An integer value under a `number` schema is fine. `null` values and schemas with unknown type are not differences.
4. **Auth looks at the outcome.** If the auth header is empty but the server rejected the call with 401 or 403, it did its job and nothing is marked. **Only a 2xx success** is No credentials.
5. **No conclusions from partial data.** If the body only has a truncated list of field names, undeclared fields that are visible are marked, but Missing is not decided.

</div>

## Where it shows

| Screen | What you see |
|---|---|
| Call History | A **Spec check** column and filter per call (Any mismatch, Not in spec, Missing, Type differs, No credentials) |
| Call details | The offending lines in red (the `"phoneNumber": <string>` line, the `authorization: (empty)` line) |
| API details › Calls | The same column and filter, for this API's calls only |

=== "Response (spec has no phoneNumber)"

    ```text
    200
    content-type: application/json

    {
      "id": <string>,
      "email": <string>,
      "phoneNumber": <string>      ← Not in spec
    }
    ```

=== "Request (succeeded without auth)"

    ```text
    GET /backoffice/customers/{email} HTTP/1.1
    authorization: (empty)         ← No credentials
    ```

Values are not stored, so the screen shows types such as `<string>` ([Value-free storage](value-free-storage.md)).

## When nothing is checked

| Situation | Shown as |
|---|---|
| The service has no spec | Not checked |
| The spec is a draft built from traffic | Not evaluated (the baseline came from the same traffic) |
| The log has no response body | No field comparison. This does not mean "matches the spec" |
| The log has no auth header field at all | No auth decision |

## Relation to Run scan

The check runs on the stored collection. After you change a spec, **Run scan** recomputes it without contacting the SIEM again. Large SIEM sources are checked on samples per API and status, so a difference in one call out of ten thousand can be missed.
