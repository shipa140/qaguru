import { expect, test } from "../../src/index.js";

test.describe(
  "UI: публикация и управление статьями",
  { tag: ["@ui", "@articles"] },
  () => {
    test(
      "Сохранение заголовка, текста и тегов опубликованной статьи",
      { tag: "@positive" },
      async ({ setupApi, ui, resources, userBuilder, articleBuilder }) => {
        const user = userBuilder().build();
        const article = articleBuilder().build();
        const registration = await setupApi.auth.register(user);

        await ui.login.login(user);
        const slug = await ui.createArticle.publish(article);
        resources.trackArticle(registration.body.user.token, slug);
        const persisted = await setupApi.articles.get(slug);
        const [firstParagraph, runMarker] = article.body.split(/\n+/u);

        await expect(ui.article.title(article.title)).toBeVisible();
        await expect(ui.article.content).toContainText(firstParagraph);
        await expect(ui.article.content).toContainText(runMarker);
        await expect(ui.article.tag(article.tagList[0])).toBeVisible();
        expect(persisted.body.article).toEqual(
          expect.objectContaining({
            title: article.title,
            description: article.description,
            body: article.body,
          }),
        );
        expect(persisted.body.article.tagList).toEqual(
          expect.arrayContaining(article.tagList),
        );
      },
    );

    test(
      "Сохранение нового содержимого и адреса статьи после редактирования",
      { tag: "@positive" },
      async ({ setupApi, ui, resources, userBuilder, articleBuilder }) => {
        const user = userBuilder().build();
        const article = articleBuilder().build();
        const updatedArticle = articleBuilder()
          .withTitle(`${article.title} updated`)
          .withDescription(`${article.description} updated`)
          .withBody(`${article.body}\n\nUpdated`)
          .withTags(article.tagList)
          .build();
        const registration = await setupApi.auth.register(user);
        const token = registration.body.user.token;
        const created = await setupApi.articles.create(token, article);
        const oldSlug = created.body.article.slug;
        resources.trackArticle(token, oldSlug);

        await ui.login.login(user);
        const slug = await ui.editArticle.edit(oldSlug, updatedArticle);
        resources.replaceArticle(token, oldSlug, slug);
        const persisted = await setupApi.articles.get(slug);
        const [firstParagraph, runMarker] = updatedArticle.body.split(/\n+/u);

        expect(slug).not.toBe(oldSlug);
        await expect(ui.article.title(updatedArticle.title)).toBeVisible();
        await expect(ui.article.content).toContainText(firstParagraph);
        await expect(ui.article.content).toContainText(runMarker);
        await expect(ui.article.tag(updatedArticle.tagList[0])).toBeVisible();
        expect(persisted.body.article).toEqual(
          expect.objectContaining({
            title: updatedArticle.title,
            description: updatedArticle.description,
            body: updatedArticle.body,
          }),
        );
        expect(persisted.body.article.tagList).toEqual(
          expect.arrayContaining(article.tagList),
        );
      },
    );

    test(
      "Исчезновение комментария из статьи после удаления",
      { tag: ["@comments", "@positive"] },
      async ({
        setupApi,
        ui,
        resources,
        userBuilder,
        articleBuilder,
        commentBuilder,
      }) => {
        const user = userBuilder().build();
        const article = articleBuilder().build();
        const comment = commentBuilder()
          .withBody(`Комментарий к статье ${article.title}`)
          .build();
        const registration = await setupApi.auth.register(user);
        const token = registration.body.user.token;
        const created = await setupApi.articles.create(token, article);
        const slug = created.body.article.slug;
        resources.trackArticle(token, slug);
        await setupApi.comments.create(token, slug, comment);

        await ui.login.login(user);
        await ui.article.deleteComment(slug, comment.body);
        const comments = await setupApi.comments.list(slug);

        await expect(ui.article.comment(comment.body)).toBeHidden();
        expect(comments.body.comments).not.toEqual(
          expect.arrayContaining([
            expect.objectContaining({ body: comment.body }),
          ]),
        );
      },
    );

    test(
      "Восстановление счётчика избранного после добавления и удаления статьи",
      { tag: "@positive" },
      async ({ setupApi, ui, resources, userBuilder, articleBuilder }) => {
        const author = userBuilder().build();
        const viewer = userBuilder().build();
        const article = articleBuilder().build();
        const authorAccount = await setupApi.auth.register(author);
        const token = authorAccount.body.user.token;
        const created = await setupApi.articles.create(token, article);
        const slug = created.body.article.slug;
        const initialCount = created.body.article.favoritesCount;
        resources.trackArticle(token, slug);
        await setupApi.auth.register(viewer);

        await ui.login.login(viewer);
        const result = await ui.article.favoriteAndUnfavorite(
          slug,
          initialCount,
        );
        const persisted = await setupApi.articles.get(slug);

        expect(result.afterFavoriteCount).toBe(initialCount + 1);
        expect(result.afterUnfavoriteCount).toBe(initialCount);
        expect(persisted.body.article.favoritesCount).toBe(initialCount);
        await expect(ui.article.favoriteButton(initialCount)).toBeVisible();
        await expect(ui.article.favoriteButton(initialCount + 1)).toBeHidden();
      },
    );

    test(
      "Предложение войти вместо формы комментария для гостя",
      { tag: ["@comments", "@negative"] },
      async ({ setupApi, ui, resources, userBuilder, articleBuilder }) => {
        const user = userBuilder().build();
        const article = articleBuilder().build();
        const registration = await setupApi.auth.register(user);
        const token = registration.body.user.token;
        const created = await setupApi.articles.create(token, article);
        const slug = created.body.article.slug;
        resources.trackArticle(token, slug);

        await ui.article.showAnonymousCommentPrompt(slug);

        await expect(ui.article.anonymousCommentPrompt()).toBeVisible();
        await expect(ui.article.commentInput).toBeHidden();
      },
    );

    test(
      "Ответ 404 при запросе статьи после удаления",
      { tag: "@positive" },
      async ({ setupApi, ui, resources, userBuilder, articleBuilder }) => {
        const user = userBuilder().build();
        const article = articleBuilder().build();
        const registration = await setupApi.auth.register(user);
        const token = registration.body.user.token;
        const created = await setupApi.articles.create(token, article);
        const slug = created.body.article.slug;
        resources.trackArticle(token, slug);

        await ui.login.login(user);
        await ui.article.delete(slug);
        const fetchedAfterDelete = await setupApi.articles.get(slug);
        resources.forgetArticle(token, slug);

        expect(fetchedAfterDelete.status).toBe(404);
        await expect(ui.navbar.newArticleLink()).toBeVisible();
      },
    );
  },
);
