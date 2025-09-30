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
    ignores: ['dist/**', '.vinxi/**', '.output/**', 'src/tests/**'],
  },

  // --- Fence: prevent server imports in client code ---
  {
    files: ['**/client/**/*.{ts,tsx,js,jsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            '**/server/*',
            '../server/*',
            '../../server/*',

            '**/shared/**/server',
            '**/shared/**/server.*',
          ],
        },
      ],
    },
  },
  {
    files: ['apps/*-api/**/*.{ts,tsx,js,jsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            '**/client/*',
            '../client/*',
            '../../client/*',

            '**/shared/**/client',
            '**/shared/**/client.*',
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/tailwind.config.cjs',
      '**/postcss.config.cjs',
      '**/vite.config.cjs',
      '**/*.config.cjs',
    ],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        module: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'no-undef': 'off',
    },
  },
];
