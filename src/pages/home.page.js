import { test } from "@playwright/test";

export class HomePage {
  constructor(page) {
    this.page = page;
    this.globalFeedTab = page.getByRole("button", { name: "Global Feed" });
    this.yourFeedTab = page.getByRole("button", { name: "Your Feed" });
    this.articlePreviews = page.locator(".article-preview");
    this.firstArticleTitle = page.locator(".article-preview h1").first();
    this.nextPageButton = page.getByRole("button", { name: "Next page" });
    this.previousPageButton = page.getByRole("button", {
      name: "Previous page",
    });
    this.popularTags = page
      .getByRole("heading", { name: "Popular Tags" })
      .locator("..");
  }

  tagFeedTab(tag) {
    return this.page
      .locator(".feed-toggle")
      .getByRole("button")
      .filter({ hasText: tag });
  }

  articleTitle(title) {
    return this.page.getByRole("heading", { name: title, exact: true });
  }

  popularTag(tag) {
    return this.popularTags.getByRole("button", { name: tag, exact: true });
  }

  async openYourFeed() {
    return test.step("UI: открытие личной ленты", async () => {
      await this.page.goto("/#/");
      await this.globalFeedTab.click();

      const feedResponse = this.page.waitForResponse(
        (response) =>
          response.url().includes("/api/articles/feed") &&
          response.request().method() === "GET" &&
          response.status() === 200,
      );
      await this.yourFeedTab.click();
      await feedResponse;
    });
  }

  async paginateGlobalFeed() {
    return test.step("UI: переход на следующую страницу ленты", async () => {
      await this.#openGlobalFeed();
      const firstPageTitle = await this.firstArticleTitle.innerText();
      const response = this.page.waitForResponse(
        (candidate) =>
          candidate.url().includes("/api/articles") &&
          candidate.url().includes("offset=") &&
          candidate.status() === 200,
      );
      await this.nextPageButton.click();
      await response;

      return firstPageTitle;
    });
  }

  async filterGlobalFeedByTag(tag) {
    return test.step("UI: фильтрация ленты по собственному тегу", async () => {
      await this.#openGlobalFeed();
      const response = this.page.waitForResponse((candidate) => {
        const url = new URL(candidate.url());

        return (
          url.pathname === "/api/articles" &&
          url.searchParams.get("tag") === tag &&
          candidate.request().method() === "GET" &&
          candidate.status() === 200
        );
      });
      await this.popularTag(tag).click();
      await response;
    });
  }

  async #openGlobalFeed() {
    const response = this.page.waitForResponse((candidate) => {
      const url = new URL(candidate.url());

      return (
        url.pathname === "/api/articles" &&
        !url.searchParams.has("tag") &&
        candidate.request().method() === "GET" &&
        candidate.status() === 200
      );
    });
    await this.page.goto("/#/");
    await response;
  }
}
