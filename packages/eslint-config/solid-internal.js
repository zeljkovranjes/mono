import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";
import globals from "globals";
import { config as baseConfig } from "./base.js";
import { solidFlatConfig } from "./solid-flat.js"; // <- helper we made

/**
 * A custom ESLint configuration for libraries that use SolidStart.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const config = [
  ...baseConfig,
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  solidFlatConfig("typescript"),
  {
    languageOptions: {
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
  },
];
