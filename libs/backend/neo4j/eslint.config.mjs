const baseConfig = require('../../eslint.config.mjs');

module.exports = [
  ...baseConfig,
  {
    files: ['**/*.ts'],
    rules: {},
  },
];
