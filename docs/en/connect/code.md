# Source code and GitHub

SADE CodeScan reads API declarations, fields, HTTP client calls and gateway configuration. Registered results merge with logs and specifications by service and API.

## GitHub quick setup

1. Open the GitHub connection under **Connect → Source Code**.
2. Register a token that can read the target repositories. Set the server address for GitHub Enterprise Server.
3. Select repositories and choose **Scan selected**.
4. Wait for the background code scan, then inspect registered services, inventories and route maps.
5. Open **Code**, **Fields** and **Flows** for the evidence.

Select up to 50 repositories per job. The worker temporarily clones default branches and removes the clones afterward. A failed repository does not stop the others.

## Registered artifacts

| Artifact | Purpose |
|---|---|
| `inventory.json` | API declarations, fields, file and line evidence |
| Generated OpenAPI | Code-derived service specification; uploaded specifications remain separate |
| `route-map.json` | Public gateway path to backend implementation mapping |
| `calls.json` | HTTP targets and caller source locations |

New services can be created automatically. Uploaded specifications are preserved alongside code-generated ones. Completing a GitHub scan triggers sensitive-field reclassification, not an implicit log scan.

## Import local results

Register inventories and route maps in Source Code, or use [CLI](../reference/cli.md) commands `code-scan`, `code-import` and `route-import`. Map code service labels to the correct dashboard service IDs.

## Interpret the evidence

- **Code not scanned** means no connected code evidence; it differs from an API not found in analyzed code.
- Route maps show declared forwarding, not runtime execution.
- HTTP calls in code include file, line and library evidence. Dynamic addresses and unsupported clients may remain unresolved.
- Disconnecting a GitHub route map is remembered across rescans. Use **Restore** on the GitHub card to allow it again.

Read [API details](../features/api-details.md) and [service flows](../features/flows.md) to distinguish declarations, implementation and runtime observations.
