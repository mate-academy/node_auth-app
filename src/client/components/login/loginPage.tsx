import React from 'react';
import { User } from '../../types/allTypes';
import { postData } from '../../utils/fecthClient';
import { NavLink, useNavigate } from 'react-router-dom';
import { useFormData } from '../../utils/useFormData';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handlePostData = (data: User) =>
    postData('/login', data).then((response) => {
      navigate(`/profile/${response.user.id}`);
    });

  const { formData, errors, handleChange, handleSubmit } = useFormData(
    handlePostData,
    '',
  );

  return (
    <section className="login-page">
      <div className="login-page__container">
        <div className="login-page__content">
          <h2 className="login-page__title">Welcome Back</h2>
          <form action="" onSubmit={handleSubmit} className="login__form">
            <label className="login__form-label">Email:</label>
            <input
              className="login__form-text-name"
              placeholder="Enter you email"
              value={formData.email}
              onChange={handleChange}
              name="email"
              type="email"
            />
            {errors.email && (
              <p className="login__form-text-alert">{errors.email}</p>
            )}
            <label className="login__form-label">Password:</label>
            <input
              className="login__form-text-name
              login__form-text-name--margin-bottom"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              type="password"
            />
            {errors.password && (
              <p className="login__form-text-alert">{errors.password}</p>
            )}
            <NavLink className="login__form-password-recover" to="/recover">
              Forgot your password?
            </NavLink>
            <button className="login__form-button" type="submit">
              login
            </button>
          </form>
        </div>
        <span className="login-page__image"></span>
      </div>
    </section>
  );
};
