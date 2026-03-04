module.exports = {
  extends: [
    '@mate-academy/eslint-config',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  env: {
    jest: true,
  },
  rules: {
    'no-proto': 0,
    'no-console': 'off',
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: 'next' }],
  },
  plugins: ['jest', '@typescript-eslint'],
};
