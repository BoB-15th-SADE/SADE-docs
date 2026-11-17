# 설치와 첫 연결

## 준비 사항

| 항목 | 내용 |
|---|---|
| 프로그램 | Docker Engine과 Docker Compose v2, 또는 Docker Desktop(Linux 컨테이너 모드) |
| 이미지 | `linux/amd64` |
| 포트 | 대시보드 HTTPS 443(변경 가능), syslog 수신 6514(TLS) |
| 인터넷 | 처음 이미지를 받을 때 필요합니다. 실행 중에는 직접 연결한 GitHub, Kafka, 허용한 명세 주소에만 접속합니다 |

!!! warning "로그인 기능이 없습니다"
    현재 버전에는 로그인과 이용자별 권한이 없습니다.

    기본 설정에서는 설치한 서버(`127.0.0.1`)에서만 대시보드가 열립니다. 다른 PC에서 열려면 방화벽으로 접속 주소를 제한하세요.

## 1. 저장소 받기

```bash
git clone https://github.com/BoB-15th-SADE/SADE.git
cd SADE
```

## 2. 설정 파일 만들기

```bash
cp .env.example .env
```

`.env`에 아래 값을 넣습니다. `.env`는 git에 올라가지 않습니다.

| 이름 | 값 |
|---|---|
| `POSTGRES_PASSWORD`, `CLICKHOUSE_PASSWORD` | 긴 무작위 문자열. 컨테이너끼리 쓰는 값입니다. 화면 로그인 비밀번호와 관계없습니다 |
| `SADE_SECRET_KEY` | GitHub 토큰을 암호화하는 키. 아래 명령으로 만듭니다 |
| `SADE_HTTPS_BIND`, `SADE_HTTPS_PORT` | 대시보드 주소와 포트. 기본 `127.0.0.1`, `443` |
| `SADE_SYSLOG_HOST` | 다른 서버가 syslog를 보낼 이 서버의 이름이나 IP. syslog TLS 인증서 이름이 됩니다 |

```bash
openssl rand -base64 32 | tr '+/' '-_'
# Python cryptography가 있으면
python -c 'from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())'
```

!!! warning "처음 실행한 뒤에는 바꾸지 않습니다"
    `SADE_SECRET_KEY`와 두 비밀번호는 데이터 볼륨과 짝입니다. 바꾸면 저장한 토큰을 읽지 못하거나 DB에 접속하지 못합니다.

로그 보관 기간, 명세 가져오기 허용 주소, 평문 syslog 같은 나머지 설정은 [구성과 데이터 처리](../operations/architecture.md#settings)에 있습니다.

## 3. 실행

이 PC에서 이미지를 빌드해 실행합니다.

```bash
docker compose up -d --build
```

팀 CI가 GHCR에 올린 이미지로 실행하려면 아래 명령을 씁니다. Vector 설정과 마이그레이션은 저장소에서 읽으므로, 저장소도 이미지와 같은 브랜치로 받아 둡니다.

```bash
docker compose -f compose.yaml -f compose.images.yaml pull
docker compose -f compose.yaml -f compose.images.yaml up -d
```

- 이미지 태그는 `SADE_IMAGE_TAG`로 고릅니다. 기본값은 `dev-v2`입니다.
- 브랜치 이름의 `/`는 `-`로 바꿉니다. 예: `feat-api-asset-prioritization`
- 커밋 하나를 고를 때는 `sha-<짧은 해시>`를 씁니다.

## 4. 확인

| 확인 | 명령 |
|---|---|
| 컨테이너 상태 | `docker compose ps` |
| backend 응답 | `curl -k https://localhost/api/health` |
| 분석 상태 | `curl -k https://localhost/api/v1/status` |
| 로그 | `docker compose logs --tail 100 backend analysis-worker vector` |

- 서비스가 모두 `running` 또는 `healthy`이고 `migrate`가 정상 종료 상태면 설치가 끝난 것입니다. `migrate`는 시작할 때 PostgreSQL 마이그레이션을 적용하고 종료합니다.
- 브라우저에서 <https://localhost/>를 엽니다.
- 처음 실행할 때 자체 서명 인증서를 만들기 때문에 브라우저 경고가 뜹니다. 기업 인증서는 `nginx-certs` 볼륨에 `tls.crt`, `tls.key`로 넣습니다.

## 5. 첫 자료 연결

기업 자료를 받기 전이면 [샘플 로그로 첫 결과 보기](first-run.md)로 화면 흐름을 먼저 확인합니다.

코드, 명세, 로그 순서로 연결하기를 권합니다. 명세와 로그의 서비스 이름을 코드 스캔 결과에 맞추기 쉽습니다.

1. [소스 코드](../connect/code.md): Connect > Source Code에서 GitHub 저장소를 스캔합니다.
2. [OpenAPI 명세](../connect/specs.md): Connect > Specifications에서 서비스 이름과 함께 등록합니다.
3. [로그](../connect/logs.md): Connect > Log Sources에서 [CSV](../connect/logs-csv.md)를 먼저 올려 필드 매핑을 확인한 뒤 [syslog](../connect/logs-syslog.md)나 [Kafka](../connect/logs-kafka.md)를 연결합니다.

결과는 [Overview](../features/overview.md)와 [Inventory](../features/inventory.md)에 나옵니다. 결과를 보는 순서는 [점검 흐름](workflow.md)에 있습니다.

## 멈추기와 지우기

```bash
docker compose stop      # 멈춤 (데이터 유지)
docker compose start     # 다시 실행
docker compose down      # 컨테이너 삭제 (데이터 유지)
docker compose down -v   # 데이터까지 삭제 (되돌릴 수 없음)
```

설치 문제는 [문제 해결](../troubleshooting/index.md)에 있습니다.
