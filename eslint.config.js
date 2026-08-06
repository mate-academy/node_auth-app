import { FlatCompat } from '@eslint/eslintrc';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  resolvePluginsRelativeTo: path.resolve(
    __dirname,
    'node_modules/@mate-academy/eslint-config',
  ),
});

const baseConfigs = compat
  .extends('@mate-academy/eslint-config')
  .map((config) => {
    if (config.languageOptions && config.languageOptions.parser) {
      const { parser, ...restLanguageOptions } = config.languageOptions;
      return {
        ...config,
        languageOptions: restLanguageOptions,
      };
    }
    return config;
  });

export default [
  ...baseConfigs,
  {
    rules: {
      'no-proto': 0,
      'node/no-deprecated-api': 0,
    },
  },
];
