// Tailwind configuration (CommonJS) – required for Next.js to correctly process Tailwind styles.
// This file re‑exports the existing TypeScript config to keep a single source of truth.
const tsConfig = require("./tailwind.config.ts");
module.exports = tsConfig.default || tsConfig;
