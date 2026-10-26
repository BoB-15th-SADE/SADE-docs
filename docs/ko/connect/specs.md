# OpenAPI 명세

서비스와 OpenAPI 명세를 등록하면 로그가 없어도 선언된 API와 필드, 민감정보 후보를 볼 수 있습니다. 명세가 있어야 **Shadow API**(명세에 없는 호출)와 **호출별 명세 점검**이 동작합니다.

지원 파일: **OpenAPI 3.0 / 3.1 JSON, 최대 10 MB**

## 등록하기

<div class="sade-steps" markdown>

1. **Connect › Specifications › Add service**를 엽니다.
2. 명세 JSON 파일을 고릅니다. 파일의 `info.title`과 `servers`로 이름, ID, 기준 주소, 경로 접두사가 미리 채워집니다.
3. 채워진 값을 확인하고 **Save**를 누릅니다.
4. **APIs › Inventory**에서 서비스와 API를 확인합니다. 민감 필드 분류는 백그라운드에서 갱신됩니다.

</div>

| 항목 | 뜻 | 예시 |
|---|---|---|
| Name | 화면에 보이는 서비스 이름 | Order |
| ID | 로그 배정과 코드 연결에 쓰는 식별자 | `order` |
| Base URL | 서비스 기준 주소. 식별용이며 SADE가 접속하지 않음 | `https://api.company.com/order` |
| Path prefix | 실제 호출 경로에는 있지만 명세에는 없는 앞부분 | `/order` |
| OpenAPI file | 선택. 파일 없이 서비스만 먼저 만들 수 있음 | `order.json` |

### 경로 접두사가 중요한 이유

게이트웨이를 거치면 실제 호출은 `/order/orders/1`, 명세는 `/orders/{id}`인 경우가 많습니다. Path prefix에 `/order`를 넣으면 SADE가 앞부분을 떼고 명세와 맞춥니다. 같은 접두사로 게이트웨이 로그를 서비스별로 나누기도 합니다([로그를 서비스로 나누기](logs.md#routing)).

=== "접두사를 넣었을 때"

    | 로그 경로 | 서비스 | 명세와 맞출 경로 | 결과 |
    |---|---|---|---|
    | `/order/orders/1` | order | `/orders/1` | `GET /orders/{id}` |
    | `/order/admin/debug` | order | `/admin/debug` | 명세에 없음: Shadow API |

=== "접두사가 없을 때"

    | 로그 경로 | 서비스 | 명세와 맞출 경로 | 결과 |
    |---|---|---|---|
    | `/order/orders/1` | (배정 안 됨) | `/order/orders/1` | 명세와 맞지 않아 모두 Shadow로 보임 |

## 명세 출처 표시

| 표시 | 뜻 |
|---|---|
| File upload | 사용자가 올린 명세 |
| From code | GitHub 코드 스캔으로 만든 명세 |
| No spec | 서비스만 있거나 로그로만 발견됨 |
| Inferred draft | 수집한 트래픽 구조로 만든 초안 |

!!! note "트래픽으로 만든 초안은 기준이 아닙니다"
    트래픽으로 만든 명세에 같은 트래픽을 비교하면 당연히 항상 맞다고 나옵니다. 그래서 초안 명세의 명세 점검은 **Not evaluated**로 표시합니다. 공식 계약 명세를 올리면 판정합니다.

## 코드 스캔과 함께 쓸 때

- 사용자가 올린 명세는 GitHub 재스캔으로 덮어쓰지 않습니다. 코드에서 만든 명세는 따로 보관하고 비교에 씁니다.
- 게이트웨이의 공개 경로와 백엔드 구현 경로가 다르면 route map이 둘을 잇습니다([GitHub 코드 스캔](code.md#gateway-routes)).

## 읽을 때 주의할 점

- 명세에 있다고 실제로 호출되거나 구현되었다는 뜻은 아닙니다. Inventory의 **Spec / Code / Log** 출처 태그로 구분하세요.
- 명세 필드 이름으로 찾은 민감정보는 **Field matched**입니다. 예시 값으로 **Value matched**를 만들지 않습니다.

[<span class="q">궁금하신가요?</span><span class="t">로그 경로를 명세 경로에 맞추고 Shadow API를 판단하는 규칙</span><span class="arrow">→</span>](../technology/api-discovery.md){ .sade-curious }
