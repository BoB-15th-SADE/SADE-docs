// Explains engineering terms in place: the first mention on a page gets a dotted underline and a tooltip.
// Korean pages only. Terms come from the glossary page (reference/glossary).
(function () {
  if (document.documentElement.lang === "en") return;
  const TERMS = [["필드 매핑", "기업 로그의 필드 이름을 SADE 필드 이름에 맞추는 설정. 예: svc 열 → service.name"], ["매퍼", "코드, 명세, 로그 결과를 합쳐 Inventory, Flows, 관리 우선순위를 만드는 부분"], ["Vector", "SADE에 들어 있는 로그 수집기. 로그를 받아 필드를 맞추고 값을 가린 뒤 저장합니다"], ["ClickHouse", "값을 가린 로그를 저장하고 집계하는 데이터베이스. SADE 안에서만 씁니다"], ["PostgreSQL", "연결 설정과 분석 결과를 저장하는 데이터베이스. SADE 안에서만 씁니다"], ["ECS", "Elastic Common Schema. 로그 필드 이름을 맞추는 공개 규칙. 예: url.path, client.ip"], ["경로 틀", "값 자리를 묶은 경로. /orders/1001과 /orders/1002는 /orders/{id} 하나로 셉니다"], ["Shadow", "코드와 명세에 없고 로그에서만 보인 API"], ["Undocumented", "코드에는 있는데 등록한 명세에 없는 API"], ["CIDR", "IP 대역 표기. 10.0.0.0/8은 10.으로 시작하는 모든 주소"], ["X-Forwarded-For", "프록시나 게이트웨이가 원래 클라이언트 IP를 담아 넘기는 HTTP 헤더"], ["CODEOWNERS", "저장소에서 파일별 담당자를 적어 두는 GitHub 파일"], ["trace ID", "한 요청이 여러 서비스를 지날 때 모든 로그가 함께 쓰는 ID"], ["context path", "서비스의 모든 경로 앞에 공통으로 붙는 경로. 예: /shop"], ["BFF", "Backend for Frontend. 화면에 필요한 여러 서비스 호출을 모아 주는 중간 서비스"], ["게이트웨이", "바깥 요청을 받아 내부 서비스로 넘기는 입구 서버"], ["rsyslog", "리눅스 서버에서 syslog를 보내고 받는 기본 프로그램"], ["SIEM", "여러 시스템의 보안 로그를 모아 검색하고 분석하는 시스템"], ["컨슈머 그룹", "Kafka에서 메시지를 어디까지 읽었는지 기록하는 읽기 단위"], ["ACL", "접근 제어 목록. Kafka에서 계정마다 읽을 수 있는 토픽과 그룹을 정합니다"], ["offset", "Kafka 토픽에서 메시지의 순번. 어디까지 읽었는지 나타냅니다"], ["mTLS", "서버와 클라이언트가 서로 인증서로 확인하는 TLS 연결"], ["SASL", "Kafka 같은 서비스에 계정과 비밀번호로 로그인하는 방식"], ["OpenAPI", "REST API의 경로, 파라미터, 응답을 적는 표준 명세 형식"], ["잠정", "지금 근거로 정한 등급이지만, 모르는 신호가 확인되면 더 높아질 수 있는 상태"], ["미평가", "근거가 모자라 등급을 정하지 못한 상태. 안전하다는 뜻이 아닙니다"]];
  const SKIP = "code, pre, a, abbr, h1, h2, h3, h4, script, style, .sade-slides, .md-nav, .md-header, .md-footer, .sade-page-tools";
  function run() {
    const root = document.querySelector(".md-content article, .md-content .md-typeset");
    if (!root || root.dataset.terms) return;
    root.dataset.terms = "1";
    const left = new Map(TERMS);
    const order = [...left.keys()].sort((a, b) => b.length - a.length);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(n) { return n.nodeValue.trim() && !n.parentElement.closest(SKIP) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT; },
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      if (!left.size) break;
      let text = node.nodeValue, hit = null;
      for (const t of order) {
        if (!left.has(t)) continue;
        const i = text.indexOf(t);
        if (i < 0) continue;
        const before = text[i - 1] || " ", after = text[i + t.length] || " ";
        if (/[A-Za-z0-9.]/.test(before) || (/[A-Za-z]$/.test(t) && /[A-Za-z0-9]/.test(after))) continue;
        if (!hit || i < hit.i) hit = { t, i };
      }
      if (!hit) continue;
      const abbr = document.createElement("abbr");
      abbr.className = "sade-term";
      abbr.title = left.get(hit.t);
      abbr.textContent = hit.t;
      const rest = node.splitText(hit.i);
      rest.nodeValue = rest.nodeValue.slice(hit.t.length);
      node.parentNode.insertBefore(abbr, rest);
      left.delete(hit.t);
      nodes.push(rest);
    }
  }
  run();
  if (window.document$) window.document$.subscribe(run);
})();
