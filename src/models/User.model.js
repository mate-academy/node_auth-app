'use strict';

const { v4: uuidv4 } = require('uuid');

/**
 * In-memory user store.
 *
 * Shape of a stored user:
 * {
 *   id:        string   (uuid v4)
 *   name:      string
 *   email:     string   (always lowercase)
 *   password:  string   (bcrypt hash)
 *   isActive:  boolean
 *   createdAt: string   (ISO-8601)
 * }
 */
const store = new Map();

const User = {
  /**
   * Persist a new user and return the full record.
   * @param {{ name: string, email: string, password: string }} fields
   * @returns {object}
   */
  create({ name, email, password }) {
    const user = {
      id: uuidv4(),
      name,
      email: email.toLowerCase(),
      password,
      isActive: false,
      createdAt: new Date().toISOString(),
    };

    store.set(user.id, user);

    return user;
  },

  /**
   * @param {string} id
   * @returns {object|null}
   */
  findById(id) {
    return store.get(id) || null;
  },

  /**
   * Case-insensitive email lookup.
   * @param {string} email
   * @returns {object|null}
   */
  findByEmail(email) {
    const normalised = email.toLowerCase();

    for (const user of store.values()) {
      if (user.email === normalised) {
        return user;
      }
    }

    return null;
  },

  /**
   * Shallow-merge `fields` onto the stored user.
   * @param {string} id
   * @param {object} fields
   * @returns {object|null} updated user, or null if not found
   */
  update(id, fields) {
    const user = store.get(id);

    if (!user) {
      return null;
    }

    const updated = { ...user, ...fields };

    store.set(id, updated);

    return updated;
  },

  /**
   * Remove a user from the store.
   * @param {string} id
   * @returns {boolean} true if the user existed and was removed
   */
  delete(id) {
    return store.delete(id);
  },

  /**
   * Return a copy of the user without the `password` field.
   * @param {object} user
   * @returns {object}
   */
  toPublic(user) {
    const { password, ...rest } = user;

    return rest;
  },

  // ── Test helpers ───────────────────────────────────────────────────────────

  /** Expose the underlying Map for assertions in tests. */
  _store: store,

  /** Reset the store between tests. */
  _clear() {
    store.clear();
  },
};

module.exports = User;
