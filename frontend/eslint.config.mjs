import nextConfig from "eslint-config-next";
import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const eslintConfig = [
  { ignores: [".next/**", "next-env.d.ts"] },
  ...nextConfig,
  ...coreWebVitals,
  ...typescript,
];

export default eslintConfig;
