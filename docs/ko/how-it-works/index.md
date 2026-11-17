# 처리 순서

SADE는 코드, 명세, 로그를 각각 따로 처리해 중간 결과를 만들고, 매퍼(Mapper)가 그 중간 결과를 합쳐 화면 결과를 만듭니다. 입력 하나가 바뀌면 그 입력의 중간 결과만 새로 만들고 합치기를 다시 합니다.

<div class="sade-pipe" markdown>
<div markdown><span class="sade-pipe-title">입력</span>코드, 명세, 로그</div>
<div markdown><span class="sade-pipe-title">입력별 처리</span>스캔, 변환, 집계</div>
<div markdown><span class="sade-pipe-title">민감 판정</span>필드, 본문</div>
<div class="is-key" markdown><span class="sade-pipe-title">매핑</span>API 합치기, 노출, 우선순위</div>
<div markdown><span class="sade-pipe-title">결과</span>Inventory, Flows</div>
</div>

## 단계

| 단계 | 하는 곳 | 하는 일 | 자세히 |
|---|---|---|---|
| 코드 스캔 | code-worker | 저장소에서 API, 호출, 인증 선언, 필드, 게이트웨이 경로를 읽고 서비스별 OpenAPI를 만듦 | [코드 스캔](code-scan.md) |
| 명세 변환 | backend, analysis-worker | backend가 원본을 검사해 저장하고, analysis-worker가 SADE 형식으로 바꿈 | [OpenAPI 명세](../connect/specs.md) |
| 로그 저장 | vector (CSV 민감 탐지는 backend) | 필드 이름을 맞추고, 민감 유형을 찾고, 값을 가린 뒤 ClickHouse에 저장 | [로그 처리와 값 가리기](log-processing.md) |
| 로그 분석 | analysis-worker | 저장한 로그를 서비스, 메서드, 경로 틀별로 집계하고 서비스 사이 호출을 모음 | [로그 처리와 값 가리기](log-processing.md) |
| 민감 판정 | code-worker | 코드와 명세 필드의 민감 유형을 정함 | [민감정보 탐지](sensitive-data.md) |
| 매핑 | analysis-worker | 서비스 이름을 맞추고 같은 API를 합침. 노출 판정, 관리 우선순위, Flows를 만듦 | [API 식별](api-identity.md), [노출 판정](exposure.md), [관리 우선순위](../features/priority.md) |

## 언제 다시 도는지

| 일 | 이어서 도는 것 |
|---|---|
| 코드 스캔 완료 | 민감 판정 → 매핑 |
| 명세 등록, 새 버전 | 명세 변환 → 민감 판정 → 매핑 |
| 로그 반영(Apply), Analyze again | 로그 분석 → 매핑 |
| Access Scope, Settings 저장 | 매핑 |

- syslog, Kafka로 들어온 로그는 저장만 됩니다. 로그 분석은 반영이나 Analyze again을 눌러야 돕니다.
- 매핑은 입력마다 가장 최근에 끝난 중간 결과를 씁니다. 실패한 스캔이나 변환 중인 명세는 쓰지 않습니다.

## 결과가 바뀌는 방식

- 매핑은 결과 전체를 다 만든 뒤 한 번에 바꿉니다. 만드는 도중에는 이전 결과가 보입니다.
- 매핑이 실패하면 이전 결과를 그대로 둡니다.
- 결과마다 분석 실행(run) 기록이 남습니다. 어떤 입력, 어떤 규칙 버전, 어떤 설정으로 만들었는지 함께 남깁니다.
- 화면은 마지막으로 끝난 실행을 보여 줍니다. Overview 위의 시각은 그 실행이 끝난 시각입니다.

## 판단하지 않는 것

- 요청이 실제로 막히는지(인증, 권한 검사)
- 취약점 여부, 법 위반 여부
- 수집 기간 밖의 호출, 수집하지 않은 서비스의 호출

확인하지 못한 항목은 "모름"으로 남기고 안전으로 세지 않습니다.
