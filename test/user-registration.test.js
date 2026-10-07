const assert = require('node:assert/strict');
const test = require('node:test');
const bcrypt = require('bcryptjs');

const User = require('../src/models/userModel');
const userService = require('../src/services/userService');

test('rechaza registro cuando faltan datos obligatorios', async () => {
  await assert.rejects(
    () =>
      userService.registerUser({
        name: '',
        email: '',
        password: '',
      }),
    (error) => {
      assert.equal(error.status, 400);
      assert.match(
        error.message,
        /Nombre, correo y contrasena son obligatorios/
      );

      return true;
    }
  );
});

test('rechaza contrasena menor de 8 caracteres', async () => {
  await assert.rejects(
    () =>
      userService.registerUser({
        name: 'Alexis',
        email: 'alexis@example.com',
        password: '1234567',
      }),
    (error) => {
      assert.equal(error.status, 400);
      assert.match(
        error.message,
        /al menos 8 caracteres/
      );

      return true;
    }
  );
});

test('rechaza un correo que ya esta registrado', async (t) => {
  t.mock.method(
    User,
    'findOne',
    async () => ({
      _id: 'usuario-existente',
    })
  );

  await assert.rejects(
    () =>
      userService.registerUser({
        name: 'Alexis',
        email: 'alexis@example.com',
        password: 'ClaveSegura123',
      }),
    (error) => {
      assert.equal(error.status, 409);
      assert.match(
        error.message,
        /Ya existe un usuario/
      );

      return true;
    }
  );
});

test(
  'registra usuario con password hasheado y no devuelve la contrasena',
  async (t) => {
    let datosGuardados;

    t.mock.method(
      User,
      'findOne',
      async () => null
    );

    t.mock.method(
      User,
      'create',
      async (data) => {
        datosGuardados = data;

        return {
          _id: '507f1f77bcf86cd799439011',
          name: data.name,
          email: data.email,
          active: true,
          createdAt: new Date(
            '2026-10-07T12:00:00Z'
          ),
        };
      }
    );

    const usuario = await userService.registerUser({
      name: ' Alexis Erazo ',
      email: 'ALEXIS@EXAMPLE.COM ',
      password: 'ClaveSegura123',
    });

    assert.equal(
      datosGuardados.name,
      'Alexis Erazo'
    );

    assert.equal(
      datosGuardados.email,
      'alexis@example.com'
    );

    assert.notEqual(
      datosGuardados.passwordHash,
      'ClaveSegura123'
    );

    assert.equal(
      await bcrypt.compare(
        'ClaveSegura123',
        datosGuardados.passwordHash
      ),
      true
    );

    assert.equal(
      usuario.email,
      'alexis@example.com'
    );

    assert.equal(
      usuario.password,
      undefined
    );

    assert.equal(
      usuario.passwordHash,
      undefined
    );
  }
);

test(
  'POST /api/v1/users/register responde HTTP 201',
  async (t) => {
    t.mock.method(
      userService,
      'registerUser',
      async () => ({
        id: '507f1f77bcf86cd799439011',
        name: 'Alexis Erazo',
        email: 'alexis@example.com',
        active: true,
      })
    );

    const app = require('../src/app');

    const server = app.listen(0);

    t.after(() => {
      server.close();
    });

    const port = server.address().port;

    const response = await fetch(
      `http://127.0.0.1:${port}/api/v1/users/register`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Alexis Erazo',
          email: 'alexis@example.com',
          password: 'ClaveSegura123',
        }),
      }
    );

    const body = await response.json();

    assert.equal(response.status, 201);
    assert.equal(body.status, 'success');

    assert.equal(
      body.message,
      'Usuario registrado correctamente'
    );

    assert.equal(
      body.data.email,
      'alexis@example.com'
    );

    assert.equal(
      body.data.password,
      undefined
    );

    assert.equal(
      body.data.passwordHash,
      undefined
    );
  }
);