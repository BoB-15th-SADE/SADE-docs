# API 상세

Inventory에서 API를 누르고 Full Screen(전체 화면)을 누르면 API 상세가 열립니다. 위쪽에 서비스, 메서드, 경로, 관리 우선순위, 출처(`Code`, `Spec`, `Log`)가 나옵니다.

[![API 상세 Overview 탭](../../assets/screens/api-overview.png){ loading=lazy }](../../assets/screens/api-overview.png)
<small>예시 화면 (가상 데이터)</small>

| 탭 | 한국어 화면 | 내용 |
|---|---|---|
| Overview | 개요 | 우선순위 요약, 검토 신호, 근거(노출, 인증 선언, 민감정보, 실제 호출, 명세 일치) |
| Fields | 필드 | 요청, 응답 필드와 타입, 필드별 출처, 응답 코드별 표 |
| Sensitive Data | 민감정보 | 민감 유형이 붙은 필드, 위치, 찾은 출처 |
| Code | 코드 | 핸들러 파일과 줄, 다른 서비스 호출, DB 접근, 명세와 코드 필드 비교(Spec vs code) |
| Owners | 담당자 | CODEOWNERS 담당 후보와 근거 줄, API 코드의 최초, 최근 변경 커밋 |
| Management | 관리 | [관리 우선순위](priority.md) 근거. 신호별 예, 아니요, 모름, 더 높아질 수 있는 등급, 빠진 자료 |
| Assessment Results | 점검 결과 | 프레임워크 점검 결과 ([준비 중](assessments.md)) |

## Overview (개요)

API를 처음 열었을 때 보는 요약입니다.

| 영역 | 내용 |
|---|---|
| Basic Info | 서비스, Base URL, 외부 경로, 서버, 처음 발견, 마지막 호출 |
| Asset Characteristics | 검토 신호. 예: 외부 IP에서 호출됨, 로그에서만 보임, 코드와 명세 필드 차이 |
| Exposure | Access Scope와 판정 근거 한 줄. 파트너에서만 불렸으면 "Called only from partner addresses" |
| Declared Auth | 코드와 명세의 인증 선언과 둘이 같은지 |
| Sensitive Data | 민감 유형 요약 |
| Calls | 분석 기간의 호출 수, 응답 코드별 수 |
| Spec Match | 코드, 명세, 로그가 맞는지 |

검토 신호는 확인이 필요한 특징입니다. 확인된 취약점이 아니며, 신호가 없어도 안전으로 판정하지 않습니다.

## Fields (필드)

- 요청은 위치별(Path, Query, Header, Cookie, Body)로, 응답은 응답 코드와 형식(JSON 등)별로 나눕니다.
- 필드마다 확인한 출처(From code, From spec, From logs)를 표시합니다.
- 중첩 객체는 `items[].price`처럼 점과 `[]`로 이어 씁니다.
- 코드와 명세의 타입이 다르면 차이를 표시합니다. 이 차이가 관리 우선순위의 검토 신호(D)가 됩니다.

## Sensitive Data (민감정보)

Sensitive Fields 표는 민감 유형이 붙은 필드를 한 줄씩 보여 줍니다.

| 열 | 뜻 |
|---|---|
| 위치 | 요청이나 응답, 응답 코드, 부분(Path, Query, Header, Body). 예: Response 200 Body |
| Field | 필드 이름 |
| 유형 | 민감 유형. 예: EMAIL |
| Found In | 찾은 출처 (Code, Spec, Log) |

- 로그는 API 단위로 유형을 기록합니다. 어느 필드에 실렸는지는 알 수 없어 필드 없이 따로 나옵니다.
- See how each field was detected를 누르면 판정 근거를 자세히 봅니다.
- 탐지 방식은 [민감정보 탐지](../how-it-works/sensitive-data.md)에 있습니다.

## Code (코드)

| 영역 | 내용 |
|---|---|
| Handler | 핸들러 클래스와 메서드, 파일과 줄. 누르면 GitHub의 그 줄을 엽니다 |
| Access Rules | 인증 선언(`@PreAuthorize` 등)과 선언 위치 |
| Repository Call | 이 API에서 부르는 다른 서비스와 확정 수준(Resolved, Candidate, Unresolved) |
| Database Access | 이 API에서 닿는 DB, 테이블, 작업 종류 |
| Code-spec comparison | 명세와 코드의 필드 비교(Spec vs code) |

DB에 접근하는 코드는 찾았지만 어느 DB인지 정하지 못하면 "Database not identified"로 나옵니다.

## Owners (담당자)

[![API 상세 Owners 탭](../../assets/screens/api-owners.png){ loading=lazy }](../../assets/screens/api-owners.png)
<small>Owners(담당자) 탭 예시 화면 (가상 데이터)</small>

- CODEOWNERS candidate: 핸들러 파일에 맞는 CODEOWNERS 규칙의 담당 후보와 근거 줄
- Code Change History: 핸들러 코드가 처음 들어온 커밋과 최근 바뀐 커밋
- 커밋 작성자는 담당자와 다를 수 있습니다.
- 담당자 지정 버튼(Assign Owner)은 아직 동작하지 않습니다.

## Management (관리)

[![API 상세 Management 탭](../../assets/screens/api-manage.png){ loading=lazy }](../../assets/screens/api-manage.png)
<small>Management(관리) 탭 예시 화면 (가상 데이터)</small>

| 영역 | 내용 |
|---|---|
| Summary | 등급, 평가 상태, 판정 이유 |
| Judgement by item | 신호별 결과(Has it, Does not have it, Not known), 근거, 등급에 쓰였는지(Used in grade) |
| Could raise the grade | 모르는 신호가 확인되면 될 수 있는 등급 |
| Data used | 판정에 쓴 자료와 분석한 로그 기간 |
| Add data in | 빠진 자료와 그 자료를 넣을 화면 |
| Call history (not in grade) | 호출 수와 최초, 마지막 호출. 등급 계산에는 쓰지 않음 |

검토 순서

<div class="sade-steps" markdown>

1. Summary에서 등급과 잠정 여부를 봅니다.

2. Judgement by item에서 Has it인 신호의 근거를 하나씩 엽니다. 예: 외부 접근이면 어느 IP에서 몇 번 불렸는지

3. Not known인 신호가 있으면 Add data in이 가리키는 화면에서 자료를 넣습니다.

4. 다시 분석된 뒤 등급이 바뀌었는지 봅니다.

</div>

## 화면 문구

- 인증 선언(Declared Auth): 코드와 명세에 적힌 인증입니다. 요청이 실제로 막히는지는 확인하지 않습니다.
- "No access declaration extracted": 코드에서 인증 선언을 찾지 못했다는 뜻입니다. 전역 보안 설정으로 막고 있을 수 있습니다.
- "This result has no priority assessment": 우선순위 기능 전에 만든 결과입니다. 다시 분석하면 채워집니다.

## 다른 화면으로

- View in Flows(흐름에서 보기): 이 API의 서비스와 연결을 [Flows](flows.md)에서 봅니다.
- Back to Inventory: 필터를 그대로 두고 목록으로 돌아갑니다.
