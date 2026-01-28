export function guestMiddleware(req, res, next) {
  if (req.user) {
    return res.status(403).json({
      message: 'Already authenticated',
    });
  }

  next();
}
