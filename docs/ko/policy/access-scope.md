# 접근 범위 분류

**Policy → Rules → Access Scope**는 호스트와 경로 패턴으로 API를 Internal / Public / Partner / Unknown으로 분류합니다. 방화벽이나 서버 접근 권한을 설정하는 기능은 아닙니다.

## 빠른 설정

1. **Add scope rule**을 누릅니다.
2. Rule name을 입력합니다.
3. Host pattern과 Path pattern에 정규표현식을 입력합니다.
4. 적용할 Scope를 선택하고 저장합니다.
5. 새 분석 결과에서 대상 API의 범위를 확인합니다. Scan required가 남으면 Run scan을 실행합니다.

| 항목 | 예시 | 의미 |
|---|---|---|
| Rule name | Internal APIs | 관리용 이름 |
| Host pattern | `^api\.internal\.example$` | 내부 호스트에 일치 |
| Path pattern | `^/admin(?:/.*)?$` | 해당 관리 경로에 일치 |
| Scope | Internal | 분류 결과 |

패턴이 너무 넓으면 관련 없는 API까지 같은 범위로 분류될 수 있습니다. 실제 호스트·경로 예시로 겹치는 룰을 확인하세요.

## 해석할 때 주의할 점

Public은 인터넷에서 실제 접근 가능하다는 네트워크 검증 결과가 아닙니다. Partner도 제3자 조직의 법적 식별이나 제공 동의 확인을 뜻하지 않습니다. 범위 분류와 민감정보 탐지, 명세 점검을 별도로 읽어야 합니다.
