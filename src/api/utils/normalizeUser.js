const normalizeUser = ({ id, activationToken, email }) => {
  return { id, activationToken, email };
};

module.exports = {
  normalizeUser,
};
