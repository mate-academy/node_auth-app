// eslint-disable-next-line react-refresh/only-export-components
export function isValidPassword(password) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  return regex.test(password);
}

export function PasswordRules() {
  return (
    <ul>
      <li>Minimum 8 characters</li>
      <li>Capital letter</li>
      <li>Lowercase letter</li>
      <li>Number</li>
      <li>Special character</li>
    </ul>
  );
}
