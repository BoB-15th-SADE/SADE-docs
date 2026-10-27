# 설치와 첫 연결

Docker로 SADE 참조 구현을 띄우고 로그 하나를 연결해 첫 결과를 봅니다. 명세와 코드는 나중에 붙여도 됩니다.

## 준비물

- [ ] Docker Engine과 Compose, 또는 Docker Desktop (이미지는 `linux/amd64`)
- [ ] GHCR에서 이미지를 받을 GitHub 토큰 (`read:packages` 권한)
- [ ] 연결할 로그: Splunk 주소·토큰·인덱스, 또는 Cloudera WebHDFS 주소

## 1. 설치

<div class="sade-steps" markdown>

1. **GHCR에 로그인합니다.** 비공개 이미지라 처음 한 번만 필요합니다.

    ```bash
    docker login ghcr.io -u <GitHub 아이디>
    ```

2. **설치 폴더를 만듭니다.**

    ```bash
    mkdir sade && cd sade
    mkdir -p data imports certs
    ```

3. **`docker-compose.yml`을 저장합니다.** SADE 저장소의 `deploy/docker-compose.yml`과 같은 파일입니다.

    ??? example "docker-compose.yml"

        ```yaml
        name: sade

        x-sade: &sade
          image: ${SADE_IMAGE:-ghcr.io/bob-15th-sade/sade:refactor-project-structure}
          working_dir: /workspace/apps/dashboard/backend
          environment:
            PYTHONUNBUFFERED: "1"
            SADE_PROJECT_ROOT: /workspace
          volumes:
            - "${SADE_DATA_DIR:-./data}:/workspace/apps/dashboard/data"
            - ./imports:/workspace/imports:ro
            - ./certs:/workspace/certs:ro
          restart: unless-stopped

        services:
          api:
            <<: *sade
            command: ["python", "api_server.py", "--host", "0.0.0.0", "--port", "8765"]
            ports:
              - "127.0.0.1:8765:8765"
          worker:
            <<: *sade
            command: ["python", "-m", "sade_cli", "worker", "--lane", "heavy"]
          worker-light:
            <<: *sade
            command: ["python", "-m", "sade_cli", "worker", "--lane", "light"]
        ```

4. **실행합니다.**

    ```bash
    docker compose up -d
    ```

5. 브라우저에서 <http://localhost:8765>를 엽니다. 포트는 이 컴퓨터(`127.0.0.1`)에만 열립니다.

</div>

| 폴더 | 쓰임 |
|---|---|
| `data/` | SADE DB(`sade.db`). 연결 설정, 수집 결과, 분석 결과 |
| `certs/` | 사내 CA 인증서 (읽기 전용으로 연결) |

## 2. 로그 연결

준비한 로그에 맞는 탭을 고르세요.

=== "Splunk"

    1. **Connect › Log Sources › Splunk › Connect**
    2. Search API URL, Index, Authentication token을 넣습니다.
    3. **Test connection** → **Save connection** → **Collect now**

    자세히: [Splunk](../connect/splunk.md)

=== "Cloudera"

    1. **Connect › Log Sources › Cloudera › Connect**
    2. WebHDFS URL, 인증, DataNode 주소를 넣고 **Browse folders**로 폴더를 고릅니다.
    3. **Test connection** → **Save connection** → **Collect now**

    자세히: [Cloudera](../connect/cloudera.md)

로그가 SADE에서 읽히는 형식인지 미리 보고 싶으면 [로그 확인기](../connect/logs.md#log-check)에 한 줄을 붙여 넣어 보세요.

## 3. 결과 보기

수집이 끝나면 다음 화면이 채워집니다.

| 화면 | 보이는 것 |
|---|---|
| **APIs › Inventory** | 서비스별 API, 호출 수, 인증 방식 |
| **APIs › Sensitive Data** | 민감정보 유형별 API |
| **APIs › Call History** | 최근 호출과 요청·응답 구조 |
| **Flows** | 호출자, 게이트웨이, 서버, DB를 잇는 지도 |

## 4. 더 붙이기

| 붙이면 | 더해지는 것 | 가이드 |
|---|---|---|
| OpenAPI 명세 | Shadow API, 호출별 명세 점검 | [OpenAPI 명세](../connect/specs.md) |
| GitHub 저장소 | 코드 기반 명세, 서비스 간 호출, DB 접근 | [GitHub 코드 스캔](../connect/code.md) |
| 서비스 간 호출 로그(Access·Application), DB 로그 | 요청 하나의 전체 경로, DB 접근 | [로그 필드 레퍼런스](../connect/schema.md) |

명세를 올린 뒤에는 **Run scan**으로 명세 점검을 실행합니다. 로그를 다시 가져오지 않습니다.

## 관리 명령

| 할 일 | 명령 |
|---|---|
| 상태 확인 | `docker compose ps` |
| 로그 보기 | `docker compose logs --tail 100 api worker worker-light` |
| 업데이트 | `docker compose pull && docker compose up -d` |
| 종료 (데이터 유지) | `docker compose down` |
| 버전 고정 | `SADE_IMAGE=ghcr.io/bob-15th-sade/sade:sha-<커밋> docker compose up -d` |

!!! warning "인터넷에 바로 공개하지 마세요"
    대시보드에는 자체 로그인이 없습니다. 원격에서 쓸 때는 SSH 터널(`ssh -L 8765:127.0.0.1:8765 USER@HOST`)이나 회사의 인증 프록시 뒤에 두세요.
