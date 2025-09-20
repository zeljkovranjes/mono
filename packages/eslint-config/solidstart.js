import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";
import globals from "globals";
import pluginSolid from "eslint-plugin-solid";
import { config as baseConfig } from "./base.js";

/**
 * A custom ESLint configuration for libraries that use SolidStart.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const solidStartConfig = [
  ...baseConfig,
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    plugins: {
      solid: pluginSolid,
    },
    rules: {
      ...pluginSolid.configs["recommended"].rules,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.serviceworker,
      },
    },
  },
];
