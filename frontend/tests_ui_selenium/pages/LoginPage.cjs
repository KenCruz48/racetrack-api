const { By, until } = require('selenium-webdriver');

class LoginPage {
  constructor(driver) { this.driver = driver; }

  async submit(email, password) {
    const emailInput = await this.driver.wait(until.elementLocated(By.id('email')), 30000);
    const passwordInput = await this.driver.findElement(By.id('password'));
    await emailInput.clear();
    await emailInput.sendKeys(email);
    await passwordInput.clear();
    await passwordInput.sendKeys(password);
    await this.driver.findElement(By.id('login')).click();
  }

  async waitForError() {
    await this.driver.wait(until.elementLocated(By.css('[role="alert"]')), 35000);
  }

  async waitForRedirect() {
    await this.driver.wait(until.urlContains('/ingresar'), 30000);
  }
}

module.exports = LoginPage;
