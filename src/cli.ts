import { generateSVG } from "./svg";
import * as fs from "fs";
import * as path from "path";

function getInput(name: string, fallback?: string) {
  const envName = `INPUT_${name.replace(/-/g, "_").toUpperCase()}`;
  return process.env[envName] || fallback;
}

interface ParsedArgs {
  username?: string;
  token?: string;
  dark?: boolean;
  enableEmptyDays?: boolean;
}

function parseArgs(argv: string[]): ParsedArgs {
  const parsed: ParsedArgs = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--username" && i + 1 < argv.length) {
      parsed.username = argv[++i];
    } else if (arg === "--token" && i + 1 < argv.length) {
      parsed.token = argv[++i];
    } else if (arg === "--dark") {
      parsed.dark = true;
    } else if (arg === "--enable-empty-days") {
      parsed.enableEmptyDays = true;
    }
  }
  return parsed;
}

const cliArgs = parseArgs(process.argv.slice(2));

const options = {
  username:
    cliArgs.username ||
    getInput("GITHUB_USERNAME", process.env.GITHUB_USERNAME),
  token: cliArgs.token || getInput("GITHUB_TOKEN", process.env.GITHUB_TOKEN),
  dark: !!cliArgs.dark,
  enableEmptyDays:
    typeof cliArgs.enableEmptyDays !== "undefined"
      ? cliArgs.enableEmptyDays
      : !!getInput("ENABLE_EMPTY_DAYS"),
};

if (!options.username || !options.token) {
  console.error(
    "Error: Both a GitHub username and token are required.\n" +
      "Provide via --username/--token or set GITHUB_USERNAME and GITHUB_TOKEN as environment variables.\n" +
      "Or use in GitHub Actions with 'github_username' and 'github_token' inputs.",
  );
  process.exit(1);
}

const outDir = path.join(process.cwd(), "output");
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const ignoreEmptyDays = !options.enableEmptyDays;
const isGitHubActions = process.env.GITHUB_ACTIONS === "true";

if (isGitHubActions) {
  const variants = [
    { darkMode: false, name: "light" },
    { darkMode: true, name: "dark" },
  ];

  Promise.all(
    variants.map((variant) =>
      generateSVG(options.username!, options.token!, {
        darkMode: variant.darkMode,
        ignoreEmptyDays: ignoreEmptyDays,
      }).then((svg) => {
        const outputFile = path.join(outDir, `${variant.name}.svg`);
        fs.writeFileSync(outputFile, svg);
        console.log(`SVG generated: ${outputFile}`);
      }),
    ),
  ).catch((err) => {
    console.error("Failed to generate SVG(s):", err);
    process.exit(1);
  });
} else {
  const darkMode = !!options.dark;
  const outputFile = path.join(outDir, `${darkMode ? "dark" : "light"}.svg`);
  generateSVG(options.username!, options.token!, {
    darkMode: darkMode,
    ignoreEmptyDays: ignoreEmptyDays,
  })
    .then((svg) => {
      fs.writeFileSync(outputFile, svg);
      console.log(`SVG generated: ${outputFile}`);
    })
    .catch((err) => {
      console.error("Failed to generate SVG:", err);
      process.exit(1);
    });
}
