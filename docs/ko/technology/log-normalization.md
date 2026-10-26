# 로그 정규화와 필드 감지

회사마다 로그 모양이 다릅니다. 같은 "HTTP 메서드"가 어떤 곳은 `method`, 어떤 곳은 `http.request.method`, 또 어떤 곳은 `verb`입니다. SADE는 이 차이를 사용자가 매핑하지 않아도 되게 **로그를 보고 필드를 스스로 찾습니다.** 그리고 어디서 왔든 같은 모양의 레코드로 바꿔 다음 단계에 넘깁니다.

## 두 단계로 나눈 이유

<div class="sade-pipe" markdown>
<div markdown>**전송 (Transport)**<p>로컬 파일, Splunk REST, WebHDFS</p></div>
<div class="is-key" markdown>**형식 해석 (Adapter)**<p>JSONL, nginx combined, OTel span, 인증 로그</p></div>
<div markdown>**공통 레코드**<p>모든 분석이 같은 모양을 읽음</p></div>
</div>

"어떻게 가져오는가"와 "어떻게 읽는가"를 분리했습니다. Splunk에서 온 JSON이든 HDFS 파일의 JSON이든 같은 형식 해석기를 씁니다. 그래서 새 SIEM을 붙일 때는 전송 부분만 만들면 되고, 필드 감지와 분석은 그대로 씁니다.

## 필드 자동 감지

<div class="sade-steps" markdown>

1. **펼치기.** 중첩된 JSON을 점으로 이은 경로로 펼칩니다. `{"http":{"request":{"method":"GET"}}}`는 `http.request.method`가 됩니다. 깊이 4단계까지 봅니다.
2. **모양별로 묶기.** 키 구성이 같은 이벤트끼리 묶습니다. 한 인덱스에 게이트웨이 로그와 앱 로그가 섞여 있어도 묶음마다 따로 감지합니다.
3. **후보 이름 시험하기.** SADE 필드마다 흔히 쓰는 이름 목록이 있습니다. 묶음 안의 이벤트에서 각 이름의 값이 그 필드답게 생겼는지 셉니다.
4. **가장 많이 맞는 이름 고르기.** 가장 많은 이벤트에서 맞은 이름을 그 필드로 정합니다. 회사 전용 이름(Log profile)이 있으면 그 이름을 먼저 시험합니다.
5. **필수 필드 확인.** 시각·메서드·경로·상태 코드 중 하나라도 못 찾은 묶음은 HTTP 이벤트가 아닌 것으로 보고 건너뜁니다. 건너뛴 수는 소스 상태에 표시합니다.

</div>

### "그 필드답게 생겼다"의 기준

이름만 보지 않고 **값의 모양**까지 확인합니다. 그래서 `status`라는 이름이어도 값이 `"ok"`면 상태 코드로 쓰지 않습니다.

| 필드 | 값 조건 |
|---|---|
| 메서드 | `GET`, `POST` 등 HTTP 메서드 9개 중 하나 |
| 경로 | `/`로 시작하거나 `https://호스트/경로` 형태 (경로만 떼어 씀) |
| 상태 코드 | 100~599 정수 |
| 시각 | 시간대가 있는 ISO 8601, 또는 epoch 초·밀리초 |
| 요청 ID, 서비스, 호출 대상 | 256자 이하 문자열이나 정수 |
| trace ID / span ID | 0이 아닌 32자리 / 16자리 16진수 |
| 헤더 | JSON 객체 |

시간대가 없는 시각(`2026-10-26 09:12:03`)은 추측하지 않고 오류로 처리합니다. 서버마다 시간대가 달라서 잘못 맞추면 요청 순서와 수집 구간이 모두 틀어지기 때문입니다.

### 인식하는 형식

후보 이름 목록에는 Elastic ECS, OpenTelemetry semantic conventions, Envoy, NGINX JSON, Kong, Splunk CIM에서 쓰는 이름이 들어 있습니다. 예를 들어 경로 후보는 `request_path`, `path`, `url.path`, `request_uri`, `http.target`, `url.original` 등 16개입니다.

