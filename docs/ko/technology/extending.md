# 기업 환경에 맞게 확장하기

기업마다 로그 형식, 필드 이름, 개발 프레임워크, SIEM이 다릅니다. SADE의 방법론은 특정 환경에 묶이지 않도록 **"무엇을 찾는가"(규칙)와 "어떻게 찾는가"(메커니즘)를 나눠** 설계했습니다. 그래서 보안 담당자는 규칙만 바꿔 사내 사정을 반영할 수 있고, 지원하지 않는 환경은 같은 메커니즘에 모듈을 더해 넓힐 수 있습니다.

| 확장 방식 | 누가 | 예 |
|---|---|---|
| **설정으로 바꾸기** | 보안 담당자 | 사내 필드 이름을 민감정보 규칙에 추가, 회사 로그 필드 이름 지정, 서비스 구분 기준 등록 |
| **모듈 더하기** | 보안 담당자 + 개발 지원 | 사내 프레임워크 분석기 추가, 다른 SIEM 연결 추가 |

## 한눈에 보기

| 영역 | 지금 구현 | 설정으로 바꾸기 | 모듈 더하기 |
|---|---|---|---|
| 민감정보 | 19개 기본 유형 | 사내 필드 이름, 필드 경로, 값 형식(정규식), 새 유형, 예외 | 새 값 검증기(체크섬 등) |
| 로그 형식 | 주요 HTTP 로그 이름, PostgreSQL·SQL 로그 | Field mapping, 로그 프로필 | 새 로그 형식 해석기 |
| SIEM·저장소 | Splunk, Cloudera | 수집 기간·주기·인덱스 | 새 전송 방식(예: Elasticsearch) |
| 서비스 구분 | 경로 접두사, 서비스 이름 | 접두사, 별칭(이름·IP) | |
| 공개 범위 | | 호스트·경로 규칙 | |
| code2spec | Spring, Go, Python, Node.js, .NET | 서비스 폴더, 제외 폴더, 사내 요청 파서 | 새 프레임워크·언어 분석기 |
| code2flow | HTTP 클라이언트 5개 언어, Spring Boot 설정·DB | 최대 추적 깊이 | 새 클라이언트, 설정 형식, DB 접근 계층 |
| 게이트웨이 | Spring Cloud Gateway, Zuul, nginx, Kong, Ingress | | 새 게이트웨이 설정 형식 |
| 런타임 흐름 | 요청 ID, hop ID, trace, SQL operation ID | 사내 ID 필드 이름 | 사내 ID 전파 표준 적용(로깅 계층) |

## 설정으로 바꾸기

### 사내 필드 이름으로 민감정보 잡기

기본 규칙은 `email`, `phone_number` 같은 흔한 이름을 압니다. 하지만 회사마다 `cust_mbl_no`, `emp_rrn`, `mbr_eml`처럼 고유한 이름을 씁니다. **Policy › Rules › Data Types**에서 바로 추가합니다.

| 하고 싶은 일 | 방법 | 예 |
|---|---|---|
| 사내 필드 이름을 기존 유형에 추가 | Field name 규칙 | `cust_mbl_no` → PHONE |
| 특정 위치의 필드에만 의미 부여 | Field path 규칙 | `$.member.contact` → EMAIL |
| 사내 식별번호 형식을 새 유형으로 | 새 유형 + Value pattern | 사번 `EMP-[0-9]{6}` → EMPLOYEE_ID |
| 오탐 제외 | Exclusion (사유·만료일) | `/health`의 `name`은 제외 |

저장하면 새 규칙 버전이 생기고, 이미 수집한 결과를 SIEM에 다시 접속하지 않고 다시 분류합니다. 값 형식 규칙은 실제 값이 필요하므로 다음 수집부터 적용됩니다. [데이터 유형과 룰](../policy/data-types.md)

### 회사 로그 형식 맞추기

필드 이름은 자동 감지를 먼저 시도합니다. 감지가 틀리거나 사내 고유 이름을 쓰면 연결 설정에서 지정합니다.

- **Field mapping**: 연결 하나에 필드 경로를 직접 지정합니다.
- **로그 프로필**: 회사 로그에 공통으로 쓰는 이름을 JSON 하나로 만들어 연결마다 올립니다. 자동 감지보다 먼저 시도합니다.

```json
{
  "field_aliases": {
    "request_id": ["txn_guid"],
    "service": ["sys_cd"],
    "path": ["req.full_path"]
  },
  "client_event_types": ["egress_call", "ext_api_req"]
}
```

`client_event_types`는 "이 값이면 보낸 요청"으로 볼 방향 값을 회사 기준으로 추가합니다. [로그 필드 레퍼런스](../connect/schema.md)

### 서비스와 공개 범위 정하기

- **서비스 구분**: 서비스마다 경로 접두사(`/order`)와 별칭(로그에 찍히는 다른 이름, 서버 IP)을 등록합니다. 별칭에 등록한 IP에서 온 호출은 그 서비스가 부른 것으로 봅니다.
- **공개 범위**: **Access Scope**에서 호스트·경로 규칙으로 API를 Internal / Public / Partner로 나눕니다. [접근 범위](../policy/access-scope.md)

### 코드 분석 범위 정하기

