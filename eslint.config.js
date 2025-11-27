import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';
import pluginQuery from '@tanstack/eslint-plugin-query';
import pluginRouter from '@tanstack/eslint-plugin-router';

const queryRules = pluginQuery.configs.recommended.rules;
const routerRules = pluginRouter.configs.recommended.rules;

export default defineConfig([
  {
    ignores: ['dist', 'routeTree.gen.ts'],
  },
  {
    files: ['src/**/*.{ts,tsx}'],

    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],

    plugins: {
      '@tanstack/query': pluginQuery,
      '@tanstack/router': pluginRouter,
    },

    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      ...queryRules,
      ...routerRules,
    },

    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        project: ['./tsconfig.app.json'],
      },
    },
  },
]);
