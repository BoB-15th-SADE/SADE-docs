# Inventory

APIs > **Inventory**는 코드, 명세, 로그를 합친 전체 API 목록입니다. 같은 API는 서비스, 메서드, 경로 틀을 기준으로 한 줄로 묶습니다(예: `/users/123`과 `/users/{id}`).

## 기본 정렬은 관리 우선순위

목록은 기본으로 **P1 → P2 → P3 → P4 → 미평가** 순서입니다. 우선순위를 매기는 기준은 [관리 우선순위](priority.md)를 보세요. 서비스, 경로, 호출 수, 마지막 호출 순으로도 정렬할 수 있습니다.

## 열

| 열 | 내용 |
|---|---|
| Management Priority | P1~P4, 잠정(provisional), 미평가 |
| Service, Method, Path | API |
| Source | 확인한 입력. `Code`(코드 스캔), `Spec`(등록한 명세), `Log`(수집한 로그) |
| Spec Status | Documented, Undocumented, Shadow, No Spec |
| Observed Access Scope | 로그에서 관측한 호출 주소 기준 Public, Partner, Internal |
| Calls | 분석한 기간의 호출 수 |

| 명세 상태 | 뜻 |
|---|---|
| **Documented** | 등록한 명세에 있는 API |
| **Undocumented** | 코드에는 있지만 명세에 없는 API |
| **Shadow** | 코드와 명세 어디에도 없고 로그에서만 보인 API |
| **No Spec** | 비교할 명세가 없는 서비스의 API |

## 거르기

[Add filter]로 조건을 더합니다. 조건은 주소에 남아 새로 고침이나 뒤로 가기 뒤에도 같은 목록이 보입니다.

- 관리 우선순위 등급, 평가 상태(평가됨, 잠정, 미평가)
- 서비스, 메서드, 경로 검색
- 출처(Code, Spec, Log), 명세 상태
- 접근 범위, 외부 노출, 게이트웨이 우회만
- 민감정보 여부, 민감 유형
- 인증 선언
- 호출 있음, 호출 없음

## 내보내기

**Export to Excel**은 화면과 같은 필터, 정렬, 분석 실행 기준으로 전체 목록을 내려받습니다(페이지 나눔 없음).

- **Summary** 시트: 등급별 수와 빠진 자료
- 등급별 시트: P1부터 미평가까지 같은 API를 등급별로
- 각 줄: 출처별 확인 여부, 우선순위, 평가 상태, 판정 이유, 규칙 버전
- 화면이 한국어면 한국어로 씁니다. 원문 값은 넣지 않습니다

API를 누르면 오른쪽에 요약 패널이 열리고, Full Screen으로 [API 상세](api-details.md)를 엽니다. View in Flows는 그 API를 [Flows](flows.md)에서 보여 줍니다.
