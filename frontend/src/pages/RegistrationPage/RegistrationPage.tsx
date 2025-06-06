import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, FieldProps } from 'formik';
import styles from './RegistrationPage.module.scss'

import { authService } from '../../services/authService';
import { AxiosError } from 'axios';
import { usePageError } from '../../hooks/usePageError';
import { useAuth } from '../../components/AuthContext';
import { validateEmail, validateName, validatePassword } from '../../utils/validators';
import { Loader } from '../../components/Loader';

type RegistrationError = AxiosError<{
  errors?: { name?: string; email?: string; password?: string };
  message: string;
}>;

export const RegistrationPage = () => {
  const [error, setError] = usePageError('');
  const [registered, setRegistered] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1);

  const { isChecked, currentUser } = useAuth();

  if (isChecked && currentUser) {
    return <Navigate to="/" />;
  }

  const handleNavigate = (path: string) => {
    setIsExiting(true);

    setTimeout(() => {
      navigate(path);
    }, 1700);
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  const handleGithubLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/github`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.nav}>
        <div className={styles.navBlock}>
          <button
            onClick={() => handleNavigate('/')}
            className={`${styles.iconLink} animate__animated ${isExiting ? 'animate__fadeOutLeft fadeOut_1000' : 'animate__fadeInLeft fadeIn_100'}`}
          ></button>

          <h4 className={`${styles.step} animate__animated ${isExiting ? 'animate__fadeOutUp fadeOut_900' : 'animate__fadeInDown'}`}>Крок {step} з 2</h4>
        </div>

        <div className={`${styles.navLine} animate__animated ${isExiting ? 'animate__fadeOut fadeOut_800' : 'animate__fadeIn fadeIn_200'}`}>
          <div className={styles.bgLine}></div>

          <div
            className={`${styles.mainLine} ${registered ? styles.secondStep : ''}`}
          ></div>
        </div>
      </div>

      <div className={`${styles.titleBlock} animate__animated ${isExiting ? 'animate__fadeOut fadeOut_700' : 'animate__fadeIn fadeIn_300'}`}>
        {registered ? (
          <>
            <h2 className={styles.title}>Підтвердження акаунту</h2>

            <div className={styles.confirmation}>
              <p>Ми відправили посилання для підтвердження на пошту:</p>
              <span className={styles.userEmail}>{email}</span>
            </div>
          </>
        ) : (
          <h2 className={styles.title}>Створити особистий кабінет</h2>
        )}
      </div>
      
      {!registered && (
        <Formik
          initialValues={{
            name: '',
            email: '',
            password: '',
            terms: false,
          }}
          validateOnMount={true}
          onSubmit={({ name, email, password }, formikHelpers) => {
            formikHelpers.setSubmitting(true);

            authService
              .register(name, email, password)
              .then(() => {
                setRegistered(true)
                setEmail(email);
                setStep(2);
              })
              .catch((error: RegistrationError) => {
                if (error.message) setError(error.message);
                if (!error.response?.data) return;

                const { errors, message } = error.response.data;

                formikHelpers.setFieldError('name', errors?.name);
                formikHelpers.setFieldError('email', errors?.email);
                formikHelpers.setFieldError('password', errors?.password);

                if (message) setError(message);
              })
              .finally(() => formikHelpers.setSubmitting(false));
          }}
        >
          {({ touched, errors, isSubmitting, values }) => (
            <Form className={styles.form}>
              <div className={`${styles.formGroup} animate__animated ${isExiting ? 'animate__fadeOutDown fadeOut_600' : 'animate__fadeInUp fadeIn_400'}`}>
                <label htmlFor="name" className={styles.label}>
                  Імʼя
                </label>

                <Field
                  validate={validateName}
                  name="name"
                  type="text"
                  id="name"
                  placeholder="Тарас"
                  className={`${styles.input} ${errors.name && touched.name ? styles.inputError : ''}`}
                />

                {touched.name && errors.name && (
                  <div className={styles.textContainer}>
                    <p className={styles.error}>{errors.name}</p>
                  </div>
                )}
              </div>

              <div className={`${styles.formGroup} animate__animated ${isExiting ? 'animate__fadeOutDown fadeOut_500' : 'animate__fadeInUp fadeIn_500'}`}>
                <label htmlFor="email" className={styles.label}>
                  Електронна пошта
                </label>

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

              <div className={`${styles.formGroup} animate__animated ${isExiting ? 'animate__fadeOutDown fadeOut_400' : 'animate__fadeInUp fadeIn_600'}`}>
                <label htmlFor="password" className={styles.label}>
                  Пароль
                </label>

                <Field
                  validate={validatePassword}
                  name="password"
                  type="password"
                  id="password"
                  placeholder="*******"
                  className={`${styles.input} ${errors.password && touched.password ? styles.inputError : ''}`}
                />

                {touched.password && errors.password ? (
                  <div className={styles.textContainer}>
                    <p className={styles.error}>{errors.password}</p>
                  </div>
                ) : (
                  <div className={styles.textContainer}>
                    <p className={styles.help}>
                      Пароль має містити мінімум 6 символів.
                    </p>
                  </div>
                )}
              </div>

              <div className={`${styles.checkboxGroup} animate__animated ${isExiting ? 'animate__fadeOutDown fadeOut_200' : 'animate__fadeInUp fadeIn_800'}`}>
                <Field name="terms">
                  {({ field }: { field: FieldProps['field'] }) => (
                    <>
                      <label className={styles.checkbox}>
                        <input
                          type="checkbox"
                          id="terms"
                          {...field}
                          className={styles.checkboxInput}
                        />

                        <span className={styles.customBox} />
                      </label>
                      
                      <span className={styles.labelText}>
                        Я ознайомився/лась з{' '}
                        <Link to="/terms" className={styles.termsLink}>
                          умовами використання
                        </Link>
                      </span>
                    </>
                  )}
                </Field>
              </div>

              {error && <p className={styles.globalError}>{error}</p>}

              <button
                type="submit"
                className={`${styles.submitBtn} animate__animated 
                  ${isExiting
                      ? 'animate__fadeOutDown fadeOut_200'
                      : 'animate__fadeInUp fadeIn_800'
                    }
                `}
                disabled={
                  isSubmitting ||
                  !!errors.name ||
                  !!errors.email ||
                  !!errors.password ||
                  !values.terms
                }
              >
                {!isSubmitting ? ('Зареєструватись') : (<Loader />)}
              </button>

              <div className={`${styles.socialLogin} animate__animated ${isExiting ? 'animate__fadeOutDown fadeOut_100' : 'animate__fadeInUp fadeIn_900'}`}>
                <p className={styles.socialTitle}>Або зареєструватись за допомогою:</p>

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

              <div className={`${styles.loginLink} animate__animated ${isExiting ? 'animate__fadeOutDown' : 'animate__fadeInUp fadeIn_1000'}`}>
                Маєте особистий кабінет? <Link to="/login">Увійти</Link>
              </div>
            </Form>
          )}
        </Formik>
      )}
    </div>
  );
};
