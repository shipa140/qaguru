import { expect, test } from "../../src/fixtures/index.js";

test.describe("UI: аутентификация", { tag: ["@ui", "@auth"] }, () => {
  test(
    "Регистрация нового пользователя",
    { tag: "@positive" },
    async ({ ui, userBuilder }) => {
      const user = userBuilder().build();

      await ui.register.register(user);

      await expect(ui.navbar.userMenu(user.username)).toBeVisible();
      await expect(ui.navbar.newArticleLink()).toBeVisible();
    },
  );

  test(
    "Вход зарегистрированного пользователя",
    { tag: "@positive" },
    async ({ setupApi, ui, userBuilder }) => {
      const user = userBuilder().build();

      await setupApi.auth.register(user);
      await ui.login.login(user);

      await expect(ui.navbar.userMenu(user.username)).toBeVisible();
      await expect(ui.navbar.newArticleLink()).toBeVisible();
    },
  );

  test(
    "Ошибка при вводе неверного пароля",
    { tag: "@negative" },
    async ({ setupApi, ui, userBuilder, page }) => {
      const user = userBuilder().build();
      const invalidCredentials = userBuilder()
        .withEmail(user.email)
        .withPassword(`${user.password}-invalid`)
        .build();

      await setupApi.auth.register(user);
      await ui.login.loginExpectingError(invalidCredentials);

      await expect(ui.login.errorMessage).toContainText(/invalid|password/iu);
      await expect(page).toHaveURL(/#\/login$/u);
    },
  );

  test(
    "Запрет регистрации с уже занятыми данными",
    { tag: "@negative" },
    async ({ setupApi, ui, userBuilder }) => {
      const user = userBuilder().build();
      const duplicate = userBuilder()
        .withUsername(user.username)
        .withEmail(user.email)
        .withPassword(user.password)
        .build();

      await setupApi.auth.register(user);
      await ui.register.registerExpectingError(duplicate);

      await expect(ui.register.errorMessage).toContainText(
        /already|exist|taken/iu,
      );
      await expect(ui.register.signUpButton).toBeVisible();
    },
  );

  test(
    "Изменение навигации после выхода из профиля",
    { tag: "@positive" },
    async ({ setupApi, ui, userBuilder }) => {
      const user = userBuilder().build();

      await setupApi.auth.register(user);
      await ui.login.login(user);
      await expect(ui.navbar.userMenu(user.username)).toBeVisible();
      await ui.navbar.logout(user.username);

      await expect(ui.navbar.loginLink()).toBeVisible();
      await expect(ui.navbar.signUpLink()).toBeVisible();
      await expect(ui.navbar.userMenu(user.username)).toBeHidden();
    },
  );
});
