# 연동 한눈에 보기

SADE는 이미 쌓여 있는 로그와 문서를 읽습니다. 서비스에 에이전트를 설치하거나 트래픽을 가로채지 않습니다. 이 페이지에서 무엇을 연결할 수 있는지, 로그에 무엇이 남아 있어야 하는지 먼저 확인하세요.

## 연결할 수 있는 것

<div class="sade-catalog" markdown>

[**Splunk**<span>Search REST API로 인덱스 검색</span><span class="sade-pill ok">지원</span>](splunk.md)

[**Cloudera**<span>WebHDFS로 HDFS의 JSONL 파일 읽기</span><span class="sade-pill ok">지원</span>](cloudera.md)

[**로그 파일**<span>Access 로그, Application 로그, SIEM CSV 내보내기</span><span class="sade-pill ok">지원</span>](files.md)

[**OpenTelemetry**<span>OTLP JSON, span JSONL 파일</span><span class="sade-pill ok">지원</span>](files.md#opentelemetry)

[**OpenAPI 명세**<span>OpenAPI 3.0 / 3.1 JSON 업로드</span><span class="sade-pill ok">지원</span>](specs.md)

[**GitHub**<span>저장소를 골라 코드에서 API와 호출 관계 추출</span><span class="sade-pill ok">지원</span>](code.md)

<div markdown>**Elasticsearch / OpenSearch**<span>직접 연결은 아직 없음. JSONL로 내보내 파일로 연결</span><span class="sade-pill no">미지원</span></div>

<div markdown>**Amazon S3**<span>직접 연결은 아직 없음. 내려받아 파일로 연결</span><span class="sade-pill no">미지원</span></div>

<div markdown>**Syslog 원문**<span>JSON 이벤트로 바꿔서 연결</span><span class="sade-pill no">미지원</span></div>

</div>

명세, 코드, 로그는 순서와 상관없이 하나씩 붙일 수 있습니다. 명세만 올려도 API 목록과 민감정보 후보가 나오고, 로그를 붙이면 실제 호출이, 코드를 붙이면 구현 근거와 서비스 간 호출이 더해집니다.

## 처음 연결하는 순서

<div class="sade-steps" markdown>

1. **로그를 연결합니다.** Connect › Log Sources에서 Splunk나 Cloudera를 고르고 접속 정보만 넣습니다. 수집 기간과 주기는 기본값이 있습니다.
2. **Test connection**으로 접속과 검색 권한을 확인한 뒤 **Save connection**을 누릅니다. 저장은 접속 성공을 뜻하지 않습니다.
3. **Collect now**로 로그를 가져옵니다. API 인벤토리, 민감정보, Flows가 채워집니다.
4. (선택) Connect › Specifications에서 OpenAPI 명세를 올립니다. 명세가 있어야 Shadow API와 명세 점검이 나옵니다.
5. **Run scan**으로 명세 점검을 실행합니다. 저장된 수집 결과만 쓰므로 SIEM에 다시 접속하지 않습니다.

</div>

## 로그에 남아 있어야 하는 것

로그 이름(게이트웨이, 접근 로그, 애플리케이션 로그)은 상관없습니다. **이벤트 하나가 JSON 객체 하나**이고 아래 필드가 있으면 됩니다. 필드 이름은 SADE가 흔한 형식(Elastic ECS, OpenTelemetry, Envoy, NGINX JSON, Kong, Splunk CIM)에서 자동으로 찾습니다.

=== "필수"

    | 필드 | 예시 필드 이름 | 없으면 |
    |---|---|---|
    | 시각 | `time`, `@timestamp`, `_time` | 수집하지 않음 |
    | 메서드 | `method`, `http.request.method` | 수집하지 않음 |
    | 경로 | `path`, `url.path`, `request_uri` | 수집하지 않음 |
    | 상태 코드 | `status`, `http.response.status_code` | 수집하지 않음 |

    이 네 가지만 있어도 **API 인벤토리, 호출 수, Shadow API**가 나옵니다. 시각은 시간대(`Z` 또는 `+09:00`)가 있는 ISO 8601이나 epoch 초·밀리초여야 합니다.

=== "권장"

    | 필드 | 예시 | 더해지는 기능 |
    |---|---|---|
    | 요청 ID | `request_id`, `X-Request-ID` | 게이트웨이 로그와 서비스 로그를 한 호출로 합침 |
    | 요청 헤더 | `Authorization`, `Cookie`, `X-API-Key` | 인증 방식 분석, 인증 없이 성공한 호출 탐지 |
    | 응답 본문 | 값, 또는 필드 이름과 타입만 | 호출별 명세 점검, 값으로 민감정보 확인 |
    | 서비스 이름 | `service.name` | 경로 접두사 없이도 서비스 구분 |

    인증 헤더는 값이 가려져 있어도 됩니다. `Bearer ***`처럼 방식 단어만 남아 있으면 인증 방식을 읽습니다.

=== "있으면 더 좋음"

    | 필드 | 예시 | 더해지는 기능 |
    |---|---|---|
    | Trace | `traceId`, `spanId`, `parentSpanId`, W3C `traceparent` | 가장 정확한 서비스 간 호출 흐름 |
    | 호출 대상, 방향 | `destination.address`, `span.kind` | 누가 누구를 불렀는지 |
    | 원래 클라이언트 | `X-Forwarded-For` | 프록시 뒤의 실제 호출자 IP |
    | 접속 IP | `client_ip`, `remote_addr` | 호출자 구분 |
    | 응답 시간, 크기 | `duration_ms`, `bytes_sent` | Call History 표시 |

헤더와 본문은 선택입니다. 없으면 "수집 안 됨"으로 표시하고, 비어 있다거나 개인정보가 없다고 판단하지 않습니다.

### 내 로그로 확인해 보기 {#log-check}

로그 한 줄을 붙여 넣으면 SADE가 어떤 필드를 찾는지, 어떤 기능을 쓸 수 있는지 바로 보여 줍니다. 브라우저 안에서만 확인하고 어디로도 보내지 않습니다. 실제 값 대신 가린 값이나 예시를 넣어도 결과는 같습니다.

<div class="sade-logcheck" data-lang="ko">
  <div class="sade-logcheck__head"><span>로그 한 줄 (JSON)</span><div class="sade-logcheck__samples"><button type="button" data-sample="nginx">nginx JSON</button><button type="button" data-sample="ecs">Elastic ECS</button><button type="button" data-sample="minimal">필수만</button><button type="button" data-sample="broken">JSON 아닌 형식</button></div></div>
  <textarea spellcheck="false" aria-label="로그 한 줄" placeholder='{"time":"2026-10-26T09:12:03+09:00","method":"GET","path":"/api/orders/1","status":200}'></textarea>
  <div class="sade-logcheck__note">자동 감지와 같은 별칭 목록으로 판단합니다. traceparent는 Flow 로그 유형이 Access인 소스에서 읽습니다.</div>
  <div class="sade-logcheck__result" aria-live="polite"></div>
</div>

[<span class="q">궁금하신가요?</span><span class="t">필드를 어떻게 자동으로 찾고, 형식이 다른 로그를 어떻게 한 모양으로 맞추는지</span><span class="arrow">→</span>](../technology/log-normalization.md){ .sade-curious }

## 필드 매핑 {#field-mapping}

| 방식 | 언제 쓰나 |
|---|---|
| **Auto-detect** (기본) | 대부분. 가져온 이벤트에서 예시 이름을 찾고 값 형식까지 확인합니다. |
| **Manual** | 자동 감지가 다른 필드를 골랐을 때. 값이 아니라 **필드 경로**를 씁니다. 로그가 `{"http":{"method":"GET"}}`이면 Method에 `http.method`를 넣습니다. |
| **Log profile** | 회사 고유 필드 이름이 많을 때. 아래 JSON을 올리면 기본 이름보다 먼저 찾습니다. |

```json
{
  "field_aliases": { "path": ["req.full_path"], "service": ["app_name"] },
  "client_event_types": ["egress_call"]
}
```

## 로그를 서비스로 나누기 {#routing}

로그 하나에 여러 서비스의 호출이 섞여 있는 경우가 많습니다. 연결의 추가 설정 › **Service matching**에서 나누는 방법을 고릅니다. 경로 접두사가 등록된 서비스가 있으면 새 연결은 처음부터 경로 매칭으로 설정됩니다.

| 선택 | 동작 | 이럴 때 |
|---|---|---|
| Match by path prefix | 경로 앞부분으로 결정 (`/order/...` → order) | 게이트웨이 로그 하나에 여러 서비스가 섞임 |
| Match by service name in logs | 로그의 서비스 필드 값으로 결정 | 로그에 서비스 이름이 있음 |
| 특정 서비스 | 이 연결의 로그 전체를 한 서비스로 | 서비스마다 인덱스나 경로가 나뉘어 있음 |
| Assign later | 서비스 미배정 (Unassigned) | 아직 명세나 서비스를 등록하지 않음 |

서비스와 경로 접두사는 [OpenAPI 명세](specs.md) 화면에서 등록합니다. 어느 서비스에도 맞지 않는 호출은 Unassigned로 남고, 나중에 배정할 수 있습니다.

## Flow 로그 유형

추가 설정의 **Flow log type**은 서비스 간 흐름을 그릴 때 이 로그를 어떻게 쓸지 정합니다.

| 유형 | 뜻 | 호출 수 |
|---|---|---|
| Legacy HTTP log (기본) | 일반 HTTP 로그. 요청 ID로 같은 요청을 합침 | 셈 |
| Access log | 서비스가 **받은** 요청. trace와 `traceparent`를 읽음 | 셈 |
| Application log | 서비스가 **보낸** 요청 (호출자, 목적지) | 세지 않음. 호출자 정보만 더함 |

서비스 간 흐름이 중요하면 Access 로그와 Application 로그를 각각 연결하세요. 자세한 내용은 [로그 파일과 OpenTelemetry](files.md)에 있습니다.

## 보안과 저장

- 인증 토큰은 설정과 분리해 SADE 서버 DB의 별도 영역에 저장합니다. 화면, 내보내기, 작업 기록에 나오지 않습니다.
- 접속 주소나 인증 방식이 바뀌면 저장된 토큰을 다시 쓰지 않습니다.
- TLS 인증서를 항상 검증합니다. 사내 인증서는 CA 파일로 지정하고, 검증을 끄는 옵션은 없습니다.
- 수집 결과에는 본문·헤더의 **원문 값을 저장하지 않습니다.** 값은 `<string>` 같은 타입으로 바뀌고, 요청 ID와 trace ID는 해시로 바뀝니다. 클라이언트 IP는 그대로 남습니다.

[<span class="q">궁금하신가요?</span><span class="t">값을 지우고도 민감정보와 명세 차이를 판단하는 방법</span><span class="arrow">→</span>](../technology/value-free-storage.md){ .sade-curious }
