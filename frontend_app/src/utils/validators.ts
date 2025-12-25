export function validateName(value: string) {
  const name = value.trim();
  const NAME_PATTERN = /^[\p{L}\s'-]{2,30}$/u;

  if (!name) {
    return "Name is required";
  }

  if (!NAME_PATTERN.test(name)) {
    return "Name is not valid";
  }
}

export function validateEmail(value: string) {
  const EMAIL_PATTERN = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!value) return "Email is required";
  if (!EMAIL_PATTERN.test(value)) return "Email is not valid";
}

export function validatePassword(value: string) {
  if (!value) return "Password is required";
  if (value.length < 6) return "At least 6 characters";
}

export function validateConfirmPassword(
  value: string,
  password: string
) {
  if (!value) return "Please confirm password";
  if (value !== password) return "Passwords do not match";
}
