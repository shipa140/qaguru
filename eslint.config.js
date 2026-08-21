import js from "@eslint/js";

export default [
  {
    ignores: [
      "node_modules/**",
      "qa_run_349/**",
      "test-results/**",
      "playwright-report/**",
      "allure-results/**",
    ],
  },
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        AbortController: "readonly",
        Buffer: "readonly",
        clearTimeout: "readonly",
        console: "readonly",
        fetch: "readonly",
        process: "readonly",
        setTimeout: "readonly",
        URL: "readonly",
      },
    },
    rules: {
      "no-empty-pattern": ["error", { allowObjectPatternsAsParameters: true }],
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
];
