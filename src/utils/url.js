'use strict';

function absoluteUrl(req, path) {
  const proto = req.headers['x-forwarded-proto'] || req.protocol;

  return `${proto}://${req.get('host')}${path}`;
}

module.exports = { absoluteUrl };
