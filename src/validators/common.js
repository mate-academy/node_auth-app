'use strict';

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}

function isValidName(name) {
  return (
    typeof name === 'string' &&
    name.trim().length >= 1 &&
    name.trim().length <= 100
  );
}

module.exports = {
  isValidEmail,
  isValidName,
  normalizeEmail,
};
