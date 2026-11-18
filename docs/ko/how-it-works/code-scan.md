# 코드 스캔

code-worker가 GitHub 저장소의 커밋 하나를 읽어 API, 서비스 사이 호출, DB 접근, 게이트웨이 경로, 인증 선언을 찾습니다. 코드를 실행하거나 빌드하지 않고 소스와 설정 파일만 읽습니다.

<div class="sade-pipe" markdown>
<div markdown><span class="sade-pipe-title">커밋 고정</span>브랜치 최신 커밋</div>
<div markdown><span class="sade-pipe-title">파일 읽기</span>GitHub API</div>
<div markdown><span class="sade-pipe-title">설정 해석</span>Spring, compose</div>
<div class="is-key" markdown><span class="sade-pipe-title">코드 분석</span>API, 호출, 인증 선언</div>
<div markdown><span class="sade-pipe-title">결과</span>Inventory, Flow, OpenAPI</div>
</div>

## 1. 읽는 파일

| 파일 | 찾는 것 |
|---|---|
| `**/src/main/java/**/*.java` | Controller, DTO, Service, HTTP 클라이언트, Repository, 보안 어노테이션 |
| `pom.xml`, `build.gradle(.kts)`, `settings.gradle(.kts)` | 모듈 관계, 서비스 이름 후보. 빌드 스크립트는 실행하지 않습니다 |
| `src/main/resources/{,config/}application*.{yml,yaml,properties}` | `spring.application.name`, context path, DB 주소, 다른 서비스 주소, 게이트웨이 라우트 |
| docker compose 파일과 참조한 `.env`, Dockerfile | 서비스 이름, 네트워크 별칭, 환경 변수 |
| `CODEOWNERS` (`.github/`, 루트, `docs/`) | API 담당 후보 |

- 읽지 않는 것: `src/test`, `target`, `build`, `.gradle`, 의존성 파일
- 읽지 못한 파일(권한, 크기 한도, Git LFS, 서브모듈, 심볼릭 링크)은 스캔 이슈로 남깁니다. 조용히 빼지 않습니다.
- 설정 파일 안의 비밀번호, 토큰은 저장하지 않습니다. 주소에서 호스트, 포트, DB 이름만 남깁니다.

## 2. 서비스 이름

`spring.application.name`과, compose에서 그 모듈로 넘기는 `SPRING_APPLICATION_NAME`에서 후보를 모읍니다.

값이 하나로 정해지면 그 값을 씁니다. 프로필에 따라 이름이 갈리면 정하지 않고 이슈로 남깁니다.

## 3. API와 필드

| 읽는 선언 | 결과 |
|---|---|
| `@RestController`, `@Controller` | API를 찾을 클래스 |
| `@RequestMapping`, `@GetMapping`, `@PostMapping`, `@PutMapping`, `@PatchMapping`, `@DeleteMapping` | 메서드와 경로. 여러 메서드, 경로 조합은 각각 API로 만듭니다 |
| 파라미터(`@PathVariable`, `@RequestParam`, `@RequestHeader`, `@RequestBody`), 반환 타입 | 요청, 응답 필드와 타입 |
| DTO, record, enum, Jackson 이름 설정, 검증 어노테이션 | 필드 구조, 직렬화 이름, 필수 여부 |

- 경로 상수는 문자열과 단순 `+` 연결까지 계산합니다. 더 복잡한 식은 해석하지 못한 것으로 남깁니다.
- 외부 라이브러리 타입처럼 소스가 없는 타입은 `unresolved`로 남기고 필드 비교에서 뺍니다.
- 핸들러 코드를 찾지 못한 API는 Source Code 스캔 결과 탭의 미확인 Handler에 셉니다.

## 4. 인증 선언

| 읽는 선언 | 위치 |
|---|---|
| `@PreAuthorize`, `@PostAuthorize`, `@Secured`, `@RolesAllowed`, `@PermitAll`, `@DenyAll` | Controller 클래스, 메서드, Controller에서 부르는 Service 메서드 |

- 선언 이름, 인자, 파일과 줄을 그대로 남깁니다.
- 선언이 하나 이상이면 "선언됨"입니다. `@PermitAll`도 선언으로 셉니다. 인증 없이 허용(`permitAll`)이면서 변경 메서드인 공개 API는 관리 우선순위의 M 신호가 됩니다.
- 선언이 없으면 "모름"입니다. 전역 보안 설정에서 막고 있을 수 있어 "인증 없음"으로 보지 않습니다.
- `SecurityFilterChain`의 경로별 규칙(`requestMatchers`)은 API별 선언으로 연결하지 않습니다 [확인 필요].

