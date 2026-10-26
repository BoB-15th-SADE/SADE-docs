# 점검 결과 (Findings)

**Policy › Findings**는 회사 정책 규칙을 어긴 호출을 모으는 화면입니다. 명세와 다른 호출은 이 화면이 아니라 호출마다 표시합니다.

## 무엇이 어디에 나오나

| 결과 | 보는 곳 |
|---|---|
| 명세에 없는 API (Shadow API, SPEC-001) | Inventory의 **Shadow** 탭 |
| 명세에 없는 응답 필드, 타입 차이, 필수 필드 누락, 인증 없이 성공 | Call History와 API 상세 › Calls의 **Spec check** |
| 회사 정책 규칙 위반 | **Findings** |

!!! note "현재 버전의 Findings"
    회사 정책 규칙을 만들고 평가하는 기능은 다음 단계입니다. 지금은 정책 규칙이 없어서 Findings가 비어 있습니다. 명세 점검 결과는 위 표의 화면에서 확인하세요.

## 명세 점검 상태

| 상태 | 뜻 |
|---|---|
| Pass | 비교한 호출에서 조건을 충족함 |
| Fail | 비교 가능한 근거에서 차이를 확인함 |
| Not evaluated | 명세, 응답 스키마, 수집된 본문이 없거나, 명세가 트래픽으로 만든 초안이라 독립 기준이 없음 |

## 검토 순서

<div class="sade-steps" markdown>

1. 명세를 올리고 **Run scan**을 실행합니다.
2. Inventory의 Shadow 탭에서 명세에 없는 API를 봅니다.
3. Call History에서 **Spec check › Any mismatch**로 명세와 다른 호출을 모읍니다.
4. 호출을 열어 문제가 된 줄을 확인합니다.
5. 명세가 틀렸으면 명세를 고치고, 서비스 배정이나 매핑이 틀렸으면 연결 설정을 고친 뒤 다시 Run scan을 실행합니다.

</div>

명세 점검은 관측한 호출에 대한 판단입니다. 권한 정책, 개인정보 제공의 적법성, 전체 API의 안전을 판정하지 않습니다.

[<span class="q">궁금하신가요?</span><span class="t">호출별 명세 점검의 판단 규칙</span><span class="arrow">→</span>](../technology/spec-check.md){ .sade-curious }
