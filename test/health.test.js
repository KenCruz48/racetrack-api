const assert = require('node:assert/strict');
const { once } = require('node:events');
const test = require('node:test');
const app = require('../src/app');

test('GET /health responde HTTP 200 y JSON de estado', async (t) => {
  const server = app.listen(0, '127.0.0.1');
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
    server.closeAllConnections();
  }));
  await once(server, 'listening');

  const response = await fetch(`http://127.0.0.1:${server.address().port}/health`);

  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /application\/json/);
  assert.deepEqual(await response.json(), { status: 'ok' });
});
