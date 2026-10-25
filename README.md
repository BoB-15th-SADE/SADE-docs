# SADE Docs

SADE 문서 사이트 (한국어, English). MkDocs Material + GitHub Pages.

현재 가이드는 SADE `feat/integration`의 `dcab3bb` 기준입니다. 설치·연동·API 탐색·민감정보·룰·운영·HTTP API·CLI·문제 해결을 한국어와 영어 각각 28개 페이지로 제공합니다. 검토한 코드는 사이트의 **참고 → 문서 기준**에 기록합니다.

## 로컬에서 보기

```bash
python -m venv .venv
# Windows
.venv/Scripts/python -m pip install -r requirements.txt
.venv/Scripts/python -m mkdocs serve -a 127.0.0.1:8000
# macOS / Linux: .venv/bin/python 사용
```

브라우저에서 `http://127.0.0.1:8000/SADE-docs/`를 엽니다. `site_url`의 프로젝트 경로를 로컬에서도 유지하므로 언어 전환 링크도 같은 경로를 사용합니다.

## 구조

- `docs/ko/`: 한국어 원문
- `docs/en/`: 영어 (같은 파일 경로로 맞춤)
- `mkdocs.yml`: 메뉴(nav)와 설정
- `overrides/main.html`: 문서 위치와 페이지 복사 버튼
- `docs/assets/stylesheets/extra.css`: 흰색 헤더, 기능별 사이드바, 본문 스타일
- `docs/assets/javascripts/page-actions.js`: 본문 복사 (외부 요청 없음)
- `tools/verify_docs.py`: 언어별 페이지·내부 링크·생성 파일 검사

상단 탭 대신 왼쪽에 전체 기능을 그룹으로 표시합니다. 검색, 언어 전환, 모바일 메뉴와 코드 복사를 유지합니다. 폰트는 시스템 폰트를 사용하여 외부 폰트 요청을 만들지 않습니다.

## 확인

```bash
.venv/Scripts/python -m mkdocs build --strict
.venv/Scripts/python tools/verify_docs.py
```

한국어·영어의 파일 경로를 함께 유지하고, 기능 설명은 현재 코드와 일치시킵니다. 미구현 기능을 지원 항목으로 추가하지 않습니다.

## 배포

- `main`에 push하면 GitHub Actions가 GitHub Pages로 배포
- PR에서는 두 언어를 빌드하고 링크를 검사하며 배포하지 않음
- 변경 검토 후 main에 병합하면 기존 Pages 주소에 반영됨
- 저장소 Settings > Pages > Source를 "GitHub Actions"로 설정
- 도메인을 정하면 `docs/CNAME` 파일과 DNS CNAME 레코드 추가
