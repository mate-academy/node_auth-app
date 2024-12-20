const getExpireTime = (minutes = 0) => {
  const now = new Date();

  now.setMinutes(now.getMinutes() + minutes);

  return now;
};

module.exports = { getExpireTime };
