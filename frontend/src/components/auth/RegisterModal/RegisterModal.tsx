import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { closeRegisterModal, openLoginModal, registerUser } from '../../../store/authSlice';
import { type AppDispatch } from '../../../store';

const RegisterModal = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const isLengthValid = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasLetter = /[a-zA-Z]/.test(password);
  const isFormValid = isLengthValid && hasNumber && hasLetter && name && email;

  const handleClose = () => {
    dispatch(closeRegisterModal());
  };

  const switchToLogin = () => {
    dispatch(openLoginModal());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    try {
      await dispatch(registerUser({ name, email, password })).unwrap();
      setIsSuccess(true);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={handleClose}>&times;</button>
        <h2>Реєстрація</h2>

        {isSuccess ? (
          <div className="alert-success">
            Лист для активації успішно надіслано! Перевірте пошту.
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Ім'я</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Генк Ріарден"
                required
              />
            </div>

            <div className="form-group">
              <label>Електронна пошта</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="password-rules">
              <p className="rules-title">Вимоги до пароля:</p>
              <ul>
                <li className={`rule-item ${isLengthValid ? 'valid' : 'invalid'}`}>
                  Мінімум 8 символів
                </li>
                <li className={`rule-item ${hasNumber ? 'valid' : 'invalid'}`}>
                  Хоча б одна цифра
                </li>
                <li className={`rule-item ${hasLetter ? 'valid' : 'invalid'}`}>
                  Хоча б одна латинська літера
                </li>
              </ul>
            </div>

            <button type="submit" className="btn-primary full-width" disabled={!isFormValid}>
              Зареєструватися
            </button>
          </form>
        )}

        <p className="modal-footer">
          Вже є акаунт? <button type="button" className="link-btn" onClick={switchToLogin}>Увійти</button>
        </p>
      </div>
    </div>
  );
};

export default RegisterModal;
