'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const nodeCrypto = require('node:crypto');

const EMPTY_DATA = {
  users: [],
  sessions: [],
  tokens: [],
  emails: [],
};

class Store {
  constructor(filePath) {
    this.filePath = filePath;
    this.data = structuredClone(EMPTY_DATA);
    this.writeQueue = Promise.resolve();
    this.ready = this.load();
  }

  async load() {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });

    try {
      const saved = JSON.parse(await fs.readFile(this.filePath, 'utf8'));

      this.data = { ...structuredClone(EMPTY_DATA), ...saved };
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }

      await this.persist();
    }
  }

  async persist() {
    const temporaryPath = `${this.filePath}.${process.pid}.tmp`;

    await fs.writeFile(temporaryPath, JSON.stringify(this.data, null, 2));
    await fs.rename(temporaryPath, this.filePath);
  }

  async mutate(callback) {
    const operation = this.writeQueue.then(async () => {
      await this.ready;

      const result = await callback(this.data);

      await this.persist();

      return result;
    });

    this.writeQueue = operation.catch(() => {});

    return operation;
  }

  async read(callback) {
    await this.ready;
    await this.writeQueue;

    return callback(this.data);
  }

  findUserByEmail(email) {
    return this.read((data) => data.users.find((user) => user.email === email));
  }

  findUserById(id) {
    return this.read((data) => data.users.find((user) => user.id === id));
  }

  createUser(user) {
    return this.mutate((data) => {
      const created = {
        id: nodeCrypto.randomUUID(),
        active: false,
        createdAt: new Date().toISOString(),
        ...user,
      };

      data.users.push(created);

      return created;
    });
  }

  updateUser(id, updates) {
    return this.mutate((data) => {
      const user = data.users.find((entry) => entry.id === id);

      if (!user) {
        return null;
      }

      Object.assign(user, updates, { updatedAt: new Date().toISOString() });

      return user;
    });
  }

  createSession(userId, session) {
    return this.mutate((data) => {
      data.sessions.push({ userId, ...session });
    });
  }

  findSession(id) {
    return this.read((data) => {
      return data.sessions.find(
        (session) => session.id === id && session.expiresAt > Date.now(),
      );
    });
  }

  deleteSession(id) {
    return this.mutate((data) => {
      data.sessions = data.sessions.filter((session) => session.id !== id);
    });
  }

  deleteUserSessions(userId) {
    return this.mutate((data) => {
      data.sessions = data.sessions.filter(
        (session) => session.userId !== userId,
      );
    });
  }

  createToken(token) {
    return this.mutate((data) => {
      data.tokens = data.tokens.filter(
        (entry) =>
          entry.userId !== token.userId || entry.purpose !== token.purpose,
      );
      data.tokens.push(token);
    });
  }

  consumeToken(digest, purpose) {
    return this.mutate((data) => {
      const index = data.tokens.findIndex(
        (token) =>
          token.digest === digest &&
          token.purpose === purpose &&
          token.expiresAt > Date.now(),
      );

      if (index < 0) {
        return null;
      }

      const [consumedToken] = data.tokens.splice(index, 1);

      return consumedToken;
    });
  }

  saveEmail(email) {
    return this.mutate((data) => {
      data.emails.unshift({
        id: nodeCrypto.randomUUID(),
        createdAt: new Date().toISOString(),
        ...email,
      });
      data.emails = data.emails.slice(0, 100);
    });
  }

  listEmails() {
    return this.read((data) => data.emails);
  }
}

module.exports = { Store };
