# 서비스 흐름 (Flows)

**Flows**는 우리 환경을 **Clients → Gateways → Hosts → Destinations** 순서의 지도로 보여 줍니다. 누가 어느 게이트웨이를 거쳐 어느 서버의 서비스를 부르고, 어떤 DB에 닿는지 한눈에 봅니다. 요청 하나의 경로는 [요청 흐름](call-history.md#request-flow)에서 봅니다.

## 지도 읽기

| 열 | 뜻 |
|---|---|
| **Clients** | 로그에 찍힌 호출자. 외부 사용자뿐 아니라 이름이 없는 내부 호출자도 포함 |
| **Gateways** | 배포 정보, 이름, 라우팅 규칙으로 정한 게이트웨이 |
| **Hosts** | 수집된 호스트 정보로 묶은 서버·VM·Kubernetes 노드와 그 위의 서비스. 정보가 없으면 "Host not observed" |
| **Destinations** | span으로 확인한 PostgreSQL DB, 코드가 부르는 외부 호스트(스캔하지 않은 곳) |

같은 양 끝을 잇는 선은 하나로 합치고, 한 서버 안에서 도는 선은 숨깁니다. 선을 누르면 그 안에 묶인 API 연결과, 어떤 기록으로 이었는지가 나옵니다.

## 파고들기

<div class="sade-steps" markdown>

1. **Clients를 누르면** 호출자들이 진입 API와 뒤쪽 흐름별로 묶여 나옵니다. 같은 진입 API라도 뒤쪽 경로가 다르면 다른 묶음입니다.
2. **묶음 안의 IP를 누르면** 그 IP의 요청 경로만 서비스 단위로 펼쳐집니다.
3. **Hosts의 서비스를 누르면** 그 서비스로 들어오는 경로와 뒤쪽 작업만 남깁니다.
4. 오른쪽 패널의 **Trace**를 고르면 그 요청의 노드와 선만 강조됩니다. **Request details**로 요청 흐름 트리를 엽니다. **Environment**로 전체 지도로 돌아갑니다.

</div>

## LOG / SPEC / CODE

| 기준 | 원 | 선 |
|---|---|---|
| **LOG** | 로그·span에서 본 API | 실제 호출, 호출자, span 관계, DB 접근 |
| **CODE** | 코드에 있는 API | 코드의 HTTP 호출(점선), 게이트웨이 라우팅(파선) |
| **SPEC** | 명세에 있는 API | 없음. 명세에는 누가 부르는지가 없음 |

버튼은 화면만 바꿉니다. 수집이나 스캔을 다시 하지 않습니다. 코드 선은 "부를 수 있다"는 뜻이며 실제로 불렀는지는 LOG로 확인합니다.

## 정확하게 그리려면

필드별로 어디까지 그려지는지는 [로그 필드 레퍼런스](../connect/schema.md#levels)에서 직접 체크해 볼 수 있습니다.

| 가진 것 | 보이는 범위 |
|---|---|
| 게이트웨이 로그만 | 호출자 → 게이트웨이 → API |
| + 서비스 Access 로그, Application 로그 | 서비스 간 호출 (request ID 기준) |
| + trace (`traceparent` 또는 span) | 서비스 간 호출을 가장 정확하게 |
| + 호스트 정보 (`host.name`, `k8s.node.name`) | 서버별 배치 |
| + PostgreSQL span | DB 접근 |

## 한계

- 호출자로 쓰는 IP는 접속 IP(`client_ip`)입니다. X-Forwarded-For의 원래 클라이언트는 Call History에 따로 보입니다.
- 대용량 Splunk 소스는 API별 샘플 범위 안에서 흐름이 보입니다.
- 실행 중에 정해지는 주소, 읽지 않는 HTTP 라이브러리, 로그를 남기지 않는 서비스 때문에 선이 빠질 수 있습니다.
- gRPC와 메시지 큐는 다루지 않습니다.

[<span class="q">궁금하신가요?</span><span class="t">로그와 trace로 실제 호출을 잇는 방법</span><span class="arrow">→</span>](../technology/runtime-flow.md){ .sade-curious }

[<span class="q">궁금하신가요?</span><span class="t">코드에서 서비스 간 호출과 DB 접근을 찾는 방법</span><span class="arrow">→</span>](../technology/code2flow.md){ .sade-curious }
