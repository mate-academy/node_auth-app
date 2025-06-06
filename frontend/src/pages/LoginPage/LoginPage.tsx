import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import styles from './LoginPage.module.scss';

import { usePageError } from '../../hooks/usePageError';
import { useAuth } from '../../components/AuthContext';
import { AxiosError } from 'axios';
import React, { useState } from 'react';
import { validateEmail, validatePassword } from '../../utils/validators';
import { Loader } from '../../components/Loader';

export const LoginPage: React.FC = () => {
  const [isExiting, setIsExiting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [error, setError] = usePageError('');
  const { login, isChecked, currentUser } = useAuth();

  if (isChecked && currentUser) {
    return <Navigate to="/profile" />;
  }

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  const handleGithubLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/github`;
  };

  const handleNavigate = (path: string) => {
    setIsExiting(true);

    setTimeout(() => {
      navigate(path);
    }, 1100);
  };

  return (
    <div className={styles.container}>
      <div className={styles.nav}>
        <div className={styles.navBlock}>
          <button
            onClick={() => handleNavigate('/')}
            className={`${styles.iconLink} animate__animated ${isExiting ? 'animate__fadeOutLeft fadeOut_450' : 'animate__fadeInLeft'}`}
          ></button>
        </div>
      </div>

      <h2
        className={`${styles.title} animate__animated ${isExiting ? 'animate__fadeOut fadeOut_400' : 'animate__fadeIn fadeIn_50'}`}
      >
        Вхід в особистий кабінет
      </h2>

      <Formik
        initialValues={{
          email: '',
          password: '',
        }}
        validateOnMount={true}
        onSubmit={({ email, password }) => {
          return login(email, password)
            .then(() => {
              const state = location.state as { from?: Location };
              navigate(state.from?.pathname ?? '/profile');
            })
            .catch((error: AxiosError<{ message?: string }>) => {
              setError(error.response?.data?.message ?? '');
            });
        }}
      >
        {({ touched, errors, isSubmitting }) => (
          <Form className={styles.form}>
            <div className={`${styles.formGroup} animate__animated ${isExiting ? 'animate__fadeOutDown fadeOut_350' : 'animate__fadeInUp fadeIn_100'}`}>
            <label htmlFor="email" className={styles.label}>Електронна пошта</label>
            
              <Field
                validate={validateEmail}
                name="email"
                type="email"
                id="email"
                placeholder="e.g. bobsmith@gmail.com"
                className={`${styles.input} ${errors.email && touched.email ? styles.inputError : ''}`}
              />

              {touched.email && errors.email && (
                <div className={styles.textContainer}>
                  <p className={styles.error}>{errors.email}</p>
                </div>
              )}
            </div>

            <div className={`${styles.formGroup} animate__animated ${isExiting ? 'animate__fadeOutDown fadeOut_300' : 'animate__fadeInUp fadeIn_150'}`}>
              <label htmlFor="password" className={styles.label}>Пароль</label>
              <Field
                validate={validatePassword}
                name="password"
                type="password"
                id="password"
                placeholder="*******"
                className={`${styles.input} ${errors.password && touched.password ? styles.inputError : ''}`}
              />

              {touched.password && errors.password && (
                <div className={styles.textContainer}>
                  <p className={styles.error}>{errors.password}</p>
                </div>
              )}
            </div>

            <Link
              to={'/password-reset'}
              className={`${styles.forgotePass} animate__animated ${isExiting ? 'animate__fadeOutDown' : 'animate__fadeInUp fadeIn_450'}`}
            >
              Забули пароль?
            </Link>

            {error && <p className={styles.globalError}>{error}</p>}

            <button
              type="submit"
              className={`${styles.submitBtn} animate__animated 
                ${isExiting
                  ? 'animate__fadeOutDown fadeOut_150'
                  : 'animate__fadeInUp fadeIn_300'
                }
              `}
              disabled={isSubmitting || !!errors.email || !!errors.password}
            >
              {!isSubmitting ? ('Увійти') : (<Loader />)}
            </button>
              
            <div className={`${styles.socialLogin} animate__animated ${isExiting ? 'animate__fadeOutDown fadeOut_100' : 'animate__fadeInUp fadeIn_350'}`}>
              <p className={styles.socialTitle}>Або увійти за допомогою:</p>
              <div className={styles.socialIcons}>
                <button
                  type="button"
                  className={`${styles.socialBtn} ${styles.github}`}
                  onClick={handleGithubLogin}
                ></button>
                <button
                  type="button"
                  className={`${styles.socialBtn} ${styles.google}`}
                  onClick={handleGoogleLogin}
                ></button>
                {/* <button className={`${styles.socialBtn} ${styles.facebook}`}></button> */}
              </div>
            </div>
            
            <div className={`${styles.loginLink} animate__animated ${isExiting ? 'animate__fadeOutDown' : 'animate__fadeInUp fadeIn_450'}`}>
              <span>Ще не маєте особистого кабінета?</span>
              <Link to="/sign-up">Зареєструватись</Link>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};
