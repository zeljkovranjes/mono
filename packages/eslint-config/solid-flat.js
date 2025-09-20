import pluginSolid from "eslint-plugin-solid";

/**
 * Convert eslint-plugin-solid's legacy configs into ESLint 9 flat config objects.
 *
 * @param {"recommended" | "typescript"} preset
 * @returns {import("eslint").Linter.Config}
 */
export function solidFlatConfig(preset = "recommended") {
  const legacy = pluginSolid.configs[preset] ?? {};

  return {
    plugins: {
      solid: pluginSolid,
    },
    rules: {
      ...(legacy.rules ?? {}),
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
  };
}
