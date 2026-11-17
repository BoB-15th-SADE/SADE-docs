# 로그 필드

로그는 [ECS(Elastic Common Schema)](https://www.elastic.co/guide/en/ecs/current/index.html) 필드 이름으로 바꿔 저장합니다. 회사 필드 이름이 달라도 대응 관계만 정하면 됩니다. 필수 네 개만 있어도 API 목록을 만들 수 있고, 필드가 늘수록 Flows, 접근 범위, 우선순위 근거가 채워집니다.

| 구분 | 필드 | 뜻 | 없으면 |
|---|---|---|---|
| 필수 | `@timestamp` | 요청 시각 | 최초, 마지막 호출 시각과 기간이 업로드 시각이 됨 |
| 필수 | `service.name` | 요청을 처리한 서비스 | API와 흐름에 서비스가 없음 |
| 필수 | `http.request.method` | HTTP 메서드 | API 목록이 비어 있을 수 있음 |
| 필수 | `url.path` | 요청 경로 (호스트, 쿼리 제외) | API 목록이 비어 있을 수 있음 |
| 서버 | `host.name` | 로그를 남긴 서버, 컨테이너 | 서버 정보가 없음 |
| 흐름 | `client.ip` | 요청을 보낸 쪽 IP | 접근 범위(Public, Partner, Internal)를 판정하지 못함 |
| 흐름 | `network.forwarded_ip` | 프록시가 전달한 원래 클라이언트 IP (X-Forwarded-For) | |
| 흐름 | `network.direction` | 받은 요청(inbound)과 보낸 호출(outbound) 구분 | |
| 흐름 | `destination.address` | 보낸 호출의 목적지 (호스트나 서비스) | 외부 목적지, 서비스 사이 선이 줄어듦 |
| 흐름 | `trace.id`, `span.id`, `parent.id` | 한 요청의 모든 단계가 공유하는 ID와 단계별 ID | 서비스 사이 호출을 잇기 어려움 |
| 분류 | `event.category` | 로그 분류 (예: web, database) | |
| 분류 | `service.type` | 서비스 역할 (예: gateway) | 게이트웨이 우회 판정이 약해짐 |
| 세부 | `http.response.status_code` | 응답 코드 | |
| 세부 | `http.request.id` | 앱이나 프록시가 붙인 요청 ID | |
| 세부 | `destination.port` | 목적지 포트 (DB 호출 구분) | |
| 본문 | `http.request.body.content`, `http.response.body.content` | 요청, 응답 본문 | 로그로 민감정보를 찾지 못함 |

## 본문은 어떻게 저장되나

본문이 있으면 저장 전에 민감 유형을 찾고, 값은 타입으로 바꿉니다. 남는 것은 필드 이름, 타입, 찾은 민감 유형 이름뿐입니다.

```text
{"phone":"010-1234-5678","age":31}  →  {"phone":"<string>","age":"<integer>"}
```

자세한 내용은 [구성과 데이터 처리](../operations/architecture.md)를 보세요.
