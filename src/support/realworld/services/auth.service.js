import { test } from "@playwright/test";

import { apiResult } from "./api-result.js";

export class AuthService {
  constructor(request) {
    this.request = request;
  }

  async register(user) {
    return test.step("POST /api/users — регистрация", async () => {
      const response = await this.request.post("/api/users", {
        data: { user },
      });

      return apiResult(response);
    });
  }

  async getCurrent(token) {
    return test.step("GET /api/user — текущий пользователь", async () => {
      const response = await this.request.get("/api/user", {
        ...(token && { headers: { Authorization: `Token ${token}` } }),
      });

      return apiResult(response);
    });
  }
}
