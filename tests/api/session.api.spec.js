import { CHALLENGER_HEADER, expect, test } from "../../src/index.js";

test.describe(
  "API: управление сессией и прогрессом",
  { tag: ["@api", "@session"] },
  () => {
    test(
      "Создание новой сессии и получение идентификатора X-CHALLENGER",
      { tag: ["@post", "@positive"] },
      async ({ app }) => {
        const result = await app.session.create();
        const challengerId = result.headers[CHALLENGER_HEADER];

        expect(result.status).toBe(201);
        expect(challengerId).toMatch(/^[0-9a-f-]{36}$/i);
        expect(result.headers.location).toContain("/gui/challenges/");
      },
    );

    test(
      "Отображение выполненных заданий в прогрессе сессии",
      { tag: ["@get", "@positive"] },
      async ({ app, challenger }) => {
        const result = await app.challenges.list(challenger);

        expect(result.status).toBe(200);
        expect(result.body.challenges.length).toBeGreaterThan(50);
        expect(result.body.challenges).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name: "POST /api/challenger (201)",
              status: true,
            }),
            expect.objectContaining({
              name: "GET /api/challenges (200)",
              status: true,
            }),
          ]),
        );
      },
    );
  },
);
