import { test } from "@playwright/test";

import { apiResult } from "./api-result.js";

export class CommentsService {
  constructor(request) {
    this.request = request;
  }

  async list(slug) {
    return test.step("GET /api/articles/:slug/comments — список комментариев", async () => {
      const response = await this.request.get(
        `/api/articles/${encodeURIComponent(slug)}/comments`,
      );

      return apiResult(response);
    });
  }

  async create(token, slug, comment) {
    return test.step("POST /api/articles/:slug/comments — создание комментария", async () => {
      const response = await this.request.post(
        `/api/articles/${encodeURIComponent(slug)}/comments`,
        {
          headers: { Authorization: `Token ${token}` },
          data: { comment },
        },
      );

      return apiResult(response);
    });
  }
}
