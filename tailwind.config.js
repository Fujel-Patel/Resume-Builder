// Tailwind CSS configuration for Next.js.
// Keep this file in native ESM so it matches the package.json module type.

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  // Safelist common dynamic classes used in components so Tailwind doesn't purge them in dev
  safelist: [
    'font-bold',
    'text-white',
    'bg-white',
    'bg-indigo-600',
    'border-indigo-600',
    'border-gray-300',
    'text-gray-600',
    'text-gray-700',
    'text-gray-800',
    'text-2xl',
    'text-xl',
    'mb-4',
    'h-0.5',
  ],
  plugins: [],
};

export default config;
