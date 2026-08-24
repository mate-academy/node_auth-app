module.exports = {
  extends: '@mate-academy/eslint-config',
  env: {
    jest: true,
    node: true,
  },
  rules: {
    'no-proto': 0,
  },
  overrides: [
    {
      files: ['src/public/**/*.js'],
      env: {
        browser: true,
        node: false,
      },
    },
  ],
  plugins: ['jest'],
};
