module.exports = {
  extends: '@mate-academy/eslint-config',
  env: {
    browser: true,
    jest: true,
    node: true,
  },
  rules: {
    indent: 'off',
    'max-len': 'off',
    'no-console': 'off',
    'no-proto': 0,
    'no-shadow': 'off',
    'object-curly-newline': 'off',
    'function-paren-newline': 'off',
  },
  plugins: ['jest'],
};
