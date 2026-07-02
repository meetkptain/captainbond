import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "ui-ux-pro-max-skill/**",
    // Build outputs
    ".vercel/**",
    "playwright-report/**",
    "test-results/**",
    "archive_koze/**",
    "archive_old_stack/**",
  ]),
]);

export default eslintConfig;
