import errors from '../errors/index.error.js';
import services from '../services/index.service.js';

const authMiddleware = async (req, _, next) => {
  const token =
    req.cookies.refreshToken || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return next(errors.unauthorized('Authentication token is required'));
  }

  req.user = services.jwt.refreshVerify(token);

  const user = await services.user.find({ id: req.user.id });

  if (!user) {
    return next(errors.notFound('User not found'));
  }

  req.user = user.toJSON();

  next();
};

export default authMiddleware;
