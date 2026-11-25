const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const CatalogPage = require('./pages/CatalogPage.cjs');
const DashboardPage = require('./pages/DashboardPage.cjs');
const LoginPage = require('./pages/LoginPage.cjs');

async function main() {
  const base = (process.env.FRONTEND_E2E_URL || 'http://localhost:3000/app').replace(/\/$/, '');
  const { E2E_EMAIL: email, E2E_PASSWORD: password, E2E_EVENT: event, E2E_CATEGORY: category } = process.env;
  const rankingEvent = process.env.E2E_RANKING_EVENT || 'Encuentro universitario 5K · Resultados';
  assert(email && password && event && category, 'Define E2E_EMAIL, E2E_PASSWORD, E2E_EVENT y E2E_CATEGORY para una cuenta y carrera de QA.');
  const options = new chrome.Options().addArguments('--headless=new', '--disable-dev-shm-usage', '--window-size=1280,900');
  if (process.env.CHROME_BINARY) options.setChromeBinaryPath(process.env.CHROME_BINARY);
  const builder = new Builder().forBrowser('chrome').setChromeOptions(options);
  if (process.env.CHROMEDRIVER_PATH) builder.setChromeService(new chrome.ServiceBuilder(process.env.CHROMEDRIVER_PATH));
  const driver = await builder.build();
  const login = new LoginPage(driver);
  const dashboard = new DashboardPage(driver);
  const catalog = new CatalogPage(driver);
  const output = path.resolve(__dirname, '..', '..', 'evidence', 'generated', 'frontend');
  let registered = false;
  const checks = [];

  try {
    await driver.get(`${base}/`);
    assert((await catalog.openRanking(rankingEvent)).length > 0);
    checks.push('Catálogo público y clasificación con resultados.');
    await driver.get(`${base}/mi-cuenta`);
    await login.waitForRedirect();
    await login.submit(email, 'credencial-incorrecta-de-qa');
    await login.waitForError();
    checks.push('Ruta privada redirige y credenciales inválidas son rechazadas.');
    await login.submit(email, password);
    await dashboard.waitForAccount();
    await driver.navigate().refresh();
    await dashboard.waitForAccount();
    checks.push('Inicio de sesión y restauración tras recargar.');
    await dashboard.choose('event', event);
    await dashboard.choose('category', category);
    await dashboard.register();
    await dashboard.waitForText('status', 'Inscripción confirmada.');
    registered = true;
    await dashboard.register();
    await dashboard.waitForText('alert', 'activa');
    checks.push('Inscripción y rechazo del duplicado.');
    await dashboard.cancel();
    await dashboard.waitForText('status', 'Inscripción cancelada.');
    registered = false;
    await fs.mkdir(output, { recursive: true });
    await fs.writeFile(path.join(output, 'selenium.png'), await driver.takeScreenshot(), 'base64');
    await dashboard.logout();
    await login.waitForRedirect();
    checks.push('Cancelación y cierre de sesión.');
    const result = { status: 'passed', base, date: new Date().toISOString(), checks };
    await fs.writeFile(path.join(output, 'selenium.json'), JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result, null, 2));
  } finally {
    try {
      if (registered) {
        await dashboard.cancel();
        await dashboard.waitForText('status', 'Inscripción cancelada.');
      }
    } finally {
      await driver.quit();
    }
  }
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
