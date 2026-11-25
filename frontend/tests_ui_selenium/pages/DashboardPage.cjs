const { By, Select, until } = require('selenium-webdriver');

class DashboardPage {
  constructor(driver) { this.driver = driver; }

  async waitForAccount() {
    await this.driver.wait(until.elementLocated(By.id('account-name')), 35000);
  }

  async choose(id, name) {
    const select = await this.driver.wait(until.elementLocated(By.id(id)), 35000);
    await this.driver.wait(async () =>
      (await select.findElements(By.css('option'))).length > 1, 35000);
    await new Select(select).selectByVisibleText(name);
  }

  async register() { await this.driver.findElement(By.id('join')).click(); }
  async cancel() { await this.driver.findElement(By.id('cancel')).click(); }
  async logout() { await this.driver.findElement(By.css('nav button')).click(); }

  async waitForText(role, text) {
    await this.driver.wait(async () => {
      const messages = await this.driver.findElements(By.css(`[role="${role}"]`));
      for (const message of messages) if ((await message.getText()).includes(text)) return true;
      return false;
    }, 35000, text);
  }
}

module.exports = DashboardPage;
