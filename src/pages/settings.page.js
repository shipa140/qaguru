import { test } from "@playwright/test";

export class SettingsPage {
  constructor(page) {
    this.page = page;
    this.bioInput = page.getByPlaceholder("Short bio about you", {
      exact: true,
    });
    this.updateButton = page.getByRole("button", {
      name: "Update Settings",
    });
  }

  async updateBio(bio) {
    return test.step("UI: изменение описания профиля", async () => {
      await this.page.goto("/#/settings");
      await this.bioInput.fill(bio);

      const updateResponse = this.page.waitForResponse(
        (response) =>
          response.url().endsWith("/api/user") &&
          response.request().method() === "PUT",
      );
      await this.updateButton.click();
      await updateResponse;
      await this.page.reload();
      await this.bioInput.waitFor({ state: "visible" });
    });
  }
}
