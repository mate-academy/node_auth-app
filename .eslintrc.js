module.exports = {
  extends: '@mate-academy/eslint-config',
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      experimentalObjectRestSpread: true,
    },
  },
  env: {
    jest: true,
    node: true,
  },
  rules: {
    'no-proto': 0,
    'no-console': 0,
    'indent': 'off',
    '@typescript-eslint/no-shadow': ['error'],
    'indent': 'off',
    '@typescript-eslint/indent': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn'],
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': ['error'],
    'no-return-await': 'off',
  },
  plugins: ['jest', '@typescript-eslint']
};
