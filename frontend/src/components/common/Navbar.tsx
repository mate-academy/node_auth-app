import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { type RootState, type AppDispatch } from '../../store';
import { openLoginModal, openRegisterModal, logoutLocal } from '../../store/authSlice';

const Navbar: React.FC = () => {
  const { isAuth, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutLocal());
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        Auth.API
      </div>

      {!isAuth ? (
        <div className="navbar-menu">
          <button className="btn-secondary" onClick={() => dispatch(openRegisterModal())}>
            Зареєструватися
          </button>
          <button className="btn-primary" onClick={() => dispatch(openLoginModal())}>
            Увійти
          </button>
        </div>
      ) : (
        <div className="navbar-menu">
          <span className="user-name">Вітаю, {user?.name || 'Користувач'}</span>
          <button className="btn-secondary" onClick={() => navigate('/profile')}>
            Профіль
          </button>
          <button className="btn-danger" onClick={handleLogout}>
            Вийти
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
