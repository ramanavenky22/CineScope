import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // This rule is great during dev, but it creates noisy warnings
      // for context/hooks patterns that are common in React apps.
      'react-refresh/only-export-components': 'off'
    }
  },
  {
    ignores: ['dist/**', 'node_modules/**']
  }
];

