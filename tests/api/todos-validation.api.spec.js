import { CONTENT_TYPE } from "../../src/api/index.js";
import { expect, test } from "../../src/fixtures/index.js";

test.describe("API: валидация и протокол", { tag: ["@api", "@todos"] }, () => {
  test(
    "Запрет создания задачи с невалидным статусом выполнения",
    { tag: ["@post", "@negative"] },
    async ({ app, challenger, todoBuilder }) => {
      const invalidTodo = todoBuilder().withRawDoneStatus("true").build();

      const result = await app.todos.create(challenger, invalidTodo);

      expect(result.status).toBe(422);
      expect(result.body.errorMessages).toContain(
        "Failed Validation: doneStatus should be BOOLEAN but was STRING",
      );
    },
  );

  test(
    "Запрет создания задачи с заголовком длиннее 50 символов",
    { tag: ["@post", "@negative"] },
    async ({ app, challenger, todoBuilder }) => {
      const invalidTodo = todoBuilder().withTitleOfLength(51).build();

      const result = await app.todos.create(challenger, invalidTodo);

      expect(result.status).toBe(422);
      expect(result.body.errorMessages).toContain(
        "Failed Validation: Maximum allowable length exceeded for title - maximum allowed is 50",
      );
    },
  );

  test(
    "Запрет создания задачи с неподдерживаемым Content-Type",
    { tag: ["@post", "@negative", "@content"] },
    async ({ app, challenger, todoBuilder }) => {
      const todo = todoBuilder().build();

      const result = await app.todos.create(challenger, JSON.stringify(todo), {
        contentType: CONTENT_TYPE.plainText,
      });

      expect(result.status).toBe(415);
      expect(result.body.errorMessages).toContain(
        "Unsupported Content Type - text/plain",
      );
    },
  );

  test(
    "Ответ 406 при запросе неподдерживаемого формата",
    { tag: ["@get", "@negative", "@content"] },
    async ({ app, challenger }) => {
      const result = await app.todos.list(challenger, {
        accept: "application/gzip",
      });

      expect(result.status).toBe(406);
      expect(result.body.errorMessages).toContain("Unrecognised Accept Type");
    },
  );

  test(
    "Получение списка разрешённых методов для ресурса задач",
    { tag: ["@options", "@positive"] },
    async ({ app, challenger }) => {
      const result = await app.todos.options(challenger);

      expect(result.status).toBe(200);
      expect(result.headers.allow).toBe("OPTIONS, GET, HEAD, POST, QUERY, PUT");
    },
  );
});
