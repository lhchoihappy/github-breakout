"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const svg_1 = require("./svg");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const commander_1 = require("commander");
// Helper to get input from environment variables (for GitHub Actions compatibility)
function getInput(name, fallback) {
    // GitHub Actions sets INPUT_<name> (uppercase, underscores)
    const envName = `INPUT_${name.replace(/-/g, "_").toUpperCase()}`;
    return process.env[envName] || fallback;
}
// Create program
const program = new commander_1.Command();
program
    .name("github-breakout-cli")
    .description("Generate a GitHub Breakout SVG")
    .option("--username <github-username>", "GitHub username (or set GITHUB_USERNAME or INPUT_GITHUB_USERNAME env var)", getInput("GITHUB_USERNAME", process.env.GITHUB_USERNAME))
    .option("--token <github-token>", "GitHub token (or set GITHUB_TOKEN or INPUT_GITHUB_TOKEN env var)", getInput("GITHUB_TOKEN", process.env.GITHUB_TOKEN))
    .option("--dark", "Generate dark mode SVG", false)
    .option("--enable-empty-days", "Empty days be used as bricks", !!getInput("ENABLE_EMPTY_DAYS"));
// Parse arguments
program.parse(process.argv);
const options = program.opts();
// Check that we have username and token
if (!options.username || !options.token) {
    console.error("Error: Both a GitHub username and token are required.\n" +
        "Provide via --username/--token or set GITHUB_USERNAME and GITHUB_TOKEN as environment variables.\n" +
        "Or use in GitHub Actions with 'github_username' and 'github_token' inputs.");
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
    Promise.all(variants.map(({ darkMode, name }) => (0, svg_1.generateSVG)(options.username, options.token, {
        darkMode,
        ignoreEmptyDays,
    }).then((svg) => {
        const outputFile = path.join(outDir, `${name}.svg`);
        fs.writeFileSync(outputFile, svg);
        console.log(`SVG generated: ${outputFile}`);
    }))).catch((err) => {
        console.error("Failed to generate SVG(s):", err);
        process.exit(1);
    });
}
else {
    // Generate a single SVG (default: light, or dark if --dark)
    const darkMode = !!options.dark;
    const outputFile = path.join(outDir, `${darkMode ? "dark" : "light"}.svg`);
    (0, svg_1.generateSVG)(options.username, options.token, {
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
