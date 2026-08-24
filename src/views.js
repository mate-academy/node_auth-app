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

const passwordToggle =
  '<button class="password-toggle" type="button" ' +
  'aria-label="Show password">Show</button>';
const emptyInbox =
  '<div class="empty-state">No messages yet. Register an account ' +
  'to send the first one.</div>';

const optionalAttribute = (name, value) =>
  value ? `${name}="${escapeHtml(value)}"` : '';

const field = ({
  autocomplete,
  hint,
  label,
  name,
  placeholder,
  required = true,
  type = 'text',
  value = '',
}) => {
  const autocompleteAttribute = optionalAttribute('autocomplete', autocomplete);
  const placeholderAttribute = optionalAttribute('placeholder', placeholder);
  const requiredAttribute = required ? 'required' : '';
  const inputValue = type === 'password' ? '' : escapeHtml(value);
  const toggle = type === 'password' ? passwordToggle : '';
  const hintMarkup = hint
    ? `<span class="field__hint">${escapeHtml(hint)}</span>`
    : '';

  return `
  <label class="field">
    <span class="field__label">${escapeHtml(label)}</span>
    <span class="field__control">
      <input
        ${autocompleteAttribute}
        name="${escapeHtml(name)}"
        ${placeholderAttribute}
        ${requiredAttribute}
        type="${escapeHtml(type)}"
        value="${inputValue}"
      >
      ${toggle}
    </span>
    ${hintMarkup}
  </label>`;
};

const alert = (message, type = 'error') => {
  if (!message) {
    return '';
  }

  return (
    `<div class="alert alert--${type}" role="alert">` +
    `${escapeHtml(message)}</div>`
  );
};

const csrfInput = (csrf) =>
  `<input type="hidden" name="_csrf" value="${escapeHtml(csrf)}">`;

const accountHeader = (user) => {
  if (!user) {
    return '<span class="header-note">Your account, safely yours.</span>';
  }

  const initial = escapeHtml(user.name.slice(0, 1).toUpperCase());
  const name = escapeHtml(user.name);

  return `<div class="header-account">
    <span class="avatar" aria-hidden="true">${initial}</span>
    <span class="header-account__name">${name}</span>
  </div>`;
};

