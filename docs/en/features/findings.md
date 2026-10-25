# Findings

**Policy → Findings** reports differences established by the implemented specification checks. Detecting sensitive data is not itself treated as a policy violation.

## Implemented checks

| Check ID | Question | Failure evidence |
|---|---|---|
| `api_endpoint_documented` (SPEC-001) | Is the observed method/path in the baseline? | An observed API missing from the specification |
| `api_response_fields_documented` (SPEC-002) | Are captured JSON response fields documented? | Response fields missing from the schema |

## Review workflow

1. Complete Run scan.
2. Narrow Findings by check, service and state.
3. Read each API's evidence and explanation.
4. Open Fields and Calls in API details to inspect differences.
5. Correct specifications, assignment or mapping and scan again.

## States

- **Pass**: the inspected evidence satisfies this check.
- **Fail**: comparable evidence establishes a mismatch.
- **Not evaluated**: specification, observation, response schema/body or independent baseline is insufficient.

A traffic-derived specification cannot assess the same traffic's compliance. Response-field checks do not validate data types, required values, authorization or the legality of personal-data disclosure.
