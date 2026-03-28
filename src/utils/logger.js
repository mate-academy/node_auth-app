/* eslint-disable no-console */
export const logger = {
  info: (msg, meta = {}) =>
    console.log(
      JSON.stringify({
        level: 'info',
        msg,
        timestamp: new Date().toISOString(),
        ...meta,
      }),
    ),
  warn: (msg, meta = {}) =>
    console.warn(
      JSON.stringify({
        level: 'warn',
        msg,
        timestamp: new Date().toISOString(),
        ...meta,
      }),
    ),
  error: (msg, meta = {}) =>
    console.error(
      JSON.stringify({
        level: 'error',
        msg,
        timestamp: new Date().toISOString(),
        ...meta,
      }),
    ),
};
