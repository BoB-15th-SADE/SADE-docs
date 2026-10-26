# code2spec: from code to spec

Many teams have no Swagger document, or one that is out of date. SADE CodeScan builds an OpenAPI 3.1 spec per service **by reading source code only**. It does not run or build the code, and it does not depend on framework spec generators such as FastAPI `openapi()`, springdoc or drf-spectacular.

## How it reads code

<div class="sade-pipe" markdown>
<div markdown>**Parse**<p>tree-sitter syntax trees</p></div>
<div markdown>**Find routes**<p>Per-framework registration</p></div>
<div class="is-key" markdown>**Follow types**<p>Request and response DTOs, validation</p></div>
<div markdown>**Attach evidence**<p>File and line on every result</p></div>
<div markdown>**OpenAPI 3.1**<p>One document per service</p></div>
</div>

<div class="sade-steps" markdown>

1. **Parse into syntax trees.** Each language uses a pinned tree-sitter grammar. The target code is never imported or run, and no network is used.
2. **Find routes.** SADE reads how each framework registers an API: Spring `@GetMapping("/orders/{id}")`, FastAPI `@app.get(...)`, Express `router.get(...)`, Go `r.HandleFunc(...)`. Class-level and method-level paths are joined.
3. **Follow request and response types.** DTO classes are found from handler parameters and return types and expanded into fields. Validation such as `@NotNull`, `@Size` or `Field(max_length=...)` becomes JSON Schema keywords like `required` and `maxLength`.
4. **Bring in descriptions.** Docstrings, JSDoc, XML doc and annotation text become `description`, with the source marked.
5. **Attach evidence.** Every API, parameter and schema field gets `{file, line, rule}`.

</div>

=== "Spring code"

    ```java
    @RestController
    @RequestMapping("/orders")
    class OrderController {
      @GetMapping("/{id}")
      OrderDto get(@PathVariable Long id) { ... }
    }
    record OrderDto(Long id, @NotNull String email, List<ItemDto> items) {}
    ```

=== "Generated spec (excerpt)"

    ```json
    "/orders/{id}": {
      "get": {
        "parameters": [{"name": "id", "in": "path", "required": true, "schema": {"type": "integer"}}],
        "responses": {"200": {"content": {"application/json": {
          "schema": {"$ref": "#/components/schemas/OrderDto"}}}}}
      }
    }
    ```

## No guessing

Static analysis always misses something. CodeScan does not fill gaps with plausible guesses; it **marks what it does not know**.

| Situation | Handling |
|---|---|
| Path built at runtime | Not counted as an API; recorded in `unresolved_routes` with file and line |
| Type cannot be fully resolved | `x-sade-unknown` and a reason in the schema |
| Response body not found | No invented response; response analysis is `unresolved` |
| Status code only in an annotation | Body presence recorded as `unconfirmed` |

That is why **Unresolved** never counts as a difference when a code spec is compared with another spec.

## Supported frameworks

| Language | Frameworks |
|---|---|
| Java · Kotlin | Spring MVC / WebFlux (annotations), JAX-RS, `@WebServlet` |
| Go | net/http, Gin, Echo, Chi, gorilla/mux, Fiber |
| Python | FastAPI, Flask (+restx, restful, smorest), Django + DRF |
| Node.js | Express, NestJS (JS and TS), Next.js file routes |
| .NET | ASP.NET Core controllers, Minimal APIs |

A repository with several languages is scanned in one pass. Tests, build output and dependency folders are excluded by default.

## Output

| File | Content |
|---|---|
| `openapi/{service}.json` | Plain OpenAPI 3.1, without analysis extensions and source locations |
| `code_inventory.json` | APIs, evidence, analysis status, service calls, database access ([code2flow](code2flow.md)) |
| `route-map.json` | Gateway routing rules |

## Comparing with your spec

If you uploaded a spec, it is compared with the code spec field by field. Only request bodies and success responses (2xx, or `default` when there is none) are compared.

| Result | Meaning |
|---|---|
| Match | Name and, where comparable, type agree |
| Difference | Missing field, or different type, required flag or constraint |
| Code only | Field only in code. Not a problem by itself |
| Unresolved | The analyzer could not resolve the structure. Not counted as a difference |

A Go pointer field (`anyOf [X, null]`) is read as "X that may be null". Gateway APIs are followed through the route map and compared with **the code of the service that implements them**.

## Limits

- Static analysis does not prove that an API is deployed or reachable. Use logs for real calls.
- Reflection, runtime registration and in-house request parsers can be missed without configuration (`generic_body_decoders`).
- Auth checks are classified by the names of functions wrapped around a route (Permission, Auth, RateLimit). Middleware is not executed, so whether it actually blocks a request is not verified.
- If Noir or Semgrep is installed, they can cross-check for missed API candidates.
