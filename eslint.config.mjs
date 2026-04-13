import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  ...compat.extends("next/core-web-vitals"),

  {
    rules: {
      // 🔴 CRITICAL: catch undefined variables
      "no-undef": "error",

      // warn unused stuff
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],

      // better dev hygiene
      "no-console": "warn",

      // React hooks safety
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];