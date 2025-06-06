import { Formik, Form, Field } from 'formik';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { authService } from '../../services/authService';
import { usePageError } from '../../hooks/usePageError';
import styles from './PasswordResetConfirmationPage.module.scss';
import { validatePassword } from '../../utils/validators';
import { AxiosError } from 'axios';

export const PasswordResetConfirmationPage = () => {
  const { token } = useParams<{ token: string }>();
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const [isExiting, setIsExiting] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = usePageError('');

  const handleNavigate = (path: string) => {
    setIsExiting(true);

    setTimeout(() => {
      navigate(path);
    }, 1700);
  };

  return (
    <div className={styles.container}>
      <div className={styles.nav}>
        <div className={styles.navBlock}>
          <button
            onClick={() => handleNavigate('/login')}
            className={`${styles.iconLink} animate__animated ${isExiting ? 'animate__fadeOutLeft fadeOut_1000' : 'animate__fadeInLeft fadeIn_100'}`}
          ></button>

          <h4 className={`${styles.step} animate__animated ${isExiting ? 'animate__fadeOutUp fadeOut_900' : 'animate__fadeInDown'}`}>Крок {step} з 2</h4>
        </div>

        <div className={`${styles.navLine} animate__animated ${isExiting ? 'animate__fadeOut fadeOut_800' : 'animate__fadeIn fadeIn_200'}`}>
          <div className={styles.bgLine}></div>

          <div
            className={`${styles.mainLine} ${success ? styles.secondStep : ''}`}
          ></div>
        </div>
      </div>

      {success ? (
        <div className={`${styles.titleBlock} animate__animated ${isExiting ? 'animate__fadeOut fadeOut_700' : 'animate__fadeIn fadeIn_300'}`}>
          <h2 className={styles.title}>Пароль успішно оновлено</h2>

          <div className={styles.confirmation}>
            <p>Тепер ви можете здійснити вхід з новим паролем.</p>

            <Link to="/login">Увійти</Link>
          </div>
        </div>
      ) : (
        <>
          <div className={`${styles.titleBlock} animate__animated ${isExiting ? 'animate__fadeOut fadeOut_700' : 'animate__fadeIn fadeIn_300'}`}>
            <h2 className={styles.title}>Скидання паролю</h2>
          </div>
            
          <Formik
            initialValues={{ password: '', confirmPassword: '' }}
            onSubmit={({ password }, { setSubmitting }) => {
              setSubmitting(true);
              authService
                .resetPassword(token!, password)
                .then(() => {
                  setSuccess(true)
                  setStep(2);
                })
                .catch((error: AxiosError<{ message?: string }>) => {
                  setError(error.response?.data?.message ?? '');
                })
                .finally(() => setSubmitting(false));
            }}
            validate={({ password, confirmPassword }) => {
              const errors: { password?: string; confirmPassword?: string } = {};
              if (password !== confirmPassword) {
                errors.confirmPassword = 'Passwords must match';
              }
              return errors;
            }}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form className={styles.form}>
                <div className={`${styles.formGroup} animate__animated ${isExiting ? 'animate__fadeOutDown fadeOut_600' : 'animate__fadeInUp fadeIn_400'}`}>
                  <label htmlFor="password" className={styles.label}>
                    Новий пароль
                  </label>
                  <Field
                    name="password"
                    type="password"
                    id="password"
                    validate={validatePassword}
                    placeholder="*******"
                    className={`${styles.input} ${errors.password && touched.password ? styles.inputError : ''}`}
                  />
                    
                  {touched.password && errors.password && (
                    <div className={styles.textContainer}>
                      <p className={styles.error}>{errors.password}</p>
                    </div>
                  )}
                </div>
                  
                <div className={`${styles.formGroup} animate__animated ${isExiting ? 'animate__fadeOutDown fadeOut_600' : 'animate__fadeInUp fadeIn_400'}`}>
                  <label htmlFor="confirmPassword" className={styles.label}>
                    Confirm Password
                  </label>
                    
                  <Field
                    name="confirmPassword"
                    type="password"
                    id="confirmPassword"
                    placeholder="*******"
                    className={`${styles.input} ${errors.confirmPassword && touched.confirmPassword ? styles.inputError : ''}`}
                  />

                  {touched.confirmPassword && errors.confirmPassword && (
                    <div className={styles.textContainer}>
                      <p className={styles.error}>{errors.confirmPassword}</p>
                    </div>
                  )}
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
                  disabled={isSubmitting || !!errors.password}
                >
                  Reset Password
                </button>
              </Form>
            )}
          </Formik>
        </>
      )}
    </div>
  );
};