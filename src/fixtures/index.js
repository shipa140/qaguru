import { expect } from "@playwright/test";

import {
  ArticleBuilder,
  CommentBuilder,
  TodoBuilder,
  UserBuilder,
} from "../builders/index.js";
import { App as UiApp } from "../pages/index.js";
import { RealWorldApi } from "../support/realworld/index.js";
import { test as appTest } from "./app.fixture.js";
import { TestResourceRegistry } from "./test-resource-registry.js";

export const test = appTest.extend({
  setupApi: async ({ request }, use) => {
    await use(new RealWorldApi(request));
  },

  resources: async ({ setupApi }, use) => {
    const resources = new TestResourceRegistry();

    await use(resources);
    await resources.cleanup(setupApi);
  },

  ui: async ({ page }, use) => {
    await use(new UiApp(page));
  },

  userBuilder: async ({}, use) => {
    await use(() => new UserBuilder());
  },

  articleBuilder: async ({}, use) => {
    await use(() => new ArticleBuilder());
  },

  commentBuilder: async ({}, use) => {
    await use(() => new CommentBuilder());
  },

  todoBuilder: async ({}, use) => {
    await use(() => new TodoBuilder());
  },
});

export { expect };
