import { test } from "@playwright/test";

export class RegisterPage {
  constructor(page) {
    this.page = page;
    this.usernameInput = page.getByPlaceholder("Your Name", { exact: true });
    this.emailInput = page.getByPlaceholder("Email", { exact: true });
    this.passwordInput = page.getByPlaceholder("Password", { exact: true });
    this.signUpButton = page.getByRole("button", { name: "Sign up" });
    this.errorMessage = page.locator(".error-messages");
  }

  async register(user) {
    return test.step("UI: регистрация пользователя", async () => {
      await this.page.goto("/#/register");
      await this.#submit(user);
      await this.page.waitForURL(/#\/$/u);
    });
  }

  async registerExpectingError(user) {
    return test.step("UI: отклонение регистрации пользователя", async () => {
      await this.page.goto("/#/register");
      await this.#submit(user);
      await this.errorMessage.waitFor({ state: "visible" });
    });
  }

  async #submit(user) {
    await this.usernameInput.fill(user.username);
    await this.emailInput.fill(user.email);
    await this.passwordInput.fill(user.password);
    await this.signUpButton.click();
  }
}
