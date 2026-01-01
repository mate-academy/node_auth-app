import { useState } from 'react';
import './RegistrationPage.scss';
import { User, Mail, Lock, Eye, EyeOff, CheckCircle, LoaderCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

export const RegistrationPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [serverResponse, setServerResponse] = useState('');

  // Логика валидации пароля
  const rules = {
    length: formData.password.length >= 8,
    upper: /[A-Z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[!@#$%^&*]/.test(formData.password),
  };

  const isFormValid = Object.values(rules).every(Boolean) && formData.name && formData.email;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { name, email, password } = formData;

    setLoading(true);
    authService.register(name, email, password)
      .then((res) => {
        setServerResponse(res.message);
      })
      .catch(error => {
        const errorMessage = error.response?.data?.message || error.message;

        if (errorMessage) {
          setError(errorMessage);
        }
      })
      .finally(() => setLoading(false));
  };

  return (
    <section className="auth-page">
      <div className="auth-card">
        <header className="auth-card__header">
          <h2 className="auth-card__title">Registration</h2>
          <p className="auth-card__subtitle">Create an account to get started</p>
        </header>

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Поле Имя */}
          <div className="auth-form__field">
            <label className="auth-form__label" htmlFor="name">Name</label>
            <div className="auth-form__input-wrapper">
              <span className="auth-form__icon auth-form__icon--left">
                <User size={18} />
              </span>
              <input
                className="auth-form__input"
                type="text"
                id="name"
                name="name"
                placeholder="Alex"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Поле Email */}
          <div className="auth-form__field">
            <label className="auth-form__label" htmlFor="email">Email</label>
            <div className="auth-form__input-wrapper">
              <span className="auth-form__icon auth-form__icon--left">
                <Mail size={18} />
              </span>
              <input
                className="auth-form__input"
                type="email"
                id="email"
                name="email"
                placeholder="example@mail.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Поле Пароль */}
          <div className="auth-form__field">
            <label className="auth-form__label" htmlFor="password">Password</label>
            <div className="auth-form__input-wrapper">
              <span className="auth-form__icon auth-form__icon--left">
                <Lock size={18} />
              </span>
              <input
                className="auth-form__input"
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="auth-form__password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Список требований к паролю */}
          <div className="password-requirements">
            <p className="password-requirements__title">Password requirements:</p>
            <ul className="password-requirements__list">
              <li className={`password-requirements__item ${rules.length ? 'password-requirements__item--valid' : ''}`}>
                <span className="password-requirements__icon"></span>
                {rules.length && <CheckCircle size={12} />} At least 8 characters
              </li>
              <li className={`password-requirements__item ${rules.upper ? 'password-requirements__item--valid' : ''}`}>
                <span className="password-requirements__icon"></span>
                {rules.upper && <CheckCircle size={12} />} Uppercase letter
              </li>
              <li className={`password-requirements__item ${rules.number ? 'password-requirements__item--valid' : ''}`}>
                <span className="password-requirements__icon"></span>
                {rules.number && <CheckCircle size={12} />} A number
              </li>
              <li className={`password-requirements__item ${rules.special ? 'password-requirements__item--valid' : ''}`}>
                <span className="password-requirements__icon"></span>
                {rules.special && <CheckCircle size={12} />} Special character (!@#$)
              </li>
            </ul>
          </div>

          <button
            type="submit"
            className="auth-form__submit-btn"
            disabled={!isFormValid}
          >
            {loading
              ? <LoaderCircle className='auth-form__loader' />
              : 'Sign Up'
            }
          </button>
          {serverResponse && serverResponse}
          {error && <h1>{error}</h1>}
        </form>

        <footer className="auth-card__footer">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="auth-card__link"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            Log In
          </button>
        </footer>
      </div>
    </section>
  );
}