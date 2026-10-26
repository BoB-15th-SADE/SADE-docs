// Log checker: paste one JSON log event and see which SADE features it supports.
// Runs only in the browser; nothing is sent anywhere. Field names follow SADE's
// automatic field detection (apps/dashboard/backend/field_detect.py).
(() => {
  const ALIASES = {
    timestamp: ['observed_at_epoch', '_time', '@timestamp', 'observed_at', 'timestamp', 'time', 'start_time', 'started_at', 'time_iso8601', 'ts', 'datetime', 'eventTime', 'requestTime', 'event.created'],
    method: ['method', 'request_method', 'http_method', 'http.method', 'http.request.method', 'request.method', 'verb', 'httpMethod', 'req.method'],
    path: ['request_path', 'path', 'uri_path', 'url.path', 'request.uri', 'uri', 'request_uri', 'http.target', 'url_path', 'request.path', 'req.url', 'url', 'request.url', 'requestUri', 'http.url', 'url.original'],
    status: ['status', 'response_code', 'status_code', 'http_status', 'http.status_code', 'http.response.status_code', 'response.status', 'res.statusCode', 'statusCode', 'response.status_code'],
    request_id: ['request_id', 'x_request_id', 'requestId', 'http.request.id', 'request.id', 'req.id', 'correlation_id'],
    trace_id: ['traceId', 'trace_id', 'trace.id', 'otel.trace_id'],
    span_id: ['spanId', 'span_id', 'span.id', 'otel.span_id'],
    parent_span_id: ['parentSpanId', 'parent_span_id', 'parent.span_id', 'otel.parent_span_id'],
    client_ip: ['client_ip', 'src', 'src_ip', 'remote_addr', 'source.ip', 'client.ip', 'downstream_remote_address', 'x_forwarded_for', 'clientIp', 'remote_ip', 'client.address'],
    duration_ms: ['duration_ms', 'duration', 'latency', 'latencies.request', 'elapsed_ms', 'responseTime'],
    response_bytes: ['response_bytes', 'bytes_out', 'bytes_sent', 'body_bytes_sent', 'http.response.bytes', 'response.size', 'http.response.body.bytes'],
    request_headers: ['request_headers', 'request.headers', 'http.request.headers', 'req.headers'],
    response_headers: ['response_headers', 'response.headers', 'http.response.headers', 'res.headers'],
    request_body: ['request_body', 'request.body', 'http.request.body.content', 'req.body', 'requestBody', 'req_body'],
    response_body: ['response_body', 'response.body', 'http.response.body.content', 'res.body', 'responseBody', 'resp_body'],
    service: ['service.name', 'service_name', 'service', 'kubernetes.labels.app', 'app', 'source_service'],
    destination: ['destination.address', 'server.address', 'destination.service', 'peer.service', 'net.peer.name', 'upstream_host', 'upstream.host'],
    event_type: ['span.kind', 'network.direction', 'direction', 'event_type', 'event.kind'],
    hop_id: ['hop_id', 'hop.id'],
  };
  const TRACEPARENT = ['traceparent', 'trace_parent', 'request_headers.traceparent', 'http.request.headers.traceparent'];
  const FORWARDED = ['x_forwarded_for', 'http_x_forwarded_for', 'xff', 'http.request.headers.x-forwarded-for'];
  const AUTH_HEADERS = ['authorization', 'cookie', 'x-api-key', 'api-key', 'apikey', 'x-apikey'];
  const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS', 'TRACE', 'CONNECT'];

  const TEXT = {
    ko: {
      pick: '로그 한 줄(JSON)을 붙여 넣거나 예시를 고르세요.',
      notJson: '첫 줄을 JSON 객체로 읽지 못했습니다. 이벤트 하나가 JSON 객체 하나여야 합니다.',
      found: '찾은 필드', field: 'SADE 필드', key: '로그 필드',
      can: '이 로그로 할 수 있는 일', feature: '기능', result: '판단',
      yes: '가능', partial: '일부', no: '불가',
      f: {
        collect: ['수집', '시각·메서드·경로·상태 코드가 모두 있음', '없는 필수 필드: '],
        inventory: ['API 인벤토리, 호출 수, Shadow API', '필수 필드로 API를 식별', '필수 필드가 없어 수집 대상이 아님'],
        service: ['서비스 구분', '로그의 서비스 이름', '경로 접두사로 구분 (Specifications에 서비스와 접두사 등록)'],
        merge: ['게이트웨이·서비스 로그를 한 호출로 합치기', '요청 ID', '요청 ID가 없어 로그마다 따로 셈'],
        auth: ['인증 분석 (No credentials 포함)', '인증 헤더 이름이 기록됨', '헤더는 있지만 Authorization·Cookie·API key 헤더가 없음', '요청 헤더가 없음'],
        spec: ['명세 점검 (응답 필드 비교)', '응답 본문(값 또는 필드 이름)', '응답 본문이 없어 필드 비교를 못 함'],
        values: ['값으로 민감정보 확인', '본문 값', '헤더만 있어 헤더 값만 검사', '본문·헤더가 없어 필드 이름(명세·코드)으로만 분류'],
        flows: ['서비스 간 호출 흐름 (Flows)', 'trace ID 또는 traceparent', '요청 ID나 호출 대상으로 짝짓기 (정확도는 trace보다 낮음)', '짝지을 근거가 없어 게이트웨이 → API까지만 표시'],
        client: ['호출자 IP', '', '없음'],
        perf: ['응답 시간·크기', '', '없음'],
      },
      xff: 'X-Forwarded-For의 첫 주소를 원래 클라이언트로 따로 저장',
      clientOnly: '접속 IP',
    },
    en: {
      pick: 'Paste one log line (JSON) or pick an example.',
      notJson: 'The first line is not a JSON object. Each event must be one JSON object.',
      found: 'Fields found', field: 'SADE field', key: 'Log field',
      can: 'What this log supports', feature: 'Feature', result: 'Result',
      yes: 'Yes', partial: 'Partly', no: 'No',
      f: {
        collect: ['Collection', 'time, method, path and status are all present', 'Missing required fields: '],
        inventory: ['API inventory, call counts, shadow APIs', 'APIs identified from the required fields', 'Not collected without the required fields'],
        service: ['Service assignment', 'service name in the log', 'by path prefix (register services and prefixes in Specifications)'],
        merge: ['Merge gateway and service logs into one call', 'request ID', 'no request ID, each log line counts on its own'],
        auth: ['Authentication analysis (incl. No credentials)', 'auth header names are logged', 'headers logged, but no Authorization, Cookie or API key header', 'no request headers'],
        spec: ['Spec check (response field comparison)', 'response body (values or field names)', 'no response body to compare'],
        values: ['Sensitive data by value', 'body values', 'headers only: header values are checked', 'no body or headers: classified by field names (spec, code) only'],
        flows: ['Service-to-service flow (Flows)', 'trace ID or traceparent', 'paired by request ID or destination (less exact than traces)', 'nothing to pair: shown up to gateway → API'],
        client: ['Caller IP', '', 'none'],
        perf: ['Latency and size', '', 'none'],
      },
      xff: 'first X-Forwarded-For address stored as the original client',
      clientOnly: 'connecting IP',
    },
  };

  const SAMPLES = {
    nginx: {"time":"2026-10-26T09:12:03+09:00","request_id":"9f2c1d7e4b","method":"GET","path":"/order/storefront/orders/1024","status":200,"client_ip":"10.0.4.12","x_forwarded_for":"203.0.113.7","duration_ms":38.2,"response_bytes":1820,"request_headers":{"authorization":"Bearer ***","user-agent":"Mozilla/5.0"},"traceparent":"00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01"},
    ecs: {"@timestamp":"2026-10-26T00:12:03.120Z","http":{"request":{"method":"POST","headers":{"cookie":"SESSION=***"}},"response":{"status_code":201,"body":{"content":{"orderId":"A-1024","email":"user@example.com"}}}},"url":{"path":"/api/orders"},"service":{"name":"order"},"trace":{"id":"4bf92f3577b34da6a3ce929d0e0e4736"},"source":{"ip":"10.0.4.12"}},
    minimal: {"time":"2026-10-26T09:12:03+09:00","method":"GET","path":"/product/backoffice/products/12","status":404},
    broken: {"timestamp":"26/Oct/2026:09:12:03","message":"GET /api/orders 200"},
  };

  const flatten = (value, prefix = '', depth = 0, out = {}) => {
    if (value && typeof value === 'object' && !Array.isArray(value) && depth < 4) {
      for (const [key, item] of Object.entries(value)) {
        const path = prefix ? `${prefix}.${key}` : key;
        out[path] = item;
        flatten(item, path, depth + 1, out);
      }
    }
    return out;
  };
  const isTime = (v) => typeof v === 'number' || (typeof v === 'string' && (/^\d+(\.\d+)?$/.test(v) || (/[zZ]|[+-]\d\d:?\d\d$/.test(v) && !Number.isNaN(Date.parse(v)))));
  const fits = (field, v) => {
    if (v === undefined || v === null || v === '') return false;
    if (field === 'method') return typeof v === 'string' && METHODS.includes(v.toUpperCase());
    if (field === 'path') return typeof v === 'string' && (v.startsWith('/') || /^https?:\/\/[^/\s]+(\/\S*)?$/.test(v));
    if (field === 'status') { const n = Number(v); return Number.isInteger(n) && n >= 100 && n <= 599; }
    if (field === 'timestamp') return isTime(v);
    if (field.endsWith('_headers')) return typeof v === 'object' && !Array.isArray(v);
    if (['request_id', 'client_ip', 'service', 'destination', 'event_type', 'hop_id'].includes(field)) return (typeof v === 'string' || typeof v === 'number') && String(v).length <= 256;
    if (field === 'trace_id') return typeof v === 'string' && /^[0-9a-f]{32}$/i.test(v) && /[1-9a-f]/i.test(v);
    if (field.endsWith('span_id')) return typeof v === 'string' && /^[0-9a-f]{16}$/i.test(v) && /[1-9a-f]/i.test(v);
    return true;
  };
  const detect = (row) => {
    const flat = flatten(row);
    const found = {};
    for (const [field, names] of Object.entries(ALIASES)) {
      const name = names.find((n) => fits(field, flat[n]));
      if (name) found[field] = name;
    }
    const headers = found.request_headers ? flat[found.request_headers] : null;
    const lower = headers ? Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v])) : {};
    const traceparent = TRACEPARENT.find((n) => typeof flat[n] === 'string' && /^[0-9a-f]{2}-[0-9a-f]{32}-[0-9a-f]{16}-[0-9a-f]{2}$/i.test(flat[n].trim())) || (typeof lower.traceparent === 'string' ? 'request_headers.traceparent' : null);
    const forwarded = FORWARDED.find((n) => typeof flat[n] === 'string' && flat[n].trim() && flat[n].trim() !== '-') || (lower['x-forwarded-for'] ? 'request_headers.X-Forwarded-For' : null);
    return { found, headers, authKeys: Object.keys(lower).filter((k) => AUTH_HEADERS.includes(k)), traceparent, forwarded };
  };

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const render = (box, lang) => {
    const t = TEXT[lang];
    const out = box.querySelector('.sade-logcheck__result');
    const line = box.querySelector('textarea').value.split('\n').find((l) => l.trim());
    if (!line) { out.innerHTML = `<p class="sade-logcheck__note">${t.pick}</p>`; return; }
    let row;
    try { row = JSON.parse(line); } catch { row = null; }
    if (!row || typeof row !== 'object' || Array.isArray(row)) { out.innerHTML = `<p class="err">${t.notJson}</p>`; return; }
    const { found, headers, authKeys, traceparent, forwarded } = detect(row);
    const missing = ['timestamp', 'method', 'path', 'status'].filter((f) => !found[f]);
    const ok = !missing.length;
    const mark = (level) => `<span class="${level}">${level === 'ok' ? t.yes : level === 'part' ? t.partial : t.no}</span>`;
    const f = t.f;
    const rows = [];
    rows.push([f.collect[0], ok ? 'ok' : 'no', ok ? f.collect[1] : f.collect[2] + missing.join(', ')]);
    rows.push([f.inventory[0], ok ? 'ok' : 'no', ok ? f.inventory[1] : f.inventory[2]]);
    if (ok) {
      rows.push([f.service[0], found.service ? 'ok' : 'part', found.service ? `${f.service[1]} (<code>${esc(found.service)}</code>)` : f.service[2]]);
      rows.push([f.merge[0], found.request_id ? 'ok' : 'no', found.request_id ? `${f.merge[1]} (<code>${esc(found.request_id)}</code>)` : f.merge[2]]);
      rows.push([f.auth[0], authKeys.length ? 'ok' : headers ? 'part' : 'no', authKeys.length ? `${f.auth[1]}: <code>${authKeys.map(esc).join(', ')}</code>` : headers ? f.auth[2] : f.auth[3]]);
      rows.push([f.spec[0], found.response_body ? 'ok' : 'no', found.response_body ? f.spec[1] : f.spec[2]]);
      const body = found.response_body || found.request_body;
      rows.push([f.values[0], body ? 'ok' : headers ? 'part' : 'no', body ? f.values[1] : headers ? f.values[2] : f.values[3]]);
      const trace = found.trace_id || traceparent;
      const pair = found.request_id || found.hop_id || found.destination;
      rows.push([f.flows[0], trace ? 'ok' : pair ? 'part' : 'no', trace ? `${f.flows[1]} (<code>${esc(found.trace_id || traceparent)}</code>)` : pair ? f.flows[2] : f.flows[3]]);
      const ip = forwarded ? `${t.xff} (<code>${esc(forwarded)}</code>)` : found.client_ip ? `${t.clientOnly} (<code>${esc(found.client_ip)}</code>)` : f.client[2];
      rows.push([f.client[0], forwarded || found.client_ip ? 'ok' : 'no', ip]);
      const perf = [found.duration_ms, found.response_bytes].filter(Boolean);
      rows.push([f.perf[0], perf.length === 2 ? 'ok' : perf.length ? 'part' : 'no', perf.length ? perf.map((p) => `<code>${esc(p)}</code>`).join(', ') : f.perf[2]]);
    }
    const foundRows = Object.entries(found).map(([k, v]) => `<tr><td><code>${k}</code></td><td><code>${esc(v)}</code></td></tr>`).join('');
    out.innerHTML = `<h4>${t.can}</h4><table><thead><tr><th>${t.feature}</th><th>${t.result}</th><th></th></tr></thead><tbody>${rows.map(([a, l, b]) => `<tr><td>${a}</td><td>${mark(l)}</td><td>${b}</td></tr>`).join('')}</tbody></table>`
      + (foundRows ? `<h4>${t.found}</h4><table><thead><tr><th>${t.field}</th><th>${t.key}</th></tr></thead><tbody>${foundRows}</tbody></table>` : '');
  };

  const init = () => {
    document.querySelectorAll('.sade-logcheck').forEach((box) => {
      if (box.dataset.ready) return;
      box.dataset.ready = '1';
      const lang = box.dataset.lang === 'en' ? 'en' : 'ko';
      const area = box.querySelector('textarea');
      area.addEventListener('input', () => render(box, lang));
      box.querySelectorAll('[data-sample]').forEach((b) => b.addEventListener('click', () => {
        area.value = JSON.stringify(SAMPLES[b.dataset.sample]);
        render(box, lang);
      }));
      render(box, lang);
    });
  };
  if (window.document$) window.document$.subscribe(init); else document.addEventListener('DOMContentLoaded', init);
})();
