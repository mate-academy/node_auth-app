'use strict';

function parseCookies(header = '') {
  const cookies = {};

  header.split(';').forEach((part) => {
    const separator = part.indexOf('=');

    if (separator === -1) {
      return;
    }

    const key = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();

    if (key) {
      try {
        cookies[key] = decodeURIComponent(value);
      } catch {
        cookies[key] = value;
      }
    }
  });

  return cookies;
}

function serializeCookie(name, value, options = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];

  if (options.maxAge !== undefined) {
    parts.push(`Max-Age=${Math.floor(options.maxAge / 1000)}`);
  }

  parts.push(`Path=${options.path || '/'}`);

  if (options.httpOnly) {
    parts.push('HttpOnly');
  }

  if (options.secure) {
    parts.push('Secure');
  }

  if (options.sameSite) {
    parts.push(`SameSite=${options.sameSite}`);
  }

  return parts.join('; ');
}

function appendSetCookie(res, cookie) {
  const current = res.getHeader('Set-Cookie');
  let cookies = [];

  if (Array.isArray(current)) {
    cookies = current;
  } else if (current) {
    cookies = [current];
  }

  res.setHeader('Set-Cookie', [...cookies, cookie]);
}

module.exports = {
  appendSetCookie,
  parseCookies,
  serializeCookie,
};
