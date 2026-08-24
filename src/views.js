'use strict';

const config = require('./config');
const { PASSWORD_RULES } = require('./security');

const escapeHtml = (value = '') =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const field = ({
  autocomplete,
  hint,
  label,
  name,
  placeholder,
  required = true,
  type = 'text',
  value = '',
}) => `
  <label class="field">
    <span class="field__label">${escapeHtml(label)}</span>
    <span class="field__control">
      <input
        ${autocomplete ? `autocomplete="${escapeHtml(autocomplete)}"` : ''}
        name="${escapeHtml(name)}"
        ${placeholder ? `placeholder="${escapeHtml(placeholder)}"` : ''}
        ${required ? 'required' : ''}
        type="${escapeHtml(type)}"
        value="${type === 'password' ? '' : escapeHtml(value)}"
      >
      ${
        type === 'password'
          ? '<button class="password-toggle" type="button" aria-label="Show password">Show</button>'
          : ''
      }
    </span>
    ${hint ? `<span class="field__hint">${escapeHtml(hint)}</span>` : ''}
  </label>`;

const alert = (message, type = 'error') =>
  message
    ? `<div class="alert alert--${type}" role="alert">${escapeHtml(message)}</div>`
    : '';

const csrfInput = (csrf) =>
  `<input type="hidden" name="_csrf" value="${escapeHtml(csrf)}">`;

const layout = ({
  title,
  body,
  user = null,
  page = '',
  description = '',
}) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="${escapeHtml(
      description || 'Secure account access with Northstar.',
    )}">
    <meta name="theme-color" content="#132b27">
    <meta property="og:type" content="website">
    <meta property="og:title" content="Northstar · Your account, safely yours.">
    <meta property="og:description" content="Secure account access with clear, human-friendly controls.">
    <meta property="og:image" content="${escapeHtml(config.appUrl)}/og.png">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image" content="${escapeHtml(config.appUrl)}/og.png">
    <title>${escapeHtml(title)} · Northstar</title>
    <link rel="stylesheet" href="/styles.css">
    <script src="/app.js" defer></script>
  </head>
  <body class="page-${escapeHtml(page)}">
    <header class="site-header">
      <a class="brand" href="/" aria-label="Northstar home">
        <span class="brand__mark" aria-hidden="true">N</span>
        <span>Northstar</span>
      </a>
      ${
        user
          ? `<div class="header-account">
              <span class="avatar" aria-hidden="true">${escapeHtml(
                user.name.slice(0, 1).toUpperCase(),
              )}</span>
              <span class="header-account__name">${escapeHtml(user.name)}</span>
            </div>`
          : '<span class="header-note">Your account, safely yours.</span>'
      }
    </header>
    <main>${body}</main>
    <footer class="site-footer">
      <span>© ${new Date().getFullYear()} Northstar</span>
      <span class="site-footer__security"><i aria-hidden="true"></i> Private by design</span>
    </footer>
  </body>
