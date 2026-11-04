export const notFoundMiddleware = (req, res) => {
  res.status(404).json({ message: 'Not found' });
};

// eslint-disable-next-line no-unused-vars
export const errorMiddleware = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON body' });
  }

  // eslint-disable-next-line no-console
  console.error(err);

  return res.status(500).json({ message: 'Internal server error' });
};
