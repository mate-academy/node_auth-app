import logger from './utils/logger.js';

// Different log levels
logger.error('Error message');
logger.warn('Warning message');
logger.info('Information message');
logger.http('HTTP log message');
logger.debug('Debug message');

// With error stack traces
try {
  // some code that might throw
} catch (err) {
  logger.error('Failed to do something important', err);
}
