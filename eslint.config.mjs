import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';
import reactHooks from 'eslint-plugin-react-hooks';

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypeScript,
  {
    plugins: { 'react-hooks': reactHooks },
    rules: {
      // `any` appears at external/runtime boundaries (parsers, API payloads).
      // Surface it as a warning instead of failing the build.
      '@typescript-eslint/no-explicit-any': 'warn',
      // The experimental purity rule flags Date.now()/Math.random() even inside
      // event handlers (not render), producing false positives. Keep as a hint.
      'react-hooks/purity': 'warn',
      // Flags the canonical "set mounted flag / read localStorage in effect"
      // hydration pattern, which is correct for client-only state. Keep as a hint.
      'react-hooks/set-state-in-effect': 'warn',
      // Misfires on server-side React-PDF rendering wrapped in try/catch.
      'react-hooks/error-boundaries': 'warn',
    },
  },
  {
    // Node-only config files and build scripts legitimately use CommonJS require.
    files: ['**/*.cjs', 'scripts/**/*.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
    ],
  },
];

export default eslintConfig;
