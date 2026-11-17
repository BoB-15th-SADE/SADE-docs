# SADE

SADE는 기업 보안 담당자가 **회사에 어떤 API가 있고, 그중 무엇부터 관리해야 하는지** 알 수 있게 돕는 도구입니다. 회사가 이미 가진 **소스 코드, API 명세(OpenAPI), 로그**를 합쳐 API 목록(Inventory)과 서비스 사이의 호출 흐름(Flows)을 만들고, API마다 관리 우선순위(P1~P4)를 매깁니다.

SADE는 고객사 내부망에 Docker 컨테이너로 설치합니다. 트래픽 경로에 장비를 두지 않고, 서비스에 요청을 보내지 않으며, 요청을 막지 않습니다.

<div class="sade-links" markdown>

[**설치와 첫 연결**<span>Docker로 설치하고 첫 자료를 연결합니다</span>](getting-started/quickstart.md)

[**연동 가이드**<span>소스 코드, OpenAPI 명세, 로그(CSV, syslog, Kafka)를 연결하는 방법</span>](connect/logs.md)

[**관리 우선순위**<span>API마다 P1~P4를 매기는 기준과 근거</span>](features/priority.md)

[**화면 둘러보기**<span>메뉴 구성과 각 화면에서 할 수 있는 일</span>](getting-started/navigation.md)

</div>

## SADE가 답하는 질문

| 보안 담당자의 질문 | SADE 화면 |
|---|---|
| 우리 회사에 어떤 API가 있나? 명세에 없는 API는? | [Inventory](features/inventory.md): Shadow, Undocumented 표시 |
| 많은 API 중 무엇부터 봐야 하나? | [관리 우선순위](features/priority.md): P1~P4와 판정 근거 |
| 어느 API가 외부에서 호출되고, 민감정보를 주고받나? | [API 상세](features/api-details.md): 노출, 인증 선언, 민감 유형 |
| 요청이 어느 서비스를 거쳐 DB와 외부로 가나? | [Flows](features/flows.md): 서비스, API, DB, 외부 목적지 연결 |
| 이 API는 누가 고쳐야 하나? | [API 상세](features/api-details.md)의 Owners: CODEOWNERS 담당 후보 |

## 입력은 세 가지입니다

| 입력 | 받는 방법 | 알 수 있는 것 |
|---|---|---|
| **소스 코드** | GitHub 저장소 스캔 (GitHub.com, Enterprise Cloud, Enterprise Server) | 코드에 선언된 API, 코드 위치, 인증 선언, 서비스 사이 호출, DB 접근, 게이트웨이 경로 규칙 |
| **명세** | OpenAPI 3.0, 3.1 JSON 업로드 또는 내부 주소에서 가져오기 | 문서로 관리되는 API와 필드 |
| **로그** | CSV 업로드, syslog(TLS) 수신, Kafka 구독 | 실제로 호출된 API, 호출 수, 호출한 주소, 서비스 사이 흐름 |

셋 중 하나만으로도 시작할 수 있고, 더할수록 서로의 빈 곳을 메웁니다. API마다 어느 입력에서 확인했는지 `Code`, `Spec`, `Log`로 표시합니다.

## 지키는 원칙

- **추측하지 않습니다.** 근거가 모자라면 "모름"이나 "미평가"로 남깁니다. 확인하지 못한 것을 안전하다고 표시하지 않습니다.
- **실행하지 않습니다.** 코드는 읽기만 하고, 서비스에 요청을 보내지 않습니다.
- **값을 남기지 않습니다.** 로그 본문은 저장 전에 값을 타입으로 바꾸고, 민감정보는 유형 이름만 남깁니다.

SADE가 보여 주는 것은 **수집한 범위 안에서 확인한 사실과 검토 신호**입니다. 취약점이나 법 위반을 확정하지 않으며, 담당자가 먼저 볼 대상을 좁혀 주는 역할을 합니다. 자세한 범위는 [지원 범위와 제한](reference/limitations.md)을 보세요.
