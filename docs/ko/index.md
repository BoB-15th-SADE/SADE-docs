# SADE 문서

SADE는 이미 쌓여 있는 **SIEM 로그, API 명세, 소스 코드**를 하나의 API 목록으로 맞춰서, 우리 회사에 어떤 API가 있고 그 API가 어떤 데이터를 주고받으며 어디로 흐르는지 보여 줍니다. 서비스에 에이전트를 심거나 트래픽을 가로채지 않습니다.

<div class="sade-links" markdown>

[**설치하고 연결하기**<span>Docker로 설치하고 첫 로그를 연결합니다. 10분이면 됩니다.</span>](getting-started/quickstart.md)

[**연동 가이드**<span>Splunk, Cloudera, 로그 파일, OpenAPI, GitHub를 연결합니다.</span>](connect/logs.md)

[**사용 방법**<span>인벤토리, 민감정보, 서비스 흐름, 명세 점검을 읽는 법</span>](features/inventory.md)

[**핵심 기술**<span>로그 정규화부터 code2spec, code2flow까지 내부 동작</span>](technology/index.md)

</div>

## 이런 질문에 답합니다

| 질문 | 보는 곳 |
|---|---|
| 우리 회사에 실제로 어떤 API가 있고, 명세에 없는 API는 무엇인가? | [API 인벤토리](features/inventory.md) |
| 각 API는 어떤 개인정보·민감정보를 주고받는가? | [민감정보](features/sensitive-data.md) |
| 요청 하나가 어느 서비스를 거쳐 어디까지 가는가? | [서비스 흐름](features/flows.md), [요청 흐름](features/call-history.md) |
| 실제 호출이 명세와 어디서 다른가? 인증 없이 성공한 호출은? | [호출 기록과 Spec check](features/call-history.md) |

## 세 가지 근거

| 근거 | 알 수 있는 것 | 따로 읽어야 할 점 |
|---|---|---|
| **Log** | 실제 호출, 횟수, 인증 방식, 주고받은 필드 | 수집 기간 밖의 호출과 로그에 없는 본문은 모름 |
| **Spec** | 서비스가 받기로 한 요청·응답 | 실제 호출이나 구현을 뜻하지 않음 |
| **Code** | 구현된 API, 코드의 호출, 선언된 권한 검사 | 실행 여부와 횟수를 증명하지 않음 |

어느 하나만으로 시작해도 됩니다. 명세만 올려도 API 목록과 민감정보 후보가 나오고, 로그를 붙이면 실제 호출이, 코드를 붙이면 구현과 서비스 간 호출이 더해집니다. 모든 API와 필드에는 어느 근거에서 왔는지 `Spec` / `Code` / `Log` 표시가 붙습니다.

## 동작 방식

<div class="sade-pipe" markdown>
<div markdown>**연결**<p>Splunk, Cloudera, 파일, OpenAPI, GitHub</p></div>
<div markdown>**수집** (Collect now)<p>로그를 읽어 값을 지운 근거만 저장</p></div>
<div class="is-key" markdown>**분석**<p>API 식별, 민감정보, 흐름</p></div>
<div markdown>**검사** (Run scan)<p>저장된 결과로 명세 점검</p></div>
</div>

- **Collect now**는 외부 로그를 읽고 인벤토리, 민감정보, Flows를 갱신합니다. 수집 주기를 정하면 자동으로 돕니다.
- **Run scan**은 저장된 수집 결과만 씁니다. SIEM에 다시 접속하지 않습니다.
- 수집 결과에는 본문과 헤더의 **원문 값이 남지 않습니다.** 값은 `<string>` 같은 타입으로 바뀝니다.

## 먼저 알아 둘 점

SADE의 판단은 **관측한 범위에 대한 근거**입니다. 민감정보 발견, 명세 차이, Shadow API는 각각 검토할 근거이며, 법적 위반이나 전체 API의 안전을 자동으로 확정하지 않습니다. 근거가 없는 항목은 "없음"이 아니라 "미관측"이나 "Not evaluated"로 표시합니다. 자세한 범위는 [지원 범위와 제한](reference/limitations.md)에 있습니다.
