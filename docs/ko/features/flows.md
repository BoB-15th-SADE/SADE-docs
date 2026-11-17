# Flows

APIs > Flows는 클라이언트, 서비스, API, DB, 외부 목적지 사이의 연결을 그래프로 그립니다. 보안 담당자는 이 화면에서 입구(외부에서 닿는 서비스), 민감정보가 있는 곳, 입구에서 그곳까지의 경로를 찾습니다.

[![Flows 화면](../../assets/screens/flows.png){ loading=lazy }](../../assets/screens/flows.png)
<small>예시 화면 (가상 데이터)</small>

## 노드와 선

| 노드 | 뜻 |
|---|---|
| Clients | 로그에서 관측한 바깥 호출자. 출발지 IP로 Public, Partner, Internal을 나눕니다 |
| 서비스 | 요청을 처리하는 서비스. 같은 서비스의 다른 이름은 [Settings](../policy/access-scope.md#settings)에서 합칩니다 |
| DB | 코드나 로그에서 찾은 DB와 테이블 |
| 외부 목적지 | 기업 밖 주소(SaaS, 외부 API). 처음에는 하나로 묶여 있고, 펼치면 목적지별로 나옵니다 |

| 선의 근거 | 뜻 |
|---|---|
| Log | 로그에서 호출을 관측함. 선에 호출 수가 나옵니다 |
| Code | 코드에 호출이 선언됨. 대상을 확정하면 Resolved, 이름으로만 찾으면 Candidate |

선 하나에 Code와 Log가 함께 있으면 둘 다 표시합니다. 코드 근거만 있는 선은 호출이 관측되지 않은 선입니다.

## 화면 도구

| 도구 | 하는 일 |
|---|---|
| Find service or API | 서비스나 API 이름으로 노드를 찾습니다 |
| Explore Connections(연결 보기) | 고른 서비스나 API를 가운데 두고 Depth만큼 이어진 노드만 보여 줍니다. Show All(전체 보기)로 전체 지도로 돌아갑니다 |
| 서비스 패널 | 서비스를 누르면 그 서비스의 API, 주고받는 서비스, 서버, 민감 유형이 열립니다. View in Inventory는 그 서비스의 API 목록을 엽니다 |
| API Relations(API 관계) | API를 고르면 그 API가 직접 부르거나 불리는 관계와 DB 참조가 나옵니다 |
| Clients 패널 | 출발지 IP를 검색하고 Public, Partner, Internal 분류 근거를 봅니다. 정확한 IP, CIDR, 글자로 찾습니다 |
| External Paths via Sensitive Services | 민감정보를 다루는 서비스를 거쳐 외부 목적지로 가는 경로만 모아 봅니다 |
| Legend | 선과 노드 표시의 뜻 |

서비스 노드에 Public 표시가 있으면 밖에서 닿는 서비스입니다. 그 서비스의 API 하나라도 Access Scope가 Public이거나, Clients가 직접 부르는 경우입니다.

## 이렇게 씁니다

??? tip "밖에서 들어오는 입구 찾기"

    <div class="sade-steps" markdown>

    1. Clients 노드에서 나가는 선을 봅니다. 클라이언트가 직접 부르는 서비스가 입구입니다.

    2. 게이트웨이가 있는데 게이트웨이가 아닌 서비스로 Clients 선이 바로 이어지면 게이트웨이 우회 후보입니다.

    3. 그 서비스를 눌러 서비스 패널의 API 목록에서 Public API를 봅니다.

    </div>

??? tip "민감정보가 밖으로 나가는 경로 보기"

    <div class="sade-steps" markdown>

    1. External Paths via Sensitive Services를 엽니다.

    2. 민감 유형이 붙은 서비스에서 외부 목적지로 가는 경로가 모여 나옵니다.

    3. 외부 목적지를 펼쳐 목적지별로 봅니다. 선의 근거가 Log면 실제 호출을, Code면 코드에 선언된 호출을 뜻합니다.

    4. 경로 위의 API를 눌러 API 상세에서 어떤 필드가 민감한지 확인합니다.

    </div>

??? tip "API 하나의 주변 보기"

    <div class="sade-steps" markdown>

    1. Inventory나 API 상세에서 View in Flows(흐름에서 보기)를 누릅니다.

    2. 그 API의 서비스가 가운데 놓입니다. Depth를 1부터 늘려 가며 봅니다.

    3. API Relations에서 그 API가 직접 부르는 서비스, DB 테이블을 확인합니다.

    </div>

??? tip "출발지 IP 확인하기"

    <div class="sade-steps" markdown>

    1. Clients를 눌러 Clients 패널을 엽니다.

    2. Search source IPs에 IP나 대역(예: `203.0.113.0/24`)을 넣습니다.

    3. 그 IP가 Public, Partner, Internal 중 어디로 분류됐는지와 근거를 봅니다. 기업 대역이 Public으로 잡혔다면 [Access Scope](../policy/access-scope.md)에 대역을 넣습니다.

    </div>

## 제한

- 그래프는 여러 요청을 모은 집계입니다. 이어진 선이 요청 한 건의 실제 경로(trace)와 같다고 보지 않습니다.
- 민감 라벨은 분류 결과입니다. 값이 실제로 전달됐는지는 확인하지 않습니다. 라벨이 없다고 민감정보가 없다는 뜻은 아닙니다.
- 선 두께와 호출 수는 서비스 사이 방향별 합계입니다. API 쌍별 실행 횟수는 따로 세지 않습니다.
- DB 선의 읽기, 쓰기는 API 필드로 추정한 방향입니다. SQL 실행은 확인하지 않습니다.
- 노드나 연결이 너무 많으면 일부만 그리고 잘림을 표시합니다. Explore Connections로 범위를 좁힙니다.
- 실행 중에 정해지는 주소처럼 대상을 확정하지 못한 호출은 Unresolved로 남습니다.
