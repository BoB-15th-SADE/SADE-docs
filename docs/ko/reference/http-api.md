# HTTP API

대시보드가 사용하는 현재 HTTP 경로입니다. 기본 주소는 `http://127.0.0.1:8765`이며 모든 POST 입력은 JSON 객체입니다. 버전 고정된 공개 SaaS API 계약은 아니므로 프로젝트 버전과 함께 확인하세요.

## 결과와 상태 조회

| 메서드 | 경로 | 반환 자료 |
|---|---|---|
| GET | `/api/health` | API·DB 접근 상태. worker 생존 검사는 아님 |
| GET | `/api/model` | 화면 요약 모델, 작업·민감정보 상태 |
| GET | `/api/export` | 전체 모델 |
| GET | `/api/apis/{id}` | URL 인코딩한 API ID의 상세와 호출 |
| GET | `/api/calls` | 저장된 호출 페이지 |
| GET | `/api/jobs/{id}` | 작업 상태·결과·오류 |
| GET | `/api/connections` | 서비스·소스 등록 정보 |
| GET | `/api/privacy/config` | 활성 민감정보 구성·유형·룰 |
| GET | `/api/github/repos` | 저장한 GitHub 연결에서 읽을 수 있는 저장소 |

`/api/calls`는 `offset`(기본 0), `limit`(기본 20, 최대 200), `api`, `method`, `status`(2/3/4/5), `check`, `q`를 지원합니다. 반환값은 `calls`, `total`, `offset`, `limit`입니다.

## 작업 실행

| 메서드 | 경로 | 입력과 동작 |
|---|---|---|
| POST | `/api/scan` | `{}`. 로그 수집과 분석 작업, HTTP 202 |
| POST | `/api/connectors/import` | `{}` 또는 `{"source_id":"…"}`. 수집 작업, HTTP 202 |
| POST | `/api/github/scan` | GitHub 저장소 선택. 코드 스캔 작업 |
| POST | `/api/connectors/test` | 연결 초안의 접근 시험. 저장 안 함 |

Scan/Sync 응답의 `job.id`로 상태를 조회합니다. HTTP 202는 작업 완료가 아니라 큐 등록입니다.

```bash
curl -X POST http://127.0.0.1:8765/api/scan -H "Content-Type: application/json" -d "{}"
```

## 구성 변경

| 경로 (POST) | 용도 |
|---|---|
| `/api/services` | 서비스·명세 등록 |
| `/api/connections/source` | 로그 소스 설정 저장 |
| `/api/connections` | 연결 레지스트리 저장 |
| `/api/code` / `/api/routing` | 코드 인벤토리 / route map 등록 |
| `/api/settings` | 일반·접근 범위 설정 저장 |
| `/api/privacy/config` | `config` 저장 또는 `version` 복원. `workspace_revision`으로 충돌 확인 가능 |
| `/api/connections/disconnect` | 등록된 연결 해제 |
| `/api/github/connect` / `/api/github/disconnect` | GitHub 연결 관리 |
| `/api/github/routes/restore` | 해당 저장소 route map 재등록 허용 |

구성 저장은 민감정보 자동 재분류를 큐에 넣을 수 있습니다. 충돌 메시지가 나오면 최신 설정을 다시 읽은 뒤 수정하세요.

## 탐지 샘플 시험

`POST /api/privacy/test`는 `sample`, `location`, 선택적인 `config`, `api_id`, `rule_id`를 받습니다. 샘플은 최대 32 KiB이며 `matches`, `reason_codes`, `field_count`, `stored:false`를 반환합니다. 결과의 `data_type` 등은 내부 유형 ID입니다.

```json
{"sample":{"email":"person@example.com"},"location":"request.body"}
```

내장 사용자 인증은 없습니다. 브라우저의 다른 Origin에서 오는 쓰기 요청은 거부하며, 외부 배포의 사용자 인증을 대신하는 기능은 아닙니다.
