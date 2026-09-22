module.exports = {
  extends: '@mate-academy/eslint-config',

  parser: '@typescript-eslint/parser',

  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
  },

  env: {
    node: true,
    jest: true,
  },

  plugins: ['jest'],

  rules: {
    'no-proto': 0,
    indent: 'off',
  },
};
