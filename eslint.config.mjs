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
    // X-search-api is a CJS Node.js project — not subject to Next.js ESLint rules
    "X-search-api/**",
  ]),
  {
    rules: {
      // react-hooks v7 experimental React Compiler rules — disabled because they flag
      // valid async-setState-in-effect and render-time Date.now() patterns used throughout.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
    },
  },
]);

export default eslintConfig;
