import assert from 'node:assert/strict';
import { createClient } from '../../p1-ui.mjs';

const response = ({ ok, status, body, contentType = 'application/json' }) => ({
  ok,
  status,
  headers: { get: (name) => name.toLowerCase() === 'content-type' ? contentType : null },
  text: async () => body,
});

const expired = createClient('http://localhost:8001', async () => response({
  ok: false, status: 401, body: '<html>session expired</html>', contentType: 'text/html',
}));
await assert.rejects(
  () => expired.request('/api/v1/screening/reviews'),
  (error) => error.status === 401 && /session has expired/.test(error.message),
);

const serverFailure = createClient('http://localhost:8001', async () => response({
  ok: false, status: 500, body: '<html>internal server error</html>', contentType: 'text/html',
}));
await assert.rejects(
  () => serverFailure.request('/api/v1/screening/reviews'),
  (error) => error.status === 500 && /non-JSON response \(HTTP 500\)/.test(error.message),
);

const malformedSuccess = createClient('http://localhost:8001', async () => response({
  ok: true, status: 200, body: 'not json', contentType: 'text/plain',
}));
await assert.rejects(
  () => malformedSuccess.request('/api/v1/screening/reviews'),
  (error) => error.status === 200 && /non-JSON response \(HTTP 200\)/.test(error.message),
);

const valid = createClient('http://localhost:8001', async () => response({
  ok: true, status: 200, body: '{"items":[]}',
}));
assert.deepEqual(await valid.request('/api/v1/screening/reviews'), { items: [] });

console.log('P1 API client response checks passed: JSON responses and readable expired-session/server errors.');
