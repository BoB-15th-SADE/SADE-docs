# OpenAPI 명세

Connect > Specifications에서 기업이 관리하는 OpenAPI 명세를 등록합니다. 등록한 명세는 Inventory의 `Spec` 출처가 되고, 코드나 로그에만 있는 API(Undocumented, Shadow)를 가리는 기준이 됩니다.


[![Specifications 화면](../../assets/screens/specs.png){ loading=lazy }](../../assets/screens/specs.png)
<small>예시 화면 (가상 데이터)</small>

위쪽 "우선순위 판단에 빠진 자료" 표는 이 자료가 없어 관리 우선순위를 판단하지 못한 항목과 영향받는 API 수를 보여 줍니다.

## 등록

Add specification을 누르고 서비스 이름과 함께 등록합니다.

| 방법 | 내용 |
|---|---|
| File upload | OpenAPI JSON 파일을 올립니다 |
| From URL | 서비스 내부 주소(예: `/v3/api-docs`)에서 OpenAPI JSON을 가져옵니다. 관리자가 허용한 주소만 가져옵니다 |

| 조건 | 내용 |
|---|---|
| 형식 | OpenAPI 3.0.x, 3.1.x JSON. YAML과 Swagger 2.0은 JSON 3.x로 바꿔 올립니다 |
| 크기 | 2 MiB 이하 |
| 참조 | 다른 파일을 가리키는 `$ref`는 거절합니다. 한 파일로 묶어 올립니다 |
| 서비스 이름 | 코드 스캔의 서비스 이름과 같게 넣습니다. 이름이 다르면 같은 API가 두 서비스로 나뉩니다 |

### From URL 허용 주소

URL 가져오기는 기본으로 꺼져 있습니다. 서버 관리자가 `.env`의 `SADE_SPEC_FETCH_ALLOWED_URLS`에 주소를 정확히 적어야 켜집니다.

- 주소의 이름은 backend 컨테이너에서 사설 주소로 풀려야 합니다.
- 토큰이나 비밀번호를 주소에 넣지 않습니다.

```bash
SADE_SPEC_FETCH_ALLOWED_URLS=http://orders:8080/v3/api-docs,http://payments:8080/v3/api-docs
```

## 목록

| 탭 | 내용 |
|---|---|
| Registered Spec | 직접 올리거나 가져온 명세. 출처 `Spec` |
| Generated from Code | 코드 스캔이 서비스마다 만든 명세. 출처 `Code` |

두 목록은 서로 덮어쓰지 않습니다. 같은 서비스에 둘 다 있으면 API 상세의 Spec vs code에서 차이를 봅니다. 새 버전은 Update Spec으로 올립니다.

## 명세를 쓰는 곳

- 명세 상태(Spec Status): Documented, Undocumented, Shadow, No Spec
- 인증 선언: 명세의 `security`가 코드의 인증 선언과 다르면 관리 우선순위의 충돌 신호(H)가 됩니다
- 필드 차이: 명세와 코드, 로그의 필드가 다르면 검토 신호(D)가 됩니다
