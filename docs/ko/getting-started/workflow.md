# 점검 흐름

보안 담당자가 SADE로 API를 점검하는 순서입니다. 자료 연결에서 시작해 담당자에게 넘길 목록을 만드는 데까지 7단계입니다.

<div class="sade-pipe" markdown>
<div class="is-key" markdown><span class="sade-pipe-title">1. 연결</span>코드, 명세, 로그</div>
<div markdown><span class="sade-pipe-title">2. 범위 확인</span>Overview</div>
<div markdown><span class="sade-pipe-title">3. 고르기</span>P1, P2</div>
<div markdown><span class="sade-pipe-title">4. 근거 확인</span>API 상세</div>
<div markdown><span class="sade-pipe-title">5. 빈칸 채우기</span>빠진 자료</div>
<div markdown><span class="sade-pipe-title">6. 경로 보기</span>Flows</div>
<div class="is-key" markdown><span class="sade-pipe-title">7. 넘기기</span>Excel, 담당 후보</div>
</div>

## 1. 자료 연결

코드, 명세, 로그 순서로 연결하기를 권합니다. 코드 스캔의 서비스 이름이 기준이 되어, 명세와 로그의 서비스 이름을 맞추기 쉽습니다.

| 순서 | 할 일 | 안내 |
|---|---|---|
| 1 | GitHub 저장소 스캔 | [소스 코드](../connect/code.md) |
| 2 | 기업 OpenAPI 명세 등록. 서비스 이름은 코드 스캔 결과와 같게 | [OpenAPI 명세](../connect/specs.md) |
| 3 | 하루치 로그를 CSV로 올려 매핑 확인 | [CSV 업로드](../connect/logs-csv.md) |
| 4 | syslog나 Kafka로 계속 수집 | [syslog](../connect/logs-syslog.md), [Kafka](../connect/logs-kafka.md) |
| 5 | 내부 대역, 파트너 대역 입력 | [Access Scope](../policy/access-scope.md) |

자료가 하나만 있어도 결과는 나옵니다. 자료가 적을수록 "모름" 신호와 미평가 API가 많습니다.

## 2. 범위 확인 (Overview)

[Overview](../features/overview.md)에서 이번 분석이 어디까지 봤는지 확인합니다.

- API Assets: 찾은 API 전체 수
- Spec Status: 명세에 없는 API(Undocumented, Shadow) 수
- Management Priority: 등급별 수와 미평가 수

미평가가 많으면 5단계(빈칸 채우기)를 먼저 합니다.

## 3. 먼저 볼 API 고르기 (Inventory)

[Inventory](../features/inventory.md)는 기본으로 P1부터 정렬됩니다.

<div class="sade-steps" markdown>

1. Add filter(필터 추가) > 관리 우선순위에서 P1, P2를 고릅니다.

2. 같은 등급 안에서는 Access Scope가 Public인 API, 민감 유형이 있는 API를 먼저 봅니다.

3. 잠정(provisional) 표시가 있는 API는 등급이 더 올라갈 수 있는 API입니다. 따로 표시해 둡니다.

</div>

Shadow나 Undocumented만 따로 보려면 명세 상태 필터를 씁니다. 관리 대장에 없는 API를 찾는 용도입니다.

## 4. 근거 확인 (API 상세)

API를 누르고 Full Screen(전체 화면)을 엽니다. [API 상세](../features/api-details.md)의 탭마다 확인할 것이 다릅니다.

| 탭 | 확인할 것 |
|---|---|
| Management(관리) | 어떤 신호가 예, 아니요, 모름인지. 더 높아질 수 있는 등급 |
| Sensitive Data(민감정보) | 민감 유형과 찾은 출처(Code, Spec, Log) |
| Code(코드) | 핸들러 파일과 줄. 인증 선언 위치 |
| Fields(필드) | 요청, 응답 필드와 명세 차이 |
| Owners(담당자) | CODEOWNERS 담당 후보, 최근 변경 커밋 |

신호 하나하나의 근거가 맞는지 확인합니다.

예를 들어 외부 접근(E)이 예라면 어떤 주소에서 불렸는지, 그 주소가 실제로 기업 밖인지 봅니다. 기업 대역이 Public으로 잡혔다면 Access Scope에 대역을 넣고 다시 분석합니다.

## 5. 빈칸 채우기

Management 탭의 "빠진 자료"와 Connect 화면 위쪽의 "우선순위 판단에 빠진 자료" 표가 무엇을 채우면 판정이 늘어나는지 알려 줍니다.

| 빠진 자료 | 채우는 방법 |
|---|---|
| 외부 접근 모름 | 로그에 `client.ip` 매핑, Access Scope 대역 입력 |
| 민감정보 모름 | 코드 스캔, 로그 본문 매핑 |
| 인증 선언 모름 | 코드 스캔, 명세의 `security` |
| 명세 비교 불가 | 같은 서비스 이름으로 명세 등록 |

자료를 넣으면 매핑이 자동으로 다시 돕니다. 3단계로 돌아가 등급이 바뀐 API를 확인합니다.

## 6. 경로 보기 (Flows)

[Flows](../features/flows.md)에서 고른 API가 어디서 불리고 어디로 이어지는지 봅니다.

<div class="sade-steps" markdown>

1. API 상세에서 View in Flows(흐름에서 보기)를 누릅니다.

2. Explore Connections(연결 보기)로 그 서비스 주변만 남깁니다. Depth를 1에서 2로 늘려 가며 봅니다.

3. 민감정보를 다루는 서비스에서 외부 목적지나 DB로 가는 선을 확인합니다.

</div>

## 7. 담당자에게 넘기기

- Inventory에서 필터를 건 상태로 Export to Excel(엑셀 내려받기)을 누릅니다. 등급별 시트, 판정 이유, 빠진 자료가 함께 내려옵니다.
- API 상세 Owners 탭의 CODEOWNERS 후보와 최근 커밋 작성자로 담당 팀을 찾습니다.
- 다음 점검 때 같은 필터로 다시 내려받아 등급 변화를 비교합니다.
- 받는 사람별로 무엇을 전할지는 [결과 보고하기](../features/reporting.md)에 있습니다.

!!! note "SADE가 판정하지 않는 것"
    관리 우선순위는 검토 순서입니다.

    취약점 여부와 법 위반 여부는 담당자 확인과 별도 점검으로 판단합니다. 프레임워크 기준 점검은 [준비 중](../features/assessments.md)입니다.
