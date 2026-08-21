import "dotenv/config";
import { defineConfig, devices } from "@playwright/test";

function urlFromEnv(name, fallback) {
  const value = process.env[name] ?? fallback;

  try {
    return new URL(value).toString();
  } catch {
    throw new Error(`${name} must be a valid absolute URL`);
  }
}

const uiBaseURL = urlFromEnv("UI_BASE_URL", "https://realworld.qa.guru/");
const apiBaseURL = urlFromEnv("API_BASE_URL", "https://apichallenges.com/api/");
const allureResultsDir = process.env.ALLURE_RESULTS ?? "allure-results";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  timeout: 45_000,
  expect: {
    timeout: 10_000,
  },
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  outputDir: "test-results/artifacts",
  reporter: [
    ["line"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
    [
      "allure-playwright",
      {
        resultsDir: allureResultsDir,
        // Do not export low-level fill() arguments: test accounts remain on the
        // public stand, so their generated passwords must not appear in TestOps.
        detail: false,
        suiteTitle: false,
        environmentInfo: {
          ui_base_url: uiBaseURL,
          api_base_url: apiBaseURL,
          node_version: process.version,
          platform: process.platform,
        },
      },
    ],
    [
      "./src/reporters/run-summary.reporter.js",
      { outputFile: "test-results/run-summary.json" },
    ],
  ],
  use: {
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "ui-chromium",
      testMatch: "ui/**/*.spec.js",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: uiBaseURL,
      },
    },
    {
      name: "api",
      testMatch: "api/**/*.spec.js",
      use: {
        baseURL: apiBaseURL,
      },
    },
  ],
});
