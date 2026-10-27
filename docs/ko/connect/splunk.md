# Splunk

Splunk 인덱스에 쌓인 JSON HTTP 로그를 Search REST API로 가져옵니다. 화면에서 넣는 값은 **주소, 토큰, 인덱스** 세 가지입니다.

## 시작하기 전에

연결 전에 아래 항목을 Splunk 관리자와 함께 확인하세요. 항목을 누르면 체크됩니다.

- [ ] SADE 서버에서 Splunk 검색 헤드의 관리 포트(기본 `8089`)로 HTTPS 접속이 됩니다.
- [ ] 로그가 들어 있는 인덱스 이름을 알고 있습니다. 여러 개면 쉼표로 넣습니다(최대 10개).
- [ ] 그 인덱스를 **검색할 수 있는** 인증 토큰이 있습니다. 로그를 넣을 때 쓰는 HEC 토큰과 다릅니다.
- [ ] 인덱스의 이벤트 `_raw`가 JSON입니다. 텍스트 형식이면 JSON으로 바꿔 수집해야 합니다.
- [ ] (사내 인증서를 쓰면) CA 인증서 파일을 SADE 설치 폴더의 `certs/`에 두었습니다.

!!! warning "HEC 토큰이 아닙니다"
    HTTP Event Collector 토큰은 로그를 **넣는** 데만 쓸 수 있습니다. SADE에는 검색 권한이 있는 사용자의 **인증 토큰**이 필요합니다.

## 1. Splunk에서 준비하기

=== "검색 전용 역할"

    SADE 전용 역할을 만들고 필요한 인덱스만 검색하게 합니다.

    1. **Settings › Roles › New Role**에서 역할을 만듭니다. 예: `sade_reader`
    2. **Capabilities**에서 `search`를 켭니다.
    3. **Indexes**에서 대상 인덱스만 허용합니다. 예: `api_gateway`, `service_access`
    4. 이 역할만 가진 사용자를 만듭니다. 예: `sade`

=== "인증 토큰 발급"

    1. **Settings › Tokens**에서 토큰 인증이 켜져 있는지 확인합니다.
    2. **New Token**에서 사용자를 위에서 만든 `sade`로 고릅니다.
    3. 만료일을 정하고 토큰을 복사합니다. 이 화면을 벗어나면 다시 볼 수 없습니다.

=== "네트워크"

    - SADE 서버 → Splunk 검색 헤드 `:8089` (HTTPS) 경로가 열려 있어야 합니다.
    - Splunk Cloud는 관리 포트 접근을 IP 허용 목록에 추가해야 할 수 있습니다.
    - 검색 헤드 인증서가 접속 주소와 이름이 맞지 않으면 TLS 검증에 실패합니다. 접속 주소가 들어간 인증서를 쓰세요.

## 2. SADE에서 연결하기

<div class="sade-steps" markdown>

1. **Connect › Log Sources › Splunk › Connect**를 엽니다.
2. 세 값을 넣습니다.

    | 항목 | 예시 |
    |---|---|
    | Search API URL | `https://splunk.company.internal:8089` |
    | Index | `api_gateway,service_access` |
    | Authentication token | 위에서 발급한 토큰 |

3. **Test connection**을 누릅니다. 같은 검색에 `| head 20`을 붙여 20건만 확인합니다. 0건이어도 권한이 있으면 성공입니다.
4. **Save connection**을 누릅니다.
5. Log Sources 목록에서 **Collect now**를 누릅니다. 진행 상황은 소스 행과 Scans에 나옵니다.

</div>

나머지는 기본값으로 동작합니다. 바꿔야 할 때만 아래를 보세요.

