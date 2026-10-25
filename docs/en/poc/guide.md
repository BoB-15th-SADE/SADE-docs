# PoC guide

Start with one service and a short log window. Review detection quality and evidence before expanding coverage.

## 1. Define scope

Choose services, gateways and a collection period. Use concrete success criteria: API identification, reviewed undocumented APIs, sensitive-field evidence and reasons for incomplete inspection. Do not define success as automatic regulatory certification.

## 2. Prepare inputs

| Input | Verify |
|---|---|
| OpenAPI | Independent contract versus code/traffic-derived draft |
| Code | Branch/commit, service mapping and gateway configuration |
| Logs | Time, method, path, status, service identity, body/header capture |
| Collection account | Read access to required repositories, indexes or HDFS paths |

## 3. Validate one complete path

1. Register the service and available specification/code.
2. Test the log connection and inspect field mapping.
3. Run scan.
4. Compare a known API's Spec / Code / Log and request/response fields.
5. Test expected positive and negative cases with synthetic sensitive values.
6. Change a rule and verify reclassification across its intended scope.

## 4. Review results

Record false positives/negatives with type, API, field path, source, expected result, actual result and evidence. Separate missing capture, unsupported formats and exceeded limits from detection failures. Do not mistake the 200 retained call records for the complete source traffic population.

## 5. Expand and hand over

Review service assignment, aliases and path prefixes before adding sources. Record the baseline commit, active rule version, collection range, workers, original-value cache and backup retention. Include [current limits](../reference/limitations.md) in the findings report.
