
import fs from "node:fs";
import path from "node:path";

export function parseEnv(content) {
  const variables = new Map();

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) continue;

    const normalized = trimmed.startsWith("export ")
      ? trimmed.slice(7).trim()
      : trimmed;

    const match = normalized.match(
      /^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/
    );

    if (!match) continue;

    let value = match[2].trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    } else {
      value = value.replace(/\s+#.*$/, "").trim();
    }

    variables.set(match[1], value);
  }

  return variables;
}

export function diagnose({
  envContent,
  exampleContent = null,
  envExists = true
}) {
  const issues = [];

  if (!envExists) {
    issues.push({
      code: "ENV_FILE_MISSING",
      message: ".env file was not found."
    });
  }

  const env = parseEnv(envContent ?? "");
  const example =
    exampleContent === null ? null : parseEnv(exampleContent);

  if (example) {
    for (const key of example.keys()) {
      if (!env.has(key)) {
        issues.push({
          code: "VARIABLE_MISSING",
          key,
          message: `${key} is missing from .env.`
        });
      }
    }
  }

  for (const [key, value] of env) {
    if (value.length === 0) {
      issues.push({
        code: "VARIABLE_EMPTY",
        key,
        message: `${key} has an empty value.`
      });
    }
  }

  return issues;
}

function run() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
EnvDoctor - Environment configuration checker

Usage:
  envdoctor [options]

Options:
  --dir <path>       Project directory (default: current directory)
  --env <filename>   Environment file (default: .env)
  --example <file>   Example file (default: .env.example)
  --help             Show help
`);
    return;
  }

  let directory = process.cwd();
  let envFile = ".env";
  let exampleFile = ".env.example";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--dir" && args[i + 1]) {
      directory = path.resolve(args[++i]);
    } else if (args[i] === "--env" && args[i + 1]) {
      envFile = args[++i];
    } else if (args[i] === "--example" && args[i + 1]) {
      exampleFile = args[++i];
    } else {
      console.error(`Unknown option: ${args[i]}`);
      process.exitCode = 2;
      return;
    }
  }

  const envPath = path.resolve(directory, envFile);
  const examplePath = path.resolve(directory, exampleFile);
  const envExists = fs.existsSync(envPath);
  const exampleExists = fs.existsSync(examplePath);

  const issues = diagnose({
    envContent: envExists
      ? fs.readFileSync(envPath, "utf8")
      : "",
    exampleContent: exampleExists
      ? fs.readFileSync(examplePath, "utf8")
      : null,
    envExists
  });

  console.log("\n🩺 EnvDoctor");
  console.log("============");

  if (!envExists) {
    console.log("Environment file: missing");
  } else {
    console.log("Environment file: found");
  }

  if (!exampleExists) {
    console.log("Example file: not found; comparison skipped");
  }

  if (issues.length === 0) {
    console.log("\n✅ No issues found in the supported checks.");
    return;
  }

  console.log(`\n⚠️ Found ${issues.length} issue(s):\n`);

  for (const issue of issues) {
    console.log(`- ${issue.message}`);
  }

  console.log("\nTip: keep real secrets out of Git.");
  process.exitCode = 1;
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) ===
    path.resolve(new URL(import.meta.url).pathname)
) {
  run();
}