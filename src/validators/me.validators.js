function isEmail(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export const meValidators = {
  updateName(body = {}) {
    const errors = {};

    if (!body.name || String(body.name).trim().length === 0) {
      errors.name = 'Name is required';
    }

    if (Object.keys(errors).length) {
      const err = new Error('Validation error');

      err.status = 400;
      err.errors = errors;
      throw err;
    }

    return { name: String(body.name).trim() };
  },

  updatePassword(body = {}) {
    const errors = {};

    if (!body.oldPassword) {
      errors.oldPassword = 'Old password is required';
    }

    if (!body.newPassword || typeof body.newPassword !== 'string') {
      errors.newPassword = 'New password is required';
    }

    if (body.newPassword !== body.confirmation) {
      errors.confirmation = 'Passwords do not match';
    }

    if (Object.keys(errors).length) {
      const err = new Error('Validation error');

      err.status = 400;
      err.errors = errors;
      throw err;
    }

    return {
      oldPassword: body.oldPassword,
      newPassword: body.newPassword,
      confirmation: body.confirmation,
    };
  },

  changeEmailRequest(body = {}) {
    const errors = {};

    if (!body.password) {
      errors.password = 'Password is required';
    }

    if (!body.newEmail || !isEmail(body.newEmail)) {
      errors.newEmail = 'Valid new email is required';
    }

    if (body.newEmail !== body.confirmation) {
      errors.confirmation = 'Emails do not match';
    }

    if (Object.keys(errors).length) {
      const err = new Error('Validation error');

      err.status = 400;
      err.errors = errors;
      throw err;
    }

    return {
      password: body.password,
      newEmail: String(body.newEmail).toLowerCase().trim(),
      confirmation: String(body.confirmation).toLowerCase().trim(),
    };
  },
};
