'use strict';

const ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

function esc(value) {
  const text = value === undefined || value === null ? '' : value;

  return String(text).replace(/[&<>"']/g, (char) => ESCAPES[char]);
}

const card = (content) => `<div class="card">${content}</div>`;

function csrfInput(ctx) {
  const token = esc(ctx.csrfToken);

  return `<input type="hidden" name="csrfToken" value="${token}">`;
}

function errorList(list) {
  if (!list || list.length === 0) {
    return '';
  }

  const items = list.map((item) => `<li>${esc(item)}</li>`).join('');

  return `<div class="alert error"><ul>${items}</ul></div>`;
}

function rulesBox(ctx, id) {
  const toItem = (rule) =>
    `<li data-pattern="${esc(rule.pattern)}">${esc(rule.text)}</li>`;

  const items = ctx.passwordRules.map(toItem).join('');

  return `<ul class="rules" data-rules-for="${id}">${items}</ul>`;
}

function field(ctx, options) {
  const id = options.id || options.name;
  const type = options.type || 'text';
  const auto = options.autocomplete
    ? ` autocomplete="${options.autocomplete}"`
    : '';
  const check = options.rules ? ' data-check-rules' : '';
  const rules = options.rules ? rulesBox(ctx, id) : '';

  return [
    `<label for="${id}">${esc(options.label)}</label>`,
    `<input id="${id}" name="${options.name}" type="${type}"`,
    `  value="${esc(options.value)}"${auto}${check} required>`,
    rules,
  ].join('\n');
}

module.exports = {
  esc,
  card,
  csrfInput,
  errorList,
  field,
};
