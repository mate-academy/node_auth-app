'use strict';

const PASSWORD_RULES = [
  {
    id: 'len',
    text: 'Between 8 and 128 characters',
    re: /^[\s\S]{8,128}$/,
  },
  {
    id: 'lower',
    text: 'At least one lowercase letter',
    re: /[a-z]/,
  },
  {
    id: 'upper',
    text: 'At least one uppercase letter',
    re: /[A-Z]/,
  },
  {
    id: 'digit',
    text: 'At least one number',
    re: /\d/,
  },
  {
    id: 'special',
    text: 'At least one special character (e.g. ! @ # $ %)',
    re: /[^A-Za-z0-9]/,
  },
];

function passwordErrors(password) {
  const failed = PASSWORD_RULES.filter((rule) => !rule.re.test(password));

  const toMessage = (rule) =>
    `Password rule not met: ${rule.text.toLowerCase()}.`;

  return failed.map(toMessage);
}

// Shape used by the views (the browser re-checks the same patterns).
function rulesForView() {
  return PASSWORD_RULES.map((rule) => ({
    text: rule.text,
    pattern: rule.re.source,
  }));
}

module.exports = {
  PASSWORD_RULES,
  passwordErrors,
  rulesForView,
};
