# API 식별과 Shadow API

로그에는 `GET /order/orders/1024` 같은 **실제 경로**가 찍힙니다. 명세와 코드에는 `GET /orders/{id}` 같은 **경로 틀**이 있습니다. SADE는 실제 경로를 경로 틀에 맞춰 "어느 API의 호출인지"를 정하고, 어디에도 맞지 않는 호출을 Shadow API로 찾아냅니다.

## 과정

<div class="sade-pipe" markdown>
<div markdown>**서비스 배정**<p>`/order/...` → order</p></div>
<div markdown>**접두사 제거**<p>`/order/orders/1024` → `/orders/1024`</p></div>
<div markdown>**API 아닌 경로 제외**<p>문서, 헬스체크, 정적 파일</p></div>
<div class="is-key" markdown>**경로 틀 맞추기**<p>`/orders/1024` → `/orders/{id}`</p></div>
<div markdown>**합치기와 출처**<p>같은 호출 합치기, Spec·Code·Log</p></div>
</div>

### 서비스 배정

| 방식 | 규칙 |
|---|---|
| 경로 접두사 | 서비스에 등록한 Path prefix 중 **가장 길게 맞는 것**. `/product`와 `/product/storefront`가 둘 다 있으면 `/product/storefront/items`는 뒤쪽 |
| 로그의 서비스 이름 | 서비스 ID, 별칭, `-service`·`-svc`·`-api`를 뗀 이름 순으로 맞춤. 호스트 이름은 `*.svc`, `*.internal`처럼 내부 이름일 때만 씀 |

`user.partner-bank.com` 같은 외부 주소는 별칭으로 직접 등록하지 않으면 내부 서비스로 보지 않습니다. 어디에도 맞지 않는 호출은 Unassigned로 남습니다.

### API가 아닌 경로

`/v3/api-docs`, `/swagger-ui`, `/actuator`, `/h2-console`, `/static/`, `/favicon.ico`, 그리고 `.js`·`.css`·이미지 같은 정적 파일은 API로 세지 않습니다. 제외한 수는 따로 표시합니다.

### 경로 틀 맞추기

명세와 코드에서 모은 경로 틀 중 맞는 것을 고릅니다.

<div class="sade-steps" markdown>

1. **똑같은 경로가 있으면** 그대로 씁니다.
2. **틀에 맞는 후보를 고릅니다.** `{id}` 자리는 한 칸(슬래시 사이)과 맞습니다. 끝 슬래시는 무시합니다(`/api/items/` = `/api/items`).
3. **여러 칸을 받는 와일드카드**(Go `{path...}`, Gin `*path`)는 일반 틀보다 뒤에 봅니다.
4. **후보가 여럿이면 메서드로 고릅니다.** 명세에 `GET /items/{itemId}`와 `PUT /items/{id}`가 있으면 PUT 요청은 `{id}` 쪽으로 갑니다.

</div>

=== "명세에 있는 경로"

    | 로그 | 맞춘 API |
    |---|---|
    | `GET /orders/1024` | `GET /orders/{id}` |
    | `PUT /items/7` | `PUT /items/{id}` (형태가 같은 `GET /items/{itemId}`가 있어도 메서드로 구분) |
    | `GET /files/a/b/c.txt` | `GET /files/{path...}` |

=== "명세에 없는 경로"

    맞는 틀이 없으면 ID처럼 보이는 칸을 `{id}`로 바꿔 새 API로 묶습니다. 수천 개의 다른 ID가 수천 개의 API로 흩어지지 않게 하려는 것입니다.

    | 바꾸는 칸 | 예 |
    |---|---|
    | 숫자 | `1024` |
    | UUID | `3fa85f64-5717-4562-b3fc-2c963f66afa6` |
    | 16자 이상 16진수 | `9f2c1d7e4b8a0c11` |
    | 숫자가 섞인 20자 이상 토큰 | `a1B2c3D4e5F6g7H8i9J0k` |
    | 이메일 | `user@example.com` |

    `/admin/users/77` → `GET /admin/users/{id}` (명세에 없으므로 Shadow API)

### 같은 호출 합치기

게이트웨이와 서비스가 같은 요청을 각각 기록하면 두 줄이 생깁니다. 아래 조건이 모두 같으면 한 호출로 합칩니다.

- 같은 서비스, 요청 ID, 메서드, 경로, 상태 코드
- hop ID가 둘 다 있으면 같은 hop ID (다르면 재시도 같은 별개 호출)
- trace·span이 둘 다 있으면 서로 일치

시각이 비슷하다는 이유만으로 합치지 않습니다. 요청 ID가 없는 로그끼리는 중복을 판별할 수 없어서 각각 셉니다.

## 출처 태그

| 태그 | 뜻 | 보장하지 않는 것 |
|---|---|---|
| `Spec` | 이 서비스에 등록한 명세에 있음 | 실제 구현 |
| `Code` | 이 서비스의 코드에 라우트 등록이 있음 | 배포, 외부 접근 가능 여부 |
| `Log` | 수집한 로그에서 호출이 보임 | 정상 동작 |

경로 파라미터 이름만 다르면 같은 API로 봅니다(`/users/{id}` = `/users/{userId}`, Gin `:id`도 같음). 헤더 파라미터는 대소문자를 구분하지 않습니다.

## Shadow API의 정의 {#shadow}

**명세가 등록된 서비스에서, 명세에 없는 메서드·경로의 호출이 로그에 보인 경우**만 Shadow API입니다.

| 경우 | Shadow 표시 |
|---|---|
| 명세가 있는 서비스, 명세에 없는 호출 | 표시 |
| 명세가 없는 서비스의 호출 | 표시하지 않음 (판단할 기준이 없음) |
| 트래픽으로 만든 초안 명세만 있는 서비스 | 표시하지 않음 (같은 트래픽으로 만든 기준) |
| 코드에만 있고 호출되지 않은 API | Shadow가 아님. `Code only` 또는 `Implemented, no traffic` |

명세·코드·로그를 합친 목록은 "배포된 모든 API"를 증명하지 않습니다. 로그에 안 남았고 코드도 스캔하지 않은 API는 알 수 없습니다.

## 구현 범위와 확장

| | 지금 구현 | 같은 방식으로 넓히기 |
|---|---|---|
| 서비스 구분 | 경로 접두사, 로그의 서비스 이름 | 서비스마다 접두사와 별칭(다른 이름, 서버 IP)을 등록 |
| 경로 틀 | 명세·코드의 경로 + 숫자·UUID·이메일 등 ID 칸 자동 치환 | 명세나 코드를 더할수록 정확해짐 |
| 공개 범위 | | Access Scope에서 호스트·경로 규칙으로 Internal / Public / Partner 분류 |

[기업 환경에 맞게 확장하기](extending.md)
