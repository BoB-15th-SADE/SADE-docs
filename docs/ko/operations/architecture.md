# 구성과 실행 방식

SADE는 화면/API 서버, SQLite와 백그라운드 worker로 구성됩니다. 수집·분석은 worker가 수행하므로 브라우저 요청이 오래 걸리는 작업을 직접 실행하지 않습니다.

## 구성 요소

| 구성 | 역할 |
|---|---|
| API 서버 | 화면 제공, 입력 검증, 설정 저장, 작업 큐 등록, 결과 조회 |
| SQLite | 설정·작업·분석 결과·룰 버전·Splunk 증거 캐시 |
| heavy worker | Sync, 로그 Scan, CodeScan |
| light worker | 저장된 자료의 `privacy-refresh` |
| CodeScan | 코드 API·필드·게이트웨이 설정·HTTP 호출 분석 |

기본 Compose는 `api`, `worker`, `worker-light`를 실행합니다. 둘 이상의 worker는 같은 DB를 사용합니다. `--lane`을 생략한 worker 하나도 모든 작업을 순서대로 처리할 수 있습니다.

## Docker 없이 실행

SADE 저장소에서 각각 별도 터미널로 실행합니다.

```bash
cd apps/sade-dashboard
python api_server.py --host 127.0.0.1 --port 8765
```

```bash
cd apps/sade-dashboard
python -m sade_cli worker --lane heavy
```

```bash
cd apps/sade-dashboard
python -m sade_cli worker --lane light
```

대시보드 런타임은 Python 표준 라이브러리를 사용합니다. 코드 분석에는 별도 CodeScan 의존성과 git이 필요하며 Docker 이미지는 이를 포함합니다. 로컬 CodeScan은 도구의 설치 안내와 `--scanner-python`, `--scanner-dir` 설정을 확인하세요.

## 결과 조회 방식

`/api/model`은 화면 요약을 제공하고, API 상세와 호출 목록은 전용 경로에서 필요한 분량만 읽습니다. 화면을 새로고침하거나 검색해도 원격 로그를 자동 조회하지 않습니다. `/api/export`는 전체 모델을 제공합니다.

기본 배포는 소스를 이미지에 포함하고 데이터·imports·certs만 마운트합니다. 개발용 소스 마운트는 `compose.dev.yaml`을 추가할 때만 사용합니다.

내장 서버 인증·조직별 RBAC는 현재 제공되지 않습니다. 기본 로컬 바인딩을 넘어 운영하려면 배포 환경의 접근 제어와 저장 보호를 별도로 구성해야 합니다.
