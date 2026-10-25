/* eslint-env browser */
'use strict';

// Shows which password rules are met while the user types.
const inputs = document.querySelectorAll('input[data-check-rules]');

inputs.forEach((input) => {
  const list = document.querySelector(`[data-rules-for="${input.id}"]`);

  if (!list) {
    return;
  }

  const items = list.querySelectorAll('li');

  const update = () => {
    items.forEach((item) => {
      const met = new RegExp(item.dataset.pattern).test(input.value);

      item.classList.toggle('ok', met);
    });
  };

  input.addEventListener('input', update);
  update();
});
