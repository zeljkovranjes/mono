import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import { config as baseConfig } from './base.js';
import { solidFlatConfig } from './solid-flat.js';

/**
 * ESLint config extensions for SolidStart apps (ESLint 9 flat config).
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const config = [
  ...baseConfig,
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  solidFlatConfig('typescript'),

  {
    languageOptions: {
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
  },

  // --- Client fences ---
  {
    files: [
      '**/src/components/**/*.{ts,tsx}',
      '**/src/routes/**/*.tsx',
      '**/entry-client.{ts,tsx}',
      '**/src/app.{ts,tsx}', // app.tsx is client
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            // forbid server imports
            '**/server/*',
            '@**/server/*',
            'packages/**/server/*',

            // forbid shared server helpers
            '**/shared/**/server',
            '**/shared/**/server.*',
          ],
        },
      ],
    },
  },

  // --- Server fences ---
  {
    files: [
      '**/src/server/**/*.{ts,tsx}',
      '**/src/routes/**/*.ts', // handlers only
      '**/entry-server.{ts,tsx}',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            // forbid client imports
            '**/components/*',
            '@**/components/*',
            'packages/**/components/*',

            // forbid shared client helpers
            '**/shared/**/client',
            '**/shared/**/client.*',
          ],
        },
      ],
    },
  },
];
