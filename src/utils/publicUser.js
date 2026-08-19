'use strict';

function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isActive: user.isActive,
  };
}

module.exports = toPublicUser;
