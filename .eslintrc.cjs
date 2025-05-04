require.resolve('eslint-plugin-unused-imports');

module.exports = {
  root: true,
  env: {
    node: true,
    es2020: true,
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import', 'unused-imports'],
  extends: [
    'eslint:recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  ignorePatterns: ['dist/', 'coverage/', 'node_modules/'],
  rules: {
    'unused-imports/no-unused-imports': 'error',
    'import/order': [
      'warn',
      {
        alphabetize: { order: 'asc', caseInsensitive: true },
        'newlines-between': 'always',
      },
    ],
  },
};
