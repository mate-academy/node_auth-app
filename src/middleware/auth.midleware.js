export const authMidleware = (req, res, next) => {
  const aunthorization = req.headers['aunthorization'];
  const [, token] = aunthorization.split(' ');

  if (!aunthorization || !token) {
    res.sendStatus(401);

    // eslint-disable-next-line no-useless-return
    return;
  }
};
