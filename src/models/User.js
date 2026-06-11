'use strict';

const { randomUUID } = require('crypto');
const bcrypt = require('bcryptjs');

const users = new Map();
const resetTokens = new Map();
const activationTokens = new Map();

function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

function comparePassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

class User {
  constructor({ id, name, email, password, isActive }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.isActive = isActive;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      isActive: this.isActive,
    };
  }

  static create({ name, email, password }) {
    const id = randomUUID();
    const hashedPassword = hashPassword(password);
    const user = new User({
      id,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      isActive: false,
    });

    users.set(id, user);

    const activationToken = randomUUID();

    activationTokens.set(activationToken, id);

    return { user, activationToken };
  }

  static findById(id) {
    return users.get(id) || null;
  }

  static findByEmail(email) {
    for (const user of users.values()) {
      if (user.email === email.toLowerCase()) {
        return user;
      }
    }

    return null;
  }

  static verifyPassword(user, password) {
    return comparePassword(password, user.password);
  }

  static activate(activationToken) {
    const userId = activationTokens.get(activationToken);

    if (!userId) {
      return null;
    }

    const user = users.get(userId);

    if (!user) {
      return null;
    }

    user.isActive = true;
    activationTokens.delete(activationToken);

    return user;
  }

  static updateName(id, name) {
    const user = users.get(id);

    if (!user) {
      return null;
    }

    user.name = name;

    return user;
  }

  static updatePassword(id, oldPassword, newPassword) {
    const user = users.get(id);

    if (!user || !comparePassword(oldPassword, user.password)) {
      return null;
    }

    user.password = hashPassword(newPassword);

    return user;
  }

  static updateEmail(id, password, newEmail) {
    const user = users.get(id);

    if (!user || !comparePassword(password, user.password)) {
      return null;
    }

    const oldEmail = user.email;

    user.email = newEmail.toLowerCase();

    return { user, oldEmail };
  }

  static createResetToken(email) {
    const user = User.findByEmail(email);

    if (!user) {
      return null;
    }

    const token = randomUUID();

    resetTokens.set(token, { userId: user.id, createdAt: Date.now() });

    return token;
  }

  static resetPassword(token, newPassword) {
    const data = resetTokens.get(token);

    if (!data) {
      return null;
    }

    const user = users.get(data.userId);

    if (!user) {
      return null;
    }

    user.password = hashPassword(newPassword);
    user.isActive = true;
    resetTokens.delete(token);

    return user;
  }

  static reset() {
    users.clear();
    resetTokens.clear();
    activationTokens.clear();
  }
}

module.exports = { User };