| 기본값 | 바꾸는 곳 |
|---|---|
| 수집 기간: 최근 24시간 | Collection › Time range (1시간, 7일, 30일, 직접 지정, Splunk 시간 문법) |
| 수집 주기: 수동 | Collection › Schedule (1시간, 6시간, 매일) |
| 연결 이름: `Splunk · 인덱스` | 추가 설정 › Connection name |
| 서비스 매칭: 경로 접두사 (등록된 서비스가 있을 때) | 추가 설정 › Service matching ([로그를 서비스로 나누기](logs.md#routing)) |
| 모든 sourcetype | 추가 설정 › Sourcetype. 한 인덱스에 다른 형식이 섞여 있을 때 |
| 필드 자동 감지, 시각은 `_time` | 추가 설정 › Field mapping |
| 시스템 신뢰 인증서 | 추가 설정 › Private CA certificate |

## SADE가 보내는 검색

```text
search (index="api_gateway" OR index="service_access") sourcetype="..." | fields _time _raw _cd index
```

- 입력한 인덱스와 sourcetype으로만 검색을 만듭니다. SPL을 직접 쓸 필요가 없고, 다른 검색을 실행하지 않습니다.
- `POST /services/search/v2/jobs/export`로 보내고, 응답을 한 줄씩 읽습니다.
- `_raw`가 JSON이 아닌 이벤트는 건너뜁니다. 전부 JSON이 아니면 실패로 표시합니다.

## 수집은 이렇게 진행됩니다

<div class="sade-pipe" markdown>
<div markdown>**구간 나누기**<p>수집 기간을 1시간 구간으로 나눔</p></div>
<div markdown>**구간 검색**<p>구간마다 한 번 검색하고 한 줄씩 읽음</p></div>
<div class="is-key" markdown>**집계 + 샘플**<p>호출은 전부 세고, 원본은 API별로 일부만</p></div>
<div markdown>**체크포인트**<p>마친 구간까지 기록</p></div>
</div>

- **많아도 됩니다.** 응답 크기 한도가 없습니다. 한 구간에 이벤트가 5만 건을 넘으면 그 구간을 반으로 나눠 다시 읽습니다.
- **호출 수는 전체 기준입니다.** 호출 수, 처음·마지막 호출, 인증 통계, Shadow API는 모든 이벤트로 셉니다.
- **원본은 일부만 남깁니다.** API와 상태 코드마다 최근 요청 5개의 원본을 남겨 Call History, 명세 점검, 값 기반 민감정보 탐지, Flows에 씁니다.
- **이어서 읽습니다.** 다음 수집은 체크포인트부터 읽어서 같은 구간을 두 번 세지 않습니다. 중간에 실패하면 마친 구간까지 저장하고 다음 수집이 그 자리부터 이어 읽습니다.
- **늦게 들어온 로그도 챙깁니다.** Latest가 `now`이면 지금보다 5분 앞까지만 읽고, 그 뒤는 다음 수집에서 읽습니다.

[<span class="q">궁금하신가요?</span><span class="t">구간 분할, 경계 처리, 집계와 샘플을 나누는 방식과 검증 결과</span><span class="arrow">→</span>](../technology/siem-collection.md){ .sade-curious }

## 수집 주기

Schedule을 1시간, 6시간, 매일 중 하나로 두면 worker가 주기마다 자동으로 수집합니다. 매번 지난 체크포인트 이후만 읽습니다. 예약 수집은 Latest가 `now` 또는 고정 Unix 시각이어야 합니다. 대시보드 탭을 열어 두지 않아도 worker가 실행 중이면 동작합니다.

수집은 인벤토리, 민감정보, Flows를 갱신합니다. 명세 점검은 **Run scan**을 눌러야 갱신됩니다.

## 자주 나는 오류

| 메시지 | 원인 | 조치 |
|---|---|---|
| `Remote server returned HTTP 401` | 토큰이 틀렸거나 만료됨 | 토큰 재발급 |
| `Remote server returned HTTP 403` | 인덱스 검색 권한 없음 | 토큰 사용자의 역할에 인덱스 허용 |
| `TLS failed: the server certificate is not trusted` | 사내 인증서 | 추가 설정에 CA 인증서 지정 |
| `TLS failed: the server certificate does not match this address` | 인증서 이름과 접속 주소가 다름 | 인증서에 있는 이름으로 접속 |
| `Cannot reach the remote server (no response)` | 주소, 포트, 방화벽 | `8089` 경로 확인. 검색이 90초 넘게 첫 응답을 안 주면 기간을 줄임 |
| `Splunk returned only non-JSON events` | `_raw`가 JSON이 아님 | JSON 인덱스나 sourcetype 지정 |
| `One window has more than 500,000 events` | 1분 구간에도 이벤트가 너무 많음 | sourcetype으로 범위를 좁힘 |
| `Stopped after N of M windows` | 중간 구간에서 실패 | 원인을 고치고 다시 Collect now. 실패한 구간부터 이어 읽음 |

## 참고

- 구간 길이(60분)와 API별 샘플 수(5개)는 화면에 없습니다. 필요하면 HTTP API로 소스의 `window_minutes`(5~1440), `samples_per_api`(1~100)를 지정합니다.
- 실제 기업 Splunk 서버와의 연결은 아직 검증 중입니다. 모의 export 서버에 YAS 로그 232,292건을 넣어 검증했습니다.
- Splunk 공식 문서: [Search endpoint descriptions](https://help.splunk.com/en/splunk-enterprise/rest-api-reference/10.6/search-endpoints/search-endpoint-descriptions)
