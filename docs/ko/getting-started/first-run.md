# 샘플 로그로 첫 결과 보기

설치를 마쳤다면 샘플 CSV 하나로 Inventory, 관리 우선순위, Flows가 채워지는 과정을 확인합니다.

기업 로그를 받기 전에 화면과 매핑 방식을 익히는 용도입니다. 10분 정도 걸립니다.

## 준비

- [설치와 첫 연결](quickstart.md)의 4단계(확인)까지 끝낸 SADE
- 샘플 파일 [sade-sample-access.csv](../../assets/samples/sade-sample-access.csv) (15줄, 가상 데이터)

샘플은 서비스 3개(order-service, member-service, payment-service)의 접근 로그입니다. 출발지 IP는 문서용 대역(`203.0.113.0/24`)과 사설 대역(`10.0.0.0/8`)을 씁니다.

```text
time,svc,method,path,status,src_ip,host,req_body
2026-11-16T09:00:01+09:00,order-service,GET,/api/orders/1001,200,203.0.113.10,order-1,
2026-11-16T09:01:09+09:00,member-service,PUT,/api/members/me,200,203.0.113.10,member-1,"{""email"":""user01@example.com"",""phone"":""010-0000-0000""}"
2026-11-16T09:03:10+09:00,payment-service,POST,/api/payments,200,10.0.2.15,pay-1,"{""order_id"":1001,""card_no"":""4111111111111111""}"
```

<div class="sade-slides" markdown>

<div class="sade-slide" markdown data-title="열 지정">

[![열 지정](../../assets/screens/w-csv-3.png){ loading=lazy }](../../assets/screens/w-csv-3.png)

<small>샘플 CSV를 올린 직후 추천된 열</small>

</div>

<div class="sade-slide" markdown data-title="완료">

[![완료](../../assets/screens/w-csv-6.png){ loading=lazy }](../../assets/screens/w-csv-6.png)

<small>저장된 행 수와 분석 시작</small>

</div>

<div class="sade-slide" markdown data-title="결과">

[![결과](../../assets/screens/w-csv-7.png){ loading=lazy }](../../assets/screens/w-csv-7.png)

<small>분석이 끝난 화면</small>

</div>

</div>

## 1. CSV 올리기

<div class="sade-steps" markdown>

1. 왼쪽 메뉴에서 Connect > Log Sources를 엽니다.

2. 소스 추가 탭에서 CSV 파일 줄의 CSV 업로드를 누릅니다.

3. CSV 파일 선택으로 샘플 파일을 고릅니다.

    화면 위에 단계 표시가 나옵니다: 파일 선택 → 열 지정 → 완료

</div>

## 2. 열 지정

SADE가 열 이름을 보고 열을 추천합니다. 추천이 비었거나 다르면 아래처럼 고릅니다.

| 샘플 열 | 화면 이름 | 로그 필드 | 쓰임 |
|---|---|---|---|
| `time` | 요청 시각 | `@timestamp` | 호출 시각 |
| `svc` | 서비스 | `service.name` | 서비스 이름 |
| `method` | 메서드 | `http.request.method` | 메서드 |
| `path` | 경로 | `url.path` | 경로 |
| `status` | 응답 코드 | `http.response.status_code` | 응답 코드 |
| `src_ip` | 호출한 쪽 IP | `client.ip` | 접근 범위(Public, Internal) 판정 |
| `host` | 서버 | `host.name` | 서버 이름 |
| `req_body` | 요청 본문 | `http.request.body.content` | 민감정보 탐지 |

- 위쪽 네 칸(요청 시각, 서비스, 메서드, 경로)은 꼭 채웁니다. 비어 있으면 저장하지 않습니다.
- 나머지는 더 정확하게 보기를 펼쳐 고릅니다. 고르지 않은 칸은 "선택 안 함"으로 둡니다.
- 다 고르면 저장하고 다음을 누릅니다.

## 3. 완료

"15행 저장됨"처럼 저장된 행 수가 나옵니다. 분석 시작을 누릅니다.

로그 분석과 매핑이 이어서 돌고, 끝나면 찾은 API 목록이 나옵니다. 진행 중에는 이전 결과가 그대로 보입니다.

!!! note "샘플 날짜와 보관 기간"
    보관 기간(기본 30일)보다 오래된 행은 저장하지 않고 "보관 기간 초과로 저장 제외"로 셉니다. 샘플 날짜가 오래됐다면 `time` 열의 날짜를 오늘 근처로 바꿔 올립니다.

## 4. 결과 보기

<div class="sade-steps" markdown>

1. Overview

    API 수, 등급별 수, 접근 범위별 수가 나옵니다. 로그만 넣었으므로 Spec Status는 모두 No Spec(Spec 없음)입니다.

2. Inventory

    - `/api/orders/1001`, `/api/orders/1002`처럼 값만 다른 경로가 `/api/orders/{id}` 한 줄로 묶입니다.
    - Source 열에는 `Log`만 표시됩니다.
    - `203.0.113.x`에서 불린 API는 Access Scope가 Public, `10.x`에서만 불린 API는 Internal입니다.

3. 관리 우선순위

    `PUT /api/members/me`를 눌러 Full Screen(전체 화면) > Management(관리) 탭을 엽니다.

    - 민감정보(S): 본문의 `email`, `phone`에서 찾은 유형
    - 외부 접근(E): Public 주소에서 온 호출
    - 인증 선언(H): 코드와 명세가 없어 모름

    S와 E가 함께 있으면 P2 조건에 맞습니다. 확인하지 못한 신호가 남아 있으면 잠정(provisional)으로 표시됩니다.

4. Flows

    Clients에서 세 서비스로 가는 선과 호출 수가 보입니다. 샘플에는 서비스 사이 호출 로그가 없어 서비스끼리 잇는 선은 없습니다.

</div>

## 다음 단계

샘플에서 비어 있던 근거는 다른 자료를 붙이면 채워집니다.

| 붙일 자료 | 채워지는 것 | 안내 |
|---|---|---|
| 소스 코드 | 인증 선언, 핸들러 위치, 서비스 사이 호출, Shadow 판정 | [소스 코드 (GitHub)](../connect/code.md) |
| OpenAPI 명세 | Documented, Undocumented 판정, 명세와 코드 인증 선언 비교 | [OpenAPI 명세](../connect/specs.md) |
| 기업 로그 | 실제 호출, 접근 범위, 민감 유형 | [로그 연결 방식](../connect/logs.md) |
| 내부 대역 | 내부, 협력사 구분 | [Access Scope](../policy/access-scope.md) |

샘플로 저장한 로그는 보관 기간이 지나면 지워집니다. 바로 지우려면 설치를 처음부터 다시 합니다(`docker compose down -v`, 모든 데이터 삭제).
