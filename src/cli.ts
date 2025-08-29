import { generateSVG } from "./svg";
import * as fs from "fs";
import * as path from "path";
import { Command } from "commander";

// Create program
const program = new Command();
program
  .name("github-breakout-cli")
  .description("Generate a GitHub Breakout SVG")
  .option(
    "--username <github-username>",
    "GitHub username (or set GITHUB_USERNAME or INPUT_GITHUB_USERNAME env var)",
    process.env.INPUT_GITHUB_USERNAME || process.env.GITHUB_USERNAME,
  )
  .option(
    "--token <github-token>",
    "GitHub token (or set GITHUB_TOKEN or INPUT_GITHUB_TOKEN env var)",
    process.env.INPUT_GITHUB_TOKEN || process.env.GITHUB_TOKEN,
  )
  .option("--dark", "Generate dark mode SVG", false)
  .option("--enable-empty-days", "Empty days be used as bricks", false);

// Parse arguments
program.parse(process.argv);
const options = program.opts();

// Check that we have username and token
if (!options.username || !options.token) {
  console.error(
    "Error: Both a GitHub username and token are required.\n" +
      "Provide via --username/--token or set GITHUB_USERNAME and GITHUB_TOKEN as environment variables.\n" +
      "Or use in GitHub Actions with 'github_username' and 'github_token' inputs.",
  );
  process.exit(1);
}

// Create output directory
const outDir = path.join(process.cwd(), "output");
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Generate file name
const darkMode = !!options.dark;
const ignoreEmptyDays = !options.enableEmptyDays;
const outputFile = path.join(
  outDir,
  `github-breakout-${darkMode ? "dark" : "light"}.svg`,
);

// Generate SVG
generateSVG(options.username, options.token, {
  darkMode,
  ignoreEmptyDays,
})
  .then((svg) => {
    fs.writeFileSync(outputFile, svg);
    console.log(`SVG generated: ${outputFile}`);
  })
  .catch((err) => {
    console.error("Failed to generate SVG:", err);
    process.exit(1);
  });
