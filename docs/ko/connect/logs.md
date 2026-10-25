# 로그 연결 개요

SADE는 기업이 이미 쌓고 있는 로그 저장소(SIEM, Data Lake)에서 HTTP 로그를 가져와 API를 식별합니다.
에이전트를 설치하거나 트래픽을 가로채지 않습니다.

## 지원하는 연동

| 연동 | 분류 | 가져오는 방식 | 문서 |
|---|---|---|---|
| Splunk | SIEM | Search REST API (`/services/search/v2/jobs/export`) | [Splunk 연결](splunk.md) |
| Cloudera | Data Lake | WebHDFS (HDFS에 저장된 JSONL 파일) | [Cloudera 연결](cloudera.md) |

!!! info "지원하지 않는 연동"
    Elasticsearch, Amazon S3 직접 연결은 아직 지원하지 않습니다.

## 연결 순서

1. **Connect > Log Sources**의 Integrations에서 Splunk 또는 Cloudera를 고릅니다.
2. 접속 정보와 수집 범위를 입력합니다.
3. **Test connection**으로 접속과 조회 권한을 확인합니다. (저장하지 않음)
4. **Save**로 연결을 저장합니다. (저장했다고 접속이 성공한 것은 아님)
5. **Run scan**으로 로그를 수집하고 분석합니다. 수집 상태만 확인할 때는 **Sync**를 사용할 수 있습니다.
6. **APIs > Inventory**, **Call History**에서 결과를 봅니다.

- OpenAPI 명세를 먼저 등록하지 않아도 연결할 수 있습니다.
- 서비스에 배정되지 않은 로그도 Inventory에 나오며, 명세가 준비되면 나중에 배정할 수 있습니다.
- Run scan에 수집이 포함되므로 Sync를 먼저 실행할 필요는 없습니다. [스캔과 작업](../operations/scans.md)을 확인하세요.

## 지원하는 로그 형식

| 로그 종류 | 형식 | 분석 | 조건 |
|---|---|---|---|
| API 게이트웨이 로그 | JSON HTTP 이벤트 | Inventory, Call History | 시각, 메서드, 경로, 상태 코드 필요 |
| 웹 접근 로그 | JSON HTTP 이벤트 | Inventory, Call History | combined 텍스트 형식은 JSON으로 변환 필요 |
| 애플리케이션 로그 | JSON HTTP 이벤트 | Inventory, Call History | HTTP 필드 필요. 오류 메시지만으로는 분석 불가 |
| 인증 로그 | JSON 인증 이벤트 | 원격 연동은 예정 | 현재 파일 가져오기에서만 요약 지원 |
| Syslog 텍스트 | 지원 안 함 | - | JSON으로 변환 필요 |

- 이벤트 하나가 JSON 객체 하나여야 합니다. (Splunk는 `_raw`, Cloudera는 파일의 한 줄)
- 게이트웨이, 접근, 애플리케이션 같은 로그 이름과 관계없이 HTTP 필드만 있으면 처리합니다.

## 로그 필드

### 필수 필드

| SADE 필드 | 설명 | 자동 감지 예시 |
|---|---|---|
| `timestamp` | 요청 시각 (ISO 8601 + 시간대, 또는 epoch 초, 밀리초) | `@timestamp`, `_time`, `timestamp`, `observed_at_epoch` |
| `method` | HTTP 메서드 | `method`, `http.request.method`, `request_method` |
| `path` | 요청 경로 | `request_path`, `url.path`, `uri`, `request.uri` |
| `status` | 응답 상태 코드 | `status`, `status_code`, `http.response.status_code` |

필수 필드가 없는 이벤트는 건너뜁니다.

### 권장 필드

