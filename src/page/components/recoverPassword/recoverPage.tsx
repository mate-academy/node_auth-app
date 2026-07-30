import React, { useState } from 'react';
import { useFormData } from '../../utils/useFormData';
import { User } from '../../types/allTypes';
import { postData } from '../../utils/fecthClient';
import { Registered } from '../registered/registered';

export const RecoverPage: React.FC = () => {
  const [user, setUser] = useState();

  const handlePostData = (data: User) =>
    postData('/recover', { email: data.email }).then((response) => {
      setUser(response);
    });

  const { formData, errors, handleChange, handleSubmit } =
    useFormData(handlePostData);

  return (
    <>
      {user ? (
        <Registered />
      ) : (
        <section className="recover-page">
          <div className="recover-page__container">
            <div className="recover-page__content">
              <h2 className="recover-page__title">Recover your password</h2>
              <div>
                <form
                  action=""
                  onSubmit={handleSubmit}
                  className="recover-page__form"
                >
                  <label className="recover-page__label">Email:</label>
                  <input
                    className="recover-page__form-text-name"
                    placeholder="Enter you email"
                    value={formData.email}
                    onChange={handleChange}
                    name="email"
                    type="email"
                  />
                  {errors.email && (
                    <p className="recover-page__form-text-alert">
                      {errors.email}
                    </p>
                  )}
                  <button className="recover-page__form-button" type="submit">
                    Advance
                  </button>
                </form>
              </div>
            </div>
            {/* <span className="recover-page__image"></span>  */}
          </div>
        </section>
      )}
    </>
  );
};
