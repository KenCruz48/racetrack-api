const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const {
  mkdtempSync,
  writeFileSync,
  rmSync,
} = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const test = require('node:test');

const environments = [
  {
    name: 'development',
    port: '3101',
    uri: 'mongodb://example.invalid/development',
  },
  {
    name: 'test',
    port: '3102',
    uri: 'mongodb://example.invalid/test',
  },
  {
    name: 'production',
    port: '3103',
    uri: 'mongodb://example.invalid/production',
  },
];

for (const environment of environments) {
  test(
    `carga .env.${environment.name} cuando NODE_ENV=${environment.name}`,
    (t) => {
      const directory = mkdtempSync(
        path.join(tmpdir(), 'racetrack-env-')
      );

      t.after(() => {
        rmSync(directory, {
          recursive: true,
          force: true,
        });
      });

      writeFileSync(
        path.join(
          directory,
          `.env.${environment.name}`
        ),
        [
          `PORT=${environment.port}`,
          `MONGODB_URI=${environment.uri}`,
          '',
        ].join('\n')
      );

      const env = {
        ...process.env,
        NODE_ENV: environment.name,
      };

      delete env.PORT;
      delete env.MONGODB_URI;

      const script = `
        const assert = require('node:assert/strict');

        const loadEnvironment = require(
          ${JSON.stringify(
            require.resolve('../src/config/environment')
          )}
        );

        const loadedEnvironment = loadEnvironment();

        assert.equal(
          loadedEnvironment,
          ${JSON.stringify(environment.name)}
        );

        assert.equal(
          process.env.PORT,
          ${JSON.stringify(environment.port)}
        );

        assert.equal(
          process.env.MONGODB_URI,
          ${JSON.stringify(environment.uri)}
        );
      `;

      const result = spawnSync(
        process.execPath,
        ['-e', script],
        {
          cwd: directory,
          env,
          encoding: 'utf8',
          timeout: 15000,
        }
      );

      assert.ifError(result.error);

      assert.equal(
        result.status,
        0,
        result.stderr
      );
    }
  );
}

test(
  'las variables del sistema tienen prioridad sobre el archivo de ambiente',
  (t) => {
    const directory = mkdtempSync(
      path.join(tmpdir(), 'racetrack-env-')
    );

    t.after(() => {
      rmSync(directory, {
        recursive: true,
        force: true,
      });
    });

    writeFileSync(
      path.join(directory, '.env.test'),
      [
        'PORT=3101',
        'MONGODB_URI=mongodb://example.invalid/file',
        '',
      ].join('\n')
    );

    const env = {
      ...process.env,
      NODE_ENV: 'test',
      PORT: '3200',
      MONGODB_URI:
        'mongodb://example.invalid/environment',
    };

    const script = `
      const assert = require('node:assert/strict');

      const loadEnvironment = require(
        ${JSON.stringify(
          require.resolve('../src/config/environment')
        )}
      );

      loadEnvironment();

      assert.equal(process.env.PORT, '3200');

      assert.equal(
        process.env.MONGODB_URI,
        'mongodb://example.invalid/environment'
      );
    `;

    const result = spawnSync(
      process.execPath,
      ['-e', script],
      {
        cwd: directory,
        env,
        encoding: 'utf8',
        timeout: 15000,
      }
    );

    assert.ifError(result.error);

    assert.equal(
      result.status,
      0,
      result.stderr
    );
  }
);

test('rechaza un NODE_ENV no permitido', () => {
  const env = {
    ...process.env,
    NODE_ENV: 'otro-ambiente',
  };

  const script = `
    const assert = require('node:assert/strict');

    const loadEnvironment = require(
      ${JSON.stringify(
        require.resolve('../src/config/environment')
      )}
    );

    assert.throws(
      () => loadEnvironment(),
      /NODE_ENV invalido/
    );
  `;

  const result = spawnSync(
    process.execPath,
    ['-e', script],
    {
      env,
      encoding: 'utf8',
      timeout: 15000,
    }
  );

  assert.ifError(result.error);

  assert.equal(
    result.status,
    0,
    result.stderr
  );
});