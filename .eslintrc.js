module.exports = {
  extends: '@mate-academy/eslint-config',

  env: {
    node: true,
    jest: true,
    es2022: true,
  },

  parser: '@typescript-eslint/parser',

  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'script',
  },

  plugins: [
    'jest',
    '@typescript-eslint',
  ],

  extends: [
    '@mate-academy/eslint-config',
    'plugin:@typescript-eslint/recommended',
  ],

  rules: {
    'no-proto': 0,
    'no-undef': 'off',
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'error',
  },
};
