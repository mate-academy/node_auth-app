import { Formik, Form, Field } from 'formik';
import { useState } from 'react';
import { authService } from '../../services/authService';
import styles from './PasswordResetPage.module.scss';
import { validateEmail } from '../../utils/validators';
import { useNavigate } from 'react-router-dom';
import { Loader } from '../../components/Loader';
import { AxiosError } from 'axios';
import { usePageError } from '../../hooks/usePageError';

export const PasswordResetPage = () => {
  const [emailSent, setEmailSent] = useState(false);
  const [step, setStep] = useState(1);
  const [isExiting, setIsExiting] = useState(false);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
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
            className={`${styles.mainLine} ${emailSent ? styles.secondStep : ''}`}
          ></div>
        </div>
      </div>

      {emailSent ? (
        <div className={`${styles.titleBlock} animate__animated ${isExiting ? 'animate__fadeOut fadeOut_700' : 'animate__fadeIn fadeIn_300'}`}>
          <h2 className={styles.title}>Перевірте пошту</h2>

          <div className={styles.confirmation}>
            <p>Ми відправили посилання для скидання паролю на пошту:</p>
            <span className={styles.userEmail}>{email}</span>
          </div>
        </div>
      ) : (
        <>
          <div className={`${styles.titleBlock} animate__animated ${isExiting ? 'animate__fadeOut fadeOut_700' : 'animate__fadeIn fadeIn_300'}`}>
            <h2 className={styles.title}>Скидання паролю</h2>
          </div>
            
          <Formik
            initialValues={{ email: '' }}
            validateOnMount={true}
            onSubmit={({ email }, { setSubmitting }) => {
              setSubmitting(true);
              authService
                .requestPasswordReset(email)
                .then(() => {
                  setEmailSent(true)
                  setEmail(email);
                  setStep(2);
                })
                .catch((error: AxiosError<{ message?: string }>) => {
                  setError(error.response?.data?.message ?? '');
                })
                .finally(() => setSubmitting(false));
            }}
          >
            {({ touched, errors, isSubmitting }) => (
              <Form className={styles.form}>
                <div className={`${styles.formGroup} animate__animated ${isExiting ? 'animate__fadeOutDown fadeOut_600' : 'animate__fadeInUp fadeIn_400'}`}>
                  <label htmlFor="email" className={styles.label}>
                    Електронна пошта
                  </label>
                    
                  <Field
                    name="email"
                    type="email"
                    id="email"
                    validate={validateEmail}
                    placeholder="e.g. bobsmith@gmail.com"
                    className={`${styles.input} ${errors.email && touched.email ? styles.inputError : ''}`}
                  />
                  
                  {touched.email && errors.email && (
                    <div className={styles.textContainer}>
                      <p className={styles.error}>{errors.email}</p>
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
                  disabled={isSubmitting || !!errors.email}
                >
                  {!isSubmitting ? ('Скинути пароль') : (<Loader />)}
                </button>
              </Form>
            )}
          </Formik>
        </>
      )}
    </div>
  );
};
