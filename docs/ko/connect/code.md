# 소스코드와 GitHub

SADE CodeScan으로 코드의 API·필드·HTTP 클라이언트 호출과 게이트웨이 설정을 읽습니다. 등록된 결과는 로그·명세와 같은 서비스·API 단위로 합쳐집니다.

## GitHub 빠른 설정

1. **Connect → Source Code**의 GitHub 연결을 엽니다.
2. 대상 저장소를 읽을 수 있는 토큰을 등록합니다. Enterprise Server라면 서버 주소도 지정합니다.
3. 저장소 목록에서 대상을 선택하고 **Scan selected**를 누릅니다.
4. 백그라운드 코드 스캔 완료 후 등록된 서비스·인벤토리·route map을 확인합니다.
5. API 상세의 **Code**와 **Fields**, **Flows**에서 근거를 확인합니다.

한 번에 최대 50개 저장소를 선택할 수 있습니다. 기본 브랜치를 임시 복제해 분석한 뒤 복제본을 제거하며, 일부 저장소의 실패는 다른 저장소 분석을 막지 않습니다.

## 등록되는 결과

| 자료 | 쓰임 |
|---|---|
| `inventory.json` | API 선언, 필드, 파일·행 근거 |
| 생성 OpenAPI | 서비스의 코드 기반 명세. 사용자 명세는 별도로 보존 |
| `route-map.json` | 게이트웨이 공개 경로와 백엔드 구현 연결 |
| `calls.json` | HTTP 호출 대상과 호출한 코드 위치 |

새 서비스는 자동 등록할 수 있습니다. 기존 사용자 명세는 유지하고, 코드 명세는 별도로 저장합니다. GitHub 코드 스캔 완료 후 민감 필드를 자동 재분류하지만 로그 스캔을 자동 실행하지는 않습니다.

## 로컬 결과 등록

Source Code에서 인벤토리와 route map을 등록하거나 [CLI](../reference/cli.md)의 `code-scan`, `code-import`, `route-import`를 사용합니다. 코드의 서비스 label을 대시보드 서비스 ID에 정확히 매핑하세요.

## 결과 해석

- **Code not scanned**는 연결된 코드가 없는 상태입니다. 코드에서 API를 찾지 못했다는 의미와 다릅니다.
- route map은 설정된 경로를 보여주며 실제 호출을 증명하지 않습니다.
- 코드의 HTTP 호출은 파일·행·라이브러리와 함께 표시됩니다. 동적으로 정해지는 주소나 미지원 클라이언트는 연결되지 않을 수 있습니다.
- GitHub에서 가져온 route map을 Disconnect하면 재스캔만으로 복구되지 않습니다. GitHub 카드의 **Restore**로 다시 허용합니다.

[API 상세](../features/api-details.md)와 [서비스 흐름](../features/flows.md)에서 선언·구현·관측의 차이를 읽는 방법을 확인하세요.
