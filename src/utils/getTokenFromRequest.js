const getTokenFromRequest = (req) => {
  const authorization = req.headers['authorization'] || '';
  const [, token] = authorization.split(' ');

  return token;
};

module.exports = {
  getTokenFromRequest,
};
