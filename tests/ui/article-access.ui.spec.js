import { expect, test } from "../../src/index.js";

test.describe("UI: глобальная лента", { tag: ["@ui", "@feed"] }, () => {
  test(
    "Смена набора статей при переходе на следующую страницу ленты",
    { tag: "@positive" },
    async ({ setupApi, ui, resources, userBuilder, articleBuilder }) => {
      const user = userBuilder().build();
      const registration = await setupApi.auth.register(user);
      const token = registration.body.user.token;
      const articles = Array.from({ length: 11 }, () =>
        articleBuilder().withTags([]).build(),
      );

      for (const article of articles) {
        const created = await setupApi.articles.create(token, article);
        resources.trackArticle(token, created.body.article.slug);
      }

      const firstPageTitle = await ui.home.paginateGlobalFeed();

      await expect(ui.home.firstArticleTitle).not.toHaveText(firstPageTitle);
      await expect(ui.home.previousPageButton).toBeEnabled();
    },
  );

  test(
    "Отображение только статей с выбранным тегом",
    { tag: "@positive" },
    async ({ page, setupApi, ui, resources, userBuilder, articleBuilder }) => {
      const user = userBuilder().build();
      const article = articleBuilder().build();
      const tag = article.tagList[0];
      const registration = await setupApi.auth.register(user);
      const token = registration.body.user.token;
      const created = await setupApi.articles.create(token, article);
      resources.trackArticle(token, created.body.article.slug);

      await page.route("**/api/tags", (route) =>
        route.fulfill({ json: { tags: [tag] } }),
      );

      await ui.home.filterGlobalFeedByTag(tag);

      await expect(ui.home.tagFeedTab(tag)).toBeVisible();
      await expect(ui.home.articleTitle(article.title)).toBeVisible();
      await expect
        .poll(async () => {
          const previewTexts = await ui.home.articlePreviews.allTextContents();

          return (
            previewTexts.length > 0 &&
            previewTexts.every((text) => text.includes(tag))
          );
        })
        .toBe(true);
    },
  );
});
