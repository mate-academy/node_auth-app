'use strict';

const { randomBytes } = require('crypto');

/**
 * In-memory token store.
 *
 * Shape of a stored record:
 * {
 *   userId:    string
 *   type:      string   (one of TOKEN_TYPES)
 *   data:      any|null (optional payload, e.g. { newEmail })
 *   expiresAt: number   (unix ms timestamp)
 * }
 *
 * Map key is the raw hex token string.
 */
const store = new Map();

const Token = {
  // ── Token type constants ───────────────────────────────────────────────────

  TOKEN_TYPES: {
    ACTIVATION: 'activation',
    PASSWORD_RESET: 'password_reset',
    EMAIL_CHANGE: 'email_change',
  },

  // ── Write ──────────────────────────────────────────────────────────────────

  /**
   * Create a token for `userId` of the given `type`.
   * Any existing token of the same type for the same user is invalidated first,
   * so there is at most one live token per (userId, type) pair at any time.
   *
   * @param {string} userId
   * @param {string} type      - one of TOKEN_TYPES values
   * @param {number} ttlHours  - how long until the token expires
   * @param {any}   [data]   - optional extra payload stored alongside the token
   * @returns {string} the generated token (64-char hex string)
   */
  create(userId, type, ttlHours, data = null) {
    // Revoke any previous token of the same type for this user
    for (const [tok, rec] of store.entries()) {
      if (rec.userId === userId && rec.type === type) {
        store.delete(tok);
      }
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = Date.now() + ttlHours * 60 * 60 * 1000;

    store.set(token, {
      userId,
      type,
      data,
      expiresAt,
    });

    return token;
  },

  // ── Read ───────────────────────────────────────────────────────────────────

  /**
   * Look up a token without removing it.
   * Returns `null` if the token doesn't exist, is
   * the wrong type, or has expired.
   *
   * @param {string} token
   * @param {string} type
   * @returns {{ userId: string, data: any }|null}
   */
  find(token, type) {
    const record = store.get(token);

    if (!record) {
      return null;
    }

    if (record.type !== type || Date.now() > record.expiresAt) {
      return null;
    }

    return { userId: record.userId, data: record.data };
  },

  /**
   * Check whether a token exists, is the correct type, and has not expired.
   * Does NOT consume the token.
   *
   * @param {string} token
   * @param {string} type
   * @returns {boolean}
   */
  isValid(token, type) {
    return this.find(token, type) !== null;
  },

  // ── Consume (read + delete) ────────────────────────────────────────────────

  /**
   * Validate a token and, if valid, delete it so it cannot be reused.
   * Returns `null` if the token is missing, the wrong type, or expired.
   *
   * @param {string} token
   * @param {string} type
   * @returns {{ userId: string, data: any }|null}
   */
  consume(token, type) {
    const result = this.find(token, type);

    if (!result) {
      // Also purge an expired/mismatched entry if it exists
      store.delete(token);

      return null;
    }

    store.delete(token);

    return result;
  },

  // ── Delete ─────────────────────────────────────────────────────────────────

  /**
   * Remove all tokens belonging to a given user.
   * Useful when a user is deleted or all their sessions should be revoked.
   *
   * @param {string} userId
   */
  deleteByUserId(userId) {
    for (const [tok, rec] of store.entries()) {
      if (rec.userId === userId) {
        store.delete(tok);
      }
    }
  },

  // ── Test helpers ───────────────────────────────────────────────────────────

  /** Expose the underlying Map for assertions in tests. */
  _store: store,

  /** Reset the store between tests. */
  _clear() {
    store.clear();
  },
};

module.exports = Token;
