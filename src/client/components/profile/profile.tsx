import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormErros, User } from '../../types/allTypes';
import {
  getUserAutentication,
  postLogout,
  uptdateUser,
} from '../../utils/fecthClient';

export const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [nameInput, setNameInput] = useState({ name: '' });
  const [passwordInput, setPasswordInput] = useState({
    password: '',
    newPassword: '',
    confirmation: '',
  });
  const [emailInput, setEmailInput] = useState({ password: '', newEmail: '' });
  const [errors, setErrors] = useState<FormErros>();
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    getUserAutentication(`/profile/${id}`)
      .then((response) => {
        setUser(response);
      })
      .catch((error) => {
        setErrors(error);
      });
  }, [id]);

  const handleLogout = () => {
    postLogout('/logout')
      .then((response) => {
        navigate('/login');
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error);
      });
  };

  const handlePasswordSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    uptdateUser(`/update/${id}`, passwordInput)
      .then((response) => {
        setPasswordInput({ password: '', newPassword: '', confirmation: '' });
        setErrors({});
      })
      .catch((error) => {
        setErrors(error.errors || { message: error.message });
      });
  };
  const handleNameSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    uptdateUser(`/update/${id}`, nameInput)
      .then((response) => {
        setUser((prev) => (prev ? { ...prev, name: response.name } : null));
        setNameInput({ name: '' });
        setErrors({});
      })
      .catch((error) => {
        setErrors(error.errors || { message: error.message });
      });
  };
  const handleEmailSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    uptdateUser(`/update/${id}`, emailInput)
      .then((response) => {
        setUser((prev) => (prev ? { ...prev, email: response.email } : null));
        setEmailInput({ password: '', newEmail: '' });
        setErrors({});
      })
      .catch((error) => {
        setErrors(error.errors || { message: error.message });
      });
  };

  return (
    <section className="profile">
      {!user ? (
        <p className="profile__notfound">unauthorized</p>
      ) : (
        <div className="profile__container">
          <div className="profile__shape">
            <div className="profile__shape-content">
              <span className="profile__image" />
              <div className="profile__card-name">
                <h2 className="profile__name">{user.name}</h2>
                <p className="profile__email">{user.email}</p>
              </div>
              <form
                className="profile__form profile__form--colum-1"
                onSubmit={handleNameSubmit}
              >
                <label className="profile__input-name" htmlFor="">
                  Update name
                </label>
                <input
                  type="text"
                  className="profile__input"
                  name="name"
                  placeholder="new name"
                  onChange={(e) => setNameInput({ name: e.target.value })}
                  value={nameInput.name}
                />
                <div className="profile__logout-container">
                  <div>
                    {errors && (
                      <p className="profile__errors-message">{errors.name}</p>
                    )}
                  </div>
                  <button type="submit" className="profile__logout">
                    Change name
                  </button>
                </div>
              </form>
              <form className="profile__form" onSubmit={handlePasswordSubmit}>
                <label className="profile__input-name" htmlFor="">
                  Update password
                </label>

                <input
                  type="password"
                  className="profile__input"
                  name="password"
                  placeholder="password"
                  onChange={(e) =>
                    setPasswordInput((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  value={passwordInput.password}
                />
                <input
                  type="text"
                  className="profile__input"
                  name="newPassword"
                  placeholder="new password"
                  onChange={(e) =>
                    setPasswordInput((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  value={passwordInput.newPassword}
                />
                <input
                  type="text"
                  className="profile__input"
                  name="confirmation"
                  placeholder="confirmation"
                  onChange={(e) =>
                    setPasswordInput((prev) => ({
                      ...prev,
                      confirmation: e.target.value,
                    }))
                  }
                  value={passwordInput.confirmation}
                />
                <div className="profile__logout-container">
                  <div>
                    {errors && (
                      <p className="profile__errors-message">
                        {errors.password || errors.confirmation || errors.blank}
                      </p>
                    )}
                  </div>
                  <button type="submit" className="profile__logout">
                    Change password
                  </button>
                </div>
              </form>
              <form className="profile__form" onSubmit={handleEmailSubmit}>
                <label className="profile__input-name" htmlFor="">
                  Update email
                </label>
                <input
                  type="password"
                  className="profile__input"
                  name="password"
                  placeholder="password"
                  onChange={(e) =>
                    setEmailInput((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  value={emailInput.password}
                />
                <input
                  type="text"
                  className="profile__input"
                  name="confirmation"
                  placeholder="new email"
                  onChange={(e) =>
                    setEmailInput((prev) => ({
                      ...prev,
                      newEmail: e.target.value,
                    }))
                  }
                  value={emailInput.newEmail}
                />
                <div className="profile__logout-container">
                  <div>
                    {errors && (
                      <p className="profile__errors-message">
                        {errors.newEmail}
                      </p>
                    )}
                  </div>
                  <button type="submit" className="profile__logout">
                    Change email
                  </button>
                </div>
              </form>
              {errors && (
                <p className="profile__errors-message">{errors.message}</p>
              )}
              <div className="profile__button-container">
                <button
                  onClick={handleLogout}
                  className="profile__logout profile__logout--red"
                >
                  Log out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
