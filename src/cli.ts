import { generateSVG } from "./svg";
import * as fs from "fs";
import * as path from "path";
import { Command } from "commander";

// Helper to get input from environment variables (for GitHub Actions compatibility)
function getInput(name: string, fallback?: string) {
  // GitHub Actions sets INPUT_<name> (uppercase, underscores)
  const envName = `INPUT_${name.replace(/-/g, "_").toUpperCase()}`;
  return process.env[envName] || fallback;
}

// Create program
const program = new Command();
program
  .name("github-breakout-cli")
  .description("Generate a GitHub Breakout SVG")
  .option(
    "--username <github-username>",
    "GitHub username (or set GITHUB_USERNAME or INPUT_GITHUB_USERNAME env var)",
    getInput("GITHUB_USERNAME", process.env.GITHUB_USERNAME),
  )
  .option(
    "--token <github-token>",
    "GitHub token (or set GITHUB_TOKEN or INPUT_GITHUB_TOKEN env var)",
    getInput("GITHUB_TOKEN", process.env.GITHUB_TOKEN),
  )
  .option("--dark", "Generate dark mode SVG", false)
  .option(
    "--enable-empty-days",
    "Empty days be used as bricks",
    !!getInput("ENABLE_EMPTY_DAYS"),
  );

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

// Set empty days option
const ignoreEmptyDays = !options.enableEmptyDays;

// Behavior: If running in GitHub Actions, always generate both light and dark SVGs.
// Otherwise, generate the single requested mode (light by default, dark if --dark is passed).
const isGitHubActions = process.env.GITHUB_ACTIONS === "true";

if (isGitHubActions) {
  // Generate both light and dark SVGs for GitHub Actions
  const variants = [
    { darkMode: false, name: "light" },
    { darkMode: true, name: "dark" },
  ];

  Promise.all(
    variants.map(({ darkMode, name }) =>
      generateSVG(options.username, options.token, {
        darkMode,
        ignoreEmptyDays,
      }).then((svg) => {
        const outputFile = path.join(outDir, `${name}.svg`);
        fs.writeFileSync(outputFile, svg);
        console.log(`SVG generated: ${outputFile}`);
      }),
    ),
  ).catch((err) => {
    console.error("Failed to generate SVG(s):", err);
    process.exit(1);
  });
} else {
  // Generate a single SVG (default: light, or dark if --dark)
  const darkMode = !!options.dark;
  const outputFile = path.join(outDir, `${darkMode ? "dark" : "light"}.svg`);
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
}
