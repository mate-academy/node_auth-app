'use strict';

const components = require('./components');
const layout = require('./layout');

function message(ctx, data) {
  const content = [
    `<h1>${components.esc(data.heading)}</h1>`,
    `<p>${components.esc(data.text)}</p>`,
  ].join('\n');

  return layout(ctx, data.title, components.card(content));
}

function notFound(ctx) {
  const content = [
    '<h1>404 - Page not found</h1>',
    '<p>The page you are looking for does not exist.</p>',
    '<p><a href="/">Go home</a></p>',
  ].join('\n');

  return layout(ctx, 'Not found', components.card(content));
}

function serverError(ctx) {
  const content = [
    '<h1>Something went wrong</h1>',
    '<p>Please try again later.</p>',
  ].join('\n');

  return layout(ctx, 'Error', components.card(content));
}

module.exports = {
  message,
  notFound,
  serverError,
};
