import { generateSVG } from "./svg";

// Get the GitHub username from command line arguments
const username = process.argv[2];

// Get the GitHub token from command line arguments or environment variable
const token = process.argv[3] || process.env.GITHUB_TOKEN;

// Get the mode (dark or light) from command line arguments or use 'light' as default
const mode = process.argv[4] || "light";

// If no token or username is provided, print usage and exit
if (!token || !username) {
  console.error(
    "Usage: node test-svg.js <github-username> <github-token> [dark|light]",
  );
  process.exit(1);
}

// Call generateSVG and handle the result or any errors
generateSVG(username, token, mode === "dark")
  .then((svg) => console.log(svg))
  .catch((err) => {
    console.error("Failed to generate SVG:", err);
    process.exit(1);
  });
