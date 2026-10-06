const assert = require('node:assert/strict');
const { once } = require('node:events');
const test = require('node:test');
const app = require('../src/app');

test('GET /api/v1/events/example responde usando route controller service', async (t) => {
  const server = app.listen(0, '127.0.0.1');

  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
    server.closeAllConnections();
  }));

  await once(server, 'listening');

  const response = await fetch(
    `http://127.0.0.1:${server.address().port}/api/v1/events/example`
  );

  assert.equal(response.status, 200);

  const body = await response.json();

  assert.equal(body.status, 'success');
  assert.equal(body.data.name, 'Carrera de ejemplo');
  assert.equal(body.data.distance, '5K');
});