# code2flow: from code to call flow

Logs show only calls that happened. A settlement API that runs once a month may never appear during a collection window. SADE CodeScan reads code to find **which services an API can call and which databases it can touch**, filling the gaps logs leave.

## What it finds

| Kind | Examples | Output |
|---|---|---|
| Service-to-service HTTP calls | RestTemplate, WebClient·RestClient, Feign, Java HttpClient, .NET HttpClient·Refit, requests, axios, fetch, Go `http.Get` | `outbound_calls` |
| Call paths inside an API | Controller → Service → client method | `internal_call_paths` |
| Database access | Spring Data repository methods with entity and table | `database_access` |
| Gateway routing | Spring Cloud Gateway, Zuul, nginx, Kong, Kubernetes Ingress / HTTPRoute | `route-map.json` |

HTTP calls are found in Java·Kotlin, .NET, Python, Node.js and Go. Resolving addresses from configuration and database access start with **Spring Boot**. The dashboard's GitHub scan runs call analysis for every language (`scan --calls on`).

## How it works

<div class="sade-pipe" markdown>
<div markdown>**API entry point**<p>Controllers found by code2spec</p></div>
<div markdown>**Follow calls**<p>Method to method</p></div>
<div class="is-key" markdown>**Call sites**<p>HTTP clients, repositories</p></div>
<div markdown>**Resolve addresses**<p>Config files, Compose, gateway</p></div>
<div markdown>**Pick the target**<p>Link to a service and API</p></div>
</div>

<div class="sade-steps" markdown>

1. **Start at the API.** From each handler code2spec found, follow the methods it calls.
2. **Find call sites.** When the path reaches an HTTP client call or a Spring Data repository method, record the path up to it.
3. **Resolve the address.** When the URL is a setting such as `${order.base-url}/orders/{id}`, look up the value in `application*.yml`, properties, docker-compose and gateway or Ingress config. A `@ConfigurationProperties` class in a shared module is connected through the Maven/Gradle module graph.
4. **Pick the target.** Match the resolved address and path to an API of a scanned service. Through a gateway, apply its routing rules and follow on to the service that implements the API.

</div>

## Resolved versus candidate

| Status | Meaning | In Flows |
|---|---|---|
| resolved | Exactly one target | Dotted line (code call) |
| candidate | Several targets depending on profile or environment variables | No line; candidate list only |
| unresolved | Cannot be decided (dynamic URL and similar) | No line; "Links may be missing" |

Candidates are never drawn as confirmed lines. If several classes share a name and imports or dependencies cannot tell them apart, nothing is linked.

=== "Code"

    ```java
    @Service
    class CheckoutService {
      private final WebClient client;      // base-url: ${services.payment}
      Mono<Receipt> pay(Order o) {
        return client.post().uri("/payments").bodyValue(o).retrieve().bodyToMono(Receipt.class);
      }
    }
    ```
    ```yaml
    # application.yml
    services:
      payment: http://payment-service:8080
    ```

=== "Result"

    | Item | Value |
    |---|---|
    | Entry API | `POST /checkout` (order) |
    | Path | `CheckoutController.checkout` → `CheckoutService.pay` → `WebClient.post` |
    | Address evidence | `application.yml:3` (`services.payment`) |
    | Target | payment service `POST /payments` (resolved) |

## Database access

Following Spring Data repositories, CodeScan records **which API reads or writes which entity (table)**.

| Field | Content |
|---|---|
| `repository` | Name, method, file, line |
| `entity` | Entity name, table |
| `operation` | read, write, unknown |
| `datasource` | declared, candidate or unresolved, with evidence |

This does not prove the SQL that runs or the actual connection address. Real database access comes from PostgreSQL spans in [runtime flow](runtime-flow.md).

## Reading it with logs

| Code | Logs | Reading |
|---|---|---|
| Call present | Call seen | Implementation and real use agree |
| Call present | No call | Unused during the window, or rarely used (worth reviewing) |
| No call | Call seen | A call code analysis missed (dynamic address, unsupported library) |

## Limits

- Static relationships do not prove real calls, counts, executed SQL or the final deployed address.
- Database analysis starts with Spring Data repositories. Other database clients are not analyzed yet.
- gRPC and message queues (Kafka, RabbitMQ) are not analyzed.
- When analysis finishes only partly, `analysis.calls.status` is `partial`, and an empty list does not mean "no calls".
