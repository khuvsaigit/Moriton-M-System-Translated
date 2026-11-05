import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';

class Element {
  constructor(id) {
    this.id = id;
    this.value = '';
    this.textContent = '';
    this.disabled = false;
    this.hidden = id === 'd-backend-demo';
    this.style = {};
    this.handlers = {};
    this.children = [];
    this.selectedOptions = [];
  }
  addEventListener(event, handler) { this.handlers[event] = handler; }
  replaceChildren(...children) {
    this.children = children;
    this.selectedOptions = children.length ? [children[0]] : [];
  }
}

const ids = [
  'd-backend-demo', 'bkd-result', 'bkd-session-state', 'bkd-api-base', 'bkd-connect',
  'bkd-horse-name', 'bkd-create-horse', 'bkd-horse', 'bkd-resource',
  'bkd-create-resource', 'bkd-starts', 'bkd-ends', 'bkd-request', 'bkd-confirm', 'bkd-arrive',
];
const elements = Object.fromEntries(ids.map((id) => [id, new Element(id)]));
elements['bkd-api-base'].value = 'http://localhost:8001';
elements['bkd-horse-name'].value = 'Synthetic UI Harness Horse';
elements['bkd-horse']._selection = null;
elements['bkd-resource']._selection = null;
Object.defineProperty(elements['bkd-horse'], 'selectedOptions', { get() { return this._selection ? [this._selection] : []; } });
Object.defineProperty(elements['bkd-resource'], 'selectedOptions', { get() { return this._selection ? [this._selection] : []; } });
for (const id of ['bkd-horse', 'bkd-resource']) {
  elements[id].replaceChildren = function (...children) {
    this.children = children;
    this._selection = children[0] || null;
  };
  elements[id].add = function (option) { this.children.push(option); if (!this._selection) this._selection = option; };
}

const calls = [];
let appointmentStatus = 'REQUESTED';
let appointmentVersion = 1;
const fakeFetch = async (input, options = {}) => {
  const url = new URL(input);
  assert.equal(url.hostname, 'localhost', 'requests must remain local');
  assert.equal(options.credentials, 'include');
  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(options.body) : null;
  calls.push({ method, path: url.pathname, body, csrf: new Headers(options.headers).get('X-CSRFToken') });
  let result;
  if (url.pathname.endsWith('/dev/csrf')) result = { csrf_token: 'synthetic-csrf' };
  else if (url.pathname.endsWith('/dev/session')) result = { status: 'local_session_created' };
  else if (url.pathname.endsWith('/horses')) result = { id: 'horse-demo-id', name: body.name };
  else if (url.pathname.endsWith('/dev/scheduling-resources')) result = { id: 'room-demo-id', name: body.name, resource_type: 'room' };
  else if (url.pathname.endsWith('/appointments') && method === 'POST') result = {
    id: 'appointment-demo-id', horse_id: 'horse-demo-id', resource_id: 'room-demo-id',
    starts_at: body.starts_at, ends_at: body.ends_at, status: appointmentStatus,
    version: appointmentVersion, visit_created: false, clinical_clearance_granted: false,
  };
  else if (url.pathname.includes('/appointments/') && method === 'POST') {
    assert.equal(body.expected_version, appointmentVersion);
    appointmentStatus = body.action === 'confirm' ? 'CONFIRMED' : 'ARRIVED';
    appointmentVersion += 1;
    result = {
      id: 'appointment-demo-id', horse_id: 'horse-demo-id', resource_id: 'room-demo-id',
      starts_at: new Date().toISOString(), ends_at: new Date(Date.now() + 3600000).toISOString(),
      status: appointmentStatus, version: appointmentVersion,
      visit_created: false, clinical_clearance_granted: false,
    };
  } else throw new Error(`Unexpected demo API request ${method} ${url.pathname}`);
  return { ok: true, status: 200, json: async () => result };
};

const source = await fs.readFile(new URL('../../dashboard-backend-demo.js', import.meta.url), 'utf8');
const context = {
  URL, URLSearchParams, Headers, Date, console,
  window: { location: { search: '?backendDemo=1' } },
  document: { getElementById: (id) => elements[id] || null },
  fetch: fakeFetch,
  Option: class { constructor(text, value) { this.textContent = text; this.value = value; } },
};
vm.runInNewContext(source, context, { filename: 'dashboard-backend-demo.js' });
assert.equal(elements['d-backend-demo'].hidden, false, 'opt-in query must reveal local demo panel');

await elements['bkd-connect'].handlers.click();
await elements['bkd-create-horse'].handlers.click();
await elements['bkd-create-resource'].handlers.click();
await elements['bkd-request'].handlers.click();
assert.equal(elements['bkd-confirm'].disabled, false);
await elements['bkd-confirm'].handlers.click();
assert.equal(elements['bkd-arrive'].disabled, false);
await elements['bkd-arrive'].handlers.click();

assert.equal(appointmentStatus, 'ARRIVED');
assert.match(elements['bkd-result'].textContent, /ARRIVED/);
assert.match(elements['bkd-result'].textContent, /Visit created: no/);
assert.match(elements['bkd-result'].textContent, /Clinical clearance: no/);
assert.deepEqual(calls.map(({ path }) => path), [
  '/api/v1/dev/csrf', '/api/v1/dev/session', '/api/v1/horses',
  '/api/v1/dev/scheduling-resources', '/api/v1/appointments',
  '/api/v1/appointments/appointment-demo-id/actions',
  '/api/v1/appointments/appointment-demo-id/actions',
]);
assert.ok(calls.slice(1).every((call) => call.csrf === 'synthetic-csrf'), 'all writes after CSRF setup must include the CSRF token');
const callsBeforeRejectedHost = calls.length;
elements['bkd-api-base'].value = 'https://example.com';
await elements['bkd-connect'].handlers.click();
assert.equal(calls.length, callsBeforeRejectedHost, 'non-local hosts must be rejected before fetch');
assert.match(elements['bkd-result'].textContent, /localhost API address/);

console.log('Dashboard backend demo smoke test passed: local-only host guard, connect, synthetic records, request, confirm and arrive.');
