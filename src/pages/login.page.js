import { test } from "@playwright/test";

export class LoginPage {
  constructor(page) {
    this.page = page;
    this.emailInput = page.getByPlaceholder("Email", { exact: true });
    this.passwordInput = page.getByPlaceholder("Password", { exact: true });
    this.loginButton = page.getByRole("button", { name: "Login" });
    this.errorMessage = page.locator(".error-messages");
  }

  async login({ email, password }) {
    return test.step("UI: вход пользователя", async () => {
      await this.page.goto("/#/login");
      await this.#submit({ email, password });
      await this.page.waitForURL(/#\/$/u);
    });
  }

  async loginExpectingError({ email, password }) {
    return test.step("UI: отклонение входа пользователя", async () => {
      await this.page.goto("/#/login");
      await this.#submit({ email, password });
      await this.errorMessage.waitFor({ state: "visible" });
    });
  }

  async #submit({ email, password }) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
