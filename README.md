# RaceTrack API

Backend para la gestión de eventos deportivos desarrollado con Node.js, Express y MongoDB Atlas.

## Sprint 1

Objetivo del Sprint 1:

- Configurar el servidor Node.js + Express.
- Implementar arquitectura por capas.
- Conectar MongoDB Atlas.
- Configurar variables de entorno.
- Implementar manejo global de errores.
- Integrar Jira con GitHub.

## Gestión ágil

Proyecto Jira: RaceTrack API

Las ramas, commits y Pull Requests deben incluir el identificador del ticket Jira.

Ejemplo:

feature/RACE-21-servidor-express

## Ejecutar el servidor (RACE-21)

Requisito: Node.js 22 o superior con npm.

```powershell
npm ci
npm start
```

El servidor utiliza el puerto 3000 por defecto. Para cambiarlo en PowerShell:

```powershell
$env:PORT = '3001'
npm start
```

`GET http://localhost:3000/health` responde HTTP 200 con `{"status":"ok"}`.

```powershell
Invoke-RestMethod http://localhost:3000/health
npm test
```

`npm run dev` reinicia el servidor al cambiar los archivos.
`src/app.js` configura Express y las rutas; `src/server.js` inicia el servidor HTTP.
La prueba de integración abre un puerto disponible y verifica la respuesta de `/health`.
