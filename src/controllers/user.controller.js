'use strict';

const ApiError = require('../exception/api.error');
const { User } = require('../models/User.model');

// const getActivedUser = async (req, res) => {
//   try {
//     const users = await User.findAll({
//       where: {
//         activationToken: null,
//       },
//     });

//     if (!users || users.length === 0) {
//       return res.status(404).send('No active users found');
//     }

//     const normalizedUser = users.map((user) => userService.normalized(user));

//     return res.status(200).send(normalizedUser);
//   } catch (error) {
//     return res.status(500).send('Server error');
//   }
// };

const changeName = async (req, res) => {
  const userId = req.user.id;

  if (!userId) {
    throw ApiError.notFound({ user: userId });
  }

  const { name } = req.body;

  if (!name) {
    throw ApiError.badRequest('the name is necessarily', {
      name: 'the name is necessarily',
    });
  }

  const user = await User.findOne({ where: { userId } });

  if (!user) {
    throw ApiError.notFound({ user: user });
  }

  user.name = name;
  await user.save();

  res.status(200).send('The name updated');
};

module.exports = {
  changeName,
};
