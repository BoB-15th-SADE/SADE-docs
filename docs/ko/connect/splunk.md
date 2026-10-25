# Splunk 연결

Splunk Search REST API로 인덱스에 저장된 JSON HTTP 로그를 검색해 가져옵니다.

## 빠른 설정

1. **Connect → Log Sources → Splunk → Connect**를 엽니다.
2. HTTPS Search API URL, Index, 인증 토큰과 수집 범위를 입력합니다.
3. Service 배정과 자동 Field mapping을 확인합니다.
4. **Test connection** 후 **Save**를 누릅니다.
5. **Run scan**으로 수집과 분석을 실행하고 Inventory에서 결과를 확인합니다.

## 준비물

| 항목 | 설명 |
|---|---|
| Search API URL | SADE 서버에서 접속 가능한 검색 헤드 관리 포트 (예: `https://splunk.company.internal:8089`) |
| 인덱스 | HTTP 로그가 있는 인덱스 (최대 10개) |
| 인증 토큰 | 해당 인덱스를 검색할 수 있는 Splunk 인증 토큰 |
| CA 인증서 (선택) | 사내 인증서를 쓰는 경우 |

!!! warning "HEC 토큰이 아닙니다"
    로그를 넣을 때 쓰는 HEC(HTTP Event Collector) 토큰이 아니라, **검색 권한이 있는 인증 토큰**이 필요합니다.
    Splunk Web의 **Settings > Tokens**에서 발급합니다. 해당 인덱스에 대한 검색 권한이 있는 역할의 사용자로 발급하세요.

## 설정 항목

### Connection

| 항목 | 필수 | 설명 |
|---|---|---|
| Name | 예 | 화면에 보일 연결 이름 |
| Search API URL | 예 | `https://`로 시작. 계정 정보나 쿼리 문자열을 넣을 수 없음 |
| Index | 예 | 쉼표로 여러 개 입력 (예: `api_gateway,service_access`) |
| Sourcetype | 아니요 | 같은 인덱스에 다른 형식 로그가 섞여 있을 때 지정 |
| Authentication token | 예 | Test, Sync에 필요. 비워 두면 저장된 토큰 유지 |
| CA certificate file | 아니요 | SADE 프로젝트 폴더 안의 인증서 파일 경로 |

### Collection

| 항목 | 설명 |
|---|---|
| Time range | 최근 1시간, 24시간, 7일, 30일, 직접 지정(From / To), Splunk 시간 문법 |
| Earliest / Latest | Splunk 문법 (`-24h@h`, `now`) 또는 Unix 시각 |
| Schedule | 수동, 1시간, 6시간, 매일. 예약 수집은 Latest가 `now` 또는 Unix 시각이어야 함 |

### API analysis

- **Service**: 로그를 서비스로 나누는 방식 ([로그를 서비스로 나누기](logs.md#routing))

### Field mapping

- 기본은 자동 감지이며, 시각 기본값은 Splunk의 `_time`입니다. ([필드 매핑](logs.md#field-mapping))

## SADE가 보내는 검색

```text
search (index="api_gateway" OR index="service_access") sourcetype="..." | fields _time _raw _cd index
```

- 입력한 인덱스와 sourcetype으로만 검색을 만듭니다. 사용자가 SPL을 직접 쓰지 않습니다.
- 결과의 `_raw`를 JSON 이벤트로 해석합니다. `_raw`가 JSON이 아닌 이벤트는 건너뛰며, 전부 JSON이 아니면 실패로 표시합니다.
- **Test connection**은 같은 검색에 `| head 20`을 붙여 20건만 확인합니다. 0건도 검색 성공입니다.

## 반복 수집

| Latest 값 | 다시 수집할 때 |
|---|---|
| `now` 또는 상대 시간 | 지난번 끝 시각에서 10분 겹쳐 지금까지 새로 검색 |
| 고정 Unix 시각 | 같은 고정 범위를 다시 검색 (현재 시각까지 늘리지 않음) |

- 겹친 결과는 Splunk 이벤트 ID(`_cd`) 또는 이벤트 내용으로 중복을 없앱니다.
- 가져온 이벤트는 연결별로 최근 10 MB까지 SADE DB에 보관하며, 화면을 열 때마다 Splunk를 다시 검색하지 않습니다.
- 이 증거 캐시는 원문 개인정보·인증정보를 포함할 수 있습니다. [마스킹과 데이터 보관](../operations/masking.md)을 확인하세요.
- 수집에 실패하거나 도중에 설정이 바뀌면 수집 위치(커서)를 앞으로 옮기지 않습니다.

## 자주 나는 오류

| 메시지 | 원인과 조치 |
|---|---|
| `Remote server returned HTTP 401` | 토큰이 틀렸거나 만료됨. 토큰 재발급 |
| `Remote server returned HTTP 403` | 인덱스 검색 권한 없음. 토큰 사용자 역할 확인 |
| `TLS failed: the server certificate is not trusted` | 사내 인증서. CA certificate file 지정 |
| `Cannot reach the remote server (no response)` | 주소, 포트, 방화벽 확인. 검색 범위가 너무 넓어 90초를 넘긴 경우 시간 범위를 줄임 |
| `Decoded Splunk results exceed 10 MB` | 시간 범위를 줄이거나 sourcetype으로 범위를 좁힘 |
| `Splunk returned only non-JSON events` | `_raw`가 JSON인 인덱스나 sourcetype 선택 |

## 참고

- Splunk 공식 문서: [Search endpoint descriptions](https://help.splunk.com/en/splunk-enterprise/rest-api-reference/10.6/search-endpoints/search-endpoint-descriptions)
