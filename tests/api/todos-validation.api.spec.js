import { CONTENT_TYPE, expect, test } from "../../src/index.js";

test.describe(
  "API: проверка ошибок и HTTP-протокола",
  { tag: ["@api", "@todos"] },
  () => {
    test(
      "Ошибка 422 при создании задачи со строковым статусом выполнения",
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
      "Ошибка 422 при создании задачи с заголовком длиннее 50 символов",
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
      "Ошибка 415 при создании задачи с неподдерживаемым Content-Type",
      { tag: ["@post", "@negative", "@content"] },
      async ({ app, challenger, todoBuilder }) => {
        const todo = todoBuilder().build();

        const result = await app.todos.create(
          challenger,
          JSON.stringify(todo),
          {
            contentType: CONTENT_TYPE.plainText,
          },
        );

        expect(result.status).toBe(415);
        expect(result.body.errorMessages).toContain(
          "Unsupported Content Type - text/plain",
        );
      },
    );

    test(
      "Ошибка 406 при запросе ответа в неподдерживаемом формате",
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
      "Получение списка разрешённых HTTP-методов для ресурса задач",
      { tag: ["@options", "@positive"] },
      async ({ app, challenger }) => {
        const result = await app.todos.options(challenger);

        expect(result.status).toBe(200);
        expect(result.headers.allow).toBe(
          "OPTIONS, GET, HEAD, POST, QUERY, PUT",
        );
      },
    );
  },
);
