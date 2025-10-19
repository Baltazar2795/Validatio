// eslint.config.mjs — минимальный flat-config для Next.js 15
import next from 'eslint-config-next';

export default [
  ...next(),
  {
    rules: {
      // примеры необязательных ослаблений:
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
];
