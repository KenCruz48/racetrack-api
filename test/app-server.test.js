const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { Server } = require('node:net');
const test = require('node:test');
const mongoose = require('mongoose');

test('importar app.js configura Express sin iniciar un servidor', (t) => {
  // Intercepta también el listen HTTP heredado para impedir abrir un puerto.
  const listen = t.mock.method(Server.prototype, 'listen', () => {
    assert.fail('Importar app.js no debe iniciar un servidor');
  });

  const app = require('../src/app');

  assert.equal(typeof app, 'function');
  assert.equal(typeof app.listen, 'function');
  assert.equal(listen.mock.callCount(), 0);
});

test('server.js inicia una sola vez la aplicación exportada por app.js', async (t) => {
  const app = require('../src/app');
  const server = new EventEmitter();
  const previousUri = process.env.MONGODB_URI;
  process.env.MONGODB_URI = 'mongodb://example.invalid/test';
  t.after(() => {
    if (previousUri === undefined) delete process.env.MONGODB_URI;
    else process.env.MONGODB_URI = previousUri;
  });
  let connected = false;
  t.mock.method(mongoose, 'connect', async () => { connected = true; });
  t.mock.method(console, 'log', () => {});
  server.address = () => ({ port: 3000 });
  const listen = t.mock.method(app, 'listen', (port, callback) => {
    assert.equal(connected, true);
    queueMicrotask(callback);
    return server;
  });

  const startServer = require('../src/server');
  assert.equal(await startServer(), server);

  assert.equal(listen.mock.callCount(), 1);
  const call = listen.mock.calls[0];
  assert.equal(call.this, app);
  assert.equal(call.arguments[0], process.env.PORT ?? 3000);
  assert.equal(typeof call.arguments[1], 'function');
  assert.equal(server.listenerCount('error'), 1);
});
