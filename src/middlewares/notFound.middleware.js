export const notFoundMiddleware = (req, res, next) => {
  res.status(404).send({
    message: '404: Page not found',
  });
};
