import { test } from "@playwright/test";

import { apiResult } from "./api-result.js";

export class SessionService {
  constructor(request) {
    this.request = request;
  }

  async create() {
    return test.step("POST /api/challenger — создание сессии", async () => {
      const response = await this.request.post("challenger");

      return apiResult(response);
    });
  }
}
