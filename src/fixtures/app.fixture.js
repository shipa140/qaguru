import { test as base } from "@playwright/test";

import { Api, CHALLENGER_HEADER } from "../api/index.js";

export const test = base.extend({
  app: async ({ request }, use) => {
    await use(new Api(request));
  },

  challenger: async ({ app }, use) => {
    const session = await app.session.create();

    await use(session.headers[CHALLENGER_HEADER]);
  },
});
