# 민감정보 탐지

SADE는 한 벌의 규칙(기본 유형 19개)으로 코드, 명세, 로그에서 민감정보를 찾습니다. 코드와 명세는 필드 이름과 주변 코드로, 로그는 필드 이름과 값 형식으로 찾습니다. 찾은 결과는 유형 이름만 남고 값은 남지 않습니다.

## 세 곳의 차이

| 출처 | 보는 것 | 값 검사 | 하는 곳 |
|---|---|---|---|
| 코드 | 요청, 응답 필드 선언: 이름, 위치, 같은 객체의 다른 필드, 형식 선언 | 하지 않음 (코드에는 값이 없음) | code-worker |
| 명세 | 명세 스키마의 필드 이름과 `format` | 하지 않음 (예시 값은 쓰지 않음) | code-worker |
| 로그 (CSV) | 본문 JSON의 키와 값 | 함 | backend, 저장 전 |
| 로그 (syslog, Kafka) | 본문 JSON의 키와 값 | 함 | Vector, 저장 전 |

- 코드와 명세는 필드 이름으로만 찾습니다.
- 로그는 필드 이름과 값 형식 중 하나라도 맞으면 찾은 것으로 봅니다.
- 로그는 API 단위로 유형을 기록합니다. 어느 필드에서 나왔는지는 남기지 않습니다.

## 필드 이름 비교

필드 이름은 같은 방식으로 정리한 뒤 비교합니다.

<div class="sade-steps" markdown>

1. camelCase를 나눕니다.

2. 소문자로 바꿉니다.

3. 글자와 숫자 외 문자를 모두 지웁니다.

</div>

그래서 `phoneNumber`, `phone_number`, `phone-number`, `PHONE NUMBER`, `phone.number`가 모두 같은 이름(`phonenumber`)이 됩니다.

## 유형과 규칙

| 유형 | 분류 | 필드 이름 예 | 값 규칙 (로그) |
|---|---|---|---|
| NAME | 개인정보 | `full_name`, `first_name`, `last_name` | |
| EMAIL | 개인정보 | `email`, `email_address`, `user_email` | 이메일 형식 |
| PHONE | 개인정보 | `phone`, `mobile`, `telephone` | 국내 휴대, 지역, 대표번호 형식 |
| ADDRESS | 개인정보 | `address`, `shipping_address` | |
| RRN | 개인정보 | `rrn`, `jumin`, `resident_no` | 주민등록번호 형식과 생년월일 검사 |
| FOREIGN_ID | 개인정보 | `foreign_id`, `alien_reg_no` | 외국인등록번호 형식과 생년월일 검사 |
| CI, DI | 개인정보 | `ci`, `conn_info`, `di`, `dup_info` | |
| DRIVER_LICENSE | 개인정보 | `driver_license_no` | |
| PASSPORT | 개인정보 | `passport_no` | |
| BIRTH_DATE | 개인정보 | `birth_date`, `dob`, `brth_ymd` | |
| ACCOUNT_NO | 금융 | `account_no`, `bank_account` | |
| CARD_NO | 금융 | `card_no`, `pan` | 13~19자리, Luhn 검사 통과, 주민번호 모양 제외 |
| PASSWORD | 인증 정보 | `password`, `pwd` | |
| ACCESS_TOKEN | 인증 정보 | `access_token`, `bearer_token` | JWT 형식 |
| REFRESH_TOKEN | 인증 정보 | `refresh_token` | |
| API_KEY | 인증 정보 | `api_key`, `x_api_key` | |
| SESSION_COOKIE | 인증 정보 | `session_id`, `jsessionid` | |
| SECRET | 인증 정보 | `client_secret`, `private_key` | |

값 규칙은 6개 유형(EMAIL, PHONE, RRN, FOREIGN_ID, CARD_NO, ACCESS_TOKEN)에만 있습니다. 나머지 유형은 필드 이름으로만 찾습니다.

## 코드에서만 쓰는 문맥 판정

이름만으로 정하기 어려운 필드는 주변을 한 번 더 봅니다.

| 경우 | 판정 |
|---|---|
| `name` 하나만 있는 필드 | 사람을 뜻하는 객체(회원, 고객 등) 안에 있을 때만 NAME. 상품, 파일, 서버 객체 안의 `name`은 제외 |
| `address` | 우편 주소 문맥(street, city, zip)이 있을 때. 사람이 아닌 객체 안이면 제외 |
| `number` | 금융 문맥 객체 안에 있을 때 ACCOUNT_NO |
| `<수식어>_phone`, `<수식어>_password` | 수식어가 붙어도 같은 유형 |
| 형식 선언 | `format: email`, `format: password` 같은 선언을 근거로 씀 |
| Authorization 헤더 | bearer 인증을 선언한 API에서만 ACCESS_TOKEN |
| Cookie, Set-Cookie 헤더 | 헤더 전체를 SESSION_COOKIE로 보지 않음 |

더 가까운 문맥이 먼저입니다. 예를 들어 회원 객체 안의 상품 객체에 있는 `name`은 상품 이름으로 봅니다.

## 결과를 쓰는 곳

| 화면 | 쓰는 방식 |
|---|---|
| Inventory | Sensitive Type 필터 |
| API 상세 Sensitive Data 탭 | 필드, 위치, 유형, 출처(Code, Spec, Log). 로그 유형은 필드 없이 따로 |
| 관리 우선순위 | 민감정보 신호(S). 외부 HTTP 구간 관측이면 O 신호의 재료 |
| Flows | 서비스 노드의 민감 유형 라벨 |
| Overview | Sensitive Types, Sensitive APIs 수 |

## 한계

- 이메일, 전화번호 형식이 맞아도 실제 존재하거나 개인 소유인지는 확인하지 않습니다.
- 카드번호는 발급 여부를, 주민등록번호는 실제 발급 여부를 확인하지 않습니다.
- 토큰은 서명이나 유효 기간을 확인하지 않습니다.
- 자유 문장 안의 이름, 주소는 찾지 않습니다.
- 찾지 못한 것이 없다는 증명은 아닙니다. 본문이 없는 로그, 해석하지 못한 필드는 검사하지 못합니다.
- 저장한 로그는 저장할 때의 규칙으로 판정한 결과입니다. 규칙이 바뀌어도 이미 저장한 로그를 다시 검사하지 않습니다. 새 규칙으로 보려면 로그를 다시 수집합니다.

유형 목록과 규칙은 [Data Types](../policy/data-types.md) 화면에서 봅니다.