## 5. 서비스 사이 호출

Controller 핸들러에서 시작해 Service 메서드를 따라가며 HTTP 호출을 찾습니다.

| 클라이언트 | 읽는 것 |
|---|---|
| RestTemplate | `getForObject`, `getForEntity`, `postForObject`, `postForEntity`, `put`, `delete`의 메서드와 주소 |
| RestClient | `.get()`, `.post()` 등과 `.uri(...)` |
| WebClient | `.method(...)`, `.uri(...)` |
| OpenFeign | `@FeignClient`의 이름, 주소와 메서드 매핑 |
| JDK HttpClient | `send`, `sendAsync`에 넘긴 `HttpRequest`의 메서드와 주소 |

### 호출 대상의 확정 수준

| 표시 | 뜻 |
|---|---|
| Resolved | 코드와 설정으로 목적지 서비스를 확인함 |
| Candidate | 후보가 하나 있지만 연결 근거가 모자람(예: 경로만 같은 API) |
| Unresolved (Not resolved) | 목적지를 모르거나 후보가 여럿. 환경 변수, 설정 서버로 정해지는 주소 |

- 주소는 Spring 설정, compose 서비스 이름과 네트워크 별칭에 대조합니다.
- `${DB_URL}` 같은 식은 선언일 뿐 실제 호스트로 보지 않습니다. 기본값(`${KEY:default}`)은 후보로만 둡니다.
- 대상 서비스 코드가 같은 스캔에 없으면 내부 연결을 만들지 않고 외부 목적지로 둡니다.

## 6. 게이트웨이 경로

| 게이트웨이 | 읽는 설정 |
|---|---|
| Spring Cloud Gateway | `spring.cloud.gateway.routes`의 `uri`, `Path=` 조건, `StripPrefix`, `SetPath`, `RewritePath` 필터 |
| Zuul | `zuul.routes.*`, `zuul.prefix` |

- 경로 조건과 바꾸기 규칙을 해석한 라우트는 바깥 경로를 서비스 API에 연결하는 근거가 됩니다. [API 식별](api-identity.md)의 5단계에서 씁니다.
- 경로 조건이 여러 개이거나 해석하지 못하면 이슈(`GATEWAY_MATCH_UNRESOLVED`)로 남기고 추측하지 않습니다.
- 필터가 본문을 바꾸는지는 아직 분석하지 않습니다. Source Code의 게이트웨이 경로 탭에 "본문 전달 미분석"으로 표시합니다.

## 7. DB 접근

| 읽는 것 | 결과 |
|---|---|
| Spring Data Repository의 엔티티 타입 | Repository를 부르는 API와 DB 연결 |
| `@Table`에 적힌 테이블 이름 | 테이블 이름 |
| `@Query`의 정적 SQL, JPQL | 작업 종류와 테이블. 값은 지우고 매개변수로 바꿉니다 |
| JDBC 호출 | DB 연결 |
| 설정의 datasource 주소 | DB 노드 |

엔티티 클래스 이름으로 테이블 이름을 추측하거나, 메서드 이름으로 SQL을 만들지 않습니다.

## 8. 결과와 상태

스캔 한 번이 세 가지를 만듭니다.

| 결과 | 내용 |
|---|---|
| 코드 인벤토리 | API, 필드, 핸들러 위치, 인증 선언 |
| 코드 흐름 | 서비스, DB, 외부 HTTP 목적지 노드와 호출, 라우트, DB 접근 선. 선마다 파일과 줄 근거 |
| 서비스별 OpenAPI 3.1 | Specifications의 코드에서 만든 명세 탭. `info.title`은 서비스 이름 |

| 상태 | 뜻 | 이어지는 일 |
|---|---|---|
| 완료 | 정한 규칙을 끝까지 수행함 | 민감 판정 → 매핑 |
| 부분 완료 | 일부 파일이나 표현을 해석하지 못함. 빠진 위치를 이슈로 남김 | 민감 판정 → 매핑. 이슈가 가리키는 API는 필드 비교를 하지 않음 |
| 실패 | 커밋이나 필요한 파일을 얻지 못함 | 다음 작업을 만들지 않음. 매핑은 이전 결과를 씀 |

??? info "Owners 탭의 근거"

    - CODEOWNERS 규칙 중 핸들러 파일에 맞는 마지막 규칙의 담당자를 후보로 보여 줍니다. 근거 줄도 함께 보여 줍니다.
    - 핸들러 코드가 처음 들어온 커밋과 최근 바뀐 커밋을 GitHub 이력에서 찾아 보여 줍니다.
    - 커밋 작성자는 담당자와 다를 수 있습니다.
