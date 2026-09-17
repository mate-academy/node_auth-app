/* eslint-disable no-unused-vars */
'use strict';

function showMessage(el, text, type) {
  el.className = `message ${type}`;
  el.textContent = text;
}

function clearMessage(el) {
  el.className = 'message';
  el.textContent = '';
}
