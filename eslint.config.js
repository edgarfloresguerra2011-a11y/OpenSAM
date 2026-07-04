/**
 * ESLint flat config — modern (ESLint 9+) style.
 * Run: `npm run lint`
 */
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import jsxRuntime from 'eslint-plugin-react/configs/jsx-runtime.js'
import globals from 'globals'

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'node_modules', 'supabase/functions'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-restricted-globals': [
        'error',
        {
          name: 'VITE_GEMINI_API_KEY',
          message: 'Use the analyze-opportunity Edge Function instead.',
        },
        {
          name: 'VITE_SAM_GOV_API_KEY',
          message: 'Use the opportunities-search Edge Function instead.',
        },
      ],
    },
  },
  {
    // Allow JSX runtime import pattern
    files: ['src/**/*.{ts,tsx}'],
    ...jsxRuntime,
  },
)
