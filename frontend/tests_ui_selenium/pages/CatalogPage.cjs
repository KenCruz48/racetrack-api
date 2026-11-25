const { By, until } = require('selenium-webdriver');

class CatalogPage {
  constructor(driver) { this.driver = driver; }

  async openRanking(eventName) {
    const { driver } = this;
    const link = await driver.wait(async () => {
      for (const event of await driver.findElements(By.css('.event'))) {
        if (await event.findElement(By.css('h2')).getText() === eventName) {
          return event.findElement(By.partialLinkText('Ver clasificación'));
        }
      }
      return null;
    }, 35000, 'No se encontró la carrera de clasificación en la primera página.');
    await link.click();
    await driver.wait(until.elementLocated(By.css('tbody tr')), 35000);
    return driver.findElements(By.css('tbody tr'));
  }
}

module.exports = CatalogPage;
