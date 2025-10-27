'use strict';

const bcrypt = require('bcrypt');
const { nanoid } = require('nanoid');

const db = {
  usersByEmail: new Map(),
  usersById: new Map(),
  activationTokens: new Map(),
  resetTokens: new Map(),
  outbox: [],
};

function now() {
  return new Date().toISOString();
}

function createUser({ name, email, password }) {
  const id = nanoid();
  const passwordHash = bcrypt.hashSync(password, 10);

  const user = {
    id,
    name,
    email,
    passwordHash,
    active: false,
    createdAt: now(),
    updatedAt: now(),
  };

  db.usersByEmail.set(email.toLowerCase(), user);
  db.usersById.set(id, user);

  return user;
}

module.exports = { db, createUser, now };
