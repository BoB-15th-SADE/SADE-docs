# Cloudera 연결 (WebHDFS)

HDFS에 저장된 JSONL 로그 파일을 WebHDFS REST API로 읽어 옵니다.

## 준비물

| 항목 | 설명 |
|---|---|
| WebHDFS URL | SADE 서버에서 접속 가능한 HTTPS NameNode 주소 (`/webhdfs/v1`은 넣어도 되고 빼도 됨) |
| HDFS 로그 경로 | JSONL 파일 하나 또는 파일이 든 디렉터리 |
| 인증 | Delegation token 또는 보안 미적용 클러스터의 HDFS 사용자 이름 |
| DataNode 주소 | 파일 읽기 요청이 넘어갈 DataNode의 `host:port` 목록 |
| CA 인증서 (선택) | 사내 인증서를 쓰는 경우 |

## 설정 항목

| 항목 | 필수 | 설명 |
|---|---|---|
| Name | 예 | 화면에 보일 연결 이름 |
| WebHDFS URL | 예 | `https://`로 시작 |
| HDFS log path | 예 | 파일 또는 디렉터리. 디렉터리는 하위 폴더를 탐색하지 않고 최대 100개 파일 |
| Authentication | 예 | Delegation token 또는 Unsecured HDFS user |
| Delegation token / HDFS user | 예 | 고른 인증 방식에 따라 입력 |
| DataNode addresses | 예 | 파일 읽기를 허용할 HTTPS DataNode 주소 (최대 100개) |
| CA certificate file | 아니요 | SADE 프로젝트 폴더 안의 인증서 파일 경로 |

- 읽는 파일 확장자: `.jsonl`, `.ndjson`, `.json`, `.log`
- 파일의 한 줄이 JSON 이벤트 하나여야 합니다.
- 필드 매핑과 서비스 배정은 [로그 연결 개요](logs.md)와 같습니다.

## 동작 방식

| 단계 | WebHDFS 호출 | 확인하는 것 |
|---|---|---|
| Test connection | `GETFILESTATUS` | 경로에 접근할 수 있는지 |
| Sync | `LISTSTATUS`(디렉터리) + `OPEN` | 실제 파일 읽기 |

- Test가 성공해도 파일 읽기 성공을 보장하지 않습니다. 실제 읽기는 Sync에서 확인됩니다.
- 파일 읽기 요청이 NameNode가 아닌 곳으로 넘어가면, **DataNode addresses에 있는 주소로만** 따라갑니다.
  목록에 없는 서버로는 토큰을 보내지 않습니다.

!!! warning "Kerberos 미지원"
    Kerberos(SPNEGO) 자동 로그인과 토큰 발급, 갱신은 지원하지 않습니다. 발급받은 delegation token을 입력해야 합니다.

## 제한

- 한 번에 읽는 양은 연결당 10 MB입니다.
- 가져온 내용은 메모리에만 두므로, SADE를 다시 시작하면 Sync를 다시 해야 합니다.
- 실제 기업 Cloudera 환경과의 연결은 아직 검증하지 않았습니다. 모의 응답 서버로만 시험했습니다.

## 자주 나는 오류

| 메시지 | 원인과 조치 |
|---|---|
| `A WebHDFS delegation token is required.` | 인증 방식이 Delegation token인데 토큰이 없음 |
| `HDFS directory has over 100 log files.` | 더 좁은 디렉터리 지정 |
| `DataNode entries must be host:port addresses` | DataNode 주소를 `host:port` 형식으로 입력 |
| `TLS failed` | 사내 인증서. CA certificate file 지정 |

## 참고

- Apache Hadoop 공식 문서: [WebHDFS REST API](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/WebHDFS.html)
