module.exports = {
  extends: [
    '@mate-academy/eslint-config',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['jest', '@typescript-eslint'],
  env: {
    jest: true,
    node: true,
  },
  ignorePatterns: ['dist/', 'node_modules/', 'src/generated/'],
  rules: {
    'no-console': 'off',
    'no-shadow': 'off',
    indent: 'off',
    'no-proto': 0,
  },
};
