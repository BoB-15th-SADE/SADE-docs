# SADE Docs

SADE 문서 사이트 (한국어, English). MkDocs Material + GitHub Pages.

## 로컬에서 보기

```bash
pip install -r requirements.txt
mkdocs serve            # http://127.0.0.1:8000
```

## 구조

- `docs/ko/`: 한국어 원문
- `docs/en/`: 영어 (같은 파일 경로로 맞춤)
- `mkdocs.yml`: 메뉴(nav)와 설정

## 배포

- `main`에 push하면 GitHub Actions가 GitHub Pages로 배포
- 저장소 Settings > Pages > Source를 "GitHub Actions"로 설정
- 도메인을 정하면 `docs/CNAME` 파일과 DNS CNAME 레코드 추가
