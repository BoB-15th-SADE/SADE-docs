# code2spec: 코드에서 명세로

Swagger 문서가 없거나 오래된 회사가 많습니다. SADE CodeScan은 **소스 코드만 읽어서** 서비스별 OpenAPI 3.1 명세를 만듭니다. 코드를 실행하거나 빌드하지 않고, 프레임워크의 명세 생성기(FastAPI `openapi()`, springdoc, drf-spectacular 등)에도 기대지 않습니다.

## 어떻게 읽나

<div class="sade-pipe" markdown>
<div markdown>**파싱**<p>tree-sitter로 구문 트리 생성</p></div>
<div markdown>**라우트 찾기**<p>프레임워크별 등록 방식</p></div>
<div class="is-key" markdown>**타입 따라가기**<p>요청·응답 DTO, 검증 규칙</p></div>
<div markdown>**근거 붙이기**<p>모든 결과에 파일·줄</p></div>
<div markdown>**OpenAPI 3.1**<p>서비스별 문서</p></div>
</div>

<div class="sade-steps" markdown>

1. **구문 트리로 읽습니다.** 언어마다 고정된 버전의 tree-sitter 문법으로 파싱합니다. 대상 코드를 import하거나 실행하지 않고, 네트워크도 쓰지 않습니다.
2. **라우트를 찾습니다.** Spring의 `@GetMapping("/orders/{id}")`, FastAPI의 `@app.get(...)`, Express의 `router.get(...)`, Go의 `r.HandleFunc(...)`처럼 프레임워크마다 API를 등록하는 방식을 읽습니다. 클래스 단위 경로와 메서드 단위 경로를 합칩니다.
3. **요청과 응답 타입을 따라갑니다.** 핸들러의 파라미터와 반환 타입에서 DTO 클래스를 찾아 필드를 펼칩니다. `@NotNull`, `@Size`, `Field(max_length=...)` 같은 검증 규칙은 `required`, `maxLength` 같은 JSON Schema 키워드로 옮깁니다.
4. **설명을 가져옵니다.** docstring, JSDoc, XML doc, 어노테이션 설명이 있으면 `description`으로 쓰고 출처를 표시합니다.
5. **근거를 붙입니다.** 모든 API, 파라미터, 스키마 필드에 `{file, line, rule}`을 남깁니다.

</div>

=== "Spring 코드"

    ```java
    @RestController
    @RequestMapping("/orders")
    class OrderController {
      @GetMapping("/{id}")
      OrderDto get(@PathVariable Long id) { ... }
    }
    record OrderDto(Long id, @NotNull String email, List<ItemDto> items) {}
    ```

=== "만들어진 명세 (일부)"

    ```json
    "/orders/{id}": {
      "get": {
        "parameters": [{"name": "id", "in": "path", "required": true, "schema": {"type": "integer"}}],
        "responses": {"200": {"content": {"application/json": {
          "schema": {"$ref": "#/components/schemas/OrderDto"}}}}}
      }
    }
    ```

## 추측하지 않는 원칙

정적 분석이 놓치는 경우는 반드시 있습니다. CodeScan은 모르는 것을 그럴듯하게 채우지 않고 **모른다고 표시**합니다.

| 상황 | 처리 |
|---|---|
| 경로가 실행 중에 만들어짐 | API로 세지 않고 `unresolved_routes`에 파일·줄과 함께 기록 |
| 타입을 끝까지 풀 수 없음 | 스키마에 `x-sade-unknown`과 이유 |
| 응답 본문을 찾지 못함 | 응답을 지어내지 않음. 응답 분석 상태를 `unresolved`로 남김 |
| 어노테이션에만 있는 상태 코드 | 본문 유무를 `unconfirmed`로 남김 |

그래서 코드 명세를 다른 명세와 비교할 때 **Unresolved**는 차이로 세지 않습니다.

## 지원 범위

| 언어 | 프레임워크 |
|---|---|
| Java · Kotlin | Spring MVC / WebFlux (어노테이션), JAX-RS, `@WebServlet` |
| Go | net/http, Gin, Echo, Chi, gorilla/mux, Fiber |
| Python | FastAPI, Flask (+restx, restful, smorest), Django + DRF |
| Node.js | Express, NestJS (JS·TS), Next.js 파일 라우트 |
| .NET | ASP.NET Core 컨트롤러, Minimal API |

한 저장소에 여러 언어가 있어도 한 번에 스캔합니다. 테스트, 빌드 결과, 의존성 폴더는 기본으로 제외합니다.

## 결과물

| 파일 | 내용 |
|---|---|
| `openapi/{서비스}.json` | 순수 OpenAPI 3.1. 분석용 확장 정보와 소스 위치를 뺀 문서 |
| `code_inventory.json` | API, 근거, 분석 상태, 서비스 간 호출, DB 접근 ([code2flow](code2flow.md)) |
| `route-map.json` | 게이트웨이 라우팅 규칙 |

## 명세와 비교하기

사용자가 올린 명세가 있으면 코드 명세와 필드 단위로 비교합니다. 요청 본문과 성공 응답(2xx, 없으면 `default`)만 비교합니다.

| 결과 | 뜻 |
|---|---|
| Match | 이름과 (비교할 수 있으면) 타입이 맞음 |
| Difference | 필드 없음, 타입, 필수 여부, 제약이 다름 |
| Code only | 코드에만 있는 필드. 그 자체로 문제는 아님 |
| Unresolved | 분석기가 구조를 풀지 못함. 차이로 세지 않음 |

Go의 포인터 필드(`anyOf [X, null]`)는 "null일 수 있는 X"로 봅니다. 게이트웨이 API는 route map을 따라가 **실제로 구현한 서비스의 코드**와 비교합니다.

## 한계

- 정적 분석이라 실제 배포 여부, 외부 접근 가능 여부를 증명하지 않습니다. 실제 호출은 로그로 확인합니다.
- 리플렉션이나 실행 중 등록, 사내 공통 요청 파서는 설정(`generic_body_decoders`)이 없으면 놓칠 수 있습니다.
- 권한 검사는 라우트에 감싼 함수 이름으로 분류합니다(Permission, Auth, RateLimit). 미들웨어를 실행해 보지 않으므로 실제 차단 여부는 확인하지 않습니다.
- 선택적으로 Noir, Semgrep이 설치돼 있으면 놓친 API 후보를 교차 확인할 수 있습니다.
