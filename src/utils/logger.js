'use strict';

const log = (message) => process.stdout.write(`${message}\n`);
const logError = (...parts) => process.stderr.write(`${parts.join(' ')}\n`);

module.exports = {
  log,
  logError,
};
