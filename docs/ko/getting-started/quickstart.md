# 설치와 첫 연결

## 준비 사항

| 항목 | 내용 |
|---|---|
| 프로그램 | Docker Engine과 Docker Compose v2, 또는 Docker Desktop(Linux 컨테이너 모드). Windows는 Docker Desktop |
| 메모리 | Docker에 6GB 이상. 모자라면 설치 스크립트가 경고합니다(Docker Desktop: Settings > Resources) |
| 이미지 | `linux/amd64` |
| 포트 | 대시보드 HTTPS 8443(변경 가능), syslog 수신 6514(TLS) |
| 인터넷 | 처음 이미지를 만들거나 받을 때 필요합니다. 인터넷이 없는 서버는 [오프라인 묶음](#offline)으로 설치합니다. 실행 중에는 직접 연결한 GitHub, Kafka, 허용한 명세 주소, AI 모델 제공자(SADE AI 채팅을 쓸 때)에만 접속합니다 |
| 분석할 서비스 | 코드 분석은 Java Spring Boot만 지원합니다. 다른 언어의 서비스는 OpenAPI 명세와 로그로 결과를 봅니다. [현재 지원 범위](../index.md#support) |

!!! warning "로그인 기능이 없습니다"
    현재 버전에는 로그인과 이용자별 권한이 없습니다.

    기본 설정에서는 설치한 서버(`127.0.0.1`)에서만 대시보드가 열립니다. 다른 PC에서 열려면 방화벽으로 접속 주소를 제한하세요.

## 1. 설치 스크립트로 실행

```bash
git clone https://github.com/BoB-15th-SADE/SADE.git
cd SADE
./sade.sh
```

Windows에서는 PowerShell이나 명령 프롬프트에서 `.\sade.cmd`를 실행합니다. 명령은 `sade.sh`와 같습니다(예: `.\sade.cmd status`). PowerShell 스크립트 실행이 막힌 PC에서도 동작합니다.

스크립트는 아래 순서로 동작합니다. 이미 채운 값은 바꾸지 않으니 여러 번 실행해도 됩니다.

<div class="sade-steps" markdown>

1. `.env`가 없으면 `.env.example`로 만들고, DB 비밀번호 두 개와 `SADE_SECRET_KEY`를 무작위 값으로 채웁니다.

2. 시작 전에 막힐 일을 확인합니다. 대시보드나 syslog 포트를 다른 프로그램이 쓰면 새 `.env`에서는 다음 빈 포트를 골라 알려 주고, 직접 정한 포트면 멈추고 알려 줍니다. 예전 설치의 데이터가 남아 있으면 지우지 않고 멈춘 뒤 이어 갈 방법을 알려 줍니다.

3. 이미지를 빌드해 실행하고, 대시보드가 뜰 때까지 기다립니다.

4. 실패하면 멈춘 서비스와 로그 마지막 줄, 흔한 원인을 보여 줍니다.

</div>

!!! warning "`.env`를 지우지 말고 보관합니다"
    저장한 GitHub 토큰과 AI 키는 `.env`의 `SADE_SECRET_KEY`로만 읽을 수 있습니다. `SADE_SECRET_KEY`와 두 비밀번호는 데이터 볼륨과 짝이라, 바꾸면 저장한 토큰을 읽지 못하거나 DB에 접속하지 못합니다.

| 할 일 | 명령 |
|---|---|
| 상태 보기 | `./sade.sh status` |
| 로그 보기 | `./sade.sh logs` |
| 멈추기 (데이터 유지) | `./sade.sh down` |
| CI가 만든 이미지로 실행 | `./sade.sh images` |
| 오프라인 묶음 만들기, 설치 | `./sade.sh bundle <버전>`, `./sade.sh load` |
| 업데이트 | `git pull` 후 `./sade.sh` |

## 2. 설정 바꾸기

설정은 모두 `.env`에 있습니다. 자주 바꾸는 값은 아래와 같습니다. 바꾼 뒤 `./sade.sh`를 다시 실행합니다.

| 이름 | 기본값 | 설명 |
|---|---|---|
| `SADE_HTTPS_BIND` | `127.0.0.1` | 대시보드를 열 주소. 다른 PC에서 열려면 `0.0.0.0`으로 바꿉니다 |
| `SADE_HTTPS_PORT` | `8443` | 대시보드 포트. `443`으로 바꾸면 주소에 포트 없이 접속합니다 |
| `SADE_SYSLOG_HOST` | `localhost` | 다른 서버가 syslog를 보낼 이 서버의 이름이나 IP. syslog TLS 인증서 이름이 됩니다 |
| `SADE_LOG_RETENTION_DAYS` | `30` | 가린 로그를 보관하는 일수 |
| `SADE_AI_GEMINI_KEY` | 없음 | SADE AI 채팅용 기본 Gemini 키. 화면의 Configuration에서도 넣습니다 |

명세 가져오기 허용 주소, 평문 syslog 같은 나머지 설정은 [구성과 데이터 처리](../operations/architecture.md#settings)에 있습니다.

??? info "스크립트 없이 직접 실행"

    ```bash
    cp .env.example .env
    openssl rand -base64 32 | tr '+/' '-_'   # 이 값을 .env의 SADE_SECRET_KEY에 넣습니다
    # .env의 change-me 비밀번호 두 개(POSTGRES_PASSWORD, CLICKHOUSE_PASSWORD)도 긴 무작위 값으로 바꿉니다
    docker compose up -d --build
    ```

### CI가 만든 이미지로 실행

`./sade.sh images`는 빌드하지 않고 팀 CI가 GHCR에 올린 이미지를 받아 실행합니다.

- 버전은 `SADE_IMAGE_TAG`로 고릅니다. 기본값은 `dev`(가장 최근 dev)이고, `v2.0.0` 같은 태그나 `sha-<짧은 해시>`를 쓸 수 있습니다.
- 설정 파일과 마이그레이션은 받아 둔 저장소에서 읽으므로 저장소도 이미지와 같은 버전으로 받아 둡니다.
- 이미지가 비공개면 `read:packages` 권한이 있는 토큰으로 `docker login ghcr.io`를 먼저 합니다.

### 인터넷이 없는 서버에 설치 {#offline}

고객사 내부망처럼 인터넷이 없는 서버에는 이미지까지 담은 파일 하나를 가져가 설치합니다.

인터넷이 되는 PC에서 묶음을 만듭니다(약 650MB).

```bash
./sade.sh bundle v2.0.0
# dist/sade-v2.0.0.tar 와 무결성 확인용 dist/sade-v2.0.0.tar.sha256 이 만들어집니다
```

설치할 서버에 파일을 옮기고 아래를 실행합니다. 서버에는 Docker Engine과 Docker Compose v2만 있으면 됩니다.

```bash
sha256sum -c sade-v2.0.0.tar.sha256     # 파일이 온전한지 확인
tar -xf sade-v2.0.0.tar && cd sade-v2.0.0
./sade.sh load                          # 이미지를 불러오고 실행 (처음 한 번, 몇 분 걸림)
```

- Windows PC라면 Docker Desktop을 실행해 두고 묶음 폴더에서 `.\sade.cmd load`를 실행합니다.
- 묶음 폴더의 `INSTALL.txt`에 같은 안내가 있습니다. 그 뒤에는 같은 폴더에서 `./sade.sh`로 시작하고 `./sade.sh down`으로 멈춥니다.

## 3. 확인

| 확인 | 명령 |
|---|---|
| 컨테이너 상태 | `./sade.sh status` 또는 `docker compose ps` |
| backend 응답 | `curl -k https://localhost:8443/api/health` |
| 분석 상태 | `curl -k https://localhost:8443/api/v1/status` |
| 로그 | `./sade.sh logs` 또는 `docker compose logs --tail 100 backend analysis-worker vector` |

- 서비스가 모두 `running` 또는 `healthy`이고 `migrate`가 정상 종료 상태면 설치가 끝난 것입니다. `migrate`는 시작할 때 PostgreSQL 마이그레이션을 적용하고 종료합니다.
- 브라우저에서 <https://localhost:8443/>를 엽니다. 포트를 바꿨다면 그 포트로 엽니다.
- 처음 실행할 때 자체 서명 인증서를 만들기 때문에 브라우저 경고가 뜹니다. 기업 인증서는 `nginx-certs` 볼륨에 `tls.crt`, `tls.key`로 넣습니다.

## 4. 첫 자료 연결

기업 자료를 받기 전이면 [샘플 로그로 첫 결과 보기](first-run.md)로 화면 흐름을 먼저 확인합니다.

코드, 명세, 로그 순서로 연결하기를 권합니다. 명세와 로그의 서비스 이름을 코드 스캔 결과에 맞추기 쉽습니다.

1. [소스 코드](../connect/code.md): Connect > Source Code에서 GitHub 저장소를 스캔합니다.
2. [OpenAPI 명세](../connect/specs.md): Connect > Specifications에서 서비스 이름과 함께 등록합니다.
3. [로그](../connect/logs.md): Connect > Log Sources에서 [CSV](../connect/logs-csv.md)를 먼저 올려 필드 매핑을 확인한 뒤 [syslog](../connect/logs-syslog.md)나 [Kafka](../connect/logs-kafka.md)를 연결합니다.

결과는 [Overview](../features/overview.md)와 [Inventory](../features/inventory.md)에 나옵니다. 결과를 보는 순서는 [점검 흐름](workflow.md)에 있습니다.

??? info "멈추기와 지우기"

    ```bash
    ./sade.sh down           # 멈춤 (데이터 유지)
    ./sade.sh                # 다시 실행
    docker compose down -v   # 데이터까지 삭제 (되돌릴 수 없음)
    ```

    설치 문제는 [문제 해결](../troubleshooting/index.md)에 있습니다.
