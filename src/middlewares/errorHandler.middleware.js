'use strict';

/**
 * Central Express error handler.
 *
 * Services throw plain Error objects with an optional `.status` number and
 * an optional `.details` array (e.g. password-rule violations).  This handler
 * normalises all of that into a consistent JSON response shape:
 *
 *   { error: string, details?: string[] }
 *
 * Unexpected errors (status 500) are logged to stderr in full so they're
 * visible in the server console without leaking internals to the client.
 *
 * @type {import('express').ErrorRequestHandler}
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Guard against non-Error values passed to next() (e.g. a raw string)
  const isError = err instanceof Error;
  const status = (isError && err.status) || 500;
  const message = (isError && err.message) || 'Internal server error';

  const body = { error: message };

  if (isError && Array.isArray(err.details)) {
    body.details = err.details;
  }

  if (status === 500) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(status).json(body);
}

module.exports = errorHandler;
