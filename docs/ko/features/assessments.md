# 프레임워크 점검 (Assessments)

Assessments는 API 보안 관리 프레임워크의 점검 항목으로 API를 점검한 결과를 보여 줄 화면입니다.

!!! warning "준비 중"
    현재 버전은 점검을 실행하지 않습니다. 화면에는 프레임워크와 점검 모델의 준비 상태만 나옵니다. 결과 영역은 가상 예시(Demo view)로만 미리 볼 수 있습니다. 결과가 없다는 표시는 통과를 뜻하지 않습니다.

## 화면 구성

[![Assessments 화면](../../assets/screens/assessments.png){ loading=lazy }](../../assets/screens/assessments.png)
<small>예시 화면 (가상 데이터)</small>

| 영역 | 내용 |
|---|---|
| Assessment Readiness | 프레임워크 설정(Framework)과 점검 모델(Model) 연결 상태. 현재는 Framework not configured, Model not connected로 나옵니다 |
| Target Analysis | 점검 대상 분석 실행과 API |
| Assessment Results, History | 점검 결과와 이력. 실행 전에는 비어 있습니다 |
| Demo view | 가상 예시로 만든 결과 화면 |

점수(Assessments Score)는 평가를 마친 항목 중 충족한 항목의 비율로 계산할 예정입니다. 실행 오류, 대기, 해당 없음 항목은 계산에서 뺍니다.

## 관리 우선순위와의 관계

- [관리 우선순위](priority.md)는 먼저 검토할 API를 고릅니다.
- 프레임워크 점검은 항목별로 기준을 지키는지 확인합니다.
- 두 결과는 따로 계산합니다. 점검 결과로 우선순위 등급이 바뀌지 않습니다.
