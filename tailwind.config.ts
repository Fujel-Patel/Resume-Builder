import type { Config } from "tailwindcss";

/**
 * Tailwind CSS configuration – scans the entire src directory for class names.
 */
const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
