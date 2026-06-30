import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { closeLoginModal, openRegisterModal, loginUser } from '../../../store/authSlice';
import { type AppDispatch, type RootState } from '../../../store'; // Переконайся, що імпортуєш RootState

const LoginModal = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { error } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleClose = () => {
    dispatch(closeLoginModal());
  };

  const switchToRegister = () => {
    dispatch(openRegisterModal());
  };

  const handleForgot = () => {
    handleClose();
    navigate('/forgot-password');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(loginUser({ email, password })).unwrap();

      handleClose();
      navigate('/profile');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={handleClose}>&times;</button>
        <h2>Вхід у систему</h2>

        {error && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
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

          <div className="form-helpers">
            <button type="button" className="link-btn" onClick={handleForgot}>
              Забули пароль?
            </button>
          </div>

          <button type="submit" className="btn-primary full-width">Увійти</button>
        </form>

        <p className="modal-footer">
          Немає акаунта? <button type="button" className="link-btn" onClick={switchToRegister}>Створити зараз</button>
        </p>
      </div>
    </div>
  );
};

export default LoginModal;
