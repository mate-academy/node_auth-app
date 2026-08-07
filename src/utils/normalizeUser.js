'use strict';

function normalizeUser({ id, name, email, isActive }) {
  return {
    id,
    name,
    email,
    isActive,
  };
}

module.exports = {
  normalizeUser,
};
