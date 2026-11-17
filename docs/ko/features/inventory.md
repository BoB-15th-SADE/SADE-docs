# Inventory

APIs > Inventory는 코드, 명세, 로그를 합친 전체 API 목록입니다.

SADE는 서비스, 메서드, 경로 틀이 같은 API를 한 줄로 묶습니다. 예를 들어 `/users/123`과 `/users/{id}`는 한 줄입니다.

묶는 방식은 [API 식별](../how-it-works/api-identity.md)에 있습니다.

목록은 기본으로 P1, P2, P3, P4, 미평가 순서입니다.

등급 기준은 [관리 우선순위](priority.md)에 있습니다. 열 제목을 누르면 다른 기준으로 정렬합니다.

[![Inventory 화면](../../assets/screens/inventory.png){ loading=lazy }](../../assets/screens/inventory.png)
<small>예시 화면 (가상 데이터)</small>

## 열

| 열 | 내용 |
|---|---|
| API | 메서드와 경로 |
| Service | 서비스 |
| Management Priority | P1~P4, 잠정(provisional), 미평가 |
| Source | 확인한 입력. `Code`(코드 스캔), `Spec`(등록한 명세), `Log`(수집한 로그) |
| Base URL | 서비스 주소. 여러 개면 첫 값과 `+N` |
| Access Scope | Public, Internal, `—`(판단할 근거 부족) |
| Spec Status | Documented, Undocumented, Shadow, No Spec |
| Calls | 분석 기간의 호출 수 |

표 위의 줄에 이번 분석의 등급별 API 수가 나옵니다.

### Access Scope 값

| 값 | 뜻 |
|---|---|
| Public | 기업 밖 주소에서 호출을 관측했거나(파트너 포함), 게이트웨이 경로나 명세의 공개 주소로 닿을 수 있음 |
| Internal | 내부 주소에서만 불렸고, 밖에서 닿는 경로도 없다는 근거가 모두 있음 |
| `—` | 판단할 근거가 모자람. 안전하다는 뜻으로 보지 않습니다 |

판정 방식은 [노출 판정](../how-it-works/exposure.md)에 있습니다.

### 명세 상태

| 명세 상태 | 한국어 화면 | 뜻 |
|---|---|---|
| Documented | 등록됨 | 등록한 명세에 있는 API |
| Undocumented | Spec 누락 | 코드에 있고 명세에 없는 API |
| Shadow | Shadow | 코드와 명세에 없고 로그에서만 보인 API |
| No Spec | Spec 없음 | 비교할 명세가 없는 서비스의 API |

민감정보와 인증 선언은 열에 없습니다. API를 누르면 열리는 패널과 필터에서 봅니다.

## 필터

Add filter(필터 추가)로 조건을 더합니다.

조건은 주소에 남아서 새로 고침이나 뒤로 가기 뒤에도 같은 목록이 나옵니다. 주소를 복사해 다른 사람에게 보내면 같은 목록을 엽니다.

| 필터 | 고르는 값 |
|---|---|
| Management Priority | P1, P2, P3, P4, 미평가 |
| Priority Assessment | 평가됨, 잠정, 미평가 |
| Service, Method | 서비스, 메서드 |
| Source | Code, Spec, Log |
| Spec Status | Documented, Undocumented, Shadow, No Spec |
| Access Scope | Public, Internal, 모름 |
| Observed Access Scope | 로그에서 관측한 Public, Partner, Internal |
| Sensitive Type | 민감 유형, 아무 유형(Any type), 없음(분석 완료) |
| Calls | 호출 있음, 호출 없음 |

검색창으로 서비스, 메서드, 경로를 찾습니다.

## 이렇게 씁니다

??? tip "먼저 볼 API 고르기"

    <div class="sade-steps" markdown>

    1. Management Priority 필터에서 P1, P2를 고릅니다.

    2. Access Scope 필터에서 Public을 더합니다.

    3. 목록에서 API를 눌러 오른쪽 패널의 판정 이유를 봅니다.

    4. Full Screen(전체 화면)으로 [API 상세](api-details.md)의 Management 탭을 엽니다.

    </div>

??? tip "관리 대장에 없는 API 찾기"

    <div class="sade-steps" markdown>

    1. Spec Status 필터에서 Shadow를 고릅니다. 로그에서만 불린 API입니다.

    2. Calls 열로 정렬해 많이 불린 것부터 봅니다.

    3. 게이트웨이 경로 차이로 생긴 Shadow인지 확인합니다. API 상세의 외부 경로와 [Source Code의 Route maps](../connect/code.md#results)를 봅니다.

    4. Undocumented(Spec 누락)도 같은 방식으로 봅니다. 코드에 있는데 명세에 빠진 API입니다.

    </div>

??? tip "민감정보를 다루는 API 모아 보기"

    <div class="sade-steps" markdown>

    1. Sensitive Type 필터에서 유형(예: RRN, CARD_NO)을 고릅니다. Any type은 유형이 하나라도 있는 API입니다.

    2. Access Scope로 Public만 남깁니다.

    3. API 상세의 Sensitive Data 탭에서 어느 필드, 어느 출처에서 찾았는지 봅니다.

    </div>

??? tip "쓰지 않는 API 찾기"

    Calls 필터에서 호출 없음을 고르면 코드나 명세에는 있는데 분석 기간에 불리지 않은 API가 나옵니다. 그 서비스의 로그를 아예 받지 않았을 수도 있으니, API 상세에서 이유(로그 없음, 호출 없음)를 확인합니다.

## Excel 내보내기

Export to Excel(엑셀 내려받기)은 화면과 같은 필터, 정렬, 분석 실행으로 전체 목록을 내려받습니다. 페이지를 나누지 않습니다.

- Summary 시트: 등급별 수, 빠진 자료
- 등급별 시트: P1부터 미평가까지
- 각 줄: 출처별 확인 여부, 우선순위, 평가 상태, 판정 이유, 더 높아질 수 있는 등급, 빠진 자료
- 화면이 한국어면 한국어로 씁니다. 원문 값은 넣지 않습니다.

## 다른 화면으로

- API를 누르면 오른쪽에 요약 패널이 열립니다.
- Full Screen(전체 화면)은 [API 상세](api-details.md)를 엽니다.
- View in Flows(흐름에서 보기)는 그 API를 [Flows](flows.md)에서 보여 줍니다.
