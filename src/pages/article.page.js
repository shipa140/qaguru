import { test } from "@playwright/test";

export class ArticlePage {
  constructor(page) {
    this.page = page;
    this.content = page.locator(".article-content");
    this.banner = page.locator(".article-page .banner");
    this.commentInput = page.getByPlaceholder("Write a comment...", {
      exact: true,
    });
    this.deleteArticleButton = this.banner.getByRole("button", {
      name: "Delete Article",
    });
  }

  title(title) {
    return this.page.getByRole("heading", { level: 1, name: title });
  }

  tag(tag) {
    return this.content.getByText(tag, { exact: true });
  }

  comment(body) {
    return this.page.locator(".card").filter({ hasText: body });
  }

  favoriteButton(count) {
    const button = this.banner.getByRole("button", { name: /Favorite/u });

    return count === undefined
      ? button
      : button.filter({ hasText: String(count) });
  }

  anonymousCommentPrompt() {
    return this.page.getByText(/Sign in.*sign up.*add comments/iu);
  }

  async deleteComment(slug, body) {
    return test.step("UI: удаление комментария", async () => {
      await this.#open(slug);
      const commentLocator = this.comment(body);
      await commentLocator.waitFor({ state: "visible" });
      this.page.once("dialog", (dialog) => dialog.accept());
      await commentLocator.getByRole("button").click();
      await commentLocator.waitFor({ state: "hidden" });
    });
  }

  async favoriteAndUnfavorite(slug, initialCount) {
    return test.step("UI: добавление статьи в избранное и отмена", async () => {
      await this.#open(slug);

      const favoriteResponse = this.#waitForFavoriteResponse(slug, "POST");
      await this.favoriteButton().click();
      await favoriteResponse;
      const favoritedButton = this.favoriteButton(initialCount + 1);
      await favoritedButton.waitFor({ state: "visible" });
      const afterFavoriteCount = await this.#favoriteCount();

      const unfavoriteResponse = this.#waitForFavoriteResponse(slug, "DELETE");
      await this.favoriteButton().click();
      await unfavoriteResponse;
      const favoriteButton = this.favoriteButton(initialCount);
      await favoriteButton.waitFor({ state: "visible" });
      const afterUnfavoriteCount = await this.#favoriteCount();

      return {
        afterFavoriteCount,
        afterUnfavoriteCount,
      };
    });
  }

  async showAnonymousCommentPrompt(slug) {
    return test.step("UI: предложение войти перед комментированием", async () => {
      await this.#open(slug);
    });
  }

  async delete(slug) {
    return test.step("UI: удаление статьи", async () => {
      await this.#open(slug);
      this.page.once("dialog", (dialog) => dialog.accept());
      await this.deleteArticleButton.click();
      await this.page.waitForURL(/#\/$/u);
    });
  }

  async #open(slug) {
    const articleResponse = this.page.waitForResponse(
      (response) =>
        response.url().endsWith(`/api/articles/${slug}`) &&
        response.request().method() === "GET" &&
        response.status() === 200,
    );
    await this.page.goto(`/#/article/${encodeURIComponent(slug)}`);
    await articleResponse;
    await this.page.waitForURL(/#\/article\//u);
  }

  #waitForFavoriteResponse(slug, method) {
    return this.page.waitForResponse(
      (response) =>
        response.url().endsWith(`/articles/${slug}/favorite`) &&
        response.request().method() === method,
    );
  }

  async #favoriteCount() {
    const text = await this.favoriteButton().textContent();
    const matches = text?.match(/\d+/gu);

    if (!matches?.length) {
      throw new Error(`Не удалось определить счётчик избранного: ${text}`);
    }

    return Number(matches.at(-1));
  }
}
