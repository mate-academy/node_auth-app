import passport from 'passport';

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Unauthorized');
    }

    const token = authHeader.split(' ')[1];

    passport.authenticate('jwt', { session: false }, (err, user, info) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      req.user = user;

      req.token = token;

      next();
    })(req, res, next);
  } catch (e) {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

export default authMiddleware;
