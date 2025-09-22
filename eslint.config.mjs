// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      // dùng auth tạm thời để vậy
      '@typescript-eslint/no-unsafe-assignment': 'off', // cho phép gán any
      '@typescript-eslint/no-unsafe-return': 'off', // cho phép return any
      '@typescript-eslint/no-unsafe-member-access': 'off', // cho phép truy cập any
      // dùng auth tạm thời để vậy
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/require-await': 'off',
      // '@typescript-eslint/no-unsafe-assignment': 'warn',
    },
  },
);