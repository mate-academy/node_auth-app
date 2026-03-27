import { useEffect, useMemo } from 'react';
import styles from './ValidationPassword.module.scss';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const ValidationPassword = ({ password, setValid }) => {
  // Об'єкт для відстеження окремих правил (для візуалізації)
  const validation = useMemo(() => ({
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&]/.test(password),
  }), [password]);

  const isFormValid = PASSWORD_REGEX.test(password);

  useEffect(() => {
    setValid(isFormValid);
  }, [isFormValid, setValid]);

  return (
    <ul className="password-hints">
      <li className={validation.length ? styles.valid : styles.invalid}>Мінімум 8 символів</li>
      <li className={validation.upper ? styles.valid : styles.invalid}>Велика літера (A-Z)</li>
      <li className={validation.number ? styles.valid : styles.invalid}>Цифра (0-9)</li>
      <li className={validation.special ? styles.valid : styles.invalid}>Спецсимвол (@$!%*?&)</li>
    </ul>
  );
};

{/* <li className={validation.special ? 'valid' : 'invalid'}>Спецсимвол (@$!%*?&)</li> */}
