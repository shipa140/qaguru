import { test } from "@playwright/test";

export class CreateArticlePage {
  constructor(page) {
    this.page = page;
    this.titleInput = page.getByPlaceholder("Article Title", { exact: true });
    this.descriptionInput = page.getByPlaceholder(
      "What's this article about?",
      { exact: true },
    );
    this.bodyInput = page.getByPlaceholder("Write your article (in markdown)", {
      exact: true,
    });
    this.tagsInput = page.getByPlaceholder("Enter tags", { exact: true });
    this.publishButton = page.getByRole("button", {
      name: "Publish Article",
    });
  }

  async publish(article) {
    return test.step("UI: публикация статьи", async () => {
      await this.page.goto("/#/editor");
      await this.page.waitForURL(/#\/editor$/u);
      await this.titleInput.fill(article.title);
      await this.descriptionInput.fill(article.description);
      await this.bodyInput.fill(article.body);
      await this.tagsInput.fill(article.tagList.join(", "));
      await this.publishButton.click();
      await this.page.waitForURL(/#\/article\//u);

      return this.#currentSlug();
    });
  }

  #currentSlug() {
    const hash = new URL(this.page.url()).hash;
    return decodeURIComponent(hash.replace("#/article/", ""));
  }
}