[연동 한눈에 보기](../connect/logs.md#log-check)의 로그 확인기는 이 목록을 그대로 써서 판단합니다.

## 본문 형태 구분

본문은 세 가지 형태로 들어올 수 있고, SADE가 알아서 구분합니다.

=== "값이 있는 본문"

    ```json
    {"response_body": {"id": 7, "email": "user@example.com"}}
    ```
    값으로 민감정보를 확인하고, 필드 이름과 타입을 명세와 비교합니다. 저장할 때는 값을 지웁니다.

=== "필드 이름만"

    ```json
    {"response_body": {"status": "observed", "fields": [{"path": "$.email", "data_type": "string"}]}}
    ```
    값을 남기지 않는 수집기가 쓰는 형태입니다. 명세 비교에는 그대로 쓰고, 값 검증은 하지 않습니다. 목록이 잘렸거나(`partial_schema`, 2,000개 초과) 일부만 있으면 "명세 외 필드 없음"을 결론 내리지 않습니다.

=== "수집 상태 봉투"

    ```json
    {"response_body": {"state": "captured", "data": {"id": 7}}}
    ```
    Kong 본문 로깅 플러그인처럼 "수집됨, 비어 있음, 너무 커서 생략" 같은 상태를 함께 남기는 형태입니다.

본문이 없는 로그는 "수집 안 됨"으로 남깁니다. 빈 본문이나 개인정보 없음으로 판단하지 않습니다.

## 공통 레코드

해석이 끝난 로그 한 줄은 이런 모양이 됩니다(일부 필드).

| 필드 | 내용 |
|---|---|
| `method`, `request_path`, `status`, `observed_at_epoch` | 핵심 네 가지 |
| `request_id`, `_correlation_id` | 요청 ID. 없으면 줄 내용으로 만든 내부 ID를 쓰고, 실제 요청 ID처럼 표시하지 않음 |
| `request_headers`, `response_headers` | 헤더 객체와 수집 여부 |
| `request_body`, `response_body` | 본문 상태와 내용 |
| `client_ip`, `_forwarded_for` | 접속 IP, X-Forwarded-For의 첫 주소 |
| `_service`, `_destination`, `_event_type`, `_hop_id` | 흐름 분석용 |
| `_trace_id`, `_span_id`, `_parent_span_id` | Access·App 로그의 trace. 없으면 `traceparent`에서 채움 |
| `_source_id`, `_source_ref`, `_native_locator` | 어느 소스의 어느 줄인지 (Splunk `_cd`, HDFS 파일 위치) |

### 자잘하지만 중요한 처리

- 접근 로그가 헤더가 없을 때 쓰는 `-`는 "값 없음"으로 봅니다. `-`를 요청 ID로 쓰지 않습니다.
- `X-Forwarded-For: 203.0.113.7, 10.0.0.2`에서는 첫 주소만 원래 클라이언트로 남깁니다. `client_ip`는 직전 구간 주소 그대로 둡니다.
- 방향 필드가 `client`, `SPAN_KIND_CLIENT`, `outbound`, `egress`이면 보낸 요청으로 봅니다. 방향이 없으면 받은 요청으로 봅니다.
- 같은 이벤트를 두 번 가져와도 내용으로 만든 키로 한 번만 남깁니다.

## 한계

- 일반 syslog 텍스트나 combined 텍스트는 원격 연결에서 직접 읽지 않습니다. JSON으로 바꿔야 합니다.
- 한 연결은 하나의 매핑을 씁니다. 형식이 크게 다른 로그는 sourcetype이나 경로로 나눠 연결을 따로 만드세요.
- 필드 감지는 이름과 값 모양으로 판단합니다. 같은 모양의 다른 의미 필드(예: 두 종류의 상태 코드)는 수동 매핑으로 정해야 합니다.
