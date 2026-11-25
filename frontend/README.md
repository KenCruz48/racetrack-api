# RaceTrack Frontend y QA

El cliente React + Vite se sirve en `/app/`. El catálogo y la clasificación son públicos. Mi cuenta requiere una sesión validada por `GET /api/v1/users/me`. Axios agrega el JWT a las solicitudes autenticadas. Context API conserva la sesión al recargar la misma pestaña y la elimina al cerrar sesión o si el servidor rechaza el token. El cliente anterior sigue disponible en `/`.

| Historia | Jira | Evidencia |
| --- | --- | --- |
| HU-001 | [RACE-56](https://kevidavidcruzlamprea.atlassian.net/browse/RACE-56) | Vite, `.env.example`, workflow y configuración de Render |
| HU-002 | [RACE-57](https://kevidavidcruzlamprea.atlassian.net/browse/RACE-57) | `src/App.jsx`, `src/api/axiosClient.js` |
| HU-003 | [RACE-59](https://kevidavidcruzlamprea.atlassian.net/browse/RACE-59) | `src/store/useAuth.jsx`, `src/components/ProtectedRoute.jsx`, `GET /api/v1/users/me` |
| HU-004 | [RACE-58](https://kevidavidcruzlamprea.atlassian.net/browse/RACE-58) | Pruebas Vitest, clases POM y workflow de regresión en Render |

## Demostración local

Desde la raíz del repositorio, con Node.js 24 y Chrome:

```powershell
npm ci
npm --prefix frontend ci
npm --prefix frontend run build
npm run demo:local
```

Con el servidor activo, abrir [http://localhost:3000/app/](http://localhost:3000/app/). El comando prepara los eventos **Circuito universitario 5K · Inscripciones** y **Encuentro universitario 5K · Resultados**, más la categoría **Abierta Demo**. Consultar la cuenta `corredor` en el archivo privado `.demo-credentials.json`. Para desarrollo con recarga rápida, `npm --prefix frontend run dev` sirve el cliente en el puerto de Vite y reenvía `/api` al puerto 3000.

## Pruebas

```powershell
npm test
npm run test:jest
npm --prefix frontend test
npm --prefix frontend run lint
```

Para Selenium local, con la demo activa, abrir otra consola en la raíz:

```powershell
$runner = (Get-Content .demo-credentials.json -Raw | ConvertFrom-Json).accounts | Where-Object role -EQ corredor
$env:E2E_EMAIL = $runner.email
$env:E2E_PASSWORD = $runner.password
$env:E2E_EVENT = 'Circuito universitario 5K · Inscripciones'
$env:E2E_CATEGORY = 'Abierta Demo'
npm --prefix frontend run test:e2e
```

La suite guarda su resultado y captura en `evidence/generated/frontend/`. Usar una cuenta y carrera dedicadas a QA, con cupos y sin inscripción previa de esa cuenta. Se pueden definir `CHROME_BINARY` y `CHROMEDRIVER_PATH` cuando ChromeDriver se administra localmente.

## Publicación y regresión en Render

1. Crear el servicio en Render desde el repositorio y la rama de entrega mediante `render.yaml`. Configurar `MONGODB_URI` y `MONGODB_DB` en el panel privado del servicio. El secreto JWT se genera en Render.
2. Configurar Atlas para que el servicio acceda a la base de QA. Comprobar `https://<servicio>.onrender.com/ready` y `https://<servicio>.onrender.com/app/`. La variable pública `VITE_API_URL=/api/v1` resuelve la API del mismo servicio de Render.
3. Preparar una cuenta, un evento con cupos, un evento con resultados en la primera página del catálogo y una categoría activa en esa base. En GitHub Actions, configurar las variables `RENDER_QA_FRONTEND_URL` (URL completa terminada en `/app`), `RENDER_QA_EVENT`, `RENDER_QA_CATEGORY` y `RENDER_QA_RANKING_EVENT`, y los secretos `RENDER_QA_EMAIL` y `RENDER_QA_PASSWORD`.
4. Ejecutar el workflow **Frontend Sprint 3** con `verify_render` habilitado y conservar el artefacto **frontend-render-qa** como evidencia de HU-004.

La comprobación de Render requiere el servicio y la base configurados. La ejecución local valida el mismo cliente compilado y el backend con una réplica temporal de MongoDB.