const layout = ({ title, body, user = null, page = '', description = '' }) => {
  const pageDescription = escapeHtml(
    description || 'Secure account access with Northstar.',
  );
  const appUrl = escapeHtml(config.appUrl);
  const headerAccount = accountHeader(user);
  const year = new Date().getFullYear();

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="${pageDescription}">
    <meta name="theme-color" content="#132b27">
    <meta property="og:type" content="website">
    <meta property="og:title" content="Northstar · Your account, safely yours.">
    <meta property="og:description" content="Secure account access with clear, human-friendly controls.">
    <meta property="og:image" content="${appUrl}/og.png">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image" content="${appUrl}/og.png">
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
      ${headerAccount}
    </header>
    <main>${body}</main>
    <footer class="site-footer">
      <span>© ${year} Northstar</span>
      <span class="site-footer__security"><i aria-hidden="true"></i> Private by design</span>
    </footer>
  </body>
</html>`;
};

const authShell = ({ eyebrow, title, intro, content, note }) => {
  const introMarkup = intro
    ? `<p class="auth-intro">${escapeHtml(intro)}</p>`
    : '';
  const noteMarkup = note ? `<div class="auth-note">${note}</div>` : '';

  return `
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
        ${introMarkup}
        ${content}
        ${noteMarkup}
      </div>
    </div>
  </section>`;
};

const passwordRules = () =>
  PASSWORD_RULES.map((rule) => {
    const label = escapeHtml(rule.label);

    return `<li data-rule="${label}"><span aria-hidden="true">✓</span>${label}</li>`;
  }).join('');

const registerPage = ({ csrf, error = '', values = {} }) => {
  const nameField = field({
    label: 'Full name',
    name: 'name',
    autocomplete: 'name',
    placeholder: 'e.g. Maya Chen',
    value: values.name,
  });
  const emailField = field({
    label: 'Email address',
    name: 'email',
    type: 'email',
    autocomplete: 'email',
    placeholder: 'you@example.com',
    value: values.email,
  });
  const passwordField = field({
    label: 'Password',
    name: 'password',
    type: 'password',
    autocomplete: 'new-password',
    placeholder: 'Create a strong password',
  });
  const rules = passwordRules();
  const content = `
    ${alert(error)}
    <form class="stack" method="post" action="/register" novalidate>
      ${csrfInput(csrf)}
      ${nameField}
      ${emailField}
      ${passwordField}
      <div class="password-rules" data-password-rules>
        <div class="password-rules__top"><span>Password strength</span><strong data-strength>Not started</strong></div>
        <div class="strength-track"><i data-strength-bar></i></div>
        <ul>${rules}</ul>
      </div>
      <button class="button button--primary" type="submit">Create account <span aria-hidden="true">→</span></button>
    </form>`;

  return layout({
    title: 'Create your account',
    page: 'register',
    description: 'Create your secure Northstar account.',
    body: authShell({
      eyebrow: 'Get started',
      title: 'Create your account',
      intro: 'A few details, then we’ll verify your email.',
      content,
      note: 'Already have an account? <a href="/login">Sign in</a>',
    }),
  });
};

const loginPage = ({ csrf, error = '', email = '', inactive = false }) => {
  const emailField = field({
    label: 'Email address',
    name: 'email',
    type: 'email',
    autocomplete: 'email',
    placeholder: 'you@example.com',
    value: email,
  });
  const passwordField = field({
    label: 'Password',
    name: 'password',
    type: 'password',
    autocomplete: 'current-password',
    placeholder: 'Enter your password',
  });
  const resendForm = inactive
    ? `<form method="post" action="/resend-activation" class="resend-form">
        ${csrfInput(csrf)}
        <input type="hidden" name="email" value="${escapeHtml(email)}">
        <button type="submit" class="button-link">Send a new activation email</button>
      </form>`
    : '';
  const content = `
    ${alert(error)}
    <form class="stack" method="post" action="/login">
      ${csrfInput(csrf)}
      ${emailField}
      <div>
        ${passwordField}
        <a class="field-link" href="/forgot-password">Forgot password?</a>
      </div>
      <button class="button button--primary" type="submit">Sign in <span aria-hidden="true">→</span></button>
    </form>
    ${resendForm}`;

  return layout({
    title: 'Welcome back',
    page: 'login',
    body: authShell({
      eyebrow: 'Welcome back',
      title: 'Sign in to Northstar',
      intro: 'Pick up exactly where you left off.',
      content,
      note: 'New to Northstar? <a href="/register">Create an account</a>',
    }),
  });
};

const messagePage = ({
  title,
  eyebrow,
  message,
  detail = '',
  actionHref,
  actionLabel,
  secondary = '',
  state = 'mail',
}) => {
  const icon = state === 'success' ? '✓' : state === 'error' ? '!' : '@';
  const detailMarkup = detail
    ? `<p class="message-card__detail">${escapeHtml(detail)}</p>`
    : '';
  const actionMarkup = actionHref
    ? `<a class="button button--primary" href="${escapeHtml(actionHref)}">${escapeHtml(actionLabel)} <span aria-hidden="true">→</span></a>`
    : '';
  const secondaryMarkup = secondary
    ? `<div class="auth-note">${secondary}</div>`
    : '';
  const body = `
    <section class="message-shell">
      <div class="message-card">
        <div class="message-icon message-icon--${escapeHtml(state)}" aria-hidden="true">${icon}</div>
        <p class="eyebrow">${escapeHtml(eyebrow)}</p>
        <h1>${escapeHtml(title)}</h1>
        <p class="message-card__lead">${escapeHtml(message)}</p>
        ${detailMarkup}
        ${actionMarkup}
        ${secondaryMarkup}
      </div>
    </section>`;

  return layout({ title, page: 'message', body });
};

const forgotPasswordPage = ({ csrf, error = '', email = '' }) => {
  const emailField = field({
    label: 'Email address',
    name: 'email',
    type: 'email',
    autocomplete: 'email',
    placeholder: 'you@example.com',
    value: email,
  });
  const content = `
    ${alert(error)}
    <form class="stack" method="post" action="/forgot-password">
      ${csrfInput(csrf)}
      ${emailField}
      <button class="button button--primary" type="submit">Send reset link <span aria-hidden="true">→</span></button>
    </form>`;

  return layout({
    title: 'Reset your password',
    page: 'forgot',
    body: authShell({
      eyebrow: 'Account recovery',
      title: 'Reset your password',
      intro: 'Enter your email and we’ll send a secure reset link.',
      content,
      note: '<a href="/login">← Back to sign in</a>',
    }),
  });
};

const resetPasswordPage = ({ csrf, token, error = '' }) => {
  const passwordField = field({
    label: 'New password',
    name: 'password',
    type: 'password',
    autocomplete: 'new-password',
    placeholder: 'Create a strong password',
  });
  const confirmationField = field({
    label: 'Confirm new password',
    name: 'confirmation',
    type: 'password',
    autocomplete: 'new-password',
    placeholder: 'Type it once more',
  });
  const content = `
    ${alert(error)}
    <form class="stack" method="post" action="/reset-password">
      ${csrfInput(csrf)}
      <input type="hidden" name="token" value="${escapeHtml(token)}">
      ${passwordField}
      ${confirmationField}
      <button class="button button--primary" type="submit">Update password <span aria-hidden="true">→</span></button>
    </form>`;

  return layout({
    title: 'Choose a new password',
    page: 'reset',
    body: authShell({
      eyebrow: 'Almost there',
      title: 'Choose a new password',
      intro: 'Make it memorable to you and difficult for others to guess.',
      content,
      note: '<a href="/login">← Back to sign in</a>',
    }),
  });
};

const profileFields = (user) => ({
  name: field({
    label: 'Full name',
    name: 'name',
    autocomplete: 'name',
    value: user.name,
  }),
  email: field({
    label: 'New email address',
    name: 'email',
    type: 'email',
    autocomplete: 'email',
    value: user.email,
  }),
  emailPassword: field({
    label: 'Current password',
    name: 'password',
    type: 'password',
    autocomplete: 'current-password',
    placeholder: 'Confirm it’s you',
  }),
  oldPassword: field({
    label: 'Current password',
    name: 'oldPassword',
    type: 'password',
    autocomplete: 'current-password',
    placeholder: 'Your current password',
  }),
  newPassword: field({
    label: 'New password',
    name: 'password',
    type: 'password',
    autocomplete: 'new-password',
    placeholder: 'At least 8 characters',
  }),
  confirmation: field({
    label: 'Confirm password',
    name: 'confirmation',
    type: 'password',
    autocomplete: 'new-password',
    placeholder: 'Type it once more',
  }),
});

const profilePage = ({ csrf, user, notice = '', error = '', section = '' }) => {
  const fields = profileFields(user);
  const csrfMarkup = csrfInput(csrf);
  const emailFocus = section === 'email' ? 'profile-card--focus' : '';
  const passwordFocus = section === 'password' ? 'profile-card--focus' : '';
  const body = `
    <section class="profile-shell">
      <nav class="profile-nav" aria-label="Account navigation">
        <div>
          <p class="profile-nav__label">Account</p>
          <a class="profile-nav__link is-active" href="/profile"><span aria-hidden="true">●</span> Profile</a>
        </div>
        <form method="post" action="/logout">
          ${csrfMarkup}
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
            ${csrfMarkup}
            ${fields.name}
            <button class="button button--secondary" type="submit">Save name</button>
          </form>
        </div>
        <div class="profile-card ${emailFocus}" id="email-address">
          <div class="profile-card__heading">
            <span class="section-number">02</span>
            <div><h2>Email address</h2><p>We’ll ask you to confirm any new address.</p></div>
          </div>
          <form class="profile-form" method="post" action="/profile/email">
            ${csrfMarkup}
            ${fields.email}
            ${fields.emailPassword}
            <button class="button button--secondary" type="submit">Change email</button>
          </form>
        </div>
        <div class="profile-card ${passwordFocus}" id="password">
          <div class="profile-card__heading">
            <span class="section-number">03</span>
            <div><h2>Password</h2><p>Choose something unique that you don’t use elsewhere.</p></div>
          </div>
          <form class="profile-form" method="post" action="/profile/password">
            ${csrfMarkup}
            ${fields.oldPassword}
            <div class="profile-form__pair">
              ${fields.newPassword}
              ${fields.confirmation}
            </div>
            <button class="button button--secondary" type="submit">Update password</button>
          </form>
        </div>
      </div>
    </section>`;

  return layout({
    title: 'Your profile',
    page: 'profile',
    user,
    body,
  });
};

const notFoundPage = () => {
  const body = `
    <section class="not-found">
      <div class="not-found__number" aria-hidden="true">404</div>
      <p class="eyebrow">Lost your way?</p>
      <h1>This page is off the map.</h1>
      <p>The address may be incorrect, or the page may have moved somewhere new.</p>
      <a class="button button--primary" href="/">Return home <span aria-hidden="true">→</span></a>
    </section>`;

  return layout({ title: 'Page not found', page: 'not-found', body });
};

const inboxMessage = (email) => {
  const date = escapeHtml(new Date(email.createdAt).toLocaleString());
  const recipient = escapeHtml(email.to);
  const subject = escapeHtml(email.subject);

  return `<article class="inbox-message">
    <div><span>${recipient}</span><time>${date}</time></div>
    <h2>${subject}</h2>
    <div class="email-body">${email.html}</div>
  </article>`;
};

const inboxPage = ({ emails }) => {
  const messages = emails.length
    ? emails.map(inboxMessage).join('')
    : emptyInbox;
  const body = `
    <section class="inbox-shell">
      <p class="eyebrow">Local development</p>
      <h1>Email preview</h1>
      <p>Messages sent by the application appear here when no email provider is configured.</p>
      <div class="inbox-list">${messages}</div>
    </section>`;

  return layout({ title: 'Development inbox', page: 'inbox', body });
};

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
