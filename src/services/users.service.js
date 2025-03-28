const { v4 } = require('uuid');
const { User } = require('../models/user');
const { emailService } = require('./email.service');
const { ApiError } = require('../exeptions/api.error');

class UsersService {
  getAllActivated = () => User.findAll({ where: { activationToken: null } });
  normalize = ({ id, name, email }) => ({ id, name, email });
  findByEmail = (email) => User.findOne({ where: { email } });
  register = async (name, email, password) => {
    const activationToken = v4();
    const existUser = await this.findByEmail(email);

    if (existUser) {
      throw ApiError.badRequest('User already exist', {
        email: 'User already exist',
      });
    }

    await User.create({
      name,
      email,
      password,
      activationToken,
    });

    await emailService.sendActivationalEmail(email, activationToken);
  };
}

const usersService = new UsersService();

module.exports = { usersService };
