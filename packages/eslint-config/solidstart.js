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
