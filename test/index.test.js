
import test from "node:test";
import assert from "node:assert/strict";

import {
  parseEnv,
  diagnose
} from "../src/index.js";

test("parses environment variables", () => {
  const env = parseEnv(`
PORT=3000
API_KEY=
# comment
`);

  assert.equal(env.get("PORT"), "3000");
  assert.equal(env.get("API_KEY"), "");
});

test("detects variables missing from .env", () => {
  const issues = diagnose({
    envContent: "PORT=3000",
    exampleContent: "PORT=3000\nDATABASE_URL="
  });

  assert.equal(issues.length, 1);
  assert.equal(issues[0].code, "VARIABLE_MISSING");
  assert.equal(issues[0].key, "DATABASE_URL");
});

test("detects empty variables", () => {
  const issues = diagnose({
    envContent: "API_KEY="
  });

  assert.equal(issues.length, 1);
  assert.equal(issues[0].code, "VARIABLE_EMPTY");
});

test("detects a missing environment file", () => {
  const issues = diagnose({
    envContent: "",
    envExists: false
  });

  assert.equal(issues[0].code, "ENV_FILE_MISSING");
});
