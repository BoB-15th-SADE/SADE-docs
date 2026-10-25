# OpenAPI 명세 연결

서비스와 OpenAPI 명세를 등록하면 트래픽 없이도 선언된 API·필드와 민감정보 후보를 확인할 수 있습니다. 지원 입력은 **OpenAPI 3.0 / 3.1 JSON, 최대 10 MB**입니다.

## 빠른 설정

1. **Connect → Specifications → Add service**를 엽니다.
2. 명세 JSON을 선택합니다. 이름·서버 정보가 있으면 입력 칸에 채워집니다.
3. Name, ID, Base URL과 Path prefix를 확인합니다.
4. **Save**를 누릅니다.
5. **APIs → Inventory**에서 서비스와 필드를 확인합니다. 민감 필드 분류는 백그라운드로 갱신됩니다.

| 항목 | 의미 |
|---|---|
| Name | 화면에 표시할 서비스 이름 |
| ID | 로그 배정·코드 연결에 쓰는 서비스 식별자 |
| Base URL | API의 기준 서버 주소 |
| Path prefix | 외부 호출 경로에 붙지만 명세에는 없는 접두사 |
| OpenAPI file | 선택 항목. 파일 없이 서비스만 먼저 만들 수 있습니다. |

예를 들어 실제 호출이 `/orders/items`이고 명세가 `/items`라면 Path prefix에 `/orders`를 지정합니다. 접두사를 추측해 두 경로를 임의로 연결하지 마세요.

## 명세의 출처 구분

| 표시 | 의미 |
|---|---|
| Active / File upload | 사용자가 등록한 명세 |
| From code | GitHub 스캔에서 생성한 명세 |
| No spec | 서비스만 등록했거나 로그만으로 발견 |
| Inferred draft | 관측된 트래픽 구조로 만든 초안 |

트래픽에서 만든 명세는 독립적인 계약이 아닙니다. 같은 트래픽으로 자신의 준수 여부를 평가하지 않도록 관련 점검은 Not evaluated로 처리합니다.

## 코드와 함께 쓸 때

사용자가 등록한 명세는 GitHub 재스캔으로 덮어쓰지 않습니다. 코드에서 생성한 명세는 별도로 유지합니다. 게이트웨이의 공개 경로와 백엔드 구현이 다르면 [route map](code.md)으로 연결합니다.

명세 선언의 **Field matched**는 실제 값 전송의 근거가 아닙니다. 예시 값도 민감 값 관측 건수를 만들지 않습니다.
