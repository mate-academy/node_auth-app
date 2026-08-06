let users = [];

const getUsers = () => users;
const addUser = (user) => {
  users.push(user);
};
const clearUsers = () => {
  users = [];
};

module.exports = {
  getUsers,
  addUser,
  clearUsers,
};
