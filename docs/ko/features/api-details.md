# API 상세

Inventory에서 API를 누르면 오른쪽에 상세 패널이 열립니다. 명세·코드·로그가 그 API에 대해 말하는 것을 한곳에서 비교합니다.

## 탭

| 탭 | 보이는 것 |
|---|---|
| **Overview** | 서비스, 호스트, 확인 출처, 인증 방식(명세에 적힌 방식과 로그에서 본 방식), 공개 범위, 민감정보 요약 |
| **Fields** | 요청·응답 필드, 타입, 필수 여부, `Spec` / `Code` / `Log` 출처, 민감정보 유형 |
| **Code** | 구현 파일과 줄, 게이트웨이 라우팅, 명세와 코드의 차이, 코드가 부르는 다른 서비스 |
| **Sensitive data** | 위치, 필드, 유형, Field matched, Value matched, 검사 상태 |
| **Calls** | 이 API의 최근 호출, Spec check, 요청 흐름으로 이동 |

## Fields

요청과 응답을 나눠 보여 줍니다. 응답은 상태 코드별로 **Example / Schema**를 바꿔 볼 수 있습니다. Example은 명세 예시나 구조로 만든 자리표시자일 수 있으니 실제 값으로 읽지 마세요.

출처 칸에 체크가 있으면 그 자료에서 필드를 확인했다는 뜻입니다. 빈 칸은 "없음"이 아닙니다. 그 자료를 아직 수집하거나 스캔하지 않았을 수 있습니다. **Not in code**, **Only in code** 필터로 명세와 구현의 차이를 볼 수 있습니다.

## Code

| 항목 | 뜻 |
|---|---|
| Implementation | 이 API를 실제로 처리하는 코드 위치. 게이트웨이 API면 라우팅 규칙을 따라간 서비스와 규칙이 적힌 파일·줄 |
| Spec vs code | 비교한 필드 중 일치, 차이, 확인 불가, 코드에만 있음 개수 |
| Calls to other services | 이 API의 코드가 부르는 다른 서비스와 라이브러리, 파일·줄 |
| Access in code | 라우트에 선언된 권한·인증 래퍼 (예: `RequirePermission("wallet:read")`) |

`No access check declared`는 "인증 없음"이 아니라 "라우트 등록에 선언이 없음"입니다. 게이트웨이나 핸들러 안에서 검사할 수도 있습니다.

## 인증 표시

Overview의 인증은 두 줄입니다. 명세가 선언한 방식과, 로그에서 호출자가 실제로 보낸 방식입니다. 로그에 Bearer가 보인다고 서버가 인증을 강제한다는 뜻은 아닙니다. 인증 없이 성공한 호출은 Calls의 **No credentials**로 확인합니다.

## Calls

이 API의 호출만 모아 Call History와 같은 형식으로 보여 줍니다. **Spec check** 필터로 명세와 다른 호출만 볼 수 있고, 호출을 고르면 요청·응답과 문제가 된 줄이 표시됩니다. [호출 기록과 요청 흐름](call-history.md)을 참고하세요.

[<span class="q">궁금하신가요?</span><span class="t">명세와 코드를 필드 단위로 비교하는 방법 (code2spec)</span><span class="arrow">→</span>](../technology/code2spec.md){ .sade-curious }
