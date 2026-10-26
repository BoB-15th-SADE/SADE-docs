# Cloudera (WebHDFS)

HDFS에 저장된 JSON 로그 파일을 WebHDFS REST API로 읽습니다. 폴더를 고르면 하위 폴더까지 읽고, 다음 수집부터는 파일마다 새로 추가된 부분만 읽습니다.

## 시작하기 전에

- [ ] SADE 서버에서 NameNode의 WebHDFS HTTPS 주소로 접속이 됩니다. 예: `https://namenode.company.internal:9871`
- [ ] 파일을 실제로 내려주는 DataNode 주소(`host:port`) 목록을 알고 있습니다.
- [ ] Delegation token이 있거나, 보안이 적용되지 않은 클러스터라면 읽기 권한이 있는 HDFS 사용자 이름이 있습니다.
- [ ] 로그가 한 줄에 JSON 하나인 텍스트 파일입니다(`.jsonl`, `.ndjson`, `.json`, `.log`). 압축 파일은 읽지 않습니다.
- [ ] (사내 인증서를 쓰면) CA 인증서 파일을 `certs/`에 두었습니다.

!!! warning "Kerberos 자동 로그인은 지원하지 않습니다"
    SPNEGO 로그인이나 토큰 자동 발급·갱신은 하지 않습니다. 미리 발급한 delegation token을 넣어야 합니다.

## SADE에서 연결하기

<div class="sade-steps" markdown>

1. **Connect › Log Sources › Cloudera › Connect**를 엽니다.
2. **WebHDFS URL**을 넣습니다. `/webhdfs/v1`은 붙여도 되고 빼도 됩니다.
3. **Authentication**에서 Delegation token 또는 Unsecured HDFS user를 고르고 값을 넣습니다.
4. **DataNode addresses**에 DataNode의 `host:port`를 한 줄에 하나씩 넣습니다.
5. **Browse folders**로 폴더를 탐색하고 로그 폴더에서 **Use this folder**를 누릅니다. 이 계정이 읽고 들어갈 수 있는 폴더만 보입니다.
6. **Test connection**으로 경로 접근을 확인하고 **Save connection**을 누릅니다.
7. **Collect now**로 실제 파일을 읽습니다.

</div>

!!! info "Test connection이 성공해도"
    Test는 `GETFILESTATUS`로 경로에 접근할 수 있는지만 봅니다. 파일 내용 읽기는 Collect now에서 확인됩니다.

## 동작 방식

| 단계 | WebHDFS 호출 | 하는 일 |
|---|---|---|
| Browse folders | `GETFILESTATUS`, `LISTSTATUS_BATCH`, `CHECKACCESS` | 읽고 들어갈 수 있는 폴더만 목록으로 보여 줌. 파일 내용은 읽지 않음 |
| Test connection | `GETFILESTATUS` | 경로 접근 확인 |
| Collect now | `LISTSTATUS_BATCH`(모든 페이지, 하위 폴더 포함), `OPEN` | 파일을 2 MB씩 나눠 읽음 |

- **기간**: Collection 화면의 수집 기간을 실행 시점에 한 번 확정하고, **로그 안의 이벤트 시각**으로 거릅니다. 파일 수정 시각으로 대신하지 않습니다. 시작은 포함, 끝은 제외입니다.
- **이어 읽기**: 파일마다 마지막으로 읽은 위치를 기록합니다. 다음 수집은 그 뒤만 읽고, 바뀌지 않은 파일은 다시 읽지 않습니다. 파일이 교체되거나 짧아지면 새 파일로 보고 처음부터 읽습니다.
- **덜 쓰인 줄**: 아직 줄바꿈이 없는 마지막 줄과 기간보다 미래인 줄은 다음 수집으로 넘깁니다.
- **안전한 이동**: 파일 읽기가 NameNode가 아닌 곳으로 넘어가면 **DataNode addresses에 있는 주소로만** 따라갑니다. 목록에 없는 서버로는 토큰을 보내지 않습니다.
- **실패하면 그대로**: 잘못된 JSON, 시각을 알 수 없는 줄, 읽다 끊긴 파일이 있으면 그 소스의 이전 자료와 체크포인트를 바꾸지 않습니다.

## 한도

| 항목 | 한도 |
|---|---|
| 한 번 요청에서 읽는 크기 | 2 MB |
| 한 번 수집에서 읽는 양 | 256 MB |
| 탐색하는 폴더·파일 항목 | 100,000개 |
| 요청 대기 시간 | 90초 |

## 자주 나는 오류

| 메시지 | 원인 | 조치 |
|---|---|---|
| `A WebHDFS delegation token is required.` | Delegation token 방식인데 토큰이 비어 있음 | 토큰 입력 |
| `DataNode entries must be host:port addresses` | 주소 형식 | `dn1.company.internal:9865`처럼 입력 |
| `Remote server returned HTTP 403` | 폴더 읽기 권한 없음 | 계정 권한 확인. 루트를 못 읽는 계정은 관리자가 시작 폴더를 알려 줘야 함 |
| `TLS failed` | 사내 인증서 | CA 인증서 지정 |
| `HDFS collection contains unreadable or unsupported records` | 읽을 수 없는 줄이나 파일 | 해당 파일을 확인. 이전 자료와 체크포인트는 그대로 유지됨 |

## 참고

- 실제 Cloudera NameNode·DataNode에 HTTPS와 CA 검증으로 연결해 폴더 탐색과 기간 수집을 확인했습니다. 대규모 운영 클러스터 검증은 별도로 필요합니다.
- Apache Hadoop 공식 문서: [WebHDFS REST API](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/WebHDFS.html)

[<span class="q">궁금하신가요?</span><span class="t">형식이 제각각인 로그를 하나의 형태로 맞추는 과정</span><span class="arrow">→</span>](../technology/log-normalization.md){ .sade-curious }
