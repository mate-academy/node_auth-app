import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import { useAuth } from '../../components/AuthContext';
import { userService } from '../../services/userService';
import styles from './ProfilePage.module.scss';
import { validateEmail, validateName, validatePassword } from '../../utils/validators';
import { AxiosError } from 'axios';
import { usePageError } from '../../hooks/usePageError';
import { useNavigate } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [successNameMessage, setSuccessNameMessage] = useState('');
  const [successEmailMessage, setSuccessEmailMessage] = useState('');
  const [successPasswordMessage, setSuccessPasswordMessage] = useState('');
  const [error, setError] = usePageError('');
  const [isDropdownNameOpen, setIsDropdownNameOpen] = useState(false);
  const [isDropdownMailOpen, setIsDropdownMailOpen] = useState(false);
  const [isDropdownPassOpen, setIsDropdownPassOpen] = useState(false);
  const { currentUser, setCurrentUser, logout } = useAuth();

  const handleLogout = () => {
    logout()
      .then(() => {
        navigate('/login');
      })
      .catch((error: AxiosError<{ message?: string }>) => {
        setError(error.response?.data?.message ?? '');
      });
  };

  return (
    <div className={styles.container}>
      <div className={styles.personalInfo}>
        <img src="taras.jpg" alt="taras" className={styles.profilePhoto} />
        
        <div className={styles.profileInfo}>
          <h3 className={styles.name}>{currentUser?.name}</h3>
          <p className={styles.settings}>Налаштування профілю</p>
        </div>
      </div>
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.settingsCategory}>
        <h2 className={styles.title}>Налаштування</h2>

        <div className={styles.category}>
          <div className={styles.dropdownWrapper}>
            <button
              className={styles.settingsLink}
              onClick={() => setIsDropdownNameOpen(prev => !prev)}
            >
              <img
                src="icons/user.svg"
                alt="creditcard"
                className={styles.settingsIcon}
              />

              <span className={styles.settingsText}>
                Змінити імʼя
              </span>

              <div className={`${styles.arrowIcon} ${isDropdownNameOpen ? styles.rotate : ''}`}></div>
            </button>
            
            <div className={`${styles.dropdownName} ${isDropdownNameOpen ? styles.show : ''}`}>
              <Formik
                initialValues={{ name: '' }}
                enableReinitialize={true}
                validateOnMount={true}
                onSubmit={({ name }, { resetForm, setSubmitting }) => {
                  userService
                    .updateName(name)
                    .then(() => {
                      setSuccessNameMessage('Name updated successfully');
                      if (currentUser) {
                        setCurrentUser({ ...currentUser, name });
                      }
                      resetForm();
                      setTimeout(() => setSuccessNameMessage(''), 3000);
                    })
                    .catch((error: AxiosError<{ message?: string }>) => {
                      setError(error.response?.data?.message ?? '');
                    })
                    .finally(() => {
                      setSubmitting(false);
                    });
                }}
              >
                {({ errors, touched, isSubmitting }) => (
                  <Form className={styles.form}>
                    <div className={styles.formGroup}>
                      <label htmlFor="name" className={styles.label}>Введіть імʼя</label>

                      <Field
                        validate={validateName}
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Введіть імʼя"
                        className={`${styles.input} ${errors.name && touched.name ? styles.inputError : ''}`}
                      />

                      {touched.name && errors.name && (
                        <div className={styles.textContainer}>
                          <p className={styles.error}>{errors.name}</p>
                        </div>
                      )}
                    </div>

                    {successNameMessage && (
                      <div className={styles.textContainer}>
                        <p className={styles.success}>{successNameMessage}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      className={styles.submitBtn}
                      disabled={isSubmitting}
                    >
                      Змінити імʼя
                    </button>
                  </Form>
                )}
              </Formik>
            </div>
          </div>

          <div className={styles.dropdownWrapper}>
            <button
              className={styles.settingsLink}
              onClick={() => setIsDropdownPassOpen(prev => !prev)}
            >
              <img
                src="icons/password.svg"
                alt="devices"
                className={styles.settingsIcon}
              />

              <span className={styles.settingsText}>
                Змінити пароль
              </span>

              <div className={`${styles.arrowIcon} ${isDropdownPassOpen ? styles.rotate : ''}`}></div>
            </button>

            <div className={`${styles.dropdownName} ${isDropdownPassOpen ? styles.show : ''}`}>
              <Formik
                initialValues={{
                  oldPassword: '',
                  newPassword: '',
                  confirmPassword: '',
                }}
                enableReinitialize={true}
                validateOnMount={true}
                validate={({ newPassword, confirmPassword }) => {
                  const errors: { confirmPassword?: string } = {};
                  if (newPassword !== confirmPassword) {
                    errors.confirmPassword = 'Passwords must match';
                  }
                  return errors;
                }}
                onSubmit={({ oldPassword, newPassword }, { resetForm, setSubmitting }) => {
                  userService
                    .updatePassword(oldPassword, newPassword)
                    .then(() => {
                      setSuccessPasswordMessage('Password updated successfully');
                      resetForm();
                      setTimeout(() => setSuccessPasswordMessage(''), 3000);
                    })
                    .catch((error: AxiosError<{ message?: string }>) => {
                      setError(error.response?.data?.message ?? '');
                    })
                    .finally(() => {
                      setSubmitting(false);
                    });
                }}
              >
                {({ errors, touched, isSubmitting }) => (
                  <Form className={styles.form}>
                    <div className={styles.formGroup}>
                      <label htmlFor="oldPassword" className={styles.label}>Старий пароль</label>

                      <Field
                        id="oldPassword"
                        name="oldPassword"
                        type="password"
                        placeholder="Введіть старий пароль"
                        className={`${styles.input} ${errors.oldPassword && touched.oldPassword ? styles.inputError : ''}`}
                      />

                      {(touched.oldPassword && errors.oldPassword) ? (
                        <div className={styles.textContainer}>
                          <p className={styles.error}>{errors.oldPassword}</p>
                        </div>
                      ) : (
                        <div className={styles.textContainer}>
                          <p className={styles.help}>
                            Залиште це поле пустим якщо ви зареєструвались за допомогою соціальних мереж.  
                          </p>
                        </div>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="newPassword" className={styles.label}>Новий пароль</label>

                      <Field
                        validate={validatePassword}
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        placeholder="Введіть новий пароль"
                        className={`${styles.input} ${errors.newPassword && touched.newPassword ? styles.inputError : ''}`}
                      />

                      {touched.newPassword && errors.newPassword && (
                        <div className={styles.textContainer}>
                          <p className={styles.error}>{errors.newPassword}</p>
                        </div>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="confirmPassword" className={styles.label}>Підтвердіть новий пароль</label>

                      <Field
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Підтвердіть новий пароль"
                        className={`${styles.input} ${errors.confirmPassword && touched.confirmPassword ? styles.inputError : ''}`}
                      />

                      {touched.confirmPassword && errors.confirmPassword && (
                        <div className={styles.textContainer}>
                          <p className={styles.error}>{errors.confirmPassword}</p>
                        </div>
                      )}
                    </div>

                    {successPasswordMessage && (
                      <div className={styles.textContainer}>
                        <p className={styles.success}>{successPasswordMessage}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      className={styles.submitBtn}
                      disabled={isSubmitting}
                    >
                      Змінити пароль
                    </button>
                  </Form>
                )}
              </Formik>
            </div>
          </div>

          <div className={styles.dropdownWrapper}>
            <button
              className={styles.settingsLink}
              onClick={() => setIsDropdownMailOpen(prev => !prev)}
            >
              <img
                src="icons/email.svg"
                alt="devices"
                className={styles.settingsIcon}
              />

              <span className={styles.settingsText}>
                Змінити електронну пошту
              </span>

              <div className={`${styles.arrowIcon} ${isDropdownMailOpen ? styles.rotate : ''}`}></div>
            </button>

            <div className={`${styles.dropdownName} ${isDropdownMailOpen ? styles.show : ''}`}>
              <Formik
                initialValues={{ password: '', newEmail: '' }}
                enableReinitialize={true}
                validateOnMount={true}
                onSubmit={({ password, newEmail }, { resetForm, setSubmitting }) => {
                  userService
                    .updateEmail(password, newEmail)
                    .then(() => {
                      setSuccessEmailMessage('Email updated successfully');
                      resetForm();
                      setTimeout(() => setSuccessEmailMessage(''), 3000);
                    })
                    .catch((error: AxiosError<{ message?: string }>) => {
                      setError(error.response?.data?.message ?? '');
                    })
                    .finally(() => {
                      setSubmitting(false);
                    });
                }}
              >
                {({ errors, touched, isSubmitting }) => (
                  <Form className={styles.form}>
                    <div className={styles.formGroup}>
                      <label htmlFor="password" className={styles.label}>
                        Введіть пароль
                      </label>

                      <Field
                        validate={validatePassword}
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Мій надійний пароль"
                        className={`${styles.input} ${errors.password && touched.password ? styles.inputError : ''}`}
                      />

                      {touched.password && errors.password && (
                        <div className={styles.textContainer}>
                          <p className={styles.error}>{errors.password}</p>
                        </div>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="newEmail" className={styles.label}>
                        Введіть нову електронну пошту
                      </label>

                      <Field
                        validate={validateEmail}
                        name="newEmail"
                        type="email"
                        id="newEmail"
                        placeholder="e.g. bobsmith@gmail.com"
                        className={`${styles.input} ${errors.newEmail && touched.newEmail ? styles.inputError : ''}`}
                      />

                      {touched.newEmail && errors.newEmail && (
                        <div className={styles.textContainer}>
                          <p className={styles.error}>{errors.newEmail}</p>
                        </div>
                      )}
                    </div>

                    {successEmailMessage && (
                      <div className={styles.textContainer}>
                        <p className={styles.success}>{successEmailMessage}</p>
                      </div>
                    )}

                    {error && <p className={styles.globalError}>{error}</p>}

                    <button
                      type="submit"
                      className={styles.submitBtn}
                      disabled={isSubmitting}
                    >
                      Змінити електронну пошту
                    </button>
                  </Form>
                )}
              </Formik>
            </div>
          </div>  
        </div>
      </div>

      <button
        className={styles.logout}
        onClick={handleLogout}
      >
        <img
          src="icons/exit.svg"
          alt="exit"
          className={styles.logoutIcon}
        />

        <span className={styles.logoutText}>Вийти з акаунта</span>
      </button>
    </div>
  );
};
