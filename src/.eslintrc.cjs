module.exports = {
  extends: ['@mate-academy/eslint-config'],

  env: {
    node: true,
    es2022: true,
    jest: true,
  },

  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },

  plugins: ['jest'],

  rules: {
    'no-proto': 0,
  },

  ignorePatterns: ['node_modules/',]
};
