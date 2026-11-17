# Data Types (민감정보 유형)

Rules > **Data Types**에서 SADE가 찾는 민감정보 유형과 탐지 규칙을 봅니다.

!!! note "지금은 보기만 됩니다"
    규칙 저장과 테스트는 아직 연결 중입니다. 화면에서 유형과 규칙을 확인할 수 있지만, 회사 고유 필드 이름을 추가하거나 저장하는 기능은 다음 버전에서 제공합니다.

## 기본 유형 19개

| 분류 | 유형 |
|---|---|
| 개인정보 (11) | NAME, EMAIL, PHONE, ADDRESS, RRN(주민등록번호), FOREIGN_ID(외국인등록번호), CI, DI, DRIVER_LICENSE, PASSPORT, BIRTH_DATE |
| 금융 (2) | ACCOUNT_NO, CARD_NO |
| 인증정보 (6) | PASSWORD, ACCESS_TOKEN, REFRESH_TOKEN, API_KEY, SESSION_COOKIE, SECRET |

## 찾는 방법

| 규칙 | 내용 | 쓰는 곳 |
|---|---|---|
| **필드 이름 규칙** | 필드 이름으로 찾습니다 (예: `phone`, `mobile_no`, `cust_nm`) | 코드, 명세, 로그 |
| **값 규칙** | 값의 형식으로 찾습니다. EMAIL, PHONE, RRN, FOREIGN_ID, CARD_NO(카드번호 검증 포함), ACCESS_TOKEN(JWT 등) | 로그 본문 |

- 코드에서는 이름만으로 확정하기 어려운 필드(예: 사람의 이름인지 상품 이름인지 모르는 `name`)를 주변 맥락으로 한 번 더 확인합니다.
- 로그 본문은 저장 전에 검사하고, 남기는 것은 **유형 이름뿐**입니다. 값과 값의 위치는 남기지 않습니다.

찾은 유형은 Inventory의 민감 유형 필터, API 상세의 Sensitive Data 탭, [관리 우선순위](../features/priority.md)의 민감정보 신호(S)에 쓰입니다.
