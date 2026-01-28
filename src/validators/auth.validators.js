function isEmail(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export const authValidators = {
  register(body = {}) {
    const errors = {};

    if (!body.name || String(body.name).trim().length === 0) {
      errors.name = 'Name is required';
    }

    if (!body.email || !isEmail(body.email)) {
      errors.email = 'Valid email is required';
    }

    if (!body.password || typeof body.password !== 'string') {
      errors.password = 'Password is required';
    }

    if (Object.keys(errors).length) {
      const err = new Error('Validation error');

      err.status = 400;
      err.errors = errors;
      throw err;
    }

    return {
      name: String(body.name).trim(),
      email: String(body.email).toLowerCase().trim(),
      password: body.password,
    };
  },

  login(body = {}) {
    const errors = {};

    if (!body.email || !isEmail(body.email)) {
      errors.email = 'Valid email is required';
    }

    if (!body.password || typeof body.password !== 'string') {
      errors.password = 'Password is required';
    }

    if (Object.keys(errors).length) {
      const err = new Error('Validation error');

      err.status = 400;
      err.errors = errors;
      throw err;
    }

    return {
      email: String(body.email).toLowerCase().trim(),
      password: body.password,
    };
  },

  resetRequest(body = {}) {
    const errors = {};

    if (!body.email || !isEmail(body.email)) {
      errors.email = 'Valid email is required';
    }

    if (Object.keys(errors).length) {
      const err = new Error('Validation error');

      err.status = 400;
      err.errors = errors;
      throw err;
    }

    return {
      email: String(body.email).toLowerCase().trim(),
    };
  },

  resetConfirm(body = {}) {
    const errors = {};

    if (!body.password || typeof body.password !== 'string') {
      errors.password = 'Password is required';
    }

    if (body.password !== body.confirmation) {
      errors.confirmation = 'Passwords do not match';
    }

    if (Object.keys(errors).length) {
      const err = new Error('Validation error');

      err.status = 400;
      err.errors = errors;
      throw err;
    }

    return {
      password: body.password,
    };
  },
};
