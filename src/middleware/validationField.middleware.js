const validationFieldMiddleware = (schema) => async (req, _, next) => {
  await schema(req).parse(req.body);
  next();
};

export default validationFieldMiddleware;
