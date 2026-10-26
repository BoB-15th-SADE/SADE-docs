# API 인벤토리

**APIs › Inventory**는 서비스별 API 목록입니다. 명세·코드·로그에서 찾은 API를 하나로 합치고, 각각 어디서 확인했는지 표시합니다.

## 보는 순서

<div class="sade-steps" markdown>

1. 서비스 목록에서 서비스를 고릅니다. 서비스마다 API 수, 민감정보가 있는 API 수, 호출 여부가 보입니다.
2. API 목록에서 메서드·경로, 근거(`Spec` / `Code` / `Log`), 인증 방식, 공개 범위, 민감정보를 확인합니다.
3. 위쪽 탭, 필터, 검색으로 좁힙니다. 예: Shadow만, 민감정보 후보가 있는 것만
4. API를 누르면 [API 상세](api-details.md)가 열립니다.

</div>

## 탭과 필터

| 탭 | 보이는 것 |
|---|---|
| All | 이 서비스의 모든 API |
| Sensitive | 민감정보 후보가 있는 API |
| Shadow | 명세가 있는 서비스에서 명세에 없는 호출이 보인 API |

필터로 **Method**, **Access type**(공개 범위), **Service**를 좁힐 수 있고, 검색창에 경로 일부를 넣어 찾을 수 있습니다.

## 읽을 때 주의할 점

- **Not logged**는 "폐기된 API"가 아닙니다. 수집 기간에 안 쓰였을 뿐일 수 있습니다.
- 명세만 있는 서비스는 호출 수나 값 관측이 없습니다. 명세는 선언입니다.
- 호출 수는 수집한 전체 로그 기준입니다. 대용량 Splunk 소스도 모든 호출을 셉니다.
- 같은 API가 경로 파라미터 이름만 다르면 하나로 합칩니다(`/users/{id}` = `/users/{userId}`).

경로가 이상하게 묶이거나 서비스가 잘못 나뉘면 [필드 매핑](../connect/logs.md#field-mapping)과 [서비스 배정](../connect/logs.md#routing), 서비스의 Path prefix를 먼저 확인하세요.

[<span class="q">궁금하신가요?</span><span class="t">`/orders/1024`를 `GET /orders/{id}`로 맞추고 Shadow API를 판단하는 방법</span><span class="arrow">→</span>](../technology/api-discovery.md){ .sade-curious }
