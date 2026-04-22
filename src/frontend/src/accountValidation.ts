const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateOldPassword(
  password: string,
  requiresCurrentPassword: boolean,
): string[] {
  if (!requiresCurrentPassword) {
    return [];
  }

  if (password.length === 0) {
    return ['Old password is required'];
  }

  return [];
}

export function validateCurrentPassword(password: string): string[] {
  if (password.length === 0) {
    return ['Password is required'];
  }

  return [];
}

export function validateNewPassword(password: string): string[] {
  const errors: string[] = [];

  if (password.length < 12) {
    errors.push('At least 12 characters');
  }

  if ((password.match(/\d/g) ?? []).length < 2) {
    errors.push('At least 2 numbers');
  }

  return errors;
}

export function validateNewName(name: string): string[] {
  if (name.trim().length === 0) {
    return ['Name is required'];
  }

  return [];
}

export function validateNewEmail(email: string): string[] {
  const trimmedEmail = email.trim();

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return ['Invalid email address'];
  }

  return [];
}

export function validatePasswordConfirmation(
  newPassword: string,
  confirmPassword: string,
): string[] {
  if (confirmPassword.length === 0) {
    return ['Please confirm the new password'];
  }

  if (newPassword !== confirmPassword) {
    return ['Passwords do not match'];
  }

  return [];
}

export function validateEmailConfirmation(
  newEmail: string,
  confirmEmail: string,
): string[] {
  if (confirmEmail.trim().length === 0) {
    return ['Please confirm the new email'];
  }

  if (newEmail.trim() !== confirmEmail.trim()) {
    return ['Email addresses do not match'];
  }

  return [];
}
