export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body ?? {},
    params: req.params,
    query: req.query,
  });

  if (!result.success) {
    return res.status(400).json({
      message: 'Validation error',
      errors: result.error.flatten(),
    });
  }

  req.body = result.data.body;
  req.params = result.data.params;
  req.validated = result.data;
  next();
};
