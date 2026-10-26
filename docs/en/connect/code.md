# GitHub code scan

Pick GitHub repositories and SADE CodeScan finds **API specs**, **service-to-service HTTP calls**, **gateway routes** and **database access** in the source and registers them. Code is only read, never run or built.

| Language | Frameworks |
|---|---|
| Java · Kotlin | Spring MVC / WebFlux, JAX-RS, `@WebServlet` |
| Go | net/http, Gin, Echo, Chi, gorilla/mux, Fiber |
| Python | FastAPI, Flask (restx, restful, smorest), Django + DRF |
| Node.js | Express, NestJS, Next.js file routes |
| .NET | ASP.NET Core controllers, Minimal APIs |

## Before you start

- [ ] You have a GitHub fine-grained token with **Contents: Read-only** on the target repositories.
- [ ] For GitHub Enterprise Server, you know the server address, such as `https://github.company.com`.
- [ ] The SADE worker can reach GitHub over HTTPS and has `git` installed.
- [ ] SADE CodeScan is installed on the worker. The release image includes it.

!!! tip "Avoid tokens with write access"
    A classic token with `repo` scope works, but the screen shows a warning. A read-only fine-grained token is recommended.

## Scan

<div class="sade-steps" markdown>

1. Enter the token in **Connect › Source Code › GitHub**. SADE checks it with `GET /user` before saving.
2. Repositories the token can read are listed (up to 2,000). Pick the ones to scan (up to 50 at a time).
3. Click **Scan selected**. The worker fetches the default branch temporarily, scans it and deletes it right away. If one repository fails, the rest continue.
4. Check the services, APIs and calls found on each result row.

</div>

## Where results go

| Result | Stored in | Shown in |
|---|---|---|
| OpenAPI per service | Specifications (**From code**) | Inventory, API details |
| Code inventory | Source Code (`gh-owner-repo`) | API details › Code |
| Gateway routes | Source Code › Route maps (`...-routes`) | API details › Implementation, dashed lines in Flows |
| Service-to-service HTTP calls | Code inventory | Dotted lines in Flows, API details › Code |
| Spring Data database access | Code inventory | API details › Code |

Services are registered like this.

| Situation | Result |
|---|---|
| No service with the same ID | A new service is created with the code spec |
| A service created from the same repository | Replaced by the new scan |
| A service found only in logs, with no spec | The code spec is attached |
| A service with an uploaded spec | **Your spec is kept**; the code spec is stored separately |
| The same service name in another repository | Registered with the ID `repo-service` |

## Gateway routes {#gateway-routes}

Spring Cloud Gateway, Zuul, nginx, Kong and Kubernetes Ingress / HTTPRoute config in the repository is read into a route map that says which public path goes to which service.

- To attach the gateway's public spec, upload it in Specifications **with the gateway name as the service ID**, before or after the scan.
- Rules that cannot be carried over exactly, such as regex paths or targets set by environment variables, are counted as "not modelled" rather than guessed.
- If you disconnect a route map that came from a GitHub scan, rescans do not bring it back. Use **Restore** on the GitHub card.

## Reading results

| Label | Meaning |
|---|---|
| Code not scanned | No code is linked to this service. This does not mean "not in code" |
| Spec vs code › Difference | Spec and code declarations differ (field, type, required) |
| Spec vs code › Unresolved | The analyzer could not fully resolve the structure. Not counted as a difference |
| Code only | Field only in code. Not a problem by itself |
| Links may be missing | Addresses decided at runtime, or client libraries that are not read |

- A call in code does not mean it was made. Real calls and counts come from logs.
- Labels such as `Permission declared` come from the names of functions wrapped around a route. Whether they actually block a request is not tested.

## Token storage

The token is stored in the same separate area as connection tokens and never written to API responses, logs, job records or command lines. The worker passes it to SADE CodeScan only as an environment variable. **Disconnect** deletes the token. Specs and inventories already imported stay until you remove them.

[<span class="q">Curious?</span><span class="t">How a spec is built from code (code2spec)</span><span class="arrow">→</span>](../technology/code2spec.md){ .sade-curious }

[<span class="q">Curious?</span><span class="t">How service calls and database access are found in code (code2flow)</span><span class="arrow">→</span>](../technology/code2flow.md){ .sade-curious }
