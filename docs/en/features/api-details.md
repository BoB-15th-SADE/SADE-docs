# API details

Select an API in Inventory to inspect its declarations, implementation, calls and sensitive data in the right-hand panel.

## Tabs

| Tab | Contents |
|---|---|
| Overview | Sources, observed authentication, traffic and sensitive types |
| Fields | Request/response fields, types, Spec / Code / Log and sensitive labels |
| Code | Implementation file/line, gateway forwarding and code calls |
| Sensitive data | Locations, fields, types, field/value matching and inspection states |
| Calls | Retained calls and specification differences |

## Request and response fields

Fields separates requests and responses. Responses group specification and observed structure by status code and offer **Example / Schema** views. An example may come from the specification or be generated as a placeholder; it is not necessarily an original runtime value.

A source check marks a field found in that source. An empty cell can also mean the source was not collected or scanned. Use Not in code / Only in code to review implementation differences.

## Authentication evidence

Bearer, Basic, API key and Cookie describe authentication information seen in logs or specifications. A recorded credential does not prove that the server enforces authentication or accepted that credential.

## Sensitive fields

**Field matched** and **Value matched** are independent evidence. Specifications and code provide field meaning; supported checks on log values can provide value evidence. See [sensitive data detection](sensitive-data.md) for supported formats and states.

The panel loads a single API on demand. Reopen it after a loading error; use [Call History](call-history.md) for the retained cross-API call list.
