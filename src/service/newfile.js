'use strict';

const revoked = new Set();

module.exports = {
  revoke: (jti) => revoked.add(jti),
  isRevoked: (jti) => revoked.has(jti),
};
