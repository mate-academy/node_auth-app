const parseAccessToken = (authorizationHeader) => {
  return authorizationHeader.split(' ')[1];
};

module.exports = {
  parseAccessToken,
};