| SADE 필드 | 있으면 알 수 있는 것 | 자동 감지 예시 |
|---|---|---|
| `service` | 서비스별로 API 구분 | `service.name`, `service`, `kubernetes.labels.app` |
| `request_id` | 같은 요청의 여러 로그 연결 | `request_id`, `trace_id`, `correlation_id` |
| `hop_id` | 서비스 간 호출 한 번을 양쪽 로그에서 연결 | `hop_id` |
| `event_type` | 받은 요청(inbound)인지 보낸 요청(outbound)인지 | `event_type`, `span.kind`, `direction` |
| `destination` | 외부 목적지 | `destination.address`, `upstream_host` |
| `client_ip` | 호출 출처 | `client_ip`, `source.ip`, `remote_addr` |
| `duration_ms`, `response_bytes` | 응답 시간, 크기 | `duration_ms`, `bytes_sent` |
| `request_headers`, `response_headers` | 인증 방식, 헤더 | `request.headers` |
| `request_body`, `response_body` | 필드 명세화, 민감정보 탐지 | `request.body`, `response_body` |

- 헤더와 본문은 선택입니다. 없으면 "수집 안 됨"으로 표시하며, 비어 있다거나 개인정보가 없다고 판단하지 않습니다.
- 본문은 JSON 객체, 배열 또는 JSON 문자열을 지원합니다.

### 필드 매핑 {#field-mapping}

- **Auto-detect (기본)**: 가져온 이벤트에서 위 예시 이름을 찾아 값 형식까지 확인하고 가장 잘 맞는 필드를 고릅니다.
  Elastic ECS, OpenTelemetry, Envoy, NGINX JSON, Kong, Splunk CIM 이름을 포함합니다.
- **Manual**: 필드 경로를 직접 입력합니다. 값이 아니라 **경로**를 씁니다.
    - 예: 로그가 `{"http":{"method":"GET"}}`이면 Method에 `http.method`
- **Log profile (선택)**: 회사 고유 필드 이름을 JSON 파일로 등록하면 기본 이름보다 먼저 찾습니다.

```json
{
  "field_aliases": { "path": ["req.full_path"], "service": ["app_name"] },
  "client_event_types": ["egress_call"]
}
```

## 로그를 서비스로 나누기 {#routing}

연결 설정의 **Service**에서 고릅니다.

| 선택 | 동작 | 언제 쓰나 |
|---|---|---|
| Assign later | 서비스 미배정 (Unassigned) | 명세를 아직 등록하지 않았을 때 |
| 특정 서비스 | 이 연결의 로그 전체를 한 서비스로 | 서비스마다 인덱스나 경로가 나뉘어 있을 때 |
| All services, by path prefix | 경로 앞부분으로 서비스 결정 (예: `/orders` → order 서비스) | 게이트웨이 로그 하나에 여러 서비스가 섞일 때 |
| All services, by logged service name | 로그의 서비스 필드 값으로 결정 | 로그에 서비스 이름이 있을 때 |

- 서비스는 **Connect > Specifications**에서 등록합니다. (이름, base URL, 경로 prefix, OpenAPI)
- 로그의 서비스 값은 서비스 ID, 별칭, 내부 호스트 이름(`*.svc`, `*.internal` 등)과 맞춰 봅니다.
- 어느 서비스에도 맞지 않는 호출은 Unassigned로 표시합니다.

## 같은 호출이 여러 번 기록될 때

- 같은 `hop_id`를 가진 inbound, outbound 이벤트는 호출 하나로 합칩니다.
- `hop_id`가 없으면 같은 요청 ID, 메서드, 경로, 상태 코드가 모두 같을 때만 합칩니다. 시각이 비슷하다는 이유로 합치지 않습니다.

## 보안과 저장

- 인증 토큰은 설정과 분리해 SADE 서버의 DB에 저장하며, 화면이나 내보내기에 포함하지 않습니다.
- 접속 주소나 인증 방식이 바뀌면 저장된 토큰을 다시 쓰지 않습니다.
- TLS 인증서 검증을 항상 합니다. 사내 인증서는 CA 파일 경로로 지정하며, 검증을 끄는 옵션은 없습니다.
- 화면에 보이는 헤더, 본문 값은 타입(`<string>` 등)으로 바뀌어 표시됩니다. ([마스킹과 데이터 보관](../operations/masking.md))

## 제한

| 항목 | 한도 |
|---|---|
| 한 번에 가져오는 양 | 연결당 10 MB (넘으면 실패, 일부만 분석하지 않음) |
| 요청 대기 시간 | 90초 |
| 등록 수 | 서비스 100개, 로그 연결 100개 |
