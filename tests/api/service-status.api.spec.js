import { expect, test } from "../../src/index.js";

test.describe(
  "API: доступность сервиса",
  { tag: ["@api", "@heartbeat"] },
  () => {
    test(
      "Ответ 204 подтверждает доступность сервиса через heartbeat",
      { tag: ["@get", "@positive"] },
      async ({ app, challenger }) => {
        const result = await app.heartbeat.get(challenger);

        expect(result.status).toBe(204);
        expect(result.body).toBeNull();
      },
    );
  },
);
