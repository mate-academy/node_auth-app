'use strict';

const asText = (value) => String(value || '');

function cleanName(value) {
  return asText(value).trim().replace(/\s+/g, ' ').slice(0, 80);
}

function nameValid(value) {
  return value.length >= 1 && value.length <= 80;
}

function normEmail(value) {
  return asText(value).trim().toLowerCase();
}

function isEmail(value) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

module.exports = {
  asText,
  cleanName,
  nameValid,
  normEmail,
  isEmail,
};
