module.exports = {
  extends: '@mate-academy/eslint-config',
  env: { jest: true },
  rules: { 'no-proto': 0 },
  plugins: ['jest'],
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
};
