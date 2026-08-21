import { test } from "@playwright/test";

import { CHALLENGER_HEADER, CONTENT_TYPE } from "../constants.js";
import { apiResult } from "./api-result.js";

export class TodosService {
  constructor(request) {
    this.request = request;
  }

  async list(challengerId, { doneStatus, accept } = {}) {
    return test.step("GET /api/todos — получение списка задач", async () => {
      const response = await this.request.get("todos", {
        headers: {
          [CHALLENGER_HEADER]: challengerId,
          ...(accept && { Accept: accept }),
        },
        ...(doneStatus !== undefined && { params: { doneStatus } }),
      });

      return apiResult(response);
    });
  }

  async get(challengerId, todoId) {
    return test.step("GET /api/todos/:id — получение задачи", async () => {
      const response = await this.request.get(
        `todos/${encodeURIComponent(todoId)}`,
        { headers: { [CHALLENGER_HEADER]: challengerId } },
      );

      return apiResult(response);
    });
  }

  async create(
    challengerId,
    payload,
    { contentType = CONTENT_TYPE.json, accept } = {},
  ) {
    return test.step("POST /api/todos — создание задачи", async () => {
      const response = await this.request.post("todos", {
        headers: {
          [CHALLENGER_HEADER]: challengerId,
          "Content-Type": contentType,
          ...(accept && { Accept: accept }),
        },
        data: payload,
      });

      return apiResult(response);
    });
  }

  async update(challengerId, todoId, payload) {
    return test.step("POST /api/todos/:id — частичное изменение задачи", async () => {
      const response = await this.request.post(
        `todos/${encodeURIComponent(todoId)}`,
        {
          headers: { [CHALLENGER_HEADER]: challengerId },
          data: payload,
        },
      );

      return apiResult(response);
    });
  }

  async replace(challengerId, todoId, payload) {
    return test.step("PUT /api/todos/:id — замена задачи", async () => {
      const response = await this.request.put(
        `todos/${encodeURIComponent(todoId)}`,
        {
          headers: { [CHALLENGER_HEADER]: challengerId },
          data: payload,
        },
      );

      return apiResult(response);
    });
  }

  async delete(challengerId, todoId) {
    return test.step("DELETE /api/todos/:id — удаление задачи", async () => {
      const response = await this.request.delete(
        `todos/${encodeURIComponent(todoId)}`,
        { headers: { [CHALLENGER_HEADER]: challengerId } },
      );

      return apiResult(response);
    });
  }

  async options(challengerId) {
    return test.step("OPTIONS /api/todos — получение разрешённых методов", async () => {
      const response = await this.request.fetch("todos", {
        method: "OPTIONS",
        headers: { [CHALLENGER_HEADER]: challengerId },
      });

      return apiResult(response);
    });
  }
}
