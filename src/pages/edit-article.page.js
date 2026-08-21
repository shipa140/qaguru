import { test } from "@playwright/test";

export class EditArticlePage {
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
    this.editArticleLink = page.getByRole("link", { name: "Edit Article" });
    this.updateButton = page.getByRole("button", { name: "Update Article" });
  }

  async edit(slug, article) {
    return test.step("UI: изменение статьи", async () => {
      await this.page.goto(`/#/article/${encodeURIComponent(slug)}`);
      await this.editArticleLink.first().click();
      await this.page.waitForURL(/#\/editor\//u);
      await this.titleInput.fill(article.title);
      await this.descriptionInput.fill(article.description);
      await this.bodyInput.fill(article.body);
      await this.tagsInput.fill(article.tagList.join(", "));
      await this.updateButton.click();
      await this.page.waitForURL(/#\/article\//u);

      return this.#currentSlug();
    });
  }

  #currentSlug() {
    const hash = new URL(this.page.url()).hash;
    return decodeURIComponent(hash.replace("#/article/", ""));
  }
}
