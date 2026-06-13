const checkData = ({ field, data }) => {
  if (!data) {
    return `${field} is require`;
  }

  const patterns = {
    name: /^[A-ZА-ЯІЇЄҐ][a-zа-яіїєґ']{1,29}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
    password: /^(?=.*[A-Za-z])(?=.*\d)[^\s]{6,}$/,
  };

  if (!patterns[field].test(data)) {
    return `Invalid ${field} format`;
  }
};

module.exports = checkData;
