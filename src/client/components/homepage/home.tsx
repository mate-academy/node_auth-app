import React from 'react';
import { NavLink } from 'react-router-dom';

export const Homepage: React.FC = () => {
  return (
    <section className="hero">
      <div className="hero__container">
        <div className="hero__content">
          <h1 className="hero__title">Welcome</h1>
          <NavLink className="hero__link" to={'/login'}>
            Login
          </NavLink>
          <NavLink className="hero__link" to={'/register'}>
            Register
          </NavLink>
        </div>

        <span className="hero__image"></span>
      </div>
    </section>
  );
};
