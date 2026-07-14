/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';

import styles from './styles.module.scss';
import { ButtonThird } from '@/components/ButtonThird/ButtonThird';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { authService } from '@/http/authClient';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { usePageError } from '../hooks/useErrorPage';
import { useAuthContext } from '@/app/providers/Auth/AuthContext';
import { Loading } from '@/components/Loading/Loading';
import { validation } from '@/shared/validation';
import { useTranslation } from 'react-i18next';

type Mode = 'login' | 'register' | 'forget';

type Field = {
  id: string;
  label: string;
  name: string;
  type: string;
  placeholder: string;
  minLength?: number;
  validate?: (value: string) => string | undefined;
};

type AuthConfig = {
  title: string;
  action: string;
  buttonText: string;
  fields: Field[];
};

const authConfig: Record<Mode, AuthConfig> = {
  login: {
    title: 'Sign In',
    action: '/auth/login',
    buttonText: 'Log In',
    fields: [
      {
        id: 'email',
        label: 'Email',
        name: 'email',
        type: 'email',
        placeholder: 'example@gmail.com',
        validate: validation.validateEmail,
      },
      {
        id: 'password',
        label: 'Password',
        name: 'password',
        type: 'password',
        placeholder: '********',
        validate: validation.validatePassword,
      },
    ],
  },

  register: {
    title: 'Sign Up',
    action: '/auth/register',
    buttonText: 'Sign Up',
    fields: [
      {
        id: 'firstName',
        label: 'First name',
        name: 'firstName',
        type: 'text',
        placeholder: 'John',
        validate: validation.validateName,
      },
      {
        id: 'lastName',
        label: 'Last name',
        name: 'lastName',
        type: 'text',
        placeholder: 'Smith',
        validate: validation.validateName,
      },
      {
        id: 'registerEmail',
        label: 'Email',
        name: 'email',
        type: 'email',
        placeholder: 'example@gmail.com',
        validate: validation.validateEmail,
      },
      {
        id: 'registerPassword',
        label: 'Password',
        name: 'password',
        type: 'password',
        placeholder: '********',
        validate: validation.validatePassword,
      },
    ],
  },

  forget: {
    title: 'Reset Password',
    action: '/auth/forget-password',
    buttonText: 'Send reset link',
    fields: [
      {
        id: 'forgetPassword',
        label: 'Email',
        name: 'email',
        type: 'email',
        placeholder: 'example@gmail.com',
        validate: validation.validateEmail,
      },
    ],
  },
};

export const AuthPage: React.FC<{ mode: Mode }> = ({ mode }) => {
  const config = authConfig[mode];
  const { t } = useTranslation();
  const location = useLocation();
  const [pageError, setPageError] = usePageError('');
  const [successSumbit, setSuccessSumbit] = useState<Mode | undefined>(undefined);
  const { login } = useAuthContext();

  const initialValues = config.fields.reduce((prev, item) => ({ ...prev, [item.name]: '' }), {});

  if (successSumbit === mode) {
    switch (successSumbit) {
      case 'register':
        return (
          <main className={styles.container}>
            <div className={styles.box}>
              <h3>{t('authPage.successSubmitRegister')}</h3>
            </div>
          </main>
        );

      case 'forget':
        return (
          <main className={styles.container}>
            <div className={styles.box}>
              <h3>{t('authPage.successSubmitForget')}</h3>
            </div>
          </main>
        );

      case 'login':
        return <Navigate to={location.state?.from?.pathname || '/'}></Navigate>;

      default:
        break;
    }
  }

  return (
    <main className={styles.container}>
      <div className={styles.box}>
        <h1>{t(`authPage.${mode}.title` as any)}</h1>
        <Formik
          validateOnBlur={false}
          validateOnChange={false}
          validateOnMount={true}
          initialValues={initialValues}
          onSubmit={(values, formHelper) => {
            formHelper.setSubmitting(true);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const handle = (call: () => Promise<any>) => {
              call()
                .then(() => setSuccessSumbit(mode))
                .catch((errorFromBackend) => {
                  if (errorFromBackend.message) {
                    setPageError(errorFromBackend.message);
                  }

                  if (!errorFromBackend.response?.data) {
                    return;
                  }

                  const { errors, message } = errorFromBackend.response.data;

                  if (errors) {
                    for (const errorEntity of Object.entries(errors)) {
                      formHelper.setFieldError(errorEntity[0], errorEntity[1] as string);
                    }
                  }

                  if (message) {
                    setPageError(message);
                  }
                })
                .finally(() => {
                  formHelper.setSubmitting(false);
                });
            };
            switch (mode) {
              case 'register':
                handle(() =>
                  authService.register(values as Parameters<typeof authService.register>[0]),
                );
                break;

              case 'login':
                handle(() => login(values as Parameters<typeof login>[0]));
                break;

              case 'forget':
                handle(() =>
                  authService.forgetPassword(
                    values as Parameters<typeof authService.forgetPassword>[0],
                  ),
                );
                break;

              default:
                break;
            }
          }}
        >
          {({ setFieldError, handleChange, isSubmitting }) => {
            return (
              <Form noValidate className={styles.form}>
                {config.fields.map((field) => (
                  <div className={styles.field} key={field.id}>
                    <label className={styles.label} htmlFor={field.id}>
                      {t(`authPage.${mode}.fields.${field.name}` as any)}
                    </label>
                    <Field
                      validate
                      {...field}
                      onChange={(e: React.ChangeEvent<any>) => {
                        handleChange(e);
                        setFieldError(field.name, undefined);
                      }}
                      className={styles.input}
                    />

                    <ErrorMessage name={field.name} component="div" className={styles.fieldError} />
                  </div>
                ))}

                <ButtonThird disabled={isSubmitting} type="submit" className={styles.button}>
                  {isSubmitting ? (
                    <Loading width={32} height={32}></Loading>
                  ) : (
                    t(`authPage.${mode}.buttonText` as any)
                  )}
                </ButtonThird>
              </Form>
            );
          }}
        </Formik>
        {pageError && <p className={styles.fieldError}>{pageError}</p>}

        <div className={styles.links}>
          {mode === 'login' && (
            <>
              <Link to="/register" className={styles.linkRegister}>
                {t('authPage.links.register')}
              </Link>

              <Link to="/forget" className={styles.linkRegister}>
                {t('authPage.links.forget')}
              </Link>
            </>
          )}

          {mode === 'register' && (
            <>
              <Link to="/login" className={styles.linkRegister}>
                {t('authPage.links.login')}
              </Link>
              <Link to="/forget" className={styles.linkRegister}>
                {t('authPage.links.forget')}
              </Link>
            </>
          )}

          {mode === 'forget' && (
            <>
              <Link to="/login" className={styles.linkRegister}>
                {t('authPage.links.login')}
              </Link>

              <Link to="/register" className={styles.linkRegister}>
                {t('authPage.links.register')}
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
};
