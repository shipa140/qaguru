import { test } from "@playwright/test";

export class ProfilePage {
  constructor(page) {
    this.page = page;
  }

  followButton(username) {
    return this.page.getByRole("button", {
      name: `Follow ${username}`,
    });
  }

  unfollowButton(username) {
    return this.page.getByRole("button", {
      name: `Unfollow ${username}`,
    });
  }

  async follow(username) {
    return test.step("UI: подписка на автора", async () => {
      const profileResponse = this.page.waitForResponse(
        (response) =>
          response.url().includes(`/api/profiles/${username}`) &&
          response.request().method() === "GET" &&
          response.status() === 200,
      );
      await this.page.goto(`/#/profile/${encodeURIComponent(username)}`);
      await profileResponse;

      const followResponse = this.page.waitForResponse(
        (response) =>
          response.url().endsWith(`/api/profiles/${username}/follow`) &&
          response.request().method() === "POST",
      );
      await this.followButton(username).click();
      await followResponse;
    });
  }
}
