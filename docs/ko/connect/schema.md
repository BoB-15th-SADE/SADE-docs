# 로그 필드

SADE는 로그를 [ECS(Elastic Common Schema)](https://www.elastic.co/guide/en/ecs/current/index.html) 필드 이름으로 바꿔 저장합니다.

기업 필드 이름이 달라도 대응 관계만 정하면 됩니다. 필수 필드 4개로 API 목록을 만들고, 필드가 늘면 Flows와 관리 우선순위 근거가 늘어납니다.

| 구분 | 필드 | 뜻 | 없을 때 |
|---|---|---|---|
| 필수 | `@timestamp` | 요청 시각 | 최초, 마지막 호출 시각과 분석 기간에 업로드 시각을 씀 |
| 필수 | `service.name` | 요청을 처리한 서비스 | API와 흐름에 서비스가 없음 |
| 필수 | `http.request.method` | HTTP 메서드 | API 목록이 빌 수 있음 |
| 필수 | `url.path` | 요청 경로 (호스트, 쿼리 제외) | API 목록이 빌 수 있음 |
| 서버 | `host.name` | 로그를 남긴 서버, 컨테이너 | 서비스에 서버 정보가 없음 |
| 흐름 | `client.ip` | 요청을 보낸 쪽 IP | Flows에 클라이언트 IP가 없음 |
| 흐름 | `network.forwarded_ip` | 프록시가 넘긴 원래 클라이언트 IP (X-Forwarded-For) | Flows에 원래 클라이언트 IP가 없음 |
| 흐름 | `network.direction` | 받은 요청(inbound)과 보낸 호출(outbound) 구분 | 서비스 사이 호출을 trace ID로만 찾음 |
| 흐름 | `destination.address` | 보낸 호출의 목적지 (호스트나 서비스) | 다른 서비스, DB, 외부 호스트로 가는 호출이 빠짐 |
| 흐름 | `trace.id`, `span.id`, `parent.id` | 한 요청의 모든 단계가 공유하는 ID, 단계별 ID, 부른 단계의 ID | 호출을 방향과 목적지로만 찾음 |
| 분류 | `event.category` | 로그 분류 (예: web, database) | |
| 분류 | `service.type` | 서비스 역할 (예: gateway) | 게이트웨이 로그를 목적지가 있는지로만 구분함 |
| 세부 | `http.response.status_code` | 응답 코드 | 응답 코드별 수가 비어 있음 |
| 세부 | `http.request.id` | 앱이나 프록시가 붙인 요청 ID | 두 로그의 같은 요청을 trace ID로만 맞춤 |
| 세부 | `destination.port` | 목적지 포트 | DB 호출을 이름으로만 구분함 |
| 본문 | `http.request.body.content`, `http.response.body.content` | 요청, 응답 본문 | 로그에서 민감정보를 찾지 않음 |

## 본문 저장 방식

본문이 있으면 저장 전에 민감 유형을 찾고 값을 타입으로 바꿉니다. 필드 이름, 타입, 찾은 민감 유형 이름만 남습니다.

```text
{"phone":"010-1234-5678","age":31}  →  {"phone":"<string>","age":"<integer>"}
```

데이터 처리 방식은 [구성과 데이터 처리](../operations/architecture.md)에 있습니다.
