# SADE 문서

SADE는 회사에 이미 있는 **SIEM 로그, API 명세, 소스 코드**를 모아 하나의 API 목록으로 정리합니다. 어떤 API가 있는지, 그 API가 어떤 데이터를 주고받는지, 요청이 어느 서비스를 거쳐 가는지를 한 화면에서 볼 수 있습니다. 서비스에 에이전트를 설치하거나 트래픽을 가로채지 않습니다.

<div class="sade-links" markdown>

[**설치하고 연결하기**<span>Docker로 설치하고 첫 로그를 연결합니다. 10분이면 충분합니다.</span>](getting-started/quickstart.md)

[**연동 가이드**<span>Splunk, Cloudera, 로그 파일, OpenAPI, GitHub 연결 방법</span>](connect/logs.md)

[**사용 방법**<span>인벤토리, 민감정보, 서비스 흐름, 명세 점검 결과 보는 법</span>](features/inventory.md)

[**핵심 기술**<span>로그 정규화부터 code2spec, code2flow까지 내부 동작 설명</span>](technology/index.md)

</div>

## 이런 질문에 답합니다

| 질문 | 보는 곳 |
|---|---|
| 우리 회사에 실제로 어떤 API가 있고, 명세에 빠진 API는 무엇인가? | [API 인벤토리](features/inventory.md) |
| 각 API가 어떤 개인정보와 민감정보를 주고받는가? | [민감정보](features/sensitive-data.md) |
| 요청 하나가 어느 서비스를 거쳐 어디까지 가는가? | [서비스 흐름](features/flows.md), [요청 흐름](features/call-history.md) |
| 실제 호출이 명세와 어디서 다른가? 인증 없이 성공한 호출이 있는가? | [호출 기록과 Spec check](features/call-history.md) |

## 세 가지 자료

| 자료 | 알 수 있는 것 | 알 수 없는 것 |
|---|---|---|
| **Log** | 실제 호출, 호출 횟수, 인증 방식, 주고받은 필드 | 수집 기간 밖의 호출, 로그에 남지 않은 본문 |
| **Spec** | 서비스가 약속한 요청·응답 형식 | 실제로 호출되는지, 구현되어 있는지 |
| **Code** | 구현된 API, 코드가 부르는 다른 서비스, 권한 검사 코드 | 실제로 실행되는지, 얼마나 자주 실행되는지 |

셋 중 하나만 있어도 시작할 수 있습니다. 명세만 올려도 API 목록과 민감정보 후보가 나오고, 로그를 붙이면 실제 호출이, 코드를 붙이면 구현 위치와 서비스 간 호출이 더해집니다. API와 필드마다 어디서 확인했는지 `Spec` / `Code` / `Log` 표시가 붙습니다.

## 동작 방식

<div class="sade-pipe" markdown>
<div markdown>**연결**<p>Splunk, Cloudera, 파일, OpenAPI, GitHub</p></div>
<div markdown>**수집** (Collect now)<p>로그를 읽고 값은 지운 채 저장</p></div>
<div class="is-key" markdown>**분석**<p>API 식별, 민감정보, 흐름</p></div>
<div markdown>**점검** (Run scan)<p>저장된 결과로 명세 점검</p></div>
</div>

- **Collect now**는 외부 로그를 읽어 인벤토리, 민감정보, Flows를 갱신합니다. 수집 주기를 정해 두면 자동으로 실행됩니다.
- **Run scan**은 이미 저장된 수집 결과만 씁니다. SIEM에 다시 접속하지 않습니다.
- 저장할 때 본문과 헤더의 **실제 값은 지웁니다.** 화면에는 `<string>` 같은 타입만 보입니다.

## 결과를 볼 때

SADE가 보여 주는 것은 **수집한 범위 안에서 확인한 사실**입니다. 민감정보 발견, 명세와 다른 호출, Shadow API는 검토할 대상이지, 법 위반이나 전체 API의 안전을 자동으로 판단한 결과가 아닙니다. 확인할 자료가 없는 항목은 "없음"이 아니라 "미확인"이나 "Not evaluated"로 표시합니다. 자세한 범위는 [지원 범위와 제한](reference/limitations.md)을 보세요.