</html>`;

const authShell = ({ eyebrow, title, intro, content, note }) => `
  <section class="auth-shell">
    <aside class="auth-story">
      <div class="auth-story__content">
        <p class="eyebrow">One account. Clear control.</p>
        <h2>A calmer way to keep your account secure.</h2>
        <p>Northstar makes every security step visible, understandable, and easy to finish.</p>
      </div>
      <div class="trust-card">
        <span class="trust-card__icon" aria-hidden="true">✓</span>
        <div>
          <strong>Security without the mystery</strong>
          <p>Your password is encrypted, sessions are protected, and email changes are always confirmed.</p>
        </div>
      </div>
    </aside>
    <div class="auth-panel">
      <div class="auth-panel__inner">
        <p class="eyebrow">${escapeHtml(eyebrow)}</p>
        <h1>${escapeHtml(title)}</h1>
        ${intro ? `<p class="auth-intro">${escapeHtml(intro)}</p>` : ''}
        ${content}
        ${note ? `<div class="auth-note">${note}</div>` : ''}
      </div>
    </div>
  </section>`;

const registerPage = ({ csrf, error = '', values = {} }) =>
  layout({
    title: 'Create your account',
    page: 'register',
    description: 'Create your secure Northstar account.',
    body: authShell({
      eyebrow: 'Get started',
      title: 'Create your account',
      intro: 'A few details, then we’ll verify your email.',
      content: `
        ${alert(error)}
        <form class="stack" method="post" action="/register" novalidate>
          ${csrfInput(csrf)}
          ${field({
            label: 'Full name',
            name: 'name',
            autocomplete: 'name',
            placeholder: 'e.g. Maya Chen',
            value: values.name,
          })}
          ${field({
            label: 'Email address',
            name: 'email',
            type: 'email',
            autocomplete: 'email',
            placeholder: 'you@example.com',
            value: values.email,
          })}
          ${field({
            label: 'Password',
            name: 'password',
            type: 'password',
            autocomplete: 'new-password',
            placeholder: 'Create a strong password',
          })}
          <div class="password-rules" data-password-rules>
            <div class="password-rules__top"><span>Password strength</span><strong data-strength>Not started</strong></div>
            <div class="strength-track"><i data-strength-bar></i></div>
            <ul>
              ${PASSWORD_RULES.map((rule) => `<li data-rule="${escapeHtml(rule.label)}"><span aria-hidden="true">✓</span>${escapeHtml(rule.label)}</li>`).join('')}
            </ul>
          </div>
          <button class="button button--primary" type="submit">Create account <span aria-hidden="true">→</span></button>
        </form>`,
      note: 'Already have an account? <a href="/login">Sign in</a>',
    }),
  });

const loginPage = ({ csrf, error = '', email = '', inactive = false }) =>
  layout({
    title: 'Welcome back',
    page: 'login',
    body: authShell({
      eyebrow: 'Welcome back',
      title: 'Sign in to Northstar',
      intro: 'Pick up exactly where you left off.',
      content: `
        ${alert(error)}
        <form class="stack" method="post" action="/login">
          ${csrfInput(csrf)}
          ${field({
            label: 'Email address',
            name: 'email',
            type: 'email',
            autocomplete: 'email',
            placeholder: 'you@example.com',
            value: email,
          })}
          <div>
            ${field({
              label: 'Password',
              name: 'password',
              type: 'password',
              autocomplete: 'current-password',
              placeholder: 'Enter your password',
            })}
            <a class="field-link" href="/forgot-password">Forgot password?</a>
          </div>
          <button class="button button--primary" type="submit">Sign in <span aria-hidden="true">→</span></button>
        </form>
        ${
          inactive
            ? `<form method="post" action="/resend-activation" class="resend-form">
                ${csrfInput(csrf)}
                <input type="hidden" name="email" value="${escapeHtml(email)}">
                <button type="submit" class="button-link">Send a new activation email</button>
              </form>`
            : ''
        }`,
      note: 'New to Northstar? <a href="/register">Create an account</a>',
    }),
  });

const messagePage = ({
  title,
  eyebrow,
  message,
  detail = '',
  actionHref,
  actionLabel,
  secondary = '',
  state = 'mail',
}) =>
  layout({
    title,
    page: 'message',
    body: `
      <section class="message-shell">
        <div class="message-card">
          <div class="message-icon message-icon--${escapeHtml(state)}" aria-hidden="true">${
            state === 'success' ? '✓' : state === 'error' ? '!' : '@'
          }</div>
          <p class="eyebrow">${escapeHtml(eyebrow)}</p>
          <h1>${escapeHtml(title)}</h1>
          <p class="message-card__lead">${escapeHtml(message)}</p>
          ${detail ? `<p class="message-card__detail">${escapeHtml(detail)}</p>` : ''}
          ${
            actionHref
              ? `<a class="button button--primary" href="${escapeHtml(actionHref)}">${escapeHtml(actionLabel)} <span aria-hidden="true">→</span></a>`
              : ''
          }
          ${secondary ? `<div class="auth-note">${secondary}</div>` : ''}
        </div>
      </section>`,
  });

const forgotPasswordPage = ({ csrf, error = '', email = '' }) =>
  layout({
    title: 'Reset your password',
    page: 'forgot',
    body: authShell({
      eyebrow: 'Account recovery',
      title: 'Reset your password',
      intro: 'Enter your email and we’ll send a secure reset link.',
      content: `
        ${alert(error)}
        <form class="stack" method="post" action="/forgot-password">
          ${csrfInput(csrf)}
          ${field({
            label: 'Email address',
            name: 'email',
            type: 'email',
            autocomplete: 'email',
            placeholder: 'you@example.com',
            value: email,
          })}
          <button class="button button--primary" type="submit">Send reset link <span aria-hidden="true">→</span></button>
        </form>`,
      note: '<a href="/login">← Back to sign in</a>',
    }),
  });

const resetPasswordPage = ({ csrf, token, error = '' }) =>
  layout({
    title: 'Choose a new password',
    page: 'reset',
    body: authShell({
      eyebrow: 'Almost there',
      title: 'Choose a new password',
      intro: 'Make it memorable to you and difficult for others to guess.',
      content: `
        ${alert(error)}
        <form class="stack" method="post" action="/reset-password">
          ${csrfInput(csrf)}
          <input type="hidden" name="token" value="${escapeHtml(token)}">
          ${field({
            label: 'New password',
            name: 'password',
            type: 'password',
            autocomplete: 'new-password',
            placeholder: 'Create a strong password',
          })}
          ${field({
            label: 'Confirm new password',
            name: 'confirmation',
            type: 'password',
            autocomplete: 'new-password',
            placeholder: 'Type it once more',
          })}
          <button class="button button--primary" type="submit">Update password <span aria-hidden="true">→</span></button>
        </form>`,
      note: '<a href="/login">← Back to sign in</a>',
    }),
  });

const profilePage = ({ csrf, user, notice = '', error = '', section = '' }) =>
  layout({
    title: 'Your profile',
    page: 'profile',
    user,
    body: `
      <section class="profile-shell">
        <nav class="profile-nav" aria-label="Account navigation">
          <div>
            <p class="profile-nav__label">Account</p>
            <a class="profile-nav__link is-active" href="/profile"><span aria-hidden="true">●</span> Profile</a>
          </div>
          <form method="post" action="/logout">
            ${csrfInput(csrf)}
            <button class="profile-nav__link profile-nav__logout" type="submit"><span aria-hidden="true">↗</span> Log out</button>
          </form>
        </nav>
        <div class="profile-content">
          <div class="profile-heading">
            <div>
              <p class="eyebrow">Personal settings</p>
              <h1>Your profile</h1>
              <p>Keep your personal details and sign-in information up to date.</p>
            </div>
            <span class="status-pill"><i aria-hidden="true"></i> Email verified</span>
          </div>
          ${alert(notice, 'success')}
          ${alert(error)}
          <div class="profile-card" id="personal-details">
            <div class="profile-card__heading">
              <span class="section-number">01</span>
              <div><h2>Personal details</h2><p>The name shown across your account.</p></div>
            </div>
            <form class="profile-form" method="post" action="/profile/name">
              ${csrfInput(csrf)}
              ${field({
                label: 'Full name',
                name: 'name',
                autocomplete: 'name',
                value: user.name,
              })}
              <button class="button button--secondary" type="submit">Save name</button>
            </form>
          </div>
          <div class="profile-card ${section === 'email' ? 'profile-card--focus' : ''}" id="email-address">
            <div class="profile-card__heading">
              <span class="section-number">02</span>
              <div><h2>Email address</h2><p>We’ll ask you to confirm any new address.</p></div>
            </div>
            <form class="profile-form" method="post" action="/profile/email">
              ${csrfInput(csrf)}
              ${field({
                label: 'New email address',
                name: 'email',
                type: 'email',
                autocomplete: 'email',
                value: user.email,
              })}
              ${field({
                label: 'Current password',
                name: 'password',
                type: 'password',
                autocomplete: 'current-password',
                placeholder: 'Confirm it’s you',
              })}
              <button class="button button--secondary" type="submit">Change email</button>
            </form>
          </div>
          <div class="profile-card ${section === 'password' ? 'profile-card--focus' : ''}" id="password">
            <div class="profile-card__heading">
              <span class="section-number">03</span>
              <div><h2>Password</h2><p>Choose something unique that you don’t use elsewhere.</p></div>
            </div>
            <form class="profile-form" method="post" action="/profile/password">
              ${csrfInput(csrf)}
              ${field({
                label: 'Current password',
                name: 'oldPassword',
                type: 'password',
                autocomplete: 'current-password',
                placeholder: 'Your current password',
              })}
              <div class="profile-form__pair">
                ${field({
                  label: 'New password',
                  name: 'password',
                  type: 'password',
                  autocomplete: 'new-password',
                  placeholder: 'At least 8 characters',
                })}
                ${field({
                  label: 'Confirm password',
                  name: 'confirmation',
                  type: 'password',
                  autocomplete: 'new-password',
                  placeholder: 'Type it once more',
                })}
              </div>
              <button class="button button--secondary" type="submit">Update password</button>
            </form>
          </div>
        </div>
      </section>`,
  });

const notFoundPage = () =>
  layout({
    title: 'Page not found',
    page: 'not-found',
    body: `
      <section class="not-found">
        <div class="not-found__number" aria-hidden="true">404</div>
        <p class="eyebrow">Lost your way?</p>
        <h1>This page is off the map.</h1>
        <p>The address may be incorrect, or the page may have moved somewhere new.</p>
        <a class="button button--primary" href="/">Return home <span aria-hidden="true">→</span></a>
      </section>`,
  });

const inboxPage = ({ emails }) =>
  layout({
    title: 'Development inbox',
    page: 'inbox',
    body: `
      <section class="inbox-shell">
        <p class="eyebrow">Local development</p>
        <h1>Email preview</h1>
        <p>Messages sent by the application appear here when no email provider is configured.</p>
        <div class="inbox-list">
          ${
            emails.length
              ? emails
                  .map(
                    (email) => `<article class="inbox-message">
                      <div><span>${escapeHtml(email.to)}</span><time>${escapeHtml(new Date(email.createdAt).toLocaleString())}</time></div>
                      <h2>${escapeHtml(email.subject)}</h2>
                      <div class="email-body">${email.html}</div>
                    </article>`,
                  )
                  .join('')
              : '<div class="empty-state">No messages yet. Register an account to send the first one.</div>'
          }
        </div>
      </section>`,
  });

module.exports = {
  forgotPasswordPage,
  inboxPage,
  loginPage,
  messagePage,
  notFoundPage,
  profilePage,
  registerPage,
  resetPasswordPage,
};
