import { expect, test } from "../../src/index.js";

test.describe(
  "UI: профиль и личная лента",
  { tag: ["@ui", "@profiles"] },
  () => {
    test(
      "Появление статьи автора в личной ленте после подписки",
      { tag: "@positive" },
      async ({ setupApi, ui, resources, userBuilder, articleBuilder }) => {
        const author = userBuilder().build();
        const reader = userBuilder().build();
        const authorAccount = await setupApi.auth.register(author);
        await setupApi.auth.register(reader);
        const article = articleBuilder().build();
        const created = await setupApi.articles.create(
          authorAccount.body.user.token,
          article,
        );
        resources.trackArticle(
          authorAccount.body.user.token,
          created.body.article.slug,
        );

        await ui.login.login(reader);
        await ui.profile.follow(author.username);
        await expect(ui.profile.unfollowButton(author.username)).toBeVisible();
        await ui.home.openYourFeed();

        await expect(ui.home.articleTitle(article.title)).toBeVisible();
      },
    );

    test(
      "Сохранение нового описания профиля в интерфейсе и API",
      { tag: "@positive" },
      async ({ setupApi, ui, userBuilder }) => {
        const user = userBuilder().build();
        const bio = `Профиль ${user.username} обновлён`;
        const registration = await setupApi.auth.register(user);
        const token = registration.body.user.token;

        await ui.login.login(user);
        await ui.settings.updateBio(bio);
        const currentUser = await setupApi.auth.getCurrent(token);

        await expect(ui.settings.bioInput).toHaveValue(bio);
        expect(currentUser.body.user.bio).toBe(bio);
      },
    );
  },
);
