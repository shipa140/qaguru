import { expect, test } from "../../src/fixtures/index.js";

test.describe("UI: глобальная лента", { tag: ["@ui", "@feed"] }, () => {
  test(
    "Изменение содержимого ленты при переходе на следующую страницу",
    { tag: "@positive" },
    async ({ ui }) => {
      const result = await ui.home.paginateGlobalFeed();

      expect(result.before).toEqual(expect.any(String));
      expect(result.after).toEqual(expect.any(String));
      expect(result.after).not.toBe(result.before);
      await expect(ui.home.previousPageButton).toBeEnabled();
    },
  );

  test(
    "Фильтрация ленты по выбранному популярному тегу",
    { tag: "@positive" },
    async ({ ui }) => {
      const tag = await ui.home.filterGlobalFeedByPopularTag();

      await expect(ui.home.tagFeedTab(tag)).toBeVisible();
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
