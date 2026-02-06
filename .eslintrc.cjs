module.exports = {
  extends: '@mate-academy/eslint-config',
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  env: {
    jest: true,
  },
  rules: {
    'no-proto': 0,
  },
  plugins: ['jest', '@typescript-eslint'],
};
