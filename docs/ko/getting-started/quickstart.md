# 빠른 시작

Docker로 SADE 대시보드를 실행하고 첫 스캔까지 해 봅니다.

## 준비

- Docker Desktop (Docker Compose 포함)
- Git

## 1. 내려받기

!!! note
    SADE 코드 저장소는 현재 비공개입니다. 접근 권한이 있어야 내려받을 수 있습니다.

```bash
git clone -b feat/dashboard-design https://github.com/BoB-15th-SADE/SADE.git
cd SADE
```

## 2. 실행

```bash
docker compose up -d --build
```

- 대시보드: <http://localhost:8765> (이 컴퓨터에서만 접속 가능)
- 실행되는 컨테이너
    - `api`: 대시보드 화면과 API, 작업 접수
    - `worker`: 로그 수집과 분석 실행
- 설정, 명세, 결과는 `apps/sade-dashboard/data`와 SQLite DB에 저장됩니다.

## 3. 첫 스캔

1. **Connect > Specifications**에서 OpenAPI 명세를 올리면 서비스가 등록됩니다.
2. **Connect > Log Sources**에서 로그를 연결합니다. ([로그 연결](../connect/logs.md) 참고)
3. **Run scan**을 누르면 분석이 시작됩니다.
4. **APIs > Inventory**에서 결과를 확인합니다.

## 4. 종료

```bash
docker compose down
```

!!! tip
    작성 예정: 샘플 데이터로 바로 돌려 보는 방법
