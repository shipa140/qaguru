try {
  await import("dotenv/config");
} catch (error) {
  if (error?.code !== "ERR_MODULE_NOT_FOUND") {
    throw error;
  }
}

import {
  createFallbackSummary,
  formatTelegramMessage,
  readRunSummary,
  sendTelegramNotification,
  telegramOptionsFromEnv,
} from "./index.js";

const summaryPath = process.argv[2] ?? "test-results/run-summary.json";

function safeErrorMessage(error) {
  const original = error instanceof Error ? error.message : "Unknown error";
  const secrets = [
    process.env.TELEGRAM_BOT_TOKEN,
    process.env.TELEGRAM_CHAT_ID,
  ].filter(Boolean);

  return secrets.reduce(
    (message, secret) => message.replaceAll(secret, "[REDACTED]"),
    original,
  );
}

async function summaryForNotification() {
  try {
    return await readRunSummary(summaryPath);
  } catch (error) {
    if (error?.code === "ENOENT" && process.env.CI_JOB_STATUS) {
      return createFallbackSummary(process.env.CI_JOB_STATUS);
    }

    throw error;
  }
}

async function main() {
  const summary = await summaryForNotification();
  const message = formatTelegramMessage(summary);

  await sendTelegramNotification({
    ...telegramOptionsFromEnv(),
    message,
  });

  console.log("Telegram notification sent.");
}

main().catch((error) => {
  console.error(`Telegram notification failed: ${safeErrorMessage(error)}`);
  process.exitCode = 1;
});
