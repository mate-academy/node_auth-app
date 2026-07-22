'use strict';

function minutesFromNow(minutes) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

function daysFromNow(days) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

module.exports = {
  daysFromNow,
  minutesFromNow,
};
