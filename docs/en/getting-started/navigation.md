# Finding your way

The left menu runs **connect → overview → explore APIs → rules**. Menu names are in English; you can switch to Korean in Settings.

| Menu | What it does | Guide |
|---|---|---|
| **Connect › Log Sources** | Connect and collect Splunk, Cloudera and log files | [Integration overview](../connect/logs.md) |
| **Connect › Specifications** | Register services and OpenAPI specs | [OpenAPI specs](../connect/specs.md) |
| **Connect › Source Code** | GitHub scans, code inventories, route maps | [GitHub code scan](../connect/code.md) |
| **Overview** | Summary of everything | |
| **Scans** | History and status of collections and scans | [Collection and scans](../operations/scans.md) |
| **APIs › Inventory** | APIs per service and their details | [API inventory](../features/inventory.md) |
| **APIs › Call History** | Recent calls, spec check, request flow | [Call history and request flow](../features/call-history.md) |
| **APIs › Sensitive Data** | APIs per sensitive data type | [Sensitive data](../features/sensitive-data.md) |
| **Flows** | Map of callers → gateways → servers → databases | [Service flows](../features/flows.md) |
| **Policy › Rules › Data Types** | Sensitive data types and rules | [Data types and rules](../policy/data-types.md) |
| **Policy › Rules › Access Scope** | Classify exposure by host and path | [Access scope](../policy/access-scope.md) |
| **Policy › Findings** | Policy violations | [Findings](../features/findings.md) |

Menu groups (APIs, Policy, Rules) collapse when you click them again.

## Labels you will see often

| Label | Meaning |
|---|---|
| `Spec` / `Code` / `Log` | The evidence that confirmed the API or field. Several can appear together |
| Shadow | A call not in the spec, on a service that has a spec |
| Not logged / Not scanned | Collected but no calls / not collected yet |
| Not evaluated, `—` | No evidence to judge. Not "fine" and not "none" |
| Partial | Only part was collected or linked; a reason is shown |
| Scan required | Inputs changed and Run scan is needed again |

## Three buttons

| Button | What it does | Contacts outside systems |
|---|---|---|
| **Collect now** | Fetch logs; update inventory, sensitive data and Flows | Yes |
| **Run scan** | Spec check on the stored collection | No |
| **Refresh** | Reload stored results | No |
