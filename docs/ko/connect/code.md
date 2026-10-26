# GitHub 코드 스캔

GitHub 저장소를 고르면 SADE CodeScan이 소스 코드에서 **API 명세**, **서비스 간 HTTP 호출**, **게이트웨이 라우팅**, **DB 접근**을 찾아 등록합니다. 코드를 실행하거나 빌드하지 않고 읽기만 합니다.

| 언어 | 프레임워크 |
|---|---|
| Java · Kotlin | Spring MVC / WebFlux, JAX-RS, `@WebServlet` |
| Go | net/http, Gin, Echo, Chi, gorilla/mux, Fiber |
| Python | FastAPI, Flask (restx, restful, smorest), Django + DRF |
| Node.js | Express, NestJS, Next.js 파일 라우트 |
| .NET | ASP.NET Core 컨트롤러, Minimal API |

## 시작하기 전에

- [ ] 대상 저장소에 **Contents: Read-only** 권한이 있는 GitHub fine-grained 토큰이 있습니다.
- [ ] GitHub Enterprise Server라면 서버 주소를 알고 있습니다. 예: `https://github.company.com`
- [ ] SADE worker에서 GitHub로 HTTPS 접속이 되고 `git`이 설치되어 있습니다.
- [ ] worker에 SADE CodeScan이 설치되어 있습니다. 배포 이미지에는 포함되어 있습니다.

!!! tip "쓰기 권한이 있는 토큰은 피하세요"
    `repo` 범위의 classic 토큰도 동작하지만 화면에 경고가 표시됩니다. 읽기 전용 fine-grained 토큰을 권장합니다.

## 스캔하기

<div class="sade-steps" markdown>

1. **Connect › Source Code › GitHub**에서 토큰을 넣습니다. SADE가 먼저 `GET /user`로 토큰을 확인한 뒤 저장합니다.
2. 토큰이 읽을 수 있는 저장소 목록이 나옵니다(최대 2,000개). 스캔할 저장소를 고릅니다(한 번에 최대 50개).
3. **Scan selected**를 누릅니다. worker가 기본 브랜치를 임시로 받아 스캔한 뒤 바로 지웁니다. 한 저장소가 실패해도 나머지는 계속합니다.
4. 결과 행에서 찾은 서비스, API, 호출 수를 확인합니다.

</div>

## 스캔 결과가 들어가는 곳

| 결과 | 들어가는 곳 | 화면 |
|---|---|---|
| 서비스별 OpenAPI | Specifications (**From code**) | Inventory, API 상세 |
| 코드 인벤토리 | Source Code (`gh-소유자-저장소`) | API 상세 › Code |
| 게이트웨이 라우팅 | Source Code › Route maps (`...-routes`) | API 상세 › Implementation, Flows 파선 |
| 서비스 간 HTTP 호출 | 코드 인벤토리 | Flows 점선, API 상세 › Code |
| Spring Data DB 접근 | 코드 인벤토리 | API 상세 › Code |

서비스 등록 규칙은 이렇습니다.

| 상황 | 결과 |
|---|---|
| 같은 ID의 서비스가 없음 | 새 서비스를 만들고 코드 명세를 붙임 |
| 같은 저장소에서 만든 서비스가 있음 | 새 스캔 결과로 바꿈 |
| 명세 없이 로그로만 생긴 서비스 | 코드 명세를 붙임 |
| 사용자가 명세를 올린 서비스 | **사용자 명세를 유지**하고 코드 명세는 따로 보관 |
| 다른 저장소에 같은 서비스 이름 | `저장소-서비스` ID로 등록 |

## 게이트웨이 라우팅 {#gateway-routes}

저장소의 Spring Cloud Gateway, Zuul, nginx, Kong, Kubernetes Ingress / HTTPRoute 설정을 읽어 "어떤 공개 경로가 어느 서비스로 가는지"를 route map으로 남깁니다.

- 게이트웨이의 공개 명세를 연결하려면 Specifications에서 **게이트웨이 이름을 서비스 ID로** 명세를 올립니다. 스캔 전후 어느 쪽이든 됩니다.
- 정규식 경로, 환경 변수로 정해지는 대상처럼 정확히 옮길 수 없는 규칙은 "not modelled"로 세고 추측하지 않습니다.
- GitHub 스캔에서 온 route map을 Disconnect하면 재스캔해도 다시 붙지 않습니다. GitHub 카드의 **Restore**로 되돌립니다.

## 결과 읽기

| 표시 | 뜻 |
|---|---|
| Code not scanned | 이 서비스에 연결된 코드가 없음. "코드에 없음"이 아님 |
| Spec vs code › Difference | 명세와 코드 선언이 다름 (필드, 타입, 필수 여부) |
| Spec vs code › Unresolved | 분석기가 구조를 끝까지 풀지 못함. 차이로 세지 않음 |
| Code only | 코드에만 있는 필드. 그 자체로 문제는 아님 |
| Links may be missing | 실행 중에 정해지는 주소나 읽지 않는 클라이언트 라이브러리가 있음 |

- 코드에 호출이 있다고 실제로 호출되었다는 뜻은 아닙니다. 실제 호출 여부와 횟수는 로그로 확인합니다.
- 권한 표시(`Permission declared` 등)는 라우트에 감싼 함수 이름으로 분류한 것입니다. 실제 차단 여부를 실행해 보지는 않습니다.

## 토큰 보관

토큰은 연결 토큰과 같은 별도 영역에 저장하고 API 응답, 로그, 작업 기록, 명령줄에 남기지 않습니다. worker는 SADE CodeScan에 환경 변수로만 넘깁니다. **Disconnect**하면 토큰을 지웁니다. 이미 가져온 명세와 인벤토리는 직접 지울 때까지 남습니다.

[<span class="q">궁금하신가요?</span><span class="t">코드에서 명세를 만드는 방법 (code2spec)</span><span class="arrow">→</span>](../technology/code2spec.md){ .sade-curious }

[<span class="q">궁금하신가요?</span><span class="t">코드에서 서비스 간 호출과 DB 접근을 찾는 방법 (code2flow)</span><span class="arrow">→</span>](../technology/code2flow.md){ .sade-curious }
