# Sensitive data detection

SADE classifies the fields an API sends and receives into **19 types** of sensitive data. Looking only at names cannot tell whether `mobile` is a phone number or a device type; looking only at values mistakes order numbers for phone numbers. SADE records **name, context and value structure** as separate kinds of evidence, and notes what each one actually checked. It uses no NLP or LLM.

## One engine, many inputs

Spec declarations, code scan results, log bodies and the sample test on the Data Types screen all go through **the same detection path**. An `email` found in the spec and an `email` found in logs merge into one row, and a rule change reclassifies every input with the same rules.

<div class="sade-pipe" markdown>
<div markdown>**Expand locations**<p>Body, headers, query, path params, cookies, forms</p></div>
<div markdown>**Build candidates**<p>Aliases, value profiles, approved meanings, OpenAPI hints</p></div>
<div markdown>**Read context**<p>Field path and sibling fields</p></div>
<div class="is-key" markdown>**Check values**<p>Checksums, dates, number structure</p></div>
<div markdown>**Record evidence**<p>Field matched, Value matched, grade</p></div>
</div>

## The 19 built-in types

=== "Personal (11)"

    | Type | How the value is checked |
    |---|---|
    | NAME | Field meaning and context. Names are not extracted from free text |
    | EMAIL | The whole string must be a mail address (ASCII subset of WHATWG/RFC grammar) |
    | PHONE | Korean number format (based on libphonenumber KR metadata). Foreign numbers are recorded as unsupported |
    | ADDRESS | Field meaning and context. A postcode or city alone is not enough |
    | RRN (resident registration number) | Birth date and number structure |
    | FOREIGN_ID (alien registration number) | Birth date and number structure |
    | PASSPORT | Old and new Korean regular passport (M series) structure |
    | BIRTH_DATE | Birth-date context and a real calendar date, not in the future |
    | DRIVER_LICENSE | Field meaning |
    | CI, DI | Field meaning |

=== "Financial (2)"

    | Type | How the value is checked |
    |---|---|
    | CARD_NO | Length and Luhn checksum (the same approach as Presidio) |
    | ACCOUNT_NO | Field meaning. No reliable source for each bank's numbering, so values are not checked |

=== "Credentials and secrets (6)"

    | Type | How the value is checked |
    |---|---|
    | PASSWORD | Field meaning. Length and complexity are not used |
    | ACCESS_TOKEN, REFRESH_TOKEN | Fields with a stated role, `Bearer` parsing, JWT structure. Signatures are not verified |
    | API_KEY | Name and location from an OpenAPI `apiKey` scheme, explicit fields. Values: GitHub PAT format only |
    | SESSION_COOKIE | Known session cookie names (`JSESSIONID`, `PHPSESSID` and others) |
    | SECRET | Explicit secret fields, PEM/DER private key structure |

The 11 types with value checks share 9 validators. The other 8 are classified by field meaning, so SADE does not invent value rules it has no source for.

## Names and context

Each type has common aliases. PHONE, for example, includes `phone`, `phone_number`, `mobile`, `tel_no` and `hp_no`. Keys are normalized only for comparison (`phoneNumber` → `phone_number`); the original name and array position are kept.

Context comes from the field path and **the names of sibling fields in the same object**.

| Field | Siblings | Decision |
|---|---|---|
| `customer.name` | `email`, `phone` | Person context: NAME |
| `product.name` | `price`, `sku` | Product context: not NAME |
| `server.name` | `host`, `port` | Server context: not NAME |

A closer product, file or server context wins over a person context. Even in a product context, a value shaped like a mail address is still checked as EMAIL.

## Two checks: Field matched and Value matched

| Check | Meaning | Input it comes from |
|---|---|---|
| **Field matched** | The field name and context point to this type | Spec, code, logs |
| **Value matched** | A real value passed this type's structure check | Log values |

The checks are independent. Example values in a spec never produce Value matched. A `—` on screen means "no record", not "no sensitive data".

## Grades and value states

HIGH / MEDIUM / LOW describe **how strong the evidence is**. They are not probabilities or legal judgments.

Value states are kept apart too.

| State | Meaning | Counted as |
|---|---|---|
| PRESENT | A value is there | A value observation |
| MASKED, REDACTED | Hidden (`***`, `[REDACTED]`) | Counted for the type when the field meaning is clear; no value check |
| NULL, EMPTY | Empty | Not a value observation |
| UNKNOWN | Cannot tell | |

A lone `***` with no clear type never creates a finding. Fields whose values failed the check or did not fit are listed separately as **Unconfirmed fields**.

## Inspection limits

| Limit | Value |
|---|---|
| Body size | 1 MiB |
| JSON depth | 32 |
| Array items | 10,000 |
| String length | 16,384 characters |
| Fields per location | 30,000 |

Going over a limit, duplicate JSON keys, parse failures, unsupported formats and missing bodies are recorded with reason codes. Bodies of every HTTP status are inspected, and an error in one location does not stop the others. Free-text meaning, XML, binary and compressed bodies are never marked as fully inspected.

!!! note "Responses with dynamic keys"
    Some responses use data as object keys (`{"user@example.com": {...}}`). Such keys are masked rather than stored in the spec or field list.

## Managing rules and reclassifying

- **Policy › Rules › Data Types** lets you change aliases, approved field meanings, exclusions and custom value patterns per type. Custom patterns must match the whole value and cannot bypass a built-in checksum failure.
- Saving rules creates a version, and a light job (`privacy-refresh`) reclassifies everything from stored evidence. The SIEM is not contacted again.
- Results record the rule version and engine version. You can roll back to an earlier version.
- When a new value rule needs raw values, collect again, because raw values are not stored.

## Sources

Email follows WHATWG/RFC grammar, phone numbers follow libphonenumber Korean metadata, card numbers follow the Microsoft Presidio pattern plus Luhn, passport and alien registration numbers follow issuing-agency material, and tokens and cookies follow the OAuth, JWT and Cookie RFCs. Aliases and context rules are SADE policy; no academically validated accuracy figure is claimed.

## Scope and extension

The 19 built-in types are a starting point. Field names and in-house ID formats differ by company, so the security team can widen them directly in **Policy › Rules › Data Types**.

| Goal | How | Example |
|---|---|---|
| Add a company field name | Field name rule | `cust_mbl_no` → PHONE |
| Give meaning at one location | Field path rule | `$.member.contact` → EMAIL |
| Turn an in-house ID into a new type | New type + value pattern | `EMP-[0-9]{6}` → EMPLOYEE_ID |
| Exclude a false positive | Exclusion (reason and expiry) | `name` on one API |

New value checks such as checksums are added as validators. [Extending for your environment](extending.md)
