# 스캔과 작업

SADE는 API 요청에서 수집·분석을 직접 실행하지 않고 작업을 큐에 넣습니다. worker가 실행하며 화면은 작업 상태를 조회합니다.

## 작업 구분

| 작업 | 외부 조회 | 결과 |
|---|---|---|
| Sync / Sync all | 로그 소스 수집 | 수집 상태·건수·확보한 증거 갱신. 전체 분석 결과 생성 안 함 |
| Run scan | 로그 수집 포함 | API 인벤토리·민감정보·명세 점검·흐름 및 스캔 이력 |
| GitHub Scan selected | 저장소 복제·코드 분석 | 코드 인벤토리·생성 명세·route map·HTTP 호출 |
| 자동 재분류 (`privacy-refresh`) | 없음 | 저장 근거의 민감정보 재계산. 새 정책 점검·스캔 이력 없음 |

**Run scan 전 Sync는 필수가 아닙니다.** 수집 상태만 확인하거나 특정 소스만 가져올 때 Sync를 사용합니다. 명세·코드 등록이나 룰 저장 후의 자동 재분류는 새 로그를 가져오는 작업과 다릅니다.

## 상태 흐름

`Queued → Running → Completed`가 정상 흐름입니다. Failed는 이유를 확인하고 입력을 고친 뒤 다시 실행합니다. Superseded는 설정이 바뀌어 오래된 입력의 작업이 적용되지 않은 상태입니다.

Scans는 로그 스캔 이력을 중심으로 보여주므로 GitHub 코드 스캔과 민감정보 재분류가 모두 새 로그 스캔 행으로 나타나지는 않습니다. 연결 화면의 작업 표시나 CLI jobs도 확인할 수 있습니다.

## 예약 실행

로그 연결의 Schedule에서 Manual / Every hour / Every 6 hours / Every day를 선택합니다. worker가 실행 중이어야 예약 시각을 확인하고 스캔을 큐에 넣습니다. 대시보드 탭을 열어 두는 것은 실행 조건이 아닙니다.

## 결과가 바뀌지 않을 때

- Queued가 지속되면 worker와 작업 lane을 확인합니다.
- 수집 실패 소스가 있으면 전체 Scan이 실패할 수 있습니다.
- 룰 변경 후 Classifying 상태가 길면 worker-light를 확인합니다.
- 저장 근거가 없거나 오래되면 재분류만으로 새 Value matched를 만들지 않습니다. 필요한 로그를 수집하는 Run scan을 실행하세요.

[구성과 worker](architecture.md) 및 [문제 해결](../troubleshooting/index.md)을 참고하세요.
