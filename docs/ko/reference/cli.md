# CLI 명령

CLI와 화면은 같은 작업 큐와 분석 코드를 사용합니다. SADE 저장소의 `apps/sade-dashboard`에서 실행합니다.

## 기본 명령

| 명령 | 하는 일 |
|---|---|
| `python -m sade_cli scan` | 수집과 전체 로그 분석 실행 |
| `python -m sade_cli sync` | 활성 소스 수집 |
| `python -m sade_cli sync --source-id SOURCE_ID` | 특정 소스 수집 |
| `python -m sade_cli privacy-refresh` | 외부 조회 없이 저장 자료의 민감정보 재분류 |
| `python -m sade_cli jobs` | 현재 작업 목록 |
| `python -m sade_cli worker --lane heavy` | 수집·로그 스캔·코드 스캔 worker |
| `python -m sade_cli worker --lane light` | 민감정보 재분류 worker |
| `python -m sade_cli migrate` | 기존 JSON을 보존하며 SQLite 초기화 |

`scan`, `sync`, `privacy-refresh`의 `--submit`은 작업을 큐에 넣고 종료합니다. 처리하려면 worker가 실행 중이어야 합니다. 옵션이 없으면 같은 작업 실행 코드로 직접 완료까지 처리합니다.

## 로컬 코드 스캔

```bash
python -m sade_cli code-scan /path/to/repository --id local-code --name "Local code" --create-services
```

환경에 따라 `--scanner-python`, `--scanner-dir`, `--config`를 지정합니다. `--map LABEL=SERVICE`로 코드 label을 서비스 ID에 연결할 수 있습니다. 코드 인벤토리와 HTTP 호출을 함께 분석합니다.

## 기존 결과 가져오기

```bash
python -m sade_cli code-import --file /path/to/inventory.json --id local-code --name "Local code" --create-services
python -m sade_cli route-import --file /path/to/route-map.json --id local-routes --name "Gateway routes"
python -m sade_cli flow-scan /path/to/repository --id local-code
```

`flow-scan`은 이미 등록한 코드 인벤토리의 서비스 간 호출을 다시 읽습니다. `/path/to/...`는 실제 파일·폴더로 바꾸세요. 전체 옵션은 각 명령의 `--help`에서 확인합니다.
