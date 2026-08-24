'use strict';

const errorMessage = (error) =>
  error instanceof Error ? error.stack || error.message : String(error);

const logger = {
  error(error) {
    process.stderr.write(`${errorMessage(error)}\n`);
  },
  info(message) {
    process.stdout.write(`${message}\n`);
  },
};

module.exports = { logger };
