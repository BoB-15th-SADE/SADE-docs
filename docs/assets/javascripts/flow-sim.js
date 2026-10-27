/* Field → Flows coverage simulator. Mirrors SADE's linking rules (connectors.merge_records,
   flow_sources.pair_app_access, flows.py): IDs mark the same request, but a service-to-service
   line needs the caller's outbound record. Runs in the browser only. */
(function () {
  const TEXT = {
    ko: {
      title: '내 로그에 있는 필드',
      core: '시각 · 메서드 · 경로 · 상태 (필수)',
      opts: {
        client: ['client_ip', '호출자 IP'],
        service: ['service', '서비스 이름'],
        rid: ['request_id', '요청 ID'],
        caller: ['event_type + destination', '보낸 쪽 기록 (Application 로그)'],
        trace: ['trace_id · span_id · parent_span_id', '또는 traceparent'],
        host: ['host.name / k8s.node.name', '서버 정보'],
        db: ['DB 로그', 'PostgreSQL · 애플리케이션 SQL + request_id'],
      },
      nodes: { client: '호출자 IP', anon: '호출자 모름', gw: '게이트웨이', a: 'order', b: 'payment', db: 'DB', prefix: '경로 접두사로 구분', host: '서버' },
      edge: { trace: 'trace', rid: 'request ID', none: '선 없음' },
      result: '이 조합으로 보이는 것',
      items: [
        ['inv', 'API 인벤토리 · 호출 수 · Shadow API'],
        ['client', 'Flows Clients: IP별 호출'],
        ['service', '서비스별 API 묶음'],
        ['merge', '게이트웨이·서비스 기록을 한 호출로 합치기'],
        ['edge', '서비스 → 서비스 선'],
        ['trace', '요청 하나의 전체 경로 · Trace 목록'],
        ['host', 'Hosts: 서버별 배치'],
        ['db', 'Destinations: DB 접근'],
      ],
      why: {
        edgeNoCaller: '요청 ID나 trace만으로는 누가 불렀는지 알 수 없습니다. 보낸 쪽 기록이 필요합니다.',
        edgeNoId: '보낸 쪽 기록은 있지만 받은 쪽과 짝지을 ID가 없습니다. 요청 ID나 trace를 남기세요.',
        edgeRid: '요청 ID로 30초 안의 기록을 짝짓습니다. 같은 API로 동시에 들어온 요청이 많으면 일부는 잇지 못합니다.',
        service: '서비스 이름이 없어도 서비스에 경로 접두사를 등록하면 나눌 수 있습니다.',
      },
    },
    en: {
      title: 'Fields in your log',
      core: 'time · method · path · status (required)',
      opts: {
        client: ['client_ip', 'caller IP'],
        service: ['service', 'service name'],
        rid: ['request_id', 'request ID'],
        caller: ['event_type + destination', 'caller-side record (application log)'],
        trace: ['trace_id · span_id · parent_span_id', 'or traceparent'],
        host: ['host.name / k8s.node.name', 'server identity'],
        db: ['DB logs', 'PostgreSQL · application SQL + request_id'],
      },
      nodes: { client: 'Caller IP', anon: 'Unknown caller', gw: 'Gateway', a: 'order', b: 'payment', db: 'DB', prefix: 'split by path prefix', host: 'server' },
      edge: { trace: 'trace', rid: 'request ID', none: 'no line' },
      result: 'What this combination shows',
      items: [
        ['inv', 'API inventory · call counts · shadow APIs'],
        ['client', 'Flows Clients: calls per IP'],
        ['service', 'APIs grouped by service'],
        ['merge', 'Gateway and service records merged into one call'],
        ['edge', 'Service → service lines'],
        ['trace', 'Full path of one request · Trace list'],
        ['host', 'Hosts: placement by server'],
        ['db', 'Destinations: database access'],
      ],
      why: {
        edgeNoCaller: 'A request ID or trace alone does not say who called. The caller-side record is needed.',
        edgeNoId: 'The caller-side record is there, but nothing pairs it with the receiver. Log a request ID or trace.',
        edgeRid: 'Records are paired by request ID within 30 seconds. With many concurrent requests to the same API, some stay unpaired.',
        service: 'Without a service name, register a path prefix on each service instead.',
      },
    },
  };
  const ORDER = ['client', 'service', 'rid', 'caller', 'trace', 'host', 'db'];
  const DEFAULT = { client: true, rid: true };

  function el(tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined) n.innerHTML = html;
    return n;
  }

  function render(box, t, s) {
    const out = box.querySelector('.sade-flowsim__out');
    const dia = box.querySelector('.sade-flowsim__diagram');
    const edgeOn = s.caller && (s.rid || s.trace);
    const host = (label) => (s.host ? `<small class="h">${t.nodes.host} ${label}</small>` : '');
    const node = (on, label, extra = '', cls = '') => `<div class="sade-flowsim__node ${on ? 'on' : 'off'} ${cls}"><b>${label}</b>${extra}</div>`;
    const svc = (name) => (s.service ? '' : `<small>${t.nodes.prefix}</small>`);
    const arrow = (on, label) => `<div class="sade-flowsim__edge ${on ? 'on' : 'off'}"><span>${label || ''}</span></div>`;
    const diagram =
      node(s.client, s.client ? t.nodes.client : t.nodes.anon) + arrow(true, '') +
      node(true, t.nodes.gw, host('edge-01')) + arrow(true, s.rid ? t.edge.rid : '') +
      node(true, t.nodes.a, svc() + host('app-01'), 'svc') +
      arrow(edgeOn, edgeOn ? (s.trace ? t.edge.trace : t.edge.rid) : t.edge.none) +
      node(true, t.nodes.b, svc() + host('app-03'), 'svc') + arrow(s.db, '') +
      node(s.db, t.nodes.db);
    const have = { inv: true, client: s.client, service: true, merge: s.rid, edge: edgeOn, trace: s.trace && s.caller, host: s.host, db: s.db };
    const partial = { service: !s.service, edge: edgeOn && !s.trace };
    const list = t.items.map(([k, label]) => {
      const st = have[k] ? (partial[k] ? 'part' : 'yes') : 'no';
      const mark = st === 'yes' ? '✓' : st === 'part' ? '△' : '–';
      return `<li class="${st}"><i>${mark}</i>${label}</li>`;
    }).join('');
    const notes = [];
    if ((s.rid || s.trace) && !s.caller) notes.push(t.why.edgeNoCaller);
    if (s.caller && !s.rid && !s.trace) notes.push(t.why.edgeNoId);
    if (edgeOn && !s.trace) notes.push(t.why.edgeRid);
    if (!s.service) notes.push(t.why.service);
    dia.innerHTML = diagram;
    out.innerHTML = `<div class="sade-flowsim__res"><p>${t.result}</p><ul>${list}</ul>` +
      (notes.length ? `<div class="sade-flowsim__notes">${notes.map((n) => `<p>${n}</p>`).join('')}</div>` : '') + '</div>';
  }

  function init(box) {
    if (box.dataset.ready) return;
    box.dataset.ready = '1';
    const t = TEXT[box.dataset.lang] || TEXT.ko;
    const state = { ...DEFAULT };
    const panel = el('div', 'sade-flowsim__fields');
    panel.appendChild(el('p', 'sade-flowsim__title', t.title));
    const core = el('label', 'core', `<input type="checkbox" checked disabled><span>${t.core}</span>`);
    panel.appendChild(core);
    ORDER.forEach((key) => {
      const [code, hint] = t.opts[key];
      const lab = el('label', '', `<input type="checkbox" data-k="${key}"${state[key] ? ' checked' : ''}><span><code>${code}</code><small>${hint}</small></span>`);
      panel.appendChild(lab);
    });
    box.appendChild(el('div', 'sade-flowsim__diagram'));
    box.appendChild(panel);
    box.appendChild(el('div', 'sade-flowsim__out'));
    panel.addEventListener('change', (e) => {
      const k = e.target.dataset.k;
      if (!k) return;
      state[k] = e.target.checked;
      render(box, t, state);
    });
    render(box, t, state);
  }

  function start() { document.querySelectorAll('.sade-flowsim').forEach(init); }
  if (window.document$ && typeof window.document$.subscribe === 'function') window.document$.subscribe(start);
  else document.addEventListener('DOMContentLoaded', start);
})();
