import { readFile } from "node:fs/promises";

const TELEGRAM_API_ORIGIN = "https://api.telegram.org";
const DEFAULT_TIMEOUT_MS = 10_000;
const SUMMARY_COUNTERS = ["passed", "failed", "skipped", "flaky", "timedOut"];

const STATUS_LABELS = Object.freeze({
  passed: { icon: "✅", label: "тесты прошли" },
  success: { icon: "✅", label: "тесты прошли" },
  failed: { icon: "❌", label: "прогон завершился с ошибкой" },
  failure: { icon: "❌", label: "прогон завершился с ошибкой" },
  timedOut: { icon: "⏱️", label: "прогон превысил таймаут" },
  interrupted: { icon: "⚠️", label: "прогон прерван" },
  cancelled: { icon: "⚠️", label: "прогон отменён" },
  missingResults: { icon: "⚠️", label: "сводка тестов не сформирована" },
});

function requireNonEmpty(value, name) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${name} is required`);
  }

  return value.trim();
}

function normalizeCounter(value, name) {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`Invalid ${name} value in run summary`);
  }

  return value;
}

function normalizeStatus(status) {
  return requireNonEmpty(status, "run summary status");
}

function normalizeMessageThreadId(value) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const threadId = Number(value);
  if (!Number.isInteger(threadId) || threadId <= 0) {
    throw new Error("TELEGRAM_MESSAGE_THREAD_ID must be a positive integer");
  }

  return threadId;
}

function normalizeSummary(summary) {
  if (!summary || typeof summary !== "object" || Array.isArray(summary)) {
    throw new Error("Run summary must be a JSON object");
  }

  const counters = Object.fromEntries(
    SUMMARY_COUNTERS.map((name) => [
      name,
      normalizeCounter(summary[name], name),
    ]),
  );
  const total = normalizeCounter(summary.total, "total");

  if (!Number.isFinite(summary.duration) || summary.duration < 0) {
    throw new Error("Invalid duration value in run summary");
  }

  return {
    ...counters,
    total,
    duration: Math.round(summary.duration),
    status: normalizeStatus(summary.status),
  };
}

function humanDuration(durationMs) {
  const totalSeconds = Math.max(0, Math.round(durationMs / 1_000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return minutes > 0 ? `${minutes} мин ${seconds} с` : `${seconds} с`;
}

function githubRunUrl(environment) {
  const serverUrl = environment.GITHUB_SERVER_URL;
  const repository = environment.GITHUB_REPOSITORY;
  const runId = environment.GITHUB_RUN_ID;

  if (!serverUrl || !repository || !runId) {
    return undefined;
  }

  return `${serverUrl}/${repository}/actions/runs/${runId}`;
}

function linkLines(environment) {
  const links = [];
  const runUrl = githubRunUrl(environment);

  if (runUrl) {
    links.push(`GitHub Actions: ${runUrl}`);
  }

  if (environment.ALLURE_LAUNCH_URL) {
    links.push(`Allure TestOps: ${environment.ALLURE_LAUNCH_URL}`);
  }

  return links;
}

export async function readRunSummary(filePath) {
  const rawSummary = await readFile(filePath, "utf8");
  return normalizeSummary(JSON.parse(rawSummary));
}

export function createFallbackSummary(ciStatus) {
  const statusMap = {
    success: "missingResults",
    failure: "failed",
    cancelled: "interrupted",
  };

  return {
    passed: 0,
    failed: 0,
    skipped: 0,
    flaky: 0,
    timedOut: 0,
    total: 0,
    duration: 0,
    status: statusMap[ciStatus] ?? ciStatus,
  };
}

export function formatTelegramMessage(summary, environment = process.env) {
  const normalized = normalizeSummary(summary);
  const presentation = STATUS_LABELS[normalized.status] ?? {
    icon: "ℹ️",
    label: normalized.status,
  };
  const lines = [
    `${presentation.icon} QA.GURU Playwright: ${presentation.label}`,
    "",
    `Всего: ${normalized.total}`,
    `Успешно: ${normalized.passed}`,
    `С ошибкой: ${normalized.failed}`,
    `Пропущено: ${normalized.skipped}`,
    `Нестабильные: ${normalized.flaky}`,
    `По таймауту: ${normalized.timedOut}`,
    `Длительность: ${humanDuration(normalized.duration)}`,
  ];
  const links = linkLines(environment);

  if (links.length > 0) {
    lines.push("", ...links);
  }

  return lines.join("\n");
}

export async function sendTelegramNotification({
  token,
  chatId,
  messageThreadId,
  message,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  fetchImplementation = fetch,
}) {
  const botToken = requireNonEmpty(token, "TELEGRAM_BOT_TOKEN");
  const destination = requireNonEmpty(chatId, "TELEGRAM_CHAT_ID");
  const text = requireNonEmpty(message, "Telegram message");
  const threadId = normalizeMessageThreadId(messageThreadId);

  if (!Number.isInteger(timeoutMs) || timeoutMs <= 0) {
    throw new Error("Telegram timeout must be a positive integer");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const payload = {
    chat_id: destination,
    text,
    disable_web_page_preview: true,
  };

  if (threadId !== undefined) {
    payload.message_thread_id = threadId;
  }

  try {
    const response = await fetchImplementation(
      `${TELEGRAM_API_ORIGIN}/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      },
    );

    let responseBody;
    try {
      responseBody = await response.json();
    } catch {
      throw new Error(
        `Telegram API returned invalid JSON (HTTP ${response.status})`,
      );
    }

    if (!response.ok || responseBody?.ok !== true) {
      throw new Error(
        `Telegram API rejected notification (HTTP ${response.status})`,
      );
    }

    return responseBody.result;
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error(`Telegram request timed out after ${timeoutMs} ms`);
    }

    if (error instanceof Error && error.message.startsWith("Telegram API")) {
      throw error;
    }

    throw new Error("Telegram request failed");
  } finally {
    clearTimeout(timeout);
  }
}

export function telegramOptionsFromEnv(environment = process.env) {
  return {
    token: environment.TELEGRAM_BOT_TOKEN,
    chatId: environment.TELEGRAM_CHAT_ID,
    messageThreadId: environment.TELEGRAM_MESSAGE_THREAD_ID,
  };
}
