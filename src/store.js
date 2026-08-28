'use strict';

const fs = require('node:fs');
const path = require('node:path');

class UserStore {
  constructor(filePath) {
    this.filePath = filePath;
    this.memory = [];
    this.persistent = Boolean(filePath);

    if (this.persistent) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });

      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '[]\n');
      }
    }
  }

  all() {
    if (!this.persistent) {
      return this.memory;
    }

    try {
      return JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
    } catch {
      return [];
    }
  }

  save(users) {
    if (!this.persistent) {
      this.memory = users;

      return;
    }

    const temp = `${this.filePath}.tmp`;

    fs.writeFileSync(temp, `${JSON.stringify(users, null, 2)}\n`);
    fs.renameSync(temp, this.filePath);
  }

  findById(id) {
    return this.all().find((user) => user.id === id);
  }

  findByEmail(email) {
    const normalized = email.trim().toLowerCase();

    return this.all().find((user) => user.email === normalized);
  }

  insert(user) {
    const users = this.all();

    users.push(user);
    this.save(users);

    return user;
  }

  update(id, changes) {
    const users = this.all();
    const index = users.findIndex((user) => user.id === id);

    if (index < 0) {
      return null;
    }

    users[index] = {
      ...users[index],
      ...changes,
      updatedAt: new Date().toISOString(),
    };
    this.save(users);

    return users[index];
  }
}

module.exports = { UserStore };
