module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended'
  ],
  ignorePatterns: [
    'dist/',
    '.eslintrc.cjs'
  ],
  parserOptions: {
    ecmaVersion: 2023, // Changed from 'latest' to a specific version for clarity
    sourceType: 'module'
  },
  settings: {
    react: {
      version: 'detect' // Changed from '18.2' to 'detect' for automatic detection
    }
  },
  plugins: [
    'react-refresh'
  ],
  rules: {
    'react/jsx-no-target-blank': 'off',
    'no-unused-vars': [
      'warn',
      {
        varsIgnorePattern: '^React$' // Corrected syntax for ignoring variables starting with "React"
      }
    ],
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true }
    ]
  }
};
