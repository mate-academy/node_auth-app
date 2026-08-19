'use strict';

function cloneUser(user) {
  return {
    ...user,
    save: function save() {
      return this;
    },
  };
}

function createMemoryAdapters() {
  const userList = [];
  const sessionList = [];
  let userId = 1;

  const users = {
    create(data) {
      const user = cloneUser({
        id: String(userId++),
        isActive: false,
        ...data,
      });

      userList.push(user);

      return user;
    },
    findById(id) {
      return userList.find((user) => user.id === id) || null;
    },
    findByEmail(email) {
      return userList.find((user) => user.email === email) || null;
    },
    findByActivationTokenHash(tokenHash) {
      return userList.find((user) => {
        return (
          user.activationTokenHash === tokenHash &&
          user.activationTokenExpiresAt > new Date()
        );
      }) || null;
    },
    findByResetTokenHash(tokenHash) {
      return userList.find((user) => {
        return (
          user.resetTokenHash === tokenHash &&
          user.resetTokenExpiresAt > new Date()
        );
      }) || null;
    },
    emailExistsForOtherUser(email, id) {
      return userList.some((user) => user.email === email && user.id !== id);
    },
    save(user) {
      return user;
    },
  };

  const sessions = {
    create(data) {
      const session = { ...data };

      sessionList.push(session);

      return session;
    },
    findByTokenHash(tokenHash) {
      const session = sessionList.find((item) => item.tokenHash === tokenHash);

      if (!session) {
        return null;
      }

      return {
        ...session,
        user: userList.find((user) => user.id === session.userId) || null,
      };
    },
    deleteByTokenHash(tokenHash) {
      const index = sessionList.findIndex((item) => {
        return item.tokenHash === tokenHash;
      });

      if (index !== -1) {
        sessionList.splice(index, 1);
      }
    },
    deleteAllForUser(id) {
      for (let i = sessionList.length - 1; i >= 0; i -= 1) {
        if (sessionList[i].userId === id) {
          sessionList.splice(i, 1);
        }
      }
    },
  };

  const messages = [];
  const mailer = {
    sendActivationEmail(email, token) {
      messages.push({ type: 'activation', email, token });
    },
    sendResetEmail(email, token) {
      messages.push({ type: 'reset', email, token });
    },
    sendEmailChangeNotification(oldEmail, newEmail) {
      messages.push({ type: 'email-change', oldEmail, newEmail });
    },
    getOutbox() {
      return messages.map((message) => ({ ...message }));
    },
  };

  return {
    mailer,
    sessions,
    users,
  };
}

module.exports = {
  createMemoryAdapters,
};
