module.exports = {
  extends: '@mate-academy/eslint-config',
  env: {
    jest: true,
  },
  ignorePatterns: ['src/views/**/*.ejs'],
  rules: {
    'no-proto': 0,
  },
  plugins: ['jest'],
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: ['plugin:@typescript-eslint/recommended'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'warn',
      },
    },
  ],
};
// this is a comment for the commit
