"""Check translated page coverage and local links in a freshly built MkDocs site."""
import json
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / 'site'


class Document(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.targets = set()
        self.links = []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get('id'):
            self.targets.add(attrs['id'])
        if tag == 'a' and attrs.get('name'):
            self.targets.add(attrs['name'])
        for key in (('href',) if tag == 'a' else ('src', 'href')):
            if attrs.get(key):
                self.links.append(attrs[key])


def main():
    errors = []
    ko = {p.relative_to(ROOT / 'docs/ko') for p in (ROOT / 'docs/ko').rglob('*.md')}
    en = {p.relative_to(ROOT / 'docs/en') for p in (ROOT / 'docs/en').rglob('*.md')}
    if ko != en:
        errors.append(f'Translation paths differ: ko-only={ko - en}, en-only={en - ko}')
    for language in ('ko', 'en'):
        for relative in ko | en:
            path = ROOT / 'docs' / language / relative
            if not path.exists():
                continue
            text = path.read_text(encoding='utf-8')
            if not text.startswith('# ') or '!!! note "작성 예정"' in text or '!!! note "Planned"' in text:
                errors.append(f'Missing title or draft placeholder: {path.relative_to(ROOT)}')
    documents = {p.resolve(): Document(p.read_text(encoding='utf-8')) for p in SITE.rglob('*.html')}
    if not documents:
        raise SystemExit('Build the site first: python -m mkdocs build --strict')
    checked = 0
    for path, doc in documents.items():
        base = '/' + path.relative_to(SITE.resolve()).as_posix()
        for link in doc.links:
            parts = urlsplit(urljoin(base, link))
            if parts.scheme or parts.netloc:
                continue
            local = unquote(parts.path).removeprefix('/SADE-docs/').lstrip('/')
            target = (SITE / local).resolve()
            if target.is_dir():
                target = target / 'index.html'
            checked += 1
            if not target.is_relative_to(SITE.resolve()) or not target.exists():
                errors.append(f'{path.relative_to(SITE)}: missing {link}')
            elif parts.fragment and target in documents and unquote(parts.fragment) not in documents[target].targets:
                errors.append(f'{path.relative_to(SITE)}: missing anchor {link}')
    # static-i18n merges both languages into one search index.
    index = SITE / 'search/search_index.json'
    records = json.loads(index.read_text(encoding='utf-8')).get('docs', []) if index.exists() else []
    if not any(row['location'].startswith('en/') for row in records):
        errors.append('Missing English search records')
    if not any(not row['location'].startswith('en/') for row in records):
        errors.append('Missing Korean search records')
    if errors:
        raise SystemExit('\n'.join(errors))
    print(f'OK: {len(ko)} pages per language; {len(documents)} HTML files; {checked} local links/assets; bilingual search index.')


if __name__ == '__main__':
    main()
