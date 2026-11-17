# OpenAPI 명세

Connect > **Specifications**에서 회사가 관리하는 OpenAPI 명세를 등록합니다. 등록한 명세는 Inventory의 `Spec` 출처가 되고, 코드나 로그에만 있는 API(Undocumented, Shadow)를 찾는 기준이 됩니다.

## 등록 방법

[Add specification]을 누르고 **서비스 이름**과 함께 둘 중 하나로 등록합니다.

| 방법 | 내용 |
|---|---|
| **File upload** | OpenAPI JSON 파일을 올립니다 |
| **From URL** | 서비스의 내부 주소(예: `/v3/api-docs`)에서 OpenAPI JSON을 가져옵니다. 관리자가 허용한 주소만 가져올 수 있습니다 |

| 조건 | 내용 |
|---|---|
| 형식 | OpenAPI **3.0.x, 3.1.x JSON**. YAML이나 Swagger 2.0은 JSON 3.x로 바꿔 올립니다 |
| 크기 | 2 MiB 이하 |
| 참조 | 다른 파일을 가리키는 `$ref`는 받지 않습니다. 한 파일로 묶어(bundle) 올립니다 |
| 서비스 이름 | **코드 스캔의 서비스 이름과 같게** 넣습니다. 이름이 다르면 같은 API를 다른 서비스로 봅니다 |

### From URL 허용 주소

URL 가져오기는 기본으로 꺼져 있습니다. 서버 관리자가 `.env`의 `SADE_SPEC_FETCH_ALLOWED_URLS`에 가져올 주소를 정확히 적어야 합니다. 주소의 이름은 backend 컨테이너에서 사설 주소로 풀려야 하며, 토큰이나 비밀번호를 주소에 넣지 않습니다.

```bash
SADE_SPEC_FETCH_ALLOWED_URLS=http://orders:8080/v3/api-docs,http://payments:8080/v3/api-docs
```

## 목록

| 탭 | 내용 |
|---|---|
| **Registered Spec** | 직접 올리거나 가져온 명세. 출처 표시 `Spec` |
| **Generated from Code** | GitHub 코드 스캔이 서비스마다 만든 명세. 출처 표시 `Code` |

두 목록은 서로 덮어쓰지 않습니다. 같은 서비스에 둘이 있으면 API 상세에서 명세와 코드의 차이(Spec vs code)를 볼 수 있습니다. 새 버전은 [Update Spec]으로 올립니다.

## 명세가 쓰이는 곳

- **명세 상태 (Spec Status)**: Documented(명세에 있음), Undocumented(코드에만 있음), Shadow(코드와 명세에 없고 로그에만 있음), No Spec(비교할 명세가 없는 서비스)
- **인증 선언**: 명세의 `security`를 읽어 코드의 인증 선언과 다르면 관리 우선순위의 충돌 신호(H)로 씁니다
- **필드 차이**: 명세와 코드, 로그의 필드가 다르면 검토 신호(D)로 씁니다
