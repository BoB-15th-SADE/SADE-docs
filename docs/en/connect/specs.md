# OpenAPI specs

Register services and their OpenAPI specs to see declared APIs, fields and sensitive data candidates even without logs. **Shadow APIs** (calls not in the spec) and the **per-call spec check** need a spec.

Supported files: **OpenAPI 3.0 / 3.1 JSON, up to 10 MB**

## Register

<div class="sade-steps" markdown>

1. Open **Connect › Specifications › Add service**.
2. Pick the spec JSON file. Name, ID, base URL and path prefix are prefilled from `info.title` and `servers`.
3. Check the values and click **Save**.
4. See the service and APIs in **APIs › Inventory**. Sensitive field classification updates in the background.

</div>

| Field | Meaning | Example |
|---|---|---|
| Name | Service name shown on screen | Order |
| ID | Identifier used to assign logs and link code | `order` |
| Base URL | Service base address. For identification only; SADE does not connect to it | `https://api.company.com/order` |
| Path prefix | Leading part present in real paths but not in the spec | `/order` |
| OpenAPI file | Optional. You can create the service first | `order.json` |

### Why the path prefix matters

Behind a gateway, real calls often look like `/order/orders/1` while the spec says `/orders/{id}`. Put `/order` in Path prefix and SADE strips it before matching. The same prefix also splits gateway logs by service ([Splitting logs by service](logs.md#routing)).

=== "With a prefix"

    | Log path | Service | Path matched to the spec | Result |
    |---|---|---|---|
    | `/order/orders/1` | order | `/orders/1` | `GET /orders/{id}` |
    | `/order/admin/debug` | order | `/admin/debug` | Not in the spec: shadow API |

=== "Without a prefix"

    | Log path | Service | Path matched to the spec | Result |
    |---|---|---|---|
    | `/order/orders/1` | (unassigned) | `/order/orders/1` | Nothing matches, so every call looks like a shadow API |

## Spec source labels

| Label | Meaning |
|---|---|
| File upload | A spec you uploaded |
| From code | A spec built by the GitHub code scan |
| No spec | Only the service exists, or it was found only in logs |
| Inferred draft | A draft built from observed traffic |

!!! note "A draft built from traffic is not a baseline"
    Judging traffic against a spec built from that same traffic always passes. Spec checks on draft specs are therefore **Not evaluated**. Upload the official contract to get results.

## With code scans

- A spec you uploaded is never overwritten by a GitHub rescan. The spec built from code is kept separately for comparison.
- When a gateway's public path differs from the backend path, the route map links them ([GitHub code scan](code.md#gateway-routes)).

## Reading the results

- Being in the spec does not mean an API is called or implemented. Use the **Spec / Code / Log** source tags in Inventory.
- Sensitive data found from spec field names is **Field matched**. Example values never produce **Value matched**.

[<span class="q">Curious?</span><span class="t">How log paths are matched to spec paths and shadow APIs are decided</span><span class="arrow">→</span>](../technology/api-discovery.md){ .sade-curious }
