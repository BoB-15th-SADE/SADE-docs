# 민감정보 탐지

**APIs → Sensitive Data**는 민감정보 유형별로 어떤 서비스와 요청·응답 API가 관련되는지 보여줍니다. 같은 필드의 Spec / Code / Log 근거를 합치되 선언과 실제 값 관측은 구분합니다.

## 빠른 확인

1. Sensitive Data에서 유형·카테고리·서비스·출처를 확인합니다.
2. 유형을 눌러 서비스별 관련 API를 봅니다.
3. API를 선택하면 상세의 **Sensitive data**로 이동합니다.
4. Location, Field, Field matched, Value matched와 검사 상태를 확인합니다.
5. 오탐을 조정하려면 [Data Types](../policy/data-types.md)에서 룰·예외를 수정합니다.

## 기본 19종

| 카테고리 | 유형 |
|---|---|
| 개인정보 11종 | NAME, EMAIL, PHONE, ADDRESS, RRN, FOREIGN_ID, CI, DI, DRIVER_LICENSE, PASSPORT, BIRTH_DATE |
| 금융·거래정보 2종 | ACCOUNT_NO, CARD_NO |
| 크리덴셜·시크릿 6종 | PASSWORD, ACCESS_TOKEN, REFRESH_TOKEN, API_KEY, SESSION_COOKIE, SECRET |

## 탐지 근거

| 방법 | 하는 일 | 예시 |
|---|---|---|
| 필드 별칭 사전 | 정규화한 필드명과 등록 별칭 비교 | `eml_addr` → EMAIL |
| 값 프로파일 | 지원 형식·구조·날짜·체크섬 확인 | 카드 길이와 Luhn 검사 |
| 문맥 분석 | 필드 경로·같은 객체의 필드 이름 확인 | `person.name` 인정, `product.name`의 NAME 근거 제외 |
| 명시적 의미·스키마 | 승인한 경로·OpenAPI 선언 활용 | `apiKey` 보안 스키마의 이름·위치 |

후보는 여러 근거에서 독립적으로 생성됩니다. 필드명이 일치해야만 값 검사를 수행하는 구조가 아닙니다. `ci`, `di`도 부분 문자열 포함만으로 분류하지 않습니다. 현재 분류는 규칙 기반이며 NLP·LLM을 사용하지 않습니다.

## Field matched와 Value matched

- **Field matched**: 필드 의미·경로·선언이 유형의 근거가 됩니다.
- **Value matched**: 실제 로그 값이 지원하는 값 프로파일 검증을 통과했습니다.
- 두 근거는 독립적입니다. 체크 하나가 없다고 다른 체크를 무효로 만들지 않습니다.
- 명세·코드 선언과 명세 예시는 실제 값 관측을 만들지 않습니다.
- `—`는 근거 미기록이지 개인정보 부재나 안전 판정이 아닙니다.

## 값 검증의 지원 범위

| 유형 | 현재 지원·한계 |
|---|---|
| EMAIL / PHONE | 지원 이메일 문법 / 국내 전화번호 형식. 실제 소유·존재는 확인하지 않음 |
| CARD_NO | 13~19자리와 Luhn. 실제 발급 여부는 확인하지 않음 |
| RRN / FOREIGN_ID | 생년월일과 번호 구조. 실제 발급·구형 체크섬 일괄 검증 아님 |
| PASSPORT | 국내 일반 M계열의 지원 구조. 모든 국가·종류를 지원하지 않음 |
| BIRTH_DATE | 생년월일 문맥과 유효한 날짜. 미래 날짜 제외 |
| ACCOUNT_NO / DRIVER_LICENSE / CI / DI | 명시적 필드 의미 중심. 기관별 값 프로파일 미지원은 UNSUPPORTED |
| PASSWORD / NAME / ADDRESS | 필드 의미·문맥 중심. 복잡도나 한글 길이를 확정 기준으로 쓰지 않음 |
| ACCESS_TOKEN / REFRESH_TOKEN | 역할이 명시된 필드, Bearer·지원 JWT 구조. 서명·인증 성공 검증 아님 |
| API_KEY | 명시적 의미·스키마와 지원 GitHub PAT 형태. 모든 공급자 키 패턴을 지원하지 않음 |
| SESSION_COOKIE / SECRET | 지정 세션 쿠키·필드 의미 / 지원 개인키 컨테이너 구조. 쿠키 전체·높은 엔트로피만으로 확정하지 않음 |

## 검사 상태와 집계

JSON 본문·헤더·쿼리·식별 가능한 경로 파라미터·쿠키·URL-encoded Form을 검사합니다. 요청과 응답, 모든 HTTP 상태 코드를 대상으로 하며 미수집·파싱 실패·한도 초과는 별도로 기록합니다.

COMPLETE는 **전달된 자료**의 검사 완료입니다. 원래 전송 전체를 수집했다는 뜻이 아닙니다. PARTIAL / UNAVAILABLE과 Unconfirmed fields를 함께 확인하세요. HIGH / MEDIUM / LOW도 근거 등급이며 확률이나 법적 판정이 아닙니다.

유형별 API 수는 요청과 응답에서 각각 고유 API를 셉니다. 필드 수·출처 수·호출 수를 더한 값이 아닙니다. NULL·빈 값·마스킹된 값은 원문 값 관측과 구분합니다.
