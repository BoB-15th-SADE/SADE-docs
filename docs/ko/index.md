# SADE

SADE는 기업의 소스 코드, API 명세(OpenAPI), 로그를 합쳐 API 목록(Inventory)과 서비스 사이 호출 흐름(Flows)을 만들고, API마다 관리 우선순위(P1~P4)를 매기는 도구입니다. 보안 담당자는 이 결과로 먼저 검토할 API를 고르고, API 보안 관리 프레임워크의 점검 기준에 걸린 API를 담당자에게 넘깁니다.

SADE는 기업 내부망에 Docker 컨테이너로 설치합니다. 이미 있는 자료를 읽어 분석하므로 트래픽 경로에 장비를 두지 않고, API를 호출해 점검하거나 요청을 막지 않습니다.

소스 코드는 GitHub API로 읽기만 합니다. 로그 본문의 값은 저장 전에 타입으로 바꾸고, 민감정보는 유형 이름만 남깁니다.

<div class="sade-links" markdown>

[<span class="sade-card-title">보안 검토 자료</span><span>저장하는 것, 네트워크, 인증 정보 보관</span>](getting-started/security-review.md)

[<span class="sade-card-title">설치와 첫 연결</span><span>Docker로 설치하고 첫 자료를 연결합니다</span>](getting-started/quickstart.md)

[<span class="sade-card-title">샘플로 첫 결과 보기</span><span>샘플 CSV 하나로 Inventory와 우선순위를 확인합니다</span>](getting-started/first-run.md)

[<span class="sade-card-title">점검 흐름</span><span>자료 연결부터 담당자 전달까지 7단계</span>](getting-started/workflow.md)

[<span class="sade-card-title">연동 가이드</span><span>소스 코드, OpenAPI 명세, 로그(CSV, syslog, Kafka)</span>](connect/logs.md)

[<span class="sade-card-title">관리 우선순위</span><span>P1~P4를 정하는 신호와 규칙</span>](features/priority.md)

[<span class="sade-card-title">보안 점검과 SADE AI</span><span>프레임워크 점검 103개, 조치 요청서, AI 채팅</span>](features/assessments.md)

[<span class="sade-card-title">동작 원리</span><span>API 식별, 로그 처리, 코드 스캔, 민감정보, 노출 판정</span>](how-it-works/index.md)

</div>

## 화면별로 확인하는 것

| 확인할 것 | 화면 |
|---|---|
| 기업에 있는 API, 명세에 없는 API | [Inventory](features/inventory.md)의 Shadow, Undocumented 표시 |
| 먼저 검토할 API | [관리 우선순위](features/priority.md)의 P1~P4와 판정 근거 |
| 외부에서 호출되는 API, 민감정보를 주고받는 API | [API 상세](features/api-details.md)의 노출, 인증 선언, 민감 유형 |
| 요청이 지나가는 서비스, DB, 외부 목적지 | [Flows](features/flows.md)의 서비스 맵 |
| API 하나를 부르는 쪽과 그 API가 닿는 테이블 | [Flows](features/flows.md#api)의 API별 흐름 |
| 프레임워크 기준에 걸린 API와 조치 요청서 | [Assessment](features/assessments.md) |
| API를 고칠 담당 후보 | [API 상세](features/api-details.md#owner) 요약의 담당자 (CODEOWNERS) |

## 입력

| 입력 | 받는 방법 | 알 수 있는 것 |
|---|---|---|
| 소스 코드 | GitHub 저장소 스캔 (GitHub.com, Enterprise Cloud, Enterprise Server). Java Spring Boot만 지원 | 코드에 선언된 API와 위치, 인증 선언, 서비스 사이 호출, DB 접근, 게이트웨이 경로 규칙 |
| 명세 | OpenAPI 3.0, 3.1 JSON 업로드, 내부 주소에서 가져오기 | 문서로 관리하는 API와 필드 |
| 로그 | CSV 업로드, syslog(TLS) 수신, Kafka 구독 | 실제 호출된 API, 호출 수, 호출한 주소, 서비스 사이 흐름 |

입력 하나만 있어도 결과가 나옵니다. API마다 확인한 입력을 `Code`, `Spec`, `Log`로 표시합니다.

## 현재 지원 범위 {#support}

| 구분 | 지원 | 아직 지원하지 않음 |
|---|---|---|
| 코드 분석 | Java Spring Boot. `@RestController`, `@GetMapping` 같은 어노테이션으로 선언한 HTTP API | Kotlin, Node.js, Python, Go 등 다른 언어. Spring WebFlux 함수형 라우터 |
| 코드 저장소 | GitHub.com, GitHub Enterprise Cloud, Enterprise Server | GitLab, Bitbucket, 폴더 업로드 |
| 명세 | OpenAPI 3.0, 3.1 JSON | YAML, Swagger 2.0 |
| 로그 | CSV 업로드, syslog, Kafka. JSON, nginx, Apache 형식 | SIEM 직접 연동 |
| API 종류 | HTTP REST API | GraphQL, gRPC, SOAP |
| 배포 설정 | docker compose | Kubernetes, Helm |

- Spring Boot가 아닌 서비스도 OpenAPI 명세와 로그를 넣으면 API 목록, 호출 흐름, 관리 우선순위를 볼 수 있습니다. 코드에서만 알 수 있는 인증 선언, 핸들러 위치, 담당자 후보는 비어 있습니다.
- 자세한 한도는 [지원 범위와 제한](reference/limitations.md)에 있습니다.

## 결과를 읽을 때

결과는 연결한 자료 안에서 확인한 사실입니다. 근거가 모자란 항목은 "모름"이나 "미평가"로 남기고 안전으로 표시하지 않습니다. 미평가가 많은 API는 자료를 더 연결한 뒤 다시 봅니다.

취약점이나 법 위반 여부는 판정하지 않습니다. 판정하지 않는 범위는 [지원 범위와 제한](reference/limitations.md)에 있습니다.
