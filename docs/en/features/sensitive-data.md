# Sensitive data detection

**APIs → Sensitive Data** groups related services and request/response APIs by sensitive-data type. Spec / Code / Log evidence for the same field is merged while declarations remain distinct from observed values.

## Quick access

1. Review types, categories, services and sources in Sensitive Data.
2. Select a type for the related APIs grouped by service.
3. Select an API to open its **Sensitive data** tab.
4. Read Location, Field, Field matched, Value matched and inspection states.
5. Adjust false positives through [Data Types](../policy/data-types.md) rules and exclusions.

## The 19 built-in types

| Category | Types |
|---|---|
| Personal data: 11 | NAME, EMAIL, PHONE, ADDRESS, RRN, FOREIGN_ID, CI, DI, DRIVER_LICENSE, PASSPORT, BIRTH_DATE |
| Financial and transaction data: 2 | ACCOUNT_NO, CARD_NO |
| Credentials and secrets: 6 | PASSWORD, ACCESS_TOKEN, REFRESH_TOKEN, API_KEY, SESSION_COOKIE, SECRET |

## Detection evidence

| Method | Purpose | Example |
|---|---|---|
| Field alias dictionary | Match normalized field names to aliases | `eml_addr` → EMAIL |
| Value profile | Check supported syntax, structure, dates and checksums | Card length and Luhn |
| Context rules | Inspect field paths and sibling field names | Accept `person.name`; exclude the NAME inference for `product.name` |
| Explicit semantics/schema | Use approved paths and OpenAPI declarations | Name and location of an `apiKey` security scheme |

Candidates are generated independently from multiple signals. Value checks do not require a field-name match first. Substrings containing `ci` or `di` do not establish those types. Classification is rule-based and uses no NLP or LLM.

## Field matched and Value matched

- **Field matched** records meaning, path or declaration evidence.
- **Value matched** means an actual log value passed a supported value-profile check.
- These are independent signals; one missing check does not invalidate the other.
- Specifications, code declarations and specification examples do not create runtime value observations.
- `—` means no recorded evidence, not absence of sensitive data or safety.

## Supported value checks

| Type | Scope and limits |
|---|---|
| EMAIL / PHONE | Supported email syntax / KR phone formats; not existence or ownership |
| CARD_NO | 13–19 digits and Luhn; not issuance |
| RRN / FOREIGN_ID | Birth date and number structure; not issuance or universal legacy checksums |
| PASSPORT | Supported KR ordinary M-series formats; not every country or passport type |
| BIRTH_DATE | Birth context and valid dates; future dates excluded |
| ACCOUNT_NO / DRIVER_LICENSE / CI / DI | Explicit field meaning; unsupported issuer-specific value checks remain UNSUPPORTED |
| PASSWORD / NAME / ADDRESS | Meaning/context; password complexity and Korean name length are not mandatory criteria |
| ACCESS_TOKEN / REFRESH_TOKEN | Explicit token roles, Bearer and supported JWT structure; no signature or authentication verification |
| API_KEY | Meaning/schema and supported GitHub PAT patterns; not every provider |
| SESSION_COOKIE / SECRET | Configured session cookies/field meaning or supported private-key containers; not every cookie or high-entropy string |

## Inspection and counting

Inspection covers JSON bodies, headers, queries, identifiable path parameters, cookies and URL-encoded forms, for requests and responses across HTTP status codes. Missing capture, parsing failures and exceeded limits have separate reasons.

COMPLETE means inspection completed for the **supplied evidence**, not that all original traffic was captured. Review PARTIAL / UNAVAILABLE and Unconfirmed fields. HIGH / MEDIUM / LOW are evidence grades, not probabilities or legal conclusions.

Type totals count unique APIs separately for request and response. They do not sum fields, sources or events. NULL, empty and masked values remain distinct from original-value observations.

[<span class="q">Curious?</span><span class="t">How the engine tells 19 types apart by name, context and value structure</span><span class="arrow">→</span>](../technology/sensitive-data.md){ .sade-curious }
