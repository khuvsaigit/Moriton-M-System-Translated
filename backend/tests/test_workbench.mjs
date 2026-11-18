import assert from 'node:assert/strict';
import { createClient, localApiBase, visibleSections } from '../../backend-workbench.mjs';

assert.equal(localApiBase('http://localhost:8001'), 'http://localhost:8001');
assert.equal(localApiBase('http://[::1]:8001'), 'http://[::1]:8001');
for (const bad of ['https://localhost:8001', 'http://example.com', 'http://localhost.evil.test',
  'http://user:password@localhost', 'http://localhost/path', 'http://localhost/?token=secret']) {
  assert.throws(() => localApiBase(bad));
}
assert.deepEqual(visibleSections(['audit.read']).map(([id]) => id), ['audit']);
assert.deepEqual(visibleSections([]), []);
assert.deepEqual(visibleSections(['contact.read', 'appointment.read']).map(([id]) => id), ['intake', 'appointments']);
let request;
const client = createClient('http://localhost:8001', async (url, options) => {
  request = { url, options }; return { ok: true, status: 200, json: async () => ({ saved: true }) };
});
client.setCsrf('synthetic-csrf');
assert.deepEqual(await client.request('/api/v1/contacts', { method: 'POST', body: { display_name: 'Synthetic' } }), { saved: true });
assert.equal(request.options.headers['X-CSRFToken'], 'synthetic-csrf');
assert.equal(request.options.credentials, 'include');
assert.equal(request.options.redirect, 'error');
assert.equal(request.url, 'http://localhost:8001/api/v1/contacts');
await assert.rejects(() => client.request('//example.com/steal'));
const denied = createClient('http://localhost:8001', async () => ({ ok: false, status: 403,
  json: async () => ({ detail: 'Permission denied' }) }));
await assert.rejects(() => denied.request('/api/v1/session'), (error) => error.status === 403);
console.log('Workbench client checks passed: loopback boundaries, permission menus, CSRF, credentials and errors.');
