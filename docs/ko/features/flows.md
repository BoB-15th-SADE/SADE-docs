# 서비스 흐름 (Flows)

**Flows**는 우리 환경을 **Clients → Gateways → Hosts → Destinations** 순서의 지도로 보여 줍니다. 외부에서 들어온 요청이 어느 게이트웨이와 서버를 거쳐 어떤 DB에 닿는지, 그 사이에 어떤 개인정보가 오가는지 한눈에 봅니다. 공격 경로를 추적하거나 개인정보 처리 흐름을 점검할 때 출발점으로 씁니다. 요청 하나의 경로는 [Trace Details](call-history.md#request-flow)에서 봅니다.

## 지도 읽기

| 열 | 뜻 |
|---|---|
| **Clients** | 로그에 찍힌 호출자. 외부 사용자뿐 아니라 이름이 없는 내부 호출자도 포함 |
| **Gateways** | 배포 정보, 이름, 라우팅 규칙으로 정한 게이트웨이 |
| **Hosts** | 수집된 호스트 정보로 묶은 서버·VM·Kubernetes 노드와 그 위의 서비스. 정보가 없으면 "Host not observed" |
| **Destinations** | DB 로그로 확인한 PostgreSQL DB, 코드가 부르는 외부 호스트(스캔하지 않은 곳) |

같은 양 끝을 잇는 선은 하나로 합치고, 한 서버 안에서 도는 선은 숨깁니다. 선을 누르면 그 안에 묶인 API 연결과, 어떤 기록으로 이었는지가 나옵니다.

## 파고들기

<div class="sade-steps" markdown>

1. **Clients를 누르면** 호출자들이 진입 API와 뒤쪽 흐름별로 묶여 나옵니다. 같은 진입 API라도 뒤쪽 경로가 다르면 다른 묶음입니다.
2. **묶음 안의 IP를 누르면** 그 IP의 요청 경로만 서비스 단위로 펼쳐집니다.
3. **Hosts의 서비스를 누르면** 그 서비스로 들어오는 경로와 뒤쪽 작업만 남깁니다.
4. 오른쪽 패널의 **Trace**를 고르면 그 요청의 노드와 선만 강조됩니다. **Trace Details**로 그 요청의 타임라인을 엽니다. 그래프 빈 곳을 누르면 전체 지도로 돌아갑니다.
5. 노드는 드래그로 옮길 수 있고, 선은 노드를 피해 다시 그려집니다. 화면 맞춤(**Fit to screen**)과 배치 초기화(**Reset layout**) 버튼이 따로 있습니다.

</div>

## 민감정보 표시 (Sensitive Data) {#data-flow}

상단의 **Sensitive Data** 버튼을 켜면, 실제 로그에서 확인한 민감정보 유형이 그래프 위에 나타납니다. 개인정보가 어느 서비스에서 어느 서비스로, 요청과 응답 중 어느 방향으로 오가는지 볼 수 있습니다.

| 표시 | 뜻 |
|---|---|
| 노드의 숫자 | 그 서비스에서 확인한 민감정보 유형 수 |
| 선의 라벨 | 요청 방향과 응답 방향을 나눠 표시 |
| 선을 누르면 | 필드 경로, 보낸 쪽·받은 쪽 수집 지점, 필드 이름으로 판단했는지 값 형식으로 판단했는지 |

- Trace를 고르면 그 요청에서 확인한 유형만 표시합니다.
- 명세·코드에만 있는 필드나 분류 후보는 표시하지 않습니다.
- 양쪽에 같은 유형이 보여도 같은 값이 전달됐다는 뜻은 아닙니다.

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
| + trace (`trace_id`·`span_id` 또는 `traceparent`) | 서비스 간 호출을 가장 정확하게 |
| + 호스트 정보 (`host.name`, `k8s.node.name`) | 서버별 배치 |
| + DB 로그 (PostgreSQL, 애플리케이션 SQL) | DB와 테이블 접근 |

## 한계

- 호출자로 쓰는 IP는 접속 IP(`client_ip`)입니다. X-Forwarded-For의 원래 클라이언트는 Call History에 따로 보입니다.
- 대용량 Splunk 소스는 API별 샘플 범위 안에서 흐름이 보입니다.
- 실행 중에 정해지는 주소, 읽지 않는 HTTP 라이브러리, 로그를 남기지 않는 서비스 때문에 선이 빠질 수 있습니다.
- gRPC와 메시지 큐는 다루지 않습니다.

[<span class="q">궁금하신가요?</span><span class="t">로그와 trace로 실제 호출을 잇는 방법</span><span class="arrow">→</span>](../technology/runtime-flow.md){ .sade-curious }

[<span class="q">궁금하신가요?</span><span class="t">코드에서 서비스 간 호출과 DB 접근을 찾는 방법</span><span class="arrow">→</span>](../technology/code2flow.md){ .sade-curious }
