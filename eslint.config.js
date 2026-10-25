export default [
  { ignores: ['dist/**', 'node_modules/**', 'public/**', 'work/**'] },
  {
    files: ['src/**/*.jsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { window: 'readonly', document: 'readonly', sessionStorage: 'readonly', FileReader: 'readonly' }
    },
    rules: { 'no-unused-vars': 'off' }
  },
  {
    files: ['server/**/*.js', 'vite.config.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: {
        console: 'readonly', process: 'readonly', Buffer: 'readonly', URL: 'readonly',
        fetch: 'readonly', FormData: 'readonly', URLSearchParams: 'readonly',
        window: 'readonly', document: 'readonly', sessionStorage: 'readonly',
        FileReader: 'readonly', Date: 'readonly', Math: 'readonly', String: 'readonly',
        JSON: 'readonly', Promise: 'readonly', Error: 'readonly', Object: 'readonly',
        Array: 'readonly', Number: 'readonly', Boolean: 'readonly'
      }
    },
    rules: { 'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }] }
  }
];
