# 연결·분석 문제 해결

마지막 작업의 상태와 오류를 먼저 확인합니다. 연결 시험(Test), 수집(Collect now), 검사(Run scan)는 서로 다른 단계입니다.

| 증상 | 확인할 내용 | 다음 조치 |
|---|---|---|
| 작업이 계속 Queued | worker 실행·동일 DB 사용·lane | Compose worker 로그 확인 |
| 룰 저장 후 Classifying 지속 | worker-light | light worker 실행 및 작업 오류 확인 |
| Test 성공, 수집 실패 | 실제 읽기 권한·본문 형식·수집 크기 | 기간 축소, DataNode 허용 목록, JSON 확인 |
| 수집이 Partial | 일부 시간 창·파일 실패 | 다시 Collect now. 마친 구간은 다시 읽지 않음 |
| 명세를 올렸는데 Shadow가 그대로 | 검사를 다시 하지 않음 | Run scan |
| Flows에 서비스 간 선이 없음 | request ID·trace 필드 | [로그로 할 수 있는 일](../connect/logs.md#log-check) 확인 |
| HTTP 401 / 403 | 토큰 만료·검색/읽기 권한 | 해당 권한의 토큰으로 연결 갱신 |
| TLS 신뢰 오류 | 사내 CA·인증서 경로 | 프로젝트 certs에 CA 제공 후 경로 지정 |
| API가 안 나옴 | method/path/status와 시각 매핑 | Test 미리보기와 [Field mapping](../connect/logs.md#field-mapping) 확인 |
| API가 Unassigned로 보임 | Service 배정·로그 서비스 값 | ID·별칭·Path prefix 확인 |
| 본문·헤더가 없음 | 원천 로그의 실제 수집 여부 | 원천 로깅과 매핑 확인. 없는 값은 생성하지 않음 |
| 필드만 매칭되고 값 체크 없음 | 선언/마스킹/미지원 프로파일 | Sensitive data의 검사 사유 확인 |
| 룰 변경 후 일부 결과만 갱신 | 룰 적용 범위, 저장된 자료 부족 | All APIs 범위 확인, 실제 값이 필요한 룰이면 다시 수집 |
| Settings changed / Superseded | 다른 저장으로 입력 버전 변경 | 새로고침 후 최신 설정에 수정 재적용 |
| 코드가 있는데 연결선 없음 | 동적 주소·서비스 매핑·미지원 클라이언트 | API 상세의 Code 탭과 Links may be missing 확인 |

## worker 확인

SADE 저장소에서 실행합니다.

```bash
docker compose ps
docker compose logs --tail 100 worker worker-light
```

서버 health가 정상이어도 worker가 실행 중이라는 보장은 없습니다. 예약 실행도 worker가 필요합니다.

## 결과를 공유할 때

작업 ID·버전·시간 범위·오류 코드와 합성 입력 예시를 함께 기록합니다. 토큰·원문 로그 대신 민감 값을 제거한 구조를 공유하세요. 연결별 오류는 [Splunk](../connect/splunk.md), [WebHDFS](../connect/cloudera.md)를 참고합니다.
