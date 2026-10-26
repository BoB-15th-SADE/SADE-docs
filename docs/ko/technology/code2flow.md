# code2flow: 코드에서 호출 흐름으로

로그는 실제로 일어난 호출만 보여 줍니다. 한 달에 한 번 도는 정산 API처럼 수집 기간에 호출되지 않은 경로는 로그로는 알 수 없습니다. SADE CodeScan은 코드에서 **"이 API가 어떤 서비스를 부르고, 어떤 DB에 접근할 수 있는지"**를 찾아 로그를 보완합니다.

## 찾는 것

| 종류 | 예 | 결과 위치 |
|---|---|---|
| 서비스 간 HTTP 호출 | RestTemplate, WebClient·RestClient, Feign, Java HttpClient, .NET HttpClient·Refit, requests, axios, fetch, Go `http.Get` | `outbound_calls` |
| API 안의 호출 경로 | Controller → Service → Client 메서드까지 | `internal_call_paths` |
| DB 접근 | Spring Data Repository 메서드와 엔티티·테이블 | `database_access` |
| 게이트웨이 라우팅 | Spring Cloud Gateway, Zuul, nginx, Kong, Kubernetes Ingress / HTTPRoute | `route-map.json` |

HTTP 호출은 Java·Kotlin, .NET, Python, Node.js, Go에서 찾습니다. 설정 파일로 주소를 푸는 정밀 경로 분석과 DB 접근은 **Spring Boot**가 첫 범위입니다. 대시보드의 GitHub 스캔은 모든 언어에 대해 실행합니다(`scan --calls on`).

## 어떻게 찾나

<div class="sade-pipe" markdown>
<div markdown>**API 시작점**<p>code2spec이 찾은 Controller</p></div>
<div markdown>**호출 따라가기**<p>메서드 → 메서드</p></div>
<div class="is-key" markdown>**호출 지점**<p>HTTP 클라이언트, Repository</p></div>
<div markdown>**주소 풀기**<p>설정 파일, Compose, Gateway</p></div>
<div markdown>**목적지 확정**<p>서비스·API에 연결</p></div>
</div>

<div class="sade-steps" markdown>

1. **API에서 출발합니다.** code2spec이 찾은 각 API 핸들러에서 시작해 호출하는 메서드를 따라갑니다.
2. **호출 지점을 찾습니다.** HTTP 클라이언트 호출이나 Spring Data Repository 메서드를 만나면 거기까지의 경로를 기록합니다.
3. **주소를 풉니다.** 호출 주소가 `${order.base-url}/orders/{id}`처럼 설정값이면 `application*.yml`, properties, docker-compose, 게이트웨이·Ingress 설정에서 값을 찾습니다. `@ConfigurationProperties` 클래스가 공용 모듈에 있어도 Maven/Gradle 모듈 관계로 연결합니다.
4. **목적지를 정합니다.** 풀린 주소와 경로를 스캔한 서비스의 API에 맞춥니다. 게이트웨이를 거치면 라우팅 규칙을 적용해 실제 구현 서비스까지 따라갑니다.

</div>

## 확정과 후보를 구분합니다

| 상태 | 뜻 | Flows 표시 |
|---|---|---|
| resolved | 목적지가 하나로 정해짐 | 점선 (코드 호출) |
| candidate | 프로파일·환경 변수에 따라 여러 목적지 가능 | 선을 긋지 않음. 후보 목록만 |
| unresolved | 동적 URL 등으로 정할 수 없음 | 선을 긋지 않음. "Links may be missing" |

후보는 확정 선으로 그리지 않습니다. 같은 이름의 클래스가 여러 개이고 import나 의존성으로 구분되지 않으면 연결하지 않습니다.

=== "코드"

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

=== "결과"

    | 항목 | 값 |
    |---|---|
    | 시작 API | `POST /checkout` (order) |
    | 경로 | `CheckoutController.checkout` → `CheckoutService.pay` → `WebClient.post` |
    | 주소 근거 | `application.yml:3` (`services.payment`) |
    | 목적지 | payment 서비스 `POST /payments` (resolved) |

## DB 접근

Spring Data Repository를 따라가 **어떤 API가 어떤 엔티티(테이블)를 읽거나 쓰는지**를 남깁니다.

| 필드 | 내용 |
|---|---|
| `repository` | 이름, 메서드, 파일, 줄 |
| `entity` | 엔티티 이름, 테이블 |
| `operation` | read, write, unknown |
| `datasource` | declared, candidate, unresolved와 근거 |

실행되는 SQL이나 실제 접속 주소를 증명하지는 않습니다. 실제 DB 접근은 [런타임 흐름](runtime-flow.md)의 PostgreSQL span으로 확인합니다.

## 로그와 함께 보면

| 코드 | 로그 | 해석 |
|---|---|---|
| 호출 있음 | 호출 보임 | 구현과 실제 사용이 일치 |
| 호출 있음 | 호출 없음 | 수집 기간에 안 쓰였거나 드물게 쓰이는 경로 (검토 후보) |
| 호출 없음 | 호출 보임 | 코드에서 못 찾은 호출 (동적 주소, 읽지 않는 라이브러리) |

## 한계

- 정적 관계는 실제 호출, 횟수, 실행 SQL, 최종 배포 주소를 증명하지 않습니다.
- DB는 Spring Data Repository가 첫 범위입니다. 다른 DB 클라이언트는 아직 분석하지 않습니다.
- gRPC, 메시지 큐(Kafka, RabbitMQ)는 분석하지 않습니다.
- 분석이 일부만 끝나면 `analysis.calls.status`가 `partial`이고, 빈 목록이 "호출 없음"을 뜻하지 않습니다.
