import React, { useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { User } from '../../types/allTypes';
import { postData } from '../../utils/fecthClient';
import { useFormData } from '../../utils/useFormData';

export const ChangePassword: React.FC = () => {
  const [succsess, setSuccsess] = useState<boolean>(false);
  const { activationToken } = useParams();

  const handlePostData = (data: User) => {
    return postData(`/recover/${activationToken}`, data).then((response) => {
      alert('Password successfully changed');
      setSuccsess(true);
    });
  };

  const { formData, errors, handleChange, handleSubmit } = useFormData(
    handlePostData,
    '',
  );

  const Succsess = () => {
    return (
      <>
        <div className="succsess__content">
          <p className="succsess__info">Password successfully reset</p>
          <NavLink className="succsess__button" to={'/login'}>
            Log in
          </NavLink>
        </div>
      </>
    );
  };

  return (
    <section className="changepassword-page">
      {succsess ? (
        <Succsess />
      ) : (
        <div className="changepassword-page__container">
          <div className="changepassword-page__content">
            <div>
              <h2 className="changepassword-page__title">Change password</h2>
              <form action="" onSubmit={handleSubmit} className="form">
                <p>Password:</p>
                <input
                  className="form__text-name"
                  placeholder="New password"
                  value={formData.password}
                  onChange={handleChange}
                  name="password"
                  type="password"
                />
                {errors.password && (
                  <p className="form__text-alert">{errors.password}</p>
                )}
                <p>Confirmation:</p>
                <input
                  className="form__text-name form__text-name--margin-bottom"
                  name="confirmation"
                  value={formData.confirmation}
                  onChange={handleChange}
                  placeholder="Confirmation password"
                  type="password"
                />
                {errors.newPassword && (
                  <p className="form__text-alert">{errors.newPassword}</p>
                )}
                <button className="form__button" type="submit">
                  Advance
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
