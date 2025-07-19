'use strict';

const { v4: uuidv4 } = require('uuid');

class UserModel {
  constructor() {
    this.users = [];
    this.activationTokens = new Map();
    this.resetTokens = new Map();
  }

  createUser(userData) {
    const user = {
      id: uuidv4(),
      name: userData.name,
      email: userData.email,
      password: userData.password,
      isActive: false,
      authToken: null,
      createdAt: new Date(),
    };

    this.users.push(user);

    return user;
  }

  findByEmail(email) {
    return this.users.find((user) => user.email === email);
  }

  findById(id) {
    return this.users.find((user) => user.id === id);
  }

  findByToken(token) {
    return this.users.find((user) => user.authToken === token);
  }

  updateUser(id, updates) {
    const user = this.findById(id);

    if (user) {
      Object.assign(user, updates);
    }

    return user;
  }

  activateUser(id) {
    const user = this.findById(id);

    if (user) {
      user.isActive = true;
    }

    return user;
  }

  setActivationToken(token, userId) {
    this.activationTokens.set(token, userId);
  }

  getActivationToken(token) {
    return this.activationTokens.get(token);
  }

  deleteActivationToken(token) {
    this.activationTokens.delete(token);
  }

  setResetToken(token, data) {
    this.resetTokens.set(token, data);
  }

  getResetToken(token) {
    return this.resetTokens.get(token);
  }

  deleteResetToken(token) {
    this.resetTokens.delete(token);
  }

  getAllUsers() {
    return this.users;
  }
}

module.exports = new UserModel();
