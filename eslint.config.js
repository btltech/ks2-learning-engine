import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // Existing Firestore/Cloudflare JSON boundaries are intentionally dynamic;
      // runtime validation happens before values enter application state.
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'public/**',
      'firebase-functions/lib/**',
      'firebase-functions/node_modules/**',
      'scripts/**',
      '**/*.test.*',
      'test/**',
      '*.mjs',
      'test-*.mjs',
      'scripts/*.mjs',
    ],
  }
);
