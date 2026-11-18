# 로그 처리와 값 가리기

로그는 Vector를 지나 ClickHouse에 저장되고, analysis-worker가 API별로 집계합니다.

요청과 응답 본문의 값은 저장하기 전에 타입으로 바뀝니다. SADE에 남는 것은 필드 이름, 타입, 민감 유형 이름입니다.

<div class="sade-pipe" markdown>
<div markdown><span class="sade-pipe-title">받기</span>CSV, syslog, Kafka</div>
<div markdown><span class="sade-pipe-title">필드 매핑</span>기업 필드 → ECS</div>
<div markdown><span class="sade-pipe-title">정리</span>시각, 메서드, 경로</div>
<div class="is-key" markdown><span class="sade-pipe-title">찾기와 가리기</span>민감 유형, 값 → 타입</div>
<div markdown><span class="sade-pipe-title">저장</span>ClickHouse</div>
<div markdown><span class="sade-pipe-title">집계</span>API별 호출, 흐름</div>
</div>

## 1. 필드 매핑

연결 화면에서 정한 매핑으로 기업 필드 이름을 [로그 필드](../connect/schema.md) 이름으로 바꿉니다.

- backend가 매핑을 Vector 설정으로 만들어 넣습니다. 매핑을 바꾸면 Vector가 새 설정을 읽습니다.
- 정해진 필드 목록에 없는 필드는 저장하지 않습니다.

## 2. 정리

| 항목 | 처리 |
|---|---|
| 시각 | ISO 8601, 접근 로그 형식, 초, 밀리초, 마이크로초, 나노초 숫자를 읽어 UTC로 맞춥니다. 시간대가 없으면 소스 시간대나 `SADE_LOG_TIMEZONE`으로 읽습니다 |
| 보관 기간 | 보관 기간(기본 30일)보다 오래된 줄은 저장하지 않고 버린 수로 셉니다 |
| 메서드 | 대문자로 바꿉니다 |
| 경로 | `#` 뒤와 쿼리 문자열(`?` 뒤)을 뗍니다 |
| 방향 | inbound, outbound 표기를 하나로 맞춥니다 |
| 숫자 필드 | 응답 코드, 포트를 숫자로 바꿉니다 |

## 3. 민감 유형 찾기와 값 가리기

본문(`http.request.body.content`, `http.response.body.content`)이 있으면 저장하기 전에 두 가지를 합니다.

<div class="sade-steps" markdown>

1. 민감 유형 찾기

    필드 이름과 값 형식으로 민감 유형을 찾습니다.

    찾은 유형 이름만 그 줄의 탐지 결과로 남깁니다. 값과 값의 위치는 남기지 않습니다.

2. 값 가리기

    JSON 구조(키)는 두고, 값은 타입으로 바꿉니다.

    | 원래 값 | 저장 값 |
    |---|---|
    | 문자열 | `<string>` |
    | 정수 | `<integer>` |
    | 실수 | `<number>` |
    | 참, 거짓 | `<boolean>` |
    | JSON이 아닌 본문 | 본문 전체를 `<string>` |

    키 이름 자체가 데이터처럼 보이면(이메일, 전화번호 모양, JSON 조각, 256자 초과) 키도 `[REDACTED_KEY]`로 바꿉니다.

</div>

```text
원래 본문  {"name":"홍길동","age":31,"premium":true,"items":[{"id":7,"price":12000}]}
저장 본문  {"name":"<string>","age":"<integer>","premium":"<boolean>","items":[{"id":"<integer>","price":"<integer>"}]}
```

샘플 화면(샘플 받기 단계)에 보이는 메시지도 Vector가 알려진 민감정보 형식을 가린 뒤에 보여 줍니다.

## 4. 저장과 중복 제거

- ClickHouse의 로그 표에 저장합니다.
- 원래 줄의 내용이 같으면 한 번만 남깁니다. 같은 파일을 다시 올리거나 같은 줄이 CSV와 Kafka로 함께 들어와도 두 번 세지 않습니다.
- 본문의 값만 다른 두 줄은 다른 줄로 남습니다. 가린 뒤 모양이 같아도 원래 줄 내용으로 구분합니다.

## 5. 집계 (로그 분석)

분석 시작이나 다시 분석을 누르면 analysis-worker가 저장된 로그를 읽어 두 가지 결과를 만듭니다.

| 결과 | 내용 |
|---|---|
| 로그 API 목록 | 서비스, 메서드, 경로 틀별 호출 수, 응답 코드별 수, 최초, 마지막 호출 시각, 출발지 IP, 민감 유형 |
| 로그 흐름 | 클라이언트 → 서비스, 서비스 → 서비스, 서비스 → DB, 외부 목적지로 가는 호출과 호출 수 |

### 경로 틀 만들기

- 숫자, UUID, 긴 토큰 같은 값 모양 구간은 `{id}`로 묶습니다.
- 같은 자리에 값 종류가 많으면(`SADE_LOG_ID_MIN_VALUES`, 기본 20) 값 모양이 아니어도 `{id}`로 봅니다.
- 자세한 규칙은 [API 식별](api-identity.md)에 있습니다.

### 서비스 사이 호출 찾기

| 있는 필드 | 잇는 방법 |
|---|---|
| `trace.id`, `span.id`, `parent.id` | 같은 요청의 단계를 ID로 잇습니다 |
| `network.direction`, `destination.address` | 보낸 호출(outbound)의 목적지로 잇습니다 |
| `http.request.id` | 두 로그의 같은 요청을 요청 ID로 맞춥니다 |


## 6. 날짜별 집계와 보관

| 자료 | 기본 보관 | 설정 |
|---|---|---|
| 값을 가린 로그 줄 | 30일 | `SADE_LOG_RETENTION_DAYS` |
| API별 날짜별 호출 수 | 400일 | `SADE_LOG_DAILY_RETENTION_DAYS` |
| API 최초 발견, 마지막 호출 시각 | 로그 줄이 지워진 뒤에도 유지 | |

로그 줄이 보관 기간을 넘겨 지워져도 API가 언제 처음 보였고 언제 마지막으로 불렸는지는 남습니다.

## 남기지 않는 것

- 요청, 응답 본문의 값
- 민감정보 값과 그 값이 있던 위치
- 인증 헤더, 토큰, 비밀번호, 쿠키 값

출발지 IP, `X-Forwarded-For`, 경로는 원래 값으로 저장합니다. 경로에 개인정보가 들어가는 서비스(예: `/users/kim@example.com`)라면 경로 틀로 묶이기 전 원래 경로가 로그 표에 남습니다.
