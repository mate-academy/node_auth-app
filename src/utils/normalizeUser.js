'use strict';

function normalizeUser({ email, name, id }) {
  return { email, name, id };
}

module.exports = {
  normalizeUser,
};
