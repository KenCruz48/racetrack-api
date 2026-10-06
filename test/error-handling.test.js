const assert = require('node:assert/strict');
const { once } = require('node:events');
const test = require('node:test');
const app = require('../src/app');

test('GET /ruta-que-no-existe responde HTTP 404 en JSON', async (t) => {
  const server = app.listen(0, '127.0.0.1');

  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
    server.closeAllConnections();
  }));

  await once(server, 'listening');

  const response = await fetch(
    `http://127.0.0.1:${server.address().port}/ruta-que-no-existe`
  );

  assert.equal(response.status, 404);
  assert.match(response.headers.get('content-type'), /application\/json/);

  const body = await response.json();

  assert.equal(body.status, 'error');
  assert.equal(body.message, 'Ruta no encontrada');
});