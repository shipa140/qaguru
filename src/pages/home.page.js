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
    this.firstPopularTag = page
      .getByRole("heading", { name: "Popular Tags" })
      .locator("..")
      .getByRole("button")
      .first();
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
      await this.firstArticleTitle.waitFor({ state: "visible" });
      const before = await this.firstArticleTitle.textContent();
      const response = this.page.waitForResponse(
        (candidate) =>
          candidate.url().includes("/api/articles") &&
          candidate.url().includes("offset=") &&
          candidate.status() === 200,
      );
      await this.nextPageButton.click();
      await response;
      await this.page.waitForFunction(
        (titleBeforePagination) =>
          globalThis.document.querySelector(".article-preview h1")
            ?.textContent !== titleBeforePagination,
        before,
      );

      return {
        before,
        after: await this.firstArticleTitle.textContent(),
      };
    });
  }

  async filterGlobalFeedByPopularTag() {
    return test.step("UI: фильтрация ленты по популярному тегу", async () => {
      await this.#openGlobalFeed();
      const tag = (await this.firstPopularTag.textContent())?.trim();
      if (!tag) {
        throw new Error("A popular tag was not found on the home page.");
      }

      const response = this.page.waitForResponse(
        (candidate) =>
          candidate.url().includes("/api/articles") &&
          candidate.url().includes("tag=") &&
          candidate.status() === 200,
      );
      await this.firstPopularTag.click();
      await response;

      const tagTab = this.tagFeedTab(tag);
      await tagTab.waitFor({ state: "visible" });

      return tag;
    });
  }

  async #openGlobalFeed() {
    await this.page.goto("/#/");
    await this.globalFeedTab.click();
  }
}
