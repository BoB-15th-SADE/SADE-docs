# 설치와 첫 스캔

Docker로 SADE를 실행하고, 준비된 데이터부터 연결해 첫 결과를 확인합니다. 명세·코드·로그를 모두 갖춰야 시작할 수 있는 것은 아닙니다.

## 준비물

- Docker와 Docker Compose를 사용할 수 있는 환경
- [SADE 저장소](https://github.com/BoB-15th-SADE/SADE)의 현재 소스
- OpenAPI 3.x JSON, 읽기 가능한 GitHub 저장소 또는 HTTP 로그 중 하나 이상

## 1. SADE 실행

SADE 저장소 루트에서 실행합니다. 이 문서 저장소인 SADE-docs에서 실행하는 명령이 아닙니다.

```bash
docker compose up -d --build
```

브라우저에서 [http://localhost:8765](http://localhost:8765)를 엽니다. 기본 구성은 로컬 주소에만 포트를 엽니다. API 서버, 분석용 worker, 재분류용 worker-light가 함께 실행됩니다.

## 2. 준비된 자료 연결

| 준비된 자료 | 이동할 화면 | 다음 단계 |
|---|---|---|
| OpenAPI JSON | Connect → Specifications → Add service | 서비스와 명세를 등록하면 선언 API를 확인할 수 있습니다. |
| GitHub 저장소 | Connect → Source Code | 토큰 연결, 저장소 선택 후 Scan selected를 실행합니다. |
| Splunk / WebHDFS 로그 | Connect → Log Sources | 연결 정보·수집 범위·서비스 배정을 설정합니다. |

서비스의 명세는 선택입니다. 로그만으로 시작하거나, 먼저 명세를 등록하고 나중에 로그를 붙일 수 있습니다.

## 3. 로그 연결 확인

1. Integrations에서 **Splunk** 또는 **Cloudera**의 **Connect**를 누릅니다.
2. 접속 정보, 인증, 수집 범위를 입력합니다.
3. **Test connection**으로 접근 가능 여부를 확인합니다.
4. 자동 필드 매핑을 확인하고 필요하면 Manual로 바꿉니다.
5. **Save**를 누릅니다. 저장은 실제 수집 성공과 다릅니다.

## 4. 분석 실행

**Run scan**을 누르면 로그를 수집한 다음 인벤토리·민감정보·명세 점검·흐름을 계산합니다. Sync는 수집 상태만 확인할 때 쓰는 별도 작업이며 필수 선행 단계가 아닙니다.

명세·코드만 등록했거나 룰을 바꾼 경우에는 저장된 자료로 민감 필드를 자동 재분류합니다. 이는 새 로그 스캔이나 새 정책 점검을 만들지 않습니다.

## 5. 결과 확인

- **Inventory**: API 목록과 Spec / Code / Log 출처
- **Sensitive Data**: 유형별 요청·응답 API와 탐지 근거
- **Call History**: 저장된 최근 호출과 요청·응답 구조
- **Findings**: 명세 점검의 Pass / Fail / Not evaluated
- **Flows**: 관측된 호출과 코드·설정의 호출 관계

## 종료와 개발 실행

```bash
docker compose down
```

기본 Compose는 데이터·입력·인증서를 연결하고 코드는 이미지에 포함합니다. 소스 수정 반영이 필요한 개발 실행은 다음 구성을 사용합니다.

```bash
docker compose -f compose.yaml -f compose.dev.yaml up -d --build
```

작업이 Queued에 머물면 [문제 해결](../troubleshooting/index.md), Docker 없이 실행하려면 [구성과 실행 방식](../operations/architecture.md)을 보세요.
