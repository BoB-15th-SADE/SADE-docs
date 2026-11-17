# 소스 코드 (GitHub)

Connect > **Source Code**에서 GitHub 저장소를 연결하고 스캔합니다. 코드 스캔은 Java Spring Boot 서비스를 읽습니다.

## 스캔으로 알 수 있는 것

| 결과 | 쓰이는 곳 |
|---|---|
| 코드에 선언된 API(서비스, 메서드, 경로)와 핸들러 위치(파일, 줄) | Inventory의 `Code` 출처, API 상세의 Code 탭 |
| 서비스별 OpenAPI (코드에서 만든 명세) | Specifications의 Generated from Code |
| 인증 선언(어노테이션 등)과 HTTP 메서드 | 관리 우선순위의 인증 선언, 변경 기능 근거 |
| 서비스 사이 HTTP 호출, DB 접근 | Flows의 코드 근거 선 |
| 게이트웨이 경로 규칙 (라우트 맵) | 게이트웨이 경로와 실제 서비스 API 연결 |
| CODEOWNERS 담당 후보, API별 최초, 최근 코드 변경 이력 | API 상세의 Owners 탭 |
| 요청, 응답 필드의 민감 유형 | 민감정보 판정 |

## 1. GitHub 연결

[Add GitHub connection]에서 환경을 고르고 주소와 토큰을 넣습니다. 토큰은 저장 전에 GitHub에 확인합니다.

| 환경 | 주소 예 | 토큰 |
|---|---|---|
| GitHub.com | `https://github.com/OWNER` | 선택. 없으면 공개 저장소만 스캔하며, GitHub가 IP마다 시간당 60회로 요청을 제한합니다 |
| Enterprise Cloud (GHE.com) | `https://company.ghe.com` | 필수 |
| Enterprise Server | `https://github.company.com` | 필수 |

!!! note "토큰 권한"
    스캔할 저장소의 **Contents: Read-only** 권한만 주세요. SADE는 저장소에 쓰지 않습니다. 토큰은 `SADE_SECRET_KEY`로 암호화해 저장하고, API 응답과 로그에 다시 내보내지 않습니다. [Disconnect]는 저장한 연결과 토큰을 지우며, 이미 스캔한 결과는 남습니다.

## 2. 저장소와 브랜치를 골라 스캔

연결되면 토큰으로 읽을 수 있는 저장소 목록이 나옵니다. 저장소를 고르고 브랜치를 정한 뒤 스캔을 요청합니다. 여러 저장소를 한 번에 요청할 수 있습니다. 토큰 없이 GitHub.com에 연결했다면 `https://github.com/OWNER/REPO`나 `OWNER/REPO`를 넣어 공개 저장소를 불러옵니다.

- 스캔은 요청할 때의 **브랜치 최신 커밋 하나**를 고정해 읽습니다. 저장소를 `git clone`하지 않고 GitHub API로 필요한 파일만 읽습니다.
- 저장소 일부만 보려면 스캔 기준 폴더(scan root)에 `services/api` 같은 상대 경로를 넣습니다. 비우면 저장소 전체를 봅니다.
- 진행 상황은 Scans in progress와 작업 상태에서 봅니다.

## 3. 결과 확인

| 탭 | 내용 |
|---|---|
| **Code inventories** | 저장소별 서비스 수, API 수, 핸들러를 찾지 못한 API, 커밋, 마지막 스캔 |
| **Route maps** | 게이트웨이나 BFF 설정에서 읽은 경로 규칙. 바깥 경로가 어느 서비스로 전달되는지, 규칙이 적힌 파일과 줄 |
| **Repositories** | 연결한 저장소 목록과 스캔 상태 |

코드 인벤토리를 지우면 그 스캔에서 나온 Flow, 생성 OpenAPI, 민감 판정 결과도 함께 지워집니다. 스캔 작업 기록과 매핑 이력은 남습니다.

## 스캔이 끝난 뒤

코드 스캔과 민감 판정이 끝나면 매핑이 자동으로 다시 돌아 Inventory, Flows, 우선순위가 갱신됩니다. 코드에서 만든 명세는 Specifications에 `Code`로 따로 보이며, 직접 올린 명세를 덮어쓰지 않습니다.

## 알아 둘 점

- 지원 언어는 **Java Spring Boot**입니다. 다른 언어의 저장소는 API가 나오지 않을 수 있습니다.
- 서비스 주소 해석은 docker compose 설정을 읽습니다. Kubernetes, Helm 설정은 읽지 않습니다.
- 실행 중에 정해지는 주소(환경 변수, 설정 서버)로 부르는 호출은 대상을 확정하지 못하고 "Not resolved"로 남을 수 있습니다.
- 인증 선언은 **코드에 적힌 선언**입니다. 실제 요청이 막히는지는 확인하지 않습니다.
