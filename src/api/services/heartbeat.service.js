import { test } from "@playwright/test";

import { CHALLENGER_HEADER } from "../constants.js";
import { apiResult } from "./api-result.js";

export class HeartbeatService {
  constructor(request) {
    this.request = request;
  }

  async get(challengerId) {
    return test.step("GET /api/heartbeat — проверка доступности", async () => {
      const response = await this.request.get("heartbeat", {
        headers: { [CHALLENGER_HEADER]: challengerId },
      });

      return apiResult(response);
    });
  }
}
