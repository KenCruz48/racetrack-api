const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { mkdtempSync, writeFileSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const test = require('node:test');

for (const external of [false, true]) {
  test(external ? 'el entorno tiene prioridad sobre .env' : 'el arranque carga .env antes de MongoDB y HTTP', (t) => {
    const directory = mkdtempSync(path.join(tmpdir(), 'racetrack-env-'));
    t.after(() => rmSync(directory, { recursive: true, force: true }));
    writeFileSync(path.join(directory, '.env'), 'PORT=3101\nMONGODB_URI=mongodb://example.invalid/file\n');
    const env = { ...process.env };
    delete env.PORT;
    delete env.MONGODB_URI;
    if (external) {
      env.PORT = '3102';
      env.MONGODB_URI = 'mongodb://example.invalid/environment';
    }
    const expectedPort = external ? '3102' : '3101';
    const expectedUri = `mongodb://example.invalid/${external ? 'environment' : 'file'}`;
    const script = `
      const assert = require('node:assert/strict');
      const mongoose = require(${JSON.stringify(require.resolve('mongoose'))});
      const app = require(${JSON.stringify(require.resolve('../src/app'))});
      let connected = false;
      mongoose.connect = async (uri) => {
        assert.equal(uri, ${JSON.stringify(expectedUri)});
        connected = true;
      };
      app.listen = (port, callback) => {
        assert.equal(connected, true);
        assert.equal(port, ${JSON.stringify(expectedPort)});
        const server = new (require('node:events').EventEmitter)();
        server.address = () => ({ port });
        queueMicrotask(callback);
        return server;
      };
      require(${JSON.stringify(require.resolve('../src/server'))})().catch(() => {
        process.exitCode = 1;
      });
    `;
    const result = spawnSync(process.execPath, ['-e', script], {
      cwd: directory, env, encoding: 'utf8', timeout: 15000,
    });
    assert.ifError(result.error);
    assert.equal(result.status, 0, 'El arranque con entorno simulado debe completarse');
    assert.match(result.stdout, /RaceTrack API escuchando/);
  });
}
