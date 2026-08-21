import { expect, test } from "../../src/index.js";

test.describe("API: чтение задач", { tag: ["@api", "@todos"] }, () => {
  test(
    "Получение непустого списка задач с корректной структурой",
    { tag: ["@get", "@positive"] },
    async ({ app, challenger }) => {
      const result = await app.todos.list(challenger);

      expect(result.status).toBe(200);
      expect(result.body.todos.length).toBeGreaterThan(0);
      expect(result.body.todos[0]).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          title: expect.any(String),
          doneStatus: expect.any(Boolean),
          description: expect.any(String),
        }),
      );
    },
  );

  test(
    "Получение созданной задачи по её идентификатору",
    { tag: ["@get", "@positive"] },
    async ({ app, challenger, todoBuilder }) => {
      const todo = todoBuilder().withDoneStatus(true).build();
      const created = await app.todos.create(challenger, todo);

      const result = await app.todos.get(challenger, created.body.id);

      expect(result.status).toBe(200);
      expect(result.body.todos).toHaveLength(1);
      expect(result.body.todos[0]).toEqual(
        expect.objectContaining({
          id: created.body.id,
          title: todo.title,
          doneStatus: todo.doneStatus,
          description: todo.description,
        }),
      );

      await app.todos.delete(challenger, created.body.id);
    },
  );

  test(
    "Получение только выполненных задач при фильтрации по статусу",
    { tag: ["@get", "@positive"] },
    async ({ app, challenger, todoBuilder }) => {
      const completed = await app.todos.create(
        challenger,
        todoBuilder().withDoneStatus(true).build(),
      );
      const active = await app.todos.create(
        challenger,
        todoBuilder().withDoneStatus(false).build(),
      );

      const result = await app.todos.list(challenger, { doneStatus: true });

      expect(result.status).toBe(200);
      expect(result.body.todos.length).toBeGreaterThan(0);
      expect(result.body.todos.every((todo) => todo.doneStatus === true)).toBe(
        true,
      );

      await app.todos.delete(challenger, completed.body.id);
      await app.todos.delete(challenger, active.body.id);
    },
  );

  test(
    "Ответ 404 при запросе задачи с несуществующим идентификатором",
    { tag: ["@get", "@negative"] },
    async ({ app, challenger }) => {
      const result = await app.todos.get(challenger, 999_999_999);

      expect(result.status).toBe(404);
      expect(result.body.errorMessages).toContain(
        "Could not find an instance with todos/999999999",
      );
    },
  );
});