코드 분석 설정 파일로 사내 저장소 구조를 알려 줍니다.

```json
{
  "service_roots": { "services/accounts": "accounts", "services/orders": "orders" },
  "exclude_dirs": ["lab", "legacy"],
  "generic_body_decoders": ["com.company.common.web.RequestParser.parse"],
  "max_call_depth": 12
}
```

| 항목 | 쓰임 |
|---|---|
| `service_roots` | 모노레포의 폴더를 서비스로 나눔 |
| `exclude_dirs` | 분석하지 않을 폴더 |
| `generic_body_decoders` | 사내 공통 요청 파서. 이 함수로 읽는 본문 타입을 요청 스키마로 인식 |
| `max_call_depth` | API에서 호출을 따라가는 최대 깊이 |

## 모듈 더하기

### 다른 프레임워크로 code2spec 넓히기

지금은 Spring, Go, Python, Node.js, .NET의 주요 프레임워크를 읽습니다. 사내 프레임워크나 다른 언어도 **같은 계약**을 지키는 분석기를 더하면 결과가 그대로 인벤토리, 명세 비교, 민감정보 분석에 들어갑니다.

<div class="sade-steps" markdown>

1. **구문 트리로 읽습니다.** tree-sitter 문법으로 파싱하고, 대상 코드는 실행하지 않습니다.
2. **라우트 등록 방식을 정의합니다.** 그 프레임워크가 API를 등록하는 어노테이션이나 함수를 찾습니다.
3. **요청·응답 타입을 따라갑니다.** 핸들러의 파라미터와 반환 타입에서 필드를 펼칩니다.
4. **모든 결과에 파일·줄을 남깁니다.** 정할 수 없는 경로는 API로 세지 않고 `unresolved`로 보고합니다.

</div>

분석기가 지켜야 할 입출력 형식은 저장소의 `packages/sade-codescan/ADAPTER_CONTRACT.md`에 정의되어 있고, Spring 분석기(`java_spring.py`)가 참조 구현입니다.

### code2flow를 다른 환경으로 넓히기

서비스 간 호출 분석은 **언어 공통 탐색 + 언어별 탐지기** 구조입니다. 공통 부분이 함수 간 호출을 따라가고, 언어별 모듈은 "이 구문이 HTTP 호출인가"만 판단합니다.

| 넓히고 싶은 것 | 더할 것 | 지금 구현 |
|---|---|---|
| 사내 HTTP 클라이언트 래퍼 | 해당 언어 모듈에 탐지 규칙 | RestTemplate, WebClient, Feign, requests, axios 등 |
| Spring Boot 외 프레임워크의 설정 해석 | 설정 파일 해석 모듈 | `application*.yml`, properties, Compose, Ingress |
| 다른 DB 접근 계층 (MyBatis, JDBC Template 등) | DB 접근 탐지 모듈 | Spring Data Repository |
| 다른 게이트웨이 | 라우팅 설정 해석 | Spring Cloud Gateway, Zuul, nginx, Kong, Ingress / HTTPRoute |

### 다른 SIEM 연결하기

수집은 **전송(어떻게 가져오나)**과 **형식 해석(어떻게 읽나)**이 나뉘어 있습니다. Elasticsearch 같은 새 저장소는 전송 부분만 더하면, 필드 감지·대량 수집 방식·분석은 그대로 씁니다. [로그 정규화](log-normalization.md), [대용량 SIEM 수집](siem-collection.md)

### 사내 ID 전파 표준 맞추기 {#id}

서비스 간 흐름과 DB 접근을 정확히 잇는 열쇠는 **같은 요청 ID가 모든 로그에 찍히는지**입니다. 이건 SADE가 아니라 회사 로깅 표준의 문제이므로, 보안팀이 개발 표준으로 요청할 항목을 정리하면 이렇습니다.

| 로그 | 남길 값 |
|---|---|
| 게이트웨이·서비스 접근 로그 | `request_id`, 가능하면 `traceparent` |
| 서비스가 다른 서비스를 부를 때 | `event_type: client`, `destination`, 같은 `request_id`(또는 `hop_id`) |
| 애플리케이션 SQL 로그 | `request_id`, `operation_id` |
| DB 로그 | 공통 DB 로깅 계층에서 SQL 앞에 `/*sade request_id=… operation_id=…*/` 주석 |

[로그 필드 레퍼런스](../connect/schema.md#levels)에서 필드를 하나씩 더할 때 흐름이 어디까지 그려지는지 확인할 수 있습니다.

## 확장할 때 지킬 원칙

- **추측하지 않기.** 정할 수 없는 것은 "미확정"으로 보고합니다. 그럴듯한 값을 채우면 보안 판단이 틀어집니다.
- **대상 실행하지 않기.** 코드 분석기는 읽기만 하고, 빌드나 네트워크 접속을 하지 않습니다.
- **값 저장하지 않기.** 새 로그 형식을 더해도 실제 값은 판단 후 지웁니다. [값을 남기지 않는 저장](value-free-storage.md)
- **출처 남기기.** 모든 결과에 어느 로그 몇 번째 줄, 어느 파일 몇 번째 줄에서 찾았는지 남겨 담당자가 확인할 수 있게 합니다.
