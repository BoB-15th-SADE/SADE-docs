# 민감정보 탐지

**APIs › Sensitive Data**는 민감정보 유형마다 어떤 서비스의 어떤 API가 그 정보를 주고받는지 보여 줍니다. 같은 필드를 명세, 코드, 로그에서 각각 찾았다면 한 줄로 합칩니다. 다만 명세·코드에 적혀 있는 것과 로그에서 실제 값으로 확인한 것은 구분해서 표시합니다.

## 보는 순서

<div class="sade-steps" markdown>

1. Sensitive Data에서 유형, 카테고리, 서비스, 출처를 봅니다.
2. 유형을 누르면 서비스별로 관련 API가 나옵니다.
3. API를 고르면 API 상세의 **Sensitive data** 탭으로 이동합니다.
4. 위치(Location), 필드, Field matched, Value matched, 검사 상태를 확인합니다.
5. 잘못 잡힌 항목은 [Data Types](../policy/data-types.md)에서 룰이나 예외를 고칩니다.

</div>

## 기본 19종

| 카테고리 | 유형 |
|---|---|
| 개인정보 11종 | NAME, EMAIL, PHONE, ADDRESS, RRN, FOREIGN_ID, CI, DI, DRIVER_LICENSE, PASSPORT, BIRTH_DATE |
| 금융정보 2종 | ACCOUNT_NO, CARD_NO |
| 인증정보·시크릿 6종 | PASSWORD, ACCESS_TOKEN, REFRESH_TOKEN, API_KEY, SESSION_COOKIE, SECRET |

## 탐지 방법

| 방법 | 하는 일 | 예 |
|---|---|---|
| 필드 이름 | 필드 이름을 유형별 별칭 목록과 비교 | `eml_addr` → EMAIL |
| 값 형식 | 값의 구조, 날짜, 체크섬을 검사 | 카드번호 길이와 Luhn 검사 |
| 주변 필드 | 필드 경로와 같은 객체 안의 다른 필드 이름을 봄 | `person.name`은 이름, `product.name`은 이름 아님 |
| 명시적 지정 | 승인한 필드 경로, OpenAPI 보안 선언 | `apiKey` 보안 스키마에 적힌 이름과 위치 |

네 가지 방법은 서로 따로 동작합니다. 필드 이름이 맞아야만 값을 검사하는 구조가 아닙니다. `ci`, `di`처럼 짧은 이름은 다른 단어 안에 들어 있다는 이유만으로 분류하지 않습니다. 규칙 기반으로 동작하며 NLP나 LLM은 쓰지 않습니다.

## Field matched와 Value matched

- **Field matched**: 필드 이름, 경로, 명세 선언을 보고 이 유형이라고 판단했습니다.
- **Value matched**: 로그의 실제 값이 그 유형의 형식 검사를 통과했습니다.
- 두 체크는 따로 판단합니다. 하나가 비어 있다고 다른 하나가 틀린 것은 아닙니다.
- 명세·코드에 적힌 내용이나 명세의 예시 값으로는 Value matched가 생기지 않습니다.
- `—`는 "확인한 기록이 없음"입니다. 개인정보가 없다거나 안전하다는 뜻이 아닙니다.

## 값 검사 범위

| 유형 | 검사하는 것 | 검사하지 않는 것 |
|---|---|---|
| EMAIL | 메일 주소 문법 | 실제로 존재하는 주소인지 |
| PHONE | 국내 전화번호 형식 | 해외 번호, 실제 사용 중인 번호인지 |
| CARD_NO | 13~19자리와 Luhn 체크섬 | 실제로 발급된 카드인지 |
| RRN, FOREIGN_ID | 생년월일과 번호 구조 | 실제 발급 여부 |
| PASSPORT | 국내 일반 여권(M으로 시작) 구조 | 다른 나라나 다른 종류의 여권 |
| BIRTH_DATE | 생년월일 문맥 + 실제 있는 날짜, 미래 날짜 제외 | |
| ACCOUNT_NO, DRIVER_LICENSE, CI, DI | 필드 이름과 의미만 봄 | 값 형식 (기관별 공식 형식 자료가 없음) |
| PASSWORD, NAME, ADDRESS | 필드 이름과 주변 필드 | 비밀번호 복잡도, 이름 글자 수 |
| ACCESS_TOKEN, REFRESH_TOKEN | 역할이 적힌 필드, `Bearer` 형식, JWT 구조 | 서명이 맞는지, 실제 로그인 성공 여부 |
| API_KEY | 명세의 `apiKey` 선언, 명시적 필드, GitHub 토큰 형식 | 그 밖의 서비스별 키 형식 |
| SESSION_COOKIE, SECRET | 알려진 세션 쿠키 이름, 개인키 파일 구조 | 쿠키 전체, 무작위해 보이는 문자열 |

## 검사 상태와 개수

JSON 본문, 헤더, 쿼리, 경로 파라미터, 쿠키, URL-encoded 폼을 검사합니다. 요청과 응답, 모든 HTTP 상태 코드를 봅니다. 로그에 없던 부분, 해석하지 못한 부분, 크기 한도를 넘은 부분은 따로 기록합니다.

COMPLETE는 **로그에 남은 부분**을 모두 검사했다는 뜻입니다. 실제로 오간 데이터를 전부 봤다는 뜻은 아닙니다. PARTIAL, UNAVAILABLE, Unconfirmed fields도 함께 보세요. HIGH / MEDIUM / LOW는 판단이 얼마나 확실한지를 나타내며, 확률이나 법적 판단이 아닙니다.

유형별 API 수는 요청과 응답 각각에서 API를 한 번씩만 셉니다. 필드 수나 호출 수를 더한 값이 아닙니다. NULL, 빈 값, 마스킹된 값은 실제 값을 본 경우와 따로 셉니다.

[<span class="q">궁금하신가요?</span><span class="t">이름, 주변 필드, 값 형식으로 19개 유형을 가르는 방법</span><span class="arrow">→</span>](../technology/sensitive-data.md){ .sade-curious }
