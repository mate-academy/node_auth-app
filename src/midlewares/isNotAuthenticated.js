export const isNotAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const refreshToken = req.cookies?.refreshToken;

  if (authHeader || refreshToken) {
    return res.sendStatus(403);
  }

  next();
};
