import { test } from "@playwright/test";

import { apiResult } from "./api-result.js";

export class ArticlesService {
  constructor(request) {
    this.request = request;
  }

  async get(slug) {
    return test.step("GET /api/articles/:slug — статья", async () => {
      const response = await this.request.get(
        `/api/articles/${encodeURIComponent(slug)}`,
      );

      return apiResult(response);
    });
  }

  async create(token, article) {
    return test.step("POST /api/articles — создание статьи", async () => {
      const response = await this.request.post("/api/articles", {
        ...(token && { headers: { Authorization: `Token ${token}` } }),
        data: { article },
      });

      return apiResult(response);
    });
  }

  async delete(token, slug) {
    return test.step("DELETE /api/articles/:slug — удаление статьи", async () => {
      const response = await this.request.delete(
        `/api/articles/${encodeURIComponent(slug)}`,
        {
          ...(token && { headers: { Authorization: `Token ${token}` } }),
        },
      );

      return apiResult(response);
    });
  }
}
