export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  } else {
    const status = err.status || (err.name === 'ZodError' ? 400 : 500);
    const message =
      err?.issues?.[0]?.message || err.message || 'Internal server error';

    res.status(status).send({
      message,
    });
  }
};
