module.exports = {
  extends: '@mate-academy/eslint-config',
  env: {
    browser: true,
    jest: true,
    node: true,
  },
  rules: {
    'no-console': 0,
    'no-proto': 0,
    'no-shadow': 0,
  },
  plugins: ['jest'],
};
