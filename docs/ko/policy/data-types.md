# Data Types (민감정보 유형)

Rules > Data Types에서 SADE가 찾는 민감정보 유형과 탐지 규칙을 봅니다.

!!! note "보기만 가능"
    규칙 저장과 테스트는 연결 작업이 끝나지 않았습니다. 화면에서 유형과 규칙을 볼 수 있습니다. 기업 고유 필드 이름을 추가하고 저장하는 기능은 다음 버전에 들어갑니다.

## 기본 유형 19개

| 분류 | 유형 |
|---|---|
| 개인정보 (11) | NAME, EMAIL, PHONE, ADDRESS, RRN(주민등록번호), FOREIGN_ID(외국인등록번호), CI, DI, DRIVER_LICENSE, PASSPORT, BIRTH_DATE |
| 금융 (2) | ACCOUNT_NO, CARD_NO |
| 인증 정보 (6) | PASSWORD, ACCESS_TOKEN, REFRESH_TOKEN, API_KEY, SESSION_COOKIE, SECRET |

## 탐지 규칙

| 규칙 | 찾는 방법 | 적용 대상 |
|---|---|---|
| 필드 이름 규칙 | 필드 이름이 목록과 맞는지 봅니다 (예: `phone`, `mobile_no`, `cust_nm`) | 코드, 명세, 로그 |
| 값 규칙 | 값의 형식을 봅니다. EMAIL, PHONE, RRN, FOREIGN_ID, CARD_NO(카드번호 검증 포함), ACCESS_TOKEN(JWT 형식) | 로그 본문 |

- 코드에서는 이름만으로 정하기 어려운 필드를 주변 코드로 한 번 더 확인합니다. 예: `name`이 사람 이름인지 상품 이름인지
- 로그 본문은 저장 전에 검사합니다. 유형 이름만 남기고 값과 값의 위치는 남기지 않습니다.

찾은 유형은 다음 곳에 쓰입니다.

- Inventory의 민감 유형 필터
- API 상세의 Sensitive Data 탭
- [관리 우선순위](../features/priority.md)의 민감정보 신호(S)
