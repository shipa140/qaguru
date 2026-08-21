import { CONTENT_TYPE, expect, test } from "../../src/index.js";

test.describe(
  "API: создание, изменение и удаление задач",
  { tag: ["@api", "@todos"] },
  () => {
    test(
      "Сохранение созданной задачи и всех переданных полей",
      { tag: ["@post", "@positive"] },
      async ({ app, challenger, todoBuilder }) => {
        const todo = todoBuilder().withDoneStatus(true).build();

        const created = await app.todos.create(challenger, todo);
        const persisted = await app.todos.get(challenger, created.body.id);

        expect(created.status).toBe(201);
        expect(created.body).toEqual(expect.objectContaining(todo));
        expect(persisted.body.todos[0]).toEqual(
          expect.objectContaining({ id: created.body.id, ...todo }),
        );

        await app.todos.delete(challenger, created.body.id);
      },
    );

    test(
      "Сохранение неизменённых полей при частичном обновлении задачи",
      { tag: ["@post", "@positive"] },
      async ({ app, challenger, todoBuilder }) => {
        const todo = todoBuilder().withDoneStatus(true).build();
        const created = await app.todos.create(challenger, todo);
        const changedTitle = todoBuilder().build().title;

        const updated = await app.todos.update(challenger, created.body.id, {
          title: changedTitle,
        });
        const persisted = await app.todos.get(challenger, created.body.id);

        expect(updated.status).toBe(200);
        expect(updated.body).toEqual(
          expect.objectContaining({
            title: changedTitle,
            doneStatus: todo.doneStatus,
            description: todo.description,
          }),
        );
        expect(persisted.body.todos[0].title).toBe(changedTitle);

        await app.todos.delete(challenger, created.body.id);
      },
    );

    test(
      "Полная замена задачи с сохранением всех новых полей",
      { tag: ["@put", "@positive"] },
      async ({ app, challenger, todoBuilder }) => {
        const created = await app.todos.create(
          challenger,
          todoBuilder().build(),
        );
        const replacement = todoBuilder().withDoneStatus(true).build();

        const replaced = await app.todos.replace(
          challenger,
          created.body.id,
          replacement,
        );
        const persisted = await app.todos.get(challenger, created.body.id);

        expect(replaced.status).toBe(200);
        expect(replaced.body).toEqual(expect.objectContaining(replacement));
        expect(persisted.body.todos[0]).toEqual(
          expect.objectContaining({ id: created.body.id, ...replacement }),
        );

        await app.todos.delete(challenger, created.body.id);
      },
    );

    test(
      "Ответ 404 при запросе удалённой задачи",
      { tag: ["@delete", "@positive"] },
      async ({ app, challenger, todoBuilder }) => {
        const created = await app.todos.create(
          challenger,
          todoBuilder().build(),
        );

        const removed = await app.todos.delete(challenger, created.body.id);
        const missing = await app.todos.get(challenger, created.body.id);

        expect(removed.status).toBe(204);
        expect(missing.status).toBe(404);
      },
    );

    test(
      "Создание задачи и получение ответа в формате XML",
      { tag: ["@post", "@positive", "@content"] },
      async ({ app, challenger, todoBuilder }) => {
        const builder = todoBuilder()
          .withTitle("XML todo")
          .withDoneStatus(true)
          .withDescription("Created as XML");

        const result = await app.todos.create(challenger, builder.buildXml(), {
          contentType: CONTENT_TYPE.xml,
          accept: CONTENT_TYPE.xml,
        });

        expect(result.status).toBe(201);
        expect(result.headers["content-type"]).toContain(CONTENT_TYPE.xml);
        expect(result.body).toContain("<title>XML todo</title>");
        expect(result.body).toContain("<doneStatus>true</doneStatus>");
        expect(result.body).toContain(
          "<description>Created as XML</description>",
        );
      },
    );
  },
);
