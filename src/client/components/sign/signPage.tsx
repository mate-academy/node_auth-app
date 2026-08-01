import React, { useState } from 'react';
import { User } from '../../types/allTypes';
import { postData } from '../../utils/fecthClient';
import { Registered } from '../registered/registered';
import { useFormData } from '../../utils/useFormData';

export const SignPage: React.FC = () => {
  const [registered, setRegistered] = useState<boolean>(false);

  const handlePostData = (data: User) => {
    return postData('/register', data).then((response) => {
      alert('Formulario enviado com sucesso!');
      setRegistered(true);
    });
  };

  const { formData, errors, handleChange, handleSubmit } = useFormData(
    handlePostData,
    '',
  );

  return (
    <section className="sign-page">
      {registered === true ? (
        <Registered />
      ) : (
        <div className="sign-page__container">
          <div className="sign-page__content">
            <h1 className="sign-page__title">Get Started Now</h1>
            <form action="" onSubmit={handleSubmit} className="sign-form">
              <label className="sign-form__label">Name:</label>
              <input
                className="sign-form__text-name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                name="name"
                type="text"
              />
              {errors.name && (
                <p className="sign-form__text-alert">{errors.name}</p>
              )}
              <label className="sign-form__label">Email:</label>
              <input
                className="sign-form__text-name"
                placeholder="Enter you email"
                value={formData.email}
                onChange={handleChange}
                name="email"
                type="email"
              />
              {errors.email && (
                <p className="sign-form__text-alert">{errors.email}</p>
              )}
              <label className="sign-form__label">Password:</label>
              <input
                className="sign-form__text-name"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                type="password"
              />
              {errors.password && (
                <p className="sign-form__text-alert">{errors.password}</p>
              )}
              <button className="sign-form__button" type="submit">
                Signup
              </button>
            </form>
          </div>
          <span className="sign-page__image"></span>
        </div>
      )}
    </section>
  );
};
