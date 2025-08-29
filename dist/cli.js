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
function getInput(name, fallback) {
    const envName = `INPUT_${name.replace(/-/g, "_").toUpperCase()}`;
    return process.env[envName] || fallback;
}
function parseArgs(argv) {
    const parsed = {};
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === "--username" && i + 1 < argv.length) {
            parsed.username = argv[++i];
        }
        else if (arg === "--token" && i + 1 < argv.length) {
            parsed.token = argv[++i];
        }
        else if (arg === "--dark") {
            parsed.dark = true;
        }
        else if (arg === "--enable-empty-days") {
            parsed.enableEmptyDays = true;
        }
    }
    return parsed;
}
const cliArgs = parseArgs(process.argv.slice(2));
const options = {
    username: cliArgs.username ||
        getInput("GITHUB_USERNAME", process.env.GITHUB_USERNAME),
    token: cliArgs.token || getInput("GITHUB_TOKEN", process.env.GITHUB_TOKEN),
    dark: !!cliArgs.dark,
    enableEmptyDays: typeof cliArgs.enableEmptyDays !== "undefined"
        ? cliArgs.enableEmptyDays
        : !!getInput("ENABLE_EMPTY_DAYS"),
};
if (!options.username || !options.token) {
    console.error("Error: Both a GitHub username and token are required.\n" +
        "Provide via --username/--token or set GITHUB_USERNAME and GITHUB_TOKEN as environment variables.\n" +
        "Or use in GitHub Actions with 'github_username' and 'github_token' inputs.");
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
    Promise.all(variants.map((variant) => (0, svg_1.generateSVG)(options.username, options.token, {
        darkMode: variant.darkMode,
        ignoreEmptyDays: ignoreEmptyDays,
    }).then((svg) => {
        const outputFile = path.join(outDir, `${variant.name}.svg`);
        fs.writeFileSync(outputFile, svg);
        console.log(`SVG generated: ${outputFile}`);
    }))).catch((err) => {
        console.error("Failed to generate SVG(s):", err);
        process.exit(1);
    });
}
else {
    const darkMode = !!options.dark;
    const outputFile = path.join(outDir, `${darkMode ? "dark" : "light"}.svg`);
    (0, svg_1.generateSVG)(options.username, options.token, {
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
