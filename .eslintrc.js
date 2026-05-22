module.exports = {
  extends: '@mate-academy/eslint-config',
  parser: '@typescript-eslint/parser',
  plugins: ['jest', '@typescript-eslint'],
  env: {
    jest: true,
  },
  rules: {
    'no-proto': 0,
    'no-unused-vars': 'off',
    'no-undef': 'off',
  },
};
