const checkRequired = (data, message) => {
  if (!data) {
    return `${message} is required`;
  }
};

module.exports = { checkRequired };
