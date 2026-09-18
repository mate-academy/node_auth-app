/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
'use strict';

function extractToken(queryParam, pathSegment) {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get(queryParam);

  if (fromQuery) {
    return fromQuery;
  }

  const match = window.location.pathname.match(
    new RegExp(`/${pathSegment}/([^/?#]+)`),
  );

  return match ? decodeURIComponent(match[1]) : null;
}

function redirectIfAuthenticated(target = '/pages/profile.html') {
  if (session.getToken()) {
    window.location.href = target;
  }
}

function requireAuth(loginPage = '/pages/login.html') {
  if (!session.getToken()) {
    window.location.href = loginPage;

    return false;
  }

  return true;
}
