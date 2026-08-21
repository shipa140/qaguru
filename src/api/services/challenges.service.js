import { test } from "@playwright/test";

import { CHALLENGER_HEADER } from "../constants.js";
import { apiResult } from "./api-result.js";

export class ChallengesService {
  constructor(request) {
    this.request = request;
  }

  async list(challengerId) {
    return test.step("GET /api/challenges — получение прогресса", async () => {
      const response = await this.request.get("challenges", {
        headers: { [CHALLENGER_HEADER]: challengerId },
      });

      return apiResult(response);
    });
  }
}
