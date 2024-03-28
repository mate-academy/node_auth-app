'use strict';

class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async getAll() {
    return this.userRepository.getAll();
  }

  async getById(id) {
    return this.userRepository.findById(id); ;
  }

  async getWithToken(email) {
    return this.userRepository.getWithToken(email);
  }

  async create(data, options) {
    return this.userRepository.create(data, options);
  }

  async update(id, data, options) {
    return this.userRepository.update(id, data, {
      individualHooks: true,
      ...options,
    });
  }

  async remove(id, options) {
    return this.userRepository.remove(id, options);
  }

  getNormalizedUser({ id, username, email }) {
    return {
      id, username, email,
    };
  }
}

module.exports = {
  UserService,
};
