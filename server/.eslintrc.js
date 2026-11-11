module.exports = {
  extends: '@mate-academy/eslint-config',
  env: {
    jest: true,
  },
  rules: {
    'no-proto': 0,
  },
  plugins: ['jest'],

  ignorePatterns: ['src/generated/**', 'dist/**'],

  overrides: [
    {
      files: ['*.ts'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: ['plugin:@typescript-eslint/recommended'],
      rules: {
        'no-undef': 'off',
        'no-unused-vars': 'off',
        'no-shadow': 'off',
        '@typescript-eslint/no-shadow': ['error', { builtinGlobals: false }],
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_' },
        ],
      },
    },
  ],
};
