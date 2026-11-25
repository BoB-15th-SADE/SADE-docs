# Overview

Overview는 마지막으로 끝난 분석 결과를 요약합니다.

화면 오른쪽 위의 "최근 분석 완료"는 선택한 분석이 끝난 시각입니다. 실시간 수집 시각과 다릅니다.

[![Overview 화면](../../assets/screens/overview.png){ loading=lazy }](../../assets/screens/overview.png)
<small>예시 화면 (가상 데이터)</small>

## 화면 구성

| 영역 | 내용 | 누르면 |
|---|---|---|
| Assessments Score | [점검](assessments.md#rules)에서 SADE가 판정한 점검(취약, 양호) 중 양호의 비율. 아래에 판정한 점검 수와 제외한 점검 수가 나옵니다 | |
| API 자산 | 전체 API 수 | Inventory |
| 우선순위 P1 + P2 | P1, P2 API 수 | P1, P2로 거른 Inventory |
| 외부 접근 API | 외부 접근으로 판정한 API 수 | 접근 범위 외부 노출로 거른 Inventory |
| Sensitive API | 민감 유형이 있는 API 수 | 민감 API로 거른 Inventory |
| 관리 우선순위 상위 API 5개 | 등급이 정해진 API 중 우선순위가 가장 높은 5개와 판정 근거, 출처(코드, Spec, 로그) | API 이름은 API 상세, 서비스는 그 서비스로 거른 Inventory |
| 우선순위 분포 | P1~P4와 미평가 API 수와 비율 | 그 등급으로 거른 Inventory |
| 관측 접근 범위 | 로그의 호출 주소로 나눈 외부 노출, 협력사, 내부, 알 수 없음 API 수 | 그 범위로 거른 Inventory |
| 민감정보 유형 | 민감 유형별 API 수. API 하나에 여러 유형이 있으면 겹쳐 셉니다 | 그 유형으로 거른 Inventory |
| Spec 등록 | 등록됨, Spec 누락, Shadow, Spec 없음 API 수 | 그 상태로 거른 Inventory |

- 숫자 카드 아래 추이는 완료된 분석이 두 번 이상 쌓인 뒤에 나옵니다.
- 상위 5개에는 등급이 정해진 API(평가 완료, 잠정)만 나옵니다. 미평가 API는 Inventory에서 봅니다.

!!! note "관측 접근 범위와 외부 접근 API"
    관측 접근 범위는 로그에 남은 호출 주소로만 셉니다.

    외부 접근 API는 저장된 외부 도달 판정(설정, 게이트웨이 경로 포함)으로 셉니다. 관리 우선순위의 외부 접근 신호(E)도 이 판정을 씁니다.

- 오른쪽 아래 SADE 버튼은 [SADE AI 채팅](assessments.md#chat)을 엽니다. 모든 화면에 있습니다.

검토를 시작할 때는 P1, P2 API의 [API 상세](api-details.md) 우선순위 근거 탭에서 판정 근거를 확인합니다.
