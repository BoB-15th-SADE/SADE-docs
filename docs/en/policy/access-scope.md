# Access scope

**Policy → Rules → Access Scope** labels APIs Internal / Public / Partner / Unknown using host and path patterns. It does not configure firewalls or server authorization.

## Quick setup

1. Choose **Add scope rule**.
2. Enter a Rule name.
3. Set Host pattern and Path pattern as regular expressions.
4. Select a Scope and save.
5. Inspect the updated analysis. Run scan if Scan required remains.

| Setting | Example | Meaning |
|---|---|---|
| Rule name | Internal APIs | Management label |
| Host pattern | `^api\.internal\.example$` | Match the internal host |
| Path pattern | `^/admin(?:/.*)?$` | Match the administration path |
| Scope | Internal | Classification label |

Broad patterns can classify unrelated APIs. Review overlapping rules against representative hosts and paths.

## Interpretation

Public is not a network test proving Internet reachability. Partner does not legally identify a third-party organization or verify consent. Interpret scope labels separately from sensitive-data detection and specification checks.
