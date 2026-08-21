import { test } from "@playwright/test";

export class NavbarPage {
  constructor(page) {
    this.page = page;
    this.navbar = page.locator("nav.navbar");
  }

  userMenu(username) {
    return this.navbar.getByText(username, { exact: true });
  }

  newArticleLink() {
    return this.navbar.getByRole("link", { name: "New Article" });
  }

  loginLink() {
    return this.navbar.getByRole("link", { name: "Login" });
  }

  signUpLink() {
    return this.navbar.getByRole("link", { name: "Sign up" });
  }

  async logout(username) {
    return test.step("UI: выход пользователя", async () => {
      await this.userMenu(username).click();
      await this.navbar.getByRole("link", { name: "Logout" }).click();
      await this.loginLink().waitFor({ state: "visible" });
    });
  }
}
