# Overview

**Overview**는 마지막으로 끝난 분석 결과를 한 화면에 요약합니다. 화면 위의 "분석 완료 시각"은 선택한 분석이 끝난 시각이며, 실시간 수집 시각이 아닙니다.

| 영역 | 내용 |
|---|---|
| **Management Priority** | P1~P4와 미평가(Unassessed) API 수. 누르면 그 등급으로 거른 Inventory가 열립니다 |
| **Top 5 by Management Priority** | 우선순위가 가장 높은 API 다섯 개와 판정 근거 |
| **Asset Snapshot Counts** | 서비스, API 수와 출처(Code, Spec, Log)별 수 |
| **Observed Access Scope** | 로그에서 관측한 호출 주소로 나눈 Public, Partner, Internal API 수 |
| **Sensitive Types** | 민감 유형별 API 수. 한 API에 여러 유형이 있을 수 있어 합계가 API 수와 다릅니다 |
| **Spec Status** | Documented, Undocumented, Shadow, No Spec API 수 |
| **Assessments Score** | 프레임워크 점검 점수 자리. 점검은 아직 준비 중이라 미리보기로만 보입니다 ([프레임워크 점검](assessments.md)) |

!!! note "관측된 접근 범위와 외부 도달 가능성은 다릅니다"
    Observed Access Scope는 로그에 남은 호출 주소 기준입니다. 설정이나 게이트웨이 경로로 외부에서 닿을 수 있는지(외부 도달 가능성)는 따로 판정하며, 관리 우선순위의 외부 접근 신호(E)에 씁니다.

어디서부터 볼지 모르겠다면 P1, P2 API부터 [API 상세](api-details.md)의 Management 탭에서 판정 근거를 확인하세요.
