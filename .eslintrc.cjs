module.exports = {
  extends: '@mate-academy/eslint-config',
  env: {
    node: true,
    browser: true,
    es2021: true,
    jest: true,
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'], // 👈 Adiciona o plugin do TypeScript
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-proto': 0,
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'error', // Ativa a versão para TypeScript
  },
};
