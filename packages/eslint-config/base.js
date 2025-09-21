import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import turboPlugin from 'eslint-plugin-turbo';
import tseslint from 'typescript-eslint';
import onlyWarn from 'eslint-plugin-only-warn';

/**
 * A shared ESLint configuration for the repository (ESLint 9 flat config).
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,

  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      'turbo/no-undeclared-env-vars': 'warn',
    },
  },
  {
    plugins: {
      onlyWarn,
    },
  },
  {
    ignores: ['dist/**', '.vinxi/**', '.output/**'],
  },

  // --- Universal fences ---
  {
    files: ['**/client/**/*.{ts,tsx,js,jsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: ['**/server/*', '../server/*', '../../server/*'],
        },
      ],
    },
  },
  {
    files: ['**/server/**/*.{ts,tsx,js,jsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: ['**/client/*', '../client/*', '../../client/*'],
        },
      ],
    },
  },

  // --- SolidStart fences ---
  {
    files: ['src/components/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: ['../server/*', 'src/server/*'] }],
    },
  },
  {
    files: ['src/server/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: ['../components/*', 'src/components/*'] }],
    },
  },
  {
    // Route components (.tsx) → client, forbid server imports
    files: ['src/routes/**/*.tsx'],
    rules: {
      'no-restricted-imports': ['error', { patterns: ['../server/*', 'src/server/*'] }],
    },
  },
  {
    // Route handlers (.ts) → server, forbid client imports
    files: ['src/routes/**/*.ts'],
    excludedFiles: ['src/routes/**/*.tsx'],
    rules: {
      'no-restricted-imports': ['error', { patterns: ['../components/*', 'src/components/*'] }],
    },
  },
];
