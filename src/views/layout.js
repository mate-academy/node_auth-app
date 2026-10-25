'use strict';

const components = require('./components');

function renderNav(ctx) {
  if (ctx.currentUser) {
    return [
      '<nav><a href="/profile">Profile</a></nav>',
      '<form method="post" action="/logout">',
      components.csrfInput(ctx),
      '<button class="link" type="submit">Log out</button>',
      '</form>',
    ].join('');
  }

  return [
    '<nav><a href="/login">Log in</a>',
    '<a href="/register">Register</a></nav><span></span>',
  ].join('');
}

function renderFlash(ctx) {
  if (!ctx.flash) {
    return '';
  }

  const kind = components.esc(ctx.flash.type);
  const text = components.esc(ctx.flash.msg);

  return `<div class="alert ${kind}">${text}</div>`;
}

// Wraps the page content with the common HTML shell.
function layout(ctx, title, content) {
  return [
    '<!doctype html>',
    '<html lang="en"><head><meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1">',
    `<title>${components.esc(title)} - Auth App</title>`,
    '<link rel="stylesheet" href="/css/styles.css"></head>',
    `<body><header>${renderNav(ctx)}</header>`,
    `<main>${renderFlash(ctx)}${content}</main>`,
    '<script src="/js/password-rules.js"></script>',
    '</body></html>',
  ].join('\n');
}

module.exports = layout;
