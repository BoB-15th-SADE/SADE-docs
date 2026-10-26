# 호출 기록과 요청 흐름

**APIs › Call History**는 수집한 호출 중 최근 기록을 보여 줍니다. 호출마다 명세와 다른 점을 표시하고, 호출 하나를 골라 그 요청이 거친 경로를 따라갈 수 있습니다.

## 목록

| 칸 | 내용 |
|---|---|
| Time | 호출 시각 (보는 사람의 시간대) |
| Request | 메서드와 경로. CORS preflight, 쿼리 가림 표시 |
| Status | 응답 상태 코드 |
| **Spec check** | 명세와 다른 이유: Not in spec, Missing, Type differs, No credentials |
| Latency | 응답 시간 |

필터로 메서드, 상태 코드(2xx~5xx), **Spec check**(Any mismatch 또는 이유별)를 고릅니다. 1만 건 중 한 건만 이상한 호출도 Spec check 필터로 바로 찾을 수 있습니다.

## 호출 하나 열기

호출을 누르면 요청과 응답이 HTTP 형태로 열립니다.

```text
GET /backoffice/customers/{email} HTTP/1.1
user-agent: <string>
authorization: (empty)              ← No credentials

200
content-type: application/json
{
  "id": <string>,
  "phoneNumber": <string>           ← Not in spec
}
```

- 문제가 된 줄은 빨간색으로 표시되고 이유가 붙습니다.
- 값은 저장하지 않으므로 `<string>`, `<integer>` 같은 타입으로 보입니다. 인증 헤더는 `<JWT>`처럼 방식으로, 빈 값은 `(empty)`로 보입니다.
- **Client**에는 원래 클라이언트와 바로 앞 구간 주소가 함께 보입니다. 예: `203.0.113.7 via 10.0.4.12`

## 요청 흐름 (Request flow) {#request-flow}

호출 상세에서 **Request flow**를 열면 그 요청에 연결된 기록 지점이 트리로 나옵니다.

<div class="sade-steps" markdown>

1. 게이트웨이, 서비스, DB까지 같은 요청으로 이어진 기록 지점이 순서대로 보입니다.
2. 지점마다 요청·응답의 민감 필드와 검사 범위가 함께 표시됩니다.
3. 잇는 근거(trace, hop ID, request ID)와 이을 수 없었던 이유(부모 누락, 후보 여럿, 충돌)가 표시됩니다.

</div>

여러 지점에서 같은 유형의 필드가 보여도 "같은 값이 전달됐다"는 뜻은 아닙니다. 요청 하나당 1,000개 기록 지점까지 보며, 넘거나 끊긴 경우 **Partial**로 표시합니다.

## 보관 범위

- 목록은 전체에서 최근 **1,000건**까지입니다. 화면의 호출 수가 목록 행 수보다 클 수 있습니다.
- 대용량 Splunk 소스는 API와 상태 코드마다 대표 요청 몇 건만 원본으로 남깁니다. 호출 수와 성공·오류 합계는 전체 기준입니다.
- 본문이 없는 호출은 "수집 안 됨"으로 보입니다. 필드가 없다는 뜻이 아닙니다.

[<span class="q">궁금하신가요?</span><span class="t">호출마다 명세와 비교하는 규칙</span><span class="arrow">→</span>](../technology/spec-check.md){ .sade-curious }

[<span class="q">궁금하신가요?</span><span class="t">흩어진 로그 조각으로 요청 하나의 경로를 잇는 방법</span><span class="arrow">→</span>](../technology/runtime-flow.md){ .sade-curious }
