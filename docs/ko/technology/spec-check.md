# 호출별 명세 점검

명세와 실제 응답이 다르면, 명세만 믿고 만든 접근 통제와 개인정보 검토가 빗나갑니다. 예를 들어 명세에는 없는 `phoneNumber`가 응답에 실려 나가는 경우입니다. SADE는 **호출 하나하나를 명세와 비교**해서 어디가 다른지 그 호출에 표시합니다.

## 무엇을 보나

| 표시 | 뜻 | 예 |
|---|---|---|
| **Not in spec** | 명세에 없는 필드가 응답에 있음 | `phoneNumber`가 응답에 있지만 스키마에 없음 |
| **Missing** | 명세에서 필수인 필드가 응답에 없음 | `required: [id]`인데 `id`가 없음 |
| **Type differs** | 명세와 다른 타입 | 명세는 `integer`, 응답은 `"30"` |
| **No credentials** | 명세가 인증을 요구하는데, 인증 없이 **성공**함 | `security: [bearer]`인데 Authorization 없이 200 |

API 자체가 명세에 없으면 [Shadow API](api-discovery.md#shadow)로 따로 표시합니다.

## 판단 규칙

<div class="sade-steps" markdown>

1. **성공 응답만 비교합니다.** 2xx 응답의 본문을 그 상태 코드의 응답 스키마와 비교합니다. 4xx·5xx의 오류 본문은 명세에 잘 적지 않아서, 비교하면 의미 없는 차이만 늘어납니다.
2. **필드 경로로 맞춥니다.** 중첩 객체와 배열을 펼쳐 `items[].price` 같은 경로로 비교합니다. `$ref`, `allOf`, `anyOf`, `oneOf`를 따라갑니다.
3. **호환되는 타입은 같다고 봅니다.** 명세가 `number`이고 값이 정수면 같습니다. `null` 값과 타입을 알 수 없는 스키마는 차이로 세지 않습니다.
4. **인증은 결과까지 봅니다.** 인증 헤더가 비어 있어도 401·403으로 거절됐다면 서버가 제대로 막은 것이므로 표시하지 않습니다. **2xx로 성공한 경우만** No credentials입니다.
5. **부분 정보로는 결론 내리지 않습니다.** 본문이 필드 이름 목록만 있고 그 목록이 잘렸다면, 보이는 명세 외 필드는 표시하지만 Missing은 판단하지 않습니다.

</div>

## 어디에 보이나

| 화면 | 보이는 것 |
|---|---|
| Call History | 호출마다 **Spec check** 칸과 필터 (Any mismatch, Not in spec, Missing, Type differs, No credentials) |
| 호출 상세 | 문제가 된 줄을 빨간색으로 표시 (`"phoneNumber": <string>` 줄, `authorization: (empty)` 줄) |
| API 상세 › Calls | 같은 Spec check 칸과 필터. 이 API의 호출만 보임 |

=== "응답 (명세에 phoneNumber 없음)"

    ```text
    200
    content-type: application/json

    {
      "id": <string>,
      "email": <string>,
      "phoneNumber": <string>      ← Not in spec
    }
    ```

=== "요청 (인증 없이 성공)"

    ```text
    GET /backoffice/customers/{email} HTTP/1.1
    authorization: (empty)         ← No credentials
    ```

값은 저장하지 않으므로 화면에도 `<string>` 같은 타입으로 보입니다([값을 남기지 않는 저장](value-free-storage.md)).

## 점검하지 않는 경우

| 상황 | 표시 |
|---|---|
| 서비스에 명세가 없음 | 점검하지 않음 |
| 명세가 트래픽으로 만든 초안 | Not evaluated (같은 트래픽으로 만든 기준이라서) |
| 로그에 응답 본문이 없음 | 필드 비교를 하지 않음. "명세와 같음"이 아님 |
| 로그에 인증 헤더 필드 자체가 없음 | 인증 판단을 하지 않음 |

## Run scan과의 관계

점검은 저장된 수집 결과로 계산합니다. **Run scan**을 누르면 명세를 바꾼 뒤에도 SIEM에 다시 접속하지 않고 다시 판단합니다. 대용량 SIEM 소스는 API·상태별 샘플로 점검하므로, 1만 건 중 1건만 다른 드문 경우는 놓칠 수 있습니다.

## 구현 범위와 확장

| | 지금 구현 | 같은 방식으로 넓히기 |
|---|---|---|
| 기준 명세 | 사용자가 올린 OpenAPI, 코드에서 만든 명세 | 명세가 없는 서비스는 [code2spec](code2spec.md)으로 기준을 먼저 만듦 |
| 점검 항목 | 명세에 없는 필드, 필수 누락, 타입 차이, 인증 없이 성공 | 회사 정책 규칙(예: 특정 유형이 외부 API로 나가면 경고)은 다음 단계 |
