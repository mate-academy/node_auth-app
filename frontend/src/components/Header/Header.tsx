import React, { useContext } from 'react';
import { ShieldCheck } from 'lucide-react';
import './Header.scss';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Определяем интерфейс пользователя

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  return (
    <nav className="header">
      <div className="header__container">
        {/* Логотип */}
        <div
          className="header__logo"
          onClick={() => navigate(user ? 'profile' : 'login')}
        >
          <div className="header__logo-icon">
            <ShieldCheck size={24} />
          </div>
          <span className="header__logo-text">
            Auth<span className="header__logo-text--accent">App</span>
          </span>
        </div>

        {/* Правая часть */}
        <div className="header__actions">
          {user ? (
            <div className="header__user">
              <div className="header__user-info">
                <p className="header__user-name">{user.name}</p>
                <p className="header__user-email">{user.email}</p>
              </div>
              <div className="header__avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          ) : (
            <div className="header__auth-buttons">
              <button
                onClick={() => navigate('login')}
                className="btn-text"
              >
                Login
              </button>
              <button
                onClick={() => navigate('registration')}
                className="btn-primary"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};