function errorMiddleware(err, req, res, next) {
  if (err) {
    res.status(503).json({ message: 'Server error.' });
  }

  next();
}

module.exports = { errorMiddleware };
