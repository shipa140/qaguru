import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";

const EMPTY_COUNTS = Object.freeze({
  passed: 0,
  failed: 0,
  skipped: 0,
  flaky: 0,
  timedOut: 0,
});

function finalResultFor(test) {
  return test.results.at(-1);
}

function resultBucket(test) {
  const outcome = test.outcome();
  const finalResult = finalResultFor(test);

  if (
    outcome === "skipped" ||
    finalResult?.status === "skipped" ||
    !finalResult
  ) {
    return "skipped";
  }

  if (outcome === "flaky") {
    return "flaky";
  }

  if (outcome === "unexpected") {
    return finalResult.status === "timedOut" ? "timedOut" : "failed";
  }

  return "passed";
}

function normalizedRunStatus(status) {
  return status === "timedout" ? "timedOut" : status;
}

export default class RunSummaryReporter {
  constructor(options = {}) {
    this.outputFile = resolve(
      process.cwd(),
      options.outputFile ?? "test-results/run-summary.json",
    );
    this.tests = [];
  }

  onBegin(_config, suite) {
    this.tests = suite.allTests();
  }

  onEnd(runResult) {
    const counts = { ...EMPTY_COUNTS };
    const failures = [];

    for (const test of this.tests) {
      const bucket = resultBucket(test);
      counts[bucket] += 1;

      if (bucket === "failed" || bucket === "timedOut") {
        failures.push({
          file: relative(process.cwd(), test.location.file),
          title: test.titlePath().join(" › "),
        });
      }
    }

    const summary = {
      ...counts,
      total: this.tests.length,
      duration: Math.max(0, Math.round(runResult.duration)),
      failures,
      status: normalizedRunStatus(runResult.status),
    };

    mkdirSync(dirname(this.outputFile), { recursive: true });
    writeFileSync(
      this.outputFile,
      `${JSON.stringify(summary, null, 2)}\n`,
      "utf8",
    );
  }

  printsToStdio() {
    return false;
  }
}
