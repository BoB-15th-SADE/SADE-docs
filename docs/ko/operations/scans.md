# 수집과 스캔

SADE의 작업은 **가져오기(Collect)**와 **검사하기(Scan)**로 나뉩니다. 화면은 작업을 큐에 넣기만 하고, 실제 실행은 worker가 합니다.

## 세 가지 작업

| 버튼 | 하는 일 | 외부 접속 | 갱신되는 것 |
|---|---|---|---|
| **Collect now** | 로그를 가져와 값을 지운 채 저장 | 함 (Splunk, WebHDFS, 파일) | 인벤토리, 민감정보, Flows, Call History |
| **Run scan** | 저장된 수집 결과로 명세 점검 | 안 함 | 명세 점검, Shadow API, 스캔 이력 |
| **Refresh** | 저장된 결과를 다시 불러옴 | 안 함 | 화면만 |

이 밖에 자동으로 도는 작업이 있습니다.

| 작업 | 언제 | 외부 접속 |
|---|---|---|
| GitHub 코드 스캔 | Source Code에서 **Scan selected** | 저장소 복제 |
| 민감정보 재분류 (`privacy-refresh`) | 명세·코드 등록, 규칙 저장 후 자동 | 안 함 |
| 예약 수집 | 소스의 Schedule 주기마다 | 함 |

## 왜 나눴나

- **SIEM 부담**: 명세나 규칙을 고칠 때마다 SIEM을 다시 검색하지 않습니다.
- **같은 데이터로 비교**: 같은 수집 결과로 다시 검사해야 규칙 변경 전후를 비교할 수 있습니다.
- **체크포인트 보호**: 어디까지 가져왔는지는 수집만 바꿉니다. 검사가 체크포인트를 건드리지 않습니다.
- **장애 분리**: SIEM 연결이 끊겨도 마지막 수집 결과로 검사를 계속합니다.

## 상태

`Queued → Running → Completed`가 정상입니다.

| 상태 | 뜻 |
|---|---|
| Failed | 실패. 이유를 확인하고 입력을 고친 뒤 다시 실행 |
| Partial | 일부 소스나 일부 구간만 수집됨. 다음 수집이 이어서 읽음 |
| Superseded | 실행 중에 설정이 바뀌어 결과를 적용하지 않음 |

## 예약 수집

로그 소스의 **Schedule**을 Every hour, Every 6 hours, Every day 중 하나로 두면 worker가 주기마다 수집합니다. 매번 지난 체크포인트 이후만 읽습니다. 대시보드를 열어 두지 않아도 worker가 실행 중이면 동작합니다. 명세 점검은 Run scan을 눌러야 갱신됩니다.

## worker

| worker | 하는 일 |
|---|---|
| `worker` (heavy) | 수집, 검사, 코드 스캔 |
| `worker-light` | 민감정보 재분류 |

작업이 Queued에 머물면 worker가 떠 있는지 확인하세요.

```bash
docker compose ps
docker compose logs --tail 100 worker worker-light
```

## 결과가 바뀌지 않을 때

- 수집이 Partial이면 실패한 구간부터 다시 수집하세요. 마친 구간은 다시 읽지 않습니다.
- 규칙을 바꿨는데 Value matched가 새로 생기지 않으면, 실제 값이 있어야 판단할 수 있는 규칙일 수 있습니다. 다시 수집하세요.
- 명세를 올린 뒤 Shadow나 Spec check가 안 바뀌면 Run scan을 실행하세요.

[구성과 실행 방식](architecture.md), [문제 해결](../troubleshooting/index.md)도 참고하세요.
