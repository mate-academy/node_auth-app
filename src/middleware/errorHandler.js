'use strict';

const { UniqueConstraintError, ValidationError } = require('sequelize');

const AppError = require('../utils/AppError');
const { renderErrorPage } = require('../views/html');

function notFoundHandler(req, res) {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ message: 'Not found' });

    return;
  }

  res.status(404).send(renderErrorPage(404, 'Page not found'));
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    next(error);

    return;
  }

  if (error.type === 'entity.parse.failed') {
    res.status(400).json({ message: 'Invalid JSON payload' });

    return;
  }

  if (error.type === 'entity.too.large') {
    res.status(413).json({ message: 'Request payload is too large' });

    return;
  }

  if (error instanceof AppError) {
    if (req.path.startsWith('/api/')) {
      res.status(error.statusCode).json({
        message: error.message,
        ...(error.details ? { details: error.details } : {}),
      });

      return;
    }

    res.status(error.statusCode).send(
      renderErrorPage(error.statusCode, error.message),
    );

    return;
  }

  if (error instanceof UniqueConstraintError) {
    res.status(409).json({ message: 'This value is already in use' });

    return;
  }

  if (error instanceof ValidationError) {
    res.status(400).json({ message: 'Validation failed' });

    return;
  }

  res.status(500).json({ message: 'Internal server error' });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
