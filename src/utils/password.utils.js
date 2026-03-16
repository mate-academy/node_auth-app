'use strict';

const PASSWORD_RULES = [
  {
    id: 'length',
    label: 'At least 8 characters',
    test: (p) => p.length >= 8,
  },
  {
    id: 'uppercase',
    label: 'At least one uppercase letter (A–Z)',
    test: (p) => /[A-Z]/.test(p),
  },
  {
    id: 'lowercase',
    label: 'At least one lowercase letter (a–z)',
    test: (p) => /[a-z]/.test(p),
  },
  {
    id: 'number',
    label: 'At least one number (0–9)',
    test: (p) => /\d/.test(p),
  },
  {
    id: 'special',
    label: 'At least one special character (!@#$…)',
    test: (p) => /[!@#$%^&*()\-_=+[\]{};':"\\|,.<>/?]/.test(p),
  },
];

/**
 * @param {string} password
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validatePassword(password) {
  const failed = PASSWORD_RULES.filter((rule) => !rule.test(password));

  return {
    valid: failed.length === 0,
    errors: failed.map((rule) => rule.label),
  };
}

module.exports = { validatePassword, PASSWORD_RULES };
