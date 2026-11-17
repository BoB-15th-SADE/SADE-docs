# SADE

SADE는 기업의 소스 코드, API 명세(OpenAPI), 로그를 합쳐 API 목록(Inventory)과 서비스 사이 호출 흐름(Flows)을 만들고, API마다 관리 우선순위(P1~P4)를 매기는 도구입니다. 보안 담당자는 이 결과로 먼저 검토할 API를 고릅니다.

SADE는 기업 내부망에 Docker 컨테이너로 설치합니다.

- 트래픽 경로에 장비를 두지 않습니다.
- 서비스에 요청을 보내지 않습니다.
- 요청을 차단하지 않습니다.

## 무엇을 하려고 하나요

<div class="sade-paths" markdown>

<div markdown>
<p class="sade-paths__title">도입을 검토한다면</p>

- [보안 검토 자료](getting-started/security-review.md): 저장하는 것, 네트워크, 접속 통제
- [지원 범위와 제한](reference/limitations.md)
- [동작 원리](how-it-works/index.md): 결과가 어떻게 만들어지는지

</div>

<div markdown>
<p class="sade-paths__title">설치하고 연결한다면</p>

- [설치와 첫 연결](getting-started/quickstart.md)
- [샘플로 첫 결과 보기](getting-started/first-run.md): 10분
- 연동: [소스 코드](connect/code.md), [OpenAPI 명세](connect/specs.md), [로그](connect/logs.md)

</div>

<div markdown>
<p class="sade-paths__title">결과를 본다면</p>

- [점검 흐름](getting-started/workflow.md): 7단계
- [관리 우선순위](features/priority.md): P1~P4 읽는 법
- [결과 보고하기](features/reporting.md)

</div>

</div>

## SADE로 답할 수 있는 질문

| 확인할 것 | 화면 |
|---|---|
| 기업에 있는 API, 명세에 없는 API | [Inventory](features/inventory.md)의 Shadow, Undocumented 표시 |
| 먼저 검토할 API | [관리 우선순위](features/priority.md)의 P1~P4와 판정 근거 |
| 외부에서 호출되는 API, 민감정보를 주고받는 API | [API 상세](features/api-details.md)의 노출, 인증 선언, 민감 유형 |
| 요청이 지나가는 서비스, DB, 외부 목적지 | [Flows](features/flows.md) |
| API를 고칠 담당 후보 | [API 상세](features/api-details.md)의 Owners 탭 (CODEOWNERS) |

## 입력

| 입력 | 받는 방법 | 알 수 있는 것 |
|---|---|---|
| 소스 코드 | GitHub 저장소 스캔 (GitHub.com, Enterprise Cloud, Enterprise Server) | 코드에 선언된 API와 위치, 인증 선언, 서비스 사이 호출, DB 접근, 게이트웨이 경로 규칙 |
| 명세 | OpenAPI 3.0, 3.1 JSON 업로드, 내부 주소에서 가져오기 | 문서로 관리하는 API와 필드 |
| 로그 | CSV 업로드, syslog(TLS) 수신, Kafka 구독 | 실제 호출된 API, 호출 수, 호출한 주소, 서비스 사이 흐름 |

입력 하나만 있어도 결과가 나옵니다. API마다 확인한 입력을 `Code`, `Spec`, `Log`로 표시합니다.

## 원칙

- 근거가 모자라면 "모름"이나 "미평가"로 표시합니다. 확인하지 못한 항목을 안전으로 표시하지 않습니다.
- 코드는 읽기만 합니다.
- 로그 본문은 저장 전에 값을 타입으로 바꿉니다. 민감정보는 유형 이름만 남깁니다.
- 결과는 수집한 범위에서 확인한 사실과 검토 신호입니다. 취약점과 법 위반은 판정하지 않습니다. 범위는 [지원 범위와 제한](reference/limitations.md)에 있습니다.
